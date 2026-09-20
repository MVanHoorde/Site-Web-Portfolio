# O7 et O8 — ce qui reste à faire

> **Le fichier à ouvrir pour reprendre le chantier des outils 7 et 8.**
> Écrit le 20/09/2026, à la fin de la refonte. Il ne raconte pas ce qui a été
> fait — ça, c'est `archives/livraisons/A-LIRE-OUTILS-O7-O8-2026-09-20.md` —
> il liste **ce qui reste, et par quoi commencer**.
>
> Décisions → `DECISIONS.md`, blocs du 20/09 · récit → `JOURNAL.md` ·
> état par outil → `chapitres.md` §O7 et §O8.

**État au 20/09/2026 :** les deux outils sont **complets et utilisables**.
Ce qui reste n'est ni du contenu manquant ni du code à écrire — ce sont
**quatre décisions qui t'appartiennent**, des **images à fournir**, et des
**procédures à confirmer sur les machines**.

---

## 0 · Par quoi commencer, si tu n'as qu'une heure

1. **Trancher les quatre décisions du §1.** Elles ne demandent aucune
   vérification, seulement ton avis — et deux d'entre elles décident si les
   élèves voient ces outils ou non.
2. **Produire les trois figures d'O7** (§2). C'est ce qui bloque l'ouverture
   d'un outil déjà atteignable.
3. Le reste peut attendre l'an prochain sans gêner personne.

---

## 1 · Quatre décisions — deux tranchées le 20/09, deux en attente

### ① La fiche O8 fait trois pages. On garde ?

**Ce qui a été fait :** la fiche est passée de 2 à 3 pages (construire ·
**modéliser et jusqu'où lire** · grille vierge). La dérogation est déclarée dans
`EXCEPTIONS` de `exporter-fiches.mjs`, à côté de celle d'`o3` — le script refuse
l'export au-delà, c'est donc un garde-fou, pas une politesse.

**Pourquoi :** le cours de l'outil a doublé (proportionnalité contre fonction
affine, forçage de l'origine, domaine de validité, R²), et `CONSIGNES-outil-PC.md`
§7 interdit qu'une partie du cours vive **seulement à l'écran**.

**Si tu refuses :** c'est la **grille vierge du verso** qui sort, pas le cours.
Elle redeviendrait un document à part, imprimable séparément.

- [ ] **trois pages, on garde** → retirer `⏳` de la ligne O-26+1 dans `DECISIONS.md`
- [ ] **retour à deux pages** → sortir la grille vierge, remettre `o8: 2` (ou
      retirer l'entrée) dans `EXCEPTIONS` de `exporter-fiches.mjs`, relancer
      `node exporter-fiches.mjs o8`

### ② O7 est déjà atteignable. On l'ouvre franchement ?

**Le problème :** l'ouverture d'`o6` le 20/09 rend `o7` accessible **par le renvoi
d'O6** (« comment retourner une relation ? c'est le sujet entier de l'outil 7 »),
alors que le hub l'annonce encore 🚧. Un élève qui suit le lien tombe donc sur la
page — et sur ses **trois cadres de réservation**, visibles et laids par
conception.

**Ce qui plaide pour ouvrir :** la page est complète, ses 71 corrigés sont
vérifiés, et la version que les élèves atteignent aujourd'hui est déjà celle-là.

- [x] **ouvrir** — ✅ **fait le 20/09**, décision de Loïc. Les deux entrées sont
      rendues à la carte OUTIL 7 du hub, `guide-ap.html` annonce **les huit outils**
      avec sa date de révision, et les quatre PDF de guides sont régénérés.
      Le mot aux collègues est prêt dans `_suivi/outils-o4-o6.md` §1, **à envoyer**.
- [ ] ~~attendre les figures~~ — écarté : *« les figures seront à compléter au fur
      et à mesure, on peut les mettre en ligne pour le moment »*. Les trois cadres
      de réservation restent visibles en attendant les images.

### ③ On ouvre O8 ?

Les **trois pages** sont hors d'atteinte depuis l'accueil (`node verifier.mjs` les
liste en vigilance). Elles sont complètes et utilisables **sans les captures** —
mais les 8 cadres de réservation sont visibles.

- [x] **ouvrir** — ✅ **fait le 20/09**, même décision. La carte OUTIL 8 du hub
      porte ses deux entrées, et le guide de l'AP mentionne les **deux pages
      sœurs** (tableur, calculatrice) en précisant qu'on y entre depuis O8 et
      qu'elles ne figurent pas au sommaire — conformément au choix de ce chantier.
- [ ] ~~attendre les captures~~ — écarté, même motif. Les 8 cadres restent visibles.

🔴 **Pourquoi publier malgré les 17 procédures non vérifiées (§4) est sans
danger** : elles portent `data-verifie="non"`, **le disent à l'élève** et
renvoient au simulateur NumWorks. C'est la prudence qui est à l'écran, pas une
procédure présentée comme sûre. À ne pas retirer avant d'avoir vérifié sur machine.

### ④ Dix entrées pour huit outils au tableau de bord

`pc-o8`, `pc-o8b` et `pc-o8c` sont trois espaces distincts : le tableau de bord
affiche donc dix outils là où le hub en montre huit. C'est la contrepartie assumée
de l'architecture — et elle permet de voir **qui a ouvert le parcours tableur**.

- [ ] **on garde**
- [ ] **on fusionne** → une seule clé `pc-o8` sur les trois pages, et on perd le
      détail par parcours

---

## 2 · Trois figures pour O7

Les cadres sont posés dans la page, à l'endroit exact, avec leur description.
Il suffit de **remplacer la balise** quand l'image existe.

| ID | Fichier attendu | Ce qu'on doit y voir | Format |
|---|---|---|---|
| **O7-01** | `o7-balance.png` | Une balance en équilibre. Plateau gauche `v`, plateau droit `d ÷ t`. **Deux flèches identiques**, une par plateau, étiquetées `× t` : on agit des **deux** côtés, le fléau ne bouge pas. **Vignette secondaire** : la même balance avec une flèche **d'un seul côté** et le fléau qui **penche**. | large ≈ 3:2 · ≥ 900 px · lisible en N&B |
| **O7-02** | `o7-machine-operations.png` | Deux rangées de flèches. **Aller** (→) : `t` entre, subit `× v` puis `+ d₀`, sort en `d`. **Retour** (←, en dessous) : `d` entre, subit `− d₀` puis `÷ v`, redonne `t`. Ce qu'on doit voir d'un coup d'œil : **l'ordre du retour est l'inverse de l'aller**. | large ≈ 3:1 · ≥ 900 px · lisible en N&B |
| **O7-04** | `o7-exemple-annote.png` | La résolution de `v = d/t` **manuscrite sur une page de cahier** : cinq lignes alignées sur le `=`, colonne d'annotations à droite séparée par un trait vertical. Trois repères en couleur : ① le trait de séparation, ② l'alignement des `=`, ③ la dernière ligne encadrée. **But : montrer une mise en page, pas un calcul.** | portrait ou carré · ≥ 700 px · lisible en N&B |

**Destination :** `assets/img/pc/2nde-pc-o7/` (dossier à créer) + son `CREDITS.md`.
Dépôt des sources : `_a-deposer/o7/`.

> **O7-05 de l'audit est abandonnée** et ne doit pas être produite : un triangle
> barré reste un triangle dessiné, et contredit la décision de n'en faire qu'une
> mention.

---

## 3 · Huit captures d'écran pour O8

| ID | Fichier attendu | Matériel · étape | Ce qu'on doit y voir |
|---|---|---|---|
| **O8-10** | `o8-excel-bureau-insertion-nuage.png` | Excel bureau · ét. 2 | Le ruban **Insertion**, menu **Nuage de points** déployé. Distinguer la vignette « Nuage de points » (marqueurs seuls) des vignettes « Ligne » et « Courbe » voisines. |
| **O8-11** | `o8-excel-bureau-courbe-tendance.png` | Excel bureau · ét. 4 | Nuage sélectionné, bouton **+** cliqué, menu **Courbe de tendance** ouvert, « Linéaire » visible. |
| **O8-12** | `o8-libreoffice-type-xy.png` | LibreOffice · ét. 2 | Boîte **Type de diagramme**, **XY (Nuage de points)** sélectionné, vignette **Points seuls**. |
| **O8-13** | `o8-libreoffice-courbe-tendance.png` | LibreOffice · ét. 5 | Boîte **Courbe de tendance**, onglet Type : **Linéaire**, cases **Afficher l'équation** et **Forcer l'ordonnée à l'origine**. |
| **O8-14** | `o8-google-sheets-tendance.png` | Google Sheets · ét. 4 | Volet **Personnaliser → Série**, case **Courbe de tendance** cochée, type **Linéaire**, **Étiquette** et **Afficher R²**. |
| **O8-20** | `o8-numworks-stats.png` | NumWorks · ét. 4 | Écran **Stats** de l'app **Régressions** : `a`, `b`, `r`, `r²` sur le jeu de la loi d'Ohm. |
| **O8-21** | `o8-ti83-reglin.png` | TI-83 Premium CE · ét. 4 | Écran **RégLin(ax+b)**, **diagnostic activé**, montrant `a`, `b`, `r²`, `r`. |
| **O8-22** | `o8-casio35-linearreg.png` | Casio 35+E II · ét. 4 | Écran **LinearReg** avec `a`, `b`, `r`, `r²`. |

**Destination :** `assets/img/pc/2nde-pc-o8/` (dossier à créer) + son `CREDITS.md`,
avec la colonne `origine` ∈ `microsoft` · `numworks` · `ti` · `casio` ·
`libreoffice` · `google` · `geogebra`. Dépôt des sources : `_a-deposer/o8/`.
Préfixe de nommage par matériel : `o8-excel-…`, `o8-numworks-…`, `o8-ti83-…`.

### 🔴 Contraintes de droit — à respecter à la prise de vue, pas après

- **Microsoft (O8-10, O8-11)** — capture **NON ROGNÉE**, **NON ANNOTÉE** (le
  redimensionnement seul est autorisé), **pas de portion d'écran**, pas d'écran de
  démarrage, pas de contenu tiers ni de personne identifiable. Légende se
  terminant par **« Used with permission from Microsoft. »**, nom complet
  « Microsoft Excel ».
- **NumWorks** — crédit « Capture du simulateur NumWorks — numworks.com ».
- **Texas Instruments** — crédit « © Texas Instruments », nom de modèle complet.
  Les **Key Fonts officielles** (education.ti.com) sont la voie la plus sûre pour
  représenter les touches.
- **Casio** — crédit « © CASIO ». Screen Receiver ou émulateur officiel.
- 🔴 **Le repérage se fait en HTML, jamais dans l'image.** Le composant
  **`.capture-annotee`** est déjà écrit dans les deux pages : pastilles numérotées
  positionnées en CSS **au-dessus** de l'image, coordonnées **en pourcentage**
  (ajustables sans rouvrir un logiciel de dessin, et correctes sur téléphone). Le
  markup d'exemple est en commentaire dans le `<style>` des pages.
- 🔴 **Aucun appel commercial sur O8b et O8c** — NumWorks publie Epsilon sous
  licence non commerciale, TI et Casio tolèrent l'usage pédagogique « non
  commercial ». Pas de bandeau, pas de lien vers une offre sur ces deux pages.

---

## 4 · Dix-sept procédures à confirmer sur les machines

Elles portent toutes `data-verifie="non"` dans le HTML, **le disent à l'élève**,
et renvoient au simulateur NumWorks. **Rien n'est cassé tant qu'elles restent
ainsi** : c'est la prudence qui est codée, pas un défaut.

| Parcours | À vérifier | Combien |
|---|---|---|
| **TI-82 Advanced** | tout le parcours — saisie des listes, nuage, régression, lecture de `r` et `r²` (y a-t-il un réglage de diagnostic ?), tracé, prédiction, effacement | **7 étapes** |
| **Casio fx-92 Collège** | tout le parcours. ⚠ La machine écrit `y = a + bx` : **`a` et `b` y sont inversés** par rapport au reste de l'outil — vérifier que l'encadré rouge dit juste | **7 étapes** |
| **TI-83 Premium CE** | existe-t-il un modèle `y = ax` (origine forcée) selon l'OS ? | 1 bloc |
| **Casio Graph 35+E II** | idem — le menu REG offre-t-il un modèle proportionnel pur ? | 1 bloc |
| **Casio Graph 90+E** | les intitulés de la **Graph Math+** (2024, interface rénovée) | 1 bloc |

**Comment vérifier :** machine réelle, ou émulateur officiel (Casio propose des
émulateurs gratuits ; TI-SmartView CE est payant avec essai). Quand une procédure
est confirmée : passer son `data-verifie` à `"oui"`, remplacer le commentaire de
source, et retirer le bloc `.avert` correspondant.

**Ce qui est déjà vérifié**, et sur quoi : NumWorks (manuel officiel + page
« Version 14 » pour le modèle Proportionnelle) · TI-83 Premium CE (solution TI
11918, `DiagnosticOn`/`CorrelAff` compris) · Casio 35+E II et 90+E (PDF officiel
casio-education.fr) · Excel bureau, Excel web, LibreOffice, Google Sheets,
GeoGebra. **65 étapes sur 82.**

### 🔁 À re-tester chaque année scolaire

**Excel pour le web ne permet pas de créer une courbe de tendance sur un nuage de
points** (vérifié le 20/09/2026). C'est la situation de la **majorité des élèves
via l'ENT**, et tout le parcours `excel-web` est construit là-dessus : il l'annonce
dès la première ligne et enseigne le contournement (`=PENTE`,
`=ORDONNEE.ORIGINE`, `=COEFFICIENT.DETERMINATION`, puis la droite modèle en
seconde série de deux points).

🔴 **Si Microsoft ajoute la fonction**, ce parcours devient faux — il dirait à
l'élève qu'une chose est impossible alors qu'elle ne l'est plus. **À re-tester à
chaque rentrée**, et à signaler avant de réécrire quoi que ce soit.

---

## 5 · Une donnée à recaler

**Les masses volumiques de l'étalonnage D2** sont **plausibles, pas sourcées** :

| Cm (g/L) | 0 | 20 | 40 | 60 | 80 | 100 |
|---|---|---|---|---|---|---|
| ρ (g/mL) | 1,000 | 1,013 | 1,027 | 1,041 | 1,055 | 1,070 |

Elles donnent une droite affine cohérente et une ordonnée à l'origine égale à la
masse volumique de l'eau — ce qui suffit à l'enseignement visé — mais **ne doivent
pas être présentées comme des valeurs de table**.

**À recaler** sur *Perry's Chemical Engineers' Handbook*, 6ᵉ éd., ou une table
équivalente (densité NaCl en fonction du % massique, à température donnée).
Marqué en commentaire dans `assets/js/o8-donnees.js`, au-dessus du jeu.

⚠️ **Si les valeurs changent, rien d'autre ne bouge** : pente, ordonnée, R² et
interpolations sont **calculés** à partir de ce tableau, dans les trois pages.
C'est précisément ce que ce fichier permet.

Les autres jeux n'ont pas ce statut : ils sont construits sur des valeurs de
référence connues (g = 9,81 N/kg · éthanol 0,789 g/mL · son 343 m/s · plexiglas
n = 1,49) avec une dispersion de mesure réaliste.

---

## 6 · Dettes techniques repérées, hors périmètre

Aucune ne gêne les élèves. Elles sont notées pour ne pas être redécouvertes.

- **`assets/js/o8-donnees.js` n'est pas dans le contrôle d'alignement des `?v=N`**
  de `verifier.mjs`. Il est chargé par **trois** pages : le modifier sans
  incrémenter partout servirait l'ancienne version depuis le cache des élèves.
  Élargir ce contrôle est explicitement hors périmètre (`CONSIGNES-outil-PC.md`
  §11), mais le jour où on y touche, c'est le moment.
- **Les fiches tombent sur des polices système** pour certains caractères —
  mesuré au navigateur : Consolas pour `Ω`, `≈`, `ρ`, `÷`, `⁻¹` (IBM Plex Mono ne
  les couvre pas) · Arial dans les étiquettes d'axes des SVG (`.g-lab` ne déclare
  pas de famille) · Segoe UI Symbol pour `✓` et `⚠`. **Toutes préexistantes**,
  aucune ne vient de ce chantier — mais elles concernent **toutes** les fiches du
  dépôt, pas seulement O7 et O8. À traiter en une passe, un jour.
- **`verifier.mjs` lit aussi les commentaires HTML** pour les liens : un chemin de
  fichier écrit dans un commentaire, même en exemple, compte comme lien cassé.
  Le piège a mordu ici (l'exemple de markup du composant `.capture-annotee`). Noté
  au §9 de `CONSIGNES-outil-PC.md`.
- **Le dossier tampon n'est pas vide** : `ds/`, `es1/`, `fiches-t3c1/`, `o3/`,
  `tp/` attendent le tri des sessions qui les ont déposés. ⚠️ `es1/` contient
  **trois fichiers vidéo (24 Mo)** que `CLAUDE.md` demande de ne pas déposer.
  `fiches-outils/` est à **conserver** : c'est la source des douze fiches
  d'origine, O7 et O8 comprises, tant que les outils ne sont pas validés.

---

## 7 · Ce qu'il ne faut pas rouvrir

Ces points ont été tranchés le 20/09 après discussion ou mesure. Les revisiter
coûterait du temps sans rien apporter.

- **Le triangle ne revient pas**, ni comme méthode, ni comme figure. La mention de
  cinq lignes dans O7 est **la seule occurrence tolérée** dans tout le dépôt
  (hors triangles géométriques, qui n'ont rien à voir). La fiche A4 n'en porte
  aucune trace, et c'est volontaire : elle se relit toute l'année, la mention ne
  sert qu'une fois.
- **Pas de champ de saisie dans les exercices d'O7.** L'élève cherche sur sa
  feuille, puis ouvre la correction. Le QCM des copies fautives est la seule
  exception, et elle est justifiée : nommer l'erreur **est** l'exercice.
- **Les séries d'O7 restent classées par structure algébrique**, pas par
  difficulté croissante. C'est ce qui permet à un élève de venir chercher « la
  série des dénominateurs » plutôt que « le niveau 2 ».
- **Le moteur partagé n'est pas touché.** L'auto-évaluation et le sélecteur de
  matériel sont codés en local dans les pages (`CONSIGNES-outil-PC.md` §5). Si un
  autre outil en a besoin un jour, on recopie — on ne remonte pas dans
  `sequence-snt.js`, chargé par 22 fichiers.
- **Le choix de matériel reste en `localStorage`**, pas en base : c'est une
  préférence d'affichage, pas du travail d'élève.
- **La décision O-26** (les cinq niveaux d'O7) est **sans objet** et barrée dans
  `DECISIONS.md`. Elle ne demande plus d'arbitrage.
