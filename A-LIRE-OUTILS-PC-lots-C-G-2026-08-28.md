# À lire — Outils transversaux de PC · lots C à G · 28/08/2026

Les cinq outils restants sont écrits. **Le catalogue des huit est complet.**

| | Page | Fiche | Hub |
|---|---|---|---|
| **o4** La verrerie et le matériel | ✅ | ✅ 2 p. | ✅ |
| **o5** Rédiger un compte rendu de TP | ✅ | ✅ 2 p. | ✅ |
| **o6** Présenter un calcul | ✅ | ✅ 2 p. | ✅ |
| **o7** Manipuler une relation algébrique | ✅ | ✅ 2 p. | ✅ |
| **o8** Construire et exploiter un graphique | ✅ | ✅ 2 p. | ✅ |

Tu m'avais dit que la **forme** te convenait et qu'il y avait « beaucoup de
corrections à faire ». Je n'ai donc **rien changé au fond de `o3`** : il attend
tes corrections, comme les cinq nouveaux.

---

## Ce qui a changé pendant que je travaillais

Tu as introduit — ou une autre session a introduit — deux choses que j'ai
adoptées pour les cinq outils :

- **Les fiches se distribuent en PDF.** Le HTML reste la source, `node
  exporter-fiches.mjs` produit l'export. J'ai aligné `o5` et `o6` (qui pointaient
  encore vers le HTML), et écrit `o7` et `o8` directement dans la convention. Les
  **dix fiches** de 2nde PC s'exportent proprement : A4 209,9 × 297,0 mm, une
  `.feuille` = une page.
- **`chapitre-commun.css` en `?v=8`** et l'ornement des encarts d'histoire. Je
  n'y ai pas touché.

---

## Le point qui demandait un arbitrage, et que j'ai tranché par la mesure

**Le brief annonçait que les cinq étiquettes de `o6` étaient employées dans « 104
blocs sur huit chapitres ». J'ai mesuré, et ce n'est pas tout à fait cela.**

| | mesuré le 28/08 |
|---|---|
| blocs `.etape` dans le dépôt | **143**, sur dix chapitres |
| qui emploient l'une des cinq étiquettes | **90** |
| qui portent un libellé libre | **53** (« Lecture graphique », « Isoler U », « Le piège de l'énoncé »…) |
| corrections commençant par « Extraction des informations » | **13** |
| chapitres n'employant **aucune** des cinq | **2** — `t2-c1` (0/10) et `t3-c3` (0/7) |

Le « 104 » du brief correspond au **total des blocs `.etape`** de cinq chapitres,
toutes étiquettes confondues — pas au nombre d'emplois des cinq étiquettes.

**Ce que j'en ai fait.** O-25 reste appliqué : les cinq étiquettes sont bien le
modèle enseigné, et ce sont les plus fréquentes. Mais **la page ne dit nulle part
à l'élève qu'il les retrouvera « partout »**, parce que ce serait faux — et il
s'en apercevrait dès qu'il ouvrirait T2-C1. Le fait est consigné en commentaire
dans `o6` et dans `chapitres.md`.

⏳ **Aligner les chapitres sur les cinq étiquettes** reste hors périmètre. C'est
un audit à part, et il est plus lourd qu'il n'en a l'air : 53 blocs à reprendre.

---

## Les propositions à valider, outil par outil

**`o4`** — O-24 appliqué : tri fonctionnel principal (contenir / mesurer / autre),
précision en seconde lecture. L'échelle est celle que **ta correction du TP11**
établit : « bécher et erlenmeyer à peu près équivalents, puis l'éprouvette
graduée, puis la fiole jaugée et la pipette jaugée ». J'ai ajouté la **pipette
graduée** entre les deux, d'après la mention « bonne précision » de la fiche du
collègue — elle n'est pas dans le TP11.

**`o5`** — O-28 et O-29 appliqués. Le lien vidéo est sur la page, pas sur la
fiche. Les huit rubriques sont renumérotées et le renvoi final corrigé vers le
n° 2. L'hypothèse « vérifiable », les trois contre-exemples et l'exemple du
pendule sont **de moi** : à contester librement.

**`o6`** — O-25 appliqué. Les six exercices portent sur des calculs du site
(`v = d/Δt`, `f = 1/T`, `Q = m×L`, `n = m/M`, `c = m/V`, plus une copie à
corriger). ⚠️ **Les valeurs numériques sont de moi**, pas tirées de tes énoncés :
vérifie-les si tu comptes les réutiliser en devoir.

**`o7`** — O-26 appliqué : les cinq niveaux, tes titres mot pour mot, marquage
★ / ○ / — décroissant. **Les trois erreurs de ta correction sont corrigées et non
reproduites** (niveau 1 `c = b/c`, niveau 5 expression de `c` écrite en fraction,
niveau 5 signe de `e`).

**`o8`** — ⏳ **deux ajouts qui ne sont pas dans ta fiche**, marqués comme
propositions dans la page : l'**unité du coefficient directeur** (elle se lit sur
les axes) et le sens d'une **droite passant par l'origine** (proportionnalité).
Ta nuance sur le titre est conservée mot pour mot.

💡 **Passerelle repérée, non exploitée** : le jeu `P = f(m)` est exactement celui
du poids en **T2-C2**. Je n'ai pas touché à T2-C2, comme convenu.

---

## Ce qui a surpris

**1 · Le nom d'une feuille versionnée dans un commentaire suffit à casser le
contrôle.** Un commentaire de `o5` disait « un outil ne charge pas
chapitre-commun.css » — et `verifier.mjs` a compté la page comme chargeant la
feuille **sans numéro de version**. Exactement le piège déjà documenté pour
`seances-snt`. J'ai **généralisé la règle** dans les consignes et dans le
gabarit. J'ai d'abord cru que le problème venait de ton travail en cours : il
était de moi.

**2 · `getBBox()` rend des coordonnées locales.** Un `<text>` dans un
`<g transform="translate(…)">` paraît hors de son viewBox alors qu'il est en
place. Quatre faux positifs sur le triangle de `o7`. Le contrôle compare
maintenant les rectangles **écran**.

**3 · La pop-up de fin de séance du moteur intercepte les clics suivants.** Mon
harnais comptait cinq blocs de `o5` comme « en échec » alors qu'il n'avait jamais
pu les cliquer. Ce n'est pas un défaut de la page — c'est le moteur qui fait son
travail quand toutes les étapes passent au vert.

---

## Contrôles passés — les cinq outils

- [x] `node verifier.mjs` → **18 problèmes**, le repère retrouvé.
- [x] Aucun asset partagé modifié de mon fait (`assets/css/chapitre-commun.css`
      est modifié par **ton** travail en cours, pas par moi).
- [x] `sequence-snt.css?v=41` · `sequence-snt.js?v=42` · `progression.js?v=16`
      sur les cinq pages.
- [x] Zéro erreur console · toutes les réponses rejouées rendent « tout est
      juste » : **39** champs (`o4`), **40** (`o5`), **43** (`o6`), **28**
      (`o7`), **30** (`o8`).
- [x] Aucun texte SVG hors de son cadre · aucune couleur en dur hors `:root` ·
      aucune collision de classe réelle (toutes vérifiées à la main dans
      `sequence-snt.css` : elles y sont qualifiées).
- [x] Rendu sans débordement horizontal à **1200, 768 et 390 px**, ce dernier
      mesuré **dans une iframe**.
- [x] Fiches : **2 pages exactement** pour les cinq, vérifié à la mesure puis
      confirmé par l'export PDF.
- [x] QR codes générés, jamais recopiés, autovérifiés deux fois (syndromes
      Reed-Solomon nuls + relecture de la matrice rendant l'URL).

⚠️ **Deux réserves, les mêmes que pour `o3`.**
1. **Aucun lecteur de QR tiers** n'était disponible : scanne-en un avec ton
   téléphone avant impression en série.
2. `exporter-fiches.mjs` signale des **polices système en repli** sur les dix
   fiches, dont les tiennes (`o1`, `o2`, `t1c2`, `t1c4`). Le plus fréquent est
   `SegoeUISymbol`, servi pour les **emoji** (🖨️ ✓ ⚠). Non bloquant, mais à
   traiter un jour si tu veux des PDF entièrement auto-hébergés.

---

## Ce qui reste

- **Le lot H** — la série de douze conversions de `fiche_Convertir.pdf` versée
  dans `o1` — n'est **pas** fait : il attend ta validation d'O-23.
- **Tes corrections de fond** sur `o3`, et sur les cinq nouveaux.
- **Hors périmètre, inchangé** : aligner les `.ex-lab` de `o1`/`o2` · élargir le
  filtre `pagesSNT` de `verifier.mjs` · poser des renvois « outils utiles » dans
  les quatorze chapitres · modifier T2-C2 · aligner les 53 blocs `.etape` à
  libellé libre.
