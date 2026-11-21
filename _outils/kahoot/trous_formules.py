"""Repère les formules perdues à l'extraction d'un export Kahoot (LaTeX
imprimé en glyphes sans texte) : un énoncé ou une réponse dont la ligne a
un trou horizontal, ou commence trop à droite. Pour chaque cas, une image
de la question est produite pour relecture.

    python -I -X utf8 _outils/kahoot/trous_formules.py <dossier_pdf> <dossier_images>
"""
import json
import sys
from pathlib import Path

import pymupdf

sys.path.insert(0, str(Path(__file__).parent))
from extraire_kahoot import ENTETE, slugifier  # noqa: E402
import re  # noqa: E402


def main():
    src, sortie = Path(sys.argv[1]), Path(sys.argv[2])
    sortie.mkdir(parents=True, exist_ok=True)
    liste = []
    for pdf in sorted(src.glob('*.pdf')):
        doc = pymupdf.open(pdf)
        titre = re.sub(r'\s*-\s*Détails\s*-\s*Kahoot!?\.pdf$', '', pdf.name)
        slug = slugifier(titre)
        for n, page in enumerate(doc):
            num = None
            entetes = []
            for b in page.get_text('dict')['blocks']:
                for l in b.get('lines', []):
                    sp = [s for s in l['spans'] if s['text'].strip()]
                    if not sp:
                        continue
                    t = ''.join(s['text'] for s in sp).strip()
                    if round(sp[0]['size'], 1) == 10.5 and sp[0]['bbox'][0] < 70 and ENTETE.match(t):
                        entetes.append((sp[0]['bbox'][1], int(ENTETE.match(t).group(1))))
            entetes.sort()
            for b in page.get_text('dict')['blocks']:
                for l in b.get('lines', []):
                    sp = [s for s in l['spans'] if s['text'].strip()]
                    if not sp or round(sp[0]['size'], 1) not in (10.5, 9.0):
                        continue
                    x0 = sp[0]['bbox'][0]
                    trou = False
                    if round(sp[0]['size'], 1) == 10.5 and any(s['flags'] & 16 or 'Bold' in s['font'] for s in sp) and x0 > 145:
                        trou = True     # l'énoncé commence par une formule
                    for a, c in zip(sp, sp[1:]):
                        if c['bbox'][0] - a['bbox'][2] > 6:
                            trou = True
                    if round(sp[0]['size'], 1) == 9.0 and 80 < x0 < 120 and len(''.join(s['text'] for s in sp).strip()) <= 1:
                        trou = True     # réponse réduite à un signe
                    if not trou:
                        continue
                    y = l['bbox'][1]
                    avant = [e for e in entetes if e[0] < y]
                    num = avant[-1][1] if avant else None
                    cle = (slug, num, n)
                    if any((x['slug'], x['num'], x['page']) == cle for x in liste):
                        continue
                    haut = avant[-1][0] if avant else max(0, y - 60)
                    apres = [e for e in entetes if e[0] > y]
                    bas = apres[0][0] if apres else page.rect.height - 30
                    f = sortie / f'{slug}--q{num or 0:02d}-p{n}.png'
                    page.get_pixmap(dpi=110, clip=pymupdf.Rect(40, haut - 2, page.rect.width - 20, bas)).save(str(f))
                    liste.append({'slug': slug, 'num': num, 'page': n, 'image': f.name})
    (sortie / 'trous.json').write_text(json.dumps(liste, ensure_ascii=False, indent=1), encoding='utf-8')
    print(len(liste), 'questions à relire')
    for x in liste:
        print(x['slug'], x['num'])


if __name__ == '__main__':
    main()
