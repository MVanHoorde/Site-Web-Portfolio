#!/usr/bin/env python3
"""
fiche_t3c1.py — contenu de la fiche élève du chapitre T3-C1.

Ce fichier ne contient QUE ce qui est propre au chapitre : le découpage en
feuilles, les intitulés des définitions, les énoncés d'exercices, les figures
appelées et les ressources en ligne. Toute la mise en page vient de
`gabarit_fiche.py`.

USAGE
    python3 fiche_t3c1.py [chemin/vers/la/page/de/cours.html]

    Produit ../../fiches/fiche-2nde-t3c1.html (chemin relatif au dépôt).

QUAND LE COURS CHANGE — relancer ce script. Les figures sont relues dans la
page du cours à chaque exécution : une figure retravaillée en ligne se
retrouve automatiquement sur la fiche, dans sa version la plus récente.
"""

import sys
from pathlib import Path

from gabarit_fiche import (
    charger_cours, svg, qr_svg, verifier_qr, document, feuille,
    cartouche, h2, suite, ss, encart, figure, formule, exercice, duo,
    qr_renvoi, cloture, essentiel, calcul, frac, ligne, B, BP,
)

RACINE = Path(__file__).resolve().parents[2]
COURS_DEFAUT = RACINE / "pages" / "2nde-pc-t3-c1-emission-perception-son.html"
SORTIE = RACINE / "fiches" / "fiche-2nde-t3c1.html"

TITRE = "Thème 3 · Chapitre 1 — Émission et perception d'un son"
PIED = "<b>M. Van Hoorde</b> · Fiche élève — Thème 3 · Chapitre 1"

# Deux phrases, pas trois : le cartouche annonce, il ne résume pas.
INTRO = ("Quelque chose vibre, et cette vibration voyage jusqu'à ton oreille "
         "en faisant trembler l'air — sans qu'aucune matière ne fasse le "
         "trajet. Tout le chapitre consiste à rendre cela <b>mesurable</b> : "
         "pourquoi un son est grave ou aigu, fort ou faible, pourquoi le "
         "tonnerre arrive après l'éclair, et pourquoi certains sons abîment "
         "l'oreille pour de bon.")

# Ressources en ligne renvoyées par QR code. Vérifiées à chaque production.
LIENS = {
    "cours": "https://mvanhoorde.github.io/Site-Web-Portfolio/pages/"
             "2nde-pc-t3-c1-emission-perception-son.html",
    "video-periodique": "https://youtu.be/baUAeWXAdX4",
    "video-cloche": "https://youtu.be/Xy6fIDGPerc",
    "video-timbre": "https://www.youtube.com/watch?v=ImojPxKXeKg",
    "kahoot": "https://create.kahoot.it/share/bilan-emission-et-perception-"
              "d-un-son/247395f6-5278-4e96-8047-471069e977b9",
}


def construire(chemin_cours):
    src = charger_cours(chemin_cours)
    qr = {}
    print("QR codes :")
    for nom, url in LIENS.items():
        qr[nom] = qr_svg(url)
        verifier_qr(qr[nom], url)

    T = 8
    P = []

    # --- tableau de données propre au chapitre ---------------------------
    # Valeurs reprises du Tableau 1 de la page du cours — à recontrôler si
    # le cours change.
    tab_celerites = (
        '      <table class="t" style="margin-top:1mm;">\n'
        '        <thead><tr><th>Milieu</th><th>Air</th><th>Eau</th>'
        '<th>Glace</th><th>Verre</th><th>Acier</th></tr></thead>\n'
        '        <tbody><tr><th style="font-family:inherit;font-weight:400;">'
        'Vitesse du son</th><td>340 m·s⁻¹</td><td>1450 m·s⁻¹</td>'
        '<td>3200 m·s⁻¹</td><td>5300 m·s⁻¹</td><td>5750 m·s⁻¹</td></tr></tbody>\n'
        '      </table>\n'
        '      <p class="mini" style="margin:.8mm 0 2mm;">Tableau 1 — Quelques '
        'vitesses du son selon le milieu.</p>\n')

    methode = (
        '      <div class="encart methode-f">\n'
        '        <div class="etq">Méthode — Mesurer une période sur un graphe</div>\n'
        '        <ol>\n'
        '          <li>Repérer un <b>motif élémentaire</b> qui se répète.</li>\n'
        '          <li>En compter <i>n</i> consécutifs, le plus possible.</li>\n'
        '          <li>Lire les instants <i>t</i><sub>i</sub> (départ) et '
        '<i>t</i><sub>f</sub> (arrivée).</li>\n'
        f'          <li>En déduire la période : &nbsp; <i>T</i> = '
        f'{frac(f"{B} − {B}", B)}</li>\n'
        '        </ol>\n'
        '        <p class="mini" style="margin-top:1mm;">Pourquoi plusieurs '
        "motifs ? La lecture des instants est imprécise ; sur <i>n</i> motifs, "
        'on divise cette imprécision par <i>n</i>.</p>\n      </div>\n')

    # --- 1 · phénomène périodique, période, méthode -----------------------
    P.append(feuille(1, T,
        h2("01", "Caractéristiques d'un signal périodique")
        + encart("definition", "Définition — Phénomène périodique", 5)
        + ss("A · Période")
        + encart("definition", "Définition — Période", 7)
        + methode,
        PIED,
        entete=cartouche(
            "Thème 3 · Ondes et signaux — Physique-Chimie",
            "Chapitre 1 — Émission et perception d'un son",
            INTRO,
            "../assets/img/pc/2nde-pc-t3-c1/t3c1-micro-bandeau.jpg")))

    # --- 2 · exercice 1, fréquence, exercice 2 ----------------------------
    P.append(feuille(2, T,
        suite("01", "période — exercice, puis fréquence")
        + exercice(1, "Période d'un signal",
                   "On observe à l'oscilloscope le signal délivré par un "
                   "microphone placé devant une source sonore. Calculer la "
                   "période <i>T</i> de ce signal.",
                   svg(src, "t3c1ex1-t"), "128mm", lignes=4)
        + ss("B · Fréquence")
        + encart("definition", "Définition — Fréquence", 5)
        + formule("<i>f</i>", frac(B, B), 3)
        + exercice(2, "Fréquence d'un signal",
                   "Calculer la fréquence du signal de l'exercice 1.", lignes=3), PIED))

    # --- 3 · extrema et amplitude ----------------------------------------
    P.append(feuille(3, T,
        suite("01", "extrema et amplitude")
        + ss("C · Extrema et amplitude")
        + encart("definition", "Définition — Extrema", 6)
        + formule("<i>A</i>", frac(f"{B} − {B}", BP), 4)
        + encart("attention-f", "Attention — deux notions à ne pas confondre", 5,
                 avant='<p class="question-f" style="margin-bottom:1mm;">La '
                       "<b>hauteur</b> d'un son dépend de sa … ; son "
                       "<b>intensité</b> dépend de son … . Ce sont deux "
                       'caractéristiques indépendantes.</p>')
        + figure(svg(src, "t3c1f14-t"),
                 "L'amplitude A sépare le sommet de la position moyenne ; "
                 "l'écart crête à crête, en pointillé, en vaut le double.", "131mm")
        + qr_renvoi(qr["video-periodique"],
                    "Réviser en vidéo — le signal périodique",
                    "période, fréquence, amplitude : tout le début du chapitre"),
        PIED))

    # --- 4 · exercice 3, puis les ondes -----------------------------------
    P.append(feuille(4, T,
        suite("01", "extrema — exercice, puis les ondes")
        + exercice(3, "Période, fréquence et extrema",
                   "Déterminer la période <i>T</i>, la fréquence <i>f</i>, les "
                   "tensions <i>U</i><sub>max</sub> et <i>U</i><sub>min</sub>, "
                   "puis l'amplitude <i>A</i> du signal ci-dessous.",
                   svg(src, "t3c1ex3-t"), "128mm", lignes=5)
        + h2("02", "Les ondes")
        + encart("definition", "Définition — Onde", 5)
        + encart("propriete", "Propriété — Les deux familles d'ondes", 7,
                 avant='<p class="question-f" style="margin-bottom:1mm;">Ondes '
                       '<b>mécaniques</b> · ondes <b>électromagnétiques</b> '
                       '(OEM)</p>'), PIED))

    # --- 5 · exercice 4, émission, propagation ----------------------------
    P.append(feuille(5, T,
        suite("02", "les ondes — exercice, puis émission")
        + exercice(4, "Onde mécanique ou électromagnétique ?",
                   "Indiquer, pour chaque cas, s'il s'agit d'une onde "
                   "mécanique ou d'une onde électromagnétique : ondes "
                   "sismiques · ondes radio · onde sonore · vague · lumière "
                   "du Soleil.", lignes=4)
        + h2("03", "Émission et propagation d'un signal sonore")
        + ss("A · Émission du signal sonore")
        + encart("definition", "Définition — Émetteur", 7)
        + '      <p><b>Remarque —</b> pour être plus audible, le son émis doit '
          'être amplifié par une <span class="trou long"></span>.</p>\n'
        + ss("B · Propagation du signal sonore")
        + encart("propriete", "Propriété — Propagation", 7)
        + qr_renvoi(qr["video-cloche"], "L'expérience de la cloche à vide",
                    "on retire l'air : la sonnerie se tait, alors qu'on la voit "
                    "vibrer"), PIED))

    # --- 6 · vitesse du signal sonore -------------------------------------
    P.append(feuille(6, T,
        suite("03", "vitesse du signal sonore")
        + ss("C · Vitesse du signal sonore")
        + encart("definition", "Définition — Célérité", 5)
        + '      <p class="a-connaitre">À connaître par cœur : &nbsp; '
          '<i>c</i><sub>son</sub>(air) = <span class="trou"></span></p>\n'
        + formule("<i>c</i><sub>son</sub>", frac(B, B), 3)
        + tab_celerites
        + exercice(5, "Distance de l'orage",
                   "Tu vois un éclair, puis le tonnerre te parvient 9 secondes "
                   "plus tard. À quelle distance se trouve l'orage ?", lignes=5)
        + exercice(6, "Le chant des baleines",
                   "Le chant d'une baleine bleue a pu être entendu à 1000 km du "
                   "cétacé, dans l'eau. Combien de temps met-il pour parcourir "
                   'cette distance ? <span class="mini">Donnée : '
                   "<i>c</i><sub>son</sub>(eau) = 1450 m·s⁻¹</span>", lignes=5), PIED))

    # --- 7 · fréquences audibles, hauteur et timbre -----------------------
    P.append(feuille(7, T,
        h2("04", "Perception des sons")
        + ss("A · Fréquences audibles, infrasons et ultrasons")
        + encart("definition", "Définition — Sons audibles, infrasons, ultrasons", 7)
        + figure(svg(src, "t3c1f9-t"),
                 "Le domaine des fréquences audibles, encadré par les infrasons "
                 "et les ultrasons. L'échelle est logarithmique : chaque "
                 "graduation multiplie la fréquence par 10.", "128mm")
        + ss("B · Hauteur et timbre d'un son")
        + encart("definition", "Définition — Hauteur et timbre", 10)
        + qr_renvoi(qr["video-timbre"], "Réviser en vidéo — hauteur et timbre",
                    "pourquoi deux instruments jouant la même note ne sonnent "
                    "pas pareil"), PIED))

    # --- 8 · niveau d'intensité, danger, clôture --------------------------
    P.append(feuille(8, T,
        suite("04", "niveau d'intensité sonore")
        + ss("C · Niveau d'intensité sonore")
        + duo(encart("definition", "Définition — Niveau d'intensité sonore", 6)
              + encart("propriete", "Propriété — Danger de l'exposition sonore", 6),
              figure(svg(src, "t3c1f15-t"),
                     "Échelle des niveaux d'intensité sonore."),
              part_gauche="50%")
        + essentiel(5), PIED,
        # 30 lignes de notes et non 33 : c'est la marge de notes, plus haute que
        # la colonne principale, qui fixe la hauteur du corps de page. À 33, elle
        # poussait le bloc de clôture sous le pied, qui écrasait les cases du
        # code et les deux QR. Seule la dernière page porte une clôture.
        lignes_notes=30,
        apres=cloture(qr["cours"], qr["kahoot"])))

    commentaire = """<!-- ============================================================
     FICHE ÉLÈVE — T3-C1 · ÉMISSION ET PERCEPTION D'UN SON
     🔴 FICHIER GÉNÉRÉ — ne pas éditer à la main.
     Source : _outils/fiches/fiche_t3c1.py + gabarit_fiche.py
     Régénérer après toute modification du cours en ligne.

     🔴 La fiche ne donne pas le cours, elle le fait écrire : définitions en
     cadres vides, formules en boîtes. Seules les figures sont fournies.
     🔴 Les figures sont relues dans pages/2nde-pc-t3-c1-…html à chaque
     génération : la fiche ne peut pas diverger du cours.
     🔴 Aucune correction ici — elles vivent en ligne, derrière le code de
     déblocage de la dernière page.
     ============================================================ -->"""

    html = document(f"Fiche élève — {TITRE}", P, commentaire)
    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    # newline en LF : sans lui, Python écrit du CRLF sous Windows et le fichier
    # diffère de sa version en dépôt à chaque génération.
    SORTIE.write_text(html, encoding="utf-8", newline="\n")
    print(f"\n→ {SORTIE}  ({len(html) // 1024} Ko, {T} pages)")


if __name__ == "__main__":
    chemin = Path(sys.argv[1]) if len(sys.argv) > 1 else COURS_DEFAUT
    if not chemin.exists():
        raise SystemExit(f"Page de cours introuvable : {chemin}")
    construire(chemin)
