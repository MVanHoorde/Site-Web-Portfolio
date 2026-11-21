"""Extrait les questions d'un export PDF « Détails - Kahoot! » (page imprimée
depuis create.kahoot.it) vers une structure brute, bonnes réponses comprises.

    python -I _outils/kahoot/extraire_kahoot.py <dossier_pdf> <dossier_sortie>

Kahoot imprime chaque question ainsi :
  « N - Type »                    (10,5 pt, x ≈ 52)
  « Type »                        (8,2 pt, x ≈ 135)
  l'énoncé                        (10,5 pt gras, x ≈ 135, une ou plusieurs lignes)
  les réponses                    (9 pt, x ≈ 86, une ou plusieurs lignes chacune)
  à droite de chaque réponse, une coche verte (juste) ou une croix rouge
  (fausse), tracées en vecteurs : on lit leur couleur de remplissage.
Une question peut être coupée par un saut de page : on lit le document
comme un seul flux, page après page, de haut en bas.

Sortie : <slug>.brut.json par PDF ({titre, questions: [{num, type, enonce,
reponses: [{texte, juste}], image}]}) et les images dans <sortie>/img/<slug>/.
Les images restent sur ce PC (hors Git) : celles de la banque de Kahoot ne
sont pas réutilisables librement.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

import pymupdf

VERT = (0.4, 0.749, 0.2235)
ROUGE = (1.0, 0.2, 0.3333)


def proche(c, ref):
    return c is not None and all(abs(a - b) < 0.05 for a, b in zip(c, ref))


def slugifier(t):
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')[:60]


def flux(doc):
    """Tous les éléments du document, dans l'ordre de lecture : textes,
    marques ✓/✗, images. y est rendu continu d'une page à l'autre."""
    items = []
    for n, page in enumerate(doc):
        dy = n * 10000
        h = page.rect.height
        for b in page.get_text('dict')['blocks']:
            for l in b.get('lines', []):
                spans = [s for s in l['spans'] if s['text']]
                if not spans:
                    continue
                x0, y0, _, y1 = spans[0]['bbox']
                if y0 < 28 or y0 > h - 30:      # en-tête et pied d'impression
                    continue
                # « Black » est le gras de mise en valeur de Kahoot : **…** dans Diapason
                morceaux = []
                for s in spans:
                    if 'Black' in s['font'] and s['text'].strip():
                        avant = s['text'][:len(s['text']) - len(s['text'].lstrip())]
                        apres = s['text'][len(s['text'].rstrip()):]
                        morceaux.append(avant + '**' + s['text'].strip() + '**' + apres)
                    else:
                        morceaux.append(s['text'])
                t = ''.join(morceaux).strip()
                if t:
                    items.append({'k': 'txt', 'x': x0, 'y': y0 + dy, 'y1': y1 + dy, 'size': round(spans[0]['size'], 1),
                                  'gras': any('Bold' in s['font'] or 'Black' in s['font'] for s in spans), 't': t})
        for d in page.get_drawings():
            r = d['rect']
            if r.x0 > 400 and r.width < 14 and r.height < 14:
                if proche(d.get('fill'), VERT):
                    items.append({'k': 'ok', 'x': r.x0, 'y': r.y0 + dy})
                elif proche(d.get('fill'), ROUGE):
                    items.append({'k': 'ko', 'x': r.x0, 'y': r.y0 + dy})
        for info in page.get_image_info(xrefs=True):
            x0, y0, x1, y1 = info['bbox']
            if info['xref'] and y0 > 28 and (x1 - x0) > 30:
                items.append({'k': 'img', 'x': x0, 'y': y0 + dy, 'xref': info['xref'], 'w': x1 - x0})
    items.sort(key=lambda i: (i['y'], i['x']))
    return items


ENTETE = re.compile(r'^(\d+) - (.+)$')

# Les couleurs des tuiles de réponse de Kahoot (rouge, bleu, jaune, vert, turquoise, violet)
TUILES = [(0.886, 0.106, 0.235), (0.0745, 0.408, 0.808), (0.847, 0.62, 0.0),
          (0.149, 0.537, 0.047), (0.039, 0.639, 0.639), (0.525, 0.298, 0.749)]


def miniatures(doc, vides):
    """Vue réduite : chaque question est une miniature de diapositive. Le
    texte y est (en 2 à 3 pt, chaque ligne écrite deux ou trois fois) ; une
    réponse est une tuile colorée ; la bonne porte une coche blanche dans
    son tiers droit (l'icône de forme est à gauche)."""
    for page in doc:
        lignes = []
        for b in page.get_text('dict')['blocks']:
            for l in b.get('lines', []):
                sp = [s for s in l['spans'] if s['text'].strip()]
                if sp:
                    lignes.append({'x': sp[0]['bbox'][0], 'y': sp[0]['bbox'][1], 'y1': sp[0]['bbox'][3],
                                   'size': round(sp[0]['size'], 1), 'font': sp[0]['font'],
                                   't': ''.join(s['text'] for s in sp).strip()})
        entetes = sorted([l for l in lignes if l['size'] == 10.5 and l['x'] < 70 and ENTETE.match(l['t'])], key=lambda l: l['y'])
        dessins = page.get_drawings()
        for i, e in enumerate(entetes):
            num = int(ENTETE.match(e['t']).group(1))
            if num not in vides:
                continue
            q = vides[num]
            haut, bas = e['y1'], entetes[i + 1]['y'] if i + 1 < len(entetes) else page.rect.height
            # le texte, sans les doublons (la même ligne réécrite en Type3 ou décalée d'un demi-point)
            petits, vus = [], []
            for l in sorted([l for l in lignes if haut < l['y'] < bas and l['size'] < 5], key=lambda l: (l['y'], l['x'])):
                if 'Type3' in l['font']:
                    continue
                if any(v['t'] == l['t'] and abs(v['x'] - l['x']) < 2 and abs(v['y'] - l['y']) < 1.5 for v in vus):
                    continue
                vus.append(l); petits.append(l)
            tuiles = []
            for d in dessins:
                r, f = d['rect'], d.get('fill')
                if haut < r.y0 < bas and r.width > 15 and any(proche(f, c) for c in TUILES):
                    if not any(abs(t.x0 - r.x0) < 1 and abs(t.y0 - r.y0) < 1 for t, _ in tuiles):
                        tuiles.append((r, False))
            tuiles.sort(key=lambda t: (round(t[0].y0), t[0].x0))
            for d in dessins:
                r, f = d['rect'], d.get('fill')
                if proche(f, (1.0, 1.0, 1.0)) and r.width < 4:
                    for k, (t, ok) in enumerate(tuiles):
                        if t.contains(r.tl) and r.x0 > t.x0 + t.width * 0.7:
                            tuiles[k] = (t, True)
            dedans = lambda l, t: t.x0 - 0.5 <= l['x'] <= t.x1 and t.y0 - 1 <= l['y'] <= t.y1
            q['enonce'] = ' '.join(l['t'] for l in petits if l['size'] >= 2.5 and not any(dedans(l, t) for t, _ in tuiles)).strip()
            for t, ok in tuiles:
                txt = ' '.join(l['t'] for l in petits if dedans(l, t)).strip()
                if txt:
                    q['reponses'].append({'texte': txt, 'juste': ok})
            for info in page.get_image_info(xrefs=True):
                x0, y0, x1, y1 = info['bbox']
                if info['xref'] and haut < y0 < bas and (x1 - x0) > 8 and not q['image']:
                    q['image'] = info['xref']
            q['miniature'] = True


def extraire(chemin, sortie):
    doc = pymupdf.open(chemin)
    titre = re.sub(r'\s*-\s*Détails\s*-\s*Kahoot!?\.pdf$', '', chemin.name)
    items = flux(doc)
    questions, q = [], None
    for it in items:
        if it['k'] == 'txt' and it['size'] == 10.5 and not it['gras'] and it['x'] < 70 and ENTETE.match(it['t']):
            m = ENTETE.match(it['t'])
            q = {'num': int(m.group(1)), 'type': m.group(2), 'enonce': '', 'reponses': [], 'image': None}
            questions.append(q)
            continue
        if q is None:
            continue
        if it['k'] == 'txt':
            if it['size'] == 10.5 and it['gras'] and it['x'] > 120:
                q['enonce'] = (q['enonce'] + ' ' + it['t']).strip()
            elif it['size'] == 10.5 and 70 < it['x'] < 120:
                # puzzle : les éléments sont imprimés dans l'ordre juste
                q['reponses'].append({'texte': it['t'], 'y': it['y'], 'y1': it['y1'], 'juste': True})
            elif it['size'] == 9.0 and 80 < it['x'] < 120:
                r = q['reponses'][-1] if q['reponses'] else None
                # suite d'une réponse sur deux lignes : collée à la précédente
                if r and it['y'] - r['y1'] < 4 and r.get('juste') is None:
                    r['texte'] += ' ' + it['t']; r['y1'] = it['y1']
                else:
                    q['reponses'].append({'texte': it['t'], 'y': it['y'], 'y1': it['y1'], 'juste': None})
            elif it['size'] == 9.0:
                q.setdefault('autres', []).append(it['t'])
        elif it['k'] in ('ok', 'ko'):
            # appariées APRÈS lecture de tous les textes : une coche imprimée un
            # demi-point plus haut que sa réponse arrive avant elle dans le flux
            q.setdefault('_marques', []).append(it)
        elif it['k'] == 'img' and q['image'] is None and it['x'] < 130:
            q['image'] = it['xref']

    for q in questions:
        for it in q.pop('_marques', []):
            # la marque s'aligne sur la réponse la plus proche en hauteur
            cand = sorted([r for r in q['reponses'] if abs(r['y'] - it['y']) < 12 and r['juste'] is None],
                          key=lambda r: abs(r['y'] - it['y']))
            if cand:
                cand[0]['juste'] = it['k'] == 'ok'
            else:
                # réponse sans texte lisible (formule seule, image) : gardée vide,
                # pour la transcription à l'œil
                q['reponses'].append({'texte': '', 'y': it['y'] - 3, 'y1': it['y'] + 8, 'juste': it['k'] == 'ok'})
        q['reponses'].sort(key=lambda r: r['y'])

    # vue réduite : les questions restées vides se lisent dans leur miniature
    vides = {q['num']: q for q in questions if not q['enonce'] and not q['reponses']}
    if vides:
        miniatures(doc, vides)

    slug = slugifier(titre)
    dimg = sortie / 'img' / slug
    for q in questions:
        for r in q['reponses']:
            r.pop('y', None); r.pop('y1', None)
        if q['image']:
            try:
                pix = pymupdf.Pixmap(doc, q['image'])
                if pix.n - pix.alpha >= 4:
                    pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
                dimg.mkdir(parents=True, exist_ok=True)
                f = dimg / f"q{q['num']:02d}.png"
                pix.save(str(f))
                q['image'] = str(f.relative_to(sortie)).replace('\\', '/')
            except Exception as e:  # une image illisible n'arrête pas l'extraction
                q['image'] = None
                q['image_erreur'] = str(e)
    (sortie / f'{slug}.brut.json').write_text(json.dumps({'titre': titre, 'fichier': chemin.name, 'questions': questions},
                                                         ensure_ascii=False, indent=1), encoding='utf-8')
    return titre, slug, questions


def main():
    src, sortie = Path(sys.argv[1]), Path(sys.argv[2])
    sortie.mkdir(parents=True, exist_ok=True)
    types = {}
    for pdf in sorted(src.glob('*.pdf')):
        titre, slug, qs = extraire(pdf, sortie)
        sans = [q['num'] for q in qs if q['reponses'] and not any(r['juste'] for r in q['reponses'])]
        for q in qs:
            types[q['type']] = types.get(q['type'], 0) + 1
        print(f'{len(qs):3d} q · {slug}' + (f'   ⚠ sans bonne réponse : {sans}' if sans else ''))
    print('types :', types)


if __name__ == '__main__':
    main()
