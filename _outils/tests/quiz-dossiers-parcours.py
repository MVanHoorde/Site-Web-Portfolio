"""Les dossiers de Diapason (051) au navigateur, sur la VRAIE logique SQL.

    QUIZ_PYLIB=<dossier psycopg> python _outils/tests/quiz-dossiers-parcours.py [dossier_captures]

Reprend le montage de quiz-parcours.py (Postgres local jetable, site servi
en local, Playwright qui intercepte tout ce qui part vers Supabase) et y
ajoute le 051, un gestionnaire, et les écritures POST / PATCH du
mini-PostgREST. Parcours :
  · l'enseignant voit les six sections, importe des quiz rangés par leur
    chemin, entre dans une section (filigrane), crée un dossier avec un
    visuel du site, range un quiz, lance une partie (filigrane projeté) ;
  · un élève, sur téléphone, ouvre la page d'entraînement, descend dans
    une section puis un chapitre, et s'entraîne seul sans salle d'attente ;
  · l'accueil du site mène à Diapason.
Aucune requête ne sort de la machine.
"""
import functools
import http.server
import importlib.util
import json
import re
import sys
import tempfile
import threading
from pathlib import Path

ICI = Path(__file__).parent
_spec = importlib.util.spec_from_file_location('quiz_parcours', ICI / 'quiz-parcours.py')
qp = importlib.util.module_from_spec(_spec)
sys.argv = sys.argv[:2]
_spec.loader.exec_module(qp)
psycopg, sql = qp.psycopg, qp.sql
RACINE, PROF = qp.RACINE, qp.PROF


class Base(qp.Base):
    def __init__(self):
        super().__init__()
        self.c.autocommit = True
        self.c.execute('insert into public.gestionnaires (auth_id) values (%s)', (PROF,))
        self.c.execute((RACINE / 'bdd' / 'schema' / '051-quiz-dossiers.sql').read_text(encoding='utf-8'))
        self.c.execute((RACINE / 'bdd' / 'schema' / '052-quiz-revoir.sql').read_text(encoding='utf-8'))
        self.c.autocommit = False
        self.fonctions = {}
        for nom, noms, types, ret in self.c.execute(
                "select proname, proargnames, proargtypes::regtype[]::text[], prorettype::regtype::text "
                "from pg_proc where pronamespace = 'public'::regnamespace"):
            self.fonctions[nom] = (dict(zip(noms or [], types or [])), ret)
        self.c.commit()

    def rest(self, role, sub, methode, table, q, corps=None):
        # tri sur plusieurs colonnes : order=ordre.asc,nom.asc
        if methode == 'GET' and ',' in q.get('order', ''):
            premier = q['order'].split(',')[0]
            q = dict(q, order=premier)
        if methode not in ('POST', 'PATCH'):
            return super().rest(role, sub, methode, table, q)
        tbl = sql.Identifier('public', table)
        cols = list((corps or {}).keys())
        vals = [json.dumps(v) if isinstance(v, (dict, list)) else v for v in corps.values()]
        with self.verrou:
            try:
                cur = self.sous(role, sub)
                if methode == 'POST':
                    cur.execute(sql.SQL('insert into {} ({}) values ({}) returning to_jsonb({}.*)').format(
                        tbl, sql.SQL(', ').join(map(sql.Identifier, cols)),
                        sql.SQL(', ').join(sql.Placeholder() * len(cols)), sql.Identifier(table)), vals)
                    r = [cur.fetchone()[0]]
                else:
                    col, val = [(k, v.partition('.')[2]) for k, v in q.items() if v.startswith('eq.')][0]
                    cur.execute(sql.SQL('update {} set {} where {} = %s returning to_jsonb({}.*)').format(
                        tbl, sql.SQL(', ').join(sql.SQL('{} = %s').format(sql.Identifier(c)) for c in cols),
                        sql.Identifier(col), sql.Identifier(table)), vals + [val])
                    r = [x[0] for x in cur.fetchall()]
                self.c.commit()
                return (201 if methode == 'POST' else 200), r
            except psycopg.Error as e:
                self.c.rollback()
                return 400, {'message': e.diag.message_primary + ' ' + (e.diag.constraint_name or ''), 'code': e.sqlstate}


def brancher(ctx, base, relais, stats):
    """Comme quiz-parcours, mais POST / PATCH passent le corps de la requête."""
    qp.brancher_contexte(ctx, base, relais, stats)
    rest_orig = base.rest

    def gerer(route):
        req = route.request
        if req.method in ('POST', 'PATCH') and '/rest/v1/' in req.url and '/rpc/' not in req.url:
            from urllib.parse import urlparse, parse_qsl
            u = urlparse(req.url)
            role, sub = qp.qui(req.headers)
            statut, r = rest_orig(role, sub, req.method, u.path.rsplit('/', 1)[1], dict(parse_qsl(u.query)), req.post_data_json)
            if statut == 400:
                qp.FAUTES.append(f'erreur SQL sur {u.path} : {r}')
            return route.fulfill(status=statut, content_type='application/json', body=json.dumps(r),
                                 headers={'access-control-allow-origin': '*'})
        return route.fallback()
    ctx.route(re.compile(r'.*/rest/v1/(?!rpc/).*'), gerer)


def quiz(slug, titre, dossier, n=3):
    return {'slug': slug, 'titre': titre, 'niveau': '', 'matiere': '', 'dossier': dossier,
            'description': 'Quiz de démonstration du banc',
            'questions': [{'type': 'vf', 'enonce': f'Affirmation {i + 1} du quiz « {titre} ».', 'correct': [i % 2],
                           'cours': 'Le point de cours de la correction.',
                           # 052 : une notion et un lien « à revoir » par question
                           'notion': ['Routage', 'DNS'][i % 2],
                           'revoir': [{'texte': 'S5 · Le routage', 'lien': 'pages/2nde-snt-t1-internet.html#etape-t1-routage'},
                                      {'texte': 'S6 · Le DNS', 'lien': 'pages/2nde-snt-t1-internet.html#etape-t1-dns'}][i % 2]}
                          for i in range(n)]}


def main():
    base, relais, stats = Base(), qp.Relais(), {}
    port = qp.qb.port_libre()

    class Muet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    serveur = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Muet, directory=str(RACINE)))
    threading.Thread(target=serveur.serve_forever, daemon=True).start()
    racine = f'http://127.0.0.1:{port}/'
    site = racine + 'outils/quiz/'
    dossier = Path(tempfile.mkdtemp())
    fichiers = []
    for z in [quiz('demo-snt-web-1', 'Le Web — HTTP et URL', ['2de SNT', 'Le Web']),
              quiz('demo-snt-web-2', 'Le Web — moteurs de recherche', ['2de SNT', 'Le Web'], 4),
              quiz('demo-snt-internet', 'Internet — paquets et routeurs', ['2de SNT', 'Internet'], 5),
              quiz('demo-snt-photo', 'La photographie numérique', ['2de SNT', 'Photographie numérique']),
              quiz('demo-es1-noyaux', 'Nucléosynthèse', ['1re ES', 'Une longue histoire de la matière']),
              quiz('demo-bts-fluides', 'Statique des fluides', ['BTS MS', 'Mécanique des fluides'], 6),
              quiz('demo-a-ranger', 'Quiz à ranger', [], 2)]:
        if not z['dossier']:
            del z['dossier']
        f = dossier / (z['slug'] + '.json')
        f.write_text(json.dumps(z, ensure_ascii=False), encoding='utf-8')
        fichiers.append(str(f))

    try:
        with qp.sync_playwright() as p:
            nav = p.chromium.launch()
            # ---------- l'enseignant ----------
            cp = nav.new_context(viewport={'width': 1280, 'height': 800}, reduced_motion='reduce')
            brancher(cp, base, relais, stats)
            prof = cp.new_page()
            prof.on('dialog', lambda d: (qp.FAUTES.append('alerte : ' + d.message) if d.type == 'alert' else None, d.accept()))
            prof.on('pageerror', lambda e: qp.FAUTES.append('erreur JS (prof) : ' + str(e)))
            prof.goto(site + 'animer.html')
            prof.fill('#c-mail', 'prof@exemple.fr'); prof.fill('#c-mdp', 'x'); prof.click('#f-cnx button')
            prof.wait_for_selector('.vignettes.sections .vignette')
            qp.verifier(prof.locator('.vignettes.sections .vignette.section').count() == 6,
                        'six sections attendues, vues : %d' % prof.locator('.vignette.section').count())
            prof.set_input_files('#f-import', fichiers)
            prof.wait_for_function("document.querySelectorAll('#journal li').length >= 7")
            qp.verifier('✗' not in prof.inner_text('#journal'), 'import refusé : ' + prof.inner_text('#journal'))
            prof.wait_for_timeout(400)
            qp.capture(prof, '01-sections')
            qp.verifier(prof.locator('[data-ouvrir="sans"]').count() == 1, 'le quiz sans dossier n\'apparaît pas')

            prof.click('.vignette.section:has-text("SNT")')
            prof.wait_for_selector('.vignette.chapitre')
            qp.verifier(prof.locator('.vignette.chapitre').count() == 3, 'SNT : 3 chapitres attendus')
            qp.verifier(not prof.locator('#filigrane').is_hidden(), 'pas de filigrane dans la section')
            qp.capture(prof, '02-section-snt')

            prof.click('.vignette.chapitre:has-text("Le Web")')
            prof.wait_for_selector('.carte-quiz')
            qp.verifier(prof.locator('.carte-quiz').count() == 2, 'Le Web : 2 quiz attendus')
            qp.capture(prof, '03-chapitre-web')

            # un nouveau dossier, avec un visuel du site
            prof.click('.fil button:has-text("SNT")')
            prof.click('#b-nouveau')
            prof.fill('#dos-nom', 'Les données structurées')
            prof.click('#dos-visuels button >> nth=1')
            prof.wait_for_timeout(300)
            qp.capture(prof, '04-nouveau-dossier')
            prof.click('#dos-ok')
            prof.wait_for_selector('.fil b:has-text("Les données structurées")')

            # ranger le quiz sans dossier
            prof.click('.fil button:has-text("Toutes les sections")')
            prof.click('[data-ouvrir="sans"]')
            prof.click('[data-ranger]')
            opt = prof.locator('#r-dossier option:has-text("Les données structurées")').get_attribute('value')
            prof.select_option('#r-dossier', opt)
            prof.click('#dos-ok')
            prof.wait_for_timeout(500)
            qp.verifier(prof.locator('[data-ouvrir="sans"]').count() == 0, 'le quiz n\'a pas été rangé')

            # masquer une section aux élèves
            prof.click('.vignette.section:has-text("CFA")')
            prof.click('#b-modifier'); prof.uncheck('#dos-visible'); prof.click('#dos-ok')
            prof.wait_for_timeout(400)

            # lancer : la scène porte le filigrane du dossier
            prof.click('.fil button:has-text("Toutes les sections")')
            prof.click('.vignette.section:has-text("BTS")')
            prof.click('.vignette.chapitre:has-text("fluides")')
            prof.click('[data-lancer]'); prof.click('#l-ok')
            prof.wait_for_selector('.accueil .pin')
            fili = prof.evaluate("getComputedStyle(document.querySelector('.scene')).getPropertyValue('--filigrane')")
            qp.verifier('karman' in fili, 'pas de filigrane sur la scène : ' + fili)
            qp.capture(prof, '05-scene-filigrane')
            # le PIN tient-il dans l'affiche ? (mesuré à trois tailles d'écran)
            for l, h in ((1280, 720), (1280, 800), (1920, 1080)):
                prof.set_viewport_size({'width': l, 'height': h})
                prof.wait_for_timeout(200)
                deborde = prof.evaluate("""() => { const p = document.querySelector('.accueil .pin').getBoundingClientRect(),
                    g = document.querySelector('.accueil .gauche').getBoundingClientRect(); return Math.round(p.bottom - g.bottom); }""")
                print(f'  PIN {l}×{h} : {"dépasse de " + str(deborde) + " px" if deborde > 0 else "tient"}')
            prof.set_viewport_size({'width': 1280, 'height': 800})

            # ---------- l'élève, sur téléphone ----------
            ce = nav.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
            brancher(ce, base, relais, stats)
            el = ce.new_page()
            el.on('pageerror', lambda e: qp.FAUTES.append('erreur JS (élève) : ' + str(e)))
            el.goto(site + 'entrainement.html')
            el.wait_for_selector('.vignette.section')
            noms = el.locator('.vignette.section .nom').all_inner_texts()
            qp.verifier(not any('CFA' in n for n in noms), 'la section masquée est visible : %s' % noms)
            qp.verifier(not any('seconde' in n and 'Physique' in n for n in noms), 'une section vide est affichée')
            qp.capture(el, '06-eleve-classes')
            el.click('.vignette.section:has-text("SNT")')
            el.wait_for_selector('.vignette.chapitre')
            qp.capture(el, '07-eleve-section')
            el.click('.vignette.chapitre:has-text("Internet")')
            el.wait_for_selector('.quiz-eleve')
            qp.capture(el, '08-eleve-chapitre')
            el.click('.quiz-eleve')
            el.wait_for_selector('#f-salle')
            el.fill('#pseudo', 'Inès B.')
            el.click('#f-salle button')
            el.wait_for_function("!document.querySelector('#f-salle')")
            el.wait_for_timeout(600)
            qp.capture(el, '09-eleve-seul')
            qp.verifier(stats.get('quiz_entrainer', 0) == 1, 'l\'entraînement seul n\'a pas démarré')
            # 052 : l'élève se trompe partout ; chaque correction et le bilan renvoient au cours
            el.click('#b-go')
            for i in range(5):
                el.wait_for_selector('#saisie')
                # la mauvaise réponse : l'inverse de la bonne (correct = [i % 2])
                el.locator('#saisie .rep').nth(1 - i % 2).click()
                if el.locator('#b-valider').count():
                    el.click('#b-valider')
                el.wait_for_selector('#b-suite')
                lien = el.locator('a.revoir')
                qp.verifier(lien.count() == 1, f'question {i + 1} : pas de lien « Revoir » à la correction')
                if i == 0:
                    qp.verifier('etape-t1-routage' in (lien.get_attribute('href') or ''), 'lien de correction faux')
                    qp.capture(el, '11-eleve-correction-revoir')
                el.click('#b-suite')
            el.wait_for_function("document.body.innerText.toLowerCase().includes('entraînement terminé')")
            liens = el.locator('.bilan-notions a.revoir')
            qp.verifier(liens.count() == 2, 'bilan : %d liens « Revoir » au lieu de 2' % liens.count())
            el.locator('.bilan-notions').scroll_into_view_if_needed()
            qp.capture(el, '12-eleve-bilan-revoir')

            # ---------- l'accueil du site ----------
            ca = nav.new_context(viewport={'width': 1280, 'height': 900}, reduced_motion='reduce')
            brancher(ca, base, relais, stats)
            acc = ca.new_page()
            acc.goto(racine + 'index.html')
            acc.click('a:has-text("Diapason — les quiz du cours")')
            acc.wait_for_selector('.vignette.section')
            qp.verifier(acc.url.endswith('outils/quiz/entrainement.html'), 'le lien de l\'accueil se perd')
            acc.goto(racine + 'index.html#atelier')
            acc.locator('#atelier .bloc').nth(2).scroll_into_view_if_needed()
            if qp.CAPTURES:
                acc.locator('#atelier .bloc').nth(2).screenshot(path=str(qp.CAPTURES / '10-accueil-bloc.png'))
            nav.close()
    finally:
        serveur.shutdown()
        base.fermer()

    print('appels :', json.dumps(stats, ensure_ascii=False))
    if qp.FAUTES:
        print('✗ ' + '\n✗ '.join(qp.FAUTES))
        sys.exit(1)
    print('✓ dossiers, filigrane, catalogue et entraînement seul : tout est juste')


if __name__ == '__main__':
    main()
