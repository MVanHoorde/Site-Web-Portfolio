# -*- coding: utf-8 -*-
"""
emc-accueil.test.py — banc du jeu de rôle « Je m'appelle… » (034)

Les vraies pages (emc/index.html côté élève, prof/emc-accueil.html en
pilotage et en projection), servies depuis le dépôt, contre une FAUSSE
base Supabase en mémoire interceptée par Playwright. supabase-js est
bouchonné (le direct échoue : tout passe par la relecture).

Deux élèves d'un même binôme (deux tablettes), plus 29 camarades
virtuels de 10 classes d'origine. On déroule les 9 étapes et on
contrôle surtout :
  · 🔴 aucune NOTE de l'échange ne quitte la tablette (toutes les
    requêtes sont inspectées), et les notes sont effacées à l'étape 8 ;
  · la projection n'affiche jamais un identifiant ;
  · le choix des questions respecte 6 à 8, une par thème ;
  · le binôme est retrouvé après une reconnexion.

Usage :
    python -X utf8 _outils/tests/emc-accueil.test.py <racine-du-dépôt> [dossier-captures]
"""
import json, re, sys, threading, time, uuid, base64, os, functools, http.server, socketserver, random
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qsl, unquote
from playwright.sync_api import sync_playwright

DEPOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
CAPT = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.join(__import__('tempfile').gettempdir(), 'emc-banc-accueil'))
os.makedirs(CAPT, exist_ok=True)
SUPA = 'https://ztyvuiaohxekuyjeoaxz.supabase.co'
PORT = 8773
ok = ko = 0
def verif(nom, cond, detail=None):
    global ok, ko
    if cond: ok += 1
    else:
        ko += 1; print('ÉCHEC :', nom, '' if detail is None else str(detail)[:300])
def iso(): return datetime.now(timezone.utc).isoformat(timespec='microseconds')

# ---------------------------------------------------------------- contenus
CONTENUS = {}
for f in ['031-emc.sql', '033-emc-contenus.sql', '034-emc-six-seances.sql']:
    s = open(os.path.join(DEPOT, 'bdd/schema', f), encoding='utf-8').read()
    for cle, js in re.findall(r"\('([a-z_]+)', \$j\$(.*?)\$j\$::jsonb\)", s, re.S):
        CONTENUS[cle] = json.loads(js)
assert 'jdr' in CONTENUS and 'etapes_accueil' in CONTENUS

# ---------------------------------------------------------------- fausse base
CL = 'c-jdr'
PROF = 'u-prof'
SECRET = 'SECRET-NOTE-PHOBIE-ARAIGNEES'

def jwt(sub):
    b = lambda d: base64.urlsafe_b64encode(json.dumps(d).encode()).decode().rstrip('=')
    return b({'alg': 'HS256'}) + '.' + b({'sub': sub, 'role': 'authenticated', 'exp': 9999999999}) + '.' + uuid.uuid4().hex[:8]

class Base:
    def __init__(self):
        self.users = {}      # email → (uid, mdp)
        self.jetons = {}     # jeton → uid
        self.refresh = {}
        self.eleves = {}     # uid → eleve
        self.t = {'emc_contenus': [{'cle': k, 'valeur': v} for k, v in CONTENUS.items()],
                  'emc_seances': [{'classe_id': CL, 'etape': 0, 'module': 'accueil', 'prefixe': 'd', 'etat': {}, 'cloturee_le': None,
                                   'situation_courante': None, 'situation_revelee': False, 'carte_figee': False, 'zones_verrouillees': [], 'maj_le': iso()}],
                  'emc_participants': [], 'emc_jdr': [], 'emc_binomes': [], 'emc_mur': [], 'emc_aide': [],
                  'classes': [{'id': CL, 'code': 'JDRD12', 'libelle': 'Groupe D · jeudi 12/11, 8 h 30 – 10 h 10 · Accueil', 'espace': 'emc'}]}
        self.requetes = []   # (méthode, url, corps)
        # deux cartes jouées par deux tablettes
        for ident, code in [('d-renard-01', '1111'), ('d-loutre-02', '2222')]:
            self.carte(ident, code)
        # 29 camarades virtuels, déjà entrés, classe d'origine 1..10
        for i in range(29):
            uid = 'u-cam-%02d' % i
            e = {'id': 'e-cam-%02d' % i, 'pseudo': 'd-cam-%02d' % i}
            self.eleves[uid] = e
            self.t['emc_participants'].append({'classe_id': CL, 'eleve_id': e['id'], 'table_num': 1, 'pret': True, 'entre_le': iso()})
            self.t['emc_jdr'].append({'classe_id': CL, 'eleve_id': e['id'], 'origine': i % 10 + 1, 'questions': [], 'feux': {}, 'reconnu': None, 'maj_le': iso()})
    def carte(self, ident, code):
        uid = 'u-' + ident
        self.users[ident + '@emc.local'] = (uid, 'Emc-' + code)
        self.eleves[uid] = {'id': 'e-' + ident, 'pseudo': ident}
    def jeton(self, uid):
        t = jwt(uid); r = 'r-' + uuid.uuid4().hex
        self.jetons[t] = uid; self.refresh[r] = uid
        email = next((k for k, v in self.users.items() if v[0] == uid), None)
        return {'access_token': t, 'refresh_token': r, 'expires_in': 3600, 'user': {'id': uid, 'email': email}}
    def seance(self): return self.t['emc_seances'][0]
    def binome_de(self, eid):
        b = next((x for x in self.t['emc_binomes'] if x['eleve_id'] == eid), None)
        return b and b['binome']

    def gerer(self, route):
        req = route.request
        cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*', 'Content-Type': 'application/json'}
        if req.method == 'OPTIONS': return route.fulfill(status=204, headers=cors)
        rep = lambda corps=None, st=200: route.fulfill(status=st, headers=cors, body='' if corps is None else json.dumps(corps))
        err = lambda st, msg: rep({'code': 'P0001', 'message': msg}, st)
        u = urlparse(req.url); q = parse_qsl(u.query, keep_blank_values=True); p = u.path
        corps = json.loads(req.post_data) if req.post_data else None
        self.requetes.append((req.method, req.url, req.post_data or ''))
        a = req.headers.get('authorization', '')
        uid = self.jetons.get(a[7:]) if a.startswith('Bearer ') else None
        prof = uid == PROF
        e = self.eleves.get(uid)
        if p.startswith('/auth/v1/token'):
            g = dict(q).get('grant_type')
            if g == 'password':
                us = self.users.get(corps['email'])
                if not us or us[1] != corps['password']: return rep({'error_code': 'invalid_credentials'}, 400)
                return rep(self.jeton(us[0]))
            if g == 'refresh_token':
                x = self.refresh.pop(corps.get('refresh_token'), None)
                return rep(self.jeton(x)) if x else rep({'error_code': 'refresh_token_not_found'}, 400)
        if p.startswith('/auth/v1/logout'): return rep(None, 204)
        if p.startswith('/rest/v1/rpc/'):
            f = p.split('/')[-1]; c = corps or {}
            if f == 'est_enseignant': return rep(prof)
            if f == 'emc_entrer':
                if not e: return err(400, 'PAS_ENCORE_INSCRIT')
                pa = next((x for x in self.t['emc_participants'] if x['eleve_id'] == e['id']), None)
                if not pa:
                    pa = {'classe_id': CL, 'eleve_id': e['id'], 'table_num': 1, 'pret': False, 'entre_le': iso()}
                    self.t['emc_participants'].append(pa)
                return rep({'classe_id': CL, 'libelle': self.t['classes'][0]['libelle'], 'table_num': 1, 'nouveau': True, 'etape': self.seance()['etape']})
            if f == 'emc_pret':
                pa = next(x for x in self.t['emc_participants'] if x['eleve_id'] == e['id']); pa['pret'] = c['p_pret']; return rep(None, 204)
            if f == 'emc_jdr_tirer' and prof:
                if c.get('p_tout'): self.t['emc_binomes'] = []
                places = {b['eleve_id'] for b in self.t['emc_binomes']}
                orig = {j['eleve_id']: j['origine'] for j in self.t['emc_jdr']}
                ids = [x['eleve_id'] for x in self.t['emc_participants'] if x['eleve_id'] not in places]
                # les deux tablettes ensemble (le banc les veut dans le même binôme), les autres par le même principe que le SQL
                tablettes = [i for i in ids if i in ('e-d-renard-01', 'e-d-loutre-02')]
                autres = sorted([i for i in ids if i not in tablettes], key=lambda i: (orig.get(i) or 0, random.random()))
                num = max([b['binome'] for b in self.t['emc_binomes']] or [0])
                sym = CONTENUS['jdr']['symboles']
                paires = [tablettes] if len(tablettes) == 2 else []
                h = len(autres) // 2
                paires += [[autres[i], autres[i + h]] for i in range(h)]
                for pr in paires:
                    num += 1
                    for x in pr: self.t['emc_binomes'].append({'classe_id': CL, 'eleve_id': x, 'binome': num, 'symbole': sym[(num - 1) % len(sym)]})
                if len(autres) % 2:
                    self.t['emc_binomes'].append({'classe_id': CL, 'eleve_id': autres[-1], 'binome': 2, 'symbole': sym[1]})
                return rep(len(ids))
            if f == 'emc_jdr_echanger' and prof: return rep(None, 204)
            return err(404, 'rpc ' + f)
        t = p.replace('/rest/v1/', '')
        if t == 'enseignants': return rep([{'libelle': 'VAN HOORDE'}] if prof else [])
        if t not in self.t: return rep([])
        filtres = [(k, unquote(v)) for k, v in q if k not in ('select', 'order', 'on_conflict', 'limit')]
        def garde(r):
            for k, v in filtres:
                op, _, val = v.partition('.')
                if op == 'eq' and str(r.get(k)) != val: return False
                if op == 'in' and str(r.get(k)) not in val.strip('()').split(','): return False
            return True
        def visible(r):
            if prof or t in ('emc_contenus', 'emc_seances', 'classes'): return True
            if not e: return False
            if t in ('emc_participants', 'emc_mur'): return r['eleve_id'] == e['id']
            if t in ('emc_jdr', 'emc_binomes'):
                return r['eleve_id'] == e['id'] or (self.binome_de(e['id']) is not None and self.binome_de(r['eleve_id']) == self.binome_de(e['id']))
            return False
        sel = dict(q).get('select', '*')
        if req.method == 'GET':
            res = []
            for r in self.t[t]:
                if not (garde(r) and visible(r)): continue
                r = dict(r)
                if 'eleves(' in sel:
                    ee = next((x for x in self.eleves.values() if x['id'] == r['eleve_id']), None)
                    r['eleves'] = {'pseudo': ee['pseudo']} if ee else None
                res.append(r)
            return rep(res)
        if req.method == 'POST':
            items = corps if isinstance(corps, list) else [corps]
            cles = (dict(q).get('on_conflict') or '').split(',') if dict(q).get('on_conflict') else None
            for it in items:
                if not prof and (not e or it.get('eleve_id') != e['id']) and t != 'emc_aide':
                    return rep({'code': '42501', 'message': 'row-level security'}, 403)
                if t == 'emc_mur' and 'statut' in it: return rep({'code': '42501', 'message': 'permission denied'}, 403)
                it = dict(it); it['maj_le'] = iso()
                if t == 'emc_mur': it.setdefault('statut', 'propose')
                if t == 'emc_aide': it.update({'id': str(uuid.uuid4()), 'statut': 'a_traiter', 'cree_le': iso()})
                ancien = next((r for r in self.t[t] if cles and all(r.get(k) == it.get(k) for k in cles)), None)
                if ancien:
                    if t == 'emc_mur' and ancien['statut'] != 'propose': return rep({'code': '42501', 'message': 'row-level security'}, 403)
                    ancien.update(it)
                else: self.t[t].append(it)
            return rep(None, 201)
        if req.method == 'PATCH':
            for r in self.t[t]:
                if garde(r) and (prof or (e and r.get('eleve_id') == e['id'])):
                    r.update(corps); r['maj_le'] = iso()
            return rep(None, 204)
        return rep([])

BOUCHON_SUPABASE = """
window.supabase = { createClient: function () { return {
  realtime: { setAuth: function () {} },
  channel: function () { var c = { on: function () { return c; },
    subscribe: function (cb) { setTimeout(function () { cb('CHANNEL_ERROR'); }, 10); return c; } }; return c; },
  removeChannel: function () {} }; } };
"""

class Silencieux(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
def servir():
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Silencieux, directory=DEPOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv

def main():
    srv = servir(); base = Base(); URL = 'http://127.0.0.1:%d' % PORT
    erreurs = []
    with sync_playwright() as pw:
        nav = pw.chromium.launch()
        def contexte(larg=1024, haut=768, prof=False):
            ctx = nav.new_context(viewport={'width': larg, 'height': haut}, has_touch=not prof)
            ctx.route(SUPA + '/**', base.gerer)
            ctx.route('**/assets/js/vendor/supabase-js-2.45.4.min.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=BOUCHON_SUPABASE))
            if prof:
                t = jwt(PROF); base.jetons[t] = PROF
                st = {'access_token': t, 'refresh_token': 'r', 'expires_at': int(time.time() * 1000) + 3600_000, 'ouverte': int(time.time() * 1000),
                      'noms': {'d-renard-01': 'Élève RENARD', 'd-loutre-02': 'Élève LOUTRE'}, 'nomsFichier': 't.csv'}
                ctx.add_init_script("try{localStorage.setItem('snt.prof', %s)}catch(e){}" % json.dumps(json.dumps(st)))
            return ctx
        def suivre(page, nom):
            page.on('pageerror', lambda x: erreurs.append(nom + ' pageerror: ' + str(x)))
            page.on('console', lambda m: erreurs.append(nom + ' console: ' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
        def etape(page, n, delai=9000):
            try:
                page.wait_for_function('n => { var t = document.querySelector(".etape-titre .num"); return t && t.textContent === "Étape " + n; }', arg=n, timeout=delai)
                return True
            except Exception: return False
        def poser(n, **etat):
            s = base.seance(); s['etape'] = n
            if etat: s['etat'] = dict(s.get('etat') or {}, **etat)
            s['maj_le'] = iso()
        def cap(page, nom): page.screenshot(path=os.path.join(CAPT, nom + '.png'), full_page=True)

        # ---------- deux tablettes ----------
        cA = contexte(); A = cA.new_page(); suivre(A, 'A')
        cB = contexte(768, 1024); B = cB.new_page(); suivre(B, 'B')
        A.goto(URL + '/emc/index.html?carte=d-renard-01&k=1111')
        B.goto(URL + '/emc/index.html'); B.wait_for_selector('.porte')
        B.fill('#p-id', 'd-loutre-02'); B.fill('#p-code', '2222'); B.click('text=Entrer')
        verif('A entre par le QR code', etape(A, 0))
        verif('B entre en tapant sa carte', etape(B, 0))
        verif('titre du jeu de rôle', 'Je m\'appelle' in A.inner_text('#scene'))
        verif('pas de « Je suis prêt » avant la classe d\'origine', A.locator('#scene button.pret-geant').count() == 0)
        A.locator('.origines button', has_text='2nde 3').click(); A.wait_for_timeout(300)
        B.locator('.origines button', has_text='2nde 7').click(); B.wait_for_timeout(300)
        A.wait_for_selector('#scene button.pret-geant'); A.click('#scene button.pret-geant')
        B.wait_for_selector('#scene button.pret-geant'); B.click('#scene button.pret-geant')
        A.wait_for_timeout(1200)
        ja = next(j for j in base.t['emc_jdr'] if j['eleve_id'] == 'e-d-renard-01')
        verif('classe d\'origine enregistrée', ja['origine'] == 3, ja)
        verif('prêt enregistré', next(p for p in base.t['emc_participants'] if p['eleve_id'] == 'e-d-renard-01')['pret'] is True)
        cap(A, 'a00-accueil'); cap(B, 'b00-accueil-portrait')

        # ---------- pilotage et projection ----------
        cP = contexte(1280, 800, prof=True); P = cP.new_page(); suivre(P, 'pilotage')
        P.goto(URL + '/prof/emc-accueil.html?classe=JDRD12'); P.wait_for_timeout(1800)
        verif('pilotage : 31 présents', P.inner_text('#n-tous') == '31', P.inner_text('#n-tous'))
        verif('pilotage : 2nde 3 compte A', '2nde 3' in P.inner_text('#origines'))
        cap(P, 'p00-pilotage')
        cJ = contexte(1280, 720, prof=True); J = cJ.new_page(); suivre(J, 'projection')
        J.goto(URL + '/prof/emc-accueil.html?classe=JDRD12&vue=projection'); J.wait_for_timeout(1800)
        verif('projection étape 0 : prêts / présents', '/ 31' in J.inner_text('#proj'), J.inner_text('#proj')[:200])
        verif('projection : pas de barre de pilotage', not J.is_visible('#appli'))
        cap(J, 'j00-projection')

        def sans_ident(nom):
            dom = J.content()
            fuite = [x for x in ['d-renard-01', 'd-loutre-02', 'd-cam-', 'RENARD', 'LOUTRE'] if x in dom]
            verif('projection %s : aucun identifiant ni nom' % nom, not fuite, fuite)

        # étape 1
        P.click('#btn-avancer'); P.wait_for_timeout(500)
        verif('étape 1 : consignes sur la tablette', etape(A, 1) and 'Pierre Marchand' in A.inner_text('#scene'))
        J.wait_for_timeout(1500); verif('projection : consignes et exemple', 'Pierre Marchand' in J.inner_text('#proj')); sans_ident('étape 1')
        cap(A, 'a01-consignes'); cap(J, 'j01-consignes')

        # étape 2 : tirage
        P.click('#btn-avancer'); etape(A, 2)
        verif('avant tirage : « le tirage arrive »', 'tirage arrive' in A.inner_text('#scene'))
        P.click('#onglets button[data-onglet=binomes]'); P.click('#b-tirer'); P.wait_for_timeout(800)
        verif('tirage : 31 élèves placés', len(base.t['emc_binomes']) == 31, len(base.t['emc_binomes']))
        A.wait_for_selector('.symbole-geant', timeout=9000)
        sa, sb = A.inner_text('.symbole-geant'), (B.wait_for_selector('.symbole-geant', timeout=9000) and B.inner_text('.symbole-geant'))
        verif('les deux tablettes ont le même symbole', sa == sb and sa.strip() != '', (sa, sb))
        verif('le symbole est dans la barre', sa.strip() in A.inner_text('#barre'))
        verif('pilotage : binômes listés avec les noms', 'Élève RENARD' in P.inner_text('#binomes'))
        J.wait_for_timeout(1500); sans_ident('étape 2')
        cap(A, 'a02-binome'); cap(P, 'p02-binomes'); cap(J, 'j02-binomes')
        # reconnexion : même binôme
        A.reload(); etape(A, 2); A.wait_for_selector('.symbole-geant', timeout=9000)
        verif('après rechargement : même symbole', A.inner_text('.symbole-geant') == sa)

        # étape 3 : questions
        P.click('#onglets button[data-onglet=seance]'); P.click('#btn-avancer'); etape(A, 3)
        def cocher(page, ids):
            for i in ids: page.check('fieldset.theme input[value="%d"]' % i)
        cocher(A, [1, 7, 13])
        A.click('text=Valider mes questions')
        verif('3 questions : refusé', 'entre 6 et 8' in A.inner_text('#scene'))
        cocher(A, [2, 3, 4])
        A.click('text=Valider mes questions')
        verif('6 questions sans les thèmes 4 et 5 : refusé', 'Il manque' in A.inner_text('#scene') and 'Mes rêves' in A.inner_text('#scene'))
        A.uncheck('fieldset.theme input[value="3"]'); A.uncheck('fieldset.theme input[value="4"]')
        cocher(A, [22, 27])
        for i in [9, 15]: A.check('fieldset.theme input[value="%d"]' % i)
        A.click('fieldset.theme input[value="30"]')
        verif('9e question refusée (max 8)', A.eval_on_selector_all('fieldset.theme input:checked', 'l => l.length') == 8 and 'Déjà 8' in A.inner_text('#scene'))
        A.click('text=Valider mes questions'); A.wait_for_timeout(1000)
        ja = next(j for j in base.t['emc_jdr'] if j['eleve_id'] == 'e-d-renard-01')
        verif('questions de A enregistrées (8, triées)', ja['questions'] == [1, 2, 7, 9, 13, 15, 22, 27], ja['questions'])
        cocher(B, [1, 8, 14, 20, 25, 26]); B.click('text=Valider mes questions'); B.wait_for_timeout(1000)
        cap(A, 'a03-questions'); cap(B, 'b03-questions-portrait')

        # étape 4 : échange, notes sur la tablette
        P.click('#btn-avancer'); P.wait_for_timeout(500)
        verif('étape 4 : le chrono part en ouvrant l\'étape', bool((base.seance().get('etat') or {}).get('echange_depuis')))
        etape(A, 4); etape(B, 4)
        verif('chrono sur la tablette', '⏱' in A.inner_text('#scene'))
        n0 = len(base.requetes)
        A.locator('textarea.note-q').nth(0).fill('Je m\'appelle Loutre Deux')
        B.locator('textarea.note-q').nth(5).fill(SECRET)                        # ce que A répond à B
        # A : [prénom, 1, 2, 7, 9, 13, 15, 22, 27] → 22 est la 8e zone, 2 la 3e
        A.locator('textarea.note-q').nth(7).fill('Les araignées : ' + SECRET)
        A.locator('textarea.note-q').nth(2).fill('Sa sœur lui fait confiance')
        A.wait_for_timeout(6500)                               # plus d'un cycle de file (5 s)
        fuite = [r for r in base.requetes if SECRET in r[1] or SECRET in r[2] or 'Loutre Deux' in r[2]]
        verif('🔴 aucune note n\'est partie sur le réseau', not fuite, fuite[:2])
        st = A.evaluate('JSON.stringify(Object.assign({}, localStorage))')
        verif('les notes sont sur la tablette', SECRET in st)
        verif('aucune note dans la file d\'envoi', not any(SECRET in v for k, v in json.loads(st).items() if k.startswith('emc.file')))
        J.wait_for_timeout(1500); verif('projection : chrono géant', ':' in J.inner_text('#p-chrono')); sans_ident('étape 4')
        cap(A, 'a04-echange'); cap(J, 'j04-chrono')
        # mi-temps
        poser(4, echange_depuis=int(time.time() * 1000) - 301_000)
        A.wait_for_function('document.body.innerText.indexOf("Changez de rôle") >= 0', timeout=9000)
        verif('à 5 min : « Changez de rôle » sur la tablette', True)
        J.wait_for_function('document.body.innerText.indexOf("Changez de rôle") >= 0', timeout=9000)
        verif('à 5 min : « Changez de rôle » à la projection', True)
        cap(J, 'j04-mi-temps')

        # étape 5 : feux (B répond sur les questions de A)
        poser(5); etape(B, 5); B.wait_for_selector('.feu-ligne', timeout=9000)
        verif('B voit les 8 questions que A lui a posées', B.locator('.feu-ligne').count() == 8, B.locator('.feu-ligne').count())
        verif('le texte dit le consentement', 'consentement' in B.inner_text('#scene'))
        for k in range(8):
            B.locator('.feu-ligne').nth(k).locator('button.feu.vert' if k != 6 else 'button.feu.rouge').click()
        B.wait_for_timeout(1000)
        jb = next(j for j in base.t['emc_jdr'] if j['eleve_id'] == 'e-d-loutre-02')
        verif('feux de B enregistrés, 22 en rouge', jb['feux'].get('22') is False and jb['feux'].get('1') is True, jb['feux'])
        verif('les feux ne portent aucun contenu', all(isinstance(v, bool) for v in jb['feux'].values()))
        cap(B, 'b05-feux-portrait')

        # étape 6 : présentations
        P.click('#onglets button[data-onglet=presentations]'); poser(6); P.wait_for_timeout(600)
        P.click('#o-tirer'); P.wait_for_timeout(600)
        o = base.seance()['etat']['ordre']
        num = next(b['binome'] for b in base.t['emc_binomes'] if b['eleve_id'] == 'e-d-renard-01')
        verif('ordre de passage : tous les binômes', len(o) == len(set(b['binome'] for b in base.t['emc_binomes'])), o)
        poser(6, courant=o.index(num), depuis=int(time.time() * 1000))
        etape(A, 6); A.wait_for_function('document.body.innerText.indexOf("C\'est à vous") >= 0', timeout=9000)
        txt = A.inner_text('#scene')
        verif('A : « C\'est à vous »', 'C\'est à vous' in txt)
        verif('A : la question 22 en rouge, sans la note', 'on n\'en parle pas' in txt and SECRET not in txt)
        verif('A : la note en vert affichée', 'Sa sœur lui fait confiance' in txt)
        B.wait_for_selector('.reconnu button', timeout=9000)
        B.locator('.reconnu button').nth(3).click(); B.wait_for_timeout(1000)
        verif('« reconnu·e » enregistré (4)', next(j for j in base.t['emc_jdr'] if j['eleve_id'] == 'e-d-loutre-02')['reconnu'] == 4)
        J.wait_for_timeout(1800)
        verif('projection : symbole du binôme en cours', sa.strip() in J.inner_text('#proj'))
        try: J.wait_for_function("document.querySelector('#proj').innerText.indexOf('🤩') >= 0", timeout=9000); vu = True
        except Exception: vu = False
        verif('projection : 🤩 du vote', vu)
        sans_ident('étape 6')
        cap(A, 'a06-presentation'); cap(J, 'j06-presentation'); cap(P, 'p06-presentations')

        # étape 7 : portrait mystère
        poser(7); etape(A, 7); A.wait_for_timeout(1500)
        opts = A.eval_on_selector_all('#pm-q option', 'l => l.map(o => o.value)')
        verif('portrait : seulement les questions en feu vert', '22' not in opts and '1' in opts, opts)
        A.fill('#pm-t', 'Je collectionne les cailloux ronds.'); A.click('text=Envoyer mon portrait mystère'); A.wait_for_timeout(800)
        m = next((x for x in base.t['emc_mur'] if x['eleve_id'] == 'e-d-renard-01'), None)
        verif('portrait proposé, pas validé', m and m['statut'] == 'propose' and m['sorte'] == 'portrait', m)
        J.wait_for_timeout(1500); verif('projection : rien avant validation', 'cailloux' not in J.inner_text('#proj'))
        P.click('#onglets button[data-onglet=mur]'); P.wait_for_timeout(1500)
        P.locator('#mur-portraits button', has_text='Valider').first.click(); P.wait_for_timeout(800)
        P.locator('#mur-portraits button', has_text='Projeter').first.click(); P.wait_for_timeout(600)
        J.wait_for_function('document.body.innerText.indexOf("cailloux") >= 0', timeout=9000)
        verif('projection : portrait validé, « Qui est-ce ? »', 'Qui est-ce' in J.inner_text('#proj'))
        P.locator('#mur-portraits button', has_text='Révéler').first.click()
        J.wait_for_function('s => document.body.innerText.indexOf(s) >= 0', arg=sa.strip(), timeout=9000)
        verif('révéler : le symbole s\'affiche', True); sans_ident('étape 7')
        A.wait_for_timeout(500); A.reload(); etape(A, 7); A.wait_for_timeout(1200)
        verif('validé : l\'élève ne peut plus le modifier', A.is_disabled('#pm-t'))
        cap(J, 'j07-portrait'); cap(P, 'p07-mur')

        # étape 8 : clôture, notes effacées
        poser(8); etape(A, 8); A.wait_for_timeout(400)
        st = A.evaluate('JSON.stringify(Object.assign({}, localStorage))')
        verif('🔴 étape 8 : les notes sont effacées de la tablette', SECRET not in st and 'emc.jdr.notes' not in st)
        verif('étape 8 : l\'élève le lit', 'effacées' in A.inner_text('#scene'))
        A.fill('#retiens', 'Elle aime les cailloux'); A.click('#scene button.primaire'); A.wait_for_timeout(800)
        verif('« je retiens » proposé', any(x['sorte'] == 'retiens' for x in base.t['emc_mur']))
        cap(A, 'a08-cloture')
        # B se déconnecte : ses notes partent aussi
        etape(B, 8)
        verif('B : notes effacées aussi', SECRET not in B.evaluate('JSON.stringify(Object.assign({}, localStorage))'))

        verif('aucune erreur JS', not erreurs, erreurs[:6])
        fuite = [r for r in base.requetes if SECRET in r[1] or SECRET in r[2]]
        verif('🔴 bilan : aucune note dans aucune requête de la séance', not fuite, fuite[:2])
        nav.close()
    srv.shutdown()
    print('\n%d contrôles réussis, %d en échec. Captures : %s' % (ok, ko, CAPT))
    sys.exit(1 if ko else 0)

if __name__ == '__main__':
    main()
