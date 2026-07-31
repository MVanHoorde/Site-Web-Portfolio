-- ============================================================
--  009 — Le suivi de classe (les trois tables du tableau de bord)
--
--  Le 008 a ouvert la porte : un compte professeur qui LIT les
--  copies. Ce fichier lui donne de quoi PILOTER — c'est-à-dire
--  répondre à la seule question qui compte en cours d'année :
--  « qui est en retard, et sur quoi ? »
--
--  POURQUOI TROIS TABLES ET PAS UNE COLONNE « retard »
--  Le retard n'est pas une donnée, c'est un calcul. Il naît de la
--  rencontre entre deux faits :
--    · ce que la classe a fait      (seances_faites)
--    · ce que l'élève a fait        (progression, déjà là)
--  et il se nuance d'un troisième :
--    · l'élève n'était pas là       (absences)
--
--  La base ne stocke donc que des FAITS. Aucune couleur, aucun
--  statut « en retard » : tout se recalcule côté page. Conséquence
--  directe et voulue : le jour où tu recules le curseur d'une
--  séance, toutes les couleurs suivent, sans migration ni script
--  de rattrapage.
--
--  CE QUE CE FICHIER NE FAIT PAS
--   · aucune écriture sur les copies (valider / signaler : lot 2
--     du rôle enseignant, à venir)
--   · rien n'est ouvert à l'élève. Il ne voit ni ses absences ni
--     l'avancement de sa classe. Le jour où un bandeau « à
--     rattraper » côté élève sera décidé, ce sera trois lignes.
--
--  RGPD — trois points, tous les trois délibérés :
--   1. Les absences sont attachées à un pseudonyme, comme tout le
--      reste. Elles ne font PAS foi : le registre officiel est
--      École Directe. Ceci est une note de travail, modifiable et
--      supprimable, sans conséquence pour l'élève.
--   2. AUCUN MOTIF d'absence. Un motif, c'est potentiellement une
--      donnée de santé ou de vie familiale — la catégorie la plus
--      sensible qui soit. La colonne n'existe pas : on ne peut donc
--      pas y céder un jour de fatigue.
--   3. La note de fin de séance est du CONTENU DE COURS. Aucun nom
--      d'élève ne doit y figurer : ce champ part en base, et y
--      écrire « Léa n'a rien fait » ferait basculer tout le
--      dispositif dans le fichier nominatif. Le rappel est répété
--      dans le commentaire de la colonne, donc visible depuis le
--      tableau de bord Supabase.
--
--  À NE PAS exécuter dans l'éditeur SQL du tableau de bord :
--  depuis le 22/07, toute modification de structure passe par une
--  migration (voir bdd/README.md).
--
--  Rejouable : chaque objet est créé « si absent », chaque policy
--  supprimée puis recréée.
-- ============================================================


-- ------------------------------------------------------------
--  1. seances_faites — le journal de ce qui a eu lieu
--
--  Une ligne = « ce groupe a fait cette séance, ce jour-là ».
--
--  DÉCISION DU 31/07/2026 : le curseur de progression n'est PAS
--  stocké. Il se déduit — c'est la séance de rang le plus élevé
--  qui possède une ligne pour cette classe. L'ordre des séances,
--  lui, est déjà connu du navigateur par assets/js/seances-snt.js,
--  lui-même généré depuis les pages. Stocker le curseur en base,
--  ce serait le dupliquer, donc s'exposer à ce qu'il mente.
--
--  La date naît au moment de la clôture : rien n'est planifié à
--  l'avance. Un planning de 120 dates saisi en août serait faux
--  dès octobre et coûterait toute l'année en corrections. Les
--  intentions vivent dans  jalons  (§3), à un grain qui survit à
--  la dérive.
--
--  Clé composite plutôt qu'un id technique : une classe ne fait
--  une séance donnée qu'une fois. La contrainte porte le sens, et
--  la reprise devient un simple  on conflict do update.
-- ------------------------------------------------------------
create table if not exists public.seances_faites (
  classe_id uuid not null
    references public.classes(id) on delete cascade,

  -- Clé de séquence, telle qu'elle est écrite dans
  -- <body data-sequence> et dans progression.cle : 'snt-t1'.
  -- Volontairement souple : les chapitres de physique-chimie
  -- viendront un jour avec leurs propres clés.
  sequence text not null
    check (char_length(sequence) between 3 and 40),

  -- Identifiant de la séance dans la page : 's1', 's2', 'deb',
  -- 'projet'… C'est l'id de la <section class="seance">, celui-là
  -- même que generer-seances.mjs recopie. Pas un numéro : les
  -- activités débranchées n'en ont pas.
  seance text not null
    check (char_length(seance) between 1 and 20),

  primary key (classe_id, sequence, seance),

  -- Le jour où la séance a eu lieu. Une date, pas un horodatage :
  -- l'heure exacte de la clôture n'apprend rien, et une date se
  -- corrige à la main sans se poser de question de fuseau.
  faite_le date not null default current_date,

  -- Comment la ligne est née. 'saisie' = posée à la main ;
  -- 'suggeree' = proposée par l'appli (qui a vu le groupe avancer)
  -- puis confirmée. Sert à mesurer, dans quelques semaines, si la
  -- suggestion automatique est assez fiable pour être élargie.
  origine text not null default 'saisie'
    check (origine in ('saisie', 'suggeree')),

  -- ⚠ CONTENU DE COURS UNIQUEMENT — jamais de nom d'élève.
  -- Ce qui a réellement été fait, dicté en fin de séance.
  note text
    check (note is null or char_length(note) <= 2000),

  -- Le travail donné pour la fois suivante.
  travail_donne text
    check (travail_donne is null or char_length(travail_donne) <= 1000),

  -- Ce qui n'a pas été terminé et qu'il faudra reprendre.
  non_termine text
    check (non_termine is null or char_length(non_termine) <= 1000),

  cree_le timestamptz not null default now(),
  maj_le  timestamptz not null default now()
);

comment on table public.seances_faites is
  'Journal des séances réellement faites, par classe. Le curseur de progression s''en déduit : c''est la séance de rang le plus élevé. Alimente aussi le cahier de textes.';

comment on column public.seances_faites.note is
  'Contenu de cours UNIQUEMENT. Aucun nom d''élève : ce champ vit en base, qui est pseudonyme par construction.';

comment on column public.seances_faites.faite_le is
  'Date réelle. Naît à la clôture de la séance ; aucune date n''est planifiée à l''avance (voir table jalons).';

alter table public.seances_faites enable row level security;

-- Réutilise le déclencheur du schéma initial : à chaque UPDATE,
-- maj_le est repositionné. C'est ce qui permettra de savoir quelle
-- entrée de cahier de textes a été retouchée, et quand.
drop trigger if exists seances_faites_maj_le on public.seances_faites;
create trigger seances_faites_maj_le
  before update on public.seances_faites
  for each row execute function public.touche_maj_le();


-- ------------------------------------------------------------
--  2. absences — la note de travail, rien de plus
--
--  Une ligne = « cet élève n'était pas là pour cette séance ».
--
--  Attachée à une SÉANCE et non à une date : c'est ce qui permet
--  de dire « il a S2 et S3 à rattraper » plutôt que « il a manqué
--  le 12 ». Le rattrapage est une notion de contenu, pas de
--  calendrier.
--
--  Pas de colonne « rattrapée ». Le rattrapage se lit déjà dans
--  progression : si les étapes de la séance sont faites, c'est
--  rattrapé. Ajouter un booléen ici, ce serait créer une seconde
--  vérité, qu'il faudrait tenir à jour à la main.
--
--  Le délai au bout duquel une séance manquée redevient un vrai
--  retard (décision du 31/07 : elle ne reste pas « à rattraper »
--  éternellement) est une CONSTANTE de la page, pas une colonne.
--  On change un chiffre dans le JS, tout se recolore.
-- ------------------------------------------------------------
create table if not exists public.absences (
  eleve_id uuid not null
    references public.eleves(id) on delete cascade,

  sequence text not null
    check (char_length(sequence) between 3 and 40),

  seance text not null
    check (char_length(seance) between 1 and 20),

  primary key (eleve_id, sequence, seance),

  signalee_le timestamptz not null default now()

  -- PAS de colonne motif, PAS de colonne justifiée. Voir l'entête
  -- du fichier : un motif d'absence peut être une donnée de santé.
  -- La justification relève de la vie scolaire, pas d'ici.
);

comment on table public.absences is
  'Note de travail du professeur : élève absent lors d''une séance, pour savoir quoi faire rattraper. NE FAIT PAS FOI — le registre officiel est celui de la vie scolaire. Aucun motif, jamais.';

alter table public.absences enable row level security;


-- ------------------------------------------------------------
--  3. jalons — les intentions, à gros grain
--
--  Une ligne = « cette classe devrait avoir fini ce thème à cette
--  date ». Une dizaine de lignes pour l'année, pas cent vingt.
--
--  POURQUOI SI PEU
--  Une progression prévisionnelle est obligatoire à la rentrée, et
--  elle dérive — d'autant plus sur un cours neuf. Une date par
--  séance serait fausse en octobre et se corrigerait toute l'année.
--  Une date par thème et par classe reste vraie beaucoup plus
--  longtemps, et donne l'écart qui sert vraiment : « il reste deux
--  séances avant la Toussaint ».
--
--  Sous-produit utile : à la fin de l'année, la comparaison entre
--  jalons et seances_faites est un bilan tout fait, exploitable en
--  conseil d'enseignement ou dans un dossier.
-- ------------------------------------------------------------
create table if not exists public.jalons (
  classe_id uuid not null
    references public.classes(id) on delete cascade,

  sequence text not null
    check (char_length(sequence) between 3 and 40),

  primary key (classe_id, sequence),

  -- La date à laquelle le thème devrait être terminé.
  date_cible date not null,

  -- Le repère parlant : 'Toussaint', 'fin de semestre'…
  -- Facultatif : sans lui la date se suffit.
  libelle text
    check (libelle is null or char_length(libelle) between 2 and 60),

  maj_le timestamptz not null default now()
);

comment on table public.jalons is
  'Progression prévisionnelle, à gros grain : une date cible par thème et par classe. Ligne directrice, pas contrat — la réalité vit dans seances_faites.';

alter table public.jalons enable row level security;

drop trigger if exists jalons_maj_le on public.jalons;
create trigger jalons_maj_le
  before update on public.jalons
  for each row execute function public.touche_maj_le();


-- ------------------------------------------------------------
--  4. progression — la lecture que le 008 avait laissée de côté
--
--  Le fichier 008 ouvrait trois tables et disait explicitement de
--  la quatrième : « le suivi d'avancement viendra avec l'écran de
--  suivi, pas avec l'écran de correction ». Nous y sommes.
--
--  C'est la table qui rend le tableau de bord possible sans rien
--  ajouter : chaque ligne (domaine 'cours', clé 'snt-t1') contient
--  déjà l'état de chaque étape ET un résumé par séance, écrits par
--  la séquence elle-même. Le f/t par séance donne les pastilles ;
--  le détail des étapes donne le dépliage.
--
--  Rappel du 008 : une policy s'AJOUTE aux autres, elles se
--  combinent en « OU ». Rien n'est retiré à l'élève, et rien ne
--  lui est ouvert non plus — pour lui, est_enseignant() est faux.
--
--  Lecture seule. Le professeur consulte l'avancement, il ne le
--  fabrique pas : c'est l'élève qui produit sa progression en
--  travaillant.
-- ------------------------------------------------------------
drop policy if exists progression_lire_prof on public.progression;
create policy progression_lire_prof
  on public.progression for select to authenticated
  using ((select public.est_enseignant()));

-- Ce GRANT existe déjà (il vient de l'état initial), mais on le
-- réaffirme : découvert en rejouant ce fichier sur une base nue,
-- où la policy seule donnait un « permission denied » incompréhensible.
-- Rappel du 006 : le GRANT dit « as-tu le droit de toucher à cette
-- table », la RLS dit « quelles lignes ». Il faut les deux, et
-- l'oubli du premier produit une erreur qui ne parle pas du second.
grant select on table public.progression to authenticated;


-- ------------------------------------------------------------
--  5. Les trois tables de pilotage — lecture ET écriture
--
--  Différence avec tout ce qui précède : ici le professeur écrit.
--  Ces tables sont les siennes ; aucune ne contient de production
--  d'élève.
--
--  « for all » couvre select, insert, update et delete en une
--  policy. Les deux clauses ne servent pas au même moment :
--   · using       — filtre les lignes EXISTANTES (lecture, mise à
--                   jour, suppression)
--   · with check  — valide les lignes ENTRANTES (insertion, et
--                   résultat d'une mise à jour)
--  Il faut les deux : sans  with check, la policy laisserait lire
--  et supprimer, mais refuserait toute insertion.
--
--  La suppression est volontairement permise : une absence saisie
--  par erreur doit pouvoir disparaître en un geste, et une séance
--  cochée trop vite doit pouvoir être décochée.
-- ------------------------------------------------------------
drop policy if exists seances_faites_prof on public.seances_faites;
create policy seances_faites_prof
  on public.seances_faites for all to authenticated
  using       ((select public.est_enseignant()))
  with check  ((select public.est_enseignant()));

drop policy if exists absences_prof on public.absences;
create policy absences_prof
  on public.absences for all to authenticated
  using       ((select public.est_enseignant()))
  with check  ((select public.est_enseignant()));

drop policy if exists jalons_prof on public.jalons;
create policy jalons_prof
  on public.jalons for all to authenticated
  using       ((select public.est_enseignant()))
  with check  ((select public.est_enseignant()));


-- ------------------------------------------------------------
--  6. Fermer la porte à  anon
--
--  Piège de ce projet, hérité de l'état initial : un
--  ALTER DEFAULT PRIVILEGES accorde automatiquement tous les
--  droits à  anon  sur CHAQUE table créée dans public. La RLS
--  bloquerait quand même (aucune policy ne vise anon), mais on ne
--  laisse pas deux protections là où une seule est nécessaire :
--  si une policy est un jour écrite trop large, le GRANT serait la
--  dernière barrière — autant qu'elle soit fermée.
--
--  Principe : un visiteur non connecté n'a rien à faire ici.
-- ------------------------------------------------------------
revoke all on table public.seances_faites from anon;
revoke all on table public.absences       from anon;
revoke all on table public.jalons         from anon;

grant select, insert, update, delete
  on table public.seances_faites to authenticated;
grant select, insert, update, delete
  on table public.absences       to authenticated;
grant select, insert, update, delete
  on table public.jalons         to authenticated;


-- ============================================================
--  7. Vérification — à lancer juste après, dans l'éditeur SQL
--     (consulter reste permis ; c'est modifier qui passe par la CLI)
--
--  Attendu après 009 :
--   · seances_faites  → 1 policy,  rls_active = true
--   · absences        → 1 policy,  rls_active = true
--   · jalons          → 1 policy,  rls_active = true
--   · progression     → 4  (elle en avait 3)
--  Les autres tables sont inchangées.
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
--
--  Et le contrôle qui compte vraiment — anon ne doit RIEN avoir :
--
-- select table_name, privilege_type
-- from information_schema.role_table_grants
-- where grantee = 'anon'
--   and table_name in ('seances_faites', 'absences', 'jalons');
--  → doit ne renvoyer aucune ligne.
