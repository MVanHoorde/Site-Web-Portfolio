"""Exporte les fiches papier de l'EMC (fiches/emc/*.html) en PDF A4
dans assets/pdf/emc/. Le HTML est la source, le PDF un export.
Lancer depuis la racine du dépôt :  python _outils/fiches/emc_fiches_pdf.py [nom …]
(sans nom : toutes ; avec des noms, ex. memo-4-restitution : seulement celles-là)
(Playwright Python et son Chromium, déjà installés sur le PC de Loïc.)"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

RACINE = Path(__file__).resolve().parents[2]
SORTIE = RACINE / 'assets' / 'pdf' / 'emc'
SORTIE.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    nav = p.chromium.launch()
    page = nav.new_page()
    for src in sorted((RACINE / 'fiches' / 'emc').glob('*.html')):
        if sys.argv[1:] and src.stem not in sys.argv[1:]: continue
        page.goto(src.as_uri())
        page.evaluate('document.fonts.ready')
        cible = SORTIE / (src.stem + '.pdf')
        page.pdf(path=str(cible), format='A4', print_background=True, prefer_css_page_size=True)
        print(f'{cible.relative_to(RACINE)} — {cible.stat().st_size // 1024} Ko')
    nav.close()
