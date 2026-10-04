-- ============================================================
--  022 — Boîte à cartes (Leitner) : paquets, cartes, révisions, photos
--
--  L'application « Boîte à cartes » (dépôt Leitner, publiée sur
--  mvanhoorde.github.io/Leitner/) se connecte avec les comptes du
--  site : même identifiant, même mot de passe, même projet Supabase.
--
--  🔴 FICHIER PUREMENT ADDITIF. Il ne touche à aucune table, aucune
--  policy, aucune fonction existante : quatre tables neuves préfixées
--  leitner_, trois fonctions préfixées leitner_, un espace de
--  stockage « leitner ». Retirer la fonctionnalité = supprimer ces
--  objets, rien d'autre ne bouge.
--
--  Les lignes sont rattachées au COMPTE (auth.users), pas à la fiche
--  élève : un enseignant n'a pas de fiche élève, et c'est pourtant
--  lui qui garnit la bibliothèque commune.
--
--  Ce qui vit ici :
--    leitner_paquets   un paquet de cartes ; public = bibliothèque du
--                      prof, lisible par tous les comptes connectés
--    leitner_cartes    les cartes d'un paquet (contenu en jsonb)
--    leitner_etats     l'état Leitner d'une carte pour un compte
--                      (compartiment, échéance…) — une ligne par carte
--                      révisée, y compris les cartes intégrées à l'appli
--    leitner_profils   réglages, journal de révision, bibliothèque
--                      personnelle : un objet jsonb par compte
--    storage « leitner »  les photos des cartes, rangées par compte :
--                      <auth uid>/<fichier>.jpg
--
--  Qui lit quoi :
--    · chacun lit et écrit SES lignes, et seulement les siennes ;
--    · tout compte connecté lit les paquets publics et leurs cartes ;
--      seul un enseignant (est_enseignant(), 008) peut rendre un
--      paquet public ;
--    · un enseignant LIT (jamais n'écrit) les paquets, cartes, états
--      et photos des élèves de ses classes — pour repérer ce qui n'a
--      rien à faire là. Toutes familles confondues : un élève de 2nde
--      n'a qu'une boîte à cartes, quel que soit le cours.
--
--  Garde-fous de volume (plan gratuit : 500 Mo de base, 1 Go de
--  fichiers) : 300 paquets et 5 000 cartes par compte, 20 Ko de
--  contenu par carte, 150 photos de 800 Ko au plus par compte.
-- ============================================================


-- ------------------------------------------------------------
--  1. Fonctions de portée
-- ------------------------------------------------------------

--  Ce compte est-il celui d'un élève de l'une de mes classes ?
create or replace function public.leitner_mon_eleve(p_auth uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.eleves e
    join public.eleves_classes ap      on ap.eleve_id = e.id
    join public.enseignants_classes ec on ec.classe_id = ap.classe_id
    where e.auth_id = p_auth
      and ec.auth_id = (select auth.uid())
  )
$$;

comment on function public.leitner_mon_eleve is
  'Vrai si ce compte appartient à un élève d''une de mes classes. Lecture enseignant de la boîte à cartes.';

--  Ce compte est-il celui d'un enseignant ? Sert aux photos des
--  paquets publics : elles restent dans le dossier de leur auteur.
create or replace function public.leitner_compte_enseignant(p_auth uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.enseignants where auth_id = p_auth)
$$;

--  Le premier dossier d'un chemin de stockage, converti en uuid sans
--  jamais lever d'erreur (un chemin mal formé vaut NULL, donc « non »).
create or replace function public.leitner_dossier(p_nom text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return split_part(p_nom, '/', 1)::uuid;
exception when others then
  return null;
end;
$$;


-- ------------------------------------------------------------
--  2. leitner_paquets
-- ------------------------------------------------------------
create table if not exists public.leitner_paquets (
  id uuid primary key default gen_random_uuid(),
  auteur uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  titre text not null check (char_length(titre) between 1 and 80),
  theme text not null default '' check (char_length(theme) <= 60),
  description text not null default '' check (char_length(description) <= 400),
  couleur text not null default '' check (char_length(couleur) <= 20),
  -- Bibliothèque du prof : visible de tous les comptes connectés.
  public boolean not null default false,
  -- Niveaux visés, pour le catalogue : {seconde, premiere, terminale}.
  niveaux text[] not null default '{}',
  -- Réglages proposés par l'auteur (rythme…) ; chaque élève peut
  -- ensuite les adapter chez lui, dans leitner_profils.
  reglages jsonb not null default '{}'::jsonb
    check (pg_column_size(reglages) < 4000),
  cree_le timestamptz not null default now(),
  maj_le timestamptz not null default now()
);

create index if not exists leitner_paquets_auteur on public.leitner_paquets (auteur);
create index if not exists leitner_paquets_publics on public.leitner_paquets (public) where public;

comment on table public.leitner_paquets is
  'Boîte à cartes : paquets de flashcards. public = bibliothèque du prof.';


-- ------------------------------------------------------------
--  3. leitner_cartes
-- ------------------------------------------------------------
create table if not exists public.leitner_cartes (
  id uuid primary key default gen_random_uuid(),
  paquet_id uuid not null
    references public.leitner_paquets(id) on delete cascade,
  auteur uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  -- simple · double (les deux sens) · qcm · saisie · masques (photo
  -- dont des zones sont cachées, une carte par zone)
  modele text not null
    check (modele in ('simple', 'double', 'qcm', 'saisie', 'masques')),
  contenu jsonb not null default '{}'::jsonb
    check (pg_column_size(contenu) < 20000),
  ordre integer not null default 0,
  cree_le timestamptz not null default now(),
  maj_le timestamptz not null default now()
);

create index if not exists leitner_cartes_paquet on public.leitner_cartes (paquet_id);
create index if not exists leitner_cartes_auteur on public.leitner_cartes (auteur);

comment on table public.leitner_cartes is
  'Boîte à cartes : cartes d''un paquet. Les photos sont des chemins du stockage « leitner ».';


-- ------------------------------------------------------------
--  4. leitner_etats — une ligne par (compte, carte révisée)
--
--  carte est un TEXTE et non une clé étrangère : il désigne aussi
--  bien une carte de leitner_cartes (son uuid, suivi au besoin de
--  « ~inverse » ou « #2 ») qu'une carte intégrée au code de l'appli
--  (« chimie-bases.unites.masse »).
-- ------------------------------------------------------------
create table if not exists public.leitner_etats (
  auteur uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  carte text not null check (char_length(carte) between 1 and 120),
  etat jsonb not null check (pg_column_size(etat) < 2000),
  maj_le timestamptz not null default now(),
  primary key (auteur, carte)
);

comment on table public.leitner_etats is
  'Boîte à cartes : état de révision (compartiment, échéance…) de chaque carte, par compte.';


-- ------------------------------------------------------------
--  5. leitner_profils — un objet par compte
-- ------------------------------------------------------------
create table if not exists public.leitner_profils (
  auteur uuid primary key default auth.uid()
    references auth.users(id) on delete cascade,
  valeur jsonb not null default '{}'::jsonb
    check (pg_column_size(valeur) < 200000),
  maj_le timestamptz not null default now()
);

comment on table public.leitner_profils is
  'Boîte à cartes : réglages, bibliothèque personnelle et journal de révision, par compte.';


-- ------------------------------------------------------------
--  6. Horodatage et plafonds
-- ------------------------------------------------------------
create or replace function public.leitner_toucher()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.maj_le := now();
  return new;
end;
$$;

drop trigger if exists leitner_paquets_maj on public.leitner_paquets;
create trigger leitner_paquets_maj before update on public.leitner_paquets
  for each row execute function public.leitner_toucher();
drop trigger if exists leitner_cartes_maj on public.leitner_cartes;
create trigger leitner_cartes_maj before update on public.leitner_cartes
  for each row execute function public.leitner_toucher();
drop trigger if exists leitner_etats_maj on public.leitner_etats;
create trigger leitner_etats_maj before update on public.leitner_etats
  for each row execute function public.leitner_toucher();
drop trigger if exists leitner_profils_maj on public.leitner_profils;
create trigger leitner_profils_maj before update on public.leitner_profils
  for each row execute function public.leitner_toucher();

--  security definer : le décompte doit voir toutes les lignes du
--  compte, pas seulement celles que la RLS laisse voir à l'instant.
create or replace function public.leitner_plafonner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'leitner_paquets' then
    if (select count(*) from public.leitner_paquets where auteur = new.auteur) >= 300 then
      raise exception 'LEITNER_TROP_DE_PAQUETS' using hint = 'Limite de 300 paquets atteinte.';
    end if;
  else
    if (select count(*) from public.leitner_cartes where auteur = new.auteur) >= 5000 then
      raise exception 'LEITNER_TROP_DE_CARTES' using hint = 'Limite de 5 000 cartes atteinte.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists leitner_paquets_plafond on public.leitner_paquets;
create trigger leitner_paquets_plafond before insert on public.leitner_paquets
  for each row execute function public.leitner_plafonner();
drop trigger if exists leitner_cartes_plafond on public.leitner_cartes;
create trigger leitner_cartes_plafond before insert on public.leitner_cartes
  for each row execute function public.leitner_plafonner();


-- ------------------------------------------------------------
--  7. RLS
-- ------------------------------------------------------------
alter table public.leitner_paquets enable row level security;
alter table public.leitner_cartes  enable row level security;
alter table public.leitner_etats   enable row level security;
alter table public.leitner_profils enable row level security;

revoke all on public.leitner_paquets, public.leitner_cartes,
              public.leitner_etats, public.leitner_profils from anon;
grant select, insert, update, delete on public.leitner_paquets, public.leitner_cartes,
              public.leitner_etats, public.leitner_profils to authenticated;

-- 7a. Paquets
drop policy if exists leitner_paquets_lire on public.leitner_paquets;
create policy leitner_paquets_lire on public.leitner_paquets
  for select to authenticated
  using (auteur = (select auth.uid())
         or public
         or public.leitner_mon_eleve(auteur));

--  Seul un enseignant publie : un élève qui enverrait public = true
--  serait refusé ici, pas seulement masqué par l'écran.
drop policy if exists leitner_paquets_creer on public.leitner_paquets;
create policy leitner_paquets_creer on public.leitner_paquets
  for insert to authenticated
  with check (auteur = (select auth.uid())
              and (not public or (select public.est_enseignant())));

drop policy if exists leitner_paquets_modifier on public.leitner_paquets;
create policy leitner_paquets_modifier on public.leitner_paquets
  for update to authenticated
  using (auteur = (select auth.uid()))
  with check (auteur = (select auth.uid())
              and (not public or (select public.est_enseignant())));

drop policy if exists leitner_paquets_supprimer on public.leitner_paquets;
create policy leitner_paquets_supprimer on public.leitner_paquets
  for delete to authenticated
  using (auteur = (select auth.uid()));

-- 7b. Cartes : on n'écrit que dans SES paquets.
drop policy if exists leitner_cartes_lire on public.leitner_cartes;
create policy leitner_cartes_lire on public.leitner_cartes
  for select to authenticated
  using (auteur = (select auth.uid())
         or exists (select 1 from public.leitner_paquets p
                    where p.id = paquet_id and p.public)
         or public.leitner_mon_eleve(auteur));

drop policy if exists leitner_cartes_creer on public.leitner_cartes;
create policy leitner_cartes_creer on public.leitner_cartes
  for insert to authenticated
  with check (auteur = (select auth.uid())
              and exists (select 1 from public.leitner_paquets p
                          where p.id = paquet_id and p.auteur = (select auth.uid())));

drop policy if exists leitner_cartes_modifier on public.leitner_cartes;
create policy leitner_cartes_modifier on public.leitner_cartes
  for update to authenticated
  using (auteur = (select auth.uid()))
  with check (auteur = (select auth.uid())
              and exists (select 1 from public.leitner_paquets p
                          where p.id = paquet_id and p.auteur = (select auth.uid())));

drop policy if exists leitner_cartes_supprimer on public.leitner_cartes;
create policy leitner_cartes_supprimer on public.leitner_cartes
  for delete to authenticated
  using (auteur = (select auth.uid()));

-- 7c. États et profils : à soi, lisibles par l'enseignant.
drop policy if exists leitner_etats_lire on public.leitner_etats;
create policy leitner_etats_lire on public.leitner_etats
  for select to authenticated
  using (auteur = (select auth.uid()) or public.leitner_mon_eleve(auteur));

drop policy if exists leitner_etats_ecrire on public.leitner_etats;
create policy leitner_etats_ecrire on public.leitner_etats
  for insert to authenticated
  with check (auteur = (select auth.uid()));

drop policy if exists leitner_etats_modifier on public.leitner_etats;
create policy leitner_etats_modifier on public.leitner_etats
  for update to authenticated
  using (auteur = (select auth.uid()))
  with check (auteur = (select auth.uid()));

drop policy if exists leitner_etats_supprimer on public.leitner_etats;
create policy leitner_etats_supprimer on public.leitner_etats
  for delete to authenticated
  using (auteur = (select auth.uid()));

drop policy if exists leitner_profils_lire on public.leitner_profils;
create policy leitner_profils_lire on public.leitner_profils
  for select to authenticated
  using (auteur = (select auth.uid()) or public.leitner_mon_eleve(auteur));

drop policy if exists leitner_profils_ecrire on public.leitner_profils;
create policy leitner_profils_ecrire on public.leitner_profils
  for insert to authenticated
  with check (auteur = (select auth.uid()));

drop policy if exists leitner_profils_modifier on public.leitner_profils;
create policy leitner_profils_modifier on public.leitner_profils
  for update to authenticated
  using (auteur = (select auth.uid()))
  with check (auteur = (select auth.uid()));


-- ------------------------------------------------------------
--  8. Photos : stockage « leitner », privé
--
--  Chemin imposé : <auth uid>/<nom>. Le dossier EST le propriétaire.
--  800 Ko par fichier (l'appli compresse avant d'envoyer, une photo
--  pèse 150 à 300 Ko), JPEG ou WebP seulement, 150 fichiers par
--  compte — l'appli affiche la jauge à l'élève.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('leitner', 'leitner', false, 819200, array['image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.leitner_nb_photos(p_auth uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from storage.objects
  where bucket_id = 'leitner'
    and name like p_auth::text || '/%'
$$;

drop policy if exists leitner_photos_lire on storage.objects;
create policy leitner_photos_lire on storage.objects
  for select to authenticated
  using (bucket_id = 'leitner'
         and (public.leitner_dossier(name) = (select auth.uid())
              or public.leitner_compte_enseignant(public.leitner_dossier(name))
              or public.leitner_mon_eleve(public.leitner_dossier(name))));

drop policy if exists leitner_photos_deposer on storage.objects;
create policy leitner_photos_deposer on storage.objects
  for insert to authenticated
  with check (bucket_id = 'leitner'
              and public.leitner_dossier(name) = (select auth.uid())
              and public.leitner_nb_photos((select auth.uid())) < 150);

drop policy if exists leitner_photos_supprimer on storage.objects;
create policy leitner_photos_supprimer on storage.objects
  for delete to authenticated
  using (bucket_id = 'leitner'
         and public.leitner_dossier(name) = (select auth.uid()));


-- ------------------------------------------------------------
--  9. Droits d'appel des fonctions
-- ------------------------------------------------------------
revoke all on function public.leitner_mon_eleve(uuid)         from public, anon;
revoke all on function public.leitner_compte_enseignant(uuid) from public, anon;
revoke all on function public.leitner_dossier(text)           from public, anon;
revoke all on function public.leitner_nb_photos(uuid)         from public, anon;
revoke all on function public.leitner_plafonner()             from public, anon, authenticated;
revoke all on function public.leitner_toucher()               from public, anon, authenticated;

grant execute on function public.leitner_mon_eleve(uuid)         to authenticated;
grant execute on function public.leitner_compte_enseignant(uuid) to authenticated;
grant execute on function public.leitner_dossier(text)           to authenticated;
grant execute on function public.leitner_nb_photos(uuid)         to authenticated;
