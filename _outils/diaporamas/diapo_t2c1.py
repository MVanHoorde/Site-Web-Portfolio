#!/usr/bin/env python3
"""
diapo_t2c1.py — contenu du diaporama de projection du chapitre T2-C1,
« Décrire le mouvement ».

Ce fichier ne contient QUE ce qui est propre au chapitre. La charte et les
composants viennent de `gabarit_diapo.py` (non modifié).

USAGE
    python diapo_t2c1.py <dossier-des-figures>

    Produit assets/pptx/pc/diaporama-2nde-t2c1.pptx

ORDRE — celui de la page et de la fiche (`_outils/fiches/fiche_t2c1.py`,
liste `blocs`), sous-partie par sous-partie : I · Système et référentiel,
II · Trajectoire et vecteur déplacement, III · Vitesse d'un système. Numéros
d'image du site (R6) : Image 1 à 15, plus l'Image 11 bis.

✎ — huit crayons, exactement les huit `a-noter` de la page (choix de Loïc du
25/11/2026) : définitions du système et de la trajectoire, expression du
vecteur déplacement, formule et caractéristiques des deux vecteurs vitesse,
tableau « Les variations de la vitesse ».

VECTEURS — PowerPoint n'a pas de flèche au-dessus d'un groupe de lettres
(la flèche combinante U+20D7 ne couvre qu'un caractère). Les expressions
vectorielles sont donc COMPOSÉES (`expr`) : chaque vecteur est un texte
Cambria natif, surmonté d'une flèche dessinée à sa largeur exacte, mesurée
sur le fichier de police (PIL) — rien n'est aplati en image. Dans les
phrases courantes, on écrit « le vecteur OMᵢ » sans flèche.

QUIZ — les Kahoot sont remplacés par les quiz Diapason (QR code fixe de
chaque salle, relu par décodage à chaque génération) : diagnostic avant I,
trajectoire après l'exercice 1, vecteurs avec le rappel de maths, unités
après l'exercice 4, bilan sur la checklist.

🔴 AUCUNE CORRECTION À L'ÉCRAN. Les SVG de correction (`t2c1-cx*`) sont
supprimés du dossier dès l'extraction.
"""

import math
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from gabarit_diapo import (          # noqa: E402
    ALPHA, BETA, BLANC, ENCRE, GAMMA, GENRES, GRIS, GRILLE, MONO, CORPS, OCRE,
    PAPIER, TITRES, Par, Sequence, bandeau, bas, cm, diapo, diapo_titre,
    encart, exercice, formule, hauteur_exercice, hauteur_texte, picto_fiche,
    pied, presentation, terme, titre_partie, _cadre, _habiller, _sans_trait,
    _texte,
)
from PIL import Image, ImageFont      # noqa: E402
from pptx.dml.color import RGBColor   # noqa: E402
from pptx.enum.shapes import MSO_CONNECTOR  # noqa: E402
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN  # noqa: E402
from pptx.oxml.ns import qn           # noqa: E402
from lxml import etree                # noqa: E402

from animer import controler, minuter   # noqa: E402

ICI = Path(__file__).resolve().parent
RACINE = ICI.parents[1]
PAGE = RACINE / "pages" / "2nde-pc-t2-c1-decrire-le-mouvement.html"
IMG = RACINE / "assets" / "img" / "pc" / "2nde-pc-t2-c1"
SORTIE = RACINE / "assets" / "pptx" / "pc" / "diaporama-2nde-t2c1.pptx"

CHAPITRE = "Thème 2 · Chapitre 1 — Décrire le mouvement"
ANNEE = "2026 / 2027"

LABELLISEES = ("t2c1-rep", "t2c1-traj", "t2c1-rv", "t2c1-pos", "t2c1-ex2",
               "t2c1-con", "t2c1-ex3", "t2c1-vm", "t2c1-tan", "t2c1-mcu",
               "t2c1-memo-con", "t2c1-memo-aug", "t2c1-memo-dim")

DIAPASON = "https://mvanhoorde.github.io/Site-Web-Portfolio/outils/quiz/?salle="
QUIZ = {
    "MVTDG2": "Diagnostic — mouvement et interactions",
    "MVTTR4": "Trajectoire et mouvement",
    "MVTVC5": "Les vecteurs",
    "MVTUN3": "Unités, grandeurs et conversions",
    "MVTBN6": "Bilan — décrire un mouvement",
}

B = {"gras": True}
Q = {"italique": True}
I_ = {"ind": True}
PT_CM = 0.03528
SEPIA = RGBColor(0x8A, 0x6D, 0x3B)

# --------------------------------------------------- mesure des polices
FONTES = Path("C:/Windows/Fonts")
FICHIERS_POLICE = {
    ("Calibri", False, False): "calibri.ttf",
    ("Calibri", True, False): "calibrib.ttf",
    ("Calibri", False, True): "calibrii.ttf",
    ("Calibri", True, True): "calibriz.ttf",
    ("Cambria", False, False): "cambria.ttc",
    ("Cambria", True, False): "cambriab.ttf",
    ("Cambria", False, True): "cambriai.ttf",
    ("Cambria", True, True): "cambriaz.ttf",
    ("Courier New", False, False): "cour.ttf",
    ("Courier New", True, False): "courbd.ttf",
    ("Courier New", False, True): "couri.ttf",
    ("Courier New", True, True): "courbi.ttf",
}
_cache = {}
REDUC = 0.66     # taille d'un indice / exposant rendu par PowerPoint


def _fonte(police, gras, ital):
    cle = (police, bool(gras), bool(ital))
    if cle not in _cache:
        _cache[cle] = ImageFont.truetype(
            str(FONTES / FICHIERS_POLICE.get(cle, "calibri.ttf")), 200)
    return _cache[cle]


def largeur(runs, pt, police=CORPS, gras=False, ital=False):
    """Largeur en cm d'une suite de morceaux (texte, {options})."""
    tot = 0.0
    for m in runs:
        t, o = m if isinstance(m, tuple) else (m, {})
        f = _fonte(o.get("police", police), o.get("gras", gras),
                   o.get("italique", ital))
        k = REDUC if (o.get("ind") or o.get("exp")) else 1.0
        tot += f.getlength(t) / 200 * pt * k * PT_CM
    return tot


SOUS = dict(zip("₀₁₂₃₄₅₆₇₈₉ᵢⱼ₊₋", "0123456789ij+−"))


def indices(runs):
    """Remplace les chiffres et lettres indices Unicode par de VRAIS
    indices (R4) : Courier New ne les dessine pas, PowerPoint irait les
    chercher dans une autre police."""
    out = []
    for t, o in runs:
        buf, mode = "", False
        for ch in t:
            m = ch in SOUS
            if m != mode and buf:
                out.append((buf, dict(o, ind=True) if mode else o))
                buf = ""
            mode = m
            buf += SOUS.get(ch, ch)
        if buf:
            out.append((buf, dict(o, ind=True) if mode else o))
    return out


def runs_de(p):
    if isinstance(p, str):
        return [(p, {})]
    return [m if isinstance(m, tuple) else (m, {}) for m in p]


def h_par(p, utile, pt=15, police=CORPS, ital=False):
    """Hauteur (cm) d'un paragraphe à `pt`, interligne 1,15 + 6 pt après —
    PowerPoint rend une ligne de 15 pt ainsi sur 0,95 cm (relevé de T3-C1)."""
    w = largeur(runs_de(p), pt, police, ital=ital)
    lignes = max(1, math.ceil(w / (utile * 0.97)))
    return lignes * (pt * 1.22 * 1.15 * PT_CM) + 6 * PT_CM


# ----------------------------------------------------- expressions
# Une expression = liste d'atomes :
#   "texte" ou [(texte, opts), …]        — texte ordinaire
#   ("v", [(texte, opts), …])            — vecteur : flèche au-dessus
#   ("f", [atomes du haut], [atomes du bas]) — fraction (R3)
FLECHE_DY = 0.02     # cm sous le haut de la boîte du vecteur
GAP = 0.2            # cm entre deux atomes d'une expression


def V(*morceaux):
    return ("v", [m if isinstance(m, tuple) else (m, {}) for m in morceaux])


def Fr(haut, bas_):
    return ("f", haut, bas_)


def _w_atome(a, pt):
    if isinstance(a, tuple) and a[0] == "f":
        return max(_w_rangee(a[1], pt * 0.92), _w_rangee(a[2], pt * 0.92)) + 0.5
    runs = a[1] if isinstance(a, tuple) else runs_de(a)
    return largeur(runs, pt, TITRES, ital=True)


def _w_rangee(rangee, pt):
    return sum(_w_atome(a, pt) for a in rangee) + GAP * (len(rangee) - 1)


def _h_ligne(pt):
    return pt * 1.2 * PT_CM


def h_expr(rangee, pt):
    """Hauteur occupée par une expression (fraction comprise)."""
    if any(isinstance(a, tuple) and a[0] == "f" for a in rangee):
        return 2 * _h_ligne(pt * 0.92) + 0.55
    return _h_ligne(pt) + 0.45


def expr(s, seq, i, rang, rangee, x, y_mid, pt=22, couleur=ENCRE,
         centre=False):
    """Pose une expression ; (x, y_mid) = bord gauche (ou centre) et milieu."""
    if centre:
        x -= _w_rangee(rangee, pt) / 2
    for a in rangee:
        w = _w_atome(a, pt)
        if isinstance(a, tuple) and a[0] == "f":
            trait = _sans_trait(_cadre(s, x + 0.08, y_mid - 0.02, w - 0.16,
                                       0.045))
            trait.fill.solid()
            trait.fill.fore_color.rgb = couleur
            seq.marque(i, rang, trait)
            p2 = pt * 0.92
            hl = _h_ligne(p2)
            expr(s, seq, i, rang, a[1], x + w / 2, y_mid - 0.12 - hl / 2, p2,
                 couleur, centre=True)
            expr(s, seq, i, rang, a[2], x + w / 2, y_mid + 0.14 + hl / 2, p2,
                 couleur, centre=True)
        else:
            vec = isinstance(a, tuple) and a[0] == "v"
            runs = a[1] if vec else runs_de(a)
            hl = _h_ligne(pt)
            top = y_mid - hl / 2 + (0.06 if vec else 0)
            z = _texte(s, x, top, w + 0.3, hl, [runs], taille=pt,
                       police=TITRES, couleur=couleur, italique=True)
            z.text_frame.word_wrap = False
            seq.marque(i, rang, z)
            if vec:
                y_f = top + FLECHE_DY
                fl = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,
                                            cm(x + 0.04), cm(y_f),
                                            cm(x + w + 0.02), cm(y_f))
                fl.line.color.rgb = couleur
                fl.line.width = cm(pt * 0.0022)
                ln = fl.line._get_or_add_ln()
                tail = etree.SubElement(ln, qn("a:tailEnd"))
                tail.set("type", "triangle")
                tail.set("w", "sm")
                tail.set("len", "sm")
                seq.marque(i, rang, fl)
        x += w + GAP
    return x


# ------------------------------------------------- bloc composé
def bloc(s, seq, i, rang, genre, x, y, w, items, etiquette=None,
         fiche=False, h=None):
    """Un encart dont le corps mêle texte et expressions composées.

    items : ("t", paragraphe[, taille]) · ("e", rangee[, pt]) · ("g", hauteur)
    La hauteur se calcule AVANT de dessiner : le cadre passe dessous."""
    utile = w - 0.9
    hauts = []
    for it in items:
        if it[0] == "t":
            hauts.append(h_par(it[1], utile, it[2] if len(it) > 2 else 15))
        elif it[0] == "e":
            hauts.append(h_expr(it[1], it[2] if len(it) > 2 else 20) + 0.1)
        else:
            hauts.append(it[1])
    if h is None:
        h = round(0.95 + sum(hauts) + 0.35, 2)
    couleur, defaut = GENRES[genre]
    cadre = _cadre(s, x, y, w, h)
    _habiller(cadre, genre)
    seq.marque(i, rang, cadre)
    filet = _sans_trait(_cadre(s, x, y, 0.13, h))
    filet.fill.solid()
    filet.fill.fore_color.rgb = couleur
    seq.marque(i, rang, filet)
    z = _texte(s, x + 0.45, y + 0.28, w - 1.0, 0.5, etiquette or defaut,
               taille=10, police=MONO, couleur=couleur, gras=True)
    seq.marque(i, rang, z)
    cur = y + 0.95
    for it, hh in zip(items, hauts):
        if it[0] == "t":
            z = _texte(s, x + 0.45, cur, utile, hh, [it[1]],
                       taille=it[2] if len(it) > 2 else 15, interligne=1.15,
                       espacement=6)
            seq.marque(i, rang, z)
        elif it[0] == "e":
            expr(s, seq, i, rang, it[1], x + w / 2, cur + hh / 2,
                 it[2] if len(it) > 2 else 20, centre=True)
        cur += hh
    if fiche:
        place = w - 1.0 - len(etiquette or defaut) * 0.6 * 10 * PT_CM
        picto_fiche(s, seq, i, rang, x + w - 1.05, y + 0.2,
                    libelle=place > 4.6)
    return cadre


# ------------------------------------------------------------ extraction
def extraire(dossier):
    dossier.mkdir(parents=True, exist_ok=True)
    subprocess.run(["node", str(ICI / "extraire_figures.mjs"), str(PAGE),
                    str(dossier)], check=True)
    # R1 : les SVG de correction ne restent pas dans le dossier
    for f in dossier.glob("site-t2c1-cx*.png"):
        f.unlink()
    titre_fond(dossier)


def titre_fond(dossier):
    """Le pélican de Marey fondu dans l'encre, à droite. Le dégradé est
    CUIT dans l'image : PowerPoint ne sait pas dégrader une image (§5)."""
    photo = Image.open(IMG / "t2c1-marey-pelican.jpg").convert("RGB")
    hh = 1200
    photo = photo.resize((round(photo.width * hh / photo.height), hh))
    encre = Image.new("RGB", photo.size, (0x14, 0x1A, 0x26))
    sombre = Image.blend(photo, encre, 0.45)
    masque = Image.new("L", photo.size)
    for x in range(photo.size[0]):
        a = min(1.0, x / (0.6 * photo.size[0]))
        masque.paste(int(255 * a * a), (x, 0, x + 1, photo.size[1]))
    pel = Image.composite(sombre, encre, masque)
    fond = Image.new("RGB", (2120, 1200), (0x14, 0x1A, 0x26))
    fond.paste(pel, (2120 - pel.width, 0))
    fond.save(dossier / "titre-pelican.png")


def qr_png(dossier, code):
    """QR code d'une salle Diapason, RELU par décodage (un QR faux ne se voit
    pas à l'œil et envoie la classe entière nulle part)."""
    import qrcode
    from pyzbar.pyzbar import decode
    url = DIAPASON + code
    q = qrcode.QRCode(border=2, box_size=12,
                      error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(url)
    q.make(fit=True)
    im = q.make_image(fill_color=(0x14, 0x1A, 0x26),
                      back_color=(255, 255, 255)).convert("RGB")
    f = dossier / f"qr-{code}.png"
    im.save(f)
    lu = [d.data.decode() for d in decode(Image.open(f))]
    if lu != [url]:
        raise SystemExit(f"✗ QR {code} relu « {lu} » au lieu de {url}")
    print(f"  ✓ QR relu : {url}")
    return f


def ratio(chemin):
    w, h = Image.open(chemin).size
    return h / w


# ------------------------------------------------------------ construction
def construire(dossier_figs):
    figs = Path(dossier_figs)
    if not all((figs / f"site-{c}.png").exists() for c in LABELLISEES) or \
            not (figs / "titre-pelican.png").exists():
        extraire(figs)
    for f in figs.glob("site-t2c1-cx*.png"):
        f.unlink()
    print("QR codes Diapason :")
    QR = {c: qr_png(figs, c) for c in QUIZ}

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

    def legende(s, i, rang, x, y, w, texte, num=None, align=PP_ALIGN.LEFT):
        corps = indices(runs_de(texte))
        if num:
            corps = [(num + " — ", B)] + corps
        h = h_par(corps, w, 10, MONO) + 0.1
        z = _texte(s, x, y, w, h, [corps], taille=10, police=MONO,
                   couleur=GRIS, align=align, interligne=1.1)
        seq.marque(i, rang, z)
        return z

    def texte(s, i, rang, x, y, w, corps, taille=15, **k):
        paras = corps if isinstance(corps, list) and corps and \
            isinstance(corps[0], (list, Par)) else [corps]
        h = sum(h_par(p.contenu if isinstance(p, Par) else p, w,
                      (p.taille if isinstance(p, Par) and p.taille else taille))
                for p in paras) + 0.1
        z = _texte(s, x, y, w, h, paras, taille=taille, interligne=1.15,
                   espacement=6, **k)
        seq.marque(i, rang, z)
        return z

    def transition(s, i, rang, x, y, w, phrase):
        """La transition franche du site (`.transition`) : filet teal, italique."""
        corps = [("→ ", {"couleur": BETA, "gras": True, "italique": False})] \
            + runs_de(phrase)
        h = h_par(corps, w - 0.6, 18, TITRES, ital=True)
        f = _sans_trait(_cadre(s, x, y, 0.1, h))
        f.fill.solid()
        f.fill.fore_color.rgb = BETA
        seq.marque(i, rang, f)
        z = _texte(s, x + 0.45, y + 0.05, w - 0.6, h, [corps], taille=18,
                   police=TITRES, italique=True, interligne=1.1)
        seq.marque(i, rang, z)
        return f

    def qr_bloc(s, i, rang, x, y, w, code, quand, cote=3.6):
        """Le QR code fixe d'un quiz Diapason, et son lien posé sur le RUN."""
        url = DIAPASON + code
        h = cote + 0.6
        c = _cadre(s, x, y, w, h)
        c.fill.solid()
        c.fill.fore_color.rgb = BLANC
        c.line.color.rgb = RGBColor(0xD8, 0xD3, 0xC4)
        c.line.width = cm(0.02)
        c.shadow.inherit = False
        c.text_frame.text = ""
        seq.marque(i, rang, c)
        f = _sans_trait(_cadre(s, x, y, 0.13, h))
        f.fill.solid()
        f.fill.fore_color.rgb = OCRE
        seq.marque(i, rang, f)
        q = s.shapes.add_picture(str(QR[code]), cm(x + 0.4), cm(y + 0.3),
                                 width=cm(cote), height=cm(cote))
        q.click_action.hyperlink.address = url
        seq.marque(i, rang, q)
        xt, wt = x + cote + 0.75, w - cote - 1.0
        z = _texte(s, xt, y + 0.35, wt, h - 0.6,
                   [[("♪ DIAPASON — QUIZ", {"police": MONO, "taille": 10,
                                           "gras": True, "couleur": OCRE})],
                    Par(QUIZ[code], taille=16, police=TITRES),
                    Par(quand, taille=12, couleur=GRIS, italique=True),
                    Par([("salle ", {}), (code, B)], taille=11, police=MONO,
                        couleur=GRIS)],
                   taille=15, interligne=1.05, espacement=3)
        for r in z.text_frame.paragraphs[1].runs:
            r.hyperlink.address = url
        seq.marque(i, rang, z)
        return c

    def formule_v(s, i, rang, gauche, droite, grandeurs, x, y, w, h=3.8):
        """Panneau formule (R3) dont l'expression est COMPOSÉE (vecteurs
        fléchés, fraction en trois objets), avec son ✎."""
        formule(s, seq, i, rang, [""], grandeurs, x, y, w, h)
        rang_e = gauche + [" = "] + droite
        expr(s, seq, i, rang, rang_e, x + 0.6 + w * 0.24, y + h / 2, 24,
             couleur=PAPIER, centre=True)
        picto_fiche(s, seq, i, rang, x + w - 1.1, y - 0.55)

    def exercice_cote(s, i, rang, x, y, w, h, num, titre, questions, fig,
                      wf, leg=None, contexte=None):
        """Exercice dont le support, haut et étroit, se pose À DROITE dans le
        cadre (R7) ; contexte et questions à gauche."""
        exercice(s, seq, i, rang, x, y, w, num, titre, h=h)
        r = ratio(fig)
        hf = min(h - 1.6 - (0.7 if leg else 0), wf * r)
        wf = hf / r
        xf = x + w - wf - 0.5
        im = image(s, i, rang, fig, xf, y + 0.95, w=wf)
        if leg:
            legende(s, i, rang, xf - 1.0, bas(im, 0.1), wf + 1.0, leg)
        wt = xf - x - 1.1
        paras = ([Par(contexte)] if contexte else []) + \
            [Par(q, italique=True) for q in questions]
        z = _texte(s, x + 0.45, y + 1.0, wt, h - 1.5, paras, taille=15,
                   interligne=1.15, espacement=8)
        seq.marque(i, rang, z)

    def exercice_q(s, i, rang, x, y, w, num, titre, questions, **k):
        """Plusieurs questions, chacune sur sa ligne, en italique."""
        base = hauteur_exercice(w, **k)
        qs = [Par(q, italique=True) for q in questions]
        hq = sum(h_par(q.contenu, w - 1.05, 15, ital=True) for q in qs)
        hh = round(base + hq + 0.25, 2)
        cadre = exercice(s, seq, i, rang, x, y, w, num, titre, h=hh, **k)
        z = _texte(s, x + 0.45, y + base - 0.4 + 0.25, w - 0.9, hq, qs,
                   taille=15, interligne=1.15, espacement=6)
        seq.marque(i, rang, z)
        return cadre

    Mi = [("M", {}), ("i", I_)]
    Mj = [("M", {}), ("j", I_)]
    Mi1 = [("M", {}), ("i+1", I_)]

    # ================================================================ TITRE
    s = diapo_titre(
        prs, seq, "THÈME 2 · MOUVEMENT ET INTERACTIONS",
        "Chapitre 1 — Décrire le mouvement",
        "Avant de comprendre pourquoi les objets bougent, savoir dire "
        "comment ils bougent.",
        ANNEE, fond=None,
        logo=RACINE / "assets" / "img" / "logo-isaac-lycee.png")
    fil = s.shapes.add_picture(str(figs / "titre-pelican.png"), cm(0), cm(0),
                               width=cm(33.87), height=cm(19.05))
    arbre = s.shapes._spTree
    arbre.remove(fil._element)
    arbre.insert(3, fil._element)
    _texte(s, 20.0, 16.6, 13.0, 0.6,
           "Étienne-Jules Marey, pélican en vol, années 1880 — domaine public",
           taille=9, police=MONO, couleur=RGBColor(0x9A, 0xA2, 0xB2),
           align=PP_ALIGN.RIGHT)
    n += 1

    # ============================================================ OUVERTURE
    s, i = page("→", "Ton premier chapitre de mécanique")
    texte(s, i, 1, 0.9, 2.9, 19.4,
          [Par("Avant de comprendre pourquoi les objets bougent, il faut "
               "savoir dire comment ils bougent.", taille=26, police=TITRES),
           Par("Cette année : décrire le mouvement, modéliser les actions qui "
               "s'exercent sur un système, puis le principe d'inertie.",
               taille=20),
           Par("Si tu continues la physique-chimie, en première tu relieras la "
               "variation de la vitesse aux forces et à l'énergie ; en "
               "terminale, avec la deuxième loi de Newton, tu calculeras la "
               "trajectoire d'un ballon ou l'orbite d'un satellite.",
               taille=20),
           Par([("Ici, tout commence par trois mots : ", {}),
                terme("système"), (", ", {}), terme("référentiel"),
                (", ", {}), terme("trajectoire"), (".", {})], taille=22)])
    qr_bloc(s, i, 2, 21.3, 3.0, 11.7, "MVTDG2",
            "Avant le thème : ce que tu sais déjà du collège.", cote=4.2)

    # =========================================== I — SYSTÈME ET RÉFÉRENTIEL
    PI = "Système et référentiel"
    intercalaire("I", PI, ["A — Le système", "B — Le référentiel",
                           "C — Exemples de référentiels"])

    # --- I.A · système, point matériel, Image 1 ----------------------------
    s, i = page("I", PI, "A — Le système")
    wl = 19.2
    texte(s, i, 1, 0.9, 2.5, wl,
          "Pour étudier le mouvement d'un objet, il est nécessaire de fixer "
          "l'objet d'étude et ce par rapport à quoi le mouvement est décrit.",
          taille=14, couleur=GRIS)
    d = encart(s, seq, i, 1, "definition", 0.9, 4.2, wl, None,
               [[("Un ", {}), terme("système"),
                 (" est un objet, ou un ensemble d'objets reliés entre eux, "
                  "dont on étudie ici le mouvement.", {})]],
               etiquette="DÉFINITION — SYSTÈME", fiche=True)
    texte(s, i, 2, 0.9, bas(d, 0.4), wl,
          [[("Pour simplifier cette étude, ", {}),
            ("on modélise souvent le système par un point", B),
            (", son centre de gravité, auquel on attribue la masse du "
             "système. C'est le modèle du ", {}), terme("point matériel"),
            (" : on parle alors de ", {}), ("mécanique du point", Q),
            (".", {})]])
    p1 = P("t2c1-pomme-point-materiel-source.jpg")
    im = image(s, i, 2, p1, 21.6, 2.6, h=11.6)
    legende(s, i, 2, 20.9, bas(im, 0.15), 12.1,
            "Le système étudié est la pomme. Dans le modèle du point matériel "
            "(à droite), ses positions successives sont symbolisées par des "
            "points.", num="Image 1")

    # --- I.A · Image 2, perte d'informations, échelles ----------------------
    s, i = page("I", PI, "A — Le système")
    im = image(s, i, 1, P("t2c1-perchiste-point-materiel.jpg"), 2.95, 2.6,
               w=28.0)
    lg = legende(s, i, 1, 0.9, bas(im, 0.12), 32.1,
                 "La mécanique du point ne permet pas d'étudier les rotations "
                 "et déformations d'un système, importantes en sciences de "
                 "l'ingénieur. Il faut alors prendre en compte la forme de "
                 "l'objet : c'est la mécanique du solide. Ici, on perd "
                 "beaucoup d'informations sur les postures du perchiste.",
                 num="Image 2")
    y = bas(lg, 0.35)
    z1 = texte(s, i, 2, 0.9, y, 15.6,
               [[("Ce modèle a un prix : la perte d'informations. ", B),
                 ("Réduit à un point, le système ne tourne plus sur lui-même "
                  "et ne se déforme plus : tout ce qui concerne ses ", {}),
                 ("rotations", B), (" et ses ", {}), ("déformations", B),
                 (" disparaît de la description.", {})]], taille=14)
    z2 = texte(s, i, 3, 17.4, y, 15.6,
          [[("Tout est une question d'échelle. ", B),
            ("La Terre, de 12 700 km de diamètre, tourne autour du Soleil à "
             "150 millions de kilomètres, en un an : à cette échelle, elle "
             "n'est qu'un point. Pour décrire la course d'un joueur sur un "
             "terrain de football, la Terre n'est plus du tout un point : "
             "c'est le sol sur lequel il court.", {})]], taille=14)
    # sous le plus long des deux paragraphes (chevauchement vu à l'export
    # PowerPoint du 25/11 : la dernière ligne passait sous la transition)
    transition(s, i, 4, 0.9, max(bas(z1, 0.35), bas(z2, 0.35)), 32.1,
               [("Un système, réduit à un point. Reste à dire ", {}),
                ("par rapport à quoi", {"italique": False, "gras": True}),
                (" il bouge.", {})])

    # --- I.B · référentiel, repères d'espace et de temps --------------------
    s, i = page("I", PI, "B — Le référentiel")
    d = encart(s, seq, i, 1, "definition", 0.9, 2.6, 32.1, None,
               [[("Pour étudier le mouvement d'un système, il faut préciser le ",
                  {}), terme("référentiel"),
                 (", c'est-à-dire l'objet de référence par rapport auquel on "
                  "décrit le mouvement.", {})],
                [("On associe à un référentiel un ", {}),
                 ("repère d'espace", B), (" et un ", {}),
                 ("repère de temps", B), (".", {})]],
               etiquette="DÉFINITION — RÉFÉRENTIEL")
    y = bas(d, 0.45)
    for k, (titre, chemin, hh, leg, num, rang) in enumerate((
            ("REPÈRE D'ESPACE", F("t2c1-rep"), 5.0,
             "Le repère d'espace : un point d'origine O et des axes, ici les "
             "vecteurs i et j.", "Image 3", 2),
            ("REPÈRE DE TEMPS", P("t2c1-chronometre.jpg"), 5.0,
             "Pour repérer un événement dans le temps, il faut choisir une "
             "horloge et une origine des temps.", "Image 4", 3))):
        x0 = 0.9 + k * 16.4
        _ = texte(s, i, rang, x0, y, 15.7,
                  [[(titre, {"police": MONO, "taille": 11, "gras": True,
                             "couleur": BETA})]], taille=11)
        im = image(s, i, rang, chemin, x0 + (15.7 - hh / ratio(chemin)) / 2,
                   y + 0.75, h=hh)
        lgs = legende(s, i, rang, x0, bas(im, 0.12), 15.7, leg, num=num,
                      align=PP_ALIGN.CENTER)
    y2 = bas(lgs, 0.35)
    texte(s, i, 3, 17.3, y2, 15.7,
          [[("Pour un athlète, l'horloge est le chronomètre ; l'origine des "
             "dates est le tir du pistolet, quand on le démarre. Unité SI du "
             "temps : la ", {}), ("seconde", B), (" (s).", {})]], taille=13)
    encart(s, seq, i, 4, "propriete", 0.9, y2, 15.7, None,
           ["La description du mouvement d'un système dépend en premier lieu "
            "du choix du référentiel."], etiquette="PROPRIÉTÉ")

    # --- I.C · trois référentiels, Images 5 à 7 -----------------------------
    s, i = page("I", PI, "C — Exemples de référentiels")
    transition(s, i, 0, 0.9, 2.45, 32.1,
               "Trois référentiels reviennent sans cesse : à chacun son "
               "repère d'espace.")
    wc = 10.3
    defs = (
        ("TERRESTRE", [("Pour un système sur la Terre ou à son voisinage : "
                        "le ", {}), terme("référentiel terrestre"),
                       (", repère défini par le sol ou tout objet fixe par "
                        "rapport au sol.", {})],
         P("t2c1-referentiel-terrestre-athlete.jpg"), "Image 5"),
        ("GÉOCENTRIQUE", [("Pour un système tournant autour de la Terre (Lune, "
                           "satellites) : le ", {}),
                          terme("référentiel géocentrique"),
                          (", repère défini par le centre de la Terre et des "
                           "étoiles lointaines fixes.", {})],
         P("t2c1-referentiel-geocentrique-source.jpg"), "Image 6"),
        ("HÉLIOCENTRIQUE", [("Pour un système tournant autour du Soleil "
                             "(Terre, comètes) : le ", {}),
                            terme("référentiel héliocentrique"),
                            (", repère défini par le centre du Soleil et des "
                             "étoiles lointaines fixes.", {})],
         P("t2c1-referentiel-heliocentrique-source.jpg"), "Image 7"))
    hmax = max(hauteur_texte([c], wc - 1.05) for _, c, _, _ in defs)
    for k, (nom, corps, chemin, num) in enumerate(defs):
        x0 = 0.9 + k * (wc + 0.6)
        d = encart(s, seq, i, k + 1, "definition", x0, 4.0, wc,
                   round(0.95 + hmax + 1.0, 2), [corps],
                   etiquette="DÉFINITION — " + nom)
        im = image(s, i, k + 1, chemin, x0, bas(d, 0.4), w=wc)
        legende(s, i, k + 1, x0, bas(im, 0.1), wc,
                "Référentiel " + nom.lower() + ".", num=num)

    # ================================ II — TRAJECTOIRE ET VECTEUR DÉPLACEMENT
    PII = "Trajectoire et vecteur déplacement"
    intercalaire("II", PII, ["A — Trajectoire et mouvement d'un système",
                             "B — Vecteur position",
                             "C — Vecteur déplacement"])
    SA = "A — Trajectoire et mouvement d'un système"

    # --- II.A · trajectoire, Image 8 ---------------------------------------
    s, i = page("II", PII, SA)
    t = transition(s, i, 0, 0.9, 2.45, 32.1,
                   "Le référentiel choisi, on peut suivre les positions du "
                   "point, l'une après l'autre.")
    d = encart(s, seq, i, 1, "definition", 0.9, bas(t, 0.45), 32.1, None,
               [[("La ", {}), terme("trajectoire"),
                 (" d'un point matériel est la courbe formée par l'ensemble "
                  "de ses positions successives dans un référentiel donné.",
                  {})]],
               etiquette="DÉFINITION — TRAJECTOIRE", fiche=True)
    z = texte(s, i, 2, 0.9, bas(d, 0.4), 32.1,
              [[("Trois formes de trajectoire, qui donnent leur nom au "
                 "mouvement :", {})],
               [("— une portion de droite : mouvement ", {}),
                terme("rectiligne"), (" ;", {})],
               [("— un cercle ou un arc de cercle : mouvement ", {}),
                terme("circulaire"), (" ;", {})],
               [("— une courbe quelconque (ni droite, ni cercle) : "
                 "mouvement ", {}), terme("curviligne"), (".", {})]],
              taille=15)
    im = image(s, i, 3, F("t2c1-traj"), 6.5, bas(z, 0.1), w=20.9)
    legende(s, i, 3, 6.5, bas(im, 0.1), 20.9,
            "Trois formes de trajectoire, qui donnent leur nom au mouvement : "
            "rectiligne (à gauche), circulaire (au centre), curviligne "
            "(à droite).", num="Image 8")

    # --- II.A · ne pas confondre, chronophotographie ------------------------
    s, i = page("II", PII, SA)
    a = encart(s, seq, i, 1, "piege", 0.9, 2.6, 32.1, None,
               [[("La trajectoire, c'est le tracé", B),
                 (" : la ligne qui passe par toutes les positions du point, et "
                  "il y en a une infinité. Une chronophotographie n'en montre "
                  "que quelques-unes : la trajectoire est la ligne qui les "
                  "relie.", {})],
                [("Le mouvement, c'est la trajectoire et la façon dont la "
                  "vitesse évolue le long de ce tracé.", B)],
                [("Rectiligne, circulaire, curviligne", Q),
                 (" décrivent la forme de la trajectoire. ", {}),
                 ("Uniforme, accéléré, ralenti", Q),
                 (" décriront la vitesse (partie III). Décrire complètement "
                  "un mouvement, c'est donner les deux : « rectiligne "
                  "uniforme », « circulaire ralenti »…", {})],
                "Exemple : sur une même ligne droite, une voiture peut rouler "
                "à vitesse constante ou freiner. Même trajectoire, deux "
                "mouvements différents."],
               etiquette="ATTENTION — NE PAS CONFONDRE TRAJECTOIRE ET "
                         "MOUVEMENT")
    encart(s, seq, i, 2, "definition", 0.9, bas(a, 0.5), 32.1, None,
           [[("Une ", {}), terme("chronophotographie"),
             (" est la superposition de clichés pris à intervalles de temps "
              "réguliers ; elle permet de repérer l'évolution de la position "
              "d'un objet au cours du temps, d'en tracer la trajectoire et "
              "d'en calculer la vitesse.", {})]],
           etiquette="DÉFINITION — CHRONOPHOTOGRAPHIE")

    # --- II.A · Marey ------------------------------------------------------
    s, i = page("II", PII, SA)
    fu = P("t2c1-marey-fusil-photographique.jpg")
    im = image(s, i, 1, fu, 0.9, 2.6, h=8.6)
    wfu = im.width / 360000
    legende(s, i, 1, 0.9, bas(im, 0.1), wfu + 0.4,
            "La Nature n° 464, 22 avril 1882 — domaine public.")
    xt = 0.9 + wfu + 0.7
    texte(s, i, 1, xt, 2.6, 33.0 - xt,
          [[("HISTOIRE DES SCIENCES", {"police": MONO, "taille": 11,
                                      "gras": True, "couleur": SEPIA})],
           Par("Étienne-Jules Marey (1830 – 1904), le mouvement photographié",
               taille=20, police=TITRES),
           [("En 1882, le physiologiste français Étienne-Jules Marey veut "
             "comprendre le vol des oiseaux, trop rapide pour l'œil. Il "
             "invente un ", {}), ("fusil photographique", B),
            (" : on vise l'oiseau, on appuie sur la détente, et l'appareil "
             "prend ", {}), ("12 images par seconde", B), (".", {})]],
          taille=15)
    pe = P("t2c1-marey-pelican.jpg")
    hp = 17.0 - 9.0 - 1.4
    im = image(s, i, 2, pe, 33.0 - hp / ratio(pe), 9.0, h=hp)
    xp = im.left / 360000
    texte(s, i, 2, xt, 9.4, xp - xt - 0.5,
          [[("Il enregistre toutes les positions successives sur une seule "
             "plaque : c'est la ", {}), ("chronophotographie", B),
            (". Sur son pélican, on lit la trajectoire de l'oiseau… mais "
             "aussi ses battements d'ailes, que le modèle du point matériel "
             "effacerait.", {})]], taille=15)
    legende(s, i, 2, xp, bas(im, 0.08), 33.0 - xp,
            "Étienne-Jules Marey, pélican en vol, chronophotographie sur "
            "plaque fixe, années 1880 — domaine public.")

    # --- II.A · exercice 1 + quiz trajectoire --------------------------------
    s, i = page("II", PII, SA)
    pc = P("t2c1-chronophoto-perchiste.jpg")
    exercice(s, seq, i, 1, 0.9, 2.6, 20.6, 1, "Décrire un mouvement",
             fig=(pc, ratio(pc), 18.6),
             question="Décrire le mouvement figurant sur la "
                      "chronophotographie ci-dessus (Image 9 — saut à la "
                      "perche).")
    qr_bloc(s, i, 2, 22.1, 2.6, 10.9, "MVTTR4",
            "Après l'exercice 1 : trajectoire ou mouvement ?", cote=3.8)

    # --- II.B · rappel de maths sur les vecteurs + quiz ---------------------
    SB = "B — Vecteur position"
    s, i = page("II", PII, SB)
    t = transition(s, i, 0, 0.9, 2.45, 32.1,
                   "Pour aller plus loin que la forme de la trajectoire, il "
                   "faut repérer chaque position par une flèche.")
    wl = 18.6
    AB, BA, BC, AC = V("AB"), V("BA"), V("BC"), V("AC")
    r = bloc(s, seq, i, 1, "notation", 0.9, bas(t, 0.4), wl, [
        ("t", [("Le vecteur AB part du ", {}), ("point de départ", B),
               (" A et arrive au ", {}), ("point d'arrivée", B),
               (" B. La flèche se dessine à l'arrivée.", {})], 14),
        ("t", [("Trois caractéristiques : ", {}), ("direction", B),
               (" (la droite qui le porte), ", {}), ("sens", B),
               (" (de A vers B), ", {}), ("norme", B),
               (" (sa longueur, notée AB, sans flèche).", {})], 14),
        ("t", [("Deux vecteurs ", {}), ("colinéaires", B),
               (" ont la même direction : ils sont parallèles.", {})], 14),
        ("t", [("Vecteur opposé", B), (" : même direction, même norme, "
                                      "sens contraire.", {})], 14),
        ("e", [BA, " = −", AB, "     ",
               V("M", ("13", I_), "M", ("7", I_)), " = −",
               V("M", ("7", I_), "M", ("13", I_))], 19),
        ("t", [("Relation de Chasles", B),
               (" : aller de A à B, puis de B à C, revient à aller "
                "directement de A à C.", {})], 14),
        ("e", [AB, " + ", BC, " = ", AC], 19),
    ], etiquette="RAPPEL DE MATHÉMATIQUES — LES VECTEURS")
    xr = 0.9 + wl + 0.6
    wr = 33.0 - xr
    im = image(s, i, 2, F("t2c1-rv"), xr + 1.0, bas(t, 0.4), w=wr - 2.0)
    lg = legende(s, i, 2, xr, bas(im, 0.1), wr,
                 "À gauche, le vecteur AB. À droite, la relation de Chasles : "
                 "AB puis BC mènent au même point que AC.")
    encart(s, seq, i, 3, "piege", xr, bas(lg, 0.35), wr, None,
           [[("Le mot « origine » a deux sens. ", B),
             ("L'origine du repère, c'est le point O. Pour un vecteur, on "
              "dira « point de départ ».", {})]],
           etiquette="ATTENTION")
    qr_bloc(s, i, 4, xr, 17.2 - 3.4, wr, "MVTVC5",
            "Pour t'entraîner sur les vecteurs.", cote=2.8)

    # --- II.B · vecteur position, Images 10 et 11 ---------------------------
    s, i = page("II", PII, SB)
    z = texte(s, i, 1, 0.9, 2.6, 15.6,
              [[("Le ", {}), ("vecteur position", B),
                (" d'un système en mouvement dépend de l'origine du repère "
                 "choisi.", {})]])
    b = bloc(s, seq, i, 1, "notation", 0.9, bas(z, 0.3), 15.6, [
        ("t", "Le vecteur position du point Mᵢ par rapport à O se note ici :"),
        ("e", [V("O", "M", ("i", I_))], 24),
    ], etiquette="REMARQUE — NOTATION")
    im = image(s, i, 2, F("t2c1-pos"), 0.9 + (15.6 - 8.0) / 2, bas(b, 0.4),
               w=8.0)
    legende(s, i, 2, 0.9, bas(im, 0.1), 15.6,
            "Schéma théorique du vecteur position. Il se nomme d'après son "
            "point d'arrivée : ici M(tᵢ), d'où le vecteur OM(tᵢ).",
            num="Image 10")
    sk = P("t2c1-chronophoto-skieur.jpg")
    im = image(s, i, 3, sk, 17.4, 2.8, w=15.6)
    legende(s, i, 3, 17.4, bas(im, 0.12), 15.6,
            "Chronophotographie d'un skieur (à gauche). Simplification "
            "d'après le modèle du point matériel (à droite).",
            num="Image 11")

    # --- II.B · exercice 2 -------------------------------------------------
    s, i = page("II", PII, SB)
    exercice_cote(s, i, 1, 3.0, 2.6, 27.9, 14.6, 2, "Vecteur position",
                  ["1. Positionner votre repère spatial.",
                   "2. Légender les points M₇ et M₁₃.",
                   "3. Tracer les vecteurs position OM₇ et OM₁₃."],
                  F("t2c1-ex2"), 9.0,
                  leg="Les positions du skieur, relevées sur l'Image 11.")

    # --- II.C · vecteur déplacement, formule ✎ -----------------------------
    SC = "C — Vecteur déplacement"
    s, i = page("II", PII, SC)
    t = transition(s, i, 0, 0.9, 2.45, 32.1,
                   "Si le vecteur position dépend de l'origine, que reste-t-il "
                   "qui ne dépende que du mouvement ?")
    p = encart(s, seq, i, 1, "propriete", 0.9, bas(t, 0.45), 32.1, None,
               [[("Le ", {}), ("vecteur déplacement", B),
                 (" de ce système entre deux positions est la différence des "
                  "vecteurs position et ", {}),
                 ("ne dépend donc pas de l'origine du repère choisi", B),
                 (".", {})]],
               etiquette="PROPRIÉTÉ — VECTEUR DÉPLACEMENT")
    formule_v(s, i, 2, [V(*Mi, *Mj)],
              [V("O", *Mj), " − ", V("O", *Mi)],
              [[("MᵢMⱼ", B), ("  vecteur déplacement de Mᵢ vers Mⱼ", {})],
               [("OMᵢ, OMⱼ", B), ("  vecteurs position menant à Mᵢ et à "
                                  "Mⱼ", {})]],
              x=3.0, y=bas(p, 1.1), w=27.9, h=4.0)

    # --- II.C · démonstration + Image 11 bis -------------------------------
    s, i = page("II", PII, SC)
    wl = 19.0
    bloc(s, seq, i, 1, "methode", 0.9, 2.6, wl, [
        ("t", [("Pour aller de Mᵢ à Mⱼ, on passe par O, comme par une gare de "
                "correspondance (", {}), ("relation de Chasles", B),
               (") :", {})]),
        ("e", [V(*Mi, *Mj), " = ", V(*Mi, "O"), " + ", V("O", *Mj)]),
        ("t", "Or le vecteur MᵢO est l'opposé du vecteur OMᵢ :"),
        ("e", [V(*Mi, "O"), " = −", V("O", *Mi)]),
        ("t", "Donc :"),
        ("e", [V(*Mi, *Mj), " = −", V("O", *Mi), " + ", V("O", *Mj),
               " = ", V("O", *Mj), " − ", V("O", *Mi)]),
        ("t", "C'est exactement la construction de l'Image 11 bis, "
              "ci-contre."),
    ], etiquette="D'OÙ VIENT CETTE FORMULE ? — LA DÉMONSTRATION")
    cn = F("t2c1-con")
    hc = 12.6
    im = image(s, i, 2, cn, 20.5 + (12.5 - hc / ratio(cn)) / 2, 2.6, h=hc)
    legende(s, i, 2, 20.5, bas(im, 0.1), 12.5,
            "Construction du vecteur déplacement M₁₂M₂₆. En pointillés : "
            "OM₂₆ + (−OM₁₂) arrive au même point que M₁₂M₂₆ reporté depuis O.",
            num="Image 11 bis")

    # --- II.C · exercice 3 -------------------------------------------------
    s, i = page("II", PII, SC)
    exercice_cote(s, i, 1, 3.0, 2.6, 27.9, 14.6, 3, "Vecteur déplacement",
                  ["1. Positionner votre repère spatial.",
                   "2. Légender les points M₄ et M₂₁.",
                   "3. Tracer les vecteurs position OM₄ et OM₂₁.",
                   "4. En déduire le vecteur déplacement M₄M₂₁ et le tracer."],
                  F("t2c1-ex3"), 9.0,
                  leg="Le même support qu'à l'exercice 2.")

    # ============================================ III — VITESSE D'UN SYSTÈME
    PIII = "Vitesse d'un système"
    intercalaire("III", PIII, ["A — Vitesse moyenne",
                               "B — Vitesse instantanée",
                               "C — Nature et relativité du mouvement"])
    vij = V("v", ("i→j", I_))
    vi = V("v", ("i", I_))

    # --- III.A · vitesse moyenne, formule ✎, Image 12 ----------------------
    SA3 = "A — Vitesse moyenne"
    s, i = page("III", PIII, SA3)
    t = transition(s, i, 0, 0.9, 2.45, 32.1,
                   "Le déplacement dit où l'on va, pas en combien de temps. "
                   "Divisons par la durée.")
    wl = 19.2
    p = encart(s, seq, i, 2, "propriete", 0.9, bas(t, 0.45), wl, None,
               [[("Le vecteur vitesse moyenne d'un système entre deux "
                  "positions Mᵢ et Mⱼ se note ", {}), ("vᵢ→ⱼ", B),
                 (" (vecteur) et s'obtient par la relation :", {})]],
               etiquette="PROPRIÉTÉ — VECTEUR VITESSE MOYENNE")
    formule_v(s, i, 2, [vij], [Fr([V(*Mi, *Mj)], [["Δt", ("i→j", I_)]])],
              [[("vᵢ→ⱼ", B), ("  vitesse moyenne · m·s", {}),
                ("−1", {"exp": True})],
               [("MᵢMⱼ", B), ("  vecteur déplacement · m", {})],
               [("Δtᵢ→ⱼ", B), ("  durée séparant Mᵢ et Mⱼ · s", {})]],
              x=0.9, y=bas(p, 1.0), w=wl, h=4.4)
    vm = F("t2c1-vm")
    hv = 12.0
    im = image(s, i, 1, vm, 20.7 + (12.3 - hv / ratio(vm)) / 2, 2.6 + 1.3,
               h=hv - 1.3)
    legende(s, i, 1, 20.7, bas(im, 0.1), 12.3,
            "Différents vecteurs vitesse entre points d'une trajectoire.",
            num="Image 12")

    # --- III.A · caractéristiques ✎ --------------------------------------
    s, i = page("III", PIII, SA3)
    norme = [[("v", {}), ("i→j", I_)],
             " = ", Fr([[*Mi, *Mj]], [["Δt", ("i→j", I_)]]), " = ",
             Fr([[*Mi, *Mj]], [["t", ("j", I_), " − t", ("i", I_)]])]
    bloc(s, seq, i, 1, "propriete", 3.0, 4.2, 27.9, [
        ("t", [("direction", B), (" : colinéaire (parallèle) au vecteur "
                                  "déplacement MᵢMⱼ ;", {})], 22),
        ("t", [("sens", B), (" : celui du mouvement ;", {})], 22),
        ("t", [("norme", B), (" : en m·s", {}), ("−1", {"exp": True}),
               (", avec pour valeur :", {})], 22),
        ("g", 0.4),
        ("e", norme, 30),
    ], etiquette="PROPRIÉTÉ — CARACTÉRISTIQUES DU VECTEUR VITESSE MOYENNE",
        fiche=True)

    # --- III.A · exercice 4 + quiz unités ----------------------------------
    s, i = page("III", PIII, SA3)
    mo = P("t2c1-motos-source.jpg")
    exercice_q(s, i, 1, 0.9, 2.6, 32.1, 4, "Vecteur vitesse moyenne",
               ["1. Légender les points Mᵢ.",
                [("2. Tracer les vecteurs vitesse v₁→₃ et v₃→₄. Vous "
                  "respecterez l'échelle 1 cm pour 10 m·s", Q),
                 ("−1", dict(Q, exp=True)), (".", Q)]],
               contexte="Les images ont été prises à 0,5 s d'intervalle. "
                        "L'échelle est de 1 cm pour 2 m.",
               fig=(mo, ratio(mo), 26.0))
    qr_bloc(s, i, 2, 9.0, 17.2 - 4.4, 15.9, "MVTUN3",
            "Après la vitesse moyenne : unités et conversions.", cote=3.6)

    # --- III.B · vitesse instantanée, formule ✎ ---------------------------
    SB3 = "B — Vitesse instantanée"
    s, i = page("III", PIII, SB3)
    t = transition(s, i, 0, 0.9, 2.45, 32.1,
                   "Et si l'on rapproche les deux positions au plus près ? "
                   "On obtient la vitesse en un point.")
    p = encart(s, seq, i, 1, "propriete", 0.9, bas(t, 0.45), 32.1, None,
               [[("Le ", {}), ("vecteur vitesse (vitesse instantanée)", B),
                 (" d'un système en un point Mᵢ, noté vᵢ, est approché par le "
                  "vecteur vitesse moyenne entre deux positions très proches, "
                  "séparées d'une petite durée : Mᵢ et Mᵢ₊₁, Mᵢ₊₁ étant la "
                  "position qui suit Mᵢ (notée M′ dans le programme).", {})]],
               etiquette="PROPRIÉTÉ — VECTEUR VITESSE INSTANTANÉE")
    formule_v(s, i, 2, [vi],
              [Fr([V(*(Mi + Mi1))],
                  [["t", ("i+1", I_), " − t", ("i", I_)]])],
              [[("vᵢ", B), ("  vitesse au point Mᵢ · m·s", {}),
                ("−1", {"exp": True})],
               [("Mᵢ₊₁", B), ("  la position qui suit Mᵢ", {})],
               [("tᵢ₊₁ − tᵢ", B), ("  la durée qui les sépare · s", {})]],
              x=3.0, y=bas(p, 1.1), w=27.9, h=4.4)

    # --- III.B · caractéristiques ✎ + autre méthode ------------------------
    s, i = page("III", PIII, SB3)
    c = bloc(s, seq, i, 1, "propriete", 0.9, 2.6, 32.1, [
        ("t", [("direction", B), (" : colinéaire (parallèle) au vecteur "
                                  "déplacement MᵢMᵢ₊₁ ;", {})], 16),
        ("t", [("sens", B), (" : celui du mouvement ;", {})], 16),
        ("t", [("norme", B), (" : en m·s", {}), ("−1", {"exp": True}),
               (", avec pour valeur :", {})], 16),
        ("e", [[("v", {}), ("i", I_)], " = ",
               Fr([Mi + Mi1], [["t", ("i+1", I_), " − t", ("i", I_)]])], 24),
    ], etiquette="PROPRIÉTÉ — CARACTÉRISTIQUES DU VECTEUR VITESSE "
                 "INSTANTANÉE", fiche=True)
    bloc(s, seq, i, 2, "notation", 0.9, bas(c, 0.5), 32.1, [
        ("t", [("Certains livres, et certains professeurs, utilisent la "
                "position ", {}), ("précédente", B), (" et la position ", {}),
               ("suivante", B), (" :", {})], 15),
        ("e", [vi, " = ", Fr([V("M", ("i−1", I_), "M", ("i+1", I_))],
                             [["t", ("i+1", I_), " − t", ("i−1", I_)]])], 20),
        ("t", [("C'est une autre approximation, valable elle aussi. Dans ce "
                "cours et en DS, on suit celle du programme : la position ",
                {}), ("en cours", B), (" et la position ", {}),
               ("suivante", B), (".", {})], 15),
    ], etiquette="REMARQUE — UNE AUTRE MÉTHODE")

    # --- III.B · Image 13 --------------------------------------------------
    s, i = page("III", PIII, SB3)
    tn = F("t2c1-tan")
    hh = 13.0
    im = image(s, i, 1, tn, 0.9, 2.8, h=hh)
    wt = im.width / 360000
    xt = 0.9 + wt + 0.9
    legende(s, i, 1, xt, 2.8, 33.0 - xt,
            "Cas d'un mouvement circulaire. Le vecteur vitesse calculé en "
            "M(t₃) est porté par le déplacement vers la position suivante "
            "M(t₄) (en pointillés gris).", num="Image 13")
    texte(s, i, 2, xt, 5.6, 33.0 - xt,
          [[("Plus la durée entre deux positions est petite, plus ce vecteur "
             "se rapproche de la ", {}), ("tangente", B),
            (" à la trajectoire (en vert).", {})],
           [("La vitesse instantanée est ", {}),
            ("tangente à la trajectoire", B),
            (" — ici, perpendiculaire au rayon du cercle.", {})]],
          taille=17)

    # --- III.B · exercice 5 ------------------------------------------------
    s, i = page("III", PIII, SB3)
    exercice_q(s, i, 1, 0.9, 2.6, 32.1, 5, "Vecteur vitesse instantanée",
               ["1. Légender les points Mᵢ.",
                "2. Tracer tous les vecteurs vitesse instantanée vᵢ."],
               contexte="Les images ont été prises à 0,5 s d'intervalle. "
                        "L'échelle est de 1 cm pour 2 m.",
               fig=(mo, ratio(mo), 26.0))

    # --- III.C · nature du mouvement, Image 14 -----------------------------
    SC3 = "C — Nature et relativité du mouvement"
    s, i = page("III", PIII, SC3)
    t = transition(s, i, 0, 0.9, 2.45, 32.1,
                   "La vitesse est un vecteur : sa norme et sa direction "
                   "disent, ensemble, la nature du mouvement.")
    wl = 19.2
    z = texte(s, i, 1, 0.9, bas(t, 0.4), wl,
              "Le vecteur vitesse peut varier en norme (valeur), en "
              "direction, ou les deux.")
    encart(s, seq, i, 1, "propriete", 0.9, bas(z, 0.2), wl, None,
           [[("Un ", {}), terme("mouvement uniforme", GAMMA),
             (" correspond à une norme du vecteur vitesse constante.", {})],
            [("Si la norme augmente avec le temps, le mouvement est ", {}),
             terme("accéléré", GAMMA), (" ; si elle diminue, il est ", {}),
             terme("décéléré", GAMMA), (" (ralenti).", {})],
            [("Un ", {}), terme("mouvement rectiligne", GAMMA),
             (" correspond à une direction du vecteur vitesse constante.",
              {})]],
           etiquette="PROPRIÉTÉ")
    mc = F("t2c1-mcu")
    hm = 11.6
    im = image(s, i, 2, mc, 20.7 + (12.3 - hm / ratio(mc)) / 2, bas(t, 0.4),
               h=hm)
    legende(s, i, 2, 20.7, bas(im, 0.1), 12.3,
            "Mouvement circulaire uniforme. La norme du vecteur vitesse ne "
            "varie pas mais sa direction oui.", num="Image 14")

    # --- III.C · les variations de la vitesse ✎ ---------------------------
    s, i = page("III", PIII, SC3)
    xm, wm, ym = 3.0, 27.9, 2.8
    lignes = (("t2c1-memo-con", BETA, "vitesse constante",
               "si la distance séparant 2 positions successives ne varie pas",
               "mouvement uniforme"),
              ("t2c1-memo-aug", ALPHA, "vitesse augmente",
               "si la distance séparant 2 positions successives augmente",
               "mouvement accéléré"),
              ("t2c1-memo-dim", OCRE, "vitesse diminue",
               "si la distance séparant 2 positions successives diminue",
               "mouvement ralenti"))
    hl = 3.2
    hm = 1.3 + 3 * hl + 1.3
    cadre = _cadre(s, xm, ym, wm, hm)
    _habiller(cadre, "exercice")
    seq.marque(i, 1, cadre)
    tete = _sans_trait(_cadre(s, xm, ym, wm, 1.0))
    tete.fill.solid()
    tete.fill.fore_color.rgb = BETA
    tete.text_frame.text = ""
    seq.marque(i, 1, tete)
    z = _texte(s, xm, ym + 0.2, wm, 0.7, "LES VARIATIONS DE LA VITESSE",
               taille=15, police=TITRES, couleur=BLANC, gras=True,
               align=PP_ALIGN.CENTER)
    seq.marque(i, 1, z)
    picto_fiche(s, seq, i, 1, xm + wm - 1.05, ym - 0.55)
    for k, (cle, col, a, b_, c_) in enumerate(lignes):
        yy = ym + 1.3 + k * hl
        im = image(s, i, k + 2, F(cle), xm + 0.6, yy + 0.4, w=10.5)
        texte(s, i, k + 2, xm + 11.8, yy + 0.2, wm - 12.4,
              [[(a, {"gras": True, "couleur": col}), (" " + b_ + " : ", {}),
                (c_, {"gras": True, "couleur": col})]], taille=18)
    legende(s, i, 4, xm, ym + hm + 0.15, wm,
            "Fiche mémo pour caractériser un mouvement, d'après la fiche de "
            "Paul Olivier (chaîne YouTube). Le mouvement va de gauche à "
            "droite.", num="Image 15")

    # --- III.C · relativité, Galilée ---------------------------------------
    s, i = page("III", PIII, SC3)
    t = transition(s, i, 0, 0.9, 2.45, 32.1,
                   "Uniforme, rectiligne… mais vu d'où ? Toute cette "
                   "description dépend du référentiel.")
    e = encart(s, seq, i, 1, "exemple", 0.9, bas(t, 0.45), 32.1, None,
               ["Un voyageur est assis dans un train qui roule en ligne droite "
                "à 30 m·s⁻¹. Dans le référentiel du train, il est immobile : "
                "sa vitesse est nulle. Dans le référentiel terrestre, il se "
                "déplace à 30 m·s⁻¹.",
                [("Il lâche une balle. Pour lui, elle tombe ", {}),
                 ("verticalement", B),
                 (", à ses pieds : trajectoire rectiligne. Pour une personne "
                  "restée sur le quai, la balle avance avec le train tout en "
                  "tombant : sa trajectoire est une ", {}), ("courbe", B),
                 (".", {})],
                [("Même balle, même chute : deux trajectoires et deux vitesses "
                  "différentes, selon le référentiel choisi.", B)]],
               etiquette="EXEMPLE — LA RELATIVITÉ DU MOUVEMENT")
    texte(s, i, 2, 0.9, bas(e, 0.6), 32.1,
          [[("HISTOIRE DES SCIENCES", {"police": MONO, "taille": 11,
                                      "gras": True, "couleur": SEPIA})],
           Par("Le bateau de Galilée (1632)", taille=20, police=TITRES),
           "Galilée imaginait déjà cette expérience avec une pierre lâchée du "
           "haut du mât d'un navire : que le navire soit à quai ou qu'il "
           "avance, la pierre tombe au pied du mât. Enfermé dans la cabine, "
           "aucune expérience ne permettrait de savoir si le bateau avance en "
           "ligne droite à vitesse constante. C'était un argument de poids "
           "pour défendre une idée alors très contestée : la Terre peut "
           "tourner sans que nous le sentions."], taille=15)

    # ============================================================= CHECKLIST
    s, i = page("✓", "Pour le DS, je sais", "les six compétences du chapitre")
    items = [
        "Choisir un référentiel pour décrire un mouvement.",
        "Décrire le mouvement d'un système.",
        "Définir le vecteur vitesse moyenne d'un point.",
        "Approcher le vecteur vitesse d'un point à l'aide du vecteur "
        "déplacement MM′, où M et M′ sont les positions successives à des "
        "instants voisins séparés de Δt ; le représenter.",
        "Tracer un vecteur vitesse.",
        "Reconnaître un mouvement uniforme ou non uniforme.",
    ]
    y = 2.8
    for k, it in enumerate(items):
        case = _cadre(s, 1.3, y + 0.1, 0.62, 0.62)
        case.fill.solid()
        case.fill.fore_color.rgb = BLANC
        case.line.color.rgb = ENCRE
        case.text_frame.text = ""
        seq.marque(i, k + 1, case)
        z = texte(s, i, k + 1, 2.3, y, 18.6, it, taille=16)
        y = bas(z, 0.35)
    qr_bloc(s, i, len(items) + 1, 21.8, 3.0, 11.2, "MVTBN6",
            "Le quiz bilan du chapitre, en classe ou à la maison.", cote=4.4)

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
    print(f"   {len(prs.slides)} diapositives · {total} étapes d'animation · "
          f"{ko} Ko")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("usage : python diapo_t2c1.py <dossier-des-figures>\n"
                         "  les figures sont extraites de la page si absentes")
    construire(sys.argv[1])
