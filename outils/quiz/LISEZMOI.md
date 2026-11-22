# Diapason — le quiz en classe (`outils/quiz/`)

Remplace Kahoot. L'enseignant projette, les élèves répondent sur téléphone ou
tablette, **sans compte**, avec un code à 6 chiffres ou le QR code. Les quiz sont
stockés en base (projet `ztyv…`, fichier `bdd/schema/047-quiz.sql`) ; les
statistiques restent à l'enseignant.

Nom : **Diapason** (choisi par Loïc le 15/11/2026 : la vibration qui se transmet, et toute la classe « au diapason »). Le nom vit dans une seule constante, `NOM`, en tête
de `quiz-commun.js` : la changer suffit (titres de page compris).

## Les pages

| Page | Pour qui | Ce qu'elle fait |
|---|---|---|
| `entrainement.html` | élèves | **La porte de l'accueil du site** (« 🎵 Diapason », bloc *Outils pédagogiques*). Les sections, puis les chapitres, puis les quiz : un clic mène à la salle du quiz en mode seul (`?salle=…&seul=1`), sans salle d'attente. Lit `quiz_catalogue` (051) : titres et codes de salle, jamais une question. |
| `index.html` | élèves | Entrer le code (ou arriver par le QR code de la partie, `?pin=…`) et un pseudonyme, puis jouer. Par le **QR code fixe** d'un quiz (`?salle=…`) : attendre le lancement, ou s'entraîner seul. Le jeton reste sur l'appareil : recharger la page ne fait pas perdre la partie. |
| `animer.html` | enseignant | Bibliothèque **en dossiers** (voir plus bas ; « + Quiz » et « Modifier » ouvrent l'éditeur ; import, aperçu avec corrigés, **QR code fixe**, rangement, export, suppression), lancement d'une partie, **écran projeté**. Clavier : Espace / → pour avancer, F plein écran. |
| `editer.html` | enseignant | **L'éditeur** : créer ou modifier un quiz à l'écran, les huit types de questions (voir plus bas). `?quiz=<id>` modifie, `?dossier=<id>` crée dans ce dossier. |
| `stats.html` | enseignant | Par partie : réussite par question (répartition, temps moyen), par notion, par élève, export CSV. Par quiz : chaque question d'une partie à l'autre. **Entraînement hors classe** à part : qui a refait quel quiz, avec quel résultat. |

## Les dossiers et le filigrane (051)

À la racine, **une section par classe** (2de PC, 2de SNT, 1re ES, Tle ES, CFA,
BTS MS), illustrée par le visuel de sa porte sur l'accueil du site — pour le
BTS MS, des tourbillons de Kármán photographiés par la NASA (domaine public,
`assets/img/quiz/sections/CREDITS.txt`). Dans chaque section, **un dossier par
chapitre** ; on peut emboîter plus loin.

- **Créer** : « + Nouvelle section » (racine) ou « + Dossier » (dans un dossier).
  Tout enseignant crée ; seul l'auteur d'un dossier — ou le gestionnaire — le
  modifie ou le supprime. Un dossier qui a des sous-dossiers ne se supprime pas ;
  ses quiz reviennent « sans dossier ».
- **Image en filigrane** : un visuel du site d'un clic, un chemin
  (`assets/img/…`), une adresse https, ou une image de l'ordinateur (réduite à
  720 px et ~40 Ko par la page, rangée en base). Elle se pose d'elle-même,
  pâle et désaturée, derrière le dossier ouvert, dans les vignettes de ses
  chapitres, derrière l'**écran projeté** du quiz et sur la page d'entraînement.
  Un dossier sans image prend celle de son parent.
- **Visible des élèves** (case du dossier) : décochée, le dossier et tout ce
  qu'il contient sortent de la page d'entraînement. Un quiz seul se retire par
  « Ranger » → « Proposé à l'entraînement ».
- **Ranger** un quiz : bouton de sa carte. Un fichier **déposé pendant qu'un
  dossier est ouvert** y est rangé, s'il ne porte pas son propre chemin.

## L'éditeur (`editer.html`)

Crée et modifie un quiz sans passer par un fichier. Ce qu'il enregistre est
exactement le format de fichier décrit plus bas (il passe par `quiz_importer`),
donc un quiz écrit à l'écran s'exporte, et un fichier importé se retouche ici.

- **En haut**, le quiz : titre, description, niveau, matière, dossier,
  « Proposé à l'entraînement », « Partagé avec les collègues ». L'identifiant
  (`slug`) se tire du titre à la création, puis ne change plus.
- **À gauche**, les questions : ouvrir, monter / descendre (ou glisser),
  dupliquer, supprimer ; « + Question » propose les huit types. Un ⚠ signale
  une question à corriger ou « à vérifier ».
- **À droite**, la question ouverte : énoncé (`$…$` pour les formules,
  `**gras**`), temps, et les champs propres au type — bonnes réponses cochées
  et « pourquoi » de chaque réponse fausse (QCM, vrai/faux), valeur, tolérance
  en %, unités, autres écritures et pièges (valeur), éléments dans le bon
  ordre (remise en ordre), paires (association), réponses acceptées, indice et
  pièges (mot), échelle, tolérance et marge (curseur), **zones justes tracées
  au doigt ou à la souris sur l'image** (zone). Le volet « Correction, image,
  repères » porte le point de cours, la notion, le niveau, le BO, l'image, l'image
  à fournir et le point à vérifier. Changer de type garde l'énoncé et ce qui se
  transpose (QCM ↔ vrai/faux, valeur ↔ curseur…).
- **Sous la question**, l'aperçu : l'écran projeté, correction affichée,
  à chaque frappe. « Tester » montre tout le quiz ainsi.
- **Enregistrer** (ou Ctrl + S) fait d'abord juger chaque question par la base
  (`quiz_question_invalide`) ; une question refusée s'ouvre avec son erreur, et
  rien n'est écrit. L'éditeur refuse en plus une réponse de QCM ou un élément à
  ordonner laissé vide. Un brouillon reste sur l'appareil tant que rien n'est
  enregistré ; fermer l'onglet avec des modifications demande confirmation.
- Le quiz d'un collègue s'ouvre en **lecture seule** : « Dupliquer pour moi »
  en fait une copie à soi.

## Le pari de confiance

Option du lancement (« pari de confiance ») : l'élève coche « Je suis sûr de
moi » — bonus de 25 % si c'est juste, 200 points perdus sinon. **Avec le pari,
une réponse unique se choisit puis s'envoie** : toucher une réponse la
sélectionne (un autre toucher la remplace), l'élève coche ou non le pari, puis
touche **Envoyer** (demande des BTS MS, 22/11/2026). **Sans pari**, une réponse
unique part dès qu'on la touche. Les autres types de question ont toujours leur
bouton « Envoyer », posé sous la case du pari.

## Le QR code fixe d'un quiz (salle permanente)

Chaque quiz a un **code de salle** de 6 caractères qui ne change jamais
(bouton « QR code fixe » de la bibliothèque, image PNG à télécharger). On le pose
sur une diapositive ou une fiche ; le PIN, lui, est tiré à chaque lancement.

- **En classe** : l'élève scanne, donne son nom et **attend** (la page redemande
  toutes les 3,5 s). Dès que l'**auteur** du quiz le lance, tous ceux qui
  attendaient entrent dans la partie ; les retardataires entrent directement.
  Relancer le même quiz ferme la salle d'attente abandonnée : le QR code mène
  toujours à la dernière partie ouverte. Un collègue qui lance le quiz partagé
  garde son PIN.
- **Sans partie ouverte** (à la maison) : bouton « S'entraîner seul ». L'élève
  avance lui-même, la base juge toujours, la correction s'affiche après chaque
  réponse (`quiz_entrainer`, `quiz_solo`). Ces parties (`mode = 'solo'`) sont
  rangées chez l'auteur, à part des parties de classe. Garde-fou : 200
  entraînements par heure et par quiz.

Comptes enseignants : ceux du tableau de bord (`enseignants`). Aucun compte neuf.

## Ce qui est garanti par la base, pas par l'écran

- Les **bonnes réponses ne quittent jamais la base** avant la correction d'une
  question : l'élève reçoit l'énoncé et les choix, la base juge et compte les
  points avec **son** horloge (1 000 points au plus, la moitié perdue au fil du
  chrono). Un élève qui ouvre l'inspecteur n'y lit rien.
- Un élève ne touche aucune table : sept fonctions seulement
  (`quiz_rejoindre`, `quiz_etat`, `quiz_repondre`, `quiz_renommer` — « Ce
  n'est pas mon nom » change le pseudo du même joueur, 048 —, et pour le QR
  code fixe `quiz_salle`, `quiz_entrainer`, `quiz_solo`).
- Un enseignant ne voit que **ses** parties ; les quiz sont partagés entre
  collègues (`partage`), modifiables par leur seul auteur.
- RGPD : pseudonyme seulement (« prénom + initiale »), retirable par
  l'enseignant ; **remplacé par #1, #2… trente jours après la partie**.

## Temps réel

L'écran projeté diffuse un « réveil » sans contenu sur le canal de la partie
(Supabase Realtime) ; chaque téléphone relit alors son état. Si le wifi bloque
les WebSocket, la page relit l'état toutes les 1,5 s : le jeu marche quand même.

## 🔴 Les sources des quiz ne vont pas dans le dépôt

Le dépôt est public : un fichier de quiz y exposerait ses corrigés. Les sources
vivent dans **`_quiz/`** (ignoré par Git, sur le PC de Loïc) et entrent en base
par **« Importer »** dans `animer.html`. Ré-importer un fichier (même `slug`)
met le quiz à jour ; les parties déjà jouées gardent leur copie des questions.

Avant d'importer, relire un fichier hors ligne :
`python _outils/tests/quiz-base.py _quiz/<dossier>/*.json`
(chaque question passe par le même validateur que la base).

## Le format d'un fichier de quiz

```json
{
  "slug": "bts-ms-energie-puissance",
  "titre": "Énergie et puissance",
  "niveau": "BTS MS 1re année",
  "matiere": "Physique-chimie",
  "description": "Après la séance 3",
  "partage": true,
  "salle": "MS2AQM",
  "dossier": ["BTS MS", "Énergie"],
  "questions": [ … ]
}
```

`dossier` (facultatif, 051) range le quiz : un chemin de noms depuis la
section, `["2de SNT", "Le Web"]`. Chaque nom se cherche par le nom **ou le
sigle** du dossier (casse ignorée) ; ce qui manque est créé. Sans `dossier`, un
quiz réimporté reste où on l'a rangé. `catalogue` (facultatif, vrai par défaut)
le propose à l'entraînement des élèves.

`salle` (facultatif) fixe le code du QR code fixe : 6 caractères parmi A-Z et
2-9, sans I, L ni O. Le QR code se prépare ainsi avant l'import, et reste
valable si le quiz est supprimé puis réimporté. Sans `salle`, la base en tire un.

Champs communs à toutes les questions :

| Champ | Rôle |
|---|---|
| `type` | `qcm`, `vf`, `num`, `ordre`, `zone`, `assoc`, `mot`, `curseur` |
| `enonce` | Texte. Formules LaTeX entre `$…$` (KaTeX, `\ce{}` de mhchem compris), `**gras**`, retour à la ligne. `\$` pour un dollar. |
| `temps` | Secondes, de 5 à 240 (20 par défaut) |
| `notion` | Sert au bilan de l'élève et aux statistiques par notion |
| `bo` | Ligne du référentiel (capacité exigible) |
| `niveau` | 1 restitution, 2 application, 3 raisonnement |
| `cours` | Le point de cours affiché à la correction |
| `revoir` | `{ "texte": "S5 · Le routage", "lien": "pages/2nde-snt-t1-internet.html#etape-t1-routage" }` — la partie du cours qui réexplique (052). Montrée à l'élève qui se trompe, à la correction, et dans son **bilan de fin**, sous chaque notion ratée (« Revoir : … → », sans doublon). `#sN` vise une séance, `#etape-<clé>` une étape (`data-cle` de la page : le moteur des séquences la déplie et la surligne ; une étape encore verrouillée renvoie à sa séance). Plan des clés : `python -I -X utf8 _outils/kahoot/plan_cours.py`. Contrôle des liens : `_outils/kahoot/verifier_revoir.py`. |
| `image` | `{ "src": "assets/img/quiz/…/x.jpg", "alt": "…" }` — chemin depuis la racine du site, ou adresse `https` |
| `image_attendue` | Description d'une image à fournir : affichée en cadre de réservation dans l'aperçu, **jamais** aux élèves |
| `a_verifier` | Point à relire : signalé dans la bibliothèque et l'aperçu |

Selon le type :

- **`qcm`** — `options` (2 à 6), `correct` : liste d'indices (`[2]`, ou `[0, 2]`
  pour plusieurs bonnes réponses : l'élève coche puis valide), `pourquoi` : un
  message par option fausse (`null` pour la bonne).
- **`vf`** — `correct` : `[0]` (vrai) ou `[1]` (faux), `pourquoi` comme le QCM.
- **`num`** — `num` : `valeur`, `tolerance` (relative : `0.02` = 2 %), `unite`,
  `unites` (les choix proposés, distracteurs compris), `autres`
  (`[{ "valeur": 70.6, "unite": "km/h" }]` : une écriture juste dans une autre
  unité), `pieges` (`[{ "valeur": 9.81, "message": "…" }]` : une erreur attendue
  et son explication), `message_unite` (bonne valeur, mauvaise unité).
- **`ordre`** — `items` : 2 à 8 textes **dans le bon ordre** ; la base les
  mélange à chaque partie. Le téléphone ne reçoit que des positions mélangées :
  l'inspecteur du navigateur ne livre pas l'ordre juste.
- **`zone`** — `zone` : `src`, `alt`, `cibles` : rectangles en % de l'image
  (`{ "x": 10, "y": 20, "l": 15, "h": 10 }`).
- **`assoc`** — `paires` : 3 à 6 paires `["gauche", "droite"]`. La colonne de
  droite est mélangée à chaque partie. **Points partiels** : 2 paires justes sur
  4 rapportent la moitié des points (« Presque ! ») ; relier deux fois le même
  élément ne rapporte rien.
- **`mot`** — `mot` : `acceptes` (les réponses justes ; la première est montrée
  à la correction), `pieges` (`[{ "mot": "oxygène", "message": "…" }]`),
  `indice` (affiché sous le champ). Comparaison sans majuscules, accents ni
  ponctuation ; les chiffres en indice valent des chiffres (CO₂ = CO2).
- **`curseur`** — `curseur` : `min`, `max`, `pas`, `valeur`, `tolerance`
  (absolue, dans l'unité : tous les points), `marge` (absolue : des points
  partiels décroissants jusque-là ; 3 × la tolérance par défaut), `unite`.

## Bancs d'essai

- `python _outils/tests/quiz-base.py` — le 047 sur un Postgres local jetable,
  rejoué deux fois, puis tous les contrôles (fuites de correction, chrono, pari,
  unités, pièges, ordre, zone, exclusion, anonymisation, cloisonnement).
- `python -X utf8 _outils/tests/quiz-editeur-parcours.py [dossier_captures]` —
  l'éditeur au navigateur : un quiz créé avec une question de chaque type
  (zone tracée à la souris), un enregistrement refusé tant qu'une question est
  incomplète, réouverture, modification, réordonnancement, lecture seule et
  copie d'un quiz de collègue ; en base, les huit questions passent le
  validateur et leur bonne réponse est jugée juste.
- `python _outils/tests/quiz-dossiers-parcours.py [dossier_captures]` — les
  dossiers (051) au navigateur : sections, import rangé par chemin, filigrane
  (page et écran projeté), création et rangement, section masquée, page
  d'entraînement sur téléphone jusqu'à l'entraînement seul, porte de l'accueil.
  Mesure aussi que le PIN tient dans l'affiche en 1280 × 720.
- `python _outils/tests/quiz-parcours.py [dossier_captures]` — un écran
  enseignant et une classe de téléphones jouent un quiz complet au navigateur,
  **sur la vraie logique SQL** (Postgres local), temps réel compris. Aucune
  requête ne sort de la machine. Demande `psycopg` (voir l'en-tête du script).

## Pas encore là

Ordre des dossiers à la main (ils suivent leur ordre de création), déplacer
un dossier ailleurs depuis l'écran. Déposer une image depuis l'ordinateur dans
l'éditeur (aujourd'hui : un chemin du site ou une adresse https). Ressentis, « garder pour réviser », carnet perso,
comptes élèves et suivi d'une séance à l'autre. Cahier des charges complet :
archive `quiz-appli-export` (Téléchargements).
