"""Figures 3D du chapitre T1-C4 (Dénombrer les entités).

Génère, depuis de VRAIES géométries (longueurs de liaison, angles), des modèles
moléculaires « boules et bâtons » projetés en SVG :

  assets/img/pc/2nde-pc-t1-c4/t1c4-eau-3d.svg
  assets/img/pc/2nde-pc-t1-c4/t1c4-sulfate-3d.svg
  assets/img/pc/2nde-pc-t1-c4/t1c4-ethanol-3d.svg
  assets/img/pc/2nde-pc-t1-c4/t1c4-cyclohexane-3d.svg

et le cristal de chlorure de sodium en 3D, fragment SVG à coller dans la page
(il y reste inline pour profiter des polices du site) :

  _outils/figures/sortie/t1c4-nacl-3d.svg

Lancer depuis la racine du dépôt :  python _outils/figures/figures_t1c4.py
Rien d'aléatoire : deux lancements donnent les mêmes fichiers.
"""
import math, pathlib

RACINE = pathlib.Path(__file__).resolve().parents[2]
IMG = RACINE / "assets/img/pc/2nde-pc-t1-c4"
SORTIE = pathlib.Path(__file__).resolve().parent / "sortie"

ENCRE = "#141a26"
POLICE = "'Space Grotesk','Segoe UI',Arial,sans-serif"

# Code couleur conventionnel (CPK), aux teintes de la charte.
ELEM = {
    #      clair      base       ombre      rayon (Å, boules et bâtons)  nom
    "H":  ("#ffffff", "#e9e6de", "#9d9a92", 0.27, "hydrogène"),
    "C":  ("#8a909c", "#3d4351", "#141a26", 0.38, "carbone"),
    "O":  ("#f29a8a", "#d6402b", "#7a1d10", 0.38, "oxygène"),
    "S":  ("#f6ec9c", "#d6b53a", "#7d6514", 0.46, "soufre"),
    "Na": ("#a8e0ea", "#1d9aaa", "#0b4f58", 0.15, "ion sodium Na⁺"),
    "Cl": ("#f6ec9c", "#d6b53a", "#7d6514", 0.25, "ion chlorure Cl⁻"),
}

# ------------------------------------------------------------ géométrie ---
def add(a, b): return tuple(x + y for x, y in zip(a, b))
def sub(a, b): return tuple(x - y for x, y in zip(a, b))
def mul(a, k): return tuple(x * k for x in a)
def dot(a, b): return sum(x * y for x, y in zip(a, b))
def norm(a): return math.sqrt(dot(a, a))
def unit(a): return mul(a, 1 / norm(a))
def cross(a, b): return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])

TETRA = math.radians(109.47)

def deux_h(centre, v1, v2, d):
    """Les deux positions restantes d'un centre tétraédrique dont deux voisins
    sont connus (v1, v2) : dans le plan bissecteur, symétriques."""
    a, b = unit(sub(v1, centre)), unit(sub(v2, centre))
    bis = unit(mul(add(a, b), -1))
    perp = unit(cross(a, b))
    t = TETRA / 2
    return [add(centre, mul(add(mul(bis, math.cos(t)), mul(perp, s * math.sin(t))), d)) for s in (1, -1)]

def zmat(a, b, c, d, angle, dihedre):
    """Place un atome à la distance d de a, angle (b-a-x), dièdre (c-b-a-x)."""
    angle, dihedre = math.radians(angle), math.radians(dihedre)
    bc = unit(sub(b, c)); n = unit(cross(sub(b, c), sub(a, b)) if norm(cross(sub(b, c), sub(a, b))) > 1e-9 else (0, 0, 1))
    ab = unit(sub(a, b)); m = cross(n, ab)
    loc = (-d * math.cos(angle), d * math.sin(angle) * math.cos(dihedre), d * math.sin(angle) * math.sin(dihedre))
    return add(a, add(add(mul(ab, loc[0]), mul(m, loc[1])), mul(n, loc[2])))

def eau():
    O = (0, 0, 0); a = math.radians(104.45 / 2); d = 0.958
    H1 = (d * math.sin(a), -d * math.cos(a), 0); H2 = (-d * math.sin(a), -d * math.cos(a), 0)
    return [("O", O), ("H", H1), ("H", H2)], [(0, 1), (0, 2)]

def sulfate():
    d = 1.49 / math.sqrt(3)
    pts = [(1, 1, 1), (1, -1, -1), (-1, 1, -1), (-1, -1, 1)]
    at = [("S", (0, 0, 0))] + [("O", mul(p, d)) for p in pts]
    return at, [(0, i) for i in range(1, 5)]

def ethanol():
    C1 = (0, 0, 0); C2 = (1.53, 0, 0)
    O = zmat(C2, C1, (0, 1, 0), 1.43, 109.5, 0)
    HO = zmat(O, C2, C1, 0.96, 108.5, 180)
    H2a, H2b = deux_h(C2, C1, O, 1.09)
    H1 = [zmat(C1, C2, O, 1.09, 110.0, phi) for phi in (60, 180, 300)]
    at = [("C", C1), ("C", C2), ("O", O), ("H", HO), ("H", H2a), ("H", H2b)] + [("H", h) for h in H1]
    li = [(0, 1), (1, 2), (2, 3), (1, 4), (1, 5), (0, 6), (0, 7), (0, 8)]
    return at, li

def cyclohexane():
    # chaise : rayon r, alternance ±h ; d(C-C) = √(r² + 4h²) ≈ 1,53 Å
    r, h = 1.45, 0.25
    C = [(r * math.cos(math.radians(60 * k)), r * math.sin(math.radians(60 * k)), h if k % 2 == 0 else -h) for k in range(6)]
    at = [("C", c) for c in C]; li = [(k, (k + 1) % 6) for k in range(6)]
    for k in range(6):
        Ha, Hb = deux_h(C[k], C[k - 1], C[(k + 1) % 6], 1.09)
        for H in (Ha, Hb):
            at.append(("H", H)); li.append((k, len(at) - 1))
    return at, li

# ------------------------------------------------------------ projection ---
def rot(p, lacet, tangage, roulis=0.0):
    x, y, z = p
    l, t, r = map(math.radians, (lacet, tangage, roulis))
    x, z = x * math.cos(l) + z * math.sin(l), -x * math.sin(l) + z * math.cos(l)   # autour de y
    y, z = y * math.cos(t) - z * math.sin(t), y * math.sin(t) + z * math.cos(t)    # autour de x
    x, y = x * math.cos(r) - y * math.sin(r), x * math.sin(r) + y * math.cos(r)    # autour de z
    return (x, y, z)

def gradients(prefixe, elems):
    out = []
    for e in elems:
        clair, base, ombre = ELEM[e][:3]
        out.append(f'<radialGradient id="{prefixe}-{e}" cx="36%" cy="32%" r="68%">'
                   f'<stop offset="0" stop-color="{clair}"/><stop offset=".55" stop-color="{base}"/>'
                   f'<stop offset="1" stop-color="{ombre}"/></radialGradient>')
    return out

def scene(atomes, liaisons, lacet, tangage, roulis, echelle, cx, cy, prefixe, baton=0.13, persp=0.06):
    """Rend la scène en éléments SVG triés du fond vers l'avant (peintre)."""
    P = [rot(p, lacet, tangage, roulis) for _, p in atomes]
    gx = sum(p[0] for p in P) / len(P); gy = sum(p[1] for p in P) / len(P); gz = sum(p[2] for p in P) / len(P)
    P = [(x - gx, y - gy, z - gz) for x, y, z in P]
    def ecran(p):
        k = 1 + persp * p[2]                       # z > 0 : vers l'observateur
        return cx + p[0] * echelle * k, cy - p[1] * echelle * k, k
    items, disque = [], {}
    for i, (e, _) in enumerate(atomes):
        X, Y, k = ecran(P[i]); R = ELEM[e][3] * echelle * k
        disque[i] = (X, Y, R)
        voile = max(0.0, min(0.35, -P[i][2] * 0.09))  # brume de profondeur
        s = (f'<circle cx="{X:.1f}" cy="{Y:.1f}" r="{R:.1f}" fill="url(#{prefixe}-{e})" stroke="{ENCRE}" stroke-width="1.1"/>')
        if voile > 0.01:
            s += f'<circle cx="{X:.1f}" cy="{Y:.1f}" r="{R:.1f}" fill="#fbf9f4" opacity="{voile:.2f}"/>'
        items.append((P[i][2], s))
    for a, b in liaisons:
        m = mul(add(P[a], P[b]), 0.5)
        for i, j in ((a, b), (b, a)):
            p0, p1 = P[i], m
            X0, Y0, k0 = ecran(p0); X1, Y1, _ = ecran(p1)
            # Le demi-bâton part du BORD de sa boule, à l'écran, et non de son
            # centre : il en sort au lieu de la barrer d'un trait cerné de noir
            # (audit du 12/11/2026). Coupe géométrique plutôt que masque : un
            # masque en fondu fait rastériser la figure à l'impression (PDF ×8).
            Xc, Yc, R = disque[i]
            L = ((X1 - X0) ** 2 + (Y1 - Y0) ** 2) ** 0.5
            depart = 0.9 * R                      # mord un peu sur le contour
            if L <= depart + 0.5:
                continue                          # bâton caché par sa propre boule
            X0 += (X1 - X0) * depart / L; Y0 += (Y1 - Y0) * depart / L
            w = baton * echelle * k0
            e = atomes[i][0]
            col = ELEM[e][1]
            s = (f'<line x1="{X0:.1f}" y1="{Y0:.1f}" x2="{X1:.1f}" y2="{Y1:.1f}" stroke="{ENCRE}" stroke-width="{w + 2.2:.1f}" stroke-linecap="butt"/>'
                 f'<line x1="{X0:.1f}" y1="{Y0:.1f}" x2="{X1:.1f}" y2="{Y1:.1f}" stroke="{col}" stroke-width="{w:.1f}" stroke-linecap="butt"/>')
            items.append(((p0[2] + p1[2]) / 2 - 0.001, s))
    items.sort(key=lambda t: t[0])
    return [s for _, s in items]

def legende(elems, x0, y, prefixe, pas=None):
    out, x = [], x0
    for e in elems:
        nom = ELEM[e][4]
        out.append(f'<circle cx="{x:.0f}" cy="{y}" r="8" fill="url(#{prefixe}-{e})" stroke="{ENCRE}" stroke-width="1"/>'
                   f'<text x="{x + 13:.0f}" y="{y + 4.5}" font-size="13" font-family="{POLICE}" fill="{ENCRE}">{e} · {nom}</text>')
        x += pas or (40 + 7.2 * len(e + nom))
    return out

def molecule(nom, titre, desc, atomes, liaisons, vue, l, h, echelle, cy, extra=""):
    elems = []
    for e, _ in atomes:
        if e not in elems: elems.append(e)
    pre = "m-" + nom
    corps = scene(atomes, liaisons, *vue, echelle, l / 2, cy, pre)
    larg_leg = sum(40 + 7.2 * len(e + ELEM[e][4]) for e in elems) - 22
    leg = legende(elems, (l - larg_leg) / 2 + 8, h - 18, pre)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {l} {h}" width="{l}" height="{h}" role="img" aria-labelledby="t d">\n'
           f'<title id="t">{titre}</title><desc id="d">{desc}</desc>\n'
           f'<defs>{"".join(gradients(pre, elems))}</defs>\n'
           f'<rect width="{l}" height="{h}" fill="#fff"/>\n'
           + "\n".join(corps) + "\n" + extra + "\n" + "\n".join(leg) + "\n</svg>\n")
    (IMG / f"t1c4-{nom}-3d.svg").write_text(svg, encoding="utf-8", newline="\n")

# ------------------------------------------------------------- le cristal ---
def nacl(n=4):
    """Bloc n×n×n de la structure du sel (n pair : autant de Na⁺ que de Cl⁻)."""
    a = 1.0
    atomes, idx = [], {}
    for i in range(n):
        for j in range(n):
            for k in range(n):
                e = "Na" if (i + j + k) % 2 == 0 else "Cl"
                idx[(i, j, k)] = len(atomes)
                atomes.append((e, ((i - (n - 1) / 2) * a, (j - (n - 1) / 2) * a, (k - (n - 1) / 2) * a)))
    li = []
    for (i, j, k), u in idx.items():
        for d in ((1, 0, 0), (0, 1, 0), (0, 0, 1)):
            v = idx.get((i + d[0], j + d[1], k + d[2]))
            if v is not None: li.append((u, v))
    return atomes, li

def cristal():
    l, h = 560, 400
    atomes, li = nacl(4)
    pre = "s01"
    nNa = sum(1 for e, _ in atomes if e == "Na"); nCl = len(atomes) - nNa
    assert nNa == nCl
    # bâtons fins et gris pour le réseau : on réutilise la scène avec une couleur neutre
    corps = scene(atomes, li, 28, 20, 0, 66, 210, 200, pre, baton=0.04, persp=0.05)
    corps = [s.replace(f'stroke="{ELEM["Na"][1]}"', 'stroke="#c9c2b1"').replace(f'stroke="{ELEM["Cl"][1]}"', 'stroke="#c9c2b1"') for s in corps]
    leg = (f'<g font-family="{POLICE}" font-size="13" fill="{ENCRE}">'
           f'<circle cx="430" cy="160" r="8" fill="url(#{pre}-Na)" stroke="{ENCRE}"/><text x="445" y="165">ion sodium Na⁺</text>'
           f'<circle cx="430" cy="196" r="12" fill="url(#{pre}-Cl)" stroke="{ENCRE}"/><text x="450" y="201">ion chlorure Cl⁻</text>'
           f'<text x="420" y="242" font-size="12" fill="#6b6f7a">dans ce bloc :</text>'
           f'<text x="420" y="260" font-size="12" fill="#6b6f7a">{nNa} Na⁺ et {nCl} Cl⁻</text></g>')
    svg = (f'<svg viewBox="0 0 {l} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cristal de chlorure de sodium en perspective : un cube de 4 ions de côté où ions sodium et ions chlorure alternent dans les trois directions de l\'espace ; {nNa} ions de chaque sorte">\n'
           f'  <defs>{"".join(gradients(pre, ["Na", "Cl"]))}</defs>\n'
           f'  <text x="{l/2:.0f}" y="24" text-anchor="middle" font-size="15" font-weight="700" fill="{ENCRE}">Cristal de chlorure de sodium (NaCl)</text>\n  '
           + "\n  ".join(corps) + "\n  " + leg + "\n"
           f'  <text x="{l/2:.0f}" y="{h - 12}" text-anchor="middle" font-size="12" fill="#6b6f7a" font-style="italic">dans les trois directions, chaque ion est entouré d\'ions de charge opposée</text>\n'
           "</svg>\n")
    SORTIE.mkdir(exist_ok=True)
    (SORTIE / "t1c4-nacl-3d.svg").write_text(svg, encoding="utf-8", newline="\n")

# ------------------------------------------------------------------ main ---
if __name__ == "__main__":
    at, li = eau()
    molecule("eau", "Molécule d'eau H₂O", "Modèle boules et bâtons : un atome d'oxygène lié à deux atomes d'hydrogène, molécule coudée (angle d'environ 104,5°).",
             at, li, (0, 0, 0), 360, 260, 112, 112)
    at, li = sulfate()
    crochets = (f'<g fill="none" stroke="{ENCRE}" stroke-width="2.4"><path d="M84 14h-12v212h12"/><path d="M284 14h12v212h-12"/></g>'
                f'<text x="302" y="30" font-size="20" font-weight="700" font-family="{POLICE}" fill="{ENCRE}">2−</text>')
    molecule("sulfate", "Ion sulfate SO₄²⁻", "Modèle boules et bâtons : un atome de soufre au centre d'un tétraèdre de quatre atomes d'oxygène ; l'ensemble porte deux charges négatives.",
             at, li, (14, 18, 0), 360, 270, 66, 113, crochets)
    at, li = ethanol()
    molecule("ethanol", "Molécule d'éthanol C₂H₆O", "Modèle boules et bâtons : deux atomes de carbone, six atomes d'hydrogène et un atome d'oxygène portant un hydrogène.",
             at, li, (-18, 8, 0), 420, 300, 74, 135)
    at, li = cyclohexane()
    molecule("cyclohexane", "Molécule de cyclohexane C₆H₁₂", "Modèle boules et bâtons : six atomes de carbone en cycle, en conformation chaise, chacun portant deux atomes d'hydrogène.",
             at, li, (0, -74, 0), 420, 300, 72, 132)
    cristal()
    # contrôles de géométrie
    at, _ = cyclohexane(); C = [p for e, p in at if e == "C"]
    ang = math.degrees(math.acos(dot(unit(sub(C[0], C[1])), unit(sub(C[2], C[1])))))
    print(f"cyclohexane : C-C = {norm(sub(C[0], C[1])):.3f} Å, C-C-C = {ang:.1f}°")
    at, _ = ethanol()
    print("éthanol : C-O =", round(norm(sub(at[2][1], at[1][1])), 3), "Å ; O-H =", round(norm(sub(at[3][1], at[2][1])), 3), "Å")
    print("fichiers écrits")
