#!/usr/bin/env python3
"""
diapo_t1c4.py — contenu du diaporama de projection du chapitre T1-C4.

Ce fichier ne contient QUE ce qui est propre au chapitre. Toute la charte et
tous les composants viennent de `gabarit_diapo.py`.

USAGE
    python diapo_t1c4.py <dossier-des-figures>

    Produit assets/pptx/pc/diaporama-2nde-t1c4.pptx

FIGURES — 🔴 `extraire_figures.mjs` ne voit RIEN sur cette page : il ne
retient que les SVG qui portent un `aria-labelledby`, et les trois SVG en
ligne de T1-C4 (le cristal, les « paquets », la case du tableau) n'en ont
pas. Plutôt que de toucher à la page ou à l'outil commun, ce script extrait
lui-même ses figures, par la même méthode : chaque SVG isolé dans une page
de rendu, polices du site chargées, fond transparent, à 3×. Il y ajoute les
SVG de fichier (modèles moléculaires, modèle de Bohr) — python-pptx ne pose
pas de SVG. La page reste la seule source : l'extraction se rejoue à chaque
génération.

STRUCTURE — celle du site : I · II · III = les parties 01 · 02 · 03 de la
page, avec leurs sous-parties A à D. Le site ne numérote pas ses images :
le diaporama non plus (règle R6).

ANALOGIE DU PANIER DE POMMES — PROPOSITION du 12/11/2026, non validée par
Loïc. Elle est projetée telle qu'en ligne : si elle tombe, elle tombe ici
aussi (trois encarts, diapositives III.A, III.B et III.D).

🔴 AUCUNE CORRECTION À L'ÉCRAN. Les énoncés apparaissent, jamais les
réponses : elles vivent en ligne, derrière le code de déblocage.
"""

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from gabarit_diapo import (          # noqa: E402
    ALPHA, BETA, BLANC, ENCRE, GAMMA, GRIS, MONO, CORPS, OCRE, PAPIER, TITRES,
    Par, Sequence, bandeau, bas, checklist, cm, diapo, diapo_titre, encart,
    eq, exercice, figure, formule, fraction, hauteur_encart, hauteur_exercice,
    picto_fiche, pied, presentation, terme, titre_partie, _avance, _cadre,
    _riche, _sans_trait, _texte,
)
from pptx.dml.color import RGBColor   # noqa: E402
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN   # noqa: E402

from animer import controler, minuter   # noqa: E402

RACINE = Path(__file__).resolve().parents[2]
PAGE = RACINE / "pages" / "2nde-pc-t1-c4-denombrer-les-entites.html"
IMG = RACINE / "assets" / "img" / "pc" / "2nde-pc-t1-c4"
SORTIE = RACINE / "assets" / "pptx" / "pc" / "diaporama-2nde-t1c4.pptx"

CHAPITRE = "Thème 1 · Chapitre 4 — Dénombrer les entités"
ANNEE = "2026 / 2027"

# SVG en ligne de la page, repérés par leur viewBox (ils n'ont pas d'id)
EN_LIGNE = {"cristal": "0 0 560 400", "paquets": "0 0 620 280",
            "case": "0 0 420 260"}
# SVG de fichier, posés tels quels sur le site
FICHIERS = {"eau": IMG / "t1c4-eau-3d.svg", "sulfate": IMG / "t1c4-sulfate-3d.svg",
            "ethanol": IMG / "t1c4-ethanol-3d.svg",
            "cyclohexane": IMG / "t1c4-cyclohexane-3d.svg",
            "bohr": RACINE / "assets" / "img" / "pc" / "2nde-pc-t1-c3"
                    / "t1c3-fig-modele-bohr.svg"}
RATIO = {"cristal": 400 / 560, "paquets": 280 / 620, "case": 260 / 420,
         "eau": 260 / 360, "sulfate": 270 / 360, "ethanol": 300 / 420,
         "cyclohexane": 300 / 420, "bohr": 480 / 1000}
PHOTO = {"neon": ("t1c4-neon-tube.jpg", 601 / 900),
         "adn": ("t1c4-adn-fixe.png", 300 / 160),      # l'image FIXE du GIF
         "halite": ("t1c4-halite.jpg", 852 / 900),
         "dopamine": ("t1c4-dopamine.jpg", 1.0),
         "avogadro": ("t1c4-avogadro.jpg", 847 / 700),
         "or": ("t1c4-or-lingots.jpg", 300 / 400),
         "feuille": ("t1c4-feuille.jpg", 408 / 700)}

Q = {"italique": True}
DON = {"police": MONO, "taille": 12}
VERT = RGBColor(0x4C, 0x8A, 0x58)
STYLE_GRILLE = "{5940675A-B579-460E-94D1-54222C63F5DA}"


# ------------------------------------------------------------ extraction

def extraire(dossier):
    """Les figures du site en PNG transparents, à 3×, polices du site."""
    from playwright.sync_api import sync_playwright
    dossier.mkdir(parents=True, exist_ok=True)
    src = PAGE.read_text(encoding="utf-8")
    blocs = []
    for cle, vb in EN_LIGNE.items():
        m = re.search(r'<svg viewBox="' + re.escape(vb) + r'"[\s\S]*?</svg>', src)
        if not m:
            raise SystemExit(f"figure introuvable dans la page : {cle} ({vb})")
        w, h = (float(v) for v in vb.split()[2:])
        svg = m.group(0).replace("<svg ", f'<svg width="{w * 3:.0f}" '
                                          f'height="{h * 3:.0f}" ', 1)
        blocs.append((cle, w * 3, h * 3, svg))
    for cle, chemin in FICHIERS.items():
        vb = re.search(r'viewBox="([^"]+)"',
                       chemin.read_text(encoding="utf-8")).group(1)
        w, h = (float(v) for v in vb.split()[2:])
        k = 2000 / w if w > 700 else 3
        blocs.append((cle, w * k, h * k,
                      f'<img src="{chemin.as_uri()}" width="{w * k:.0f}" '
                      f'height="{h * k:.0f}">'))
    fonts = (RACINE / "assets" / "css" / "fonts.css").as_uri()
    html = ("<!DOCTYPE html><html><head><meta charset='UTF-8'>"
            f"<link rel='stylesheet' href='{fonts}'><style>"
            "html,body{margin:0;background:transparent;"
            "font-family:'Spectral',Georgia,serif;color:#141a26}"
            ".f{display:block;margin:0}.f>*{display:block}</style></head><body>"
            + "".join(f'<div class="f" id="f-{c}" style="width:{w:.0f}px;'
                      f'height:{h:.0f}px">{s}</div>' for c, w, h, s in blocs)
            + "</body></html>")
    rendu = dossier / "_rendu.html"
    rendu.write_text(html, encoding="utf-8")
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 2400, "height": 1600})
        pg.goto(rendu.as_uri())
        pg.wait_for_timeout(1500)
        for cle, *_ in blocs:
            pg.locator(f"#f-{cle}").screenshot(
                path=str(dossier / f"site-{cle}.png"), omit_background=True)
            print(f"  ✓ site-{cle}.png")
        b.close()


# ------------------------------------------------------------ construction

def construire(dossier_figs):
    figs = Path(dossier_figs)
    if not all((figs / f"site-{c}.png").exists() for c in RATIO):
        extraire(figs)
    prs = presentation()
    seq = Sequence()
    n = 0

    def page(romain, partie, sous=""):
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

    def photo(s, i, rang, cle, x, y, h=None, w=None):
        nom, r = PHOTO[cle]
        if h is not None:
            w = h / r
        img = s.shapes.add_picture(str(IMG / nom), cm(x), cm(y), width=cm(w),
                                   height=cm(w * r))
        seq.marque(i, rang, img)
        return img

    def legende(s, i, rang, x, y, w, texte, h=1.2, align=PP_ALIGN.CENTER):
        z = _texte(s, x, y, w, h, texte, taille=10, police=MONO, couleur=GRIS,
                   align=align, interligne=1.1)
        seq.marque(i, rang, z)
        return z

    def texte(s, i, rang, x, y, w, h, corps, taille=16, **k):
        z = _texte(s, x, y, w, h, corps, taille=taille, interligne=1.15,
                   espacement=6, **k)
        seq.marque(i, rang, z)
        return z

    def ligne_frac(s, i, rang, xc, y, morceaux, taille=20, couleur=ENCRE):
        """Une ligne de calcul où chaque fraction est numérateur SUR
        dénominateur (R3), centrée sur xc. `morceaux` : chaînes et couples
        (haut, bas). Rend la largeur totale."""
        av = _avance(TITRES, taille) * 1.04

        def larg(m):
            if isinstance(m, tuple):
                return max(len(m[0]), len(m[1])) * av + 0.5
            return len(m) * av + 0.15
        total = sum(larg(m) for m in morceaux)
        x = xc - total / 2
        for m in morceaux:
            w = larg(m)
            if isinstance(m, tuple):
                for txt, dy in ((m[0], 0.0), (m[1], 1.05)):
                    z = _texte(s, x, y + dy, w, 0.85, txt, taille=taille,
                               police=TITRES, couleur=couleur, italique=True,
                               align=PP_ALIGN.CENTER)
                    z.text_frame.word_wrap = False
                    seq.marque(i, rang, z)
                t = _sans_trait(_cadre(s, x + 0.1, y + 0.92, w - 0.2, 0.045))
                t.fill.solid()
                t.fill.fore_color.rgb = couleur
                seq.marque(i, rang, t)
            else:
                z = _texte(s, x, y + 0.55, w, 0.85, m, taille=taille,
                           police=TITRES, couleur=couleur, italique=True,
                           align=PP_ALIGN.CENTER)
                z.text_frame.word_wrap = False
                seq.marque(i, rang, z)
            x += w
        return total

    def formule_frac(s, i, rang, gauche, haut, bas_, grandeurs, x, y, w,
                     h=3.6, wf=2.8):
        """Panneau formule dont l'expression est une VRAIE fraction (R3)."""
        formule(s, seq, i, rang, [""], grandeurs, x, y, w, h)
        xf = x + w * 0.24
        yf = y + (h - 1.95) / 2
        fraction(s, seq, i, rang, gauche, haut, bas_, xf, yf, wf,
                 couleur=PAPIER)
        picto_fiche(s, seq, i, rang, x + w - 1.1, y - 0.55)

    def tableau(s, i, rang, lignes, x, y, w, h_ligne, taille=14):
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
                cell.margin_top = cell.margin_bottom = cm(0.04)
                p = cell.text_frame.paragraphs[0]
                p.alignment = PP_ALIGN.CENTER
                _riche(p, val, taille, TITRES if r else CORPS, ENCRE, r == 0,
                       False)
        seq.marque(i, rang, gf)
        return gf

    def x_(base, e):        # exposant
        return [(base, {}), (e, {"exp": True})]

    def i_(base, b, **o):   # indice
        return [(base, dict(o)), (b, dict(o, ind=True))]

    def eti(t, c=GRIS):
        return (t, {"police": MONO, "taille": 10, "gras": True, "couleur": c})

    # ================================================================ TITRE
    diapo_titre(
        prs, seq,
        "THÈME 1 · CONSTITUTION ET TRANSFORMATIONS DE LA MATIÈRE",
        "Chapitre 4 — Dénombrer les entités",
        "Impossible de compter les entités une par une : le chimiste les pèse.",
        ANNEE, fond=None,
        logo=RACINE / "assets" / "img" / "logo-isaac-lycee.png")
    n += 1

    # ================================== I — CONSTITUTION DE LA MATIÈRE
    s = diapo(prs)
    titre_partie(s, seq, len(prs.slides) - 1, "I", "Constitution de la matière",
                 ["A — Électroneutralité", "B — Structures"])
    n += 1

    # --- I.A · électroneutralité + cristal -------------------------------
    s, i = page("I", "Constitution de la matière", "A — Électroneutralité")
    z = texte(s, i, 1, 0.9, 2.6, 17.4, 2.0,
              "À l'échelle microscopique, la matière est constituée d'entités "
              "chimiques électriquement neutres, comme les atomes ou les "
              "molécules, ou chargées électriquement, comme les ions.")
    d = encart(s, seq, i, 2, "definition", 0.9, bas(z, 0.35), 17.4, None,
               [[("À l'échelle macroscopique, la matière est le plus souvent "
                  "électriquement neutre. On parle alors d'", {}),
                 terme("électroneutralité de la matière"), (".", {})]],
               etiquette="DÉFINITION — ÉLECTRONEUTRALITÉ", fiche=True)
    ex = encart(s, seq, i, 3, "exemple", 0.9, bas(d), 17.4, 3.4,
                [[("Dans la structure cristalline du sel (NaCl), on trouve "
                   "autant d'ions sodium Na", {}), ("+", {"exp": True}),
                  (" que d'ions chlorure Cl", {}), ("−", {"exp": True}),
                  (" pour maintenir l'électroneutralité de l'ensemble.", {})]],
                etiquette="EXEMPLE DÉTAILLÉ — CRISTAL DE CHLORURE DE SODIUM")
    f = fig(s, i, 4, "cristal", 19.0, 2.6, 14.0)
    legende(s, i, 4, 19.0, bas(f, 0.1), 14.0,
            "Les ions Na⁺ et Cl⁻ alternent dans les trois directions de "
            "l'espace (de gauche à droite, de haut en bas, d'avant en "
            "arrière), en quantités égales.", h=1.4)
    exercice(s, seq, i, 5, 0.9, bas(ex), 17.4, 1, "Composés ioniques",
             contexte="Un composé ionique est électriquement neutre.",
             question=[("Comment se note le composé ionique dichlorure de "
                        "magnésium formé à partir des ions Cl", Q),
                       ("−", dict(Q, exp=True)), (" et Mg", Q),
                       ("2+", dict(Q, exp=True)),
                       (" ? Même question pour le sulfure d'aluminium formé "
                        "à partir des ions S", Q), ("2−", dict(Q, exp=True)),
                       (" et Al", Q), ("3+", dict(Q, exp=True)), (" ?", Q)])

    # --- I.B · structures + exercice 2 ------------------------------------
    s, i = page("I", "Constitution de la matière", "B — Structures")
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, 32.1, None,
               ["La matière peut adopter plusieurs types de structures, parmi "
                "lesquelles :",
                [("— une ", {}), terme("structure atomique"),
                 (", associée au symbole de l'élément chimique qui la "
                  "compose ;", {})],
                [("— une ", {}), terme("structure moléculaire"),
                 (", associée à la formule brute de la molécule qui la "
                  "compose ;", {})],
                [("— une ", {}), terme("structure ionique"),
                 (", associée à la formule d'un cristal associant des cations "
                  "et des anions.", {})]],
               etiquette="DÉFINITION — TROIS TYPES DE STRUCTURES", fiche=True)
    # l'exercice 2 : la question, puis les trois documents DANS le cadre (R7).
    # Les légendes nomment l'espèce, jamais sa structure : c'est la réponse.
    y0 = bas(d)
    q2 = [("Classer les espèces suivantes selon leur type de structure : le "
           "néon Ne, l'or Au, le saccharose C", Q), ("12", dict(Q, ind=True)),
          ("H", Q), ("22", dict(Q, ind=True)), ("O", Q),
          ("11", dict(Q, ind=True)),
          (", l'ADN, le sel de table NaCl, le sucre en morceaux.", Q)]
    h_img = 4.4
    hh = hauteur_exercice(32.1, question=q2) + h_img + 1.6
    exercice(s, seq, i, 2, 0.9, y0, 32.1, 2,
             "Associer chaque structure à sa catégorie", question=q2, h=hh)
    yi = y0 + hh - h_img - 1.6
    for cle, xc, leg in (
        ("neon", 6.6, "Le néon Ne s'illumine en rouge orangé dans un tube à "
                      "décharge.\nPhoto Alchemist-hp, Wikimedia Commons, "
                      "CC BY-NC-ND 3.0."),
        ("adn", 17.0, "Un fragment d'ADN, la double hélice.\nAnimation "
                      "Zephyris, Wikimedia Commons, CC BY-SA 3.0."),
        ("halite", 27.3, "Cristal de sel de table NaCl."),
    ):
        nom, r = PHOTO[cle]
        w = h_img / r
        photo(s, i, 2, cle, xc - w / 2, yi, h=h_img)
        lignes = leg.split("\n")
        corps_l = [lignes[0]] + [Par(c, taille=8) for c in lignes[1:]]
        legende(s, i, 2, xc - 5.1, yi + h_img + 0.12, 10.2, corps_l, h=1.3)

    # ================================================= II — MASSE
    s = diapo(prs)
    titre_partie(s, seq, len(prs.slides) - 1, "II", "Masse",
                 ["A — Rappel : masse atomique", "B — Masse des composés"])
    n += 1

    # --- II.A · rappel du chapitre 3 --------------------------------------
    s, i = page("II", "Masse", "A — Rappel : masse atomique")
    z = texte(s, i, 0, 0.9, 2.55, 32.1, 0.8,
              "Avant de peser des molécules, repesons un atome — c'est un "
              "rappel du chapitre 3, Constitution de l'atome.", taille=15,
              italique=True, couleur=GRIS)
    f = fig(s, i, 1, "bohr", 0.9, 3.6, 17.0)
    legende(s, i, 1, 0.9, bas(f, -0.35), 17.0,
            "Le modèle de Bohr, vu au chapitre 3 : un noyau (protons + "
            "neutrons) autour duquel les électrons occupent des couches.")
    z = texte(s, i, 2, 19.3, 3.6, 13.7, 1.2,
              "Les masses des particules composant l'atome :", taille=15)
    tab = tableau(s, i, 2, [
        ["Particule", "Masse (kg)"],
        ["Électron", x_("9,109 × 10", "−31")],
        ["Proton", x_("1,673 × 10", "−27")],
        ["Neutron", x_("1,675 × 10", "−27")]], 19.8, 4.6, 12.0, 0.95)
    texte(s, i, 3, 0.9, 13.1, 32.1, 3.6,
          [[("Un nucléon est plus de 1800 fois plus massif qu'un électron : ",
             {}), ("la masse d'un électron est négligeable", {"gras": True}),
            (" devant celle d'un nucléon. Et comme le proton et le neutron ont "
             "pratiquement la même masse, la masse d'un atome ne dépend que du "
             "nombre de ses nucléons, A — d'où son nom de ", {}),
            ("nombre de masse", {"gras": True}), (".", {})]], taille=16)

    # --- II.A · propriété + formule m = A × m_n ---------------------------
    s, i = page("II", "Masse", "A — Rappel : masse atomique")
    p = encart(s, seq, i, 1, "propriete", 0.9, 2.6, 32.1, None,
               [[("La masse d'un atome est la somme des masses de ses "
                  "constituants, c'est-à-dire de ses protons, de ses neutrons "
                  "et de ses électrons. Elle est de l'ordre de 10", {}),
                 ("−26", {"exp": True}), (" kg.", {})],
                "Cette masse peut être approximée à celle de son noyau."],
               etiquette="PROPRIÉTÉ — MASSE D'UN ATOME", fiche=True)
    z = texte(s, i, 2, 0.9, bas(p, 0.4), 32.1, 0.9,
              "La masse d'un atome se calcule donc grâce à la relation "
              "suivante :")
    yf = bas(z, 0.75)
    formule(s, seq, i, 2,
            [[("m", Q), (" = ", {}), ("A", Q), (" × ", {}),
              ("m", Q), ("n", dict(Q, ind=True))]],
            [[("m", {"gras": True}), ("  masse de l'atome · kg", {})],
             [("A", {"gras": True}), ("  nombre de masse (nombre de "
                                      "nucléons) · —", {})],
             [("m", {"gras": True}), ("n", {"gras": True, "ind": True}),
              ("  masse d'un nucléon · kg", {})],
             [("m", {}), ("n", {"ind": True}), (" = 1,67 × 10", {}),
              ("−27", {"exp": True}), (" kg", {})]],
            x=3.2, y=yf, w=27.4, h=4.4)
    picto_fiche(s, seq, i, 2, 29.5, yf - 0.55)
    encart(s, seq, i, 3, "notation", 0.9, yf + 4.4 + 0.55, 32.1, None,
           [[("L'unité de masse atomique (u) est très utilisée en physique "
              "atomique et nucléaire : 1 u = 1,66053907 × 10", {}),
             ("−27", {"exp": True}), (" kg.", {})]],
           etiquette="REMARQUE — UNITÉ DE MASSE ATOMIQUE")

    # --- II.B · masse des composés ----------------------------------------
    s, i = page("II", "Masse", "B — Masse des composés")
    p = encart(s, seq, i, 1, "propriete", 0.9, 2.6, 32.1, None,
               ["La masse d'un composé chimique est la somme des masses "
                "atomiques des éléments chimiques qui le composent."],
               etiquette="PROPRIÉTÉ — MASSE D'UN COMPOSÉ", fiche=True)
    y0 = bas(p, 0.4)
    y_eq = y0 + 0.6 + 9.4 * max(RATIO["eau"], RATIO["sulfate"]) + 0.1 + 2.55
    MI = {"police": TITRES, "italique": True, "taille": 19}
    for k, (cle, titre_, w, txt, form) in enumerate((
        ("eau", "MOLÉCULE D'EAU", 9.4,
         [("La masse d'une molécule d'eau H", {}), ("2", {"ind": True}),
          ("O est la somme des masses atomiques de deux atomes d'hydrogène "
           "et d'un atome d'oxygène.", {})],
         [("m", MI), ("H₂O", dict(MI, ind=True)), (" = 2 × m", MI),
          ("H", dict(MI, ind=True)), (" + m", MI), ("O", dict(MI, ind=True))]),
        ("sulfate", "ION SULFATE", 9.4,
         [("La masse d'un ion sulfate SO", {}), ("4", {"ind": True}),
          ("2−", {"exp": True}),
          (" est la somme des masses atomiques d'un atome de soufre et de "
           "quatre atomes d'oxygène. On néglige les deux électrons portant "
           "les charges.", {})],
         [("m", MI), ("SO₄²⁻", dict(MI, ind=True)), (" ≈ m", MI),
          ("S", dict(MI, ind=True)), (" + 4 × m", MI),
          ("O", dict(MI, ind=True))]),
    )):
        x0 = 0.9 + k * 16.25
        z = _texte(s, x0, y0, 15.85, 0.5, titre_, taille=10, police=MONO,
                   couleur=ALPHA, gras=True)
        seq.marque(i, 2 + k, z)
        f = fig(s, i, 2 + k, cle, x0 + (15.85 - w) / 2, y0 + 0.6, w)
        z = texte(s, i, 2 + k, x0, bas(f, 0.1), 15.85, 2.6, [txt], taille=14)
        z = _texte(s, x0, y_eq, 15.85, 1.0, [form], taille=19,
                   police=TITRES, align=PP_ALIGN.CENTER)
        seq.marque(i, 2 + k, z)

    # --- II.B · exercice 3 -------------------------------------------------
    s, i = page("II", "Masse", "B — Masse des composés")
    don3 = [("Données — masses atomiques : m", DON), ("H", dict(DON, ind=True)),
            (" = 1,67 × 10", DON), ("−27", dict(DON, exp=True)),
            (" kg · m", DON), ("C", dict(DON, ind=True)),
            (" = 1,99 × 10", DON), ("−26", dict(DON, exp=True)),
            (" kg · m", DON), ("N", dict(DON, ind=True)),
            (" = 2,33 × 10", DON), ("−26", dict(DON, exp=True)),
            (" kg · m", DON), ("O", dict(DON, ind=True)),
            (" = 2,66 × 10", DON), ("−26", dict(DON, exp=True)), (" kg", DON)]
    exercice(s, seq, i, 1, 3.5, 2.8, 26.9, 3, "Masse de la dopamine",
             contexte=[[("La dopamine est un neurotransmetteur de formule "
                         "brute C", {}), ("8", {"ind": True}), ("H", {}),
                        ("11", {"ind": True}), ("NO", {}),
                        ("2", {"ind": True}), (".", {})]],
             fig=(IMG / PHOTO["dopamine"][0], 1.0, 7.0),
             donnees=don3,
             question="Calculer la masse d'une molécule de dopamine.")

    # ===================================== III — QUANTITÉ DE MATIÈRE
    s = diapo(prs)
    titre_partie(s, seq, len(prs.slides) - 1, "III", "Quantité de matière",
                 ["A — Nombre d'entités", "B — La mole",
                  "C — La masse molaire",
                  "D — Relation entre quantité de matière, masse et masse "
                  "molaire"])
    n += 1

    # --- III.A · le panier, puis N = m_éch / m_ent ------------------------
    s, i = page("III", "Quantité de matière", "A — Nombre d'entités")
    z = texte(s, i, 1, 0.9, 2.6, 32.1, 1.6,
              "La détermination du nombre d'entités microscopiques dans un "
              "échantillon macroscopique ne peut se faire en les comptant une "
              "par une, mais par un calcul basé sur la mesure de la masse de "
              "l'échantillon.")
    ya = bas(z, 0.3)
    ha = 5.5
    encart(s, seq, i, 2, "exemple", 0.9, ya, 32.1, ha,
           ["Un panier de pommes pèse 5,4 kg. Pour savoir combien il contient "
            "de pommes, inutile de vider le panier : une pomme pèse environ "
            "150 g, soit 0,150 kg, il suffit de diviser."],
           etiquette="🍎 ANALOGIE — LE PANIER DE POMMES")
    ligne_frac(s, i, 2, 16.95, ya + 2.05,
               ["nombre de pommes =", ("masse du panier", "masse d'une pomme"),
                "=", ("5,4", "0,150"), "= 36"])
    texte(s, i, 2, 1.35, ya + 4.35, 31.2, 1.6,
          "Le chimiste fait exactement la même chose : il pèse l'échantillon "
          "et divise par la masse d'une entité. La balance remplace le "
          "comptage.", taille=15)
    formule_frac(s, i, 3, "N =",
                 [[("m", {}), ("éch", {"ind": True})]],
                 [[("m", {}), ("ent", {"ind": True})]],
                 [[("N", {"gras": True}), ("  nombre d'entités · —", {})],
                  [("m", {"gras": True}), ("éch", {"gras": True, "ind": True}),
                   ("  masse de l'échantillon · kg", {})],
                  [("m", {"gras": True}), ("ent", {"gras": True, "ind": True}),
                   ("  masse d'une entité · kg", {})]],
                 x=3.2, y=ya + ha + 0.75, w=27.4, h=3.6)

    # --- III.A · exercice 4 -----------------------------------------------
    s, i = page("III", "Quantité de matière", "A — Nombre d'entités")
    exercice(s, seq, i, 1, 3.5, 2.8, 26.9, 4,
             "Atomes dans un rouleau d'aluminium",
             contexte=[[("Un rouleau de papier aluminium "
                         "(200 m × 45 cm × 11 µm) a une masse de 2,67 kg. "
                         "L'aluminium est présent dans la nature uniquement "
                         "sous la forme d'aluminium 27 (noyaux ", {}),
                        ("27", {"exp": True}), ("13", {"ind": True}),
                        ("Al).", {})]],
             donnees=[("Données : m", DON), ("n", dict(DON, ind=True)),
                      (" = 1,67 × 10", DON), ("−27", dict(DON, exp=True)),
                      (" kg", DON)],
             question="Calculer le nombre d'atomes d'aluminium constituant "
                      "ce rouleau.")

    # --- III.B · la mole ---------------------------------------------------
    s, i = page("III", "Quantité de matière", "B — La mole")
    z = texte(s, i, 1, 0.9, 2.6, 32.1, 2.4,
              "Pour manipuler des éléments chimiques (quelques grammes), il "
              "faudrait en utiliser un très grand nombre étant donné leur "
              "taille (plusieurs milliards de milliards). Une unité de "
              "quantité de matière a été créée : la mole, de symbole mol. Une "
              "mole de matière correspond à une quantité de matière qui peut "
              "être manipulée lors d'une expérience en chimie.", taille=15)
    NA = {"police": TITRES, "taille": 20, "italique": True}
    d = encart(s, seq, i, 2, "definition", 0.9, bas(z, 0.35), 32.1, None,
               [[("Une mole de matière correspond à un nombre d'atomes, de "
                  "molécules ou d'ions donné par le ", {}),
                 terme("nombre d'Avogadro"),
                 (" : une mole contient 6,02 × 10", {}), ("23", {"exp": True}),
                 (" entités. La ", {}), terme("constante d'Avogadro"),
                 (" N", {}), ("A", {"ind": True}),
                 (" exprime ce nombre d'entités par mole :", {})],
                eq([("N", NA), ("A", dict(NA, ind=True)),
                    (" = 6,02 × 10", NA), ("23", dict(NA, exp=True)),
                    (" mol", NA), ("−1", dict(NA, exp=True))], 20),
                [("Ce nombre correspond au nombre d'atomes de carbone "
                  "contenus dans 12 g de carbone 12.", {})]],
               etiquette="DÉFINITION — LA MOLE", fiche=True)
    yp = bas(d, 0.2)
    wp = min(20.0, (17.2 - yp) / RATIO["paquets"])
    f = fig(s, i, 3, "paquets", 0.9 + (32.1 - wp) / 2, yp, wp)

    # --- III.B · Avogadro ---------------------------------------------------
    s, i = page("III", "Quantité de matière", "B — La mole")
    ph = photo(s, i, 1, "avogadro", 0.9, 2.8, h=11.0)
    legende(s, i, 1, 0.9, bas(ph, 0.1), 9.1,
            "Portrait d'Amedeo Avogadro (1776–1856) — gravure du XIXᵉ siècle, "
            "domaine public, Wikimedia Commons.", h=1.6,
            align=PP_ALIGN.LEFT)
    texte(s, i, 1, 11.2, 3.2, 21.8, 9.0,
          [[("HISTOIRE DES SCIENCES", {"police": MONO, "taille": 11,
                                       "gras": True,
                                       "couleur": RGBColor(0x8A, 0x6A, 0x3A)})],
           Par("Amedeo Avogadro (1776–1856), physicien italien", taille=22,
               police=TITRES),
           "C'est en l'honneur d'Avogadro que la constante reliant l'échelle "
           "microscopique à l'échelle macroscopique porte son nom.",
           "Il énonça en 1811 l'hypothèse selon laquelle des volumes égaux de "
           "gaz différents, dans les mêmes conditions de température et de "
           "pression, contiennent le même nombre de molécules."],
          taille=17)

    # --- III.B · douzaines, n = N / N_A, proportionnalité, exercice 5 -------
    s, i = page("III", "Quantité de matière", "B — La mole")
    wg = 16.4
    corps_d = ["Revenons à nos 36 pommes. Le marchand ne les compte pas une à "
               "une : il les compte par douzaines.",
               Par([eti("1 douzaine     "), ("12 pommes", {})], avant=2),
               Par([eti("2 douzaines    "), ("2 × 12 = 24 pommes", {})]),
               Par([eti("3 douzaines    "), ("3 × 12 = 36 pommes", {})]),
               "Pour passer du nombre de pommes au nombre de douzaines, on "
               "divise par 12 : 36 ÷ 12 = 3 douzaines.",
               [("La mole est la « douzaine » du chimiste, et la constante "
                 "d'Avogadro remplace le 12 : 1 mol contient N", {}),
                ("A", {"ind": True}), (" entités, 2 mol en contiennent 2 × N",
                                       {}),
                ("A", {"ind": True}), (", et n moles en contiennent n × N", {}),
                ("A", {"ind": True}), (". Pour retrouver le nombre de moles, "
                                       "on divise donc le nombre d'entités "
                                       "par N", {}),
                ("A", {"ind": True}), (".", {})]]
    a = encart(s, seq, i, 1, "exemple", 0.9, 2.6, wg, 10.7, corps_d,
               etiquette="🍎 ANALOGIE — COMPTER PAR DOUZAINES")
    xr, wr = 0.9 + wg + 0.6, 32.1 - wg - 0.6
    formule_frac(s, i, 2, "n =", "N", [[("N", {}), ("A", {"ind": True})]],
                 [[("n", {"gras": True}), ("  quantité de matière · mol", {})],
                  [("N", {"gras": True}), ("  nombre d'entités · —", {})],
                  [("N", {"gras": True}), ("A", {"gras": True, "ind": True}),
                   ("  nombre d'Avogadro · mol", {}),
                   ("−1", {"exp": True})],
                  [("N", {}), ("A", {"ind": True}), (" = 6,02 × 10", {}),
                   ("23", {"exp": True}), (" mol", {}), ("−1", {"exp": True})]],
                 x=xr, y=3.1, w=wr, h=4.3, wf=2.0)
    NP = {"police": TITRES, "taille": 20, "italique": True}
    p = encart(s, seq, i, 3, "propriete", xr, 3.1 + 4.3 + 0.55, wr, 5.4,
               [[("Il existe une relation de proportionnalité entre la "
                  "quantité de matière n et le nombre d'entités N : deux fois "
                  "plus d'entités, c'est deux fois plus de moles. Le "
                  "coefficient de proportionnalité est la constante "
                  "d'Avogadro, ce qui s'écrit aussi :", {})],
                eq([("N = n × N", NP), ("A", dict(NP, ind=True))], 20)],
               etiquette="PROPRIÉTÉ — PROPORTIONNALITÉ", fiche=True)
    exercice(s, seq, i, 4, xr, bas(p), wr, 5,
             "Quantité de matière d'un échantillon",
             question=[("Quelle est la quantité de matière d'un échantillon "
                        "contenant N = 21 × 10", Q), ("23", dict(Q, exp=True)),
                       (" entités identiques ?", Q)])

    # --- III.C · masse molaire atomique ------------------------------------
    s, i = page("III", "Quantité de matière", "C — La masse molaire")
    wg = 18.2
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, wg, None,
               [[("La ", {}), terme("masse molaire atomique"),
                 (" M est la masse d'une mole d'atomes de l'élément chimique "
                  "considéré. Elle s'exprime en g/mol.", {})]],
               etiquette="DÉFINITION — MASSE MOLAIRE ATOMIQUE", fiche=True)
    z = texte(s, i, 2, 0.9, bas(d, 0.3), wg, 1.3,
              "🍎 Dans notre panier, la « masse molaire » serait la masse "
              "d'une douzaine de pommes : 12 × 150 g = 1,8 kg par douzaine.",
              taille=14, italique=True, couleur=VERT)
    z = texte(s, i, 3, 0.9, bas(z, 0.35), wg, 4.5,
              [[("Chaque case de la classification périodique porte le nombre "
                 "de masse A (le nombre de nucléons du noyau, sans unité) et "
                 "la masse molaire atomique M. Ces deux nombres sont "
                 "distincts, mais pour de nombreux éléments ils sont "
                 "numériquement très proches : la masse d'une mole d'atomes "
                 "vaut environ A grammes, soit M ≈ A g·mol", {}),
                ("−1", {"exp": True}), (".", {})]], taille=15)
    f = fig(s, i, 3, "case", 20.6, 2.6, 12.4)
    lg = legende(s, i, 3, 20.6, bas(f, 0.05), 12.4,
            "La masse molaire atomique figure en bas de chaque case de la "
            "classification périodique. Pour de nombreux éléments, elle est "
            "proche du nombre de masse A de l'isotope majoritaire.", h=1.8)
    MM = {"taille": 15}
    encart(s, seq, i, 4, "exemple", 0.9, max(bas(z, 0.2), bas(lg, 0.2)),
           32.1, None,
           [[("Pour l'hydrogène ", {}), ("1", {"exp": True}),
             ("1", {"ind": True}), ("H, une mole d'atomes pèse 1 g → "
                                    "M(H) = 1 g/mol.", {})],
            [("Pour le carbone ", {}), ("12", {"exp": True}),
             ("6", {"ind": True}), ("C, une mole d'atomes pèse 12 g → "
                                    "M(C) = 12 g/mol.", {})],
            [("Pour l'oxygène ", {}), ("16", {"exp": True}),
             ("8", {"ind": True}), ("O, une mole d'atomes pèse 16 g → "
                                    "M(O) = 16 g/mol.", {})]],
           etiquette="EXEMPLE DÉTAILLÉ — QUELQUES MASSES MOLAIRES ATOMIQUES")

    # --- III.C · masse molaire ionique + exercice 6 ------------------------
    s, i = page("III", "Quantité de matière", "C — La masse molaire")
    MH = {"police": TITRES, "taille": 20, "italique": True}
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, 32.1, None,
               [[("Un ion est un atome qui a perdu ou gagné un ou plusieurs "
                  "électrons. La masse d'un atome correspond à la masse de son "
                  "noyau, car l'électron a une masse négligeable devant celle "
                  "du nucléon. On peut donc dire que la ", {}),
                 terme("masse molaire d'un ion"),
                 (" est égale à celle de l'atome dont il est issu.", {})],
                eq([("M(H", MH), ("+", dict(MH, exp=True)),
                    (") = M(H) = 1 g/mol", MH)], 20)],
               etiquette="DÉFINITION — MASSE MOLAIRE IONIQUE", fiche=True)
    exercice(s, seq, i, 2, 0.9, bas(d), 32.1, 6, "Masses molaires ioniques",
             question=[("Donner les valeurs des masses molaires atomiques des "
                        "éléments chlore (Cl) et calcium (Ca) à l'aide de la "
                        "classification périodique, et en déduire les masses "
                        "molaires ioniques des espèces Cl", Q),
                       ("−", dict(Q, exp=True)), (" et Ca", Q),
                       ("2+", dict(Q, exp=True)), (".", Q)])

    # --- III.C · masse molaire moléculaire + exercice 7 --------------------
    s, i = page("III", "Quantité de matière", "C — La masse molaire")
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, 32.1, None,
               [[("La ", {}), terme("masse molaire moléculaire"),
                 (" est la masse d'une mole de molécules du corps pur "
                  "considéré. Elle est égale à la somme des masses molaires "
                  "atomiques des éléments qui composent le corps pur.", {})]],
               etiquette="DÉFINITION — MASSE MOLAIRE MOLÉCULAIRE", fiche=True)
    MC = {"police": TITRES, "taille": 20, "italique": True}
    e = encart(s, seq, i, 2, "exemple", 0.9, bas(d), 32.1, None,
               [[("Le dioxyde de carbone CO", {}), ("2", {"ind": True}),
                 (" est composé d'un atome de carbone et de deux atomes "
                  "d'oxygène. Avec M(C) = 12 g/mol et M(O) = 16 g/mol :", {})],
                eq([("M(CO", MC), ("2", dict(MC, ind=True)),
                    (") = M(C) + 2 × M(O) = 12 + 2 × 16 = 44 g/mol", MC)], 20)],
               etiquette="EXEMPLE DÉTAILLÉ — DIOXYDE DE CARBONE")
    exercice(s, seq, i, 3, 0.9, bas(e), 32.1, 7,
             "Masses molaires moléculaires",
             question=[("Calculer les masses molaires moléculaires de l'eau "
                        "et du méthane CH", Q), ("4", dict(Q, ind=True)),
                       (".", Q)])

    # --- III.C · exercices 8 et 9 face à face ------------------------------
    s, i = page("III", "Quantité de matière", "C — La masse molaire")
    ex8 = dict(contexte=[[("Un atome d'or a pour masse 3,27 × 10", {}),
                          ("−22", {"exp": True}), (" g.", {})]],
               fig=(IMG / PHOTO["or"][0], PHOTO["or"][1], 7.0),
               donnees=[("Donnée : la masse molaire M est la masse d'une mole "
                         "d'entités, d'où M = m × N", DON),
                        ("A", dict(DON, ind=True)), (".", DON)],
               question="Quelle est la masse d'une mole d'atomes d'or ? "
                        "Comparer cette valeur avec celle de la classification "
                        "périodique.")
    ex9 = dict(contexte=[[("Formule brute de la chlorophylle : C", {}),
                          ("55", {"ind": True}), ("H", {}),
                          ("72", {"ind": True}), ("MgN", {}),
                          ("4", {"ind": True}), ("O", {}),
                          ("5", {"ind": True})]],
               fig=(IMG / PHOTO["feuille"][0], PHOTO["feuille"][1], 9.0),
               donnees=[("Données : M(C) = 12,0 · M(H) = 1,0 · M(Mg) = 24,3 · "
                         "M(N) = 14,0 · M(O) = 16,0 (en g·mol", DON),
                        ("−1", dict(DON, exp=True)), (")", DON)],
               question="Après avoir recherché les masses molaires atomiques "
                        "nécessaires, calculer la masse molaire de la "
                        "molécule de chlorophylle.")
    hh = max(hauteur_exercice(15.6, **ex8), hauteur_exercice(15.6, **ex9))
    exercice(s, seq, i, 1, 0.9, 2.6, 15.6, 8, "Masse molaire de l'or",
             h=hh, **ex8)
    exercice(s, seq, i, 2, 17.4, 2.6, 15.6, 9,
             "Masse molaire de la chlorophylle", h=hh, **ex9)

    # --- III.D · relation n = m / M ----------------------------------------
    s, i = page("III", "Quantité de matière",
                "D — Relation entre quantité de matière, masse et masse "
                "molaire")
    p = encart(s, seq, i, 1, "propriete", 0.9, 2.6, 32.1, 2.35,
               ["Une relation relie la masse m d'un échantillon à sa quantité "
                "de matière n, par l'intermédiaire de la masse molaire M de "
                "l'espèce chimique."],
               etiquette="PROPRIÉTÉ — MASSE ET QUANTITÉ DE MATIÈRE", fiche=True)
    ya = bas(p)
    ha = 6.9
    encart(s, seq, i, 2, "exemple", 0.9, ya, 32.1, ha,
           ["Combien de douzaines dans notre panier de 5,4 kg ? Une douzaine "
            "pèse 1,8 kg :"],
           etiquette="🍎 ANALOGIE — LE PANIER, UNE DERNIÈRE FOIS")
    ligne_frac(s, i, 2, 16.95, ya + 1.55,
               ["nombre de douzaines =",
                ("masse du panier", "masse d'une douzaine"),
                "=", ("5,4", "1,8"), "= 3"])
    texte(s, i, 2, 1.35, ya + 3.8, 31.2, 3.4,
          ["On retrouve les 3 douzaines, sans même passer par le nombre de "
           "pommes. C'est la relation ci-dessous : la masse de l'échantillon "
           "divisée par la masse d'une mole.",
           Par([("Limite de l'analogie : une douzaine compte 12 pommes, une "
                 "mole 6,02 × 10", {}), ("23", {"exp": True}),
                (" entités — un nombre si grand que quelques grammes de "
                 "matière en contiennent déjà une.", {})],
               italique=True, couleur=GRIS, taille=14)], taille=15)
    formule_frac(s, i, 3, "n =", "m", "M",
                 [[("n", {"gras": True}), ("  quantité de matière · mol", {})],
                  [("m", {"gras": True}), ("  masse · g", {})],
                  [("M", {"gras": True}), ("  masse molaire · g·mol", {}),
                   ("−1", {"exp": True})]],
                 x=3.2, y=ya + ha + 0.75, w=27.4, h=3.4)

    # --- III.D · exercices 10, 11, 12 --------------------------------------
    s, i = page("III", "Quantité de matière",
                "D — Relation entre quantité de matière, masse et masse "
                "molaire")
    DONM = [("Données : M(C) = 12,0 · M(H) = 1,0", DON)]
    e = exercice(s, seq, i, 1, 0.9, 2.6, 32.1, 10, "Sulfate de cuivre",
                 contexte=[[("On a un échantillon de masse m = 4,0 g de "
                             "sulfate de cuivre CuSO", {}),
                            ("4", {"ind": True}), (".", {})]],
                 donnees=[("Données : M(Cu) = 63,5 · M(S) = 32,1 · "
                           "M(O) = 16,0 (en g·mol", DON),
                          ("−1", dict(DON, exp=True)), (")", DON)],
                 question=[("Calculer la quantité de matière n", Q),
                           ("CuSO₄", dict(Q, ind=True)),
                           (" de l'échantillon.", Q)])
    ex11 = dict(contexte=[[("On prélève un volume V = 25 mL d'éthanol de "
                            "formule C", {}), ("2", {"ind": True}), ("H", {}),
                           ("6", {"ind": True}),
                           ("O et de masse volumique ρ = 0,789 g·mL", {}),
                           ("−1", {"exp": True}), (".", {})]],
                fig=(figs / "site-ethanol.png", RATIO["ethanol"], 4.6),
                donnees=DONM + [(" · M(O) = 16,0 (en g·mol", DON),
                                ("−1", dict(DON, exp=True)), (")", DON)],
                question="Donner la masse m et la quantité de matière n "
                         "prélevées.")
    ex12 = dict(contexte=[[("On prélève un volume V = 12,0 mL de cyclohexane "
                            "de formule C", {}), ("6", {"ind": True}),
                           ("H", {}), ("12", {"ind": True}),
                           (" et de masse volumique ρ = 0,7786 g·mL", {}),
                           ("−1", {"exp": True}), (".", {})]],
                fig=(figs / "site-cyclohexane.png", RATIO["cyclohexane"], 4.6),
                donnees=DONM + [(" (en g·mol", DON),
                                ("−1", dict(DON, exp=True)), (")", DON)],
                question=[("Donner l'expression de la quantité de matière n en "
                           "fonction de ρ, V et M(C", Q),
                          ("6", dict(Q, ind=True)), ("H", Q),
                          ("12", dict(Q, ind=True)),
                          ("), puis la calculer.", Q)])
    hh = max(hauteur_exercice(15.6, **ex11), hauteur_exercice(15.6, **ex12))
    exercice(s, seq, i, 2, 0.9, bas(e, 0.45), 15.6, 11,
             "Prélèvement d'éthanol", h=hh, **ex11)
    exercice(s, seq, i, 3, 17.4, bas(e, 0.45), 15.6, 12,
             "Prélèvement de cyclohexane", h=hh, **ex12)

    # ============================================================= CHECKLIST
    s, i = page("✓", "Pour le DS, je sais", "les six compétences du chapitre")
    checklist(s, seq, i, "", [
        "Exploiter l'électroneutralité de la matière pour associer des espèces "
        "ioniques et citer des formules de composés ioniques.",
        "Déterminer la masse d'une entité à partir de sa formule brute et de "
        "la masse des atomes qui la composent.",
        "Déterminer le nombre d'entités d'une espèce dans une masse "
        "d'échantillon.",
        "Définir la mole et le nombre d'Avogadro.",
        "Déterminer la quantité de matière (en mol) d'une espèce dans une "
        "masse d'échantillon.",
        "Calculer la masse molaire d'un composé.",
    ], kahoots=[
        ("bilan quantité de matière",
         "https://create.kahoot.it/share/bilan-quantite-de-matiere/"
         "523dac88-0ebc-48df-bffc-9c9d13c7a8b6"),
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
    if len(sys.argv) < 2:
        raise SystemExit("usage : python diapo_t1c4.py <dossier-des-figures>\n"
                         "  les figures sont extraites de la page si absentes")
    construire(sys.argv[1])
