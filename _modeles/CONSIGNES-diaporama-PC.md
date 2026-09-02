# Diaporamas de projection PC — standard de production

**Établi le 29/08/2026** en construisant le diaporama de **T3-C1 · Émission et
perception d'un son**, qui sert de référence.
**Portée :** tous les chapitres de physique-chimie. Le chapitre T3-C1 est le
gabarit ; les suivants se produisent en changeant le contenu, pas la méthode.

**Document jumeau :** `CONSIGNES-fiche-eleve-PC.md`. Les deux supports partagent
la charte, les figures et plusieurs règles — fractions, indices, priorité aux
figures du site — mais servent des usages opposés : le diaporama montre, la
fiche fait écrire.

🔴 **La chaîne de production n'existe pas.** `extract_svg.py`, `build.js` et
`anime.py` ont vécu le temps d'une session, hors dépôt, et ne sont pas
récupérables. **Ce document décrit donc une méthode, pas un outil rejouable** :
les neuf règles, la mécanique d'animation et les pièges gardent leur valeur —
ils diront quoi refaire — mais aucune commande de la §4 ne peut être lancée.

**Le diaporama de T3-C1, lui, existe** : 12 diapositives, 53 étapes d'animation,
34 médias. Il est **versionné** dans `assets/pptx/pc/diaporama-2nde-t3c1.pptx` —
précisément parce qu'il n'est plus régénérable : le perdre, ce serait le perdre
pour de bon.

**Aucune page ne renvoie vers lui** : c'est un support de projection, pas un
document d'élève. Le dépôt étant public, il reste néanmoins accessible par son
URL — d'où le contrôle fait avant de le verser : aucune correction à l'écran
(R1), aucune donnée d'élève ni de classe.

🔴 **Il n'est pas régénérable.** Toute retouche se fait **à la main dans
PowerPoint**, sur le fichier lui-même. C'est ce qui rend le point 1 de la §7
bloquant : le tableau des célérités y est faux, et rien ne peut le corriger
automatiquement.

---

## 1. À quoi sert ce document

Le diaporama n'est **pas** une version diapositive du cours en ligne. C'est un
**support de projection en classe** : il montre ce qu'on commente à l'oral,
révèle progressivement, et renvoie l'élève à sa fiche. Le cours complet, les
corrections et les exercices restent en ligne.

Un diaporama est produit **une fois le chapitre terminé sur le site**, jamais
avant : il puise ses figures dans la page en ligne et suit sa numérotation.

---

## 2. Les neuf règles permanentes

### R1 · Aucune correction à l'écran
Les énoncés apparaissent, jamais les réponses. Sur T3-C1, les deux SVG de
correction du site (`t3c1ex1c`, `t3c1ex3c`) sont écartés dès l'extraction.
Contrôle : `markitdown sortie.pptx | grep -iE "corrigé|réponse *:"` doit être
muet, et aucun fichier `*-correction-*` ne doit figurer dans les appels d'image.

### R2 · Le pictogramme ✎ marque ce qui va sur la fiche
Pastille ocre + mention « SUR LA FICHE ». Sa légende est posée **dès la
diapositive de titre**, pour que l'élève sache à quoi il sert avant d'en
croiser un.

Le pictogramme se pose **uniquement** là où la page en ligne porte un
`<span class="a-noter">`. C'est la garantie que l'écran et la fiche ne peuvent
pas diverger. Sur T3-C1 : **seize marqueurs**. La page en portait quatorze quand
ce standard a été écrit ; recompter à chaque génération —
`grep -c 'class="a-noter"' pages/<page>.html`.

### R3 · Les fractions s'écrivent numérateur sur dénominateur
Jamais de barre oblique. La fonction `fraction()` compose la formule en **trois
objets PowerPoint natifs** (numérateur, trait, dénominateur) : rien n'est aplati
en image, on peut cliquer le numérateur et le changer.

Le membre de gauche est **aligné à droite** de sa boîte, pour que le signe « = »
bute contre la fraction quelle que soit sa longueur. Aligné à gauche, « f = »
laissait un vide béant que « c_son = » ne laissait pas.

Chaque formule est accompagnée du bloc **« Grandeurs & unités »** du cours en
ligne.

### R4 · Les indices sont typographiques
`U max` écrit avec une espace se lit comme deux mots au fond de la salle. Toute
grandeur indicée passe par `ind()`, qui produit un vrai indice :
U_max, U_min, c_son, t_i, t_f, f_2…

### R5 · Les figures viennent du cours en ligne, version la plus récente
**Priorité absolue aux SVG refaits** de la page (préfixe `site-` après
extraction) sur les images `-source` d'origine. On ne redessine **jamais** dans
PowerPoint une figure qui existe déjà sur le site.

C'est la règle qui a le plus coûté : à la première version, neuf figures avaient
été prises en version ancienne, et la frise infrasons/audible/ultrasons avait
même été **redessinée** alors que celle du site porte en plus le découpage
graves/mediums/aigus et l'échelle logarithmique.

### R6 · La numérotation des images est celle du site
Image 1 à 18 pour T3-C1. L'élève doit retrouver la même figure sous le même
numéro à l'écran, sur sa fiche et en ligne.

### R7 · La figure d'un énoncé vit dans le cadre de l'énoncé
Un schéma posé **à côté** du cadre se lit comme une illustration du cours ;
posé **dedans**, il se lit comme une donnée de l'exercice. Vaut aussi pour les
vignettes à classer et pour les icônes d'ambiance (orage, baleine).

### R8 · Charte du site, polices sûres
Couleurs : `--encre #141A26`, `--papier #FDFCF8`, `--h-beta #1D9AAA` (teal,
définitions), `--h-gamma #4A3F9E` (violet, propriétés et exercices),
`--h-alpha #D6402B` (rouge, pièges et alertes), `--or-fonce #B28A1D` (ocre,
marqueur fiche et méthode).

Polices : **Cambria** (titres), **Calibri** (corps), **Courier New** (étiquettes
techniques). Space Grotesk et IBM Plex du site ne sont **pas** installées
d'office sur les postes de l'établissement — la substitution serait incontrôlée
en projection.

### R9 · Logo en page de titre uniquement
Sur fond sombre, il faut une **plaque claire derrière** : son texte bleu nuit
disparaîtrait sinon.

---

## 3. La séquence d'animation

### Principe pédagogique
À chaque clic, une étape apparaît en fondu (0,4 s). L'ordre est toujours le
même :

1. **les images d'abord** — on les commente avec la classe ;
2. **les définitions et propriétés** — on institutionnalise ;
3. **la méthode ou la formule** ;
4. **l'exercice en dernier**.

Le bandeau de tête et le pied de page restent affichés dès l'arrivée sur la
diapositive.

Sur la checklist finale, les compétences se dévoilent **une par une** : chacune
se coche à l'oral avant d'apparaître.

T3-C1 : **53 étapes sur 11 diapositives** (la page de titre n'est pas animée).

### Comment c'est fabriqué
`pptxgenjs` ne sait pas poser d'animations. On procède donc en deux temps :

- `build.js` enregistre, pendant la construction, **quelles formes composent
  chaque étape** — via `fige(s)`, `marque(s, rang, nom)` — et écrit
  `sequences.json`. Le `rang` est explicite parce que **l'ordre d'apparition
  n'est pas celui du code** : les figures sont souvent construites après les
  encadrés alors qu'elles doivent s'afficher avant.
- `anime.py` relit ce manifeste et injecte le `<p:timing>` directement dans le
  XML de chaque diapositive.

---

## 4. La chaîne de production, telle qu'elle a tourné une fois

🔴 **Ces commandes ne peuvent plus être lancées** — les scripts n'existent pas
(voir l'encadré de tête). Elles sont conservées parce qu'elles disent *ce qu'il
faut refaire*, et dans quel ordre, le jour où l'on réoutille.

```bash
# 1 · extraire les figures refaites de la page du chapitre
python3 extract_svg.py          # SVG inline → PNG transparents, préfixe « site- »
                                # écarter à la main les SVG de correction

# 2 · construire le diaporama
node build.js                   # → sortie.pptx + sequences.json

# 3 · injecter les animations
python3 anime.py                # → sortie-anime.pptx

# 4 · valider le fichier
python3 .../office/validate.py sortie-anime.pptx

# 5 · contrôle visuel, diapositive par diapositive
python3 .../office/soffice.py --headless --convert-to pdf sortie-anime.pptx
pdftoppm -jpeg -r 150 sortie-anime.pdf d
```

**L'étape 5 n'est pas facultative.** Sur T3-C1, chaque passe a révélé des
défauts réels : vignette débordant hors de la diapositive, légende passant sous
le pied de page, cadre d'exercice laissé en double, figure trop petite pour
être lue.

---

## 5. Les pièges techniques rencontrés

À relire avant de produire le chapitre suivant : chacun a coûté une passe.

| Piège | Ce qui se passe | La règle |
|---|---|---|
| **Lien hypertexte** | Posé sur les options de la zone de texte, `pptxgenjs` écrit un `r:id` « undefined » et **PowerPoint déclare le fichier corrompu** | Le lien va sur le **run** de texte, jamais sur la zone. Sur l'image, `hyperlink` fonctionne normalement |
| **Identifiants du minutage** | `<p:cTn id>` en double ⇒ fichier illisible | Compteur unique et croissant sur tout l'arbre |
| **Étapes d'animation** | Si toutes les formes portent `clickEffect`, il faut autant de clics que de formes — 49 rien que pour la diapo 2 | La **première** forme d'une étape porte `clickEffect`, les suivantes `withEffect` |
| **Filigrane** | PowerPoint ne sait pas dégrader une image ; une simple `transparency` laisse un **bord franc** en plein milieu | Cuire le fondu dans le fichier image en amont |
| **Alignement dans les encadrés** | `valign` par défaut centre le texte, ce qui creuse un vide sous l'étiquette | `valign: "top"` sur le corps des blocs |
| **Couleurs** | `#` ou alpha dans l'hexadécimal ⇒ fichier corrompu | `color: "D6402B"`, transparence via `transparency: 0-100` |
| **Exposants et indices** | `fontSize` réduit ne suffit pas, l'aplomb est faux | `superscript: true` / `subscript: true` |

---

## 6. Contrôles avant de livrer

- [ ] `validate.py` passe.
- [ ] Aucune correction : `markitdown | grep -iE "corrigé|réponse *:"` muet.
- [ ] Chaque diapositive examinée en image : pas de superposition, pas de texte
      qui déborde d'un cadre, pas de légende sous le pied de page, marge de
      0,5 pouce aux bords.
- [ ] Le nombre de clics par diapositive égale le nombre d'étapes voulues
      (`grep -c 'nodeType="clickEffect"'` dans chaque `slideN.xml`).
- [ ] Aucune cible d'animation orpheline, aucun identifiant de minutage
      en double.
- [ ] Les liens hypertextes figurent bien dans les `.rels` des diapositives.
- [ ] Le pictogramme ✎ est exactement sur les blocs `a-noter` de la page.
- [ ] Les numéros d'image correspondent à ceux du site.

---

## 7. État de T3-C1

**Fait.** 12 diapositives, structure du PowerPoint 2025/2026 conservée (I à IV,
sous-parties A/B/C, checklist DS en dernier). Charte du site. Année 2026/2027.
Micro en filigrane sur la page de titre. 12 figures refaites reprises du site
sur 13 extraites. 3 formules en fraction. 53 étapes d'animation. Vidéo de la
cloche à vide cliquable.

**Corrigé au passage.** Le PowerPoint d'origine disait, en Image 14, que « la
hauteur du signal sur le graphique s'appelle l'amplitude ». C'est l'erreur
relevée à l'audit 3 : l'amplitude vaut la **moitié** de l'écart entre les
extrema. La formule A = (U_max − U_min)/2 du site a été reprise telle quelle.

**Points restés ouverts.**

1. 🔴 **Le tableau des célérités est FAUX dans le fichier** — vérifié le
   02/09/2026 dans le `.pptx` lui-même : il porte toujours Air 340 · Eau **1 500**
   · **Bois 3 300** · Acier **5 000**, les quatre valeurs saisies de mémoire. Le
   cours en ligne et la fiche élève donnent Air 340 · Eau **1450** · Glace
   **3200** · Verre **5300** · Acier **5750** — **cinq milieux**. Projeté tel
   quel, l'écran contredit la feuille que l'élève complète.
   **À corriger à la main dans PowerPoint** : rien ne peut régénérer ce fichier,
   et passer de quatre à cinq colonnes touche la mise en page du tableau.
   Un avertissement rouge le signale sur la diapositive : le retirer une fois la
   correction faite.
2. **Les QR codes** du PowerPoint d'origine ne sont pas repris : leurs URL n'ont
   pas pu être décodées. À recoller depuis l'ancien fichier, ou à régénérer.
3. **La figure de méthode** affiche en bas son calcul d'exemple
   (T = 16,0 / 4 = 4,0 ms). C'est la méthode générique du site, pas la
   correction de l'exercice 1 — à trancher.
4. **« Danger de l'exposition sonore »** est affiché « C (suite) » et non « D » :
   le cours en ligne n'a que A, B, C dans la partie IV, le danger fait partie
   du C. Rien à corriger sur le site. Si un vrai D est souhaité, c'est la page
   en ligne qu'il faut modifier d'abord.
5. **`site-t3c1ex9-t.png`** (les trois signaux de l'exercice 9) a été extrait
   mais n'est utilisé nulle part : l'exercice 9 n'a pas de diapositive.
6. **Les animations n'ont pas pu être vues en mouvement** : LibreOffice rend le
   PDF avec tout affiché. Seule la structure du XML est validée. À tester en
   mode diaporama ; quelques regroupements demanderont sans doute un
   ajustement au vu de la classe.

---

## 8. Ce que ce standard ne couvre pas

- L'ordre des animations est figé dans le générateur. Déplacer un objet à la
  souris dans PowerPoint conserve son animation ; **en ajouter un impose de lui
  affecter une animation à la main**.
- Le diaporama ne remplace pas la fiche élève ni la page en ligne : il ne porte
  ni les corrections, ni les développements du cours, ni les encarts d'histoire
  des sciences dans leur version longue.
