-- ============================================================
--  005 — Historique des versions de copies
--
--  Motif (décision Loïc du 20/07/2026) : une copie de texte libre
--  n'est pas un résultat, c'est un TRAVAIL. L'élève doit pouvoir
--  relire ses versions précédentes, et le professeur doit pouvoir
--  voir « tu en es à ta troisième rédaction » en passant derrière.
--
--  Principe retenu : reponses_libres garde l'état COURANT (une
--  ligne par élève et par activité — le worker n'a qu'une chose à
--  regarder) ; chaque version remplacée est archivée automatiquement
--  dans reponses_versions par un déclencheur.
--
--  Conséquence importante : l'archivage ne dépend PAS du navigateur.
--  Même si le JS de la page est bogué, ou si la copie est modifiée
--  depuis l'éditeur SQL, la version précédente est conservée.
-- ============================================================


-- ------------------------------------------------------------
--  1. Un compteur de version sur la copie courante
-- ------------------------------------------------------------
alter table public.reponses_libres
  add column if not exists version integer not null default 1
    check (version >= 1);

comment on column public.reponses_libres.version is
  'Numéro de la rédaction en cours. 1 = premier jet. Incrémenté automatiquement par le déclencheur d''archivage.';


-- ------------------------------------------------------------
--  2. La table d'archive
--
--  eleve_id et code_activite y sont RECOPIÉS alors qu'ils sont déjà
--  déductibles de reponse_id. C'est une dénormalisation assumée :
--  elle permet d'écrire une règle RLS simple (« mes versions ») et
--  d'interroger l'historique sans jointure. Le coût est nul, ces
--  colonnes ne changent jamais.
-- ------------------------------------------------------------
create table if not exists public.reponses_versions (
  id bigint generated always as identity primary key,

  reponse_id uuid not null
    references public.reponses_libres(id) on delete cascade,

  eleve_id uuid not null
    references public.eleves(id) on delete cascade,

  code_activite text not null,

  -- Numéro de cette version archivée (1 = le premier jet).
  version integer not null check (version >= 1),

  texte text not null,

  -- Statut, correction IA et mot du professeur AU MOMENT du
  -- remplacement : on archive le travail ET son retour, sinon
  -- relire une ancienne version n'apprend rien à l'élève.
  statut text not null,
  correction_ia jsonb,
  commentaire_prof text,

  envoye_le  timestamptz not null,
  archive_le timestamptz not null default now(),

  unique (reponse_id, version)
);

-- Requête chaude : « toutes mes versions de cette activité, dans l'ordre ».
create index if not exists versions_par_eleve_activite
  on public.reponses_versions (eleve_id, code_activite, version);

comment on table public.reponses_versions is
  'Archive des rédactions remplacées. Ajout seul : ne jamais supprimer.';

alter table public.reponses_versions enable row level security;


-- ------------------------------------------------------------
--  3. Le déclencheur d'archivage
--
--  Il ne se déclenche QUE si le TEXTE change. C'est la subtilité
--  qui fait tout marcher : le worker, lui, met à jour statut et
--  correction_ia sans toucher au texte — il ne doit donc PAS créer
--  de nouvelle version. Sans cette condition, chaque passage de
--  l'IA archiverait une copie identique.
--
--  « is distinct from » plutôt que « <> » : compare correctement
--  même si l'une des valeurs est NULL.
-- ------------------------------------------------------------
create or replace function public.archive_version_reponse()
returns trigger
language plpgsql
as $$
begin
  if new.texte is distinct from old.texte then

    -- a) on range l'ANCIENNE version dans l'archive
    insert into public.reponses_versions (
      reponse_id, eleve_id, code_activite, version,
      texte, statut, correction_ia, commentaire_prof, envoye_le
    ) values (
      old.id, old.eleve_id, old.code_activite, old.version,
      old.texte, old.statut, old.correction_ia, old.commentaire_prof,
      old.envoye_le
    );

    -- b) la nouvelle rédaction repart proprement à zéro
    new.version          = old.version + 1;
    new.statut           = 'en_attente';
    new.correction_ia    = null;
    new.commentaire_prof = null;
    new.envoye_le        = now();
    new.corrige_le       = null;

  end if;
  return new;
end;
$$;

drop trigger if exists reponses_archivage on public.reponses_libres;
create trigger reponses_archivage
  before update on public.reponses_libres
  for each row execute function public.archive_version_reponse();


-- ------------------------------------------------------------
--  4. Une vue de confort : le fil complet d'une activité
--
--  Une VUE est une requête enregistrée sous un nom : elle ne
--  stocke rien, elle se recalcule à chaque appel. Celle-ci réunit
--  les versions archivées ET la version courante dans une seule
--  liste ordonnée — c'est exactement ce qu'affichera le bouton
--  « voir mes versions » du site, sans logique compliquée en JS.
--
--  ⚠ PIÈGE DE SÉCURITÉ, à connaître : par défaut, une vue
--  PostgreSQL s'exécute avec les droits de son PROPRIÉTAIRE, pas
--  de celui qui l'interroge — elle CONTOURNE donc la RLS des
--  tables qu'elle lit. Une vue naïve ici exposerait les copies de
--  toute la classe. L'option « security_invoker » inverse ce
--  comportement : la vue s'exécute avec les droits de l'appelant,
--  et la RLS s'applique normalement.
-- ------------------------------------------------------------
create or replace view public.v_reponses_fil
  with (security_invoker = true) as
  select
    eleve_id, code_activite, version, texte, statut,
    correction_ia, commentaire_prof, envoye_le,
    false as courante
  from public.reponses_versions
union all
  select
    eleve_id, code_activite, version, texte, statut,
    correction_ia, commentaire_prof, envoye_le,
    true as courante
  from public.reponses_libres;

comment on view public.v_reponses_fil is
  'Toutes les rédactions d''un élève (archivées + courante), ordonnables par version.';
