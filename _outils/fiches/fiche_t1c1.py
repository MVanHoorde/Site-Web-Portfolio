#!/usr/bin/env python3
"""
fiche_t1c1.py — contenu de la fiche élève du chapitre T1-C1.

Ce fichier ne contient QUE ce qui est propre au chapitre : les intitulés des
définitions, les énoncés d'exercices, les figures appelées, les ressources en
ligne, et la découpe en pages. Toute la mise en page vient de
`gabarit_fiche.py`. Modèle : `fiche_t1c2.py`.

USAGE
    python3 fiche_t1c1.py [chemin/vers/la/page/de/cours.html]

    Produit ../../fiches/fiche-2nde-t1c1.html (chemin relatif au dépôt).

QUAND LE COURS CHANGE — relancer ce script. Les figures SVG sont relues dans
la page du cours à chaque exécution ; les images (schémas refaits sous Canva,
photographies) sont appelées par leur chemin dans le dossier du chapitre.

CONSIGNES DE LOÏC (22/09/2026)
    · L'Image 15 (voies d'identification) et l'Image 19 (tests des ions)
      figurent sur la fiche EN ENTIER, rien à compléter.
    · Les tests d'espèces (Images 16 à 18) y figurent aussi.
    · Aucun schéma n'est à faire compléter : trop long en classe.
Les autres figures fournies sont celles que la page marque d'un crayon
(Images 6, 8, 9), plus les documents dont un exercice a besoin pour être fait
(Images 10, 11, 14).

🔴 Les intitulés des cadres sont ceux de la page, un par crayon `a-noter` :
seize cadres (15 définitions, 1 propriété) et cinq formules. Si la page change,
ce fichier change avec elle.
"""

import sys
from pathlib import Path

from gabarit_fiche import (
    charger_cours, svg, qr_svg, verifier_qr, document, feuille,
    cartouche, h2, suite, ss, encart, figure, formule, exercice,
    qr_renvoi, cloture, essentiel, frac, B,
)

RACINE = Path(__file__).resolve().parents[2]
COURS_DEFAUT = RACINE / "pages" / "2nde-pc-t1-c1-matiere-macroscopique.html"
SORTIE = RACINE / "fiches" / "fiche-2nde-t1c1.html"
IMG = "../assets/img/pc/2nde-pc-t1-c1"      # relatif à fiches/

TITRE = "Thème 1 · Chapitre 1 — La matière à l'échelle macroscopique"
PIED = "<b>M. Van Hoorde</b> · Fiche élève — Thème 1 · Chapitre 1"

# Deux phrases, pas trois : le cartouche annonce, il ne résume pas.
# PROPOSITION À VALIDER — reprend l'accroche de la page.
INTRO = ("Un verre d'eau, une pièce de monnaie, l'air que tu respires : à "
         "l'œil nu, rien ne dit de quoi ils sont faits. Ce chapitre donne les "
         "mots pour décrire la matière — corps pur ou mélange — puis les "
         "<b>nombres</b> pour la mesurer : composition, solubilité, masse "
         "volumique, et les tests qui identifient une espèce.")

# Ressources en ligne renvoyées par QR code. Relues à chaque production.
LIENS = {
    "cours": "https://mvanhoorde.github.io/Site-Web-Portfolio/pages/"
             "2nde-pc-t1-c1-matiere-macroscopique.html",
    "video-corps-pur": "https://youtu.be/k4H40Osf30o",
    "video-composition": "https://www.youtube.com/watch?v=26hHt2V8-_c",
    "video-masse-volumique": "https://youtu.be/45xmXjo8EvU",
    "video-tests": "https://youtu.be/bMHyNaUeT0g",
    "kahoot": "https://create.kahoot.it/share/"
              "bilan-la-matiere-a-l-echelle-macroscopique/"
              "51baee15-66f1-4e4a-b9da-5f53d4cadab0",
}

# Découpe en pages : index du PREMIER bloc de chaque page après la première.
# Proposée par `python paginer.py t1c1`, vérifiée à l'export.
COUPES = [5, 11, 17, 22, 27, 30, 35, 37, 43, 45, 51]


def codes_qr(muet=False):
    qr = {}
    if not muet:
        print("QR codes :")
    for nom, url in LIENS.items():
        qr[nom] = qr_svg(url)
        if not muet:
            verifier_qr(qr[nom], url)
    return qr


def img(nom, alt):
    """Une image du dossier du chapitre, pour `figure()` ou un énoncé.

    Ses proportions sont écrites EN DUR (aspect-ratio) : `paginer.py` mesure
    les blocs dans une page-sonde posée hors du dépôt, où le chemin relatif
    ne mène à rien — une image non chargée y mesurait 0 mm et la découpe en
    pages sortait fausse."""
    from PIL import Image
    w, h = Image.open(RACINE / "assets" / "img" / "pc" / "2nde-pc-t1-c1"
                      / nom).size
    return (f'<img src="{IMG}/{nom}" alt="{alt}" width="{w}" height="{h}" '
            f'style="aspect-ratio:{w}/{h}">')


def blocs(src, qr):
    """Le contenu du chapitre, dans l'ordre de la page, un élément par bloc.

    Séparé de `construire` pour que `paginer.py` puisse mesurer chaque bloc
    isolément et proposer les coupes (voir `COUPES`)."""

    D = "definition"

    # Exercices 1 et 2 : la même liste d'entités, en ligne centrée
    entites_1 = ("Cu | CU | Ag<sup>+</sup> | H | CO<sub>2</sub> | O<sup>2−</sup> "
                 "| O<sub>2</sub> | Ca | NH<sub>4</sub><sup>+</sup> | "
                 "NH<sub>3</sub>")
    entites_1b = ("N | Cu<sup>2+</sup> | CO | C | SiO<sub>3</sub> | "
                  "K<sup>+</sup>")
    entites_2 = ("Cu | CU | Ag<sup>+</sup> | H | NH<sub>4</sub><sup>+</sup> | "
                 "NH<sub>3</sub> | N | Cu<sup>2+</sup>")
    entites_2b = ("CO<sub>2</sub> | O<sup>2−</sup> | O<sub>2</sub> | Ca | CO | "
                  "C | SiO<sub>3</sub> | K<sup>+</sup>")

    # Exercice 7 : les deux documents côte à côte, DANS le cadre (R7)
    gaz = [("N<sub>2</sub>", "23,2"), ("O<sub>2</sub>", "54,3"),
           ("CO<sub>2</sub>", "2 318"), ("H<sub>2</sub>S", "5 112"),
           ("CH<sub>4</sub>", "32,5"), ("H<sub>2</sub>", "1,6")]
    doc7 = (
        '<table style="width:100%;border-collapse:collapse;"><tr>'
        '<td style="width:38%;vertical-align:top;padding-right:3mm;">'
        '<table class="t"><tr><th>Gaz</th><th>s (mg·L<sup>−1</sup>)</th></tr>'
        + "".join(f"<tr><td>{g}</td><td>{v}</td></tr>" for g, v in gaz)
        + '</table><p class="legende" style="text-align:left;">Image 10 — Solubilité de quelques gaz '
          'dans l\'eau à 10 °C</p></td>'
        '<td style="vertical-align:top;">' + svg(src, "t1c1f11")
        + '<p class="legende" style="text-align:left;">Image 11 — Solubilité du diazote dans l\'eau '
          'selon la température.</p></td></tr></table>')

    # Images 16 à 18 : les trois tests d'espèces sur une ligne
    tests = (
        '<table style="width:100%;border-collapse:collapse;"><tr>'
        + "".join(
            f'<td style="width:33%;vertical-align:top;padding:0 1mm;">'
            f'{img(n, a)}<p class="legende" style="text-align:left;">{l}</p></td>'
            for n, a, l in (
                ("t1c1-test-flamme.jpg", "Test du dihydrogène à la flamme",
                 "Image 16 — Test du dihydrogène : détonation au contact "
                 "d'une flamme."),
                ("t1c1-sulfate-cuivre.jpg", "Test de l'eau au sulfate de "
                 "cuivre anhydre", "Image 17 — Test de l'eau : le sulfate "
                 "de cuivre anhydre bleuit."),
                ("t1c1-eau-de-chaux.jpg", "Test du dioxyde de carbone à "
                 "l'eau de chaux", "Image 18 — Test du dioxyde de carbone : "
                 "l'eau de chaux se trouble."),
            ))
        + '</tr></table>')

    return [
        # -- 01 ----------------------------------------------------------
        (("01", "Entités chimiques"), None),
        (None, encart(D, "Définition — Atome", 3)),
        (None, encart(D, "Définition — Molécule", 3)),
        # l'Image 1 illustre la molécule — et occupe la place que les trois
        # définitions resserrées laissent sous le cartouche (22/09)
        (None, figure(img("t1c1-molecule-eau.jpg", "La molécule d'eau"),
                      "Image 1 — La molécule d'eau (H<sub>2</sub>O) est "
                      "composée de deux atomes d'hydrogène et d'un atome "
                      "d'oxygène.", "76mm").replace(
                          'max-width:76mm"',
                          'max-width:76mm;margin-left:auto;margin-right:auto"')),
        (None, encart(D, "Définition — Ion", 4)),
        (None, exercice(
            1, "Atome, molécule ou ion ?",
            "Classer ces entités chimiques selon qu'il s'agisse d'un atome, "
            "d'une molécule, d'un anion ou d'un cation.",
            equations=[entites_1, entites_1b], tableau=62)),
        # -- 02 ----------------------------------------------------------
        (("02", "Corps purs"), None),
        (None, encart(D, "Définition — Espèce chimique", 2)),
        (None, encart(D, "Définition — Corps pur", 2)),
        (None, encart(D, "Définition — Corps pur simple", 3)),
        (None, encart(D, "Définition — Corps pur composé", 4)),
        (None, exercice(
            2, "Corps pur simple ou composé ?",
            "Classer ces espèces chimiques selon qu'il s'agisse d'un corps "
            "pur simple ou composé.",
            equations=[entites_2, entites_2b], tableau=60)),
        (None, qr_renvoi(qr["video-corps-pur"],
                         "Réviser en vidéo — corps pur ou mélange ?",
                         "reconnaître un corps pur, simple ou composé, et un "
                         "mélange")),
        # -- 03 ----------------------------------------------------------
        (("03", "Mélanges"), None),
        (None, encart(D, "Définition — Mélange", 2)),
        (None, encart(D, "Définition — Mélange hétérogène", 4)),
        (None, encart(D, "Définition — Mélange homogène", 4)),
        (None, encart(D, "Définition — Liquides miscibles", 5)),
        (None, encart(D, "Définition — Liquides non miscibles", 5)),
        (None, figure(img("t1c1-arbre-matiere.jpg",
                          "Classification de la matière"),
                      "Image 6 — Les quatre cas et leur modélisation à "
                      "l'échelle des particules : ce schéma est à retenir.",
                      "133mm")),
        # -- 04 ----------------------------------------------------------
        (("04", "Composition d'un mélange"), None),
        (None, formule("%m", f"{frac(B, B)} × {B}", 4)),
        (None, formule("%V", f"{frac(B, B)} × {B}", 4)),
        (None, ss("A · Un exemple de composition massique : la fonte")),
        (None, exercice(
            3, "Composition en masse",
            "1 — Quelle masse de carbone y a-t-il dans une marmite en fonte "
            "de 2,5 kg composée à 4 % de carbone ?<br>2 — Une alliance en or "
            "blanc de 5 g est composée de 1000 mg d'or, le reste étant de "
            "l'argent. Donner la composition massique de cet alliage.",
            lignes=12)),
        (None, ss("B · Un exemple de composition volumique : l'air")),
        (None, encart("propriete", "Propriété — Composition de l'air", 7)),
        (None, figure(svg(src, "t1c1f8"),
                      "Image 8 — Composition volumique de l'air sec. Parmi "
                      "les « autres gaz » : Ar, CO<sub>2</sub>, Ne, He, Kr, "
                      "H<sub>2</sub>, Xe, O<sub>3</sub>, Rn.", "62mm")),
        (None, exercice(
            4, "Composition de l'air",
            "1 — L'air est-il un mélange ou un corps pur ? Justifier en "
            "précisant votre réponse.<br>2 — Classer chaque espèce chimique "
            "composant l'air selon qu'il s'agisse d'un corps pur simple ou "
            "composé.",
            donnees="La composition de l'air est donnée par l'Image 8.",
            lignes=3, tableau=36)),
        (None, exercice(
            5, "Composition en volume",
            "Quel volume d'argon trouve-t-on dans 1000 m<sup>3</sup> "
            "d'air ?",
            donnees="Donnée : %Ar = 0,93 % (Image 8)", lignes=6)),
        (None, qr_renvoi(qr["video-composition"],
                         "Réviser en vidéo — composition d'un mélange",
                         "composition massique, composition volumique, et "
                         "leurs calculs")),
        # -- 05 ----------------------------------------------------------
        (("05", "Solubilité"), None),
        (None, encart(D, "Définition — Solubilité", 9)),
        (None, formule("<i>s</i>", frac(B, B), 4)),
        (None, figure(img("t1c1-dissolution-saturation.jpg",
                          "De la dissolution à la saturation"),
                      "Image 9 — Au-delà de la solubilité, la dissolution "
                      "n'est plus que partielle : un dépôt apparaît, la "
                      "solution est saturée et le mélange redevient "
                      "hétérogène.", "133mm")),
        (None, exercice(
            6, "Saturer une bouteille",
            "Quelle masse de sel peut-on introduire dans une bouteille de "
            "1,5 L avant d'atteindre la saturation ?",
            contexte="À 0 °C, la solubilité du sel dans l'eau est "
                     "s = 347 g·L<sup>−1</sup>.", lignes=7)),
        (None, exercice(
            7, "Lire une solubilité dans un document",
            "Quelle masse de diazote (N<sub>2</sub>) peut-on introduire au "
            "maximum dans 500 mL d'eau à 35 °C ?",
            contexte="Les deux documents ci-dessous donnent la solubilité de "
                     "gaz dans l'eau.",
            fig=doc7, largeur="133mm", lignes=9)),
        # -- 06 ----------------------------------------------------------
        (("06", "Masse volumique et densité"), None),
        (None, encart(D, "Définition — Masse volumique", 6)),
        (None, formule("ρ", frac(B, B), 4)),
        (None, encart(D, "Définition — Densité", 7)),
        (None, formule("<i>d</i>", frac(B, B), 5)),
        (None, qr_renvoi(qr["video-masse-volumique"],
                         "Réviser en vidéo — masse volumique et densité",
                         "les deux formules, et les deux références : l'eau "
                         "et l'air")),
        (None, exercice(
            8, "Exploiter une mesure",
            "Calculer la masse volumique de l'huile à l'aide de l'Image 14, "
            "puis en déduire sa densité.",
            contexte="On mesure la masse de 200 mL d'huile d'olive.",
            fig=(svg(src, "t1c1f14")
                 + '<p class="legende" style="text-align:left;">Image 14 — Mesure de la masse '
                   'volumique de l\'huile.</p>'),
            largeur="70mm",
            donnees="Données : ρ<sub>eau</sub> = 1,00 g·cm<sup>−3</sup> · "
                    "1 mL = 1 cm<sup>3</sup>", lignes=8)),
        (None, exercice(
            9, "La masse d'une dalle de béton",
            "Quelle est la masse de 3 m<sup>3</sup> de béton ?",
            donnees="Donnée : ρ<sub>béton</sub> = 2,4 g·cm<sup>−3</sup>",
            lignes=8)),
        # -- 07 ----------------------------------------------------------
        (("07", "Identifier une espèce chimique"), None),
        (None, figure(img("t1c1-identification-carte.jpg",
                          "Les voies d'identification d'une espèce chimique"),
                      "Image 15 — Les trois grandes voies d'identification "
                      "d'une espèce chimique.", "133mm")),
        (None, ss("A · Les tests d'espèces chimiques")),
        (None, figure(tests, "", "133mm")),
        (None, ss("B · Les tests des ions")),
        (None, figure(img("t1c1-tests-ions.jpg",
                          "Tableau des tests de précipitation des ions"),
                      "Image 19 — Principaux tests de précipitation pour "
                      "l'identification des ions en solution.", "133mm")),
        (None, qr_renvoi(qr["video-tests"], "Réviser en vidéo — les tests "
                         "chimiques", "eau, dihydrogène, dioxygène, dioxyde de "
                         "carbone et ions")),
        (None, exercice(
            10, "Identifier un liquide inconnu",
            "Identifier ce liquide.",
            contexte="Vous avez fait subir à un liquide inconnu plusieurs "
                     "tests. Le test à la flamme a été négatif, les tests à "
                     "l'eau de chaux et au sulfate de cuivre anhydre ont été "
                     "positifs. Enfin, le test au nitrate d'argent a donné un "
                     "précipité blanc.", lignes=9)),
        (None, essentiel(11)),
    ]


def construire(chemin_cours):
    src = charger_cours(chemin_cours)
    qr = codes_qr()
    BLOCS = blocs(src, qr)

    # ---- assemblage : on coupe, et les « suite » se déduisent ------------
    bornes = [0] + COUPES + [len(BLOCS)]
    T = len(bornes) - 1
    P = []
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
        P.append(feuille(
            n + 1, T, corps, PIED,
            entete=cartouche(
                "Thème 1 · Constitution et transformations de la matière — "
                "Physique-Chimie",
                "Chapitre 1 — La matière à l'échelle macroscopique",
                INTRO,
                f"{IMG}/t1c1-cuivre-bandeau.jpg",
            ) if n == 0 else None,
            # 30 lignes de notes sur la page de clôture : voir fiche_t1c2.py
            lignes_notes=30 if dernier else 33,
            apres=cloture(qr["cours"], qr["kahoot"]) if dernier else ""))

    commentaire = """<!-- ============================================================
     FICHE ÉLÈVE — T1-C1 · LA MATIÈRE À L'ÉCHELLE MACROSCOPIQUE
     🔴 FICHIER GÉNÉRÉ — ne pas éditer à la main.
     Source : _outils/fiches/fiche_t1c1.py + gabarit_fiche.py
     Régénérer après toute modification du cours en ligne.

     🔴 La fiche ne donne pas le cours, elle le fait écrire : définitions en
     cadres vides, formules en boîtes. Seules les figures sont fournies.
     🔴 Aucune correction ici — elles vivent en ligne, derrière le code de
     déblocage de la dernière page.
     ============================================================ -->"""

    html = document(f"Fiche élève — {TITRE}", P, commentaire)
    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    SORTIE.write_text(html, encoding="utf-8", newline="\n")
    print(f"\n→ {SORTIE}  ({len(html) // 1024} Ko, {T} pages)")


if __name__ == "__main__":
    chemin = Path(sys.argv[1]) if len(sys.argv) > 1 else COURS_DEFAUT
    if not chemin.exists():
        raise SystemExit(f"Page de cours introuvable : {chemin}")
    construire(chemin)
