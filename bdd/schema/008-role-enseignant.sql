-- ============================================================
--  008 — Le rôle enseignant (lot 1 : reconnaître, et LIRE)
--
--  Jusqu'ici la base ne connaissait qu'une sorte d'humain :
--  l'élève. Le seul accès « professeur » passait par la clé
--  service_role, qui ignore la RLS — parfaite pour un worker qui
--  tourne sur ton PC, impossible à mettre dans une page web.
--
--  Ce fichier ouvre la deuxième porte : un VRAI compte, soumis à
--  la RLS comme les autres, à qui les règles donnent le droit de
--  lire les copies. C'est ce qui rendra possible un tableau de
--  bord sur iPad servi par GitHub Pages, sans jamais y déposer
--  de secret.
--
--  ⚠ CE FICHIER NE FAIT QUE LIRE. Aucune écriture, aucun passage
--     en_attente → corrige : ça, c'est le lot 2 (les fonctions
--     valider_copie / signaler_copie). Séparer les deux permet de
--     poser les fondations sans risque de toucher une copie.
--
--  À NE PAS exécuter dans l'éditeur SQL du tableau de bord :
--  depuis le 22/07, toute modification de structure passe par une
--  migration (voir bdd/README.md). Marche à suivre en tête du
--  fichier de livraison.
--
--  Rejouable : chaque objet est supprimé puis recréé.
-- ============================================================


-- ------------------------------------------------------------
--  1. enseignants — la liste des adultes
--
--  Une ligne = un compte professeur. Décision du 27/07/2026 :
--  PAS de table de rattachement aux classes. Loïc est seul maître
--  à bord ; un enseignant inscrit ici voit tout. Le jour où la SNT
--  se partage, on ajoutera un 00X-enseignant-classes.sql et on
--  resserrera les policies — pas avant.
--
--  auth_id est la CLÉ PRIMAIRE, pas une colonne parmi d'autres :
--  un compte, une ligne, pas de doublon possible.
--
--  on delete cascade : si le compte disparaît de auth.users, la
--  ligne part avec lui. Aucune copie d'élève n'est concernée
--  (reponses_libres ne pointe pas vers cette table).
-- ------------------------------------------------------------
create table if not exists public.enseignants (
  auth_id uuid primary key
    references auth.users(id) on delete cascade,

  -- Le nom affiché en tête du tableau de bord. C'est le SEUL
  -- endroit de la base où figure un nom d'humain — celui d'un
  -- adulte, qui l'y met lui-même. Les élèves restent pseudonymes.
  libelle text not null
    check (char_length(libelle) between 2 and 60),

  cree_le timestamptz not null default now()
);

comment on table public.enseignants is
  'Comptes professeurs. Un compte inscrit ici lit toutes les copies.';

alter table public.enseignants enable row level security;


-- ------------------------------------------------------------
--  2. est_enseignant() — le miroir de eleve_courant()
--
--  Même construction que la fonction du fichier 006, et pour les
--  mêmes raisons :
--
--   · security definer  — la fonction lit  enseignants  avec les
--     droits de son propriétaire, donc sans repasser par la RLS de
--     enseignants. Sans ça : une policy de enseignants qui lit
--     enseignants qui lit enseignants… (récursion infinie).
--
--   · set search_path = ''  — la fonction ne peut résoudre aucun
--     nom de table implicitement. Réflexe obligatoire sur TOUTE
--     fonction security definer : sans lui, quelqu'un capable de
--     créer un schéma pourrait faire pointer « enseignants » vers
--     SA table et se déclarer professeur.
--
--   · stable  — pour une même requête, la réponse ne change pas.
--     PostgreSQL l'appelle une fois, pas une fois par copie
--     examinée. Sur une file de 300 copies, ce n'est pas un détail.
--
--  Renvoie un booléen et non un identifiant : ici il n'y a rien à
--  filtrer, seulement une porte à ouvrir ou non.
-- ------------------------------------------------------------
create or replace function public.est_enseignant()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.enseignants e
    where e.auth_id = (select auth.uid())
  )
$$;

comment on function public.est_enseignant is
  'Vrai si la session en cours appartient à un professeur inscrit. Utilisée par les policies.';


-- ------------------------------------------------------------
--  3. enseignants — je me vois, moi
--
--  Le tableau de bord doit pouvoir demander « suis-je professeur,
--  et sous quel nom ? » pour s'afficher. Il ne doit pas pouvoir
--  lister les autres.
--
--  Pas de policy INSERT / UPDATE / DELETE : on ne se déclare pas
--  professeur depuis un navigateur. L'inscription se fait une
--  fois, à la main, en SQL (voir la note de livraison). C'est
--  volontairement inconfortable : c'est la promotion la plus
--  sensible de toute la base.
-- ------------------------------------------------------------
drop policy if exists enseignants_me_lire on public.enseignants;
create policy enseignants_me_lire
  on public.enseignants for select to authenticated
  using (auth_id = (select auth.uid()));


-- ------------------------------------------------------------
--  4. Les trois lectures du tableau de bord
--
--  Une policy s'AJOUTE à celles qui existent : les règles d'une
--  même table se combinent en « OU ». Ajouter une lecture
--  professeur ne retire donc rien à l'élève, et n'ouvre rien à
--  l'élève non plus — pour lui, est_enseignant() vaut faux, et
--  la règle ne rend aucune ligne.
--
--  Trois tables suffisent au lot 1 :
--   · reponses_libres  — les copies (avec correction_ia et son
--                        bloc tri.a_verifier)
--   · eleves           — le pseudo en face de la copie
--   · classes          — le libellé « 2nde — SNT groupe A »
--
--  Volontairement PAS ouvertes ici :
--   · progression / evenements  — le suivi d'avancement viendra
--     avec l'écran de suivi, pas avec l'écran de correction
--   · reponses_versions         — relire les brouillons est une
--     fonctionnalité en soi, à décider
--   · sauvegardes               — journal d'exploitation, il se
--     consulte au tableau de bord Supabase
--  Chacune se rouvre en trois lignes le jour où elle sert.
-- ------------------------------------------------------------
drop policy if exists reponses_lire_prof on public.reponses_libres;
create policy reponses_lire_prof
  on public.reponses_libres for select to authenticated
  using ((select public.est_enseignant()));

drop policy if exists eleves_lire_prof on public.eleves;
create policy eleves_lire_prof
  on public.eleves for select to authenticated
  using ((select public.est_enseignant()));

drop policy if exists classes_lire_prof on public.classes;
create policy classes_lire_prof
  on public.classes for select to authenticated
  using ((select public.est_enseignant()));

-- ⚠ Note sur  classes  : cette table était FERMÉE à tout le monde,
--    exprès — la lire, c'est lire tous les codes d'inscription.
--    Elle s'ouvre ici au seul professeur, qui est précisément la
--    personne qui distribue ces codes. L'élève, lui, continue de
--    passer par rejoindre_classe() sans jamais voir la table.


-- ------------------------------------------------------------
--  5. Droit d'appel de la fonction
--
--  Rappel du fichier 006 : GRANT dit « as-tu le droit de toucher
--  à cet objet », RLS dit « quelles lignes ». Une fonction n'a pas
--  de lignes, seul le GRANT la concerne.
--
--  Réservée à  authenticated  : un visiteur non connecté n'a
--  aucune raison de demander s'il est professeur.
-- ------------------------------------------------------------
revoke all on function public.est_enseignant() from public, anon, authenticated;
grant execute on function public.est_enseignant() to authenticated;


-- ============================================================
--  6. Vérification — à lancer juste après, dans l'éditeur SQL
--     (consulter reste permis ; c'est modifier qui passe par la CLI)
--
--  Attendu après 008 :
--   · enseignants      → 1 policy,  rls_active = true
--   · classes          → 1  (elle en avait 0)
--   · eleves           → 2  (elle en avait 1)
--   · reponses_libres  → 4  (elle en avait 3)
--   · progression      → 3, evenements → 2, reponses_versions → 1
--   · sauvegardes      → 0 (fermée, c'est voulu)
-- ============================================================
-- select
--   c.relname        as table_,
--   c.relrowsecurity as rls_active,
--   count(p.polname) as nb_policies
-- from pg_class c
-- join pg_namespace n on n.oid = c.relnamespace
-- left join pg_policy p on p.polrelid = c.oid
-- where n.nspname = 'public' and c.relkind = 'r'
-- group by c.relname, c.relrowsecurity
-- order by c.relname;
