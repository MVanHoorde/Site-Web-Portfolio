# CONSIGNES — Outil transversal de physique-chimie

*Conventions de production de la **quatrième famille** de pages du dépôt. La doc
décrit l'état courant : quand une décision change, on réécrit le passage, on
n'empile pas.*

## Portée & contexte (à lire avant tout)

Ce document couvre les **outils transversaux de physique-chimie** :
`pages/2nde-pc-oN-<slug>.html`. Ce sont des **fiches de méthode que tous les
chapitres mobilisent**, indépendantes de la progression annuelle et disponibles
toute l'année — un élève de janvier et un élève de septembre y accèdent pareil.

⚠ **Un outil n'est ni un chapitre, ni une séquence, ni une fiche CFA.** Les
quatre familles du dépôt coexistent et ne se transposent pas :

| | **Outil PC** *(ce document)* | Chapitre PC | Séquence SNT | Fiche-outil CFA |
|---|---|---|---|---|
| Consignes | ce fichier | `CONSIGNES-chapitre-PC.md` | `CONSIGNES-sequence-SNT.md` | `CONSIGNES-fiche-outil-CFA.md` |
| Progression | **aucune** — ouvert toute l'année | thème → chapitre | séquence → séance | livret ordonné |
| Moteur | `sequence-snt.js` + `sequence-snt.css` | `chapitre-commun.css` | `sequence-snt.*` | `cfa-commun.css` |
| Persistance | base Supabase | `localStorage` | base Supabase | base Supabase |
| Fiche A4 | **complétée**, à coller | à trous, à remplir en classe | générée par le moteur | à trous, trois paliers |
| Corrigés | **en ligne, sur la page** | dépliables | en direct | **jamais en ligne** |

🔴 **Les corrigés en ligne sont propres aux outils PC**, et ils contredisent
délibérément le §7 des consignes CFA (« les corrigés ne sont pas en ligne »).
Cette phrase-là ne vaut **que** pour le livret CFA. Motif ici : les exercices
d'un outil se font **à la maison**, le soir ; un élève doit pouvoir se corriger
seul sans attendre le cours suivant. Ne pas « harmoniser » les deux familles.

**État au 28/08/2026 :** **les huit outils sont écrits**, tous en **V1 proposée,
non validée**. Le catalogue a été **renuméroté** le 28/08 (décision O-23) et
range les outils dans l'ordre où un élève de seconde les rencontre :

| N | Titre | État |
|---|---|---|
| `o1` | Puissances de dix et écriture scientifique | écrit, V1 |
| `o2` | Les chiffres significatifs | écrit, V1 |
| `o3` | Sécurité au laboratoire | écrit, V1 |
| `o4` | La verrerie et le matériel de laboratoire | écrit, V1 |
| `o5` | Rédiger un compte rendu de TP | écrit, V1 |
| `o6` | Présenter un calcul | écrit, V1 |
| `o7` | Manipuler une relation algébrique | écrit, V1 |
| `o8` | Construire et exploiter un graphique | écrit, V1 |

**« Convertir » ne fait plus partie du catalogue.** `o1` en a absorbé tout le fond
le 26/08 — les préfixes dans les deux sens, les unités composées, les volumes, les
surfaces : un outil dédié ferait doublon avec son étape 1.4. Sa série de douze
conversions rejoint la section 2 de `o1`.

**Deux gabarits existent depuis le 28/08** : `_modeles/gabarit-outil-PC.html` et
`_modeles/gabarit-fiche-outil-PC.html`. Un nouvel outil s'écrit **en les
copiant**. Jusqu'ici `o1` servait de gabarit par copier-coller, et c'est
exactement la manière de perdre une convention en la recopiant de travers.

🔴 **Les douze PDF sources sont dans `_a-deposer/fiches-outils/`** — dossier
gitignoré, jamais publié. Trois leçons durables, toutes payées :

1. **Le brief résume la source, il ne la remplace pas.** Il annonçait « les trois
   niveaux » d'une fiche qui en compte cinq, et un tri de la verrerie qui n'est pas
   celui du collègue. **Toujours lire la source avant d'écrire**, même quand le
   brief semble complet.
2. **Une source peut contredire une autre.** La fiche « Écriture scientifique »
   affirme que « les zéros situés à droite sont significatifs » ; le brief demande
   que `100` soit ambigu. Quand deux fonds se contredisent, on ne tranche pas seul :
   on écrit la version la plus défendable, **on la signale comme un écart**, et on
   attend l'arbitrage.
3. **Un arbitrage en attente arrête la production.** Deux d'entre eux ont coûté
   deux jours en août. Depuis le 28/08, chaque arbitrage porte un **défaut
   appliqué sans attendre**, marqué `PROPOSITION À VALIDER` dans le fichier
   produit et listé dans le `A-LIRE`. On ne bloque plus, on propose.

**Les erreurs de calcul des documents sources se corrigent *et* se listent**, dans
`_suivi/erreurs-sources-fiches-outils.md`, pour que l'équipe soit prévenue. C'est
la seule exception à la règle « on refait la forme, jamais le fond ».

---

## 1. Nommage

| Objet | Forme | Exemple |
|---|---|---|
| Page écran | `pages/2nde-pc-oN-<slug>.html` | `pages/2nde-pc-o1-ecriture-scientifique.html` |
| Clé de page | `<body data-sequence="pc-oN" data-etapes="ouvertes">` | `data-sequence="pc-o1"` |
| Fiche A4 | `fiches/fiche-2nde-oN-<slug>.html` | `fiches/fiche-2nde-o1-ecriture-scientifique.html` |
| Images éventuelles | `assets/img/pc/2nde-pc-oN-<slug>/` | — |
| Préfixe des `data-cle` | `pc-oN-…` | `pc-o1-s2-convertir` |
| Titre affiché (`h1.title`) | le titre, **sans** numéro | Puissances de dix et écriture scientifique |

`N` sur un chiffre. Le slug est en minuscules, sans accent, mots séparés par des
tirets.

🔴 **`data-etapes="ouvertes"` n'est pas décoratif** : c'est lui qui dit au moteur
partagé de ne rien verrouiller sur cette page — ni révélation étape par étape,
ni cascade de séances. **Tout outil le porte, sans exception.** L'oublier rend
la page indistinguable d'une séquence SNT : l'élève arriverait sur une seule
étape visible et devrait « mériter » la partie « S'entraîner ». Voir §2.

🔴 **Les pages vivent dans `pages/`, pas dans un dossier à part.** Le contrôle de
synchronisation des `?v=` de `verifier.mjs` ne parcourt que `pages/` : un dossier
séparé sortirait du filet sans que rien ne le signale.

### Les assets, aux versions en vigueur

```html
<link rel="stylesheet" href="../assets/css/fonts.css">
<script src="../assets/js/progression.js?v=16"></script>
<link rel="stylesheet" href="../assets/css/sequence-snt.css?v=41">
<!-- … en fin de body : -->
<script src="../assets/js/sequence-snt.js?v=42"></script>
```

⚠️ **Le sommaire des séances et le verrou de progression ne sont PAS chargés** :
un outil n'a ni rang, ni plafond d'avance, ni verrou inter-pages. Le moteur les
teste par `window.VerrouSNT &&` : leur absence est prévue et gérée.

🔴 **Ne jamais écrire le nom d'une feuille ou d'un script versionné suivi de son
extension, même dans un commentaire HTML.** `verifier.mjs` cherche ces chaînes
dans **tout** le HTML, commentaires compris, et signale alors la page comme les
chargeant sans numéro de version. Cela vaut au moins pour **`seances-snt`** et
pour **`chapitre-commun`** — les deux ont mordu, le second le 28/08 dans un
commentaire de `o5` qui disait simplement qu'un outil ne charge pas cette
feuille. Écrire « le sommaire généré (`assets/js/seances-snt`) » et « la feuille
des chapitres (`assets/css/chapitre-commun`) ».

---

## 2. Structure interne — deux sections, jamais plus

Le moteur ne connaît que `section.seance` → `div.step`. On s'en sert ainsi,
**pour tous les outils sans exception** :

| Section | `id` | Titre affiché | Contenu |
|---|---|---|---|
| **1** | `s1` | **La méthode** | 3 à 5 étapes de cours, chacune avec son visuel et son exemple entièrement résolu. Aucun exercice noté. |
| **2** | `s2` | **S'entraîner** | Les exercices corrigés, en `data-gate`. C'est le travail à la maison. |

**Les deux sections sont ouvertes, et toutes leurs étapes avec elles.** La
section 2 ne porte **pas** `locked`, et aucune étape n'est masquée : c'est
`data-etapes="ouvertes"` sur le `<body>` qui neutralise les deux verrous du
moteur partagé (`initReveal()` et la cascade de `refresh()` dans
`sequence-snt.js`). Rien d'autre à coder — et rien à recopier de SNT : le bouton
« Étape suivante ↓ » n'est même pas créé ici.

Motif : un outil se consulte, il ne se parcourt pas. L'élève qui cherche
comment convertir des cm³ en m³ un soir de mars doit tomber sur l'étape 1.4,
pas sur un chemin à refaire depuis 1.1 ; et les exercices du soir ne se méritent
pas — ils sont le travail à la maison, pas une récompense.

Ce que le drapeau ne change **pas** : la barre de progression, les pastilles, la
validation des étapes et l'enregistrement en base fonctionnent comme ailleurs.
Sur un outil, la progression est un **pense-bête**, pas une note.

**Aucun verrouillage entre outils, ni entre outils et chapitres.** C'est la
progression du professeur qui décide quand un outil est traité, pas le site.

### Vocabulaire à l'écran — une seule fiche

Sur un outil, **« la fiche » désigne un seul objet** : la **fiche outil**, la
feuille A4 imprimable qui porte le cours et qu'on colle dans le cahier. Le
récapitulatif de réponses que le moteur SNT sait produire **n'existe pas ici** :
il n'a aucun intérêt sur un outil, où la fiche s'imprime complète et où l'élève
n'a rien à déposer.

Le moteur, lui, le propose à **trois** endroits — la barre d'actions de fin de
partie, la modale de « Recommencer » et la pop-up de fin de séance. **Ne pas
modifier le moteur pour autant** : il est partagé par huit pages, et le §5
l'interdit. On retire ses boutons **en local**, par le script de la page :
recopier telle quelle la fonction `retirerFichePDF()` de `o1` ou `o2`, qui
balaie la barre et installe un `MutationObserver` sur la modale — les deux
dernières sont construites à la demande, un simple balayage au chargement les
manquerait. Le bouton « Recommencer », lui, reste : il est utile.

⚠ **La case `<input type="checkbox" id="teacherMode" hidden>` de `nav.seances`
doit rester dans la page**, même quand le bloc `.ens-zone` du mode enseignant
est retiré : le moteur l'attrape sans garde (`sequence-snt.js` l.350) et toute
son initialisation s'arrête si elle manque — barre de progression et modales
comprises. Sans `.ens-zone`, plus rien ne peut la cocher : elle est inerte.

---

## 3. Le trajet d'une étape de méthode

Toujours dans cet ordre :

1. **l'objectif** (🎯), une phrase ;
2. **le contenu**, porté par un **visuel** — le schéma explique, le texte
   accompagne ;
3. **un « à retenir »** (`.retain`, marque `★★`), en **trois temps** — voir
   ci-dessous. **Posé en clair, pas dans un `data-bilan-wrap`** : sur un outil,
   le test qui suit est une vérification, pas une évaluation — il n'y a rien à
   protéger d'une révélation anticipée ;
4. **un exemple entièrement résolu** (`.exemple`), ouvert par défaut ;
5. **un test après chaque bloc de contenu, dimensionné au bloc.** Une étape qui
   introduit quatre règles, un tableau et trois cas ne se ferme pas sur deux
   cases : chaque bloc se teste **là où il est introduit**, avec l'outil qui lui
   convient — `data-cloze` court pour une règle, tableau `.saisie` pour des
   conversions, `.qcmbox` pour un tableau de référence ou une série de pièges.
   La méthode se vérifie, elle ne s'évalue pas — mais elle se vérifie
   **vraiment**.

#### La structure d'un « à retenir » — trois temps

Convention de la famille, arrêtée le 27/08/2026 après l'audit du lot 1. Elle
vaut pour `o3` à `o8`. Le `.retain` du moteur reste le conteneur ; à
l'intérieur, une grille locale de trois lignes, chacune précédée d'une petite
étiquette monospace (`.ret-t` / `.ret-e` / `.ret-c`, à recopier de `o1`) :

| Temps | Ce qu'il porte |
|---|---|
| **la règle** | la formule ou la phrase-règle, **grande, centrée, respirée** (`.ret-f`) — et rien d'autre |
| **le geste** | ce qu'on fait, à l'infinitif, une ligne |
| **le contrôle** | ce qu'on vérifie avant de passer à la suite, une ligne |
| **le piège** | quatrième temps facultatif, étiquette en rouge (`.ret-t.piege`) |

**Le gras ne sert plus qu'à un mot par ligne**, celui qui décide. Motif : le
bloc d'avant était un pavé où tout était en gras — et quand tout est en gras,
rien ne l'est. La référence de forme est le composant `.exemple`, qui fonctionne
parce qu'il est structuré : étiquette courte, contenu bref, une idée par ligne.

Une règle ne se **redit** pas dans le « à retenir » si elle est déjà affichée en
clair juste au-dessus (les quatre règles de calcul de `o1` 1.3, les quatre cas
de `o2` 1.1) : on y **renvoie**.

### Marquage d'évaluabilité

L'échelle SNT (`.niv`) s'applique : `★★` à savoir · `★` à savoir faire · `○`
support · `—` non évalué. Un outil est presque intégralement `★★` et `★` : c'est
sa nature.

### Ton

Phrases courtes, une consigne par phrase, verbe à l'infinitif en tête. Jamais
« il suffit de », « on sait que », « rappelons que ». Le tutoiement, comme dans
le cahier de vacances et les séquences SNT.

---

## 4. Les quatre règles de rédaction d'un calcul

**Tout calcul montré, à l'écran comme sur la fiche A4, suit ces quatre étapes** —
identiques à `CONSIGNES-fiche-outil-CFA.md` §5 : c'est le même geste, on ne le
réinvente pas.

1. relever les données utiles, **avec leur unité**, avant tout calcul ;
2. écrire la **relation en lettres** avant de remplacer ;
3. faire l'**application numérique en nombres**, et **encadrer le résultat avec
   son unité** ;
4. conclure par une **phrase chiffrée**.

**Une cinquième vérification s'ajoute, et c'est la signature de la famille :**
*le résultat porte-t-il le bon nombre de chiffres significatifs ?* Elle se montre
sur **chaque** exemple résolu.

Ces cinq temps ne s'énoncent pas dans un encadré à part : ils **sont** la
structure du composant `.exemple`, une ligne numérotée chacun, toujours dans le
même ordre. L'élève finit par les reconnaître sans qu'on les lui ait récités.

---

## 5. Ce qui est interdit

- ❌ **Toucher à `assets/js/sequence-snt.js` ou à `assets/css/sequence-snt.css`.**
  Ce sont les assets partagés les plus chargés du dépôt. Si le moteur manque de
  quelque chose : le **signaler** dans la livraison, et coder l'appoint **en
  local dans la page**.
- ❌ **Toute migration de base de données.** Les outils n'utilisent que des
  mécanismes déjà en base.
- ❌ **Tout nouveau type de champ.** Les exercices se construisent avec
  `data-cloze` et `data-qcm`, exactement comme l'étape 5.1 de `t1` et les
  ateliers de `m1`.
- ❌ **Inscrire un outil dans `generer-seances.mjs`** ou dans le sommaire généré :
  lui donner un rang dans une progression à laquelle il n'appartient pas
  fausserait le plafond d'avance de tous les élèves. Le fichier est régénéré par
  script : une modification à la main serait écrasée.
- ❌ **Tout générateur aléatoire, tirage, score chiffré ou note.** Listes
  d'exercices **fixes**, identiques pour tous.
- ❌ **Toute ressource externe** : pas de CDN, pas de police distante, pas d'image
  téléchargée à la volée. Les pictogrammes et les schémas se **dessinent en SVG**.
- ❌ **Toute couleur en dur.** Tout passe par les variables de `sequence-snt.css`.

---

## 6. Le composant exercice

**Aucun nouveau composant de moteur.** Un exercice est un bloc local :

```html
<div class="exo" data-cle="pc-o1-s2-ex3">
  <p class="exo-num">Exercice 3</p>
  <p class="exo-enonce">…</p>
  <div class="field">
    <span class="field-type">Exercice 3</span>
    <div class="cloze" data-cloze data-cle="ex3"> … </div>
    <div><button class="btn ghost" data-check-cloze>Vérifier l'exercice 3</button></div>
    <div class="verdict"></div>
  </div>
  <p class="exo-consigne">✏️ Cherche d'abord sur ta feuille, puis compare.</p>
  <details class="exo-corr">
    <summary>Voir le corrigé rédigé</summary>
    <div class="corps"><!-- calcul entièrement rédigé, les cinq temps du §4 --></div>
  </details>
</div>
```

- **`.exo` et `.exo-corr` sont des classes locales à la page** (CSS inline en
  tête, comme `m1`), pas des ajouts au moteur.
- **Le corrigé est un `<details>` fermé, jamais verrouillé, jamais minuté.**
  L'élève est chez lui, le soir : lui refuser le corrigé pendant trois minutes ne
  l'aide pas, ça le décourage. La phrase « cherche d'abord » suffit — c'est le
  contrat, pas une serrure.
- **Le corrigé est rédigé, pas un nombre.** Un corrigé qui affiche « 0,12 »
  n'apprend rien à qui a trouvé 0,124.
- **Clés :** `data-cle` prefixée par la clé de l'outil sur le `.step` et sur le
  `.exo` ; le `.cloze` porte une clé courte. Le moteur compose
  `<clé d'étape>/<clé de cloze>` : la clé enregistrée est donc déjà préfixée et
  indépendante de la position du champ dans la page.

### 🔴 Écrire des réponses numériques dans un trou — les trois pièges du moteur

Le moteur a été conçu pour des **mots**. Trois de ses comportements sont
inoffensifs sur du texte et nuisibles sur des nombres. Ils sont **vérifiés** sur
`o1` et `o2` ; les contourner fait partie du métier ici.

**a · La normalisation efface le signe moins.** `normaliser()` remplace tout ce
qui n'est pas alphanumérique par une espace : `-3` et `3` deviennent tous deux
`3`, et `10^-3` devient indistinguable de `10^3`. Un élève qui oublie le signe
de l'exposant — **l'erreur la plus fréquente** — serait compté juste, en vert,
sans rien voir.
→ **Le signe passe par un `<select>`**, jamais par un champ texte. Un
`select[data-answer]` placé dans un `.cloze` est corrigé **à l'exact, sans
Levenshtein** (`sequence-snt.js`, « trous en menu déroulant »). Les `value` des
options doivent être des jetons **distincts après normalisation** — `pos` et
`neg`, jamais `+` et `−`, qui se normalisent tous deux en chaîne vide :

```html
<select class="short" data-answer="neg" aria-label="signe de l'exposant">
  <option value="">?</option><option value="pos">+</option><option value="neg">−</option>
</select>
```

**b · Levenshtein tolère une faute au-delà de 4 caractères.** `seuil()` rend 0
pour un mot de 4 caractères ou moins **et pour un entier pur**, 1 jusqu'à 7, 2
au-delà. Une réponse dont la forme normalisée dépasse 4 caractères accepte donc
un chiffre faux, marqué « presque », avec la bonne valeur réécrite dans la case
et signalée à l'élève. Mesuré : `255,1` est accepté pour `255,0`, `9,6486` pour
`9,6485`.
→ Sans faute, avec `seuil` à 0 : les entiers (`3`, `24`) et toute réponse dont la
forme normalisée tient en 4 caractères (`0,20` → `0 20`, `1,28` → `1 28`, `8,6` →
`8 6`). **Au-delà de trois chiffres significatifs, la tolérance existe** : la
prévoir, ou découper la réponse en plusieurs champs courts.

**c · Une réponse composée d'un seul champ est illisible.** `5,25×10⁶` saisi de
six manières différentes se normalise de six manières différentes, et les
exposants Unicode (`10⁻¹⁹`) disparaissent purement et simplement.
→ **Découper : une colonne par décision.** Le tableau `.saisie` est là pour ça —
`nombre | a | signe de n | n` — chaque case ne portant qu'un choix, et chaque
choix étant vérifiable à l'exact.

---

## 7. La fiche A4 — complétée, imprimable

🔴 **Le HTML est la SOURCE, le PDF est ce qui se distribue.** Depuis le 28/08,
`fiches/fiche-2nde-oN-….html` n'est plus lié directement : la page et le hub
pointent vers son export `assets/pdf/pc/fiches/fiche-2nde-oN-….pdf`, produit par
`node exporter-fiches.mjs`. Le script contrôle à la mesure le format (A4
209,9 × 297,0 mm), la pagination (une `.feuille` = une page) et les polices
incorporées — trois écarts qu'une impression manuelle laisse passer et qui ne se
voient que sur la photocopie distribuée en classe. **Ne jamais modifier un PDF
directement** : on modifie le HTML et on relance le script.

Dérive de `fiches/fiche-2nde-t1c4.html` : `@page size:A4; margin:0`, `.feuille`
de 210 × 297 mm, la bande à trois repères, fond blanc forcé à l'impression.

- **Exactement deux pages par outil** (recto-verso). Déborder est un bug. `o3`
  peut aller à quatre : les pictogrammes prennent la place qu'ils prennent.
- **Le cours est complet, les exemples résolus. Aucun trou.** Elle se distribue
  en classe et se colle ; on ne perd pas d'heure à la remplir. Le travail de
  l'élève est dans les exercices, à la maison.
- **Pas de marge de notes** — contrairement à la fiche de chapitre. La fiche
  d'outil est dense et le cours y tient en entier.
- **Les exercices ne sont pas sur la fiche** : ils sont en ligne, où ils sont
  corrigés. La fiche porte un **QR code** vers la page, généré une fois en SVG et
  collé inline, plus une ligne qui dit ce qu'on y trouve.
- 🔴 **Aucune information ne doit exister uniquement à l'écran** pour la partie
  cours : ce qui est dans la méthode en ligne est sur la fiche. Un composant
  interactif (curseur, compteur) n'est pas de l'information : il se remplace par
  la table ou le schéma qui porte le même contenu.
- Lisible **en noir et blanc sur une photocopie**. Une zone d'incertitude, un
  danger, une différence de précision se marquent par des **hachures** autant que
  par la couleur.

### 🔴 Le PDF est un export, le HTML est la source

Décision du 28/08/2026. **Les fiches de 2nde PC se distribuent en PDF**, jamais
en page HTML. Pour un outil, **c'est l'élève qui imprime**, quand il en a
besoin : le lien vers le PDF n'est donc **jamais derrière un verrou** et
n'attend rien — l'outil est ouvert toute l'année (§2), sa fiche aussi.

Le HTML reste ce qu'on maintient, corrige et relit ; le PDF se **régénère**. Un
PDF corrigé à la main serait écrasé au premier export suivant, et les deux
divergeraient sans que rien ne le signale.

    node exporter-fiches.mjs        toutes les fiches
    node exporter-fiches.mjs o3     seulement celle-là

Le script pilote Chrome par le protocole de débogage, dépose dans
`assets/pdf/pc/fiches/`, et **contrôle chaque export à la mesure** :

- **format** — `209,9 × 297,0 mm`, la signature d'un A4 non redimensionné. Un
  écart veut dire que le `@page size:A4` de la fiche a été ignoré : c'est ce que
  fait « Ctrl+P → Enregistrer en PDF », qui sort du Letter sans le dire.
- **pagination** — une `.feuille` dans la source, une page dans le PDF. Une page
  de plus, c'est du contenu qui a débordé de sa feuille. Le plafond de deux
  pages (quatre pour `o3`) est contrôlé en plus.
- **polices incorporées** — les six familles sont auto-hébergées, elles doivent
  se retrouver *dans* le PDF, sinon la fiche imprimée n'a plus la tête du site.
  Le script signale aussi les **polices de repli** : un caractère servi par
  Consolas ou Times est un caractère qu'aucune de nos six familles ne couvre —
  même piège que le fleuron `U+2766` des encarts d'histoire.

**L'ordre est : produire l'export, le vérifier, puis changer le lien.** Un lien
vers un PDF absent est pire que l'ancien lien HTML. Et le PDF **repart dans la
même livraison que le HTML modifié**, jamais l'un sans l'autre.

Ce qui **ne change pas** : le **QR code** de la fiche continue de pointer vers la
**page en ligne** de l'outil, pas vers le PDF — son intérêt est de ramener
l'élève aux exercices corrigés, qui ne sont pas sur la feuille.

### Générer le QR code

Aucune bibliothèque, aucun appel externe (§5). Le générateur maison vit dans le
répertoire de travail de la session, pas dans le dépôt : encodeur version 6 ·
niveau M · mode octet, qui **s'autovérifie** de deux façons avant de sortir quoi
que ce soit — syndromes Reed-Solomon tous nuls, et relecture de la matrice
produite rendant l'URL de départ. **Ne jamais recopier un chemin de QR à la
main** : coller le fichier généré, et comparer l'attribut `d` avec la sortie du
générateur.

---

## 8. Le hub

Les outils forment une famille **« Outils transversaux »** placée **juste après
le chapeau, avant le Thème 1** de `pages/2nde-physique-chimie.html` — l'inverse
du hub SNT, où les modules transversaux viennent après « Pour commencer », parce
qu'ici les outils précèdent toute la progression.

Markup existant, aucun composant nouveau : `<h2 class="theme">` pour le titre de
famille, un chapeau d'une phrase, puis un `<article class="chapitre">` par outil
avec `<span class="chapitre-num">OUTIL N</span>`, `<h3>`, une phrase de résumé, et
la liste `<ul class="docs">` portant **deux** entrées — « Cours en ligne → » et
« Fiche à imprimer → ». **Pas de carte pour un outil qui n'existe pas encore** :
on ne promet rien aux élèves.

---

## 9. Validation avant livraison

- [ ] `node verifier.mjs` → **exactement 18 problèmes** (les 18 liens
      `cfa/outil-*` vers des fiches non écrites). Tout écart est une régression.
- [ ] `node verifier.mjs --bilan` avant / après.
- [ ] Chaque page charge `sequence-snt.css` et `sequence-snt.js` dans la **même
      version** que les autres pages de `pages/`. Contrôle **bloquant**.
- [ ] Aucun asset partagé modifié.
- [ ] **Aucune collision de classe CSS** entre le style inline de la page et
      `sequence-snt.css`. Le comparatif se fait par script, pas à l'œil :
      `.res` existe déjà dans la feuille partagée en `display:flex`, et un
      encadré de résultat nommé ainsi éclate en trois lignes sans prévenir.
- [ ] Aucune couleur en dur, aucune ressource externe.
- [ ] Chaque `data-cle` commence par `pc-oN-` et ne dépend pas de la position du
      champ dans la page.
- [ ] La page s'ouvre **sans base configurée** : la console peut informer, elle
      ne doit pas jeter d'erreur.
- [ ] **Le texte des SVG ne dépasse pas du `viewBox`** — il serait rogné en plein
      mot, sans prévenir. Se mesure par `getBBox()` sur chaque `text`, pas à
      l'œil.
- [ ] Rendu vérifié à **768 px (iPad) et 390 px (téléphone)** : aucun débordement
      horizontal, aucune figure rognée, aucune table qui oblige à défiler
      latéralement ligne après ligne.
      🔴 **Le mode headless de Chrome impose une largeur de mise en page minimale
      d'environ 500 px** : une capture demandée à 390 px **rogne** au lieu de
      replier, et donne l'illusion d'un défaut qui n'existe pas — ou masque
      l'inverse. Mesurer le `scrollWidth` dans une **iframe** de 390 px, et
      capturer cette iframe.
- [ ] La fiche A4 tient en **deux pages exactement**, vérifié en aperçu avant
      impression **et** à la mesure (hauteur de contenu contre 297 mm).
- [ ] Focus clavier visible, `prefers-reduced-motion` respecté.
- [ ] L'outil est atteignable depuis le hub PC, et la fiche depuis la page.

### Ce que `verifier.mjs` ne voit pas sur un outil

Son filtre `pagesSNT` vaut `/pages\/2nde-snt-(t\d|m\d)/` : une page
`2nde-pc-oN-…` **n'y entre pas**. Trois contrôles ne s'appliquent donc pas aux
outils, et doivent être tenus à la main : **couleurs en dur hors `:root`**,
**`localStorage` interdit**, **unicité des `data-cle` d'étape**. En revanche le
contrôle des versions d'assets, lui, balaie tout `pages/` et couvre bien les
outils — c'est la raison pour laquelle les pages vivent là (§1).

---

## 10. Livraison

- **Archive delta**, jamais le dépôt complet.
- Mise à jour de `_suivi/ETAT-PROJET.md` (réécrit, pas empilé),
  `_suivi/DECISIONS.md`, `_suivi/chapitres.md` (une section par outil) et
  `_suivi/JOURNAL.md` (en ajout).
- Un `A-LIRE-…` court : ce qui est fait, ce qui reste, ce qui a surpris.
- **Signaler toute correction apportée à un document source partagé avec des
  collègues** : on refait la forme, jamais le fond — sauf erreur de calcul, qui
  se corrige *et* se liste, pour que l'équipe soit prévenue.

---

## 11. Ce qui n'est pas encore arrêté

1. **L'élargissement du filtre `pagesSNT` de `verifier.mjs`** aux pages
   `2nde-pc-oN`, qui rendrait aux outils les trois contrôles du §9 — et le
   contrôle des biais de longueur des QCM, qui compte double depuis que les
   outils en portent (six questions dans `o1` 1.2, dix dans `o1` 1.3, six dans
   `o2` 1.2). Modification de `verifier.mjs`, hors périmètre du chantier.
2. **Sept arbitrages sont appliqués par défaut, non confirmés** — O-23 à O-29,
   tous ⏳ sauf O-27 (la conduite en cas d'incident, tranchée par Loïc le 28/08).
   Chacun est marqué `PROPOSITION À VALIDER` dans le fichier qu'il produit. Ils
   ne bloquent plus la production : c'est le point de la leçon 3 ci-dessus.
3. 🔴 **`o3` engage la sécurité d'élèves.** Son étape « Si ça tourne mal » doit
   être relue contre le **règlement du laboratoire de l'établissement** et contre
   les équipements réellement présents en **salle 0.26**. Aucun autre contenu du
   dépôt n'a cette contrainte.

### Deux questions tranchées le 27/08/2026 — ne pas les rouvrir

- **Le mot « Séance » dans la fiche générée par le moteur** : la question tombe
  d'elle-même, la fiche générée est retirée des outils (§2).
- **Le statut des zéros de fin d'un entier** : tranché. **Les zéros à droite
  comptent**, y compris dans un entier — `100` fait trois chiffres
  significatifs, `50` en fait deux. Il n'y a **pas** de zéro ambigu en seconde,
  et la notion qui prend sa place est celle du **nombre exact** (issu d'une
  formule, d'une définition ou d'un dénombrement), qui ne se compte pas.
