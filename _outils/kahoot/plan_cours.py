"""Plan des pages de cours sur le moteur des séquences : séances et étapes
(clé data-cle, titre), pour les liens « à revoir » des quiz Diapason.

    python -I -X utf8 _outils/kahoot/plan_cours.py > _quiz/kahoot/plan-cours.json

Lien vers une séance : pages/<page>#sN · vers une étape : pages/<page>#etape-<clé>
"""
import html
import json
import re
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]


def propre(t):
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', t)).split())


plan = []
for f in sorted((RACINE / 'pages').glob('*.html')):
    if not re.match(r'(2nde-snt|1re-es|term-es)', f.name):
        continue
    t = f.read_text(encoding='utf-8')
    seances = list(re.finditer(r'<section class="seance[^"]*" id="(s\d+)"', t))
    if not seances:
        continue
    page = {'page': 'pages/' + f.name, 'titre': propre(re.search(r'<title>(.*?)</title>', t, re.S).group(1)), 'seances': []}
    for k, m in enumerate(seances):
        fin = seances[k + 1].start() if k + 1 < len(seances) else len(t)
        bloc = t[m.start():fin]
        h2 = re.search(r'<h2.*?</h2>', bloc, re.S)
        etapes = []
        for c in re.finditer(r'data-cle="([^"]+)"', bloc):
            titre = re.search(r'class="step-title"[^>]*>(.*?)</h3>', bloc[c.end():c.end() + 6000], re.S)
            if c.group(1) not in [e['cle'] for e in etapes]:
                etapes.append({'cle': c.group(1), 'titre': propre(titre.group(1)) if titre else ''})
        page['seances'].append({'id': m.group(1), 'titre': propre(h2.group(0)) if h2 else '', 'etapes': etapes})
    plan.append(page)
print(json.dumps(plan, ensure_ascii=False, indent=1))
