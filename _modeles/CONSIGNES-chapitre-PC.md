# CONSIGNES — Chapitre de PHYSIQUE-CHIMIE (page de cours + fiche élève)

## Portée & contexte (à lire avant tout)

Ce document couvre **un seul des deux gabarits du site** : les **chapitres de
physique-chimie** (thème → chapitre → sections, code de déblocage,
`localStorage`, fiche élève imprimable).

⚠ **Il ne s'applique PAS aux séquences SNT** (séquence → séance → étape → champ,
verrouillage progressif, `localStorage` interdit, pas de fiche imprimable) :
leurs consignes sont dans `_modeles/CONSIGNES-sequence-SNT.md`. Ne jamais transposer
les régimes A/B, la bibliothèque de composants (§3), le verrou (§5.7), la fiche
élève (§6) ni les jalons (§10) vers une séquence SNT — ce sont deux systèmes
différents, l'un rodé, l'autre en phase 1.

| | **Ce document (PC)** | **Séquence SNT** |
|---|---|---|
| Structure | thème → chapitre → sections | séquence → séance → étape → champ |
| Style | gabarit + `style.css` du site | CSS inline dans la page |
| Déblocage | code 6 caractères + SHA-256 | verrouillage progressif + mode enseignant |
| Persistance | `localStorage` | **interdit** — téléchargement de fiche |
| Trace élève | fiche imprimable A4 (§6) | « Télécharger ma fiche » (récap HTML) |

Communs aux deux : RGPD (polices auto-hébergées, jamais de CDN), HTML/CSS/JS
vanilla sans build, responsive (cible iPad), livraison en archive delta, mise à
jour de `_suivi/`.

## Le travail

Tu produis un chapitre du site pédagogique de Loïc Van Hoorde (professeur de
physique-chimie, lycée Isaac de l'Étoile) à partir de ses sources PPTX/PDF.
**Tout se fait en français.** La charte et la bibliothèque de composants sont
validées et NON négociables : ta mission est un travail de fidélité et de
rigueur, pas de créativité de mise en page.

Sur le **fond pédagogique** (choix des notions, formulations, progression), la
vision de Loïc est souveraine : ton rôle est l'échafaudage — chercher,
structurer, coder, proposer une V1 dans son ton. Tout contenu de cours que tu
proposes est signalé comme **proposition à valider**. La **validation** est un
acte explicite de Loïc (« je peux l'utiliser l'an prochain »), jamais présumée ;
la mise en ligne n'est pas un jalon.

## 0. Fichiers de référence (dans le dépôt)

| Fichier | Rôle |
|---|---|
| `_modeles/gabarit-chapitre.html` | Squelette de page de cours + **un exemplaire de chaque composant validé** (CSS/JS réels) |
| `_modeles/gabarit-fiche.html` | Squelette de la fiche élève imprimable (style v4 aligné sur le site) |
| `pages/2nde-pc-t1-c2-transformations-physiques-chimiques.html` | **Exemple complet de référence v2** (composants, exercices, SVG, verrou centré) |
| `fiches/fiche-2nde-t1c2.html` | Exemple complet de fiche v2 |
| `style.css`, `assets/css/fonts.css` | Charte du site (ne pas modifier) |

En cas de doute sur un composant : ouvrir l'exemple de référence et copier
sa manière de faire.

### Arborescence & conventions de nommage (rangement du 18/07)

Le dépôt sépare **chaque partie du projet par son nom**. Un chapitre de PC ne
dépose JAMAIS de fichier à la racine ni dans les dossiers d'une autre partie.

```
pages/2nde-pc-tX-cY-<nom-court>.html   ← la page de cours (PC)
assets/img/pc/2nde-pc-tX-cY/…          ← les images du chapitre (créer le dossier)
assets/pdf/…                           ← PDF de cours éventuels (PC)
audio/2nde-pc-tX-cY-intro.m4a          ← intro audio NotebookLM (optionnelle)
fiches/fiche-2nde-tXcY.html            ← la fiche élève imprimable
```

**Trois identifiants dérivés l'un de l'autre** (exemple T1-C2) :

| Usage | Forme | Exemple |
|---|---|---|
| Nom de page **et** dossier d'images | `2nde-pc-tX-cY` | `2nde-pc-t1-c2` |
| Slug interne (clés `localStorage`, verrou) | `2nde-tXcY` | `2nde-t1c2` |
| Fiche élève | `fiche-2nde-tXcY.html` | `fiche-2nde-t1c2.html` |

> ⚠ Ne PAS confondre avec le **cahier de vacances** (`cahier/…`, assets dans
> `assets/img/cahier/` et `assets/pdf/cahier/`) ni avec les **séquences SNT**
> (`pages/2nde-snt-tN-…`, **aucun** asset externe : tout est en SVG/CSS inline).
> Ce sont des parties distinctes — voir `CLAUDE.md` « Où est quoi ».

## 1. Entrées attendues de Loïc

- Le PPTX et/ou le PDF du chapitre (le PDF fait foi pour le rendu final).
- Le niveau, le thème, le numéro de chapitre → **slug** : `2nde-t1c2`, etc.
- Le code de déblocage à 6 caractères, si Loïc veut le fixer lui-même.
  **En V1 intégrale, s'il ne le donne pas : ne PAS demander — l'inventer**
  (voir `CONSIGNES-V1-integrale-PC.md` §2). En régime B, où l'on peut échanger,
  demander reste possible si Loïc n'a rien précisé.

## 1bis. Deux temps de production

La production d'un chapitre se fait en **deux temps**, à ne pas confondre :

- **V1 intégrale** — récupération sans perte du cours depuis son PPTX/PDF :
  figures extraites et posées avec leurs légendes, exercices et corrections
  rédigés en entier, données chiffrées sorties des images, liens décodés. Aucun
  `.a-faire` sauf le DS. But : **Loïc lit son cours entier à l'écran** et juge
  sur pièce. Autonomie totale, aucune question posée, plusieurs chapitres
  peuvent s'enchaîner dans une même conversation.
  🔴 **Consignes dédiées : `_modeles/CONSIGNES-V1-integrale-PC.md`.** Tout y
  est — pipeline d'extraction, tableau de détection, traitement des erreurs de
  physique, format du relevé.
- **Régime B — Raffinage** (§2 et suivants) : reprise d'une V1, une
  **conversation dédiée par chapitre**, pour transformer les figures `-source`
  en SVG à la charte, intégrer les ajouts, puis produire la fiche élève. C'est
  le mode qui a produit T1-C2 et T1-C4.

> ⚠ Les 14 chapitres actuellement en ligne datent d'avant la V1 intégrale : ils
> sont fidèles dans le texte mais **troués de blocs `.a-faire` à la place des
> images**. Ils repassent tous par une V1 avant tout raffinage.

Par défaut, si Loïc ne précise rien : demander lequel des deux temps.

## 2. Régime B — Raffinage : workflow imposé (maquettes AVANT implémentation)

Le régime B reprend une V1 intégrale et la porte, figure par figure, jusqu'à un chapitre « utilisable en classe l'an prochain ». Une
**conversation dédiée par chapitre**. Beaucoup d'échanges : ici, on valide.

**Ordre de travail** : d'abord le **cours** (texte affiné, images, schémas,
approfondissements) jusqu'à validation complète par Loïc ; **la fiche élève ne
se fait qu'en tout dernier**, une fois le cours figé (sinon elle est à refaire
à chaque changement).

**Pour chaque bloc `.a-faire`, proposer l'outil adapté** (Loïc veut savoir où
il doit intervenir et éviter les chantiers inadaptés) :

| Nature du chantier | Qui / quel outil |
|---|---|
| Schéma pédagogique simple (cristal, atome, cycle, case…) | **Ici** (SVG à la charte, maquette PNG validée) |
| Composant visuel complexe / exploration graphique | Proposer **Claude Design** (canvas), puis réintégrer le SVG |
| Photo réelle présente dans la source | **Ici** (extraction + optimisation) |
| Image libre à récupérer (Wikimedia…) | ⚠ accès réseau bloqué ici → **fournir le lien à Loïc** pour téléchargement, ou fabriquer un SVG maison |
| Contenu sous droits (personnage, presse, IP) | Écarter, signaler, **remplacer** (SVG maison ou équivalent libre) |
| Tableau complexe (classification…) | Selon le cas : réutiliser un existant du site, SVG, ou garder l'image en le signalant |
| Push / commit sur le dépôt | **Loïc ou Claude Code** (je n'ai pas d'accès en écriture GitHub) |

Signaler aussi, quand c'est pertinent, si un chantier **dépasse mes moyens
actuels** (skill/outil manquant) plutôt que de produire un résultat médiocre.

Étapes :

1. Extraire et analyser les sources (§4).
2. **Pour tout composant nouveau ou schéma refait : produire un PNG individuel**
   (une capture par composant, via Playwright sur une page de maquette) et le
   soumettre à Loïc. S'il y a une vraie hésitation possible : proposer 2-3
   variantes. Ne JAMAIS implémenter un visuel non validé (sauf accord explicite
   « sans me le montrer »).
3. Implémenter après validation, d'un bloc.
4. **Une fois le cours entièrement validé**, proposer les choix de trous de la
   fiche, Loïc arbitre, puis produire la fiche.
5. Valider (§7) puis livrer (§8).
6. Mettre à jour les flags du chapitre dans `_suivi/chapitres.md` (§10).

## 3. Bibliothèque de composants (validée — quand utiliser quoi)

Tous les styles sont dans le gabarit ; ne pas les réinventer.

Largeurs (validées) : le texte courant est **justifié** (`hyphens:auto`) ;
exercices, exemples détaillés, histoire des sciences et synthèses de TP sont
en **pleine largeur** de la colonne ; définitions et propriétés restent
alignées à gauche (70ch) ; le bloc formule garde sa largeur mais est
**centré**. Chaque section est enveloppée dans `<details class="partie" open>`
(titre h2 dans le `<summary>`, contenu dans `.partie-corps`) : les parties
s'ouvrent et se ferment au clic, bandeau + chevron marquent la délimitation,
et le JS du gabarit rouvre la section visée depuis le sommaire. Le cours se
termine par la signature `.signature` (M. Van Hoorde — Lycée général Isaac de
l'Étoile · Poitiers), après la checklist.

| Composant | Classe(s) | Usage | Accent |
|---|---|---|---|
| Définition | `.encart.definition` + `.terme` | Toute définition ; le terme défini est surligné avec `.terme` | Hβ cyan |
| Propriété | `.encart.propriete` | Lois, relations, propriétés ; équations centrées `.eq-ligne` HORS des paragraphes | Hγ violet |
| Formule | `.formule-bloc` | Formules à retenir : formule en réserve blanche sur panneau encre, grandeurs mono à droite, lettres en violet | encre + Hγ |
| Notation | `.notation` | Conventions d'écriture ; chips centrées, cas particulier sous filet pointillé | gris, pointillés |
| Méthode | `.methode` | Démarches pas-à-pas ; étapes en chiffres ROMAINS automatiques | or |
| Exemple détaillé | `.encart.exemple` | Exemple travaillé dans le fil du cours ; étiquette mono verte, duo image+texte possible | vert |
| Exemples illustrés | `figure` + `.pill-ex.phys/.chim` | Paires de photos d'illustration ; pastille pleine cyan (physique) / rouge (chimique) ; équation centrée `.eqc` dans la légende | — |
| Histoire des sciences | `.histoire` | Encadré patrimonial : double filet sépia, portrait crédité, citation SOURCÉE, pastille 🎬 unique | sépia |
| Synthèse de TP | `.synthese-tp` | Restitution d'un TP dans le cours : contexte italique, graphique, sous-étapes Analyse/Conclusion ; volontairement SOBRE (pointillés gris) | gris |
| Picto fiche | `.a-noter` (crayon ✎) | Sur chaque encart/figure repris dans la fiche élève (coin haut droit) | — |
| Exercice | `.exercice` | Voir §5 | Hα rouge |

### 🔴 Deux règles de composition qui se paient cher si on les oublie

**1. Le gras marque le mot que l'élève doit RETENIR, jamais l'emphase orale.**
Un `<strong>` qui insiste (« la lecture est **imprécise** », « le dommage est
**immédiat et irréversible** ») ne repère plus rien : quand tout est gras, plus
rien ne l'est. Le vocabulaire va en `.terme`, l'insistance passe en romain.
*Mesure du 26/08/2026 : T3-C1 portait 64 gras, dont 12 de pure insistance —
l'énoncé de son exercice 1 en alignait trois en deux phrases.*

**2. Un conteneur `flex` ou `grid` transforme chaque fragment inline en cellule.**
C'est le piège le plus coûteux du socle, rencontré **deux fois le même jour** :

| Où | Ce qui arrivait | Correctif |
|---|---|---|
| `.formule-bloc .eq` | Chaque `<sub>` devenait un flex item, perdait son `vertical-align`, et `align-items:center` le remontait à mi-hauteur : `c_son` s'affichait `c son`. **7 blocs dans 5 chapitres** | Le contenu de `.eq` est enveloppé dans **`<span class="eq-corps">`** — un seul flex item, sub/sup redeviennent inline. **Obligatoire sur tout nouveau bloc formule** |
| `.methode li` | Chaque fragment de l'étape (texte, `<strong>`, `.nb`) devenait une cellule de la grille à 2 colonnes : « Repérer un / motif qui se répète. / élémentaire » | Le numéro romain est passé en **position absolue** dans une gouttière ; plus de grid. Corrigé dans le socle, rien à faire dans les pages |

À retenir pour tout nouveau composant : **avant de poser `display:flex` ou
`display:grid` sur un bloc qui contient de la prose, vérifier au navigateur que
le texte n'est pas découpé.** Un `getClientRects()` sur un mot suffit à le voir.

## 4. Protocole d'extraction des sources

```bash
python3 /mnt/skills/public/pptx/scripts/office/unpack.py SOURCE.pptx unpacked/
apt-get install -y libzbar0 && pip install pyzbar --break-system-packages   # décoder TOUS les QR (pas cv2 seul)
pdfimages -all -p -f 2 -l N SOURCE.pdf pdfimg/p    # images AVEC numéro de page
```

Règles d'or (leçons des chapitres 1 et 2) :
- Le mapping diapo→image via les `.rels` du PPTX est **trompeur**. Le mapping
  page→image de `pdfimages -p` est fiable pour la PAGE, pas pour l'attribution
  au bon emplacement : **vérification VISUELLE de chaque image obligatoire**
  (planche contact + `view`). Si l'outil de visualisation est en panne :
  contrôle colorimétrique (luminosité, couleurs dominantes) + le déclarer
  honnêtement dans le récapitulatif.
- Figure vectorielle absente de `pdfimages` → découpe dans `pdftoppm -r 200`
  par coordonnées, rognage des marges.
- Schémas/graphiques/cliparts/tableaux-images → REFAITS (SVG charte ou
  `table.tab`). Photos réelles → conservées (≤900 px, JPEG q82, noms parlants),
  déposées dans **`assets/img/pc/<slug-de-page>/`** (ex.
  `assets/img/pc/2nde-pc-t1-c2/`) — voir l'arborescence en §0.
- Images libres complémentaires : Wikimedia Commons ; crédit en fin de légende
  (auteur, source, licence) ; vérifier la licence exacte avant publication.
- QR codes → pastilles `.video-chip` (libellé court + ↗, `_blank`,
  `rel="noopener"`, retirer `?si=`). Kahoot et DS → fin de checklist.

## 5. Règles de contenu

1. **Texte fidèle à la source, mot pour mot.** Aucune reformulation non
   signalée. Erreur scientifique dans la source → corriger ET signaler dans le
   récapitulatif (jamais de correction silencieuse).
2. **Vérifier chaque calcul des corrigés à la main.**
3. Typographie scientifique :
   - **Jamais de retour à la ligne entre une valeur et son unité** :
     envelopper dans `<span class="nb">…</span>`.
   - Indices/exposants : `<sub>`/`<sup>` systématiques (pas de caractères
     Unicode mélangés aux balises dans une même équation) ; dans `.eq-ligne`
     et `.eq-exo` ils passent automatiquement en mono.
   - Équations de réaction : TOUJOURS une flèche « → », jamais « = ».
   - Équations : centrées via `.eq-ligne`, jamais dans le fil d'un paragraphe.
4. Structure d'exercice normalisée :
   - étiquette rouge « Exercice N — intitulé » ;
   - contexte en romain ; **question(s) en italique** (`.question`) ;
   - données en mono séparées par filet pointillé (`.donnees`) ;
   - photo À CÔTÉ de l'énoncé (`.duo-x`), jamais dans la correction ;
   - correction dépliable séquencée par `.etape` :
     « Extraction des informations » → « **Formule du cours** » (application
     directe : rappel générique petit `.formule-cours-rappel` + version avec
     les **notations de l'énoncé en avant** en `.eq-ligne`) OU « Manipulation
     d'expression algébrique » (UNIQUEMENT si vraie manipulation) →
     « Application numérique » (résultat souligné `.resultat`) →
     « Conclusion » (si interprétation pertinente).
   - Exercices qualitatifs : étapes adaptées (ex. « Lecture en proportions »),
     ou pas d'étapes si trivial.
5. Schémas SVG : mêmes valeurs que la source ; annotations de graphiques par
   pastilles numérotées ①② hors des tracés ; étiquettes avec halo papier
   (`paint-order:stroke`) si posées sur un trait ; `dominant-baseline="central"`
   pour centrer un texte dans une forme ; jamais de texte qui déborde du cadre.
6. Sections : `h2 id="ancre-N"` numérotées 01, 02… ; sommaire latéral ET mobile
   synchronisés ; checklist finale `ds1…dsN` + Kahoots + DS.
7. Verrou v2 (porte centrée) : remplacer `EMPREINTE_SHA256_A_REMPLACER`
   (commande en commentaire) et les deux `SLUG`. `crypto.subtle` exige un
   contexte sécurisé : ne pas « simplifier ».
7bis. Intro audio (optionnelle, validée le 16/07) : bandeau `.audio-compact`
   dans `#porte`, entre `.explication` et le formulaire — visible **avant**
   le déblocage puisque c'est précisément une écoute pré-cours. Fichier
   NotebookLM déposé par Loïc dans `audio/SLUG-intro.…` (durée arrondie en
   minutes dans `.sous`) ; mention de provenance obligatoire dans `.credit`
   (« Générée avec NotebookLM à partir du cours, relue avant publication »).
   Retirer tout le bloc si le chapitre n'a pas encore son fichier. Un même
   emplacement pourra plus tard accueillir un lien `.video-chip` vers une
   vidéo de rappel, sans refonte.
8. Lier la page depuis la page du niveau (`pages/NIVEAU-physique-chimie.html`).
   **Règle anti-préfixe (bug rencontré au C4)** : la page de niveau est
   elle-même dans `pages/`. Un lien vers un chapitre voisin s'écrit donc
   `href="2nde-pc-t1-cN-….html"` — **jamais** `href="pages/2nde-pc-…"`, sinon
   le navigateur cherche `pages/pages/…` → 404. Aligner tout nouveau lien sur
   la forme des chapitres déjà présents (les vérifier par un `grep`).
9. Gras minimal dans les textes pédagogiques.

## 6. Règles de la fiche élève (v4)

- Style aligné sur le site : mêmes encarts (`.definition`, `.propriete`,
  `.methode-f`, `.exercice-f`), **AUCUN pictogramme crayon** sur la fiche
  (le crayon ✎ n'existe que dans le cours en ligne).
- Chaque partie du chapitre est nettement délimitée : h2 avec numéro + champ
  **« date : ...... »** à droite (autonomie de gestion du temps des élèves) ;
  pages de continuation marquées par `<p class="suite">` discret.
- **TOUTES les définitions**, à rédiger **en entier** : cadre titré
  « Définition — [terme] » + lignes `.ligne` vides (les élèves écrivent les
  phrases complètes). Définition à plusieurs parties → sous-titres
  `.partie-def` pour chaque partie, dans le même cadre.
- **TOUTES les propriétés**, à compléter (trous `.trou` sur les notions clés).
- **Méthode (`.methode-f`) : PAS de texte à trous.** Une méthode se lit et se
  suit, elle ne se mémorise pas par cœur comme une définition : les étapes
  sont rédigées **en clair**, sans blancs à compléter.
- **TOUS les exercices du chapitre**, systématiquement : énoncé abrégé fidèle
  + zone de réponse adaptée (`.ligne` pour du rédigé, `.calc.lignes` pour du
  calcul, boîtes `.boite.pt` pour des coefficients à trouver).
- **PAS d'images, PAS d'exemples** : les élèves notent leurs propres exemples
  dans la colonne de notes. (Exception possible si un exemple est vraiment
  structurant — demander à Loïc.)
- Seulement les **schémas essentiels**, identifiés chapitre par chapitre,
  repris **TELS QUELS du cours** (mêmes SVG, réduits, avec leur légende dans
  `.schema .legende`). Pour T1-C2 : endo/exo, trois états, six changements
  (triangle), hot-dog avec sa légende. Un schéma contraint à une taille
  arbitrairement petite (`max-width` trop serré) doit être agrandi — ça sert
  aussi à équilibrer le remplissage des pages (voir pagination ci-dessous).
- Formule : cadre sobre `.formule-s`, formule en boîtes vides à gauche,
  « Grandeurs & unités » en lignes vides à droite, **rien de pré-rempli**,
  pas de panneau sombre.
- Structure Cornell : colonne de notes latérale qui s'étire jusqu'au pied de
  page (`.feuille` en flex, `.corps { flex:1 }`).
- Dernière page : « L'essentiel du chapitre, avec mes mots » + encadré code
  de déblocage (6 cases) ; signature dans le pied de la dernière page.
- Nombre de pages **pair** (recto-verso) ; ~250 mm utiles par page. Si le
  compte tombe impair une fois le contenu réparti, **replier la clôture**
  (« l'essentiel » + déblocage) sur la dernière page de contenu plutôt que
  de lui dédier une page à part entière.
- **Impression — fond blanc.** En `@media print`, le fond de `.feuille` est
  blanc pur (`#fff`), jamais le papier crème `--papier` (réservé à l'écran) :
  ça économise l'encre sur les tirages classe entière.
- **Aération.** Marge haute de 8mm au-dessus de chaque `h2` (pas 4mm), pour
  ne pas tasser les pages qui contiennent plusieurs grandes parties.
- **Pagination — mesurer, ne jamais estimer à l'œil.** Écrire un script
  Playwright qui mesure la hauteur réelle de chaque bloc de contenu
  (`getBoundingClientRect`), avec les polices du site installées localement
  (paquets `@fontsource/*` via npm — jamais de CDN) pour un rendu fidèle aux
  vraies métriques. Cible ~75-98 % de remplissage par page ; aucun titre de
  section (`h2`) seul en bas de page (le repousser à la page suivante).

## 7. Validation OBLIGATOIRE avant livraison

```text
□ node --check sur les scripts extraits de chaque fichier livré (page ET gabarits)
□ Playwright (CommonJS, require('/home/claude/.npm-global/lib/node_modules/playwright')) :
  □ chargement sans erreur JS
  □ verrou : verrouillé à l'arrivée (porte CENTRÉE, champ 6 caractères sans
    débordement) → mauvais code rejeté → bon code débloque (tester en
    minuscules) → persistance au rechargement → ?verrou=1 reverrouille
  □ images : OUVRIR tous les <details> puis scrollIntoViewIfNeeded IMAGE PAR
    IMAGE avant de tester naturalWidth (lazy loading : le défilement global
    donne des faux positifs)
  □ sommaire : section active correcte après 3 sauts de navigation
  □ captures bureau (1280px) : haut, 2 zones à figures, checklist + 1 mobile (390px)
□ Fiche : PDF via Playwright p.pdf({format:'A4', printBackground:true}) ;
  nombre de pages EXACT et PAIR (pdfinfo) ; contrôle du débordement de chaque
  .feuille (scrollHeight vs limite 297mm) ET de la marge entre le bas du
  contenu et le pied absolu (.pied) ; aperçu PNG de CHAQUE page via pdftoppm
□ Fiche — remplissage par page : mesurer (jamais estimer) la hauteur réelle
  de chaque page via getBoundingClientRect, avec les polices du site
  installées localement (@fontsource/*). Cible ~75-98 % par page, aucune
  page avec un titre de section seul en bas.
□ Contrôle visuel des captures AVANT livraison. Outil de visualisation en
  panne → contrôles automatiques (dimensions, contraste, couleurs charte,
  symétrie) + transparence dans le récapitulatif
```

Pièges connus (ne pas les reproduire) :
- Scripts Python d'édition : `assert count` avant chaque remplacement, écrire
  fichier par fichier (jamais tout accumuler puis écrire à la fin).
- Impression : `.feuille { height:296mm; overflow:hidden }` en `@media print`
  sinon pages fantômes ; `padding-bottom` suffisant pour le pied absolu.
- Sommaire actif : calcul à la position de défilement, PAS IntersectionObserver.
- `.formule-bloc` : PAS d'overflow:hidden (rogne le picto ✎) ; l'arrondi est
  sur `.eq` (border-radius:11px 0 0 11px).
- Repagination de la fiche : si le bloc de clôture (`.pleine-largeur`/
  `.deblocage`) est repositionné pour équilibrer les pages, ne l'insérer
  qu'à UN SEUL endroit — jamais à la fois dans la boucle normale des blocs de
  contenu ET en ajout spécial hors grille, sinon il apparaît en double
  silencieusement.
- Citations historiques : vérifier l'exactitude et la source ; mention
  « formule attribuée à » si paraphrase.

## 8. Livraison (format imposé)

1. **Archive delta** reproduisant l'arborescence, contenant UNIQUEMENT les
   fichiers créés/modifiés. **JAMAIS le site complet.**
2. Les fichiers HTML **aussi présentés individuellement** dans le panneau.
3. Le PDF de la fiche + aperçus PNG de chaque page.
4. Les captures d'écran de la page (bureau + mobile).
5. Récapitulatif final : erreurs corrigées dans la source (à signaler aux
   collègues le cas échéant), décisions prises, **décisions laissées ouvertes**,
   licences des images à confirmer, le code de déblocage et son empreinte.

## 9. Messages-types que Loïc colle en début de session

### 9a. V1 intégrale

Le message-type est dans `_modeles/CONSIGNES-V1-integrale-PC.md` §10.

### 9b. Régime B — raffinage (une conversation par chapitre)

> Voici le PPTX et le PDF du chapitre [Thème X, Chapitre Y — TITRE, niveau
> NIVEAU]. Slug : `SLUG`. Code de déblocage : `XXXXXX` (ou : « invente-le »).
> Applique `_modeles/CONSIGNES-chapitre-PC.md` (**régime B**) :
> extraction complète (images + QR, vérification visuelle des attributions),
> maquettes PNG des composants nouveaux avant implémentation, page de cours sur
> `gabarit-chapitre.html`, fiche élève sur `gabarit-fiche.html`, vérification
> scientifique des corrigés, validation Playwright, livraison en delta +
> fichiers HTML séparés + PDF + captures. Propose-moi les choix de trous de
> la fiche avant de finaliser.

## 10. Suivi de progression du projet (`_suivi/`)

Trois documents Markdown vivent dans le dépôt et servent de tableau de bord.
Les mettre à jour est **obligatoire** dès qu'un chapitre change d'état.

| Fichier | Rôle |
|---|---|
| `_suivi/ETAT-PROJET.md` | Vue d'ensemble : avancement global, **priorités**, alertes (« ⚠ ce chapitre n'est pas prêt »), prochaines actions |
| `_suivi/chapitres.md` | Tableau de bord détaillé **par chapitre** avec les flags de jalons |
| `_suivi/IDEES.md` | Réservoir d'idées et d'améliorations à trier (Loïc en aura « au fil de l'eau ») |

### Jalons d'un chapitre (dans l'ordre)

Un chapitre progresse par ces étapes ; la **fiche élève est le dernier jalon**,
faite seulement une fois le cours validé « utilisable en classe » :

1. `⬜ Ébauche en ligne` — régime A poussé, page navigable
2. `⬜ Texte & exercices validés` — Loïc a relu, corrigé, ok
3. `⬜ Images retravaillées` — photos extraites, schémas SVG, droits OK
4. `⬜ Ajouts & approfondissements` — les « on va plus loin » intégrés
5. `⬜ Cours VALIDÉ` — « je peux l'utiliser l'an prochain » ✅
6. `⬜ Fiche élève faite` — produite en tout dernier
7. `⬜ CHAPITRE CLOS` — cours + fiche + ajouts présents, rien en attente

Notation des flags : `⬜` à faire · `🔄` en cours · `✅` fait · `⚠` bloqué/attention.

En **fin de chaîne de régime A**, mettre `chapitres.md` à jour (tous les
chapitres ébauchés passent au jalon 1) et rafraîchir les priorités de
`ETAT-PROJET.md`.
