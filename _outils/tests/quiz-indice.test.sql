-- ============================================================
--  Banc d'essai du 053 (indice payant, calculatrice, échelle, image
--  de correction) — Postgres LOCAL.
--  Lancé par python _outils/tests/quiz-base.py après les autres essais.
--  Contrôles :
--   · le validateur accepte les quatre champs, refuse leurs formes fausses ;
--   · l'indice ne sort pas de la base avant d'être demandé ;
--   · points divisés par deux, avec et sans pari, juste et faux ;
--   · un indice pris ne se rend pas, ne se prend plus après la réponse,
--     ni hors de la question en cours, ni là où il n'y en a pas ;
--   · en entraînement seul, même règle ; l'image de correction et
--     l'échelle arrivent au téléphone, au bon moment ;
--   · l'écran projeté compte les indices ; un élève ne lit pas la table.
-- ============================================================
\set ON_ERROR_STOP on
\set QUIET on

reset role;
set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

-- ---------- 1. Le validateur ----------
do $$
begin
  if public.quiz_question_invalide($j${"type":"num","enonce":"Calcule $P$.","num":{"valeur":12},
       "indice":"$P = U \\times I$","calculatrice":true,
       "image_correction":{"src":"assets/img/quiz/x.png","alt":"schéma"}}$j$::jsonb) is not null then
    raise exception 'ÉCHEC : une question num avec indice, calculatrice et image de correction est refusée';
  end if;
  if public.quiz_question_invalide($j${"type":"ordre","enonce":"Range.","items":["a","b"],
       "echelle":["la plus petite","la plus grande"]}$j$::jsonb) is not null then
    raise exception 'ÉCHEC : une échelle est refusée';
  end if;
  if public.quiz_question_invalide($j${"type":"ordre","enonce":"Range.","items":["a","b"],"echelle":["","en bas"]}$j$::jsonb) is not null then
    raise exception 'ÉCHEC : une échelle à un seul libellé est refusée';
  end if;
  if public.quiz_question_invalide('{"type":"vf","enonce":"x","correct":[0],"indice":"  "}') is null then
    raise exception 'ÉCHEC : un indice vide est accepté';
  end if;
  if public.quiz_question_invalide(jsonb_build_object('type','vf','enonce','x','correct',jsonb_build_array(0),'indice',repeat('a', 801))) is null then
    raise exception 'ÉCHEC : un indice de 801 caractères est accepté';
  end if;
  if public.quiz_question_invalide('{"type":"vf","enonce":"x","correct":[0],"calculatrice":"oui"}') is null then
    raise exception 'ÉCHEC : calculatrice « oui » acceptée';
  end if;
  if public.quiz_question_invalide('{"type":"ordre","enonce":"x","items":["a","b"],"echelle":["a","b","c"]}') is null then
    raise exception 'ÉCHEC : une échelle à trois bouts est acceptée';
  end if;
  if public.quiz_question_invalide('{"type":"vf","enonce":"x","correct":[0],"image_correction":{"alt":"sans src"}}') is null then
    raise exception 'ÉCHEC : une image de correction sans src est acceptée';
  end if;
  -- un quiz sans les champs nouveaux passe toujours
  if public.quiz_question_invalide('{"type":"mot","enonce":"x","mot":{"acceptes":["a"],"indice":"gratuit"}}') is not null then
    raise exception 'ÉCHEC : le petit indice gratuit d''une question « mot » est refusé';
  end if;
end $$;

-- ---------- 2. Un quiz, une partie de classe AVEC pari ----------
do $$ begin perform set_config('banc.quiz', public.quiz_importer($j${"slug":"essai-indice","titre":"Indice","salle":"NDCNDC",
  "questions":[
    {"type":"vf","enonce":"Le watt mesure une puissance.","correct":[0],"temps":60,
     "indice":"Le SECRET-INDICE : $1\\ \\text{W} = 1\\ \\text{J/s}$",
     "image_correction":{"src":"assets/img/quiz/correction.png","alt":"schéma corrigé"}},
    {"type":"num","enonce":"$P$ ?","num":{"valeur":12,"unite":"W"},"calculatrice":true,"temps":60,"indice":"Multiplie."},
    {"type":"ordre","enonce":"Range.","items":["mm","cm","m"],"echelle":["la plus petite","la plus grande"],"temps":60},
    {"type":"vf","enonce":"Sans indice.","correct":[0],"temps":60}
  ]}$j$::jsonb)::text, false); end $$;
do $$ begin perform set_config('banc.partie', public.quiz_lancer(current_setting('banc.quiz')::uuid, 'Banc indice', '{"pari":true}')->>'id', false); end $$;
do $$ begin perform set_config('banc.pin', (select pin from public.quiz_parties where id = current_setting('banc.partie')::uuid), false); end $$;
reset role;

set role anon;
set request.jwt.claims = '{"role":"anon"}';
do $$ begin perform set_config('banc.a', public.quiz_rejoindre(current_setting('banc.pin'), 'Indice pari juste')->>'jeton', false); end $$;
do $$ begin perform set_config('banc.b', public.quiz_rejoindre(current_setting('banc.pin'), 'Sans indice')->>'jeton', false); end $$;
do $$ begin perform set_config('banc.c', public.quiz_rejoindre(current_setting('banc.pin'), 'Indice pari faux')->>'jeton', false); end $$;
do $$ begin perform set_config('banc.d', public.quiz_rejoindre(current_setting('banc.pin'), 'Indice sans pari')->>'jeton', false); end $$;
-- avant la question : pas d'indice à prendre
do $$ begin perform essai.attendre_erreur(format('select public.quiz_indice(%L::uuid, 0)', current_setting('banc.a')), 'QUIZ_TROP_TARD'); end $$;
reset role;

set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
do $$ begin perform public.quiz_piloter(current_setting('banc.partie')::uuid, 'question', 0); end $$;
reset role;

set role anon;
set request.jwt.claims = '{"role":"anon"}';
do $$
declare
  a uuid := current_setting('banc.a')::uuid;
  e jsonb;
  r jsonb;
begin
  e := public.quiz_etat(a);
  if (e->'question'->>'a_indice') is distinct from 'true' then raise exception 'ÉCHEC : a_indice absent : %', e->'question'; end if;
  -- 🔴 le cœur : le texte de l'indice ne sort pas avant d'être payé
  if e::text like '%SECRET-INDICE%' then raise exception 'ÉCHEC : l''indice fuit avant d''être demandé : %', e; end if;
  if e ? 'mon_indice' then raise exception 'ÉCHEC : mon_indice rendu sans prise'; end if;
  if e->'question' ? 'image_correction' or e::text like '%correction.png%' then
    raise exception 'ÉCHEC : l''image de correction sort pendant la question';
  end if;
  r := public.quiz_indice(a, 0);
  if r->>'indice' not like 'Le SECRET-INDICE%' then raise exception 'ÉCHEC : quiz_indice ne rend pas le texte : %', r; end if;
  -- reprendre l'indice : sans effet, et sans erreur (rechargement de la page)
  perform public.quiz_indice(a, 0);
  e := public.quiz_etat(a);
  if e->>'mon_indice' not like 'Le SECRET-INDICE%' then raise exception 'ÉCHEC : après rechargement, l''indice payé n''est pas rendu'; end if;
  -- les autres élèves ne le voient toujours pas
  if public.quiz_etat(current_setting('banc.b')::uuid)::text like '%SECRET-INDICE%' then
    raise exception 'ÉCHEC : l''indice d''un élève fuit chez un autre';
  end if;
  perform public.quiz_indice(current_setting('banc.c')::uuid, 0);
  perform public.quiz_indice(current_setting('banc.d')::uuid, 0);
  -- une autre question que celle en cours : refusé
  perform essai.attendre_erreur(format('select public.quiz_indice(%L::uuid, 1)', a), 'QUIZ_TROP_TARD');

  perform public.quiz_repondre(a, 0, '{"choix":[0]}', true);
  perform public.quiz_repondre(current_setting('banc.b')::uuid, 0, '{"choix":[0]}', true);
  perform public.quiz_repondre(current_setting('banc.c')::uuid, 0, '{"choix":[1]}', true);
  perform public.quiz_repondre(current_setting('banc.d')::uuid, 0, '{"choix":[1]}', false);
  -- après la réponse, l'indice ne se prend plus
  perform essai.attendre_erreur(format('select public.quiz_indice(%L::uuid, 0)', current_setting('banc.b')), 'QUIZ_DEJA_REPONDU');
end $$;
-- un élève ne lit pas la table des indices
do $$ begin perform essai.attendre_erreur('select count(*) from public.quiz_indices', 'permission denied'); end $$;
reset role;

-- les points, vus d'en dessous
do $$
declare
  x record;
  attendu integer;
begin
  for x in select j.pseudo, r.points, r.temps_ms, r.sur, r.indice, r.juste
             from public.quiz_reponses r join public.quiz_joueurs j on j.id = r.joueur_id
            where r.partie_id = current_setting('banc.partie')::uuid and r.idx = 0 loop
    attendu := case x.pseudo
      when 'Indice pari juste' then round(public.quiz_points(true, x.temps_ms, 60000, true) / 2.0)::integer
      when 'Sans indice'       then public.quiz_points(true, x.temps_ms, 60000, true)
      when 'Indice pari faux'  then -200          -- le pari perdu coûte toujours 200
      when 'Indice sans pari'  then 0 end;
    if x.points <> attendu then raise exception 'ÉCHEC : % : % points, attendu %', x.pseudo, x.points, attendu; end if;
    if x.indice <> (x.pseudo <> 'Sans indice') then raise exception 'ÉCHEC : % : trace de l''indice fausse', x.pseudo; end if;
  end loop;
  -- moitié bien comprise : ~ 600 points pour le pari juste avec indice (1 250 × ~0,98 / 2)
  if (select points from public.quiz_reponses r join public.quiz_joueurs j on j.id = r.joueur_id
       where j.pseudo = 'Indice pari juste' and r.idx = 0) not between 550 and 625 then
    raise exception 'ÉCHEC : la moitié des points n''est pas appliquée';
  end if;
end $$;

-- l'écran projeté : trois indices pris à la question 1, et la trace par réponse
set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
do $$
declare s jsonb;
begin
  s := public.quiz_suivi(current_setting('banc.partie')::uuid);
  if (s->>'indices')::integer <> 3 then raise exception 'ÉCHEC : quiz_suivi compte % indices au lieu de 3', s->>'indices'; end if;
  if (select count(*) from jsonb_array_elements(s->'reponses') x where (x->>'indice')::boolean) <> 3 then
    raise exception 'ÉCHEC : quiz_suivi ne porte pas la trace de l''indice par réponse';
  end if;
  if (select count(*) from public.quiz_indices where partie_id = current_setting('banc.partie')::uuid) <> 3 then
    raise exception 'ÉCHEC : l''enseignant ne lit pas les indices de sa partie';
  end if;
end $$;
do $$ begin perform public.quiz_piloter(current_setting('banc.partie')::uuid, 'corriger'); end $$;
reset role;

set role anon;
set request.jwt.claims = '{"role":"anon"}';
do $$
declare e jsonb;
begin
  -- correction : l'image de correction arrive, avec la trace de l'indice
  e := public.quiz_etat(current_setting('banc.a')::uuid);
  if e->'correction'->'image_correction'->>'src' <> 'assets/img/quiz/correction.png' then
    raise exception 'ÉCHEC : pas d''image de correction à la correction : %', e->'correction';
  end if;
  if (e->'correction'->>'indice') is distinct from 'true' then raise exception 'ÉCHEC : la correction ne dit pas que l''indice a été pris'; end if;
  if public.quiz_etat(current_setting('banc.b')::uuid)->'correction' ? 'indice' then
    raise exception 'ÉCHEC : la correction d''un élève sans indice parle d''indice';
  end if;
  perform essai.attendre_erreur(format('select public.quiz_indice(%L::uuid, 0)', current_setting('banc.b')), 'QUIZ_TROP_TARD');
end $$;
reset role;

-- question 4 : pas d'indice à prendre
set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
do $$ begin perform public.quiz_piloter(current_setting('banc.partie')::uuid, 'question', 3); end $$;
reset role;
set role anon;
set request.jwt.claims = '{"role":"anon"}';
do $$
begin
  if public.quiz_etat(current_setting('banc.a')::uuid)->'question' ? 'a_indice' then
    raise exception 'ÉCHEC : a_indice annoncé sur une question sans indice';
  end if;
  perform essai.attendre_erreur(format('select public.quiz_indice(%L::uuid, 3)', current_setting('banc.a')), 'QUIZ_PAS_D_INDICE');
end $$;

-- ---------- 3. L'entraînement seul ----------
create temp table t_solo as select (public.quiz_entrainer('NDCNDC', 'Solo indice')->>'jeton')::uuid jeton;
-- les contrôles lisent quiz_reponses : sous le rôle du banc (les fonctions
-- security definer se comportent de même quel que soit l'appelant)
reset role;
do $$
declare
  jt uuid := (select jeton from t_solo);
  e jsonb;
  pts integer;
  t integer;
begin
  perform public.quiz_solo(jt, 'suivante');
  e := public.quiz_etat(jt);
  if e::text like '%SECRET-INDICE%' then raise exception 'ÉCHEC : solo : l''indice fuit avant d''être demandé'; end if;
  perform public.quiz_indice(jt, 0);
  perform public.quiz_repondre(jt, 0, '{"choix":[0]}', true);   -- pari demandé, mais pas de pari en solo
  e := public.quiz_etat(jt);
  if e->>'phase' <> 'correction' then raise exception 'ÉCHEC : solo : pas de correction après la réponse'; end if;
  select r.points, r.temps_ms into pts, t from public.quiz_reponses r join public.quiz_joueurs j on j.id = r.joueur_id where j.jeton = jt and r.idx = 0;
  if pts <> round(public.quiz_points(true, t, 60000, false) / 2.0)::integer then
    raise exception 'ÉCHEC : solo : % points, attendu la moitié de %', pts, public.quiz_points(true, t, 60000, false);
  end if;
  if (e->'correction'->>'points')::integer <> pts or (e->'correction'->>'indice') is distinct from 'true' then
    raise exception 'ÉCHEC : solo : la correction ne rend pas les points divisés et l''indice : %', e->'correction';
  end if;
  if e->'correction'->'image_correction'->>'alt' <> 'schéma corrigé' then raise exception 'ÉCHEC : solo : image de correction absente'; end if;

  -- question 2 : la calculatrice annoncée, l'indice pas pris → tous les points
  perform public.quiz_solo(jt, 'suivante');
  e := public.quiz_etat(jt);
  if (e->'question'->>'calculatrice') is distinct from 'true' then raise exception 'ÉCHEC : calculatrice non annoncée : %', e->'question'; end if;
  if e->'question' ? 'echelle' then raise exception 'ÉCHEC : une échelle hors d''une remise en ordre'; end if;
  perform public.quiz_repondre(jt, 1, '{"valeur":12,"unite":"W"}', false);
  select r.points, r.temps_ms into pts, t from public.quiz_reponses r join public.quiz_joueurs j on j.id = r.joueur_id where j.jeton = jt and r.idx = 1;
  if pts <> public.quiz_points(true, t, 60000, false) then raise exception 'ÉCHEC : solo : points entiers attendus sans indice'; end if;

  -- question 3 : l'échelle de la remise en ordre, sans calculatrice
  perform public.quiz_solo(jt, 'suivante');
  e := public.quiz_etat(jt);
  if e->'question'->'echelle' <> '["la plus petite","la plus grande"]'::jsonb then
    raise exception 'ÉCHEC : échelle absente du téléphone : %', e->'question';
  end if;
  if e->'question' ? 'calculatrice' then raise exception 'ÉCHEC : calculatrice annoncée à tort'; end if;
end $$;
reset role;

select '053 : indice payant (fuite, moitié avec et sans pari, solo), calculatrice, échelle, image de correction' as bilan;
