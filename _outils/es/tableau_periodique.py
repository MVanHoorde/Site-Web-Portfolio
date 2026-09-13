# -*- coding: utf-8 -*-
"""Generateur des deux tableaux periodiques SVG du chapitre ES T1-C1.

UNE source de donnees, deux sorties, meme geometrie :

  1. « etats »       — le tableau du cours refait proprement : gaz, liquides,
                       elements artificiels, lanthanides et actinides
                       detaches, plus le marquage CHON demande par l'audit.
                       Va dans l'etape 1.2.
  2. « provenances » — le meme tableau colore par nucleosynthese, avec une
                       couleur distincte pour l'origine anthropique.
                       Va dans l'etape 2.4.

Les deux sont injectes INLINE dans la page, entre marqueurs, ce qui permet
de les regenerer sans retoucher le HTML a la main, et de les colorer avec
les variables CSS de la page (donc de suivre le theme).

  python _outils/es/tableau_periodique.py           # regenere et injecte
  python _outils/es/tableau_periodique.py --verifier  # controle seulement

🔴 Les couleurs ne sont pas ecrites ici : le SVG porte des CLASSES, et la
feuille de style de la page decide. Ne pas y remettre de couleur en dur.
"""
import io, os, re, sys

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PAGE = os.path.join(RACINE, "pages", "1re-es-t1-c1-nucleosynthese.html")
SORTIE = os.path.join(RACINE, "assets", "img", "es", "1re-es-t1-c1")

# ============================================================
# Les donnees : Z, symbole, groupe, periode.
# Les lanthanides (57-71) et actinides (89-103) n'ont pas de groupe :
# ils sont poses dans les deux rangees detachees du bas.
# ============================================================
PERIODES = [
    [("H", 1, 1), ("He", 2, 18)],
    [("Li", 3, 1), ("Be", 4, 2), ("B", 5, 13), ("C", 6, 14), ("N", 7, 15),
     ("O", 8, 16), ("F", 9, 17), ("Ne", 10, 18)],
    [("Na", 11, 1), ("Mg", 12, 2), ("Al", 13, 13), ("Si", 14, 14), ("P", 15, 15),
     ("S", 16, 16), ("Cl", 17, 17), ("Ar", 18, 18)],
    [("K", 19, 1), ("Ca", 20, 2), ("Sc", 21, 3), ("Ti", 22, 4), ("V", 23, 5),
     ("Cr", 24, 6), ("Mn", 25, 7), ("Fe", 26, 8), ("Co", 27, 9), ("Ni", 28, 10),
     ("Cu", 29, 11), ("Zn", 30, 12), ("Ga", 31, 13), ("Ge", 32, 14), ("As", 33, 15),
     ("Se", 34, 16), ("Br", 35, 17), ("Kr", 36, 18)],
    [("Rb", 37, 1), ("Sr", 38, 2), ("Y", 39, 3), ("Zr", 40, 4), ("Nb", 41, 5),
     ("Mo", 42, 6), ("Tc", 43, 7), ("Ru", 44, 8), ("Rh", 45, 9), ("Pd", 46, 10),
     ("Ag", 47, 11), ("Cd", 48, 12), ("In", 49, 13), ("Sn", 50, 14), ("Sb", 51, 15),
     ("Te", 52, 16), ("I", 53, 17), ("Xe", 54, 18)],
    [("Cs", 55, 1), ("Ba", 56, 2), ("Hf", 72, 4), ("Ta", 73, 5), ("W", 74, 6),
     ("Re", 75, 7), ("Os", 76, 8), ("Ir", 77, 9), ("Pt", 78, 10), ("Au", 79, 11),
     ("Hg", 80, 12), ("Tl", 81, 13), ("Pb", 82, 14), ("Bi", 83, 15), ("Po", 84, 16),
     ("At", 85, 17), ("Rn", 86, 18)],
    [("Fr", 87, 1), ("Ra", 88, 2), ("Rf", 104, 4), ("Db", 105, 5), ("Sg", 106, 6),
     ("Bh", 107, 7), ("Hs", 108, 8), ("Mt", 109, 9), ("Ds", 110, 10), ("Rg", 111, 11),
     ("Cn", 112, 12), ("Nh", 113, 13), ("Fl", 114, 14), ("Mc", 115, 15), ("Lv", 116, 16),
     ("Ts", 117, 17), ("Og", 118, 18)],
]
LANTHANIDES = [("La", 57), ("Ce", 58), ("Pr", 59), ("Nd", 60), ("Pm", 61), ("Sm", 62),
               ("Eu", 63), ("Gd", 64), ("Tb", 65), ("Dy", 66), ("Ho", 67), ("Er", 68),
               ("Tm", 69), ("Yb", 70), ("Lu", 71)]
ACTINIDES = [("Ac", 89), ("Th", 90), ("Pa", 91), ("U", 92), ("Np", 93), ("Pu", 94),
             ("Am", 95), ("Cm", 96), ("Bk", 97), ("Cf", 98), ("Es", 99), ("Fm", 100),
             ("Md", 101), ("No", 102), ("Lr", 103)]

# Noms francais, indexes par Z (NOMS[z]). Ils vont dans le <title> de chaque
# case — survol et lecteur d'ecran — et le panneau « Classification » de la
# page les y relit : pas de seconde liste a tenir a jour cote HTML.
NOMS = [None,
    "Hydrogène", "Hélium", "Lithium", "Béryllium", "Bore", "Carbone", "Azote", "Oxygène",
    "Fluor", "Néon", "Sodium", "Magnésium", "Aluminium", "Silicium", "Phosphore", "Soufre",
    "Chlore", "Argon", "Potassium", "Calcium", "Scandium", "Titane", "Vanadium", "Chrome",
    "Manganèse", "Fer", "Cobalt", "Nickel", "Cuivre", "Zinc", "Gallium", "Germanium",
    "Arsenic", "Sélénium", "Brome", "Krypton", "Rubidium", "Strontium", "Yttrium", "Zirconium",
    "Niobium", "Molybdène", "Technétium", "Ruthénium", "Rhodium", "Palladium", "Argent",
    "Cadmium", "Indium", "Étain", "Antimoine", "Tellure", "Iode", "Xénon", "Césium", "Baryum",
    "Lanthane", "Cérium", "Praséodyme", "Néodyme", "Prométhium", "Samarium", "Europium",
    "Gadolinium", "Terbium", "Dysprosium", "Holmium", "Erbium", "Thulium", "Ytterbium",
    "Lutécium", "Hafnium", "Tantale", "Tungstène", "Rhénium", "Osmium", "Iridium", "Platine",
    "Or", "Mercure", "Thallium", "Plomb", "Bismuth", "Polonium", "Astate", "Radon", "Francium",
    "Radium", "Actinium", "Thorium", "Protactinium", "Uranium", "Neptunium", "Plutonium",
    "Américium", "Curium", "Berkélium", "Californium", "Einsteinium", "Fermium", "Mendélévium",
    "Nobélium", "Lawrencium", "Rutherfordium", "Dubnium", "Seaborgium", "Bohrium", "Hassium",
    "Meitnérium", "Darmstadtium", "Roentgenium", "Copernicium", "Nihonium", "Flérovium",
    "Moscovium", "Livermorium", "Tennesse", "Oganesson"]

GAZ = {1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86}   # a 20 °C, sous 1 bar
LIQUIDES = {35, 80}                              # brome et mercure
CHON = {1, 6, 7, 8}
# 24 elements anthropiques, exactement le compte annonce dans le cours :
# tout ce qui depasse le plutonium (Z = 94). Le technetium (43) et le
# promethium (61) ne sont PAS comptes ici : on les trouve dans la nature a
# l'etat de traces, et c'est ce que dit le comptage « 94 naturels » retenu
# pour tout le parcours.
ANTHROPIQUES = set(range(95, 119))

def provenance(z):
    """Origine d'un noyau, a la maille de l'enseignement scientifique.
    C'est la regle deja donnee a l'eleve dans l'etape 2.4 : elle se lit sur
    le numero atomique, et c'est ce qui la rend utilisable en devoir."""
    if z in ANTHROPIQUES:  return "anthropique"
    if z <= 5:             return "primordiale"
    if z <= 26:            return "stellaire"
    return "explosive"

# ============================================================
# Geometrie
# ============================================================
CASE, GAP = 41, 3
PAS = CASE + GAP
MG_G, MG_H = 30, 34          # marge pour les numeros de periode / de groupe
SAUT = 26                    # espace avant les deux rangees detachees

def x_de(groupe):  return MG_G + (groupe - 1) * PAS
def y_de(periode): return MG_H + (periode - 1) * PAS

Y_LA = MG_H + 7 * PAS + SAUT
Y_AC = Y_LA + PAS
LARGEUR = MG_G + 18 * PAS + 4
HAUTEUR = Y_AC + CASE + 62   # + la legende

def case(sym, z, x, y, classes):
    """Une case : un rectangle, un symbole, et le numero atomique en petit.
    Le titre <title> sert l'accessibilite ET le survol du navigateur."""
    cl = " ".join(["c"] + classes)
    out = ['<g class="%s" data-z="%d">' % (cl, z)]
    out.append('<title>%s (%s) — numéro atomique %d</title>' % (NOMS[z], sym, z))
    out.append('<rect x="%d" y="%d" width="%d" height="%d" rx="3"/>' % (x, y, CASE, CASE))
    out.append('<text class="z" x="%d" y="%d">%d</text>' % (x + 3, y + 11, z))
    out.append('<text class="s" x="%d" y="%d">%s</text>' % (x + CASE / 2.0, y + CASE - 11, sym))
    if z in CHON:
        out.append('<circle class="chon" cx="%d" cy="%d" r="3.2"/>' % (x + CASE - 7, y + 8))
    out.append('</g>')
    return "".join(out)

def classes_etats(z):
    cl = []
    if z in ANTHROPIQUES: cl.append("art")
    elif z in GAZ:        cl.append("gaz")
    elif z in LIQUIDES:   cl.append("liq")
    if 57 <= z <= 71:     cl.append("lan")
    if 89 <= z <= 103:    cl.append("act")
    return cl

def classes_prov(z):
    return [provenance(z)[:4]]     # prim / stel / expl / anth

def corps(classeur):
    """Les 118 cases + les reperes de groupe et de periode."""
    out = []
    # numeros de groupe
    for g in range(1, 19):
        out.append('<text class="rep" x="%d" y="%d">%d</text>' % (x_de(g) + CASE / 2.0, MG_H - 8, g))
    # numeros de periode
    for p in range(1, 8):
        out.append('<text class="rep dr" x="%d" y="%d">%d</text>' % (MG_G - 8, y_de(p) + CASE / 2.0 + 4, p))
    # le corps du tableau
    for ip, ligne in enumerate(PERIODES):
        for sym, z, g in ligne:
            out.append(case(sym, z, x_de(g), y_de(ip + 1), classeur(z)))
    # les deux rangees detachees, alignees sous le groupe 3
    for i, (sym, z) in enumerate(LANTHANIDES):
        out.append(case(sym, z, x_de(3) + i * PAS, Y_LA, classeur(z)))
    for i, (sym, z) in enumerate(ACTINIDES):
        out.append(case(sym, z, x_de(3) + i * PAS, Y_AC, classeur(z)))
    # le trait qui rattache les deux rangees a leur case d'origine
    out.append('<path class="fil" d="M%d %d L%d %d"/>' % (
        x_de(3) + CASE / 2.0, y_de(6) + CASE, x_de(3) + CASE / 2.0, Y_LA))
    out.append('<rect class="c lan trou" x="%d" y="%d" width="%d" height="%d" rx="3"/>'
               % (x_de(3), y_de(6), CASE, CASE))
    out.append('<rect class="c act trou" x="%d" y="%d" width="%d" height="%d" rx="3"/>'
               % (x_de(3), y_de(7), CASE, CASE))
    out.append('<text class="rep pt" x="%d" y="%d">57-71</text>'
               % (x_de(3) + CASE / 2.0, y_de(6) + CASE / 2.0 + 4))
    out.append('<text class="rep pt" x="%d" y="%d">89-103</text>'
               % (x_de(3) + CASE / 2.0, y_de(7) + CASE / 2.0 + 4))
    return "\n".join(out)

def legende(entrees, y):
    """Une ligne de legende : pastille + libelle, a la queue leu leu."""
    out, x = [], MG_G
    for cl, txt in entrees:
        if cl == "chon":
            out.append('<g class="lg"><circle class="chon" cx="%d" cy="%d" r="3.2"/>'
                       '<text x="%d" y="%d">%s</text></g>' % (x + 7, y + 7, x + 18, y + 11, txt))
        else:
            out.append('<g class="lg"><rect class="c %s" x="%d" y="%d" width="14" height="14" rx="2"/>'
                       '<text x="%d" y="%d">%s</text></g>' % (cl, x, y, x + 20, y + 11, txt))
        x += 26 + 7.1 * len(txt)
    return "\n".join(out)

def svg(nom, titre, classeur, entrees_legende):
    return (
        '<svg class="tp %s" viewBox="0 0 %d %d" role="img" aria-labelledby="%s-t" '
        'xmlns="http://www.w3.org/2000/svg">\n'
        '<title id="%s-t">%s</title>\n%s\n%s\n</svg>'
        % (nom, LARGEUR, HAUTEUR, nom, nom, titre, corps(classeur),
           legende(entrees_legende, Y_AC + CASE + 24)))

TABLEAUX = {
    "tableau-etats": svg(
        "tp-etats",
        "Tableau périodique des 118 éléments : les gaz et les liquides à température ambiante, "
        "les éléments artificiels, et les quatre éléments qui composent l'essentiel de ton corps.",
        classes_etats,
        [("gaz", "Gaz"), ("liq", "Liquide"), ("art", "Artificiel"),
         ("chon", "Dans ton corps (C, H, O, N)")]),
    "tableau-provenances": svg(
        "tp-prov",
        "Tableau périodique des 118 éléments coloré par origine : nucléosynthèse primordiale, "
        "stellaire, explosive, ou fabrication humaine.",
        classes_prov,
        [("prim", "Primordiale"), ("stel", "Stellaire"),
         ("expl", "Explosive"), ("anth", "Anthropique")]),
}

# ============================================================
# Injection dans la page, entre marqueurs
# ============================================================
def injecter(src, nom, svg_txt):
    d = "<!-- SVG:%s — genere par _outils/es/tableau_periodique.py, ne pas editer a la main -->" % nom
    f = "<!-- /SVG:%s -->" % nom
    i, j = src.find(d), src.find(f)
    if i < 0 or j < 0:
        return src, False
    return src[:i + len(d)] + "\n" + svg_txt + "\n            " + src[j:], True

def main():
    if not os.path.isdir(SORTIE):
        os.makedirs(SORTIE)
    for nom, txt in TABLEAUX.items():
        chemin = os.path.join(SORTIE, "t1c1-%s.svg" % nom)
        with io.open(chemin, "w", encoding="utf-8", newline="\n") as f:
            f.write(txt + "\n")
    src = io.open(PAGE, encoding="utf-8").read()
    poses = []
    for nom, txt in TABLEAUX.items():
        src, ok = injecter(src, nom, txt)
        poses.append("%s : %s" % (nom, "injecte" if ok else "MARQUEURS ABSENTS"))
    if "--verifier" not in sys.argv:
        with io.open(PAGE, "w", encoding="utf-8", newline="\n") as f:
            f.write(src)
    # controles
    tous = sum(len(p) for p in PERIODES) + len(LANTHANIDES) + len(ACTINIDES)
    zs = set()
    for ligne in PERIODES:
        for _, z, _ in ligne: zs.add(z)
    for _, z in LANTHANIDES + ACTINIDES: zs.add(z)
    print("%d cases, %d numeros atomiques distincts" % (tous, len(zs)))
    print("manque :", sorted(set(range(1, 119)) - zs) or "rien")
    print("anthropiques : %d" % len(ANTHROPIQUES))
    print("noms : %d" % (len(NOMS) - 1) + ("" if len(NOMS) == 119 else "  <-- IL EN MANQUE"))
    for p in poses:
        print(" -", p)

if __name__ == "__main__":
    main()
