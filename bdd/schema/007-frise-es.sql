-- ============================================================
--  007-frise-es.sql — la frise « Terminale ES » sur Supabase
--
--  DÉCISION du 23/07/2026 : la frise ES ne se dote PAS de son propre
--  serveur. Elle vit dans la même base que la SNT.
--
--  Motif. `serveur-frise/` demandait encore : un hébergement (son README
--  envisageait d'exposer le PC personnel sur Internet), une
--  authentification enseignante, HTTPS, une purge de fin d'année, des
--  sauvegardes, un registre de traitement. Supabase fournit les six.
--  Deux backends pour la même finalité — stocker des copies
--  pseudonymisées, les faire pré-corriger localement, jamais de note —
--  c'était deux fois le travail et deux fois le dossier RGPD.
--
--  ⚠ PROPOSITION À VALIDER. Le modèle ci-dessous est déduit du contrat
--  d'interface de `serveur-frise/README.md` et de l'export CSV de
--  `pages/term-es-s01-frise.html` (colonnes : code, sujet, trouvaille,
--  date, acte, placement, source1, source2, titre proposé, retenu,
--  jetons, texte). Le fond appartient à Loïc : à relire avant exécution.
--
--  Rien n'est exécuté par ce fichier tant que la migration jumelle
--  n'est pas poussée (voir bdd/README.md, « deux dossiers, deux rôles »).
-- ============================================================


-- ------------------------------------------------------------
--  1. eleves_es — les codes de la frise
--
--  La frise n'utilise PAS les comptes identifiant + mot de passe de la
--  SNT : ses élèves sont des Terminales, sur une séquence courte, et le
--  dispositif est pensé depuis le début autour d'un CODE pseudonyme
--  (« E-07 ») distribué en classe. On garde ce choix : il est plus léger
--  et il a déjà été présenté aux élèves.
--
--  🔴 La table code↔nom vit sur le PC de Loïc. Jamais ici.
-- ------------------------------------------------------------
create table if not exists public.eleves_es (
  id            uuid primary key default gen_random_uuid(),
  compte        uuid unique references auth.users(id) on delete cascade,
  code          text not null,                    -- 'E-07'
  classe        text not null,                    -- 'TES1'
  annee_scolaire text not null default '2026-2027',
  cree_le       timestamptz not null default now(),
  unique (code, classe, annee_scolaire),
  constraint eleves_es_code_forme check (code ~ '^[A-Z]-[0-9]{2}$')
);

comment on table public.eleves_es is
  'Élèves de la frise ES, identifiés par un code pseudonyme. Aucun nom réel.';


-- ------------------------------------------------------------
--  2. contributions — ce que l'élève dépose
--
--  Un élève, un sujet, une contribution. Comme pour reponses_libres :
--  une seule ligne courante par (élève, sujet), et le déclencheur
--  d'archivage garde l'historique.
--
--  AUCUNE COLONNE DE NOTE, ici ni ailleurs. C'est une contrainte de
--  conformité (AI Act art. 6(3) : la pré-correction est une tâche
--  préparatoire), pas une préférence.
-- ------------------------------------------------------------
create table if not exists public.contributions (
  id           uuid primary key default gen_random_uuid(),
  eleve_es_id  uuid not null references public.eleves_es(id) on delete cascade,

  sujet        text not null,          -- l'entrée de frise attribuée
  trouvaille   text,                   -- ce que l'élève a trouvé
  date_evenement text,                 -- la date qu'il propose (texte : on accepte « vers 1850 »)
  acte         text,                   -- l'acte de la frise
  placement    integer,                -- position proposée

  source1      text,
  source2      text,
  titre_propose text,

  texte        text,                   -- la rédaction libre, pré-corrigée par ia-snt/
  statut       text not null default 'en_attente'
                 check (statut in ('en_attente','en_cours','corrige','signale')),
  correction_ia    jsonb,              -- écrit par le worker ; jamais de note
  commentaire_prof text,               -- prime sur le message IA côté élève

  retenu       boolean not null default false,   -- titre retenu par la classe (geste enseignant)
  jetons       integer not null default 0,       -- économie de la séquence

  version      integer not null default 1,
  envoye_le    timestamptz not null default now(),
  corrige_le   timestamptz,

  unique (eleve_es_id, sujet)
);

create index if not exists contributions_a_corriger
  on public.contributions (envoye_le)
  where statut = 'en_attente';

comment on table public.contributions is
  'Dépôts de la frise ES. Aucune note, nulle part : la notation appartient à l''enseignant.';


-- ------------------------------------------------------------
--  3. tirages — qui a quel sujet
--
--  Le tirage « 2 → 1 » : on propose deux sujets, l'élève en garde un.
--  On journalise les deux, pour pouvoir rejouer un tirage contesté.
-- ------------------------------------------------------------
create table if not exists public.tirages (
  id           uuid primary key default gen_random_uuid(),
  eleve_es_id  uuid not null references public.eleves_es(id) on delete cascade,
  propose_1    text not null,
  propose_2    text not null,
  choisi       text,
  tire_le      timestamptz not null default now(),
  unique (eleve_es_id)
);

comment on table public.tirages is
  'Attribution des sujets de frise. Les deux propositions sont conservées.';


-- ------------------------------------------------------------
--  4. Sources bannies — en base plutôt qu'en dur dans la page
--
--  La liste vit aujourd'hui dans `SOURCES_BANNIES` de la page. La mettre
--  ici permet de la corriger sans redéployer, et de la partager avec la
--  SNT le jour où l'esprit critique y passera aussi.
-- ------------------------------------------------------------
create table if not exists public.sources_bannies (
  motif       text primary key,        -- fragment d'URL ou de domaine
  raison      text not null,
  ajoute_le   timestamptz not null default now()
);


-- ------------------------------------------------------------
--  5. Archivage des versions — même déclencheur que la SNT
-- ------------------------------------------------------------
create table if not exists public.contributions_versions (
  id             uuid primary key default gen_random_uuid(),
  contribution_id uuid not null,
  eleve_es_id    uuid not null,
  sujet          text not null,
  version        integer not null,
  texte          text,
  statut         text,
  correction_ia  jsonb,
  commentaire_prof text,
  envoye_le      timestamptz,
  archive_le     timestamptz not null default now()
);

create or replace function public.archive_version_contribution()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.texte is distinct from old.texte then
    insert into public.contributions_versions (
      contribution_id, eleve_es_id, sujet, version,
      texte, statut, correction_ia, commentaire_prof, envoye_le
    ) values (
      old.id, old.eleve_es_id, old.sujet, old.version,
      old.texte, old.statut, old.correction_ia, old.commentaire_prof, old.envoye_le
    );
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

drop trigger if exists contributions_archivage on public.contributions;
create trigger contributions_archivage
  before update on public.contributions
  for each row execute function public.archive_version_contribution();


-- ------------------------------------------------------------
--  6. RLS — décalque exact des règles SNT (fichier 006)
--
--  L'élève lit et écrit SA ligne, et ne peut ni se déclarer corrigé ni
--  se donner des jetons. `retenu` et `jetons` sont des gestes
--  enseignants : ils passent par la clé service_role, depuis le PC.
-- ------------------------------------------------------------
alter table public.eleves_es             enable row level security;
alter table public.contributions         enable row level security;
alter table public.tirages               enable row level security;
alter table public.contributions_versions enable row level security;
alter table public.sources_bannies       enable row level security;

create or replace function public.eleve_es_courant()
returns uuid
language sql stable security definer
set search_path = public
as $$ select id from public.eleves_es where compte = auth.uid() $$;

drop policy if exists eleves_es_lire on public.eleves_es;
create policy eleves_es_lire
  on public.eleves_es for select to authenticated
  using (compte = auth.uid());

drop policy if exists contributions_lire on public.contributions;
create policy contributions_lire
  on public.contributions for select to authenticated
  using (eleve_es_id = (select public.eleve_es_courant()));

drop policy if exists contributions_deposer on public.contributions;
create policy contributions_deposer
  on public.contributions for insert to authenticated
  with check (
    eleve_es_id = (select public.eleve_es_courant())
    and statut = 'en_attente'
    and correction_ia is null
    and commentaire_prof is null
    and retenu = false
    and jetons = 0
  );

drop policy if exists contributions_reecrire on public.contributions;
create policy contributions_reecrire
  on public.contributions for update to authenticated
  using (eleve_es_id = (select public.eleve_es_courant()))
  with check (
    eleve_es_id = (select public.eleve_es_courant())
    and statut = 'en_attente'
    and correction_ia is null
    and commentaire_prof is null
  );

drop policy if exists tirages_lire on public.tirages;
create policy tirages_lire
  on public.tirages for select to authenticated
  using (eleve_es_id = (select public.eleve_es_courant()));

drop policy if exists tirages_poser on public.tirages;
create policy tirages_poser
  on public.tirages for insert to authenticated
  with check (eleve_es_id = (select public.eleve_es_courant()));

drop policy if exists versions_es_lire on public.contributions_versions;
create policy versions_es_lire
  on public.contributions_versions for select to authenticated
  using (eleve_es_id = (select public.eleve_es_courant()));

-- La liste des sources bannies est publique : elle sert à afficher un
-- avertissement dans la page, elle ne révèle rien sur personne.
drop policy if exists sources_bannies_lire on public.sources_bannies;
create policy sources_bannies_lire
  on public.sources_bannies for select to authenticated
  using (true);


-- ------------------------------------------------------------
--  7. 🚧 Reste à faire (hors SQL)
--
--  - Ajouter à assets/js/progression.js : rejoindreFriseES(code, classe),
--    mesTirages(), deposerContribution(), maContribution().
--  - Renseigner URL_SERVEUR = "" définitivement dans
--    pages/term-es-s01-frise.html et remplacer l'objet API par
--    Progression.* (aujourd'hui il retombe sur localStorage).
--  - Déplacer ia-correction/criteres-frise.json dans ia-snt/ : le moteur
--    est le même, seule la grille change.
--  - Purge de fin d'année : une fonction SQL, appelée à la main.
-- ------------------------------------------------------------
