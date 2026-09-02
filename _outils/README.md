# `_outils/` — l'outillage, pas le site

Rien ici n'est publié. Ce dossier tient les scripts qui **fabriquent ou
contrôlent** le contenu, et rien d'autre. Les scripts de service du dépôt
(`verifier.mjs`, `exporter-fiches.mjs`, `generer-*.mjs`) restent à la racine :
ils sont d'usage courant et le `MANIFESTE` les nomme.

| Dossier | Ce qu'il tient |
|---|---|
| `tests/` | Contrôles ponctuels écrits pendant un audit, gardés parce qu'ils se rejouent : `normaliser.mjs`, `releve.mjs`, `revelation.mjs` (moteur SNT). |
| `fiches/` | **Le générateur des fiches élève PC** : `gabarit_fiche.py` (la feuille, le CSS, les composants — commun aux quatorze fiches), `fiche_<code>.py` (le contenu d'un chapitre), `mesurer_pages.py` (le remplissage). Consignes : `_modeles/CONSIGNES-fiche-eleve-PC.md`. |

## Les scripts de `tests/` se lancent depuis la racine

Ils lisent le dépôt en chemin relatif (`DEPOT = '.'`) :

```bash
node _outils/tests/normaliser.mjs      # depuis la racine, jamais depuis _outils/
```

## Générer une fiche

```bash
pip install --user qrcode pillow pyzbar pymupdf   # une fois
cd _outils/fiches && python fiche_t3c1.py         # → fiches/fiche-2nde-t3c1.html
node exporter-fiches.mjs                          # → assets/pdf/pc/fiches/  (depuis la racine)
python _outils/fiches/mesurer_pages.py assets/pdf/pc/fiches/fiche-2nde-t3c1.pdf
```

`cairosvg` est facultatif : il exige la DLL cairo, absente sous Windows. Sans
lui, la relecture des QR passe par un rendu maison du tracé SVG.

🔴 **`fiches/fiche-2nde-t3c1.html` est un fichier généré** : toute retouche se
fait dans `_outils/fiches/`, jamais dans le HTML.

## Pas de chaîne pour les diaporamas

Elle n'existe pas et ne sera pas récupérée : `extract_svg.py`, `build.js` et
`anime.py` ont vécu le temps d'une session hors dépôt. `_outils/diaporamas/`
n'existe donc pas non plus — un dossier vide qui attend indéfiniment est un
mensonge de rangement.

`_modeles/CONSIGNES-diaporama-PC.md` reste utile comme **méthode** (les neuf
règles, la séquence d'animation, les pièges), pas comme mode d'emploi d'un
outil. Le diaporama de T3-C1 existe et se retouche **à la main dans
PowerPoint** ; il est à l'abri, hors Git, dans `_a-deposer/diaporamas/`.
