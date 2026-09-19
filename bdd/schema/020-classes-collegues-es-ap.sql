-- ============================================================
--  020 — Deux collègues entrent dans le tableau de bord :
--        l'enseignement scientifique de 1re, et l'AP de 2nde
--
--  BESOIN (Loïc, 17/09/2026)
--  Jusqu'ici les espaces  es1  et  pc2  n'étaient rattachés qu'à
--  Loïc (019). Deux collègues les rejoignent :
--
--    Isoline CASTEL ... 1re 5 et 1re 6 en enseignement scientifique
--                       + un groupe d'AP de physique-chimie
--    Guénola HUSSON ... un groupe d'AP de physique-chimie, rien d'autre
--
--  CE QUE FAIT CE FICHIER
--    §1  Les deux classes d'enseignement scientifique de 1re
--    §2  Les deux groupes d'AP, un par collègue
--    §3  Les rattachements — EN COMMENTAIRE, à jouer un par un
--    §4  Vérifications
--
--  CE QUE CE FICHIER NE CHANGE PAS
--  · Aucune structure : ni table, ni colonne, ni fonction, ni
--    policy. Que des lignes dans  classes  et, au §3, dans
--    enseignants / enseignants_classes. Il s'exécute donc dans
--    l'éditeur SQL, comme le 019, sans passer par une migration.
--  · Les classes de Loïc, ses rattachements, les 14 groupes de
--    SNT, le livret CFA : rien n'y est touché.
--  · Le tableau de bord : AUCUNE ligne de code à changer. Les
--    espaces se déduisent du rattachement (018) — Isoline verra
--    l'accueil « Mes espaces » avec deux cartes parce qu'elle a
--    des classes dans deux espaces, Guénola entrera directement
--    dans l'espace de physique-chimie parce qu'elle n'en a qu'un.
--
--  CE QUE CHACUNE VERRA, ET CE QU'ELLE NE VERRA PAS
--  Le cloisonnement du 016 s'applique tel quel : chacune ne voit
--  que SES classes, SES élèves, et la part de leur progression
--  qui relève de l'espace de la classe (famille_de_cle(), 018).
--  Un élève d'AP qui fait aussi de la SNT dans le groupe d'un
--  collègue n'apporte rien de sa SNT dans l'AP, et réciproquement.
--
--  Rejouable : toutes les insertions sont « on conflict do
--  nothing ».
-- ============================================================


-- ------------------------------------------------------------
--  1. Enseignement scientifique de 1re — deux classes
--
--  Code sur le modèle d'ES1R02, la 1re 2 de Loïc (018 §7) :
--  ES1R + le numéro de la classe sur deux chiffres. Un élève qui
--  entend « première cinq » tape ES1R05 sans réfléchir.
--
--  Libellé sans nom d'enseignant, comme partout ailleurs : la
--  base ne porte pas d'annuaire. Il est lu par l'élève, dans le
--  badge « connecté comme… ».
--
--  actif = true : les inscriptions sont ouvertes tout de suite —
--  contrairement au 018, où les classes naissaient fermées faute
--  de tableau de bord pour les suivre. Il est en ligne depuis le
--  13/09. Pour refermer une classe après la deuxième séance :
--    update public.classes set actif = false where code = 'ES1R05';
--  Elle reste dans le tableau de bord ; seule la création de
--  nouveaux comptes se ferme.
--
--  avance_max = 40 (tout ouvert) : le plafond d'avance ne vaut
--  que pour le SNT (018 §5). La valeur est sans effet ici ; on la
--  met au maximum pour que personne ne la lise un jour comme un
--  réglage qui la concernerait.
-- ------------------------------------------------------------
insert into public.classes (code, libelle, annee_scolaire, espace, actif, avance_max) values
  ('ES1R05', '1re 5 — enseignement scientifique', '2026-2027', 'es1', true, 40),
  ('ES1R06', '1re 6 — enseignement scientifique', '2026-2027', 'es1', true, 40)
on conflict (code) do nothing;


-- ------------------------------------------------------------
--  2. Les deux groupes d'AP de physique-chimie — un par collègue
--
--  🔴 LE CODE PORTE LE NOM DE LA COLLÈGUE, et c'est une exception
--  assumée à la règle « la base ne porte pas d'annuaire » (017).
--  Motif, relevé par Loïc le 19/09/2026 : un groupe d'AP ne
--  correspond à AUCUNE classe de 2nde — il mélange des élèves de
--  toutes les secondes, et sa composition bouge dans l'année. Ni
--  le numéro d'une classe ni une lettre de groupe ne diraient
--  quoi que ce soit à l'élève ; le nom de sa professeure, si.
--  C'est ce qu'il tape, et c'est ce qu'il reconnaît dans son badge.
--
--  Six caractères exactement — contrainte du 001 : AP + les
--  quatre premières lettres du nom.
--
--  Le groupe d'AP de Loïc, AP2S26, existe déjà (018 §7) et n'est
--  pas touché : il était seul, son code générique suffisait.
--  Le jour où il faudrait les aligner, c'est un  update  sur le
--  code, pas une nouvelle classe — mais il casserait le code déjà
--  dicté aux élèves.
--
--  actif = true et avance_max = 40 : voir §1.
-- ------------------------------------------------------------
insert into public.classes (code, libelle, annee_scolaire, espace, actif, avance_max) values
  ('APCAST', '2nde — AP physique-chimie (groupe Castel)', '2026-2027', 'pc2', true, 40),
  ('APHUSS', '2nde — AP physique-chimie (groupe Husson)', '2026-2027', 'pc2', true, 40)
on conflict (code) do nothing;


-- ============================================================
--  3. Rattacher les deux collègues
--
--  🔴 CES LIGNES SONT EN COMMENTAIRE. Il faut les décommenter
--     une par une, à mesure que les comptes existent.
--
--  MODE D'EMPLOI, pour chaque collègue — c'est celui du 017 §3,
--  inchangé :
--
--    a) Tableau de bord Supabase → Authentication → Users
--       → Add user → Create new user.
--       Adresse de connexion + mot de passe provisoire.
--       (« Auto confirm user » coché : les adresses ne sont
--        jamais sollicitées, aucun courriel ne part.)
--       🔴 Le mot de passe doit respecter la politique du projet
--          (Authentication → Policies) : sinon Supabase répond une
--          erreur qui ne dit pas laquelle des règles manque.
--
--    b) Revenir ici, décommenter SA ligne, remplacer l'adresse
--       ET le code d'AP, et l'exécuter seule.
--
--    c) La fonction retrouve le compte par son adresse, l'inscrit
--       comme professeur et pose ses rattachements. Elle répond
--       par une phrase du genre
--         « CASTEL : 3 rattachement(s) ajouté(s), 3 demandé(s). »
--       Rejouable : relancée, elle n'ajoute que ce qui manque.
--
--  Si elle répond « Aucun compte pour … », c'est l'étape (a) qui
--  n'a pas été faite, ou l'adresse qui diffère d'un caractère.
--
--  PAS DE BAC À SABLE (décision du 17/09/2026). Les collègues de
--  SNT sont rattachées à PROF26 pour s'exercer ; ici non, parce
--  que PROF26 est une classe de l'espace  snt  : elle ouvrirait à
--  Isoline et à Guénola un espace « SNT » de plus, avec sa file de
--  correction, qui ne les concerne pas. Pour s'exercer, chacune
--  crée un compte élève fictif dans sa propre classe — pseudo
--  préfixé  zz-  , comme dans PROF26, pour rester repérable et
--  supprimable.
-- ============================================================

--  Adresses de l'établissement : première lettre du prénom, point,
--  nom, @enseignant.isaac-etoile.fr.
--  🔴 Le dépôt est PUBLIC : les vraies adresses ne s'écrivent pas
--  ici — on les tape dans l'éditeur SQL au moment de jouer la ligne,
--  comme au 017. Lignes jouées le 19/09/2026.

-- --- Isoline CASTEL — 1re 5, 1re 6, et son groupe d'AP ---
-- select public.rattacher_enseignant(
--   'ADRESSE@enseignant.isaac-etoile.fr', 'CASTEL',
--   array['ES1R05','ES1R06','APCAST']);

-- --- Guénola HUSSON — son groupe d'AP, et rien d'autre ---
-- select public.rattacher_enseignant(
--   'ADRESSE@enseignant.isaac-etoile.fr', 'HUSSON',
--   array['APHUSS']);


-- ============================================================
--  4. Vérifications — à lire après exécution
--
--  🔴 L'éditeur SQL de Supabase n'affiche que le résultat de la
--  DERNIÈRE instruction du lot. Lancé d'un bloc, ce fichier ne
--  montre donc que le 4d ; les trois autres ont tourné, leur
--  tableau a simplement été remplacé. Pour en lire une : la
--  sélectionner à la souris et faire Ctrl+Entrée — l'éditeur
--  n'exécute alors que la sélection.
-- ============================================================

--  4a. Les quatre classes existent, dans le bon espace, ouvertes.
select code, libelle, espace, actif, annee_scolaire
from public.classes
where code in ('ES1R05','ES1R06')
   or (espace = 'pc2' and code <> 'PC2S01')
order by espace, code;
--  → ES1R05 et ES1R06 en  es1  ; AP2S26 (Loïc), APCAST et APHUSS
--    en  pc2. actif = true partout.

--  4b. Qui enseigne quoi, par espace — la réponse à « chacune ses
--      classes ». Vide pour CASTEL et HUSSON tant que le §3 n'a
--      pas été décommenté, ce qui est normal au premier passage.
select e.libelle as enseignant, c.espace, count(*) as classes,
       string_agg(c.code, ' · ' order by c.code) as codes
from public.enseignants_classes ec
join public.enseignants e on e.auth_id = ec.auth_id
join public.classes     c on c.id      = ec.classe_id
group by e.libelle, c.espace
order by e.libelle, c.espace;
--  → CASTEL : es1 2 · pc2 1        (deux cartes d'espaces à l'écran)
--    HUSSON : pc2 1                (aucun accueil : elle entre direct)
--    VAN HOORDE : cfa 2 · es1 1 · est 2 · pc2 2 · snt …

--  4c. 🔴 Les classes que personne n'enseigne.
--      Une classe ici est une classe dont l'enseignante ne verra
--      rien : soit son compte n'existe pas encore, soit son
--      rattachement a été oublié.
--      CFA26A et MVT26A ne doivent PAS y figurer : elles ont été
--      rattachées à Loïc le 13/09 (019 §1).
select c.code, c.libelle, c.espace
from public.classes c
where not exists (
  select 1 from public.enseignants_classes ec where ec.classe_id = c.id
)
order by c.espace, c.code;
--  → aucune ligne une fois le §3 joué en entier.

--  4d. Personne d'autre n'a été promu enseignant par mégarde.
select e.libelle, e.cree_le
from public.enseignants e
order by e.cree_le;
--  → AVANT le §3 : les 5 enseignants de SNT, et eux seuls. C'est
--    l'état normal au premier passage — les deux collègues n'ont
--    pas encore de compte.
--  → APRÈS le §3 : 7 lignes, CASTEL et HUSSON en dernier.
--  → Un nom inconnu dans cette liste, lui, n'a rien à y faire.
