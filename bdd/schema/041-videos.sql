-- ============================================================
--  041 — Les liens des vidéos, hors du dépôt public (12/11/2026)
-- ------------------------------------------------------------
--  Demande de Loïc : les vidéos des cours sont des MP4 sur le
--  OneDrive du lycée, partagés « toute personne disposant du
--  lien ». Écrits dans les pages, ces liens se lisent dans un dépôt
--  public — et donc par n'importe qui, moteurs de recherche compris.
--  Ils vivent désormais ici : une page ne porte plus que la CLÉ de
--  sa vidéo (<video data-video="es1-t1c2-asnr-sources">), et le
--  lecteur demande le lien au moment du clic.
--
--  Qui lit : tout compte CONNECTÉ (élève ou enseignant). Jamais
--  anon : la clé anonyme est publique, elle ne doit rien ouvrir.
--  Un élève sans compte garde le lien YouTube du crédit.
--  Qui écrit : le gestionnaire du site seul (est_gestionnaire, 038),
--  depuis prof/videos.html ou en SQL.
--
--  Aucune donnée d'élève. Purement additif. Rejouable.
-- ============================================================

create table if not exists public.videos (
  cle    text primary key
           check (cle ~ '^[a-z0-9][a-z0-9-]{2,80}$'),
  url    text not null
           check (url ~ '^https://[a-z0-9-]+\.sharepoint\.com/' and length(url) <= 600),
  titre  text check (titre is null or length(titre) <= 200),
  maj_le timestamptz not null default now()
);

comment on table public.videos is
  'Lien de partage OneDrive de chaque vidéo de cours, par clé (data-video des pages). Lu par tout compte connecté, écrit par le gestionnaire (041).';

alter table public.videos enable row level security;

drop policy if exists videos_lire on public.videos;
create policy videos_lire
  on public.videos for select to authenticated
  using (true);

drop policy if exists videos_ecrire on public.videos;
create policy videos_ecrire
  on public.videos for all to authenticated
  using ((select public.est_gestionnaire()))
  with check ((select public.est_gestionnaire()));

revoke all on public.videos from anon;
grant select, insert, update, delete on public.videos to authenticated;

-- la date suit chaque modification
create or replace function public.videos_date()
returns trigger language plpgsql set search_path = '' as $$
begin new.maj_le := now(); return new; end $$;

drop trigger if exists videos_date on public.videos;
create trigger videos_date before insert or update on public.videos
  for each row execute function public.videos_date();

-- Vérifications : chacune doit rendre vrai.
select
  to_regclass('public.videos') is not null                         as table_presente,
  (select relrowsecurity from pg_class where oid = 'public.videos'::regclass) as rls_active,
  (select count(*) from pg_policies where tablename = 'videos') = 2 as deux_policies,
  not has_table_privilege('anon', 'public.videos', 'select')        as anon_ferme;
