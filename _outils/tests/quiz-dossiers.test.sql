-- ============================================================
--  Banc d'essai du 051 (dossiers de Diapason) — Postgres LOCAL.
--  Lancé par python _outils/tests/quiz-base.py, après les essais
--  du 047 (enseignants a1, a2 ; compte e1 non enseignant ;
--  a1 gestionnaire ; quiz « ms2-a9-essai » importé avant le 051).
-- ============================================================
\set ON_ERROR_STOP on
\set QUIET on

-- ---------- 1. Les six sections, posées une seule fois ----------
do $$
begin
  if (select count(*) from public.quiz_categories where parent is null) <> 6 then
    raise exception 'ÉCHEC : % sections au lieu de 6', (select count(*) from public.quiz_categories where parent is null);
  end if;
  if (select count(*) from public.quiz_categories where nom = 'MS2 — Combustions et oxydoréduction') <> 1 then
    raise exception 'ÉCHEC : le dossier MS2 manque ou est en double';
  end if;
  if (select c.nom from public.quiz_quiz z join public.quiz_categories c on c.id = z.categorie
       where z.slug = 'ms2-a9-essai') is distinct from 'MS2 — Combustions et oxydoréduction' then
    raise exception 'ÉCHEC : le quiz MS2 n''est pas rangé';
  end if;
  if exists (select 1 from public.quiz_categories where auteur <> '00000000-0000-0000-0000-0000000000a1') then
    raise exception 'ÉCHEC : les sections ne sont pas au nom du gestionnaire';
  end if;
end $$;

-- ---------- 2. Import avec un chemin de dossiers ----------
set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}';

select public.quiz_importer($j${"slug":"snt-web-1","titre":"Le Web 1","dossier":["2de SNT","Le Web"],
  "questions":[{"type":"vf","enonce":"HTTP est un protocole.","correct":[0]}]}$j$::jsonb);
-- « 2de SNT » est le sigle de la section : retrouvée, pas de 7e section
do $$
begin
  if (select count(*) from public.quiz_categories where parent is null) <> 6 then
    raise exception 'ÉCHEC : le sigle n''a pas retrouvé la section SNT';
  end if;
  if (select count(*) from public.quiz_categories where lower(nom) = 'le web') <> 1 then
    raise exception 'ÉCHEC : « Le Web » absent ou en double';
  end if;
end $$;
select public.quiz_importer($j${"slug":"snt-web-2","titre":"Le Web 2","dossier":["SNT — seconde","le web"],
  "questions":[{"type":"vf","enonce":"Un navigateur est un moteur de recherche.","correct":[1]}]}$j$::jsonb);
do $$
declare v uuid;
begin
  select z.categorie into v from public.quiz_quiz z where z.slug = 'snt-web-2';
  if (select c.nom from public.quiz_categories c where c.id = v) <> 'Le Web'
     or (select p.nom from public.quiz_categories c join public.quiz_categories p on p.id = c.parent where c.id = v) <> 'SNT — seconde' then
    raise exception 'ÉCHEC : snt-web-2 mal rangé';
  end if;
end $$;

-- réimport SANS « dossier » : le quiz reste où il est
update public.quiz_quiz set categorie = (select id from public.quiz_categories where nom = 'SNT — seconde') where slug = 'snt-web-2';
select public.quiz_importer($j${"slug":"snt-web-2","titre":"Le Web 2 bis",
  "questions":[{"type":"vf","enonce":"Un navigateur est un moteur de recherche.","correct":[1]}]}$j$::jsonb);
do $$
begin
  if (select c.nom from public.quiz_quiz z join public.quiz_categories c on c.id = z.categorie where z.slug = 'snt-web-2') <> 'SNT — seconde' then
    raise exception 'ÉCHEC : un réimport sans dossier a déplacé le quiz';
  end if;
end $$;

-- ---------- 3. Droits ----------
-- a2 (non gestionnaire) ne modifie pas une section de a1 : 0 ligne touchée
do $$
declare n integer;
begin
  update public.quiz_categories set nom = 'piraté' where nom = 'SNT — seconde';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'ÉCHEC : un collègue a renommé une section'; end if;
end $$;
-- mais il crée son propre dossier, et le renomme
insert into public.quiz_categories (parent, nom)
  values ((select id from public.quiz_categories where nom = 'SNT — seconde'), 'Mon dossier');
update public.quiz_categories set nom = 'Mon dossier 2' where nom = 'Mon dossier';
select essai.attendre_erreur($s$insert into public.quiz_categories (nom, auteur) values ('Usurpé', '00000000-0000-0000-0000-0000000000a1')$s$, 'row-level security');
select essai.attendre_erreur($s$insert into public.quiz_categories (nom, image) values ('Image', 'javascript:alert(1)')$s$, 'quiz_categories_image');
select essai.attendre_erreur($s$insert into public.quiz_categories (nom) values ('snt — SECONDE')$s$, 'quiz_categories_nom_unique');

-- le gestionnaire (a1) modifie tout, et une boucle est refusée
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
do $$
declare n integer;
begin
  update public.quiz_categories set nom = 'Mon dossier 3' where nom = 'Mon dossier 2';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'ÉCHEC : le gestionnaire ne peut pas renommer'; end if;
end $$;
select essai.attendre_erreur($s$update public.quiz_categories set parent = (select id from public.quiz_categories where nom = 'Mon dossier 3') where nom = 'SNT — seconde'$s$, 'QUIZ_DOSSIER_BOUCLE');
-- un dossier qui a des sous-dossiers ne se supprime pas
select essai.attendre_erreur($s$delete from public.quiz_categories where nom = 'SNT — seconde'$s$, 'foreign key');

-- un compte non enseignant ne lit rien
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e1","role":"authenticated"}';
do $$ begin
  if (select count(*) from public.quiz_categories) <> 0 then raise exception 'ÉCHEC : un non-enseignant lit les dossiers'; end if;
end $$;

-- ---------- 4. Le catalogue des élèves ----------
reset role;
set role anon;
set request.jwt.claims = '{"role":"anon"}';
select essai.attendre_erreur('select * from public.quiz_categories', 'permission denied');
do $$
declare c jsonb := public.quiz_catalogue();
begin
  if c::text ~ '"correct"|"enonce"|"questions"' then raise exception 'ÉCHEC : le catalogue livre des questions'; end if;
  if not exists (select 1 from jsonb_array_elements(c->'quiz') q where q->>'titre' = 'Le Web 1' and (q->>'n')::int = 1 and length(q->>'salle') = 6) then
    raise exception 'ÉCHEC : « Le Web 1 » absent du catalogue : %', c;
  end if;
end $$;
reset role;
-- masquer la section SNT cache tout ce qu'elle contient
update public.quiz_categories set visible_eleves = false where nom = 'SNT — seconde';
update public.quiz_quiz set catalogue = false where slug = 'ms2-a9-essai';
set role anon;
do $$
declare c jsonb := public.quiz_catalogue();
begin
  if c::text ~ 'Le Web' then raise exception 'ÉCHEC : un dossier masqué reste au catalogue'; end if;
  if c::text ~ 'MS2 essai' then raise exception 'ÉCHEC : un quiz retiré du catalogue y reste'; end if;
  if not exists (select 1 from jsonb_array_elements(c->'categories') x where x->>'sigle' = 'BTS MS') then
    raise exception 'ÉCHEC : la section BTS MS a disparu';
  end if;
end $$;
reset role;

select '051 : dossiers, droits et catalogue — tout est juste' as bilan;
