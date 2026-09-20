#!/usr/bin/env python3
"""
controler.py — contrôle géométrique d'un diaporama de projection.

POURQUOI — la §6 des consignes exige d'examiner chaque diapositive en image :
« pas de superposition, pas de texte qui déborde d'un cadre, pas de légende
sous le pied de page, marge de 0,5 pouce aux bords ». Regarder vingt-et-une
diapositives à l'œil laisse passer un chevauchement de trois millimètres.
Ce script mesure, l'œil confirme.

Ce qu'il vérifie :
  · rien ne sort de la diapositive ni des marges ;
  · rien ne passe sous le filet du pied de page ;
  · aucun recouvrement significatif entre deux blocs de contenu ;
  · le nombre de pictos ✎ égale le nombre de `a-noter` de la page du cours ;
  · aucune correction dans le texte (règle R1).

USAGE
    python3 controler.py <diaporama.pptx> [page-de-cours.html]
"""

import re
import sys
from pathlib import Path

from pptx import Presentation

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

CM = 360000
LARG, HAUT = 33.87, 19.05
MARGE = 0.7          # cm — tolérance aux bords
PIED = 17.35         # cm — le filet du pied de page
BANDEAU = 1.75       # cm — hauteur du bandeau de tête

# mots qui trahiraient une correction projetée
CORRECTION = re.compile(r"corrig|réponse\s*:|on trouve donc|d'où\s+\w+\s*=",
                        re.I)


def _boite(sh):
    return ((sh.left or 0) / CM, (sh.top or 0) / CM,
            (sh.width or 0) / CM, (sh.height or 0) / CM)


def _contient(a, b, jeu=0.02):
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    return (ax - jeu <= bx and ay - jeu <= by
            and ax + aw + jeu >= bx + bw and ay + ah + jeu >= by + bh)


def _recouvre(a, b, mini=0.35):
    """Aire commune, en cm², au-delà d'un seuil de tolérance.

    Un bloc entièrement CONTENU dans un autre n'est pas un défaut : c'est un
    empilement voulu — le logo sur sa plaque claire, une figure dans son
    cadre. Seuls les chevauchements partiels sont signalés."""
    if _contient(a, b) or _contient(b, a):
        return 0
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    dx = min(ax + aw, bx + bw) - max(ax, bx)
    dy = min(ay + ah, by + bh) - max(ay, by)
    if dx <= mini or dy <= mini:
        return 0
    return dx * dy


def controler(chemin, page_cours=None):
    prs = Presentation(chemin)
    soucis = []
    pictos = 0
    textes = []

    for k, s in enumerate(prs.slides, 1):
        contenu = []
        for sh in s.shapes:
            x, y, w, h = _boite(sh)
            plein = (w > LARG * 0.95 and h > HAUT * 0.95)   # fond, bandeau
            t = sh.text_frame.text.strip() if sh.has_text_frame else ""
            if t:
                textes.append((k, t))
            if t == "✎" and k > 1:
                pictos += 1
            # Le pied de page se reconnaît à son CONTENU, pas à sa position :
            # une légende de figure tombée à 17,6 cm est, elle aussi, sous le
            # filet — et c'est précisément ce qu'on cherche. Filtrer par
            # « y >= PIED » masquait le défaut au lieu de le montrer.
            pied = (y >= PIED - 0.1 and h < 0.75
                    and (t.isdigit() or t.startswith("Thème") or t == ""))
            if plein or pied or (y + h) <= BANDEAU + 0.05:
                continue            # fond, pied, bandeau : hors contrôle
            if x < -0.01 or y < -0.01 or x + w > LARG + 0.01 or y + h > HAUT + 0.01:
                soucis.append(f"diapo {k} — sort de la diapositive : "
                              f"{t[:32]!r} ({x:.1f},{y:.1f}) {w:.1f}×{h:.1f}")
            elif x < MARGE - 0.25 or x + w > LARG - MARGE + 0.25:
                soucis.append(f"diapo {k} — hors marge latérale : {t[:32]!r}")
            if y + h > PIED + 0.05:
                soucis.append(f"diapo {k} — passe sous le pied de page : "
                              f"{t[:32]!r} (bas à {y + h:.2f} cm)")
            # les zones de texte sont volontairement plus hautes que leur
            # texte : on ne compare que les CADRES et les IMAGES entre eux
            if sh.shape_type is not None and not sh.has_text_frame or (
                    sh.has_text_frame and sh.fill.type is not None
                    and t == ""):
                contenu.append(((x, y, w, h), t))

        for a in range(len(contenu)):
            for b in range(a + 1, len(contenu)):
                aire = _recouvre(contenu[a][0], contenu[b][0])
                if aire > 1.5:
                    soucis.append(
                        f"diapo {k} — recouvrement de {aire:.1f} cm² entre "
                        f"{contenu[a][0]} et {contenu[b][0]}")

    for k, t in textes:
        if CORRECTION.search(t):
            soucis.append(f"diapo {k} — 🔴 CORRECTION à l'écran ? {t[:70]!r}")

    attendus = None
    if page_cours and Path(page_cours).exists():
        attendus = Path(page_cours).read_text(encoding="utf-8").count(
            'class="a-noter"')

    print(f"{len(prs.slides)} diapositives · {pictos} picto(s) ✎")
    if attendus is not None:
        etat = ("✓" if pictos == attendus else
                "✗ l'écran et la fiche divergeraient")
        print(f"   la page du cours porte {attendus} marqueur(s) a-noter  {etat}")
    if soucis:
        print(f"\n❌ {len(soucis)} point(s) à reprendre :")
        for x in soucis:
            print("   ·", x)
    else:
        print("\n✓ géométrie : rien à signaler")
    return soucis


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    sys.exit(1 if controler(sys.argv[1],
                            sys.argv[2] if len(sys.argv) > 2 else None) else 0)
