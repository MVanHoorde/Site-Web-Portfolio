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
    ALPHA, BETA, ENCRE, GAMMA, GRIS, OCRE, MONO, CORPS, TITRES, bas,
    Sequence, bandeau, checklist, diapo, diapo_titre, encart, figure,
    formule, fraction, ind, pied, presentation, titre_partie, _texte,
)
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

    # --- I.A · les deux définitions -------------------------------------
    s, i = page("I", "Introduction", "A — Transformation physique ou chimique ?")
    d1 = encart(s, seq, i, 1, "definition", 0.9, 2.6, 15.6, None,
           ["Une transformation physique est une transformation au cours de "
            "laquelle la matière change d'apparence, de forme, d'état mais "
            "les espèces chimiques (molécules) ne changent pas."],
           etiquette="DÉFINITION — TRANSFORMATION PHYSIQUE", fiche=True)
    d2 = encart(s, seq, i, 2, "definition", 17.4, 2.6, 15.6, None,
           ["Une transformation chimique est une transformation au cours de "
            "laquelle certaines substances disparaissent et d'autres "
            "apparaissent. Les espèces chimiques sont modifiées."],
           etiquette="DÉFINITION — TRANSFORMATION CHIMIQUE", fiche=True)
    encart(s, seq, i, 3, "exercice", 0.9, max(bas(d1), bas(d2)), 32.1, None,
           ["a) obtention d'une flamme (briquet)   ·   b) formation de la "
            "rosée   ·   c) dissolution de sucre dans du café",
            "d) récolte de sel dans un marais salant   ·   e) infusion de "
            "thé   ·   f) formation de vin à partir de jus de raisin",
            "g) détartrage de la bouilloire   ·   h) obtention de neige avec "
            "un canon à neige   ·   i) feux d'artifice",
            [("Classer chaque situation : transformation physique ou "
              "transformation chimique ?", {"italique": True})]],
           etiquette="EXERCICE 1 — TRANSFORMATION PHYSIQUE OU CHIMIQUE ?")

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
        img = s.shapes.add_picture(str(photo), int(x * 360000), int(3.4 * 360000),
                                   height=int(8.2 * 360000))
        seq.marque(i, rang, img)
        z = _texte(s, x, 12.0, 15.6, 3.0, legende, taille=11, police=MONO,
                   couleur=GRIS, interligne=1.2)
        seq.marque(i, rang, z)
    for rang, (x, eq) in enumerate((
        (0.9, [("H₂O", {}), ("(s)", {"ind": True}), ("   →   ", {}),
               ("H₂O", {}), ("(g)", {"ind": True})]),
        (17.4, [("6 CO₂  +  6 H₂O   →   C₆H₁₂O₆  +  6 O₂", {})]),
    ), start=1):
        z = _texte(s, x, 15.5, 15.6, 1.2, [eq], taille=19, police=TITRES,
                   gras=True, align=PP_ALIGN.CENTER)
        seq.marque(i, rang + 2, z)

    # --- I.B · effet thermique -------------------------------------------
    s, i = page("I", "Introduction", "B — Effet thermique des transformations")
    fig(s, i, 1, "t1c2f3", 18.6, 3.0, 13.6,
        "Image 3 — Sens du transfert de chaleur entre le système et le milieu "
        "extérieur.")
    from gabarit_diapo import picto_fiche
    picto_fiche(s, seq, i, 1, 31.4, 2.3)
    e = encart(s, seq, i, 2, "definition", 0.9, 3.0, 17.0, None,
           ["Une transformation qui libère de l'énergie sous forme de chaleur "
            "est appelée réaction exothermique."],
           etiquette="DÉFINITION — RÉACTION EXOTHERMIQUE", fiche=True)
    e = encart(s, seq, i, 3, "definition", 0.9, bas(e), 17.0, None,
           ["Une transformation qui prend de la chaleur au milieu extérieur "
            "est appelée réaction endothermique."],
           etiquette="DÉFINITION — RÉACTION ENDOTHERMIQUE", fiche=True)
    encart(s, seq, i, 4, "exemple", 0.9, max(bas(e), 11.2), 31.0, None,
           ["La paraffine d'une bougie, C₁₈H₃₆O₂, brûle dans le dioxygène de "
            "l'air et forme du dioxyde de carbone et de l'eau :",
            [("C₁₈H₃₆O₂ (s)  +  26 O₂ (g)   →   18 CO₂ (g)  +  26 H₂O (l)",
              {"gras": True, "police": TITRES, "taille": 17})],
            "Cette réaction produit de la chaleur : elle est exothermique."],
           etiquette="EXEMPLE — COMBUSTION D'UNE BOUGIE")

    # ======================================= II — TRANSFORMATIONS PHYSIQUES
    s = diapo(prs)
    titre_partie(s, seq, len(prs.slides) - 1, "II", "Transformations physiques",
                 ["A — États de la matière",
                  "B — Changement d'état",
                  "C — Équation d'un changement d'état",
                  "D — Énergie de changement d'état"])
    n += 1

    # --- II.A · les trois états -------------------------------------------
    s, i = page("II", "Transformations physiques", "A — États de la matière")
    fig(s, i, 1, "t1c2f4", 0.9, 2.8, 20.0,
        "Image 4 — Traits pleins : liaisons fortes. Traits pointillés : "
        "liaisons faibles. Aucun trait : entités libres, en agitation.")
    picto_fiche(s, seq, i, 1, 19.6, 2.3)
    encart(s, seq, i, 2, "propriete", 21.8, 2.8, 11.2, None,
           ["Gazeux (g) — entités agitées, espacées, libres, qui "
            "s'entrechoquent sans cesse.",
            "Liquide (l) — entités mobiles, proches, peu liées ou par des "
            "liaisons faibles.",
            "Solide (s) — entités presque immobiles (elles vibrent), très "
            "proches, fortement liées."],
           etiquette="PROPRIÉTÉ — LES TROIS ÉTATS", fiche=True)
    fig(s, i, 3, "t1c2ex2", 6.0, 10.2, 15.0)
    z = _texte(s, 0.9, 15.6, 32.1, 1.2,
               [[("Exercice 2 — ", {"gras": True, "couleur": ALPHA,
                                    "police": MONO, "taille": 12}),
                 ("le diamant · un verre de jus d'orange · l'air : associer "
                  "chaque matière au schéma qui lui correspond, et préciser "
                  "son état physique.", {"italique": True})]], taille=15)
    seq.marque(i, 4, z)

    # --- II.B · changement d'état -----------------------------------------
    s, i = page("II", "Transformations physiques", "B — Changement d'état")
    fig(s, i, 1, "t1c2f5", 19.4, 2.7, 13.0,
        "Image 5 — Les six changements d'état. Cyan : endothermique. "
        "Rouge : exothermique.")
    picto_fiche(s, seq, i, 1, 31.6, 2.2)
    e = encart(s, seq, i, 2, "definition", 0.9, 2.8, 17.6, None,
           ["Lors d'un changement d'état, les propriétés de la matière "
            "changent, l'agitation et l'arrangement spatial des entités sont "
            "modifiés. Les liaisons entre les entités s'affaiblissent ou se "
            "renforcent, se rompent ou se créent."],
           etiquette="DÉFINITION — CHANGEMENT D'ÉTAT", fiche=True)
    z = _texte(s, 0.9, bas(e), 17.6, 1.0,
               [[("Les six changements d'état sont à connaître par cœur.",
                  {"gras": True, "couleur": ALPHA})]], taille=16)
    seq.marque(i, 3, z)
    encart(s, seq, i, 4, "exercice", 0.9, bas(z, 0.35), 17.6, None,
           [[("Donner un exemple pour chacun des changements d'état "
              "suivants :", {"italique": True})],
            "vaporisation   ·   solidification   ·   condensation"],
           etiquette="EXERCICE 3 — EXEMPLES DE CHANGEMENT D'ÉTAT")

    # --- II.B · corps pur / mélange ----------------------------------------
    s, i = page("II", "Transformations physiques",
                "B — Corps pur ou mélange : le palier de température")
    fig(s, i, 1, "t1c2tp3", 0.9, 2.8, 19.0,
        "Synthèse du TP3 — ① palier à 0 °C : les états solide et liquide "
        "coexistent. ② rupture de pente vers −4 °C pour l'eau salée.")
    e = encart(s, seq, i, 2, "definition", 20.6, 2.8, 12.4, None,
           ["Lors du changement d'état d'un corps pur, la température ne "
            "varie plus. Cette température est appelée température de "
            "changement d'état."],
           etiquette="DÉFINITION — TEMPÉRATURE DE CHANGEMENT D'ÉTAT",
           fiche=True)
    encart(s, seq, i, 3, "exercice", 20.6, bas(e), 12.4, None,
           [[("Deux courbes de refroidissement : la première présente un "
              "palier vers 6 °C ; la seconde, un cola, décroît régulièrement "
              "sans palier.", {"italique": True})],
            [("Corps pur ou mélange ? Préciser si possible la température de "
              "changement d'état.", {"italique": True})]],
           etiquette="EXERCICE 6 — CORPS PUR OU MÉLANGE ?")

    # --- II.C · équation d'un changement d'état ----------------------------
    s, i = page("II", "Transformations physiques",
                "C — Équation d'un changement d'état")
    e = encart(s, seq, i, 1, "propriete", 0.9, 2.8, 32.1, None,
           ["Au cours d'un changement d'état physique, les espèces chimiques "
            "ne sont pas modifiées. Pour modéliser le changement d'état "
            "d'une espèce chimique A, on écrit l'équation :",
            [("A (état physique initial)   →   A (état physique final)",
              {"gras": True, "police": TITRES, "taille": 19})]],
           etiquette="PROPRIÉTÉ — ÉCRITURE D'UN CHANGEMENT D'ÉTAT", fiche=True)
    x = encart(s, seq, i, 2, "exemple", 0.9, bas(e), 15.6, None,
           [[("Fusion de l'eau :        H₂O (s)   →   H₂O (l)",
              {"gras": True, "police": TITRES, "taille": 17})]],
           etiquette="EXEMPLE")
    encart(s, seq, i, 3, "exercice", 0.9, bas(x), 15.6, None,
           [[("Établir l'équation de la condensation de l'eau, puis de la "
              "solidification du fer Fe.", {"italique": True})]],
           etiquette="EXERCICE 4 — ÉTABLIR UNE ÉQUATION")
    encart(s, seq, i, 4, "exercice", 17.4, bas(e), 15.6, None,
           [[("Quels changements d'état décrivent ces équations ?",
              {"italique": True})],
            [("H₂O (g)   →   H₂O (s)", {"gras": True, "police": TITRES,
                                        "taille": 17})],
            [("Cu (s)   →   Cu (g)", {"gras": True, "police": TITRES,
                                      "taille": 17})]],
           etiquette="EXERCICE 5 — IDENTIFIER UN CHANGEMENT D'ÉTAT")

    # --- II.D · énergie de changement d'état -------------------------------
    s, i = page("II", "Transformations physiques",
                "D — Énergie de changement d'état")
    encart(s, seq, i, 1, "definition", 0.9, 2.8, 32.1, None,
           ["L'énergie massique de changement d'état L d'un corps pur est "
            "l'énergie thermique que doit absorber ou libérer 1 kg de ce "
            "corps pour changer d'état, à sa température de changement "
            "d'état et pour une pression donnée. Elle s'exprime en J·kg⁻¹."],
           etiquette="DÉFINITION — ÉNERGIE MASSIQUE DE CHANGEMENT D'ÉTAT L",
           fiche=True)
    fig(s, i, 2, "t1c2f6", 3.0, 7.6, 17.4,
        "Image 6 — Pour passer d'un état condensé vers un état aux liaisons "
        "faibles ou inexistantes, la matière prend de l'énergie au milieu "
        "extérieur, et réciproquement.")
    encart(s, seq, i, 3, "propriete", 21.6, 7.6, 11.4, None,
           [[("L", {"italique": True}), ("fusion", {"ind": True}),
             (" = − ", {}), ("L", {"italique": True}),
             ("solidification", {"ind": True})],
            [("L", {"italique": True}), ("sublimation", {"ind": True}),
             (" = − ", {}), ("L", {"italique": True}),
             ("condensation", {"ind": True})],
            "Le signe traduit le sens de l'échange."],
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
    encart(s, seq, i, 3, "exercice", 0.9, 9.4, 15.6, None,
           [[("On étudie la solidification de 200 g de fer pur en fusion. "
              "Quelle énergie est transférée avec le milieu extérieur ? "
              "Schématiser le transfert.", {"italique": True})],
            [("Données : L", {"police": MONO, "taille": 12}),
             ("fusion", {"ind": True, "police": MONO, "taille": 12}),
             ("(fer) = 270 kJ·kg⁻¹  ·  L", {"police": MONO, "taille": 12}),
             ("solidification", {"ind": True, "police": MONO, "taille": 12}),
             ("(fer) = −270 kJ·kg⁻¹", {"police": MONO, "taille": 12})]],
           etiquette="EXERCICE 8 — SOLIDIFICATION DU FER")
    encart(s, seq, i, 4, "exercice", 17.4, 9.4, 15.6, None,
           [[("La tsar bomba, l'arme la plus puissante jamais testée, a "
              "libéré 57 mégatonnes de TNT. Quelle masse d'eau pourrait-on "
              "vaporiser avec cette énergie ?", {"italique": True})],
            [("Données : 1 Mt = 4,2 × 10¹⁵ J  ·  L",
              {"police": MONO, "taille": 12}),
             ("vaporisation", {"ind": True, "police": MONO, "taille": 12}),
             ("(eau) = 2,3 × 10⁶ J·kg⁻¹", {"police": MONO, "taille": 12})]],
           etiquette="EXERCICE 9 — ÉNERGIE DE LA TSAR BOMBA")

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
    encart(s, seq, i, 1, "notation", 0.9, 2.8, 15.6, None,
           [[("(s)", {"gras": True}), ("  solide          ", {}),
             ("(l)", {"gras": True}), ("  liquide          ", {}),
             ("(g)", {"gras": True}), ("  gazeux", {})],
            [("(aq)", {"gras": True}),
             ("  aqueux — molécules et ions dissous dans l'eau (hydratés). "
              "Ce n'est PAS un quatrième état de la matière, mais une "
              "notation très utilisée en chimie.", {})]],
           etiquette="NOTATIONS — LES ÉTATS PHYSIQUES", fiche=True)
    encart(s, seq, i, 2, "definition", 17.4, 2.8, 15.6, None,
           ["Un système chimique est un échantillon de matière décrit par "
            "différents paramètres : des grandeurs physiques (température, "
            "pression…), les espèces chimiques qui le constituent, leurs "
            "états physiques, leurs quantités de matière."],
           etiquette="DÉFINITION — SYSTÈME CHIMIQUE", fiche=True)
    img = s.shapes.add_picture(str(IMG / "t1c2-solution-sulfate-cuivre.jpg"),
                               int(0.9 * 360000), int(9.8 * 360000),
                               height=int(6.0 * 360000))
    seq.marque(i, 3, img)
    z = _texte(s, 9.4, 9.8, 23.6, 6.2,
               ["Image 8 — Solution aqueuse de sulfate de cuivre.",
                "Description qualitative : température 20 °C, pression 1 bar, "
                "ions cuivre (II) Cu²⁺(aq), ions sulfate SO₄²⁻(aq), eau "
                "H₂O(l).",
                "Description quantitative : il faut en plus connaître les "
                "quantités de matière de chaque espèce."],
               taille=14, interligne=1.2, espacement=8)
    seq.marque(i, 3, z)

    # --- III.C · état initial et état final ---------------------------------
    s, i = page("III", "Transformations chimiques",
                "C — Représenter une transformation chimique")
    e = encart(s, seq, i, 1, "definition", 0.9, 2.8, 16.4, None,
           ["L'état initial du système chimique est son état avant la "
            "transformation ; l'état final, son état après.",
            "Les espèces introduites à l'état initial sont les réactifs ; "
            "celles obtenues à l'état final sont les produits.",
            "Une espèce présente mais qui ne subit aucune modification est "
            "une espèce spectatrice."],
           etiquette="DÉFINITIONS — ÉTAT INITIAL, ÉTAT FINAL, RÉACTIFS, "
                     "PRODUITS", fiche=True)
    img = s.shapes.add_picture(str(IMG / "t1c2-experience-argent-cuivre.jpg"),
                               int(18.2 * 360000), int(2.8 * 360000),
                               width=int(14.8 * 360000))
    seq.marque(i, 2, img)
    z = _texte(s, 18.2, 11.6, 14.8, 4.6,
               ["Image 9 — Du cuivre dans une solution de nitrate d'argent, "
                "à 20 °C et 1 bar.",
                "État initial : n(Cu) = 1,0 mol · n(Ag⁺) = n(NO₃⁻) = 0,1 mol.",
                "État final : n(Ag) = 0,1 mol · n(Cu²⁺) = 0,05 mol · "
                "n(Cu) = 0,95 mol · NO₃⁻ spectateur."],
               taille=12, police=MONO, couleur=GRIS, interligne=1.2,
               espacement=5)
    seq.marque(i, 2, z)
    z = _texte(s, 0.9, bas(e), 16.4, 4.8,
               "La transformation chimique est le passage de l'état initial "
               "à l'état final.", taille=17, italique=True)
    seq.marque(i, 3, z)

    # --- III.D · lois de conservation ---------------------------------------
    s, i = page("III", "Transformations chimiques", "D — Lois de conservation")
    encart(s, seq, i, 1, "propriete", 0.9, 2.8, 32.1, None,
           ["Au cours d'une transformation chimique, il y a conservation des "
            "éléments chimiques (nature et quantités), et conservation de la "
            "charge électrique globale."],
           etiquette="PROPRIÉTÉ — LES DEUX LOIS DE CONSERVATION", fiche=True)
    img = s.shapes.add_picture(str(IMG / "t1c2-lavoisier-david.jpg"),
                               int(0.9 * 360000), int(7.6 * 360000),
                               height=int(8.6 * 360000))
    seq.marque(i, 2, img)
    z = _texte(s, 8.4, 7.6, 24.6, 8.6,
               ["Antoine de Lavoisier (1743 – 1794), père de la chimie moderne",
                "Entre 1783 et 1785, Lavoisier décompose l'eau puis la "
                "recompose : elle n'est pas un élément, mais un composé "
                "d'hydrogène et d'oxygène.",
                [("2 H₂O (l)   →   2 H₂ (g)  +  O₂ (g)",
                  {"gras": True, "police": TITRES, "taille": 20})],
                "4 atomes d'hydrogène et 2 atomes d'oxygène de chaque côté ; "
                "les deux états sont électriquement neutres.",
                [("« Rien ne se perd, rien ne se crée, tout se transforme. »",
                  {"italique": True, "couleur": GRIS})]],
               taille=15, interligne=1.2, espacement=8)
    seq.marque(i, 2, z)

    # --- III.E · réaction chimique et méthode -------------------------------
    s, i = page("III", "Transformations chimiques",
                "E — Équation de réaction chimique")
    d = encart(s, seq, i, 1, "definition", 0.9, 2.8, 15.6, None,
           ["Une réaction chimique est un processus modélisant une "
            "transformation chimique au niveau microscopique. Elle est "
            "décrite par une équation de réaction, dont l'écriture "
            "symbolique contient :",
            "— les formules brutes et les états physiques des réactifs "
            "(à gauche) et des produits (à droite) ;",
            "— une flèche symbolisant l'évolution du système ;",
            "— des coefficients respectant les deux lois de conservation, "
            "appelés coefficients stœchiométriques lorsqu'ils sont les plus "
            "petits possibles."],
           etiquette="DÉFINITION — RÉACTION CHIMIQUE ET ÉQUATION", fiche=True)
    m = encart(s, seq, i, 2, "methode", 17.4, 2.8, 15.6, None,
           ["I.   Identifier les réactifs et les produits.",
            "II.  Écrire leurs formules brutes, avec leur état physique, de "
            "part et d'autre de la flèche.",
            "III. Compter chaque élément des deux côtés et placer des "
            "coefficients, en commençant par l'élément le moins présent.",
            "IV.  Vérifier que les charges sont équilibrées."],
           etiquette="MÉTHODE — ÉCRIRE ET ÉQUILIBRER UNE ÉQUATION",
           fiche=True)
    encart(s, seq, i, 3, "exercice", 0.9, max(bas(d), bas(m)), 32.1, None,
           [[("Les ions fer (II) réagissent avec les ions hydroxyde de la "
              "soude pour former un précipité vert d'hydroxyde de fer (II). "
              "Identifier réactifs, produits et coefficients "
              "stœchiométriques, puis vérifier les deux lois.",
              {"italique": True})],
            [("Fe²⁺(aq)  +  2 HO⁻(aq)   →   Fe(OH)₂ (s)",
              {"gras": True, "police": TITRES, "taille": 18})]],
           etiquette="EXERCICE 10 — TEST DE RECONNAISSANCE DES IONS FER (II)")

    # --- III.E · équilibrer ---------------------------------------------------
    s, i = page("III", "Transformations chimiques",
                "E — S'entraîner à équilibrer")
    e = encart(s, seq, i, 1, "exercice", 0.9, 3.0, 32.1, None,
           [[("Équilibrer ces équations de réaction en ajoutant les "
              "coefficients stœchiométriques manquants.", {"italique": True})],
            [("H⁺  +  Fe   →   H₂  +  Fe²⁺",
              {"police": TITRES, "taille": 22})],
            [("Cu²⁺  +  HO⁻   →   Cu(HO)₂",
              {"police": TITRES, "taille": 22})],
            [("CaCO₃  +  H⁺   →   Ca²⁺  +  HCO₃⁻",
              {"police": TITRES, "taille": 22})],
            [("CH₄  +  O₂   →   H₂O  +  CO₂",
              {"police": TITRES, "taille": 22})]],
           etiquette="EXERCICE 11 — ÉQUILIBRER DES ÉQUATIONS DE RÉACTION")
    encart(s, seq, i, 2, "exercice", 0.9, bas(e, 0.9), 32.1, None,
           [[("Le glucose C₆H₁₂O₆ est dégradé comme dans une combustion "
              "complète dans le dioxygène : écrire et équilibrer l'équation.",
              {"italique": True})]],
           etiquette="EXERCICE 12 — COMBUSTION DU GLUCOSE")

    # --- III.F · stœchiométrie -------------------------------------------------
    s, i = page("III", "Transformations chimiques",
                "F — Qu'est-ce que la stœchiométrie ?")
    e = encart(s, seq, i, 1, "propriete", 0.9, 2.8, 32.1, None,
           ["Au-delà de l'équilibrage, les nombres stœchiométriques ont un "
            "sens physique : à l'échelle microscopique, ils donnent les "
            "proportions, en nombre d'atomes, d'ions ou de molécules, dans "
            "lesquelles les réactifs réagissent et les produits se forment.",
            [("Cu (s)  +  2 Ag⁺(aq)   →   Cu²⁺(aq)  +  2 Ag (s)",
              {"gras": True, "police": TITRES, "taille": 19})]],
           etiquette="PROPRIÉTÉ — LIRE UNE ÉQUATION EN PROPORTIONS",
           fiche=True)
    z = _texte(s, 0.9, bas(e), 32.1, 1.4,
               "« Si 1 atome de cuivre est consommé, alors 2 ions Ag⁺ le sont "
               "aussi, et il se forme 2 atomes d'argent et 1 ion Cu²⁺. »",
               taille=16, italique=True, couleur=GAMMA)
    seq.marque(i, 2, z)
    encart(s, seq, i, 3, "exercice", 0.9, bas(z, 0.5), 15.6, None,
           [[("Soit CH₄ + 2 O₂ → 2 H₂O + CO₂. Combien de molécules de chaque "
              "réactif sont consommées, et de chaque produit formées ? "
              "Rédiger une phrase sur le modèle « si … alors … ».",
              {"italique": True})]],
           etiquette="EXERCICE 13 — LECTURE MICROSCOPIQUE")
    encart(s, seq, i, 4, "exercice", 17.4, bas(z, 0.5), 15.6, None,
           [[("Combien d'atomes d'argent sont produits si 5 atomes de cuivre "
              "réagissent avec 10 ions Ag⁺ ?", {"italique": True})]],
           etiquette="EXERCICE 14 — PROPORTIONS")

    # --- III.G · réactif limitant ----------------------------------------------
    s, i = page("III", "Transformations chimiques", "G — Réactif limitant")
    e = encart(s, seq, i, 1, "definition", 0.9, 2.8, 32.1, None,
           ["Le réactif limitant est le réactif qui est complètement consommé "
            "dans la réaction. Une fois consommé, il arrête la réaction et "
            "limite donc la quantité de produit fabriqué."],
           etiquette="DÉFINITION — RÉACTIF LIMITANT", fiche=True)
    f = fig(s, i, 2, "t1c2f9", 7.0, bas(e), 19.8,
        "Image 10 — L'analogie du hot-dog : 5 saucisses, 4 pains, donc 4 "
        "hot-dogs. Le pain, entièrement consommé, est le réactif limitant ; "
        "la saucisse est en excès.")
    picto_fiche(s, seq, i, 2, 27.2, 6.2)
    encart(s, seq, i, 3, "exercice", 0.9, bas(f, 1.6), 32.1, None,
           [[("150 molécules de méthane réagissent avec 1000 molécules de "
              "dioxygène, selon CH₄ + 2 O₂ → 2 H₂O + CO₂. Déterminer le "
              "réactif limitant, puis le nombre de molécules présentes à la "
              "fin de la réaction.", {"italique": True})]],
           etiquette="EXERCICE 15 — COMBUSTION DU MÉTHANE")

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
