#!/usr/bin/env python3
"""
mesurer_pages.py — dit, page par page, où s'arrête le contenu.

Sert à équilibrer une fiche sans juger à l'œil : on cherche le dernier pixel
non blanc au-dessus du pied de page, et on le compare à la hauteur utile.
Un « creux » de plus de ~25 mm signale une page à remplir ou à rééquilibrer.

    python3 mesurer_pages.py fiche.pdf
"""

import subprocess
import sys
from pathlib import Path

# Console Windows en cp1252 : les filets ─ et les ✓ du rapport y lèveraient
# UnicodeEncodeError. Même correctif que dans gabarit_fiche.py.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import numpy as np
from PIL import Image

# Repères de la feuille, en millimètres (cf. gabarit_fiche.CSS)
HAUT_UTILE = 10.0     # padding haut
BAS_UTILE = 281.0     # au-dessus du pied de page (297 − 16)
MARGE_G = 13.0
LARGEUR_PRINCIPALE = 133.0   # colonne de contenu, hors marge de notes


def pages_en_images(pdf, dpi=100):
    """Rend chaque page du PDF en niveaux de gris.

    PyMuPDF est le chemin préféré : aucun binaire externe, aucun fichier
    temporaire, donc l'outil tourne sur le poste de production comme ailleurs.
    pdftoppm (poppler) reste le repli — il n'est pas installé sous Windows,
    c'est ce qui a motivé ce double chemin."""
    try:
        import fitz
    except ImportError:
        fitz = None

    if fitz is not None:
        with fitz.open(pdf) as doc:
            for page in doc:
                pix = page.get_pixmap(dpi=dpi, colorspace=fitz.csGRAY)
                yield Image.frombytes("L", (pix.width, pix.height), pix.samples)
        return

    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        dossier = Path(tmp)
        subprocess.run(["pdftoppm", "-png", "-r", str(dpi), str(pdf),
                        str(dossier / "p")], check=True)
        for f in sorted(dossier.glob("p-*.png")):
            yield Image.open(f).convert("L")


def mesurer(pdf):
    px_par_mm = None
    print(f"{'page':>5}  {'contenu jusqu’à':>16}  {'creux':>8}   ")
    print("  " + "─" * 44)
    creux_total = 0
    for i, im in enumerate(pages_en_images(pdf), 1):
        if px_par_mm is None:
            px_par_mm = im.size[1] / 297.0
        a = np.array(im)
        # On n'observe que la colonne de contenu : la marge de notes est
        # lignée jusqu'en bas et masquerait tout creux réel.
        x0 = int(MARGE_G * px_par_mm)
        x1 = int((MARGE_G + LARGEUR_PRINCIPALE) * px_par_mm)
        y0 = int(HAUT_UTILE * px_par_mm)
        y1 = int(BAS_UTILE * px_par_mm)
        zone = a[y0:y1, x0:x1]
        lignes_encrees = np.where((zone < 235).sum(axis=1) > 2)[0]
        if len(lignes_encrees) == 0:
            fin_mm = HAUT_UTILE
        else:
            fin_mm = HAUT_UTILE + lignes_encrees[-1] / px_par_mm
        creux = BAS_UTILE - fin_mm

        # Bande interdite : entre la limite du contenu et le pied de page.
        # De l'encre ici signifie que le contenu déborde et se fait couper —
        # une mesure à 281 mm pile ne le dirait pas.
        yd0, yd1 = int(BAS_UTILE * px_par_mm), int(286.5 * px_par_mm)
        deborde = (a[yd0:yd1, x0:x1] < 235).sum() > 40

        creux_total += max(0.0, creux)
        if deborde:
            alerte = "  ← DÉBORDE"
        elif creux > 25:
            alerte = "  ← à combler"
        else:
            alerte = ""
        print(f"{i:>5}  {fin_mm:>13.0f} mm  {creux:>5.0f} mm{alerte}")
    print("  " + "─" * 44)
    print(f"  creux cumulé : {creux_total:.0f} mm "
          f"(≈ {creux_total / (BAS_UTILE - HAUT_UTILE):.1f} page)")


if __name__ == "__main__":
    mesurer(Path(sys.argv[1]))
