-- ============================================================
--  030 — Padago : les pads à serrures (comptes autrices, pads)
--
--  Padago est l'outil « Digipad ludifié » du site
--  (outils/padago/) : une prof construit un pad en colonnes, chaque
--  colonne se termine par un cadenas, des coffres rendent des
--  médailles. Ce fichier ne porte QUE le côté professeur :
--  enregistrer ses pads, les retrouver sur tout appareil, les
--  partager par lien.
--
--  🔴 FICHIER PUREMENT ADDITIF, comme le 022 (Boîte à cartes). Il ne
--  touche à aucune table, aucune policy, aucune fonction existante :
--  trois tables neuves préfixées padago_, des fonctions préfixées
--  padago_. Retirer l'outil = supprimer ces objets.
--
--  🔴 L'ÉLÈVE N'A PAS DE COMPTE ET N'ÉCRIT RIEN ICI. Sa progression,
--  ses dépôts (texte, photo d'ardoise), ses médailles restent sur sa
--  tablette (IndexedDB). La base ne reçoit donc aucune donnée
--  d'élève : pas de prénom, pas de photo, rien.
--
--  QUI PEUT CRÉER DES PADS — une « autrice Padago » :
--    · tout compte de la table  enseignants  (Loïc, les collègues
--      déjà inscrites au tableau de bord), sans démarche ;
--    · ou un compte qui a utilisé un CODE D'INVITATION.
--  Le code d'invitation est la seule porte d'entrée nouvelle. Il est
--  à usage unique, et la base n'en garde que l'empreinte SHA-256 :
--  ce fichier, publié sur GitHub, ne permet pas de le retrouver
--  (12 caractères tirés au hasard ≈ 60 bits).
--  Être autrice Padago NE donne AUCUN accès au tableau de bord, aux
--  classes ni aux copies : ce n'est pas le rôle enseignant du 008.
--
--  Pourquoi pas une liste d'adresses mail ? Les comptes élèves du
--  site naissent sans confirmation de mail (adresses synthétiques
--  @snt.local) : n'importe qui pourrait donc créer un compte au nom
--  de l'adresse invitée avant la collègue. Le code, lui, ne circule
--  que dans le mail que Loïc lui envoie.
--
--  CE QUI VIT ICI
--    padago_invitations  une ligne par code distribué (empreinte)
--    padago_auteurs      les comptes qui ont accepté une invitation
--    padago_pads         un pad = deux versions jsonb :
--        brouillon   ce que l'éditeur manipule, codes EN CLAIR —
--                    lisible par son autrice seule ;
--        publie      ce que lisent les élèves : codes remplacés par
--                    leur empreinte salée, calculée par l'éditeur.
--                    Lisible par tous, mais seulement pad par pad,
--                    par son lien (padago_lire) : pas d'annuaire.
--
--  Rejouable : if not exists, create or replace, on conflict.
-- ============================================================


-- ------------------------------------------------------------
--  1. Les invitations
-- ------------------------------------------------------------
create table if not exists public.padago_invitations (
  empreinte    text primary key
               check (empreinte ~ '^[0-9a-f]{64}$'),
  libelle      text not null,                -- « P. Rouffaud » : pour s'y retrouver
  cree_le      timestamptz not null default now(),
  utilisee_par uuid references auth.users (id) on delete set null,
  utilisee_le  timestamptz
);

comment on table public.padago_invitations is
  'Codes d''invitation Padago (empreinte SHA-256 du code normalisé). Usage unique.';

alter table public.padago_invitations enable row level security;
-- Aucune policy : la table ne se lit ni ne s'écrit depuis un
-- navigateur. Seule padago_accepter_invitation() y touche.
revoke all on public.padago_invitations from anon, authenticated;


-- ------------------------------------------------------------
--  2. Les autrices
-- ------------------------------------------------------------
create table if not exists public.padago_auteurs (
  auth_id   uuid primary key references auth.users (id) on delete cascade,
  depuis    timestamptz not null default now()
);

comment on table public.padago_auteurs is
  'Comptes autorisés à créer des pads Padago par invitation (en plus des enseignants).';

alter table public.padago_auteurs enable row level security;
revoke all on public.padago_auteurs from anon, authenticated;


-- ------------------------------------------------------------
--  3. padago_suis_auteur() — la porte
-- ------------------------------------------------------------
create or replace function public.padago_suis_auteur()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and (
    exists (select 1 from public.enseignants e  where e.auth_id = (select auth.uid()))
    or
    exists (select 1 from public.padago_auteurs a where a.auth_id = (select auth.uid()))
  )
$$;

comment on function public.padago_suis_auteur is
  'Vrai si la session peut créer des pads Padago : enseignant inscrit, ou invitation acceptée.';


-- ------------------------------------------------------------
--  4. padago_accepter_invitation(code) — utiliser son code
--
--  Normalise le code (majuscules, sans tirets ni espaces), compare
--  son empreinte, marque l'invitation utilisée et inscrit le compte.
--  Un même compte peut rappeler la fonction sans dommage.
--  Ne dit JAMAIS si un code « existe mais est déjà pris » : la
--  réponse est la même que pour un code faux.
-- ------------------------------------------------------------
create or replace function public.padago_accepter_invitation(p_code text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_emp text;
begin
  if v_uid is null then
    raise exception 'PADAGO_NON_CONNECTE';
  end if;
  if exists (select 1 from public.padago_auteurs where auth_id = v_uid) then
    return true;
  end if;
  v_emp := encode(sha256(convert_to(
             upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')),
             'UTF8')), 'hex');
  update public.padago_invitations
     set utilisee_par = v_uid, utilisee_le = now()
   where empreinte = v_emp and utilisee_par is null and utilisee_le is null;
  if not found then
    raise exception 'PADAGO_CODE_INVALIDE';
  end if;
  insert into public.padago_auteurs (auth_id) values (v_uid)
    on conflict do nothing;
  return true;
end;
$$;


-- ------------------------------------------------------------
--  5. Les pads
-- ------------------------------------------------------------
create table if not exists public.padago_pads (
  id         uuid primary key default gen_random_uuid(),
  -- le lien élève : 10 caractères tirés par l'éditeur, sans 0/O/1/I/L
  slug       text not null unique
             check (slug ~ '^[a-hjkmnp-z2-9]{10}$'),
  auteur     uuid not null default auth.uid()
             references auth.users (id) on delete cascade,
  titre      text not null default 'Pad sans titre'
             check (char_length(titre) <= 200),
  brouillon  jsonb not null default '{}'::jsonb,
  publie     jsonb,
  -- partage entre collègues : une autrice qui a le lien peut COPIER
  -- le pad (brouillon compris, donc codes compris) dans ses pads.
  copiable   boolean not null default true,
  cree_le    timestamptz not null default now(),
  maj_le     timestamptz not null default now(),
  -- garde-fou de taille : les images passent par lien, un pad
  -- raisonnable pèse quelques dizaines de ko.
  constraint padago_pads_taille check (
    octet_length(brouillon::text) <= 400000
    and (publie is null or octet_length(publie::text) <= 400000))
);

create index if not exists padago_pads_auteur on public.padago_pads (auteur);

comment on table public.padago_pads is
  'Pads Padago. brouillon = codes en clair (autrice seule) ; publie = empreintes (lu par padago_lire).';


-- ------------------------------------------------------------
--  6. Horodatage et plafond
-- ------------------------------------------------------------
create or replace function public.padago_toucher()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.maj_le := now();
  -- l'autrice et l'identifiant ne changent jamais
  new.auteur  := old.auteur;
  new.id      := old.id;
  new.cree_le := old.cree_le;
  return new;
end;
$$;

drop trigger if exists padago_pads_maj on public.padago_pads;
create trigger padago_pads_maj before update on public.padago_pads
  for each row execute function public.padago_toucher();

create or replace function public.padago_plafonner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.padago_pads where auteur = new.auteur) >= 200 then
    raise exception 'PADAGO_TROP_DE_PADS' using hint = 'Limite de 200 pads atteinte.';
  end if;
  return new;
end;
$$;

drop trigger if exists padago_pads_plafond on public.padago_pads;
create trigger padago_pads_plafond before insert on public.padago_pads
  for each row execute function public.padago_plafonner();


-- ------------------------------------------------------------
--  7. RLS des pads — chacune ses pads, rien d'autre
-- ------------------------------------------------------------
alter table public.padago_pads enable row level security;

revoke all on public.padago_pads from anon;
grant select, insert, update, delete on public.padago_pads to authenticated;

drop policy if exists padago_pads_lire on public.padago_pads;
create policy padago_pads_lire on public.padago_pads
  for select to authenticated
  using (auteur = (select auth.uid()));

drop policy if exists padago_pads_creer on public.padago_pads;
create policy padago_pads_creer on public.padago_pads
  for insert to authenticated
  with check (auteur = (select auth.uid()) and (select public.padago_suis_auteur()));

drop policy if exists padago_pads_modifier on public.padago_pads;
create policy padago_pads_modifier on public.padago_pads
  for update to authenticated
  using (auteur = (select auth.uid()))
  with check (auteur = (select auth.uid()));

drop policy if exists padago_pads_supprimer on public.padago_pads;
create policy padago_pads_supprimer on public.padago_pads
  for delete to authenticated
  using (auteur = (select auth.uid()));


-- ------------------------------------------------------------
--  8. padago_lire(slug) — ce que lit l'élève
--
--  Sans compte : appelable avec la seule clé anon. Rend la version
--  PUBLIÉE (empreintes, jamais les codes) d'UN pad dont on connaît
--  le lien. Ne permet pas de lister les pads.
-- ------------------------------------------------------------
create or replace function public.padago_lire(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select p.publie
    from public.padago_pads p
   where p.slug = lower(p_slug) and p.publie is not null
$$;


-- ------------------------------------------------------------
--  9. padago_copier(slug) — ce que copie une collègue
--
--  Réservé aux autrices. Rend le BROUILLON (codes en clair : la
--  collègue doit pouvoir les modifier) d'un pad marqué copiable.
--  L'éditeur en fait un pad neuf, à elle.
-- ------------------------------------------------------------
create or replace function public.padago_copier(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v jsonb;
begin
  if not (select public.padago_suis_auteur()) then
    raise exception 'PADAGO_PAS_AUTEUR';
  end if;
  select p.brouillon into v
    from public.padago_pads p
   where p.slug = lower(p_slug) and (p.copiable or p.auteur = (select auth.uid()));
  return v;
end;
$$;


-- ------------------------------------------------------------
--  10. Droits d'appel des fonctions
-- ------------------------------------------------------------
revoke all on function public.padago_suis_auteur()               from public, anon;
revoke all on function public.padago_accepter_invitation(text)   from public, anon;
revoke all on function public.padago_copier(text)                from public, anon;
revoke all on function public.padago_lire(text)                  from public;
revoke all on function public.padago_toucher()                   from public, anon, authenticated;
revoke all on function public.padago_plafonner()                 from public, anon, authenticated;

grant execute on function public.padago_suis_auteur()             to authenticated;
grant execute on function public.padago_accepter_invitation(text) to authenticated;
grant execute on function public.padago_copier(text)              to authenticated;
grant execute on function public.padago_lire(text)                to anon, authenticated;


-- ------------------------------------------------------------
--  11. La première invitation — P. Rouffaud (31/10/2026)
--
--  Le code lui-même n'est écrit nulle part dans le dépôt : il part
--  dans le mail de Loïc. Pour en créer une autre plus tard : tirer
--  un code, puis dans le SQL Editor
--    insert into public.padago_invitations (empreinte, libelle)
--    values (encode(sha256(convert_to('CODESANSTIRETS','UTF8')),'hex'), 'Nom');
-- ------------------------------------------------------------
insert into public.padago_invitations (empreinte, libelle)
values ('c1355ec11ce84fa8784ccf4db38fd1718a745fec9a4e3a5c9ea04211fefa6bdf', 'P. Rouffaud')
on conflict do nothing;


-- ------------------------------------------------------------
--  12. Vérifications — à lire après « Run » : six lignes « ok »
-- ------------------------------------------------------------
select 'trois tables padago_, RLS active' as controle,
       (select count(*) from pg_tables
         where schemaname = 'public' and tablename like 'padago\_%' and rowsecurity) = 3 as ok
union all
select 'quatre policies sur padago_pads',
       (select count(*) from pg_policies where schemaname = 'public' and tablename = 'padago_pads') = 4
union all
select 'aucune policy sur invitations et auteurs (fermées)',
       (select count(*) from pg_policies where schemaname = 'public'
         and tablename in ('padago_invitations', 'padago_auteurs')) = 0
union all
select 'invitation P. Rouffaud en place, non utilisée',
       exists (select 1 from public.padago_invitations where libelle = 'P. Rouffaud' and utilisee_par is null)
union all
select 'padago_lire ouverte aux élèves sans compte',
       has_function_privilege('anon', 'public.padago_lire(text)', 'execute')
union all
select 'padago_copier fermée aux élèves sans compte',
       not has_function_privilege('anon', 'public.padago_copier(text)', 'execute');
