# CONSIGNES — Production d'un chapitre (page de cours + fiche élève)

Tu produis un chapitre du site pédagogique de Loïc Van Hoorde (professeur de
physique-chimie, lycée Isaac de l'Étoile) à partir de ses sources PPTX/PDF.
**Tout se fait en français.** La charte et la bibliothèque de composants sont
validées et NON négociables : ta mission est un travail de fidélité et de
rigueur, pas de créativité de mise en page.

## 0. Fichiers de référence (dans le dépôt)

| Fichier | Rôle |
|---|---|
| `_modeles/gabarit-chapitre.html` | Squelette de page de cours + **un exemplaire de chaque composant validé** (CSS/JS réels) |
| `_modeles/gabarit-fiche.html` | Squelette de la fiche élève imprimable (style v2 aligné sur le site) |
| `pages/2nde-pc-t1-c2-transformations-physiques-chimiques.html` | **Exemple complet de référence v2** (composants, exercices, SVG, verrou centré) |
| `fiches/fiche-2nde-t1c2.html` | Exemple complet de fiche v2 |
| `style.css`, `assets/css/fonts.css` | Charte du site (ne pas modifier) |

En cas de doute sur un composant : ouvrir l'exemple de référence et copier
sa manière de faire.

## 1. Entrées attendues de Loïc

- Le PPTX et/ou le PDF du chapitre (le PDF fait foi pour le rendu final).
- Le niveau, le thème, le numéro de chapitre → **slug** : `2nde-t1c2`, etc.
- Le code de déblocage à 6 caractères. S'il ne le donne pas : **demander**.

## 2. Workflow imposé : maquettes AVANT implémentation

1. Extraire et analyser les sources (§4).
2. **Pour tout composant nouveau ou schéma refait : produire un PNG individuel**
   (une capture par composant, via Playwright sur une page de maquette) et le
   soumettre à Loïc. S'il y a une vraie hésitation possible : proposer 2-3
   variantes. Ne JAMAIS implémenter un visuel non validé (sauf accord explicite
   « sans me le montrer »).
3. Implémenter après validation, d'un bloc.
4. Proposer les choix de trous de la fiche, Loïc arbitre.
5. Valider (§7) puis livrer (§8).

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
  `table.tab`). Photos réelles → conservées (≤900 px, JPEG q82,
  `assets/img/SLUG/`, noms parlants).
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
8. Lier la page depuis la page du niveau (`pages/NIVEAU-physique-chimie.html`).
9. Gras minimal dans les textes pédagogiques.

## 6. Règles de la fiche élève (v3)

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
- **TOUS les exercices du chapitre**, systématiquement : énoncé abrégé fidèle
  + zone de réponse adaptée (`.ligne` pour du rédigé, `.calc.lignes` pour du
  calcul, boîtes `.boite.pt` pour des coefficients à trouver).
- **PAS d'images, PAS d'exemples** : les élèves notent leurs propres exemples
  dans la colonne de notes. (Exception possible si un exemple est vraiment
  structurant — demander à Loïc.)
- Seulement les **schémas essentiels**, identifiés chapitre par chapitre,
  repris **TELS QUELS du cours** (mêmes SVG, réduits, avec leur légende dans
  `.schema .legende`). Pour T1-C2 : endo/exo, trois états, six changements
  (triangle), hot-dog avec sa légende.
- Formule : cadre sobre `.formule-s`, formule en boîtes vides à gauche,
  « Grandeurs & unités » en lignes vides à droite, **rien de pré-rempli**,
  pas de panneau sombre.
- Structure Cornell : colonne de notes latérale qui s'étire jusqu'au pied de
  page (`.feuille` en flex, `.corps { flex:1 }`).
- Dernière page : « L'essentiel du chapitre, avec mes mots » + encadré code
  de déblocage (6 cases) ; signature dans le pied de la dernière page.
- Nombre de pages **pair** (recto-verso) ; ~250 mm utiles par page.

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

## 9. Message-type que Loïc colle en début de session

> Voici le PPTX et le PDF du chapitre [Thème X, Chapitre Y — TITRE, niveau
> NIVEAU]. Slug : `SLUG`. Code de déblocage : `XXXXXX`.
> Applique `_modeles/CONSIGNES-production-chapitre.md` : extraction complète
> (images + QR, vérification visuelle des attributions), maquettes PNG des
> composants nouveaux avant implémentation, page de cours sur
> `gabarit-chapitre.html`, fiche élève sur `gabarit-fiche.html`, vérification
> scientifique des corrigés, validation Playwright, livraison en delta +
> fichiers HTML séparés + PDF + captures. Propose-moi les choix de trous de
> la fiche avant de finaliser.
