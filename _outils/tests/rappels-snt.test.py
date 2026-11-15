# Banc des rappels d'entrée de séance en SNT (t0, m1, t1) — fausse base PostgREST interceptée.
#   python -I _outils/tests/rappels-snt.test.py <racine du dépôt> [dossier des captures]
# Pour chaque séquence : un élève revient après 3 h d'absence, toutes les étapes à valider faites ;
# la fenêtre « Pour se remettre en route » s'ouvre avec 4 questions de la banque, se joue jusqu'au
# bout, et le résultat part dans l'état de la séquence (champs rappels/…). Un élève revenu depuis
# moins de 2 h ne voit rien ; un invité non plus. Toutes les images des banques existent.
# Côté professeur : prof/rappels.html?espace=snt n'offre que les trois séquences SNT et affiche
# chaque question, numéro d'étape compris (2.2 Pouzin, encart sans kicker).
import base64, json, os, re, sys, threading, time, functools, tempfile
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qsl, unquote
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
RACINE = sys.argv[1]
CAPT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(tempfile.gettempdir(), 'rappels-snt-banc')
os.makedirs(CAPT, exist_ok=True)
SUPA = 'https://ztyvuiaohxekuyjeoaxz.supabase.co'
PORT = 8774
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
SEQS = {'snt-t0': '2nde-snt-t0-systemes-informatises.html',
        'snt-m1': '2nde-snt-m1-representer-information.html',
        'snt-t1': '2nde-snt-t1-internet.html'}
PROG = {}          # (domaine, cle) -> valeur
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

def gerer(route, request):
    with verrou:
        u = urlparse(request.url); q = dict(parse_qsl(u.query, keep_blank_values=True))
        meth = request.method; corps = request.post_data
        def rep(d, st=200): route.fulfill(status=st, body=json.dumps(d), headers={'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
        if meth == 'OPTIONS': return route.fulfill(status=200, headers={'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*'})
        sub = sub_de(request)
        if u.path.startswith('/rest/v1/rpc/'):
            f = u.path.rsplit('/', 1)[1]
            if f in ('est_enseignant', 'est_gestionnaire'): return rep(sub == PROF)
            if f == 'ma_session': return rep([{'eleve_id': 'e1', 'pseudo': 'pingouin-07', 'classe_libelle': '2nde 3', 'annee_scolaire': '2026-2027'}] if sub == ELEVE else [])
            return rep([])
        if u.path.startswith('/rest/v1/'):
            t = u.path.split('/')[3]
            if t == 'progression' and sub == ELEVE:
                if meth == 'GET':
                    dom = unquote(q.get('domaine', '')[3:]); cle = unquote(q.get('cle', 'eq.')[3:])
                    return rep([{'cle': k[1], 'valeur': v} for k, v in PROG.items() if k[0] == dom and (not cle or k[1] == cle)])
                if meth == 'POST':
                    for l in json.loads(corps): PROG[(l['domaine'], l['cle'])] = l['valeur']
                    return rep(json.loads(corps), 201)
            if t == 'enseignants': return rep([{'libelle': 'M. Test'}])
            if t == 'classes': return rep([{'id': 'c1', 'code': 'SNT3', 'libelle': '2nde 3', 'espace': 'snt', 'actif': True}])
            return rep([])
        if u.path.startswith('/auth/v1/'):
            return rep({'access_token': jwt(sub or ELEVE), 'refresh_token': 'r', 'expires_in': 3600, 'user': {'id': sub or ELEVE}})
        return rep([])

def cles_gates(page_html):
    h = open(os.path.join(RACINE, 'pages', page_html), encoding='utf-8').read()
    return re.findall(r'<(?:div|section|article)\b[^>]*class="step(?:"| [^"]*")[^>]*data-gate[^>]*data-cle="([^"]+)"', h)

def il_y_a(heures):
    return (datetime.now(timezone.utc) - timedelta(hours=heures)).strftime('%Y-%m-%dT%H:%M:%S.000Z')

def contexte_eleve(nav):
    ctx = nav.new_context(viewport={'width': 1100, 'height': 900}, reduced_motion='reduce')
    ctx.route(SUPA + '/**', gerer)
    ctx.add_init_script("try{localStorage.setItem('snt.session', %s)}catch(e){}" % json.dumps(json.dumps(
        {'access_token': jwt(ELEVE), 'refresh_token': 'r', 'expires_at': int(time.time() * 1000) + 3600_000})))
    return ctx

with sync_playwright() as p:
    nav = p.chromium.launch()

    # ---------- les images des banques existent ----------
    page = nav.new_page()
    page.goto(BASE + '/pages/' + SEQS['snt-t1'])
    for seq in SEQS:
        page.add_script_tag(url=f'{BASE}/assets/js/rappels/{seq}.js?x={time.time()}')
    srcs = page.evaluate("""() => { const s = new Set();
        ['snt-t0','snt-m1','snt-t1'].forEach(k => (window.RAPPELS[k] || []).forEach(q => {
          if (q.image) s.add(q.image.src); (q.cases || []).forEach(c => c.img && s.add(c.img)); }));
        return [...s]; }""")
    manquantes = [s for s in srcs if not os.path.isfile(os.path.join(RACINE, s))]
    verif(f'{len(srcs)} images des banques présentes', not manquantes, str(manquantes))
    page.close()

    for seq, fichier in SEQS.items():
        cles = cles_gates(fichier)
        # ---------- élève revenu après 3 h, toutes étapes faites ----------
        PROG.clear()
        PROG[('cours', seq)] = {'v': 1, 'etapes': {c: {'fait': True} for c in cles}, 'champs': {}, 'vu_le': il_y_a(3)}
        ctx = contexte_eleve(nav); page = ctx.new_page(); err = []
        page.on('pageerror', lambda e: err.append(str(e)))
        page.goto(BASE + '/pages/' + fichier)
        # la carte « Bon retour » passe d'abord : on la ferme si elle s'ouvre
        try:
            page.wait_for_selector('.hub-modale', timeout=4000)
            page.screenshot(path=os.path.join(CAPT, f'{seq}-0-bon-retour.png'))
            page.evaluate("() => { const m = document.querySelector('.hub-modale'); const b = m && m.querySelector('button'); b ? b.click() : m && m.remove(); }")
            page.wait_for_timeout(300)
            if page.locator('.hub-modale').count(): page.evaluate("() => document.querySelectorAll('.hub-modale').forEach(m => m.remove())")
        except Exception:
            pass
        try:
            page.wait_for_selector('.rap-carte[data-id]', timeout=8000); ouvert = True
        except Exception:
            ouvert = False
        verif(f'{seq} : la fenêtre de rappel s’ouvre après 3 h', ouvert)
        if not ouvert:
            page.screenshot(path=os.path.join(CAPT, f'{seq}-echec.png'), full_page=False); ctx.close(); continue
        verif(f'{seq} : 4 questions', page.inner_text('.rap-compte').strip().endswith('/ 4'), page.inner_text('.rap-compte'))
        vus = []
        for i in range(4):
            qid = page.get_attribute('.rap-carte', 'data-id'); vus.append(qid)
            if page.locator('.rap-carte img').count():
                try:
                    page.wait_for_function("() => [...document.querySelectorAll('.rap-carte img')].every(i => i.complete && i.naturalWidth > 0)", timeout=5000)
                    charge = True
                except Exception:
                    charge = False
                verif(f'{seq} {qid} : images chargées', charge)
            page.screenshot(path=os.path.join(CAPT, f'{seq}-{i + 1}-{qid}.png'))
            # répondre : premier choix d'un QCM, ou première étiquette de chaque case
            if page.locator('.rap-corps .rr-choix button').count():
                page.locator('.rap-corps .rr-choix button').first.click()
            else:
                page.evaluate("""() => { const z = document.querySelector('.rap-corps');
                    z.querySelectorAll('select').forEach(s => { s.selectedIndex = 1; s.dispatchEvent(new Event('change', {bubbles: true})); });
                    z.querySelectorAll('.rr-pastilles').forEach(g => g.querySelector('button').click());
                    const v = [...z.querySelectorAll('button')].find(b => /vérifier|valider/i.test(b.textContent)); v && v.click(); }""")
            page.wait_for_selector('.rap-pied [data-suivant]', timeout=3000)
            page.locator('.rap-pied [data-suivant]').click()
        verif(f'{seq} : 4 questions différentes', len(set(vus)) == 4, str(vus))
        page.wait_for_selector('[data-fermer]', timeout=3000)
        page.screenshot(path=os.path.join(CAPT, f'{seq}-5-fin.png'))
        page.locator('[data-fermer]').click()
        page.wait_for_timeout(1500)   # l'écriture en base est différée
        champs = (PROG.get(('cours', seq)) or {}).get('champs', {})
        verif(f'{seq} : résultats enregistrés pour chaque question', all(('rappels/' + q) in champs for q in vus), str(list(champs)))
        verif(f'{seq} : série enregistrée', len(champs.get('rappels/_series', [])) == 1, str(champs.get('rappels/_series')))
        verif(f'{seq} : aucune erreur JS', not err, str(err))
        ctx.close()

        # ---------- revenu depuis 1 h : rien ----------
        PROG.clear()
        PROG[('cours', seq)] = {'v': 1, 'etapes': {c: {'fait': True} for c in cles}, 'champs': {}, 'vu_le': il_y_a(1)}
        ctx = contexte_eleve(nav); page = ctx.new_page(); page.goto(BASE + '/pages/' + fichier); page.wait_for_timeout(4000)
        verif(f'{seq} : pas de rappel sous 2 h d’absence', page.locator('.rap-carte').count() == 0)
        ctx.close()

    # ---------- invité ----------
    ctx = nav.new_context(); ctx.route(SUPA + '/**', gerer); page = ctx.new_page()
    page.goto(BASE + '/pages/' + SEQS['snt-t1']); page.wait_for_timeout(3500)
    verif('invité : aucun rappel', page.locator('.rap-carte').count() == 0)
    ctx.close()

    # ---------- l'élève de t1 : la question Pouzin porte « Revoir l'étape 2.2 » ----------
    PROG.clear()
    cles = cles_gates(SEQS['snt-t1'])
    jusqua = cles[:cles.index('t1-pouzin-cyclades') + 1]
    PROG[('cours', 'snt-t1')] = {'v': 1, 'etapes': {c: {'fait': True} for c in jusqua}, 'champs': {}, 'vu_le': il_y_a(3)}
    ctx = contexte_eleve(nav); page = ctx.new_page()
    page.goto(BASE + '/pages/' + SEQS['snt-t1'] + '?rappels=essai')
    page.wait_for_timeout(2500)
    page.evaluate("() => document.querySelectorAll('.hub-modale').forEach(m => m.remove())")
    page.wait_for_selector('.rap-carte[data-id]', timeout=8000)
    vu_pouzin = False
    for i in range(4):
        qid = page.get_attribute('.rap-carte', 'data-id')
        if qid in ('net-img-01', 'net-img-02', 'net-img-03'):
            vu_pouzin = True
            verif('t1 : l’encart Pouzin affiche « Étape 2.2 »', page.inner_text('.rap-de').strip() == 'Étape 2.2', page.inner_text('.rap-de') if page.locator('.rap-de').count() else '(absent)')
            page.locator('.rap-corps .rr-choix button').first.click()
            page.wait_for_selector('.rap-pied [data-suivant]')
            verif('t1 : lien « Revoir l’étape 2.2 »', page.locator('[data-revoir="t1-pouzin-cyclades"]').count() == 1 and '2.2' in page.inner_text('[data-revoir]'))
            page.screenshot(path=os.path.join(CAPT, f't1-pouzin-{qid}.png'))
            break
        page.locator('.rap-corps .rr-choix button').first.click() if page.locator('.rap-corps .rr-choix button').count() else None
        if not page.locator('.rap-pied [data-suivant]').count(): break
        page.locator('.rap-pied [data-suivant]').click()
    print('  (question Pouzin tirée dans cette série :', vu_pouzin, ')')
    ctx.close()

    # ---------- côté professeur ----------
    ctx = nav.new_context(viewport={'width': 1100, 'height': 1000})
    ctx.route(SUPA + '/**', gerer)
    st = {'access_token': jwt(PROF), 'refresh_token': 'r1', 'expires_at': int(time.time() * 1000) + 3600_000,
          'ouverte': int(time.time() * 1000), 'noms': {}, 'nomsFichier': ''}
    ctx.add_init_script("try{localStorage.setItem('snt.prof', %s)}catch(e){}" % json.dumps(json.dumps(st)))
    page = ctx.new_page(); err = []
    page.on('pageerror', lambda e: err.append(str(e)))
    page.goto(BASE + '/prof/rappels.html?espace=snt')
    page.wait_for_selector('.q[data-id]', timeout=8000)
    opts = page.eval_on_selector_all('#chapitre option', 'o => o.map(x => x.textContent)')
    verif('prof : trois séquences SNT seulement', len(opts) == 3 and all(o.startswith('SNT') for o in opts), str(opts))
    for i, seq in enumerate(SEQS):
        page.select_option('#chapitre', str(i)); page.wait_for_timeout(1200)
        n = page.locator('.q[data-id]').count()
        attendu = page.evaluate(f"window.RAPPELS['{seq}'].length")
        verif(f'prof {seq} : toutes les questions affichées', n == attendu, f'{n} / {attendu}')
        verif(f'prof {seq} : aucune clé d’étape perdue', page.locator('.alerte').count() == 0)
        verif(f'prof {seq} : aucune étape sans numéro', 'Étape ?' not in page.inner_text('#p-audit'))
        page.screenshot(path=os.path.join(CAPT, f'prof-{seq}.png'), full_page=False)
    verif('prof : aucune erreur JS', not err, str(err))
    page.goto(BASE + '/prof/rappels.html'); page.wait_for_selector('#chapitre option', state='attached')
    verif('prof : sans espace, les cinq chapitres', page.locator('#chapitre option').count() == 5)
    ctx.close()
    nav.close()

srv.shutdown()
print(f'\n{OK[0]} vérifications réussies, {len(KO)} échec(s).' + (' Captures : ' + CAPT))
sys.exit(1 if KO else 0)
