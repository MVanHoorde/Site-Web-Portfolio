#!/usr/bin/env python3
"""
diapo_t3c1.py — contenu du diaporama de projection du chapitre T3-C1,
« Émission et perception d'un son ».

Ce fichier ne contient QUE ce qui est propre au chapitre. Toute la charte et
tous les composants viennent de `gabarit_diapo.py`.

USAGE
    python diapo_t3c1.py <dossier-des-figures>

    Produit assets/pptx/pc/diaporama-2nde-t3c1.pptx

POURQUOI CE FICHIER — le diaporama de T3-C1 d'août 2026 sortait d'une chaîne
perdue : il ne se régénérait pas, et son tableau des célérités était FAUX
(Eau 1 500 · Bois 3 300 · Acier 5 000, saisis de mémoire). Ce script le
remplace, et le tableau reprend les cinq milieux du cours : Air 340 ·
Eau 1450 · Glace 3200 · Verre 5300 · Acier 5750.

FIGURES — les SVG en ligne de la page portent un `aria-labelledby` :
`extraire_figures.mjs` les sort (SVG de correction écartés). Ce script y
ajoute ce que l'outil commun ne voit pas : l'affiche de la cloche à vide
(SVG en ligne sans identifiant, repéré par son viewBox) et les SVG de
fichier (guitare, icônes de l'orage et de la baleine, partition du La),
que python-pptx ne sait pas poser. Les photographies se posent telles
quelles. La page reste la seule source : l'extraction se rejoue si une
figure manque.

STRUCTURE — celle de l'ancien diaporama, qui est celle du site : I à IV,
sous-parties A, B, C. Numéros d'image du site (R6), Image 1 à 18.

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
PAGE = RACINE / "pages" / "2nde-pc-t3-c1-emission-perception-son.html"
IMG = RACINE / "assets" / "img" / "pc" / "2nde-pc-t3-c1"
SORTIE = RACINE / "assets" / "pptx" / "pc" / "diaporama-2nde-t3c1.pptx"

CHAPITRE = "Thème 3 · Chapitre 1 — Émission et perception d'un son"
ANNEE = "2026 / 2027"

# figures en ligne attendues de extraire_figures.mjs (clé = aria-labelledby)
LABELLISEES = ("mtitre", "t3c1ex1", "t3c1ex2", "t3c1f3", "t3c1f4", "t3c1ex3",
               "t3c1f9", "t3c1f12", "t3c1f13", "t3c1ex9", "t3c1f14",
               "t3c1f15")
# SVG en ligne SANS identifiant, repérés par leur viewBox
EN_LIGNE = {"cloche": "0 0 400 225"}
# SVG de fichier, posés tels quels sur le site
FICHIERS = {"guitare": IMG / "t3c1-guitare.svg",
            "orage": IMG / "t3c1-icone-orage.svg",
            "baleine": IMG / "t3c1-icone-baleine.svg",
            "partition": IMG / "t3c1-la-partition.svg"}

Q = {"italique": True}
DON = {"police": MONO, "taille": 12}
STYLE_GRILLE = "{5940675A-B579-460E-94D1-54222C63F5DA}"
B = {"gras": True}


# ------------------------------------------------------------ extraction

def extraire(dossier):
    """Les figures du site en PNG transparents, à 3×, polices du site."""
    from playwright.sync_api import sync_playwright
    dossier.mkdir(parents=True, exist_ok=True)
    subprocess.run(["node", str(ICI / "extraire_figures.mjs"), str(PAGE),
                    str(dossier)], check=True)
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
        k = max(3, 1200 / w) if w < 700 else 2000 / w
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
        pg = b.new_page(viewport={"width": 2400, "height": 1600})
        pg.goto(rendu.as_uri())
        pg.wait_for_timeout(1500)
        for cle, *_ in blocs:
            pg.locator(f"#f-{cle}").screenshot(
                path=str(dossier / f"site-{cle}.png"), omit_background=True)
            print(f"  ✓ site-{cle}.png")
        b.close()
    filigrane(dossier)


def filigrane(dossier):
    """Le micro de la page de titre, fondu dans l'encre. Le dégradé est CUIT
    dans l'image : PowerPoint ne sait pas dégrader une image (§5)."""
    photo = Image.open(IMG / "t3c1-micro-signal.jpg").convert("RGB")
    photo = photo.crop((0, 0, 470, 600)).resize((940, 1200))
    encre = Image.new("RGB", photo.size, (0x14, 0x1A, 0x26))
    sombre = Image.blend(photo, encre, 0.5)
    masque = Image.new("L", photo.size)
    for x in range(photo.size[0]):
        a = min(1.0, x / (0.55 * photo.size[0]))
        masque.paste(int(255 * a * a), (x, 0, x + 1, photo.size[1]))
    micro = Image.composite(sombre, encre, masque)
    # toute la diapositive, encre à gauche : une image PLEIN CADRE est un
    # fond pour controler.py, quand une image en bord droit « sortait des
    # marges » et « passait sous le pied »
    fond = Image.new("RGB", (2120, 1200), (0x14, 0x1A, 0x26))
    fond.paste(micro, (2120 - 940, 0))
    fond.save(dossier / "titre-micro.png")


def ratio(chemin):
    w, h = Image.open(chemin).size
    return h / w


# ------------------------------------------------------------ construction

def construire(dossier_figs):
    figs = Path(dossier_figs)
    attendues = list(LABELLISEES) + list(EN_LIGNE) + list(FICHIERS)
    if not all((figs / f"site-{c}.png").exists() for c in attendues) or \
            not (figs / "titre-micro.png").exists():
        extraire(figs)
    prs = presentation()
    seq = Sequence()
    n = 0

    def F(cle):
        return figs / f"site-{cle}.png"

    def P(nom):
        return IMG / nom

    def page(romain, partie, sous=""):
        nonlocal n
        s = diapo(prs)
        i = len(prs.slides) - 1
        bandeau(s, seq, i, romain, partie, sous)
        n += 1
        pied(s, seq, i, CHAPITRE, n)
        return s, i

    def intercalaire(romain, titre, sous_parties):
        nonlocal n
        s = diapo(prs)
        titre_partie(s, seq, len(prs.slides) - 1, romain, titre, sous_parties)
        n += 1

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
        corps = [[(num + " — ", {"gras": True}), (texte, {})]] if num else texte
        z = _texte(s, x, y, w, h, corps, taille=10, police=MONO, couleur=GRIS,
                   align=align, interligne=1.1)
        seq.marque(i, rang, z)
        return z

    def texte(s, i, rang, x, y, w, h, corps, taille=16, **k):
        z = _texte(s, x, y, w, h, corps, taille=taille, interligne=1.15,
                   espacement=6, **k)
        seq.marque(i, rang, z)
        return z

    def frac(s, i, rang, gauche, haut, bas_, x, y, w, couleur=ENCRE,
             wg=2.6):
        """Fraction numérateur SUR dénominateur (R3) — celle du gabarit,
        avec un membre de gauche dont la boîte est à la largeur voulue : à
        5 cm fixes, elle sortait de la diapositive dès que la fraction était
        posée près du bord gauche."""
        zg = _texte(s, x - wg - 0.2, y + 0.55, wg, 0.9, gauche, taille=22,
                    police=TITRES, couleur=couleur, italique=True,
                    align=PP_ALIGN.RIGHT)
        seq.marque(i, rang, zg)
        zn = _texte(s, x, y, w, 0.85, haut, taille=20, police=TITRES,
                    couleur=couleur, italique=True, align=PP_ALIGN.CENTER)
        seq.marque(i, rang, zn)
        t = _sans_trait(_cadre(s, x, y + 0.92, w, 0.05))
        t.fill.solid()
        t.fill.fore_color.rgb = couleur
        seq.marque(i, rang, t)
        zd = _texte(s, x, y + 1.05, w, 0.85, bas_, taille=20, police=TITRES,
                    couleur=couleur, italique=True, align=PP_ALIGN.CENTER)
        seq.marque(i, rang, zd)

    def formule_frac(s, i, rang, gauche, haut, bas_, grandeurs, x, y, w,
                     h=3.6, wf=2.8):
        """Panneau formule dont l'expression est une VRAIE fraction (R3),
        avec son ✎ : chaque formule de la page porte un `a-noter`."""
        formule(s, seq, i, rang, [""], grandeurs, x, y, w, h)
        xf = x + w * 0.52 / 2 - wf / 2 + 1.2
        frac(s, i, rang, gauche, haut, bas_, xf, y + (h - 1.95) / 2, wf,
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

    def exercice_q(s, i, rang, x, y, w, num, titre, questions, h=None, **k):
        """Un exercice à PLUSIEURS questions, chacune sur sa ligne, en
        italique, sous le contexte, la figure et les données. Le gabarit
        n'en pose qu'une ; on mesure le reste, puis on ajoute les questions
        dans le bas du cadre."""
        base, hq = mesure_q(w, questions, **k)
        hh = h or round(base + hq + 0.25, 2)
        cadre = exercice(s, seq, i, rang, x, y, w, num, titre, h=hh, **k)
        qs = [Par(q, italique=True) for q in questions]
        z = _texte(s, x + 0.45, y + base - 0.4 + 0.25, w - 0.9, hq, qs,
                   taille=15, interligne=1.15, espacement=6)
        seq.marque(i, rang, z)
        return cadre

    def mesure_q(w, questions, **k):
        base = hauteur_exercice(w, **k)
        hq = hauteur_texte([Par(q, italique=True) for q in questions], w - 1.05)
        return base, hq

    def x_(base, e):        # exposant
        return [(base, {}), (e, {"exp": True})]

    def i_(base, b, **o):   # indice
        return [(base, dict(o)), (b, dict(o, ind=True))]

    # ================================================================ TITRE
    s = diapo_titre(
        prs, seq, "THÈME 3 · ONDES ET SIGNAUX",
        "Chapitre 1 — Émission et perception d'un son",
        "Quelque chose a vibré, et cette vibration a voyagé jusqu'à ton "
        "oreille.",
        ANNEE, fond=None,
        logo=RACINE / "assets" / "img" / "logo-isaac-lycee.png")
    # le micro en filigrane, glissé SOUS le texte : posé après, il le couvrait
    fil = s.shapes.add_picture(str(figs / "titre-micro.png"), cm(0), cm(0),
                               width=cm(33.87), height=cm(19.05))
    arbre = s.shapes._spTree
    arbre.remove(fil._element)
    arbre.insert(3, fil._element)
    n += 1

    # ======================= I — CARACTÉRISTIQUES D'UN SIGNAL PÉRIODIQUE
    PI = "Caractéristiques d'un signal périodique"
    intercalaire("I", PI, ["A — Période", "B — Fréquence", "C — Extrema"])

    # --- I · phénomène périodique, Images 1 et 2 ---------------------------
    s, i = page("I", PI, "Signal périodique")
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, 32.1, None,
               [[("Un ", {}), terme("phénomène périodique"),
                 (" est un phénomène qui se reproduit identique à lui-même à "
                  "intervalles de temps égaux.", {})]],
               etiquette="DÉFINITION — PHÉNOMÈNE PÉRIODIQUE", fiche=True)
    z = texte(s, i, 2, 0.9, bas(d, 0.4), 32.1, 1.4,
              [[("Tous les signaux ne sont pas périodiques : un ", {}),
                ("sismogramme", B),
                (" enregistre des oscillations irrégulières, alors qu'un ", {}),
                ("électrocardiogramme", B),
                (" reproduit le même motif à intervalles réguliers.", {})]],
              taille=15)
    y0 = bas(z, 0.3)
    wi = 13.2
    for k, (nom, num, leg, xc) in enumerate((
        ("t3c1-sismogramme-source.jpg", "Image 1",
         "Les sismogrammes sont les signaux caractéristiques des séismes : "
         "ils ne sont pas périodiques.", 0.9 + 32.1 / 4),
        ("t3c1-ecg-source.jpg", "Image 2",
         "Un électrocardiogramme enregistre l'activité électrique du cœur. "
         "Un motif élémentaire s'y répète, un par battement : c'est un "
         "signal périodique.", 0.9 + 3 * 32.1 / 4))):
        hmax = 17.2 - y0 - 1.5
        r = ratio(P(nom))
        w = min(wi, hmax / r)
        im = image(s, i, 2, P(nom), xc - w / 2, y0, w=w)
        legende(s, i, 2, xc - wi / 2, bas(im, 0.15), wi, leg, num=num)

    # --- I.A · période et méthode -----------------------------------------
    s, i = page("I", PI, "A — Période")
    wg = 15.8
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, wg, None,
               [[("La ", {}), terme("période T"),
                 (" d'un signal périodique est la plus petite durée au bout "
                  "de laquelle le signal se reproduit identique à lui-même. "
                  "C'est la durée d'un ", {}), terme("motif élémentaire"),
                 (".", {})]],
               etiquette="DÉFINITION — PÉRIODE", fiche=True)
    avant = ["1 · Repérer un motif élémentaire qui se répète.",
             "2 · En compter n consécutifs, le plus possible.",
             [("3 · Lire les instants t", {}), ("i", {"ind": True}),
              (" (départ) et t", {}), ("f", {"ind": True}),
              (" (arrivée).", {})],
             "4 · En déduire :"]
    apres = [Par([("Pourquoi plusieurs motifs ? ", {"gras": True}),
                  ("La lecture des instants sur le graphe est imprécise. En "
                   "mesurant sur n motifs, on divise cette imprécision par n.",
                   {})], taille=13, couleur=GRIS)]
    ym = bas(d)
    corps_m = avant + [Par(" ", taille=44)] + apres
    m = encart(s, seq, i, 2, "methode", 0.9, ym, wg, None, corps_m,
               etiquette="MÉTHODE — MESURER UNE PÉRIODE SUR UN GRAPHE")
    # PowerPoint rend une ligne de 15 pt, interligne 1,15 et 6 pt après, sur
    # 0,95 cm — l'estimation du gabarit (0,86) posait la fraction trop haut,
    # à cheval sur le paragraphe suivant
    yfr = ym + 0.95 + 0.95 * len(avant) + 0.1
    frac(s, i, 2, "T =", [i_("t", "f", italique=True)
                          + [(" − ", {})] + i_("t", "i", italique=True)],
         "n", 0.9 + wg / 2 - 0.4, yfr, 3.4)
    f = image(s, i, 3, F("mtitre"), 17.4, 2.8, w=15.6)
    legende(s, i, 3, 17.4, bas(f, 0.15), 15.6,
            "Les quatre étapes, sur un signal dont le motif est un peu "
            "découpé : on repère le motif, on le compte, on lit les instants.")

    # --- I.A · exercice 1 ---------------------------------------------------
    s, i = page("I", PI, "A — Période")
    exercice(s, seq, i, 1, 3.5, 2.7, 26.9, 1, "Période d'un signal",
             contexte="On observe à l'oscilloscope le signal électrique "
                      "délivré par un microphone placé devant une source "
                      "sonore. Le signal obtenu est périodique : on y "
                      "reconnaît un motif qui se répète à intervalles "
                      "réguliers.",
             fig=(F("t3c1ex1"), ratio(F("t3c1ex1")), 17.0),
             question="Calculer la période T de ce signal.")

    # --- I.B · fréquence, Image 3, f = 1/T ----------------------------------
    s, i = page("I", PI, "B — Fréquence")
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, wg, None,
               [[("La ", {}), terme("fréquence f"),
                 (" correspond au nombre de motifs élémentaires (périodes) "
                  "par unité de temps, le plus souvent par seconde. Son "
                  "unité est le ", {}), terme("hertz"),
                 (", de symbole Hz.", {})]],
               etiquette="DÉFINITION — FRÉQUENCE", fiche=True)
    f = image(s, i, 2, F("t3c1f3"), 17.4, 2.6, w=15.6)
    lg = legende(s, i, 2, 17.4, bas(f, 0.1), 15.6,
                 "Effet de la fréquence sur l'allure du signal, les deux "
                 "tracés dans le même repère : plus la fréquence est élevée, "
                 "plus les motifs sont resserrés. En une seconde, le signal à "
                 "3 Hz boucle trois motifs quand celui à 1 Hz n'en boucle "
                 "qu'un — et leurs amplitudes sont pourtant identiques.",
                 h=2.4, num="Image 3")
    texte(s, i, 2, 17.4, bas(lg, 0.25), 15.6, 2.4,
          [[("Cette différence d'allure, l'oreille l'entend directement : ",
             {}), ("plus la fréquence est élevée, plus le son perçu est "
                   "aigu ; plus elle est basse, plus il est grave", B),
            (".", {})]], taille=15)
    formule_frac(s, i, 3, "f =", "1", "T",
                 [[("f", B), ("  fréquence · Hz", {})],
                  [("T", B), ("  période · s", {})]],
                 x=0.9, y=bas(d, 1.1), w=wg, h=3.4, wf=1.6)

    # --- I.B · Hertz, exercice 2 --------------------------------------------
    s, i = page("I", PI, "B — Fréquence")
    ph = image(s, i, 1, P("t3c1-portrait-hertz.jpg"), 0.9, 2.8, h=6.0)
    texte(s, i, 1, 0.9 + ph.width / CM_ + 0.6, 2.8, 15.6 - ph.width / CM_
          - 0.6, 6.0,
          [[("HISTOIRE DES SCIENCES", {"police": MONO, "taille": 11,
                                       "gras": True,
                                       "couleur": RGBColor(0x8A, 0x6A, 0x3A)})],
           Par("Mort à 36 ans, une unité pour l'éternité", taille=20,
               police=TITRES),
           "Heinrich Hertz (1857-1894) fabrique des ondes électromagnétiques "
           "et les détecte à quelques mètres. On lui demande à quoi cela "
           "pourra bien servir."], taille=15)
    texte(s, i, 1, 0.9, 9.3, 15.6, 3.0,
          [Par("« Cela n'a aucune utilité. C'est juste une expérience qui "
               "prouve que maître Maxwell avait raison. »", taille=18,
               police=TITRES, italique=True),
           Par("Réponse attribuée à Hertz, interrogé sur la portée de sa "
               "découverte", taille=11, police=MONO, couleur=GRIS)])
    texte(s, i, 1, 0.9, 12.6, 15.6, 3.0,
          "Une génération plus tard, son nom devient l'unité de fréquence ; "
          "le hertz entre au Système international en 1960. Chaque fois que "
          "tu lis « 440 Hz » sur un diapason, tu cites un homme qui se "
          "croyait inutile.", taille=15)
    exercice(s, seq, i, 2, 17.4, 2.6, 15.6, 2, "Fréquence d'un signal",
             fig=(F("t3c1ex2"), ratio(F("t3c1ex2")), 11.0),
             donnees=[("Rappel de l'exercice 1 : T ≈ 2,6 × 10", DON),
                      ("−3", dict(DON, exp=True)), (" s = 2,6 ms", DON)],
             question="Calculer la fréquence du signal de l'exercice "
                      "précédent.")

    # --- I.C · extrema, Image 4, amplitude -----------------------------------
    s, i = page("I", PI, "C — Extrema")
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, wg, None,
               [[("Un signal périodique possède des ", {}), terme("extrema"),
                 (" (ou extremums) : une valeur maximale et une valeur "
                  "minimale. Pour une tension périodique u(t) on parle de "
                  "tension maximale U", {}), ("max", {"ind": True}),
                 (" et de tension minimale U", {}), ("min", {"ind": True}),
                 (".", {})]],
               etiquette="DÉFINITION — EXTREMA", fiche=True)
    f = image(s, i, 2, F("t3c1f4"), 17.4, 2.6, w=15.6)
    lg = legende(s, i, 2, 17.4, bas(f, 0.1), 15.6,
                 [[("Image 4 — ", B), ("Extrema d'une tension périodique "
                                       "u(t) : la tension maximale U", {}),
                   ("max", {"ind": True}), (" et la tension minimale U", {}),
                   ("min", {"ind": True}), (".", {})]], h=0.9)
    z = texte(s, i, 3, 0.9, bas(d, 0.35), wg, 3.4,
              [[("Ces deux extrema donnent l'", {}), terme("amplitude"),
                (" du signal. Attention : l'amplitude n'est pas l'écart "
                 "entre le maximum et le minimum, mais sa ", {}),
                ("moitié", B),
                (" — la hauteur qui sépare le sommet de la courbe de sa "
                 "position moyenne.", {})]], taille=15)
    formule_frac(s, i, 3, "A =",
                 [[("U", {}), ("max", {"ind": True}), (" − U", {}),
                   ("min", {"ind": True})]], "2",
                 [[("A", B), ("  amplitude · V", {})],
                  [("U", B), ("max", dict(B, ind=True)),
                   ("  tension maximale · V", {})],
                  [("U", B), ("min", dict(B, ind=True)),
                   ("  tension minimale · V", {})]],
                 x=0.9, y=bas(z, 0.9), w=wg, h=3.8, wf=3.6)
    encart(s, seq, i, 4, "piege", 17.4, bas(lg, 0.4), 15.6, None,
           [[("La ", {}), ("hauteur", B), (" d'un son (grave ou aigu) est "
                                           "liée à sa ", {}),
             ("fréquence", B), (". Son ", {}), ("intensité", B),
             (" (fort ou faible) est liée à son ", {}), ("amplitude", B),
             (". Ce sont deux caractéristiques indépendantes : un son grave "
              "peut être très fort, et un son aigu très faible.", {})]],
           etiquette="ATTENTION — DEUX NOTIONS À NE PAS CONFONDRE")

    # --- I.C · exercice 3 ---------------------------------------------------
    s, i = page("I", PI, "C — Extrema")
    exercice(s, seq, i, 1, 3.5, 2.7, 26.9, 3, "Période, fréquence et extrema",
             fig=(F("t3c1ex3"), ratio(F("t3c1ex3")), 19.0),
             question=[("Déterminer les valeurs de la période T, de la "
                        "fréquence f, des tensions maximale U", Q),
                       ("max", dict(Q, ind=True)), (" et minimale U", Q),
                       ("min", dict(Q, ind=True)),
                       (", puis de l'amplitude A du signal ci-dessous.", Q)])

    # ================================================== II — LES ONDES
    PII = "Les ondes"
    intercalaire("II", PII, [])

    # --- II · onde, Image 5, types d'ondes ---------------------------------
    s, i = page("II", PII, "Propagation d'une perturbation")
    wl = 20.6
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, wl, None,
               [[("Une ", {}), terme("onde"),
                 (" est la propagation d'une perturbation ", {}),
                 ("sans déplacement de matière", B), (".", {})]],
               etiquette="DÉFINITION — ONDE", fiche=True)
    xr, wr = 0.9 + wl + 0.6, 32.1 - wl - 0.6
    f = image(s, i, 2, P("t3c1-vague-bateau-source.jpg"), xr + 0.6, 2.6,
              w=wr - 1.2)
    legende(s, i, 2, xr, bas(f, 0.12), wr,
            "Lorsqu'une vague (onde) se propage dans la mer (milieu de "
            "propagation), elle transporte de l'énergie mais pas de matière : "
            "le bateau ne bouge pas horizontalement au passage de la vague.",
            h=2.4, num="Image 5")
    z = texte(s, i, 2, 0.9, bas(d, 0.35), wl, 5.0,
              ["La vague avance. Le bateau, lui, monte et redescend sur place "
               "— il n'est pas emporté. Ce qui a voyagé n'est donc pas l'eau : "
               "c'est une perturbation. Ce que l'onde transporte, c'est de "
               "l'énergie.",
               [("Le ", {}), terme("milieu de propagation"),
                (" est la matière que l'onde traverse et met en mouvement — "
                 "l'eau pour la vague, l'air pour le son, la roche pour une "
                 "onde sismique.", {})]], taille=15)
    encart(s, seq, i, 3, "propriete", 0.9, bas(z, 0.3), wl, None,
           ["Il existe plusieurs types d'ondes :",
            [("— les ", {}), terme("ondes mécaniques", GAMMA),
             (" qui se propagent dans un milieu matériel, sans transport de "
              "matière mais avec transport d'énergie ;", {})],
            [("— les ", {}), terme("ondes électromagnétiques (OEM)", GAMMA),
             (" qui peuvent se déplacer dans le vide. Elles transportent de "
              "l'énergie mais aussi de l'information.", {})]],
           etiquette="DÉFINITION — TYPES D'ONDES", fiche=True)

    # --- II · exercice 4 ----------------------------------------------------
    s, i = page("II", PII, "Propagation d'une perturbation")
    q4 = ("Indiquer, pour chaque cas, s'il s'agit d'une onde mécanique ou "
          "d'une onde électromagnétique (OEM).")
    h_img = 5.6
    hh = hauteur_exercice(30.1, question=q4) + h_img + 1.4
    y0 = 3.6
    exercice(s, seq, i, 1, 1.9, y0, 30.1, 4,
             "Application directe : onde mécanique ou électromagnétique ?",
             question=q4, h=hh)
    yi = y0 + hh - h_img - 1.3
    vignettes = (("t3c1-ex4-soleil.jpg", "Le Soleil"),
                 ("t3c1-ex4-haut-parleur.jpg", "Une onde sonore"),
                 ("t3c1-ex4-antenne-radio.jpg", "Des ondes radio"),
                 ("t3c1-ex4-vague.jpg", "Une vague"),
                 ("t3c1-ex4-bloc-sismique.jpg", "Des ondes sismiques"))
    for k, (nom, leg) in enumerate(vignettes):
        xc = 1.9 + 30.1 * (k + 0.5) / 5
        r = ratio(P(nom))
        w = min(h_img / r, 5.6)
        im = image(s, i, 1, P(nom), xc - w / 2, yi + (h_img - w * r) / 2, w=w)
        legende(s, i, 1, xc - 2.9, yi + h_img + 0.15, 5.8, leg, h=0.6,
                align=PP_ALIGN.CENTER)

    # ============================ III — ÉMISSION ET PROPAGATION D'UN SIGNAL
    PIII = "Émission et propagation d'un signal sonore"
    intercalaire("III", PIII, ["A — Émission du signal sonore",
                               "B — Propagation du signal sonore",
                               "C — Vitesse du signal sonore"])

    # --- III.A · émetteur, Images 6 et 7 ----------------------------------
    s, i = page("III", PIII, "A — Émission du signal sonore")
    wl = 14.2
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, wl, None,
               [[("Un ", {}), terme("émetteur"),
                 (" (ou source sonore) est un objet qui produit un signal "
                  "sonore grâce à une de ses parties qui vibre. Une ", {}),
                 terme("vibration"),
                 (" est un mouvement de va-et-vient d'un objet.", {})]],
               etiquette="DÉFINITION — ÉMETTEUR", fiche=True)
    texte(s, i, 1, 0.9, bas(d, 0.35), wl, 2.4,
          [[("Remarque : ", {"italique": True}),
            ("pour que le signal sonore émis soit plus audible, il doit être "
             "amplifié par une ", {}), ("caisse de résonance", B),
            (".", {})]], taille=15)
    hi = 8.0
    g = image(s, i, 2, F("guitare"), 15.8 + (8.4 - hi / ratio(F("guitare"))) / 2,
              2.6, h=hi)
    legende(s, i, 2, 15.8, 2.6 + hi + 0.15, 8.4,
            "Ce sont les cordes de la guitare qui vibrent, mais elles seules "
            "ne feraient qu'un son ténu : elles déplacent trop peu d'air. La "
            "caisse de résonance — le corps creux en bois, repéré sur la "
            "figure — entre en vibration avec elles et met en mouvement une "
            "bien plus grande quantité d'air. C'est ce qui rend le son "
            "audible à l'autre bout de la pièce.", h=6.0, num="Image 6")
    sx = P("t3c1-saxophone.png")
    image(s, i, 2, sx, 24.7 + (8.3 - hi / ratio(sx)) / 2, 2.6, h=hi)
    legende(s, i, 2, 24.7, 2.6 + hi + 0.15, 8.3,
            "Dans un saxophone, c'est l'anche qui vibre : une fine lamelle "
            "fixée sur le bec, repérée sur la figure, et mise en mouvement "
            "par le souffle du musicien. Le corps de l'instrument joue "
            "ensuite le rôle de caisse de résonance, et la longueur d'air "
            "mise en vibration détermine la note.", h=6.0, num="Image 7")

    # --- III.B · propagation, Image 8, cloche à vide -----------------------
    s, i = page("III", PIII, "B — Propagation du signal sonore")
    wl = 17.0
    p = encart(s, seq, i, 1, "propriete", 0.9, 2.6, wl, None,
               [[("Une onde sonore se propage dans un ", {}),
                 terme("milieu matériel", GAMMA),
                 (" (solide, liquide ou gazeux) mais ", {}),
                 ("ne peut pas se propager dans le vide", B), (".", {})]],
               etiquette="PROPRIÉTÉ — PROPAGATION", fiche=True)
    xr, wr = 0.9 + wl + 0.7, 32.1 - wl - 0.7
    cp = P("t3c1-compressions-dilatations-source.jpg")
    hc = 8.6
    f = image(s, i, 2, cp, xr + (wr - hc / ratio(cp)) / 2, 2.6, h=hc)
    legende(s, i, 2, xr, bas(f, 0.12), wr,
            "Un son qui se propage fait vibrer la matière : il provoque des "
            "compressions et des dilatations successives, c'est-à-dire des "
            "variations de pression. Plus on s'éloigne de la source, moins "
            "les molécules vibrent avec d'énergie.", h=2.6, num="Image 8")
    yc = bas(p, 0.5)
    wc = 8.4
    c = image(s, i, 3, F("cloche"), 0.9, yc, w=wc)
    legende(s, i, 3, 0.9, bas(c, 0.12), wc,
            "L'expérience de la cloche à vide : une sonnerie retentit sous "
            "une cloche de verre dont on retire progressivement l'air.",
            h=1.8, num="Vidéo")
    texte(s, i, 3, 0.9 + wc + 0.5, yc, wl - wc - 0.5, 5.0,
          [Par("QUESTION", taille=10, police=MONO, couleur=ALPHA),
           Par("Que devient le son de la sonnerie à mesure que l'air est "
               "retiré de la cloche ? Qu'en déduit-on sur la propagation du "
               "son ?", italique=True)], taille=15)

    # --- III.C · célérité, tableau 1, c = d / Δt ---------------------------
    s, i = page("III", PIII, "C — Vitesse du signal sonore")
    wl = 19.0
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, wl, None,
               [[("La vitesse de propagation du signal sonore c", {}),
                 ("son", {"ind": True}), (", appelée ", {}),
                 terme("célérité"),
                 (", dépend du milieu traversé : elle est plus élevée dans "
                  "les liquides ou les métaux que dans l'air.", {})],
                Par("En effet, dans les matériaux les plus denses comme les "
                    "métaux, les molécules sont très proches les unes des "
                    "autres et se transmettent très rapidement l'information ; "
                    "tandis que dans les gaz, les molécules sont plus "
                    "dispersées et l'onde sonore se propage plus lentement.",
                    taille=14),
                [("Il faut connaître la vitesse du son dans l'air : ", {}),
                 ("c", B), ("son", dict(B, ind=True)),
                 ("(air) = 340 m·s", B), ("−1", dict(B, exp=True)),
                 (".", {})]],
               etiquette="DÉFINITION — CÉLÉRITÉ", fiche=True)
    xr, wr = 0.9 + wl + 0.8, 32.1 - wl - 0.8
    z = legende(s, i, 2, xr, 2.6, wr, "Quelques vitesses du son selon le "
                "milieu.", h=0.5, num="Tableau 1")
    tab = tableau(s, i, 2, [
        ["Milieu", "Vitesse du son"],
        ["Air", x_("340 m·s", "−1")],
        ["Eau", x_("1450 m·s", "−1")],
        ["Glace", x_("3200 m·s", "−1")],
        ["Verre", x_("5300 m·s", "−1")],
        ["Acier", x_("5750 m·s", "−1")]], xr, 3.3, wr, 0.9, taille=15)
    texte(s, i, 2, xr, 3.3 + 6 * 0.9 + 0.4, wr, 3.0,
          [[("La célérité se note c", {}), ("son", {"ind": True}),
            (" dans ce cours, comme dans le programme et dans le manuel. Tu "
             "la rencontreras aussi notée v, notamment dans les sujets de "
             "devoir : c'est la même grandeur, avec la même unité.", {})]],
          taille=13, couleur=GRIS, italique=True)
    formule_frac(s, i, 3, [[("c", {}), ("son", {"ind": True}), (" =", {})]],
                 "d", "Δt",
                 [[("c", B), ("son", dict(B, ind=True)),
                   ("  célérité · m·s", {}), ("−1", {"exp": True})],
                  [("d", B), ("  distance parcourue · m", {})],
                  [("Δt", B), ("  durée du parcours · s", {})]],
                 x=0.9, y=bas(d, 0.9), w=wl, h=3.6, wf=2.0)

    # --- III.C · exercices 5, 6, 7 ------------------------------------------
    s, i = page("III", PIII, "C — Vitesse du signal sonore")
    we = 10.3
    ex5 = dict(contexte="Tu vois un éclair, puis le tonnerre te parvient "
                        "9 secondes plus tard.",
               fig=(F("orage"), ratio(F("orage")), 2.2),
               question="À quelle distance se trouve l'orage ?")
    ex6 = dict(contexte="Le chant d'une baleine bleue a pu être entendu à "
                        "1000 km du cétacé (propagation dans l'eau).",
               fig=(F("baleine"), ratio(F("baleine")), 6.0),
               donnees=[("Données : c", DON), ("son", dict(DON, ind=True)),
                        ("(eau) = 1450 m·s", DON), ("−1", dict(DON, exp=True))],
               question="Combien de temps faut-il à ce chant pour parcourir "
                        "cette distance ?")
    ex7 = dict(contexte="Tu cries face à une falaise, puis tu entends ton "
                        "cri revenir 1,2 s plus tard.",
               donnees=[("Données : c", DON), ("son", dict(DON, ind=True)),
                        ("(air) = 340 m·s", DON), ("−1", dict(DON, exp=True))],
               question="À quelle distance se trouve la falaise ?")
    hh = max(hauteur_exercice(we, **e) for e in (ex5, ex6, ex7))
    for k, (num, titre, e) in enumerate(((5, "Distance de l'orage", ex5),
                                         (6, "Le chant des baleines", ex6),
                                         (7, "L'écho de la falaise", ex7))):
        exercice(s, seq, i, k + 1, 0.9 + k * (we + 0.6), 2.8, we, num, titre,
                 h=hh, **e)

    # ============================================ IV — PERCEPTION DES SONS
    PIV = "Perception des sons"
    intercalaire("IV", PIV, ["A — Fréquences audibles, ultrasons et "
                             "infrasons",
                             "B — Hauteur et timbre d'un son",
                             "C — Niveau d'intensité sonore"])
    SA = "A — Fréquences audibles, ultrasons et infrasons"

    # --- IV.A · sons audibles, Image 9, tableau 2 --------------------------
    s, i = page("IV", PIV, SA)
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, 32.1, None,
               [[("L'oreille humaine est un récepteur sensible à des ondes "
                  "sonores dont la fréquence est comprise entre environ ", {}),
                 ("20 Hz", B), (" et ", {}), ("20 kHz", B),
                 (". Ce domaine, celui des ", {}), terme("sons audibles"),
                 (", est situé entre celui des ", {}), terme("infrasons"),
                 (" (en dessous) et celui des ", {}), terme("ultrasons"),
                 (" (au-dessus).", {})]],
               etiquette="DÉFINITION — SONS AUDIBLES, INFRASONS, ULTRASONS",
               fiche=True)
    y0 = bas(d, 0.35)
    wf9 = 19.4
    f = image(s, i, 2, F("t3c1f9"), 0.9, y0, w=wf9)
    legende(s, i, 2, 0.9, bas(f, 0.1), wf9,
            "Le domaine des fréquences audibles par l'oreille humaine, entre "
            "20 Hz et 20 kHz, encadré par les infrasons et les ultrasons. Le "
            "domaine audible se partage lui-même en graves, mediums et "
            "aigus.", h=1.4, num="Image 9")
    xr, wr = 0.9 + wf9 + 0.8, 32.1 - wf9 - 0.8
    z = texte(s, i, 3, xr, y0, wr, 3.6,
              ["Ces valeurs peuvent varier d'un individu à l'autre et le "
               "domaine des fréquences audibles se réduit avec l'âge, surtout "
               "dans les aigus.",
               [("Le domaine audible se subdivise en trois zones — les ", {}),
                ("graves", B), (", les ", {}), ("mediums", B),
                (" et les ", {}), ("aigus", B), (" :", {})]], taille=14)
    zt = legende(s, i, 3, xr, bas(z, 0.0), wr, "Les sous-domaines des "
                 "fréquences.", h=0.5, num="Tableau 2")
    tableau(s, i, 3, [["Domaine", "Fréquences"],
                      ["Infrasons", "en dessous de 20 Hz"],
                      ["Sons graves", "20 Hz — 200 Hz"],
                      ["Sons mediums", "200 Hz — 2 000 Hz"],
                      ["Sons aigus", "2 000 Hz — 20 000 Hz"],
                      ["Ultrasons", "au-dessus de 20 000 Hz"]],
            xr, bas(zt, 0.1), wr, 0.78, taille=13)

    # --- IV.A · Images 10 et 11 ---------------------------------------------
    s, i = page("IV", PIV, SA)
    c10 = P("t3c1-champ-auditif-especes-source.jpg")
    f = image(s, i, 1, c10, 0.9, 2.8, w=18.6)
    legende(s, i, 1, 0.9, bas(f, 0.15), 18.6,
            "Les infrasons et les ultrasons ont été définis par rapport au "
            "champ auditif humain. Les autres espèces sont capables "
            "d'entendre des sons que nous ne percevons pas : l'éléphant et la "
            "taupe descendent dans les infrasons, le chat et le chien "
            "dépassent 40 000 Hz, la chauve-souris et le dauphin atteignent "
            "160 000 Hz.", h=2.4, num="Image 10")
    c11 = P("t3c1-acuite-age-source.jpg")
    f = image(s, i, 2, c11, 20.3, 2.8, w=12.7)
    legende(s, i, 2, 20.3, bas(f, 0.15), 12.7,
            "Altération de l'acuité auditive avec l'âge. La perte porte "
            "surtout sur les aigus : à 80 ans, elle atteint près de 70 dB "
            "vers 8 000 Hz alors qu'elle reste d'une vingtaine de décibels "
            "dans les graves. Au-delà d'environ 30 dB de perte commence la "
            "zone critique pour comprendre la parole.", h=3.6,
            num="Image 11")

    # --- IV.A · exercice 8 --------------------------------------------------
    s, i = page("IV", PIV, SA)
    exercice_q(s, i, 1, 3.5, 2.8, 26.9, 8, "Le clic du dauphin est-il audible ?",
               ["1. Calculer la fréquence de ce clic.",
                "2. Ce son est-il audible pour l'oreille humaine ? Justifier.",
                "3. Comment appelle-t-on un son de ce domaine de fréquences ?",
                "4. Le dauphin, lui, entend-il son propre clic ? S'appuyer "
                "sur l'Image 10."],
               contexte=[[("Pour se repérer et chasser, le grand dauphin "
                           "émet de brèves impulsions sonores, les ", {}),
                          ("clics d'écholocation", B),
                          (". Sur l'enregistrement de l'un de ces clics, on "
                           "mesure une période T = 8,0 µs.", {})]],
               donnees=[("Rappel : 1 µs = 1 microseconde = 10", DON),
                        ("−6", dict(DON, exp=True)), (" s", DON)])

    # --- IV.B · hauteur et timbre, Images 12 et 13 -------------------------
    SB = "B — Hauteur et timbre d'un son"
    s, i = page("IV", PIV, SB)
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, wg, None,
               ["Un son perçu est associé à des caractéristiques "
                "physiologiques :",
                [("— la ", {}), terme("hauteur"),
                 (", qui correspond à sa fréquence, dite fréquence "
                  "fondamentale ;", {})],
                [("— le ", {}), terme("timbre"),
                 (", qui correspond à la présence d'autres fréquences, dites "
                  "fréquences harmoniques — on parle alors de ", {}),
                 ("son complexe", B), (".", {})]],
               etiquette="DÉFINITION — HAUTEUR ET TIMBRE", fiche=True)
    z = texte(s, i, 1, 0.9, bas(d, 0.35), wg, 1.8,
              "Une même note, jouée par des instruments différents, aura la "
              "même hauteur mais un timbre différent, ce qui permet de "
              "reconnaître l'instrument.", taille=15)
    f = image(s, i, 2, F("t3c1f12"), 17.4, 2.6, w=15.6)
    legende(s, i, 2, 17.4, bas(f, 0.1), 15.6,
            [[("Image 12 — ", B), ("La même note, un La", {}),
              ("3", {"ind": True}),
              (", jouée par deux instruments. Les hauteurs sont bien les "
               "mêmes (mêmes périodes, donc même fréquence fondamentale "
               "f = 440 Hz), mais la présence d'autres fréquences — les "
               "harmoniques f", {}), ("2", {"ind": True}),
              (" = 880 Hz et f", {}), ("3", {"ind": True}),
              (" = 1 320 Hz — à des intensités diverses leur confère des "
               "timbres différents.", {})]], h=2.6)

    # --- IV.B · le son pur : Images 13 et 14 --------------------------------
    # posés sous la définition, ils passaient sous le pied de page : le son
    # pur a sa diapositive, avec le diapason et la partition du La
    s, i = page("IV", PIV, SB)
    f = image(s, i, 1, F("t3c1f13"), 0.9, 2.8, w=wg)
    lg = legende(s, i, 1, 0.9, bas(f, 0.1), wg,
                 "Le diapason produit un son pur : son signal est une "
                 "sinusoïde, sans aucune fréquence harmonique.", h=0.9,
                 num="Image 13")
    texte(s, i, 1, 0.9, bas(lg, 0.35), wg, 2.4,
          [[("Le son émis par un diapason est un ", {}), ("son pur", B),
            (" (ou son simple) : il ne possède pas de fréquences "
             "harmoniques, il est sinusoïdal.", {})]], taille=16)
    dp, pa = P("t3c1-diapason.jpg"), F("partition")
    hd = (15.6 - 0.6) / (1 / ratio(dp) + 1 / ratio(pa))
    wtot = hd / ratio(dp) + 0.6 + hd / ratio(pa)
    x14 = 17.4 + (15.6 - wtot) / 2
    a = image(s, i, 2, dp, x14, 2.8, h=hd)
    image(s, i, 2, pa, x14 + a.width / CM_ + 0.6, 2.8, h=hd)
    legende(s, i, 2, 17.4, 2.8 + hd + 0.2, 15.6,
            [[("Image 14 — ", B),
              ("La même chose, écrite de deux façons. À gauche, le diapason : "
               "frappé, il donne un son pur, toujours le même. À droite, ce "
               "que le musicien lit — une note posée dans le deuxième "
               "interligne de la portée, le La", {}), ("3", {"ind": True}),
              (". Ces deux objets désignent une seule et même grandeur "
               "physique : une fréquence de 440 Hz. C'est sur elle que tout "
               "un orchestre s'accorde avant de jouer.", {})]], h=3.0)

    # --- IV.B · exercice 9 --------------------------------------------------
    s, i = page("IV", PIV, SB)
    exercice_q(s, i, 1, 3.5, 2.6, 26.9, 9, "Trois signaux, aucun calcul",
               ["Répondre aux trois questions sans aucune mesure ni aucun "
                "calcul, en raisonnant uniquement sur l'allure des courbes.",
                "1. L'un de ces trois signaux n'est pas périodique. Lequel ? "
                "Justifier.",
                "2. Parmi les deux autres, lequel correspond au son le plus "
                "aigu ? Justifier.",
                "3. Ces deux sons ont-ils la même intensité ?"],
               contexte=[[("Trois microphones ont enregistré trois sons "
                           "différents. Leurs signaux sont tracés ci-dessous ",
                           {}), ("sur la même durée et à la même échelle", B),
                          (".", {})]],
               fig=(F("t3c1ex9"), ratio(F("t3c1ex9")), 9.4))

    # --- IV.C · niveau d'intensité sonore, Image 15 -------------------------
    SC = "C — Niveau d'intensité sonore"
    s, i = page("IV", PIV, SC)
    z = texte(s, i, 1, 0.9, 2.6, 32.1, 1.8,
              [[("Un son est d'autant plus ", {}), ("intense", B),
                (" que la source sonore vibre avec une ", {}),
                ("grande amplitude", B),
                (". Pourtant, un son deux fois plus intense n'est pas perçu "
                 "deux fois plus fort par l'oreille : l'oreille ne réagit "
                 "donc pas proportionnellement à l'intensité I de l'onde "
                 "sonore.", {})]], taille=15)
    d = encart(s, seq, i, 2, "definition", 0.9, bas(z, 0.3), 32.1, None,
               [[("Pour modéliser cette réalité, on définit le ", {}),
                 terme("niveau d'intensité sonore L"), (", exprimé en ", {}),
                 terme("décibel (dB)"),
                 (". Il n'est pas proportionnel à l'intensité I : quand "
                  "l'intensité est multipliée par 10, le niveau n'est pas "
                  "multiplié par 10 — il augmente de 10 dB. Le niveau 0 dB "
                  "est celui en dessous duquel une oreille moyenne ne détecte "
                  "pas le son.", {})]],
               etiquette="DÉFINITION — NIVEAU D'INTENSITÉ SONORE", fiche=True)
    y0 = bas(d, 0.35)
    wf = 15.6
    f = image(s, i, 3, F("t3c1f14"), 17.4, y0, w=wf)
    legende(s, i, 3, 17.4, bas(f, 0.1), wf,
            [[("Image 15 — ", B),
              ("L'amplitude A du signal est la hauteur qui sépare son sommet "
               "de sa position moyenne (flèche pleine). L'écart entre U", {}),
              ("max", {"ind": True}), (" et U", {}), ("min", {"ind": True}),
              (" — la hauteur crête à crête, en pointillé — en vaut le "
               "double.", {})]], h=1.8)
    texte(s, i, 3, 0.9, y0, 15.8, 6.0,
          [[("On a vu en partie 1 que l'", {}), terme("amplitude"),
            (" d'un signal vaut la ", {}), ("moitié", B),
            (" de l'écart entre ses extrema : c'est cette grandeur, déjà "
             "rencontrée, qui commande l'intensité du son.", {})],
           Par([("Rappel de la partie 1 — ", {"gras": True}),
                ("la hauteur d'un son (grave ou aigu) dépend de sa fréquence, "
                 "jamais de son amplitude. Les deux notions restent "
                 "indépendantes.", {})], taille=14, couleur=GRIS)],
          taille=15)

    # --- IV.C · danger, Images 16, 17 et 18 ---------------------------------
    s, i = page("IV", PIV, SC)
    wl = 21.4
    p = encart(s, seq, i, 1, "propriete", 0.9, 2.6, wl, None,
               [[("L'onde sonore peut représenter un ", {}),
                 terme("danger", GAMMA),
                 (" pour l'oreille si son niveau d'intensité sonore est trop "
                  "élevé. On définit une échelle de niveau sonore : au-delà "
                  "d'un certain niveau (seuil de danger vers 80 dB, seuil de "
                  "douleur vers 120 dB), la vibration peut endommager "
                  "l'oreille irrémédiablement. Dans un environnement bruyant, "
                  "il est conseillé de porter des protections (casque "
                  "anti-bruit, bouchons).", {})]],
               etiquette="PROPRIÉTÉ — DANGER DE L'EXPOSITION SONORE",
               fiche=True)
    f15 = F("t3c1f15")
    h16 = 12.4
    w16 = h16 / ratio(f15)
    x16 = 33.0 - w16 - 3.2
    im = image(s, i, 2, f15, x16, 2.6, h=h16)
    legende(s, i, 2, 33.0 - 3.0, 2.6, 3.0,
            "Échelle des niveaux d'intensité sonore.", h=2.4, num="Image 16")
    z = texte(s, i, 2, 0.9, bas(p, 0.3), wl, 4.8,
              [[("Le ", {}), ("seuil de danger", B),
                (", vers 80 dB, est celui du trafic routier, d'une tondeuse "
                 "ou d'une salle de sport bruyante. C'est un seuil "
                 "d'exposition prolongée : le dommage vient de la durée "
                 "autant que du niveau.", {})],
               [("Le ", {}), ("seuil de douleur", B),
                (", vers 120 dB, est celui d'un concert au pied des "
                 "enceintes, d'une sirène toute proche ou d'un décollage "
                 "d'avion. Là, le dommage peut être immédiat et "
                 "irréversible.", {})]], taille=14)
    y3 = bas(z, 0.2)
    hp = 17.2 - y3 - 1.2
    so = P("t3c1-sonometre.jpg")
    a = image(s, i, 3, so, 0.9, y3, h=hp)
    wa = a.width / CM_
    legende(s, i, 3, 0.9 + wa + 0.3, y3, 4.8,
            "Le niveau d'intensité sonore se mesure à l'aide d'un sonomètre.",
            h=2.0, num="Image 17")
    ca = P("t3c1-casque-anti-bruit.jpg")
    xc = 0.9 + wa + 5.4
    b2 = image(s, i, 3, ca, xc, y3, h=hp)
    legende(s, i, 3, xc + b2.width / CM_ + 0.3, y3,
            x16 - 0.4 - (xc + b2.width / CM_ + 0.3),
            "Dans un environnement bruyant, il est fortement conseillé de "
            "porter des protections auditives : casque anti-bruit ou "
            "bouchons d'oreilles.", h=3.0, num="Image 18")

    # --- IV.C · exercice 10 -------------------------------------------------
    s, i = page("IV", PIV, SC)
    exercice_q(s, i, 1, 1.9, 2.6, 30.1, 10, "Lire une échelle de niveau sonore",
               ["1. À l'aide de l'échelle de l'Image 16, donner pour chacune "
                "un ordre de grandeur du niveau d'intensité sonore, et les "
                "classer du plus faible au plus fort.",
                "2. Lesquelles dépassent le seuil de danger ? Que risque-t-on "
                "exactement ?",
                "3. Que conseiller au menuisier ? Et au spectateur du "
                "concert ?",
                "4. Le concert est-il « deux fois plus intense » que "
                "l'atelier, puisque l'écart entre les deux vaut à peu près "
                "deux fois 10 dB ?"],
               contexte="Voici cinq situations de la vie courante :",
               colonnes=(2, ["a. une conversation à table ;",
                             "b. un aspirateur en marche dans la pièce ;",
                             "c. une tondeuse à gazon que l'on pousse ;",
                             "d. un atelier de menuiserie, scie en "
                             "fonctionnement ;",
                             "e. un concert, debout au pied des enceintes."]))

    # ============================================================= CHECKLIST
    s, i = page("✓", "Pour le DS, je sais", "les huit compétences du chapitre")
    checklist(s, seq, i, "", [
        "Décrire le principe de l'émission d'un signal sonore par la mise en "
        "vibration d'un objet et l'intérêt d'une caisse de résonance.",
        "Expliquer le rôle joué par le milieu matériel dans la propagation "
        "d'un signal sonore.",
        "Citer une valeur approchée de la vitesse du son dans l'air et la "
        "comparer à d'autres vitesses.",
        "Définir et déterminer la période et la fréquence d'un signal, "
        "notamment à partir de sa représentation temporelle.",
        "Citer les domaines de fréquences des sons audibles, des infrasons et "
        "des ultrasons.",
        "Relier qualitativement la fréquence à la hauteur d'un son audible.",
        "Relier qualitativement intensité sonore et niveau d'intensité "
        "sonore.",
        "Exploiter une échelle de niveau d'intensité sonore et citer les "
        "dangers de l'exposition sonore.",
    ], kahoots=[
        ("bilan émission et perception d'un son",
         "https://create.kahoot.it/share/bilan-emission-et-perception-d-un-son/"
         "247395f6-5278-4e96-8047-471069e977b9"),
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


CM_ = 360000         # EMU par cm, pour relire la largeur d'une image posée


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("usage : python diapo_t3c1.py <dossier-des-figures>\n"
                         "  les figures sont extraites de la page si absentes")
    construire(sys.argv[1])
