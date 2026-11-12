# Banc des pages enseignant EMC (chantier C) — fausse base PostgREST interceptée,
# supabase-js bouchonné (le direct "échoue" : on teste la relecture de secours).
#   python -I _outils/tests/emc-prof.test.py <racine du dépôt> [dossier des captures]
#   (captures par défaut : dossier temporaire, emc-banc-prof — jamais dans le dépôt)
import base64, json, os, re, sys, threading, time, uuid, functools
from datetime import datetime, timezone, timedelta
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qsl, unquote
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
RACINE = sys.argv[1]
CAPT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(__import__('tempfile').gettempdir(), 'emc-banc-prof')
os.makedirs(CAPT, exist_ok=True)
SUPA = 'https://ztyvuiaohxekuyjeoaxz.supabase.co'
PORT = 8771
OK, KO = [0], []
def verif(nom, cond, detail=''):
    if cond: OK[0] += 1
    else: KO.append(nom); print('ÉCHEC :', nom, detail)

# ---------- serveur statique ----------
class Muet(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Muet, directory=RACINE))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}'

# ---------- données ----------
def iso(dt=None): return (dt or datetime.now(timezone.utc)).isoformat()
sql = open(os.path.join(RACINE, 'bdd/schema/031-emc.sql'), encoding='utf-8').read()
contenus = [{'cle': m.group(1), 'valeur': json.loads(m.group(2))}
            for m in re.finditer(r"\('(\w+)', \$j\$(.*?)\$j\$::jsonb\)", sql, re.S)]
assert len(contenus) == 9, len(contenus)
# ce que le 042 ajoute au harcèlomètre (volet loi, repères, chiffres)
_s42 = open(os.path.join(RACINE, 'bdd/schema/042-emc-harcelometre-loi.sql'), encoding='utf-8').read()
_hm = next(c['valeur'] for c in contenus if c['cle'] == 'harcelometre')
_lois = {k: json.loads(v) for k, v in re.findall(r"\('(s\d+)', \$j\$(.*?)\$j\$::jsonb\)", _s42, re.S)}
for _x in _hm['situations']:
    if _x['id'] in _lois: _x['loi'] = _lois[_x['id']]
for _c in ('loi_reperes', 'chiffres'):
    _hm[_c] = json.loads(re.search(r"'%s', \$j\$(.*?)\$j\$::jsonb" % _c, _s42, re.S).group(1))
for _c in ('loi_note', 'chiffres_question'):
    _hm[_c] = re.search(r"'%s',\s*'((?:[^']|'')*)'" % _c, _s42).group(1).replace("''", "'")
CONTENUS0 = json.dumps(contenus)
MOI = '00000000-0000-0000-0000-000000009001'
CL = {c: str(uuid.uuid4()) for c in ['NINA27', 'NINA48', 'NINA63', 'NINA91', 'SNT26A']}
classes = [{'id': CL[c], 'code': c, 'libelle': ('EMC 2nde — créneau %d' % (i + 1)) if c != 'SNT26A' else 'SNT A',
            'espace': 'emc' if c != 'SNT26A' else 'snt', 'annee_scolaire': '2026-2027', 'actif': True, 'avance_max': 2}
           for i, c in enumerate(CL)]
C1 = CL['NINA27']
PSEUDOS = ['pingouin-%02d' % i for i in range(1, 13)]
eleves, participants, mots, votes, notes, carte = [], [], [], [], [], []
for i, p in enumerate(PSEUDOS):
    e = str(uuid.uuid4())
    eleves.append({'id': e, 'pseudo': p, 'classe_id': C1 if i < 9 else CL['SNT26A']})
    participants.append({'classe_id': C1, 'eleve_id': e, 'table_num': i % 8 + 1, 'pret': i < 10, 'pret_le': iso(), 'entre_le': iso()})
    mots.append({'classe_id': C1, 'eleve_id': e, 'mots': [['Peur', 'moquerie', 'Isolement'][i % 3], 'insulte' if i == 0 else 'tristesse'],
                 'emojis': ['😢', '😡'][: 1 + i % 2], 'maj_le': iso()})
    votes.append({'classe_id': C1, 'situation': 's10', 'eleve_id': e, 'valeur': i % 11, 'maj_le': iso()})
    notes.append({'classe_id': C1, 'eleve_id': e, 'texte': 'Note de la table %d' % (i % 8 + 1), 'maj_le': iso()})
carte.append({'id': str(uuid.uuid4()), 'classe_id': C1, 'eleve_id': eleves[0]['id'], 'auteur': MOI, 'zone': 1, 'type': 'texte', 'couleur': 'bleu',
              'donnees': {'x': 650, 'y': -800, 'l': 220, 'h': 60, 'texte': 'photos détournées', 'taille': 40},
              'masque': False, 'supprime': False, 'cree_le': iso(), 'maj_le': iso(), 'canal': C1 + ':1'})
carte.append({'id': str(uuid.uuid4()), 'classe_id': C1, 'eleve_id': eleves[1]['id'], 'auteur': MOI, 'zone': 2, 'type': 'trait', 'couleur': 'rouge',
              'donnees': {'points': [1400, -1500, 1500, -1600, 1600, -1500], 'epaisseur': 8},
              'masque': False, 'supprime': False, 'cree_le': iso(), 'maj_le': iso(), 'canal': C1 + ':2'})
DB = {
    'classes': classes, 'eleves': eleves, 'emc_contenus': json.loads(CONTENUS0),
    'emc_seances': [{'classe_id': CL[c], 'etape': 1 if c == 'NINA27' else 0, 'situation_courante': None, 'situation_revelee': False,
                     'carte_figee': False, 'zones_verrouillees': [], 'cloturee_le': None, 'maj_le': iso()} for c in CL if c != 'SNT26A'],
    'emc_participants': participants, 'emc_mots': mots, 'emc_mots_masques': [], 'emc_notes': notes,
    'emc_carte': carte, 'emc_carte_masques': [], 'emc_votes': votes,
    'emc_enquete': [{'id': str(uuid.uuid4()), 'classe_id': C1, 'reponses': {'q1': 'non', 'q2': 'oui', 'q4': 'oui'}, 'temoignage': 'Un témoignage de test' if i == 0 else None} for i in range(5)],
    'emc_aide': [],
    'emc_cartes': [],
}
PK = {'emc_contenus': ['cle'], 'emc_mots_masques': ['classe_id', 'mot'], 'emc_seances': ['classe_id'],
      'emc_participants': ['classe_id', 'eleve_id'], 'emc_mots': ['classe_id', 'eleve_id'], 'emc_notes': ['classe_id', 'eleve_id'],
      'emc_votes': ['classe_id', 'situation', 'eleve_id']}
JOURNAL = []

def jwt(sub):
    b = lambda d: base64.urlsafe_b64encode(json.dumps(d).encode()).decode().rstrip('=')
    return b({'alg': 'HS256'}) + '.' + b({'sub': sub, 'role': 'authenticated', 'exp': 9999999999}) + '.sig'

def filtrer(lignes, params):
    out = lignes
    for k, v in params:
        if k in ('select', 'order', 'limit', 'on_conflict', 'offset'): continue
        op, _, val = v.partition('.')
        val = unquote(val)
        def ok(r, k=k, op=op, val=val):
            x = r.get(k)
            if op == 'eq': return str(x).lower() == val.lower() if isinstance(x, bool) else str(x) == val
            if op == 'neq': return str(x) != val
            if op == 'in': return str(x) in val.strip('()').split(',')
            if op == 'gte': return x is not None and str(x) >= val
            if op == 'is': return x is None if val == 'null' else True
            return True
        out = [r for r in out if ok(r)]
    return out

def projeter(table, r, select):
    r = dict(r)
    if select and 'eleves(' in select:
        e = next((x for x in DB['eleves'] if x['id'] == r.get('eleve_id')), None)
        r['eleves'] = {'pseudo': e['pseudo'], 'classe_id': e['classe_id']} if e else None
    if select and select != '*' and 'eleves(' not in select:
        cols = [c.strip() for c in select.split(',')]
        r = {c: r.get(c) for c in cols}
    return r

def gerer(route, request):
    u = urlparse(request.url)
    params = parse_qsl(u.query, keep_blank_values=True)
    meth = request.method
    JOURNAL.append((meth, u.path, u.query, request.post_data))
    cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*', 'Content-Type': 'application/json'}
    if meth == 'OPTIONS': return route.fulfill(status=204, headers=cors)
    rep = lambda corps, st=200: route.fulfill(status=st, headers=cors, body=json.dumps(corps))
    if u.path.startswith('/functions/v1/emc-cartes'):
        # la fonction Edge (034) : n cartes, préfixe a, jeton du prof exigé
        corps = json.loads(request.post_data or '{}')
        if not (request.headers.get('authorization') or '').startswith('Bearer '): return rep({'erreur': 'JETON_ABSENT'}, 401)
        faites = []
        for i in range(int(corps['nombre'])):
            ident = 'a-loutre-%02d' % (len(DB['emc_cartes']) + 1)
            e = str(uuid.uuid4())
            DB['eleves'].append({'id': e, 'pseudo': ident, 'classe_id': corps['classe_id']})
            DB['emc_cartes'].append({'identifiant': ident, 'classe_id': corps['classe_id'], 'eleve_id': e, 'code': '%04d' % (1234 + i)})
            faites.append({'identifiant': ident, 'code': '%04d' % (1234 + i)})
        return rep({'cartes': faites, 'ratees': 0, 'libelle': 'x'})
    if u.path.startswith('/auth/v1/token'):
        return rep({'access_token': jwt(MOI), 'refresh_token': 'r2', 'expires_at': int(time.time()) + 3600, 'expires_in': 3600})
    if u.path.startswith('/rest/v1/rpc/'):
        f = u.path.split('/')[-1]
        corps = json.loads(request.post_data or '{}')
        if f == 'est_enseignant': return rep(True)
        if f == 'emc_cloturer':
            n = len([a for a in DB['emc_aide'] if a['classe_id'] == corps['p_classe']])
            DB['emc_aide'] = [a for a in DB['emc_aide'] if a['classe_id'] != corps['p_classe']]
            for s in DB['emc_seances']:
                if s['classe_id'] == corps['p_classe']: s['cloturee_le'] = iso()
            return rep(n)
        if f == 'emc_supprimer_comptes': return rep(9)
        if f == 'emc_reinitialiser':
            for s in DB['emc_seances']:
                if s['classe_id'] == corps['p_classe']: s.update({'etape': 0, 'cloturee_le': None})
            return route.fulfill(status=204, headers=cors, body='')
        return rep(None)
    t = u.path.replace('/rest/v1/', '')
    if t == 'enseignants': return rep([{'libelle': 'VAN HOORDE'}])
    if t not in DB: return rep([])
    sel = dict(params).get('select')
    if meth == 'GET':
        l = filtrer(DB[t], params)
        if 'limit' in dict(params): l = l[: int(dict(params)['limit'])]
        return rep([projeter(t, r, sel) for r in l])
    if meth == 'POST':
        corps = json.loads(request.post_data or '[]')
        for r in (corps if isinstance(corps, list) else [corps]):
            r.setdefault('maj_le', iso())
            cles = PK.get(t, ['id'])
            ex = next((x for x in DB[t] if all(x.get(k) == r.get(k) for k in cles)), None)
            if ex: ex.update(r)
            else: DB[t].append(r)
        return route.fulfill(status=201, headers=cors, body='')
    if meth == 'PATCH':
        corps = json.loads(request.post_data or '{}')
        for r in filtrer(DB[t], params): r.update(corps); r['maj_le'] = iso()
        return route.fulfill(status=204, headers=cors, body='')
    if meth == 'DELETE':
        garde = filtrer(DB[t], params)
        DB[t] = [r for r in DB[t] if r not in garde]
        return route.fulfill(status=204, headers=cors, body='')
    return rep([])

BOUCHON_SUPABASE = """
window.supabase = { createClient: function () {
  return { realtime: { setAuth: function () {} },
    channel: function () { var c = { on: function () { return c; },
      subscribe: function (cb) { setTimeout(function () { cb && cb('TIMED_OUT'); }, 50); return c; } }; return c; },
    removeChannel: function () {} };
} };
"""

YOUTUBE = []

def contexte(nav, larg, haut, noms=True):
    ctx = nav.new_context(viewport={'width': larg, 'height': haut}, accept_downloads=True)
    ctx.route(SUPA + '/**', gerer)
    # la vidéo de l'étape 5 : servie vide, rien ne part chez YouTube
    ctx.route('https://www.youtube-nocookie.com/**', lambda r, q: (YOUTUBE.append(q.url), r.fulfill(status=200, body='<!doctype html><title>yt</title>', headers={'Content-Type': 'text/html'})))
    ctx.route('**/vendor/supabase-js-2.45.4.min.js', lambda r, q: r.fulfill(status=200, body=BOUCHON_SUPABASE, headers={'Content-Type': 'application/javascript'}))
    stocke = {'access_token': jwt(MOI), 'refresh_token': 'r1', 'expires_at': int(time.time() * 1000) + 3600_000,
              'ouverte': int(time.time() * 1000), 'noms': ({p: 'Élève%s TEST' % chr(65 + i) for i, p in enumerate(PSEUDOS[:8])} if noms else {}), 'nomsFichier': 'test.csv'}
    ctx.add_init_script("try{localStorage.setItem('snt.prof', %s)}catch(e){}" % json.dumps(json.dumps(stocke)))
    return ctx

def suivre(page, nom):
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'favicon' not in m.text else None)
    return errs

def capture(page, nom): page.screenshot(path=os.path.join(CAPT, nom + '.png'), full_page=False)

with sync_playwright() as pw:
    nav = pw.chromium.launch()
    for (larg, haut, suff) in [(1280, 800, ''), (1024, 768, '-ipad')]:
        # ---------- 1. tableau de bord ----------
        ctx = contexte(nav, larg, haut); page = ctx.new_page(); errs = suivre(page, 'bord')
        page.goto(BASE + '/prof/index.html'); page.wait_for_timeout(1500)
        # la fenêtre « ✨ Nouveautés » (038) s'ouvre à la connexion : on la ferme
        page.evaluate("document.querySelectorAll('dialog[open]').forEach(function (d) { d.close(); })")
        cartes =page.locator('#liste-espaces .espace')
        verif('accueil : 2 espaces (SNT, EMC)' + suff, cartes.count() == 2, cartes.count())
        verif('accueil : carte EMC' + suff, page.locator('#liste-espaces .espace', has_text='EMC seconde').count() == 1)
        capture(page, '01-bord-accueil' + suff)
        page.locator('#liste-espaces .espace', has_text='EMC seconde').click(); page.wait_for_timeout(1200)
        verif('onglet EMC visible' + suff, page.locator('nav.onglets button[data-onglet=emc]').is_visible())
        verif('onglet À corriger masqué en EMC' + suff, not page.locator('nav.onglets button[data-onglet=correction]').is_visible())
        verif('4 créneaux listés' + suff, page.locator('#p-emc .emc-creneau').count() == 4, page.locator('#p-emc .emc-creneau').count())
        verif('NINA27 : 12 présents' + suff, '12présents' in page.locator('#p-emc .emc-creneau').first.inner_text().replace('\n', ''))
        capture(page, '02-bord-emc' + suff)
        page.click('#btn-espaces'); page.wait_for_timeout(300)
        page.locator('#liste-espaces .espace', has_text='SNT').first.click(); page.wait_for_timeout(1200)
        verif('SNT intact : onglet À corriger visible' + suff, page.locator('nav.onglets button[data-onglet=correction]').is_visible())
        verif('SNT : onglet EMC masqué' + suff, not page.locator('nav.onglets button[data-onglet=emc]').is_visible())
        verif('tableau de bord sans erreur JS' + suff, not errs, errs[:3])
        ctx.close()

        # ---------- 2. pilotage ----------
        DB['emc_aide'] = []; DB['emc_mots_masques'] = []
        ctx = contexte(nav, larg, haut); page = ctx.new_page(); errs = suivre(page, 'pilotage')
        page.goto(BASE + '/prof/emc.html?classe=NINA27'); page.wait_for_timeout(2000)
        verif('pilotage : titre' + suff, 'créneau 1' in page.inner_text('#titre'))
        verif('pilotage : 10 prêts / 12' + suff, page.inner_text('#n-prets') == '10' and page.inner_text('#n-tous') == '12', (page.inner_text('#n-prets'), page.inner_text('#n-tous')))
        capture(page, '03-pilotage-seance' + suff)
        n0 = len(JOURNAL)
        page.locator('#frise button').nth(2).click(); page.wait_for_timeout(500)
        patch = [j for j in JOURNAL[n0:] if j[0] == 'PATCH' and j[1].endswith('/emc_seances')]
        verif('changer d\'étape → PATCH etape 2' + suff, patch and json.loads(patch[-1][3]) == {'etape': 2}, patch)
        page.click('#btn-avancer'); page.wait_for_timeout(400)
        verif('avancer → étape 3, rappel fiche' + suff, 'fiche papier' in page.inner_text('#rappels'))
        # alerte d'aide : arrive par relecture
        t0 = time.time()
        DB['emc_aide'].append({'id': str(uuid.uuid4()), 'classe_id': C1, 'eleve_id': eleves[2]['id'], 'cases': ["J'aimerais parler à un adulte"],
                               'message': 'Je voudrais en parler', 'statut': 'a_traiter', 'cree_le': iso()})
        page.wait_for_selector('#alerte-aide:not([hidden]) .aide-item', timeout=6000)
        dt = time.time() - t0
        verif('alerte d\'aide en moins de 3 s (%.1f s)' % dt + suff, dt < 3, dt)
        txt = page.inner_text('#alerte-aide')
        verif('alerte : nom de la table des noms + TABLE' + suff, 'ÉlèveC TEST' in txt and 'TABLE 3' in txt, txt[:200])
        capture(page, '04-pilotage-alerte' + suff)
        n0 = len(JOURNAL)
        page.click('#alerte-aide .aide-item button.primaire'); page.wait_for_timeout(400)
        p = [j for j in JOURNAL[n0:] if j[0] == 'PATCH' and j[1].endswith('/emc_aide')]
        verif('pris en charge → PATCH statut' + suff, p and json.loads(p[-1][3]) == {'statut': 'pris_en_charge'}, p)
        for o in ['cartes', 'participants', 'mots', 'missions', 'carte', 'harcelometre', 'enquete', 'exports', 'cloture']:
            page.click('#onglets button[data-onglet=%s]' % o); page.wait_for_timeout(700 if o == 'carte' else 300)
            capture(page, '05-pilotage-%s' % o + suff)
        page.click('#onglets button[data-onglet=participants]'); page.wait_for_timeout(200)
        verif('participants : 12 lignes' + suff, page.locator('#t-participants tr').count() == 12)
        verif('participants : badge carte' + suff, page.locator('#t-participants', has_text='🎟 carte').count() == 1)
        verif('participants : signal sans nom' + suff, 'absent(s) de la table des noms' in page.inner_text('#signaux'))
        n0 = len(JOURNAL)
        page.locator('#t-participants select').first.select_option('8'); page.wait_for_timeout(400)
        verif('réattribuer → PATCH table_num' + suff, any(j[0] == 'PATCH' and j[1].endswith('/emc_participants') and json.loads(j[3]) == {'table_num': 8} for j in JOURNAL[n0:]))
        page.click('#onglets button[data-onglet=mots]'); page.wait_for_timeout(200)
        n0 = len(JOURNAL)
        page.locator('#nuage button', has_text='insulte').click(); page.wait_for_timeout(500)
        verif('masquer un mot → POST emc_mots_masques' + suff, any(j[0] == 'POST' and j[1].endswith('/emc_mots_masques') and json.loads(j[3])['mot'] == 'insulte' for j in JOURNAL[n0:]), [(j[0], j[1], j[3]) for j in JOURNAL[n0:] if j[0] != 'GET'])
        page.click('#onglets button[data-onglet=harcelometre]'); page.wait_for_timeout(200)
        n0 = len(JOURNAL)
        page.locator('#situations button').first.click(); page.wait_for_timeout(500)
        p = [json.loads(j[3]) for j in JOURNAL[n0:] if j[0] == 'PATCH' and j[1].endswith('/emc_seances')]
        verif('ouvrir une situation → étape 6, s10' + suff, p and p[-1] == {'etape': 6, 'situation_courante': 's10', 'situation_revelee': False}, p)
        page.wait_for_timeout(300)
        verif('harcèlomètre : votants 12 / 10' + suff, 'Votants 12 / 10' in page.inner_text('#hm-viz').replace('\n', ' '), page.inner_text('#hm-viz')[-80:])
        verif('harcèlomètre : tous les prêts ont voté' + suff, page.is_visible('#hm-tous'))
        page.click('#hm-reveler'); page.wait_for_timeout(400)
        verif('révéler : zone attendue affichée' + suff, 'Zone attendue' in page.inner_text('#hm-revele'))
        verif('révéler (042) : la loi au pilotage' + suff, 'Ce qu\'on risque' in page.inner_text('#hm-revele') and page.locator('#hm-revele details .v-reperes').count() == 1)
        capture(page, '06-pilotage-hm-revele' + suff)
        # exports
        page.click('#onglets button[data-onglet=exports]')
        for b, nomf in [('#x-mots', 'nuage-emotions.pdf'), ('#x-hm', 'harcelometre.pdf'), ('#x-carte-png', 'carte-mentale.png'), ('#x-tout', 'resultats.pdf')]:
            page.click(b)
            try:
                page.wait_for_selector('a[data-export$="%s"]' % nomf, timeout=60000)
                taille = page.evaluate("fetch(document.querySelector('a[data-export$=\"%s\"]').href).then(r=>r.blob()).then(b=>b.size)" % nomf)
                verif('export %s (%d Ko)' % (nomf, taille // 1024) + suff, taille > 2000, taille)
            except Exception as e:
                verif('export %s' % nomf + suff, False, page.inner_text('.modale')[:200])
            if nomf == 'resultats.pdf': capture(page, '07-pilotage-export' + suff)
            page.locator('.modale button', has_text='Fermer').click(); page.wait_for_timeout(200)
        # clôture
        page.on('dialog', lambda d: d.accept())
        # cartes (034) : générer, puis la planche à imprimer
        page.click('#onglets button[data-onglet=cartes]'); page.wait_for_timeout(300)
        DB['emc_cartes'] = [c for c in DB['emc_cartes'] if c['classe_id'] != C1]
        page.fill('#p-cartes input[type=number]', '12')
        n0 = len(JOURNAL)
        page.locator('#p-cartes button', has_text='Générer').click(); page.wait_for_timeout(900)
        appel = [j for j in JOURNAL[n0:] if j[1].startswith('/functions/v1/emc-cartes')]
        verif('cartes : la fonction Edge est appelée avec la classe et le nombre' + suff, appel and json.loads(appel[-1][3]) == {'classe_id': C1, 'nombre': 12}, appel)
        verif('cartes : 12 créées, listées' + suff, '12 carte(s) créée(s)' in page.inner_text('#p-cartes') and page.locator('#p-cartes .liste-cartes .pastille').count() == 12,
              page.inner_text('#p-cartes')[:300])
        capture(page, '05-pilotage-cartes-generees' + suff)
        p2 = ctx.new_page(); e2 = suivre(p2, 'cartes')
        p2.goto(BASE + '/prof/emc-cartes.html?classe=NINA27'); p2.wait_for_timeout(1500)
        verif('planche : 12 cartes, 2 feuilles de 10' + suff, p2.locator('.carte:not(.vide)').count() == 12 and p2.locator('.planche').count() == 2)
        verif('planche : un QR code par carte' + suff, p2.locator('.carte .qr svg').count() == 12)
        verif('planche : identifiant et code sur la carte' + suff, 'a-loutre-01' in p2.inner_text('.carte >> nth=0') and '1234' in p2.inner_text('.carte >> nth=0'))
        verif('correspondance : identifiants déjà écrits' + suff, p2.locator('.corresp td.ident').count() == 12)
        qr = p2.evaluate("(() => { var s = document.querySelector('.carte .qr svg'); return s ? s.outerHTML.length : 0; })()")
        verif('planche : QR code non vide' + suff, qr > 500, qr)
        p2.screenshot(path=os.path.join(CAPT, '05b-planche-cartes' + suff + '.png'), full_page=True)
        verif('planche sans erreur JS' + suff, not e2, e2[:3])
        p2.close()
        # clôture, remise à zéro, comptes
        page.click('#onglets button[data-onglet=cloture]')
        page.locator('#p-cloture button', has_text='Compter').click(); page.wait_for_timeout(400)
        verif('compter les comptes EMC' + suff, '9 compte' in page.inner_text('#p-cloture'))
        page.locator('#p-cloture button', has_text='Clôturer cette séance').click(); page.wait_for_timeout(600)
        verif('clôture : messages effacés' + suff, 'clôturée' in page.inner_text('#p-cloture'), page.inner_text('#p-cloture')[:200])
        n0 = len(JOURNAL)
        page.locator('#p-cloture button', has_text='Remettre à zéro').click(); page.wait_for_timeout(600)
        verif('remise à zéro → emc_reinitialiser' + suff, any(j[1].endswith('/rpc/emc_reinitialiser') for j in JOURNAL[n0:]) and 'remise à zéro' in page.inner_text('#p-cloture'))
        verif('pilotage sans erreur JS' + suff, not errs, errs[:3])
        ctx.close()
        for s in DB['emc_seances']: s['cloturee_le'] = None

        # ---------- 3. projection ----------
        DB['emc_aide'] = [{'id': str(uuid.uuid4()), 'classe_id': C1, 'eleve_id': eleves[4]['id'], 'cases': [], 'message': 'SECRET-AIDE', 'statut': 'a_traiter', 'cree_le': iso()}]
        ctx = contexte(nav, larg, haut); page = ctx.new_page(); errs = suivre(page, 'projection')
        seance = next(s for s in DB['emc_seances'] if s['classe_id'] == C1)
        n0 = len(JOURNAL)
        for n in range(8):
            seance.update({'etape': n, 'situation_courante': 's10' if n == 6 else seance['situation_courante'], 'situation_revelee': n == 6})
            page.goto(BASE + '/prof/emc-projection.html?classe=NINA27'); page.wait_for_timeout(2200 if n == 4 else 1300)
            dom = page.content()
            fuite = [p for p in PSEUDOS if p in dom] + [x for x in ['TEST', 'SECRET-AIDE'] if x in dom]
            verif('projection étape %d : aucun pseudo, nom ni aide' % n + suff, not fuite, fuite)
            capture(page, '08-projection-etape%d' % n + suff)
            if n == 6:
                verif('projection étape 6 révélée (042) : tuile de la loi à côté du harcèlomètre' + suff,
                      page.locator('.p-zone.principal [data-bloc=hm-loi] .v-loi').count() == 1 and page.locator('[data-bloc=harcelometre]').count() == 1)
                verif('projection étape 6 révélée (042) : repères en rappel' + suff, page.locator('[data-bloc=hm-reperes]').count() == 1)
            if n == 7:
                verif('projection étape 7 (042) : plus de tuile loi, repères en rappel' + suff,
                      page.locator('[data-bloc=hm-loi]').count() == 0 and page.locator('[data-bloc=hm-reperes]').count() == 1)
            if n == 5:
                src = page.get_attribute('.video-yt iframe', 'src') or ''
                verif('projection étape 5 : vidéo YouTube par youtube-nocookie' + suff, src.startswith('https://www.youtube-nocookie.com/embed/'), src)
                verif('projection étape 5 : numéros détaillés' + suff, page.locator('.numeros-details > div').count() >= 4)
            if n in (2, 3):
                # sobres (11/11) : 8 cartes, verbe + mission ; les questions au toucher seulement
                verif('projection étape %d : 8 missions, sans leurs questions' % n + suff, page.locator('.missions-proj .m').count() == 8 and page.locator('.missions-proj li').count() == 0)
                page.locator('.missions-proj .m').first.click(); page.wait_for_timeout(200)
                verif('projection étape %d : questions au toucher' % n + suff, page.locator('.modale-mission li').count() >= 1)
                page.keyboard.press('Escape')
                deb = page.evaluate("(() => { var s = document.getElementById('scene'); return s.scrollHeight - s.clientHeight + document.documentElement.scrollHeight - innerHeight; })()")
                verif("projection étape %d : tient dans l'écran" % n + suff, deb <= 2, deb)
        verif('projection : étape 0 code + QR' + suff, True)
        req = [j for j in JOURNAL[n0:] if '/emc_aide' in j[1] or j[1].endswith('/eleves') or 'eleves(' in unquote(j[2] or '')]
        verif('projection : aucune requête vers emc_aide ni eleves' + suff, not req, req[:3])
        verif('projection sans erreur JS' + suff, not errs, errs[:3])
        ctx.close()

        # ---------- 4. contenus ----------
        ctx = contexte(nav, larg, haut); page = ctx.new_page(); errs = suivre(page, 'contenus')
        page.goto(BASE + '/prof/emc-contenus.html'); page.wait_for_timeout(1500)
        verif('contenus : 13 sections (Labyrinthe, jeu de rôle, restitution)' + suff, page.locator('details.sec').count() == 13)
        capture(page, '09-contenus' + suff)
        sec = page.locator('details.sec[data-cle=harcelometre]')
        sec.locator('summary').click()
        item = sec.locator('.item').first
        item.locator('button', has_text='Modifier').click()
        item.locator('textarea').first.fill('Faire une blague, une fois — MODIFIÉE')
        sec.locator('button', has_text='+ Ajouter').first.click()
        nouv = sec.locator('.item').nth(23)
        nouv.locator('textarea').first.fill('Situation ajoutée par le banc')
        verif('contenus : marqué modifié' + suff, sec.locator('.modifie').is_visible())
        capture(page, '10-contenus-hm' + suff)
        n0 = len(JOURNAL)
        sec.locator('button[data-enregistrer]').click(); page.wait_for_timeout(600)
        post = [j for j in JOURNAL[n0:] if j[0] == 'POST' and j[1].endswith('/emc_contenus')]
        ok_post = False
        if post:
            c = json.loads(post[-1][3]); sits = c['valeur']['situations']
            ok_post = c['cle'] == 'harcelometre' and 'on_conflict=cle' in post[-1][2] and sits[0]['texte'].endswith('MODIFIÉE') \
                and sits[-1]['id'] == 's24' and sits[-1]['texte'] == 'Situation ajoutée par le banc' and len(sits) == 24
        verif('contenus : POST conforme (modif + ajout s24)' + suff, ok_post, post[-1][3][:200] if post else None)
        verif('contenus : enregistré' + suff, 'Enregistré' in sec.inner_text())
        # validation : champ requis vide refusé
        sec2 = page.locator('details.sec[data-cle=aide]'); sec2.locator('summary').click()
        sec2.locator('input').first.fill('')
        n0 = len(JOURNAL)
        sec2.locator('button[data-enregistrer]').click(); page.wait_for_timeout(300)
        verif('contenus : champ requis vide refusé' + suff, not [j for j in JOURNAL[n0:] if j[0] == 'POST'] and 'à remplir' in sec2.inner_text())
        verif('contenus sans erreur JS' + suff, not errs, errs[:3])
        ctx.close()
        DB['emc_contenus'] = json.loads(CONTENUS0)
    nav.close()

print('%d contrôles réussis, %d en échec.' % (OK[0], len(KO)))
srv.shutdown()
sys.exit(1 if KO else 0)
