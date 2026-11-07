"""Banc Playwright de assets/js/emc-carte.js (page _outils/tests/emc-carte-demo.html).
Lancer depuis n'importe où :  python _outils/tests/emc-carte.test.py <racine du dépôt>
Les captures vont dans le dossier temporaire (emc-banc-carte), jamais dans le dépôt."""
import functools, http.server, json, os, sys, threading, time
from playwright.sync_api import sync_playwright

DEPOT = sys.argv[1]
import tempfile
SORTIE = os.path.join(tempfile.gettempdir(), 'emc-banc-carte'); os.makedirs(SORTIE, exist_ok=True)
PORT = 8777

class Silence(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Silence, directory=DEPOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()

ok = ko = 0
def verif(nom, cond, detail=''):
    global ok, ko
    if cond: ok += 1
    else:
        ko += 1; print('ÉCHEC :', nom, detail)

ECRAN = """(a) => { const c = window.__demo.cartes[a.k], st = c.stage, r = st.container().getBoundingClientRect();
  return { x: r.left + a.x * st.scaleX() + st.x(), y: r.top + a.y * st.scaleY() + st.y() }; }"""

with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={'width': 1200, 'height': 2200}, device_scale_factor=1, has_touch=True)
    page = ctx.new_page()
    erreurs = []
    page.on('pageerror', lambda e: erreurs.append(str(e)))
    page.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' else None)
    page.goto(f'http://127.0.0.1:{PORT}/_outils/tests/emc-carte-demo.html')
    page.wait_for_function('window.__demo && (window.__demo.pret || window.__demo.erreur)', timeout=15000)
    verif('démo montée', page.evaluate('window.__demo.pret'), page.evaluate('window.__demo.erreur'))
    page.wait_for_timeout(400)

    def ecran(k, x, y): return page.evaluate(ECRAN, {'k': k, 'x': x, 'y': y})
    def tracer(k, pts, pas=12):
        a = ecran(k, *pts[0]); page.mouse.move(a['x'], a['y']); page.mouse.down()
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            for i in range(1, pas + 1):
                q = ecran(k, x0 + (x1 - x0) * i / pas, y0 + (y1 - y0) * i / pas); page.mouse.move(q['x'], q['y'])
        page.mouse.up(); page.wait_for_timeout(60)
    def nb_persistes(): return page.evaluate('window.__demo.persistes.length')
    def bouton(k, texte):
        page.locator(f'#c-{k} .carte-outils button', has_text=texte).first.click()

    # --- l'élève de la table 3 voit sa zone ---
    page.evaluate("window.__demo.cartes.eleve.centrerSur(3)")
    page.wait_for_timeout(100)
    tracer('eleve', [(-650, -700), (-800, -800), (-950, -650)])
    verif('trait dans la zone 3 persisté', nb_persistes() == 1, nb_persistes())
    n0 = nb_persistes()
    page.evaluate("window.__demo.cartes.eleve.vueEnsemble()")
    tracer('eleve', [(-700, -700), (-200, -900), (700, -700)], pas=30)          # sort de la zone 3 vers la zone 1
    n1 = nb_persistes()
    verif('trait qui sort : seule la partie dans la zone 3 est persistée', n1 - n0 >= 1, n1 - n0)
    tracer('eleve', [(700, -700), (900, -800)])                                    # entièrement en zone 1
    verif('trait entièrement hors zone : rien', nb_persistes() == n1)
    tracer('eleve', [(-900, -900), (-1100, -1100), (-1500, -1400)], pas=20)     # de l'intérieur vers l'extérieur
    tous = page.evaluate("window.__demo.persistes.map(l => ({z: l.zone, ok: EMC.dansZone(l.zone, l.type, l.donnees), n: l.donnees.points ? l.donnees.points.length : 0}))")
    verif('tout ce qui est persisté est en zone 3', all(t['z'] == 3 for t in tous), tous)
    verif('tout ce qui est persisté passe EMC.dansZone', all(t['ok'] for t in tous), tous)
    verif('aucun refus du « serveur »', page.evaluate('window.__demo.refus') == 0)
    page.wait_for_timeout(100)
    verif('le trait apparaît chez le prof', len(page.evaluate("window.__demo.cartes.prof.lignes()")) == nb_persistes())
    verif('le trait apparaît en projection', len(page.evaluate("window.__demo.cartes.projection.lignes()")) == nb_persistes())

    # --- texte ---
    page.evaluate("window.__demo.cartes.eleve.centrerSur(3)")
    bouton('eleve', 'Texte')
    q = ecran('eleve', -800, -650); page.mouse.click(q['x'], q['y'])
    page.locator('#c-eleve textarea').fill('Vote humiliant\nphotos détournées')
    page.locator('#c-eleve button', has_text='Poser').click()
    page.wait_for_timeout(100)
    der = page.evaluate("window.__demo.persistes[window.__demo.persistes.length - 1]")
    verif('texte persisté', der['type'] == 'texte' and der['donnees']['texte'].startswith('Vote'), der)
    verif('texte dans la zone', page.evaluate("(l) => EMC.dansZone(l.zone, l.type, l.donnees)", der))
    q = ecran('eleve', -860, -850); page.mouse.click(q['x'], q['y'])        # trop près du bord : recalé
    page.locator('#c-eleve textarea').fill('Une phrase assez longue pour déborder')
    page.locator('#c-eleve button', has_text='Poser').click(); page.wait_for_timeout(100)
    der2 = page.evaluate("window.__demo.persistes[window.__demo.persistes.length - 1]")
    verif('texte près du bord recalé dans la zone', der2['type'] == 'texte' and page.evaluate("(l) => EMC.dansZone(l.zone, l.type, l.donnees)", der2), der2['donnees'])

    # --- autocollant, forme ---
    bouton('eleve', 'Autocollant'); page.locator('#c-eleve button[aria-label="Autocollant ❤️"]').click()
    q = ecran('eleve', -1000, -500); page.mouse.click(q['x'], q['y']); page.wait_for_timeout(60)
    bouton('eleve', 'Forme'); page.locator('#c-eleve button', has_text='Bulle de SMS').click()
    q = ecran('eleve', -700, -1000); page.mouse.click(q['x'], q['y']); page.wait_for_timeout(60)
    types = page.evaluate("window.__demo.persistes.slice(-2).map(l => l.type + ':' + (l.donnees.symbole || l.donnees.forme))")
    verif('autocollant et bulle posés', types == ['autocollant:❤️', 'forme:bulle'], types)

    # --- annuler / refaire ---
    idb = page.evaluate("window.__demo.persistes[window.__demo.persistes.length - 1].id")
    page.locator('#c-eleve button[aria-label="Annuler"]').click(); page.wait_for_timeout(60)
    verif('annuler : supprime = true', page.evaluate(f"window.__demo.base['{idb}'].supprime") is True)
    page.locator('#c-eleve button[aria-label="Refaire"]').click(); page.wait_for_timeout(60)
    verif('refaire : supprime = false', page.evaluate(f"window.__demo.base['{idb}'].supprime") is False)

    # --- zoom : molette, puis pincement à deux doigts ---
    s0 = page.evaluate("window.__demo.cartes.eleve.echelle()")
    q = ecran('eleve', -800, -800); page.mouse.move(q['x'], q['y']); page.mouse.wheel(0, -400); page.wait_for_timeout(100)
    s1 = page.evaluate("window.__demo.cartes.eleve.echelle()")
    verif('molette : zoom avant', s1 > s0 * 1.5, (s0, s1))
    cdp = ctx.new_cdp_session(page)
    box = page.locator('#c-eleve canvas').first.bounding_box()
    cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
    def touches(t, d): return [{'x': cx - d, 'y': cy, 'id': 1}, {'x': cx + d, 'y': cy, 'id': 2}]
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': touches(0, 40)})
    for d in range(40, 161, 20): cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': touches(0, d)})
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); page.wait_for_timeout(100)
    s2 = page.evaluate("window.__demo.cartes.eleve.echelle()")
    verif('pincement : zoom ×4 environ', 3 < s2 / s1 < 5 or s2 >= 7.99, (s1, s2))
    verif('le pincement n\'a rien dessiné', page.evaluate('window.__demo.persistes.length') == len(tous) + 4)
    for _ in range(30): page.mouse.wheel(0, -2000)
    verif('échelle bornée à 8', abs(page.evaluate("window.__demo.cartes.eleve.echelle()") - 8) < 1e-6)
    for _ in range(60): page.mouse.wheel(0, 3000)
    bas = page.evaluate("window.__demo.cartes.eleve.echelle()")
    page.mouse.wheel(0, 3000)
    verif('échelle bornée en bas (stable, et la carte entière tient)', bas == page.evaluate("window.__demo.cartes.eleve.echelle()") and bas * 4000 < 1200 and bas > 0.02, bas)

    # --- carte fermée, figée, zone verrouillée ---
    bouton('eleve', 'Crayon')
    page.evaluate("window.__demo.cartes.eleve.vueEnsemble(); window.__demo.cartes.eleve.etat({ figee: true })")
    nf = nb_persistes()
    verif('figée : crayon désactivé', page.locator('#c-eleve button[aria-label="Crayon"]').is_disabled())
    tracer('eleve', [(-650, -700), (-800, -800)])
    verif('figée : rien de persisté', nb_persistes() == nf)
    page.evaluate("window.__demo.cartes.eleve.etat({ figee: false, zonesVerrouillees: [3] })")
    verif('zone verrouillée : crayon désactivé', page.locator('#c-eleve button[aria-label="Crayon"]').is_disabled())
    page.evaluate("window.__demo.cartes.eleve.etat({ zonesVerrouillees: [] })")
    verif('réouverte : l\'outil revient', page.locator('#c-eleve button[aria-label="Crayon"]').is_enabled())

    # --- le prof masque le texte : il disparaît en projection et chez l'élève ---
    idt = der['id']
    page.evaluate("window.__demo.cartes.prof.centrerSur(3)"); page.wait_for_timeout(60)
    b = page.evaluate("(id) => { const c = window.__demo.cartes.prof, n = c.stage.find(x => x.getAttr('emcId') === id)[0], r = n.getClientRect(), cr = c.stage.container().getBoundingClientRect(); return { x: cr.left + r.x + r.width / 2, y: cr.top + r.y + r.height / 2 }; }", idt)
    page.mouse.click(b['x'], b['y']); page.wait_for_timeout(60)
    verif('prof : sélection du texte', page.evaluate("window.__demo.cartes.prof.selection && window.__demo.cartes.prof.selection.id") == idt)
    page.locator('#c-prof button', has_text='Masquer').click(); page.wait_for_timeout(100)
    verif('base : masqué et vidé', page.evaluate(f"window.__demo.base['{idt}'].masque && Object.keys(window.__demo.base['{idt}'].donnees).length === 0"))
    verif('projection : le texte a disparu', idt not in page.evaluate("window.__demo.cartes.projection.lignes().map(l => l.id)"))
    verif('projection : aucun nœud pour lui', page.evaluate(f"window.__demo.cartes.projection.stage.find(x => x.getAttr('emcId') === '{idt}').length") == 0)
    verif('élève : aucun nœud pour lui', page.evaluate(f"window.__demo.cartes.eleve.stage.find(x => x.getAttr('emcId') === '{idt}').length") == 0)
    verif('prof : le texte reste visible, grisé', page.evaluate(f"(() => {{ const n = window.__demo.cartes.prof.stage.find(x => x.getAttr('emcId') === '{idt}')[0]; return !!n && n.opacity() < 0.5; }})()"))
    shot = {}
    for k in ('eleve', 'prof', 'projection'):
        page.evaluate(f"window.__demo.cartes['{k}'].vueEnsemble()")
    page.wait_for_timeout(150)
    for k in ('eleve', 'prof', 'projection'):
        shot[k] = os.path.join(SORTIE, f'carte-{k}.png'); page.locator(f'#c-{k}').screenshot(path=shot[k])
    page.evaluate("window.__demo.cartes.eleve.centrerSur(3)"); page.wait_for_timeout(100)
    shot['eleve-zone'] = os.path.join(SORTIE, 'carte-eleve-zone3.png'); page.locator('#c-eleve').screenshot(path=shot['eleve-zone'])
    page.locator('#c-prof button', has_text='Démasquer').click(); page.wait_for_timeout(100)
    verif('démasquer : le texte revient en projection', idt in page.evaluate("window.__demo.cartes.projection.lignes().map(l => l.id)"))

    # --- 2000 éléments ---
    duree = page.evaluate("""() => {
      const types = ['trait', 'texte', 'autocollant', 'forme'], l = [];
      let i = 0;
      while (l.length < 2000) {
        const z = 1 + (i % 8), m = EMC.milieu(z), dx = (Math.random() - .5) * 300, dy = (Math.random() - .5) * 300, t = types[i % 4];
        let d;
        if (t === 'trait') { d = { points: [], epaisseur: 8 }; for (let k = 0; k < 30; k++) d.points.push(m.x + dx + k * 3, m.y + dy + Math.sin(k) * 10); }
        else if (t === 'texte') d = { x: m.x + dx, y: m.y + dy, l: 140, h: 40, texte: 'mot ' + i, taille: 30 };
        else if (t === 'autocollant') d = { x: m.x + dx, y: m.y + dy, l: 60, h: 60, symbole: '👍' };
        else d = { x: m.x + dx, y: m.y + dy, l: 100, h: 60, forme: 'rect' };
        if (EMC.dansZone(z, t, d)) l.push({ id: 'g' + i, zone: z, type: t, couleur: 'vert', donnees: d, masque: false, supprime: false, maj_le: '2026-11-12T08:00:00Z' });
        i++;
      }
      const t0 = performance.now();
      window.__demo.cartes.prof.charger(l); window.__demo.cartes.projection.charger(l);
      window.__demo.cartes.prof.stage.draw(); window.__demo.cartes.projection.stage.draw();
      const t1 = performance.now();
      window.__demo.cartes.prof.stage.scale({x: .3, y: .3}); window.__demo.cartes.prof.stage.draw();
      return { charge: t1 - t0, redessin: performance.now() - t1 };
    }""")
    verif('2000 éléments : chargés et dessinés (2 cartes) en moins de 3 s', duree['charge'] < 3000, duree)
    page.evaluate("window.__demo.cartes.projection.vueEnsemble()"); page.wait_for_timeout(100)
    shot['projection-2000'] = os.path.join(SORTIE, 'carte-projection-2000.png'); page.locator('#c-projection').screenshot(path=shot['projection-2000'])

    # --- export PNG ---
    exp = page.evaluate("""async () => {
      const t0 = performance.now(), b = await window.__demo.cartes.projection.exporterPNG({ ratio: 3 });
      const im = await createImageBitmap(b);
      const r = { taille: b.size, type: b.type, l: im.width, h: im.height, ms: performance.now() - t0 };
      const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'export.png'; document.body.appendChild(a);
      window.__export = a; return r; }""")
    verif('export PNG 10000 px de côté (plafond PC)', exp['type'] == 'image/png' and abs(exp['l'] - 10000) <= 2 and abs(exp['h'] - 10000) <= 2, exp)
    verif('export PNG non vide (> 500 Ko)', exp['taille'] > 500_000, exp)
    with page.expect_download() as dl:
        page.evaluate("window.__export.click()")
    chemin = os.path.join(SORTIE, 'carte-export.png'); dl.value.save_as(chemin)
    exp2 = page.evaluate("async () => { const b = await window.__demo.cartes.prof.exporterPNG({ ratio: 1, plafond: 4096 }); const im = await createImageBitmap(b); return [im.width, im.height]; }")
    verif('export plafonné à 4096 (iPad)', max(exp2) <= 4096 and min(exp2) >= 3990, exp2)

    verif('aucune erreur JS', not erreurs, erreurs)
    print(json.dumps({'duree_2000': duree, 'export': exp, 'captures': shot, 'export_png': chemin}, ensure_ascii=False, indent=1))
    nav.close()
srv.shutdown()
print(f'{ok} contrôles réussis, {ko} en échec.')
sys.exit(1 if ko else 0)
