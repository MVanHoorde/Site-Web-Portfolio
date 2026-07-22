-- ============================================================
--  003 — Les cinq tables restantes
--  eleves · progression · evenements · reponses_libres · sauvegardes
--
--  À exécuter EN UNE FOIS, après 001 et 002.
--  L'ordre des tables compte : chacune référence les précédentes.
-- ============================================================


-- ------------------------------------------------------------
--  eleves — un élève, sans identité civile
--
--  Aucun nom, aucun prénom, aucun email : seulement un pseudonyme
--  et un rattachement de classe. C'est le cœur du choix RGPD.
-- ------------------------------------------------------------
create table if not exists public.eleves (
  id uuid primary key default gen_random_uuid(),

  -- Lien vers le compte élève (identifiant + mot de passe) créé par Supabase Auth.
  -- auth.users est une table SYSTÈME gérée par Supabase : on ne
  -- l'écrit jamais soi-même, on s'y raccroche.
  -- on delete cascade : si la session est supprimée, la fiche part avec.
  auth_id uuid not null unique
    references auth.users(id) on delete cascade,

  -- Le pseudonyme choisi par l'élève.
  pseudo text not null
    check (char_length(pseudo) between 2 and 24),

  -- on delete restrict : on REFUSE de supprimer une classe qui a
  -- encore des élèves. Garde-fou contre l'effacement accidentel.
  classe_id uuid not null
    references public.classes(id) on delete restrict,

  cree_le timestamptz not null default now(),
  vu_le   timestamptz not null default now()
);

-- Unicité du pseudo DANS UNE CLASSE, insensible à la casse :
-- "Dracaufeu" et "dracaufeu" sont le même pseudo. Deux classes
-- différentes peuvent en revanche avoir chacune leur "Dracaufeu".
create unique index if not exists eleves_pseudo_par_classe
  on public.eleves (classe_id, lower(pseudo));

comment on table public.eleves is
  'Élèves, identifiés par pseudonyme uniquement. Aucune donnée nominative.';


-- ------------------------------------------------------------
--  progression — l'ÉTAT COURANT
--
--  Une ligne = « pour cet élève, dans ce domaine, sous cette clé,
--  voici où il en est aujourd'hui ». On écrase, on ne cumule pas.
--  L'historique, lui, est dans  evenements.
-- ------------------------------------------------------------
create table if not exists public.progression (
  id uuid primary key default gen_random_uuid(),

  eleve_id uuid not null
    references public.eleves(id) on delete cascade,

  -- Espace de nommage. La liste est volontairement FERMÉE :
  -- ajouter un domaine sera un acte conscient (un alter table),
  -- pas une faute de frappe qui crée silencieusement une catégorie.
  domaine text not null
    check (domaine in ('cours', 'deverrouillage', 'rpg', 'profil')),

  -- L'identifiant de la chose suivie : 'snt-t2', 'WEB-3a',
  -- '2nde-pc-t1-c2', 'avatar'…
  cle text not null
    check (char_length(cle) between 1 and 80),

  -- jsonb = un objet JSON, interrogeable et indexable par PostgreSQL.
  -- C'est ce qui permet d'enrichir la progression toute l'année
  -- SANS modifier la structure de la table.
  -- Règle d'or côté JS : TOUJOURS lire avec une valeur par défaut
  --   const xp = etat.xp ?? 0;
  -- Discipline : on AJOUTE des champs, on n'en renomme jamais,
  -- on n'en supprime jamais. Champ "v" = version du format.
  valeur jsonb not null default '{"v": 1}'::jsonb,

  maj_le timestamptz not null default now(),

  -- Un seul état courant par (élève, domaine, clé).
  -- Cette contrainte est aussi ce qui rend possible le « upsert » :
  --   insert … on conflict (eleve_id, domaine, cle) do update …
  unique (eleve_id, domaine, cle)
);

-- Pas d'index supplémentaire sur eleve_id : la contrainte unique
-- ci-dessus crée déjà un index dont eleve_id est la PREMIÈRE colonne,
-- et PostgreSQL sait s'en servir pour « toute la progression d'un élève ».
-- Un index de plus serait du poids mort à l'écriture.

comment on table public.progression is
  'État courant de chaque élève. L''historique est dans evenements.';


-- ------------------------------------------------------------
--  evenements — l'HISTORIQUE, en ajout seul
--
--  On n'efface JAMAIS une ligne d'ici. Logique comptable :
--  une erreur se corrige par un événement compensatoire, pas par
--  une gomme. C'est ce journal qui permettra de déclencher les
--  quêtes du RPG et de rejouer une progression à une date donnée.
-- ------------------------------------------------------------
create table if not exists public.evenements (
  -- Exception assumée à la règle « uuid partout » : ici l'ordre
  -- CHRONOLOGIQUE et MONOTONE est une fonctionnalité (rejouer le
  -- journal dans l'ordre). Un entier croissant le donne gratuitement.
  -- Le risque « id devinable » est nul : la RLS filtrera par élève.
  id bigint generated always as identity primary key,

  eleve_id uuid not null
    references public.eleves(id) on delete cascade,

  -- 'etape_validee', 'reponse_envoyee', 'xp_gagne', 'objet_obtenu'…
  -- Liste volontairement OUVERTE ici : le RPG en inventera, et on ne
  -- veut pas une migration à chaque nouvelle quête.
  type text not null
    check (char_length(type) between 1 and 60),

  charge jsonb not null default '{"v": 1}'::jsonb,

  horodatage timestamptz not null default now(),

  -- Année scolaire. Nouvelle année = nouvelle saison ; l'ancienne
  -- reste consultable sans polluer les compteurs en cours.
  saison text not null default '2026-2027'
);

-- Requête chaude n°1 : « les derniers événements de cet élève ».
create index if not exists evenements_eleve_temps
  on public.evenements (eleve_id, horodatage desc);

-- Requête chaude n°2 : « tout ce qui s'est passé cette saison ».
create index if not exists evenements_saison
  on public.evenements (saison, horodatage desc);

comment on table public.evenements is
  'Journal en AJOUT SEUL. Ne jamais supprimer : compenser.';


-- ------------------------------------------------------------
--  reponses_libres — les copies de texte libre
--
--  Écrites par l'élève, relues par l'IA (worker), arbitrées par le
--  professeur. C'est la table du pilote.
-- ------------------------------------------------------------
create table if not exists public.reponses_libres (
  id uuid primary key default gen_random_uuid(),

  eleve_id uuid not null
    references public.eleves(id) on delete cascade,

  -- Code d'activité du hub : 'WEB-2b', 'SOC-3a', 'SYS-1c'…
  -- (le point médian des consignes est remplacé par un tiret :
  --  plus sûr dans une URL et dans un nom de fichier)
  code_activite text not null
    check (char_length(code_activite) between 3 and 20),

  -- Limite de 2000 caractères : garde-fou de modération ET de coût
  -- (la facturation de l'IA se fait au jeton, entrée comprise).
  texte text not null
    check (char_length(texte) between 1 and 2000),

  -- Cycle de vie d'une copie.
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'en_cours', 'corrige', 'signale')),

  -- Ce que le worker a produit : note, points forts, pistes.
  -- jsonb pour pouvoir enrichir sans migration.
  correction_ia jsonb,

  -- Le mot du professeur, qui prime toujours sur l'IA.
  commentaire_prof text,

  envoye_le  timestamptz not null default now(),
  corrige_le timestamptz,

  -- Une seule copie courante par (élève, activité) : renvoyer une
  -- réponse MET À JOUR la précédente au lieu d'en empiler une autre.
  unique (eleve_id, code_activite)
);

-- INDEX PARTIEL : il n'indexe QUE les lignes en attente. C'est
-- exactement, et uniquement, la question que pose le worker toutes
-- les N minutes (« qu'y a-t-il à corriger ? »). Un index minuscule,
-- qui reste minuscule même avec 10 000 copies corrigées derrière.
create index if not exists reponses_a_corriger
  on public.reponses_libres (envoye_le)
  where statut = 'en_attente';

comment on table public.reponses_libres is
  'Copies de texte libre. Le worker lit les en_attente et repose son résultat.';


-- ------------------------------------------------------------
--  sauvegardes — le JOURNAL des sauvegardes
--
--  ⚠ Cette table ne contient PAS les sauvegardes : elle contient la
--  trace de leur exécution. Le fichier de dump, lui, vit sur le
--  disque de Loïc. C'est le script .bat du jalon 4 qui insère ici
--  une ligne à chaque passage réussi.
--  Utilité réelle : répondre à « à quand remonte ma dernière
--  sauvegarde ? » sans fouiller un dossier.
-- ------------------------------------------------------------
create table if not exists public.sauvegardes (
  id bigint generated always as identity primary key,
  libelle text not null,
  motif   text,
  fichier text,
  octets  bigint,
  faite_le timestamptz not null default now()
);

comment on table public.sauvegardes is
  'Journal des exports. Le dump lui-même vit hors de la base.';


-- ------------------------------------------------------------
--  Un déclencheur pour tenir  progression.maj_le  à jour
--
--  Un TRIGGER est un bout de code que la base exécute d'elle-même
--  quand un événement survient. Ici : « avant chaque mise à jour
--  d'une ligne de progression, remets maj_le à l'heure du serveur ».
--  Pourquoi côté base : parce qu'un client JS peut oublier de le
--  faire, ou mentir. La base, elle, n'oublie pas.
-- ------------------------------------------------------------
create or replace function public.touche_maj_le()
returns trigger
language plpgsql
as $$
begin
  new.maj_le = now();
  return new;
end;
$$;

drop trigger if exists progression_maj_le on public.progression;
create trigger progression_maj_le
  before update on public.progression
  for each row execute function public.touche_maj_le();


-- ------------------------------------------------------------
--  Filet : RLS explicite sur les cinq tables.
--  Redondant avec « Enable automatic RLS », volontairement gardé.
--  Aucune policy n'est posée ici : les tables sont donc FERMÉES.
--  C'est voulu — l'ouverture se fait au jalon 5, table par table.
-- ------------------------------------------------------------
alter table public.eleves          enable row level security;
alter table public.progression     enable row level security;
alter table public.evenements      enable row level security;
alter table public.reponses_libres enable row level security;
alter table public.sauvegardes     enable row level security;
