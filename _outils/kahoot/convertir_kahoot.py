"""Convertit les extraits bruts des Kahoot (extraire_kahoot.py) en fichiers
de quiz Diapason, prêts à importer, rangés par chapitre.

    python -I -X utf8 _outils/kahoot/convertir_kahoot.py

Lit   _quiz/kahoot/brut/*.brut.json   (extraction)
      _quiz/kahoot/corrections-*.json (formules rétablies à la relecture)
Écrit _quiz/kahoot/diapason/<section>/<slug>.json   (sources, hors Git)
      assets/img/quiz/kahoot/<slug>/qNN.jpg          (images utiles seulement)

Transcription « telle quelle » : la formulation de Kahoot est gardée.
Correspondance des types :
  Quiz → qcm (plusieurs bonnes réponses possibles) · Vrai ou faux → vf
  Réponse libre → mot · Puzzle → ordre
  Curseur → num : Kahoot n'imprime que la bonne valeur, pas l'échelle du
  curseur ; l'élève tape donc le nombre (signalé « à vérifier »).
Les images : seules celles dont la question a besoin sont gardées (code,
schéma, objet à identifier) — les illustrations décoratives de Kahoot ne
sont pas reprises.
"""
import json
import re
import sys
from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parents[2]
KAHOOT = RACINE / '_quiz' / 'kahoot'
SORTIE = KAHOOT / 'diapason'
IMAGES = RACINE / 'assets' / 'img' / 'quiz' / 'kahoot'

# slug du brut → (dossier Diapason, slug Diapason, titre)
# 🔴 Rangement PROPOSÉ par Claude, à valider par Loïc (les noms des dossiers
#    sont ceux des chapitres du site ; Tle ES ch. 3 et 4 : intitulés du programme).
SNT, ES1, EST, PC2 = '2de SNT', '1re ES', 'Tle ES', '2de PC'
RANGEMENT = {
    '01-le-web-01bis-requetes-http': ([SNT, 'Le Web'], 'kh-snt-web-requetes-http'),
    '02-02bis-03-langages-dune-page-web-moteur-de-recherche': ([SNT, 'Le Web'], 'kh-snt-web-langages-moteur'),
    't1-2-historique-d-internet-et-routage': ([SNT, 'Internet'], 'kh-snt-internet-historique-routage'),
    't1-3-ip-dns': ([SNT, 'Internet'], 'kh-snt-internet-ip-dns'),
    'hs-langage-binaire': ([SNT, 'Les systèmes informatisés'], 'kh-snt-systemes-binaire'),
    's2-dans-le-ventre-de-la-machine': ([SNT, 'Les systèmes informatisés'], 'kh-snt-systemes-s2-ventre-machine'),
    's3-brancher-juste-et-choisir-sa-machine': ([SNT, 'Les systèmes informatisés'], 'kh-snt-systemes-s3-brancher'),
    'les-graphes-et-les-reseaux-sociaux': ([SNT, 'Les réseaux sociaux'], 'kh-snt-reseaux-graphes'),
    't3-1-vision-humaine-et-appareil-photographique': ([SNT, 'La photographie numérique'], 'kh-snt-photo-1-vision'),
    't3-2-caracteristiques-d-une-image-numerique': ([SNT, 'La photographie numérique'], 'kh-snt-photo-2-image'),
    't3-3-couleurs-et-traitement-de-l-image': ([SNT, 'La photographie numérique'], 'kh-snt-photo-3-couleurs'),
    'python-niveau-1-a-3': ([SNT, 'Python'], 'kh-snt-python-niveaux-1-3'),
    'python-niveau-4-lecture-de-l-entree': ([SNT, 'Python'], 'kh-snt-python-niveau-4'),
    'positionnement-t1c1': ([ES1, 'La nucléosynthèse'], 'kh-es1-nucleo-positionnement'),
    '1ere-es-les-elements-chimiques': ([ES1, 'La nucléosynthèse'], 'kh-es1-nucleo-elements'),
    'bilan-la-radioactivite': ([ES1, 'La radioactivité'], 'kh-es1-radioactivite-bilan'),
    'bilan-les-edifices-ordonnes-les-cristaux': ([ES1, 'Les cristaux'], 'kh-es1-cristaux-bilan'),
    '1ere-es-son-et-musique': ([ES1, 'Son et musique'], 'kh-es1-son-musique'),
    '1ere-es-le-son-une-information-a-coder': ([ES1, 'Le son, une information à coder'], 'kh-es1-son-coder'),
    'positionnement': ([EST, "Deux siècles d'énergie électrique"], 'kh-est-energie-positionnement'),
    'bilan-cours-deux-siecles-d-energie-electrique': ([EST, "Deux siècles d'énergie électrique"], 'kh-est-deux-siecles-bilan'),
    'kahoot-enrichi-deux-siecles-d-energie-electrique': ([EST, "Deux siècles d'énergie électrique"], 'kh-est-deux-siecles-enrichi'),
    'bilan-cours-production-et-stockage-de-l-electricite': ([EST, "Production et stockage de l'électricité"], 'kh-est-production-stockage-bilan'),
    'theme-2-chapitre-3': ([EST, "Optimisation du transport de l'électricité"], 'kh-est-transport-chapitre'),
    'kahoot-enrichi-conversion-et-transport-de-lenergie-electriqu': ([EST, "Optimisation du transport de l'électricité"], 'kh-est-transport-enrichi'),
    'la-distribution-de-l-energie-electrique-rencontre-avec-enedi': ([EST, "Optimisation du transport de l'électricité"], 'kh-est-transport-enedis'),
    'theme-2-chapitre-4': ([EST, 'Choix énergétiques et impacts sur les sociétés'], 'kh-est-choix-chapitre'),
    '2025-2026-notes-visite-d-un-professionnel-d-edf': ([EST, 'Choix énergétiques et impacts sur les sociétés'], 'kh-est-choix-visite-edf'),
    'evaluation-diagnostique-organisation-et-transformations-de-l': ([PC2, "La matière à l'échelle macroscopique"], 'kh-pc2-matiere-diagnostic'),
}
SECTION_DOSSIER = {SNT: 'snt', ES1: 'es1', EST: 'est', PC2: 'pc2'}

# l'énoncé renvoie à l'image : on la garde
RENVOI_IMAGE = re.compile(
    r"ci-contre|ci-dessous|ci-dessus|de quoi s'agit|qu'est-ce que c'est|qui suis-je \?$|que (va|vont) afficher|"
    r"\b(cette|cet|ce|ces) (image|photo|photographie|schéma|graphe|graphique|code|programme|objet|composant|appareil|"
    r"carte|courbe|signal|figure|document|tableau|circuit|montage|spectre|logo|symbole|câble|port|connecteur|"
    r"pictogramme|élément|machine|périphérique|matériel|réseau|arbre|url|page|cristal|maille|structure|molécule|"
    r"dispositif|installation|centrale|équipement|carte mère|processeur|instrument|oscillogramme|enregistrement|courbe)\b|"
    r"\bsuivante?s?\b|représenté|illustré|sur l'image|sur la photo|sur le schéma|identifier",
    re.I)


def nombre(t):
    """« 4000 Hz » → (4000.0, 'Hz') ; « 0,25 » → (0.25, '')."""
    t = t.replace(chr(0x202f), ' ').replace(chr(0xa0), ' ').replace(chr(0x2212), '-').strip()
    m = re.match(r'^([-+]?\d[\d ]*(?:[.,]\d+)?)(?:\s*[x×]\s*10\^?\s*([-+]?\d+))?\s*(.*)$', t)
    if not m:
        return None, None
    v = float(m.group(1).replace(' ', '').replace(',', '.'))
    if m.group(2):
        v *= 10 ** int(m.group(2))
    return v, m.group(3).strip()


def garder_image(brut_rel, slug, num):
    src = KAHOOT / 'brut' / brut_rel
    if not src.exists():
        return None
    d = IMAGES / slug
    d.mkdir(parents=True, exist_ok=True)
    f = d / f'q{num:02d}.jpg'
    im = Image.open(src)
    if im.mode in ('RGBA', 'LA', 'P'):
        fond = Image.new('RGB', im.size, (255, 255, 255))
        im = im.convert('RGBA'); fond.paste(im, mask=im.split()[-1]); im = fond
    else:
        im = im.convert('RGB')
    im.thumbnail((900, 900))
    im.save(f, quality=82, optimize=True, progressive=True)
    return str(f.relative_to(RACINE)).replace('\\', '/')


def convertir_question(q, corr, slug):
    """Une question brute → une question Diapason (ou None, avec la raison)."""
    if corr.get('illisible'):
        return None, 'illisible sur le PDF : ' + corr.get('note', '')
    enonce = corr.get('enonce') or q['enonce']
    reps = [dict(r) for r in q['reponses']]
    if corr.get('reponses') and isinstance(corr['reponses'][0], dict):
        # transcription complète (seconde relecture) : elle remplace l'extraction
        reps = [dict(r) for r in corr['reponses']]
        q = dict(q, type=corr.get('type') or q['type'])
    elif corr.get('reponses') and len(corr['reponses']) == len(reps):
        for r, t in zip(reps, corr['reponses']):
            r['texte'] = t
    if any(not r['texte'].strip() for r in reps):
        return None, 'une réponse reste illisible (formule ou image non transcrite)'
    if not enonce.strip():
        return None, 'énoncé vide'
    t, d, verif = q['type'], {'enonce': enonce}, []
    justes = [i for i, r in enumerate(reps) if r.get('juste')]

    if t == 'Vrai ou faux':
        vrai = next((r for r in reps if r['texte'].strip().lower() == 'vrai'), None)
        if vrai is None or not justes:
            return None, 'vrai/faux sans bonne réponse lisible'
        d.update(type='vf', correct=[0 if vrai.get('juste') else 1], temps=20)
    elif t == 'Quiz':
        if len(reps) >= 2 and justes:
            d.update(type='qcm', options=[r['texte'] for r in reps], correct=justes, temps=20)
        elif len(reps) == 1:
            v, u = nombre(reps[0]['texte'])
            if v is None:
                d.update(type='mot', mot={'acceptes': [reps[0]['texte']]}, temps=30)
            else:
                d.update(type='num', num={'valeur': v, 'tolerance': 0.0001, **({'unite': u, 'unites': [u]} if u else {})}, temps=30)
            verif.append('Kahoot n\'imprimait qu\'une seule réponse pour ce QCM : transformé en réponse à taper')
        else:
            return None, 'QCM sans bonne réponse lisible'
    elif t == 'Réponse libre':
        acc = [r['texte'] for r in reps if r['texte'].strip()]
        if not acc:
            return None, 'réponse libre sans réponse acceptée'
        d.update(type='mot', mot={'acceptes': acc}, temps=30)
    elif t == 'Puzzle':
        items = [r['texte'] for r in reps]
        if not 2 <= len(items) <= 8:
            return None, f'puzzle à {len(items)} éléments'
        d.update(type='ordre', items=items, temps=30)
    elif t == 'Curseur':
        if not reps:
            return None, 'curseur sans valeur'
        v, u = nombre(reps[0]['texte'])
        if v is None:
            return None, 'curseur : valeur illisible « ' + reps[0]['texte'] + ' »'
        d.update(type='num', num={'valeur': v, 'tolerance': 0.0001, **({'unite': u, 'unites': [u]} if u else {})}, temps=30)
        verif.append('curseur de Kahoot (échelle non imprimée) : l\'élève tape la valeur')
    else:
        return None, 'type inconnu ' + t

    utile = corr.get('image_utile')
    if q.get('image') and (utile or (utile is None and RENVOI_IMAGE.search(enonce))):
        src = garder_image(q['image'], slug, q['num'])
        if src:
            d['image'] = {'src': src, 'alt': 'Illustration de la question (reprise du Kahoot)'}
    elif utile and not q.get('image'):
        verif.append('la question demande une image que l\'extraction n\'a pas trouvée')
    if corr.get('note'):
        verif.append(corr['note'])
    if verif:
        d['a_verifier'] = ' · '.join(verif)
    return d, None


def main():
    corrections = {}
    # ordre de priorité : formules (1re relecture), transcriptions complètes, retouches à la main
    for motif in ('corrections-[ABC].json', 'transcriptions-*.json', 'corrections-manuelles.json'):
        for f in sorted(KAHOOT.glob(motif)):
            for k, v in json.loads(f.read_text(encoding='utf-8')).items():
                corrections[k] = {**corrections.get(k, {}), **v}
    total, ecartees, bilan = 0, [], []
    for brut in sorted((KAHOOT / 'brut').glob('*.brut.json')):
        b = json.loads(brut.read_text(encoding='utf-8'))
        cle = brut.name[:-len('.brut.json')]
        if cle not in RANGEMENT:
            print('✗ pas de rangement pour', cle); continue
        dossier, slug = RANGEMENT[cle]
        qs = []
        for q in b['questions']:
            d, raison = convertir_question(q, corrections.get(f'{cle}#{q["num"]}', {}), slug)
            if d:
                qs.append(d)
            else:
                ecartees.append(f'{b["titre"]} — q{q["num"]} : {raison}')
        if not qs:
            print('✗ aucun quiz produit pour', b['titre'], '(aucune question lisible)'); continue
        quiz = {'slug': slug, 'titre': b['titre'], 'niveau': dossier[0], 'matiere': '',
                'description': 'Repris tel quel du Kahoot « ' + b['titre'] + ' » (21/11/2026).',
                'partage': True, 'dossier': dossier, 'questions': qs}
        f = SORTIE / SECTION_DOSSIER[dossier[0]] / f'{slug}.json'
        # 21/11 : les quiz convertis sont désormais RETRAVAILLÉS à la main (corrections,
        # liens « à revoir ») — on ne les écrase plus, sauf demande explicite
        if f.exists() and '--ecraser' not in sys.argv:
            print('· déjà là, gardé :', f.name); continue
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(json.dumps(quiz, ensure_ascii=False, indent=1), encoding='utf-8')
        total += len(qs)
        n_img = sum(1 for q in qs if q.get('image'))
        n_ver = sum(1 for q in qs if q.get('a_verifier'))
        bilan.append(f'{len(qs):3d} q · {n_img:2d} img · {n_ver:2d} à vérifier · {" › ".join(dossier)} · {b["titre"]}')
    print('\n'.join(bilan))
    print(f'\n{total} questions converties dans {len(bilan)} quiz ; {len(ecartees)} écartées :')
    print('\n'.join('  · ' + e for e in ecartees))


if __name__ == '__main__':
    main()
