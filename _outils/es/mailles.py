"""
mailles.py — les figures géométriques du chapitre « Les cristaux » (ES 1re, t1-c3).

    python _outils/es/mailles.py          # depuis la racine du dépôt

Écrit dans assets/img/es/1re-es-t1-c3/ toutes les figures fig-*.png : les
trois mailles (éclatée, compacte), le réseau 3D, les contributions selon la
position, les représentations de la CS, la maille CC du fer cotée, le
paramètre de maille.

Le rendu est un lancer de rayons orthographique, sans bibliothèque 3D : des
sphères dures, éventuellement coupées par le cube de la maille (représentation
compacte). Ce sont donc de vraies sphères aux vraies positions, aux vrais
rayons (CS : a/2 · CC : a√3/4 · CFC : a√2/4) — pas un dessin.

Code couleur, le même dans tout le chapitre (et dans la page, classe .pos-*) :
    sommet = bleu · face = vert · arête = violet · centre = orange
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.normpath(os.path.join(ICI, '..', '..', 'assets', 'img', 'es', '1re-es-t1-c3'))
SS = 2  # suréchantillonnage (anticrénelage)

COUL = {
    'sommet': (47, 98, 168),
    'face':   (38, 140, 88),
    'arete':  (132, 64, 170),
    'centre': (222, 112, 28),
    'neutre': (150, 150, 155),
    'noeud':  (70, 70, 78),
}
ENCRE = (34, 34, 40)
GRIS = (150, 150, 158)
FOND = (255, 255, 255)

POLICE = 'C:/Windows/Fonts/segoeui.ttf'
POLICE_ITAL = 'C:/Windows/Fonts/cambriai.ttf'

COINS = [np.array(p, float) for p in [(x, y, z) for x in (0, 1) for y in (0, 1) for z in (0, 1)]]
FACES = [np.array(p, float) for p in [(.5, .5, 0), (.5, .5, 1), (.5, 0, .5), (.5, 1, .5), (0, .5, .5), (1, .5, .5)]]
CENTRE = np.array((.5, .5, .5))
ARETES_CUBE = [(a, b) for i, a in enumerate(COINS) for b in COINS[i + 1:] if abs(np.abs(a - b).sum() - 1) < 1e-9]


def norm(v):
    return v / np.linalg.norm(v)


class Camera:
    """Vue orthographique depuis l'avant-droite, un peu au-dessus (x à droite,
    y en profondeur, z vers le haut)."""

    def __init__(self, az=28, el=20, centre=(.5, .5, .5)):
        a, e = np.radians(az), np.radians(el)
        self.c = norm(np.array([np.sin(a) * np.cos(e), -np.cos(a) * np.cos(e), np.sin(e)]))
        self.r = norm(np.cross([0, 0, 1], self.c))
        self.u = np.cross(self.c, self.r)
        self.s = np.array(centre, float)

    def proj(self, p):
        d = np.asarray(p, float) - self.s
        return d @ self.r, d @ self.u, d @ self.c


def rendre(spheres, cam, taille=(600, 600), echelle=300, boite=None, aretes=(), fantomes=(),
           decal=(0, 0)):
    """spheres : [(centre, rayon, couleur)] · boite : (lo, hi) pour couper ·
    aretes : [(p, q, style)] style ∈ {'plein', 'cache', 'guide', 'prolonge'} ·
    fantomes : sphères entières dessinées en transparence derrière la scène.
    Renvoie une image PIL en taille finale, et la fonction de projection
    (pour poser du texte)."""
    W, H = taille[0] * SS, taille[1] * SS
    k = echelle * SS
    jj, ii = np.mgrid[0:H, 0:W].astype(float)
    X = (ii - W / 2) / k + decal[0]
    Y = (H / 2 - jj) / k + decal[1]
    o = cam.s[None, None, :] + X[..., None] * cam.r + Y[..., None] * cam.u + 20 * cam.c
    d = -cam.c

    def lancer(liste, couper):
        tbest = np.full((H, W), np.inf)
        idx = np.full((H, W), -1)
        plat = np.zeros((H, W), bool)
        nplat = np.zeros((H, W, 3))
        if couper is not None:
            lo, hi = np.array(couper[0], float), np.array(couper[1], float)
            with np.errstate(divide='ignore', invalid='ignore'):
                t1 = (lo - o) / d
                t2 = (hi - o) / d
            tmin3 = np.minimum(t1, t2)
            tb0 = tmin3.max(axis=-1)
            tb1 = np.maximum(t1, t2).min(axis=-1)
            axe = tmin3.argmax(axis=-1)
        for n, (c, R, _) in enumerate(liste):
            oc = o - c
            b = oc @ d
            cc = (oc * oc).sum(-1) - R * R
            disc = b * b - cc
            ok = disc >= 0
            sq = np.sqrt(np.where(ok, disc, 0))
            t0, t1s = -b - sq, -b + sq
            if couper is not None:
                ent = np.maximum(t0, tb0)
                sor = np.minimum(t1s, tb1)
                ok &= ent < sor
                coupe = tb0 > t0
            else:
                ent = t0
                coupe = np.zeros_like(ok)
            mieux = ok & (ent < tbest)
            tbest = np.where(mieux, ent, tbest)
            idx = np.where(mieux, n, idx)
            plat = np.where(mieux, coupe, plat)
        if couper is not None:
            nn = np.zeros((H, W, 3))
            for a in range(3):
                m = axe == a
                nn[m, a] = -np.sign(d[a]) if d[a] != 0 else 1
            nplat = nn
        return tbest, idx, plat, nplat

    L = norm(0.55 * cam.c - 0.45 * cam.r + 0.7 * cam.u)
    Hv = norm(L + cam.c)

    def colorer(liste, tbest, idx, plat, nplat):
        img = np.zeros((H, W, 3))
        touche = idx >= 0
        P = o + tbest[..., None] * d
        for n, (c, R, coul) in enumerate(liste):
            m = touche & (idx == n)
            if not m.any():
                continue
            base = np.array(coul, float) / 255
            nrm = (P[m] - c) / R
            dif = np.clip(nrm @ L, 0, 1)
            spe = np.clip(nrm @ Hv, 0, 1) ** 38
            col = base[None] * (0.32 + 0.68 * dif[:, None]) + 0.45 * spe[:, None]
            # coupe plane : teinte claire et unie, comme une section
            mp = plat[m]
            if mp.any():
                np_ = nplat[m][mp]
                lum = 0.9 + 0.1 * np.clip(np_ @ L, -1, 1)
                clair = (0.52 * base + 0.48) * lum[:, None]
                col[mp] = clair
            img[m] = np.clip(col, 0, 1)
        return img, touche

    tb, idx, plat, npl = lancer(spheres, boite)
    img, touche = colorer(spheres, tb, idx, plat, npl)
    fond = np.ones((H, W, 3))
    final = np.where(touche[..., None], img, fond)

    if fantomes:
        tf, idf, plf, npf = lancer(fantomes, None)
        imf, tf_ok = colorer(fantomes, tf, idf, plf, npf)
        voile = tf_ok & ~touche
        final[voile] = 0.78 * fond[voile] + 0.22 * imf[voile]
        # contour du fantôme, en pointillés réguliers
        bord_f = np.zeros((H, W), bool)
        bord_f[:-1] |= tf_ok[:-1] != tf_ok[1:]
        bord_f[:, :-1] |= tf_ok[:, :-1] != tf_ok[:, 1:]
        bord_f &= ~touche
        final[bord_f] = np.array(GRIS) / 255

    # contours : changement d'objet, de coupe, ou saut de profondeur
    cle = np.where(touche, idx * 2 + plat, -1)
    prof = np.where(touche, tb, 1e3)
    bord = np.zeros((H, W), bool)
    for ax in (0, 1):
        a = cle
        b = np.roll(cle, -1, axis=ax)
        pa, pb = prof, np.roll(prof, -1, axis=ax)
        e = (a != b) | (np.abs(pa - pb) > 0.06)
        bord |= e
        bord |= np.roll(e, 1, axis=ax)
    final[bord] = np.array(ENCRE) / 255 * 0.9 + 0.1 * final[bord]

    im = Image.fromarray((final * 255).astype(np.uint8))
    dr = ImageDraw.Draw(im)

    # z-buffer : profondeur vers la caméra (plus grand = plus près)
    zbuf = np.where(touche, ((o + tb[..., None] * d) - cam.s) @ cam.c, -np.inf)

    def ecran(p):
        x, y, z = cam.proj(p)
        return ((x - decal[0]) * k + W / 2, H / 2 - (y - decal[1]) * k, z)

    STYLES = {
        'plein':    (ENCRE, 2.2, None),
        'cache':    (GRIS, 1.6, (9, 7)),
        'guide':    (GRIS, 1.5, (4, 5)),
        'prolonge': (GRIS, 1.6, (9, 7)),
        'axe':      ((120, 120, 128), 1.6, (14, 5, 3, 5)),
    }
    for p, q, style in aretes:
        coul, ep, motif = STYLES[style]
        x0, y0, z0 = ecran(p)
        x1, y1, z1 = ecran(q)
        long = np.hypot(x1 - x0, y1 - y0)
        n = max(2, int(long / 1.5))
        ts = np.linspace(0, 1, n)
        xs, ys, zs = x0 + (x1 - x0) * ts, y0 + (y1 - y0) * ts, z0 + (z1 - z0) * ts
        xi = np.clip(xs.astype(int), 0, W - 1)
        yi = np.clip(ys.astype(int), 0, H - 1)
        vis = zs >= zbuf[yi, xi] - 0.02
        s = ts * long
        if motif:
            per = sum(motif) * SS
            ph = s % per
            on = np.zeros_like(ph, bool)
            acc = 0
            for m_i, seg in enumerate(motif):
                if m_i % 2 == 0:
                    on |= (ph >= acc) & (ph < acc + seg * SS)
                acc += seg * SS
            vis &= on
        for a in range(n - 1):
            if vis[a] and vis[a + 1]:
                dr.line([(xs[a], ys[a]), (xs[a + 1], ys[a + 1])], fill=coul, width=int(ep * SS))

    im = im.resize(taille, Image.LANCZOS)
    return im, (lambda p: tuple(v / SS for v in ecran(p)[:2]))


def aretes_cube(cam, lo=(0, 0, 0), hi=(1, 1, 1)):
    """Les douze arêtes, en plein si elles touchent une face visible, sinon en
    pointillés (arêtes cachées)."""
    lo, hi = np.array(lo, float), np.array(hi, float)
    out = []
    for a, b in ARETES_CUBE:
        p, q = lo + a * (hi - lo), lo + b * (hi - lo)
        # une arête est cachée si elle est sur les trois faces arrière à la fois :
        # c'est l'arête qui passe par le coin le plus éloigné
        m = (p + q) / 2
        loin = lo + (hi - lo) * np.array([0 if cam.c[i] > 0 else 1 for i in range(3)])
        cache = np.sum(np.isclose(m, loin)) >= 2
        out.append((p, q, 'cache' if cache else 'plein'))
    return out


def texte(im, xy, s, taille=28, ital=False, coul=ENCRE, ancre='mm'):
    f = ImageFont.truetype(POLICE_ITAL if ital else POLICE, taille)
    ImageDraw.Draw(im).text(xy, s, font=f, fill=coul, anchor=ancre)


def fleche_cote(im, a, b, etiquette, decal=14, coul=ENCRE, taille=32):
    """Double flèche de cote entre deux points écran, décalée vers l'extérieur."""
    dr = ImageDraw.Draw(im)
    a, b = np.array(a), np.array(b)
    t = norm(b - a)
    n = np.array([t[1], -t[0]])
    a2, b2 = a + n * decal, b + n * decal
    dr.line([tuple(a2), tuple(b2)], fill=coul, width=2)
    for p, s in ((a2, 1), (b2, -1)):
        tip = p
        w1 = p + s * t * 11 + n * 5
        w2 = p + s * t * 11 - n * 5
        dr.polygon([tuple(tip), tuple(w1), tuple(w2)], fill=coul)
    m = (a2 + b2) / 2 + n * np.sign(decal or 1) * 24
    texte(im, tuple(m), etiquette, taille, ital=True, coul=coul)


def sauver(im, nom):
    chemin = os.path.join(SORTIE, nom)
    im.save(chemin, optimize=True)
    print('  ', nom, im.size)


# ------------------------------------------------------------------ scènes

R_CS, R_CC, R_CFC = 0.5, np.sqrt(3) / 4, np.sqrt(2) / 4
PETIT = 0.085


def scene(type_, rayon):
    s = [(c, rayon, COUL['sommet']) for c in COINS]
    if type_ == 'cc':
        s.append((CENTRE, rayon, COUL['centre']))
    if type_ == 'cfc':
        s += [(c, rayon, COUL['face']) for c in FACES]
    return s


def guides(type_):
    g = []
    if type_ == 'cc':
        for a in COINS:
            if a[0] == 0:
                g.append((a, 1 - a, 'axe'))
    if type_ == 'cfc':
        for i in range(0, 6, 2):
            g.append((FACES[i], FACES[i + 1], 'guide'))
    return g


def main():
    os.makedirs(SORTIE, exist_ok=True)
    cam = Camera()
    print('Figures écrites dans', SORTIE)

    # 1. les trois mailles, éclatée et compacte
    for t, R in (('cs', R_CS), ('cc', R_CC), ('cfc', R_CFC)):
        im, _ = rendre(scene(t, PETIT), cam, (420, 420), 235, aretes=aretes_cube(cam) + guides(t))
        sauver(im, f'fig-maille-{t}-eclatee.png')
        im, _ = rendre(scene(t, R), cam, (420, 420), 235, boite=((0, 0, 0), (1, 1, 1)),
                       aretes=[a for a in aretes_cube(cam) if a[2] == 'plein'])
        sauver(im, f'fig-maille-{t}-compacte.png')

    # 2. le réseau 3D (2 × 2 × 2 mailles) et une maille seule
    cam_r = Camera(centre=(1, 1, 1))
    noeuds = [np.array((x, y, z), float) for x in range(3) for y in range(3) for z in range(3)]
    traits = []
    for p in noeuds:
        for ax in range(3):
            q = p.copy(); q[ax] += 1
            if q[ax] <= 2:
                traits.append((p, q, 'plein'))
            if p[ax] == 0:
                e = p.copy(); e[ax] -= .35
                traits.append((e, p, 'prolonge'))
            if p[ax] == 2:
                e = p.copy(); e[ax] += .35
                traits.append((p, e, 'prolonge'))
    im, _ = rendre([(p, 0.07, COUL['noeud']) for p in noeuds], cam_r, (560, 560), 150, aretes=traits)
    sauver(im, 'fig-reseau-3d.png')
    im, _ = rendre([(c, 0.07, COUL['noeud']) for c in COINS], cam, (300, 300), 165, aretes=aretes_cube(cam))
    sauver(im, 'fig-maille-seule.png')

    # 3. contribution selon la position : la part de la sphère DANS la maille,
    #    et la sphère entière en transparence
    cas = [('centre', CENTRE, COUL['centre']),
           ('face', np.array((0, .5, .5)), COUL['face']),
           ('arete', np.array((.5, 1, 0)), COUL['arete']),
           ('sommet', np.array((0, 1, 0)), COUL['sommet'])]
    cam_p = Camera(az=30, el=22)
    for nom, c, coul in cas:
        R = 0.34
        im, _ = rendre([(c, R, coul)], cam_p, (300, 300), 150, boite=((0, 0, 0), (1, 1, 1)),
                       aretes=aretes_cube(cam_p), fantomes=[(c, R, coul)], decal=(0.02, 0.08))
        sauver(im, f'fig-contribution-{nom}.png')

    # 4. représentations de la CS
    empil = [(c, .5, COUL['sommet']) for c in COINS]
    im, _ = rendre(empil, Camera(), (360, 360), 118)
    sauver(im, 'fig-cs-empilement.png')
    im, _ = rendre(scene('cs', .5), cam, (360, 360), 200, boite=((0, 0, 0), (1, 1, 1)),
                   aretes=[a for a in aretes_cube(cam) if a[2] == 'plein'])
    sauver(im, 'fig-cs-dans-la-maille.png')
    im, _ = rendre(scene('cs', 0.06), cam, (360, 360), 200, aretes=aretes_cube(cam))
    sauver(im, 'fig-cs-billes.png')
    im, _ = rendre([], cam, (360, 360), 200, aretes=aretes_cube(cam))
    sauver(im, 'fig-cs-maille-nue.png')

    # 5. le paramètre de maille a
    im, ec = rendre([], cam, (420, 420), 220, aretes=aretes_cube(cam))
    a_, b_ = ec(np.array((0, 0, 0))), ec(np.array((1, 0, 0)))
    fleche_cote(im, a_, b_, 'a', decal=-22)
    a_, b_ = ec(np.array((1, 0, 0))), ec(np.array((1, 0, 1)))
    fleche_cote(im, a_, b_, 'a', decal=-22)
    a_, b_ = ec(np.array((1, 0, 0))), ec(np.array((1, 1, 0)))
    fleche_cote(im, a_, b_, 'a', decal=-22)
    sauver(im, 'fig-parametre-a.png')

    # 6. la maille CC du fer, cotée
    im, ec = rendre(scene('cc', 0.1), cam, (460, 460), 230, aretes=aretes_cube(cam) + guides('cc'))
    a_, b_ = ec(np.array((0, 0, 0))), ec(np.array((1, 0, 0)))
    fleche_cote(im, a_, b_, 'a = 2,87 Å', decal=-30, taille=30)
    sauver(im, 'fig-maille-cc-fer.png')


def hexagonale():
    """Maille hexagonale compacte (pour aller plus loin, séance 2) : prisme
    hexagonal, c/a = 1,633 ; 12 sommets + 2 centres de base + 3 à l'intérieur."""
    c = 1.633
    cam = Camera(az=24, el=22, centre=(0, 0, c / 2))
    hexa = [np.array((np.cos(t), np.sin(t), 0.0)) for t in np.radians(np.arange(0, 360, 60))]
    bas = hexa
    haut = [v + (0, 0, c) for v in hexa]
    sph = [(v, PETIT * 1.25, COUL['sommet']) for v in bas + haut]
    sph += [(np.array((0, 0, z)), PETIT * 1.25, COUL['face']) for z in (0, c)]
    for t in (30, 150, 270):
        r = 1 / np.sqrt(3)
        sph.append((np.array((r * np.cos(np.radians(t)), r * np.sin(np.radians(t)), c / 2)), PETIT * 1.25, COUL['centre']))
    ch = cam.c[:2] / np.linalg.norm(cam.c[:2])
    traits = []
    for i in range(6):
        a, b = bas[i], bas[(i + 1) % 6]
        m = (a + b) / 2
        traits.append((a, b, 'cache' if m[:2] @ ch < -0.05 else 'plein'))
        traits.append((haut[i], haut[(i + 1) % 6], 'plein'))
        traits.append((bas[i], haut[i], 'cache' if bas[i][:2] @ ch < -0.6 else 'plein'))
    im, _ = rendre(sph, cam, (440, 460), 150, aretes=traits)
    sauver(im, 'fig-maille-hexagonale.png')


def planche(nom, cases, cols, cote=260, titres_col=None, titres_lig=None, fleches=False, loupes=None):
    """Une planche d'une seule image pour la fiche de séance : le moteur n'y
    recopie que des figures à image unique (une grille de vignettes y passe
    en pleine largeur, une vignette par ligne). cases : [(fichier, légende)]."""
    f = ImageFont.truetype(POLICE, 21)
    fb = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 21)
    marge_g = 130 if titres_lig else 0
    haut_t = 40 if titres_col else 0
    pas_f = 46 if (fleches or loupes) else 0
    rects = []
    lig = (len(cases) + cols - 1) // cols
    h_leg = 62 if any(c[1] for c in cases) else 0
    W = marge_g + cols * cote + (cols - 1) * (16 + pas_f) + (40 if titres_col else 0)
    H = haut_t + lig * (cote + h_leg + 12)
    im = Image.new('RGB', (W, H), FOND)
    dr = ImageDraw.Draw(im)
    if titres_col:
        for k, t in enumerate(titres_col):
            x = marge_g + k * (cote + 16 + pas_f) + cote / 2
            dr.text((x, 20), t, font=fb, fill=ENCRE, anchor='mm')
    for k, (fic, leg) in enumerate(cases):
        r, c = divmod(k, cols)
        x = marge_g + c * (cote + 16 + pas_f)
        y = haut_t + r * (cote + h_leg + 12)
        v = Image.open(os.path.join(SORTIE, fic)).convert('RGB')
        v.thumbnail((cote, cote), Image.LANCZOS)
        px, py = int(x + (cote - v.width) / 2), int(y + (cote - v.height) / 2)
        im.paste(v, (px, py))
        rects.append((px, py, v.width, v.height))
        if leg:
            for j, ligne in enumerate(leg.split('\n')):
                dr.text((x + cote / 2, y + cote + 16 + j * 25), ligne, font=fb if j == 0 else f,
                        fill=ENCRE if j == 0 else (90, 90, 98), anchor='mm')
        if fleches and c < cols - 1:
            dr.text((x + cote + 8 + pas_f / 2, y + cote / 2), '⟷', font=ImageFont.truetype('C:/Windows/Fonts/seguisym.ttf', 30), fill=(110, 110, 118), anchor='mm')
        if titres_lig and c == 0:
            dr.text((marge_g - 14, y + cote / 2), titres_lig[r], font=f, fill=(90, 90, 98), anchor='rm')
    # la loupe (Figure 4) : un cercle sur l'image, deux traits qui l'ouvrent
    # sur l'image suivante, encadrée — le zoom de la page, en une image
    if loupes:
        rouge = (179, 18, 43)
        for k, L in enumerate(loupes):
            if not L or k + 1 >= len(rects): continue
            px, py, w, h = rects[k]
            cx, cy, r = px + L[0] * w, py + L[1] * h, max(9, L[2] * h)
            nx, ny, nw, nh = rects[k + 1]
            dr.line([(cx, cy - r), (nx - 4, ny - 4)], fill=rouge, width=2)
            dr.line([(cx, cy + r), (nx - 4, ny + nh + 4)], fill=rouge, width=2)
            dr.rounded_rectangle([nx - 4, ny - 4, nx + nw + 4, ny + nh + 4], radius=8, outline=rouge, width=3)
            dr.ellipse([cx - r, cy - r, cx + r, cy + r], outline=rouge, width=3)
    sauver(im, nom)


def planches_fiche():
    planche('fiche-fig2.png', [
        ('t1c3-photo-or.jpg', "Cristal d'or\nmicroscope à effet tunnel"),
        ('t1c3-photo-pyrite-mono.jpg', 'Pyrite\nblocs monocristallins'),
        ('t1c3-photo-pyrite-poly.jpg', 'Pyrite\nassemblage polycristallin'),
        ('t1c3-photo-fer.jpg', 'Fer usiné\nblocs trop petits pour être vus')], 4)
    planche('fiche-fig4.png', [
        ('t1c3-photo-granite.jpg', 'Roche\nle granite'),
        ('t1c3-photo-quartz.jpg', 'Minéral\nle quartz, SiO₂'),
        ('t1c3-quartz-reseau.png', 'Cristal\nle réseau cristallin'),
        ('t1c3-quartz-maille-quartz.png', 'Maille élémentaire\njaune Si⁴⁺ · rouge O²⁻')], 4,
        loupes=[(0.704, 0.502, 0.033), (0.8125, 0.504, 0.033), (0.827, 0.504, 0.033), None])
    planche('fiche-fig5.png', [
        ('fig-reseau-3d.png', 'réseau 3D\nil continue partout'),
        ('fig-maille-seule.png', 'maille élémentaire\nun seul cube, répété')], 2, cote=300)
    planche('fiche-fig6.png', [
        ('fig-maille-cs-eclatee.png', ''), ('fig-maille-cc-eclatee.png', ''), ('fig-maille-cfc-eclatee.png', ''),
        ('fig-maille-cs-compacte.png', ''), ('fig-maille-cc-compacte.png', ''), ('fig-maille-cfc-compacte.png', '')],
        3, cote=230, titres_col=['cubique simple', 'cubique centrée', 'cubique faces centrées'],
        titres_lig=['éclatée', 'compacte'])
    planche('fiche-fig8.png', [
        ('fig-contribution-centre.png', 'Au centre\npartagée par 1'),
        ('fig-contribution-face.png', 'Sur une face\npartagée par 2'),
        ('fig-contribution-arete.png', 'Sur une arête\npartagée par 4'),
        ('fig-contribution-sommet.png', 'Sur un sommet\npartagée par 8')], 4, cote=230)
    planche('fiche-fig10.png', [
        ('fig-cs-empilement.png', 'empilement réel'), ('fig-cs-dans-la-maille.png', 'atomes dans la maille'),
        ('fig-cs-billes.png', 'billes et barres'), ('fig-cs-maille-nue.png', 'maille élémentaire')], 4, cote=230)
    planche('fiche-fig11.png', [
        ('fig-maille-cfc-eclatee.png', 'représentation éclatée'),
        ('fig-maille-cfc-compacte.png', 'représentation compacte')], 2, cote=280)


if __name__ == '__main__':
    hexagonale()
    planches_fiche()
    main()
