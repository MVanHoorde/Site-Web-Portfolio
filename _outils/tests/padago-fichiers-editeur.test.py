"""
padago-fichiers-editeur.test.py — l'éditeur Padago et le dépôt de fichiers
(bdd/schema/043), de bout en bout dans Chromium, contre une base simulée.

Une fausse session d'autrice est posée dans localStorage ; toutes les
requêtes vers Supabase sont interceptées (rien ne sort sur le réseau).
Scénarios : PDF déposé par la fenêtre d'une carte, vidéo refusée avec le
bon message, fichier lâché sur une colonne, fenêtre annulée → fichier
effacé, enregistrement (le chemin part dans le brouillon ET la version
élève), suppression de carte → ménage, rendu élève (Ouvrir / Télécharger).

Lancer depuis la racine du dépôt :  python _outils/tests/padago-fichiers-editeur.test.py
"""
import base64, json, os, re, sys, tempfile, threading, functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

RACINE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
UID = '00000000-0000-0000-0000-00000000000b'
PAD = '22222222-2222-2222-2222-222222222222'
SUPA = 'https://ztyvuiaohxekuyjeoaxz.supabase.co'

def b64(d): return base64.urlsafe_b64encode(json.dumps(d).encode()).decode().rstrip('=')
JWT = b64({'alg': 'HS256'}) + '.' + b64({'sub': UID, 'role': 'authenticated'}) + '.sig'

brouillon = {'id': 'pad_test', 'titre': 'Pad fichiers', 'sel': 'abc', 'codeMaitre': '', 'options': {}, 'medailles': [],
             'colonnes': [{'id': 'c_1', 'titre': 'Document 1', 'secrete': False, 'cartes': [], 'cadenas': {'type': 'libre'}, 'coffre': None}]}
base = {'pad': {'id': PAD, 'slug': 'bcdefghjkm', 'titre': 'Pad fichiers', 'brouillon': brouillon, 'publie': None, 'copiable': True},
        'fichiers': {}, 'effaces': [], 'patchs': []}

ok = ko = 0
def verif(nom, cond):
    global ok, ko
    if cond: ok += 1
    else: ko += 1; print('ÉCHEC :', nom)

def supabase(route, req):
    url, m = req.url, req.method
    def rep(corps, statut=200): route.fulfill(status=statut, content_type='application/json', body=json.dumps(corps))
    if '/rpc/padago_suis_auteur' in url: return rep(True)
    if '/rpc/padago_occupation' in url:
        tot = sum(base['fichiers'].values())
        return rep({'total': tot, 'nb': len(base['fichiers']), 'pads': {PAD: tot} if tot else {}})
    if '/rest/v1/padago_pads' in url and m == 'GET': return rep([base['pad']])
    if '/rest/v1/padago_pads' in url and m == 'PATCH':
        d = json.loads(req.post_data); base['patchs'].append(d); base['pad']['brouillon'] = d['brouillon']
        return route.fulfill(status=204, body='')
    if '/storage/v1/object/list/padago' in url:
        pre = json.loads(req.post_data)['prefix'] + '/'
        return rep([{'id': 'x', 'name': c[len(pre):], 'metadata': {'size': t}} for c, t in base['fichiers'].items() if c.startswith(pre)])
    if '/storage/v1/object/padago' in url and m == 'DELETE':
        l = json.loads(req.post_data)['prefixes']; base['effaces'] += l
        for c in l: base['fichiers'].pop(c, None)
        return rep([{'name': c} for c in l])
    if '/storage/v1/object/padago/' in url and m == 'POST':
        chemin = url.split('/storage/v1/object/padago/')[1]
        base['fichiers'][chemin] = len(req.post_data_buffer or b'')
        base.setdefault('mimes', {})[chemin] = req.headers.get('content-type')
        return rep({'Key': 'padago/' + chemin})
    if '/storage/v1/object/public/padago/' in url:
        return route.fulfill(status=200, content_type='application/pdf', body=b'%PDF-1.4 test')
    print('requête non simulée :', m, url); return rep({}, 404)

# serveur local sur la racine du dépôt
class Muet(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
Gest = functools.partial(Muet, directory=RACINE)
serveur = ThreadingHTTPServer(('127.0.0.1', 0), Gest)
threading.Thread(target=serveur.serve_forever, daemon=True).start()
ICI = f'http://127.0.0.1:{serveur.server_port}/outils/padago/'

tmp = tempfile.mkdtemp()
pdf = os.path.join(tmp, 'Fiche d’Électrons.pdf'); open(pdf, 'wb').write(b'%PDF-1.4 ' + b'x' * 5000)
mp4 = os.path.join(tmp, 'film.mp4'); open(mp4, 'wb').write(b'0' * 100)
gros = os.path.join(tmp, 'gros.pdf'); open(gros, 'wb').write(b'0' * (10 * 1048576 + 10))

with sync_playwright() as p:
    nav = p.chromium.launch()
    page = nav.new_page(viewport={'width': 1280, 'height': 900})
    erreurs = []
    page.on('pageerror', lambda e: erreurs.append(str(e)))
    page.route(re.compile(r'https://ztyvuiaohxekuyjeoaxz\.supabase\.co/.*'), supabase)
    page.add_init_script('localStorage.setItem("padago.session", JSON.stringify({access_token: "%s", refresh_token: "r", expires_at: Date.now() + 3600000, ouverte: Date.now(), email: "collegue@x"}))' % JWT)

    page.goto(ICI + 'index.html#pad=' + PAD)
    page.wait_for_selector('.colonne')
    page.wait_for_timeout(300)
    verif('jauge affichée', page.is_visible('#jauge'))

    # 1. Carte « Fichier » : vidéo refusée, trop gros refusé, puis un PDF
    page.click('[data-ajout-carte]')
    page.click('[data-type="fichier"]')
    page.set_input_files('[data-choisir]', mp4)
    page.wait_for_selector('[data-err-depot]:not([hidden])')
    verif('vidéo refusée, message OneDrive', 'OneDrive' in page.inner_text('[data-err-depot]'))
    page.set_input_files('[data-choisir]', gros)
    page.wait_for_function('document.querySelector("[data-err-depot]").textContent.includes("10 Mo")')
    verif('fichier de plus de 10 Mo refusé', True)
    verif('rien envoyé pour les refus', not base['fichiers'])
    page.set_input_files('[data-choisir]', pdf)
    page.wait_for_selector('.depot-actuel')
    chemin_pdf = next(iter(base['fichiers']))
    verif('chemin <compte>/<pad>/<tirage>-<nom>', re.fullmatch(UID + '/' + PAD + r'/[a-z0-9]{8}-fiche-d-electrons\.pdf', chemin_pdf) is not None)
    verif('type MIME PDF envoyé', base['mimes'][chemin_pdf] == 'application/pdf')
    verif('nom d’origine affiché', 'Fiche d’Électrons.pdf' in page.inner_text('.depot-actuel'))
    page.locator('dialog').screenshot(path=os.path.join(tmp, 'dialogue.png'))
    page.click('dialog .dlg-pied button.primaire')
    page.wait_for_selector('.kcarte .k-fichier')
    page.wait_for_function('document.querySelector("#etat-sauv").textContent.includes("Enregistré")', timeout=8000)
    dern = base['patchs'][-1]
    carte = dern['brouillon']['colonnes'][0]['cartes'][0]
    verif('carte fichier dans le brouillon', carte['type'] == 'fichier' and carte['chemin'] == chemin_pdf)
    verif('carte fichier dans la version élève', dern['publie']['colonnes'][0]['cartes'][0]['chemin'] == chemin_pdf)

    # 2. Fenêtre annulée après un envoi : le fichier repart
    page.click('[data-ajout-carte]')
    page.click('[data-type="image"]')
    png = os.path.join(tmp, 'photo.png'); open(png, 'wb').write(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='))
    page.set_input_files('[data-choisir]', png)
    page.wait_for_selector('.depot-actuel')
    chemin_png = [c for c in base['fichiers'] if c.endswith('photo.png')][0]
    page.click('dialog .dlg-pied button:has-text("Annuler")')
    page.wait_for_timeout(500)
    verif('annuler efface le fichier envoyé', chemin_png in base['effaces'])

    # 3. Un fichier lâché sur une colonne
    page.evaluate('''() => {
      const dt = new DataTransfer();
      dt.items.add(new File([new Uint8Array([137,80,78,71])], "schéma.png", {type: "image/png"}));
      const col = document.querySelector(".colonne");
      col.dispatchEvent(new DragEvent("dragover", {dataTransfer: dt, bubbles: true, cancelable: true}));
      col.dispatchEvent(new DragEvent("drop", {dataTransfer: dt, bubbles: true, cancelable: true}));
    }''')
    page.wait_for_function('document.querySelectorAll(".kcarte").length === 2')
    verif('glisser sur une colonne crée une carte image', page.locator('.kcarte').nth(1).locator('figure.k-image img').count() == 1)
    page.wait_for_function('document.querySelector("#etat-sauv").textContent.includes("Enregistré")', timeout=8000)

    # 4. Supprimer la carte PDF → ménage après l'enregistrement
    page.locator('.kcarte').first.click(position={'x': 5, 'y': 5})
    page.once('dialog', lambda d: d.accept())
    page.click('dialog .dlg-pied button.danger')
    page.wait_for_function('document.querySelectorAll(".kcarte").length === 1')
    page.wait_for_timeout(2500)
    verif('carte supprimée → fichier effacé', chemin_pdf in base['effaces'])

    # 5. Rendu élève (aperçu) d'une carte fichier
    apercu = dict(brouillon); apercu['colonnes'] = [dict(brouillon['colonnes'][0], cartes=[
        {'id': 'k_1', 'type': 'fichier', 'chemin': UID + '/' + PAD + '/abcdefgh-cours.pdf', 'nom': 'Cours.pdf', 'taille': 120000, 'titre': 'Le cours'}])]
    el = nav.new_page(viewport={'width': 820, 'height': 1000})
    el.on('pageerror', lambda e: erreurs.append(str(e)))
    el.route(re.compile(r'https://ztyvuiaohxekuyjeoaxz\.supabase\.co/.*'), supabase)
    el.add_init_script('localStorage.setItem("padago.apercu", %s)' % json.dumps(json.dumps(apercu)))
    el.goto(ICI + 'pad.html?apercu=1')
    el.wait_for_timeout(800)
    # le mode élève demande un prénom d'abord
    if el.locator('input').count():
        el.locator('input').first.fill('Test A')
        el.keyboard.press('Enter')
        el.wait_for_timeout(500)
    el.wait_for_selector('.k-fichier', timeout=5000)
    liens = el.eval_on_selector_all('.k-fichier a', 'l => l.map(a => a.href)')
    verif('élève : Ouvrir et Télécharger', len(liens) == 2 and liens[0].endswith('abcdefgh-cours.pdf') and 'download=Cours.pdf' in liens[1])
    el.screenshot(path=os.path.join(tmp, 'eleve.png'))
    page.screenshot(path=os.path.join(tmp, 'editeur.png'))
    verif('aucune erreur JavaScript', not erreurs)
    if erreurs: print(erreurs)
    nav.close()

serveur.shutdown()
print('captures :', tmp)
print(f'{ok} contrôles passés, {ko} échecs')
sys.exit(1 if ko else 0)
