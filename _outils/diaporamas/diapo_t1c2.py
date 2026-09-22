#!/usr/bin/env python3
"""
diapo_t1c2.py — contenu du diaporama de projection du chapitre T1-C2.

Ce fichier ne contient QUE ce qui est propre au chapitre. Toute la charte et
tous les composants viennent de `gabarit_diapo.py`.

USAGE
    node extraire_figures.mjs ../../pages/2nde-pc-t1-c2-….html <figs>
    python3 diapo_t1c2.py [dossier-des-figures]

    Produit assets/pptx/pc/diaporama-2nde-t1c2.pptx

STRUCTURE — celle du PowerPoint de Loïc (I, II, III et sous-parties A à G),
pas celle des huit sections numérotées du site. Le site a mis à plat ce que
la projection garde hiérarchisé ; les NUMÉROS D'IMAGE, eux, sont ceux du
site (règle R6), pour que l'élève retrouve la même figure sous le même
numéro à l'écran, sur sa fiche et en ligne.

🔴 AUCUNE CORRECTION À L'ÉCRAN. Les énoncés apparaissent, jamais les
réponses : elles vivent en ligne, derrière le code de déblocage.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from gabarit_diapo import (          # noqa: E402
    ALPHA, BETA, ENCRE, GAMMA, GRIS, OCRE, MONO, CORPS, TITRES, bas, cm,
    Par, Sequence, bandeau, checklist, diapo, diapo_titre, encart, eq,
    exercice, figure, formule, fraction, hauteur_exercice, ind, picto_fiche,
    pied, presentation, terme, titre_partie, _texte,
)
from pptx.dml.color import RGBColor   # noqa: E402
from pptx.enum.text import PP_ALIGN   # noqa: E402

from animer import controler, minuter   # noqa: E402

RACINE = Path(__file__).resolve().parents[2]
IMG = RACINE / "assets" / "img" / "pc" / "2nde-pc-t1-c2"
SORTIE = RACINE / "assets" / "pptx" / "pc" / "diaporama-2nde-t1c2.pptx"

CHAPITRE = "Thème 1 · Chapitre 2 — Transformations physiques et chimiques"
ANNEE = "2026 / 2027"

# proportions hauteur/largeur des figures extraites (viewBox du SVG du site)
RATIO = {"t1c2f3": 230 / 420, "t1c2f4": 200 / 660, "t1c2ex2": 200 / 660,
         "t1c2f5": 400 / 600, "t1c2tp3": 380 / 720, "t1c2f6": 320 / 700,
         "t1c2f9": 200 / 660}


def construire(dossier_figs):
    figs = Path(dossier_figs)
    prs = presentation()
    seq = Sequence()
    n = 0

    def page(romain, partie, sous=""):
        """Ouvre une diapositive de contenu : bandeau + pied, puis son index."""
        nonlocal n
        s = diapo(prs)
        i = len(prs.slides) - 1
        bandeau(s, seq, i, romain, partie, sous)
        n += 1
        pied(s, seq, i, CHAPITRE, n)
        return s, i

    def fig(s, i, rang, cle, x, y, w, legende=None):
        return figure(s, seq, i, rang, figs / f"site-{cle}.png", x, y, w,
                      legende, h=w * RATIO[cle])

    # ================================================================ TITRE
    diapo_titre(
        prs, seq,
        "THÈME 1 · CONSTITUTION ET TRANSFORMATIONS DE LA MATIÈRE",
        "Chapitre 2 — Transformations physiques et chimiques",
        "Un glaçon fond, une bougie brûle : dans un seul des deux cas les "
        "molécules elles-mêmes changent.",
        ANNEE,
        fond=None,
        logo=RACINE / "assets" / "img" / "logo-isaac-lycee.png")
    n += 1

    # ============================================================ I — INTRO
    s = diapo(prs)
    titre_partie(s, seq, len(prs.slides) - 1, "I", "Introduction",
                 ["A — Transformation physique ou chimique ?",
                  "B — Effet thermique des transformations"])
    n += 1


    # petits raccourcis de mise en forme propres au chapitre
    def eti(t, c=GRIS):
        """Étiquette en Courier, petite : « QUALITATIVE », « ÉTAT INITIAL »…"""
        return (t, {"police": MONO, "taille": 10, "gras": True, "couleur": c})

    def ind_(base, bas_, **o):
        return [(base, dict(o)), (bas_, dict(o, ind=True))]

    DON = {"police": MONO, "taille": 12}

    # --- I.A · les deux définitions -------------------------------------
    s, i = page("I", "Introduction", "A — Transformation physique ou chimique ?")
    d1 = encart(s, seq, i, 1, "definition", 0.9, 2.6, 15.6, None,
           [[("Une ", {}), terme("transformation physique"),
             (" est une transformation au cours de laquelle la matière change "
              "d'apparence, de forme, d'état mais les espèces chimiques "
              "(molécules) ne changent pas.", {})]],
           etiquette="DÉFINITION — TRANSFORMATION PHYSIQUE", fiche=True)
    d2 = encart(s, seq, i, 2, "definition", 17.4, 2.6, 15.6, None,
           [[("Une ", {}), terme("transformation chimique"),
             (" est une transformation au cours de laquelle certaines "
              "substances disparaissent et d'autres apparaissent. Les espèces "
              "chimiques sont modifiées.", {})]],
           etiquette="DÉFINITION — TRANSFORMATION CHIMIQUE", fiche=True)
    situations = [
        "obtention d'une flamme (briquet)", "formation de la rosée",
        "dissolution de sucre dans du café",
        "récolte de sel dans un marais salant", "infusion de thé dans l'eau",
        "formation de vin à partir de jus de raisin",
        "détartrage de la bouilloire", "obtention de neige avec un canon à neige",
        "explosions de feux d'artifice"]
    exercice(s, seq, i, 3, 0.9, max(bas(d1), bas(d2)), 32.1, 1,
             "Transformation physique ou chimique ?",
             contexte="On considère les neuf situations suivantes :",
             colonnes=(3, [[(f"{l}) ", {"police": MONO, "gras": True,
                                        "couleur": ALPHA, "taille": 13}),
                            (t, {})]
                           for l, t in zip("abcdefghi", situations)]),
             question="Classer chaque situation : s'agit-il d'une "
                      "transformation physique ou d'une transformation "
                      "chimique ?")

    # --- I.A · les deux exemples ----------------------------------------
    s, i = page("I", "Introduction", "A — Deux exemples")
    for rang, (photo, pastille, couleur, x, legende) in enumerate((
        (IMG / "t1c2-comete-holmes.jpg", "EXEMPLE — TRANSFORMATION PHYSIQUE",
         BETA, 0.9,
         "Image 1 — À l'approche du Soleil, les glaces du noyau d'une comète "
         "se subliment et forment sa queue. Les molécules ne sont pas "
         "modifiées."),
        (IMG / "t1c2-feuille-photosynthese.jpg",
         "EXEMPLE — TRANSFORMATION CHIMIQUE", ALPHA, 17.4,
         "Image 2 — Par photosynthèse, la plante fabrique du glucose à partir "
         "d'eau et de dioxyde de carbone. Des espèces disparaissent, d'autres "
         "apparaissent."),
    ), start=1):
        z = _texte(s, x, 2.6, 15.6, 0.6, pastille, taille=10, police=MONO,
                   couleur=couleur, gras=True)
        seq.marque(i, rang, z)
        img = s.shapes.add_picture(str(photo), cm(x), cm(3.4), height=cm(8.2))
        seq.marque(i, rang, img)
        z = _texte(s, x, 12.0, 15.6, 3.0, legende, taille=11, police=MONO,
                   couleur=GRIS, interligne=1.2)
        seq.marque(i, rang, z)
    for rang, (x, e_) in enumerate((
        (0.9, [("H₂O", {}), ("(s)", {"ind": True}), ("   →   ", {}),
               ("H₂O", {}), ("(g)", {"ind": True})]),
        (17.4, [("6 CO₂  +  6 H₂O   →   C₆H₁₂O₆  +  6 O₂", {})]),
    ), start=1):
        z = _texte(s, x, 15.5, 15.6, 1.2, [e_], taille=19, police=TITRES,
                   gras=True, align=PP_ALIGN.CENTER)
        seq.marque(i, rang + 2, z)

    # --- I.B · effet thermique -------------------------------------------
    s, i = page("I", "Introduction", "B — Effet thermique des transformations")
    fig(s, i, 1, "t1c2f3", 18.6, 3.0, 13.6,
        "Image 3 — Sens du transfert de chaleur entre le système et le milieu "
        "extérieur.")
    picto_fiche(s, seq, i, 1, 31.4, 2.3)
    e = encart(s, seq, i, 2, "definition", 0.9, 3.0, 17.0, None,
           [[("Une transformation qui libère de l'énergie sous forme de "
              "chaleur est appelée réaction ", {}), terme("exothermique"),
             (".", {})]],
           etiquette="DÉFINITION — RÉACTION EXOTHERMIQUE", fiche=True)
    e = encart(s, seq, i, 3, "definition", 0.9, bas(e), 17.0, None,
           [[("Une transformation qui prend de la chaleur au milieu "
              "extérieur est appelée réaction ", {}), terme("endothermique"),
             (".", {})]],
           etiquette="DÉFINITION — RÉACTION ENDOTHERMIQUE", fiche=True)
    encart(s, seq, i, 4, "exemple", 0.9, max(bas(e), 12.2), 32.1, None,
           ["Le combustible de la bougie est la paraffine, C₁₈H₃₆O₂, qui brûle "
            "dans le dioxygène de l'air ; il se forme du dioxyde de carbone et "
            "de l'eau :",
            eq("C₁₈H₃₆O₂ (s)  +  26 O₂ (g)   →   18 CO₂ (g)  +  26 H₂O (l)", 18),
            "Cette réaction produit de la chaleur : c'est une réaction "
            "exothermique."],
           etiquette="EXEMPLE DÉTAILLÉ — COMBUSTION D'UNE BOUGIE")

    # ======================================= II — TRANSFORMATIONS PHYSIQUES
    s = diapo(prs)
    titre_partie(s, seq, len(prs.slides) - 1, "II", "Transformations physiques",
                 ["A — États de la matière",
                  "B — Changement d'état",
                  "C — Équation d'un changement d'état",
                  "D — Énergie de changement d'état"])
    n += 1

    # --- II.A · les trois états + exercice 2 --------------------------------
    s, i = page("II", "Transformations physiques", "A — États de la matière")
    f4 = fig(s, i, 1, "t1c2f4", 0.9, 2.7, 17.0,
             "Image 4 — Traits pleins : liaisons fortes. Traits pointillés : "
             "liaisons faibles. Aucun trait : entités libres, en agitation.")
    picto_fiche(s, seq, i, 1, 18.6, 2.25)
    p3 = encart(s, seq, i, 2, "propriete", 20.2, 2.7, 12.8, None,
           [[terme("Gazeux (g)", GAMMA), (" : entités agitées, espacées, "
             "libres, qui s'entrechoquent sans cesse.", {})],
            [terme("Liquide (l)", GAMMA), (" : entités mobiles, proches, "
             "peu liées ou par des liaisons faibles.", {})],
            [terme("Solide (s)", GAMMA), (" : entités presque immobiles "
             "(elles vibrent), très proches, fortement liées.", {})]],
           etiquette="PROPRIÉTÉ — LES TROIS ÉTATS", fiche=True)
    exercice(s, seq, i, 3, 0.9, max(bas(f4, 1.3), bas(p3)), 32.1, 2,
             "Associer une matière à sa structure microscopique",
             contexte="Trois matières : le diamant, un verre de jus d'orange, "
                      "l'air. Chacun des trois schémas représente la structure "
                      "de l'une d'elles, à l'échelle des entités.",
             fig=(figs / "site-t1c2ex2.png", RATIO["t1c2ex2"], 13.0),
             question="Associer chaque matière au schéma qui lui correspond, "
                      "et préciser son état physique.")

    # --- II.B · changement d'état -----------------------------------------
    s, i = page("II", "Transformations physiques", "B — Changement d'état")
    fig(s, i, 1, "t1c2f5", 19.4, 2.7, 13.0,
        "Image 5 — Les six changements d'état. Cyan : endothermique. "
        "Rouge : exothermique.")
    picto_fiche(s, seq, i, 1, 31.6, 2.2)
    e = encart(s, seq, i, 2, "definition", 0.9, 2.8, 17.6, None,
           [[("Lors d'un ", {}), terme("changement d'état"),
             (", les propriétés de la matière changent, l'agitation et "
              "l'arrangement spatial des entités sont modifiés. Les liaisons "
              "entre les entités s'affaiblissent ou se renforcent, se rompent "
              "ou se créent.", {})]],
           etiquette="DÉFINITION — CHANGEMENT D'ÉTAT", fiche=True)
    z = _texte(s, 0.9, bas(e), 17.6, 1.0,
               [[("Les six changements d'état sont à connaître par cœur.",
                  {"gras": True, "couleur": ALPHA})]], taille=16)
    seq.marque(i, 3, z)
    exercice(s, seq, i, 4, 0.9, bas(z, 0.35), 17.6, 3,
             "Exemples de changement d'état",
             question="Donner un exemple pour chacun des changements d'état "
                      "suivants : vaporisation, solidification, condensation.")

    # --- II.B · corps pur / mélange ----------------------------------------
    s, i = page("II", "Transformations physiques",
                "B — Corps pur ou mélange : le palier de température")
    fig(s, i, 1, "t1c2tp3", 0.9, 2.8, 19.0,
        "Synthèse du TP3 — ① palier à 0 °C : les états solide et liquide "
        "coexistent. ② rupture de pente vers −4 °C pour l'eau salée.")
    e = encart(s, seq, i, 2, "definition", 20.6, 2.8, 12.4, None,
           [[("Lors du changement d'état d'un corps pur, la température ne "
              "varie plus. Cette température est appelée ", {}),
             terme("température de changement d'état"), (".", {})]],
           etiquette="DÉFINITION — TEMPÉRATURE DE CHANGEMENT D'ÉTAT",
           fiche=True)
    exercice(s, seq, i, 3, 20.6, bas(e), 12.4, 6, "Corps pur ou mélange ?",
             contexte="On étudie deux courbes de refroidissement : la première "
                      "présente un palier de température vers 6 °C ; la "
                      "seconde (refroidissement d'un cola) décroît "
                      "régulièrement, sans palier.",
             question="Déterminer si chaque étude porte sur un corps pur ou "
                      "sur un mélange. Si possible, préciser la température de "
                      "changement d'état.")

    # --- II.C · équation d'un changement d'état ----------------------------
    s, i = page("II", "Transformations physiques",
                "C — Équation d'un changement d'état")
    e = encart(s, seq, i, 1, "propriete", 0.9, 2.7, 32.1, None,
           ["Au cours d'un changement d'état physique, les espèces chimiques "
            "ne sont pas modifiées. Pour modéliser le changement d'état "
            "physique d'une espèce chimique A, on écrit l'équation :",
            eq("A (état physique initial)   →   A (état physique final)"),
            Par([eti("EXEMPLE — FUSION DE L'EAU     ", RGBColor(0x4C, 0x8A, 0x58)),
                 ("H₂O (s)   →   H₂O (l)", {"police": TITRES, "taille": 17})],
                align=PP_ALIGN.CENTER, avant=4)],
           etiquette="PROPRIÉTÉ — ÉCRITURE D'UN CHANGEMENT D'ÉTAT", fiche=True)
    # les exercices 4 et 5 face à face, À LA MÊME HAUTEUR, équations centrées
    ex4 = dict(question="Établir l'équation de la condensation de l'eau, puis "
                        "de la solidification du fer Fe.")
    ex5 = dict(contexte=Par("Quels sont les changements d'état décrits par "
                            "les équations suivantes ?", italique=True),
               equations=["H₂O (g)   →   H₂O (s)", "Cu (s)   →   Cu (g)"])
    hh = max(hauteur_exercice(15.6, **ex4), hauteur_exercice(15.6, **ex5))
    exercice(s, seq, i, 2, 0.9, bas(e), 15.6, 4,
             "Établir une équation de changement d'état", h=hh, **ex4)
    exercice(s, seq, i, 3, 17.4, bas(e), 15.6, 5,
             "Identifier un changement d'état", h=hh, **ex5)

    # --- II.D · énergie de changement d'état -------------------------------
    s, i = page("II", "Transformations physiques",
                "D — Énergie de changement d'état")
    e = encart(s, seq, i, 1, "definition", 0.9, 2.8, 32.1, None,
           [[("L'", {}), terme("énergie massique de changement d'état L"),
             (" d'un corps pur est l'énergie thermique que doit absorber ou "
              "libérer par transfert thermique 1 kg de ce corps pour le faire "
              "changer d'état à sa température de changement d'état, pour une "
              "pression donnée. Elle s'exprime en J·kg⁻¹.", {})]],
           etiquette="DÉFINITION — ÉNERGIE MASSIQUE DE CHANGEMENT D'ÉTAT",
           fiche=True)
    fig(s, i, 2, "t1c2f6", 0.9, bas(e), 19.0,
        "Image 6 — Pour passer d'un état condensé vers un état aux liaisons "
        "faibles ou inexistantes, la matière prend de l'énergie au milieu "
        "extérieur, et réciproquement.")
    Li = {"police": TITRES, "italique": True, "taille": 19}
    encart(s, seq, i, 3, "propriete", 20.8, bas(e), 12.2, None,
           ["L'énergie pour passer d'un état 1 à un état 2 est la même, au "
            "signe près, que pour passer de l'état 2 à l'état 1 :",
            eq([("L", Li), ("fusion", dict(Li, ind=True)), ("  =  − ", Li),
                ("L", Li), ("solidification", dict(Li, ind=True))]),
            eq([("L", Li), ("sublimation", dict(Li, ind=True)), ("  =  − ", Li),
                ("L", Li), ("condensation", dict(Li, ind=True))]),
            Par("Le signe traduit le sens de l'échange d'énergie.",
                italique=True, couleur=GRIS, taille=13)],
           etiquette="PROPRIÉTÉ — SIGNE DE L", fiche=True)

    # --- II.D · la relation Q = m × L --------------------------------------
    s, i = page("II", "Transformations physiques",
                "D — La relation entre énergie, masse et L")
    z = _texte(s, 0.9, 2.7, 32.1, 1.6,
               "Pour 1 kg, l'énergie massique suffit. Pour une masse "
               "quelconque, il faut une relation : l'énergie Q échangée est "
               "le produit de la masse par l'énergie massique.", taille=16)
    seq.marque(i, 1, z)
    formule(s, seq, i, 2,
            [[("Q", {"italique": True}), (" = ", {}), ("m", {"italique": True}),
              (" × ", {}), ("L", {"italique": True})]],
            [[("Q", {"gras": True}), ("  énergie échangée · J", {})],
             [("m", {"gras": True}), ("  masse · kg", {})],
             [("L", {"gras": True}), ("  énergie massique · J·kg⁻¹", {})]],
            x=3.2, y=4.6, w=27.4, h=4.2)
    picto_fiche(s, seq, i, 2, 29.4, 4.0)
    ex8 = dict(contexte="On étudie la solidification de 200 g de fer pur en "
                        "fusion.",
               donnees=[("Données : L", DON), ("fusion", dict(DON, ind=True)),
                        ("(fer) = 270 kJ·kg⁻¹ · L", DON),
                        ("solidification", dict(DON, ind=True)),
                        ("(fer) = −270 kJ·kg⁻¹", DON)],
               question="Quelle énergie est transférée avec le milieu "
                        "extérieur lors de cette solidification ? Schématiser "
                        "le transfert d'énergie.")
    ex9 = dict(contexte="La tsar bomba, l'arme la plus puissante jamais "
                        "testée, a libéré une énergie de 57 mégatonnes de TNT.",
               donnees=[("Données : 1 Mt = 4,2 × 10¹⁵ J · L", DON),
                        ("vaporisation", dict(DON, ind=True)),
                        ("(eau) = 2,3 × 10⁶ J·kg⁻¹", DON)],
               question="Quelle masse d'eau pourrait-on vaporiser avec "
                        "l'énergie libérée par la tsar bomba ?")
    hh = max(hauteur_exercice(15.6, **ex8), hauteur_exercice(15.6, **ex9))
    exercice(s, seq, i, 3, 0.9, 9.4, 15.6, 8, "Solidification du fer",
             h=hh, **ex8)
    exercice(s, seq, i, 4, 17.4, 9.4, 15.6, 9, "Énergie de la tsar bomba",
             h=hh, **ex9)

    # ====================================== III — TRANSFORMATIONS CHIMIQUES
    s = diapo(prs)
    titre_partie(s, seq, len(prs.slides) - 1, "III",
                 "Transformations chimiques",
                 ["A — États physiques",
                  "B — Système chimique",
                  "C — Représenter une transformation chimique",
                  "D — Lois de conservation",
                  "E — Équation de réaction chimique",
                  "F — Stœchiométrie",
                  "G — Réactif limitant"])
    n += 1

    # --- III.A/B · notations et système chimique ---------------------------
    s, i = page("III", "Transformations chimiques",
                "A — États physiques   ·   B — Système chimique")
    NOT = {"police": TITRES, "gras": True, "taille": 22, "couleur": GAMMA}
    a = encart(s, seq, i, 1, "notation", 0.9, 2.7, 15.6, 5.3,
           [Par([("(s)", NOT), ("  solide", {}), ("          ", {}),
                 ("(l)", NOT), ("  liquide", {}), ("          ", {}),
                 ("(g)", NOT), ("  gazeux", {})],
                align=PP_ALIGN.CENTER),
            Par([("(aq)", dict(NOT, couleur=ALPHA)),
                 ("  aqueux : molécules et ions dissous dans l'eau, dits "
                  "hydratés.", {})], align=PP_ALIGN.CENTER, avant=4),
            Par("Ce n'est pas un quatrième état de la matière, mais une "
                "notation très utilisée pour les espèces en solution.",
                italique=True, couleur=GRIS, taille=13,
                align=PP_ALIGN.CENTER)],
           etiquette="NOTATIONS — LES ÉTATS PHYSIQUES", fiche=True)
    b = encart(s, seq, i, 2, "definition", 17.4, 2.7, 15.6, 5.3,
           [[("Un ", {}), terme("système chimique"),
             (" est un échantillon de matière décrit par différents "
              "paramètres : des grandeurs physiques (température, "
              "pression…) ; les espèces chimiques qui le constituent ; leurs "
              "états physiques ; leurs quantités de matière.", {})]],
           etiquette="DÉFINITION — SYSTÈME CHIMIQUE", fiche=True)
    # l'exemple de l'Image 8, en encart : la photo à gauche, les deux
    # descriptions l'une sous l'autre, chacune avec son étiquette
    y0 = max(bas(a), bas(b))
    hx = 5.9
    encart(s, seq, i, 3, "exemple", 0.9, y0, 32.1, hx, [],
           etiquette="EXEMPLE — UNE SOLUTION DE SULFATE DE CUIVRE, DÉCRITE "
                     "COMME UN SYSTÈME CHIMIQUE")
    img = s.shapes.add_picture(str(IMG / "t1c2-solution-sulfate-cuivre.jpg"),
                               cm(1.5), cm(y0 + 0.95), height=cm(hx - 1.3))
    seq.marque(i, 3, img)
    VERT = RGBColor(0x4C, 0x8A, 0x58)
    z = _texte(s, 6.0, y0 + 1.0, 26.4, hx - 1.3,
               [[eti("IMAGE 8", GRIS)],
                [eti("QUALITATIVE  ", VERT),
                 ("θ = 20 °C  ·  P = 1 bar  ·  ions cuivre (II) Cu²⁺(aq)  ·  "
                  "ions sulfate SO₄²⁻(aq)  ·  eau H₂O(l)", {})],
                [eti("QUANTITATIVE  ", VERT),
                 ("il faut en plus connaître la quantité de matière de chacune "
                  "de ces espèces chimiques.", {})]],
               taille=15, interligne=1.2, espacement=9)
    seq.marque(i, 3, z)

    # --- III.C · état initial et état final ---------------------------------
    s, i = page("III", "Transformations chimiques",
                "C — Représenter une transformation chimique")
    e = encart(s, seq, i, 1, "definition", 0.9, 2.7, 16.4, None,
           [[("L'", {}), terme("état initial"),
             (" du système chimique est son état avant la transformation ; "
              "l'", {}), terme("état final"), (", son état après.", {})],
            [("Les espèces introduites à l'état initial sont les ", {}),
             terme("réactifs"), (" ; celles obtenues à l'état final sont les ",
                                  {}), terme("produits"), (".", {})],
            [("Une espèce présente mais qui ne subit aucune modification est "
              "une ", {}), terme("espèce spectatrice"), (".", {})]],
           etiquette="DÉFINITIONS — ÉTATS, RÉACTIFS, PRODUITS", fiche=True)
    z = _texte(s, 0.9, bas(e), 16.4, 1.6,
               "La transformation chimique est le passage de l'état initial "
               "à l'état final.", taille=17, italique=True, couleur=BETA)
    seq.marque(i, 3, z)
    # l'exemple — photo NON numérotée : sur le site elle vit dans un encart
    # exemple, hors de la série des « Image N » (règle R6)
    xe, we, ye = 17.9, 15.1, 2.7
    pw = 9.2
    ph = pw * 543 / 716
    he = 0.95 + ph + 0.35 + 0.55 + 3.3 + 0.3
    encart(s, seq, i, 2, "exemple", xe, ye, we, he, [],
           etiquette="EXEMPLE — CUIVRE DANS DU NITRATE D'ARGENT")
    img = s.shapes.add_picture(str(IMG / "t1c2-experience-argent-cuivre.jpg"),
                               cm(xe + (we - pw) / 2), cm(ye + 0.95),
                               width=cm(pw))
    seq.marque(i, 2, img)
    yb = ye + 0.95 + ph + 0.3
    z = _texte(s, xe + 0.45, yb, we - 0.9, 0.5,
               "à 20 °C et 1 bar — température et pression ne changent pas",
               taille=11, police=MONO, couleur=GRIS, align=PP_ALIGN.CENTER)
    seq.marque(i, 2, z)
    col = (we - 0.9 - 0.5) / 2
    for k, (titre_, lignes_) in enumerate((
        ("ÉTAT INITIAL", ["n(Cu) = 1,0 mol", "n(Ag⁺) = 0,1 mol",
                          "n(NO₃⁻) = 0,1 mol"]),
        ("ÉTAT FINAL", ["n(Ag) = 0,1 mol · n(Cu²⁺) = 0,05 mol",
                        "n(Cu) = 0,95 mol (reste)",
                        "n(NO₃⁻) = 0,1 mol (spectateur)"]),
    )):
        z = _texte(s, xe + 0.45 + k * (col + 0.5), yb + 0.6, col, 3.2,
                   [[eti(titre_, RGBColor(0x4C, 0x8A, 0x58))]] + lignes_,
                   taille=13, interligne=1.1, espacement=3)
        seq.marque(i, 2, z)

    # --- III.D · lois de conservation ---------------------------------------
    s, i = page("III", "Transformations chimiques", "D — Lois de conservation")
    e = encart(s, seq, i, 1, "propriete", 0.9, 2.7, 32.1, None,
           [[("Au cours d'une transformation chimique, il y a : ", {}),
             terme("conservation des éléments chimiques", GAMMA),
             (" (nature et quantités) ; ", {}),
             terme("conservation de la charge électrique globale", GAMMA),
             (" (électrons).", {})]],
           etiquette="PROPRIÉTÉ — LES DEUX LOIS DE CONSERVATION", fiche=True)
    y0 = bas(e)
    img = s.shapes.add_picture(str(IMG / "t1c2-lavoisier-david.jpg"),
                               cm(0.9), cm(y0), height=cm(16.8 - y0))
    seq.marque(i, 2, img)
    z = _texte(s, 0.9 + (16.8 - y0) * 0.75 + 0.8, y0, 22.0, 16.8 - y0,
               [[("ANTOINE DE LAVOISIER (1743 – 1794) · PÈRE DE LA CHIMIE "
                  "MODERNE", {"police": MONO, "taille": 11, "gras": True,
                              "couleur": RGBColor(0x8A, 0x6A, 0x3A)})],
                "Entre 1783 et 1785, Lavoisier décompose l'eau puis la "
                "recompose : elle n'est pas un élément, mais un composé "
                "d'hydrogène et d'oxygène.",
                eq("2 H₂O (l)   →   2 H₂ (g)  +  O₂ (g)", 20),
                "À l'état initial comme à l'état final : 4 atomes d'hydrogène, "
                "2 atomes d'oxygène, et un ensemble électriquement neutre.",
                Par("« Rien ne se perd, rien ne se crée, tout se transforme. »",
                    italique=True, couleur=GRIS, align=PP_ALIGN.CENTER)],
               taille=15, interligne=1.2, espacement=8)
    seq.marque(i, 2, z)

    # --- III.E · réaction chimique : définition + propriété + méthode ------
    s, i = page("III", "Transformations chimiques",
                "E — Équation de réaction chimique")
    d = encart(s, seq, i, 1, "definition", 0.9, 2.7, 15.6, None,
           [[("Une ", {}), terme("réaction chimique"),
             (" est un processus modélisant une transformation chimique au "
              "niveau microscopique. Elle est décrite par une ", {}),
             terme("équation de réaction"), (" (ou équation chimique).", {})]],
           etiquette="DÉFINITION — RÉACTION CHIMIQUE", fiche=True)
    p = encart(s, seq, i, 2, "propriete", 17.4, 2.7, 15.6, None,
           ["L'écriture symbolique d'une équation de réaction contient :",
            "— les formules brutes et les états physiques des réactifs (à "
            "gauche) et des produits (à droite) ;",
            "— une flèche symbolisant l'évolution du système ;",
            [("— des coefficients respectant les deux lois de conservation, "
              "appelés ", {}), terme("coefficients stœchiométriques", GAMMA),
             (" lorsqu'ils sont les plus petits possibles.", {})]],
           etiquette="PROPRIÉTÉ — ÉCRITURE D'UNE ÉQUATION", fiche=True)
    encart(s, seq, i, 3, "methode", 0.9, max(bas(d), bas(p)), 32.1, None,
           ["I.    Identifier les réactifs et les produits de la réaction.",
            "II.   Écrire leurs formules brutes, en précisant leurs états "
            "physiques, de part et d'autre de la flèche.",
            "III.  Compter tous les éléments chimiques de part et d'autre de "
            "la flèche ; placer si besoin des coefficients, en commençant par "
            "les éléments les moins présents.",
            "IV.   Vérifier que les charges sont équilibrées."],
           etiquette="MÉTHODE — ÉCRIRE ET ÉQUILIBRER UNE ÉQUATION DE RÉACTION",
           fiche=True)

    # --- III.E · appliquer : 10 en largeur, puis 11 et 12 face à face -------
    s, i = page("III", "Transformations chimiques",
                "E — Écrire et équilibrer une équation")
    NOTA = {"police": TITRES, "taille": 19}
    lab = {"police": MONO, "taille": 10, "couleur": GRIS}
    e = exercice(s, seq, i, 1, 0.9, 2.7, 32.1, 10,
             "Test de reconnaissance des ions fer (II)",
             contexte="Les ions fer (II) réagissent avec les ions hydroxyde de "
                      "la soude pour former un précipité vert d'hydroxyde de "
                      "fer (II).",
             equations=[[("ion fer (II)  ", lab), ("Fe²⁺(aq)", NOTA),
                         ("        ion hydroxyde  ", lab), ("HO⁻(aq)", NOTA),
                         ("        hydroxyde de fer (II)  ", lab),
                         ("Fe(OH)₂ (s)", NOTA)]],
             question="En suivant la méthode, écrire et équilibrer l'équation "
                      "de cette réaction. Identifier ensuite les réactifs, les "
                      "produits et les coefficients stœchiométriques, puis "
                      "vérifier les deux lois de conservation.")
    ex11 = dict(contexte=Par("Équilibrer ces équations de réaction en "
                             "ajoutant les coefficients stœchiométriques "
                             "manquants.", italique=True),
                equations=["H⁺  +  Fe   →   H₂  +  Fe²⁺",
                           "Cu²⁺  +  HO⁻   →   Cu(HO)₂",
                           "CaCO₃  +  H⁺   →   Ca²⁺  +  HCO₃⁻",
                           "CH₄  +  O₂   →   H₂O  +  CO₂"])
    ex12 = dict(contexte="Lors d'un effort physique prolongé, le glucose "
                         "C₆H₁₂O₆ est dégradé selon un processus équivalant à "
                         "sa combustion complète dans le dioxygène, produisant "
                         "de l'eau et du dioxyde de carbone.",
                question="Écrire et équilibrer cette équation de réaction.")
    hh = max(hauteur_exercice(15.6, **ex11), hauteur_exercice(15.6, **ex12))
    exercice(s, seq, i, 2, 0.9, bas(e), 15.6, 11,
             "Équilibrer des équations de réaction", h=hh, **ex11)
    exercice(s, seq, i, 3, 17.4, bas(e), 15.6, 12, "Combustion du glucose",
             h=hh, **ex12)

    # --- III.F · stœchiométrie -------------------------------------------------
    s, i = page("III", "Transformations chimiques",
                "F — Qu'est-ce que la stœchiométrie ?")
    e = encart(s, seq, i, 1, "propriete", 0.9, 2.7, 32.1, None,
           [[("Au-delà de l'équilibrage, les nombres stœchiométriques ont un "
              "sens physique : à l'échelle microscopique, ils renseignent sur "
              "les ", {}), terme("proportions", GAMMA),
             (", en nombre d'atomes, d'ions ou de molécules, dans lesquelles "
              "les réactifs réagissent et les produits se forment.", {})],
            eq("Cu (s)  +  2 Ag⁺(aq)   →   Cu²⁺(aq)  +  2 Ag (s)"),
            Par("« Si 1 atome de cuivre est consommé, alors 2 ions Ag⁺ seront "
                "aussi consommés, et il se formera 2 atomes d'argent et 1 ion "
                "Cu²⁺. »", italique=True, couleur=GAMMA,
                align=PP_ALIGN.CENTER)],
           etiquette="PROPRIÉTÉ — LIRE UNE ÉQUATION EN PROPORTIONS",
           fiche=True)
    ex13 = dict(contexte="On considère l'équation de combustion du méthane :",
                equations=["CH₄  +  2 O₂   →   2 H₂O  +  CO₂"],
                question="Combien de molécules de chaque réactif sont "
                         "consommées, et de chaque produit formées ? Rédiger "
                         "une phrase sur le modèle « si … alors … ».")
    ex14 = dict(contexte="On reprend la réaction entre le cuivre et les ions "
                         "argent :",
                equations=["Cu (s)  +  2 Ag⁺(aq)   →   Cu²⁺(aq)  +  2 Ag (s)"],
                question="Combien d'atomes d'argent seront produits si 5 "
                         "atomes de cuivre réagissent avec 10 ions Ag⁺ ?")
    hh = max(hauteur_exercice(15.6, **ex13), hauteur_exercice(15.6, **ex14))
    exercice(s, seq, i, 2, 0.9, bas(e), 15.6, 13,
             "Lecture microscopique d'une équation", h=hh, **ex13)
    exercice(s, seq, i, 3, 17.4, bas(e), 15.6, 14, "Proportions", h=hh, **ex14)

    # --- III.G · réactif limitant ----------------------------------------------
    s, i = page("III", "Transformations chimiques", "G — Réactif limitant")
    e = encart(s, seq, i, 1, "definition", 0.9, 2.7, 32.1, None,
           [[("Le ", {}), terme("réactif limitant"),
             (" est le réactif qui est complètement consommé dans la réaction. "
              "Une fois entièrement consommé, il arrête la réaction et limite "
              "donc le produit fabriqué.", {})]],
           etiquette="DÉFINITION — RÉACTIF LIMITANT", fiche=True)
    # la figure à gauche, sa légende à droite : sous la figure, elle poussait
    # l'exercice 15 contre le pied de page
    y0 = bas(e)
    f = fig(s, i, 2, "t1c2f9", 0.9, y0, 18.5)
    picto_fiche(s, seq, i, 2, 19.2, y0)
    z = _texte(s, 20.4, y0 + 1.0, 12.6, 4.6,
               [[("Image 9", {"police": MONO, "taille": 11, "gras": True,
                              "couleur": ENCRE}),
                 (" — L'analogie du hot-dog.", {"police": MONO, "taille": 11,
                                                "couleur": GRIS})],
                "5 saucisses, 4 petits pains : on n'assemble que 4 hot-dogs.",
                [("Le pain, entièrement consommé, est le ", {}),
                 terme("réactif limitant", OCRE),
                 (" ; il reste 1 saucisse, le ", {}),
                 terme("réactif en excès", ALPHA), (".", {})]],
               taille=14, interligne=1.15, espacement=6)
    seq.marque(i, 2, z)
    exercice(s, seq, i, 3, 0.9, bas(f, 0.6), 32.1, 15, "Combustion du méthane",
             contexte="150 molécules de méthane réagissent avec 1000 molécules "
                      "de dioxygène, selon l'équation :",
             equations=["CH₄  +  2 O₂   →   2 H₂O  +  CO₂"],
             question="Déterminer le réactif limitant, puis le nombre de "
                      "molécules présentes à la fin de la réaction.")

    # ============================================================= CHECKLIST
    s, i = page("✓", "Pour le DS, je sais", "les huit compétences du chapitre")
    checklist(s, seq, i, "", [
        "Distinguer transformation physique et transformation chimique, et "
        "en donner des exemples.",
        "Identifier le sens du transfert thermique et le relier aux termes "
        "exothermique et endothermique.",
        "Reconnaître et nommer les états et les six changements d'état.",
        "Établir l'écriture d'une équation de changement d'état.",
        "Exploiter la relation Q = m × L entre énergie transférée, masse et "
        "énergie massique.",
        "Connaître les définitions : système chimique, réaction chimique, "
        "réactifs, produits, espèce spectatrice.",
        "Modéliser une transformation par une réaction, établir son équation "
        "et l'ajuster.",
        "Identifier le réactif limitant à partir des quantités de matière et "
        "de l'équation.",
    ], kahoots=[
        # les deux Kahoot de la checklist en ligne (règle du 22/09/2026)
        ("transformations physiques",
         "https://create.kahoot.it/share/bilan-transformations-physiques/"
         "cddd4fff-a579-4bdd-9809-eeef7b109e1a"),
        ("transformations chimiques",
         "https://create.kahoot.it/share/bilan-transformations-chimiques/"
         "3cb2cd2a-b987-4484-83d7-c86ea6a5940f"),
    ])

    # ------------------------------------------------- minutage et contrôle
    total = 0
    print("\nAnimation :")
    for k, s in enumerate(prs.slides):
        etapes = seq.etapes(k)
        total += minuter(s, etapes)
        c = controler(s)
        etat = "✓"
        if c["doublons"]:
            etat = f"✗ identifiants en double : {c['doublons']}"
        elif c["orphelines"]:
            etat = f"✗ cibles orphelines : {c['orphelines']}"
        elif c["clics"] != len(etapes):
            etat = f"✗ {c['clics']} clics pour {len(etapes)} étapes"
        print(f"  diapo {k + 1:2d} — {len(etapes):2d} étape(s)  {etat}")

    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    prs.save(SORTIE)
    ko = SORTIE.stat().st_size // 1024
    print(f"\n→ {SORTIE}")
    print(f"   {len(prs.slides)} diapositives · {total} étapes d'animation · {ko} Ko")


if __name__ == "__main__":
    figs = sys.argv[1] if len(sys.argv) > 1 else None
    if not figs:
        raise SystemExit(
            "usage : python3 diapo_t1c2.py <dossier-des-figures>\n"
            "  produire d'abord les figures :\n"
            "  node extraire_figures.mjs ../../pages/2nde-pc-t1-c2-"
            "transformations-physiques-chimiques.html <dossier>")
    construire(figs)
