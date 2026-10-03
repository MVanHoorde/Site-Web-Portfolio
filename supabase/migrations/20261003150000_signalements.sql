-- ============================================================
--  021 — « J'ai vu un bug » : les signalements des élèves
--
--  BESOIN (Loïc, 03/10/2026)
--  Un bouton dans chaque page de cours pour qu'un élève signale ce
--  qui ne marche pas, sans lever la main dix fois dans l'heure. Le
--  signalement arrive dans le tableau de bord, onglet Signalements.
--
--  ARBITRAGES DE LOÏC
--  · Élèves CONNECTÉS seulement : un formulaire ouvert à tout
--    visiteur d'un site public, c'est une boîte à spam.
--  · NOMINATIF : le signalement porte l'élève (eleve_id). Ce n'est
--    qu'un pseudonyme en base ; l'association au vrai nom ne se fait
--    que sur la tablette de l'enseignant (table des noms, en session).
--  · Il arrive aux enseignants des classes de l'élève, DANS LA
--    FAMILLE de la page (SNT, ES, outils de PC) : même cloisonnement
--    que la progression, par mon_eleve_pour() (018). Un collègue de
--    SNT ne lit pas un signalement posé dans un outil de PC.
--
--  RGPD : données minimales. Le message est écrit par l'élève — la
--  page le prévient de ne rien y mettre de personnel. L'« appareil »
--  est un résumé court (iPad · Safari), jamais l'empreinte complète
--  du navigateur. Un signalement traité peut être supprimé par
--  l'enseignant ; la suppression d'un élève emporte les siens.
--
--  Rejouable.
-- ============================================================

create table if not exists public.signalements (
  id uuid primary key default gen_random_uuid(),

  eleve_id uuid not null
    references public.eleves(id) on delete cascade,

  -- La séquence de la page (data-sequence : 'es1-t1-c1', 'snt-t2',
  -- 'pc-o7'…). C'est elle qui porte la famille, donc qui décide quel
  -- enseignant lit le signalement.
  cle text not null
    check (char_length(cle) between 2 and 60),

  -- Où : le fichier de la page et l'étape où l'élève se trouvait.
  page  text not null check (char_length(page) between 1 and 120),
  etape text          check (char_length(etape) <= 120),

  message text not null
    check (char_length(btrim(message)) between 3 and 1000),

  appareil text check (char_length(appareil) <= 120),

  traite  boolean     not null default false,
  cree_le timestamptz not null default now()
);

create index if not exists signalements_eleve_date
  on public.signalements (eleve_id, cree_le desc);

comment on table public.signalements is
  'Bugs signalés par les élèves depuis une page de cours. Lus par les enseignants de leurs classes, dans la famille de la page.';

-- ------------------------------------------------------------
--  Garde-fou : vingt signalements par élève et par jour, au plus.
--  Au-delà, c'est un jeu ou un bouton coincé — la base refuse.
-- ------------------------------------------------------------
create or replace function public.signalements_plafond()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.signalements s
       where s.eleve_id = new.eleve_id
         and s.cree_le > now() - interval '24 hours') >= 20 then
    raise exception 'PLAFOND_SIGNALEMENTS : vingt signalements par jour au plus.';
  end if;
  return new;
end;
$$;

drop trigger if exists signalements_plafond on public.signalements;
create trigger signalements_plafond
  before insert on public.signalements
  for each row execute function public.signalements_plafond();

-- ------------------------------------------------------------
--  RLS
-- ------------------------------------------------------------
alter table public.signalements enable row level security;

-- L'élève écrit SES signalements, jamais déjà traités. Il ne les
-- relit pas : rien à afficher côté page, et rien à fuiter.
drop policy if exists signalements_ecrire on public.signalements;
create policy signalements_ecrire
  on public.signalements for insert to authenticated
  with check (
    eleve_id = (select public.eleve_courant())
    and traite = false
  );

-- L'enseignant lit ceux des élèves de ses classes, dans la famille
-- de la page.
drop policy if exists signalements_lire_prof on public.signalements;
create policy signalements_lire_prof
  on public.signalements for select to authenticated
  using (
    (select public.est_enseignant())
    and public.mon_eleve_pour(eleve_id, cle)
  );

-- Il les marque traités…
drop policy if exists signalements_traiter_prof on public.signalements;
create policy signalements_traiter_prof
  on public.signalements for update to authenticated
  using (
    (select public.est_enseignant())
    and public.mon_eleve_pour(eleve_id, cle)
  )
  with check (
    (select public.est_enseignant())
    and public.mon_eleve_pour(eleve_id, cle)
  );

-- …et peut les supprimer.
drop policy if exists signalements_supprimer_prof on public.signalements;
create policy signalements_supprimer_prof
  on public.signalements for delete to authenticated
  using (
    (select public.est_enseignant())
    and public.mon_eleve_pour(eleve_id, cle)
  );

revoke all on table public.signalements from anon, authenticated;
grant insert (eleve_id, cle, page, etape, message, appareil)
  on table public.signalements to authenticated;
grant select, delete on table public.signalements to authenticated;
-- seule la colonne « traite » se modifie
grant update (traite) on table public.signalements to authenticated;

revoke all on function public.signalements_plafond() from public, anon, authenticated;

-- ============================================================
--  Vérification
--
-- select c.relname, c.relrowsecurity, count(p.polname)
-- from pg_class c
-- join pg_namespace n on n.oid = c.relnamespace
-- left join pg_policy p on p.polrelid = c.oid
-- where n.nspname='public' and c.relname='signalements'
-- group by c.relname, c.relrowsecurity;
--  → 1 ligne, rls = true, 4 policies
-- ============================================================
