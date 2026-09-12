# -*- coding: utf-8 -*-
"""Generateur des schemas de noyaux du chapitre ES T1-C1 (livrables E1 n° 3 a 7).

Un noyau se dessine ici en « petites boules » : un disque par nucleon,
protons et neutrons alternes, poses sur un reseau triangulaire compact.
C'est la representation du cours source, et c'est une STRUCTURE — le trace
est le contenu, pas un objet du monde. Cinq schemas en sortent :
  chaine-primordiale  la chaine de la nucleosynthese primordiale (2.1)
  chaine-pp           la chaine proton-proton, deux branches (2.2)
  couches-etoile      la structure en couches d'une etoile massive (2.2)
  fusions             les trois equations de fusion du cours (1.4)
  fissions            l'exemple de fission du cours (1.4)

🔴 Limite assumee : au-dela de 20 nucleons, le script REFUSE de dessiner.
Un amas de billes qui ne compte pas le bon nombre de nucleons serait un
schema faux — pour l'uranium, on garde la photographie de schema du cours.

  python _outils/es/noyaux.py            # regenere et injecte
  python _outils/es/noyaux.py --verifier # controle seulement
"""
import io, math, os, sys

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PAGE = os.path.join(RACINE, "pages", "1re-es-t1-c1-nucleosynthese.html")
SORTIE = os.path.join(RACINE, "assets", "img", "es", "1re-es-t1-c1")

RN = 9.5          # rayon d'un nucleon : il faut pouvoir les COMPTER a l'ecran
MAX_A = 20

# ------------------------------------------------------------
# Le reseau compact : on prend les A premiers points d'un reseau
# triangulaire, tries par distance au centre. Deterministe, donc deux
# noyaux identiques se dessinent identiquement d'un schema a l'autre.
# ------------------------------------------------------------
def _reseau(n):
    pts = []
    for i in range(-4, 5):
        for j in range(-4, 5):
            x = (i + j / 2.0) * RN * 1.72
            y = j * RN * 1.49
            pts.append((math.hypot(x, y), x, y))
    pts.sort()
    return [(x, y) for _, x, y in pts[:n]]

def noyau(a, z, cx, cy, etiquette=None, classe=""):
    """Un noyau : a nucleons dont z protons. etiquette = 'He' avec A et Z
    ecrits en exposant/indice, ou None pour l'atelier de reconnaissance."""
    if a > MAX_A:
        raise ValueError("noyau de %d nucleons : au-dela de %d, le schema serait faux" % (a, MAX_A))
    if z > a or z < 0:
        raise ValueError("noyau A=%d Z=%d impossible" % (a, z))
    pos = _reseau(a)
    # alternance proton / neutron : les protons d'abord, un sur deux, puis
    # les neutrons comblent. Le melange reste lisible a l'oeil.
    roles, restants_p, restants_n = [], z, a - z
    tour = 0
    while len(roles) < a:
        if tour % 2 == 0 and restants_p:
            roles.append("p"); restants_p -= 1
        elif restants_n:
            roles.append("n"); restants_n -= 1
        elif restants_p:
            roles.append("p"); restants_p -= 1
        tour += 1
    out = ['<g class="noy %s">' % classe]
    if etiquette:
        out.append('<title>%s, %d nucléons dont %d protons</title>' % (etiquette, a, z))
    # les nucleons du fond d'abord (y croissant) pour un chevauchement propre
    for (x, y), role in sorted(zip(pos, roles), key=lambda t: t[0][1]):
        out.append('<circle class="%s" cx="%.1f" cy="%.1f" r="%.1f"/>'
                   % (role, cx + x, cy + y, RN))
    if etiquette:
        ry = max(p[1] for p in pos) if pos else 0
        out.append('<text class="et" x="%.1f" y="%.1f">'
                   '<tspan class="ex">%d</tspan>%s</text>'
                   % (cx, cy + ry + RN + 19, a, etiquette))
    out.append('</g>')
    return "\n".join(out)

def fleche(x1, y1, x2, y2, classe="fl"):
    return '<line class="%s" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" marker-end="url(#pointe)"/>' % (
        classe, x1, y1, x2, y2)

def trait(x1, y1, x2, y2, classe="fl"):
    """Un segment sans pointe : les branches qui convergent avant la fleche."""
    return '<line class="%s" x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>' % (classe, x1, y1, x2, y2)

def legende_pn(cx, y, suite=""):
    """La legende des couleurs, avec de VRAIES billes : « rouge : proton »
    ecrit en toutes lettres obligeait a traduire une couleur en mot."""
    out = ['<g class="lg-pn">']
    x = cx - (86 if not suite else 86 + 3.1 * len(suite))
    out.append('<circle class="p" cx="%.1f" cy="%.1f" r="7"/>' % (x, y - 4))
    out.append(texte(x + 12, y, "proton", "cap g"))
    out.append('<circle class="n" cx="%.1f" cy="%.1f" r="7"/>' % (x + 84, y - 4))
    out.append(texte(x + 96, y, "neutron", "cap g"))
    if suite:
        out.append(texte(x + 170, y, suite, "cap g"))
    out.append('</g>')
    return "\n".join(out)

def texte(x, y, txt, classe="lb"):
    return '<text class="%s" x="%.1f" y="%.1f">%s</text>' % (classe, x, y, txt)

def gamma(x, y, dx, dy):
    """Le rayonnement gamma : une ondulation, comme dans le cours source."""
    n, out = 6, []
    d = ""
    for k in range(n + 1):
        px = x + dx * k / float(n)
        py = y + dy * k / float(n)
        # perpendiculaire, alternee
        nx, ny = -dy, dx
        L = math.hypot(nx, ny) or 1
        s = 3.0 * (1 if k % 2 else -1)
        d += ("M" if k == 0 else "L") + "%.1f %.1f" % (px + nx / L * s, py + ny / L * s)
    out.append('<path class="gam" d="%s"/>' % d)
    out.append(texte(x + dx + 9, y + dy + 5, "γ", "lb gam-t"))
    return "\n".join(out)

def enveloppe(nom, titre, largeur, hauteur, corps):
    """Le marqueur de fleche porte l'id du schema, pas un id commun : six
    SVG dans une meme page, c'etaient six fois le meme id — du HTML
    invalide, et toutes les fleches renvoyaient au premier marqueur."""
    corps = corps.replace("url(#pointe)", "url(#pointe-%s)" % nom)
    return ('<svg class="nx %s" viewBox="0 0 %d %d" role="img" aria-labelledby="%s-t" '
            'xmlns="http://www.w3.org/2000/svg">\n'
            '<title id="%s-t">%s</title>\n'
            '<defs><marker id="pointe-%s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" '
            'markerHeight="6" orient="auto-start-reverse">'
            '<path d="M0 0 L10 5 L0 10 z"/></marker></defs>\n'
            '%s\n</svg>' % (nom, largeur, hauteur, nom, nom, titre, nom, corps))

# ============================================================
# la chaine de la nucleosynthese primordiale
# ============================================================
def svg_chaine_primordiale():
    """Cinq reactions, dans l'ordre. La chaine du cours source est reprise
    en corrigeant une entree : c'est de l'helium 3, et non un neutron, qui
    s'ajoute a l'helium 4 pour donner le beryllium 7."""
    ET = [
        # (A, Z, etiquette, entrant, sortants)
        # L'entrant porte son SYMBOLE, pas son nom complet : noyau() ecrit
        # deja le nombre de masse en exposant — « ²H » donnait « 2²H ».
        (2, 1, "H",  ("p + n", None),  ["γ"]),
        (3, 2, "He", ("H", (2, 1)),    ["n"]),
        (4, 2, "He", ("He", (3, 2)),   ["p", "p"]),
        (7, 4, "Be", ("He", (3, 2)),   ["γ"]),
        (7, 3, "Li", ("n", (1, 0)),    ["p"]),
    ]
    pas, y, out = 168, 150, []
    for i, (a, z, et, (nom_e, noy_e), sorties) in enumerate(ET):
        cx = 96 + i * pas
        # le noyau produit
        out.append(noyau(a, z, cx, y, et))
        # la fleche venant du noyau precedent
        if i:
            out.append(fleche(cx - pas + 44, y, cx - 42, y))
        # l'entrant, en haut
        if noy_e:
            out.append(noyau(noy_e[0], noy_e[1], cx - 4, y - 96, nom_e))
            out.append(fleche(cx + 8, y - 62, cx + 2, y - 40))
        else:
            out.append(texte(cx, y - 88, nom_e, "lb gros"))
            out.append(fleche(cx, y - 74, cx, y - 40))
        # les sortants, en bas
        dx = -18
        for s in sorties:
            if s == "γ":
                out.append(gamma(cx + 34, y + 22, 30, 26))
            else:
                out.append(texte(cx + dx, y + 76, s, "lb gros"))
                out.append(fleche(cx + dx, y + 40, cx + dx, y + 60))
                dx += 34
    out.append(legende_pn(pas * 2.5, y + 122, "γ : rayonnement emporté par la réaction"))
    return enveloppe("nx-bbn",
                     "Chaîne de la nucléosynthèse primordiale : du proton au lithium 7, en passant "
                     "par le deutérium, l'hélium 3, l'hélium 4 et le béryllium 7.",
                     pas * 5 + 40, y + 140, "\n".join(out))

# ============================================================
# n° 4 — la chaine proton-proton
# ============================================================
def svg_chaine_pp():
    """Deux branches identiques qui convergent, comme dans le cours source.

    Une seule convention pour les trois reactions (audit du 12/09/2026, les
    fleches partaient de nulle part) : la fleche horizontale va du noyau qui
    se transforme au noyau produit ; ce qui s'y AJOUTE arrive par une fleche
    qui touche la hampe, par en dessous ; ce qui S'EN VA part de la hampe,
    par au-dessus. Aucune fleche ne pointe dans le vide."""
    out = []
    def branche(y0):
        b = []
        # 1. ¹H + ¹H → ²H + e⁺ + ν
        b.append(noyau(1, 1, 40, y0, "H"))
        b.append(fleche(58, y0, 186, y0))
        b.append(noyau(1, 1, 122, y0 + 76, "H"))
        b.append(fleche(122, y0 + 58, 122, y0 + 10))
        b.append(fleche(122, y0 - 8, 122, y0 - 40))
        b.append(texte(122, y0 - 48, "e⁺ + ν", "lb gros"))
        # 2. ²H + ¹H → ³He + γ
        b.append(noyau(2, 1, 222, y0, "H"))
        b.append(fleche(240, y0, 366, y0))
        b.append(noyau(1, 1, 302, y0 + 76, "H"))
        b.append(fleche(302, y0 + 58, 302, y0 + 10))
        b.append(gamma(302, y0 - 10, 0, -32))
        b.append(noyau(3, 2, 400, y0, "He"))
        return "\n".join(b)
    Y1, Y2 = 92, 312
    YM = (Y1 + Y2) / 2.0
    out.append(branche(Y1))
    out.append(branche(Y2))
    # 3. ³He + ³He → ⁴He + 2 ¹H : les deux branches se rejoignent, puis la fleche
    JX = 492
    out.append(trait(430, Y1 + 8, JX, YM - 2))
    out.append(trait(430, Y2 - 8, JX, YM + 2))
    out.append(fleche(JX, YM, 622, YM))
    out.append(fleche(556, YM - 8, 556, YM - 46))
    out.append(noyau(1, 1, 556, YM - 76, "H"))
    out.append(fleche(556, YM + 8, 556, YM + 36))
    out.append(noyau(1, 1, 556, YM + 56, "H"))
    out.append(noyau(4, 2, 664, YM, "He"))
    out.append(texte(360, Y2 + 142,
                     "Bilan : 4 ¹H → ⁴He + 2 e⁺ + 2 ν. C'est la réaction qui fait briller le Soleil.", "cap"))
    out.append(legende_pn(360, Y2 + 168, "e⁺ : positon · ν : neutrino · γ : rayonnement"))
    return enveloppe("nx-pp",
                     "Chaîne proton-proton : deux branches identiques transforment chacune trois "
                     "protons en hélium 3, puis les deux hélium 3 s'assemblent en hélium 4 en "
                     "libérant deux protons.",
                     720, Y2 + 184, "\n".join(out))

# ============================================================
# n° 5 — la structure en couches
# ============================================================
def svg_couches():
    """Huit coquilles, du coeur de fer a l'enveloppe d'hydrogene. Le contenu
    des etiquettes est celui du cours source, a une correction pres : la
    couche de silicium fabrique du nickel 56 (celui qui se desintegre en fer
    56, comme le dit le cours), pas du nickel 58.

    Les etiquettes sont sorties du dessin (audit du 12/09/2026) : posees
    dans les coquilles, elles chevauchaient les arcs — une coquille de 46 px
    ne loge pas « ⁴He → ¹²C ¹⁶O ». Chacune est maintenant dans une colonne a
    droite, reliee a sa coquille par un trait horizontal : les traits sont
    paralleles, ils ne se croisent jamais."""
    COUCHES = [
        ("Fe, Ni", "", "le cœur"),
        ("²⁸Si", "⁵⁶Ni", ""),
        ("¹⁶O", "²⁸Si", ""),
        ("²⁰Ne", "¹⁶O", ""),
        ("¹²C", "²⁰Ne", ""),
        ("⁴He", "¹²C, ¹⁶O", ""),
        ("¹H", "⁴He", ""),
        ("H", "", "l'enveloppe, qui ne fusionne plus"),
    ]
    W, H = 640, 432
    ox, oy = 16, H - 16          # le centre de l'etoile, en bas a gauche
    r0, dr = 46, 46
    PAS = 45                     # ecart vertical entre deux etiquettes
    XL = 400                     # debut de la colonne d'etiquettes
    out = []
    n = len(COUCHES)
    # des disques pleins, du plus grand au plus petit : chaque couche se
    # detache par sa teinte, plus soutenue vers le coeur
    for i in range(n - 1, -1, -1):
        r = r0 + i * dr
        op = 0.10 + 0.55 * (n - 1 - i) / float(n - 1)
        out.append('<path class="cq-f" fill-opacity="%.2f" d="M%.1f %.1f L%.1f %.1f A%.1f %.1f 0 0 0 %.1f %.1f Z"/>'
                   % (op, ox, oy, ox + r, oy, r, r, ox, oy - r))
        out.append('<path class="cq" d="M%.1f %.1f A%.1f %.1f 0 0 0 %.1f %.1f"/>'
                   % (ox + r, oy, r, r, ox, oy - r))
    for i, (a, b, note) in enumerate(COUCHES):
        rr = r0 + (i - 0.5) * dr if i else r0 * 0.55
        ty = oy - 22 - i * PAS
        # le point d'attache est sur le milieu de la coquille, a la hauteur
        # de l'etiquette : le trait est donc horizontal
        s = min(1.0, (oy - ty) / rr)
        px = ox + rr * math.cos(math.asin(s))
        out.append('<circle class="cq-pt" cx="%.1f" cy="%.1f" r="2.6"/>' % (px, ty))
        out.append(trait(px, ty, XL - 8, ty, "cq-lien"))
        if b:
            lib = "%s <tspan class=\"fl-t\">→</tspan> %s" % (a, b)
        else:
            lib = a
        if note:
            lib += ' <tspan class="cq-n">— %s</tspan>' % note
        out.append(texte(XL, ty + 4.5, lib, "lb cq-t g"))
    return enveloppe("nx-couches",
                     "Coupe d'une étoile massive en fin de vie : huit couches concentriques, de "
                     "l'hydrogène en surface au cœur de fer et de nickel, chaque couche fabriquant "
                     "un élément plus lourd que celle qui l'entoure.",
                     W, H, "\n".join(out))

# ============================================================
# n° 6 et 7 — les equations du cours, en petites boules
# ============================================================
def demi_largeur(a):
    """Encombrement horizontal d'un amas de a nucleons. Sans ce calcul,
    l'espacement etait fixe et le « + » tombait SUR le noyau voisin."""
    pos = _reseau(a)
    return max(abs(x) for x, _ in pos) + RN

def svg_equations(nom, titre, equations, legende):
    """Une equation par ligne : noyaux, +, fleche, produits.
    L'espacement suit l'encombrement reel de chaque amas."""
    ECART = 40          # blanc entre deux amas, ou tient le « + »
    LH, out = 140, []
    largeur_max = 0
    for i, (gauche, droite) in enumerate(equations):
        y = 78 + i * LH
        x = 30
        def poser(liste, x):
            for k, (a, z, et) in enumerate(liste):
                x += demi_largeur(a)
                if k:
                    out.append(texte(x - demi_largeur(a) - ECART / 2.0, y + 7, "+", "lb op"))
                out.append(noyau(a, z, x, y, et))
                x += demi_largeur(a) + ECART
            return x
        x = poser(gauche, x)
        out.append(fleche(x - ECART + 4, y, x + 42, y))
        x += 52
        x = poser(droite, x)
        largeur_max = max(largeur_max, x)
    out.append(texte(largeur_max / 2.0, 78 + len(equations) * LH - 42, legende, "cap pt"))
    out.append(legende_pn(largeur_max / 2.0, 78 + len(equations) * LH - 14))
    return enveloppe(nom, titre, int(largeur_max), 78 + len(equations) * LH, "\n".join(out))

SCHEMAS = {}

def construire():
    SCHEMAS["chaine-primordiale"] = svg_chaine_primordiale()
    SCHEMAS["chaine-pp"] = svg_chaine_pp()
    SCHEMAS["couches-etoile"] = svg_couches()
    SCHEMAS["fusions"] = svg_equations(
        "nx-fusions",
        "Les trois fusions du cours, noyau par noyau : hélium + hélium donne béryllium 8, "
        "hélium + béryllium donne carbone 12, carbone + hélium donne oxygène 16.",
        [([(4, 2, "He"), (4, 2, "He")], [(8, 4, "Be")]),
         ([(4, 2, "He"), (8, 4, "Be")], [(12, 6, "C")]),
         ([(12, 6, "C"), (4, 2, "He")], [(16, 8, "O")])],
        "Compte les billes de part et d'autre de la flèche : rien ne se perd.")
    SCHEMAS["fissions"] = svg_equations(
        "nx-fissions",
        "La fission de l'azote 15 par un proton : le noyau se casse en carbone 12 et hélium 4.",
        [([(15, 7, "N"), (1, 1, "H")], [(12, 6, "C"), (4, 2, "He")])],
        "Un noyau entre, deux noyaux sortent : la signature d'une fission.")

# ============================================================
# Injection
# ============================================================
def injecter(src, nom, svg_txt):
    d = "<!-- SVG:%s — genere par _outils/es/noyaux.py, ne pas editer a la main -->" % nom
    f = "<!-- /SVG:%s -->" % nom
    i, j = src.find(d), src.find(f)
    if i < 0 or j < 0:
        return src, False
    return src[:i + len(d)] + "\n" + svg_txt + "\n              " + src[j:], True

def main():
    construire()
    if not os.path.isdir(SORTIE):
        os.makedirs(SORTIE)
    for nom, txt in SCHEMAS.items():
        with io.open(os.path.join(SORTIE, "t1c1-%s.svg" % nom), "w", encoding="utf-8", newline="\n") as f:
            f.write(txt + "\n")
    src = io.open(PAGE, encoding="utf-8").read()
    for nom, txt in sorted(SCHEMAS.items()):
        src, ok = injecter(src, nom, txt)
        print(" - %-20s %s" % (nom, "injecte" if ok else "MARQUEURS ABSENTS"))
    if "--verifier" not in sys.argv:
        with io.open(PAGE, "w", encoding="utf-8", newline="\n") as f:
            f.write(src)

if __name__ == "__main__":
    main()
