#!/usr/bin/env python3
"""
fiche_t2c1.py — contenu de la fiche élève du chapitre T2-C1 · Décrire le mouvement.

Ce fichier ne contient QUE ce qui est propre au chapitre. Toute la mise en page
vient de `gabarit_fiche.py`. Modèle : `fiche_t1c1.py` (paginable).

USAGE
    python fiche_t2c1.py [chemin/vers/la/page/de/cours.html]
    → ../../fiches/fiche-2nde-t2c1.html

CONSIGNES DE LOÏC (25/11/2026) — 🔴 ÉCART ASSUMÉ À LA RÈGLE R1
    La fiche ne fait écrire QUE huit éléments, un par crayon `a-noter` de la
    page :
        · Définition — Système                         (cadre à lignes)
        · Définition — Trajectoire                     (cadre à lignes)
        · l'expression du vecteur déplacement          (formule)
        · le vecteur vitesse moyenne : formule + propriété « caractéristiques »
        · le vecteur vitesse instantanée : formule + propriété « caractéristiques »
        · le tableau « Les variations de la vitesse »  (lignes à remplir)
    TOUT LE RESTE EST IMPRIMÉ : définitions des référentiels, chronophotographie,
    propriétés, notation, rappels de maths, démonstration, encarts d'histoire,
    exemple de relativité. Toutes les figures de la page y sont, dans l'ordre de
    la page (les SVG de correction exceptés, R2).

🔴 ÉCHELLE DES EXERCICES 4 ET 5 — la moto s'imprime à 102,5 mm de large : les
croix M1 et M2 sont à 165 px l'une de l'autre sur une image de 890 px, et
l'énoncé suppose M1M2 = 1,9 cm (relevé : _suivi/t2c1-releve.md). Ne jamais
passer cette image dans `figure()` à une autre largeur.

La notation vecteur (`.vec`) n'existe pas dans le gabarit : elle est passée en
tête de document par ce fichier (CSS_LOCAL), pour ne pas toucher le gabarit
commun (R12). À remonter dans le gabarit quand T2-C2 et T2-C3 auront leur fiche.
"""

import sys
from pathlib import Path

from gabarit_fiche import (
    charger_cours, svg, qr_svg, verifier_qr, document, feuille,
    cartouche, h2, suite, ss, encart, formule, exercice,
    qr_renvoi, cloture, essentiel, frac, ligne, B,
)
from gabarit_fiche import figure as _figure


def figure(contenu, legende, largeur=None):
    """La figure du gabarit, CENTRÉE quand elle est réduite (patron de T1-C1)."""
    h = _figure(contenu, legende, largeur)
    if largeur:
        ancre = f'max-width:{largeur}"'
        assert h.count(ancre) == 1
        h = h.replace(ancre, f'max-width:{largeur};margin-left:auto;margin-right:auto"')
    # légendes à gauche : justifiées en colonne étroite, elles se trouent (§6)
    return h.replace('<p class="legende">', '<p class="legende" style="text-align:left;">')

RACINE = Path(__file__).resolve().parents[2]
COURS_DEFAUT = RACINE / "pages" / "2nde-pc-t2-c1-decrire-le-mouvement.html"
SORTIE = RACINE / "fiches" / "fiche-2nde-t2c1.html"
DOSSIER = RACINE / "assets" / "img" / "pc" / "2nde-pc-t2-c1"
IMG = "../assets/img/pc/2nde-pc-t2-c1"      # relatif à fiches/

TITRE = "Thème 2 · Chapitre 1 — Décrire le mouvement"
PIED = "<b>M. Van Hoorde</b> · Fiche élève — Thème 2 · Chapitre 1"

# Deux phrases : le cartouche annonce, il ne résume pas. Reprend l'ouverture
# de la page (validée par Loïc le 25/11/2026).
INTRO = ("Ton premier chapitre de mécanique : avant de comprendre "
         "<i>pourquoi</i> les objets bougent, il faut savoir dire "
         "<i>comment</i> ils bougent. Système, référentiel, trajectoire, puis "
         "les vecteurs déplacement et vitesse : les outils qui te serviront "
         "jusqu'en terminale.")

LIENS = {
    "cours": "https://mvanhoorde.github.io/Site-Web-Portfolio/pages/"
             "2nde-pc-t2-c1-decrire-le-mouvement.html",
    "video-college": "https://www.youtube.com/watch?v=EJ4iGS5G5Ec",
    "video-vitesse": "https://www.youtube.com/watch?v=ciEQANTBk-0",
    "video-memo": "https://www.youtube.com/watch?v=Zzt6HpCXvnM&t=95s",
    # Quiz Diapason (25/11/2026) : mêmes salles fixes que la page et le diaporama
    "diag": "https://mvanhoorde.github.io/Site-Web-Portfolio/outils/quiz/?salle=MVTDG2",
    "traj": "https://mvanhoorde.github.io/Site-Web-Portfolio/outils/quiz/?salle=MVTTR4",
    "vect": "https://mvanhoorde.github.io/Site-Web-Portfolio/outils/quiz/?salle=MVTVC5",
    "unites": "https://mvanhoorde.github.io/Site-Web-Portfolio/outils/quiz/?salle=MVTUN3",
    "bilan": "https://mvanhoorde.github.io/Site-Web-Portfolio/outils/quiz/?salle=MVTBN6",
}

# Découpe en pages : index du PREMIER bloc de chaque page après la première.
# Proposée par `python paginer.py t2c1 13 282` (le paginateur surestime ici
# chaque page d'une quinzaine de mm), puis retouchée à la main : les titres
# « 02 » et « 03 » ouvrent chacun une page avec leur transition, le QR de la fiche mémo reste page 12.
# 12 pages sont hors de portée : trop de grands blocs dans la partie 02.
COUPES = [6, 14, 22, 28, 31, 38, 43, 45, 52, 59, 62, 67]

CSS_LOCAL = """<style>
  /* Notation vecteur — copie de la feuille commune des chapitres (13/11/2026) */
  .vec { position:relative; display:inline-block; padding-top:.34em; line-height:1;
    font-style:inherit; white-space:nowrap; text-indent:0; }
  .vec::before { content:""; position:absolute; left:.06em; right:.1em; top:.16em;
    border-top:.07em solid currentColor; }
  .vec::after { content:""; position:absolute; right:.07em; top:.06em; width:.18em; height:.18em;
    border-top:.07em solid currentColor; border-right:.07em solid currentColor;
    transform:rotate(45deg); transform-origin:center; }
  .vec sub { line-height:1; }
  /* Texte IMPRIMÉ dans un cadre (choix de Loïc pour ce chapitre) */
  .encart.imp p, .encart.imp li { font-size:9.6pt; line-height:1.42; }
  .encart.imp p:last-child { margin-bottom:0; }
  .encart.imp ul { margin:.4mm 0 1mm 4.5mm; }
  .encart.imp li { margin-bottom:.5mm; text-align:justify; }
  .exemple-f { border-left:3px solid var(--vert-fonce); }
  .exemple-f .etq { color:var(--vert-fonce); }
  .rappel-f { border:1px dashed var(--gris); border-left:3px solid var(--gris); }
  .rappel-f .etq { color:var(--gris); }
  .notation-f { border:1px dashed var(--encre); border-radius:2mm; }
  .notation-f .etq { color:var(--encre); }
  .histoire-f { border:1px solid #8a6d3b; border-radius:2mm; background:#fbf7ee; }
  .histoire-f .etq { color:#8a6d3b; }
  .histoire-f h4 { font-family:'Space Grotesk',sans-serif; font-size:9.6pt; margin:0 0 1mm; }
  .histoire-f img { width:100%; height:auto; display:block; border:1px solid #8a6d3b; }
  .encart.histoire-f p.credit { font-family:'IBM Plex Mono',monospace; font-size:6.6pt;
    color:#8a6d3b; line-height:1.35; margin-top:.8mm; text-align:left; }
  @media print { .histoire-f { background:#fbf7ee; } }
  p.transition-f { font-style:italic; font-size:10.3pt; border-left:2.5px solid var(--h-beta);
    padding-left:3mm; margin:3.5mm 0 1.5mm; text-align:left; }
  p.cours-f { font-size:9.6pt; line-height:1.45; }
  ul.cours-f { margin:0 0 1.6mm 4.5mm; font-size:9.6pt; line-height:1.45; }
  table.cote { width:100%; border-collapse:collapse; }
  table.cote td { vertical-align:top; padding:0; }
  table.cote td + td { padding-left:4mm; }
  table.memo-f { width:100%; border-collapse:collapse; }
  table.memo-f td { vertical-align:middle; padding:1mm 0; }
  table.memo-f td + td { padding-left:4mm; }
  table.memo-f svg { width:100%; height:auto; }
  .memo-titre-f { font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:9pt;
    letter-spacing:.08em; text-transform:uppercase; color:#fff; background:var(--h-beta);
    text-align:center; padding:.8mm 2mm; margin:-2.2mm -3mm 1.5mm; border-radius:0 2mm 0 0; }
  @media print { .memo-titre-f { background:var(--h-beta); -webkit-print-color-adjust:exact;
    print-color-adjust:exact; } }
</style>"""


def codes_qr(muet=False):
    qr = {}
    if not muet:
        print("QR codes :")
    for nom, url in LIENS.items():
        qr[nom] = qr_svg(url)
        if not muet:
            verifier_qr(qr[nom], url)
    return qr


def img(nom, alt, style=""):
    """Une image du dossier du chapitre. Proportions écrites EN DUR : voir
    `fiche_t1c1.py` (la page-sonde du paginateur ne charge pas les images)."""
    from PIL import Image
    w, h = Image.open(DOSSIER / nom).size
    return (f'<img src="{IMG}/{nom}" alt="{alt}" width="{w}" height="{h}" '
            f'style="aspect-ratio:{w}/{h};{style}">')


def V(x):
    """Un vecteur, flèche au-dessus : V('OM<sub>i</sub>')."""
    return f'<span class="vec">{x}</span>'


def imprime(genre, etiquette, corps):
    """Un cadre dont le texte est IMPRIMÉ (rien à écrire)."""
    return encart(f"{genre} imp", etiquette, 0, avant=corps)


def P(html):
    return f'<p>{html}</p>'


def transition(html):
    return f'      <p class="transition-f">→ {html}</p>\n'


def para(html):
    return f'      <p class="cours-f">{html}</p>\n'


def cote(gauche, droite, part="50%"):
    return ('      <table class="cote"><tr>'
            f'<td style="width:{part}">{gauche}</td><td>{droite}</td>'
            '</tr></table>\n')


def leg(texte):
    return f'<p class="legende" style="text-align:left;">{texte}</p>'


# La moto des exercices 4 et 5 — À L'ÉCHELLE (voir l'en-tête).
MOTO_MM = 102.5


def moto():
    return img("t2c1-motos-source.jpg",
               "Six positions successives d'une moto, chacune marquée d'une croix",
               f"width:{MOTO_MM}mm;max-width:none;margin:0 auto;")


def blocs(src, qr):
    D, PR = "definition", "propriete"
    Mi, Mj = "M<sub>i</sub>", "M<sub>j</sub>"

    return [
        # == 01 ==============================================================
        (("01", "Système et référentiel"), None),
        (None, para("Pour étudier le mouvement d'un objet, il est nécessaire de "
                    "fixer l'objet d'étude et ce par rapport à quoi le mouvement "
                    "est décrit.")),
        (None, qr_renvoi(qr["diag"], "Diagnostic du thème — Diapason",
                         "avant de commencer : ce que tu sais déjà du collège")),
        (None, ss("A · Le système")),
        (None, encart(D, "Définition — Système", 5)),
        (None, cote(
            para("Pour simplifier cette étude, <b>on modélise souvent le "
                 "système par un point</b>, son centre de gravité, auquel on "
                 "attribue la masse du système. C'est le modèle du <b>point "
                 "matériel</b>, on parle alors de <i>mécanique du point</i>.")
            + para("<b>Ce modèle a un prix : la perte d'informations.</b> "
                   "Réduit à un point, le système ne tourne plus sur lui-même "
                   "et ne se déforme plus : tout ce qui concerne ses "
                   "<b>rotations</b> et ses <b>déformations</b> disparaît de la "
                   "description (Image 2)."),
            figure(img("t2c1-pomme-point-materiel-source.jpg",
                       "Une pomme qui tombe, puis ses positions réduites à des croix"),
                   "Image 1 — Le système étudié est la pomme. Dans le modèle du "
                   "point matériel (à droite), ses positions successives sont "
                   "symbolisées par des points."),
            "56%")),
        (None, figure(img("t2c1-perchiste-point-materiel.jpg",
                          "Chronophotographie d'un saut à la perche et sa "
                          "simplification en croix"),
                      "Image 2 — La mécanique du point ne permet pas d'étudier "
                      "les rotations et déformations d'un système. Il faut alors "
                      "prendre en compte la forme de l'objet : c'est la mécanique "
                      "du solide. Ici, on perd les postures du perchiste.")),
        (None, para("<b>Tout est une question d'échelle.</b> On choisit les "
                    "échelles d'espace et de temps adaptées au mouvement étudié. "
                    "La Terre, de 12 700 km de diamètre, tourne autour du Soleil "
                    "à 150 millions de kilomètres, en un an : à cette échelle, "
                    "elle n'est qu'un point. Pour décrire la course d'un joueur "
                    "sur un terrain de football, sur quelques dizaines de mètres "
                    "et en quelques secondes, la Terre n'est plus du tout un "
                    "point : c'est le sol sur lequel il court.")),
        (None, transition("Un système, réduit à un point. Reste à dire "
                          "<i>par rapport à quoi</i> il bouge.")),
        (None, ss("B · Le référentiel")),
        (None, imprime(D, "Définition — Référentiel",
                       P("Pour étudier le mouvement d'un système, il faut "
                         "préciser le <b>référentiel</b>, c'est-à-dire l'objet "
                         "de référence par rapport auquel on décrit le "
                         "mouvement.")
                       + P("On associe à un référentiel un <b>repère "
                           "d'espace</b> et un <b>repère de temps</b>."))),
        (None, cote(
            figure(svg(src, "t2c1-rep-t"),
                   f"Image 3 — Repère d'espace : un point d'origine O et des "
                   f"axes, ici {V('i')} et {V('j')}."),
            figure(img("t2c1-chronometre.jpg", "Un chronomètre tenu à la main",
                       "width:46mm;margin:0 auto;"),
                   "Image 4 — Repère de temps : il faut choisir une horloge et "
                   "une <b>origine des temps</b>."))),
        (None, para("Pour un athlète, l'horloge est le chronomètre qui décompte "
                    "le temps et l'origine des dates est le moment du tir du "
                    "pistolet, c'est-à-dire le moment où on démarre le "
                    "chronomètre. L'unité du Système International du temps est "
                    "la <b>seconde</b> (s).")),
        (None, imprime(PR, "Propriété",
                       P("La description du mouvement d'un système dépend en "
                         "premier lieu du choix du référentiel <i>(un exemple "
                         "en partie 03 C)</i>."))),
        (None, qr_renvoi(qr["video-college"], "Rappels du collège, en vidéo",
                         "système, référentiel, trajectoire — chaîne Paul Olivier")),
        (None, transition("Trois référentiels reviennent sans cesse : à chacun "
                          "son repère d'espace.")),
        (None, ss("C · Exemples de référentiels")),
        # Chaque définition à GAUCHE de son image : l'ordre de lecture est
        # celui de la page, la place gagnée évite deux pages (25/11).
        (None, cote(
            imprime(D, "Définition — Référentiel terrestre",
                    P("Pour étudier le mouvement d'un système sur la Terre, "
                      "ou au voisinage de la Terre, on choisit le plus "
                      "souvent le <b>référentiel terrestre</b> dont le repère "
                      "d'espace est défini par le sol de la Terre ou par tout "
                      "objet fixe par rapport au sol.")),
            figure(img("t2c1-referentiel-terrestre-athlete.jpg",
                       "Une athlète lance un ballon lesté, trois clichés"),
                   "Image 5 — Référentiel terrestre."), "40%")),
        (None, cote(
            imprime(D, "Définition — Référentiel géocentrique",
                    P("Pour étudier le mouvement d'un système tournant autour "
                      "de la Terre (la Lune, les satellites, …) on utilise le "
                      "<b>référentiel géocentrique</b> dont le repère "
                      "d'espace est défini par le centre de la Terre et des "
                      "étoiles lointaines considérées comme fixes.")),
            figure(img("t2c1-referentiel-geocentrique-source.jpg",
                       "La Terre, un satellite et trois axes vers des étoiles "
                       "lointaines"),
                   "Image 6 — Référentiel géocentrique."), "40%")),
        (None, cote(
            imprime(D, "Définition — Référentiel héliocentrique",
                    P("Pour étudier le mouvement d'un système tournant autour "
                      "du Soleil (la Terre, les comètes, …) on utilise le "
                      "<b>référentiel héliocentrique</b> dont le repère "
                      "d'espace est défini par le centre du Soleil et des "
                      "étoiles lointaines considérées comme fixes.")),
            figure(img("t2c1-referentiel-heliocentrique-source.jpg",
                       "Le Soleil, les orbites des planètes et trois axes"),
                   "Image 7 — Référentiel héliocentrique."), "40%")),

        # == 02 ==============================================================
        (("02", "Trajectoire et vecteur déplacement"), None),
        (None, transition("Le référentiel choisi, on peut suivre les positions "
                          "du point, l'une après l'autre.")),
        (None, ss("A · Trajectoire et mouvement d'un système")),
        (None, encart(D, "Définition — Trajectoire", 4)),
        (None, para("Trois formes de trajectoire sont au programme de seconde ; "
                    "elles donnent leur nom au mouvement :")
               + '      <ul class="cours-f">'
                 "<li>(à gauche) Lorsque la trajectoire est une portion de "
                 "droite, le mouvement est dit <b>rectiligne</b>.</li>"
                 "<li>(au centre) Lorsque la trajectoire est un cercle ou un arc "
                 "de cercle, le mouvement est dit <b>circulaire</b>.</li>"
                 "<li>(à droite) Lorsque la trajectoire est une courbe "
                 "quelconque (ni une droite, ni un cercle), le mouvement est dit "
                 "<b>curviligne</b>.</li></ul>\n"),
        (None, figure(svg(src, "t2c1-traj-t"),
                      "Image 8 — Trois formes de trajectoire, qui donnent leur "
                      "nom au mouvement.")),
        (None, imprime("attention-f",
                       "Attention — ne pas confondre trajectoire et mouvement",
                       P("<b>La trajectoire, c'est le tracé</b> : la ligne qui "
                         "passe par <i>toutes</i> les positions du point, et il "
                         "y en a une infinité. Une chronophotographie n'en montre "
                         "que quelques-unes, prises à intervalles réguliers : la "
                         "trajectoire est la ligne qui les relie.")
                       + P("<b>Le mouvement, c'est la trajectoire <i>et</i> la "
                           "façon dont la vitesse évolue le long de ce "
                           "tracé.</b>")
                       + P("<i>Rectiligne, circulaire, curviligne</i> décrivent "
                           "la forme de la trajectoire. <i>Uniforme, accéléré, "
                           "ralenti</i> décriront la vitesse (partie 03). Décrire "
                           "complètement un mouvement, c'est donner les deux : "
                           "«&nbsp;rectiligne uniforme&nbsp;», «&nbsp;circulaire "
                           "ralenti&nbsp;»…")
                       + P("Exemple : sur une même ligne droite, une voiture "
                           "peut rouler à vitesse constante ou freiner. Même "
                           "trajectoire, deux mouvements différents."))),
        (None, imprime(D, "Définition — Chronophotographie",
                       P("Une <b>chronophotographie</b> est la superposition de "
                         "clichés pris à intervalles de temps réguliers et "
                         "permettant ainsi de repérer l'évolution de la position "
                         "d'un objet au cours du temps, d'en tracer la "
                         "trajectoire et d'en calculer la vitesse."))),
        (None, imprime("histoire-f", "Histoire des sciences",
                       '<table class="cote"><tr><td style="width:23mm">'
                       + img("t2c1-marey-fusil-photographique.jpg",
                             "Gravure : Marey vise le ciel avec son fusil "
                             "photographique")
                       + '<p class="credit">La Nature n° 464, 22 avril 1882 — '
                         'domaine public.</p></td><td>'
                       + "<h4>Étienne-Jules Marey (1830 – 1904), le mouvement "
                         "photographié</h4>"
                       + P("En 1882, le physiologiste français Étienne-Jules "
                           "Marey veut comprendre le vol des oiseaux, trop "
                           "rapide pour l'œil. Il invente un <b>fusil "
                           "photographique</b> : on vise l'oiseau, on appuie sur "
                           "la détente, et l'appareil prend <b>12 images par "
                           "seconde</b>.")
                       + P("Il enregistre ensuite toutes les positions "
                           "successives sur une seule plaque : c'est la "
                           "<b>chronophotographie</b>. Sur son pélican, ci-dessous, "
                           "on lit la trajectoire de l'oiseau… mais aussi ses "
                           "battements d'ailes, que le modèle du point matériel "
                           "effacerait.")
                       + "</td></tr></table>"
                       + '<div style="margin:1.5mm auto 0;max-width:90mm">'
                       + img("t2c1-marey-pelican.jpg",
                             "Chronophotographie d'un pélican en vol")
                       + '<p class="credit">Étienne-Jules Marey, pélican en vol, '
                         'chronophotographie sur plaque fixe, années 1880 — '
                         'domaine public.</p></div>')),
        (None, exercice(
            1, "Décrire un mouvement",
            "Décrire le mouvement figurant sur la chronophotographie ci-dessous.",
            fig=img("t2c1-chronophoto-perchiste.jpg",
                    "Chronophotographie ancienne d'un saut à la perche")
                + leg("Image 9 — Chronophotographie d'un saut à la perche."),
            largeur="80mm", lignes=6)),
        (None, qr_renvoi(qr["traj"], "S'entraîner — Diapason",
                         "trajectoire et mouvement")),
        (None, transition("Pour aller plus loin que la forme de la trajectoire, "
                          "il faut repérer chaque position par une flèche.")),
        (None, ss("B · Vecteur position")),
        (None, imprime("rappel-f", "Rappel de mathématiques — les vecteurs",
                       '<ul>'
                       f"<li>Le vecteur {V('AB')} part du <b>point de départ</b> "
                       "A et arrive au <b>point d'arrivée</b> B. La flèche se "
                       "dessine à l'arrivée.</li>"
                       "<li>Il a trois caractéristiques : sa <b>direction</b> (la "
                       "droite qui le porte), son <b>sens</b> (de A vers B) et sa "
                       "<b>norme</b> (sa longueur, notée AB, sans flèche).</li>"
                       "<li>Deux vecteurs sont <b>colinéaires</b> lorsqu'ils ont "
                       "la même direction : ils sont parallèles.</li>"
                       f"<li><b>Vecteur opposé</b> : {V('BA')} = −{V('AB')}. "
                       "Même direction, même norme, sens contraire. Par exemple, "
                       f"{V('M<sub>13</sub>M<sub>7</sub>')} = "
                       f"−{V('M<sub>7</sub>M<sub>13</sub>')}.</li>"
                       f"<li><b>Relation de Chasles</b> : {V('AB')} + {V('BC')} "
                       f"= {V('AC')}. Aller de A à B, puis de B à C, revient à "
                       "aller directement de A à C.</li></ul>"
                       '<div style="max-width:92mm;margin:1mm auto 1.5mm">'
                       + svg(src, "t2c1-rv-t") + "</div>"
                       + P("<b>Attention, le mot « origine » a deux sens.</b> "
                           "L'origine du <i>repère</i>, c'est le point O. Pour un "
                           "<i>vecteur</i>, on parlera de <b>point de départ</b>, "
                           "pour ne pas confondre."))),
        (None, qr_renvoi(qr["vect"], "S'entraîner — Diapason",
                         "les vecteurs : notations, Chasles, égalités")),
        (None, para("Le <b>vecteur position</b> d'un système en mouvement dépend "
                    "de l'origine du repère choisi.")),
        (None, imprime("notation-f", "Remarque — notation",
                       P(f"Le vecteur position du point {Mi} par rapport à O se "
                         f"note ici {V('OM<sub>i</sub>')}."))),
        (None, cote(
            figure(svg(src, "t2c1-pos-t"),
                   f"Image 10 — Schéma théorique du vecteur position. Le point "
                   f"d'arrivée étant M(t<sub>i</sub>), le vecteur se note "
                   f"{V('OM(t<sub>i</sub>)')}."),
            figure(img("t2c1-chronophoto-skieur.jpg",
                       "Chronophotographie d'un skieur et sa simplification"),
                   "Image 11 — Chronophotographie d'un skieur (à gauche). "
                   "Simplification d'après le modèle du point matériel (à "
                   "droite)."))),
        (None, exercice(
            2, "Vecteur position",
            apres_contexte=cote(
                '<p class="question-f">1. Positionner votre repère spatial.'
                "<br>2. Légender les points M<sub>7</sub> et M<sub>13</sub>."
                "<br>3. Tracer les vecteurs position "
                f"{V('OM<sub>7</sub>')} et {V('OM<sub>13</sub>')}.</p>"
                + ligne(9),
                '<div class="schema" style="max-width:80mm;margin-left:auto">' + svg(src, "t2c1-ex2-t")
                + leg("Les positions successives du skieur, relevées sur "
                      "l'Image 11.") + "</div>", "40%"))),
        (None, transition("Si le vecteur position dépend de l'origine, que "
                          "reste-t-il qui ne dépende que du mouvement ?")),
        (None, ss("C · Vecteur déplacement")),
        (None, imprime(PR, "Propriété — Vecteur déplacement",
                       P("Le <b>vecteur déplacement</b> de ce système entre deux "
                         "positions est la différence des vecteurs position et "
                         "ne dépend donc pas de l'origine du repère choisi."))),
        (None, formule(V(f"{Mi}{Mj}"), f"{B} − {B}", 4)),
        (None, cote(imprime("methode-f", "D'où vient cette formule ? — la démonstration",
                       P(f"Pour aller de {Mi} à {Mj}, on passe par O, comme par "
                         "une gare de correspondance (relation de Chasles) :")
                       + '<p style="text-align:center">'
                         f"{V(Mi + Mj)} = {V(Mi + 'O')} + {V('O' + Mj)}</p>"
                       + P(f"Or {V(Mi + 'O')} est l'opposé de {V('O' + Mi)} : "
                           f"{V(Mi + 'O')} = −{V('O' + Mi)}. Donc :")
                       + '<p style="text-align:center">'
                         f"{V(Mi + Mj)} = −{V('O' + Mi)} + {V('O' + Mj)} = "
                         f"{V('O' + Mj)} − {V('O' + Mi)}</p>"
                       + P("C'est exactement la construction de l'image 11 bis, "
                           "ci-contre.")),
            figure(svg(src, "t2c1-con-t"),
                      f"Image 11 bis — Construction du vecteur déplacement "
                      f"{V('M<sub>12</sub>M<sub>26</sub>')}. En pointillés : "
                      f"{V('OM<sub>26</sub>')} + (−{V('OM<sub>12</sub>')}) "
                      f"arrive au même point que "
                      f"{V('M<sub>12</sub>M<sub>26</sub>')} reporté depuis O."),
            "55%")),
        (None, exercice(
            3, "Vecteur déplacement",
            apres_contexte=cote(
                '<p class="question-f">1. Positionner votre repère spatial.'
                "<br>2. Légender les points M<sub>4</sub> et M<sub>21</sub>."
                "<br>3. Tracer les vecteurs position "
                f"{V('OM<sub>4</sub>')} et {V('OM<sub>21</sub>')}."
                "<br>4. En déduire le vecteur déplacement "
                f"{V('M<sub>4</sub>M<sub>21</sub>')} et le tracer.</p>"
                + ligne(9),
                '<div class="schema" style="max-width:74mm;margin-left:auto">' + svg(src, "t2c1-ex3-t")
                + leg("Le même support qu'à l'exercice 2.") + "</div>",
                "42%"))),

        # == 03 ==============================================================
        (("03", "Vitesse d'un système"), None),
        (None, transition("Le déplacement dit où l'on va, pas en combien de "
                          "temps. Divisons par la durée.")),
        (None, ss("A · Vitesse moyenne")),
        (None, imprime(PR, "Propriété — Vecteur vitesse moyenne",
                       P(f"Le vecteur vitesse moyenne d'un système entre deux "
                         f"positions {Mi} et {Mj} se note "
                         f"{V('v<sub>i→j</sub>')} et s'obtient par la "
                         "relation :"))),
        (None, formule(V("v<sub>i→j</sub>"), frac(B, B), 3)),
        (None, figure(svg(src, "t2c1-vm-t"),
                      "Image 12 — Différents vecteurs vitesse entre points d'une "
                      "trajectoire.", "88mm")),
        (None, encart(PR, "Propriété — Caractéristiques du vecteur vitesse "
                          f"moyenne {V('v<sub>i→j</sub>')}", 8)),
        (None, exercice(
            4, "Vecteur vitesse moyenne",
            f"1. Légender les points M<sub>i</sub>.<br>2. Tracer les vecteurs "
            f"vitesse {V('v<sub>1→3</sub>')} et {V('v<sub>3→4</sub>')}. Vous "
            f"respecterez l'échelle 1 cm pour 10 m·s<sup>−1</sup>.",
            contexte="Les images ont été prises à 0,5 s d'intervalle. "
                     "L'échelle est de 1 cm pour 2 m.",
            fig=moto(), largeur="none", lignes=5)),
        (None, qr_renvoi(qr["unites"], "S'entraîner — Diapason",
                         "unités, grandeurs et conversions")),
        (None, transition("Et si l'on rapproche les deux positions au plus "
                          "près ? On obtient la vitesse en un point.")),
        (None, ss("B · Vitesse instantanée")),
        (None, imprime(PR, "Propriété — Vecteur vitesse instantanée",
                       P(f"Le <b>vecteur vitesse (vitesse instantanée)</b> d'un "
                         f"système en un point {Mi}, noté {V('v<sub>i</sub>')}, "
                         "est approché par le vecteur vitesse moyenne entre deux "
                         "positions très proches, séparées d'une petite durée : "
                         f"{Mi} et M<sub>i+1</sub>, M<sub>i+1</sub> étant la "
                         f"position qui suit {Mi} (notée M′ dans le "
                         "programme)."))),
        (None, formule(V("v<sub>i</sub>"), frac(B, B), 3)),
        (None, encart(PR, "Propriété — Caractéristiques du vecteur vitesse "
                          f"instantanée {V('v<sub>i</sub>')}", 6)),
        (None, cote(imprime("notation-f", "Remarque — une autre méthode",
                       P("Certains livres, et certains professeurs, utilisent la "
                         "position <b>précédente</b> et la position "
                         "<b>suivante</b> : "
                         + V("v<sub>i</sub>") + " = "
                         + frac(V("M<sub>i−1</sub>M<sub>i+1</sub>"),
                                "t<sub>i+1</sub> − t<sub>i−1</sub>")
                         + ". C'est une autre approximation, valable elle aussi. "
                           "Dans ce cours et en DS, on suit celle du programme : "
                           "la position <b>en cours</b> et la position "
                           "<b>suivante</b>.")),
            figure(svg(src, "t2c1-tan-t"),
                      "Image 13 — Mouvement circulaire. Le vecteur vitesse "
                      "calculé en M(t<sub>3</sub>) est porté par le déplacement "
                      "vers M(t<sub>4</sub>). Plus la durée entre deux positions "
                      "est petite, plus il se rapproche de la tangente : la "
                      "vitesse instantanée est tangente à la trajectoire, donc "
                      "perpendiculaire au rayon du cercle."), "50%")),
        (None, qr_renvoi(qr["video-vitesse"], "Réviser en vidéo — le vecteur "
                         "vitesse", "vitesse moyenne et vitesse instantanée — "
                         "chaîne Paul Olivier")),
        (None, exercice(
            5, "Vecteur vitesse instantanée",
            "1. Légender les points M<sub>i</sub>.<br>2. Tracer tous les "
            f"vecteurs vitesse instantanée {V('v<sub>i</sub>')}.",
            contexte="Les images ont été prises à 0,5 s d'intervalle. "
                     "L'échelle est de 1 cm pour 2 m.",
            fig=moto(), largeur="none", lignes=8)),
        (None, transition("La vitesse est un vecteur : sa norme et sa direction "
                          "disent, ensemble, la nature du mouvement.")),
        (None, ss("C · Nature et relativité du mouvement")),
        (None, para("Le vecteur vitesse peut varier en norme (valeur), en "
                    "direction, ou les deux.")),
        (None, cote(imprime(PR, "Propriété",
                       P("Un <b>mouvement uniforme</b> correspond à une norme du "
                         "vecteur vitesse constante.")
                       + P("<i>Remarque :</i> si la norme augmente avec le temps, "
                           "le mouvement est <b>accéléré</b> ; si elle diminue, "
                           "il est <b>décéléré</b> (ralenti).")
                       + P("Un <b>mouvement rectiligne</b> correspond à une "
                           "direction du vecteur vitesse constante.")),
            figure(svg(src, "t2c1-mcu-t"),
                      "Image 14 — Mouvement circulaire uniforme. La norme du "
                      "vecteur vitesse ne varie pas mais sa direction oui."),
            "50%")),
        (None, encart(PR, "Les variations de la vitesse", 0, avant=(
            '<table class="memo-f">'
            + "".join(
                f'<tr><td style="width:42%">{svg(src, cle)}</td>'
                f'<td>{ligne(3)}</td></tr>'
                for cle in ("t2c1-memo-con-t", "t2c1-memo-aug-t",
                            "t2c1-memo-dim-t"))
            + "</table>"
            + '<p class="legende mini" style="text-align:left;margin-top:1mm">'
              "Image 15 — Fiche mémo pour caractériser un mouvement, d'après "
              "la fiche de Paul Olivier. Le mouvement va de gauche à droite.</p>"))),
        (None, qr_renvoi(qr["video-memo"], "La fiche mémo en vidéo",
                         "reconnaître un mouvement uniforme, accéléré ou "
                         "ralenti — chaîne Paul Olivier")),
        (None, transition("Uniforme, rectiligne… mais vu d'où ? Toute cette "
                          "description dépend du référentiel.")),
        (None, imprime("exemple-f", "Exemple — la relativité du mouvement",
                       P("Un voyageur est assis dans un train qui roule en ligne "
                         "droite à 30 m·s<sup>−1</sup>. Dans le <b>référentiel "
                         "du train</b>, il est immobile : sa vitesse est nulle. "
                         "Dans le <b>référentiel terrestre</b>, il se déplace à "
                         "30 m·s<sup>−1</sup>.")
                       + P("Il lâche une balle. Pour lui, elle tombe "
                           "<b>verticalement</b>, à ses pieds : trajectoire "
                           "rectiligne. Pour une personne restée sur le quai, la "
                           "balle avance avec le train tout en tombant : sa "
                           "trajectoire est une <b>courbe</b>.")
                       + P("Même balle, même chute : deux trajectoires et deux "
                           "vitesses différentes, selon le référentiel choisi."))),
        (None, imprime("histoire-f", "Histoire des sciences",
                       "<h4>Le bateau de Galilée (1632)</h4>"
                       + P("Galilée imaginait déjà cette expérience avec une "
                           "pierre lâchée du haut du mât d'un navire : que le "
                           "navire soit à quai ou qu'il avance, la pierre tombe "
                           "au pied du mât. Enfermé dans la cabine, aucune "
                           "expérience ne permettrait de savoir si le bateau "
                           "avance en ligne droite à vitesse constante. C'était "
                           "un argument de poids pour défendre une idée alors "
                           "très contestée : la Terre peut tourner sans que nous "
                           "le sentions."))),
        (None, essentiel(10)),
    ]


def construire(chemin_cours):
    src = charger_cours(chemin_cours)
    qr = codes_qr()
    BLOCS = blocs(src, qr)

    bornes = [0] + COUPES + [len(BLOCS)]
    T = len(bornes) - 1
    pages = []
    for n in range(T):
        i, j = bornes[n], bornes[n + 1]
        ouverte = None
        for partie, _ in BLOCS[:i]:
            if partie:
                ouverte = partie
        corps = ""
        if BLOCS[i][0] is None and ouverte:
            corps += suite(ouverte[0], ouverte[1].lower())
        for partie, html in BLOCS[i:j]:
            corps += h2(*partie) if partie else html

        dernier = (n == T - 1)
        pages.append(feuille(
            n + 1, T, corps, PIED,
            entete=cartouche(
                "Thème 2 · Mouvement et interactions — Physique-Chimie",
                "Chapitre 1 — Décrire le mouvement",
                INTRO,
                f"{IMG}/t2c1-pelican-bandeau.jpg",
            ) if n == 0 else None,
            lignes_notes=30 if dernier else 33,
            apres=cloture(qr["cours"], qr["bilan"]).replace(
                ">Kahoot</span>", ">Diapason · bilan</span>") if dernier else ""))

    commentaire = """<!-- ============================================================
     FICHE ÉLÈVE — T2-C1 · DÉCRIRE LE MOUVEMENT
     🔴 FICHIER GÉNÉRÉ — ne pas éditer à la main.
     Source : _outils/fiches/fiche_t2c1.py + gabarit_fiche.py
     Régénérer après toute modification du cours en ligne.

     🔴 Choix de Loïc (25/11/2026) : huit éléments à écrire (un par crayon de
     la page), tout le reste imprimé. Voir l'en-tête de fiche_t2c1.py.
     🔴 La moto des exercices 4 et 5 est imprimée À L'ÉCHELLE (102,5 mm).
     ============================================================ -->
""" + CSS_LOCAL

    html = document(f"Fiche élève — {TITRE}", pages, commentaire)
    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    SORTIE.write_text(html, encoding="utf-8", newline="\n")
    print(f"\n→ {SORTIE}  ({len(html) // 1024} Ko, {T} pages)")


if __name__ == "__main__":
    chemin = Path(sys.argv[1]) if len(sys.argv) > 1 else COURS_DEFAUT
    if not chemin.exists():
        raise SystemExit(f"Page de cours introuvable : {chemin}")
    construire(chemin)
