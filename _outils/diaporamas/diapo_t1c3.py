#!/usr/bin/env python3
"""
diapo_t1c3.py — contenu du diaporama de projection du chapitre T1-C3,
« Constitution de l'atome ».

Ce fichier ne contient QUE ce qui est propre au chapitre. Toute la charte et
tous les composants viennent de `gabarit_diapo.py`.

USAGE
    python diapo_t1c3.py <dossier-des-figures>

    Produit assets/pptx/pc/diaporama-2nde-t1c3.pptx

SOURCE — la page en ligne, seule page de physique-chimie VALIDÉE par Loïc :
elle fait foi, texte compris. L'ancien diaporama (pptxgenjs, chaîne perdue,
15 diapositives, sans Kahoot) n'existe que sur le OneDrive de Loïc ; on n'en
reprend que la structure — une diapositive par partie 01 à 09, les
exercices regroupés à leur suite.

FIGURES — trois sources, toutes la page :
  · le SVG en ligne de l'exercice 3, sorti par `extraire_figures.mjs` (il
    porte un `aria-labelledby` depuis le 13/11/2026) ;
  · les SVG de fichier (Images 1, 2, 4 à 9), rendus ici en PNG — python-pptx
    ne pose pas de SVG ;
  · la frise « La construction du modèle atomique » et le tableau périodique
    (Image 10), qui sont du HTML : capturés sur la page rendue, polices du
    site, verrou levé, bandeaux fixes invisibles. La frise est rendue à
    1800 px de large pour tenir en paysage — à la largeur de la colonne
    du site, elle était deux fois plus haute que large.
L'Image 3 vit dans la correction de l'exercice 4 : elle n'est pas projetée
(R1). La numérotation des autres est celle du site (R6).

STRUCTURE — celle du site : les neuf parties 01 à 09, en bandeau. Pas
d'intercalaire par partie (neuf intercalaires pour dix-huit diapositives) :
un sommaire unique, en un clic, après la page de titre.

🔴 AUCUNE CORRECTION À L'ÉCRAN. Les énoncés apparaissent, jamais les
réponses : elles vivent en ligne, derrière le code de déblocage.
"""

import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from gabarit_diapo import (          # noqa: E402
    ALPHA, BETA, BLANC, ENCRE, GAMMA, GRIS, MONO, CORPS, OCRE, PAPIER, TITRES,
    Par, Sequence, bandeau, bas, checklist, cm, diapo, diapo_titre, encart,
    eq, exercice, figure, formule, hauteur_exercice, hauteur_texte,
    picto_fiche, pied, presentation, terme, titre_partie, _cadre, _riche,
    _sans_trait, _texte,
)
from PIL import Image                 # noqa: E402
from pptx.dml.color import RGBColor   # noqa: E402
from pptx.enum.text import PP_ALIGN   # noqa: E402

from animer import controler, minuter   # noqa: E402

ICI = Path(__file__).resolve().parent
RACINE = ICI.parents[1]
PAGE = RACINE / "pages" / "2nde-pc-t1-c3-constitution-atome.html"
IMG = RACINE / "assets" / "img" / "pc" / "2nde-pc-t1-c3"
SORTIE = RACINE / "assets" / "pptx" / "pc" / "diaporama-2nde-t1c3.pptx"

CHAPITRE = "Thème 1 · Chapitre 3 — Constitution de l'atome"
ANNEE = "2026 / 2027"
CM_ = 360000

LABELLISEES = ("t1c3ex3",)
FICHIERS = {"bohr": IMG / "t1c3-fig-modele-bohr.svg",
            "azx": IMG / "t1c3-fig-ecriture-azx.svg",
            "isotopes": IMG / "t1c3-fig-isotopes-grille.svg",
            "plomb": IMG / "t1c3-fig-abondances-plomb.svg",
            "charges": IMG / "t1c3-fig-charges-atome.svg",
            "football": IMG / "t1c3-fig-dimensions-football.svg",
            "lithium": IMG / "t1c3-fig-ion-lithium.svg",
            "fer": IMG / "t1c3-fig-element-fer.svg"}
CAPTURES = ("frise", "ptable", "ptable-leg")

Q = {"italique": True}
B = {"gras": True}
STYLE_GRILLE = "{5940675A-B579-460E-94D1-54222C63F5DA}"

# la page rendue : verrou levé, bandeaux fixes rendus INVISIBLES (le bandeau
# « Élève de 2nde 1 ? Connecte-toi » traversait la frise) — invisibles et non
# retirés : `display:none` sur la colonne collante du sommaire faisait
# glisser le cours dans sa piste de grille, et le tableau périodique sortait
# sur 132 px de large. Frise élargie.
PREPARER = """(l) => {
  document.body.classList.remove('verrouille');
  // chaque partie est un <details> : refermée, elle n'est pas peinte, et le
  // tableau périodique sortait en aplat beige
  document.querySelectorAll('details').forEach(d => { d.open = true; });
  for (const e of document.querySelectorAll('body *')) {
    const p = getComputedStyle(e).position;
    if (p === 'fixed') e.style.visibility = 'hidden';
  }
  const f = document.querySelector('.fh-affiche');
  if (l) { f.style.width = l + 'px'; f.style.maxWidth = 'none'; }
  const legs = document.querySelectorAll('.ptable-legende');
  legs[legs.length - 1].id = 'leg-ptable';
}"""


# ------------------------------------------------------------ extraction

def extraire(dossier):
    """Les figures du site en PNG, à 3× (SVG) ou 2× (captures HTML)."""
    from playwright.sync_api import sync_playwright
    dossier.mkdir(parents=True, exist_ok=True)
    subprocess.run(["node", str(ICI / "extraire_figures.mjs"), str(PAGE),
                    str(dossier)], check=True)
    blocs = []
    for cle, chemin in FICHIERS.items():
        vb = re.search(r'viewBox="([^"]+)"',
                       chemin.read_text(encoding="utf-8")).group(1)
        w, h = (float(v) for v in vb.split()[2:])
        k = 2400 / w
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
    rendu = dossier / "_rendu_fichiers.html"
    rendu.write_text(html, encoding="utf-8")
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 2600, "height": 1600})
        pg.goto(rendu.as_uri())
        pg.wait_for_timeout(1500)
        for cle, *_ in blocs:
            pg.locator(f"#f-{cle}").screenshot(
                path=str(dossier / f"site-{cle}.png"), omit_background=True)
            print(f"  ✓ site-{cle}.png")
        # les deux figures HTML, sur la page elle-même
        # deux chargements : la frise élargie écrasait la colonne du tableau
        # périodique, rendu sur 132 px de large et 740 de haut
        for largeur, cles in ((1800, (("frise", ".fh-affiche"),)),
                              (0, (("ptable", ".ptable"),
                                   ("ptable-leg", "#leg-ptable")))):
            pg = b.new_page(viewport={"width": 2200 if largeur else 1300,
                                      "height": 1200},
                            device_scale_factor=2)
            pg.goto(PAGE.as_uri())
            pg.wait_for_timeout(800)
            pg.evaluate(PREPARER, largeur)
            pg.wait_for_timeout(1500)
            for cle, sel in cles:
                # amené à l'écran AVANT la capture : hors de la vue, le
                # tableau n'était pas peint et sortait en aplat beige
                el = pg.locator(sel).first
                el.evaluate("e => e.scrollIntoView({block: 'center'})")
                pg.wait_for_timeout(700)
                el.screenshot(path=str(dossier / f"site-{cle}.png"))
                print(f"  ✓ site-{cle}.png")
            pg.close()
        b.close()


def ratio(chemin):
    w, h = Image.open(chemin).size
    return h / w


# ------------------------------------------------------------ construction

def construire(dossier_figs):
    figs = Path(dossier_figs)
    attendues = list(LABELLISEES) + list(FICHIERS) + list(CAPTURES)
    if not all((figs / f"site-{c}.png").exists() for c in attendues):
        extraire(figs)
    prs = presentation()
    seq = Sequence()
    n = 0

    def F(cle):
        return figs / f"site-{cle}.png"

    def page(num, partie, sous=""):
        nonlocal n
        s = diapo(prs)
        i = len(prs.slides) - 1
        bandeau(s, seq, i, num, partie, sous)
        n += 1
        pied(s, seq, i, CHAPITRE, n)
        return s, i

    def image(s, i, rang, chemin, x, y, w=None, h=None):
        r = ratio(chemin)
        if w is None:
            w = h / r
        img = s.shapes.add_picture(str(chemin), cm(x), cm(y), width=cm(w),
                                   height=cm(w * r))
        seq.marque(i, rang, img)
        return img

    def legende(s, i, rang, x, y, w, texte, h=1.2, align=PP_ALIGN.LEFT,
                num=None):
        corps = [[(num + " — ", B), (texte, {})]] if num else texte
        z = _texte(s, x, y, w, h, corps, taille=10, police=MONO, couleur=GRIS,
                   align=align, interligne=1.1)
        seq.marque(i, rang, z)
        return z

    def texte(s, i, rang, x, y, w, h, corps, taille=16, **k):
        z = _texte(s, x, y, w, h, corps, taille=taille, interligne=1.15,
                   espacement=6, **k)
        seq.marque(i, rang, z)
        return z

    def formule_fiche(s, i, rang, expression, grandeurs, x, y, w, h=3.0):
        """Panneau formule + son ✎ : chaque formule de la page porte un
        `a-noter`."""
        formule(s, seq, i, rang, expression, grandeurs, x, y, w, h)
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

    def frac(s, i, rang, haut, bas_, x, y, w, couleur=ENCRE):
        """Fraction numérateur SUR dénominateur (R3), sans membre de
        gauche : 10⁻¹⁰ sur 10⁻¹⁵."""
        zn = _texte(s, x, y, w, 0.85, haut, taille=20, police=TITRES,
                    couleur=couleur, align=PP_ALIGN.CENTER)
        seq.marque(i, rang, zn)
        t = _sans_trait(_cadre(s, x, y + 0.92, w, 0.05))
        t.fill.solid()
        t.fill.fore_color.rgb = couleur
        seq.marque(i, rang, t)
        zd = _texte(s, x, y + 1.05, w, 0.85, bas_, taille=20, police=TITRES,
                    couleur=couleur, align=PP_ALIGN.CENTER)
        seq.marque(i, rang, zd)

    def x_(base, e, **o):   # exposant
        return [(base, dict(o)), (e, dict(o, exp=True))]

    def i_(base, b, **o):   # indice
        return [(base, dict(o)), (b, dict(o, ind=True))]

    def nuc(a, z, x, **o):
        """Écriture conventionnelle d'un noyau : A en exposant, Z en indice,
        devant le symbole — comme dans les énoncés de T1-C4."""
        return [(a, dict(o, exp=True)), (z, dict(o, ind=True)), (x, dict(o))]

    # ================================================================ TITRE
    diapo_titre(
        prs, seq,
        "THÈME 1 · CONSTITUTION ET TRANSFORMATIONS DE LA MATIÈRE",
        "Chapitre 3 — Constitution de l'atome",
        "Un noyau, des électrons, et beaucoup de vide.",
        ANNEE, fond=None,
        logo=RACINE / "assets" / "img" / "logo-isaac-lycee.png")
    n += 1

    # ============================================================= SOMMAIRE
    # neuf parties : sur une colonne (gabarit), les deux dernières passaient
    # sous le bas de la diapositive. Deux colonnes, même rang — un seul clic
    s = diapo(prs)
    i = len(prs.slides) - 1
    titre_partie(s, seq, i, "", "Constitution de l'atome", [])
    parties = ["01 — Histoire du modèle atomique", "02 — Le modèle de Bohr",
               "03 — Écriture symbolique du noyau", "04 — Isotopes",
               "05 — Masse de l'atome", "06 — Charges électriques",
               "07 — Dimensions de l'atome", "08 — Les ions monoatomiques",
               "09 — Élément chimique"]
    for k, sp in enumerate(parties):
        z = _texte(s, 2.6 + (k // 5) * 14.5, 10.1 + (k % 5) * 0.95, 14.0, 0.8,
                   sp, taille=15, police=MONO,
                   couleur=RGBColor(0x9A, 0xA2, 0xB2))
        seq.marque(i, 1, z)
    n += 1

    # ================================== 01 — HISTOIRE DU MODÈLE ATOMIQUE
    s, i = page("01", "Histoire du modèle atomique")
    hf = 14.5
    wf = hf / ratio(F("frise"))
    wt = 33.0 - wf - 0.6 - 0.9
    texte(s, i, 1, 0.9, 2.8, wt, 14.0,
          [[("Le modèle de l'atome que nous étudions en classe de Seconde est "
             "le ", {}), ("modèle de Bohr", B),
            (". D'après ce modèle, l'atome est constitué d'un noyau positif "
             "autour duquel gravitent des électrons négatifs répartis sur des ",
             {}), ("couches", B), (".", {})],
           "Ce modèle hérite des avancées scientifiques qui ont permis de "
           "préciser nos connaissances sur un atome qui n'était au départ "
           "modélisé que par une simple sphère dure."], taille=15)
    image(s, i, 2, F("frise"), 33.0 - wf, 2.6, h=hf)

    # ============================================= 02 — LE MODÈLE DE BOHR
    s, i = page("02", "Le modèle de Bohr")
    wl = 16.6
    z = texte(s, i, 0, 0.9, 2.5, 32.1, 0.8,
              "Nous adoptons donc le modèle de Bohr. Première question : de "
              "quoi l'atome est-il fait ?", taille=14, italique=True,
              couleur=GRIS)
    d1 = encart(s, seq, i, 1, "definition", 0.9, bas(z, 0.2), wl, None,
                [[("Le ", {}), terme("noyau"),
                  (" est la partie centrale de l'atome. Il est constitué de ",
                   {}), terme("nucléons"), (" et il est ", {}),
                  ("chargé positivement", B), (".", {})]],
                etiquette="DÉFINITION", fiche=True)
    d2 = encart(s, seq, i, 2, "definition", 0.9, bas(d1, 0.35), wl, None,
                [[("Le ", {}), terme("cortège électronique"),
                  (" est situé autour du noyau. Il est constitué d'", {}),
                  terme("électrons"), (" et il est ", {}),
                  ("chargé négativement", B), (".", {})]],
                etiquette="DÉFINITION", fiche=True)
    encart(s, seq, i, 3, "definition", 0.9, bas(d2, 0.35), wl, None,
           [[("Les ", {}), terme("nucléons"),
             (" — littéralement « particules du noyau » — sont de deux "
              "sortes : les ", {}), terme("protons"), (", ", {}),
             ("chargés positivement", B), (", et les ", {}),
             terme("neutrons"), (", ", {}), ("sans charge", B), (".", {})]],
           etiquette="DÉFINITION", fiche=True)
    xr, wr = 0.9 + wl + 0.7, 32.1 - wl - 0.7
    f = image(s, i, 4, F("bohr"), xr, bas(z, 0.2), w=wr)
    lg = legende(s, i, 4, xr, bas(f, 0.1), wr,
                 "Le modèle de Bohr : un noyau (protons + neutrons) autour "
                 "duquel les électrons occupent des couches. Schrödinger "
                 "introduira plus tard la notion de nuage électronique.",
                 h=1.4, num="Image 1")
    NT = {"police": TITRES, "taille": 20}
    encart(s, seq, i, 5, "notation", xr, bas(lg, 0.4), wr, None,
           ["Pour simplifier, on utilisera parfois cette écriture "
            "symbolique :",
            eq([("e⁻", dict(NT, gras=True)), (" électron      ", NT),
                ("p⁺", dict(NT, gras=True)), (" proton      ", NT),
                ("n⁰", dict(NT, gras=True)), (" neutron", NT)], 20)],
           etiquette="NOTATIONS — ÉCRITURE SYMBOLIQUE DES PARTICULES",
           fiche=True)

    # ============================================ 03 — ÉCRITURE SYMBOLIQUE
    P3 = "Écriture symbolique du noyau"
    s, i = page("03", P3)
    wl = 18.4
    AZ = {"police": TITRES, "taille": 24}
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, wl, None,
               [[("L'", {}), terme("écriture conventionnelle du noyau"),
                 ("  ", {})] + nuc("A", "Z", "X", **AZ)
                + [("  porte trois informations :", {})],
                [("— ", {}), ("X", B), (" est le ", {}),
                 ("symbole de l'élément chimique", B),
                 (". La première lettre s'écrit toujours en majuscule et la "
                  "seconde en minuscule (ex : C, He, U, Al etc.) ;", {})],
                [("— ", {}), ("A", B), (" est le ", {}),
                 ("nombre de masse", B),
                 (". Il correspond au nombre de nucléons (protons et "
                  "neutrons) ;", {})],
                [("— ", {}), ("Z", B), (" est le ", {}),
                 ("numéro atomique", B), (". C'est le nombre de protons.", {})]],
               etiquette="DÉFINITION", fiche=True)
    xr, wr = 0.9 + wl + 0.7, 32.1 - wl - 0.7
    f = image(s, i, 2, F("azx"), xr, 2.8, w=wr)
    legende(s, i, 2, xr, bas(f, 0.1), wr,
            "L'écriture conventionnelle du noyau porte trois informations : "
            "A, Z et X.", h=0.9, num="Image 2")
    z = texte(s, i, 3, 0.9, bas(d, 0.4), wl, 0.9,
              "Pour calculer le nombre de neutrons, on utilise la formule :",
              taille=15)
    formule_fiche(s, i, 3, [[("N = A − Z", {})]],
                  [[("N", B), ("  nombre de neutrons", {})],
                   [("A", B), ("  nombre de masse (nucléons)", {})],
                   [("Z", B), ("  numéro atomique (protons)", {})]],
                  x=0.9, y=bas(z, 0.8), w=wl, h=3.6)

    # --- 03 · exercices 1 à 4 ---------------------------------------------
    s, i = page("03", P3, "exercices")
    we = 15.75
    ex1 = dict(question=[("Donner la composition du noyau ", Q)]
               + nuc("35", "17", "Cl", **Q) + [(".", Q)])
    ex2 = dict(question="Donner la notation symbolique du noyau d'oxygène "
                        "possédant 8 protons et 8 neutrons.")
    h12 = max(hauteur_exercice(we, **ex1), hauteur_exercice(we, **ex2))
    e1 = exercice(s, seq, i, 1, 0.9, 2.6, we, 1, "Composition d'un noyau",
                  h=h12, **ex1)
    exercice(s, seq, i, 2, 0.9 + we + 0.6, 2.6, we, 2, "Notation symbolique",
             h=h12, **ex2)
    ex3 = dict(question="Donner l'écriture conventionnelle des deux noyaux "
                        "représentés ci-dessous.",
               fig=(F("t1c3ex3"), ratio(F("t1c3ex3")), 12.6))
    ex4 = dict(question=[("Réaliser des schémas de noyaux atomiques à partir "
                          "de ces écritures conventionnelles : ", Q)]
               + nuc("1", "1", "H", **Q) + [(", ", Q)]
               + nuc("14", "6", "C", **Q) + [(", ", Q)]
               + nuc("9", "4", "Be", **Q) + [(".", Q)])
    y2 = bas(e1, 0.5)
    h34 = max(hauteur_exercice(we, **ex3), hauteur_exercice(we, **ex4))
    # l'exercice 3 pose sa question AVANT la figure, comme sur le site
    exercice(s, seq, i, 3, 0.9, y2, we, 3,
             "De la composition à l'écriture conventionnelle", h=h34,
             contexte=[Par(ex3["question"], italique=True)], fig=ex3["fig"])
    exercice(s, seq, i, 4, 0.9 + we + 0.6, y2, we, 4,
             "Schémas de noyaux atomiques", h=h34, **ex4)

    # ===================================================== 04 — ISOTOPES
    s, i = page("04", "Isotopes")
    z = texte(s, i, 0, 0.9, 2.5, 32.1, 0.8,
              "Même élément, mais pas toujours le même noyau : jouons sur le "
              "nombre de neutrons.", taille=14, italique=True, couleur=GRIS)
    wl = 15.8
    d = encart(s, seq, i, 1, "definition", 0.9, bas(z, 0.2), wl, None,
               [[("Des noyaux atomiques ", {}), terme("isotopes"),
                 (" sont des noyaux possédant le ", {}),
                 ("même nombre de protons mais un nombre différent de "
                  "neutrons", B), (".", {})]],
               etiquette="DÉFINITION", fiche=True)
    texte(s, i, 1, 0.9, bas(d, 0.4), wl, 4.0,
          [[("Deux noyaux isotopes ont donc le ", {}),
            ("même numéro atomique Z", B),
            (" : ils appartiennent au même élément chimique. Ils ont "
             "cependant un ", {}), ("nombre de masse A différent", B),
            (", ils n'ont donc pas la même masse.", {})]], taille=15)
    xr, wr = 0.9 + wl + 0.7, 32.1 - wl - 0.7
    f = image(s, i, 2, F("isotopes"), xr, 2.6, w=wr)
    legende(s, i, 2, xr, bas(f, 0.1), wr,
            "Chaque ligne regroupe les isotopes d'un même élément : même Z, "
            "nombre de neutrons différent. Des isotopes sont des « sosies » "
            "chimiques, mais leurs propriétés physiques diffèrent, et leurs "
            "usages avec : le carbone 12 est stable et largement majoritaire, "
            "le carbone 13 stable et minoritaire, tandis que le carbone 14, "
            "radioactif, sert à dater les vestiges archéologiques.", h=3.0,
            num="Image 4")

    # --- 04 · abondance, exercice 5 ---------------------------------------
    s, i = page("04", "Isotopes")
    wp = 14.0
    f = image(s, i, 1, F("plomb"), 0.9, 2.6, w=wp)
    lg = legende(s, i, 1, 0.9, bas(f, 0.1), wp,
                 "Abondances relatives des isotopes du plomb dans la nature.",
                 h=0.9, num="Image 5")
    xr, wr = 0.9 + wp + 0.9, 32.1 - wp - 0.9
    z = texte(s, i, 1, xr, 2.8, wr, 2.6,
              [[("Dans la nature, différents isotopes d'un même élément sont "
                 "présents selon certaines proportions : on parle "
                 "d'", {}), terme("abondance isotopique"), (".", {})]],
              taille=16)
    exercice(s, seq, i, 2, xr, bas(z, 0.6), wr, 5, "Isotopes de l'uranium",
             question=[("Donner la composition des noyaux ", Q)]
             + nuc("238", "92", "U", **Q) + [(" et ", Q)]
             + nuc("235", "92", "U", **Q)
             + [(" (uranium 238 et uranium 235) et justifier que ce sont des "
                 "isotopes.", Q)])

    # ================================================ 05 — MASSE DE L'ATOME
    P5 = "Masse de l'atome"
    s, i = page("05", P5)
    z = texte(s, i, 0, 0.9, 2.5, 32.1, 0.8,
              "Maintenant que l'on connaît les habitants de l'atome, "
              "pesons-les.", taille=14, italique=True, couleur=GRIS)
    wl = 14.0
    z = texte(s, i, 1, 0.9, bas(z, 0.3), wl, 1.4,
              "Les masses des particules composant l'atome sont données dans "
              "le tableau ci-dessous.", taille=15)
    tab = tableau(s, i, 1, [["Particule", "Masse (kg)"],
                            ["Électron", x_("9,109 × 10", "−31")],
                            ["Proton", x_("1,673 × 10", "−27")],
                            ["Neutron", x_("1,675 × 10", "−27")]],
                  0.9, bas(z, 0.3), wl, 0.95, taille=15)
    texte(s, i, 1, 0.9, bas(tab, 0.3), wl, 1.5,
          "Ces trois valeurs ne sont pas à apprendre : elles sont fournies "
          "dans les énoncés.", taille=13, italique=True, couleur=GRIS)
    xr, wr = 0.9 + wl + 0.8, 32.1 - wl - 0.8
    MP = {"police": TITRES, "taille": 20, "italique": True}
    p = encart(s, seq, i, 2, "propriete", xr, 3.4, wr, None,
               ["La masse d'un neutron est très proche de celle d'un proton, "
                "de telle manière qu'ils sont considérés de même masse :",
                eq(i_("m", "neutron", **MP) + [(" ≈ ", MP)]
                   + i_("m", "proton", **MP)
                   + x_(" = 1,67 × 10", "−27", **MP) + [(" kg", MP)], 20)],
               etiquette="PROPRIÉTÉ", fiche=True)
    exercice(s, seq, i, 3, xr, bas(p, 0.5), wr, 6,
             "Masse d'un électron et masse d'un nucléon",
             question="Comparer la masse d'un électron à celle d'un nucléon. "
                      "Qu'en déduisez-vous ?")

    # --- 05 · m = A × m_n, exercices 7 et 8 --------------------------------
    s, i = page("05", P5)
    z = texte(s, i, 1, 0.9, 2.7, 32.1, 1.4,
              "La masse d'un atome m peut donc être approximée à celle de son "
              "noyau ; elle se calcule grâce à la relation suivante :",
              taille=16)
    yf = bas(z, 0.8)
    formule_fiche(s, i, 1, [[("m = A × m", {}), ("n", {"ind": True})]],
                  [[("m", B), ("  masse de l'atome · kg", {})],
                   [("A", B), ("  nombre de masse (nucléons)", {})],
                   [("m", B), ("n", dict(B, ind=True)),
                    ("  masse d'un nucléon · 1,67 × 10", {}),
                    ("−27", {"exp": True}), (" kg", {})]],
                  x=4.4, y=yf, w=25.0, h=3.6)
    we = 15.75
    ex7 = dict(contexte="Le tritium est un atome d'hydrogène (Z = 1) "
                        "possédant deux neutrons, alors que l'hydrogène n'en "
                        "possède généralement aucun.",
               question="Calculer la masse du tritium.")
    ex8 = dict(question=[("Calculer la masse d'un atome d'or. Voici "
                          "l'écriture conventionnelle de son noyau : ", Q)]
               + nuc("197", "79", "Au", **Q) + [(".", Q)])
    hh = max(hauteur_exercice(we, **ex7), hauteur_exercice(we, **ex8))
    y2 = yf + 3.6 + 0.7
    exercice(s, seq, i, 2, 0.9, y2, we, 7, "Masse du tritium", h=hh, **ex7)
    exercice(s, seq, i, 3, 0.9 + we + 0.6, y2, we, 8, "Masse d'un atome d'or",
             h=hh, **ex8)

    # ============================================ 06 — CHARGES ÉLECTRIQUES
    P6 = "Charges électriques"
    s, i = page("06", P6)
    z = texte(s, i, 0, 0.9, 2.5, 32.1, 0.8,
              "Après la masse, l'autre carte d'identité des particules : leur "
              "charge électrique.", taille=14, italique=True, couleur=GRIS)
    d = encart(s, seq, i, 1, "definition", 0.9, bas(z, 0.2), 32.1, None,
               [[("La ", {}), terme("charge élémentaire e"),
                 (" est la plus petite valeur positive de charge électrique, "
                  "elle est portée par les protons. La charge portée par les "
                  "électrons est l'opposé de celle des protons et vaut −e.",
                  {})]],
               etiquette="DÉFINITION", fiche=True)
    yf = bas(d, 1.0)
    wfm = 15.75
    formule_fiche(s, i, 2, [x_("e = 1,602 × 10", "−19") + [(" C", {})]],
                  [[("e", B), ("  charge élémentaire", {})],
                   [("L'unité de la charge électrique est le ", {}),
                    ("coulomb (C)", B), (".", {})]],
                  x=0.9, y=yf, w=wfm, h=3.6)
    z = texte(s, i, 3, 0.9 + wfm + 0.6, yf - 0.5, wfm, 1.4,
              "Un noyau porte une charge positive, qui se calcule en utilisant "
              "la formule suivante :", taille=15)
    formule_fiche(s, i, 3, [i_("Q", "noyau") + [(" = Z × e", {})]],
                  [[("Q", B), ("noyau", dict(B, ind=True)),
                    ("  charge du noyau · C", {})],
                   [("Z", B), ("  numéro atomique (protons)", {})],
                   [("e", B), ("  charge élémentaire · 1,602 × 10", {}),
                    ("−19", {"exp": True}), (" C", {})]],
                  x=0.9 + wfm + 0.6, y=bas(z, 0.6), w=wfm, h=4.0)

    # --- 06 · neutralité, Image 6, exercice 9 -----------------------------
    s, i = page("06", P6)
    wl = 16.4
    p = encart(s, seq, i, 1, "propriete", 0.9, 2.6, wl, None,
               [[("L'atome est ", {}), terme("électriquement neutre", GAMMA),
                 (", c'est-à-dire qu'il contient autant de protons, chargés "
                  "positivement, que d'électrons, chargés négativement. Ainsi "
                  "la charge de l'ensemble des électrons (cortège "
                  "électronique) est l'opposée de la charge du noyau de "
                  "l'atome :", {})]],
               etiquette="PROPRIÉTÉ — NEUTRALITÉ ÉLECTRIQUE", fiche=True)
    yf = bas(p, 0.9)
    formule_fiche(s, i, 2, [i_("Q", "électrons") + [(" = −", {})]
                            + i_("Q", "noyau")],
                  [[("Q", B), ("électrons", dict(B, ind=True)),
                    ("  charge du cortège · C", {})],
                   [("Q", B), ("noyau", dict(B, ind=True)),
                    ("  charge du noyau · C", {})]],
                  x=0.9, y=yf, w=wl, h=3.2)
    texte(s, i, 2, 0.9, yf + 3.2 + 0.3, wl, 0.9,
          [[("L'atome entier porte donc une ", {}), ("charge nulle", B),
            (".", {})]], taille=15)
    xr, wr = 0.9 + wl + 0.7, 32.1 - wl - 0.7
    f = image(s, i, 3, F("charges"), xr, 2.6, w=wr)
    lg = legende(s, i, 3, xr, bas(f, 0.1), wr,
                 "Charges dans l'atome : le noyau porte Q = Z × e, le cortège "
                 "électronique porte la charge opposée — l'atome est "
                 "électriquement neutre.", h=1.4, num="Image 6")
    exercice(s, seq, i, 4, xr, bas(lg, 0.4), wr, 9, "Atome de chlore",
             question=[("Quelle est la composition d'un atome de chlore qui a "
                        "pour noyau ", Q)] + nuc("35", "17", "Cl", **Q)
             + [(" ? Quelle est la charge de son noyau ? En déduire la charge "
                 "de son cortège électronique.", Q)])

    # ============================================ 07 — DIMENSIONS DE L'ATOME
    s, i = page("07", "Dimensions de l'atome")
    z = texte(s, i, 0, 0.9, 2.5, 32.1, 0.8,
              "Dernière caractéristique, et pas des moindres : la taille. "
              "Préparez-vous à beaucoup de vide.", taille=14, italique=True,
              couleur=GRIS)
    wl = 17.2
    z = texte(s, i, 1, 0.9, bas(z, 0.3), wl, 6.3,
              [[("Le ", {}), terme("rayon de l'atome"),
                (", assimilé à une sphère, est de l'ordre de ", {}),
                ("10", B), ("−10", dict(B, exp=True)), (" m", B),
                (", soit un dixième de milliardième de mètre. Cette dimension "
                 "a donné naissance à sa propre unité, l'angström (10", {}),
                ("−10", {"exp": True}), (" m = 1 Å).", {})],
               [("Le ", {}), terme("rayon du noyau de l'atome"),
                (", assimilé à une sphère, est de l'ordre de ", {}),
                ("10", B), ("−15", dict(B, exp=True)), (" m", B),
                (", soit un millionième de milliardième de mètre. Il existe "
                 "également une unité adaptée, le femtomètre (10", {}),
                ("−15", {"exp": True}), (" m = 1 fm).", {})],
               "La comparaison de ces deux rayons nous donne :"], taille=15)
    yq = bas(z, 0.1)
    frac(s, i, 1, [x_("10", "−10")], [x_("10", "−15")], 4.6, yq, 2.4)
    zr = _texte(s, 7.2, yq + 0.55, 9.0, 0.9,
                [x_("= 10", "5") + [(" = 100 000", {})]], taille=20,
                police=TITRES)
    seq.marque(i, 1, zr)
    encart(s, seq, i, 2, "propriete", 0.9, yq + 2.4, wl, None,
           [[("L'atome est cent mille fois plus grand que son noyau : "
              "l'atome est donc essentiellement constitué de vide. Sa "
              "structure est dite ", {}), terme("lacunaire", GAMMA),
             (".", {})]],
           etiquette="PROPRIÉTÉ", fiche=True)
    xr, wr = 0.9 + wl + 0.7, 32.1 - wl - 0.7
    f = image(s, i, 3, F("football"), xr, 2.6, w=wr)
    lg = legende(s, i, 3, xr, bas(f, 0.1), wr,
                 "Un atome ramené à l'échelle humaine : le rayon de l'atome "
                 "vaut environ 100 000 fois celui de son noyau.", h=1.0,
                 num="Image 7")
    exercice(s, seq, i, 4, xr, bas(lg, 0.4), wr, 10,
             "Un noyau comme une bille de stylo",
             question="Quel serait le diamètre d'un atome si le rayon de son "
                      "noyau était celui d'une bille de stylo "
                      "(r = 0,50 mm) ?")

    # ======================================= 08 — LES IONS MONOATOMIQUES
    s, i = page("08", "Les ions monoatomiques")
    z = texte(s, i, 0, 0.9, 2.5, 32.1, 0.8,
              "Jusqu'ici l'atome était neutre. Que se passe-t-il s'il perd ou "
              "gagne des électrons ?", taille=14, italique=True, couleur=GRIS)
    wl = 19.4
    EX = {"italique": True}
    d1 = encart(s, seq, i, 1, "definition", 0.9, bas(z, 0.2), wl, None,
                [[("Un ", {}), terme("ion monoatomique"),
                  (" est un atome ayant gagné ou perdu un ou plusieurs "
                   "électrons lors d'une réaction chimique. Il acquiert donc "
                   "une charge en raison d'un déséquilibre entre le nombre de "
                   "protons et d'électrons.", {})],
                 Par("Il en existe de deux types.", taille=14, couleur=GRIS)],
                etiquette="DÉFINITION", fiche=True)
    d2 = encart(s, seq, i, 2, "definition", 0.9, bas(d1, 0.25), wl, None,
                [[("Les ", {}), terme("anions"), (" ont ", {}),
                  ("gagné", B), (" un ou plusieurs électrons : ils sont ", {}),
                  ("chargés négativement", B), (".", {})],
                 Par([("Exemples : ", EX),
                      ("Cl⁻ provient d'un atome de chlore ayant gagné un "
                       "électron, O²⁻ d'un atome d'oxygène qui en a gagné "
                       "deux.", {})], taille=13)],
                etiquette="DÉFINITION", fiche=True)
    encart(s, seq, i, 3, "definition", 0.9, bas(d2, 0.25), wl, None,
           [[("Les ", {}), terme("cations"), (" ont ", {}), ("perdu", B),
             (" un ou plusieurs électrons : ils sont ", {}),
             ("chargés positivement", B), (".", {})],
            Par([("Exemples : ", EX),
                 ("K⁺ provient d'un atome de potassium ayant perdu un "
                  "électron, Fe³⁺ d'un atome de fer qui en a perdu trois.",
                  {})], taille=13)],
           etiquette="DÉFINITION", fiche=True)
    xr, wr = 0.9 + wl + 0.7, 32.1 - wl - 0.7
    f = image(s, i, 4, F("lithium"), xr, 2.6, w=wr)
    lg = legende(s, i, 4, xr, bas(f, 0.1), wr,
                 "Lorsque l'atome de lithium Li (3 p⁺ | 3 e⁻ | 4 n⁰) perd un "
                 "électron, il devient le cation monoatomique Li⁺ "
                 "(3 p⁺ | 2 e⁻ | 4 n⁰).", h=1.4, num="Image 8")
    exercice(s, seq, i, 5, xr, bas(lg, 0.4), wr, 11,
             "Composition d'ions monoatomiques",
             question=[("Donner la composition des ions Mg²⁺, H⁺ et F⁻. On "
                        "donne les écritures conventionnelles de leurs "
                        "noyaux : ", Q)] + nuc("24", "12", "Mg", **Q)
             + [(", ", Q)] + nuc("1", "1", "H", **Q) + [(", ", Q)]
             + nuc("19", "9", "F", **Q) + [(".", Q)])

    # ============================================== 09 — ÉLÉMENT CHIMIQUE
    P9 = "Élément chimique"
    s, i = page("09", P9)
    z = texte(s, i, 0, 0.9, 2.5, 32.1, 0.8,
              "Noyaux, atomes, ions… Qu'ont en commun toutes ces entités ? Une "
              "seule chose : leur numéro atomique.", taille=14, italique=True,
              couleur=GRIS)
    d = encart(s, seq, i, 1, "definition", 0.9, bas(z, 0.2), 32.1, None,
               [[("Toutes les entités chimiques (noyaux, atomes, ions) "
                  "possédant le ", {}), terme("même numéro atomique Z"),
                 (" appartiennent au ", {}), terme("même élément chimique"),
                 (".", {})]],
               etiquette="DÉFINITION", fiche=True)
    z = texte(s, i, 1, 0.9, bas(d, 0.35), 32.1, 1.8,
              [[("Tout élément chimique est identifié par son ", {}),
                terme("symbole"),
                (". Chaque numéro atomique Z est donc associé à un symbole "
                 "bien distinct. Les éléments chimiques sont rangés dans "
                 "l'ordre de leur Z croissant dans le ", {}),
                terme("tableau périodique des éléments chimiques"),
                (".", {})]], taille=15)
    y0 = bas(z, 0.3)
    wl = 13.4
    encart(s, seq, i, 2, "exemple", 0.9, y0, wl, None,
           [[("L'élément fer a pour numéro atomique Z = 26 et son symbole est "
              "Fe. L'atome de fer s'écrit Fe, les ions fer Fe²⁺ ou encore "
              "Fe³⁺, et le noyau de fer ", {})] + nuc("56", "26", "Fe")
            + [(" ; tous appartiennent à l'élément fer.", {})]],
           etiquette="⚗ EXEMPLE DÉTAILLÉ — L'ÉLÉMENT FER")
    xr = 0.9 + wl + 0.7
    wr = 32.1 - wl - 0.7
    hmax = 17.2 - y0 - 1.0
    wfer = min(wr, hmax / ratio(F("fer")))
    f = image(s, i, 3, F("fer"), xr + (wr - wfer) / 2, y0, w=wfer)
    legende(s, i, 3, xr, bas(f, 0.1), wr,
            "Autour de l'élément fer : noyau, atome et ions partagent le même "
            "numéro atomique Z = 26.", h=0.9, num="Image 9")

    # --- 09 · Image 10, le tableau périodique -------------------------------
    s, i = page("09", P9, "le tableau périodique")
    wt = 21.6
    f = image(s, i, 1, F("ptable"), (33.87 - wt) / 2, 2.4, w=wt)
    lgp = image(s, i, 1, F("ptable-leg"), (33.87 - wt) / 2, bas(f, 0.1),
                w=wt)
    legende(s, i, 1, (33.87 - wt) / 2, bas(lgp, 0.15), wt,
            "Tableau périodique des éléments chimiques, rangés par numéro "
            "atomique Z croissant. Chaque case indique : le numéro atomique Z "
            "(en haut), le symbole, et la masse atomique en u. Une masse entre "
            "crochets, comme [98] pour le technétium, désigne le nombre de "
            "masse de l'isotope le plus stable — ces éléments n'existent pas "
            "durablement dans la nature. Les lignes La–Lu (lanthanides) et "
            "Ac–Lr (actinides) sont détachées sous le tableau.", h=1.9,
            num="Image 10")

    # --- 09 · exercice 12 ---------------------------------------------------
    s, i = page("09", P9, "exercice")
    exercice(s, seq, i, 1, 3.5, 3.4, 26.9, 12, "Un élément, plusieurs entités",
             question=[("Associer les entités chimiques appartenant au même "
                        "élément :  H · O · ", Q)] + nuc("19", "9", "F", **Q)
             + [(" · ", Q)] + nuc("1", "1", "H", **Q)
             + [(" · H⁺ · F⁻ · O²⁻ · ", Q)] + nuc("16", "8", "O", **Q)
             + [(" · F", Q), ("2", dict(Q, ind=True)), (".", Q)])

    # ============================================================= CHECKLIST
    s, i = page("✓", "Pour le DS, je sais", "les sept compétences du chapitre")
    checklist(s, seq, i, "", [
        "Établir l'écriture conventionnelle d'un noyau à partir de sa "
        "composition et inversement.",
        "Effectuer le quotient de deux grandeurs pour les comparer.",
        "Comparer la taille et la masse d'un atome et de son noyau.",
        "Citer l'ordre de grandeur de la valeur de la taille d'un atome.",
        "Identifier dans un document : la masse et la charge électrique d'un "
        "électron, d'un proton et d'un neutron ; la charge électrique "
        "élémentaire.",
        "Calculer la masse et la charge d'un noyau et d'un cortège "
        "électronique.",
        "Identifier des isotopes.",
    ], kahoots=[
        ("bilan constitution de l'atome",
         "https://create.kahoot.it/share/bilan-constitution-de-l-atome/"
         "30d07b3b-4c6d-4eb4-8dee-3033011abd9e"),
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
        raise SystemExit("usage : python diapo_t1c3.py <dossier-des-figures>\n"
                         "  les figures sont extraites de la page si absentes")
    construire(sys.argv[1])
