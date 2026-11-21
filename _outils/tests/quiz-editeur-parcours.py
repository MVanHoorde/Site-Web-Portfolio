"""L'éditeur de quiz de Diapason (editer.html) au navigateur, sur la VRAIE logique SQL.

    QUIZ_PYLIB=<dossier psycopg> python -X utf8 _outils/tests/quiz-editeur-parcours.py [dossier_captures]

Même montage que quiz-dossiers-parcours.py (Postgres local jetable, 047 +
048 + 051, gestionnaire, interception de tout ce qui part vers Supabase,
écritures POST / PATCH). Parcours :
  · créer un quiz dans la section SNT avec une question de CHAQUE type
    (qcm, vf, num, ordre, zone tracée à la souris, assoc, mot, curseur) ;
  · un enregistrement refusé tant qu'une question est incomplète, l'erreur
    affichée sur la bonne question ;
  · enregistrer (Ctrl+S), rouvrir, modifier une question, réordonner,
    enregistrer ;
  · en base : les 8 questions passent quiz_question_invalide, et quiz_juger
    juge juste la bonne réponse de chacune ;
  · le quiz d'un collègue s'ouvre en lecture seule, « Dupliquer pour moi ».
Aucune requête ne sort de la machine.
"""
import functools
import http.server
import importlib.util
import json
import sys
import threading
from pathlib import Path

ICI = Path(__file__).parent
_spec = importlib.util.spec_from_file_location('quiz_dossiers_parcours', ICI / 'quiz-dossiers-parcours.py')
qd = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(qd)
qp, RACINE, PROF = qd.qp, qd.RACINE, qd.PROF
COLLEGUE = '00000000-0000-0000-0000-0000000000a2'


def sql1(base, requete, *params):
    with base.verrou:
        cur = base.c.cursor()
        cur.execute(requete, params)
        r = cur.fetchone()
        base.c.commit()
        return r[0] if r else None


def main():
    base, relais, stats = qd.Base(), qp.Relais(), {}
    port = qp.qb.port_libre()

    class Muet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    serveur = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Muet, directory=str(RACINE)))
    threading.Thread(target=serveur.serve_forever, daemon=True).start()
    site = f'http://127.0.0.1:{port}/outils/quiz/'
    snt = sql1(base, "select id::text from public.quiz_categories where sigle = '2de SNT'")

    # le quiz d'un collègue, partagé (lecture seule pour Loïc)
    with base.verrou:
        cur = base.c.cursor()
        cur.execute("insert into auth.users values (%s) on conflict do nothing", (COLLEGUE,))
        cur.execute("insert into public.enseignants values (%s) on conflict do nothing", (COLLEGUE,))
        cur.execute("insert into public.quiz_quiz (slug, titre, questions, auteur) values ('quiz-collegue', 'Le quiz du collègue', %s, %s) returning id::text",
                    (json.dumps([{'type': 'vf', 'enonce': 'Affirmation du collègue.', 'correct': [0]}]), COLLEGUE))
        id_collegue = cur.fetchone()[0]
        base.c.commit()

    try:
        with qp.sync_playwright() as p:
            nav = p.chromium.launch()
            cp = nav.new_context(viewport={'width': 1366, 'height': 900}, reduced_motion='reduce')
            qd.brancher(cp, base, relais, stats)
            pg = cp.new_page()
            pg.on('dialog', lambda d: (qp.FAUTES.append('alerte : ' + d.message) if d.type == 'alert' else None, d.accept()))
            pg.on('pageerror', lambda e: qp.FAUTES.append('erreur JS : ' + str(e)))
            pg.goto(site + 'editer.html?dossier=' + snt)
            pg.fill('#c-mail', 'prof@exemple.fr'); pg.fill('#c-mdp', 'x'); pg.click('#f-cnx button')
            pg.wait_for_selector('#m-titre')
            qp.verifier(pg.locator('#m-dossier').input_value() == snt, 'le dossier de l\'adresse n\'est pas présélectionné')
            pg.fill('#m-titre', 'Le Web — banc de l\'éditeur')
            qp.verifier(pg.locator('#m-slug').input_value() == 'le-web-banc-de-l-editeur', 'slug : ' + pg.locator('#m-slug').input_value())

            def ajouter(t):
                pg.click('#b-ajouter'); pg.click(f'#choix-types [data-type="{t}"]')
                pg.wait_for_selector('#f-enonce')

            def f(chemin, valeur):
                pg.fill(f'#ed-question [data-f="{chemin}"]', valeur)

            def ajout(liste):
                pg.click(f'#ed-question [data-act="ajout"][data-liste="{liste}"]')

            # 1. QCM : laissé incomplet d'abord, l'enregistrement doit refuser
            ajouter('qcm')
            f('options.0', 'HTML'); f('options.1', 'HTTP')
            pg.keyboard.press('Control+s')
            pg.wait_for_selector('.ed-err')
            qp.verifier('corriger' in pg.inner_text('#ed-etat'), 'refus non annoncé : ' + pg.inner_text('#ed-etat'))
            qp.verifier(pg.locator('.ed-vig.ko').count() == 1, 'la question fautive n\'est pas marquée dans la liste')
            f('enonce', 'Quel **protocole** transporte les pages web ?')
            f('options.2', 'TCP'); f('options.3', 'DNS')
            pg.check('#ed-question [data-act="juste"][data-i="1"]')
            pg.uncheck('#ed-question [data-act="juste"][data-i="0"]')
            f('pourquoi.0', 'HTML décrit la page, il ne la transporte pas.')
            pg.click('#ed-plus > summary')
            f('cours', 'HTTP : le protocole du **web**.')
            f('notion', 'Protocole HTTP')
            pg.wait_for_timeout(300)
            qp.capture(pg, '01-qcm')

            ajouter('vf')
            f('enonce', 'Une URL commence toujours par « www ».')
            pg.check('#ed-question [data-act="juste"][data-i="1"]')

            ajouter('num')
            f('enonce', 'Combien de bits dans un octet ?')
            f('num.valeur', '8'); f('num.unite', 'bits'); f('num.unites', 'bits, octets')
            ajout('num.pieges'); f('num.pieges.0.valeur', '1'); f('num.pieges.0.message', 'Un octet vaut 8 bits.')

            ajouter('ordre')
            f('enonce', 'Range les étapes d\'une requête.')
            f('items.0', 'Résolution DNS'); f('items.1', 'Requête HTTP'); f('items.2', 'Réponse du serveur')

            ajouter('zone')
            f('enonce', 'Touche le processeur.')
            f('zone.src', 'assets/img/snt/2nde-snt-t0-systemes-informatises/t0-carte-mere.jpg')
            f('zone.alt', 'Une carte mère')
            pg.wait_for_selector('#ed-zone img')
            pg.wait_for_function("document.querySelector('#ed-zone img').naturalWidth > 0")
            bb = pg.locator('#ed-zone').bounding_box()
            pg.mouse.move(bb['x'] + bb['width'] * .45, bb['y'] + bb['height'] * .2)
            pg.mouse.down(); pg.mouse.move(bb['x'] + bb['width'] * .62, bb['y'] + bb['height'] * .45, steps=6); pg.mouse.up()
            pg.wait_for_selector('#ed-zone .cible:not(.trace)')
            qp.verifier(pg.locator('#ed-zone .cible:not(.trace)').count() == 1, 'la zone tracée n\'a pas été gardée')
            if qp.CAPTURES: pg.locator('#ed-question').screenshot(path=str(qp.CAPTURES / '02-zone.png'))

            ajouter('assoc')
            f('enonce', 'Associe chaque partie de l\'URL.')
            for i, (g, d) in enumerate([('https', 'protocole'), ('fr.wikipedia.org', 'nom de domaine'), ('/wiki/Web', 'chemin')]):
                f(f'paires.{i}.0', g); f(f'paires.{i}.1', d)

            ajouter('mot')
            f('enonce', 'Quel langage décrit le contenu d\'une page web ?')
            f('mot.acceptes.0', 'HTML'); ajout('mot.acceptes'); f('mot.acceptes.1', 'html5')
            ajout('mot.pieges'); f('mot.pieges.0.mot', 'CSS'); f('mot.pieges.0.message', 'CSS met en forme.')
            f('mot.indice', 'quatre lettres')

            ajouter('curseur')
            f('enonce', 'En quelle année le web est-il né ?')
            f('curseur.min', '1960'); f('curseur.max', '2020'); f('curseur.valeur', '1989'); f('curseur.tolerance', '1'); f('curseur.marge', '5')
            pg.wait_for_timeout(300)
            if qp.CAPTURES: pg.locator('#ed-question').screenshot(path=str(qp.CAPTURES / '03-curseur.png'))

            # 2. enregistrer
            pg.keyboard.press('Control+s')
            pg.wait_for_function("/Enregistré à/.test(document.querySelector('#ed-etat').textContent)", timeout=15000)
            qp.verifier('editer.html?quiz=' in pg.url, 'l\'adresse ne porte pas le quiz : ' + pg.url)
            qp.capture(pg, '04-enregistre')

            # 3. rouvrir, modifier, réordonner
            pg.reload()
            pg.wait_for_selector('.ed-vig')
            qp.verifier(pg.locator('.ed-vig').count() == 8, '8 questions attendues au rechargement')
            pg.click('[data-ouvrir="0"]')
            f('enonce', 'Quel protocole transporte les pages web ? (modifié)')
            pg.click('[data-monter="7"]')     # le curseur passe avant le mot
            qp.verifier('curseur' in pg.locator('.ed-vig').nth(6).inner_text().lower(), 'le réordonnancement n\'a pas pris')
            pg.click('#b-enregistrer')
            pg.wait_for_function("/Enregistré à/.test(document.querySelector('#ed-etat').textContent)", timeout=15000)

            pg.click('#b-tester'); pg.wait_for_timeout(300); qp.capture(pg, '05-tester'); pg.click('#d-tester button')

            # iPad paysage
            pg.set_viewport_size({'width': 1024, 'height': 768})
            pg.click('[data-ouvrir="0"]'); pg.wait_for_timeout(300)
            qp.capture(pg, '06-ipad-1024')
            pg.set_viewport_size({'width': 768, 'height': 1024})
            pg.wait_for_timeout(300)
            qp.capture(pg, '07-ipad-portrait')

            # 4. le quiz d'un collègue : lecture seule, dupliquer
            pg.goto(site + 'editer.html?quiz=' + id_collegue)
            pg.wait_for_selector('#b-dupliquer')
            qp.verifier(pg.locator('#b-enregistrer').count() == 0, 'un quiz de collègue est modifiable')
            pg.click('#b-dupliquer')
            pg.keyboard.press('Control+s')
            pg.wait_for_function("/Enregistré à/.test(document.querySelector('#ed-etat').textContent)", timeout=15000)

            # 5. la bibliothèque mène à l'éditeur
            pg.goto(site + 'animer.html')
            pg.wait_for_selector('.vignettes.sections')
            qp.verifier(pg.locator('a[href="editer.html"]').count() >= 1, '« + Quiz » absent de la racine')
            nav.close()
    finally:
        serveur.shutdown()

    # ---------- en base ----------
    try:
        qs = sql1(base, "select questions from public.quiz_quiz where slug = 'le-web-banc-de-l-editeur'")
        cat = sql1(base, "select c.sigle from public.quiz_quiz z join public.quiz_categories c on c.id = z.categorie where z.slug = 'le-web-banc-de-l-editeur'")
        qp.verifier(cat == '2de SNT', 'le quiz n\'est pas rangé dans SNT : %s' % cat)
        types = [x['type'] for x in qs or []]
        qp.verifier(types == ['qcm', 'vf', 'num', 'ordre', 'zone', 'assoc', 'curseur', 'mot'], 'ordre des types en base : %s' % types)
        qp.verifier(qs and '(modifié)' in qs[0]['enonce'], 'la modification de la question 1 n\'est pas en base')
        qp.verifier(qs and qs[0]['correct'] == [1] and qs[0].get('pourquoi', [None])[0], 'QCM : bonne réponse ou pourquoi perdus : %s' % (qs[0] if qs else None))
        for i, x in enumerate(qs or []):
            m = sql1(base, 'select public.quiz_question_invalide(%s::jsonb)', json.dumps(x))
            qp.verifier(m is None, f'question {i + 1} ({x["type"]}) invalide : {m}')
            qj, rep = qp.qb.bonne_reponse(x)
            j = sql1(base, "select public.quiz_juger(%s::jsonb, %s::jsonb)->>'juste'", json.dumps(qj), json.dumps(rep))
            qp.verifier(j == 'true', f'question {i + 1} ({x["type"]}) : la bonne réponse est jugée fausse')
        dup = sql1(base, "select auteur::text from public.quiz_quiz where slug like 'quiz-collegue-copie%%'")
        qp.verifier(dup == PROF, 'la copie du quiz du collègue n\'est pas à Loïc : %s' % dup)
        print('· en base :', types)
    finally:
        base.fermer()

    print('appels :', json.dumps(stats, ensure_ascii=False))
    if qp.FAUTES:
        print('✗ ' + '\n✗ '.join(qp.FAUTES))
        sys.exit(1)
    print('✓ éditeur : huit types créés, refus d\'une question incomplète, réouverture, réordonnancement, lecture seule et copie — tout est juste')


if __name__ == '__main__':
    main()
