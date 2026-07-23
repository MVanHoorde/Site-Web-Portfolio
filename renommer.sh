#!/bin/sh
# ============================================================
#  renommer.sh — renommages du 23/07/2026.
#  À lancer À LA RACINE du dépôt, dans Git Bash (Windows) ou WSL :
#      sh renommer.sh
#
#  Il ne déplace que des FICHIERS : les nouvelles références sont déjà
#  dans les .html de l'archive. Il fonctionne avant OU après extraction
#  de l'archive (il détecte le cas où les deux noms coexistent).
#
#  Motif : un préfixe de niveau par niveau (2nde- / 1re- / term-), les
#  jours du cahier en jNN- (sinon jour11 se classait avant jour4), et les
#  images préfixées par leur chapitre, minuscules et tirets. Les images
#  SNT portaient encore les noms bruts de Wikimedia, majuscules et
#  doubles underscores compris : Windows est insensible à la casse,
#  GitHub Pages non — c'est un 404 qui n'apparaît qu'en production.
# ============================================================
set -e

deplacer() {
  if [ -f "$1" ] && [ -f "$2" ]; then
    git rm -q -f "$1" && echo "  doublon retiré  $1"
  elif [ -f "$1" ]; then
    git mv "$1" "$2" && echo "  déplacé         $1"
  else
    echo "  déjà fait       $2"
  fi
}

echo '--- pages et cahier ---'
deplacer "pages/1ere-enseignement-scientifique.html" "pages/1re-enseignement-scientifique.html"
deplacer "pages/terminale-enseignement-scientifique.html" "pages/term-enseignement-scientifique.html"
deplacer "pages/terminale-spe-physique-chimie.html" "pages/term-spe-physique-chimie.html"
deplacer "pages/cours-1ere-cristaux.html" "pages/1re-pc-cristaux.html"
deplacer "cahier/jour11-metiers-sciences.html" "cahier/j11-metiers-sciences.html"
deplacer "cahier/jour4-youtubeurs-1.html" "cahier/j04-youtubeurs-1.html"
deplacer "cahier/jour8-youtubeurs-2.html" "cahier/j08-youtubeurs-2.html"

echo
echo '--- images ---'
deplacer "assets/img/snt/2nde-snt-t1-internet/A_sketch_of_the_ARPANET_in_December_1969.jpg" "assets/img/snt/2nde-snt-t1-internet/t1-a-sketch-of-the-arpanet-in-december-1969.jpg"
deplacer "assets/img/snt/2nde-snt-t1-internet/Arpanet_in_the_1970s.jpg" "assets/img/snt/2nde-snt-t1-internet/t1-arpanet-in-the-1970s.jpg"
deplacer "assets/img/snt/2nde-snt-t1-internet/Arpanet_logical_map__march_1977.png" "assets/img/snt/2nde-snt-t1-internet/t1-arpanet-logical-map-march-1977.png"
deplacer "assets/img/snt/2nde-snt-t1-internet/CERN_Server_03.jpg" "assets/img/snt/2nde-snt-t1-internet/t1-cern-server-03.jpg"
deplacer "assets/img/snt/2nde-snt-t1-internet/CYCLADES-en.jpg" "assets/img/snt/2nde-snt-t1-internet/t1-cyclades-en.jpg"
deplacer "assets/img/snt/2nde-snt-t1-internet/First_Internet_Demonstration__1977.jpg" "assets/img/snt/2nde-snt-t1-internet/t1-first-internet-demonstration-1977.jpg"
deplacer "assets/img/snt/2nde-snt-t1-internet/Internet_map_1024_-_transparent__inverted.jpg" "assets/img/snt/2nde-snt-t1-internet/t1-internet-map-1024-transparent-inverted.jpg"
deplacer "assets/img/snt/2nde-snt-t1-internet/M__Louis_POUZIN_2013.jpg" "assets/img/snt/2nde-snt-t1-internet/t1-m-louis-pouzin-2013.jpg"
deplacer "assets/img/snt/2nde-snt-t1-internet/NSFNET-backbone-T3.jpg" "assets/img/snt/2nde-snt-t1-internet/t1-nsfnet-backbone-t3.jpg"
deplacer "assets/img/snt/2nde-snt-t2-le-web/AnnuaireElectroniqueSaintMalo1980.jpg" "assets/img/snt/2nde-snt-t2-le-web/t2-annuaire-electronique-saint-malo-1980.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c1/alliance.jpg" "assets/img/pc/2nde-pc-t1-c1/t1c1-alliance.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c1/cuivre.jpg" "assets/img/pc/2nde-pc-t1-c1/t1c1-cuivre.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c1/eau-de-chaux.jpg" "assets/img/pc/2nde-pc-t1-c1/t1c1-eau-de-chaux.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c1/fonte-marmite.jpg" "assets/img/pc/2nde-pc-t1-c1/t1c1-fonte-marmite.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c1/fonte-zoom.jpg" "assets/img/pc/2nde-pc-t1-c1/t1c1-fonte-zoom.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c1/huile-eau.jpg" "assets/img/pc/2nde-pc-t1-c1/t1c1-huile-eau.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c1/molecule-eau.jpg" "assets/img/pc/2nde-pc-t1-c1/t1c1-molecule-eau.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c1/sirop-the.png" "assets/img/pc/2nde-pc-t1-c1/t1c1-sirop-the.png"
deplacer "assets/img/pc/2nde-pc-t1-c4/adn.jpg" "assets/img/pc/2nde-pc-t1-c4/t1c4-adn.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c4/avogadro.jpg" "assets/img/pc/2nde-pc-t1-c4/t1c4-avogadro.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c4/cyclohexane-3d.jpg" "assets/img/pc/2nde-pc-t1-c4/t1c4-cyclohexane-3d.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c4/dopamine.jpg" "assets/img/pc/2nde-pc-t1-c4/t1c4-dopamine.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c4/eau-3d.jpg" "assets/img/pc/2nde-pc-t1-c4/t1c4-eau-3d.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c4/ethanol-3d.jpg" "assets/img/pc/2nde-pc-t1-c4/t1c4-ethanol-3d.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c4/feuille.jpg" "assets/img/pc/2nde-pc-t1-c4/t1c4-feuille.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c4/halite.jpg" "assets/img/pc/2nde-pc-t1-c4/t1c4-halite.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c4/neon-neon.jpg" "assets/img/pc/2nde-pc-t1-c4/t1c4-neon-neon.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c4/or-lingots.jpg" "assets/img/pc/2nde-pc-t1-c4/t1c4-or-lingots.jpg"
deplacer "assets/img/pc/2nde-pc-t1-c4/sulfate-3d.jpg" "assets/img/pc/2nde-pc-t1-c4/t1c4-sulfate-3d.jpg"
deplacer "assets/img/es/term-es-t2-c1/alternateurs-trois-echelles.png" "assets/img/es/term-es-t2-c1/t2c1-alternateurs-trois-echelles.png"
deplacer "assets/img/es/term-es-t2-c1/cellule-photovoltaique-couches.png" "assets/img/es/term-es-t2-c1/t2c1-cellule-photovoltaique-couches.png"
deplacer "assets/img/es/term-es-t2-c1/chaine-energetique-alternateur.png" "assets/img/es/term-es-t2-c1/t2c1-chaine-energetique-alternateur.png"
deplacer "assets/img/es/term-es-t2-c1/disque-de-faraday.jpg" "assets/img/es/term-es-t2-c1/t2c1-disque-de-faraday.jpg"
deplacer "assets/img/es/term-es-t2-c1/gap-semi-conducteurs.png" "assets/img/es/term-es-t2-c1/t2c1-gap-semi-conducteurs.png"
deplacer "assets/img/es/term-es-t2-c1/nrel-rendements-cellules.png" "assets/img/es/term-es-t2-c1/t2c1-nrel-rendements-cellules.png"
deplacer "assets/img/es/term-es-t2-c1/paris-nuit-18e-genillion.jpg" "assets/img/es/term-es-t2-c1/t2c1-paris-nuit-18e-genillion.jpg"
deplacer "assets/img/es/term-es-t2-c1/paris-nuit-19e-dessapt.png" "assets/img/es/term-es-t2-c1/t2c1-paris-nuit-19e-dessapt.png"
deplacer "assets/img/es/term-es-t2-c1/portrait-faraday.jpg" "assets/img/es/term-es-t2-c1/t2c1-portrait-faraday.jpg"
deplacer "assets/img/es/term-es-t2-c1/schema-alternateur-rotor-stator.png" "assets/img/es/term-es-t2-c1/t2c1-schema-alternateur-rotor-stator.png"
deplacer "assets/img/es/term-es-t2-c1/spectre-soleil-vs-cellule.png" "assets/img/es/term-es-t2-c1/t2c1-spectre-soleil-vs-cellule.png"
deplacer "assets/img/es/term-es-t2-c1/spectres-absorption-ge-si-gaas.png" "assets/img/es/term-es-t2-c1/t2c1-spectres-absorption-ge-si-gaas.png"
deplacer "assets/img/es/term-es-t2-c1/theorie-des-bandes.png" "assets/img/es/term-es-t2-c1/t2c1-theorie-des-bandes.png"
deplacer "assets/img/es/term-es-t2-c1/wafer-silicium.jpg" "assets/img/es/term-es-t2-c1/t2c1-wafer-silicium.jpg"

echo
echo 'Terminé. Contrôle :  node verifier.mjs'
