# -*- coding: utf-8 -*-
"""
emc-eleve.test.py — banc d'essai de la page élève EMC (emc/index.html)

La vraie page, servie depuis la racine du dépôt, contre une FAUSSE base
Supabase en mémoire (auth, rpc, REST), interceptée par Playwright.
supabase-js est remplacé par un bouchon dont le direct échoue : la page
doit tout faire en relecture. EMC.Carte est remplacée par un bouchon qui
expose ses options (window.__carte) pour tester persister / modifier.

Usage (depuis n'importe où) :
    python -X utf8 _outils/tests/emc-eleve.test.py <racine-du-dépôt> [dossier-captures]
"""
import json, re, sys, threading, time, uuid, base64, os, functools, http.server, socketserver
from datetime import datetime, timezone, timedelta
from urllib.parse import urlparse, parse_qs, unquote
from playwright.sync_api import sync_playwright

DEPOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
CAPTURES = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.join(__import__('tempfile').gettempdir(), 'emc-banc-eleve'))
os.makedirs(CAPTURES, exist_ok=True)
SUPA = 'https://ztyvuiaohxekuyjeoaxz.supabase.co'
PORT = 8766

ok = ko = 0
def verif(nom, cond, detail=None):
    global ok, ko
    if cond: ok += 1
    else:
        ko += 1
        print('ÉCHEC :', nom, '' if detail is None else detail)

def maintenant():
    return datetime.now(timezone.utc).isoformat(timespec='microseconds')

# ---------------------------------------------------------------- contenus
def contenus_du_sql():
    s = open(os.path.join(DEPOT, 'bdd/schema/031-emc.sql'), encoding='utf-8').read()
    out = {}
    for cle, js in re.findall(r"\('([a-z_]+)', \$j\$(.*?)\$j\$::jsonb\)", s, re.S):
        out[cle] = json.loads(js)
    return out

# ---------------------------------------------------------------- fausse base
class FausseBase:
    def __init__(self):
        self.panne = False
        self.users = {}       # email -> {id, mdp}
        self.jetons = {}      # access_token -> uid
        self.classes = {'NINA27': {'id': 'c-emc-1', 'libelle': 'EMC 2nde — créneau 1', 'espace': 'emc'},
                        'SNT26A': {'id': 'c-snt-a', 'libelle': 'SNT A', 'espace': 'snt'}}
        self.eleves = {}      # uid -> {id, pseudo, classe_id, classes:set}
        self.t = {k: [] for k in ['emc_seances', 'emc_participants', 'emc_mots', 'emc_notes',
                                  'emc_carte', 'emc_votes', 'emc_aide', 'emc_enquete']}
        self.t['emc_contenus'] = [{'cle': k, 'valeur': v} for k, v in contenus_du_sql().items()]
        self.t['emc_seances'].append({'classe_id': 'c-emc-1', 'etape': 0, 'situation_courante': None,
            'situation_revelee': False, 'carte_figee': False, 'zones_verrouillees': [], 'cloturee_le': None,
            'maj_le': maintenant()})
        # 7 camarades déjà là, un par table de 1 à 7 → le nouveau tombe à la table 8
        for n in range(1, 8):
            e = {'id': 'e-camarade-%d' % n}
            self.t['emc_participants'].append({'classe_id': 'c-emc-1', 'eleve_id': e['id'], 'table_num': n,
                                               'pret': False, 'pret_le': None})
            self.t['emc_notes'].append({'classe_id': 'c-emc-1', 'eleve_id': e['id'],
                                        'texte': 'note camarade %d' % n, 'maj_le': maintenant()})
        self.requetes = []

    # --- utilitaires
    def jeton(self, uid):
        payload = base64.urlsafe_b64encode(json.dumps({'sub': uid, 'role': 'authenticated'}).encode()).decode().rstrip('=')
        t = 'eyJhbGciOiJIUzI1NiJ9.' + payload + '.sig' + uuid.uuid4().hex[:8]
        self.jetons[t] = uid
        return {'access_token': t, 'refresh_token': 'r-' + uuid.uuid4().hex, 'token_type': 'bearer',
                'expires_in': 3600, 'expires_at': int(time.time()) + 3600, 'user': {'id': uid}}
    def uid_de(self, entetes):
        a = entetes.get('authorization', '')
        return self.jetons.get(a[7:]) if a.startswith('Bearer ') else None
    def eleve(self, uid):
        return self.eleves.get(uid)
    def seance(self, cid):
        return next((s for s in self.t['emc_seances'] if s['classe_id'] == cid), None)
    def participant(self, cid, eid):
        return next((p for p in self.t['emc_participants'] if p['classe_id'] == cid and p['eleve_id'] == eid), None)
    def poser_etape(self, n, **extra):
        s = self.seance('c-emc-1'); s['etape'] = n; s.update(extra); s['maj_le'] = maintenant()

    # --- réponses
    def rep(self, route, statut=200, corps=None):
        en = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*',
              'Access-Control-Allow-Methods': '*', 'Content-Type': 'application/json'}
        route.fulfill(status=statut, headers=en, body='' if corps is None else json.dumps(corps))
    def erreur(self, route, statut, message):
        self.rep(route, statut, {'code': 'P0001', 'message': message, 'hint': None, 'details': None})

    def gerer(self, route):
        req = route.request
        if self.panne:
            route.abort('internetdisconnected'); return
        if req.method == 'OPTIONS':
            self.rep(route, 204); return
        u = urlparse(req.url)
        q = parse_qs(u.query, keep_blank_values=True)
        corps = json.loads(req.post_data) if req.post_data else None
        self.requetes.append((req.method, u.path, u.query))
        en = {k.lower(): v for k, v in req.headers.items()}
        p = u.path
        if p.startswith('/auth/v1/'): return self.auth(route, p[9:], q, corps)
        if p.startswith('/rest/v1/rpc/'): return self.rpc(route, p[13:], corps, self.uid_de(en))
        if p.startswith('/rest/v1/'): return self.rest(route, req.method, p[9:], u.query, corps, self.uid_de(en), en.get('prefer', ''))
        self.rep(route, 404, {})

    def auth(self, route, chemin, q, c):
        if chemin == 'signup':
            if c['email'] in self.users:
                return self.rep(route, 422, {'code': 422, 'error_code': 'user_already_exists', 'msg': 'User already registered'})
            uid = str(uuid.uuid4()); self.users[c['email']] = {'id': uid, 'mdp': c['password']}
            return self.rep(route, 200, self.jeton(uid))
        if chemin == 'token':
            g = q.get('grant_type', [''])[0]
            if g == 'password':
                us = self.users.get(c['email'])
                if not us or us['mdp'] != c['password']:
                    return self.rep(route, 400, {'error': 'invalid_grant', 'error_code': 'invalid_credentials', 'error_description': 'Invalid login credentials'})
                return self.rep(route, 200, self.jeton(us['id']))
            if g == 'refresh_token':
                return self.rep(route, 400, {'error_code': 'refresh_token_not_found'})
        self.rep(route, 404, {})

    def rpc(self, route, nom, c, uid):
        c = c or {}
        e = self.eleve(uid) if uid else None
        if nom == 'ma_session':
            if not e: return self.rep(route, 200, [])
            cl = next(k for k in self.classes.values() if k['id'] == e['classe_id'])
            return self.rep(route, 200, [{'eleve_id': e['id'], 'pseudo': e['pseudo'], 'classe_libelle': cl['libelle'], 'annee_scolaire': '2026-2027'}])
        if nom == 'mes_inscriptions':
            return self.rep(route, 200, [] if not e else [{'classe_libelle': 'x', 'espace': 'emc', 'inscription': True}])
        if nom == 'rejoindre_classe':
            cl = self.classes.get(c.get('p_code', '').upper())
            if not cl: return self.erreur(route, 400, 'CODE_CLASSE_INCONNU')
            if not e:
                e = {'id': 'e-' + uuid.uuid4().hex[:8], 'pseudo': c['p_pseudo'], 'classe_id': cl['id'], 'classes': {cl['id']}}
                self.eleves[uid] = e
            return self.rep(route, 200, [{'eleve_id': e['id']}])
        if nom == 'rejoindre_autre_classe':
            cl = self.classes.get(c.get('p_code', '').upper())
            if not cl: return self.erreur(route, 400, 'CODE_CLASSE_INCONNU')
            e['classes'].add(cl['id']); return self.rep(route, 200, cl['libelle'])
        if nom == 'emc_entrer':
            if not uid: return self.erreur(route, 400, 'AUCUNE_SESSION')
            if not e: return self.erreur(route, 400, 'PAS_ENCORE_INSCRIT')
            code = (c.get('p_code') or '').strip().upper()
            if code:
                cl = self.classes.get(code)
                if not cl or cl['espace'] != 'emc': return self.erreur(route, 400, 'CODE_EMC_INCONNU')
                e['classes'].add(cl['id'])
            else:
                cl = next((k for k in self.classes.values() if k['espace'] == 'emc' and k['id'] in e['classes']), None)
                if not cl: return self.erreur(route, 400, 'PAS_DE_CLASSE_EMC')
            pa = self.participant(cl['id'], e['id'])
            if not pa:
                compte = {n: 0 for n in range(1, 9)}
                for x in self.t['emc_participants']:
                    if x['classe_id'] == cl['id']: compte[x['table_num']] += 1
                t = min(compte, key=lambda n: (compte[n], n))
                pa = {'classe_id': cl['id'], 'eleve_id': e['id'], 'table_num': t, 'pret': False, 'pret_le': None}
                self.t['emc_participants'].append(pa)
            return self.rep(route, 200, {'classe_id': cl['id'], 'libelle': cl['libelle'], 'table_num': pa['table_num'],
                                         'nouveau': e['classe_id'] == cl['id'], 'etape': self.seance(cl['id'])['etape']})
        if nom == 'emc_pret':
            pa = self.participant(c['p_classe'], e['id']) if e else None
            if not pa: return self.erreur(route, 400, 'PAS_DANS_LA_SEANCE')
            pa['pret'] = bool(c['p_pret']); return self.rep(route, 204)
        if nom == 'emc_repondre_enquete':
            if self.seance(c['p_classe'])['etape'] != 7: return self.erreur(route, 400, 'ENQUETE_FERMEE')
            self.t['emc_enquete'].append({'classe_id': c['p_classe'], 'reponses': c['p_reponses'], 'temoignage': c.get('p_temoignage')})
            return self.rep(route, 204)
        self.erreur(route, 404, 'rpc inconnue ' + nom)

    def rest(self, route, methode, table, query, c, uid, prefer):
        e = self.eleve(uid) if uid else None
        params = [x.split('=', 1) for x in query.split('&') if '=' in x]
        filtres = [(k, unquote(v)) for k, v in params if k not in ('select', 'order', 'on_conflict', 'limit')]
        on_conflict = dict(params).get('on_conflict')
        lignes = self.t.get(table)
        if lignes is None: return self.erreur(route, 404, 'table inconnue ' + table)

        def garde(r):
            for k, v in filtres:
                op, val = v.split('.', 1)
                if op == 'eq' and str(r.get(k)) != val: return False
                if op == 'gt' and not (r.get(k) and datetime.fromisoformat(r[k]) > datetime.fromisoformat(val)): return False
            return True
        def visible(r):          # le strict nécessaire des policies du 031
            if table in ('emc_contenus', 'emc_seances', 'emc_carte'): return True
            if not e: return False
            if table in ('emc_participants', 'emc_mots', 'emc_votes'): return r['eleve_id'] == e['id']
            if table == 'emc_notes':
                moi = self.participant(r['classe_id'], e['id']); lui = self.participant(r['classe_id'], r['eleve_id'])
                return bool(moi and lui and moi['table_num'] == lui['table_num'])
            return False   # emc_aide, emc_enquete : rien pour un élève

        if methode == 'GET':
            res = [dict(r) for r in lignes if garde(r) and visible(r)]
            if table == 'emc_carte': res.sort(key=lambda r: r['maj_le'])
            return self.rep(route, 200, res)

        if methode == 'POST':
            items = c if isinstance(c, list) else [c]
            for it in items:
                s = self.seance(it.get('classe_id'))
                # contrôles d'étape, comme les policies
                bloque = (table == 'emc_mots' and s['etape'] != 1) or \
                         (table == 'emc_votes' and not (s['etape'] == 6 and s['situation_courante'] == it['situation'] and not s['situation_revelee'])) or \
                         (table == 'emc_carte' and s['etape'] != 4) or \
                         (table != 'emc_aide' and (not e or it.get('eleve_id') != e['id']))
                if bloque:
                    return self.rep(route, 403, {'code': '42501', 'message': 'new row violates row-level security policy for table "%s"' % table})
                it = dict(it); it['maj_le'] = maintenant()
                if table == 'emc_aide': it.update({'id': str(uuid.uuid4()), 'statut': 'a_traiter', 'cree_le': maintenant()})
                cles = on_conflict.split(',') if on_conflict else (['id'] if table == 'emc_carte' else None)
                ancien = next((r for r in lignes if cles and all(r.get(k) == it.get(k) for k in cles)), None) if cles else None
                if ancien:
                    if 'ignore-duplicates' in prefer: continue
                    if 'merge-duplicates' in prefer: ancien.update(it); continue
                    return self.rep(route, 409, {'code': '23505', 'message': 'duplicate key'})
                lignes.append(it)
            return self.rep(route, 201)

        if methode == 'PATCH':
            n = 0
            for r in lignes:
                if garde(r) and e and r.get('eleve_id') == e['id']:
                    r.update(c); r['maj_le'] = maintenant(); n += 1
            return self.rep(route, 204)
        self.erreur(route, 405, 'méthode')

# ---------------------------------------------------------------- bouchons
BOUCHON_SUPABASE = """
window.supabase = { createClient: function () { return {
  realtime: { setAuth: function () {} },
  channel: function () { var c = { on: function () { return c; },
    subscribe: function (cb) { setTimeout(function () { cb('CHANNEL_ERROR'); }, 10); return c; } }; return c; },
  removeChannel: function () {} }; } };
"""
BOUCHON_CARTE = """
window.EMC.Carte = { monter: function (hote, opts) {
  window.__carte = { opts: opts, charges: 0, appliques: [], etats: [], detruite: false, centre: null };
  hote.innerHTML = '<div style="padding:2rem;text-align:center;color:#4a566e">[carte — bouchon de banc, zone ' + opts.zone + ']</div>';
  return {
    charger: function (l) { window.__carte.charges = l.length; },
    appliquer: function (x) { window.__carte.appliques.push(x.id); },
    etat: function (e) { window.__carte.etats.push(e); },
    contenus: function () {}, centrerSur: function (z) { window.__carte.centre = z; },
    detruire: function () { window.__carte.detruite = true; }
  }; } };
"""

# ---------------------------------------------------------------- serveur
class Silencieux(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
def servir():
    gestion = functools.partial(Silencieux, directory=DEPOT)
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), gestion)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv

# ---------------------------------------------------------------- scénario
def main():
    srv = servir()
    base = FausseBase()
    erreurs, externes = [], []
    with sync_playwright() as pw:
        nav = pw.chromium.launch()
        ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True)
        ctx.route(SUPA + '/**', base.gerer)
        ctx.route('**/assets/js/vendor/supabase-js-2.45.4.min.js',
                  lambda r: r.fulfill(status=200, content_type='application/javascript', body=BOUCHON_SUPABASE))
        ctx.route('**/assets/js/emc-carte.js*',
                  lambda r: r.fulfill(status=200, content_type='application/javascript', body=BOUCHON_CARTE))
        page = ctx.new_page()
        page.on('pageerror', lambda e: erreurs.append('pageerror: ' + str(e)))
        page.on('console', lambda m: erreurs.append('console: ' + m.text) if m.type == 'error' and not base.panne and 'ERR_INTERNET_DISCONNECTED' not in m.text and 'Failed to load resource' not in m.text else None)
        def noter(req):
            h = urlparse(req.url).hostname
            if h not in ('127.0.0.1', 'localhost', 'ztyvuiaohxekuyjeoaxz.supabase.co'): externes.append(req.url)
        page.on('request', noter)

        def capture(nom):
            page.screenshot(path=os.path.join(CAPTURES, nom + '-paysage.png'), full_page=True)
            page.set_viewport_size({'width': 768, 'height': 1024})
            page.wait_for_timeout(250)
            page.screenshot(path=os.path.join(CAPTURES, nom + '-portrait.png'), full_page=True)
            page.set_viewport_size({'width': 1024, 'height': 768})
            page.wait_for_timeout(150)
        def stockage():
            return page.evaluate('JSON.stringify(Object.assign({}, localStorage))')
        def attendre_etape(n, delai=9000):
            try:
                page.wait_for_function('n => { var t = document.querySelector(".etape-titre .num"); return t && t.textContent === "Étape " + n; }', arg=n, timeout=delai)
                return True
            except Exception:
                return False

        page.goto('http://127.0.0.1:%d/emc/index.html' % PORT)
        page.wait_for_selector('.porte')
        capture('00-porte')

        # --- erreurs de saisie
        page.fill('#p-id', 'Renard Bleu')
        page.fill('#p-mdp', 'Atelier7'); page.fill('#p-mdp2', 'Atelier7'); page.fill('#p-code', 'nina27')
        verif('le code passe en majuscules', page.input_value('#p-code') == 'NINA27')
        page.click('text=Créer mon compte et rejoindre')
        page.wait_for_selector('.alerte.err.show')
        verif('identifiant invalide refusé avec le message de progression.js', 'minuscules' in page.inner_text('.alerte.err'))
        page.fill('#p-id', 'renard-bleu-27'); page.fill('#p-mdp2', 'Atelier8')
        page.click('text=Créer mon compte et rejoindre')
        verif('mots de passe différents refusés', 'identiques' in page.inner_text('.alerte.err'))
        page.fill('#p-mdp2', 'Atelier7'); page.fill('#p-code', 'NINA2')
        page.click('text=Créer mon compte et rejoindre')
        verif('code trop court refusé', '6 caractères' in page.inner_text('.alerte.err'))
        verif('aucun champ nom/prénom', page.query_selector('input[name*=nom], #p-nom, #p-prenom') is None)

        # --- création
        page.fill('#p-code', 'NINA27')
        page.click('text=Créer mon compte et rejoindre')
        verif('étape 0 affichée après création', attendre_etape(0))
        verif('table 8 attribuée (la moins remplie)', 'TABLE 8' in page.inner_text('#barre'))
        verif('identifiant dans l\'en-tête', 'renard-bleu-27' in page.inner_text('#barre'))
        verif('code retenu', json.loads(stockage()).get('emc.code') == 'NINA27')
        page.wait_for_timeout(400)
        verif('état du direct : relecture (bouchon)', 'relecture' in page.inner_text('#etat-direct'))
        capture('01-etape0')

        # --- prêt
        page.click('#barre button[aria-pressed]')
        page.wait_for_selector('#barre button.pret-oui')
        moi = next(p for p in base.t['emc_participants'] if p['table_num'] == 8)
        verif('prêt enregistré en base', moi['pret'] is True)

        # --- reconnexion : même table
        page.click('text=Se déconnecter')
        page.wait_for_selector('.porte')
        page.click('text=J\'ai déjà un compte')
        page.fill('#p-id', 'renard-bleu-27'); page.fill('#p-mdp', 'Mauvais1')
        page.click('text=Me connecter et rejoindre')
        page.wait_for_selector('.alerte.err.show')
        verif('mauvais mot de passe : message clair', 'incorrect' in page.inner_text('.alerte.err'))
        page.fill('#p-mdp', 'Atelier7')
        verif('code prérempli à la reconnexion', page.input_value('#p-code') == 'NINA27')
        page.click('text=Me connecter et rejoindre')
        verif('reconnecté', attendre_etape(0))
        verif('même table après reconnexion', 'TABLE 8' in page.inner_text('#barre'))
        verif('pas de doublon de participant', len([p for p in base.t['emc_participants'] if p['eleve_id'] == moi['eleve_id']]) == 1)
        page.reload()
        verif('rechargement : on retrouve la séance sans rien retaper', attendre_etape(0))

        # --- étape 1
        base.poser_etape(1)
        verif('la page suit l\'étape 1 (relecture)', attendre_etape(1))
        page.fill('.mots input >> nth=0', 'Moquerie'); page.fill('.mots input >> nth=1', 'Peur')
        page.click('.emojis button >> nth=0'); page.click('.emojis button >> nth=1'); page.click('.emojis button >> nth=2')
        verif('au plus 2 émojis choisis', page.eval_on_selector_all('.emojis button[aria-pressed=true]', 'l => l.length') == 2)
        page.click('text=Envoyer')
        page.wait_for_timeout(800)
        mots = next((m for m in base.t['emc_mots'] if m['eleve_id'] == moi['eleve_id']), None)
        verif('mots enregistrés', mots and mots['mots'] == ['Moquerie', 'Peur'] and len(mots['emojis']) == 2, mots)
        page.fill('.mots input >> nth=2', 'Isolement'); page.click('text=Envoyer'); page.wait_for_timeout(800)
        verif('mots modifiables (upsert, une seule ligne)', len([m for m in base.t['emc_mots'] if m['eleve_id'] == moi['eleve_id']]) == 1
              and mots['mots'][-1] == 'Isolement')
        capture('02-etape1')

        # --- étape 2
        base.poser_etape(2)
        verif('étape 2', attendre_etape(2))
        verif('mission de la table 8 : Comprendre', 'Comprendre' in page.inner_text('#scene'))
        capture('03-etape2')

        # --- étape 3 : notes, et coupure réseau
        base.poser_etape(3)
        verif('étape 3', attendre_etape(3))
        page.wait_for_timeout(500)
        verif('je ne vois pas les notes des autres tables', 'note camarade' not in page.inner_text('#scene'))
        base.t['emc_participants'].append({'classe_id': 'c-emc-1', 'eleve_id': 'e-voisin', 'table_num': 8, 'pret': True, 'pret_le': None})
        base.t['emc_notes'].append({'classe_id': 'c-emc-1', 'eleve_id': 'e-voisin', 'texte': 'Nina dessine seule', 'maj_le': maintenant()})
        page.fill('#ma-note', 'Premier repère : le vote.')
        page.wait_for_timeout(2600)
        note = next((n for n in base.t['emc_notes'] if n['eleve_id'] == moi['eleve_id']), None)
        verif('note sauvegardée automatiquement', note and note['texte'] == 'Premier repère : le vote.', note)
        page.wait_for_timeout(8500)
        verif('je vois la note d\'un camarade de ma table, sans nom', 'Camarade' in page.inner_text('#scene') and 'Nina dessine seule' in page.inner_text('#scene'))
        base.panne = True
        page.context.set_offline(True)
        page.type('#ma-note', ' Puis le faux rendez-vous.')
        page.wait_for_timeout(2500)
        st = json.loads(stockage())
        verif('hors ligne : brouillon local à jour', 'faux rendez-vous' in (st.get('emc.note.c-emc-1') or ''))
        verif('hors ligne : la note attend dans la file', any(k.startswith('emc.file.') and 'faux rendez-vous' in v for k, v in st.items()))
        verif('hors ligne : rien n\'est arrivé en base', 'faux rendez-vous' not in note['texte'])
        page.wait_for_timeout(300)
        verif('hors ligne : l\'en-tête le dit', 'en attente' in page.inner_text('#barre') or 'hors ligne' in page.inner_text('#barre'))
        capture('04-etape3-hors-ligne')
        page.context.set_offline(False)
        base.panne = False
        page.wait_for_timeout(7000)
        verif('retour du réseau : la note arrive', 'faux rendez-vous' in note['texte'], note['texte'])
        verif('retour du réseau : la file est vide', not any(k.startswith('emc.file.') for k in json.loads(stockage())))
        capture('05-etape3')

        # --- étape 4 : carte (bouchon)
        base.t['emc_carte'].append({'id': 'x-1', 'classe_id': 'c-emc-1', 'eleve_id': 'e-camarade-1', 'zone': 1, 'type': 'trait',
            'couleur': 'bleu', 'donnees': {'points': [700, -700, 720, -720]}, 'masque': False, 'supprime': False, 'maj_le': maintenant()})
        base.poser_etape(4)
        verif('étape 4', attendre_etape(4))
        page.wait_for_timeout(800)
        c = page.evaluate('window.__carte && {zone: __carte.opts.zone, mode: __carte.opts.mode, eleveId: __carte.opts.eleveId, charges: __carte.charges, etat: __carte.etats[__carte.etats.length-1], centre: __carte.centre}')
        verif('carte montée en mode élève sur la zone 8, avec eleveId', c and c['zone'] == 8 and c['mode'] == 'eleve' and c['eleveId'] == moi['eleve_id'], c)
        verif('carte chargée avec l\'existant', c and c['charges'] == 1, c)
        verif('carte ouverte, non figée', c and c['etat']['ouverte'] is True and c['etat']['figee'] is False, c)
        verif('vue centrée sur ma zone', c and c['centre'] == 8, c)
        page.evaluate("""__carte.opts.persister({ id: '20000000-0000-4000-8000-000000000001', zone: 8, type: 'trait', couleur: 'vert',
                          donnees: { points: [1500, 1500, 1520, 1530] } })""")
        page.wait_for_timeout(800)
        el1 = next((x for x in base.t['emc_carte'] if x['id'] == '20000000-0000-4000-8000-000000000001'), None)
        verif('persister : élément en base avec élève et auteur', el1 and el1['eleve_id'] == moi['eleve_id'] and el1['auteur'] and el1['classe_id'] == 'c-emc-1', el1)
        verif('persister : seules les colonnes autorisées', el1 and set(el1) <= {'id', 'classe_id', 'eleve_id', 'auteur', 'zone', 'type', 'couleur', 'donnees', 'maj_le'}, el1 and sorted(el1))
        uid = next(u for u, e in base.eleves.items() if e['id'] == moi['eleve_id'])
        verif('auteur = sub du jeton', el1 and el1['auteur'] == uid)
        page.evaluate("__carte.opts.persister({ id: '20000000-0000-4000-8000-000000000001', zone: 8, type: 'trait', couleur: 'vert', donnees: { points: [1500, 1500, 1520, 1530] } })")
        page.wait_for_timeout(600)
        verif('renvoi du même élément : pas de doublon', len([x for x in base.t['emc_carte'] if x['id'].startswith('20000000')]) == 1)
        page.evaluate("__carte.opts.modifier('20000000-0000-4000-8000-000000000001', { supprime: true })")
        page.wait_for_timeout(800)
        verif('modifier : annuler arrive en base', el1.get('supprime') is True)
        base.t['emc_carte'].append({'id': 'x-2', 'classe_id': 'c-emc-1', 'eleve_id': 'e-camarade-2', 'zone': 2, 'type': 'trait',
            'couleur': 'rouge', 'donnees': {'points': [1500, -1500, 1510, -1510]}, 'masque': False, 'supprime': False, 'maj_le': maintenant()})
        page.wait_for_timeout(3800)
        verif('relecture incrémentale : l\'élément d\'une autre zone arrive', 'x-2' in page.evaluate('__carte.appliques'))
        verif('relecture incrémentale : filtre maj_le', any(m == 'GET' and pa.endswith('emc_carte') and 'maj_le=gt.' in qu for m, pa, qu in base.requetes))
        base.poser_etape(4, carte_figee=True)
        page.wait_for_timeout(3800)
        verif('carte figée transmise', page.evaluate('__carte.etats[__carte.etats.length-1].figee') is True)
        page.click('text=Plein écran')
        verif('plein écran', page.evaluate('document.body.classList.contains("carte-plein")'))
        capture('06-etape4-plein-ecran')
        page.click('text=Quitter le plein écran')
        capture('06-etape4')

        # --- étape 5
        base.poser_etape(5)
        verif('étape 5', attendre_etape(5))
        verif('carte détruite en quittant l\'étape', page.evaluate('__carte.detruite') is True)
        verif('lien d\'origine de la vidéo', page.query_selector('a[href="https://youtu.be/WoVTJcw6tkE"]') is not None)
        verif('3018 affiché', '3018' in page.inner_text('#scene'))
        capture('07-etape5')

        # --- étape 6 : harcèlomètre, vote, coupure
        base.poser_etape(6, situation_courante='s10', situation_revelee=False)
        verif('étape 6', attendre_etape(6))
        verif('situation s10 affichée', 'blague' in page.inner_text('#scene'))
        page.click('text=Valider mon vote')
        verif('vote sans toucher le curseur refusé', 'Déplace' in page.inner_text('#scene'))
        page.eval_on_selector('input.harcelo', "c => { c.value = 3; c.dispatchEvent(new Event('input', {bubbles:true})); }")
        page.click('text=Valider mon vote'); page.wait_for_timeout(800)
        vote = next((v for v in base.t['emc_votes'] if v['eleve_id'] == moi['eleve_id']), None)
        verif('vote enregistré', vote and vote['valeur'] == 3, vote)
        capture('08-etape6')
        base.panne = True; page.context.set_offline(True)
        page.eval_on_selector('input.harcelo', "c => { c.value = 7; c.dispatchEvent(new Event('input', {bubbles:true})); }")
        page.click('text=Valider mon vote'); page.wait_for_timeout(1200)
        verif('hors ligne : le vote attend', vote['valeur'] == 3 and any(k.startswith('emc.file.') for k in json.loads(stockage())))
        page.context.set_offline(False); base.panne = False
        page.wait_for_timeout(7000)
        verif('retour du réseau : le vote modifié arrive', vote['valeur'] == 7, vote)
        verif('un seul vote par situation', len([v for v in base.t['emc_votes'] if v['eleve_id'] == moi['eleve_id']]) == 1)
        base.poser_etape(6, situation_courante='s10', situation_revelee=True)
        page.wait_for_timeout(3800)
        verif('révélé : zone attendue affichée', 'Zone attendue' in page.inner_text('#scene'))
        verif('révélé : curseur figé', page.eval_on_selector('input.harcelo', 'c => c.disabled'))
        verif('révélé : mon vote rappelé', 'Ton vote : 7' in page.inner_text('#scene'))
        capture('09-etape6-revele')
        base.poser_etape(6, situation_courante='s1', situation_revelee=False)
        page.wait_for_timeout(3800)
        verif('situation suivante affichée', 'like la personne' in page.inner_text('#scene'))

        # --- aide (avant l'enquête), y compris hors ligne
        page.click('#btn-aide')
        page.wait_for_selector('.modale')
        verif('avertissement exact', "Ce message n'est pas anonyme : il sera lu par M. Van Hoorde et Mme Castel pour pouvoir venir te voir." in page.inner_text('.modale'))
        capture('10-aide')
        page.click('.modale >> text=Envoyer')
        verif('aide vide refusée', 'Coche une case' in page.inner_text('.modale'))
        page.check('.modale label.case >> nth=2')
        page.fill('#aide-message', 'MESSAGE-SECRET-AIDE')
        base.panne = True; page.context.set_offline(True)
        page.click('.modale >> text=Envoyer'); page.wait_for_timeout(1000)
        verif('hors ligne : « pas encore envoyé »', 'Pas encore envoyé' in page.inner_text('.modale'))
        verif('hors ligne : l\'aide n\'est PAS dans le localStorage', 'MESSAGE-SECRET-AIDE' not in stockage())
        page.context.set_offline(False); base.panne = False
        page.wait_for_timeout(6500)
        aide = [a for a in base.t['emc_aide'] if a['eleve_id'] == moi['eleve_id']]
        verif('retour du réseau : l\'aide arrive, une seule fois', len(aide) == 1 and aide[0]['message'] == 'MESSAGE-SECRET-AIDE'
              and aide[0]['cases'] == ["J'aimerais parler à un adulte"], aide)
        verif('confirmation affichée', 'Message envoyé' in page.inner_text('.modale'))
        verif('après envoi : rien en local', 'MESSAGE-SECRET-AIDE' not in stockage())
        page.click('.modale >> text=Fermer')

        # --- étape 7 : enquête
        base.poser_etape(7)
        verif('étape 7', attendre_etape(7))
        verif('mention « pas anonyme » sous l\'enquête', 'qui n\'est pas anonyme' in page.inner_text('#scene'))
        capture('11-etape7')
        page.check('fieldset.q >> nth=0 >> text=non')
        page.check('fieldset.q >> nth=3 >> text=oui')
        page.fill('#temoignage', 'témoignage test')
        page.click('text=Envoyer mes réponses'); page.wait_for_timeout(1000)
        verif('enquête enregistrée', len(base.t['emc_enquete']) == 1 and base.t['emc_enquete'][0]['reponses'] == {'q1': 'non', 'q4': 'oui'}, base.t['emc_enquete'])
        verif('enquête : aucune donnée d\'identité envoyée', 'eleve' not in json.dumps(base.t['emc_enquete'][0]))
        verif('merci affiché', 'Merci' in page.inner_text('#scene'))
        page.reload()
        verif('après rechargement, l\'enquête reste « faite »', attendre_etape(7) and 'Merci' in page.inner_text('#scene'))
        capture('12-etape7-merci')

        # --- clôture
        base.seance('c-emc-1')['cloturee_le'] = maintenant()
        page.wait_for_function('document.body.innerText.indexOf("La séance est terminée") >= 0', timeout=9000)
        verif('séance clôturée : écran de fin', True)
        capture('13-fin')

        verif('aucune erreur JS', not erreurs, erreurs[:8])
        verif('aucune requête hors localhost / supabase', not externes, externes[:5])
        verif('l\'aide n\'a jamais été stockée', 'MESSAGE-SECRET-AIDE' not in stockage())

        # --- la vraie carte, si le chantier A l'a livrée : la page tient-elle ?
        if os.path.exists(os.path.join(DEPOT, 'assets/js/emc-carte.js')):
            ctx2 = nav.new_context(viewport={'width': 1024, 'height': 768}, has_touch=True)
            base2 = FausseBase(); base2.users = base.users; base2.eleves = base.eleves; base2.jetons = base.jetons
            base2.t['emc_participants'] += [p for p in base.t['emc_participants'] if p['eleve_id'] == moi['eleve_id']]
            base2.poser_etape(4)
            ctx2.route(SUPA + '/**', base2.gerer)
            ctx2.route('**/assets/js/vendor/supabase-js-2.45.4.min.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=BOUCHON_SUPABASE))
            p2 = ctx2.new_page(); err2 = []
            p2.on('pageerror', lambda e: err2.append(str(e)))
            p2.goto('http://127.0.0.1:%d/emc/index.html' % PORT)
            p2.wait_for_selector('.porte')
            p2.click('text=J\'ai déjà un compte')
            p2.fill('#p-id', 'renard-bleu-27'); p2.fill('#p-mdp', 'Atelier7'); p2.fill('#p-code', 'NINA27')
            p2.click('text=Me connecter et rejoindre')
            p2.wait_for_timeout(3000)
            p2.screenshot(path=os.path.join(CAPTURES, '14-vraie-carte.png'))
            p2.click('text=Plein écran'); p2.wait_for_timeout(800)
            p2.screenshot(path=os.path.join(CAPTURES, '15-vraie-carte-plein-ecran.png'))
            verif("plein écran : le bouton d'aide reste cliquable", p2.evaluate("(() => { var b = document.querySelector('#btn-aide').getBoundingClientRect(); var x = document.elementFromPoint(b.left + b.width/2, b.top + b.height/2); return !!x && !!x.closest('#btn-aide'); })()"))
            verif('vraie carte : aucune erreur JS', not err2, err2[:5])
            ctx2.close()
        else:
            print('(assets/js/emc-carte.js absent : la vraie carte n\'est pas testée)')
        nav.close()
    srv.shutdown()
    print('\n%d contrôles réussis, %d en échec. Captures : %s' % (ok, ko, CAPTURES))
    sys.exit(1 if ko else 0)

if __name__ == '__main__':
    main()
