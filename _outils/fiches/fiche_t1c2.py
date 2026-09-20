#!/usr/bin/env python3
"""
fiche_t1c2.py — contenu de la fiche élève du chapitre T1-C2.

Ce fichier ne contient QUE ce qui est propre au chapitre : les intitulés des
définitions, les énoncés d'exercices, les figures appelées, les ressources en
ligne, et la découpe en pages. Toute la mise en page vient de
`gabarit_fiche.py`.

USAGE
    python3 fiche_t1c2.py [chemin/vers/la/page/de/cours.html]

    Produit ../../fiches/fiche-2nde-t1c2.html (chemin relatif au dépôt).

QUAND LE COURS CHANGE — relancer ce script. Les figures sont relues dans la
page du cours à chaque exécution : une figure retravaillée en ligne se
retrouve automatiquement sur la fiche, dans sa version la plus récente.

🔴 REMPLACE la fiche écrite à la main (10 pages, v4, antérieure au
générateur). Ne plus éditer `fiches/fiche-2nde-t1c2.html` directement.

🔴 POURQUOI UNE LISTE DE BLOCS ET DES COUPES — ce chapitre porte 22 éléments
de cours et 15 exercices, soit deux fois T3-C1. Repaginer en déplaçant des
appels `feuille()` à la main coûtait une passe entière à chaque essai. Ici le
contenu est une liste ORDONNÉE et `COUPES` dit seulement où couper : pour
rééquilibrer, on ne touche qu'à `COUPES` et au nombre de lignes des cadres.
Les en-têtes « suite » se déduisent tout seuls de la dernière partie ouverte.
"""

import sys
from pathlib import Path

from gabarit_fiche import (
    charger_cours, svg, qr_svg, verifier_qr, document, feuille,
    cartouche, h2, suite, ss, encart, figure, formule, exercice, duo,
    qr_renvoi, cloture, essentiel, calcul, frac, ligne, B, BP,
)

RACINE = Path(__file__).resolve().parents[2]
COURS_DEFAUT = (RACINE / "pages"
                / "2nde-pc-t1-c2-transformations-physiques-chimiques.html")
SORTIE = RACINE / "fiches" / "fiche-2nde-t1c2.html"

TITRE = "Thème 1 · Chapitre 2 — Transformations physiques et chimiques"
PIED = "<b>M. Van Hoorde</b> · Fiche élève — Thème 1 · Chapitre 2"

# Deux phrases, pas trois : le cartouche annonce, il ne résume pas.
INTRO = ("Un glaçon fond, une bougie brûle : dans les deux cas la matière "
         "change, mais dans un seul des deux les molécules elles-mêmes sont "
         "détruites et reconstruites. Tout le chapitre consiste à faire cette "
         "différence, puis à la rendre <b>quantitative</b> : quelle énergie "
         "coûte un changement d'état, et dans quelles proportions les espèces "
         "chimiques réagissent.")

# Ressources en ligne renvoyées par QR code. Relues à chaque production.
LIENS = {
    "cours": "https://mvanhoorde.github.io/Site-Web-Portfolio/pages/"
             "2nde-pc-t1-c2-transformations-physiques-chimiques.html",
    "video-thermique": "https://www.youtube.com/watch?v=PT69dkr1B00",
    "video-etats": "https://www.youtube.com/watch?v=irFQ30SCsIM",
    "video-equilibrer": "https://www.youtube.com/watch?v=hw31rpFjuuo",
    "kahoot-physique": "https://create.kahoot.it/share/"
                       "bilan-transformations-physiques/"
                       "cddd4fff-a579-4bdd-9809-eeef7b109e1a",
    "kahoot-chimique": "https://create.kahoot.it/share/"
                       "bilan-transformations-chimiques/"
                       "3cb2cd2a-b987-4484-83d7-c86ea6a5940f",
}

# Découpe en pages : index du PREMIER bloc de chaque page après la première.
# Mesuré au navigateur avec les polices du site, jamais estimé à l'œil.
COUPES = [4, 10, 14, 19, 25, 30, 34, 40, 43, 47, 52]


def codes_qr(muet=False):
    qr = {}
    if not muet:
        print("QR codes :")
    for nom, url in LIENS.items():
        qr[nom] = qr_svg(url)
        if not muet:
            verifier_qr(qr[nom], url)
    return qr


def blocs(src, qr):
    """Le contenu du chapitre, dans l'ordre, un élément par bloc.

    Séparé de `construire` pour qu'un outil de pagination puisse mesurer
    chaque bloc isolément et proposer les coupes (voir `COUPES`)."""

    # ---- blocs composites propres au chapitre --------------------------

    # La méthode se lit et se suit : elle est rédigée EN CLAIR, sans trous
    # (règle §6 des consignes de chapitre). Seul cadre de la fiche qui n'est
    # pas à compléter.
    methode = (
        '      <div class="encart methode-f">\n'
        '        <div class="etq">Méthode — Écrire et équilibrer une équation '
        'de réaction</div>\n'
        '        <ol>\n'
        '          <li>Identifier les <b>réactifs</b> et les <b>produits</b> '
        'de la réaction.</li>\n'
        '          <li>Écrire leurs formules brutes, avec leur état physique, '
        'de part et d\'autre de la flèche.</li>\n'
        '          <li>Compter chaque élément chimique des deux côtés. Placer '
        'des coefficients pour les égaliser, en commençant par l\'élément le '
        'moins présent dans les différentes molécules.</li>\n'
        '          <li>Vérifier que les <b>charges</b> sont équilibrées. Sinon, '
        'reprendre les coefficients.</li>\n'
        '        </ol>\n      </div>\n')

    # Exercice 11 : quatre équations à compléter. Les coefficients manquants
    # sont de petites boîtes — c'est exactement ce qu'on demande d'écrire.
    eq11 = (
        '        <table style="border-collapse:collapse;width:100%;'
        'margin-top:1.5mm;">\n          <tbody>\n'
        + "".join(
            f'            <tr><td style="padding:1.8mm 0;font-size:10.5pt;">'
            f'{e}</td></tr>\n'
            for e in (
                f'{BP} H<sup>+</sup> &nbsp;+&nbsp; {BP} Fe &nbsp;→&nbsp; '
                f'{BP} H<sub>2</sub> &nbsp;+&nbsp; {BP} Fe<sup>2+</sup>',
                f'{BP} Cu<sup>2+</sup> &nbsp;+&nbsp; {BP} HO<sup>−</sup> '
                f'&nbsp;→&nbsp; {BP} Cu(HO)<sub>2</sub>',
                f'{BP} CaCO<sub>3</sub> &nbsp;+&nbsp; {BP} H<sup>+</sup> '
                f'&nbsp;→&nbsp; {BP} Ca<sup>2+</sup> &nbsp;+&nbsp; '
                f'{BP} HCO<sub>3</sub><sup>−</sup>',
                f'{BP} CH<sub>4</sub> &nbsp;+&nbsp; {BP} O<sub>2</sub> '
                f'&nbsp;→&nbsp; {BP} H<sub>2</sub>O &nbsp;+&nbsp; '
                f'{BP} CO<sub>2</sub>',
            ))
        + '          </tbody>\n        </table>\n')

    ex11 = exercice(
        11, "Équilibrer des équations de réaction",
        "Compléter les coefficients stœchiométriques manquants. Une case "
        "peut rester vide lorsque le coefficient vaut 1."
    ).replace("      </div>\n", eq11 + "      </div>\n")

    # ---- le contenu, dans l'ordre du cours -----------------------------
    # Chaque entrée : (partie, html). `partie` sert aux en-têtes « suite »
    # des pages de continuation ; None = le bloc suit la partie courante.
    return [
        # -- 01 ----------------------------------------------------------
        (("01", "Physique ou chimique ?"), None),
        (None, encart("definition", "Définition — Transformation physique", 5)),
        (None, encart("definition", "Définition — Transformation chimique", 5)),
        (None, exercice(
            1, "Transformation physique ou chimique ?",
            "Classer chacune des neuf situations suivantes. "
            "<b>a)</b> obtention d'une flamme (briquet) · "
            "<b>b)</b> formation de la rosée · "
            "<b>c)</b> dissolution de sucre dans du café · "
            "<b>d)</b> récolte de sel dans un marais salant · "
            "<b>e)</b> infusion de thé · "
            "<b>f)</b> formation de vin à partir de jus de raisin · "
            "<b>g)</b> détartrage de la bouilloire · "
            "<b>h)</b> obtention de neige avec un canon à neige · "
            "<b>i)</b> explosions de feux d'artifice.", lignes=6)),
        # -- 02 ----------------------------------------------------------
        (("02", "Effet thermique des transformations"), None),
        (None, encart("definition", "Définition — Réaction exothermique", 7)),
        (None, encart("definition", "Définition — Réaction endothermique", 7)),
        (None, figure(svg(src, "t1c2f3"),
                      "Image 3 — Sens du transfert de chaleur entre le système "
                      "et le milieu extérieur.", "133mm")),
        (None, qr_renvoi(qr["video-thermique"],
                         "Réviser en vidéo — l'effet thermique",
                         "exothermique, endothermique : reconnaître le sens de "
                         "l'échange")),
        # -- 03 ----------------------------------------------------------
        (("03", "États et changements d'état"), None),
        (None, ss("A · Les trois états de la matière")),
        (None, encart("propriete", "Propriété — Les trois états", 9)),
        (None, figure(svg(src, "t1c2f4"),
                      "Image 4 — Traits pleins : liaisons fortes. Traits "
                      "pointillés : liaisons faibles. Aucun trait : entités "
                      "libres, en agitation permanente.", "133mm")),
        (None, exercice(
            2, "Associer une matière à sa structure microscopique",
            "Le diamant · un verre de jus d'orange · l'air. Associer chaque "
            "matière au schéma qui lui correspond, et préciser son état "
            "physique.", svg(src, "t1c2ex2"), "126mm", lignes=5)),
        (None, ss("B · Les six changements d'état")),
        (None, encart("definition", "Définition — Changement d'état", 8)),
        (None, figure(svg(src, "t1c2f5"),
                      "Image 5 — Les six changements d'état. Cyan : "
                      "endothermique (la matière absorbe de l'énergie). "
                      "Rouge : exothermique (elle en libère).", "112mm")),
        (None, exercice(
            3, "Exemples de changement d'état",
            "Donner un exemple pour chacun : vaporisation, solidification, "
            "condensation.", lignes=6)),
        (None, ss("C · Température de changement d'état")),
        (None, encart("definition",
                      "Définition — Température de changement d'état", 7)),
        (None, '      <p class="a-connaitre">Sous la pression atmosphérique : '
               '&nbsp; θ<sub>fusion</sub>(eau) = <span class="trou"></span> '
               '&nbsp;·&nbsp; θ<sub>ébullition</sub>(eau) = '
               '<span class="trou"></span></p>\n'),
        (None, exercice(
            6, "Corps pur ou mélange ?",
            "Deux courbes de refroidissement sont étudiées. La première "
            "présente un palier de température vers 6 °C ; la seconde, le "
            "refroidissement d'un cola, décroît régulièrement sans palier. "
            "Déterminer, pour chacune, s'il s'agit d'un corps pur ou d'un "
            "mélange, et préciser si possible la température de changement "
            "d'état.", lignes=7)),
        (None, qr_renvoi(qr["video-etats"],
                         "Réviser en vidéo — les changements d'état",
                         "les six changements, le palier de température, corps "
                         "pur et mélange")),
        # -- 04 ----------------------------------------------------------
        (("04", "Équation d'un changement d'état"), None),
        (None, encart("propriete",
                      "Propriété — Écriture d'un changement d'état", 5)),
        (None, exercice(
            4, "Établir une équation de changement d'état",
            "Établir l'équation de la condensation de l'eau, puis de la "
            "solidification du fer Fe.", lignes=5)),
        (None, exercice(
            5, "Identifier un changement d'état",
            "Quels changements d'état décrivent les équations suivantes ? "
            "&nbsp; H<sub>2</sub>O<sub>(g)</sub> → H<sub>2</sub>O<sub>(s)</sub> "
            "&nbsp;·&nbsp; Cu<sub>(s)</sub> → Cu<sub>(g)</sub>", lignes=5)),
        # -- 05 ----------------------------------------------------------
        (("05", "Énergie de changement d'état"), None),
        (None, encart("definition",
                      "Définition — Énergie massique de changement d'état L", 8)),
        (None, encart("propriete",
                      "Propriété — Sens de l'échange et signe de L", 5)),
        (None, exercice(
            7, "Faire fondre 1 kg de glace",
            "Quelle quantité d'énergie faut-il pour faire fondre 1 kg de "
            "glace ? <span class=\"mini\">Donnée : L<sub>fusion</sub> = "
            "336 kJ·kg<sup>−1</sup></span>", lignes=5)),
        (None, formule("<i>Q</i>", f"{B} × {B}", 3)),
        (None, exercice(
            8, "Solidification du fer",
            "On étudie la solidification de 200 g de fer pur en fusion. "
            "Quelle énergie est transférée avec le milieu extérieur ? "
            "Schématiser le transfert. <span class=\"mini\">Données : "
            "L<sub>fusion</sub>(fer) = 270 kJ·kg<sup>−1</sup> · "
            "L<sub>solidification</sub>(fer) = −270 kJ·kg<sup>−1</sup></span>",
            lignes=7)),
        (None, exercice(
            9, "Énergie de la tsar bomba",
            "La tsar bomba, l'arme la plus puissante jamais testée, a libéré "
            "une énergie de 57 mégatonnes de TNT. Quelle masse d'eau "
            "pourrait-on vaporiser avec cette énergie ? "
            "<span class=\"mini\">Données : 1 Mt = 4,2 × 10<sup>15</sup> J · "
            "L<sub>vaporisation</sub>(eau) = 2,3 × 10<sup>6</sup> "
            "J·kg<sup>−1</sup></span>", lignes=7)),
        (None, qr_renvoi(qr["kahoot-physique"],
                         "Kahoot — transformations physiques",
                         "le bilan des parties 01 à 05, avant de passer à la "
                         "chimie")),
        # -- 06 ----------------------------------------------------------
        (("06", "Système chimique et transformation chimique"), None),
        (None, encart("propriete", "Notations — les états physiques", 6,
                      avant='<p class="question-f" style="margin-bottom:1mm;">'
                            '(s) &nbsp;·&nbsp; (l) &nbsp;·&nbsp; (g) '
                            '&nbsp;·&nbsp; (aq) — et pourquoi (aq) n\'est pas '
                            'un quatrième état de la matière.</p>')),
        (None, encart("definition", "Définition — Système chimique", 6)),
        (None, encart("definition",
                      "Définitions — État initial et état final, réactifs, "
                      "produits, espèce spectatrice", 9)),
        # -- 07 ----------------------------------------------------------
        (("07", "Équation de réaction et stœchiométrie"), None),
        (None, encart("definition",
                      "Définition — Réaction chimique et équation de "
                      "réaction", 13)),
        (None, encart("propriete",
                      "Propriété — Les deux lois de conservation", 8)),
        (None, methode),
        (None, exercice(
            10, "Test de reconnaissance des ions fer (II)",
            "Les ions fer (II) réagissent avec les ions hydroxyde de la soude "
            "pour former un précipité vert d'hydroxyde de fer (II) : &nbsp; "
            "Fe<sup>2+</sup><sub>(aq)</sub> + 2 HO<sup>−</sup><sub>(aq)</sub> "
            "→ Fe(OH)<sub>2 (s)</sub>. Identifier réactifs, produits et "
            "coefficients stœchiométriques, puis vérifier les deux lois de "
            "conservation.", lignes=8)),
        (None, ex11),
        (None, qr_renvoi(qr["video-equilibrer"],
                         "S'exercer en vidéo — équilibrer",
                         "des équations commentées pas à pas, au-delà des "
                         "quatre ci-dessus")),
        (None, exercice(
            12, "Combustion du glucose",
            "Lors d'un effort prolongé, le glucose "
            "C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> est dégradé selon un "
            "processus équivalant à sa combustion complète dans le dioxygène, "
            "produisant de l'eau et du dioxyde de carbone. Écrire et "
            "équilibrer cette équation de réaction.", lignes=6)),
        (None, encart("propriete",
                      "Propriété — Lire une équation en proportions", 6)),
        (None, exercice(
            13, "Lecture microscopique d'une équation",
            "Soit la combustion du méthane : &nbsp; CH<sub>4</sub> + "
            "2 O<sub>2</sub> → 2 H<sub>2</sub>O + CO<sub>2</sub>. Combien de "
            "molécules de chaque réactif sont consommées, et combien de "
            "chaque produit se forment ? Rédiger une phrase sur le modèle "
            "« si … alors … ».", lignes=6)),
        (None, exercice(
            14, "Proportions",
            "Soit &nbsp; Cu<sub>(s)</sub> + 2 Ag<sup>+</sup><sub>(aq)</sub> → "
            "Cu<sup>2+</sup><sub>(aq)</sub> + 2 Ag<sub>(s)</sub>. Combien "
            "d'atomes d'argent sont produits si 5 atomes de cuivre réagissent "
            "avec 10 ions Ag<sup>+</sup> ?", lignes=4)),
        # -- 08 ----------------------------------------------------------
        (("08", "Réactif limitant"), None),
        (None, encart("definition", "Définition — Réactif limitant", 5)),
        (None, figure(svg(src, "t1c2f9"),
                      "Image 9 — L'analogie du hot-dog : le réactif "
                      "entièrement consommé arrête la réaction ; l'autre reste "
                      "en excès.", "128mm")),
        (None, exercice(
            15, "Combustion du méthane",
            "150 molécules de méthane réagissent avec 1000 molécules de "
            "dioxygène, selon &nbsp; CH<sub>4</sub> + 2 O<sub>2</sub> → "
            "2 H<sub>2</sub>O + CO<sub>2</sub>. Déterminer le réactif "
            "limitant, puis le nombre de molécules présentes à la fin de la "
            "réaction.", lignes=10)),
        (None, essentiel(7)),
    ]


def construire(chemin_cours):
    src = charger_cours(chemin_cours)
    qr = codes_qr()
    BLOCS = blocs(src, qr)

    # ---- assemblage : on coupe, et les « suite » se déduisent ------------
    bornes = [0] + COUPES + [len(BLOCS)]
    T = len(bornes) - 1
    P = []
    for n in range(T):
        i, j = bornes[n], bornes[n + 1]
        # quelle partie est ouverte a l'entree de la page ?
        ouverte = None
        for partie, _ in BLOCS[:i]:
            if partie:
                ouverte = partie
        corps = ""
        if BLOCS[i][0] is None and ouverte:
            corps += suite(ouverte[0], ouverte[1].lower())
        for partie, html in BLOCS[i:j]:
            corps += h2(*partie) if partie else html

        dernier = (n == T - 1)
        P.append(feuille(
            n + 1, T, corps, PIED,
            entete=cartouche(
                "Thème 1 · Constitution et transformations de la matière — "
                "Physique-Chimie",
                "Chapitre 2 — Transformations physiques et chimiques",
                INTRO,
                "../assets/img/pc/2nde-pc-t1-c2/t1c2-comete-bandeau.jpg",
            ) if n == 0 else None,
            # 30 lignes de notes et non 33 sur la page de clôture : c'est la
            # marge de notes, plus haute que la colonne principale, qui fixe la
            # hauteur du corps de page. À 33, elle pousse la clôture sous le
            # pied, qui écrase les cases du code et les QR.
            lignes_notes=30 if dernier else 33,
            apres=cloture(qr["cours"], qr["kahoot-chimique"]) if dernier else ""))

    commentaire = """<!-- ============================================================
     FICHE ÉLÈVE — T1-C2 · TRANSFORMATIONS PHYSIQUES ET CHIMIQUES
     🔴 FICHIER GÉNÉRÉ — ne pas éditer à la main.
     Source : _outils/fiches/fiche_t1c2.py + gabarit_fiche.py
     Régénérer après toute modification du cours en ligne.

     🔴 La fiche ne donne pas le cours, elle le fait écrire : définitions en
     cadres vides, formules en boîtes. Seules les figures sont fournies.
     🔴 Les figures sont relues dans pages/2nde-pc-t1-c2-…html à chaque
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
