# Banc des corrigés collectifs d'ES (bdd/schema/044) — fausse base PostgREST interceptée.
#   python -I _outils/tests/corriges.test.py <racine du dépôt> [dossier des captures]
# Côté élève : la correction se pose À CÔTÉ de la réponse (deux colonnes, empilées
# sur écran étroit), repliée si l'élève n'a pas répondu, et la réponse n'est jamais
# touchée. Côté professeur (prof/corriges.html) : aperçu, ouvrir/fermer par séance
# et par question, modification du texte par le gestionnaire.
# Les corrigés sont FICTIFS : aucun vrai corrigé n'entre dans le dépôt.
import base64, json, os, sys, threading, time, uuid, functools, tempfile
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qsl, unquote
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
RACINE = sys.argv[1]
CAPT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(tempfile.gettempdir(), 'corriges-banc')
os.makedirs(CAPT, exist_ok=True)
SUPA = 'https://ztyvuiaohxekuyjeoaxz.supabase.co'
PORT = 8773
OK, KO = [0], []
def verif(nom, cond, detail=''):
    if cond: OK[0] += 1
    else: KO.append(nom); print('ÉCHEC :', nom, detail)

class Muet(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Muet, directory=RACINE))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}'

PROF, ELEVE = '00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000e001'
C1, C2 = str(uuid.uuid4()), str(uuid.uuid4())
SEQ = 'es1-t1-c3'
DB = {
    'classes': [{'id': C1, 'code': 'ES1G3A', 'libelle': '1G3', 'espace': 'es1', 'actif': True},
                {'id': C2, 'code': 'ES1G4A', 'libelle': '1G4', 'espace': 'es1', 'actif': True}],
    'corriges': [
        {'code': 'CRI-3d', 'sequence': SEQ, 'texte': 'd = a{{rac:2}} et R = {{frac:a<span class="rac">2</span>:4}}.<br><b>Fictif</b> pour le banc.', 'maj_le': '2026-11-14'},
        {'code': 'CRI-3g', 'sequence': SEQ, 'texte': 'C = {{frac:π<span class="rac">2</span>:6}} ≈ 0,74 (fictif).', 'maj_le': '2026-11-14'},
        {'code': 'CRI-2b', 'sequence': SEQ, 'texte': 'Corrigé fictif de 2.2 <script>alert(1)</script>', 'maj_le': '2026-11-14'},
    ],
    'corriges_actives': [],
}
REQ = []
verrou = threading.RLock()

def jwt(sub):
    b = lambda d: base64.urlsafe_b64encode(json.dumps(d).encode()).decode().rstrip('=')
    return b({'alg': 'HS256'}) + '.' + b({'sub': sub, 'role': 'authenticated', 'exp': 9999999999}) + '.sig'
def sub_de(req):
    a = req.headers.get('authorization', '')
    try:
        p = a.split(' ')[1].split('.')[1]; p += '=' * (-len(p) % 4)
        return json.loads(base64.urlsafe_b64decode(p))['sub']
    except Exception: return None

def filtrer(lignes, params):
    out = lignes
    for k, v in params:
        if k in ('select', 'order', 'limit', 'on_conflict', 'offset'): continue
        if v.startswith('eq.'): out = [l for l in out if str(l.get(k)) == unquote(v[3:])]
        elif v.startswith('in.('): vals = [unquote(x) for x in v[4:-1].split(',')]; out = [l for l in out if str(l.get(k)) in vals]
    return out

def gerer(route, request):
    with verrou:
        u = urlparse(request.url); q = parse_qsl(u.query, keep_blank_values=True)
        meth = request.method; corps = request.post_data
        REQ.append((meth, u.path, u.query, corps))
        def rep(d, st=200): route.fulfill(status=st, body=json.dumps(d), headers={'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
        if meth == 'OPTIONS': return route.fulfill(status=200, headers={'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*'})
        sub = sub_de(request)
        if u.path.startswith('/rest/v1/rpc/'):
            f = u.path.rsplit('/', 1)[1]
            if f == 'est_enseignant': return rep(sub == PROF)
            if f == 'est_gestionnaire': return rep(sub == PROF)
            if f == 'ma_session': return rep([{'eleve_id': 'e1', 'pseudo': 'pingouin-07', 'classe_libelle': '1G3', 'annee_scolaire': '2026-2027'}] if sub == ELEVE else [])
            if f == 'mes_corriges':
                seq = json.loads(corps or '{}').get('p_sequence')
                ouverts = {a['code'] for a in DB['corriges_actives'] if a['classe_id'] == C1}
                return rep([{'code': c['code'], 'texte': c['texte']} for c in DB['corriges'] if c['sequence'] == seq and c['code'] in ouverts])
            if f == 'mon_plafond': return rep([])
            return rep([])
        if u.path.startswith('/rest/v1/'):
            t = u.path.split('/')[3]
            if t == 'enseignants': return rep([{'libelle': 'M. Test'}])
            if t == 'reponses_libres':
                return rep([{'code_activite': 'CRI-3d', 'texte': 'Ma réponse à moi, écrite par l’élève.', 'statut': 'partage', 'version': 1}] if sub == ELEVE else [])
            if t in DB:
                if meth == 'GET': return rep(filtrer(DB[t], q))
                if meth == 'POST':
                    for l in json.loads(corps):
                        DB[t] = [x for x in DB[t] if not (x['classe_id'] == l['classe_id'] and x['code'] == l['code'])] + [l]
                    return route.fulfill(status=201, body='', headers={'Access-Control-Allow-Origin': '*'})
                if meth == 'DELETE':
                    garde = filtrer(DB[t], q); DB[t] = [x for x in DB[t] if x not in garde]
                    return route.fulfill(status=204, body='', headers={'Access-Control-Allow-Origin': '*'})
                if meth == 'PATCH':
                    for x in filtrer(DB[t], q): x.update(json.loads(corps))
                    return route.fulfill(status=204, body='', headers={'Access-Control-Allow-Origin': '*'})
            return rep([])
        if u.path.startswith('/auth/v1/'):
            return rep({'access_token': jwt(sub or ELEVE), 'refresh_token': 'r', 'expires_in': 3600, 'user': {'id': sub or ELEVE}})
        return rep([])

def rendre_visible(page, sel):
    page.evaluate("""s => { let e = document.querySelector(s);
      while (e && e !== document.body) { if (getComputedStyle(e).display === 'none') e.style.display = 'block'; e = e.parentElement; }
      document.querySelector(s).scrollIntoView({block: 'center'}); }""", sel)

with sync_playwright() as p:
    nav = p.chromium.launch()

    # ================= côté PROFESSEUR =================
    ctx = nav.new_context(viewport={'width': 1100, 'height': 1000})
    ctx.route(SUPA + '/**', gerer)
    st = {'access_token': jwt(PROF), 'refresh_token': 'r1', 'expires_at': int(time.time() * 1000) + 3600_000,
          'ouverte': int(time.time() * 1000), 'noms': {}, 'nomsFichier': ''}
    ctx.add_init_script("try{localStorage.setItem('snt.prof', %s)}catch(e){}" % json.dumps(json.dumps(st)))
    page = ctx.new_page(); err = []
    page.on('pageerror', lambda e: err.append(str(e)))
    page.goto(BASE + '/prof/corriges.html'); page.wait_for_selector('article.q')
    verif('prof : trois questions affichées', page.locator('article.q').count() == 3)
    verif('prof : le script du texte est échappé', page.locator('article.q script').count() == 0 and '<script>' in page.inner_text('body'))
    verif('prof : racine et fraction rendues', page.locator('.corr .cp-rac .cp-r').count() >= 2 and page.locator('.corr .cp-frac').count() >= 2)
    verif('prof : bouton Modifier (gestionnaire)', page.locator('[data-modif]').count() == 3)
    page.screenshot(path=os.path.join(CAPT, 'prof-1-apercu.png'), full_page=True)
    # ouvrir la séance de CRI-3d pour 1G3
    sec = page.locator('section.seance', has=page.locator('[data-code="CRI-3d"]'))
    sec.locator('.seance-tete .interr', has_text='1G3').locator('button').click()
    page.wait_for_timeout(300)
    ouverts = {a['code'] for a in DB['corriges_actives'] if a['classe_id'] == C1}
    verif('prof : ouvrir une séance ouvre ses questions pour 1G3 seulement', {'CRI-3d', 'CRI-3g'} <= ouverts and not [a for a in DB['corriges_actives'] if a['classe_id'] == C2], str(DB['corriges_actives']))
    verif('prof : le bandeau de séance passe à « ouvert »', 'ouvert' in sec.locator('.seance-tete .interr', has_text='1G3').inner_text())
    # fermer une question à la puce
    page.locator('[data-code="CRI-3g"] .puce', has_text='1G3').click(); page.wait_for_timeout(300)
    verif('prof : la puce ferme une seule question', 'CRI-3g' not in {a['code'] for a in DB['corriges_actives']} and 'CRI-3d' in {a['code'] for a in DB['corriges_actives']})
    # modifier un texte
    page.locator('[data-code="CRI-2b"] [data-modif]').click()
    page.locator('[data-code="CRI-2b"] textarea').fill('Nouveau texte {{frac:1:2}}')
    verif('prof : l’aperçu suit la frappe', page.locator('[data-code="CRI-2b"] .corr .cp-frac').count() == 1)
    page.locator('[data-code="CRI-2b"] [data-enr]').click(); page.wait_for_timeout(300)
    verif('prof : le texte est enregistré', next(c for c in DB['corriges'] if c['code'] == 'CRI-2b')['texte'] == 'Nouveau texte {{frac:1:2}}')
    page.screenshot(path=os.path.join(CAPT, 'prof-2-ouvert.png'), full_page=True)
    # étroit (iPad portrait)
    page.set_viewport_size({'width': 700, 'height': 1000}); page.wait_for_timeout(200)
    verif('prof : pas de défilement horizontal à 700 px', page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
    verif('prof : aucune erreur JS', not err, str(err))
    ctx.close()

    # ================= côté ÉLÈVE =================
    for larg in (1100, 700):
        ctx = nav.new_context(viewport={'width': larg, 'height': 1000})
        ctx.route(SUPA + '/**', gerer)
        ctx.add_init_script("try{localStorage.setItem('snt.session', %s)}catch(e){}" % json.dumps(json.dumps(
            {'access_token': jwt(ELEVE), 'refresh_token': 'r', 'expires_at': int(time.time() * 1000) + 3600_000})))
        page = ctx.new_page(); err = []
        page.on('pageerror', lambda e: err.append(str(e)))
        page.goto(BASE + '/pages/1re-es-t1-c3-cristaux.html')
        page.wait_for_selector('[data-focus-code="CRI-3d"] .corrige-prof', state='attached', timeout=8000)
        rendre_visible(page, '[data-focus-code="CRI-3d"]')
        page.wait_for_timeout(300)
        f = '[data-focus-code="CRI-3d"]'
        echo = page.inner_text(f + ' [data-focus-echo]')
        verif(f'élève {larg} : la réponse de l’élève est intacte', echo.strip() == 'Ma réponse à moi, écrite par l’élève.', echo)
        verif(f'élève {larg} : correction ouverte à côté de la réponse', page.locator(f + ' > .corrige-prof.duo').count() == 1)
        # les deux boîtes dans le même instant : une image chargée entre deux mesures décale la page
        be, bc = page.evaluate("s => [s + ' [data-focus-echo]', s + ' > .corrige-prof'].map(x => { const r = document.querySelector(x).getBoundingClientRect(); return {x: r.x, y: r.y, width: r.width, height: r.height}; })", f)
        if larg == 1100:
            verif('élève 1100 : deux colonnes côte à côte', bc['x'] > be['x'] + be['width'] - 2 and abs(bc['y'] - be['y']) < 40, f'{be} {bc}')
        else:
            verif('élève 700 : empilées, la correction sous la réponse', bc['y'] >= be['y'] + be['height'] - 2, f'{be} {bc}')
        verif(f'élève {larg} : racine dessinée avec sa barre', page.locator(f + ' .cp-rac .cp-r').count() == 2)
        verif(f'élève {larg} : question non ouverte → rien', page.locator('[data-focus-code="CRI-3g"] .corrige-prof').count() == 0 and page.locator('[data-focus-code="CRI-2b"] .corrige-prof').count() == 0)
        verif(f'élève {larg} : pas de défilement horizontal', page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
        verif(f'élève {larg} : aucune erreur JS', not err, str(err))
        page.locator(f).screenshot(path=os.path.join(CAPT, f'eleve-{larg}-repondu.png'))
        ctx.close()

    # non répondu : on ouvre CRI-3g à 1G3, l'élève n'y a pas répondu
    DB['corriges_actives'].append({'classe_id': C1, 'code': 'CRI-3g'})
    ctx = nav.new_context(viewport={'width': 1100, 'height': 1000})
    ctx.route(SUPA + '/**', gerer)
    ctx.add_init_script("try{localStorage.setItem('snt.session', %s)}catch(e){}" % json.dumps(json.dumps(
        {'access_token': jwt(ELEVE), 'refresh_token': 'r', 'expires_at': int(time.time() * 1000) + 3600_000})))
    page = ctx.new_page()
    page.goto(BASE + '/pages/1re-es-t1-c3-cristaux.html')
    g = '[data-focus-code="CRI-3g"]'
    page.wait_for_selector(g + ' .corrige-prof', state='attached', timeout=8000)
    rendre_visible(page, g)
    verif('élève : non répondu → correction repliée', page.locator(g + ' > details.corrige-prof:not([open])').count() == 1)
    verif('élève : non répondu → le bouton Répondre reste là', page.locator(g + ' [data-focus-ouvrir]').count() == 1)
    page.locator(g + ' > details.corrige-prof > summary').click(); page.wait_for_timeout(150)
    page.locator(g).screenshot(path=os.path.join(CAPT, 'eleve-non-repondu-deplie.png'))
    ctx.close()

    # invité (aucune session) : aucun appel à mes_corriges
    n0 = len([r for r in REQ if r[1].endswith('/mes_corriges')])
    ctx = nav.new_context(); ctx.route(SUPA + '/**', gerer); page = ctx.new_page()
    page.goto(BASE + '/pages/1re-es-t1-c3-cristaux.html'); page.wait_for_timeout(1200)
    verif('invité : aucune correction', page.locator('.corrige-prof').count() == 0)
    ctx.close()
    nav.close()

srv.shutdown()
print(f'{OK[0]} vérifications passées, {len(KO)} échec(s). Captures : {CAPT}')
sys.exit(1 if KO else 0)
