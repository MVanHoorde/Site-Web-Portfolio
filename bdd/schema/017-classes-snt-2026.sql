-- ============================================================
--  017 — Les 14 groupes de SNT de la rentrée 2026
--
--  🔴 À EXÉCUTER APRÈS LE 016, ET DANS LA MÊME SÉANCE.
--  Le 016 ferme tout par défaut : entre les deux fichiers, les
--  tableaux de bord sont fonctionnels mais vides. C'est le §3
--  ci-dessous qui rend à chacun ses groupes. Le §3 appelle
--  d'ailleurs  rattacher_enseignant(), qui naît dans le 016.
--
--  CE QUE FAIT CE FICHIER
--    §1  Libère le code SNT26A, occupé par la classe pilote
--    §2  Crée les 14 groupes
--    §3  Rattache chaque enseignant à ses groupes
--    §4  Supprime la classe de test devenue inutile
--
--  LA RÉPARTITION (présentation SNT 2026, Isaac de l'Étoile)
--  10 classes de 2nde redécoupées en 14 groupes de ~25, en
--  quatre barrettes. Chaque barrette réunit 2 ou 3 classes qui
--  alimentent chacune « leur » groupe, leur surplus formant un
--  groupe de regroupement — D, G, K et N.
--
--    vendredi 10h15  2.1 · 2.2 · 2.3   →  A · B · C  + D
--    jeudi    13h10  2.5 · 2.6         →  E · F      + G
--    jeudi    13h10  2.10              →  H          (24 élèves,
--                                                     non scindée)
--    jeudi    08h15  2.7 · 2.9         →  I · J      + K
--    mardi    11h05  2.4 · 2.8         →  L · M      + N
--
--    COUVRAT ......... A · F · K
--    VAN HOORDE ...... B · E · N
--    MARTIN .......... D · H · J · L
--    SANCHEZ ALZATE .. I · M
--    MAGOPHY ......... C · G
--
--  ≈ 344 élèves, 24,6 par groupe.
--
--  CE QUE CE FICHIER NE TOUCHE PAS
--  Les deux classes du livret CFA (CFA26A, MVT26A) restent en
--  base et continuent de fonctionner pour les apprentis. Elles
--  ne sont rattachées à personne : elles n'apparaîtront donc
--  dans aucun tableau de bord, ce qui est la décision du
--  04/09/2026 — le tableau de bord est un outil de SNT.
-- ============================================================


-- ------------------------------------------------------------
--  1. Libérer le code SNT26A
--
--  Le 001 avait créé une classe pilote sous le code SNT26A,
--  libellée « 2nde — SNT groupe A ». Or le groupe A de cette
--  année est celui de François COUVRAT, et le code est unique.
--
--  On ne SUPPRIME pas : les comptes de test qui y sont rattachés
--  (leproftest, test02…) deviennent le bac à sable de
--  démonstration pour les collègues, et les captures d'écran des
--  guides s'y feront plutôt que sur de vraies copies d'élèves.
--  On DÉPLACE : la classe change de code, ses élèves de test
--  restent accrochés, et SNT26A se libère.
--
--  avance_max = 40 : rien ne doit se fermer dans un bac à sable.
--
--  La garde  not exists (SNTDEM)  rend l'opération rejouable ET
--  la protège du pire scénario : rejouer tout le fichier après
--  coup renommerait sinon le VRAI groupe A en classe de démo.
-- ------------------------------------------------------------
update public.classes
   set code       = 'SNTDEM',
       libelle    = 'Démonstration — bac à sable des enseignants',
       avance_max = 40
 where code = 'SNT26A'
   and not exists (select 1 from public.classes c2 where c2.code = 'SNTDEM');


-- ------------------------------------------------------------
--  2. Les 14 groupes
--
--  Le CODE reprend la lettre que le lycée emploie déjà : un
--  élève qui entend « groupe E » tape SNT26E sans réfléchir.
--  Six caractères, majuscules — les deux contraintes du 001.
--  Seul SNT26I demande un « i comme Isaac » à l'oral.
--
--  Le LIBELLÉ est lu par l'élève (badge « connecté comme… ») :
--  il mène donc par la lettre, la classe d'origine n'étant qu'un
--  repère. Aucun nom d'enseignant ici — le rattachement vit au
--  §3, et la base ne porte pas d'annuaire.
--
--  AVANCE_MAX — le nombre de séances qu'un groupe peut ouvrir
--  au-delà de la dernière séance faite :
--    2  sur B, E et N, les groupes de Loïc, qui tient le cahier
--       de textes séance après séance ;
--    40 (tout ouvert) partout ailleurs. C'est indispensable et
--       non pas prudent : le plafond se calcule à partir des
--       séances déclarées faites. Un enseignant qui ne tient pas
--       le cahier de textes a un journal vide, et ses élèves se
--       heurteraient au plafond dès la séance 2 en concluant que
--       le dispositif est cassé. Chacun peut le redescendre
--       lui-même depuis l'onglet Séance.
--
--  ACTIF = true : les inscriptions sont ouvertes. Décision du
--  20/07 (option B) : on referme groupe par groupe après la
--  deuxième séance, et on rouvre à la demande.
--
--  on conflict (code) do nothing : rejouable sans écraser un
--  réglage que quelqu'un aurait modifié entre-temps.
-- ------------------------------------------------------------
insert into public.classes (code, libelle, annee_scolaire, avance_max) values
  ('SNT26A', '2nde SNT — groupe A (2.1)',              '2026-2027', 40),
  ('SNT26B', '2nde SNT — groupe B (2.2)',              '2026-2027',  2),
  ('SNT26C', '2nde SNT — groupe C (2.3)',              '2026-2027', 40),
  ('SNT26D', '2nde SNT — groupe D (2.1 · 2.2 · 2.3)',  '2026-2027', 40),
  ('SNT26E', '2nde SNT — groupe E (2.5)',              '2026-2027',  2),
  ('SNT26F', '2nde SNT — groupe F (2.6)',              '2026-2027', 40),
  ('SNT26G', '2nde SNT — groupe G (2.5 · 2.6)',        '2026-2027', 40),
  ('SNT26H', '2nde SNT — groupe H (2.10)',             '2026-2027', 40),
  ('SNT26I', '2nde SNT — groupe I (2.7)',              '2026-2027', 40),
  ('SNT26J', '2nde SNT — groupe J (2.9)',              '2026-2027', 40),
  ('SNT26K', '2nde SNT — groupe K (2.7 · 2.9)',        '2026-2027', 40),
  ('SNT26L', '2nde SNT — groupe L (2.4)',              '2026-2027', 40),
  ('SNT26M', '2nde SNT — groupe M (2.8)',              '2026-2027', 40),
  ('SNT26N', '2nde SNT — groupe N (2.4 · 2.8)',        '2026-2027',  2)
on conflict (code) do nothing;


-- ============================================================
--  3. Rattacher les enseignants
--
--  🔴 CES LIGNES SONT EN COMMENTAIRE. Il faut les décommenter
--     une par une, à mesure que les comptes existent.
--
--  MODE D'EMPLOI, pour chaque enseignant :
--
--    a) Tableau de bord Supabase → Authentication → Users
--       → Add user → Create new user.
--       Adresse de connexion + mot de passe provisoire.
--       (« Auto confirm user » coché : les adresses ne sont
--        jamais sollicitées, aucun courriel ne part.)
--
--    b) Revenir ici, décommenter SA ligne, remplacer l'adresse,
--       et l'exécuter seule.
--
--    c) La fonction retrouve le compte par son adresse, l'inscrit
--       comme professeur et pose ses rattachements. Elle répond
--       par une phrase du genre
--         « MARTIN : 4 rattachement(s) ajouté(s), 4 demandé(s). »
--       Rejouable : relancée, elle n'ajoute que ce qui manque.
--
--  Si elle répond « Aucun compte pour … », c'est l'étape (a) qui
--  n'a pas été faite, ou l'adresse qui diffère d'un caractère.
--
--  🔴 COMMENCE PAR TOI. Tant que ta ligne n'est pas jouée, ton
--     propre tableau de bord reste vide — c'est le seul effet
--     visible de l'entre-deux, et il se répare en une ligne.
--     Ton adresse est celle que tu tapes dans l'écran de
--     connexion du tableau de bord.
-- ============================================================

-- --- Loïc VAN HOORDE — groupes B, E, N, plus les deux démos ---
-- select public.rattacher_enseignant(
--   'TON.ADRESSE@enseignant.isaac-etoile.fr', 'VAN HOORDE',
--   array['SNT26B','SNT26E','SNT26N','SNTDEM','PROF26']);

-- --- Carole MARTIN — groupes D, H, J, L ---
-- select public.rattacher_enseignant(
--   'ADRESSE@enseignant.isaac-etoile.fr', 'MARTIN',
--   array['SNT26D','SNT26H','SNT26J','SNT26L','PROF26']);

-- --- François COUVRAT — groupes A, F, K ---
-- select public.rattacher_enseignant(
--   'ADRESSE@enseignant.isaac-etoile.fr', 'COUVRAT',
--   array['SNT26A','SNT26F','SNT26K','PROF26']);

-- --- Oscar SANCHEZ ALZATE — groupes I, M ---
-- select public.rattacher_enseignant(
--   'ADRESSE@enseignant.isaac-etoile.fr', 'SANCHEZ ALZATE',
--   array['SNT26I','SNT26M','PROF26']);

-- --- Odrine MAGOPHY — groupes C, G ---
-- select public.rattacher_enseignant(
--   'ADRESSE@enseignant.isaac-etoile.fr', 'MAGOPHY',
--   array['SNT26C','SNT26G','PROF26']);

--  DEUX CLASSES HORS PROGRESSION, ET ELLES NE FONT PAS LE MÊME
--  TRAVAIL — relevé du 04/09/2026 :
--
--    PROF26  « Démo — collègues »  3 élèves,  0 copie
--            Le terrain d'essai commun, rattaché aux CINQ. C'est
--            là que chacun crée ses élèves fictifs pour éprouver
--            le dispositif sans toucher à un vrai élève.
--            Convention de pseudo : préfixe  zz-  , pour qu'ils
--            restent repérables et supprimables en bloc.
--
--    SNTDEM  « Démonstration »     3 élèves, 35 copies
--            L'ancienne classe pilote, rattachée à Loïc SEUL.
--            Ses 35 copies sont le seul matériel du dépôt qui
--            montre une vraie file de correction : c'est avec
--            elles que se feront les captures d'écran des guides,
--            plutôt qu'avec des copies de vrais élèves.


-- ============================================================
--  4. Faire le ménage : la classe de test
--
--  SNTTEA « Test - Classe A » a servi aux essais de
--  juillet-août. Elle n'a plus d'usage : les essais se feront
--  désormais dans PROF26, et la démonstration dans SNTDEM.
--
--  🔴 LE CODE A ÉTÉ CORRIGÉ LE 04/09/2026. Ce paragraphe visait
--  d'abord SNTTSA et SNTTSB, les codes annoncés par REPRISE.md —
--  qui n'existent pas. Le vrai code est SNTTEA, et il n'y a
--  qu'une classe de test, pas deux. REPRISE.md signalait
--  lui-même « non revérifié depuis le 01/08, à contrôler dans
--  Supabase » : c'était à contrôler, et c'était faux. Le premier
--  passage n'a donc rien supprimé — le bon comportement pour un
--  ménage qui ne trouve pas sa cible.
--
--  🔴 CE PARAGRAPHE EST LE SEUL DU FICHIER QUI EFFACE.
--
--  Ce qui disparaît : la ligne de  classes, et — par cascade —
--  les séances et jalons qui y étaient rattachés, c'est-à-dire
--  des données de test.
--
--  Ce qui est CONSERVÉ : les comptes eux-mêmes. La base refuse
--  de supprimer une classe qui porte encore des élèves
--  (on delete restrict, posé exprès dans le 003 pour empêcher
--  d'effacer une classe et ses élèves d'un geste distrait). On
--  déplace donc les 2 élèves de test vers SNTDEM avant de
--  supprimer la classe vide. Leurs comptes, leur progression
--  et leurs copies suivent intacts — c'est ta demande du 04/09 :
--  on garde les comptes de test, ils servent de démonstration.
--
--  Placé en DERNIER délibérément : si quoi que ce soit coince
--  ici, les 14 groupes du §2 sont déjà créés et les rattachements
--  du §3 restent jouables. Le ménage ne bloque jamais la rentrée.
--
--  Le bloc ne fait rien et le DIT plutôt que d'échouer dans deux
--  cas : SNTDEM absente, ou un pseudo de SNTTEA déjà pris dans
--  SNTDEM (l'unicité pseudo/classe du 003 s'y opposerait). Dans
--  les deux cas, rien n'est supprimé et tu peux me montrer le
--  message.
-- ============================================================
do $$
declare
  v_demo      uuid;
  v_deplaces  int := 0;
  v_classes   int := 0;
begin
  select id into v_demo
    from public.classes
   where code = 'SNTDEM';

  if v_demo is null then
    raise notice
      'MÉNAGE ABANDONNÉ : SNTDEM est absente. Le §1 n''a pas renommé la classe pilote. Rien n''a été supprimé.';
    return;
  end if;

  begin
    update public.eleves
       set classe_id = v_demo
     where classe_id in (
             select id from public.classes
              where code = 'SNTTEA'
           );
    get diagnostics v_deplaces = row_count;
  exception
    when unique_violation then
      raise notice
        'MÉNAGE ABANDONNÉ : un pseudo de SNTTEA existe déjà dans SNTDEM. Renomme-le, puis rejoue ce fichier. Rien n''a été supprimé.';
      return;
  end;

  delete from public.classes
   where code = 'SNTTEA';
  get diagnostics v_classes = row_count;

  raise notice
    'MÉNAGE FAIT : % élève(s) de test déplacé(s) vers SNTDEM, % classe(s) de test supprimée(s).',
    v_deplaces, v_classes;
end $$;


-- ============================================================
--  5. Vérifications — à lire après exécution
-- ============================================================

--  5a. Les 14 groupes existent, avec le bon plafond.
select code, libelle, avance_max, actif
from public.classes
where code like 'SNT26%'
order by code;
--  → 14 lignes. avance_max = 2 sur SNT26B, SNT26E et SNT26N ;
--    40 sur les onze autres. actif = true partout.

--  5b. SNT26A est bien le groupe A, et non plus la classe pilote.
select code, libelle, avance_max
from public.classes
where code in ('SNT26A', 'SNTDEM')
order by code;
--  → 2 lignes : SNT26A = « groupe A (2.1) »,
--               SNTDEM = « Démonstration — bac à sable… »
--    Si SNTDEM manque, le §1 n'a rien renommé : la classe pilote
--    portait un autre code que SNT26A. À regarder avant d'aller
--    plus loin.

--  5c. Le paysage complet, CFA compris.
select code, libelle, annee_scolaire, avance_max, actif
from public.classes
order by code;
--  → 14 groupes SNT + SNTDEM + PROF26 + CFA26A + MVT26A.
--    18 lignes en tout. SNTTEA ne doit PLUS y figurer :
--    c'est la preuve que le §4 a fait son travail.
--    CFA26A et MVT26A sont intactes et sans rattachement.

--  5d. Qui enseigne où — la réponse à « chacun ses groupes ».
select e.libelle as enseignant,
       count(*)  as nb_groupes,
       string_agg(c.code, ' · ' order by c.code) as groupes
from public.enseignants_classes ec
join public.enseignants e on e.auth_id = ec.auth_id
join public.classes     c on c.id      = ec.classe_id
group by e.libelle
order by e.libelle;
--  → une ligne par enseignant rattaché. Vide tant que le §3 n'a
--    pas été décommenté, ce qui est normal au premier passage.

--  5e. 🔴 Les groupes que personne n'enseigne.
--      Un groupe SNT dans cette liste est un groupe dont
--      l'enseignant ne verra rien : soit son compte n'existe pas
--      encore, soit son rattachement a été oublié.
--      CFA26A et MVT26A doivent y figurer — c'est voulu.
select c.code, c.libelle
from public.classes c
where not exists (
  select 1 from public.enseignants_classes ec where ec.classe_id = c.id
)
order by c.code;
