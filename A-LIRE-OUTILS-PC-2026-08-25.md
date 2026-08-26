# À lire — Outils transversaux PC, lot 1 (25/08/2026)

**Quatrième famille du dépôt.** Deux outils produits de bout en bout, plus les
consignes durables. Tout le contenu pédagogique est une **proposition V1, non
validée**.

---

## Ce qui est fait

| Fichier | |
|---|---|
| `pages/2nde-pc-o1-ecriture-scientifique.html` | 🆕 Outil 1 — page écran |
| `fiches/fiche-2nde-o1-ecriture-scientifique.html` | 🆕 Outil 1 — fiche A4, **2 pages exactement** |
| `pages/2nde-pc-o2-chiffres-significatifs.html` | 🆕 Outil 2 — page écran |
| `fiches/fiche-2nde-o2-chiffres-significatifs.html` | 🆕 Outil 2 — fiche A4, **2 pages exactement** |
| `pages/2nde-physique-chimie.html` | ✏️ famille « Outils transversaux », avant le thème 1 |
| `_modeles/CONSIGNES-outil-PC.md` | 🆕 les conventions durables, autonomes |
| `MANIFESTE.md` · `CLAUDE.md` | ✏️ la famille y est inscrite |
| `_suivi/ETAT-PROJET.md` · `DECISIONS.md` · `chapitres.md` · `JOURNAL.md` | ✏️ suivi à jour |

**Aucun asset partagé n'a été touché** — ni `sequence-snt.js`, ni
`sequence-snt.css`, ni `progression.js`, ni `chapitre-commun.css`. Aucune
migration de base. Aucun `?v=` incrémenté : les deux pages chargent les versions
en vigueur (`sequence-snt.*?v=41`, `progression.js?v=16`).

### Ce que chaque outil contient

**O1 — Puissances de dix et écriture scientifique.** Méthode en 4 étapes :
pourquoi cette écriture (frise verticale de 18 décades, de l'atome au rayon
terrestre) · la forme `a × 10ⁿ` (curseur d'exposant de −12 à +12, qui fait
apparaître et disparaître les zéros en direct) · les préfixes et les conversions
(13 préfixes, les trois cas, l'unité composée `kg·L⁻¹ → g·cL⁻¹` entièrement
résolue) · l'ordre de grandeur (axe logarithmique où l'on **voit** que √10 ≈ 3,16
tombe au milieu, et donc pourquoi le seuil n'est pas 5). Puis 6 exercices
corrigés, dont le piège de la calculatrice avec ses deux écrans en SVG.

**O2 — Les chiffres significatifs.** Méthode en 4 étapes : compter (les quatre
règles du cahier de vacances, reprises **mot pour mot**, plus un compteur où
chaque chiffre s'allume ou reste gris) · pourquoi ce n'est pas de la coquetterie
(deux mesures sur le même axe, zones d'incertitude hachurées, l'une dix fois plus
étroite) · multiplication et division · **addition et soustraction**, avec
l'addition posée, alignée sur la virgule, et la colonne des millièmes barrée
d'un trait rouge. Puis 6 exercices, dont la **série mélangée de huit calculs** où
rien ne dit quelle règle appliquer — le seul exercice qui mesure vraiment si la
distinction est acquise.

---

## Ce qui t'attend — quatre points de fond

1. **Le statut des zéros de fin d'un entier.** Le brief demandait de traiter `50`
   comme **deux** chiffres significatifs (étape 1.3 de `o2`) et `100` comme **un
   seul** (exercice 2). Ce sont deux conventions incompatibles, dans le même
   outil, à deux écrans d'écart — et c'est exactement le genre de chose qu'un
   élève attentif relève. J'ai tranché en production : **les deux sont ambigus, et
   l'ambiguïté devient la leçon**. C'est elle qui justifie l'écriture scientifique,
   donc l'outil 1 ; le compteur le montre en orange, troisième couleur à côté de
   « compté » et « ne compte pas ». **C'est du fond : à confirmer ou à changer.**

2. **La série finale de `o2` compte huit calculs, contre six fournis.** Le brief
   demandait huit et n'en donnait que six. Les deux ajoutés — `0,456 × 12,3` et
   `6,20 − 0,025` — ne réemploient **que des nombres déjà présents** dans les six
   autres, et couvrent chacun une des deux règles. À valider.

3. **Le mot « Séance » que le moteur écrit dans la fiche qu'il génère.** Faux sur
   un outil. Accepté pour ce lot, comme convenu. En revanche j'ai appliqué ton
   arbitrage de nommage : à l'écran, la fiche imprimable est la **« fiche outil »**
   et le récapitulatif du moteur devient **« Mes réponses »** — renommé en local,
   sans toucher au moteur.

4. **Trois erreurs de calcul relevées, dont deux dans des documents partagés avec
   tes collègues** — à leur signaler :

   | Document | Erreur | Correction |
   |---|---|---|
   | `fiche (correction)_Convertir.pdf` | La ligne `379,45 kW` recopie les valeurs de la ligne précédente (`358 × 10³ W`) et aboutit à `3,58 × 10⁻⁴ GW` | `379,45 kW = 3,7945 × 10⁵ W` = **`3,7945 × 10⁻⁴ GW`** |
   | `fiche (correction)_Manipuler une relation algébrique.pdf`, niveau 1 | `a = b/c` donne `c = b/c` | `c = ` **`b/a`** *(à appliquer au lot 3)* |
   | Le brief lui-même, §6.2 exercice 6 | « 47 ordres de grandeur d'écart » | **46** : `22 − (−24) = 46`, soit un facteur `10⁴⁶` |

---

## Ce qui bloque les lots 2 et 3

🔴 **Les PDF sources ne sont pas dans le dépôt.** Rien dans `_biblio/`, rien dans
`assets/pdf/`.

`o1` et `o2` ont pu s'en passer : le brief portait tout leur contenu, et les
quatre règles de comptage étaient déjà rédigées et validées dans le cahier de
vacances (`cahier/diag-j01-…html`), d'où elles sont reprises mot pour mot.

**Ce ne sera pas le cas des lots suivants.** Il me faut :

- **lot 2 (`o3`, sécurité en salle de TP)** — `fiche_Sécurité au laboratoire de
  Chimie.pdf`, `fiche_Pictogrammes de sécurité.pdf`, `fiche_La verrerie de
  laboratoire.pdf`. Les deux dernières ne contiennent **que des images** : les
  neuf pictogrammes CLP et la verrerie sont entièrement à redessiner en SVG, et
  les libellés se reprennent mot pour mot de la fiche du collègue ;
- **lot 3 (`o4`, relation algébrique)** — `fiche_Manipuler une relation
  algébrique.pdf` et son corrigé. C'est **ton** fond, à conserver intégralement :
  les trois méthodes, dans ton ordre, avec ton jugement (« ma préférée »).

---

## Ce qui a surpris

### Le moteur a été conçu pour des mots, pas pour des nombres

Trois de ses comportements sont inoffensifs sur du texte et **nuisibles sur des
nombres**. Le premier est le plus grave.

**Sa normalisation efface le signe moins.** `normaliser()` remplace tout ce qui
n'est pas alphanumérique par une espace : `-3` et `3` deviennent tous deux `3`,
et `10^-3` devient indistinguable de `10^3`. Autrement dit, un élève qui oublie
le signe de l'exposant — **l'erreur la plus fréquente sur cet outil, et
précisément ce qu'il sert à corriger** — aurait été compté juste, en vert, sans
rien voir passer.

Le contournement ne touche pas le moteur : **le signe passe par un menu
déroulant**, que le moteur corrige à l'exact et sans tolérance. Les valeurs
internes sont des jetons opaques (`pos` / `neg`) parce que `+` et `−` se
normalisent tous deux en chaîne vide. C'est de là que vient la table de saisie à
trois colonnes — *nombre · a · signe de n · n* — qui structure les deux outils :
**une colonne par décision**, chaque case ne portant qu'un choix vérifiable.
Vérifié : un signe faux est refusé et le menu passe au rouge.

**Sa tolérance orthographique accepte un chiffre faux au-delà de quatre
caractères.** Mesuré : `255,1` est accepté pour `255,0`, `9,6486` pour `9,6485`.
L'élève voit alors la bonne valeur réécrite dans sa case, avec le message
« attention à l'orthographe, je l'ai corrigée pour toi ». Ce n'est pas silencieux,
mais ce n'est pas juste non plus. Corriger `seuil()` toucherait le moteur partagé :
j'ai gardé des réponses courtes partout où c'était possible, et **assumé la
tolérance** sur les trois réponses à plus de trois chiffres significatifs
(`9,6485`, `3,7945`, `255,0`). Le corrigé rédigé est juste en dessous.

Les deux points sont détaillés dans `DECISIONS.md` (M-1 à M-3) et dans
`_modeles/CONSIGNES-outil-PC.md` §6, avec les contournements.

### Trois pièges d'outillage

- **`.res` existait déjà** dans `sequence-snt.css`, en `display:flex`. Mes
  encadrés de résultat éclataient en trois lignes — sans erreur, sans
  avertissement, juste un rendu faux. Je compare désormais **par script** les
  classes du style inline avec celles de la feuille partagée : c'est le seul
  moyen de voir venir ça. La classe est renommée `.encadre`.
- **`verifier.mjs` lit les commentaires HTML.** Un commentaire expliquant que le
  sommaire généré n'était **pas** chargé suffisait à faire échouer son contrôle de
  version. Le nom s'écrit désormais sans son extension.
- **Le mode headless de Chrome impose une largeur de mise en page minimale
  d'environ 500 px.** Une capture demandée à 390 px **rogne** au lieu de replier :
  j'ai cru une demi-heure à un défaut de responsive qui n'existait pas. Le vrai
  contrôle se fait dans une iframe de 390 px.

### Le QR code

Aucun générateur dans le dépôt, et aucune bibliothèque autorisée. L'encodeur
écrit pour l'occasion (version 6, niveau M, mode octet) **s'autovérifie** avant
de sortir quoi que ce soit : syndromes Reed-Solomon tous nuls, et relecture de la
matrice produite qui doit rendre l'URL de départ. Le contrôle a trouvé deux vrais
défauts dès le premier essai — un polynôme générateur construit à l'envers, et un
bit de format écrasé par le module toujours noir. Les deux QR de ce lot sont
vérifiés bons.

---

## Deux angles morts de `verifier.mjs`, à connaître

Ce sont des **constats**, pas des demandes : les corriger modifierait
`verifier.mjs`, hors du périmètre de ce chantier.

1. **Trois contrôles ne s'appliquent pas aux outils.** Le filtre `pagesSNT` ne
   retient que les pages `2nde-snt-tN` et `2nde-snt-mN` : une page `2nde-pc-oN-…`
   n'y entre pas, et échappe donc aux contrôles « couleurs en dur hors `:root` »,
   « `localStorage` interdit » et « unicité des `data-cle` d'étape ». **Je les ai
   tenus à la main, et ils passent** : 16 clés d'étape uniques toutes préfixées
   `pc-o`, zéro couleur en dur (dans les `<style>` comme dans les SVG), zéro
   `localStorage`. En revanche le contrôle des versions d'assets, lui, balaie tout
   `pages/` et couvre bien les outils — c'est la raison pour laquelle les pages
   vivent là plutôt que dans un dossier séparé.
2. **Le bilan compte désormais « 16 chapitres PC ».** Son filtre est
   `/pages\/2nde-pc-/`, qui attrape les outils. Il y a bien 14 chapitres et
   2 outils. Le décompte des blocs `.a-faire` n'est pas affecté (149, inchangé).

---

## Contrôles passés

| Contrôle | Résultat |
|---|---|
| `node verifier.mjs` | **18 problèmes avant, 18 après** — les 18 liens `cfa/outil-*` attendus |
| Versions d'assets | alignées : `sequence-snt.css?v=41` · `sequence-snt.js?v=41` |
| Assets partagés modifiés | **aucun** |
| Banc d'essai `o1` | **15 assertions, 0 échec** — curseur exact sur toute la plage (aucun artefact de flottant : `1,6 × 10⁻¹²` donne bien `0,0000000000016`), signe d'exposant faux refusé, exposant faux d'une unité refusé |
| Banc d'essai `o2` | **22 assertions, 0 échec** — compteur exact sur onze nombres (dont `0,250`, `0,020540`, `100` et `50` en ambigus), mauvaise règle refusée, `0,2` refusé pour `0,20`, `1,27` refusé pour `1,28` |
| Erreurs JS sans base configurée | **0** sur les deux pages |
| Texte des SVG contre son `viewBox` | **144 textes mesurés, 0 débordement** (2 trouvés en cours de route, corrigés) |
| Défilement horizontal | **aucun** à 768 px ni à 390 px, sur les deux outils et sur le hub |
| Fiches A4 | **2 pages exactement** chacune, mesurées et confirmées à l'export PDF (209,9 × 297,0 mm) |
| Marge restante sur les fiches | `o1` : 16 mm au recto, 11 mm au verso · `o2` : 23 mm et 19 mm |
| QR codes | syndromes Reed-Solomon nuls, relecture rendant l'URL exacte, chemins identiques à la sortie du générateur |

Une décision de rendu vaut d'être signalée : sur téléphone, les tables de saisie
**se replient** — l'énoncé sur sa propre ligne, les champs dessous. À trois
colonnes, la série finale de `o2` obligeait sinon à faire défiler le bloc
latéralement **huit fois de suite**.

---

## Reste à faire

- Lire les deux outils à l'écran et trancher les quatre points de fond ci-dessus.
- Me transmettre les quatre PDF sources des lots 2 et 3.
- Décider si `o3` et `o4` doivent apparaître au hub en « 🚧 en travaux » dès
  maintenant. Je ne les y ai **pas** mis : on ne promet rien aux élèves.
