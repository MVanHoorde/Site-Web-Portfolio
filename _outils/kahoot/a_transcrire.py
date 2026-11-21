"""Liste les questions que l'extraction n'a pas pu lire en entier (réponse
vide : formule seule ou image ; question sans réponse ; miniature en image)
et produit une capture de chacune, pour une transcription à l'œil.
Les questions déjà dans trous/ (formules de l'énoncé) sont exclues.

    python -I -X utf8 _outils/kahoot/a_transcrire.py
"""
import json
import re
from pathlib import Path

import pymupdf

RACINE = Path(__file__).resolve().parents[2]
KAHOOT = RACINE / '_quiz' / 'kahoot'
PDF = RACINE / '_a-deposer' / 'kahoot' / 'pdf'
SORTIE = KAHOOT / 'a-transcrire'
ENTETE = re.compile(r'^(\d+) - (.+)$')


def main():
    SORTIE.mkdir(parents=True, exist_ok=True)
    deja = {(x['slug'], x['num']) for x in json.loads((KAHOOT / 'trous' / 'trous.json').read_text(encoding='utf-8'))}
    liste = []
    for brut in sorted((KAHOOT / 'brut').glob('*.brut.json')):
        b = json.loads(brut.read_text(encoding='utf-8'))
        slug = brut.name[:-len('.brut.json')]
        manque = [q['num'] for q in b['questions']
                  if (slug, q['num']) not in deja and
                  (not q['enonce'] or not q['reponses'] or any(not r['texte'].strip() for r in q['reponses'])
                   or (q['type'] in ('Quiz', 'Vrai ou faux') and not any(r.get('juste') for r in q['reponses'])))]
        if not manque:
            continue
        doc = pymupdf.open(PDF / b['fichier'])
        for n, page in enumerate(doc):
            ent = []
            for bl in page.get_text('dict')['blocks']:
                for l in bl.get('lines', []):
                    sp = [s for s in l['spans'] if s['text'].strip()]
                    t = ''.join(s['text'] for s in sp).strip()
                    if sp and round(sp[0]['size'], 1) == 10.5 and sp[0]['bbox'][0] < 70 and ENTETE.match(t):
                        ent.append((sp[0]['bbox'][1], int(ENTETE.match(t).group(1))))
            ent.sort()
            for i, (y, num) in enumerate(ent):
                if num not in manque or any(x['slug'] == slug and x['num'] == num for x in liste):
                    continue
                bas = ent[i + 1][0] if i + 1 < len(ent) else page.rect.height - 28
                f = SORTIE / f'{slug}--q{num:02d}.png'
                # une miniature est petite : on la grossit davantage
                petite = bas - y < 90
                page.get_pixmap(dpi=420 if petite else 110,
                                clip=pymupdf.Rect(40, y - 2, 180 if petite else page.rect.width - 20, bas)).save(str(f))
                liste.append({'slug': slug, 'num': num, 'image': f.name})
    (SORTIE / 'liste.json').write_text(json.dumps(liste, ensure_ascii=False, indent=1), encoding='utf-8')
    print(len(liste), 'questions à transcrire à l\'œil')


if __name__ == '__main__':
    main()
