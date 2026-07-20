-- ============================================================
--  001 — Table  classes
--  Exécutée le 20/07/2026.
--  Une ligne = une classe réelle (2nde 3, 2nde 5, TES1…).
--  Porte d'entrée : l'élève saisit le code de sa classe pour se
--  rattacher, sans email ni mot de passe.
--
--  ⚠ Ce fichier est conservé POUR MÉMOIRE. Ne pas le modifier :
--     les corrections vont dans 002-correctif-classes.sql.
-- ============================================================
create table if not exists public.classes (
  -- uuid : identifiant universel unique, tiré au hasard par la base.
  -- Non devinable, donc rien à deviner pour un curieux.
  id uuid primary key default gen_random_uuid(),

  -- Le code que l'élève tape. 6 caractères, unique.
  -- ⚠ ATTENTION : la contrainte "unique" ci-dessous est SENSIBLE À LA CASSE.
  --    "SNT26A" et "snt26a" seraient deux codes différents.
  --    Corrigé par 002-correctif-classes.sql.
  code text not null unique
    check (char_length(code) = 6),

  -- Le nom lisible, affiché au professeur. Jamais tapé par l'élève.
  libelle text not null,

  -- "2026-2027". Garde les classes passées sans les mélanger aux actives.
  annee_scolaire text not null,

  -- Interrupteur : passer à false ferme l'inscription sur ce code
  -- sans rien effacer.
  actif boolean not null default true,

  -- timestamptz = date + heure + fuseau. now() est évalué par le SERVEUR,
  -- pas par le navigateur de l'élève (qui peut mentir sur l'heure).
  cree_le timestamptz not null default now()
);

comment on table public.classes is
  'Classes réelles. Le code à 6 caractères est la clé d''entrée élève.';

-- Redondant depuis l'activation de « Enable automatic RLS » à la création du
-- projet, mais conservé : il documente l'intention et ne coûte rien.
alter table public.classes enable row level security;

-- Classe de démonstration, pour avoir de quoi tester.
insert into public.classes (code, libelle, annee_scolaire)
values ('SNT26A', '2nde — SNT groupe A', '2026-2027')
on conflict (code) do nothing;
