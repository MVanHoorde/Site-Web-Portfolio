#!/usr/bin/env python3
"""
gabarit_fiche.py — les briques communes à toutes les fiches élève de PC.

Ce module ne connaît AUCUN chapitre. Il fournit la feuille A4, le CSS, et les
composants (encart, formule, exercice, figure, deux colonnes, QR code). Le
contenu d'un chapitre vit dans un fichier séparé, par exemple
`fiche_t3c1.py`, qui importe ce module.

POURQUOI CETTE SÉPARATION — quand le cours en ligne change, on ne retouche
que le fichier de chapitre. Le gabarit, lui, est le même pour les quatorze
fiches : une correction de mise en page profite à toutes.

TROIS RÈGLES QUI COMMANDENT CE FICHIER
1. La fiche ne DONNE pas le cours, elle le fait écrire : les définitions sont
   des cadres vides à lignes, les formules des boîtes à remplir. Seules les
   figures sont fournies — les faire recopier coûterait la séance.
2. Les fractions s'écrivent numérateur SUR dénominateur, jamais avec une
   barre oblique. C'est la règle du projet, elle vaut aussi sur papier.
3. Le CSS reste volontairement classique — tableaux, flottants, positions.
   Pas de flex ni de grid là où un tableau suffit : le rendu doit être
   identique dans un navigateur et dans un moteur d'impression.
"""

import re, sys
from pathlib import Path

# La console Windows ouvre en cp1252 : les ✓, ✗ et ⚠ de nos messages y lèvent
# UnicodeEncodeError, et le script meurt AVANT d'écrire la fiche. On force la
# sortie en UTF-8 dès l'import du gabarit — vaut pour tous les fichiers de
# chapitre, qui l'importent tous.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ------------------------------------------------------------------ figures

def charger_cours(chemin):
    """Lit une page de cours du site, pour y puiser les figures."""
    return Path(chemin).read_text(encoding="utf-8").replace("\r", "")


def svg(source, cle):
    """Extrait un SVG inline de la page du cours, par son aria-labelledby.

    Les figures de la fiche sont ainsi TOUJOURS celles du cours en ligne,
    dans leur version la plus récente : l'élève voit le même dessin sur sa
    feuille et à l'écran. On ne redessine jamais une figure qui existe."""
    m = re.search(r'(<svg viewBox=[^>]*aria-labelledby="' + cle + r'\b.*?</svg>)',
                  source, re.S)
    if not m:
        raise SystemExit(f"SVG introuvable dans la page du cours : {cle}")
    s = m.group(1)
    s = re.sub(r'\sclass="[^"]*zoomable[^"]*"', ' class="fig-svg"', s)
    s = re.sub(r'\stabindex="0"', "", s)
    s = re.sub(r'\sdata-zoom="[^"]*"', "", s)
    return s


# ------------------------------------------------------------------ QR codes

def qr_svg(url):
    """Fabrique un QR code en SVG, d'un seul tracé (léger, net à l'impression).

    ⚠ Toujours RELIRE le code produit avant de livrer (cf. verifier_qr) : un
    QR faux ne se voit pas à l'œil et envoie la classe entière nulle part."""
    import qrcode
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,
                      box_size=1, border=2)
    q.add_data(url)
    q.make(fit=True)
    m = q.get_matrix()
    n = len(m)
    d = []
    for y, ligne in enumerate(m):
        x = 0
        while x < n:
            if ligne[x]:
                x0 = x
                while x < n and ligne[x]:
                    x += 1
                d.append(f"M{x0} {y}h{x - x0}v1h-{x - x0}z")
            else:
                x += 1
    return (f'<svg viewBox="0 0 {n} {n}" xmlns="http://www.w3.org/2000/svg" '
            f'role="img" aria-label="QR code"><rect width="{n}" height="{n}" '
            f'fill="#fff"/><path fill="#141a26" shape-rendering="crispEdges" '
            f'd="{"".join(d)}"/></svg>')


def _image_du_qr(svg_texte, largeur=700):
    """Rend en image le SVG que qr_svg vient d'écrire.

    cairosvg est le chemin nominal. Sous Windows il exige la DLL cairo, que
    les postes n'ont pas : le repli relit le tracé lui-même — une suite de
    « M x y h w v1 h-w z » sur une grille n × n — et le repeint module par
    module. Il contrôle donc le SVG sérialisé, et non la matrice d'origine :
    c'est bien le fichier livré qu'on relit."""
    import io
    from PIL import Image
    try:
        import cairosvg
        png = cairosvg.svg2png(bytestring=svg_texte.encode(),
                               output_width=largeur)
        return Image.open(io.BytesIO(png))
    except Exception:
        pass
    n = int(re.search(r'viewBox="0 0 (\d+)', svg_texte).group(1))
    trace = re.search(r' d="([^"]*)"', svg_texte).group(1)
    img = Image.new("L", (n, n), 255)
    px = img.load()
    for x0, y, larg in re.findall(r"M(\d+) (\d+)h(\d+)v1", trace):
        x0, y, larg = int(x0), int(y), int(larg)
        for x in range(x0, x0 + larg):
            px[x, y] = 0
    echelle = max(1, largeur // n)
    return img.resize((n * echelle, n * echelle), Image.NEAREST)


def verifier_qr(svg_texte, url_attendue):
    """Relit le QR après rendu et compare à l'URL de départ.

    Nécessite pyzbar (+ libzbar0) et Pillow ; cairosvg est facultatif, voir
    _image_du_qr. Si les bibliothèques manquent, on ne bloque pas la
    production mais on le dit franchement."""
    try:
        from PIL import Image
        from pyzbar.pyzbar import decode
    except ImportError:
        print("  ⚠ relecture du QR impossible (pyzbar / Pillow absents)")
        return None
    lu = decode(_image_du_qr(svg_texte))
    ok = bool(lu) and lu[0].data.decode() == url_attendue
    print(f"  {'✓' if ok else '✗'} QR relu : {url_attendue[:60]}")
    return ok


# --------------------------------------------------------------- composants

B = '<span class="boite"></span>'          # case à remplir, taille normale
BP = '<span class="boite pt"></span>'      # case à remplir, petite


def frac(haut, bas):
    """Fraction numérateur sur dénominateur — jamais de barre oblique."""
    return (f'<span class="frac"><span class="haut">{haut}</span>'
            f'<span class="bas">{bas}</span></span>')


def ligne(n=1):
    return '<span class="ligne"></span>' * n


def h2(num, titre):
    return f'      <h2><span class="n">{num}</span> {titre}</h2>\n'


def suite(num, titre):
    return f'      <p class="suite"><span class="n">{num}</span> · {titre}</p>\n'


def ss(titre):
    """Sous-partie A · B · C, comme dans le cours en ligne."""
    return f'      <p class="ss">{titre}</p>\n'


def encart(genre, etiquette, lignes=3, avant="", apres=""):
    return (f'      <div class="encart {genre}">\n'
            f'        <div class="etq">{etiquette}</div>\n'
            f'        {avant}{ligne(lignes)}{apres}\n      </div>\n')


def figure(contenu, legende, largeur=None):
    st = f' style="max-width:{largeur}"' if largeur else ""
    return (f'      <div class="schema"{st}>\n        {contenu}\n'
            f'        <p class="legende">{legende}</p>\n      </div>\n')


def calcul(n=3):
    """Espace de rédaction d'un exercice : des lignes, rien d'autre.

    Pas de cadre, pas de tableau pré-dessiné — un cadre imposé dit à tort à
    l'élève où s'arrêter, et il trace lui-même le tableau ou le schéma dont
    il a besoin."""
    return f'        {ligne(n)}\n'


def formule(gauche, droite, nb_lignes=3):
    """Cadre formule : membre de gauche + fraction, grandeurs & unités à droite.

    Le membre de gauche est aligné à DROITE de sa cellule et la ligne est
    insécable : sans cela, « A = » se retrouve au-dessus de sa fraction dès
    que le numérateur s'allonge."""
    return (f'      <table class="formule-s"><tr>\n'
            f'        <td style="width:50%"><div class="eq">{gauche}'
            f'&nbsp;=&nbsp;{droite}</div></td>\n'
            f'        <td><div class="grandeurs">\n'
            f'          <div class="etq">Grandeurs &amp; unités</div>\n'
            f'          {ligne(nb_lignes)}\n        </div></td>\n'
            f'      </tr></table>\n')


def exercice(num, titre, question="", fig=None, largeur=None, lignes=None):
    """Énoncé d'exercice.

    RÈGLE : la figure d'un énoncé vit DANS le cadre de l'énoncé. Posée à
    côté, elle se lit comme une illustration du cours ; posée dedans, comme
    une donnée de l'exercice.

    `lignes` donne le nombre de lignes de rédaction. On ne pré-dessine ni
    tableau ni cadre de réponse : l'élève trace ce dont il a besoin."""
    h = (f'      <div class="encart exercice-f">\n'
         f'        <div class="etq">Exercice {num} — {titre}</div>\n')
    if question:
        h += f'        <p class="question-f">{question}</p>\n'
    if fig:
        h += (f'        <div class="schema" style="max-width:{largeur};'
              f'margin:1.5mm auto;">{fig}</div>\n')
    if lignes:
        h += calcul(lignes)
    return h + "      </div>\n"


def duo(gauche, droite, part_gauche="56%"):
    """Deux colonnes : un texte à gauche, une grande figure à droite."""
    return (f'      <table class="duo"><tr>\n'
            f'        <td style="width:{part_gauche}">\n{gauche}        </td>\n'
            f'        <td>\n{droite}        </td>\n      </tr></table>\n')


def qr_renvoi(svg_qr, titre, sous):
    """Renvoi vers une ressource en ligne, posé au fil du cours."""
    return (f'      <div class="qr-ligne">\n'
            f'        <div class="vignette">{svg_qr}</div>\n'
            f'        <div><b>{titre}</b><br><span class="mini">{sous}</span></div>\n'
            f'      </div>\n')


def essentiel(n=5):
    return ("      <p class=\"etq-essentiel\">L'essentiel du chapitre, avec mes "
            f"mots</p>\n      {ligne(n)}\n")


def cloture(qr_cours, qr_kahoot=None):
    """Bloc de fin : code de déblocage + QR. Une seule fois, dernière page."""
    cases = "<i></i>" * 6
    cols = (f'    <td style="width:26mm"><div class="qr">\n      {qr_cours}\n'
            f'      <span class="mini">le cours</span>\n    </div></td>\n')
    if qr_kahoot:
        cols += (f'    <td style="width:26mm"><div class="qr">\n      {qr_kahoot}\n'
                 f'      <span class="mini">Kahoot</span>\n    </div></td>\n')
    return ('\n  <table class="cloture"><tr>\n'
            '    <td><div class="deblocage">\n'
            '      <p style="margin-bottom:1.5mm"><span class="titre-debl">'
            'Fin du chapitre —</span>\n'
            '      code de déblocage du cours en ligne :</p>\n'
            f'      <p style="margin:0">{cases}</p>\n'
            '    </div></td>\n' + cols + '  </tr></table>')


def cartouche(theme, chapitre, intro, fond, professeur="M. Van Hoorde",
              logo="../assets/img/logo-isaac-lycee.png",
              niveau="Seconde générale", annee="2026 / 2027"):
    """Le cartouche d'identification, en tête de la première page.

    POURQUOI IL EST GROS — imprimée et glissée dans un classeur, la fiche
    doit s'identifier d'un coup d'œil : quel thème, quel chapitre, quel type
    de document. Un titre en une ligne ne suffisait pas.

    Le fond est l'image de la diapositive de titre du diaporama, délavée en
    amont vers la couleur du papier : fiche et projection se répondent.

    ⚠ La largeur du logo est contrainte par CSS (.logo). Sans elle, le moteur
    prend la taille intrinsèque du PNG — 2481 px, soit 656 mm — et le tableau
    écrase toute la page. Ça ne se voit qu'au rendu."""
    return (
        '\n  <div class="cartouche">\n'
        f'    <img class="fond" src="{fond}" alt="">\n'
        '    <div class="dedans">\n'
        '      <table class="ct-tete"><tr>\n'
        '        <td>\n'
        f'          <p class="ct-theme">{theme}</p>\n'
        f'          <h1>{chapitre}</h1>\n'
        '        </td>\n'
        f'        <td style="width:32mm"><img class="logo" src="{logo}" '
        'alt="Lycée Isaac de l\'Étoile"></td>\n'
        '      </tr></table>\n'
        f'      <p class="ct-intro">{intro}</p>\n'
        '      <table class="ct-pied"><tr>\n'
        f'        <td><b>{professeur}</b> · {niveau} · année {annee}</td>\n'
        '        <td class="ct-nature">fiche de cours — à compléter en classe</td>\n'
        '      </tr></table>\n'
        '    </div>\n  </div>\n'
        '  <table class="idligne"><tr>\n'
        '    <td style="width:11mm"><b>Nom</b></td><td class="etire"></td>\n'
        '    <td style="width:15mm;padding-left:3mm"><b>Prénom</b></td>'
        '<td class="etire"></td>\n'
        '    <td style="width:14mm;padding-left:3mm"><b>Classe</b></td>'
        '<td class="etire" style="width:22mm"></td>\n  </tr></table>')


# ------------------------------------------------------------------ feuille

def feuille(n, total, contenu, pied_gauche, entete=None, apres="",
            lignes_notes=33):
    tete = entete if entete is not None else ""
    notes = "<i></i>" * lignes_notes
    return f"""
<!-- ================= PAGE {n}/{total} ================= -->
<div class="feuille">
  <div class="bande"><i></i><i></i><i></i></div>{tete}
  <div class="corps">
    <div class="principal">
{contenu}
    </div>
    <aside class="marge-notes"><span class="etq-notes">notes</span>
      <div class="zone">{notes}</div></aside>
  </div>{apres}
  <div class="pied"><span>{pied_gauche}</span><span>page {n}/{total} · lycée Isaac de l'Étoile</span></div>
</div>
"""


# ---------------------------------------------------------------------- CSS

CSS = """
  :root {
    --encre:#141a26; --papier:#fdfcf8; --grille:#e8e4d8;
    --h-alpha:#d6402b; --h-beta:#1d9aaa; --h-gamma:#4a3f9e; --gris:#6b6f7a;
    --or-fonce:#b28a1d; --vert-fonce:#4c8a58;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { background:#9aa0ab; }
  body { font-family:'Spectral', Georgia, serif; color:var(--encre);
         font-size:10.5pt; line-height:1.5; }
  .feuille { width:210mm; min-height:297mm; margin:8mm auto; padding:10mm 13mm 16mm;
    background:var(--papier); position:relative; box-shadow:0 2px 14px rgba(0,0,0,.28);
    display:flex; flex-direction:column; }
  /* ⚠ NE PAS RETIRER. À l'impression, .feuille passe en hauteur FIXE : tout
     enfant flex y devient compressible. Le cartouche (height:60mm,
     overflow:hidden) était alors écrasé à zéro et disparaissait du PDF —
     titre, logo et introduction compris — sans que rien ne le signale à
     l'écran. Seul .corps doit absorber la place restante ; le reste garde sa
     taille, et un vrai débordement redevient visible (donc mesurable). */
  .feuille > *:not(.corps) { flex-shrink:0; }
  @page { size:A4; margin:0; }
  @media print {
    html, body { background:#fff; }
    .feuille { margin:0; box-shadow:none; height:296mm; min-height:0; overflow:hidden;
               page-break-after:always; background:#fff; }
    .feuille:last-child { page-break-after:auto; }
    .encart, .formule-s, .schema, table.t th, .deblocage, .qr, .qr-ligne { background:#fff; }
  }
  .bande { height:3.5px; background:var(--encre); position:relative; margin-bottom:3.5mm; }
  .bande i { position:absolute; top:0; bottom:0; width:3px; }
  .bande i:nth-child(1){ left:18%; background:var(--h-gamma); }
  .bande i:nth-child(2){ left:31%; background:var(--h-beta); }
  .bande i:nth-child(3){ left:76%; background:var(--h-alpha); }

  h1 { font-family:'Space Grotesk',sans-serif; font-size:13.5pt; line-height:1.15; }
  .sous { font-family:'IBM Plex Mono',monospace; font-size:7.6pt; color:var(--gris);
    margin:1mm 0 2mm; }
  .sous .rouge { color:var(--h-alpha); }

  /* Cartouche d'identification. L'image de fond est posée en absolu sous le
     texte ; elle est déjà délavée dans le fichier, on ne compte pas sur une
     opacité CSS que les moteurs d'impression rendent mal.
     ⚠ .logo DOIT porter une largeur, voir le commentaire de cartouche(). */
  .cartouche { position:relative; height:60mm; overflow:hidden;
    border:1.6px solid var(--encre); border-radius:2.5mm;
    margin-bottom:3mm; background:#fff; }
  .cartouche .fond { position:absolute; top:0; left:0; width:100%; }
  .cartouche .dedans { position:relative; padding:4mm 5mm 3.5mm; }
  table.ct-tete { width:100%; border-collapse:collapse; table-layout:fixed; }
  table.ct-tete td { vertical-align:top; padding:0; }
  .ct-theme { font-family:'IBM Plex Mono',monospace; font-size:8pt;
    letter-spacing:.16em; text-transform:uppercase; color:var(--h-alpha);
    margin-bottom:1.5mm; }
  .cartouche h1 { font-family:'Space Grotesk',sans-serif; font-size:15pt;
    line-height:1.14; margin-bottom:0; }
  .logo { width:32mm; height:auto; display:block; }
  .ct-intro { font-size:9.2pt; line-height:1.42; margin:2.5mm 0 3mm;
    padding-left:3mm; border-left:2.5px solid var(--h-beta); text-align:left; }
  table.ct-pied { width:100%; border-collapse:collapse;
    font-family:'IBM Plex Mono',monospace; font-size:7.6pt; color:var(--gris);
    border-top:1px solid var(--grille); }
  table.ct-pied td { padding:2mm 0 0; }
  table.ct-pied b { color:var(--encre); font-size:8.4pt; }
  .ct-nature { text-align:right; color:var(--h-alpha); }

  table.idligne { width:100%; border-collapse:collapse; margin-bottom:3.5mm;
    font-family:'IBM Plex Mono',monospace; font-size:8.5pt; }
  table.idligne td { padding:0 2mm 0 0; vertical-align:bottom; }
  table.idligne td.etire { border-bottom:1.3px dotted var(--encre); height:5mm; }

  .corps { display:grid; grid-template-columns:minmax(0,1fr) 46mm; column-gap:5mm;
           align-items:stretch; flex:1; }
  .principal { min-width:0; }
  aside.marge-notes { border-left:1px dashed var(--gris); padding-left:3mm;
    display:flex; flex-direction:column; }
  aside.marge-notes .etq-notes { font-family:'IBM Plex Mono',monospace; font-size:7pt;
    letter-spacing:.12em; text-transform:uppercase; color:var(--gris); margin-bottom:1.5mm; }
  /* Lignes de notes : des blocs empilés, pas un dégradé répété — le dégradé
     était arrondi par le moteur et l'interligne sautait d'un demi-millimètre. */
  aside.marge-notes .zone { flex:1; min-height:30mm; overflow:hidden; }
  aside.marge-notes .zone i { display:block; height:7.6mm;
    border-bottom:.9px solid var(--grille); }

  h2 { font-family:'Space Grotesk',sans-serif; font-size:11.5pt; margin:6mm 0 2.5mm;
       border-top:2.5px solid var(--encre); padding-top:2mm; overflow:hidden; }
  h2 .n { font-family:'IBM Plex Mono',monospace; font-size:8pt; color:var(--h-beta);
    margin-right:2.5mm; }
  .principal h2:first-child { margin-top:0; }
  .suite { font-family:'IBM Plex Mono',monospace; font-size:7.6pt; color:var(--gris);
    letter-spacing:.1em; text-transform:uppercase; margin:0 0 2mm;
    border-top:2.5px solid var(--encre); padding-top:2mm; }
  .suite .n { color:var(--h-beta); }
  .ss { font-family:'Space Grotesk',sans-serif; font-size:9.6pt; font-weight:600;
    color:var(--h-beta); margin:4mm 0 1.4mm; padding-bottom:.6mm;
    border-bottom:1px solid var(--grille); }

  p { margin-bottom:1.4mm; text-align:justify; }
  sub, sup { font-size:.68em; }
  .trou { display:inline-block; border-bottom:1.3px dotted var(--encre);
          min-width:24mm; height:1.05em; vertical-align:-1px; }
  .trou.court { min-width:14mm; } .trou.long { min-width:46mm; }
  .ligne { display:block; border-bottom:1.3px dotted var(--encre); height:7.4mm; }

  .encart { border:1px solid var(--encre); border-radius:0 2mm 2mm 0;
    padding:2.2mm 3mm 2.4mm; margin:2mm 0 3.2mm; background:#fff; }
  .encart .etq { font-family:'IBM Plex Mono',monospace; font-size:7.3pt; letter-spacing:.08em;
    text-transform:uppercase; margin-bottom:1mm; }
  .definition { border-left:3px solid var(--h-beta); }
  .definition .etq { color:var(--h-beta); }
  .propriete { border-left:3px solid var(--h-gamma); }
  .propriete .etq { color:var(--h-gamma); }
  .exercice-f { border-left:3px solid var(--h-alpha); background:#fdfdfb; }
  .exercice-f .etq { color:var(--h-alpha); }
  .attention-f { border-left:3px solid var(--h-alpha); background:#fffaf9; }
  .attention-f .etq { color:var(--h-alpha); }
  .methode-f { border-left:3px solid #f0cf6e; background:#fffdf4; }
  .methode-f .etq { color:var(--or-fonce); }
  .methode-f ol { list-style:none; counter-reset:met; margin:0 0 0 9mm; }
  .methode-f li { counter-increment:met; position:relative; margin-bottom:1.6mm; }
  .methode-f li::before { content:counter(met,upper-roman) "."; position:absolute;
    left:-9mm; width:7mm; text-align:right;
    font-family:'IBM Plex Mono',monospace; font-weight:600; color:var(--or-fonce); }

  table.formule-s { border:1px solid var(--encre); border-radius:2.5mm;
    border-collapse:collapse; width:100%; margin:2mm 0 3.2mm; background:#fff; }
  table.formule-s td { vertical-align:middle; }
  .formule-s .eq { font-family:'Spectral',serif; font-style:italic; font-size:14.5pt;
    text-align:center; padding:6mm 2mm; border-right:1px dashed var(--grille);
    white-space:nowrap; }
  .formule-s .grandeurs { padding:2mm 3mm; }
  .formule-s .grandeurs .etq { font-family:'IBM Plex Mono',monospace; font-size:7.3pt;
    letter-spacing:.08em; text-transform:uppercase; color:var(--gris); margin-bottom:1mm; }
  .boite { display:inline-block; width:13mm; height:7.6mm; border:1.2px solid var(--encre);
           border-radius:1mm; vertical-align:middle; margin:0 .6mm; }
  .boite.pt { width:9mm; height:6.6mm; }

  .frac { display:inline-block; vertical-align:middle; text-align:center;
          font-style:normal; }
  .frac .haut { display:block; border-bottom:1.6px solid var(--encre);
                padding:0 2.5mm 1.2mm; white-space:nowrap; }
  .frac .bas  { display:block; padding:1.2mm 2.5mm 0; }

  .a-connaitre { border:1.3px solid var(--h-alpha); border-radius:2mm;
    padding:1.8mm 3mm; margin:1.8mm 0 2mm; background:#fff;
    font-family:'Space Grotesk',sans-serif; font-size:10pt; }

  table.t { border-collapse:collapse; width:100%; font-size:9pt; }
  table.t th, table.t td { border:1px solid var(--encre); padding:1.2mm 2mm; text-align:center; }
  table.t th { font-family:'Space Grotesk',sans-serif; font-size:8pt; background:var(--papier); }
  td.vide { height:15mm; }


  .mini { font-family:'IBM Plex Mono',monospace; font-size:7.3pt; color:var(--gris); }
  .question-f { font-style:italic; font-size:9.3pt; }
  svg { display:block; }
  .schema { border:1px solid var(--grille); border-radius:2mm; padding:2mm;
            margin:2.4mm 0 3mm; background:#fff; }
  .schema svg, .schema img { width:100%; height:auto; display:block; }
  .schema .legende { font-family:'IBM Plex Mono',monospace; font-size:7.3pt; color:var(--gris);
    margin-top:1mm; line-height:1.5; text-align:justify; }

  .qr-ligne { border:1px solid var(--grille); border-left:3px solid var(--h-beta);
    border-radius:0 2mm 2mm 0; padding:1.8mm 2.5mm; margin:1.8mm 0 2.4mm;
    background:#fff; overflow:hidden; }
  .qr-ligne .vignette { float:left; width:14mm; margin-right:3mm; }
  .qr-ligne .vignette svg { width:14mm; height:14mm; display:block; }
  .qr-ligne b { font-family:'Space Grotesk',sans-serif; font-size:9pt; }
  .qr-ligne .mini { line-height:1.35; }

  .etq-essentiel { font-family:'IBM Plex Mono',monospace; font-size:7.6pt;
    letter-spacing:.1em; text-transform:uppercase; color:var(--h-beta);
    margin:5mm 0 1.5mm; border-top:1px solid var(--grille); padding-top:2mm; }

  /* ⚠ « table > tr > td » ne matche jamais : les moteurs insèrent un tbody
     implicite. Toujours écrire « table.x td ». */
  table.duo { width:100%; border-collapse:collapse; }
  table.duo td { vertical-align:top; padding:0; }
  table.duo td + td { padding-left:5mm; }

  .pied { position:absolute; bottom:6mm; left:13mm; right:13mm;
          font-family:'IBM Plex Mono',monospace; font-size:7pt; color:var(--gris);
          overflow:hidden; }
  .pied span:first-child { float:left; }
  .pied span:last-child { float:right; }
  .pied b { color:var(--encre); font-size:7.8pt; font-weight:600; }

  table.cloture { width:100%; border-collapse:separate; border-spacing:4mm 0;
    margin:3mm -4mm 4mm; }
  table.cloture td { vertical-align:top; }
  .deblocage { border:1.4px solid var(--encre); border-left:4px solid var(--h-gamma);
    border-radius:0 2mm 2mm 0; padding:2.5mm 3mm; background:#fff; }
  .deblocage .titre-debl { font-family:'Space Grotesk',sans-serif; font-weight:600; }
  .deblocage p i { width:6.5mm; height:7.5mm; border:1.2px solid var(--encre);
    border-radius:1mm; display:inline-block; margin-right:1.5mm; vertical-align:middle; }
  .qr { border:1.4px solid var(--encre); border-radius:2mm; padding:1.6mm;
        text-align:center; background:#fff; }
  .qr svg { width:17mm; height:17mm; margin:0 auto; }
  .qr .mini { text-align:center; line-height:1.25; display:block;
              margin-top:.6mm; white-space:nowrap; }
"""


def document(titre_onglet, pages, entete_commentaire=""):
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>{titre_onglet}</title>
<link rel="stylesheet" href="../assets/css/fonts.css">
{entete_commentaire}
<style>{CSS}</style>
</head>
<body>
{''.join(pages)}
</body>
</html>
"""
