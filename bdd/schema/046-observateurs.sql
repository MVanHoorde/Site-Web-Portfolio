-- ============================================================
--  046 — Les comptes observateurs : tout voir, ne rien changer
--  (15/11/2026)
-- ------------------------------------------------------------
--  Demande de Loïc : ouvrir le tableau de bord à la direction
--  (directrice adjointe, chef d'établissement, directions de pôle
--  et du CFA) pour qu'elle voie l'état réel du dispositif — les
--  séances, les productions, les résultats de SES classes — sans
--  pouvoir rien modifier.
--
--  UN OBSERVATEUR EST UN ENSEIGNANT EN LECTURE SEULE
--  · Il est inscrit dans enseignants (le tableau de bord le
--    reconnaît, est_enseignant() est vrai) ET dans observateurs.
--  · Il est rattaché aux classes du gestionnaire (Loïc), et à elles
--    seules : rattacher_observateur(adresse, libellé). Rejouable,
--    elle ajoute les classes ouvertes depuis.
--  · Il lit tout ce que ces rattachements ouvrent, par les règles
--    existantes. Aucune règle de lecture n'est touchée.
--
--  LE VERROU : un déclencheur sur CHAQUE table de public
--  Toute écriture (insert, update, delete) faite par la session
--  d'un observateur est refusée — « LECTURE_SEULE ». Un déclencheur
--  joue même à l'intérieur des fonctions security definer (31
--  fonctions écrivent en contournant la RLS au 15/11) : c'est
--  pourquoi on verrouille les tables plutôt que les fonctions une
--  à une. auth.uid() y lit toujours le jeton de l'appelant.
--  Deux exceptions, qui ne concernent que l'observateur lui-même :
--  · reglages_enseignant : ses propres réglages (nouveautés vues,
--    élèves masqués dans SON écran) — la RLS y limite déjà chacun
--    à sa ligne ;
--  · messages_gestion : écrire à Loïc (bouton ✉️).
--  Le stockage (photos déposées, fichiers Padago, Leitner, bilans)
--  reçoit trois règles RESTRICTIVES : aucune écriture.
--  Une lecture lui est fermée : les demandes « J'ai besoin d'en
--  parler » de l'EMC (emc_aide), appels à l'aide d'élèves.
--  La fonction Edge emc-cartes crée des comptes avec la clé de
--  service, après avoir demandé emc_cartes_autoriser() : celle-ci
--  refuse désormais un observateur.
--
--  🔴 UNE NOUVELLE TABLE N'EST PAS VERROUILLÉE TOUTE SEULE.
--  Toute migration qui crée une table se termine par
--      select public.verrouiller_observateurs();
--  (rejouable ; la vérification en fin de ce fichier compte les
--  tables restées ouvertes).
--
--  supprimer_eleve (024) refusait dès qu'un AUTRE enseignant était
--  rattaché à une classe de l'élève : un observateur ne compte plus.
--
--  LE BILAN EMC (bucket privé « bilans »)
--  Le bilan des deux jours d'EMC contient des phrases d'élèves : il
--  ne va pas dans le dépôt public. Il vit dans un espace de
--  stockage privé, lisible par les enseignants (et observateurs)
--  rattachés à une classe EMC, déposé par le gestionnaire depuis
--  prof/emc-bilan.html.
--
--  Les adresses des observateurs ne figurent pas ici (dépôt public) :
--  les lignes rattacher_observateur(…) se lancent dans SQL Editor.
--  RGPD : aucune donnée d'élève ajoutée. Rejouable.
-- ============================================================

-- ---------- 1. Qui est observateur ----------

create table if not exists public.observateurs (
  auth_id   uuid primary key
    references public.enseignants(auth_id) on delete cascade,
  ajoute_le timestamptz not null default now()
);
alter table public.observateurs enable row level security;
-- Aucune règle : personne ne lit ni n'écrit cette table depuis un écran.
revoke all on public.observateurs from anon, authenticated;

comment on table public.observateurs is
  'Enseignants en lecture seule (direction). Écrits par rattacher_observateur() en SQL Editor seulement (046).';

create or replace function public.est_observateur()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.observateurs o where o.auth_id = (select auth.uid()))
$$;

comment on function public.est_observateur() is
  'Vrai si la session en cours est un compte observateur (lecture seule, 046).';

revoke all on function public.est_observateur() from public, anon;
grant execute on function public.est_observateur() to authenticated;


-- ---------- 2. Le verrou ----------

create or replace function public.bloquer_observateur()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select public.est_observateur()) then
    raise exception 'LECTURE_SEULE : un compte observateur consulte, il ne modifie rien.'
      using errcode = '42501';
  end if;
  return null;
end;
$$;

comment on function public.bloquer_observateur() is
  'Déclencheur posé sur chaque table de public : refuse toute écriture d''un observateur (046).';

-- Pose le déclencheur sur toute table de public qui ne l'a pas encore.
-- À rappeler à la fin de toute migration qui crée une table.
create or replace function public.verrouiller_observateurs()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  t text;
  n integer := 0;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace s on s.oid = c.relnamespace
    where s.nspname = 'public'
      and c.relkind in ('r', 'p')
      and c.relname not in ('reglages_enseignant', 'messages_gestion')
      and not exists (select 1 from pg_trigger g
                      where g.tgrelid = c.oid and g.tgname = 'zz_lecture_seule_observateur')
  loop
    execute format(
      'create trigger zz_lecture_seule_observateur
         before insert or update or delete on public.%I
         for each statement execute function public.bloquer_observateur()', t);
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke all on function public.verrouiller_observateurs() from public, anon, authenticated;

select public.verrouiller_observateurs();


-- ---------- 3. Le stockage : aucune écriture ----------

drop policy if exists observateur_sans_depot on storage.objects;
create policy observateur_sans_depot
  on storage.objects as restrictive for insert to authenticated
  with check (not (select public.est_observateur()));

drop policy if exists observateur_sans_modification on storage.objects;
create policy observateur_sans_modification
  on storage.objects as restrictive for update to authenticated
  using (not (select public.est_observateur()))
  with check (not (select public.est_observateur()));

drop policy if exists observateur_sans_suppression on storage.objects;
create policy observateur_sans_suppression
  on storage.objects as restrictive for delete to authenticated
  using (not (select public.est_observateur()));


-- ---------- 3 bis. Ce qu'un observateur ne LIT pas ----------

-- « J'ai besoin d'en parler » (031) : un appel à l'aide d'un élève,
-- réservé aux enseignants qui encadrent la séance.
drop policy if exists emc_aide_pas_observateur on public.emc_aide;
create policy emc_aide_pas_observateur
  on public.emc_aide as restrictive for select to authenticated
  using (not (select public.est_observateur()));


-- ---------- 4. Les deux fonctions à reprendre ----------

-- emc-cartes crée des comptes par la clé de service, une fois cette
-- autorisation obtenue : un observateur n'en crée pas.
create or replace function public.emc_cartes_autoriser(p_classe uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare v jsonb;
begin
  if not (select public.est_enseignant()) or p_classe not in (select public.mes_classes())
     or (select public.est_observateur()) then
    raise exception 'PAS_MA_CLASSE' using errcode = '42501';
  end if;
  select jsonb_build_object('prefixe', s.prefixe, 'libelle', c.libelle,
           'cartes', (select count(*) from public.emc_cartes k where k.classe_id = c.id))
    into v
    from public.classes c
    join public.emc_seances s on s.classe_id = c.id
   where c.id = p_classe and c.espace = 'emc';
  if v is null or v ->> 'prefixe' is null then
    raise exception 'PAS_UNE_CLASSE_EMC' using errcode = '42501';
  end if;
  return v;
end;
$$;

-- Un observateur rattaché à la classe n'en fait pas un élève « partagé ».
create or replace function public.supprimer_eleve(p_eleve uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auth uuid;
begin
  if not (select public.est_enseignant()) or not public.mon_eleve(p_eleve) then
    raise exception 'PAS_MON_ELEVE' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.eleves_classes ap
    where ap.eleve_id = p_eleve
      and not exists (
        select 1 from public.enseignants_classes ec
        where ec.classe_id = ap.classe_id
          and ec.auth_id = (select auth.uid())
      )
  ) or exists (
    select 1
    from public.eleves_classes ap
    join public.enseignants_classes ec on ec.classe_id = ap.classe_id
    where ap.eleve_id = p_eleve
      and ec.auth_id <> (select auth.uid())
      and not exists (select 1 from public.observateurs o where o.auth_id = ec.auth_id)
  ) then
    raise exception 'ELEVE_PARTAGE' using errcode = '42501';
  end if;

  select e.auth_id into v_auth from public.eleves e where e.id = p_eleve;
  delete from auth.users where id = v_auth;
end;
$$;


-- ---------- 5. Inscrire un observateur (SQL Editor seulement) ----------

--  Créer d'abord le compte dans Authentication → Users (« Auto
--  confirm user »), puis :
--    select public.rattacher_observateur('adresse@exemple.fr', 'NOM');
--  Rejouable : relancée, elle ajoute les classes ouvertes depuis.
create or replace function public.rattacher_observateur(p_adresse text, p_libelle text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auth uuid;
  v_n    integer;
begin
  select u.id into v_auth from auth.users u where lower(u.email) = lower(btrim(p_adresse));
  if v_auth is null then
    raise exception 'Aucun compte pour %. Le créer d''abord dans Authentication → Users.', p_adresse;
  end if;
  if exists (select 1 from public.eleves e where e.auth_id = v_auth) then
    raise exception 'Ce compte est un compte élève.';
  end if;
  if exists (select 1 from public.gestionnaires g where g.auth_id = v_auth) then
    raise exception 'Ce compte est gestionnaire : il ne peut pas être observateur.';
  end if;

  insert into public.enseignants (auth_id, libelle) values (v_auth, btrim(p_libelle))
    on conflict (auth_id) do update set libelle = excluded.libelle;
  insert into public.observateurs (auth_id) values (v_auth) on conflict do nothing;

  -- les classes du gestionnaire, et elles seules
  insert into public.enseignants_classes (auth_id, classe_id)
    select distinct v_auth, ec.classe_id
    from public.enseignants_classes ec
    join public.gestionnaires g on g.auth_id = ec.auth_id
  on conflict do nothing;
  get diagnostics v_n = row_count;

  return format('%s observe en lecture seule : %s classe(s) ajoutée(s), %s au total.',
                btrim(p_libelle), v_n,
                (select count(*) from public.enseignants_classes where auth_id = v_auth));
end;
$$;

revoke all on function public.rattacher_observateur(text, text) from public, anon, authenticated;


-- ---------- 6. Le bilan EMC, dans un stockage privé ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bilans', 'bilans', false, 5242880, array['text/html'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Rangement : bilans/emc/<fichier>.html
drop policy if exists bilans_lire on storage.objects;
create policy bilans_lire
  on storage.objects for select to authenticated
  using (
    bucket_id = 'bilans'
    and (storage.foldername(name))[1] = 'emc'
    and exists (select 1 from public.classes c
                where c.espace = 'emc' and c.id in (select public.mes_classes()))
  );

drop policy if exists bilans_deposer on storage.objects;
create policy bilans_deposer
  on storage.objects for insert to authenticated
  with check (bucket_id = 'bilans' and (select public.est_gestionnaire()));

drop policy if exists bilans_remplacer on storage.objects;
create policy bilans_remplacer
  on storage.objects for update to authenticated
  using (bucket_id = 'bilans' and (select public.est_gestionnaire()))
  with check (bucket_id = 'bilans' and (select public.est_gestionnaire()));

drop policy if exists bilans_retirer on storage.objects;
create policy bilans_retirer
  on storage.objects for delete to authenticated
  using (bucket_id = 'bilans' and (select public.est_gestionnaire()));


-- Vérifications : chacune doit rendre vrai.
select
  to_regclass('public.observateurs') is not null                                  as table_presente,
  (select relrowsecurity from pg_class where oid = 'public.observateurs'::regclass) as rls_observateurs,
  not exists (
    select 1 from pg_class c join pg_namespace s on s.oid = c.relnamespace
    where s.nspname = 'public' and c.relkind in ('r', 'p')
      and c.relname not in ('reglages_enseignant', 'messages_gestion')
      and not exists (select 1 from pg_trigger g
                      where g.tgrelid = c.oid and g.tgname = 'zz_lecture_seule_observateur')
  )                                                                                as toutes_tables_verrouillees,
  (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects'
     and policyname like 'observateur_%' and permissive = 'RESTRICTIVE') = 3       as stockage_verrouille,
  exists (select 1 from storage.buckets where id = 'bilans' and not public)        as bilans_prive,
  exists (select 1 from pg_policies where tablename = 'emc_aide'
          and policyname = 'emc_aide_pas_observateur')                             as aide_fermee,
  not has_function_privilege('authenticated', 'public.rattacher_observateur(text, text)', 'execute')
                                                                                   as rattacher_ferme;
