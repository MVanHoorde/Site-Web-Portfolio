-- ============================================================
--  024 — Gérer un compte élève depuis la tablette, et corriger
--        en rafale avec les réponses types
--
--  BESOIN (Loïc, 04/10/2026)
--  1. Depuis la fiche d'un élève, sans passer par la CLI :
--     réinitialiser son mot de passe (élève qui l'a perdu),
--     supprimer un compte abandonné (élève qui en a recréé un),
--     noter une information particulière.
--  2. Une réponse type porte sa décision : la toucher valide la
--     copie, ou la renvoie à refaire, d'un seul geste.
--
--  ARBITRAGES DE LOÏC
--  · Le mot de passe provisoire est GÉNÉRÉ par la base, facile à
--    dicter (« Cactus-4827 ») et conforme à la politique du projet
--    (minuscule, majuscule, chiffre, 6 caractères au moins).
--  · La note est en base, visible de l'enseignant qui l'écrit et
--    de lui seul — pas des collègues qui ont le même élève.
--  · Les réponses types existantes sont classées une fois (hors de
--    ce fichier : c'est une donnée, pas une structure), puis
--    relues par Loïc. Toucher la pastille inverse la décision.
--
--  🔴 SUPPRIMER UN COMPTE DÉBORDE DE MES CLASSES. Un élève peut être
--  inscrit chez une collègue (018 : un compte, plusieurs classes).
--  Supprimer son compte effacerait aussi son travail chez elle. La
--  fonction REFUSE donc dès qu'une des classes de l'élève a un autre
--  enseignant que moi. Réinitialiser le mot de passe, en revanche,
--  rend service à tous : il suffit que l'élève soit un des miens.
--
--  RGPD : la note est une donnée personnelle (rattachée à un
--  pseudonyme). Courte (200 caractères), jamais lue par l'élève ni
--  par un collègue, emportée par la suppression de l'élève. L'écran
--  rappelle de n'y rien écrire de sensible (santé, famille).
--
--  Rejouable.
-- ============================================================


-- ------------------------------------------------------------
--  1. La décision d'une réponse type
--
--  'valider' ou 'refaire'. Par défaut 'refaire' : une phrase mal
--  classée qui renvoie une copie se rattrape (l'élève la refait,
--  ou « Annuler »), une phrase mal classée qui valide passe
--  inaperçue.
-- ------------------------------------------------------------
alter table public.modeles_correction
  add column if not exists decision text not null default 'refaire';

alter table public.modeles_correction
  drop constraint if exists modeles_correction_decision_check;
alter table public.modeles_correction
  add constraint modeles_correction_decision_check
  check (decision in ('valider', 'refaire'));


-- ------------------------------------------------------------
--  2. La note de l'enseignant sur un élève
--
--  Une ligne par couple (enseignant, élève). On écrase, on ne
--  cumule pas : c'est un pense-bête, pas un dossier.
-- ------------------------------------------------------------
create table if not exists public.notes_eleves (
  auth_id uuid not null
    references public.enseignants(auth_id) on delete cascade,
  eleve_id uuid not null
    references public.eleves(id) on delete cascade,
  texte text not null
    check (char_length(btrim(texte)) between 1 and 200),
  maj_le timestamptz not null default now(),
  primary key (auth_id, eleve_id)
);

comment on table public.notes_eleves is
  'Pense-bête d''un enseignant sur un élève de ses classes. Lu par cet enseignant seul.';

alter table public.notes_eleves enable row level security;

drop policy if exists notes_eleves_les_miennes on public.notes_eleves;
create policy notes_eleves_les_miennes
  on public.notes_eleves for all to authenticated
  using (
    (select auth.uid()) = auth_id
    and (select public.est_enseignant())
  )
  with check (
    (select auth.uid()) = auth_id
    and (select public.est_enseignant())
    and public.mon_eleve(eleve_id)
  );

revoke all on table public.notes_eleves from anon, authenticated;
grant select, insert, update, delete on table public.notes_eleves to authenticated;


-- ------------------------------------------------------------
--  3. Réinitialiser le mot de passe d'un élève
--
--  Rend le mot de passe provisoire, en clair, UNE fois : la base
--  n'en garde que le hachage, comme pour tout mot de passe.
--  bcrypt par pgcrypto (schéma extensions) : c'est le format que
--  Supabase Auth relit.
-- ------------------------------------------------------------
create or replace function public.reinitialiser_mdp_eleve(p_eleve uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  mots text[] := array[
    'Cactus','Comete','Volcan','Pixel','Orage','Castor','Galaxie',
    'Puma','Rubis','Citron','Lynx','Banjo','Corail','Iceberg',
    'Robot','Hibou','Saturne','Kiwi','Tornade','Panda'
  ];
  v_auth uuid;
  v_mdp  text;
begin
  if not (select public.est_enseignant()) or not public.mon_eleve(p_eleve) then
    raise exception 'PAS_MON_ELEVE' using errcode = '42501';
  end if;

  select e.auth_id into v_auth from public.eleves e where e.id = p_eleve;
  if v_auth is null then
    raise exception 'ELEVE_INCONNU' using errcode = 'P0002';
  end if;

  v_mdp := mots[1 + floor(random() * array_length(mots, 1))::int]
        || '-' || lpad((floor(random() * 10000))::int::text, 4, '0');

  update auth.users
     set encrypted_password = extensions.crypt(v_mdp, extensions.gen_salt('bf')),
         updated_at = now()
   where id = v_auth;

  return v_mdp;
end;
$$;

comment on function public.reinitialiser_mdp_eleve is
  'Pose un mot de passe provisoire sur le compte d''un élève de mes classes et le rend en clair, une fois.';


-- ------------------------------------------------------------
--  4. Supprimer le compte d'un élève
--
--  On supprime le COMPTE (auth.users) : tout le reste suit par
--  « on delete cascade » — fiche, progression, copies et leurs
--  versions, classes, absences, signalements, notes, Boîte à
--  cartes. Refusé si une classe de l'élève a un autre enseignant.
-- ------------------------------------------------------------
create or replace function public.supprimer_eleve(p_eleve uuid)
returns void
language plpgsql
volatile
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
  ) then
    raise exception 'ELEVE_PARTAGE' using errcode = '42501';
  end if;

  select e.auth_id into v_auth from public.eleves e where e.id = p_eleve;
  delete from auth.users where id = v_auth;
end;
$$;

comment on function public.supprimer_eleve is
  'Supprime le compte d''un élève dont toutes les classes sont les miennes, et les miennes seules. Tout son travail part avec.';

revoke all on function public.reinitialiser_mdp_eleve(uuid) from public, anon;
revoke all on function public.supprimer_eleve(uuid)         from public, anon;
grant execute on function public.reinitialiser_mdp_eleve(uuid) to authenticated;
grant execute on function public.supprimer_eleve(uuid)         to authenticated;

-- ============================================================
--  Vérification
--
-- select column_name, column_default from information_schema.columns
--  where table_name = 'modeles_correction' and column_name = 'decision';
--  → 1 ligne, défaut 'refaire'
-- select count(*) from pg_policy where polrelid = 'public.notes_eleves'::regclass;
--  → 1
-- ============================================================
