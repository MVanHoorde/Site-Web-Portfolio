# À LIRE — Refonte des outils O7 et O8

**20/09/2026** · chantier mené depuis le brief « Refonte des outils O7 et O8 » et
son audit compagnon du même jour.

---

## 1 · Ce qui est fait

### O7 — Manipuler une relation algébrique

**Une seule méthode : l'opération inverse.** Le triangle n'est plus une méthode.
Il reste **un encadré de cinq lignes**, sans dessin, sans mode d'emploi, sans
exemple résolu : il dit qu'il existe, qu'il a servi au collège, pourquoi il
s'arrête (une somme, un carré, plus de trois lettres), et que la suite est
**exactement ce qu'on fait en maths**. La « méthode des chiffres » et les « cinq
niveaux » ont disparu — la décision **O-26 devient sans objet** et passe en barré
dans `DECISIONS.md`.

| Section | Contenu |
|---|---|
| **1 — la méthode**, 4 étapes | l'égalité est une balance · le **tableau des opérations inverses** (9 lignes, vrai tableau HTML) · la méthode en trois temps et sa **rédaction attendue** — une ligne par opération, l'opération **notée en marge** · les **cinq cas délicats**, chacun résolu puis **estompé** |
| **2 — s'entraîner**, 10 séries | **71 relations**, classées **par structure algébrique** : produit 8 · quotient (haut) 7 · quotient (bas) 8 · somme 7 · parenthèse 7 · carré et racine 7 · enchaînements 7 · deux relations 7 · **copies fautives 8** · défi 5 |

**Le format demandé est tenu au pied de la lettre.** Dans toute la section 2 :
**0 menu déroulant, 0 champ de saisie**, 71 boutons « Afficher la correction »,
et 32 boutons radio — ceux du QCM des copies fautives, seul endroit où nommer
l'erreur **est** l'exercice. Les séries (c), (e), (f) et (j) offrent un **indice**
avant la correction : deux temps, jamais plus.

**Auto-évaluation** (juste · à moitié · faux) après chaque correction. Elle ne
note rien, ne bloque rien, et alimente la progression de la série. Codée **en
local** — le moteur partagé n'est pas touché — et persistée sur la clé
`autoeval-pc-o7`, distincte de celle du moteur.

**Fiche A4 refaite**, 2 pages, **zéro trace du triangle** : la balance, le tableau
des inverses, la méthode en trois temps, la rédaction attendue, les cinq cas
délicats résolus, les fautes qui reviennent. Le QR code est **recopié tel quel** —
l'URL n'a pas changé.

### O8 — Construire et exploiter un graphique

**Trois pages, et la numérotation des outils reste 1 → 8.**

| Page | Rôle |
|---|---|
| `pages/2nde-pc-o8-construire-un-graphique.html` | **tronc commun, à la main** — URL inchangée |
| `pages/2nde-pc-o8b-graphique-tableur.html` | 5 parcours, **6 étapes identiques pour tous** |
| `pages/2nde-pc-o8c-graphique-calculatrice.html` | 7 parcours, **7 étapes identiques pour toutes** |

Les deux sœurs **ne figurent pas au hub** : on n'y entre que depuis O8, qui est
leur **prérequis affiché** en tête de page — *« cette page t'apprend à faire faire
le travail par une machine ; elle ne t'apprend pas ce que tu lui demandes »*.

**Le tronc commun garde tout l'existant** et gagne deux étapes : **1.5**
proportionnalité contre fonction affine (loi d'Ohm et étalonnage en regard ; quand
forcer l'origine ; l'équation avec les grandeurs et leurs unités, **jamais
`y = 98,7x`** ; le coefficient directeur **est** le `a` des maths) et **1.6**
interpoler contre extrapoler, domaine de validité, `r` et `R²` avec leur mise en
garde. Plus deux **études de cas** en section 2.

🔴 **Le jeu de données vit à un seul endroit** : `assets/js/o8-donnees.js`, chargé
par les **trois** pages. Il ne contient que les **points bruts** et **calcule**
pente, ordonnée, R² et interpolations. Aucune valeur affichée n'est recopiée —
elle ne peut donc pas diverger du tableau qu'a l'élève sous les yeux.

⚠️ **C'est un nouvel asset partagé.** Le modifier oblige à incrémenter son `?v=N`
dans les **trois** pages. Il n'est **pas encore** couvert par le contrôle
d'alignement de `verifier.mjs` (élargir ce contrôle est hors périmètre, §11 des
consignes).

---

## 2 · Les corrigés de O7, vérifiés par le calcul

**71 items, 71 vérifiés, aucun écart.**

La méthode : pour chaque item on fixe les variables **indépendantes** — la
relation de départ est donc vraie par construction — puis on contrôle que la
formule du corrigé **redonne la grandeur isolée**. Trois jeux de valeurs par item,
pour écarter les coïncidences. Aucune résolution numérique n'est nécessaire.

Les **8 copies fautives** de la série (i) passent le même contrôle **à l'envers** :
leur formule doit **échouer** à redonner la bonne valeur, sinon l'« erreur » n'en
serait pas une. Les 8 échouent comme prévu.

```
=== CONTRÔLE DES CORRIGÉS — OUTIL 7 ===
71 items, 71 vérifiés par substitution numérique (3 jeux de valeurs chacun).
✅ Aucun écart. Les 71 formules du corrigé redonnent la grandeur isolée.
```

---

## 3 · Les données de O8, recalculées

**Rien n'est repris de l'audit.** Tout est recalculé par moindres carrés, et c'est
le résultat du calcul qui s'affiche à l'élève.

| Cas | Modèle | Pente | Ordonnée | R² |
|---|---|---|---|---|
| **D1** loi d'Ohm | affine | 101 Ω | −0,0168 V | 0,9998 |
| **D1** loi d'Ohm | **origine forcée** | **100 Ω** | 0 | 0,9998 |
| **D1 bis** lampe | affine | 46,0 | −0,507 | **0,9707** |
| **D2** étalonnage | affine | 7,00×10⁻⁴ | **0,999 g/mL** | 0,9996 |
| **D2** étalonnage | **origine forcée** | 0,0143 | 0 | **−554,6** |
| **D3** Beer-Lambert | origine forcée | 0,145 L/mmol | 0 | 0,9999 |
| P = m·g | origine forcée | **9,80 N/kg** | 0 | > 0,9999 |
| m = ρ·V | origine forcée | **0,789 g/mL** (éthanol) | 0 | > 0,9999 |
| d = v·t | origine forcée | **343 m/s** | 0 | > 0,9999 |
| réfraction | origine forcée | **1,49** (plexiglas) | 0 | > 0,9999 |

**Interpolations D2** : ρ = 1,032 g/mL → Cm ≈ **46,7 g/L** · ρ = 1,048 g/mL →
Cm ≈ **69,5 g/L**. Les deux sont dans le domaine mesuré (0 à 100 g/L).

**Deux chiffres portent tout l'enseignement.** D1 bis donne **R² = 0,9707** — un
bon R² — sur un modèle **faux** (les résidus alternent +0,507 / −0,354 / +0,425 :
c'est une courbe, pas de la dispersion). Et forcer l'origine sur D2 fait tomber le
R² à **−554,6** : la droite forcée décrit les mesures *plus mal* qu'une simple
moyenne. Un élève qui voit ce nombre comprend d'un coup pourquoi on ne force pas
l'origine sans argument physique.

---

## 4 · Les figures et captures à produire — ta liste

### O7 — 3 figures

| ID | Fichier attendu | Ce qu'on doit y voir | Contrainte |
|---|---|---|---|
| **O7-01** | `o7-balance.png` | Une balance en équilibre. Plateau gauche : `v`. Plateau droit : `d ÷ t`. **Deux flèches identiques**, une par plateau, étiquetées `× t` — on voit qu'on agit des **deux** côtés et que le fléau ne bouge pas. **Seconde vignette**, plus petite : la même balance avec une flèche **d'un seul côté** et le fléau qui **penche**. | large ≈ 3:2 · ≥ 900 px · lisible en N&B |
| **O7-02** | `o7-machine-operations.png` | Deux rangées de flèches. **Aller** (→) : `t` entre, subit `× v`, puis `+ d₀`, sort en `d`. **Retour** (←, en dessous) : `d` entre, subit `− d₀`, puis `÷ v`, redonne `t`. Ce qu'on doit voir d'un coup d'œil : **l'ordre du retour est l'inverse de l'aller**. | large ≈ 3:1 · ≥ 900 px · lisible en N&B |
| **O7-04** | `o7-exemple-annote.png` | La résolution de `v = d/t` **manuscrite sur une page de cahier** : cinq lignes alignées sur le `=`, colonne d'annotations à droite séparée par un trait vertical. Trois repères en couleur : ① le trait de séparation, ② l'alignement des `=`, ③ la dernière ligne encadrée. **But : montrer une mise en page, pas un calcul.** | portrait ou carré · ≥ 700 px · lisible en N&B |

> **O7-05 de l'audit est abandonnée.** Un triangle barré reste un triangle dessiné,
> et contredit la décision de n'en faire qu'une mention. Le cadre n'est pas créé.

### O8 — 8 captures d'écran

| ID | Fichier attendu | Matériel · étape | Ce qu'on doit y voir |
|---|---|---|---|
| **O8-10** | `o8-excel-bureau-insertion-nuage.png` | Excel bureau · étape 2 | Le ruban **Insertion**, menu **Nuage de points** déployé. On doit distinguer la vignette « Nuage de points » (marqueurs seuls) des vignettes « Ligne » et « Courbe » voisines. |
| **O8-11** | `o8-excel-bureau-courbe-tendance.png` | Excel bureau · étape 4 | Le nuage sélectionné, bouton **+** cliqué, menu **Courbe de tendance** ouvert, « Linéaire » visible. |
| **O8-12** | `o8-libreoffice-type-xy.png` | LibreOffice · étape 2 | Boîte **Type de diagramme**, **XY (Nuage de points)** sélectionné, vignette **Points seuls** choisie. |
| **O8-13** | `o8-libreoffice-courbe-tendance.png` | LibreOffice · étape 5 | Boîte **Courbe de tendance**, onglet Type : **Linéaire**, cases **Afficher l'équation** et **Forcer l'ordonnée à l'origine** visibles. |
| **O8-14** | `o8-google-sheets-tendance.png` | Google Sheets · étape 4 | Volet **Personnaliser → Série**, case **Courbe de tendance** cochée, type **Linéaire**, réglages **Étiquette** et **Afficher R²**. |
| **O8-20** | `o8-numworks-stats.png` | NumWorks · étape 4 | Écran **Stats** de l'application **Régressions**, avec `a`, `b`, `r` et `r²` pour le jeu de la loi d'Ohm. |
| **O8-21** | `o8-ti83-reglin.png` | TI-83 Premium CE · étape 4 | Écran de **RégLin(ax+b)**, **diagnostic activé**, montrant `a`, `b`, `r²` et `r`. |
| **O8-22** | `o8-casio35-linearreg.png` | Casio Graph 35+E II · étape 4 | Écran **LinearReg** avec `a`, `b`, `r` et `r²`. |

🔴 **Contraintes de droit à respecter à l'intégration.**

- **Microsoft (O8-10, O8-11)** : capture **NON ROGNÉE**, **NON ANNOTÉE** (le
  redimensionnement seul est autorisé), **pas de portion**, pas d'écran de
  démarrage, pas de contenu tiers ni de personne identifiable. Légende se
  terminant par **« Used with permission from Microsoft. »**, nom complet
  « Microsoft Excel ».
- **NumWorks (O8-20)** : crédit « Capture du simulateur NumWorks — numworks.com ».
- **Texas Instruments (O8-21)** : crédit « © Texas Instruments », nom de modèle
  complet. Les **Key Fonts officielles** sont la voie la plus sûre pour les touches.
- **Casio (O8-22)** : crédit « © CASIO ». Screen Receiver ou émulateur officiel.
- **Le repérage se fait en HTML**, jamais dans l'image : composant
  **`.capture-annotee`** déjà écrit dans les deux pages — pastilles numérotées
  positionnées en CSS au-dessus de l'image, **coordonnées en pourcentage** (donc
  ajustables sans rouvrir un logiciel de dessin, et correctes sur téléphone). Le
  markup d'exemple est en commentaire dans le CSS des pages.
- 🔴 **Aucun appel commercial sur O8b et O8c** — NumWorks publie Epsilon sous
  licence non commerciale, TI et Casio tolèrent l'usage pédagogique « non
  commercial ». Pas de bandeau, pas de lien vers une offre, sur ces deux pages.
- **`origine`** à ajouter dans les `CREDITS.md` : `microsoft` · `numworks` · `ti` ·
  `casio` · `libreoffice` · `google` · `geogebra`.

---

## 5 · Les procédures NON vérifiées — 17, toutes signalées à l'élève

65 étapes sont adossées à une **source officielle**, citée en commentaire HTML
juste au-dessus de chaque parcours. Les 17 autres portent `data-verifie="non"`,
**le disent à l'élève**, et renvoient toutes au **simulateur NumWorks**.

| Parcours | Ce qui n'est pas vérifié | Pourquoi |
|---|---|---|
| **TI-82 Advanced** | **les 7 étapes** | aucune source propre à ce modèle. Nous avons refusé d'y recopier les menus d'une TI-83 : les intitulés changent d'un modèle et d'une version d'OS à l'autre. |
| **Casio fx-92 Collège** | **les 7 étapes** | intitulés variables selon le millésime. Et la machine **ne trace pas de nuage** : son parcours le dit et renvoie au tracé papier. ⚠ Elle écrit `y = a + bx` : **`a` et `b` y sont inversés** par rapport à tout le reste de l'outil — c'est signalé en encadré rouge. |
| **TI-83 Premium CE** | la **régression proportionnelle** (`y = ax`) | pas proposée en standard d'après la doc. Le parcours enseigne à la place la **discussion de l'ordonnée à l'origine**, ce qui vaut mieux qu'un forçage automatique. |
| **Casio Graph 35+E II** | la **régression proportionnelle** | le menu documenté offre `ax+b` ; un modèle proportionnel pur n'est pas garanti sur tous les OS. |
| **Casio Graph 90+E** | l'**interface de la Graph Math+** (2024) | interface rénovée, non vérifiée. Le parcours 90+E lui-même est documenté. |

**Ce qui est vérifié, et sur quoi :** NumWorks (manuel officiel + page « Version 14 »
pour le modèle Proportionnelle) · TI-83 Premium CE (solution TI 11918, y compris
`DiagnosticOn`/`CorrelAff`) · Casio 35+E II et 90+E (PDF officiel
casio-education.fr « Ajustement affine ») · Excel bureau, Excel web, LibreOffice,
Google Sheets, GeoGebra (documentations éditeurs).

🔴 **Excel pour le web** : la courbe de tendance sur nuage de points **n'y existe
pas**, vérifié au 20/09/2026. Son parcours ne fait pas semblant — il l'annonce dès
la première ligne et enseigne le contournement complet (`=PENTE`,
`=ORDONNEE.ORIGINE`, `=COEFFICIENT.DETERMINATION`, puis la droite modèle en
seconde série de deux points). C'est le cas de la **majorité des élèves via l'ENT** :
ce parcours est aussi soigné que celui d'Excel de bureau. **À re-tester chaque
année scolaire** — Microsoft ajoute régulièrement des fonctions au web.

---

## 6 · Les données à recaler

**Les masses volumiques de l'étalonnage D2** (`0 · 20 · 40 · 60 · 80 · 100 g/L` →
`1,000 · 1,013 · 1,027 · 1,041 · 1,055 · 1,070 g/mL`) sont **plausibles, pas
sourcées**. Elles donnent une droite affine cohérente et une ordonnée à l'origine
égale à la masse volumique de l'eau — ce qui suffit à l'enseignement visé — mais
ne doivent pas être présentées comme des valeurs de table.

**À recaler** sur *Perry's Chemical Engineers' Handbook*, 6ᵉ éd., ou équivalent.
Marqué en commentaire dans `assets/js/o8-donnees.js`, au-dessus du jeu.

Les autres jeux sont construits sur des valeurs de référence connues (g = 9,81 ;
éthanol 0,789 g/mL ; son 343 m/s ; plexiglas n = 1,49) avec une dispersion de
mesure réaliste : ils n'ont pas ce statut.

---

## 7 · Les renvois au triangle trouvés ailleurs dans le dépôt

**Aucun chapitre de physique-chimie n'y renvoyait** — le §7.2 du brief était sans
objet. Quatre endroits ont été traités :

| Où | Ce qui a changé |
|---|---|
| `pages/2nde-pc-o7-relation-algebrique.html` | le triangle-méthode, son SVG, son QCM et le CSS `.triangle` sont supprimés ; reste l'encadré de mention |
| `fiches/fiche-2nde-o7-relation-algebrique.html` | section « 01 Première méthode — le triangle » et son SVG supprimés. **Zéro occurrence** sur la fiche |
| `pages/2nde-physique-chimie.html` | résumé de la carte OUTIL 7 réécrit |
| `pages/2nde-pc-o6-presenter-un-calcul.html` | « le triangle, les chiffres, et l'opération inverse » → « une seule méthode, l'opération inverse, et 71 relations ». ⚠️ **Cette correction est déjà partie dans ton commit `b1fba0a`** (chantier O4-O6, mené en parallèle) — elle n'y est pas mentionnée. |

**Contrôle final, hors commentaires et hors CSS :** `triangle` → **2 occurrences**,
toutes deux dans le même encadré de mention d'O7. `méthode des chiffres` → **0**.
`cinq niveaux` → **0**.

Les autres occurrences du dépôt sont des triangles **géométriques** sans rapport :
ES 1re (forme de la Terre, triangulation de Cassini), PC T2-C1 (vecteurs),
SNT T5 (carte de Cassini), CFA outils 9 à 11 (Pythagore, trigonométrie).

---

## 8 · Tri du dossier tampon

**Aucun fichier n'a été déposé pour ce chantier** : `_a-deposer/o7/` et
`_a-deposer/o8/` n'existent pas. Tout ce qui devait être illustré est donc un
cadre de réservation (§4 ci-dessus).

Le dossier contient en revanche **sept sous-dossiers résiduels** de chantiers
antérieurs, dont six attendent leur tri. Je n'y ai pas touché :

| Sous-dossier | Verdict |
|---|---|
| `o4/` | **hors périmètre** — chantier mené en parallèle le même jour, commité dans `b1fba0a` |
| `fiches-outils/` | **UTILISÉ — à conserver** : c'est la source des douze fiches d'origine, `CONSIGNES-outil-PC.md` le dit explicitement. ⚠️ Il contient `fiche (correction)_Manipuler une relation algébrique.pdf` et `fiche_Construire un graphique.pdf`, les sources d'O7 et d'O8 : **à garder tant que les outils ne sont pas validés** |
| `ds/`, `es1/`, `fiches-t3c1/`, `o3/`, `tp/` | **non traités ici** — résidus de sessions précédentes, tri à rendre par celles-ci |

⚠️ `es1/` contient **trois fichiers vidéo** (24 Mo) que `CLAUDE.md` demande de ne
pas déposer : il faut leur titre, leur durée et leur URL dans un fichier texte,
pas le fichier.

---

## 9 · Contrôles passés

- ✅ `node verifier.mjs` → **19 problèmes**, le repère exact. Aucune régression.
- ✅ **71/71 corrigés d'O7** vérifiés par substitution numérique (3 jeux chacun).
- ✅ **Tous les jeux de données d'O8** recalculés — pentes, ordonnées, R²,
  interpolations.
- ✅ **Rendu mesuré au navigateur**, quatre pages, en 1280 px **et en 360 px** :
  aucune erreur JavaScript, **aucun débordement horizontal**, tous les trous de
  données remplis, le moteur démarre partout.
- ✅ **Interactions testées** : le sélecteur n'affiche qu'un parcours et **survit
  au rechargement** · les parcours non vérifiés portent bien leur avertissement
  visible · NumWorks n'en porte aucun · les 71 corrigés sont fermés au chargement ·
  l'auto-évaluation s'annule au second clic · l'étape se valide au premier clic
  réel · le QCM **ne dévoile pas** la bonne réponse au premier essai raté.
- ✅ **O7, section 2** : `0` menu déroulant, `0` champ de saisie, 71 boutons de
  correction, 32 radios (le QCM des copies fautives).
- ✅ **Fiches exportées et mesurées** : O7 → 2 pages `209,9 × 297,0 mm` ·
  O8 → 3 pages `209,9 × 297,0 mm`. Une `.feuille` = une page dans les deux cas.
- ✅ **Polices de repli** : identifiées au navigateur (CDP). Celles que signale
  l'export sur la fiche O8 — Consolas pour `Ω`, `≈`, `ρ`, `÷` ; Arial dans les
  étiquettes d'axes des SVG ; Segoe UI Symbol pour `✓` et `⚠` — sont **toutes
  préexistantes**. Aucune ne vient des ajouts du jour. *(Défaut du dépôt à traiter
  un jour : nos six familles ne couvrent pas ces caractères.)*
- ✅ `node generer-sequences-espaces.mjs` rejoué : `pc-o8b` et `pc-o8c` sont dans
  le sommaire des espaces du tableau de bord.

---

## 10 · À trancher — quatre points

1. **La fiche O8 passe à trois pages.** Dérogation à la règle des deux pages
   (`CONSIGNES-outil-PC.md` §7), déclarée dans `EXCEPTIONS` de
   `exporter-fiches.mjs` comme celle d'`o3`. Motif : le cours a doublé, et le §7
   interdit qu'une partie du cours vive **seulement à l'écran**. **Si tu refuses,
   c'est la grille vierge du verso qui sortira, pas le cours.**

2. **O7 est déjà atteignable.** L'ouverture d'`o6` ce matin rend `o7` accessible
   par le renvoi d'O6 — le hub l'annonce pourtant encore 🚧. La version que les
   élèves y trouvent est désormais la version refondue, ce qui est plutôt une
   bonne nouvelle. Reste à décider : ouvrir franchement `o7` au hub, ou retirer le
   renvoi d'O6 en attendant.

3. **Ouvrir O8 ?** Les trois pages sont hors d'atteinte depuis l'accueil. Elles
   sont complètes et utilisables **sans les captures** — les cadres de réservation
   sont visibles et laids par conception. À toi de dire si ça passe en classe ou
   si on attend les images.

4. **Le tableau de bord affiche dix entrées pour huit outils** (`pc-o8`, `pc-o8b`,
   `pc-o8c`). C'est la contrepartie assumée de l'architecture. Si ça te gêne, on
   peut fusionner les trois en une seule clé — mais on perd alors la possibilité
   de voir qui a ouvert le parcours tableur.

---

## 11 · Fichiers touchés

**Créés**

```
pages/2nde-pc-o8b-graphique-tableur.html          75 ko · 5 parcours × 6 étapes
pages/2nde-pc-o8c-graphique-calculatrice.html     86 ko · 7 parcours × 7 étapes
assets/js/o8-donnees.js                           🔴 nouvel asset PARTAGÉ (3 pages)
```

**Modifiés**

```
pages/2nde-pc-o7-relation-algebrique.html         refondu — 209 ko, 14 étapes, 71 items
pages/2nde-pc-o8-construire-un-graphique.html     étendu — 103 ko, 12 étapes
pages/2nde-physique-chimie.html                   descriptions des cartes O7 et O8
fiches/fiche-2nde-o7-relation-algebrique.html     refaite — 2 pages, zéro triangle
fiches/fiche-2nde-o8-construire-un-graphique.html + 1 page « modéliser »
assets/pdf/pc/fiches/fiche-2nde-o7-…pdf           régénéré, mesuré
assets/pdf/pc/fiches/fiche-2nde-o8-…pdf           régénéré, mesuré
exporter-fiches.mjs                               exception de pagination pour o8
generer-sequences-espaces.mjs                     pc-o8b et pc-o8c
assets/js/sequences-espaces.js                    régénéré
_modeles/CONSIGNES-outil-PC.md                    repère 19, catalogue, pagination
_suivi/ETAT-PROJET.md · DECISIONS.md · JOURNAL.md · chapitres.md
```

**Non touché, volontairement** : `assets/js/sequence-snt.js` et
`assets/css/sequence-snt.css` (22 pages), conformément au §5. Tout ce qui manquait
au moteur — l'auto-évaluation, le sélecteur de matériel — est codé **en local dans
les pages**.

---

*Chantier mené avec l'assistance de Claude (Anthropic). © 2026 Loïc Van Hoorde.*
