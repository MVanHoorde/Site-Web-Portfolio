"""
exporter-corriges-cfa.py — les corrigés du livret CFA en PDF
------------------------------------------------------------
Le HTML est la source, le PDF un export. Ce script régénère
_corriges-cfa/pdf/corrige-outil-NN.pdf depuis _corriges-cfa/corrige-outil-NN.html,
un PDF par outil, et en plus un recueil de tous les corrigés.

🔴 TOUT RESTE DANS _corriges-cfa/, exclu du dépôt par .gitignore. Ce script
est versionné, les corrigés et leurs PDF ne le sont jamais : GitHub Pages
est public, un corrigé poussé une fois est un corrigé publié.

CE QUE LE SCRIPT CONTRÔLE, ET REFUSE
  · débordement : chaque .feuille mesure exactement 1123 px de haut à
    l'écran (viewport 900 px). Plus haute, son contenu sort du papier
    — à l'impression, overflow:hidden le coupe sans rien dire.
  · pagination : une .feuille dans la source, une page dans le PDF.
  · format : 595 × 842 pt (A4), pas du Letter.
  · polices : aucune police système incorporée (signe d'un caractère
    qu'aucune de nos polices ne couvre).

USAGE (depuis la racine du dépôt)
  python _outils/exporter-corriges-cfa.py           tous les corrigés
  python _outils/exporter-corriges-cfa.py 01 03     seulement ceux-là

Sort en code 1 si un contrôle échoue ; le recueil n'est alors pas produit.
"""

import re
import sys
from pathlib import Path

import pymupdf
from playwright.sync_api import sync_playwright

RACINE = Path(__file__).resolve().parent.parent
SOURCES = RACINE / "_corriges-cfa"
SORTIE = SOURCES / "pdf"
RECUEIL = SORTIE / "corriges-livret-cfa.pdf"
HAUTEUR_FEUILLE = 1123
POLICES_ADMISES = ("EBGaramond", "IBMPlexMono", "Inter", "Fraunces", "Literata", "Newsreader", "Spectral")


def numero(chemin):
    return re.search(r"corrige-outil-(\d\d)\.html$", chemin.name).group(1)


def repli_non_admis(doc):
    """Les caractères qu'aucune de nos polices n'a rendus. Le grec seul est
    toléré : aucune police auto-hébergée ne le porte (mesuré le 01/10/2026),
    il tombe sur le Garamond système — voir l'en-tête de corrige.css."""
    hors = set()
    for p in doc:
        for bloc in p.get_text("rawdict")["blocks"]:
            for ligne in bloc.get("lines", []):
                for span in ligne["spans"]:
                    if span["font"].replace("-", "").startswith(POLICES_ADMISES):
                        continue
                    for ch in span["chars"]:
                        c = ch["c"]
                        if "Ͱ" <= c <= "Ͽ" or c.isspace():
                            continue
                        hors.add((c, span["font"]))
    return hors


def exporter(page, source):
    erreurs = []
    page.goto(source.as_uri())
    page.evaluate("document.fonts.ready")

    hauteurs = page.evaluate(
        "Array.from(document.querySelectorAll('.feuille'))"
        ".map(f => Math.round(f.getBoundingClientRect().height))"
    )
    for i, h in enumerate(hauteurs, 1):
        if h != HAUTEUR_FEUILLE:
            erreurs.append(f"feuille {i} : {h} px au lieu de {HAUTEUR_FEUILLE} (déborde de {h - HAUTEUR_FEUILLE} px)")

    pdf = SORTIE / source.name.replace(".html", ".pdf")
    page.pdf(path=str(pdf), prefer_css_page_size=True, print_background=True)

    doc = pymupdf.open(pdf)
    if doc.page_count != len(hauteurs):
        erreurs.append(f"{doc.page_count} page(s) dans le PDF pour {len(hauteurs)} feuille(s)")
    for p in doc:
        l, h = round(p.rect.width), round(p.rect.height)
        if (l, h) != (595, 842):
            erreurs.append(f"page {p.number + 1} : {l}×{h} pt, pas de l'A4")
            break
    hors = repli_non_admis(doc)
    if hors:
        erreurs.append("caractère(s) rendu(s) par une police de repli : "
                       + " · ".join(f"{c} (U+{ord(c):04X}, {f})" for c, f in sorted(hors)))
    pages = doc.page_count
    doc.close()
    return pdf, pages, erreurs


def main():
    demandes = sys.argv[1:]
    sources = sorted(SOURCES.glob("corrige-outil-??.html"))
    if demandes:
        sources = [s for s in sources if numero(s) in demandes]
    if not sources:
        sys.exit("Aucun corrigé à exporter.")
    SORTIE.mkdir(exist_ok=True)

    produits, echec = [], False
    with sync_playwright() as p:
        nav = p.chromium.launch()
        page = nav.new_page(viewport={"width": 900, "height": 1200})
        for s in sources:
            pdf, pages, erreurs = exporter(page, s)
            if erreurs:
                echec = True
                print(f"✗ outil {numero(s)}")
                for e in erreurs:
                    print(f"    {e}")
            else:
                print(f"✓ outil {numero(s)} · {pages} page(s) · A4 · {pdf.relative_to(RACINE)}")
                produits.append(pdf)
        nav.close()

    if echec:
        sys.exit(1)

    # Le recueil reprend TOUS les PDF présents, pas seulement ceux de cet appel.
    tous = sorted(SORTIE.glob("corrige-outil-??.pdf"))
    recueil = pymupdf.open()
    for f in tous:
        with pymupdf.open(f) as d:
            recueil.insert_pdf(d)
    recueil.save(RECUEIL)
    print(f"✓ recueil · {len(tous)} outil(s) · {recueil.page_count} pages · {RECUEIL.relative_to(RACINE)}")


if __name__ == "__main__":
    main()
