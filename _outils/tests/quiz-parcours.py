"""Parcours complet du quiz au navigateur, sur la VRAIE logique du 047.

    python _outils/tests/quiz-parcours.py [dossier_captures]

Ce que fait le banc :
  · un Postgres local et jetable, avec les doublures de Supabase et le 047
    (même montage que quiz-base.py) ;
  · le site servi en local, comme GitHub Pages ;
  · Playwright intercepte TOUT ce qui part vers Supabase : les appels
    rpc/… sont rejoués en base sous le rôle anon ou authenticated (RLS et
    droits réels), les lectures rest/… passent par un mini-PostgREST, le
    WebSocket du temps réel par un relais Phoenix minimal. Aucune requête
    ne sort de la machine (toute autre adresse externe est refusée et
    comptée comme une faute : c'est aussi le contrôle « aucun CDN »).
  · un écran enseignant + une classe de téléphones jouent un quiz qui
    couvre les cinq types, le pari, une exclusion, un élève en retard, un
    rechargement en pleine question et une question laissée sans réponse.

Prérequis : PostgreSQL (scoop), Playwright Python, et psycopg — installé
à part, par exemple :  pip install --target <dossier> "psycopg[binary]"
puis QUIZ_PYLIB=<dossier>.
"""
import base64
import functools
import http.server
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path
from urllib.parse import urlparse, parse_qsl

if os.environ.get('QUIZ_PYLIB'):
    sys.path.insert(0, os.environ['QUIZ_PYLIB'])
import psycopg                                    # noqa: E402
from psycopg import sql                           # noqa: E402
from playwright.sync_api import sync_playwright   # noqa: E402

RACINE = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).parent))
import importlib.util                             # noqa: E402
_spec = importlib.util.spec_from_file_location('quiz_base', Path(__file__).with_name('quiz-base.py'))
qb = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(qb)

SUPA = 'https://ztyvuiaohxekuyjeoaxz.supabase.co'
PROF = '00000000-0000-0000-0000-0000000000a1'
CAPTURES = Path(sys.argv[1]) if len(sys.argv) > 1 else None
FAUTES = []

QUIZ = {
    'slug': 'banc-parcours', 'titre': 'Banc — puissance et unités', 'niveau': 'BTS MS 1',
    'questions': [
        {'type': 'qcm', 'enonce': 'Quelle grandeur se mesure en **watts** ?', 'notion': 'Énergie', 'temps': 15,
         'options': ['L\'énergie', 'La force', 'La puissance', 'La pression'], 'correct': [2],
         'pourquoi': ['L\'énergie se mesure en joules.', 'La force se mesure en newtons.', None, 'La pression se mesure en pascals.'],
         'cours': '$P = \\dfrac{E}{\\Delta t}$ : un watt, c\'est un joule par seconde.'},
        {'type': 'vf', 'enonce': 'Un kilowattheure est une unité de puissance.', 'notion': 'Énergie', 'temps': 6,
         'correct': [1], 'pourquoi': ['Le kWh est une énergie : une puissance multipliée par une durée.', None]},
        {'type': 'num', 'enonce': 'Vitesse après $t = 2{,}0$ s de chute libre ($g = 9{,}81\\ \\text{m·s}^{-2}$) ?',
         'notion': 'Mécanique', 'temps': 30,
         'num': {'valeur': 19.6, 'tolerance': 0.03, 'unite': 'm/s', 'unites': ['m/s', 'km/h', 'm/s²'],
                 'autres': [{'valeur': 70.6, 'unite': 'km/h'}],
                 'pieges': [{'valeur': 9.81, 'message': '9,81, c\'est $g$ : il faut multiplier par la durée.'}]},
         'cours': '$v = g\\,t$'},
        {'type': 'ordre', 'enonce': 'Range du plus petit au plus grand.', 'notion': 'Unités', 'temps': 30,
         'items': ['1 mm', '1 cm', '1 m', '1 km']},
        {'type': 'zone', 'enonce': 'Touche le quart haut gauche de l\'image.', 'notion': 'Lecture d\'image', 'temps': 30,
         'zone': {'src': 'assets/img/auteur/quizeo-figure.jpg', 'alt': 'figure', 'cibles': [{'x': 0, 'y': 0, 'l': 50, 'h': 50}]}},
        {'type': 'qcm', 'enonce': 'Lesquelles sont des unités d\'énergie ?', 'notion': 'Énergie', 'temps': 30,
         'options': ['J', 'W', '$\\text{kW}\\cdot\\text{h}$', 'N'], 'correct': [0, 2]},
        {'type': 'assoc', 'enonce': 'Associe chaque grandeur à son unité.', 'notion': 'Unités', 'temps': 40,
         'paires': [['Puissance', 'watt'], ['Énergie', 'joule'], ['Force', 'newton'], ['Pression', 'pascal']]},
        {'type': 'mot', 'enonce': 'Quel gaz de l\'air entretient une combustion ?', 'notion': 'Combustion', 'temps': 30,
         'mot': {'acceptes': ['dioxygène', 'O2'], 'indice': 'un seul mot',
                 'pieges': [{'mot': 'oxygène', 'message': 'L\'oxygène est un élément ; le gaz est le **di**oxygène, O₂.'}]}},
        {'type': 'curseur', 'enonce': 'Quelle part de l\'air est du dioxygène ?', 'notion': 'Combustion', 'temps': 30,
         'curseur': {'min': 0, 'max': 100, 'pas': 1, 'valeur': 21, 'tolerance': 1, 'marge': 6, 'unite': '%'}},
    ]
}
ELEVES = ['Inès B.', 'Hugo L.', 'Jade M.', 'Nathan P.', 'Chloé R.', 'Lucas D.', 'Manon T.', 'Adam K.']


def juste_pour(k, i):
    return (k + i) % 3 != 0


# ------------------------------------------------------------------
#  La base locale
# ------------------------------------------------------------------
class Base:
    def __init__(self):
        self.dossier = Path(tempfile.mkdtemp(prefix='quiz-pg-'))
        self.port = qb.port_libre()
        subprocess.run([qb.binaire('initdb'), '-D', str(self.dossier / 'data'), '-U', 'postgres', '-A', 'trust',
                        '-E', 'UTF8', '--locale=C'], check=True, capture_output=True)
        subprocess.run([qb.binaire('pg_ctl'), '-D', str(self.dossier / 'data'), '-o',
                        f'-p {self.port} -c listen_addresses=127.0.0.1 -c lc_messages=C',
                        '-l', str(self.dossier / 'log.txt'), '-w', 'start'], check=True,
                       stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.c = psycopg.connect(f'host=127.0.0.1 port={self.port} user=postgres dbname=postgres', autocommit=True)
        self.c.execute(qb.DOUBLURES)
        self.c.execute((RACINE / 'bdd' / 'schema' / '047-quiz.sql').read_text(encoding='utf-8'))
        self.c.execute((RACINE / 'bdd' / 'schema' / '048-quiz-renommer.sql').read_text(encoding='utf-8'))
        self.c.execute('insert into auth.users values (%s)', (PROF,))
        self.c.execute('insert into public.enseignants values (%s)', (PROF,))
        self.c.autocommit = False
        self.fonctions = {}
        for nom, noms, types, ret in self.c.execute(
                "select proname, proargnames, proargtypes::regtype[]::text[], prorettype::regtype::text "
                "from pg_proc where pronamespace = 'public'::regnamespace"):
            self.fonctions[nom] = (dict(zip(noms or [], types or [])), ret)
        self.c.commit()
        self.verrou = threading.RLock()

    def fermer(self):
        try:
            self.c.close()
        finally:
            subprocess.run([qb.binaire('pg_ctl'), '-D', str(self.dossier / 'data'), '-m', 'immediate', 'stop'],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            shutil.rmtree(self.dossier, ignore_errors=True)

    def sous(self, role, sub):
        cur = self.c.cursor()
        cur.execute(sql.SQL('set local role {}').format(sql.Identifier(role)))
        cur.execute("select set_config('request.jwt.claims', %s, true)",
                    (json.dumps({'sub': sub, 'role': role}) if sub else json.dumps({'role': role}),))
        return cur

    def rpc(self, role, sub, nom, params):
        args, ret = self.fonctions[nom]
        morceaux, valeurs = [], []
        for k, v in params.items():
            if v is None:
                continue
            t = args[k]
            morceaux.append(sql.SQL('{} => %s::' + t).format(sql.Identifier(k)))
            valeurs.append(json.dumps(v) if t == 'jsonb' else str(v).lower() if isinstance(v, bool) else str(v))
        appel = sql.SQL('public.{}({})').format(sql.Identifier(nom), sql.SQL(', ').join(morceaux))
        requete = sql.SQL('select {}').format(appel) if ret == 'void' else sql.SQL('select to_jsonb({})').format(appel)
        with self.verrou:
            try:
                cur = self.sous(role, sub)
                cur.execute(requete, valeurs)
                r = cur.fetchone()[0] if ret != 'void' else None
                self.c.commit()
                return 200, r
            except psycopg.Error as e:
                self.c.rollback()
                return 400, {'message': e.diag.message_primary, 'code': e.sqlstate}

    def rest(self, role, sub, methode, table, q):
        colonnes = sql.SQL('*')
        if q.get('select', '*') != '*':
            colonnes = sql.SQL(', ').join(sql.Identifier(c) for c in q['select'].split(','))
        where, valeurs = [], []
        for k, v in q.items():
            if k in ('select', 'order', 'limit'):
                continue
            op, _, val = v.partition('.')
            col = sql.Identifier(k)
            if op == 'eq':
                where.append(sql.SQL('{} = %s').format(col)); valeurs.append(val)
            elif op == 'gt':
                where.append(sql.SQL('{} > %s').format(col)); valeurs.append(val)
            elif op == 'is' and val == 'null':
                where.append(sql.SQL('{} is null').format(col))
            elif op == 'in':
                liste = val.strip('()').split(',')
                where.append(sql.SQL('{}::text = any(%s)').format(col)); valeurs.append(liste)
            else:
                raise ValueError(f'filtre non géré : {k}={v}')
        cond = sql.SQL(' where ') + sql.SQL(' and ').join(where) if where else sql.SQL('')
        tbl = sql.Identifier('public', table)
        with self.verrou:
            try:
                cur = self.sous(role, sub)
                if methode == 'DELETE':
                    cur.execute(sql.SQL('delete from {}{}').format(tbl, cond), valeurs)
                    self.c.commit()
                    return 204, None
                tri = sql.SQL('')
                if 'order' in q:
                    c, _, sens = q['order'].partition('.')
                    tri = sql.SQL(' order by {} {}').format(sql.Identifier(c), sql.SQL('desc' if sens == 'desc' else 'asc'))
                lim = sql.SQL(' limit {}').format(sql.Literal(int(q['limit']))) if 'limit' in q else sql.SQL('')
                cur.execute(sql.SQL('select coalesce(json_agg(t), {}) from (select {} from {}{}{}{}) t').format(
                    sql.Literal('[]'), colonnes, tbl, cond, tri, lim), valeurs)
                r = cur.fetchone()[0]
                self.c.commit()
                return 200, r
            except psycopg.Error as e:
                self.c.rollback()
                return 400, {'message': e.diag.message_primary, 'code': e.sqlstate}


# ------------------------------------------------------------------
#  L'interception
# ------------------------------------------------------------------
def jwt(sub):
    b = lambda d: base64.urlsafe_b64encode(json.dumps(d).encode()).decode().rstrip('=')
    return b({'alg': 'HS256'}) + '.' + b({'sub': sub, 'role': 'authenticated', 'exp': int(time.time()) + 3600}) + '.sig'


def qui(entetes):
    tok = (entetes.get('authorization') or '').replace('Bearer ', '')
    try:
        p = tok.split('.')[1]
        d = json.loads(base64.urlsafe_b64decode(p + '=' * (-len(p) % 4)))
    except Exception:
        return 'anon', None
    return ('authenticated', d['sub']) if d.get('role') == 'authenticated' else ('anon', None)


class Relais:
    """Relais Phoenix minimal : rejoindre un canal, battement, diffusion."""
    def __init__(self):
        self.abonnes = {}      # topic -> [ws]
        self.diffusions = 0
        self.abonnements = 0

    def brancher(self, ws):
        def recu(message):
            m = json.loads(message)
            topic, ev, ref = m.get('topic'), m.get('event'), m.get('ref')
            reponse = {'topic': topic, 'event': 'phx_reply', 'payload': {'status': 'ok', 'response': {}},
                       'ref': ref, 'join_ref': m.get('join_ref')}
            if ev == 'phx_join':
                self.abonnes.setdefault(topic, []).append(ws); self.abonnements += 1
                reponse['payload']['response'] = {'postgres_changes': []}
                ws.send(json.dumps(reponse))
            elif ev in ('heartbeat', 'phx_leave', 'access_token'):
                ws.send(json.dumps(reponse))
            elif ev == 'broadcast':
                self.diffuser(topic, m.get('payload'), ws)
                ws.send(json.dumps(reponse))
        ws.on_message(recu)

    def diffuser(self, topic, payload, sauf=None):
        self.diffusions += 1
        for w in list(self.abonnes.get(topic, [])):
            if w is sauf:
                continue
            try:
                w.send(json.dumps({'topic': topic, 'event': 'broadcast', 'payload': payload, 'ref': None}))
            except Exception:
                pass


def brancher_contexte(ctx, base, relais, stats):
    def gerer(route):
        req = route.request
        u = urlparse(req.url)
        if not req.url.startswith(SUPA):
            if u.hostname in ('127.0.0.1', 'localhost'):
                return route.continue_()
            FAUTES.append('requête externe : ' + req.url)
            return route.abort()
        corps = req.post_data_json if req.post_data else {}
        role, sub = qui(req.headers)
        q = dict(parse_qsl(u.query))
        statut, r = 404, {'message': 'inconnu'}
        if u.path.startswith('/auth/v1/token'):
            statut, r = 200, {'access_token': jwt(PROF), 'refresh_token': 'r', 'expires_in': 3600,
                              'user': {'email': corps.get('email', '')}}
        elif u.path == '/auth/v1/logout':
            statut, r = 204, None
        elif u.path.startswith('/rest/v1/rpc/'):
            nom = u.path.rsplit('/', 1)[1]
            statut, r = base.rpc(role, sub, nom, corps or {})
            stats[nom] = stats.get(nom, 0) + 1
            if nom == 'quiz_etat' and statut == 200 and r and r.get('phase') == 'question':
                # 🔴 le contrôle central : rien de la correction ne sort pendant la question
                qpub = r.get('question', {})
                fuite = {'correct', 'pourquoi', 'cours', 'num', 'zone_cibles'} & set(qpub) or 'correction' in r \
                    or 'cibles' in json.dumps(qpub) or '"valeur"' in json.dumps(qpub)
                if fuite:
                    FAUTES.append('fuite de correction pendant la question : ' + json.dumps(r)[:300])
        elif u.path.startswith('/rest/v1/'):
            statut, r = base.rest(role, sub, req.method, u.path.rsplit('/', 1)[1], q)
        elif u.path == '/realtime/v1/api/broadcast':
            for m in (corps or {}).get('messages', []):
                relais.diffuser('realtime:' + m['topic'], {'type': 'broadcast', 'event': m['event'], 'payload': m['payload']})
            statut, r = 202, None
        # sans le 051 en base, la bibliothèque sonde quiz_categories et retombe sur la liste à plat
        sans_051 = statut == 400 and r.get('code') == '42P01' and u.path.endswith('/quiz_categories')
        if statut == 400 and not sans_051 and not re.match(r'QUIZ_', str(r.get('message'))):
            FAUTES.append(f'erreur SQL inattendue sur {u.path} : {r}')
        route.fulfill(status=statut, content_type='application/json',
                      body='' if r is None else json.dumps(r),
                      headers={'access-control-allow-origin': '*'})
    ctx.route('**/*', gerer)
    ctx.route_web_socket(re.compile(r'.*/realtime/v1/websocket.*'), relais.brancher)


# ------------------------------------------------------------------
#  Le parcours
# ------------------------------------------------------------------
def capture(page, nom):
    if CAPTURES:
        CAPTURES.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(CAPTURES / (nom + '.png')))


def verifier(cond, message):
    if not cond:
        FAUTES.append(message)
        print('  ✗', message)
    return cond


def attendre(pages, predicat, limite=40, pas=150):
    """Fait tourner les pages (Playwright sync ne traite les événements que
    pendant un appel) jusqu'à ce que le prédicat soit vrai."""
    fin = time.time() + limite
    while time.time() < fin:
        if predicat():
            return True
        pages[0].wait_for_timeout(pas)
    return False


def repondre_nouveaux(e, q, bon, part=False):
    """Association, mot, curseur : juste, faux, ou (part) à moitié."""
    t = q['type']
    if t == 'assoc':
        n = len(q['paires'])
        droite = e.evaluate("() => [...document.querySelectorAll('#assoc [data-d]')].map(b => b.lastElementChild.textContent.trim())")
        for i in range(n):
            j = i if bon or (part and i < n // 2) else ((i + 1) % n if not part else (i + 1 - n // 2) % (n - n // 2) + n // 2)
            e.click(f'#assoc [data-g="{i}"]')
            e.click(f'#assoc [data-d="{droite.index(q["paires"][j][1])}"]')
        e.click('#b-valider')
    elif t == 'mot':
        e.fill('#m-val', q['mot']['acceptes'][0].upper() if bon else q['mot']['pieges'][0]['mot'])
        e.click('#b-valider')
    elif t == 'curseur':
        c = q['curseur']
        v = c['valeur'] if bon else (c['valeur'] + 3 if part else c['max'])
        e.evaluate("v => { const r = document.querySelector('#c-val'); r.value = v; r.dispatchEvent(new Event('input')); }", v)
        e.click('#b-valider')


def repondre(e, q, bon):
    """Répond à la question affichée sur le téléphone e, juste ou faux."""
    t = q['type']
    if t in ('assoc', 'mot', 'curseur'):
        return repondre_nouveaux(e, q, bon)
    if t in ('qcm', 'vf') and len(q['correct']) == 1:
        cible = q['correct'][0] if bon else (q['correct'][0] + 1) % len(q.get('options', [0, 1]))
        e.click(f'#grille .rep[data-i="{cible}"]')
    elif t == 'qcm':
        for c in (q['correct'] if bon else [1]):
            e.click(f'#grille .rep[data-i="{c}"]')
        e.click('#b-valider')
    elif t == 'num':
        e.fill('#n-val', '19,6' if bon else '9,81'); e.select_option('#n-unite', 'm/s')
        e.click('#b-valider')
    elif t == 'ordre':
        ordre = q['items'] if bon else [q['items'][1], q['items'][0]] + q['items'][2:]
        for txt in ordre:
            e.locator('#ordre button', has_text=re.compile('^\\s*' + re.escape(txt) + '\\s*$')).click()
        e.click('#b-valider')
    elif t == 'zone':
        img = e.locator('#zone img'); img.wait_for()
        bb = img.bounding_box()
        fx = .25 if bon else .75
        e.mouse.click(bb['x'] + bb['width'] * fx, bb['y'] + bb['height'] * fx)
        e.click('#b-valider')


def salle_permanente(nav, base, relais, stats, site, prof):
    """Le QR code FIXE d'un quiz (Loïc, 15/11) : les élèves scannent avant le
    lancement et attendent, puis entrent d'eux-mêmes ; sans partie ouverte,
    un élève s'entraîne seul ; l'enseignant le retrouve dans ses statistiques."""
    print('· salle permanente')
    prof.goto(site + 'animer.html')
    if prof.locator('#c-mail').count():
        prof.fill('#c-mail', 'prof@exemple.fr'); prof.fill('#c-mdp', 'x'); prof.click('#f-cnx button')
    # la page rouvre la dernière partie (podium) : on revient à la bibliothèque
    prof.wait_for_selector('[data-salle], #b-sortir')
    if prof.locator('#b-sortir').count():
        prof.click('#b-sortir')
    prof.wait_for_selector('[data-salle]')
    prof.click('[data-salle]')
    code = prof.inner_text('#apercu-corps .pin').strip()
    verifier(re.fullmatch(r'[A-HJ-KM-NP-Z2-9]{6}', code) is not None, 'code de salle illisible : ' + code)
    png = prof.get_attribute('#b-png', 'href') or ''
    verifier(png.startswith('data:image/png'), 'le PNG du QR code fixe manque')
    verifier(code in (prof.inner_text('#apercu-corps .note') or ''), 'l\'adresse de la salle ne porte pas le code')
    capture(prof, '10-qr-fixe')
    prof.click('#d-apercu .boutons button')

    def telephone(nom):
        ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
        brancher_contexte(ctx, base, relais, stats)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e, n=nom: FAUTES.append(f'erreur JS ({n}) : {e}'))
        pg.goto(site + '?salle=' + code.lower())
        pg.wait_for_selector('#f-salle')
        pg.fill('#pseudo', nom)
        pg.click('#f-salle button')
        return pg

    # 1. avant le lancement : on attend
    a, b = telephone('Avant A.'), telephone('Avant B.')
    pages = [prof, a, b]
    verifier(attendre(pages, lambda: 'attente du professeur' in a.inner_text('main').lower()
                      and 'attente du professeur' in b.inner_text('main').lower()), 'pas d\'écran d\'attente avant le lancement')
    verifier('banc' in a.inner_text('main').lower(), 'le titre du quiz manque dans l\'attente')
    capture(a, 'phone-10-salle-attente')

    # 2. l'enseignant lance : ceux qui attendaient entrent d'eux-mêmes
    prof.click('[data-lancer]'); prof.fill('#l-groupe', 'BTS MS 1'); prof.uncheck('#l-pari'); prof.click('#l-ok')
    prof.wait_for_selector('.accueil .pin')
    verifier(attendre(pages, lambda: 'bienvenue dans la partie' in a.inner_text('main').lower()
                      and 'bienvenue dans la partie' in b.inner_text('main').lower(), limite=20),
             'les élèves en attente n\'entrent pas au lancement')
    # 3. un retardataire, après le lancement, entre directement
    c = telephone('Apres C.')
    pages.append(c)
    verifier(attendre(pages, lambda: 'bienvenue dans la partie' in c.inner_text('main').lower(), limite=15),
             'le retardataire n\'entre pas directement')
    verifier(attendre(pages, lambda: prof.locator('#inscrits button').count() == 3), 'les 3 joueurs de la salle n\'apparaissent pas')
    # « Ce n'est pas mon nom » : le même joueur change de nom (048), pas de concurrent en plus
    a.click('#b-quitter'); a.wait_for_selector('#r-pseudo')
    a.fill('#r-pseudo', 'Avant Z.'); a.click('#f-nom button[type=submit]')
    verifier(attendre(pages, lambda: 'avant z.' in a.inner_text('main').lower()), 'le nouveau nom n\'apparaît pas sur le téléphone')
    verifier(attendre(pages, lambda: 'Avant Z.' in prof.inner_text('#inscrits'), limite=15), 'le nouveau nom n\'apparaît pas au tableau')
    verifier(prof.locator('#inscrits button').count() == 3 and 'Avant A.' not in prof.inner_text('#inscrits'),
             'changer de nom a ajouté un concurrent : ' + prof.inner_text('#inscrits'))
    capture(a, 'phone-15-nom-change')
    capture(prof, '11-salle-accueil')
    prof.keyboard.press('Space')
    prof.wait_for_selector('.q-enonce')
    verifier(attendre(pages, lambda: all(p.locator('#saisie').count() for p in (a, b, c))), 'la question n\'arrive pas aux élèves de la salle')
    with base.verrou:
        pid = base.c.execute("select id::text from public.quiz_parties where mode = 'classe' and close_le is null "
                             "order by ouverte_le desc limit 1").fetchone()[0]
        base.c.commit()
    base.rpc('authenticated', PROF, 'quiz_piloter', {'p_partie': pid, 'p_action': 'fin'})

    # 4. sans partie ouverte : l'entraînement seul, de bout en bout
    s = telephone('Solo S.')
    verifier(attendre([s], lambda: s.locator('#b-seul').count() > 0), 'pas de bouton « S\'entraîner seul »')
    capture(s, 'phone-11-salle-sans-partie')
    s.click('#b-seul')
    s.wait_for_selector('#b-go'); capture(s, 'phone-12-solo-accueil')
    s.click('#b-go')
    for i, q in enumerate(QUIZ['questions']):
        verifier(attendre([s], lambda: s.locator('#saisie').count() > 0), f'solo, question {i + 1} : pas affichée')
        bon = i % 2 == 0
        repondre(s, q, bon)
        verifier(attendre([s], lambda: s.locator('.verdict').count() > 0 and s.locator('#b-suite').count() > 0),
                 f'solo, question {i + 1} : la correction ne suit pas la réponse')
        classe = s.locator('.verdict').get_attribute('class') or ''
        verifier(('juste' if bon else 'faux') in classe, f'solo, question {i + 1} : verdict « {classe} »')
        verifier('Rang' not in s.inner_text('main'), 'solo : un rang est affiché')
        if i == 1:
            capture(s, 'phone-13-solo-correction')
        s.click('#b-suite')
    verifier(attendre([s], lambda: 'entraînement terminé' in s.inner_text('main').lower()), 'solo : pas de bilan final')
    verifier(s.locator('#b-encore').count() == 1, 'solo : pas de bouton « Recommencer »')
    capture(s, 'phone-14-solo-bilan')

    # 5. l'enseignant retrouve l'entraînement, rangé à part
    prof.goto(site + 'stats.html')
    verifier(attendre([prof], lambda: prof.locator('#t-solo tr[data-id]').count() == 1, limite=15),
             'statistiques : l\'entraînement n\'apparaît pas')
    ligne = prof.inner_text('#t-solo tr[data-id]')
    verifier('Solo S.' in ligne and f' / {len(QUIZ["questions"])}' in ligne and 'oui' in ligne, 'statistiques : ligne d\'entraînement fausse : ' + ligne)
    verifier(prof.locator('#t tr[data-id]').count() == 2, 'statistiques : l\'entraînement s\'est glissé dans les parties de classe')
    capture(prof, '12-stats-entrainement')


def main():
    base, relais, stats = Base(), Relais(), {}
    port = qb.port_libre()
    class Muet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    serveur = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Muet, directory=str(RACINE)))
    threading.Thread(target=serveur.serve_forever, daemon=True).start()
    site = f'http://127.0.0.1:{port}/outils/quiz/'
    fichier = Path(tempfile.mkdtemp()) / 'banc-parcours.json'
    fichier.write_text(json.dumps(QUIZ, ensure_ascii=False), encoding='utf-8')

    try:
        with sync_playwright() as p:
            nav = p.chromium.launch()
            # ---------- l'écran enseignant ----------
            cp = nav.new_context(viewport={'width': 1280, 'height': 720}, reduced_motion='reduce')
            brancher_contexte(cp, base, relais, stats)
            prof = cp.new_page()
            def dialogue(d):
                if d.type == 'alert':
                    FAUTES.append('alerte (prof) : ' + d.message)
                d.accept()
            prof.on('dialog', dialogue)
            prof.on('pageerror', lambda e: FAUTES.append('erreur JS (prof) : ' + str(e)))
            prof.goto(site + 'animer.html')
            prof.fill('#c-mail', 'prof@exemple.fr'); prof.fill('#c-mdp', 'x'); prof.click('#f-cnx button')
            prof.wait_for_selector('#f-import', state='attached')
            prof.set_input_files('#f-import', str(fichier))
            prof.wait_for_selector('[data-lancer]')
            verifier('✓' in prof.inner_text('#journal'), 'import refusé : ' + prof.inner_text('#journal'))
            prof.click('[data-apercu]'); capture(prof, '01-apercu'); prof.click('#d-apercu button')
            prof.click('[data-lancer]')
            prof.fill('#l-groupe', 'BTS MS 1'); prof.check('#l-pari'); prof.click('#l-ok')
            prof.wait_for_selector('.accueil .pin')
            pin = re.sub(r'\D', '', prof.inner_text('.accueil .pin'))
            verifier(len(pin) == 6, 'PIN illisible : ' + pin)
            print('· partie ouverte, PIN', pin)

            # ---------- la classe ----------
            ce = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
            brancher_contexte(ce, base, relais, stats)
            eleves = []

            def nouvel_eleve(nom, via_qr=True):
                ctx = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
                brancher_contexte(ctx, base, relais, stats)
                pg = ctx.new_page()
                pg.on('pageerror', lambda e, n=nom: FAUTES.append(f'erreur JS ({n}) : {e}'))
                pg.goto(site + ('?pin=' + pin if via_qr else ''))
                if not via_qr:
                    pg.fill('#pin', pin)
                pg.fill('#pseudo', nom)
                pg.click('#f-entree button')
                return pg

            for k, nom in enumerate(ELEVES):
                eleves.append(nouvel_eleve(nom, via_qr=k != 1))
            capture(eleves[0], 'phone-00-attente')
            # un pseudo déjà pris, puis un intrus que l'on exclut
            doublon = nouvel_eleve('inès b.')
            doublon.wait_for_timeout(600)
            verifier('déjà pris' in doublon.inner_text('#err'), 'doublon de pseudo accepté')
            intrus = nouvel_eleve('Pirate X.')
            pages = [prof] + eleves + [intrus]
            verifier(attendre(pages, lambda: prof.locator('#inscrits button').count() == 9), 'les 9 inscrits n\'apparaissent pas')
            capture(prof, '02-accueil')
            prof.locator('#inscrits button', has_text='Pirate X.').click()
            verifier(attendre(pages, lambda: 'plus dans cette partie' in intrus.inner_text('main')), 'l\'intrus exclu ne le voit pas')
            verifier(prof.locator('#inscrits button').count() == 8, 'l\'intrus est encore inscrit')

            # ---------- les questions ----------
            tard = None
            for i, q in enumerate(QUIZ['questions']):
                prof.keyboard.press('Space')
                prof.wait_for_selector('.q-enonce')
                if i == 1:
                    tard = nouvel_eleve('Tard Z.')
                    eleves.append(tard)
                pages = [prof] + eleves
                ok = attendre(pages, lambda: all(e.locator('#saisie').count() for e in eleves))
                verifier(ok, f'question {i + 1} : un téléphone ne l\'affiche pas')
                if i == 0:
                    capture(prof, '03-question-qcm'); capture(eleves[0], 'phone-01-question')
                if q['type'] in ('assoc', 'mot', 'curseur', 'zone', 'ordre'):
                    capture(prof, f'03-question-{q["type"]}')
                attendus = {}
                for k, e in enumerate(eleves):
                    if i == 1 and k == 7:
                        attendus[k] = 'rien'           # Adam laisse filer le chrono
                        continue
                    if i == 2 and k == 3:              # Nathan recharge en pleine question
                        e.reload()
                        verifier(attendre(pages, lambda: e.locator('#saisie').count() > 0), 'reprise après rechargement ratée')
                    bon = juste_pour(k, i)
                    attendus[k] = 'juste' if bon else 'faux'
                    if k == 0 and e.locator('#c-pari').count():
                        e.check('#c-pari')
                    t = q['type']
                    if t in ('assoc', 'mot', 'curseur'):
                        # l'élève 5 fait la moitié de l'association ou approche le curseur
                        moitie = k == 5 and t in ('assoc', 'curseur')
                        repondre_nouveaux(e, q, bon and not moitie, part=moitie)
                        if moitie:
                            attendus[k] = 'partiel'
                        if k == 0:
                            capture(e, f'phone-06-{t}')
                    elif t in ('qcm', 'vf') and len(q['correct']) == 1:
                        cible = q['correct'][0] if bon else (q['correct'][0] + 1) % len(q.get('options', [0, 1]))
                        e.click(f'#grille .rep[data-i="{cible}"]')
                    elif t == 'qcm':
                        for c in (q['correct'] if bon else [0]):
                            e.click(f'#grille .rep[data-i="{c}"]')
                        e.click('#b-valider')
                    elif t == 'num':
                        val, unite = [('19,6', 'm/s'), ('70,6', 'km/h')][k % 2] if bon else [('9,81', 'm/s'), ('19,6', 'km/h')][k % 2]
                        e.fill('#n-val', val); e.select_option('#n-unite', unite)
                        if k == 0:
                            capture(e, 'phone-02-numerique')
                        e.click('#b-valider')
                    elif t == 'ordre':
                        ordre = q['items'] if bon else [q['items'][1], q['items'][0]] + q['items'][2:]
                        for txt in ordre:
                            e.locator('#ordre button', has_text=re.compile('^\\s*' + re.escape(txt) + '\\s*$')).click()
                        if k == 0:
                            capture(e, 'phone-03-ordre')
                        e.click('#b-valider')
                    elif t == 'zone':
                        img = e.locator('#zone img'); img.wait_for()
                        bb = img.bounding_box()
                        fx = .25 if bon else .75
                        e.mouse.click(bb['x'] + bb['width'] * fx, bb['y'] + bb['height'] * fx)
                        e.click('#b-valider')
                verifier(attendre(pages, lambda: prof.locator('.correction').count() > 0, limite=45),
                         f'question {i + 1} : la correction ne vient pas')
                verifier(attendre(pages, lambda: all(e.locator('.verdict').count() for e in eleves)),
                         f'question {i + 1} : un téléphone n\'affiche pas la correction')
                for k, e in enumerate(eleves):
                    if k not in attendus:
                        continue
                    classe = e.locator('.verdict').get_attribute('class') or ''
                    verifier(attendus[k] in classe, f'question {i + 1}, {e.locator(".qui").count() and ""}élève {k} : attendu {attendus[k]}, vu « {classe} »')
                capture(prof, f'04-correction-q{i + 1}-{q["type"]}')
                if i == 2:
                    capture(eleves[1], 'phone-04-correction-faux')
                    # 2 erreurs d'unité (élèves 1 et 7), 1 piège 9,81 (élève 4) : l'unité l'emporte
                    piege = prof.inner_text('.panneau.piege') if prof.locator('.panneau.piege').count() else ''
                    verifier('2 élèves' in piege.lower().replace('élèves', 'élèves') and 'unité' in piege,
                             'erreur la plus fréquente mal projetée : ' + piege)
                if i == 0:
                    capture(eleves[2], 'phone-04-correction-juste')
                if q['type'] in ('assoc', 'mot', 'curseur'):
                    capture(eleves[5], f'phone-07-correction-{q["type"]}')
                    if q['type'] == 'mot':
                        capture(eleves[1], 'phone-07-correction-mot-piege')
                prof.keyboard.press('Space')
                prof.wait_for_selector('.classement')
                if i == 0:
                    capture(prof, '05-classement')

            # ---------- la fin ----------
            prof.keyboard.press('Space')
            prof.wait_for_selector('.podium')
            capture(prof, '06-podium')
            verifier(attendre([prof] + eleves, lambda: all(e.locator('.bilan-notions, .encart').count() and 'partie terminée' in e.inner_text('main').lower() for e in eleves)),
                     'un téléphone n\'affiche pas le bilan')
            capture(eleves[3], 'phone-05-bilan')

            # ---------- les statistiques ----------
            prof.click('a[href^="stats.html?partie="]')
            prof.wait_for_selector('.onglets')
            capture(prof, '07-stats-questions')
            lignes = prof.locator('[data-p="q"] tr').count() - 1
            verifier(lignes == len(QUIZ['questions']), f'statistiques : {lignes} lignes au lieu de {len(QUIZ["questions"])}')
            prof.click('[data-o="e"]'); capture(prof, '08-stats-eleves')
            verifier(prof.locator('[data-p="e"] tr').count() - 1 == len(eleves), 'statistiques : élèves manquants')
            prof.goto(site + 'stats.html'); prof.wait_for_selector('#t-quiz tr[data-k]')
            prof.click('#t-quiz tr[data-k]'); prof.wait_for_selector('.jauge'); capture(prof, '09-stats-cumul')

            # ---------- la base, vue d'en dessous ----------
            with base.verrou:
                n_rep = base.c.execute('select count(*) from public.quiz_reponses').fetchone()[0]
                n_pari = base.c.execute('select count(*) from public.quiz_reponses where sur').fetchone()[0]
                base.c.commit()
            print(f'· {n_rep} réponses en base, dont {n_pari} pariées')
            verifier(n_pari == len(QUIZ['questions']), f'pari : {n_pari} réponses pariées au lieu de {len(QUIZ["questions"])}')
            print(f'· temps réel : {relais.abonnements} abonnements, {relais.diffusions} réveils diffusés')
            verifier(relais.abonnements >= len(eleves) and relais.diffusions >= len(QUIZ['questions']), 'le temps réel n\'a pas servi')
            salle_permanente(nav, base, relais, stats, site, prof)
            print('· appels :', ', '.join(f'{k} {v}' for k, v in sorted(stats.items())))
            nav.close()
    except Exception:
        print('fautes jusque-là :', FAUTES)
        raise
    finally:
        serveur.shutdown()
        base.fermer()

    if FAUTES:
        print('\n✗ ' + str(len(FAUTES)) + ' faute(s) :')
        for f in dict.fromkeys(FAUTES):
            print('  -', f)
        sys.exit(1)
    print('\n✓ PARCOURS COMPLET SANS FAUTE')


if __name__ == '__main__':
    main()
