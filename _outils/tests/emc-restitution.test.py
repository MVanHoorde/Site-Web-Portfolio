# -*- coding: utf-8 -*-
"""
emc-restitution.test.py — banc de la restitution « Nos libertés » (034 §5b)

Les vraies pages (emc/index.html, prof/emc-restitution.html en pilotage
et en projection) contre une FAUSSE base Supabase en mémoire. Deux
tablettes, dix camarades virtuels qui ont déjà écrit leur parcours.
On contrôle : météo, parcours écrit librement, groupes proposés puis
envoyés, mur de post-it (dans son groupe seulement, masquage), tour de
parole, nuage et définitions modérées, exports PDF, et que la
projection n'affiche jamais un identifiant.

Usage :
    python -X utf8 _outils/tests/emc-restitution.test.py <racine-du-dépôt> [dossier-captures]
"""
import json, re, sys, threading, time, uuid, base64, os, functools, http.server, socketserver
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qsl, unquote
from playwright.sync_api import sync_playwright

DEPOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
CAPT = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.join(__import__('tempfile').gettempdir(), 'emc-banc-restitution'))
os.makedirs(CAPT, exist_ok=True)
SUPA = 'https://ztyvuiaohxekuyjeoaxz.supabase.co'
PORT = 8774
ok = ko = 0
def verif(nom, cond, detail=None):
    global ok, ko
    if cond: ok += 1
    else:
        ko += 1; print('ÉCHEC :', nom, '' if detail is None else str(detail)[:300])
def iso(): return datetime.now(timezone.utc).isoformat(timespec='microseconds')

CONTENUS = {}
for f in ['031-emc.sql', '033-emc-contenus.sql', '034-emc-six-seances.sql']:
    s = open(os.path.join(DEPOT, 'bdd/schema', f), encoding='utf-8').read()
    for cle, js in re.findall(r"\('([a-z_]+)', \$j\$(.*?)\$j\$::jsonb\)", s, re.S):
        CONTENUS[cle] = json.loads(js)
# 033 ajoute des émojis par un update : le catalogue de 031 suffit au banc
assert 'restitution' in CONTENUS
# la liste des ateliers (035) : FICTIVE dans le banc — la vraie, avec les
# noms des collègues, ne vit qu'en base (dépôt public)
CONTENUS['restitution']['ateliers'] = [
    {'n': 1, 'nom': 'Labyrinthe de Nina', 'enseignants': 'M Prof et Mme Prof', 'salle': 'S 100'},
    {'n': 2, 'nom': 'Débat sur les réseaux', 'enseignants': 'Mme Une et M Deux', 'salle': 'S 101'},
    {'n': 3, 'nom': 'Théâtre forum', 'enseignants': 'M Trois et Mme Quatre', 'salle': 'S 102'}]
CONTENUS['restitution']['expression_question'] = 'Ces deux jours, en un mot ou une phrase.'
# le déroulé du 035 (8 étapes, analyse du mur) et la question d'analyse
_s35 = open(os.path.join(DEPOT, 'bdd/schema/035-emc-jdr-retours.sql'), encoding='utf-8').read()
CONTENUS['etapes_restitution'] = next(json.loads(x) for x in re.findall(r"set valeur = \$j\$(.*?)\$j\$", _s35, re.S) if 'Analyse' in x)
CONTENUS['restitution']['analyse_consigne'] = 'Quelles libertés reviennent ?' 

CL = 'c-rest'; PROF = 'u-prof'
def jwt(sub):
    b = lambda d: base64.urlsafe_b64encode(json.dumps(d).encode()).decode().rstrip('=')
    return b({'alg': 'HS256'}) + '.' + b({'sub': sub, 'role': 'authenticated', 'exp': 9999999999}) + '.' + uuid.uuid4().hex[:8]

ATELIERS = ['Labyrinthe de Nina', 'Débat sur les réseaux', 'Théâtre forum']
class Base:
    def __init__(self):
        self.users, self.jetons, self.refresh, self.eleves = {}, {}, {}, {}
        self.t = {'emc_contenus': [{'cle': k, 'valeur': v} for k, v in CONTENUS.items()],
                  'emc_seances': [{'classe_id': CL, 'etape': 0, 'module': 'restitution', 'prefixe': 's', 'etat': {}, 'cloturee_le': None, 'maj_le': iso()}],
                  'emc_participants': [], 'emc_restit': [], 'emc_postits': [], 'emc_mots': [], 'emc_mots_masques': [], 'emc_mur': [], 'emc_aide': [],
                  'classes': [{'id': CL, 'code': 'REST21', 'libelle': '2nde 1 · vendredi 13/11, 14 h – 15 h 15 · Restitution', 'espace': 'emc'}]}
        self.requetes = []
        for ident, code in [('s-castor-01', '1111'), ('s-hibou-02', '2222')]:
            uid = 'u-' + ident; self.users[ident + '@emc.local'] = (uid, 'Emc-' + code); self.eleves[uid] = {'id': 'e-' + ident, 'pseudo': ident}
        for i in range(10):
            e = 'e-cam-%02d' % i
            self.eleves['u-cam-%02d' % i] = {'id': e, 'pseudo': 's-cam-%02d' % i}
            self.t['emc_participants'].append({'classe_id': CL, 'eleve_id': e, 'table_num': 1, 'pret': True})
            self.t['emc_restit'].append({'classe_id': CL, 'eleve_id': e, 'mot': ['choisir', 'respect', 'Choisir'][i % 3],
                                         'parcours': [{'atelier': ATELIERS[i % 3], 'ref': i % 3 + 1, 'mot': 'x', 'liberte': 'Liberté d\'expression'}], 'maj_le': iso()})
    def jeton(self, uid):
        t = jwt(uid); r = 'r-' + uuid.uuid4().hex; self.jetons[t] = uid; self.refresh[r] = uid
        email = next((k for k, v in self.users.items() if v[0] == uid), None)
        return {'access_token': t, 'refresh_token': r, 'expires_in': 3600, 'user': {'id': uid, 'email': email}}
    def seance(self): return self.t['emc_seances'][0]
    def gerer(self, route):
        req = route.request
        cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*', 'Content-Type': 'application/json'}
        if req.method == 'OPTIONS': return route.fulfill(status=204, headers=cors)
        rep = lambda corps=None, st=200: route.fulfill(status=st, headers=cors, body='' if corps is None else json.dumps(corps))
        u = urlparse(req.url); q = parse_qsl(u.query, keep_blank_values=True); p = u.path
        corps = json.loads(req.post_data) if req.post_data else None
        self.requetes.append((req.method, req.url, req.post_data or ''))
        a = req.headers.get('authorization', ''); uid = self.jetons.get(a[7:]) if a.startswith('Bearer ') else None
        prof = uid == PROF; e = self.eleves.get(uid)
        if p.startswith('/auth/v1/token'):
            g = dict(q).get('grant_type')
            if g == 'password':
                us = self.users.get(corps['email'])
                return rep(self.jeton(us[0])) if us and us[1] == corps['password'] else rep({'error_code': 'invalid_credentials'}, 400)
            x = self.refresh.pop((corps or {}).get('refresh_token'), None)
            return rep(self.jeton(x)) if x else rep({}, 400)
        if p.startswith('/auth/v1/logout'): return rep(None, 204)
        if p.startswith('/rest/v1/rpc/'):
            f = p.split('/')[-1]; c = corps or {}
            if f == 'est_enseignant': return rep(prof)
            if f == 'emc_entrer':
                if not any(x['eleve_id'] == e['id'] for x in self.t['emc_participants']):
                    self.t['emc_participants'].append({'classe_id': CL, 'eleve_id': e['id'], 'table_num': 1, 'pret': False})
                return rep({'classe_id': CL, 'libelle': self.t['classes'][0]['libelle'], 'table_num': 1, 'nouveau': True, 'etape': self.seance()['etape']})
            if f == 'emc_pret':
                next(x for x in self.t['emc_participants'] if x['eleve_id'] == e['id'])['pret'] = c['p_pret']; return rep(None, 204)
            return rep({'message': 'rpc ' + f}, 404)
        t = p.replace('/rest/v1/', '')
        if t == 'enseignants': return rep([{'libelle': 'VAN HOORDE'}] if prof else [])
        if t not in self.t: return rep([])
        filtres = [(k, unquote(v)) for k, v in q if k not in ('select', 'order', 'on_conflict', 'limit')]
        def garde(r):
            for k, v in filtres:
                op, _, val = v.partition('.')
                if op == 'eq' and str(r.get(k)).lower() != val.lower(): return False
            return True
        mon_groupe = (self.seance()['etat'].get('affectations') or {}).get(e['id']) if e else None
        def visible(r):
            if prof or t in ('emc_contenus', 'emc_seances', 'classes'): return True
            if not e: return False
            if t == 'emc_postits': return not r['masque'] or r['eleve_id'] == e['id']
            return r.get('eleve_id') == e['id']
        sel = dict(q).get('select', '*')
        if req.method == 'GET':
            res = []
            for r in self.t[t]:
                if garde(r) and visible(r):
                    r = dict(r)
                    if 'eleves(' in sel:
                        ee = next((x for x in self.eleves.values() if x['id'] == r['eleve_id']), None); r['eleves'] = {'pseudo': ee['pseudo']} if ee else None
                    res.append(r)
            return rep(res)
        if req.method == 'POST':
            items = corps if isinstance(corps, list) else [corps]
            oc = dict(q).get('on_conflict'); cles = oc.split(',') if oc else (['id'] if t == 'emc_postits' else ['classe_id', 'mot'] if t == 'emc_mots_masques' else None)
            for it in items:
                if not prof:
                    if t != 'emc_aide' and (not e or it.get('eleve_id') != e['id']): return rep({'code': '42501', 'message': 'row-level security'}, 403)
                    if t == 'emc_postits' and (self.seance()['etape'] != 4 or it['groupe'] != mon_groupe or it.get('masque')): return rep({'code': '42501', 'message': 'row-level security'}, 403)
                    if t == 'emc_mur' and 'statut' in it: return rep({'code': '42501', 'message': 'permission denied'}, 403)
                it = dict(it); it['maj_le'] = iso(); it.setdefault('cree_le', iso())
                if t == 'emc_postits': it.setdefault('masque', False)
                if t == 'emc_mur': it.setdefault('statut', 'propose')
                anc = next((r for r in self.t[t] if cles and all(r.get(k) == it.get(k) for k in cles)), None)
                if anc:
                    if 'ignore-duplicates' in (req.headers.get('prefer') or ''): continue
                    anc.update(it)
                else: self.t[t].append(it)
            return rep(None, 201)
        if req.method == 'PATCH':
            for r in self.t[t]:
                if garde(r) and (prof or (e and r.get('eleve_id') == e['id'])): r.update(corps); r['maj_le'] = iso()
            return rep(None, 204)
        if req.method == 'DELETE':
            av = len(self.t[t])
            self.t[t] = [r for r in self.t[t] if not (garde(r) and (prof or (e and r.get('eleve_id') == e['id'])))]
            return rep(None, 204)
        return rep([])

BOUCHON = """window.supabase = { createClient: function () { return { realtime: { setAuth: function () {} },
  channel: function () { var c = { on: function () { return c; }, subscribe: function (cb) { setTimeout(function () { cb('CHANNEL_ERROR'); }, 10); return c; } }; return c; },
  removeChannel: function () {} }; } };"""

class Silencieux(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def main():
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Silencieux, directory=DEPOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = Base(); URL = 'http://127.0.0.1:%d' % PORT; erreurs = []
    with sync_playwright() as pw:
        nav = pw.chromium.launch()
        def contexte(larg=1024, haut=768, prof=False):
            ctx = nav.new_context(viewport={'width': larg, 'height': haut}, accept_downloads=True)
            ctx.route(SUPA + '/**', base.gerer)
            ctx.route('**/assets/js/vendor/supabase-js-2.45.4.min.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=BOUCHON))
            if prof:
                t = jwt(PROF); base.jetons[t] = PROF
                st = {'access_token': t, 'refresh_token': 'r', 'expires_at': int(time.time() * 1000) + 3600_000, 'ouverte': int(time.time() * 1000),
                      'noms': {'s-castor-01': 'Élève CASTOR'}, 'nomsFichier': 't.csv'}
                ctx.add_init_script("try{localStorage.setItem('snt.prof', %s)}catch(e){}" % json.dumps(json.dumps(st)))
            return ctx
        def suivre(page, nom):
            page.on('pageerror', lambda x: erreurs.append(nom + ': ' + str(x)))
            page.on('console', lambda m: erreurs.append(nom + ' console: ' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
        def etape(page, n):
            try:
                page.wait_for_function('n => { var t = document.querySelector(".etape-titre .num"); return t && t.textContent === "Étape " + n; }', arg=n, timeout=9000); return True
            except Exception: return False
        def poser(n): s = base.seance(); s['etape'] = n; s['maj_le'] = iso()
        def cap(page, nom): page.screenshot(path=os.path.join(CAPT, nom + '.png'), full_page=True)
        def attendre(page, texte, sel='body'):
            try: page.wait_for_function('a => document.querySelector(a[0]).innerText.indexOf(a[1]) >= 0', arg=[sel, texte], timeout=9000); return True
            except Exception: return False

        cA = contexte(); A = cA.new_page(); suivre(A, 'A')
        cB = contexte(768, 1024); B = cB.new_page(); suivre(B, 'B')
        A.goto(URL + '/emc/index.html?carte=s-castor-01&k=1111'); B.goto(URL + '/emc/index.html?carte=s-hibou-02&k=2222')
        verif('deux tablettes entrent par carte', etape(A, 0) and etape(B, 0))
        verif('titre « Nos libertés »', 'Nos libertés' in A.inner_text('#scene'))
        A.click('#scene button.pret-geant'); B.click('#scene button.pret-geant')
        cP = contexte(1280, 800, prof=True); P = cP.new_page(); suivre(P, 'pilotage')
        P.goto(URL + '/prof/emc-restitution.html?classe=REST21')
        verif('pilotage : 12 présents', attendre(P, '12', '#n-tous'))
        cJ = contexte(1280, 720, prof=True); J = cJ.new_page(); suivre(J, 'projection')
        J.goto(URL + '/prof/emc-restitution.html?classe=REST21&vue=projection'); J.wait_for_timeout(1800)
        verif('projection : la barre du pilotage est cachée', not J.is_visible('#barre'))
        def sans_ident(nom):
            dom = J.content(); f = [x for x in ['s-castor', 's-hibou', 's-cam-', 'CASTOR'] if x in dom]
            verif('projection %s : aucun identifiant ni nom' % nom, not f, f)
        sans_ident('étape 0'); cap(J, 'j0')

        # 1 — météo
        P.click('#btn-avancer'); etape(A, 1)
        A.click('.emojis button >> nth=0'); A.click('.emojis button >> nth=3'); A.click('#scene button.primaire'); A.wait_for_timeout(1200)
        m = next((x for x in base.t['emc_mots'] if x['eleve_id'] == 'e-s-castor-01'), None)
        verif('météo : 2 émojis, aucun mot', m and len(m['emojis']) == 2 and m['mots'] == [], m)
        verif('projection : météo', attendre(J, '1 / 12', '#proj')); cap(A, 'a1-meteo')

        # 2 — parcours écrit librement
        P.click('#btn-avancer'); etape(A, 2)
        verif('la liste des ateliers est proposée (enseignants, salle)', 'M Prof et Mme Prof · S 100' in A.inner_text('.parcours-ligne >> nth=0 >> select'))
        A.locator('.parcours-ligne >> nth=0 >> select').select_option('1')
        A.locator('.parcours-ligne >> nth=0 >> input >> nth=1').fill('harcèlement')
        A.locator('.parcours-ligne >> nth=0 >> input >> nth=2').fill('Sûreté : ne pas subir de violence')
        A.locator('.parcours-ligne >> nth=1 >> input >> nth=0').fill('Théâtre-forum')
        A.click('text=Un autre atelier')
        verif('ajouter une ligne', A.locator('.parcours-ligne').count() == 3)
        A.click('text=Enregistrer mon parcours'); A.wait_for_timeout(1200)
        r = next((x for x in base.t['emc_restit'] if x['eleve_id'] == 'e-s-castor-01'), None)
        verif('parcours enregistré (lignes vides ignorées), atelier choisi dans la liste', r and len(r['parcours']) == 2 and r['parcours'][0]['liberte'].startswith('Sûreté')
              and r['parcours'][0].get('ref') == 1 and not r['parcours'][1].get('ref'), r)
        verif('la liste des libertés est proposée', A.locator('datalist#libertes option').count() >= 8)
        B.locator('.parcours-ligne >> nth=0 >> select').select_option('2'); B.click('text=Enregistrer mon parcours'); B.wait_for_timeout(1200)
        cap(A, 'a2-parcours'); cap(B, 'b2-parcours-portrait')
        J.wait_for_timeout(1500); verif('projection : nuage des ateliers', 'Labyrinthe' in J.inner_text('#proj')); sans_ident('étape 2'); cap(J, 'j2')

        # 3 — groupes
        P.click('#onglets button[data-onglet=groupes]'); P.wait_for_timeout(1500)
        verif('pilotage : ateliers regroupés par l\'atelier choisi', 'Labyrinthe de Nina · 5' in P.inner_text('#ateliers') and 'Débat sur les réseaux · 4' in P.inner_text('#ateliers'), P.inner_text('#ateliers'))
        P.click('#g-proposer'); P.wait_for_timeout(300)
        verif('proposition : 3 groupes, pas encore envoyée', P.locator('.groupe-ed').count() == 3 and 'pas encore' in P.inner_text('#g-info'))
        verif('rien n\'est envoyé avant « Envoyer »', not base.seance()['etat'].get('groupes'))
        P.click('#g-envoyer'); P.wait_for_timeout(600)
        et = base.seance()['etat']
        verif('groupes envoyés : chacun dans un atelier qu\'il a fait', len(et['groupes']) == 3 and len(et['affectations']) == 12, et)
        g_a = next(g for g in et['groupes'] if g['n'] == et['affectations']['e-s-castor-01'])
        verif('A est dans un de ses ateliers', g_a['titre'] in ('Labyrinthe de Nina', 'Théâtre forum'), g_a)
        poser(3); etape(A, 3)
        verif('A voit son groupe', attendre(A, g_a['titre'], '#scene'))
        verif('le symbole du groupe est dans la barre', g_a['symbole'] in A.inner_text('#barre'))
        cap(A, 'a3-groupe'); J.wait_for_timeout(1500); sans_ident('étape 3'); cap(J, 'j3'); cap(P, 'p3-groupes')

        # 4 — le mur
        P.click('#onglets button[data-onglet=seance]'); P.click('#btn-avancer'); etape(A, 4)
        verif('le mur : trois colonnes de saisie, chacune son « Poster »', A.locator('.mur-case').count() == 3 and A.locator('.mur-case button', has_text='Poster').count() == 3)
        A.locator('.mur-case', has_text='appris').locator('textarea').fill('Le 3018 répond aussi la nuit')
        A.locator('.mur-case', has_text='appris').locator('button').click(); A.wait_for_timeout(800)
        pa = [x for x in base.t['emc_postits'] if x['eleve_id'] == 'e-s-castor-01']
        verif('post-it posté dans son groupe, sorte « appris »', len(pa) == 1 and pa[0]['groupe'] == g_a['n'] and pa[0]['sorte'] == 'appris', pa)
        A.locator('.mur-case', has_text='fait').locator('textarea').fill('Insulte'); A.locator('.mur-case', has_text='fait').locator('button').click(); A.wait_for_timeout(800)
        verif('post-it rangés dans leurs colonnes', A.locator('.mur-colonne .postit').count() == 2
              and 'Insulte' in A.inner_text('.mur-colonne >> nth=0') and '3018' in A.inner_text('.mur-colonne >> nth=1'))
        A.locator('.mur-colonne .postit', has_text='Insulte').locator('button.retirer').click(); A.wait_for_timeout(800)
        verif('retirer son post-it', len([x for x in base.t['emc_postits'] if x['eleve_id'] == 'e-s-castor-01']) == 1)
        B.locator('.mur-case', has_text='liberté').locator('textarea').fill('MOT-A-MASQUER'); B.locator('.mur-case', has_text='liberté').locator('button').click(); B.wait_for_timeout(800)
        J.wait_for_timeout(3500)
        verif('projection : le mur', '3018' in J.inner_text('#proj') and 'MOT-A-MASQUER' in J.inner_text('#proj'))
        P.click('#onglets button[data-onglet=mur]'); P.wait_for_timeout(1200)
        P.locator('.postit', has_text='MOT-A-MASQUER').locator('button', has_text='Masquer').click(); P.wait_for_timeout(600)
        verif('masqué en base', next(x for x in base.t['emc_postits'] if x['texte'] == 'MOT-A-MASQUER')['masque'] is True)
        J.wait_for_timeout(3800)
        verif('masqué : disparu de la projection', 'MOT-A-MASQUER' not in J.inner_text('#proj'))
        P.locator('.colonne', has_text=g_a['titre']).locator('button', has_text='Au tour').click(); P.wait_for_timeout(600)
        verif('tour de parole posé', base.seance()['etat'].get('oral') == g_a['n'])
        verif('A : « C\'est à votre groupe », en très grand', attendre(A, 'votre groupe de présenter', '#scene') and A.locator('.a-vous').count() == 1)
        verif('projection : le groupe en avant, chrono', attendre(J, '🎤', '#proj'))
        sans_ident('étape 4'); cap(J, 'j4-mur'); cap(P, 'p4-mur'); cap(A, 'a4-mur')

        # 5 — analyse du mur, tous ensemble
        P.click('#onglets button[data-onglet=seance]'); P.click('#btn-avancer'); etape(A, 5)
        verif('analyse : la tablette montre tous les post-it, par colonne', attendre(A, '3018', '#scene') and A.locator('.mur-colonne').count() == 3)
        verif('analyse : la projection range par colonne', attendre(J, 'Nos libertés, tous ensemble', '#proj') and J.locator('#proj .mur-analyse .colonne').count() == 3
              and 'MOT-A-MASQUER' not in J.inner_text('#proj'))
        sans_ident('étape 5 (analyse)'); cap(J, 'j5-analyse'); cap(A, 'a5-analyse')

        # 6 — définition
        P.click('#btn-avancer'); etape(A, 6)
        A.fill('#r-mot', 'Choisir'); A.click('text=Envoyer mon mot'); A.wait_for_timeout(800)
        A.fill('#r-def', 'Pouvoir choisir sans écraser les autres'); A.click('text=Envoyer ma définition'); A.wait_for_timeout(800)
        verif('mot enregistré avec le parcours', next(x for x in base.t['emc_restit'] if x['eleve_id'] == 'e-s-castor-01')['mot'] == 'Choisir'
              and len(next(x for x in base.t['emc_restit'] if x['eleve_id'] == 'e-s-castor-01')['parcours']) == 2)
        verif('définition proposée, pas validée', any(x['sorte'] == 'definition' and x['statut'] == 'propose' for x in base.t['emc_mur']))
        J.wait_for_timeout(2000)
        verif('projection : nuage (choisir ×5)', 'choisir' in J.inner_text('#proj').lower())
        verif('projection : définition pas encore validée = absente', 'écraser' not in J.inner_text('#proj'))
        P.click('#onglets button[data-onglet=definitions]'); P.wait_for_timeout(1200)
        P.locator('#defs button', has_text='Valider').first.click(); P.wait_for_timeout(600)
        verif('définition validée → projetée', attendre(J, 'écraser', '#proj'))
        sans_ident('étape 6'); cap(J, 'j6')

        # exports
        P.click('#onglets button[data-onglet=exports]')
        P.click('#x-tout')
        try:
            P.wait_for_selector('a[data-export$="EMC-restitution.pdf"]', timeout=60000)
            taille = P.evaluate("fetch(document.querySelector('a[data-export$=\"EMC-restitution.pdf\"]').href).then(r=>r.blob()).then(b=>b.size)")
            verif('export tout en un PDF (%d Ko)' % (taille // 1024), taille > 5000, taille)
        except Exception:
            verif('export tout en un PDF', False, P.inner_text('.modale')[:200])
        poser(7); verif('étape 7', etape(A, 7) and 'Merci' in A.inner_text('#scene'))
        A.fill('#r-expr', 'Deux jours intenses'); A.locator('#scene button.primaire').first.click(); A.wait_for_timeout(1200)
        verif('expression libre enregistrée', next(x for x in base.t['emc_restit'] if x['eleve_id'] == 'e-s-castor-01').get('expression') == 'Deux jours intenses')
        verif('projection : le nuage de l\'expression libre', attendre(J, 'deux jours intenses', '#proj'))
        verif('pas de bandeau des numéros en restitution', A.is_hidden('#bandeau-aide') and A.locator('#btn-aide-barre').count() == 1)
        sans_ident('étape 7'); cap(J, 'j7-expression')
        verif('aucune erreur JS', not erreurs, erreurs[:6])
        nav.close()
    srv.shutdown()
    print('\n%d contrôles réussis, %d en échec. Captures : %s' % (ok, ko, CAPT))
    sys.exit(1 if ko else 0)

if __name__ == '__main__':
    main()
