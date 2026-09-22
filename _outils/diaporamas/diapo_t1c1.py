#!/usr/bin/env python3
"""
diapo_t1c1.py — contenu du diaporama de projection du chapitre T1-C1.

Ce fichier ne contient QUE ce qui est propre au chapitre. Toute la charte et
tous les composants viennent de `gabarit_diapo.py`.

USAGE
    node extraire_figures.mjs ../../pages/2nde-pc-t1-c1-matiere-macroscopique.html <figs>
    python3 diapo_t1c1.py <figs>

    Produit assets/pptx/pc/diaporama-2nde-t1c1.pptx

STRUCTURE — celle du PowerPoint de Loïc, qui pour ce chapitre est À PLAT :
sept parties numérotées 01 à 07, sans chiffres romains ni sous-parties. C'est
aussi la structure du site, et donc la numérotation des images (règle R6).
Pas d'intercalaire : sept diapositives de transition pour un chapitre à plat,
ce serait sept clics pour rien.

🔴 LES DIX EXERCICES SONT TOUS PROJETÉS (demande de Loïc, 22/09/2026), chacun
avec son document DANS son cadre (règle R7) : l'alliance dans l'exercice 3,
le tableau des gaz et la courbe du diazote dans l'exercice 7, le montage de
mesure dans l'exercice 8.

AUDIT DE LOÏC DU 22/09/2026 — appliqué ici ET sur la page (écran et page
doivent porter les mêmes ✎) : mot défini surligné ; espèce chimique / corps
pur séparés ; corps pur simple, composé, mélange hétérogène, homogène,
liquides miscibles et non miscibles devenus des définitions ; composition de
l'air devenue une propriété ; exercices renumérotés dans l'ordre d'apparition
(fonte = 3, air = 4). Une figure qui ILLUSTRE une définition arrive APRÈS
elle. Le Kahoot du chapitre clôt la checklist.

🔴 AUCUNE CORRECTION À L'ÉCRAN. Les énoncés apparaissent, jamais les
réponses : elles vivent en ligne, derrière le code de déblocage.

FIGURES — les six SVG du site sont extraits par `extraire_figures.mjs`
(`site-t1c1fN.png`) ; les treize autres sont des images du dossier du
chapitre, posées telles quelles (schémas refaits sous Canva le 20/09/2026).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from gabarit_diapo import (          # noqa: E402
    BETA, ENCRE, GAMMA, GRIS, MONO, CORPS, PAPIER, TITRES, BLANC, bas, cm,
    Par, Sequence, bandeau, checklist, diapo, diapo_titre, encart, exercice,
    figure, formule, fraction, hauteur_encart, hauteur_exercice, picto_fiche,
    pied,
    presentation, terme, _texte, _riche,
)
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN   # noqa: E402

from animer import controler, minuter   # noqa: E402

RACINE = Path(__file__).resolve().parents[2]
IMG = RACINE / "assets" / "img" / "pc" / "2nde-pc-t1-c1"
SORTIE = RACINE / "assets" / "pptx" / "pc" / "diaporama-2nde-t1c1.pptx"

CHAPITRE = "Thème 1 · Chapitre 1 — La matière à l'échelle macroscopique"
ANNEE = "2026 / 2027"

# proportions hauteur/largeur : viewBox des SVG du site, pixels des images
RATIO = {"t1c1f2": 340 / 900, "t1c1f3": 340 / 900, "t1c1f8": 1.0,
         "t1c1f11": 430 / 680, "t1c1f13": 400 / 660, "t1c1f14": 340 / 400}
SEIZE_NEUVIEMES = 768 / 1376          # les schémas refaits sous Canva

# style des énoncés, comme T1-C2
Q = {"italique": True}
DON = {"police": MONO, "taille": 12}

# identifiant du style de tableau « Table Grid » de PowerPoint : quadrillage
# encre, sans les bandes colorées du style posé par défaut
STYLE_GRILLE = "{5940675A-B579-460E-94D1-54222C63F5DA}"


def construire(dossier_figs):
    figs = Path(dossier_figs)
    prs = presentation()
    seq = Sequence()
    n = 0

    def page(num, partie, sous=""):
        """Ouvre une diapositive de contenu : bandeau + pied, puis son index."""
        nonlocal n
        s = diapo(prs)
        i = len(prs.slides) - 1
        bandeau(s, seq, i, num, partie, sous)
        n += 1
        pied(s, seq, i, CHAPITRE, n)
        return s, i

    def fig(s, i, rang, cle, x, y, w, legende=None):
        """Une figure SVG du site, extraite en PNG."""
        return figure(s, seq, i, rang, figs / f"site-{cle}.png", x, y, w,
                      legende, h=w * RATIO[cle])

    def image(s, i, rang, nom, x, y, w, legende=None, ratio=SEIZE_NEUVIEMES):
        """Une image du dossier du chapitre (schéma refait ou photographie)."""
        return figure(s, seq, i, rang, IMG / nom, x, y, w, legende,
                      h=w * ratio)

    def fiche_sur(s, i, rang, forme):
        """Picto ✎ au coin haut droit d'une figure marquée a-noter en ligne."""
        x = (forme.left + forme.width) / 360000 - 0.75
        y = forme.top / 360000 - 0.6
        picto_fiche(s, seq, i, rang, x, y)

    def formule_frac(s, i, rang, gauche, haut, bas_, apres, grandeurs,
                     x, y, w, h=3.4, wf=2.6):
        """Panneau formule dont l'expression est une VRAIE fraction (R3).

        `formule()` n'écrit qu'une ligne de texte ; on lui passe une
        expression vide et on pose la fraction dans sa moitié gauche, en
        papier sur le fond encre."""
        formule(s, seq, i, rang, [""], grandeurs, x, y, w, h)
        xf = x + 5.2
        yf = y + (h - 1.95) / 2
        fraction(s, seq, i, rang, gauche, haut, bas_, xf, yf, wf,
                 couleur=PAPIER)
        if apres:
            z = _texte(s, xf + wf + 0.15, yf + 0.55, 3.2, 0.9, apres,
                       taille=22, police=TITRES, couleur=PAPIER,
                       italique=True)
            seq.marque(i, rang, z)
        picto_fiche(s, seq, i, rang, x + w - 1.1, y - 0.55)

    def exercice_doc(s, i, rang, etiquette, corps, x, y, w, h, largeur):
        """Cadre d'exercice dont le texte laisse la place à un document posé
        DANS le cadre (R7) : un schéma à côté se lirait comme du cours."""
        cadre = encart(s, seq, i, rang, "exercice", x, y, w, h, [""],
                       etiquette=etiquette)
        # la zone de corps (vide) posée par encart() couvre toute la largeur :
        # on la ramène à la colonne de texte, sans quoi elle recouvre le
        # document et le contrôle géométrique le signale à juste titre.
        s.shapes[-1].width = cm(largeur)
        z = _texte(s, x + 0.45, y + 0.95, largeur, h - 1.25, corps,
                   taille=15, interligne=1.15, espacement=6)
        seq.marque(i, rang, z)
        return cadre

    def tableau(s, i, rang, lignes, x, y, w, h_ligne, taille=14):
        """Tableau natif : il reste modifiable à la main dans PowerPoint."""
        gf = s.shapes.add_table(len(lignes), len(lignes[0]), cm(x), cm(y),
                                cm(w), cm(h_ligne * len(lignes)))
        gf._element.graphic.graphicData.tbl.tblPr[0].text = STYLE_GRILLE
        t = gf.table
        for r, ligne in enumerate(lignes):
            t.rows[r].height = cm(h_ligne)
            for c, val in enumerate(ligne):
                cell = t.cell(r, c)
                cell.fill.solid()
                cell.fill.fore_color.rgb = PAPIER if r == 0 else BLANC
                # marges resserrées : avec celles par défaut, PowerPoint
                # agrandissait chaque ligne et la légende passait dessus
                cell.margin_top = cell.margin_bottom = cm(0.04)
                p = cell.text_frame.paragraphs[0]
                p.alignment = PP_ALIGN.CENTER
                _riche(p, val, taille, TITRES if r else CORPS, ENCRE, r == 0,
                       False)
        seq.marque(i, rang, gf)
        return gf

    def grille(s, i, rang, entetes, fusions, x, y, w, h_entete, h_corps):
        """Grille de réponse VIDE, préconstruite pour la correction au tableau
        (demande de Loïc, 22/09/2026) : les élèves la recopient pendant qu'on
        la remplit. Mêmes colonnes que la correction en ligne — et rien
        dedans : aucune correction à l'écran (R1).

        entetes : lignes d'en-tête (None = cellule absorbée par une fusion)
        fusions : [((ligne, col), (ligne, col)), …] à fusionner"""
        nl, nc = len(entetes) + 1, len(entetes[0])
        haut = h_entete * len(entetes) + h_corps
        gf = s.shapes.add_table(nl, nc, cm(x), cm(y), cm(w), cm(haut))
        gf._element.graphic.graphicData.tbl.tblPr[0].text = STYLE_GRILLE
        t = gf.table
        for r in range(nl):
            t.rows[r].height = cm(h_entete if r < len(entetes) else h_corps)
            for c in range(nc):
                cell = t.cell(r, c)
                cell.fill.solid()
                cell.fill.fore_color.rgb = PAPIER if r < len(entetes) else BLANC
                cell.margin_top = cell.margin_bottom = cm(0.04)
                cell.vertical_anchor = MSO_ANCHOR.MIDDLE
                if r < len(entetes) and entetes[r][c]:
                    p = cell.text_frame.paragraphs[0]
                    p.alignment = PP_ALIGN.CENTER
                    _riche(p, entetes[r][c], 15, CORPS, ENCRE, True, False)
        for (a, b) in fusions:
            t.cell(*a).merge(t.cell(*b))
        seq.marque(i, rang, gf)
        return y + haut

    # ================================================================ TITRE
    # PROPOSITION À VALIDER — le sous-titre reprend l'accroche du site.
    diapo_titre(
        prs, seq,
        "THÈME 1 · CONSTITUTION ET TRANSFORMATIONS DE LA MATIÈRE",
        "Chapitre 1 — La matière à l'échelle macroscopique",
        "Un verre d'eau, une pièce, l'air que tu respires : de quoi la "
        "matière est-elle faite ?",
        ANNEE,
        fond=None,
        logo=RACINE / "assets" / "img" / "logo-isaac-lycee.png")
    n += 1

    # ================================================= 01 — ENTITÉS CHIMIQUES
    # Audit du 22/09 : le mot défini est surligné (terme()), et la page est
    # équilibrée — trois définitions côte à côte, l'image centrée dessous.
    # Quand une figure ILLUSTRE une définition, elle arrive APRÈS elle.
    s, i = page("01", "Entités chimiques", "atome · molécule · ion")
    defs = [
        ("ATOME", [[("L'", {}), terme("atome"),
                    (" est une particule neutre d'un élément chimique qui forme "
                     "la plus petite quantité susceptible de se combiner "
                     "(ex : C, Na, U…).", {})]]),
        ("MOLÉCULE", [[("La ", {}), terme("molécule"),
                       (" est un ensemble neutre d'atomes identiques ou non, "
                        "unis les uns aux autres par le biais de liaisons "
                        "chimiques (ex : H₂O, H₂, CH₄…).", {})]]),
        ("ION", [[("Un ", {}), terme("ion"),
                  (" est une entité chimique chargée que l'on trouve en "
                   "solution. Les ions négatifs sont appelés ", {}),
                  terme("anions"), (" (ex : Cl⁻, SO₄²⁻, F⁻…) et les ions "
                                    "positifs ", {}),
                  terme("cations"), (" (ex : H⁺, Mg²⁺, H₃O⁺…).", {})]]),
    ]
    h = max(hauteur_encart(c, 10.4) for _, c in defs)
    for k, (nom, corps) in enumerate(defs):
        d = encart(s, seq, i, k + 1, "definition", 0.9 + k * 10.85, 2.8, 10.4,
                   h, corps, etiquette=f"DÉFINITION — {nom}", fiche=True)
    y = bas(d, 0.45)
    w = min(14.0, (15.9 - y) / SEIZE_NEUVIEMES)
    image(s, i, 4, "t1c1-molecule-eau.jpg", (33.87 - w) / 2, y, w,
          "Image 1 — La molécule d'eau (H₂O) est composée de deux atomes "
          "d'hydrogène et d'un atome d'oxygène.")

    s, i = page("01", "Entités chimiques", "s'exercer")
    k1 = dict(equations=["Cu  |  CU  |  Ag⁺  |  H  |  CO₂  |  O²⁻  |  O₂  |  "
                         "Ca  |  NH₄⁺  |  NH₃  |  N  |  Cu²⁺  |  CO  |  C  |  "
                         "SiO₃  |  K⁺"],
              question="Classer ces entités chimiques selon qu'il s'agisse "
                       "d'un atome, d'une molécule, d'un anion ou d'un cation.")
    h1 = hauteur_exercice(32.1, **k1)
    e = exercice(s, seq, i, 1, 0.9, 2.8, 32.1, 1, "Atome, molécule ou ion ?",
                 h=h1 + 5.3, **k1)
    grille(s, i, 1, [["Atome", "Molécule", "Ion", None],
                     [None, None, "Anion", "Cation"]],
           [((0, 0), (1, 0)), ((0, 1), (1, 1)), ((0, 2), (0, 3))],
           1.6, 2.8 + h1 - 0.1, 30.7, 0.75, 3.4)
    encart(s, seq, i, 2, "piege", 0.9, bas(e, 0.9), 32.1, None,
           ["En chimie, une majuscule ouvre toujours un symbole d'élément, et "
            "la minuscule qui la suit appartient au même symbole. Co est le "
            "cobalt, CO le monoxyde de carbone : écris tes symboles chimiques "
            "lisiblement."],
           etiquette="ATTENTION — LA CASSE FAIT PARTIE DE LA FORMULE")

    # ======================================================= 02 — CORPS PURS
    # Audit du 22/09 : espèce chimique et corps pur séparés ; corps pur simple
    # et composé deviennent des définitions (en ligne aussi), chacune suivie
    # de SA figure.
    s, i = page("02", "Corps purs", "espèce chimique · corps pur simple ou composé")
    rangee = [
        [("ESPÈCE CHIMIQUE", [[("Une ", {}), terme("espèce chimique"),
                               (" est un ensemble d'entités chimiques.", {})]]),
         ("CORPS PUR", [[("Un ", {}), terme("corps pur"),
                         (" est constitué d'une seule espèce chimique.", {})]])],
        [("CORPS PUR SIMPLE", [[("Un ", {}), terme("corps pur simple"),
                                (" est formé d'un seul type d'élément "
                                 "chimique.", {})]]),
         ("CORPS PUR COMPOSÉ", [[("Un ", {}), terme("corps pur composé"),
                                 (", ou ", {}), terme("composé chimique"),
                                 (", est formé d'au moins deux types "
                                  "d'éléments chimiques.", {})]])],
    ]
    y = 2.8
    rangs = [[1, 2], [3, 5]]
    for r, ligne in enumerate(rangee):
        h = max(hauteur_encart(c, 15.6) for _, c in ligne)
        for k, (nom, corps) in enumerate(ligne):
            d = encart(s, seq, i, rangs[r][k], "definition", 0.9 + k * 16.5, y,
                       15.6, h, corps, etiquette=f"DÉFINITION — {nom}",
                       fiche=True)
        y = bas(d, 0.45)
    fig(s, i, 4, "t1c1f2", 0.9, y, 15.6,
        "Image 2 — Le cuivre métallique n'est formé que d'atomes de cuivre : "
        "un seul élément, un corps pur simple.")
    fig(s, i, 6, "t1c1f3", 17.4, y, 15.6,
        "Image 3 — L'eau : une seule espèce, mais deux éléments dans chaque "
        "molécule — un corps pur composé.")

    s, i = page("02", "Corps purs", "s'exercer")
    p = encart(s, seq, i, 1, "piege", 0.9, 2.8, 32.1, None,
               ["Un jus « pur fruit » ou une eau « pure » du langage courant "
                "sont des mélanges. En chimie, un corps pur ne contient qu'une "
                "seule espèce chimique : l'eau minérale, qui contient des ions, "
                "n'est pas un corps pur."],
               etiquette="ATTENTION — « PUR » N'A PAS LE SENS DE TOUS LES JOURS")
    k2 = dict(equations=["Cu  |  CU  |  Ag⁺  |  H  |  NH₄⁺  |  NH₃  |  N  |  "
                         "Cu²⁺  |  CO₂  |  O²⁻  |  O₂  |  Ca  |  CO  |  C  |  "
                         "SiO₃  |  K⁺"],
              question="Classer ces espèces chimiques selon qu'il s'agisse "
                       "d'un corps pur simple ou composé.")
    y2 = bas(p, 0.9)
    h2 = hauteur_exercice(32.1, **k2)
    exercice(s, seq, i, 2, 0.9, y2, 32.1, 2, "Corps pur simple ou composé ?",
             h=h2 + 4.6, **k2)
    grille(s, i, 2, [["Corps pur simple", "Corps pur composé"]], [],
           1.6, y2 + h2 - 0.1, 30.7, 0.8, 3.4)

    # ========================================================= 03 — MÉLANGES
    # Audit du 22/09 : hétérogène et homogène sont des définitions, et chaque
    # image arrive après la sienne.
    s, i = page("03", "Mélanges", "mélange hétérogène · mélange homogène")
    d = encart(s, seq, i, 1, "definition", 0.9, 2.8, 32.1, None,
               [[("Un ", {}), terme("mélange"),
                 (" est constitué de plusieurs espèces chimiques.", {})]],
               etiquette="DÉFINITION — MÉLANGE", fiche=True)
    ligne = [("MÉLANGE HÉTÉROGÈNE",
              [[("Un ", {}), terme("mélange hétérogène"),
                (" est constitué de plusieurs phases, c'est-à-dire plusieurs "
                 "corps que l'on peut distinguer.", {})]]),
             ("MÉLANGE HOMOGÈNE",
              [[("Un ", {}), terme("mélange homogène"),
                (" ne présente qu'une seule phase : les espèces chimiques y "
                 "sont indiscernables.", {})]])]
    h = max(hauteur_encart(c, 15.6) for _, c in ligne)
    y = bas(d, 0.45)
    for k, (nom, corps) in enumerate(ligne):
        encart(s, seq, i, 2 + 2 * k, "definition", 0.9 + k * 16.5, y, 15.6, h,
               corps, etiquette=f"DÉFINITION — {nom}", fiche=True)
    y = y + h + 0.45
    w = min(13.0, (16.0 - y) / SEIZE_NEUVIEMES)
    image(s, i, 3, "t1c1-melange-heterogene.jpg", 0.9 + (15.6 - w) / 2, y, w,
          "Image 4 — L'eau et l'huile : deux phases, mélange hétérogène.")
    image(s, i, 5, "t1c1-melange-homogene.jpg", 17.4 + (15.6 - w) / 2, y, w,
          "Image 5 — L'eau sucrée : une seule phase, mélange homogène.")

    # Audit du 22/09 : miscible / non miscible sont des définitions, posées à
    # côté de l'Image 6, qui passe presque en pleine page.
    s, i = page("03", "Mélanges", "liquides miscibles · les quatre cas")
    for k, (nom, corps) in enumerate((
        ("LIQUIDES MISCIBLES",
         [[("Un mélange de ", {}), terme("liquides miscibles"),
           (" ne fait apparaître qu'une seule phase : c'est un mélange "
            "homogène.", {})]]),
        ("LIQUIDES NON MISCIBLES",
         [[("Un mélange de ", {}), terme("liquides non miscibles"),
           (" fait apparaître plusieurs phases : c'est un mélange "
            "hétérogène.", {})]]),
    )):
        y = 2.8 if k == 0 else bas(d)
        # étiquette courte : dans un cadre de 8,7 cm, « LIQUIDES NON
        # MISCIBLES » passait sous la pastille ✎
        d = encart(s, seq, i, k + 1, "definition", 24.3, y, 8.7, None, corps,
                   etiquette=f"DÉFINITION — {nom.replace('LIQUIDES ', '')}",
                   fiche=True)
    z = _texte(s, 24.3, bas(d, 0.8), 8.7, 3.0,
               "Deux catégories pour les corps purs, deux pour les mélanges : "
               "le schéma les tient ensemble.", taille=15, italique=True,
               couleur=BETA)
    seq.marque(i, 3, z)
    f = image(s, i, 3, "t1c1-arbre-matiere.jpg", 0.9, 2.9, 22.6,
              "Image 6 — Les quatre cas et leur modélisation à l'échelle des "
              "particules : ce schéma est à retenir.")
    fiche_sur(s, i, 3, f)

    # ========================================= 04 — COMPOSITION D'UN MÉLANGE
    s, i = page("04", "Composition d'un mélange", "deux façons de compter")
    z = _texte(s, 0.9, 2.7, 32.1, 1.5,
               "Dire « c'est un mélange » ne suffit pas : il faut savoir en "
               "quelle proportion. La composition massique compare les "
               "masses, la composition volumique compare les volumes.",
               taille=16)
    seq.marque(i, 1, z)
    formule_frac(s, i, 2, "%m =", "m", [[("m", {}), ("mélange", {"ind": True})]],
                 "× 100",
                 [[("%m", {"gras": True}), ("  composition massique · %", {})],
                  [("m", {"gras": True}), ("  masse de l'espèce · g", {})],
                  [("m", {"gras": True}), ("mélange", {"gras": True, "ind": True}),
                   ("  masse totale · g", {})]],
                 x=3.4, y=5.0, w=27.0, h=4.3, wf=3.6)
    formule_frac(s, i, 3, "%V =", "V", [[("V", {}), ("mélange", {"ind": True})]],
                 "× 100",
                 [[("%V", {"gras": True}), ("  composition volumique · %", {})],
                  [("V", {"gras": True}), ("  volume de l'espèce · L", {})],
                  [("V", {"gras": True}), ("mélange", {"gras": True, "ind": True}),
                   ("  volume total · L", {})]],
                 x=3.4, y=10.3, w=27.0, h=4.3, wf=3.6)

    # Audit du 22/09 : l'exercice sur la fonte suit la fonte et porte le
    # numéro 3 — l'écran affichait l'exercice 4 avant le 3 (la page aussi).
    s, i = page("04", "Composition d'un mélange",
                "A — un exemple de composition massique : la fonte")
    m = image(s, i, 1, "t1c1-fonte-marmite.jpg", 0.9, 2.8, 10.4, None,
              ratio=556 / 900)
    image(s, i, 1, "t1c1-fonte-zoom.jpg", 11.8, 2.8, 9.9, None,
          ratio=584 / 900)
    z = _texte(s, 22.5, 2.8, 10.5, 6.4,
               "Image 7 — La fonte est un alliage (mélange en phase solide) "
               "d'au moins 2,11 % en masse de carbone ; le reste, 97,89 %, "
               "c'est du fer. À droite, au microscope : le carbone (points "
               "sombres) est dispersé dans le fer.",
               taille=11, police=MONO, couleur=GRIS, interligne=1.2)
    seq.marque(i, 1, z)
    y = bas(m, 0.9)
    exercice_doc(
        s, i, 2, "EXERCICE 3 — COMPOSITION EN MASSE",
        [[("1 — Quelle masse de carbone y a-t-il dans une marmite en fonte de "
           "2,5 kg composée à 4 % de carbone ?", Q)],
         [("2 — Une alliance en or blanc de 5 g est composée de 1000 mg d'or, "
           "le reste étant de l'argent. Donner la composition massique de "
           "cet alliage.", Q)],
         [("Donnée : la relation de la composition massique %m.", DON)]],
        0.9, y, 32.1, 5.9, 25.2)
    img = s.shapes.add_picture(str(IMG / "t1c1-alliance.jpg"), cm(27.4),
                               cm(y + 0.8), width=cm(4.6), height=cm(4.6))
    seq.marque(i, 2, img)

    # Audit du 22/09 : la composition de l'air est une PROPRIÉTÉ.
    s, i = page("04", "Composition d'un mélange",
                "B — un exemple de composition volumique : l'air")
    f = fig(s, i, 1, "t1c1f8", 22.6, 2.9, 10.0,
            "Image 8 — Composition volumique de l'air sec. « Autres gaz » : "
            "Ar, CO₂, Ne, He, Kr, H₂, Xe, O₃, Rn.")
    fiche_sur(s, i, 1, f)
    d = encart(s, seq, i, 2, "propriete", 0.9, 2.8, 20.4, None,
               [[("L'", {}), terme("air", GAMMA),
                 (" est un mélange de gaz. En volume, il contient environ "
                  "78 % de diazote (N₂) et 21 % de dioxygène (O₂) ; le dernier "
                  "pour cent réunit les autres gaz, dont l'argon (Ar) à 0,93 % "
                  "et le dioxyde de carbone (CO₂) à 0,04 %.", {})],
                [("Sa masse volumique vaut environ ", {}),
                 ("ρ", {"italique": True}), ("air", {"ind": True}),
                 (" = 1,2 g·L⁻¹.", {})]],
               etiquette="PROPRIÉTÉ — COMPOSITION DE L'AIR", fiche=True)
    e = exercice(s, seq, i, 3, 0.9, bas(d), 20.4, 4, "Composition de l'air",
                 contexte=[Par("1 — L'air est-il un mélange ou un corps pur ? "
                               "Justifier.", italique=True)],
                 question="2 — Classer chaque espèce chimique composant l'air "
                          "selon qu'il s'agisse d'un corps pur simple ou "
                          "composé.")
    exercice(s, seq, i, 4, 0.9, bas(e), 20.4, 5, "Composition en volume",
             donnees="Données : relation de la composition volumique %V · "
                     "%Ar = 0,93 %",
             question="Quel volume d'argon trouve-t-on dans 1000 m³ d'air ?")

    # ======================================================= 05 — SOLUBILITÉ
    # Audit du 22/09 : cadre de définition moins large, page rééquilibrée —
    # l'exercice 6 vient la compléter ; l'exercice 7 a sa propre diapositive
    # pour que la courbe se lise au fond de la salle.
    s, i = page("05", "Solubilité", "dissolution · saturation")
    d = encart(s, seq, i, 1, "definition", 0.9, 2.8, 15.8, None,
               [[("La ", {}), terme("solubilité"),
                 (", notée s, d'une espèce chimique est la masse maximale de "
                  "cette espèce que l'on peut dissoudre dans un volume donné "
                  "d'une autre espèce chimique liquide (ex : eau). Elle "
                  "s'exprime le plus souvent en g·L⁻¹.", {})]],
               etiquette="DÉFINITION — SOLUBILITÉ", fiche=True)
    formule_frac(s, i, 2, "s =", [[("m", {}), ("max", {"ind": True})]], "V",
                 None,
                 [[("s", {"gras": True}), ("  solubilité · g·L⁻¹", {})],
                  [("m", {"gras": True}), ("max", {"gras": True, "ind": True}),
                   ("  masse maximale · g", {})],
                  [("V", {"gras": True}), ("  volume de solvant · L", {})]],
                 x=0.9, y=bas(d, 1.0), w=15.8, h=4.0, wf=2.4)
    f = image(s, i, 3, "t1c1-dissolution-saturation.jpg", 17.5, 2.9, 15.5,
              "Image 9 — Au-delà de la solubilité, un dépôt apparaît : la "
              "solution est saturée, le mélange redevient hétérogène.")
    fiche_sur(s, i, 3, f)
    exercice(s, seq, i, 4, 0.9, 13.0, 32.1, 6, "Saturer une bouteille",
             contexte="À 0 °C, la solubilité du sel dans l'eau est "
                      "s = 347 g·L⁻¹.",
             question="Quelle masse de sel peut-on introduire dans une "
                      "bouteille de 1,5 L avant d'atteindre la saturation ?")

    s, i = page("05", "Solubilité", "lire une solubilité dans un document")
    y = 2.8
    exercice_doc(s, i, 1, "EXERCICE 7 — LIRE UNE SOLUBILITÉ DANS UN DOCUMENT",
                 [[("Quelle masse de diazote (N₂) peut-on introduire au "
                    "maximum dans 500 mL d'eau à 35 °C ?", Q)]],
                 0.9, y, 32.1, 17.1 - y, 31.0)
    tableau(s, i, 1,
            [["Gaz", [("s (mg·L⁻¹)", {})]],
             ["N₂", "23,2"], ["O₂", "54,3"], ["CO₂", "2 318"],
             ["H₂S", "5 112"], ["CH₄", "32,5"], ["H₂", "1,6"]],
            1.8, 5.0, 11.4, 1.0, taille=16)
    z = _texte(s, 1.8, 5.0 + 7 * 1.0 + 0.3, 11.4, 0.9,
               "Image 10 — Solubilité de quelques gaz dans l'eau à 10 °C",
               taille=10, police=MONO, couleur=GRIS)
    seq.marque(i, 1, z)
    fig(s, i, 1, "t1c1f11", 14.8, 4.8, 17.0,
        "Image 11 — Solubilité du diazote dans l'eau selon la température.")

    # =========================================== 06 — MASSE VOLUMIQUE / DENSITÉ
    # Audit du 22/09 : page équilibrée — l'exercice 9, qui applique ρ = m/V,
    # vient s'y loger.
    s, i = page("06", "Masse volumique et densité", "la masse volumique ρ")
    d = encart(s, seq, i, 1, "definition", 0.9, 2.8, 18.0, None,
               [[("La ", {}), terme("masse volumique"),
                 (" ρ d'un corps est le rapport de la masse de ce corps sur le "
                  "volume de ce corps.", {})]],
               etiquette="DÉFINITION — MASSE VOLUMIQUE", fiche=True)
    fo = bas(d, 1.0)
    formule_frac(s, i, 2, "ρ =", "m", "V", None,
                 [[("ρ", {"gras": True}), ("  masse volumique · g·cm⁻³", {})],
                  [("m", {"gras": True}), ("  masse · g", {})],
                  [("V", {"gras": True}), ("  volume · cm³", {})]],
                 x=0.9, y=fo, w=18.0, h=3.6, wf=2.2)
    image(s, i, 3, "t1c1-cube-eau-or.jpg", 19.6, 2.9, 13.4,
          "Image 12 — Même volume, masses très différentes : l'or a une "
          "densité de 19,3.")
    z = _texte(s, 0.9, fo + 4.1, 18.0, 1.6,
               [[("Un litre d'eau pèse 1 kg", {"gras": True}),
                 (" : cette valeur est à connaître, et elle sert de référence "
                  "à toutes les autres.", {})]], taille=16)
    seq.marque(i, 4, z)
    exercice(s, seq, i, 5, 0.9, 13.0, 32.1, 9, "La masse d'une dalle de béton",
             donnees="Donnée : ρ(béton) = 2,4 g·cm⁻³",
             question="Quelle est la masse de 3 m³ de béton ?")

    # Audit du 22/09 : la formule de la densité allégée — les deux références
    # sortent du panneau — et une application vient l'ancrer.
    s, i = page("06", "Masse volumique et densité", "la densité d")
    d = encart(s, seq, i, 1, "definition", 0.9, 2.8, 18.2, None,
               [[("La ", {}), terme("densité"),
                 (" d d'une espèce chimique est le rapport de sa masse "
                  "volumique par une masse volumique de référence. La densité "
                  "est un nombre sans unité.", {})]],
               etiquette="DÉFINITION — DENSITÉ", fiche=True)
    formule_frac(s, i, 2, "d =", "ρ", [[("ρ", {}), ("réf", {"ind": True})]],
                 None,
                 [[("d", {"gras": True}), ("  densité · sans unité", {})],
                  [("ρ", {"gras": True}), ("  masse volumique de l'espèce", {})],
                  [("ρ", {"gras": True}), ("réf", {"gras": True, "ind": True}),
                   ("  masse volumique de référence", {})]],
                 x=0.9, y=bas(d, 1.0), w=18.2, h=3.6, wf=2.4)
    fig(s, i, 5, "t1c1f13", 19.9, 2.9, 13.1,
        "Image 13 — La masse volumique, donc la densité, diminue "
        "généralement quand la température augmente.")
    r = encart(s, seq, i, 3, "notation", 0.9, 12.3, 15.6, None,
               [[("Liquide ou solide : ", {}), ("ρ", {"italique": True}),
                 ("réf", {"ind": True}), (" = ", {}), ("ρ", {"italique": True}),
                 ("eau", {"ind": True}), (" = 1 g·cm⁻³", {})],
                [("Gaz : ", {}), ("ρ", {"italique": True}),
                 ("réf", {"ind": True}), (" = ", {}), ("ρ", {"italique": True}),
                 ("air", {"ind": True}), (" ≈ 1,2 g·L⁻¹", {})]],
               etiquette="LES DEUX RÉFÉRENCES")
    # PROPOSITION À VALIDER — l'application reprend l'or de l'Image 12
    encart(s, seq, i, 4, "exemple", 17.4, 12.3, 15.6, r.height / 360000,
           [[("L'or : ρ", {}), ("or", {"ind": True}),
             (" = 19,3 g·cm⁻³, donc d = 19,3. ", {}),
             ("Un volume d'or est 19,3 fois plus lourd que le même volume "
              "d'eau.", {"italique": True})]],
           etiquette="APPLICATION")

    s, i = page("06", "Masse volumique et densité", "exploiter une mesure")
    exercice(s, seq, i, 1, 3.4, 2.8, 27.0, 8, "Exploiter une mesure",
             fig=(figs / "site-t1c1f14.png", RATIO["t1c1f14"], 11.0),
             donnees="Données : ρ(eau) = 1,00 g·cm⁻³ · 1 mL = 1 cm³ · "
                     "Image 14 : mesure de la masse volumique de l'huile",
             question="Calculer la masse volumique de l'huile à l'aide du "
                      "montage, puis en déduire sa densité.")

    # ============================================ 07 — IDENTIFIER UNE ESPÈCE
    # Audit du 22/09 : l'Image 15 presque en pleine page, le texte dessous —
    # elle est commentée avec la classe.
    s, i = page("07", "Identifier une espèce chimique", "trois voies")
    w = 21.0
    f = image(s, i, 1, "t1c1-identification-carte.jpg", (33.87 - w) / 2, 2.9,
              w, "Image 15 — Les trois grandes voies d'identification d'une "
                 "espèce chimique.")
    fiche_sur(s, i, 1, f)
    z = _texte(s, 0.9, 2.9 + w * SEIZE_NEUVIEMES + 0.95, 32.1, 1.8,
               [[("Comparer ses propriétés physiques à des valeurs de "
                  "référence, réaliser des tests chimiques, observer ses "
                  "aspects physiques : ", {}),
                 ("aucune voie ne suffit seule, c'est leur faisceau qui "
                  "identifie l'espèce.", {"italique": True, "couleur": BETA})]],
               taille=15, align=PP_ALIGN.CENTER)
    seq.marque(i, 2, z)

    s, i = page("07", "Identifier une espèce chimique",
                "A — les tests d'espèces chimiques")
    image(s, i, 1, "t1c1-test-flamme.jpg", 0.9, 2.9, 15.6,
          "Image 16 — Test du dihydrogène : approché d'une flamme, H₂ produit "
          "une détonation.")
    image(s, i, 2, "t1c1-sulfate-cuivre.jpg", 17.4, 2.9, 15.6,
          "Image 17 — Test de l'eau : le sulfate de cuivre anhydre, blanc, "
          "bleuit en présence d'eau.")
    img = s.shapes.add_picture(str(IMG / "t1c1-eau-de-chaux.jpg"), cm(0.9),
                               cm(13.5), height=cm(3.5))
    seq.marque(i, 3, img)
    z = _texte(s, 7.2, 13.5, 25.8, 3.6,
               [[("Image 18 — Test à l'eau de chaux : elle se trouble en "
                  "présence de dioxyde de carbone.",
                  {"police": MONO, "taille": 11, "couleur": GRIS})],
                "Le dioxyde de carbone trouble l'eau de chaux ; le dioxygène "
                "rallume une bûchette incandescente."],
               taille=16, interligne=1.15, espacement=8)
    seq.marque(i, 3, z)

    # Audit du 22/09 : l'exercice 10 rejoint les tests des ions.
    s, i = page("07", "Identifier une espèce chimique",
                "B — les tests des ions · s'exercer")
    f = image(s, i, 1, "t1c1-tests-ions.jpg", 0.9, 2.9, 18.6,
              "Image 19 — Principaux tests de précipitation pour "
              "l'identification des ions en solution.")
    fiche_sur(s, i, 1, f)
    z = _texte(s, 20.4, 2.8, 12.6, 3.4,
               ["On ajoute un réactif : l'ion cherché forme un précipité — un "
                "solide qui apparaît dans la solution.",
                [("C'est la couleur du précipité qui signe la présence de "
                  "l'ion.", {"italique": True, "couleur": BETA})]],
               taille=15, interligne=1.1, espacement=6)
    seq.marque(i, 2, z)
    exercice(s, seq, i, 3, 20.4, 7.0, 12.6, 10, "Un liquide inconnu",
             contexte="Vous avez fait subir à un liquide inconnu plusieurs "
                      "tests. Le test à la flamme a été négatif, les tests à "
                      "l'eau de chaux et au sulfate de cuivre anhydre ont été "
                      "positifs. Enfin, le test au nitrate d'argent a donné "
                      "un précipité blanc.",
             question="Identifier ce liquide.")

    # ============================================================= CHECKLIST
    s, i = page("✓", "Pour le DS, je sais", "les neuf compétences du chapitre")
    checklist(s, seq, i, "", [
        "Utiliser le terme adapté parmi molécule, atome, anion et cation pour "
        "qualifier une entité chimique à partir d'une formule chimique donnée.",
        "Reconnaître et citer des exemples courants de corps purs et de "
        "mélanges homogènes et hétérogènes.",
        "Citer la composition approchée de l'air et l'ordre de grandeur de la "
        "valeur de sa masse volumique.",
        "Connaître la notion de composition massique et volumique et maîtriser "
        "les applications numériques associées.",
        "Connaître la notion de solubilité et maîtriser les applications "
        "numériques associées.",
        "Citer la valeur de la masse volumique de l'eau liquide et la comparer "
        "à celles d'autres corps purs et mélanges.",
        "Maîtriser la formule utilisée pour calculer une densité ou une masse "
        "volumique.",
        "Citer des tests chimiques courants de présence d'eau, de dihydrogène, "
        "de dioxygène, de dioxyde de carbone.",
        "Identifier, à partir de valeurs de référence, une espèce chimique par "
        "ses températures de changement d'état, sa masse volumique ou par des "
        "tests chimiques.",
    ], kahoots=[
        ("bilan du chapitre",
         "https://create.kahoot.it/share/bilan-la-matiere-a-l-echelle-"
         "macroscopique/51baee15-66f1-4e4a-b9da-5f53d4cadab0"),
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
            "usage : python3 diapo_t1c1.py <dossier-des-figures>\n"
            "  produire d'abord les figures :\n"
            "  node extraire_figures.mjs ../../pages/2nde-pc-t1-c1-"
            "matiere-macroscopique.html <dossier>")
    construire(figs)
