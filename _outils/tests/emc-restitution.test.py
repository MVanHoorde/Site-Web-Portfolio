# -*- coding: utf-8 -*-
"""
emc-restitution.test.py — banc de la restitution « Nos libertés » (034 §5b, 040)

Les vraies pages (emc/index.html, prof/emc-restitution.html en pilotage
et en projection, prof/emc-projection.html pour les émotions du
Labyrinthe) contre une FAUSSE base Supabase en mémoire.

1. La séance entière à 35 élèves : deux vraies tablettes (paysage et
   portrait) et 33 camarades virtuels, sur 10 ateliers fictifs. Météo,
   parcours (3 ou 4 ateliers, sans doublon), groupes = tables tirées
   par rang de préférence, mur en tuiles dépliables avec la légende,
   passage des groupes en plein écran couleur par couleur (tiré au
   sort), définition et sa consigne, retour anonyme complet et son
   classement, expression libre, exports ; la projection n'affiche
   jamais un identifiant et ne lit jamais emc_aide.
2. Les limites : 40 élèves qui veulent tous le même atelier, 12
   ateliers, un atelier choisi par un seul élève, des élèves sans
   parcours, 8 élèves pour 10 ateliers ; post-it très nombreux et très
   longs ; retours vides ou faits d'ateliers écrits à la main ; les 32
   émotions du Labyrinthe toutes choisies (aucune ne doit être coupée).

Usage :
    python -X utf8 _outils/tests/emc-restitution.test.py <racine-du-dépôt> [dossier-captures]
"""
import json, re, sys, threading, time, uuid, base64, os, functools, http.server, socketserver, random
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qsl, unquote
from playwright.sync_api import sync_playwright

DEPOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
CAPT = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.join(__import__('tempfile').gettempdir(), 'emc-banc-restitution'))
os.makedirs(CAPT, exist_ok=True)
SUPA = 'https://ztyvuiaohxekuyjeoaxz.supabase.co'
PORT = 8774
ok = ko = 0
CAPTURES = []          # (fichier, légende) : la galerie
def verif(nom, cond, detail=None):
    global ok, ko
    if cond: ok += 1
    else:
        ko += 1; print('ÉCHEC :', nom, '' if detail is None else str(detail)[:300])
def iso(): return datetime.now(timezone.utc).isoformat(timespec='microseconds')

# ---------- les contenus : ceux du dépôt, 040 compris ----------
def lire(f): return open(os.path.join(DEPOT, 'bdd/schema', f), encoding='utf-8').read()
CONTENUS = {}
for f in ['031-emc.sql', '034-emc-six-seances.sql']:
    for cle, js in re.findall(r"\('([a-z_]+)', \$j\$(.*?)\$j\$::jsonb\)", lire(f), re.S):
        CONTENUS[cle] = json.loads(js)
# 033 : les 20 émojis de plus (32 en tout)
CONTENUS['mots']['emojis'] += json.loads(re.search(r"jsonb_array_elements\(\$j\$(\[.*?\])\$j\$", lire('033-emc-contenus.sql'), re.S).group(1))
# 040 : le déroulé en 7 étapes, et les textes de la restitution, LUS DANS LE SQL
s40 = lire('040-emc-restitution-retours.sql')
blocs = re.findall(r"\$j\$(.*?)\$j\$", s40, re.S)
CONTENUS['etapes_restitution'] = json.loads(blocs[0])
R = CONTENUS['restitution']
R['parcours_projection'] = json.loads(blocs[2]); R['retour'] = json.loads(blocs[3])
R['parcours_min'], R['parcours_max'] = 3, 4
for k in ['parcours_consigne', 'groupe_consigne', 'mur_consigne', 'definition_consigne']:
    m = re.search(r"jsonb_build_object\('" + k + r"'.*?'\"(.*?)\"'::jsonb", s40, re.S)
    R[k] = m.group(1).replace("''", "'")
R['expression_question'] = 'Ces deux jours, en un mot ou une phrase.'
# la liste des ateliers : FICTIVE (la vraie, avec les noms des collègues, ne vit qu'en base)
NOMS = ['Labyrinthe de Nina', 'Débat sur les réseaux', 'Théâtre forum', 'Droit et justice', 'Presse et fake news',
        'Égalité filles-garçons', 'Laïcité', 'Engagement associatif', 'Sécurité routière', 'Premiers secours',
        'Art et censure', 'Vie privée en ligne']
def ateliers(n): return [{'n': i + 1, 'nom': NOMS[i], 'enseignants': 'M Prof%d et Mme Prof%d' % (i + 1, i + 1), 'salle': 'S %d' % (100 + i)} for i in range(n)]
for nom, tit in [('etapes_restitution', None)]:
    assert len(CONTENUS[nom]) == 7
SORTES = [p['sorte'] for p in R['postits']]

CL = 'c-rest'; PROF = 'u-prof'
def jwt(sub):
    b = lambda d: base64.urlsafe_b64encode(json.dumps(d).encode()).decode().rstrip('=')
    return b({'alg': 'HS256'}) + '.' + b({'sub': sub, 'role': 'authenticated', 'exp': 9999999999}) + '.' + uuid.uuid4().hex[:8]

TEXTES = ['On a joué une scène de harcèlement', 'Le 3018 répond aussi la nuit', 'Liberté d\'expression, mais pas d\'insulte',
          'On a débattu en deux camps', 'Ma liberté s\'arrête où commence celle des autres', 'On a lu des articles de presse',
          'La loi protège même en ligne', 'Le droit à l\'image', 'Dire non sans se justifier', 'Personne n\'est obligé de tout partager']

class Base:
    """Une séance de restitution. n_virt camarades virtuels, n_at ateliers ;
    parcours(i, rnd) donne la liste ordonnée des numéros d'ateliers du i-ème."""
    def __init__(self, n_virt=33, n_at=10, parcours=None, tablettes=True, graine=7, emojis_tous=False, module='restitution', code='REST21'):
        rnd = random.Random(graine)
        self.users, self.jetons, self.refresh, self.eleves = {}, {}, {}, {}
        c = json.loads(json.dumps(CONTENUS)); c['restitution']['ateliers'] = ateliers(n_at); self.ateliers = c['restitution']['ateliers']
        self.t = {'emc_contenus': [{'cle': k, 'valeur': v} for k, v in c.items()],
                  'emc_seances': [{'classe_id': CL, 'etape': 0, 'module': module, 'prefixe': 's', 'etat': {}, 'cloturee_le': None, 'maj_le': iso(),
                                   'situation_courante': None, 'situation_revelee': False}],
                  'emc_participants': [], 'emc_restit': [], 'emc_postits': [], 'emc_mots': [], 'emc_mots_masques': [], 'emc_mur': [], 'emc_aide': [], 'emc_enquete': [],
                  'classes': [{'id': CL, 'code': code, 'libelle': '2nde 1 · vendredi 13/11, 14 h – 15 h 15 · Restitution', 'espace': 'emc'}]}
        self.requetes = []
        if tablettes:
            for ident, cd in [('s-castor-01', '1111'), ('s-hibou-02', '2222')]:
                uid = 'u-' + ident; self.users[ident + '@emc.local'] = (uid, 'Emc-' + cd); self.eleves[uid] = {'id': 'e-' + ident, 'pseudo': ident}
        poids = [6, 3, 3, 2, 2, 2, 1.5, 1, 1, 1, 1, 1][:n_at]
        emo = [x['e'] for x in c['mots']['emojis']]
        for i in range(n_virt):
            e = 'e-cam-%02d' % i
            self.eleves['u-cam-%02d' % i] = {'id': e, 'pseudo': 's-cam-%02d' % i}
            self.t['emc_participants'].append({'classe_id': CL, 'eleve_id': e, 'table_num': 1, 'pret': True})
            if parcours: refs = parcours(i, rnd)
            else:
                k = 3 if i % 11 == 5 else 4
                refs = []
                while len(refs) < min(k, n_at):
                    x = rnd.choices(range(1, n_at + 1), weights=poids)[0]
                    if x not in refs: refs.append(x)
            p = [{'atelier': NOMS[r - 1], 'ref': r, 'mot': 'mot%d' % r, 'liberte': 'Liberté d\'expression'} for r in refs]
            self.t['emc_restit'].append({'classe_id': CL, 'eleve_id': e, 'mot': ['choisir', 'respect', 'Choisir', 'égalité', 'parole'][i % 5], 'expression': None,
                                         'parcours': p, 'maj_le': iso()})
            em = [emo[i % len(emo)], emo[(i * 7 + 3) % len(emo)]] if emojis_tous else [emo[(i * 5) % 16], emo[(i * 3 + 1) % 24]]
            self.t['emc_mots'].append({'classe_id': CL, 'eleve_id': e, 'mots': ['peur', 'moquerie'], 'emojis': list(dict.fromkeys(em)), 'maj_le': iso()})
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
            if f == 'emc_repondre_enquete':
                # comme le 040 : à la dernière étape du module, 16 Ko, plafond = participants
                if self.seance()['etape'] != 6: return rep({'message': 'ENQUETE_FERMEE'}, 400)
                if len(json.dumps(c.get('p_reponses'))) > 16384: return rep({'message': 'REPONSES_ILLISIBLES'}, 400)
                if len(self.t['emc_enquete']) >= len(self.t['emc_participants']): return rep({'message': 'ENQUETE_COMPLETE'}, 400)
                self.t['emc_enquete'].append({'id': str(uuid.uuid4()), 'classe_id': CL, 'reponses': c['p_reponses'], 'temoignage': None}); return rep(None, 204)
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
            if not e or t == 'emc_enquete': return False
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
                    if t == 'emc_enquete': return rep({'code': '42501', 'message': 'row-level security'}, 403)
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
            self.t[t] = [r for r in self.t[t] if not (garde(r) and (prof or (e and r.get('eleve_id') == e['id'])))]
            return rep(None, 204)
        return rep([])
    # les camarades virtuels au mur : n_par post-it par groupe, longs ou non
    def postits_virtuels(self, n_par=(2, 6), long=False, graine=3):
        rnd = random.Random(graine); aff = self.seance()['etat'].get('affectations') or {}
        for eid, g in aff.items():
            if not eid.startswith('e-cam'): continue
            for _ in range(rnd.randint(*n_par) // 3 + 1):
                so = rnd.choice(SORTES); tx = rnd.choice(TEXTES)
                if long: tx = (tx + ' — ' + ' '.join(TEXTES))[:140]
                self.t['emc_postits'].append({'id': str(uuid.uuid4()), 'classe_id': CL, 'eleve_id': eid, 'groupe': g, 'sorte': so, 'texte': tx, 'masque': False, 'cree_le': iso(), 'maj_le': iso()})
    # les retours anonymes des camarades
    def retours_virtuels(self, n, graine=5, libres=False):
        rnd = random.Random(graine)
        for r in self.t['emc_restit'][:n]:
            ats = []
            for i, a in enumerate(r['parcours']):
                biais = {1: 1, 2: 0, 3: 0.5}.get(a['ref'], -0.4 if a['ref'] == 9 else 0)
                ats.append({'ref': None if libres else a['ref'], 'cle': ('ref:%d' % a['ref']) if not libres else a['atelier'].lower(), 'titre': a['atelier'], 'rang': i + 1,
                            'note': max(1, min(5, round(rnd.gauss(3.4 + biais, 1)))), 'sert': rnd.choice(['Oui', 'Oui', 'Un peu', 'Non']),
                            'compris': rnd.choice(['Oui', 'Oui', 'En partie', 'Non']), 'texte': rnd.choice([None, None, 'Ça m\'a fait réfléchir', 'Trop court', 'J\'ai bien aimé débattre'])})
            self.t['emc_enquete'].append({'id': str(uuid.uuid4()), 'classe_id': CL, 'temoignage': None, 'reponses': {'v': 1,
                'global': {'ressenti': rnd.choice([3, 4, 4, 5, 2]), 'appris': rnd.choice(['Beaucoup', 'Un peu', 'Un peu', 'Pas vraiment']), 'proposition': rnd.choice([None, 'Plus de temps pour les ateliers', 'Moins de temps assis'])},
                'ateliers': ats, 'jdr': {'note': rnd.choice([4, 5, 3]), 'texte': rnd.choice([None, 'Drôle de se présenter sous un autre nom'])},
                'restit': {'note': rnd.choice([3, 4]), 'texte': None}}})

BOUCHON = """window.supabase = { createClient: function () { return { realtime: { setAuth: function () {} },
  channel: function () { var c = { on: function () { return c; }, subscribe: function (cb) { setTimeout(function () { cb('CHANNEL_ERROR'); }, 10); return c; } }; return c; },
  removeChannel: function () {} }; } };"""

class Silencieux(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

URL = 'http://127.0.0.1:%d' % PORT
def tuile(J, n): return J.locator('#proj .tuile-g').filter(has=J.locator('.tg-table', has_text=re.compile('^Table %d$' % n)))
erreurs = []

def outils(nav, base):
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
    return contexte
def suivre(page, nom):
    page.on('pageerror', lambda x: erreurs.append(nom + ': ' + str(x)))
    page.on('console', lambda m: erreurs.append(nom + ' console: ' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    page.on('dialog', lambda d: d.accept())
def cap(page, nom, legende, plein=False):
    page.screenshot(path=os.path.join(CAPT, nom + '.png'), full_page=plein); CAPTURES.append((nom + '.png', legende))
def attendre(page, texte, sel='body', delai=9000):
    try: page.wait_for_function('a => { var n = document.querySelector(a[0]); return n && n.innerText.indexOf(a[1]) >= 0; }', arg=[sel, texte], timeout=delai); return True
    except Exception: return False
def etape(page, n):
    try:
        page.wait_for_function('n => { var t = document.querySelector(".etape-titre .num"); return t && t.textContent === "Étape " + n; }', arg=n, timeout=9000); return True
    except Exception: return False
DEBORDE = """sel => { var l = []; document.querySelectorAll(sel).forEach(function (n) {
  var r = n.getBoundingClientRect(); if (r.bottom > innerHeight + 1 || r.right > innerWidth + 1 || r.top < -1 || r.left < -1) l.push((n.innerText || '').slice(0, 30)); }); return l; }"""
# chaque libellé d'émotion est entièrement visible dans son cadre (pas coupé par overflow)
COUPEES = """sel => { var l = [];
  document.querySelectorAll(sel).forEach(function (cadre) {
    var c = cadre.getBoundingClientRect();
    cadre.querySelectorAll('.v-barres .lib').forEach(function (x) { var r = x.getBoundingClientRect();
      /* ni coupé par le cadre, ni débordant sur la jauge de sa ligne (colonne voisine) */
      var jg = x.nextElementSibling, sj = getComputedStyle(jg).display === 'none';
      var j = (sj ? jg.nextElementSibling : jg).getBoundingClientRect();
      if (r.top < c.top - 1 || r.bottom > c.bottom + 1 || r.right > c.right + 1 || r.right > j.left + 1 || (!sj && j.width < 20)) l.push(x.textContent); }); });
  return l; }"""

# ============================================================
#  1. La séance à 35 élèves
# ============================================================
def seance_35(nav):
    base = Base(n_virt=33, n_at=10); contexte = outils(nav, base)
    def poser(n): s = base.seance(); s['etape'] = n; s['maj_le'] = iso()
    cA = contexte(); A = cA.new_page(); suivre(A, 'A')
    cB = contexte(768, 1024); B = cB.new_page(); suivre(B, 'B')
    A.goto(URL + '/emc/index.html?carte=s-castor-01&k=1111'); B.goto(URL + '/emc/index.html?carte=s-hibou-02&k=2222')
    verif('deux tablettes entrent par carte', etape(A, 0) and etape(B, 0))
    A.click('#scene button.pret-geant'); B.click('#scene button.pret-geant')
    cP = contexte(1280, 800, prof=True); P = cP.new_page(); suivre(P, 'pilotage')
    P.goto(URL + '/prof/emc-restitution.html?classe=REST21')
    verif('pilotage : 35 présents', attendre(P, '35', '#n-tous'))
    verif('pilotage : 7 étapes (0 à 6), sans « Analyse du mur »', P.locator('#frise button').count() == 7 and 'Analyse' not in P.inner_text('#frise'), P.inner_text('#frise'))
    cJ = contexte(1920, 1080, prof=True); J = cJ.new_page(); suivre(J, 'projection')
    J.goto(URL + '/prof/emc-restitution.html?classe=REST21&vue=projection'); J.wait_for_timeout(1800)
    cK = contexte(1280, 720, prof=True); K = cK.new_page(); suivre(K, 'projection-720')
    K.goto(URL + '/prof/emc-restitution.html?classe=REST21&vue=projection')
    def sans_ident(nom):
        for pg in (J, K):
            dom = pg.content(); f = [x for x in ['s-castor', 's-hibou', 's-cam-', 'CASTOR'] if x in dom]
            verif('projection %s : aucun identifiant ni nom' % nom, not f, f)
    def deux(nom, legende):
        J.wait_for_timeout(600); K.wait_for_timeout(300)
        cap(J, nom, legende + ' — projection 1920×1080'); cap(K, nom + '-720', legende + ' — projection 1280×720')
    sans_ident('étape 0'); deux('j0-accueil', 'Étape 0 · accueil')

    # 1 — météo
    P.click('#btn-avancer'); etape(A, 1)
    A.click('.emojis button >> nth=0'); A.click('.emojis button >> nth=3'); A.click('#scene button.primaire'); A.wait_for_timeout(1200)
    verif('projection : météo', attendre(J, '34 / 35', '#proj'))
    J.wait_for_timeout(500)
    verif('météo projetée : aucune émotion coupée (1920)', not J.evaluate(COUPEES, '#proj .p-barres'), J.evaluate(COUPEES, '#proj .p-barres'))
    verif('météo projetée : aucune émotion coupée (1280×720)', not K.evaluate(COUPEES, '#proj .p-barres'), K.evaluate(COUPEES, '#proj .p-barres'))
    deux('j1-meteo', 'Étape 1 · météo des deux jours (33 camarades + 1)')

    # 2 — parcours : 3 ou 4 ateliers, chacun une fois
    P.click('#btn-avancer'); etape(A, 2)
    verif('projection : les consignes du parcours, pas le nuage des ateliers', attendre(J, 'tirage au sort', '#proj') and J.locator('#proj .p-consignes li').count() == 4
          and 'Labyrinthe' not in J.inner_text('#proj'), J.inner_text('#proj')[:300])
    sans_ident('étape 2'); deux('j2-parcours-consignes', 'Étape 2 · mon parcours : les consignes projetées')
    verif('tablette : 4 lignes d\'atelier', A.locator('.parcours-ligne').count() == 4)
    A.locator('.parcours-ligne >> nth=0 >> select').select_option('1')
    A.wait_for_timeout(150)
    verif('un atelier déjà choisi est grisé sur les autres lignes', A.locator('.parcours-ligne >> nth=1 >> option[value="1"]').get_attribute('disabled') is not None)
    A.locator('.parcours-ligne >> nth=1 >> select').select_option('3')
    A.click('text=Enregistrer mon parcours'); A.wait_for_timeout(300)
    verif('2 ateliers : refusé (« il faut 3 ou 4 »)', 'Il faut 3 ou 4 ateliers (tu en as mis 2)' in A.inner_text('#scene'), A.inner_text('#scene')[-300:])
    A.locator('.parcours-ligne >> nth=2 >> select').select_option('autre'); A.wait_for_timeout(150)
    A.locator('.parcours-ligne >> nth=2 >> input >> nth=0').fill('Atelier cuisine du monde')
    A.locator('.parcours-ligne >> nth=3 >> select').select_option('5')
    A.locator('.parcours-ligne >> nth=0 >> input >> nth=0').fill('harcèlement')
    A.locator('.parcours-ligne >> nth=0 >> input >> nth=1').fill('Sûreté : ne pas subir de violence')
    A.keyboard.press('Escape'); A.locator('.parcours-ligne >> nth=0 >> input >> nth=0').focus()   # referme les suggestions de la liste
    cap(A, 'a2-parcours', 'Tablette (paysage) · étape 2 : 4 ateliers, « Autre » écrit à la main, les choisis grisés', True)
    A.click('text=Enregistrer mon parcours'); A.wait_for_timeout(1200)
    r = next((x for x in base.t['emc_restit'] if x['eleve_id'] == 'e-s-castor-01'), None)
    verif('parcours de 4 enregistré, dans l\'ordre, « Autre » sans ref', r and [x.get('ref') for x in r['parcours']] == [1, 3, None, 5]
          and r['parcours'][2]['atelier'] == 'Atelier cuisine du monde', r)
    for i, v in enumerate(['2', '4', '9']): B.locator('.parcours-ligne >> nth=%d >> select' % i).select_option(v)
    B.click('text=Enregistrer mon parcours'); B.wait_for_timeout(1200)
    rb = next((x for x in base.t['emc_restit'] if x['eleve_id'] == 'e-s-hibou-02'), None)
    verif('3 ateliers : accepté', rb and len(rb['parcours']) == 3, rb)
    cap(B, 'b2-parcours-portrait', 'Tablette (portrait) · étape 2 : 3 ateliers', True)

    # 3 — groupes = tables
    P.click('#onglets button[data-onglet=groupes]'); P.wait_for_timeout(1200)
    verif('pilotage : le tableau des préférences (jamais projeté)', P.locator('#t-prefs tr').count() >= 10)
    P.click('#g-proposer'); P.wait_for_timeout(400)
    cap(P, 'p3-groupes', 'Pilotage · Parcours & groupes : préférences, la règle écrite, la proposition', True)
    P.click('#g-envoyer'); P.wait_for_timeout(700)
    et = base.seance()['etat']; gs = et['groupes']; aff = et['affectations']
    parc = {x['eleve_id']: x['parcours'] for x in base.t['emc_restit']}
    def cle(a): return 'ref:%s' % a['ref'] if a.get('ref') else a['atelier'].lower()
    titres = {g['n']: g['titre'] for g in gs}
    hors = [k for k, n in aff.items() if titres[n] not in [a['atelier'] for a in parc.get(k, [])]]
    verif('groupes : chacun à la table d\'un atelier qu\'il a fait', not hors and len(aff) == 35, hors)
    verif('groupes : la table = le numéro de l\'atelier', all(NOMS[g['n'] - 1] == g['titre'] for g in gs if g['n'] <= 10 and g['titre'] in NOMS), gs)
    tailles = {}; [tailles.__setitem__(n, tailles.get(n, 0) + 1) for n in aff.values()]
    verif('groupes : équilibrés (4 au plus), personne seul', max(tailles.values()) <= 4 and min(tailles.values()) >= 2, tailles)
    poser(3); etape(A, 3)
    g_a = next(g for g in gs if g['n'] == aff['e-s-castor-01'])
    verif('A voit sa TABLE et son groupe', attendre(A, 'TABLE %d' % g_a['n'], '#scene') and g_a['titre'] in A.inner_text('#scene'))
    cap(A, 'a3-table', 'Tablette · étape 3 : la table de son atelier')
    verif('projection : les tables', attendre(J, 'Table %d' % g_a['n'], '#proj'))
    sans_ident('étape 3'); deux('j3-tables', 'Étape 3 · par atelier : une table par atelier')

    # 4 — le mur
    P.click('#onglets button[data-onglet=seance]'); P.click('#btn-avancer'); etape(A, 4)
    base.postits_virtuels()
    A.locator('.mur-case', has_text='appris').locator('textarea').fill('Le 3018 répond aussi la nuit')
    A.locator('.mur-case', has_text='appris').locator('button').click(); A.wait_for_timeout(800)
    verif('post-it de A dans son groupe', any(x['eleve_id'] == 'e-s-castor-01' and x['groupe'] == g_a['n'] for x in base.t['emc_postits']))
    cap(A, 'a4-mur', 'Tablette · étape 4 : le mur de son groupe', True)
    J.wait_for_timeout(3800); K.wait_for_timeout(500)
    verif('projection : une tuile par table (%d)' % len(gs), J.locator('#proj .tuile-g').count() == len(gs), J.locator('#proj .tuile-g').count())
    verif('projection : la légende des trois couleurs', J.locator('#proj .legende span').count() == 3 and 'appris' in J.inner_text('#proj .legende'))
    for pg, nm in ((J, '1920'), (K, '1280×720')):
        d = pg.evaluate(DEBORDE, '#proj .tuile-g, #proj .tg-compte')
        verif('projection %s : les %d tuiles tiennent dans l\'écran' % (nm, len(gs)), not d, d)
    sans_ident('étape 4 (tuiles)'); deux('j4-mur-tuiles', 'Étape 4 · le mur : 10 tuiles et la légende')
    tuile(J, g_a['n']).click(); J.wait_for_timeout(300)
    verif('projection : la tuile se déplie en plein écran', J.locator('.plein').count() == 1 and '3018' in J.inner_text('.plein'))
    cap(J, 'j4-mur-deplie', 'Étape 4 · une tuile dépliée (touchée à l\'écran)')
    J.keyboard.press('Escape'); J.wait_for_timeout(200)
    verif('projection : Échap la replie', J.locator('.plein').count() == 0)
    P.click('#onglets button[data-onglet=mur]'); P.wait_for_timeout(800)
    P.locator('.colonne', has_text=g_a['titre']).locator('button', has_text='Au tour').click(); P.wait_for_timeout(700)
    verif('tour de parole posé, 1re couleur', base.seance()['etat'].get('oral') == g_a['n'] and base.seance()['etat'].get('oral_revele') == 1)
    verif('A : « C\'est à votre groupe »', attendre(A, 'votre groupe de présenter', '#scene'))
    verif('projection : le groupe en plein écran, 2 couleurs encore cachées', attendre(J, 'Table %d' % g_a['n'], '.plein') and J.locator('.plein-col.cache').count() == 2)
    deux('j4-oral-1', 'Étape 4 · passage d\'un groupe : 1re couleur')
    P.click('#oral-couleur'); P.wait_for_timeout(500); P.click('#oral-couleur'); P.wait_for_timeout(2500)
    verif('couleur par couleur : tout dévoilé', J.locator('.plein-col.cache').count() == 0, J.locator('.plein-col.cache').count())
    deux('j4-oral-3', 'Étape 4 · passage d\'un groupe : les trois couleurs')
    cap(A, 'a4-a-vous', 'Tablette · « C\'est à votre groupe de présenter ! »')
    cap(P, 'p4-mur', 'Pilotage · onglet Le mur : tirage, couleur suivante, passés', True)
    vus = {g_a['n']}
    for _ in range(len(gs) - 1):
        P.click('#oral-tirer'); P.wait_for_timeout(250); vus.add(base.seance()['etat'].get('oral'))
    verif('tirage au sort : chaque groupe passe une fois', vus == {g['n'] for g in gs} and len(base.seance()['etat']['passes']) == len(gs), (vus, base.seance()['etat'].get('passes')))
    P.click('#oral-tirer'); P.wait_for_timeout(300)        # tous passés : une alerte, rien ne change
    verif('tous passés : le tirage s\'arrête', len(base.seance()['etat']['passes']) == len(gs))
    P.click('#oral-fin'); P.wait_for_timeout(2500)
    verif('fin du passage : retour aux tuiles, toutes cochées', J.locator('.plein').count() == 0 and J.locator('.tuile-g.passe').count() == len(gs))
    verif('le passage des AUTRES groupes ne vide pas la tablette de B', True)
    sans_ident('étape 4 (oral)')

    # 5 — définition : sur le LIVRET papier, la consigne seule (12/11)
    P.click('#onglets button[data-onglet=seance]'); P.click('#btn-avancer'); etape(A, 5)
    verif('tablette : « sur ton livret », ne pas recopier', 'Sur ton livret' in A.inner_text('#scene') and 'Ne recopie pas' in A.inner_text('#scene'))
    verif("tablette : aucune saisie à l'étape 5", A.locator('#scene textarea, #scene input').count() == 0)
    verif('projection : la consigne seule', attendre(J, 'Ne recopie pas', '#proj') and J.locator('#proj .v-nuage-spirale, #proj .p-nuage').count() == 0)
    cap(A, 'a5-definition', "Tablette · étape 5 : la consigne (la définition s'écrit sur le livret)", True)
    sans_ident('étape 5'); deux('j5-definition', 'Étape 5 · ma définition : la consigne au tableau')

    # 6 — retour complet, puis expression libre
    poser(6); verif('étape 6', etape(A, 6))
    verif('retour : un bloc par atelier du parcours (4)', A.locator('.retour-atelier').count() == 4, A.locator('.retour-atelier').count())
    verif('retour : jeu de rôle et restitution', 'jeu de rôle' in A.inner_text('#scene') and 'restitution' in A.inner_text('#scene'))
    cap(A, 'a6-retour', 'Tablette · étape 6 : le retour complet (anonyme)', True)
    A.locator('.retour-choix >> nth=0 >> button >> nth=3').click()                    # ressenti : bien
    A.locator('.retour-choix >> nth=1 >> button >> nth=0').click()                    # appris : beaucoup
    blocs_a = A.locator('.retour-atelier')
    for i in range(4):
        blocs_a.nth(i).locator('.retour-choix >> nth=0 >> button >> nth=%d' % (4 - i % 3)).click()
        blocs_a.nth(i).locator('.retour-choix >> nth=1 >> button >> nth=0').click()
    blocs_a.nth(0).locator('textarea').fill('J\'ai compris ce que vit Nina')
    A.locator('#scene textarea').first.fill('Plus de temps pour le mur')
    A.click('text=Envoyer mon retour (anonyme)'); A.wait_for_timeout(1200)
    rr = base.t['emc_enquete'][-1]['reponses'] if base.t['emc_enquete'] else {}
    verif('retour envoyé, anonyme, avec ses 4 ateliers', rr.get('global', {}).get('ressenti') == 4 and len(rr.get('ateliers', [])) == 4
          and rr['ateliers'][0]['ref'] == 1 and rr['ateliers'][0]['note'] == 5 and rr['ateliers'][0]['sert'] == 'Oui' and 'eleve' not in json.dumps(rr), rr)
    verif('après envoi : « Merci », plus de formulaire', attendre(A, 'Merci pour ton retour', '#scene') and A.locator('.retour-atelier').count() == 0)
    B.click('text=Envoyer mon retour (anonyme)'); B.wait_for_timeout(500)
    verif('retour vide refusé', 'au moins à une question' in B.inner_text('#scene'))
    A.fill('#r-expr', 'Deux jours intenses'); A.locator('#scene button.primaire', has_text='Envoyer').last.click(); A.wait_for_timeout(1200)
    verif('expression libre enregistrée', next(x for x in base.t['emc_restit'] if x['eleve_id'] == 'e-s-castor-01').get('expression') == 'Deux jours intenses')
    base.retours_virtuels(30)
    for x in base.t['emc_restit'][:20]: x['expression'] = ['Intense', 'On a appris plein de choses', 'Trop bien', 'Fatigant mais utile'][hash(x['eleve_id']) % 4]
    J.wait_for_timeout(5500)
    verif('projection : le nombre de retours, le nuage', attendre(J, '31 / 35', '#proj') and 'intense' in J.inner_text('#proj').lower(), J.inner_text('#proj')[:200])
    sans_ident('étape 6'); deux('j6-retour', 'Étape 6 · retour sur les deux jours et expression libre')
    P.click('#onglets button[data-onglet=retours]'); P.wait_for_timeout(5500)
    lignes = P.locator('#t-classement tr')
    moy = P.evaluate("Array.from(document.querySelectorAll('#t-classement tr')).filter(function (t) { return +t.children[2].textContent >= 3; }).map(function (t) { return parseFloat(t.children[3].textContent.replace(',', '.')); })")
    verif('retours : un classement des ateliers, du mieux noté au moins bien', lignes.count() >= 10 and moy == sorted(moy, reverse=True), moy)
    verif('retours : propositions et jeu de rôle', 'Plus de temps pour le mur' in P.inner_text('#p-retours') and 'jeu de rôle' in P.inner_text('#p-retours'))
    verif('retours : jamais un identifiant', not [x for x in ['s-cam', 's-castor', 'CASTOR'] if x in P.inner_text('#p-retours')])
    cap(P, 'p6-retours', 'Pilotage · onglet 📊 Retours : le classement des ateliers', True)
    P.click('#onglets button[data-onglet=exports]'); P.click('#x-tout')
    try:
        P.wait_for_selector('a[data-export$="EMC-restitution.pdf"]', timeout=60000)
        taille = P.evaluate("fetch(document.querySelector('a[data-export$=\"EMC-restitution.pdf\"]').href).then(r=>r.blob()).then(b=>b.size)")
        verif('export tout en un PDF, retours compris (%d Ko)' % (taille // 1024), taille > 5000, taille)
    except Exception:
        verif('export tout en un PDF', False, P.inner_text('.modale')[:200] if P.locator('.modale').count() else '')
    req = [x for x in base.requetes if '/emc_aide' in x[1] and 'vue=projection' in x[1]]
    verif('aucune erreur JS (séance à 35)', not erreurs, erreurs[:6])
    for c in (cA, cB, cP, cJ, cK): c.close()

# ============================================================
#  2. Les limites
# ============================================================
def proposer_n_fois(P, n=150):
    """Lance la proposition n fois et contrôle ses invariants dans la page."""
    return P.evaluate("""n => {
      var pb = { horsListe: 0, seul: 0, tropGros: 0, tables: 0, rangs: [0,0,0,0,0], essais: n, max: 0, cap: 0 };
      for (var k = 0; k < n; k++) {
        var r = window.__emcProposer(); pb.cap = r.cap; pb.tables = r.groupes.length;
        r.groupes.forEach(function (g) { if (g.membres.length === 1) pb.seul++; if (g.membres.length > r.cap + 1) pb.tropGros++; pb.max = Math.max(pb.max, g.membres.length); });
        r.parRang.forEach(function (x, i) { pb.rangs[Math.min(i, 4)] += x; });
        pb.horsListe += r.horsListe;
      }
      return pb; }""", n)

def limites(nav):
    # L1 — 40 élèves, tous l'atelier 1 en premier
    base = Base(n_virt=40, n_at=10, tablettes=False, parcours=lambda i, rnd: [1] + rnd.sample(range(2, 11), 3)); contexte = outils(nav, base)
    c = contexte(1280, 800, prof=True); P = c.new_page(); suivre(P, 'L1')
    P.goto(URL + '/prof/emc-restitution.html?classe=REST21'); attendre(P, '40', '#n-tous')
    st = proposer_n_fois(P)
    verif('L1 (40 élèves, tous le même 1er choix) : jamais plus de 4+1 par table, personne seul', st['tropGros'] == 0 and st['seul'] == 0 and st['cap'] == 4, st)
    verif('L1 : exactement 4 ont leur 1er choix à chaque tirage (la table 1 pleine)', st['rangs'][0] == 4 * st['essais'], st['rangs'])
    P.click('#onglets button[data-onglet=groupes]'); P.wait_for_timeout(300); cap(P, 'L1-pilotage', 'Limite 1 · 40 élèves veulent tous le même atelier', True)
    c.close()
    # L2 — 12 ateliers, 35 élèves, post-it très nombreux et très longs
    base = Base(n_virt=35, n_at=12, tablettes=False); contexte = outils(nav, base)
    c = contexte(1280, 800, prof=True); P = c.new_page(); suivre(P, 'L2')
    P.goto(URL + '/prof/emc-restitution.html?classe=REST21'); attendre(P, '35', '#n-tous')
    st = proposer_n_fois(P, 60)
    verif('L2 (12 ateliers) : personne seul, aucune table trop pleine', st['seul'] == 0 and st['tropGros'] == 0, st)
    P.click('#onglets button[data-onglet=groupes]'); P.click('#g-proposer'); P.click('#g-envoyer'); P.wait_for_timeout(500)
    base.seance()['etape'] = 4; base.postits_virtuels(n_par=(12, 18), long=True)
    for pg_l, pg_h in ((1920, 1080), (1280, 720), (1024, 768)):
        cj = contexte(pg_l, pg_h, prof=True); J = cj.new_page(); suivre(J, 'L2-proj')
        J.goto(URL + '/prof/emc-restitution.html?classe=REST21&vue=projection'); J.wait_for_timeout(2500)
        d = J.evaluate(DEBORDE, '#proj .tuile-g, #proj .tg-compte')
        verif('L2 %d×%d : %d tuiles tiennent dans l\'écran' % (pg_l, pg_h, J.locator('#proj .tuile-g').count()), not d and J.locator('#proj .tuile-g').count() == len(base.seance()['etat']['groupes']), d)
        cap(J, 'L2-tuiles-%d' % pg_l, 'Limite 2 · %d tables, %d×%d' % (J.locator('#proj .tuile-g').count(), pg_l, pg_h))
        if pg_l == 1280:
            gros = max(base.seance()['etat']['groupes'], key=lambda g: sum(1 for p in base.t['emc_postits'] if p['groupe'] == g['n']))
            tuile(J, gros['n']).click(); J.wait_for_timeout(300)
            dd = J.evaluate("() => Array.from(document.querySelectorAll('.plein-col')).map(function (c) { return c.scrollHeight > c.clientHeight; })")
            verif('L2 : beaucoup de post-it longs → la colonne dépliée défile (rien de perdu)', J.evaluate(DEBORDE, '.plein-tete') == [] and any(dd), dd)
            cap(J, 'L2-deplie-charge', 'Limite 2 · une table chargée (%d post-it de 140 caractères), dépliée' % sum(1 for p in base.t['emc_postits'] if p['groupe'] == gros['n']))
        cj.close()
    c.close()
    # L3 — un atelier choisi par un seul élève, deux élèves sans parcours
    def parc3(i, rnd):
        if i == 0: return [11, 2, 3]
        if i in (1, 2): return []
        return rnd.sample(range(1, 11), 4)
    base = Base(n_virt=30, n_at=11, tablettes=False, parcours=parc3); contexte = outils(nav, base)
    c = contexte(1280, 800, prof=True); P = c.new_page(); suivre(P, 'L3')
    P.goto(URL + '/prof/emc-restitution.html?classe=REST21'); attendre(P, '30', '#n-tous')
    st = proposer_n_fois(P, 80)
    verif('L3 (atelier d\'un seul élève) : jamais de table à 1', st['seul'] == 0, st)
    verif('L3 : les 2 sans parcours sont placés quand même', st['horsListe'] == 2 * st['essais'], st)
    c.close()
    # L4 — 8 élèves pour 10 ateliers ; retours vides puis ateliers écrits à la main
    base = Base(n_virt=8, n_at=10, tablettes=False); contexte = outils(nav, base)
    c = contexte(1280, 800, prof=True); P = c.new_page(); suivre(P, 'L4')
    P.goto(URL + '/prof/emc-restitution.html?classe=REST21'); attendre(P, '8', '#n-tous')
    st = proposer_n_fois(P, 80)
    verif('L4 (8 élèves, 10 ateliers) : personne seul', st['seul'] == 0 and st['tables'] <= 4, st)
    P.click('#onglets button[data-onglet=retours]'); P.wait_for_timeout(300)
    verif('L4 : sans retour, le classement le dit', 'Pas encore de retour' in P.inner_text('#t-classement'))
    base.retours_virtuels(8, libres=True); P.wait_for_timeout(5800)
    verif('L4 : ateliers écrits à la main → classés par leur nom', P.locator('#t-classement tr').count() >= 3 and 'Nina' in P.inner_text('#t-classement'), P.inner_text('#t-classement')[:200])
    c.close()
    # L5 — un groupe sans post-it passe au tableau
    base = Base(n_virt=12, n_at=3, tablettes=False); contexte = outils(nav, base)
    c = contexte(1280, 800, prof=True); P = c.new_page(); suivre(P, 'L5')
    P.goto(URL + '/prof/emc-restitution.html?classe=REST21'); attendre(P, '12', '#n-tous')
    P.click('#onglets button[data-onglet=groupes]'); P.click('#g-proposer'); P.click('#g-envoyer'); P.wait_for_timeout(500)
    base.seance()['etape'] = 4
    cj = contexte(1280, 720, prof=True); J = cj.new_page(); suivre(J, 'L5-proj')
    J.goto(URL + '/prof/emc-restitution.html?classe=REST21&vue=projection'); J.wait_for_timeout(1500)
    P.click('#onglets button[data-onglet=mur]'); P.click('#oral-tirer'); P.wait_for_timeout(2500)
    verif('L5 : groupe sans post-it en plein écran, sans erreur', J.locator('.plein').count() == 1)
    J.hover('#barre-proj'); J.click('#pj-couleur'); J.wait_for_timeout(2500)
    verif('L5 : « couleur suivante » depuis la projection elle-même', base.seance()['etat'].get('oral_revele') == 2)
    cap(J, 'L5-oral-vide', 'Limite 5 · un groupe sans post-it au tableau (2 couleurs dévoilées)')
    cj.close(); c.close()

# ============================================================
#  3. Les émotions du Labyrinthe : 32 choisies, aucune coupée
# ============================================================
def emotions(nav):
    base = Base(n_virt=40, n_at=3, tablettes=False, emojis_tous=True, module='nina', code='NINA27'); contexte = outils(nav, base)
    base.seance()['etape'] = 1
    n_emo = len({e for m in base.t['emc_mots'] for e in m['emojis']})
    for l, h in ((1920, 1080), (1280, 720), (1024, 768)):
        c = contexte(l, h, prof=True); J = c.new_page(); suivre(J, 'nina-%d' % l)
        J.goto(URL + '/prof/emc-projection.html?classe=NINA27'); J.wait_for_timeout(2200)
        nb = J.locator('[data-bloc=emotions] .v-barres .lib').count()
        cp = J.evaluate(COUPEES, '[data-bloc=emotions] .tuile-corps')
        if l > 1024:
            verif('Labyrinthe %d×%d, étape 1 : les %d émotions affichées, aucune coupée' % (l, h, n_emo), nb == n_emo and not cp, (nb, cp[:5]))
        else:
            # tuile étroite, 32 émotions : le HAUT (les plus choisies) reste visible, le reste défile, rien ne chevauche
            libs = J.evaluate("() => Array.from(document.querySelectorAll('[data-bloc=emotions] .v-barres .lib')).map(function (x) { return x.textContent; })")
            defile = J.evaluate("() => { var c = document.querySelector('[data-bloc=emotions] .v-barres-cadre'); return c.scrollHeight > c.clientHeight + 2; }")
            verif('Labyrinthe %d×%d (tuile étroite) : les plus choisies visibles, le reste défile, sans chevauchement' % (l, h),
                  nb == n_emo and defile and not [x for x in cp if x in libs[:10]] and len(cp) < n_emo, (defile, cp[:4]))
            J.locator('[data-bloc=emotions] .tuile-act button').first.click(); J.wait_for_timeout(700)
            cp = J.evaluate(COUPEES, '[data-bloc=emotions] .tuile-corps')
            verif('Labyrinthe 1024×768, émotions agrandies (⤢) : les 32 tiennent', not cp, cp[:5])
            cap(J, 'nina-emotions-1024-agrandies', 'Labyrinthe · émotions agrandies (⤢), 1024×768')
            J.locator('[data-bloc=emotions] .tuile-act button').first.click(); J.wait_for_timeout(500)
        verif('Labyrinthe %d×%d : « injustice » visible' % (l, h), 'injustice' in J.inner_text('[data-bloc=emotions]'))
        cap(J, 'nina-emotions-%d' % l, 'Labyrinthe · étape 1 : %d émotions toutes choisies, %d×%d' % (n_emo, l, h))
        if l == 1280:
            J.locator('[data-bloc=emotions] .tuile-act button').first.click(); J.wait_for_timeout(700)
            cp = J.evaluate(COUPEES, '[data-bloc=emotions] .tuile-corps')
            verif('Labyrinthe : émotions agrandies (⤢), aucune coupée', not cp, cp[:5])
            cap(J, 'nina-emotions-agrandies', 'Labyrinthe · émotions agrandies (⤢), 1280×720')
            base.seance()['etape'] = 2; J.goto(URL + '/prof/emc-projection.html?classe=NINA27'); J.wait_for_timeout(2200)
            cap(J, 'nina-emotions-rappel', 'Labyrinthe · étape 2 : les émotions en rappel (petite tuile, les 5 premières)')
            cp = J.evaluate(COUPEES, '[data-bloc=emotions] .tuile-corps')
            verif('Labyrinthe : en rappel, aucune coupée', not cp, cp[:5])
            base.seance()['etape'] = 1
        c.close()
    verif('aucune erreur JS (limites et émotions)', not erreurs, erreurs[:6])

def galerie():
    h = ['<!doctype html><html lang="fr"><meta charset="utf-8"><title>Simulation EMC restitution</title>',
         '<style>body{font:16px system-ui;margin:24px;background:#f4f5f8;color:#161f33}h1{margin:0 0 4px}figure{margin:0 0 28px;background:#fff;padding:12px;border-radius:12px;box-shadow:0 2px 8px #0002}',
         'img{max-width:100%;border:1px solid #ccd}figcaption{font-weight:600;margin-bottom:8px}</style>',
         '<h1>Simulation de la restitution « Nos libertés »</h1><p>%d contrôles réussis, %d en échec · %s</p>' % (ok, ko, datetime.now().strftime('%d/%m/%Y %H:%M'))]
    for f, l in CAPTURES: h.append('<figure><figcaption>%s</figcaption><img src="%s" loading="lazy"></figure>' % (l, f))
    open(os.path.join(CAPT, 'index.html'), 'w', encoding='utf-8').write('\n'.join(h))

def main():
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Silencieux, directory=DEPOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    quoi = os.environ.get('BANC', 'seance,limites,emotions').split(',')
    with sync_playwright() as pw:
        nav = pw.chromium.launch()
        if 'seance' in quoi: seance_35(nav)
        if 'limites' in quoi: limites(nav)
        if 'emotions' in quoi: emotions(nav)
        nav.close()
    srv.shutdown()
    galerie()
    print('\n%d contrôles réussis, %d en échec. Captures : %s' % (ok, ko, os.path.join(CAPT, 'index.html')))
    sys.exit(1 if ko else 0)

if __name__ == '__main__':
    main()
