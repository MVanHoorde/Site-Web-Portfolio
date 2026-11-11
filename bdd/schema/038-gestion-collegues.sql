-- ============================================================
--  038 — La gestion du site entre collègues : élèves masqués,
--        demandes de suppression, messages, nouveautés
--
--  BESOIN (Loïc, 11/11/2026)
--  · Des comptes d'élèves en double chez une collègue. Elle ne
--    peut pas les supprimer elle-même quand l'élève est PARTAGÉ
--    (024 : supprimer_eleve refuse dès qu'une de ses classes a un
--    autre enseignant). Elle coche « À supprimer » ; Loïc, le
--    gestionnaire, retrouve toutes les demandes au même endroit et
--    efface d'un bouton.
--  · Chaque enseignant masque de SON affichage des élèves (compte
--    de test, élève parti…) et des onglets du tableau de bord qui
--    ne lui servent pas.
--  · Un bouton « Écrire à M. Van Hoorde » au lieu des mots papier
--    dans les casiers ; Loïc répond, la collègue lit la réponse.
--  · Une fenêtre « Nouveautés » à la connexion, une fois par
--    nouveauté : on garde le numéro de la dernière vue.
--  Même dispositif que Résonance (Tutorat/supabase/migrations/
--  008_gestion.sql), sur cette base-ci : site du cours et Leitner.
--
--  ARBITRAGES
--  · Le gestionnaire est un enseignant inscrit dans la table
--    gestionnaires. Personne ne la lit : est_gestionnaire() répond
--    pour la session en cours seulement. Inscription : le seul
--    enseignant dont le libellé contient « Van Hoorde », sinon à la
--    main (rien de nominatif écrit dans ce dépôt public).
--  · Un enseignant ne demande la suppression que d'un de SES
--    élèves (mon_eleve, 018). Loïc efface n'importe quel compte
--    élève demandé, partagé ou non : tout son travail part avec,
--    chez tous ses enseignants. Jamais un compte enseignant.
--  · Le masquage ne touche que l'écran de celui qui masque.
--  · Messages : lus par leur auteur et le gestionnaire ; seul le
--    gestionnaire répond (date du serveur). Trente par jour au plus.
--
--  RGPD : aucun nom d'élève. Une demande porte l'élève (pseudonyme)
--  et un motif court ; l'écran rappelle de n'écrire aucun nom.
--  Messages entre adultes. Fin d'année :
--    delete from public.messages_gestion;
--    delete from public.demandes_suppression;
--
--  Rejouable. Banc : _outils/tests/gestion-schema.test.mjs
-- ============================================================


-- ------------------------------------------------------------
--  1. Le gestionnaire du site
-- ------------------------------------------------------------
create table if not exists public.gestionnaires (
  auth_id   uuid primary key
    references public.enseignants(auth_id) on delete cascade,
  ajoute_le timestamptz not null default now()
);
alter table public.gestionnaires enable row level security;
-- Aucune règle : personne ne lit ni n'écrit cette table depuis un écran.

create or replace function public.est_gestionnaire()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.gestionnaires g
    where g.auth_id = (select auth.uid())
  )
$$;

comment on function public.est_gestionnaire is
  'Vrai si la session en cours est celle du gestionnaire du site (Loïc).';

do $$
declare n int;
begin
  select count(*) into n from public.enseignants where libelle ilike '%van hoorde%';
  if n = 1 then
    insert into public.gestionnaires (auth_id)
      select auth_id from public.enseignants where libelle ilike '%van hoorde%'
      on conflict do nothing;
  else
    raise notice 'Gestionnaire non inscrit : % enseignants ont « Van Hoorde » dans leur libellé. À faire à la main : insert into public.gestionnaires (auth_id) select auth_id from public.enseignants where libelle = ''…'';', n;
  end if;
end $$;


-- ------------------------------------------------------------
--  2. Les réglages de chaque enseignant
-- ------------------------------------------------------------
create table if not exists public.reglages_enseignant (
  auth_id         uuid primary key default auth.uid()
    references public.enseignants(auth_id) on delete cascade,
  eleves_masques  uuid[] not null default '{}'
    check (cardinality(eleves_masques) <= 2000),
  onglets_masques text[] not null default '{}'
    check (cardinality(onglets_masques) <= 40),
  -- la dernière nouveauté vue, par application : {"cours": 1, "leitner": 1}
  nouveautes_vues jsonb not null default '{}'::jsonb
    check (jsonb_typeof(nouveautes_vues) = 'object'),
  maj_le          timestamptz not null default now()
);
alter table public.reglages_enseignant enable row level security;

drop policy if exists "réglages : les miens" on public.reglages_enseignant;
create policy "réglages : les miens" on public.reglages_enseignant
  for all to authenticated
  using (auth_id = (select auth.uid()) and (select public.est_enseignant()))
  with check (auth_id = (select auth.uid()) and (select public.est_enseignant()));


-- ------------------------------------------------------------
--  3. Les demandes de suppression
-- ------------------------------------------------------------
create table if not exists public.demandes_suppression (
  eleve_id    uuid not null
    references public.eleves(id) on delete cascade,
  demande_par uuid not null default auth.uid()
    references public.enseignants(auth_id) on delete cascade,
  motif       text check (char_length(motif) <= 300),
  cree_le     timestamptz not null default now(),
  primary key (eleve_id, demande_par)
);
alter table public.demandes_suppression enable row level security;

drop policy if exists "suppression : je demande pour mes élèves" on public.demandes_suppression;
create policy "suppression : je demande pour mes élèves" on public.demandes_suppression
  for insert to authenticated
  with check ((select public.est_enseignant())
              and demande_par = (select auth.uid())
              and public.mon_eleve(eleve_id));

drop policy if exists "suppression : je relis les miennes" on public.demandes_suppression;
create policy "suppression : je relis les miennes" on public.demandes_suppression
  for select to authenticated
  using (demande_par = (select auth.uid()) or (select public.est_gestionnaire()));

drop policy if exists "suppression : je retire les miennes" on public.demandes_suppression;
create policy "suppression : je retire les miennes" on public.demandes_suppression
  for delete to authenticated
  using (demande_par = (select auth.uid()) or (select public.est_gestionnaire()));

--  3b. Le gestionnaire : toutes les demandes, avec de quoi décider.
create or replace function public.gestion_suppressions()
returns table (
  eleve_id uuid, pseudo text, classes text[], enseignants text[],
  cree_le timestamptz, derniere_connexion timestamptz,
  demande_par text, motif text, demande_le timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select d.eleve_id, e.pseudo,
         array(select c.code || ' · ' || c.libelle
                 from public.eleves_classes ap join public.classes c on c.id = ap.classe_id
                where ap.eleve_id = e.id order by c.code),
         array(select distinct en.libelle
                 from public.eleves_classes ap
                 join public.enseignants_classes ec on ec.classe_id = ap.classe_id
                 join public.enseignants en on en.auth_id = ec.auth_id
                where ap.eleve_id = e.id order by 1),
         e.cree_le, u.last_sign_in_at,
         dp.libelle, d.motif, d.cree_le
    from public.demandes_suppression d
    join public.eleves e       on e.id = d.eleve_id
    join public.enseignants dp on dp.auth_id = d.demande_par
    left join auth.users u     on u.id = e.auth_id
   where (select public.est_gestionnaire())
   order by d.cree_le desc
$$;

comment on function public.gestion_suppressions is
  'Gestionnaire seul : les demandes de suppression de tous les enseignants, avec les classes, les enseignants de l''élève et sa dernière connexion.';

--  3c. L'effacement, par le gestionnaire seul. Comme supprimer_eleve
--  (024), mais sans la limite « mes classes seulement ».
create or replace function public.effacer_eleve_demande(p_eleve uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_auth uuid;
begin
  if not (select public.est_gestionnaire()) then
    raise exception 'GESTIONNAIRE_SEUL' using errcode = '42501';
  end if;
  select e.auth_id into v_auth from public.eleves e where e.id = p_eleve;
  if v_auth is null then
    raise exception 'ELEVE_INCONNU' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.enseignants where auth_id = v_auth) then
    raise exception 'COMPTE_ENSEIGNANT' using errcode = '42501';
  end if;
  delete from auth.users where id = v_auth;   -- l'élève et tout son travail suivent (cascade)
end;
$$;

comment on function public.effacer_eleve_demande is
  'Gestionnaire seul : supprime le compte d''un élève, partagé ou non. Tout son travail part avec, chez tous ses enseignants.';

revoke all on function public.est_gestionnaire()           from public, anon;
revoke all on function public.gestion_suppressions()       from public, anon;
revoke all on function public.effacer_eleve_demande(uuid)  from public, anon;
grant execute on function public.est_gestionnaire()          to authenticated;
grant execute on function public.gestion_suppressions()      to authenticated;
grant execute on function public.effacer_eleve_demande(uuid) to authenticated;


-- ------------------------------------------------------------
--  4. Les messages au gestionnaire
-- ------------------------------------------------------------
create table if not exists public.messages_gestion (
  id         uuid primary key default gen_random_uuid(),
  auteur     uuid not null default auth.uid()
    references public.enseignants(auth_id) on delete cascade,
  -- d'où il écrit : « Tableau de bord · Suivi », « Leitner »…
  ou         text check (char_length(ou) <= 120),
  message    text not null check (char_length(btrim(message)) between 3 and 2000),
  cree_le    timestamptz not null default now(),
  lu_le      timestamptz,
  reponse    text check (char_length(reponse) <= 2000),
  repondu_le timestamptz
);
create index if not exists messages_gestion_auteur_date
  on public.messages_gestion (auteur, cree_le desc);
alter table public.messages_gestion enable row level security;

drop policy if exists "message : j'écris" on public.messages_gestion;
create policy "message : j'écris" on public.messages_gestion
  for insert to authenticated
  with check ((select public.est_enseignant()) and auteur = (select auth.uid())
              and lu_le is null and reponse is null and repondu_le is null);

drop policy if exists "message : auteur et gestionnaire lisent" on public.messages_gestion;
create policy "message : auteur et gestionnaire lisent" on public.messages_gestion
  for select to authenticated
  using (auteur = (select auth.uid()) or (select public.est_gestionnaire()));

drop policy if exists "message : le gestionnaire répond" on public.messages_gestion;
create policy "message : le gestionnaire répond" on public.messages_gestion
  for update to authenticated
  using ((select public.est_gestionnaire()))
  with check ((select public.est_gestionnaire()));

drop policy if exists "message : auteur et gestionnaire suppriment" on public.messages_gestion;
create policy "message : auteur et gestionnaire suppriment" on public.messages_gestion
  for delete to authenticated
  using (auteur = (select auth.uid()) or (select public.est_gestionnaire()));

-- Le gestionnaire ne change que lu_le et la réponse ; date du serveur.
create or replace function public.messages_gestion_reponse()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.auteur := old.auteur; new.ou := old.ou;
  new.message := old.message; new.cree_le := old.cree_le;
  if new.reponse is distinct from old.reponse then
    new.repondu_le := case when new.reponse is null then null else now() end;
    if new.reponse is not null and new.lu_le is null then new.lu_le := now(); end if;
  end if;
  return new;
end;
$$;
drop trigger if exists messages_gestion_reponse on public.messages_gestion;
create trigger messages_gestion_reponse before update on public.messages_gestion
  for each row execute function public.messages_gestion_reponse();

create or replace function public.messages_gestion_plafond()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.messages_gestion m
       where m.auteur = new.auteur and m.cree_le > now() - interval '24 hours') >= 30 then
    raise exception 'PLAFOND_MESSAGES' using errcode = '54000';
  end if;
  return new;
end;
$$;
drop trigger if exists messages_gestion_plafond on public.messages_gestion;
create trigger messages_gestion_plafond before insert on public.messages_gestion
  for each row execute function public.messages_gestion_plafond();

--  4b. Le gestionnaire : les messages avec le libellé de leur
--  auteur (un enseignant ne lit que sa propre ligne d'enseignants,
--  008 : d'où cette fonction plutôt qu'une jointure).
create or replace function public.gestion_messages()
returns table (
  id uuid, auteur text, ou text, message text, cree_le timestamptz,
  lu_le timestamptz, reponse text, repondu_le timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select m.id, en.libelle, m.ou, m.message, m.cree_le, m.lu_le, m.reponse, m.repondu_le
    from public.messages_gestion m
    join public.enseignants en on en.auth_id = m.auteur
   where (select public.est_gestionnaire())
   order by m.cree_le desc
   limit 300
$$;
revoke all on function public.gestion_messages() from public, anon;
grant execute on function public.gestion_messages() to authenticated;

-- ============================================================
--  Vérification
--
-- select e.libelle from public.gestionnaires g
--   join public.enseignants e using (auth_id);
--  → 1 ligne : votre libellé
-- select tablename, rowsecurity from pg_tables
--  where tablename in ('gestionnaires','reglages_enseignant',
--                      'demandes_suppression','messages_gestion');
--  → 4 lignes, toutes à true
-- ============================================================
