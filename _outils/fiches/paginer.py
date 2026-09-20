#!/usr/bin/env python3
"""
paginer.py — propose la découpe en pages d'une fiche, à la mesure.

POURQUOI — `mesurer_pages.py` dit *après coup* où le contenu s'arrête sur
chaque page du PDF. Il ne dit pas **où couper**. Tant qu'on déplaçait les
appels `feuille()` à la main, chaque essai coûtait une génération, un export
et une lecture : sur T1-C2, la première découpe laissait 607 mm de creux et
une page qui débordait. Cet outil mesure chaque bloc **isolément**, puis
calcule les coupes qui équilibrent les pages. Le creux est tombé à 122 mm.

CE QU'IL SUPPOSE — que le fichier de chapitre expose deux fonctions :

    codes_qr(muet=False) -> dict des QR
    blocs(src, qr)       -> [(partie | None, html), ...]  dans l'ordre

et une constante `COUPES`. `fiche_t1c2.py` est le modèle. Les fiches écrites
avant (T3-C1) construisent leurs pages à la main : elles marchent toujours,
elles ne sont simplement pas paginables par cet outil.

USAGE
    python3 paginer.py t1c2            # propose 10, 11, 12, 13, 14 pages
    python3 paginer.py t1c2 12         # impose 12 pages
    python3 paginer.py t1c2 12 260     # ... avec un autre budget par page

Puis recopier la ligne `COUPES = [...]` dans le fichier de chapitre.

🔴 CET OUTIL PROPOSE, IL NE TRANCHE PAS. Le budget de 267 mm est une valeur
empirique, et la somme des blocs sous-estime la page de 0 à 21 mm selon le
nombre d'en-têtes qu'elle porte (mesuré sur les douze pages de T1-C2). Ce
qui fait foi reste :

    node exporter-fiches.mjs <code>
    python3 _outils/fiches/mesurer_pages.py assets/pdf/pc/fiches/fiche-2nde-<code>.pdf

Marche à suivre : proposer ici, générer, exporter, mesurer — et si une page
déborde, retirer une ou deux lignes au cadre le plus généreux de cette page
plutôt que de tout repaginer. C'est exactement ce qu'a demandé T1-C2 : une
seule page sur douze débordait, l'exercice 10 est passé de 10 à 8 lignes.
"""

import importlib, subprocess, sys, tempfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))

RACINE = ICI.parents[1]
BUDGET = 267        # mm : valeur empirique, voir l'en-tête


def sonde(code):
    """Écrit une page-sonde : tous les blocs dans une colonne, mesurables."""
    from gabarit_fiche import CSS, charger_cours, h2, suite, cartouche, cloture

    mod = importlib.import_module(f"fiche_{code}")
    src = charger_cours(mod.COURS_DEFAUT)
    qr = mod.codes_qr(muet=True)
    blocs = mod.blocs(src, qr)

    morceaux = [
        f'<div class="sonde" data-i="{i}" data-titre="'
        f'{(p[0] + " " + p[1]) if p else ""}">{h2(*p) if p else html}</div>'
        for i, (p, html) in enumerate(blocs)
    ]
    # les elements de service, mesures eux aussi
    service = {
        "cartouche": cartouche("T", "C", "I", "x.jpg"),
        "suite": suite("01", "titre de continuation"),
        "cloture": cloture(qr[next(iter(qr))]),
    }
    morceaux += [f'<div class="sonde" data-i="s:{n}">{h}</div>'
                 for n, h in service.items()]

    # fonts.css en URL absolue : la sonde peut vivre hors du depot
    fonts = (RACINE / "assets" / "css" / "fonts.css").as_uri()
    html = (
        '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">\n'
        f'<link rel="stylesheet" href="{fonts}">\n<style>{CSS}\n'
        '  .feuille { height:auto !important; min-height:0 !important;\n'
        '             overflow:visible !important; }\n'
        '  .corps { display:block !important; }\n'
        # flow-root : la div contient les marges de ses enfants, donc sa
        # hauteur est bien celle qu'occupera le bloc dans la colonne.
        '  .sonde { display:flow-root; }\n'
        '</style></head><body>\n<div class="feuille"><div class="corps">'
        f'<div class="principal">\n{"".join(morceaux)}\n'
        '</div></div></div>\n</body></html>\n')

    out = Path(tempfile.gettempdir()) / f"sonde-fiche-{code}.html"
    out.write_text(html, encoding="utf-8", newline="\n")
    return out, len(blocs)


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    code = sys.argv[1]
    pages = sys.argv[2] if len(sys.argv) > 2 else "0"
    budget = sys.argv[3] if len(sys.argv) > 3 else str(BUDGET)
    chemin, n = sonde(code)
    print(f"sonde : {n} blocs → {chemin}\n")
    subprocess.run(["node", str(ICI / "paginer.mjs"), chemin.as_uri(),
                    budget, pages], check=True)
    chemin.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
