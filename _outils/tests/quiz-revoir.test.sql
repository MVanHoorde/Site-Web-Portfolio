-- ============================================================
--  Banc d'essai du 052 (« à revoir ») — Postgres LOCAL.
--  Lancé par python _outils/tests/quiz-base.py après les autres essais.
-- ============================================================
\set ON_ERROR_STOP on
\set QUIET on

set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
select public.quiz_importer($j${"slug":"essai-revoir","titre":"Revoir","salle":"RVRVRV",
  "questions":[
    {"type":"vf","enonce":"IP route les paquets.","correct":[0],"notion":"Routage",
     "revoir":{"texte":"S5 · Le routage","lien":"pages/2nde-snt-t1-internet.html#etape-t1-routage"}},
    {"type":"vf","enonce":"Le DNS traduit un nom en adresse IP.","correct":[0],"notion":"DNS",
     "revoir":{"texte":"S6 · Le DNS","lien":"pages/2nde-snt-t1-internet.html#etape-t1-dns"}},
    {"type":"vf","enonce":"Un routeur relie des réseaux.","correct":[0],"notion":"Routage",
     "revoir":{"texte":"S5 · Le routage","lien":"pages/2nde-snt-t1-internet.html#etape-t1-routage"}}
  ]}$j$::jsonb);
reset role;

set role anon;
set request.jwt.claims = '{"role":"anon"}';
create temp table t_jeton as select (public.quiz_entrainer('RVRVRV', 'Inès B.')->>'jeton')::uuid jeton;
do $$
declare
  jt uuid := (select jeton from t_jeton);
  e jsonb;
  i integer;
begin
  for i in 0..2 loop
    perform public.quiz_solo(jt, 'suivante');
    -- faux à la q1 (routage) et à la q2 (DNS), juste à la q3
    perform public.quiz_repondre(jt, i, case when i < 2 then '{"choix":[1]}' else '{"choix":[0]}' end::jsonb, false);
    -- en solo, la réponse passe souvent d'elle-même en correction
    if public.quiz_etat(jt)->>'phase' = 'question' then perform public.quiz_solo(jt, 'corriger'); end if;
    e := public.quiz_etat(jt);
    if i = 0 and (e->'correction'->'revoir'->>'lien') is distinct from 'pages/2nde-snt-t1-internet.html#etape-t1-routage' then
      raise exception 'ÉCHEC : la correction ne porte pas le lien à revoir : %', e->'correction';
    end if;
  end loop;
  perform public.quiz_solo(jt, 'suivante');
  e := public.quiz_etat(jt);
  if e->>'phase' <> 'fin' then raise exception 'ÉCHEC : partie pas finie : %', e->>'phase'; end if;
  -- routage : 1 ratée sur 2, un seul lien (dédoublonné) ; DNS : 1 sur 1
  if (select count(*) from jsonb_array_elements(e->'bilan'->'notions') n
       where n->>'notion' = 'Routage' and jsonb_array_length(n->'revoir') = 1
         and n->'revoir'->0->>'texte' = 'S5 · Le routage') <> 1 then
    raise exception 'ÉCHEC : bilan sans le lien du routage : %', e->'bilan';
  end if;
  if (select count(*) from jsonb_array_elements(e->'bilan'->'notions') n where n->>'notion' = 'DNS' and n ? 'revoir') <> 1 then
    raise exception 'ÉCHEC : bilan sans le lien du DNS : %', e->'bilan';
  end if;
end $$;
reset role;

select '052 : la correction et le bilan portent les liens à revoir' as bilan;
