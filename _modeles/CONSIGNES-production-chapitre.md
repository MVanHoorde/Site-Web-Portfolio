# CONSIGNES — Production d'un chapitre (page de cours + fiche élève)

Tu produis un chapitre du site pédagogique de Loïc Van Hoorde (professeur de
physique-chimie, lycée Isaac de l'Étoile) à partir de ses sources PPTX/PDF.
**Tout se fait en français.** Le gabarit est validé et NON négociable : ta
mission est un travail de fidélité et de rigueur, pas de créativité de mise
en page.

## 0. Fichiers de référence (dans le dépôt)

| Fichier | Rôle |
|---|---|
| `_modeles/gabarit-chapitre.html` | Squelette de la page de cours (CSS/JS réels inclus) |
| `_modeles/gabarit-fiche.html` | Squelette de la fiche élève imprimable |
| `pages/2nde-pc-t1-c1-matiere-macroscopique.html` | **Exemple complet de référence** (13 SVG, tableaux, verrou) |
| `fiches/fiche-2nde-t1c1.html` | Exemple complet de fiche |
| `style.css`, `assets/css/fonts.css` | Charte du site (ne pas modifier) |

En cas de doute sur un composant : ouvrir l'exemple de référence et copier
sa manière de faire.

## 1. Entrées attendues de Loïc

- Le PPTX et/ou le PDF du chapitre (le PDF fait foi pour le rendu final).
- Le niveau, le thème, le numéro de chapitre → **slug** : `2nde-t1c2`,
  `1ere-t2c1`, etc.
- Le code de déblocage à 6 caractères (lettres+chiffres). S'il ne le donne
  pas : **demander**, ne pas l'inventer.

## 2. Charte (rappel — tout est déjà dans les gabarits)

- Couleurs : encre `#141a26` · papier `#fdfcf8` · grille `#e8e4d8` ·
  Hα rouge `#d6402b` · Hβ cyan `#1d9aaa` · Hγ violet `#4a3f9e` · gris `#6b6f7a`.
- Teintes pastel pour les aires de schémas : bleu `#5aa7c9`/`#bfe0f2`,
  jaune `#e3c05e`, vert `#6fae7a`, rouge doux `#d97a63`, or `#f0cf6e`.
- Polices : Space Grotesk (titres), Spectral (texte), IBM Plex Mono (étiquettes,
  légendes, données). Toujours via `../assets/css/fonts.css`, jamais Google Fonts.
- Minimiser le gras dans les textes pédagogiques.

## 3. Protocole d'extraction des sources

```bash
# 1. Décompresser le PPTX (c'est un zip)
python3 /mnt/skills/public/pptx/scripts/office/unpack.py SOURCE.pptx unpacked/

# 2. Décoder TOUS les QR codes (pyzbar, PAS cv2.QRCodeDetector qui en rate)
apt-get install -y libzbar0 && pip install pyzbar --break-system-packages
# → sur chaque image : decode(im) puis, si échec, upscale ×3 + binarisation.

# 3. Extraire les images du PDF AVEC leur numéro de page (mapping fiable)
pdfimages -all -p -f 2 -l N SOURCE.pdf pdfimg/p    # noms p-PPP-NNN
```

Règles d'or apprises sur le chapitre 1 :
- Le mapping diapo→image via les `.rels` du PPTX est **trompeur** (décorations,
  doublons). Croiser avec `pdfimages -p` (page certaine) et **vérifier
  visuellement chaque attribution** (planche contact + `view`).
- Figure vectorielle absente de `pdfimages` → la découper dans le rendu de page
  (`pdftoppm -r 200`) par coordonnées de mise en page, avec rognage des marges
  blanches. Ne jamais livrer une découpe avec bordures/légendes parasites.

## 4. Règles de contenu de la page

1. **Texte fidèle à la source, mot pour mot.** Aucune reformulation non signalée.
2. **Vérifier chaque calcul des corrigés à la main** (refaire les A.N.).
   Erreur dans la source → corriger dans la page **ET la signaler dans le
   récapitulatif final** (jamais de correction silencieuse).
3. Images :
   - **Photos réelles** → conservées, optimisées (≤900 px, JPEG q82),
     dans `assets/img/SLUG/` avec des noms parlants.
   - **Schémas, graphiques, cliparts, tableaux-images** → refaits :
     SVG inline dans la charte (schémas/courbes) ou tableaux HTML
     (`table.tab`, pastilles de couleur si besoin). Zéro image datée.
   - Courbes SVG : mêmes valeurs que la source, lecture graphique en
     pointillés Hα si un exercice l'exploite.
4. QR codes → pastilles `.video-chip` : libellé court + `↗`, cible `_blank`,
   `rel="noopener"`, **retirer les paramètres de pistage `?si=`**.
   Kahoot et DS → pastilles en fin de checklist.
5. Sections : `h2 id="ancre"` numérotées 01, 02… ; sommaire latéral ET
   sommaire mobile synchronisés ; checklist finale avec ids `ds1…dsN`.
6. Verrou : remplacer `EMPREINTE_SHA256_A_REMPLACER` (empreinte du code fourni,
   cf. commande en commentaire) et les deux `SLUG` (clés localStorage uniques).
7. Lier la page depuis la page du niveau (ex. `pages/2nde-physique-chimie.html`,
   chapitre correspondant : `<li><a href="...">Cours en ligne →</a></li>`).

## 5. Règles de la fiche élève

- Structure Cornell : colonne de notes latérale sur chaque page ; les éléments
  larges (schéma muet, grand tableau) passent en `.pleine-largeur`.
- Trous = notions clés du chapitre. **Proposer les choix, Loïc arbitre.**
- Chaque définition : lignes d'écriture qui vont au bout du cadre, en nombre
  suffisant (1 à 2 lignes pleines).
- Schémas de la page → versions **muettes** (étiquettes en pointillés à
  compléter, cercles à dessiner).
- Une sélection d'exercices de la page (pas tous) avec zones de calcul lignées.
- Dernière page : « L'essentiel du chapitre, avec mes mots » (6 lignes) +
  encadré du code de déblocage (6 cases).
- Budget : ~250 mm utiles par feuille ; nombre de pages **pair** (recto-verso).

## 6. Validation OBLIGATOIRE avant livraison

```text
□ node --check sur les scripts extraits de chaque fichier livré
□ Playwright (CommonJS, require('/home/claude/.npm-global/lib/node_modules/playwright')) :
  □ chargement sans erreur JS
  □ aucune image cassée APRÈS défilement complet (attention lazy loading)
  □ verrou : verrouillé à l'arrivée → mauvais code rejeté → bon code débloque
    (tester en minuscules) → persistance au rechargement → ?verrou=1 reverrouille
  □ sommaire : section active correcte après 3 sauts de navigation
  □ captures bureau (1280px) : haut, 2 zones à figures, checklist + 1 mobile (390px)
□ Fiche : PDF via Playwright p.pdf({format:'A4', printBackground:true}) ;
  nombre de pages EXACT (pas de page fantôme) ; contrôle visuel de CHAQUE page
  via pdftoppm (pointillés au bout des cadres, pied de page non chevauché)
□ Contrôle visuel des captures AVANT livraison (les regarder vraiment)
```

Pièges connus (déjà rencontrés, ne pas les reproduire) :
- Scripts Python d'édition : `assert count` avant chaque remplacement,
  écrire fichier par fichier (jamais tout accumuler puis écrire à la fin).
- Impression : `.feuille { height:296mm; overflow:hidden }` en `@media print`
  sinon pages fantômes ; `padding-bottom` suffisant pour le pied absolu.
- Sommaire actif : calcul à la position de défilement, PAS IntersectionObserver.
- `crypto.subtle` exige un contexte sécurisé (https / file:// moderne) : ne pas
  « simplifier » le verrou avec un hash maison.

## 7. Livraison (format imposé)

1. **Archive delta** reproduisant l'arborescence, contenant UNIQUEMENT les
   fichiers créés/modifiés (`pages/…`, `fiches/…`, `assets/img/SLUG/…`).
   **JAMAIS le site complet.**
2. Les fichiers HTML **aussi présentés individuellement** dans le panneau.
3. Le PDF de la fiche + aperçus PNG de chaque page.
4. Les captures d'écran de la page (bureau + mobile).
5. Récapitulatif final listant : erreurs corrigées dans la source (à signaler
   aux collègues le cas échéant), décisions prises, **décisions laissées
   ouvertes** (rien d'inventé, rien de silencieux), et le code de déblocage
   avec son empreinte.

## 8. Message-type que Loïc colle en début de session

> Voici le PPTX et le PDF du chapitre [Thème X, Chapitre Y — TITRE, niveau
> NIVEAU]. Slug : `SLUG`. Code de déblocage : `XXXXXX`.
> Applique `_modeles/CONSIGNES-production-chapitre.md` : extraction complète
> (images + QR), page de cours sur `gabarit-chapitre.html`, fiche élève sur
> `gabarit-fiche.html`, vérification scientifique des corrigés, validation
> Playwright, livraison en delta + fichiers HTML séparés + PDF + captures.
> Propose-moi les choix de trous de la fiche avant de finaliser.
