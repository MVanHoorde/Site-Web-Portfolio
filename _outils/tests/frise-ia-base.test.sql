-- Essais du 049 — lancés par frise-ia-base.py. Toute anomalie lève « ÉCHEC ».
\set QUIET on
insert into auth.users values
  ('00000000-0000-0000-0000-00000000000a'), ('00000000-0000-0000-0000-00000000000b'),
  ('00000000-0000-0000-0000-00000000000c'), ('00000000-0000-0000-0000-00000000000d'),
  ('00000000-0000-0000-0000-0000000000f1'), ('00000000-0000-0000-0000-0000000000f2');
insert into public.classes (id, code, espace) values
  ('10000000-0000-0000-0000-000000000001', 'EST303', 'est'),
  ('10000000-0000-0000-0000-000000000002', 'EST606', 'est'),
  ('10000000-0000-0000-0000-000000000003', 'SNT26B', 'snt');
insert into public.eleves (id, auth_id, pseudo, classe_id) values
  ('20000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000a', 'a', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000b', 'b', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-00000000000c', '00000000-0000-0000-0000-00000000000c', 'c', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-00000000000d', '00000000-0000-0000-0000-00000000000d', 'd', '10000000-0000-0000-0000-000000000003');
insert into public.eleves_classes values
  ('20000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-00000000000d', '10000000-0000-0000-0000-000000000003');
-- f1 enseigne en EST303, f2 en SNT seulement
insert into public.enseignants_classes values
  ('00000000-0000-0000-0000-0000000000f1', '10000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-0000000000f2', '10000000-0000-0000-0000-000000000003');

set role authenticated;

-- A : préférences s1 > s2 > s3 > s4 → reçoit s1, s2
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a"}';
do $$ declare r record; begin
  select * into r from public.frise_ia_tirer(array['s1','s2','s3','s4'], '{"epoque":["x"]}');
  if r.propositions <> array['s1','s2'] then raise exception 'ÉCHEC A reçoit %', r.propositions; end if;
  -- pas de retirage : la même chose revient
  select * into r from public.frise_ia_tirer(array['s4','s3','s2','s1']);
  if r.propositions <> array['s1','s2'] then raise exception 'ÉCHEC retirage A : %', r.propositions; end if;
end $$;

-- B : mêmes préférences, A n'a pas encore choisi → s3, s4 (libres) avant s1, s2 (0,5)
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b"}';
do $$ declare r record; begin
  select * into r from public.frise_ia_tirer(array['s1','s2','s3','s4']);
  if r.propositions <> array['s3','s4'] then raise exception 'ÉCHEC B reçoit %', r.propositions; end if;
end $$;

-- A choisit s2 ; un sujet non proposé est refusé ; rechoisir rend le premier choix
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a"}';
do $$ begin
  begin perform public.frise_ia_choisir('s3'); raise exception 'ÉCHEC sujet non proposé accepté';
  exception when sqlstate '22023' then null; end;
  if public.frise_ia_choisir('s2') <> 's2' then raise exception 'ÉCHEC choix A'; end if;
  if public.frise_ia_choisir('s1') <> 's2' then raise exception 'ÉCHEC A a pu changer de sujet'; end if;
  if (select sujet from public.frise_ia_mon_tirage()) <> 's2' then raise exception 'ÉCHEC relecture A'; end if;
end $$;

-- C : occupation s1 = 0 (A a lâché s1), s2 = 1, s3 = s4 = 0,5 → s1 puis s3
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000c"}';
do $$ declare r record; begin
  select * into r from public.frise_ia_tirer(array['s2','s1','s3','s4']);
  if r.propositions <> array['s1','s3'] then raise exception 'ÉCHEC C reçoit %', r.propositions; end if;
  -- C ne voit que sa ligne
  if (select count(*) from public.frise_ia_tirages) <> 1 then raise exception 'ÉCHEC C voit les autres'; end if;
  -- C ne peut pas écrire directement
  begin update public.frise_ia_tirages set sujet = 's9';
    if found then raise exception 'ÉCHEC C écrit en direct'; end if;
  exception when insufficient_privilege then null; end;
end $$;

-- D : pas de classe de terminale ES
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000d"}';
do $$ begin
  begin perform public.frise_ia_tirer(array['s1','s2']); raise exception 'ÉCHEC D a tiré';
  exception when insufficient_privilege then null; end;
end $$;

-- liste invalide
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000c"}';
do $$ begin
  begin perform public.frise_ia_tirer(array['S1;drop','s2']); raise exception 'ÉCHEC liste invalide acceptée';
  exception when sqlstate '22023' then null; end;
end $$;

-- enseignant de la classe : voit 3 lignes, peut attribuer et effacer
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000f1"}';
do $$ begin
  if (select count(*) from public.frise_ia_tirages) <> 3 then raise exception 'ÉCHEC prof voit %', (select count(*) from public.frise_ia_tirages); end if;
  update public.frise_ia_tirages set sujet = 's4', choisi_le = now() where eleve_id = '20000000-0000-0000-0000-00000000000b';
  if not found then raise exception 'ÉCHEC prof attribue'; end if;
  delete from public.frise_ia_tirages where eleve_id = '20000000-0000-0000-0000-00000000000c';
  if not found then raise exception 'ÉCHEC prof efface'; end if;
end $$;

-- enseignant d'une autre famille : rien
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000f2"}';
do $$ begin
  if (select count(*) from public.frise_ia_tirages) <> 0 then raise exception 'ÉCHEC prof SNT voit les tirages'; end if;
end $$;

-- anon : rien
reset role;
set role anon;
do $$ begin
  begin perform public.frise_ia_tirer(array['s1','s2']); raise exception 'ÉCHEC anon a tiré';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'tous les essais passent' as bilan;
