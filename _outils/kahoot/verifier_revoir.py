"""Contrôle les liens « à revoir » (champ `revoir` des questions) et quelques
règles de forme des quiz Diapason.

    python -I -X utf8 _outils/kahoot/verifier_revoir.py <fichiers .json>

Pour chaque question :
  · `revoir` = {"texte": "...", "lien": "pages/<page>.html[#sN|#etape-<clé>]"} ;
    la page doit exister, l'ancre #sN être une séance de la page, l'ancre
    #etape-<clé> une étape (data-cle) de la page ;
  · signale les QCM dont la bonne réponse est nettement la plus longue
    (règle « aucune bonne réponse devinable »), et les fractions écrites
    avec une barre oblique hors unités (\\dfrac attendu).
Sortie non nulle si un lien est faux.
"""
import json
import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
_pages = {}


def page(chemin):
    if chemin not in _pages:
        f = RACINE / chemin
        _pages[chemin] = f.read_text(encoding='utf-8') if f.exists() else None
    return _pages[chemin]


def lien_ok(lien):
    # #ancre-N : les parties des chapitres de physique-chimie (25/11/2026)
    m = re.match(r'^(pages/[a-z0-9._-]+\.html)(?:#(s\d+|etape-[A-Za-z0-9_-]+|ancre-\d+))?$', lien or '')
    if not m:
        return 'forme inattendue (pages/<page>.html#sN, #etape-<clé> ou #ancre-N)'
    t = page(m.group(1))
    if t is None:
        return 'page absente : ' + m.group(1)
    a = m.group(2)
    if a and a.startswith('s') and f'id="{a}"' not in t:
        return 'séance absente : #' + a
    if a and a.startswith('etape-') and f'data-cle="{a[6:]}"' not in t:
        return 'étape absente : ' + a[6:]
    if a and a.startswith('ancre-') and f'id="{a}"' not in t:
        return 'partie absente : #' + a
    return None


def main():
    fautes, avis, n, avec = 0, 0, 0, 0
    for chemin in sys.argv[1:]:
        z = json.loads(Path(chemin).read_text(encoding='utf-8'))
        for i, q in enumerate(z.get('questions', []), 1):
            n += 1
            r = q.get('revoir')
            if r:
                avec += 1
                e = lien_ok(r.get('lien')) if isinstance(r, dict) else 'revoir doit être un objet'
                if e or not (isinstance(r, dict) and r.get('texte')):
                    fautes += 1
                    print(f'✗ {Path(chemin).name} q{i} : revoir — {e or "texte manquant"}')
            if q.get('type') == 'qcm' and len(q.get('options', [])) >= 3:
                lg = [len(re.sub(r'\$[^$]*\$', 'xxxx', o)) for o in q['options']]
                bons = q.get('correct', [])
                if len(bons) == 1 and lg[bons[0]] == max(lg) and lg[bons[0]] >= 1.6 * sorted(lg)[-2] and lg[bons[0]] > 25:
                    avis += 1
                    print(f'· {Path(chemin).name} q{i} : la bonne réponse est nettement la plus longue')
            texte = json.dumps(q, ensure_ascii=False)
            if re.search(r'(?<![A-Za-z°])\d+\s*/\s*\d+(?!\s*(?:s|h|min|km|m|kg|g|L|mol|Hz))', re.sub(r'https?://\S+', '', texte)):
                avis += 1
                print(f'· {Path(chemin).name} q{i} : fraction avec barre oblique ? (\\dfrac attendu hors unités)')
    print(f'{n} questions, {avec} avec un lien « à revoir », {fautes} lien(s) faux, {avis} avis de forme')
    sys.exit(1 if fautes else 0)


if __name__ == '__main__':
    main()
