-- ============================================================
--  051 — Diapason : des dossiers (une section par classe, puis un
--  dossier par chapitre), une image en filigrane, et un catalogue
--  ouvert aux élèves pour s'entraîner depuis le site.
--
--  BESOIN (Loïc, 21/11/2026)
--  « Une catégorie par classe, avec les visuels du site ; dedans, des
--  dossiers par chapitre ; une image qui se met en filigrane derrière ;
--  et que les élèves puissent s'entraîner directement depuis le site. »
--
--  CE QUE CE FICHIER AJOUTE
--  - table quiz_categories : un arbre de dossiers (parent → enfants).
--    Lisible de tous les enseignants ; modifiable par son auteur ou par
--    le gestionnaire. Un dossier qui a des sous-dossiers ne se
--    supprime pas (on vide d'abord) ; ses quiz reviennent « sans dossier ».
--  - quiz_quiz.categorie (le dossier du quiz) et quiz_quiz.catalogue
--    (proposé aux élèves pour l'entraînement, vrai par défaut).
--  - quiz_catalogue() : ce que voit un élève SANS compte — les dossiers
--    visibles et, pour chaque quiz, titre, description, nombre de
--    questions et code de salle. Jamais une question ni un corrigé.
--  - quiz_importer réécrit : un fichier peut porter
--    "dossier": ["2de SNT", "Le Web"] — le chemin est retrouvé par les
--    noms, les dossiers manquants sont créés.
--  - les six sections, posées au nom du gestionnaire si aucune section
--    n'existe encore ; les quiz de BTS MS2 rangés dans la leur.
--
--  POIDS
--  Un dossier ≈ 200 octets. L'image est un chemin du site (rien en
--  base) ; une image déposée depuis l'ordinateur est réduite par la page
--  à ~40 Ko et plafonnée ici à 120 000 caractères. Le filigrane n'a pas
--  besoin de détail : c'est ce qui rend ce stockage raisonnable.
--
--  Suppose 047 en place. Rejouable. Banc : _outils/tests/quiz-base.py.
-- ============================================================


-- ------------------------------------------------------------
--  1. Les dossiers
-- ------------------------------------------------------------
create table if not exists public.quiz_categories (
  id             uuid primary key default gen_random_uuid(),
  parent         uuid references public.quiz_categories (id) on delete restrict,
  nom            text not null check (length(btrim(nom)) between 1 and 80),
  sigle          text check (length(sigle) <= 16),          -- « 2de SNT » sur la vignette
  image          text check (length(image) <= 120000),
  focus          text check (focus ~ '^[0-9]{1,3}% [0-9]{1,3}%$'),
  ordre          integer not null default 0,
  visible_eleves boolean not null default true,
  auteur         uuid not null default auth.uid()
                 references auth.users (id) on delete cascade,
  cree_le        timestamptz not null default now(),
  constraint quiz_categories_pas_soi check (parent is null or parent <> id),
  -- l'image : un chemin du site, une adresse https, ou une petite image déposée
  constraint quiz_categories_image check (
    image is null
    or image ~ '^[a-z0-9][a-z0-9/._-]*\.(png|jpe?g|webp|gif|svg)$'
    or image ~ '^https://[^\s"''<>]+$'
    or image ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$')
);
comment on table public.quiz_categories is
  'Dossiers de Diapason (051) : sections par classe, puis chapitres. Image en filigrane.';

-- deux dossiers frères ne portent pas le même nom (casse ignorée)
create unique index if not exists quiz_categories_nom_unique
  on public.quiz_categories (coalesce(parent, '00000000-0000-0000-0000-000000000000'::uuid), lower(btrim(nom)));
create index if not exists quiz_categories_parent on public.quiz_categories (parent);

-- Un dossier ne se range pas dans un de ses propres descendants.
create or replace function public.quiz_categories_sans_boucle()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v uuid := new.parent;
  n integer := 0;
begin
  while v is not null loop
    if v = new.id then raise exception 'QUIZ_DOSSIER_BOUCLE'; end if;
    n := n + 1;
    if n > 12 then raise exception 'QUIZ_DOSSIER_TROP_PROFOND'; end if;
    select parent into v from public.quiz_categories where id = v;
  end loop;
  return new;
end;
$$;
drop trigger if exists quiz_categories_sans_boucle on public.quiz_categories;
create trigger quiz_categories_sans_boucle
  before insert or update of parent on public.quiz_categories
  for each row execute function public.quiz_categories_sans_boucle();

alter table public.quiz_quiz
  add column if not exists categorie uuid references public.quiz_categories (id) on delete set null;
alter table public.quiz_quiz
  add column if not exists catalogue boolean not null default true;
create index if not exists quiz_quiz_categorie on public.quiz_quiz (categorie);


-- ------------------------------------------------------------
--  2. Droits
-- ------------------------------------------------------------
alter table public.quiz_categories enable row level security;
revoke all on public.quiz_categories from anon, authenticated;
grant select, insert, update, delete on public.quiz_categories to authenticated;

drop policy if exists quiz_categories_lire on public.quiz_categories;
create policy quiz_categories_lire on public.quiz_categories for select to authenticated
  using (public.est_enseignant());
drop policy if exists quiz_categories_creer on public.quiz_categories;
create policy quiz_categories_creer on public.quiz_categories for insert to authenticated
  with check (public.est_enseignant() and auteur = (select auth.uid()));
drop policy if exists quiz_categories_modifier on public.quiz_categories;
create policy quiz_categories_modifier on public.quiz_categories for update to authenticated
  using (auteur = (select auth.uid()) or public.est_gestionnaire())
  with check (public.est_enseignant());
drop policy if exists quiz_categories_supprimer on public.quiz_categories;
create policy quiz_categories_supprimer on public.quiz_categories for delete to authenticated
  using (auteur = (select auth.uid()) or public.est_gestionnaire());


-- ------------------------------------------------------------
--  3. Retrouver (ou créer) un dossier par son chemin de noms
-- ------------------------------------------------------------
create or replace function public.quiz_dossier(p_chemin jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent uuid := null;
  v_id uuid;
  v_nom text;
begin
  if not public.est_enseignant() then raise exception 'QUIZ_PAS_ENSEIGNANT'; end if;
  if p_chemin is null or jsonb_typeof(p_chemin) <> 'array' or jsonb_array_length(p_chemin) = 0 then
    return null;
  end if;
  if jsonb_array_length(p_chemin) > 6 then raise exception 'QUIZ_DOSSIER_TROP_PROFOND'; end if;
  for v_nom in select btrim(x) from jsonb_array_elements_text(p_chemin) x loop
    if length(v_nom) not between 1 and 80 then raise exception 'QUIZ_DOSSIER_NOM'; end if;
    -- par le nom, ou par le sigle (« 2de SNT » trouve « SNT — seconde »)
    select id into v_id from public.quiz_categories
     where parent is not distinct from v_parent
       and (lower(btrim(nom)) = lower(v_nom) or lower(btrim(sigle)) = lower(v_nom))
     order by (lower(btrim(nom)) = lower(v_nom)) desc
     limit 1;
    if not found then
      insert into public.quiz_categories (parent, nom, auteur,
                                          ordre)
      values (v_parent, v_nom, auth.uid(),
              coalesce((select max(ordre) + 1 from public.quiz_categories where parent is not distinct from v_parent), 0))
      returning id into v_id;
    end if;
    v_parent := v_id;
  end loop;
  return v_parent;
end;
$$;


-- ------------------------------------------------------------
--  4. L'import (réécrit) : "dossier" et "catalogue" en plus
-- ------------------------------------------------------------
-- Sans clé "dossier", un quiz réimporté RESTE où l'enseignant l'a rangé.
create or replace function public.quiz_importer(p_quiz jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_auteur uuid;
  v_salle text := nullif(upper(btrim(coalesce(p_quiz->>'salle', ''))), '');
  v_cat uuid := null;
  v_avec_cat boolean := p_quiz ? 'dossier';
begin
  if not public.est_enseignant() then raise exception 'QUIZ_PAS_ENSEIGNANT'; end if;
  if v_salle is not null and v_salle !~ '^[A-HJ-KM-NP-Z2-9]{6}$' then
    raise exception 'QUIZ_SALLE_INVALIDE';
  end if;
  select id, auteur into v_id, v_auteur from public.quiz_quiz where slug = p_quiz->>'slug';
  if found and v_auteur <> auth.uid() then raise exception 'QUIZ_SLUG_PRIS'; end if;
  if v_avec_cat then v_cat := public.quiz_dossier(p_quiz->'dossier'); end if;
  begin
    if v_id is not null then
      update public.quiz_quiz set
        titre = p_quiz->>'titre', niveau = p_quiz->>'niveau', matiere = p_quiz->>'matiere',
        description = p_quiz->>'description', questions = coalesce(p_quiz->'questions', '[]'::jsonb),
        partage = coalesce((p_quiz->>'partage')::boolean, partage),
        catalogue = coalesce((p_quiz->>'catalogue')::boolean, catalogue),
        categorie = case when v_avec_cat then v_cat else categorie end,
        salle = coalesce(v_salle, salle)
      where id = v_id;
    else
      insert into public.quiz_quiz (slug, titre, niveau, matiere, description, questions, auteur,
                                    partage, catalogue, categorie, salle)
      values (p_quiz->>'slug', p_quiz->>'titre', p_quiz->>'niveau', p_quiz->>'matiere',
              p_quiz->>'description', coalesce(p_quiz->'questions', '[]'::jsonb), auth.uid(),
              coalesce((p_quiz->>'partage')::boolean, true), coalesce((p_quiz->>'catalogue')::boolean, true),
              v_cat, coalesce(v_salle, public.quiz_code_salle()))
      returning id into v_id;
    end if;
  exception when unique_violation then
    raise exception 'QUIZ_SALLE_PRISE';
  end;
  return v_id;
end;
$$;


-- ------------------------------------------------------------
--  5. Le catalogue des élèves (sans compte)
-- ------------------------------------------------------------
-- Un dossier masqué cache tout ce qu'il contient. Seuls sortent les
-- titres et les codes de salle — les mêmes que sur les QR codes fixes.
create or replace function public.quiz_catalogue()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with recursive visibles as (
    select c.id from public.quiz_categories c where c.parent is null and c.visible_eleves
    union all
    select c.id from public.quiz_categories c join visibles v on c.parent = v.id where c.visible_eleves
  )
  select jsonb_build_object(
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'parent', c.parent, 'nom', c.nom, 'sigle', c.sigle,
                                          'image', c.image, 'focus', c.focus) order by c.ordre, c.nom)
        from public.quiz_categories c where c.id in (select id from visibles)), '[]'::jsonb),
    'quiz', coalesce((
      select jsonb_agg(jsonb_build_object('titre', z.titre, 'description', z.description, 'salle', z.salle,
                                          'categorie', z.categorie, 'n', jsonb_array_length(z.questions))
                       order by z.slug)
        from public.quiz_quiz z
       where z.catalogue and jsonb_array_length(z.questions) > 0
         and z.categorie in (select id from visibles)), '[]'::jsonb))
$$;

revoke execute on function public.quiz_categories_sans_boucle(), public.quiz_dossier(jsonb),
  public.quiz_importer(jsonb), public.quiz_catalogue()
  from public, anon, authenticated;
grant execute on function public.quiz_catalogue()      to anon, authenticated;
grant execute on function public.quiz_dossier(jsonb)   to authenticated;
grant execute on function public.quiz_importer(jsonb)  to authenticated;


-- ------------------------------------------------------------
--  6. Les six sections (au nom du gestionnaire, une seule fois)
-- ------------------------------------------------------------
do $$
declare
  v_g uuid;
  v_bts uuid;
  v_ms2 uuid;
begin
  if to_regclass('public.gestionnaires') is null then return; end if;
  select auth_id into v_g from public.gestionnaires order by ajoute_le limit 1;
  if v_g is null or exists (select 1 from public.quiz_categories where parent is null) then return; end if;

  insert into public.quiz_categories (nom, sigle, image, focus, ordre, auteur) values
    ('Physique-chimie — seconde',            '2de PC',   'assets/img/pc/2nde-pc-t1-c2/t1c2-fer-fusion-coulee.jpg',                     '50% 62%', 1, v_g),
    ('SNT — seconde',                        '2de SNT',  'assets/img/snt/2nde-snt-t0-systemes-informatises/t0-carte-mere.jpg',         '50% 50%', 2, v_g),
    ('Enseignement scientifique — première', '1re ES',   'assets/img/es/1re-es-t1-c1/t1c1-supernova-kepler-accueil.jpg',               '50% 45%', 3, v_g),
    ('Enseignement scientifique — terminale','Tle ES',   'assets/img/es/term-es-t2-c1/t2c1-turboalternateur-paluel-accueil.jpg',       '50% 50%', 4, v_g),
    ('CFA — remise à niveau',                'CFA',      'assets/img/pc/2nde-pc-t2-c2/t2c2-pommes-branche.jpg',                        '50% 45%', 5, v_g),
    ('BTS Maintenance des systèmes',         'BTS MS',   'assets/img/quiz/sections/bts-ms-karman-nasa.jpg',                            '50% 40%', 6, v_g);

  select id into v_bts from public.quiz_categories where parent is null and sigle = 'BTS MS';
  insert into public.quiz_categories (parent, nom, ordre, auteur)
  values (v_bts, 'MS2 — Combustions et oxydoréduction', 1, v_g)
  returning id into v_ms2;
  update public.quiz_quiz set categorie = v_ms2
   where categorie is null and slug like 'ms2-a%';
end $$;


select public.verrouiller_observateurs();

select (select count(*) from public.quiz_categories) as dossiers,
       (select count(*) from public.quiz_quiz where categorie is not null) as quiz_ranges;
