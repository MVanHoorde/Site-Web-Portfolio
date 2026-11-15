-- ============================================================
--  Banc d'essai du 047 (quiz) — sur un Postgres LOCAL, jamais la prod.
--  Lancer : python _outils/tests/quiz-base.py
--  (le script crée une base jetable, pose les doublures de Supabase
--  ci-dessous, rejoue bdd/schema/047-quiz.sql puis ce fichier).
--  Tout échec lève une exception : psql s'arrête (ON_ERROR_STOP).
-- ============================================================
\set ON_ERROR_STOP on
\set QUIET on

-- Deux enseignants, un compte non enseignant
insert into auth.users values ('00000000-0000-0000-0000-0000000000a1'),
                              ('00000000-0000-0000-0000-0000000000a2'),
                              ('00000000-0000-0000-0000-0000000000e1');
insert into public.enseignants values ('00000000-0000-0000-0000-0000000000a1'),
                                      ('00000000-0000-0000-0000-0000000000a2');

create schema essai;
create function essai.attendre_erreur(sql text, motif text) returns void language plpgsql as $$
begin
  execute sql;
  raise exception 'ÉCHEC : aucune erreur pour « % »', sql;
exception when others then
  if sqlerrm like 'ÉCHEC%' then raise; end if;
  if sqlerrm !~ motif then raise exception 'ÉCHEC : « % » a levé « % », attendu ~ %', sql, sqlerrm, motif; end if;
end $$;
grant usage on schema essai to anon, authenticated;
grant execute on all functions in schema essai to anon, authenticated;

-- ---------- 1. Import par l'enseignant 1 ----------
set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select public.quiz_importer($j${
  "slug": "essai-bts", "titre": "Essai", "niveau": "BTS MS 1",
  "questions": [
    {"type":"qcm","enonce":"Unité de la puissance ?","options":["W","J","N","Pa"],"correct":[0],
     "pourquoi":[null,"Le joule mesure une énergie.","Le newton mesure une force.","Le pascal mesure une pression."],
     "cours":"$P = \\dfrac{E}{\\Delta t}$","notion":"Énergie","temps":20},
    {"type":"vf","enonce":"Un moteur électrique convertit de l'énergie électrique en énergie mécanique.","correct":[0],"notion":"Énergie"},
    {"type":"num","enonce":"$v$ après 2,0 s de chute libre ?","notion":"Mécanique","temps":30,
     "num":{"valeur":19.6,"tolerance":0.03,"unite":"m/s","unites":["m/s","km/h","m/s²"],
            "autres":[{"valeur":70.6,"unite":"km/h"}],
            "pieges":[{"valeur":9.81,"message":"C'est g, pas v."},{"valeur":39.2,"message":"g·t² n'est pas une vitesse."}]}},
    {"type":"ordre","enonce":"Range du plus petit au plus grand","items":["mm","cm","m","km"],"notion":"Unités"},
    {"type":"zone","enonce":"Touche la résistance","zone":{"src":"img/montage.jpg","alt":"montage","cibles":[{"x":10,"y":10,"l":20,"h":20}]},"notion":"Circuits"}
  ]}$j$::jsonb) is not null as importe \gset

do $$ begin
  perform essai.attendre_erreur($s$select public.quiz_importer('{"slug":"faux","titre":"x","questions":[{"type":"qcm","enonce":"?","options":["a","b"],"correct":[5]}]}')$s$, 'QUIZ_QUESTION_INVALIDE');
  perform essai.attendre_erreur($s$select public.quiz_importer('{"slug":"faux","titre":"x","questions":[{"type":"num","enonce":"?"}]}')$s$, 'QUIZ_QUESTION_INVALIDE');
  perform essai.attendre_erreur($s$select public.quiz_importer('{"slug":"faux","titre":"x","questions":[{"type":"truc","enonce":"?"}]}')$s$, 'type inconnu');
end $$;

select id as quiz from public.quiz_quiz where slug = 'essai-bts' \gset

-- l'enseignant 2 voit le quiz partagé mais ne peut ni l'écraser ni le modifier
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}';
do $$ begin
  if (select count(*) from public.quiz_quiz) <> 1 then raise exception 'ÉCHEC : quiz partagé invisible'; end if;
  perform essai.attendre_erreur($s$select public.quiz_importer('{"slug":"essai-bts","titre":"pirate","questions":[]}')$s$, 'QUIZ_SLUG_PRIS');
  update public.quiz_quiz set titre = 'pirate';
  if exists (select 1 from public.quiz_quiz where titre = 'pirate') then raise exception 'ÉCHEC : modifié par un autre'; end if;
end $$;

-- un compte qui n'est pas enseignant ne voit rien et ne lance rien
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e1","role":"authenticated"}';
do $$ begin
  if (select count(*) from public.quiz_quiz) <> 0 then raise exception 'ÉCHEC : un élève connecté lit les quiz'; end if;
  perform essai.attendre_erreur(format('select public.quiz_lancer(%L)', (select '00000000-0000-0000-0000-000000000000')), 'QUIZ_PAS_ENSEIGNANT');
end $$;

-- ---------- 2. Lancer une partie ----------
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
select r->>'id' as partie, r->>'pin' as pin from (select public.quiz_lancer(:'quiz', 'BTS MS 1', '{"pari":true}') r) t \gset

-- ---------- 3. Les élèves, sans compte ----------
reset role; set role anon;
set request.jwt.claims = '{"role":"anon"}';
do $$ begin
  perform essai.attendre_erreur('select * from public.quiz_quiz', 'permission denied');
  perform essai.attendre_erreur('select * from public.quiz_parties', 'permission denied');
  perform essai.attendre_erreur('select * from public.quiz_reponses', 'permission denied');
  perform essai.attendre_erreur($s$select public.quiz_juger('{}','{}')$s$, 'permission denied');
  perform essai.attendre_erreur($s$select public.quiz_rejoindre('000000', 'Inès B.')$s$, 'QUIZ_PIN_INCONNU');
  perform essai.attendre_erreur($s$select public.quiz_suivi('00000000-0000-0000-0000-000000000000')$s$, 'permission denied');
end $$;

select public.quiz_rejoindre(:'pin', '  Inès   B. ')->>'jeton' as j1 \gset
select public.quiz_rejoindre(regexp_replace(:'pin', '(...)(...)', '\1 \2'), 'Hugo L.')->>'jeton' as j2 \gset
select public.quiz_rejoindre(:'pin', 'Jade M.')->>'jeton' as j3 \gset
select essai.attendre_erreur(format('select public.quiz_rejoindre(%L, %L)', :'pin', 'inès b.'), 'QUIZ_PSEUDO_PRIS') \gset
select essai.attendre_erreur(format('select public.quiz_rejoindre(%L, %L)', :'pin', '<b>x</b>'), 'QUIZ_PSEUDO_INVALIDE') \gset
select essai.attendre_erreur(format('select public.quiz_rejoindre(%L, %L)', :'pin', 'a'), 'QUIZ_PSEUDO_LONGUEUR') \gset

select public.quiz_etat(:'j1')->>'phase' = 'accueil' as ok \gset
\if :ok \else \echo 'ÉCHEC : phase accueil' \quit \endif
select public.quiz_etat(:'j1')->>'pseudo' = 'Inès B.' as ok \gset
\if :ok \else \echo 'ÉCHEC : pseudo non nettoyé' \quit \endif

-- ---------- 4. Question 1 (QCM) ----------
reset role; set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
select public.quiz_piloter(:'partie', 'question', 0) is not null as ok \gset
-- l'enseignant 2 ne pilote pas la partie du 1
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}';
select essai.attendre_erreur(format('select public.quiz_piloter(%L, %L)', :'partie', 'fin'), 'QUIZ_PARTIE_INCONNUE') \gset
select count(*) = 0 as ok from public.quiz_parties \gset
\if :ok \else \echo 'ÉCHEC : partie visible d un autre enseignant' \quit \endif

reset role; set role anon; set request.jwt.claims = '{"role":"anon"}';
-- 🔴 pendant la question, rien de la correction ne sort
select (e->'question') ? 'correct' or (e->'question') ? 'pourquoi' or (e->'question') ? 'cours'
       or e::text like '%Le joule%' or e ? 'correction' as fuite
  from (select public.quiz_etat(:'j1') e) t \gset
\if :fuite \echo 'ÉCHEC : la correction fuit pendant la question' \quit \endif
select (public.quiz_etat(:'j1')->>'reste_ms')::int between 15000 and 20000 as ok \gset
\if :ok \else \echo 'ÉCHEC : chrono' \quit \endif

-- juste, parié
select public.quiz_repondre(:'j1', 0, '{"choix":[0]}', true) is not null as ok \gset
-- faux, parié
select public.quiz_repondre(:'j2', 0, '{"choix":[1]}', true) is not null as ok \gset
-- faux
select public.quiz_repondre(:'j3', 0, '{"choix":[2]}') is not null as ok \gset
select essai.attendre_erreur(format('select public.quiz_repondre(%L, 0, %L)', :'j1', '{"choix":[1]}'), 'QUIZ_DEJA_REPONDU') \gset
select essai.attendre_erreur(format('select public.quiz_repondre(%L, 1, %L)', :'j1', '{"choix":[1]}'), 'QUIZ_TROP_TARD') \gset
-- le score ne bouge pas avant la correction
select (public.quiz_etat(:'j1')->>'score')::int = 0 as ok \gset
\if :ok \else \echo 'ÉCHEC : le score trahit la réponse avant la correction' \quit \endif

reset role; set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
select jsonb_array_length(s->'reponses') = 3 and jsonb_array_length(s->'joueurs') = 3 as ok
  from (select public.quiz_suivi(:'partie') s) t \gset
\if :ok \else \echo 'ÉCHEC : suivi' \quit \endif
select essai.attendre_erreur('select jeton from public.quiz_joueurs', 'permission denied') \gset
select public.quiz_piloter(:'partie', 'corriger') is not null as ok \gset

reset role; set role anon; set request.jwt.claims = '{"role":"anon"}';
select (c->>'juste')::boolean and (c->>'points')::int > 1000 and c->'correct' = '[0]'::jsonb as ok
  from (select public.quiz_etat(:'j1')->'correction' c) t \gset
\if :ok \else \echo 'ÉCHEC : correction de j1' \quit \endif
select c->>'pourquoi' = 'Le joule mesure une énergie.' and (c->>'points')::int = -200 as ok
  from (select public.quiz_etat(:'j2')->'correction' c) t \gset
\if :ok \else \echo 'ÉCHEC : pourquoi / pari perdu de j2' \quit \endif
select (e->>'score')::int = 0 and (e->>'rang')::int = 2 as ok from (select public.quiz_etat(:'j2') e) t \gset
\if :ok \else \echo 'ÉCHEC : score plancher 0' \quit \endif
select (public.quiz_etat(:'j1')->>'rang')::int = 1 as ok \gset
\if :ok \else \echo 'ÉCHEC : rang' \quit \endif

-- ---------- 5. Vrai/faux, numérique, ordre, zone ----------
\set prof 'reset role; set role authenticated; set request.jwt.claims = ''{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}'';'
\set eleve 'reset role; set role anon; set request.jwt.claims = ''{"role":"anon"}'';'

:prof select public.quiz_piloter(:'partie', 'question') is not null as ok \gset
:eleve
select public.quiz_etat(:'j1')->'question'->'options' = '["Vrai","Faux"]'::jsonb as ok \gset
\if :ok \else \echo 'ÉCHEC : options vrai/faux par défaut' \quit \endif
select public.quiz_repondre(:'j1', 1, '{"choix":[0]}') is not null as ok \gset

:prof select public.quiz_piloter(:'partie', 'question') is not null as ok \gset
:eleve
select (public.quiz_etat(:'j1')->'question'->'unites') = '["m/s","km/h","m/s²"]'::jsonb
   and not (public.quiz_etat(:'j1')::text like '%19.6%') as ok \gset
\if :ok \else \echo 'ÉCHEC : question numérique publique' \quit \endif
-- juste, autre unité
select public.quiz_repondre(:'j1', 2, '{"valeur":70.2,"unite":"km/h"}') is not null as ok \gset
-- bonne valeur, unité fausse
select public.quiz_repondre(:'j2', 2, '{"valeur":19.6,"unite":"km/h"}') is not null as ok \gset
-- piège 0
select public.quiz_repondre(:'j3', 2, '{"valeur":9.8,"unite":"m/s"}') is not null as ok \gset
:prof
select string_agg(categorie || '=' || juste, ',' order by categorie) = 'juste=true,piege:0=false,unite=false' as ok
  from public.quiz_reponses where idx = 2 \gset
\if :ok \else \echo 'ÉCHEC : jugement numérique' \quit \endif
select public.quiz_piloter(:'partie', 'corriger') is not null as ok \gset
:eleve
select public.quiz_etat(:'j3')->'correction'->>'pourquoi' = 'C''est g, pas v.' as ok \gset
\if :ok \else \echo 'ÉCHEC : message du piège' \quit \endif

:prof select public.quiz_piloter(:'partie', 'question') is not null as ok \gset
:eleve
-- l'ordre est mélangé, jamais dans l'ordre juste ; les identifiants sont
-- les positions affichées (0, 1, 2, 3), qui ne livrent pas la réponse
select jsonb_path_query_array(public.quiz_etat(:'j1')->'question'->'items', '$[*].texte') <> '["mm","cm","m","km"]'::jsonb
   and jsonb_path_query_array(public.quiz_etat(:'j1')->'question'->'items', '$[*].id') = '[0,1,2,3]'::jsonb as ok \gset
\if :ok \else \echo 'ÉCHEC : ordre non mélangé, ou identifiants révélateurs' \quit \endif
-- la bonne suite de positions, lue côté enseignant dans le mélange tiré
:prof
select jsonb_agg(m.o - 1 order by m.v::integer)::text as bon_ordre
  from public.quiz_parties p, jsonb_array_elements_text(p.questions->3->'melange') with ordinality m(v, o)
 where p.id = :'partie' \gset
select jsonb_build_array(b->1, b->0, b->2, b->3)::text as faux_ordre from (select :'bon_ordre'::jsonb b) t \gset
:eleve
select public.quiz_repondre(:'j1', 3, jsonb_build_object('ordre', :'bon_ordre'::jsonb)) is not null as ok \gset
select public.quiz_repondre(:'j2', 3, jsonb_build_object('ordre', :'faux_ordre'::jsonb)) is not null as ok \gset

:prof select public.quiz_piloter(:'partie', 'question') is not null as ok \gset
:eleve
select not (public.quiz_etat(:'j1')::text like '%cibles%') as ok \gset
\if :ok \else \echo 'ÉCHEC : les cibles de la zone fuient' \quit \endif
select public.quiz_repondre(:'j1', 4, '{"x":15,"y":25}') is not null as ok \gset
select public.quiz_repondre(:'j2', 4, '{"x":50,"y":50}') is not null as ok \gset
:prof
select string_agg(idx || ':' || juste, ',' order by idx, juste) = '3:false,3:true,4:false,4:true' as ok
  from public.quiz_reponses where idx in (3, 4) \gset
\if :ok \else \echo 'ÉCHEC : ordre / zone' \quit \endif

-- ---------- 6. Trop tard ----------
reset role;
update public.quiz_parties set fin = now() - interval '2 seconds' where id = :'partie';
:eleve
select essai.attendre_erreur(format('select public.quiz_repondre(%L, 4, %L)', :'j3', '{"x":15,"y":25}'), 'QUIZ_TROP_TARD') \gset

-- ---------- 7. Fin, bilan, plus d'entrée ----------
:prof select public.quiz_piloter(:'partie', 'fin') is not null as ok \gset
:eleve
select (b->>'justes')::int = 5 and jsonb_array_length(b->'notions') = 0 as ok
  from (select public.quiz_etat(:'j1')->'bilan' b) t \gset
\if :ok \else \echo 'ÉCHEC : bilan de j1' \quit \endif
select (b->'notions'->0->>'ratees')::int >= 1 as ok from (select public.quiz_etat(:'j3')->'bilan' b) t \gset
\if :ok \else \echo 'ÉCHEC : notions à revoir de j3' \quit \endif
select essai.attendre_erreur(format('select public.quiz_rejoindre(%L, %L)', :'pin', 'Retard Z.'), 'QUIZ_PIN_INCONNU') \gset

-- ---------- 8. Exclure, anonymiser ----------
:prof
select public.quiz_exclure(:'partie', (select id from public.quiz_joueurs where pseudo = 'Jade M.')) \gset
:eleve
select public.quiz_etat(:'j3')->>'phase' = 'exclu' as ok \gset
\if :ok \else \echo 'ÉCHEC : exclusion' \quit \endif
reset role;
update public.quiz_parties set ouverte_le = now() - interval '31 days' where id = :'partie';
:prof
select public.quiz_anonymiser() = 2 as ok \gset
\if :ok \else \echo 'ÉCHEC : anonymisation' \quit \endif
select string_agg(pseudo, ',' order by pseudo) = '#1,#2' as ok from public.quiz_joueurs \gset
\if :ok \else \echo 'ÉCHEC : pseudonymes après 30 jours' \quit \endif

-- ---------- 10. La salle permanente (QR code fixe) ----------
:prof
select salle from public.quiz_quiz where id = :'quiz' \gset
select :'salle' ~ '^[A-HJ-KM-NP-Z2-9]{6}$' as ok \gset
\if :ok \else \echo 'ÉCHEC : format du code de salle' \quit \endif
:eleve
select public.quiz_salle(:'salle')->>'etat' = 'attente' as ok \gset
\if :ok \else \echo 'ÉCHEC : salle en attente sans partie ouverte' \quit \endif
select public.quiz_salle(lower(' ' || :'salle'))->>'etat' = 'attente' as ok \gset
\if :ok \else \echo 'ÉCHEC : code de salle en minuscules' \quit \endif
select essai.attendre_erreur($s$select public.quiz_salle('ZZZZZZ')$s$, 'QUIZ_SALLE_INCONNUE') \gset
-- l'auteur lance : la salle mène au PIN
:prof
select r->>'pin' as pin2, r->>'id' as partie2 from (select public.quiz_lancer(:'quiz') r) t \gset
:eleve
select public.quiz_salle(:'salle')->>'pin' = :'pin2' as ok \gset
\if :ok \else \echo 'ÉCHEC : la salle ne donne pas le PIN' \quit \endif
select public.quiz_rejoindre(public.quiz_salle(:'salle')->>'pin', 'Attente A.')->>'jeton' is not null as ok \gset
-- relancer remplace la salle d'attente abandonnée
:prof
select r->>'pin' as pin3, r->>'id' as partie3 from (select public.quiz_lancer(:'quiz') r) t \gset
:eleve
select public.quiz_salle(:'salle')->>'pin' = :'pin3' as ok \gset
\if :ok \else \echo 'ÉCHEC : la salle ne suit pas le dernier lancement' \quit \endif
reset role;
select close_le is not null as ok from public.quiz_parties where id = :'partie2' \gset
\if :ok \else \echo 'ÉCHEC : salle abandonnée restée ouverte' \quit \endif
-- un collègue lance le quiz partagé : la salle reste à l'auteur
reset role; set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}';
select public.quiz_lancer(:'quiz') is not null as ok \gset
:eleve
select public.quiz_salle(:'salle')->>'pin' = :'pin3' as ok \gset
\if :ok \else \echo 'ÉCHEC : le lancement d un collègue a pris la salle' \quit \endif
-- la partie finie, la salle repasse en attente
:prof select public.quiz_piloter(:'partie3', 'fin') is not null as ok \gset
:eleve
select public.quiz_salle(:'salle')->>'etat' = 'attente' as ok \gset
\if :ok \else \echo 'ÉCHEC : salle encore ouverte après la fin' \quit \endif

-- ---------- 11. L'entraînement seul ----------
:eleve
select essai.attendre_erreur($s$select public.quiz_entrainer('ZZZZZZ', 'Solo S.')$s$, 'QUIZ_SALLE_INCONNUE') \gset
select essai.attendre_erreur(format('select public.quiz_entrainer(%L, %L)', :'salle', 'x'), 'QUIZ_PSEUDO_LONGUEUR') \gset
select public.quiz_entrainer(:'salle', 'Solo S.')->>'jeton' as js \gset
select e->>'phase' = 'accueil' and e->>'mode' = 'solo' as ok from (select public.quiz_etat(:'js') e) t \gset
\if :ok \else \echo 'ÉCHEC : partie solo à l accueil' \quit \endif
-- personne n'entre dans une partie solo par son PIN
reset role;
select pin as pin_solo from public.quiz_parties where mode = 'solo' \gset
:eleve
select essai.attendre_erreur(format('select public.quiz_rejoindre(%L, %L)', :'pin_solo', 'Intrus I.'), 'QUIZ_PIN_INCONNU') \gset
select essai.attendre_erreur(format('select public.quiz_solo(%L, %L)', :'js', 'corriger'), 'QUIZ_PAS_DE_QUESTION') \gset
-- question 1 : juste, la correction suit la réponse
select public.quiz_solo(:'js', 'suivante')->>'phase' = 'question' as ok \gset
\if :ok \else \echo 'ÉCHEC : solo, première question' \quit \endif
select (public.quiz_etat(:'js')->'question'->>'correct') is null as ok \gset
\if :ok \else \echo 'ÉCHEC : solo, la bonne réponse fuit avant la correction' \quit \endif
select essai.attendre_erreur(format('select public.quiz_solo(%L, %L)', :'js', 'suivante'), 'QUIZ_PAS_MAINTENANT') \gset
select public.quiz_repondre(:'js', 0, '{"choix":[0]}') is not null as ok \gset
select e->>'phase' = 'correction' and (e->'correction'->>'juste')::boolean
       and e->'correction'->'correct' = '[0]'::jsonb as ok
  from (select public.quiz_etat(:'js') e) t \gset
\if :ok \else \echo 'ÉCHEC : solo, correction après réponse' \quit \endif
-- question 2 : l'élève passe, puis ne peut plus répondre
select public.quiz_solo(:'js', 'suivante')->>'idx' = '1' as ok \gset
select public.quiz_solo(:'js', 'corriger')->>'phase' = 'correction' as ok \gset
select essai.attendre_erreur(format('select public.quiz_repondre(%L, 1, %L)', :'js', '{"choix":[0]}'), 'QUIZ_TROP_TARD') \gset
-- jusqu'au bout
select public.quiz_solo(:'js', 'suivante') is not null as ok \gset
select public.quiz_solo(:'js', 'corriger') is not null as ok \gset
select public.quiz_solo(:'js', 'suivante') is not null as ok \gset
select public.quiz_solo(:'js', 'corriger') is not null as ok \gset
select public.quiz_solo(:'js', 'suivante') is not null as ok \gset
select public.quiz_solo(:'js', 'corriger') is not null as ok \gset
select public.quiz_solo(:'js', 'suivante')->>'phase' = 'fin' as ok \gset
\if :ok \else \echo 'ÉCHEC : solo, fin de partie' \quit \endif
select (public.quiz_etat(:'js')->'bilan'->>'justes')::int = 1 as ok \gset
\if :ok \else \echo 'ÉCHEC : solo, bilan' \quit \endif
-- une partie de classe ne se pilote pas depuis un téléphone
:prof
select r->>'pin' as pin4 from (select public.quiz_lancer(:'quiz') r) t \gset
:eleve
select public.quiz_rejoindre(:'pin4', 'Classe C.')->>'jeton' as jc \gset
select essai.attendre_erreur(format('select public.quiz_solo(%L, %L)', :'jc', 'suivante'), 'QUIZ_PAS_SOLO') \gset
-- l'auteur voit l'entraînement dans ses parties, rangé à part
:prof
select count(*) = 1 as ok from public.quiz_parties where mode = 'solo' and groupe = 'Entraînement' \gset
\if :ok \else \echo 'ÉCHEC : l auteur ne voit pas l entraînement' \quit \endif

-- ---------- 12. Association, mot, curseur ; salle fixée dans le fichier ----------
:prof
select public.quiz_importer($j${
  "slug": "essai-types", "titre": "Nouveaux types", "salle": "mscb2a",
  "questions": [
    {"type":"assoc","enonce":"Associer","notion":"Combustion",
     "paires":[["Combustible","Méthane"],["Comburant","Dioxygène"],["Produit","Eau"],["Toxique","CO"]]},
    {"type":"mot","enonce":"Le gaz de l'air qui entretient la combustion ?","notion":"Combustion",
     "mot":{"acceptes":["dioxygène","O2"],"pieges":[{"mot":"oxygène","message":"L'oxygène est un élément ; le gaz est le DIoxygène, O₂."}],"indice":"un gaz"}},
    {"type":"curseur","enonce":"Pourcentage de dioxygène dans l'air ?","notion":"Air",
     "curseur":{"min":0,"max":100,"pas":1,"valeur":21,"tolerance":1,"marge":6,"unite":"%"}}
  ]}$j$::jsonb) is not null as ok \gset
select salle = 'MSCB2A' as ok from public.quiz_quiz where slug = 'essai-types' \gset
\if :ok \else \echo 'ÉCHEC : salle fixée dans le fichier' \quit \endif
do $$ begin
  perform essai.attendre_erreur($s$select public.quiz_importer('{"slug":"autre","titre":"x","salle":"MSCB2A","questions":[]}')$s$, 'QUIZ_SALLE_PRISE');
  perform essai.attendre_erreur($s$select public.quiz_importer('{"slug":"autre","titre":"x","salle":"ABCDE1","questions":[]}')$s$, 'QUIZ_SALLE_INVALIDE');
  perform essai.attendre_erreur($s$select public.quiz_importer('{"slug":"autre","titre":"x","questions":[{"type":"assoc","enonce":"?","paires":[["a","b"],["c","d"]]}]}')$s$, '3 à 6 paires');
  perform essai.attendre_erreur($s$select public.quiz_importer('{"slug":"autre","titre":"x","questions":[{"type":"mot","enonce":"?","mot":{"acceptes":[]}}]}')$s$, 'mot.acceptes');
  perform essai.attendre_erreur($s$select public.quiz_importer('{"slug":"autre","titre":"x","questions":[{"type":"curseur","enonce":"?","curseur":{"min":0,"max":10,"valeur":12}}]}')$s$, 'hors de l''échelle');
end $$;
-- réimporter sans « salle » garde le code
select public.quiz_importer('{"slug":"essai-types","titre":"Nouveaux types","questions":[{"type":"vf","enonce":"?","correct":[0]}]}') is not null as ok \gset
select salle = 'MSCB2A' as ok from public.quiz_quiz where slug = 'essai-types' \gset
\if :ok \else \echo 'ÉCHEC : la salle change au réimport' \quit \endif
select public.quiz_importer($j${
  "slug": "essai-types", "titre": "Nouveaux types",
  "questions": [
    {"type":"assoc","enonce":"Associer","notion":"Combustion",
     "paires":[["Combustible","Méthane"],["Comburant","Dioxygène"],["Produit","Eau"],["Toxique","CO"]]},
    {"type":"mot","enonce":"Le gaz de l'air qui entretient la combustion ?","notion":"Combustion",
     "mot":{"acceptes":["dioxygène","O2"],"pieges":[{"mot":"oxygène","message":"Le gaz est le DIoxygène."}],"indice":"un gaz"}},
    {"type":"curseur","enonce":"Pourcentage de dioxygène dans l'air ?","notion":"Air",
     "curseur":{"min":0,"max":100,"pas":1,"valeur":21,"tolerance":1,"marge":6,"unite":"%"}}
  ]}$j$::jsonb) is not null as ok \gset
select id as quiz_t from public.quiz_quiz where slug = 'essai-types' \gset
select r->>'pin' as pin_t, r->>'id' as partie_t from (select public.quiz_lancer(:'quiz_t') r) t \gset
:eleve
select public.quiz_rejoindre(:'pin_t', 'Tout A.')->>'jeton' as ja \gset
select public.quiz_rejoindre(:'pin_t', 'Moitie B.')->>'jeton' as jb \gset
select public.quiz_rejoindre(:'pin_t', 'Rien C.')->>'jeton' as jcc \gset

-- association : rien de la réponse dans la question publique
:prof select public.quiz_piloter(:'partie_t', 'question') is not null as ok \gset
:eleve
select (e->'question'->'gauche') = '["Combustible","Comburant","Produit","Toxique"]'::jsonb
   and jsonb_array_length(e->'question'->'droite') = 4
   and (e->'question'->'droite') <> '["Méthane","Dioxygène","Eau","CO"]'::jsonb
   and not (e::text like '%paires%') and not (e::text like '%melange%') as ok
  from (select public.quiz_etat(:'ja') e) t \gset
\if :ok \else \echo 'ÉCHEC : association publique' \quit \endif
-- les bonnes positions, lues côté enseignant
:prof
select jsonb_agg(jsonb_build_array(m.v::integer, m.o - 1) order by m.v::integer)::text as assoc_bon
  from public.quiz_parties p, jsonb_array_elements_text(p.questions->0->'melange') with ordinality m(v, o)
 where p.id = :'partie_t' \gset
:eleve
select public.quiz_repondre(:'ja', 0, jsonb_build_object('paires', :'assoc_bon'::jsonb)) is not null as ok \gset
-- deux paires justes sur quatre : les deux premières, puis 2 et 3 échangées
select public.quiz_repondre(:'jb', 0, jsonb_build_object('paires', jsonb_build_array(
         b->0, b->1, jsonb_build_array(2, b->3->1), jsonb_build_array(3, b->2->1)))) is not null as ok
  from (select :'assoc_bon'::jsonb b) t \gset
-- tricher en reliant plusieurs fois le même élément ne rapporte rien
select public.quiz_repondre(:'jcc', 0, jsonb_build_object('paires', jsonb_build_array(
         jsonb_build_array(0, b->0->1), jsonb_build_array(0, b->0->1), jsonb_build_array(0, b->0->1)))) is not null as ok
  from (select :'assoc_bon'::jsonb b) t \gset
:prof
select string_agg(j.pseudo || '=' || x.categorie || '/' || (x.points > 0), ',' order by j.pseudo) as vu
  from public.quiz_reponses x join public.quiz_joueurs j on j.id = x.joueur_id
 where x.partie_id = :'partie_t' and x.idx = 0 \gset
select :'vu' = 'Moitie B.=partiel:2/true,Rien C.=faux/false,Tout A.=juste/true' as ok \gset
\if :ok \else \echo 'ÉCHEC : jugement de l association :' :'vu' \quit \endif
select (select points from public.quiz_reponses x join public.quiz_joueurs j on j.id = x.joueur_id where x.partie_id = :'partie_t' and x.idx = 0 and j.pseudo = 'Moitie B.')
     < (select points from public.quiz_reponses x join public.quiz_joueurs j on j.id = x.joueur_id where x.partie_id = :'partie_t' and x.idx = 0 and j.pseudo = 'Tout A.') as ok \gset
\if :ok \else \echo 'ÉCHEC : points partiels' \quit \endif
select public.quiz_piloter(:'partie_t', 'corriger') is not null as ok \gset
:eleve
select jsonb_array_length(public.quiz_etat(:'jb')->'correction'->'paires') = 4 as ok \gset
\if :ok \else \echo 'ÉCHEC : correction de l association' \quit \endif

-- mot : majuscules, accents, indices ; le piège a son message
:prof select public.quiz_piloter(:'partie_t', 'question') is not null as ok \gset
:eleve
select not (public.quiz_etat(:'ja')::text like '%acceptes%') and public.quiz_etat(:'ja')->'question'->>'indice' = 'un gaz' as ok \gset
\if :ok \else \echo 'ÉCHEC : mot public' \quit \endif
select public.quiz_repondre(:'ja', 1, '{"texte":"  DIOXYGENE. "}') is not null as ok \gset
select public.quiz_repondre(:'jb', 1, '{"texte":"O₂"}') is not null as ok \gset
select public.quiz_repondre(:'jcc', 1, '{"texte":"Oxygène"}') is not null as ok \gset
:prof
select string_agg(x.categorie, ',' order by j.pseudo) = 'juste,piege:0,juste' as ok
  from public.quiz_reponses x join public.quiz_joueurs j on j.id = x.joueur_id
 where x.partie_id = :'partie_t' and x.idx = 1 \gset
\if :ok \else \echo 'ÉCHEC : jugement du mot' \quit \endif
select public.quiz_piloter(:'partie_t', 'corriger') is not null as ok \gset
:eleve
select public.quiz_etat(:'jcc')->'correction'->>'pourquoi' like 'Le gaz est le DIoxygène%'
   and public.quiz_etat(:'jcc')->'correction'->'acceptes'->>0 = 'dioxygène' as ok \gset
\if :ok \else \echo 'ÉCHEC : correction du mot' \quit \endif

-- curseur : juste dans la tolérance, des points dans la marge, rien au-delà
:prof select public.quiz_piloter(:'partie_t', 'question') is not null as ok \gset
:eleve
select (e->'question'->'curseur') = '{"min":0,"max":100,"pas":1,"unite":"%"}'::jsonb
   and not (e::text like '%21%') as ok from (select public.quiz_etat(:'ja') e) t \gset
\if :ok \else \echo 'ÉCHEC : curseur public' \quit \endif
select public.quiz_repondre(:'ja', 2, '{"valeur":22}') is not null as ok \gset
select public.quiz_repondre(:'jb', 2, '{"valeur":25}') is not null as ok \gset
select public.quiz_repondre(:'jcc', 2, '{"valeur":78}') is not null as ok \gset
:prof
select string_agg(x.categorie || '/' || (x.points > 0), ',' order by j.pseudo) = 'proche/true,loin/false,juste/true' as ok
  from public.quiz_reponses x join public.quiz_joueurs j on j.id = x.joueur_id
 where x.partie_id = :'partie_t' and x.idx = 2 \gset
\if :ok \else \echo 'ÉCHEC : jugement du curseur' \quit \endif

-- ---------- 13. Changer de nom sans devenir un autre joueur (048) ----------
:prof
select r->>'pin' as pin_n, r->>'id' as partie_n from (select public.quiz_lancer(:'quiz') r) t \gset
:eleve
select public.quiz_rejoindre(:'pin_n', 'Tomm B.')->>'jeton' as jn \gset
select public.quiz_rejoindre(:'pin_n', 'Lea C.')->>'jeton' as jl \gset
select public.quiz_renommer(:'jn', '  Tom   B. ')->>'pseudo' = 'Tom B.' as ok \gset
\if :ok \else \echo 'ÉCHEC : renommer' \quit \endif
select public.quiz_etat(:'jn')->>'pseudo' = 'Tom B.' as ok \gset
\if :ok \else \echo 'ÉCHEC : le nouveau nom n apparaît pas' \quit \endif
select essai.attendre_erreur(format('select public.quiz_renommer(%L, %L)', :'jn', 'lea c.'), 'QUIZ_PSEUDO_PRIS') \gset
select essai.attendre_erreur(format('select public.quiz_renommer(%L, %L)', :'jn', 'x'), 'QUIZ_PSEUDO_LONGUEUR') \gset
select essai.attendre_erreur(format('select public.quiz_renommer(%L, %L)', '00000000-0000-0000-0000-000000000000', 'Qui Q.'), 'QUIZ_EXCLU') \gset
:prof
select count(*) = 2 and bool_or(pseudo = 'Tom B.') and not bool_or(pseudo = 'Tomm B.') as ok
  from public.quiz_joueurs where partie_id = :'partie_n' \gset
\if :ok \else \echo 'ÉCHEC : renommer a ajouté un concurrent' \quit \endif

-- ---------- 9. Rejouer le 047 ne casse rien ----------
reset role;
\echo 'TOUS LES ESSAIS PASSENT'
