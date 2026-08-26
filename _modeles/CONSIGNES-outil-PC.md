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

**État au 25/08/2026 :** deux outils produits (`o1` écriture scientifique, `o2`
chiffres significatifs), en **V1 proposée, non validée**. `o3` sécurité en salle
de TP et `o4` manipuler une relation algébrique sont cadrés mais non écrits.
Numéros réservés, à ne pas produire sans commande : `o5` convertir · `o6`
présenter un calcul · `o7` construire et exploiter un graphique · `o8` rédiger un
compte rendu de TP.

---

## 1. Nommage

| Objet | Forme | Exemple |
|---|---|---|
| Page écran | `pages/2nde-pc-oN-<slug>.html` | `pages/2nde-pc-o1-ecriture-scientifique.html` |
| Clé de page | `<body data-sequence="pc-oN">` | `data-sequence="pc-o1"` |
| Fiche A4 | `fiches/fiche-2nde-oN-<slug>.html` | `fiches/fiche-2nde-o1-ecriture-scientifique.html` |
| Images éventuelles | `assets/img/pc/2nde-pc-oN-<slug>/` | — |
| Préfixe des `data-cle` | `pc-oN-…` | `pc-o1-s2-convertir` |
| Titre affiché (`h1.title`) | le titre, **sans** numéro | Puissances de dix et écriture scientifique |

`N` sur un chiffre. Le slug est en minuscules, sans accent, mots séparés par des
tirets.

🔴 **Les pages vivent dans `pages/`, pas dans un dossier à part.** Le contrôle de
synchronisation des `?v=` de `verifier.mjs` ne parcourt que `pages/` : un dossier
séparé sortirait du filet sans que rien ne le signale.

### Les assets, aux versions en vigueur

```html
<link rel="stylesheet" href="../assets/css/fonts.css">
<script src="../assets/js/progression.js?v=16"></script>
<link rel="stylesheet" href="../assets/css/sequence-snt.css?v=41">
<!-- … en fin de body : -->
<script src="../assets/js/sequence-snt.js?v=41"></script>
```

⚠️ **Le sommaire des séances et le verrou de progression ne sont PAS chargés** :
un outil n'a ni rang, ni plafond d'avance, ni verrou inter-pages. Le moteur les
teste par `window.VerrouSNT &&` : leur absence est prévue et gérée.

🔴 **Ne jamais écrire le nom du fichier `seances-snt` suivi de son extension,
même dans un commentaire HTML.** `verifier.mjs` cherche cette chaîne dans **tout**
le HTML, commentaires compris, et signale alors la page comme le chargeant sans
numéro de version. Écrire « le sommaire généré (`assets/js/seances-snt`) ».

---

## 2. Structure interne — deux sections, jamais plus

Le moteur ne connaît que `section.seance` → `div.step`. On s'en sert ainsi,
**pour tous les outils sans exception** :

| Section | `id` | Titre affiché | Contenu |
|---|---|---|---|
| **1** | `s1` | **La méthode** | 3 à 5 étapes de cours, chacune avec son visuel et son exemple entièrement résolu. Aucun exercice noté. |
| **2** | `s2` | **S'entraîner** | Les exercices corrigés, en `data-gate`. C'est le travail à la maison. |

La section 2 porte `class="seance locked"` : elle s'ouvre quand la méthode est
parcourue. C'est la cascade standard du moteur, rien à coder.

**Aucun verrouillage entre outils, ni entre outils et chapitres.** C'est la
progression du professeur qui décide quand un outil est traité, pas le site.

### Vocabulaire à l'écran — deux objets, deux mots

| Objet | Nom à l'écran |
|---|---|
| La fiche A4 imprimable (le cours) | **fiche outil** |
| Le récapitulatif produit par le moteur (le travail de l'élève) | **Mes réponses** |

Le moteur écrit « 📄 Ouvrir ma fiche (PDF) » sur son bouton, et « Séance 1 » dans
la fiche qu'il génère. Les deux sont faux sur un outil. **Ne pas modifier le
moteur pour autant** : il est partagé par huit pages, et le §5 l'interdit. Le
bouton se renomme **en local**, une seule fois, par le script de la page (voir la
fonction `renommerFiche()` de `o1` et `o2`, à recopier telle quelle). Le mot
« Séance » de la fiche générée reste, lui, en attente d'arbitrage.

---

## 3. Le trajet d'une étape de méthode

Toujours dans cet ordre :

1. **l'objectif** (🎯), une phrase ;
2. **le contenu**, porté par un **visuel** — le schéma explique, le texte
   accompagne ;
3. **un « à retenir »** (`.retain`, marque `★★`) : la règle, quatre lignes
   maximum. **Posé en clair, pas dans un `data-bilan-wrap`** : sur un outil, le
   micro-champ qui suit est une vérification, pas une évaluation — il n'y a rien
   à protéger d'une révélation anticipée ;
4. **un exemple entièrement résolu** (`.exemple`), ouvert par défaut ;
5. **un micro-champ de vérification** — un `data-cloze` d'une ou deux cases, pas
   davantage. La méthode se vérifie ici, elle ne s'évalue pas.

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

1. **Le mot « Séance » dans la fiche générée par le moteur.** Faux sur un outil.
   Trois issues : l'accepter, ajouter un attribut `data-libelle-section` lu par
   `ficheHTML()`, ou désactiver la fiche générée sur les outils. Accepté pour
   l'instant ; la deuxième touche un asset partagé par huit pages.
2. **Le statut des zéros de fin d'un entier.** `50` et `100` sont traités
   consciemment comme **ambigus** dans `o2`, et l'ambiguïté est devenue la leçon
   — c'est elle qui justifie l'écriture scientifique. À confirmer : c'est un
   choix de fond.
3. **L'élargissement du filtre `pagesSNT` de `verifier.mjs`** aux pages
   `2nde-pc-oN`, qui rendrait aux outils les trois contrôles du §9. Modification
   de `verifier.mjs`, hors périmètre du chantier des outils.
