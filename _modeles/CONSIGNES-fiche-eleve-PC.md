# Fiches élève PC — standard de production

**Établi le 29/08/2026** en produisant la fiche de **T3-C1 · Émission et
perception d'un son**, première fiche de chapitre sortie d'un générateur.
**Portée :** toutes les fiches de chapitre de physique-chimie. T3-C1 est le
gabarit ; les suivantes se produisent en changeant le contenu, pas la méthode.

**Document jumeau :** `CONSIGNES-diaporama-PC.md`. Les deux supports partagent
la charte, les figures et plusieurs règles (fractions, indices, priorité aux
figures du site) mais servent des usages opposés : le diaporama montre, la
fiche fait écrire. En cas de doute, les règles communes sont numérotées de la
même façon dans les deux documents.

**Ce document explique comment *concevoir* une fiche.** L'*intégrer et la
régénérer* relève du dépôt : `node exporter-fiches.mjs` (§4) et le tableau
« Où est quoi » de `CLAUDE.md`.

**La chaîne vit dans `_outils/fiches/`** : `gabarit_fiche.py` (la feuille, le CSS,
les composants), `fiche_<code>.py` (le contenu d'un chapitre) et
`mesurer_pages.py` (le contrôle du remplissage). Déposée le 02/09/2026 et
vérifiée sur place : elle régénère la fiche de T3-C1 **octet pour octet**.

**Ce qu'il faut installer, une fois :**

```bash
pip install --user qrcode pillow      # indispensable : fabrique les QR
pip install --user pyzbar             # indispensable : les relit (contrôle bloquant)
pip install --user pymupdf            # mesurer_pages.py, si absent
```

`cairosvg` est **facultatif** : il exige la DLL cairo, absente des postes
Windows. Sans lui, la relecture des QR passe par un rendu maison du tracé SVG —
c'est bien le fichier livré qu'on relit, pas la matrice d'origine.

---

## 1. Ce qu'est une fiche, et ce qu'elle n'est pas

La fiche est **la feuille distribuée en classe**, imprimée en A4, que l'élève
complète pendant la séance et range dans son classeur.

Elle ne donne pas le cours, **elle le fait écrire**. Définitions et propriétés
sont des cadres vides à lignes ; les formules, des boîtes à remplir. Le cours
rédigé, les corrections et les développements restent en ligne.

Une fiche se produit **une fois le chapitre terminé sur le site**, jamais
avant : elle puise ses figures dans la page en ligne et sa fabrication est le
dernier geste du chapitre.

---

## 2. Les douze règles permanentes

### R1 · La fiche fait écrire
Seules les **figures** sont fournies : les faire recopier à la main coûterait
la séance. Tout le reste est vide. Sur T3-C1 : dix-huit cadres à lignes, trois
formules en boîtes, aucun texte de cours pré-rempli.

### R2 · Aucune correction
Les corrections vivent en ligne, derrière le code de déblocage de la dernière
page. Les SVG de correction du site sont écartés à l'extraction — sur T3-C1,
`t3c1ex1c` et `t3c1ex3c`.

### R3 · Les fractions s'écrivent numérateur sur dénominateur
Jamais de barre oblique, y compris sur papier. `frac(haut, bas)` compose la
fraction ; le membre de gauche est **aligné à droite** et la ligne rendue
**insécable**, sans quoi « A = » passe au-dessus de sa fraction dès que le
numérateur s'allonge.

### R4 · Les indices sont typographiques
`<sub>`, jamais d'espace. `U max` écrit avec une espace se lit comme deux mots.

### R5 · Les figures viennent du cours en ligne, relues à chaque génération
Elles ne sont **pas dupliquées** dans la fiche : `svg(source, cle)` les extrait
de la page par leur `aria-labelledby` à chaque exécution. Une figure
retravaillée en ligne se retrouve seule sur la fiche. La fiche ne peut pas
diverger du cours.

**Corollaire :** une figure qui ne tient pas en pleine largeur n'a rien à faire
sur la fiche. Réduite à 55 mm en deux colonnes, la frise des quatre étapes
devenait illisible ; le texte de la méthode la disait déjà en entier, elle est
restée en ligne. Même arbitrage pour les compressions et dilatations de la
propagation.

### R6 · Rien n'est pré-dessiné dans les exercices
**Des lignes horizontales, point.** Pas de tableau de réponse, pas de cadre de
calcul, pas de zone de schéma. Un cadre imposé dit à l'élève où s'arrêter ;
il trace lui-même le tableau ou le croquis dont il a besoin.
`exercice(..., lignes=n)` ne sait faire que ça, c'est volontaire.

### R7 · La figure d'un énoncé vit dans le cadre de l'énoncé
Posée à côté, elle se lit comme une illustration du cours ; posée dedans,
comme une donnée de l'exercice.

### R8 · Le cartouche identifie la fiche d'un coup d'œil
Première page, 60 mm : thème et discipline, chapitre, deux phrases
d'introduction, professeur, niveau, année, nature du document. Il existe parce
qu'imprimée et rangée dans un classeur, une fiche doit se reconnaître sans
être lue. Un titre en une ligne ne suffisait pas.

Son **fond est l'image de la diapositive de titre du diaporama**, délavée en
amont vers `#fdfcf8` (≈ 10 % d'image, 90 % de papier), au format 3,3 : 1.
Fiche et projection se répondent.

Le cartouche peut aussi porter **une citation d'ouverture** à la place ou en
plus de l'introduction — c'est une piste ouverte, non tranchée.

### R9 · Un seul QR vers le cours, en bas de la dernière page
Le répéter sur chaque feuille encombrait sans servir. Des **QR de révision**
peuvent en revanche être posés au fil du cours, là où ils servent : sur T3-C1,
signal périodique, cloche à vide, hauteur et timbre. Le Kahoot rejoint la
clôture.

**Tout QR est relu par décodage après rendu** (`verifier_qr`). Un QR faux ne se
voit pas à l'œil et envoie la classe entière nulle part. Un `✗` bloque la
livraison.

### R10 · Pas de champ « date »
Le cahier de texte fait déjà ce travail.

### R11 · Le professeur signe la fiche
Nom en 11 pt dans le cartouche, et en pied de chacune des pages. Logo du lycée
en haut à droite du cartouche, **version « LYCÉE »** — pas
`logo-isaac-baseline.png`, qui porte la signature du CFA.

### R12 · Le gabarit ne connaît aucun chapitre
`gabarit_fiche.py` porte la feuille, le CSS et les composants ;
`fiche_<code>.py` porte le contenu. Une correction de mise en page doit
profiter aux quatorze fiches, pas à une seule. **Ne jamais résoudre un
problème de chapitre en modifiant le gabarit.**

---

## 3. La feuille

| | |
|---|---|
| Format | A4, `padding 10 / 13 / 16 mm`, hauteur utile 271 mm |
| Bande de tête | 3,5 px encre, trois repères violet / teal / rouge |
| Colonne de contenu | 133 mm |
| Marge de notes | 46 mm, lignes de 7,6 mm |
| Ligne d'écriture | 7,4 mm, pointillé encre |
| Pied | nom du professeur à gauche, `page n/N · lycée` à droite |

Couleurs : `--encre #141A26`, `--papier #FDFCF8`, `--h-beta #1D9AAA`
(définitions), `--h-gamma #4A3F9E` (propriétés), `--h-alpha #D6402B`
(exercices, pièges), `--or-fonce #B28A1D` (méthode).

Polices : Spectral (corps), Space Grotesk (titres), IBM Plex Mono (étiquettes)
— les polices auto-hébergées du site, chargées par `../assets/css/fonts.css`.
Contrairement au diaporama, l'impression part d'un fichier maîtrisé : pas de
risque de substitution, on garde les polices du site.

### Le CSS reste classique
Tableaux, flottants, positions. **Pas de flex ni de grid** là où un tableau
suffit : le rendu doit être identique dans un navigateur et dans un moteur
d'impression. Plusieurs passes ont été perdues à cause de cette divergence.

---

## 4. La chaîne de production, dans l'ordre

```bash
# 1 · relever les figures disponibles dans la page du chapitre
grep -o 'aria-labelledby="[^"]*"' pages/<page>.html
#     écarter à la main les SVG de correction

# 2 · partir du chapitre précédent
cp _outils/fiches/fiche_t3c1.py _outils/fiches/fiche_<code>.py
#     changer COURS_DEFAUT, SORTIE, TITRE, PIED, INTRO, LIENS
#     réécrire le corps de construire() — et RIEN d'autre

# 3 · générer — depuis _outils/fiches/, le script remonte seul à la racine
cd _outils/fiches && python fiche_<code>.py
#     relit le cours, régénère la fiche dans fiches/, relit les cinq QR
#     un ✗ ou un ⚠ arrête la livraison

# 4 · exporter le PDF — depuis la racine du dépôt
node exporter-fiches.mjs         # lit fiches/*.html, pilote Chrome (printToPDF),
                                 # écrit assets/pdf/pc/fiches/ et contrôle chaque
                                 # export à la mesure : A4 209,9 × 297,0 mm,
                                 # une .feuille = une page, polices incorporées

# 5 · contrôler le remplissage — sur le PDF exporté, pas sur un rendu de contrôle
python _outils/fiches/mesurer_pages.py assets/pdf/pc/fiches/fiche-2nde-<code>.pdf

# 6 · poser le lien de téléchargement sur la page du chapitre
#     <div class="fiche-vierge hors-verrou"> … </div>
```

**`hors-verrou` n'est pas décoratif** : la classe place le lien avant le verrou
de déblocage. Un élève absent doit récupérer sa feuille sans attendre la fin
de séquence.

---

## 5. Le remplissage des pages

Une fiche à moitié vide en bas de page est du papier perdu et fait bâclé.
`mesurer_pages.py` dit, feuille par feuille, où s'arrête le contenu.

**Objectif : moins de 10 mm de creux par page, zéro débordement.**

Le piège vaut d'être connu : **une page pleine et une page rognée mesurent
exactement pareil**, 281 mm toutes les deux, puisque `overflow:hidden` coupe
ce qui dépasse. L'outil inspecte donc aussi la bande 281–286,5 mm et affiche
« DÉBORDE » s'il y trouve de l'encre. Sans ce contrôle, on livre des exercices
tronqués sans le voir.

On comble en agrandissant **ce qui sert** — lignes d'une définition ou d'un
exercice, taille d'une figure — jamais par du remplissage décoratif. Si le bas
de la dernière page reste creux, le bloc « L'essentiel du chapitre, avec mes
mots » y a sa place.

Sur T3-C1, le creux est passé de 269 mm (une page entière perdue) à 39 mm.

---

## 6. Les pièges techniques rencontrés

Chacun a coûté une passe. À relire avant de toucher au gabarit.

| Piège | Ce qui se passe | La règle |
|---|---|---|
| **Largeur du logo** | Sans contrainte CSS, le moteur prend la taille intrinsèque du PNG — 2481 px, soit 656 mm — et le tableau écrase toute la page | `.logo { width:34mm }`, non négociable |
| **Fond du cartouche** | `inset:0` et `background-size:cover` donnent tous deux un cartouche de 170 mm débordant de la feuille | `<img>` absolu dans un conteneur de **hauteur explicite** ; si l'intro s'allonge, augmenter la hauteur à la main |
| **`table > tr > td`** | Ne matche jamais : les moteurs insèrent un `tbody` implicite | Écrire `table.x td` |
| **Lignes de notes** | Un dégradé répété est arrondi par le moteur : l'interligne saute d'un demi-millimètre | Des `<i>` empilés de hauteur fixe |
| **Membre de gauche des formules** | Aligné à gauche, « f = » laisse un vide béant avant la fraction | Aligné à droite dans sa cellule |
| **Fraction à numérateur long** | « A = » passe au-dessus de sa fraction | `white-space:nowrap` sur `.eq` |
| **Page rognée** | Indiscernable d'une page pleine à la mesure | Inspecter la bande sous la limite |
| **Remplacement silencieux** | Un `.replace()` dont l'ancre a changé échoue sans rien dire : la fiche a été régénérée trois fois avec l'ancienne fonction `calcul()` | `assert s.count(ancre) == 1` avant tout remplacement |
| **Le cartouche avalé à l'impression** | `.feuille` est un conteneur flex, et passe en hauteur **fixe** à l'impression : ses enfants deviennent compressibles. Le cartouche (`height:60mm; overflow:hidden`) était écrasé à zéro et **disparaissait du PDF** — titre, logo et introduction compris — alors qu'il s'affiche parfaitement à l'écran | `.feuille > *:not(.corps) { flex-shrink:0 }`. Seul `.corps` absorbe la place restante ; un vrai débordement redevient visible, donc mesurable |
| **La clôture poussée sous le pied** | La **marge de notes** (33 lignes × 7,6 mm) est plus haute que la colonne principale : c'est elle qui fixe la hauteur du corps de page. Sur la dernière page, elle poussait le bloc de clôture par-dessus le pied, qui écrasait les cases du code et les deux QR | Sur la page qui porte la clôture, passer `lignes_notes=30`. Le contenu de la colonne principale n'y change rien — l'ajuster ne sert à rien |
| **Console Windows en cp1252** | Les `✓`, `✗` et `⚠` des messages lèvent `UnicodeEncodeError` : le script meurt **avant** d'écrire la fiche, et le message d'erreur masque la vraie cause | `sys.stdout.reconfigure(encoding="utf-8")` en tête du gabarit et de `mesurer_pages.py` |
| **Fins de ligne** | Python écrit du CRLF sous Windows : la fiche diffère de sa version en dépôt à chaque génération | `write_text(..., newline="\n")` |
| **poppler absent** | `mesurer_pages.py` appelait `pdftoppm`, qui n'est pas installé sous Windows | Rendu par **PyMuPDF**, sans binaire externe ni fichier temporaire ; `pdftoppm` reste en repli |

---

## 7. Contrôles avant de livrer

- [ ] Le script affiche `✓` pour **tous** les QR.
- [ ] `mesurer_pages.py` : aucun « DÉBORDE », aucun creux > 25 mm.
- [ ] Le PDF fait le nombre de pages annoncé par le générateur.
- [ ] Aucune correction : ni SVG `…c-t`, ni réponse dans un énoncé.
- [ ] Aucun champ « date ».
- [ ] Aucun nom de classe ni date de séance nulle part (RGPD).
- [ ] Les intitulés de définitions correspondent à ceux de la page en ligne.
- [ ] Les valeurs saisies en dur — tableaux de données, énoncés — recoupées
      avec le cours. **C'est le seul endroit où fiche et cours peuvent
      diverger en silence.**
- [ ] Le PDF vient de `node exporter-fiches.mjs` (Chrome), pas de WeasyPrint,
      et le script n'a signalé aucun écart de mesure.
- [ ] Aucun caractère hors des six familles auto-hébergées — `⁻¹`, `₆`, `⩽`,
      `≈`, `π`, `Δ`, `✓`, `⚠`. Le moteur les sert en **Arial** : ils sortent du
      PDF dans un autre dessin que le reste de la feuille. Les six fiches
      existantes en portent toutes ; T3-C1 écrit `m·s⁻¹` en page 6.

---

## 8. État de T3-C1

**Fait.** 8 pages. Cartouche avec fond micro délavé. 18 cadres à lignes,
3 formules en fraction, 6 exercices en lignes libres. 5 QR codes tous relus.
Figures reprises du cours : méthode écartée, extrema, amplitude, frise des
domaines, échelle dB, énoncés des exercices 1, 2 et 3. Bloc « avec mes mots »
et code de déblocage en clôture.

**Corrigé au passage.** Le tableau des célérités du diaporama était saisi de
mémoire et faux. Le cours en ligne donne Air 340 · **Eau 1450** · **Glace
3200** · **Verre 5300** · **Acier 5750** — cinq milieux, pas quatre. Le
diaporama a été recalé.

**Intégrée au dépôt le 02/09/2026.** Source `fiches/fiche-2nde-t3c1.html`
(fichier **généré**, ne pas éditer à la main), PDF de 8 pages en
`assets/pdf/pc/fiches/`, bloc de téléchargement `hors-verrou` posé sur la page
du chapitre. Contrôles au dépôt : cinq QR relus `✓`, A4 `209,9 × 297,0 mm`,
10 polices incorporées, creux cumulé **44 mm**, aucun débordement.

**Points restés ouverts.**

1. **La fiche s'arrête à l'exercice 6.** Les exercices 7 à 10 du cours n'y
   figurent pas — à confirmer.
2. **Deux figures du cours ne sont pas reprises** : compressions et
   dilatations, et les quatre étapes de la mesure d'une période. Dans les deux
   cas le texte dit déjà tout. À confirmer pour la seconde, présente dans une
   version antérieure.
3. **Le code de déblocage** à six cases est en dernière page comme sur T1-C2.
   Celui de T3-C1 est **S0NORE** (`_suivi/t3c1-releve.md`) — pour un nouveau
   chapitre, relever le code de la page avant de dessiner les cases.
4. **La citation d'ouverture** du cartouche n'est pas tranchée.
7. **La page 1 est pleine au millimètre** : le cadre Méthode se ferme à 281 mm,
   le pied démarre à 285,8 — correct à l'œil, mais `mesurer_pages.py` le
   signale, et toute ligne ajoutée à cette page débordera.
8. **Deux polices tombent en repli** dans le PDF : `Consolas-Italic` et
   `TimesNewRomanPSMT`. `fonts.css` ne fournit **pas d'italique pour IBM Plex
   Mono** — les mentions « Donnée : … » des énoncés sortent donc dans un autre
   dessin. C'est aussi ce qui rend la fiche un peu plus haute que l'aperçu du
   29/08, produit sur une machine où les polices étaient complètes.
5. **Le bloc de téléchargement** n'est pas posé sur la page du chapitre — il ne
   peut pas l'être, faute de fiche à télécharger (point 6).
6. 🔴 **La fiche n'existe pas dans le dépôt** : ni la source
   `fiches/fiche-2nde-t3c1.html`, ni `assets/pdf/pc/fiches/fiche-2nde-t3c1.pdf`.
   Seul un aperçu de contrôle en 8 pages subsiste, hors git
   (`_a-deposer/fiches-t3c1/`). Le chapitre reste donc, pour le dépôt, sans
   fiche — `_suivi/chapitres.md` dit vrai.

---

## 9. Ce que ce standard ne couvre pas

- **Les fiches outils** (`o1` à `o8`) suivent leurs propres consignes,
  `CONSIGNES-outil-PC.md`. Elles ne sont pas produites par ce générateur.
- **T1-C2 et T1-C4**, écrites à la main avant le générateur, ne suivent pas
  encore ce standard. Les y ramener supposerait de les réécrire en
  `fiche_t1c2.py` et `fiche_t1c4.py` — utile, non urgent.
- **Le rendu navigateur** ne peut pas être vérifié depuis l'environnement de
  production : le CSS est écrit conservateur pour limiter l'écart, mais c'est
  l'impression Chrome qui fait foi.
