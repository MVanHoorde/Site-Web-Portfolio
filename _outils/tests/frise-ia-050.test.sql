-- Essais du 050 — lancés par frise-ia-base.py après ceux du 049. Toute anomalie lève « ÉCHEC ».
-- Classe EST606, 4 élèves (e1..e4), sujets e-a, e-b (essentiels), s-c, s-d, s-e (secours).
reset role;
delete from public.frise_ia_tirages;
insert into auth.users values
  ('00000000-0000-0000-0000-0000000000e1'), ('00000000-0000-0000-0000-0000000000e2'),
  ('00000000-0000-0000-0000-0000000000e3'), ('00000000-0000-0000-0000-0000000000e4');
insert into public.eleves (id, auth_id, pseudo, classe_id) values
  ('30000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000e1', 'e1', '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000e2', 'e2', '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-0000000000e3', '00000000-0000-0000-0000-0000000000e3', 'e3', '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-0000000000e4', '00000000-0000-0000-0000-0000000000e4', 'e4', '10000000-0000-0000-0000-000000000002');
insert into public.eleves_classes values
  ('30000000-0000-0000-0000-0000000000e1', '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-0000000000e2', '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-0000000000e3', '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-0000000000e4', '10000000-0000-0000-0000-000000000002');

set role authenticated;

-- e1 aime s-c et s-d (secours) ; 4 élèves, 2 essentiels libres : pas encore de contrainte → s-c, s-d
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e1"}';
do $$ declare r record; begin
  select * into r from public.frise_ia_tirage(array['s-c','s-d','e-a','e-b','s-e'], array['s-c','s-d'], array['e-a','e-b']);
  if r.etat <> 'propose' or r.propositions <> array['s-c','s-d'] or r.reste <> 60 then raise exception 'ÉCHEC e1 : % % %', r.etat, r.propositions, r.reste; end if;
  -- rappel pendant le décompte : les mêmes
  select * into r from public.frise_ia_tirage(array['e-a','e-b','s-c','s-d','s-e'], array['e-a'], array['e-a','e-b']);
  if r.propositions <> array['s-c','s-d'] then raise exception 'ÉCHEC e1 rappel : %', r.propositions; end if;
end $$;

-- e2 aime s-c et s-d aussi : réservés chez e1 → aucun libre ne correspond → FILE D'ATTENTE
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e2"}';
do $$ declare r record; begin
  select * into r from public.frise_ia_tirage(array['s-c','s-d','e-a','e-b','s-e'], array['s-c','s-d'], array['e-a','e-b']);
  if r.etat <> 'attente' or r.reste <= 0 then raise exception 'ÉCHEC e2 attente : % %', r.etat, r.reste; end if;
end $$;

-- e1 garde s-c → s-d se libère ; e2 réessaie : s-d, complété par un essentiel
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e1"}';
do $$ begin if public.frise_ia_choisir('s-c') <> 's-c' then raise exception 'ÉCHEC e1 choix'; end if; end $$;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e2"}';
do $$ declare r record; begin
  select * into r from public.frise_ia_tirage(array['s-c','s-d','e-a','e-b','s-e'], array['s-c','s-d'], array['e-a','e-b']);
  if r.etat <> 'propose' or r.propositions <> array['s-d','e-a'] then raise exception 'ÉCHEC e2 après attente : % %', r.etat, r.propositions; end if;
end $$;

-- e2 laisse filer le décompte (on le vieillit) : il repasse et retrouve les MÊMES
reset role;
update public.frise_ia_tirages set propose_le = now() - interval '2 minutes' where eleve_id = '30000000-0000-0000-0000-0000000000e2';
set role authenticated;
do $$ declare r record; begin
  -- choisir après le décompte : refusé
  begin perform public.frise_ia_choisir('s-d'); raise exception 'ÉCHEC choix hors décompte accepté';
  exception when sqlstate '22023' then null; end;
  if (select etat from public.frise_ia_mon_tirage()) <> 'a_relancer' then raise exception 'ÉCHEC état a_relancer'; end if;
  select * into r from public.frise_ia_tirage(array['s-e','e-b','s-c','s-d','e-a'], array['s-e'], array['e-a','e-b']);
  if r.propositions <> array['e-a','s-d'] and r.propositions <> array['s-d','e-a'] then raise exception 'ÉCHEC anti-retirage : %', r.propositions; end if;
end $$;

-- e3 : restent 2 élèves (e3, e4) hors e2 réservé ; essentiels libres : e-b seul (e-a réservé chez e2) → 1 < 2 : pas de contrainte
-- e3 aime s-e → s-e en tête
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e3"}';
do $$ declare r record; begin
  select * into r from public.frise_ia_tirage(array['s-e','e-b','s-c','s-d','e-a'], array['s-e'], array['e-a','e-b']);
  if r.propositions[1] <> 's-e' then raise exception 'ÉCHEC e3 : %', r.propositions; end if;
  if public.frise_ia_choisir('s-e') <> 's-e' then raise exception 'ÉCHEC e3 choix'; end if;
end $$;
-- e2 garde e-a
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e2"}';
do $$ begin if public.frise_ia_choisir('e-a') <> 'e-a' then raise exception 'ÉCHEC e2 choix e-a'; end if; end $$;

-- e4, dernier élève : 1 essentiel libre (e-b) >= 1 élève restant → ESSENTIELS SEULS, même s'il aime s-d
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e4"}';
do $$ declare r record; begin
  select * into r from public.frise_ia_tirage(array['s-d','e-b','s-c','e-a','s-e'], array['s-d'], array['e-a','e-b']);
  if r.propositions <> array['e-b'] then raise exception 'ÉCHEC essentiels garantis : %', r.propositions; end if;
end $$;

-- l'ancien appel (049) marche toujours
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a"}';
do $$ declare r record; begin
  select * into r from public.frise_ia_tirer(array['s1','s2','s3']);
  if r.propositions is null then raise exception 'ÉCHEC ancien appel'; end if;
end $$;

reset role;
select 'essais 050 : tous passent' as bilan;
