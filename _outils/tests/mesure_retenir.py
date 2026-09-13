"""Mesure des « à retenir » et du gras d'une page SNT.
Usage : python mesure_retenir.py pages/2nde-snt-t1-internet.html [--detail]
Hors mesure du gras « corps » : <script>, <style>, <template>, commentaires, attributs.
"""
import re, sys

def blocs_retain(s):
    out = []
    for m in re.finditer(r'<div class="retain[^"]*"[^>]*>', s):
        i = m.end(); d = 1
        for t in re.finditer(r'<div\b|</div>', s[i:]):
            d += 1 if t.group() == '<div' else -1
            if d == 0:
                out.append((s.count('\n', 0, m.start()) + 1, s[i:i + t.start()])); break
        else:
            out.append((s.count('\n', 0, m.start()) + 1, None))
    return out

def texte(x):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', x)).strip()

def corps(s):
    s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    s = re.sub(r'<(script|style|template)\b.*?</\1>', '', s, flags=re.S | re.I)
    return s

f = sys.argv[1]; detail = '--detail' in sys.argv
s = open(f, encoding='utf8').read()
alertes = 0
print(f)
for ligne, b in blocs_retain(s):
    if b is None:
        print(f'  L{ligne}: 🔴 bloc non fermé'); alertes += 1; continue
    # la bulle d'un bouton « plus tard » ne compte pas
    b2 = re.sub(r'<span class="bulle">.*?</span>', '', b, flags=re.S)
    nb = len(re.findall(r'<(b|strong)\b', b2)); nd = b2.count('<dfn'); nc = b2.count('<code')
    nbr = len(re.findall(r'<br', b2)); car = len(texte(b2)); ul = '<ul' in b2 or '<ol' in b2
    pb = []
    if nb > 2: pb.append(f'gras {nb}>2')
    if nd > 3: pb.append(f'dfn {nd}>3')
    if nc: pb.append(f'code {nc}')
    if nbr: pb.append(f'br {nbr}')
    if car > 300 and not ul: pb.append(f'{car} car. sans liste')
    if re.search(r'style="[^"]*font-size', b2): pb.append('font-size inline')
    alertes += bool(pb)
    if detail or pb:
        print(f'  L{ligne}: gras={nb} dfn={nd} code={nc} car={car} liste={ul}' + ('  🔴 ' + ' · '.join(pb) if pb else ''))
c = corps(s)
print(f'  blocs={len(blocs_retain(s))} alertes={alertes} · gras corps={len(re.findall(r"<(b|strong)[ >]", c))} · dfn corps={c.count("<dfn")}')
# équilibre des balises courantes, hors script/style
for tag in ('div', 'ul', 'li', 'b', 'dfn', 'p', 'span', 'code'):
    o = len(re.findall(rf'<{tag}[\s>]', c)); fe = len(re.findall(rf'</{tag}>', c))
    if o != fe: print(f'  ⚠ balises <{tag}> : {o} ouvertes / {fe} fermées')
