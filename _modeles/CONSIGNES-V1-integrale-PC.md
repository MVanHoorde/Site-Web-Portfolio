# CONSIGNES — V1 intégrale d'un chapitre de PHYSIQUE-CHIMIE

> **À quoi sert ce document.** Amener un chapitre de PC de sa source (PPTX/PDF)
> à une page web qui contient **tout le cours**, sans perte : chaque figure,
> chaque légende, chaque exercice, chaque correction. Loïc doit pouvoir lire son
> cours entier à l'écran et juger sur pièce ce qu'il veut changer.
>
> **Ce document remplace l'ancien « régime A — ébauche rapide »** (§1ter de
> `CONSIGNES-chapitre-PC.md`). Les 14 chapitres actuellement en ligne en sont
> issus : ils sont fidèles dans le texte mais **troués de blocs `.a-faire` à la
> place des images**. C'est précisément ce que la V1 intégrale supprime.
>
> **Ce document ne couvre PAS** : la fiche élève (§6 de
> `CONSIGNES-chapitre-PC.md`, faite en tout dernier, cours figé), ni le
> raffinage graphique (régime B, §2). Ni les séquences SNT — autre famille,
> autres consignes.

---

## 1. La règle d'or

**Aucun bloc `.a-faire` ne peut être posé au motif qu'un contenu est une
image.** Une image de la source arrive sur la page, d'une manière ou d'une
autre : extraite, découpée, ou retranscrite. Une seule exception subsiste
(§7) : le lien vers le DS.

Corollaire : à la fin d'une V1, ouvrir la page et le PDF côte à côte doit
donner **le même cours**. Rien n'est resté dans le PDF.

## 2. Autonomie totale — zéro question

Loïc dépose des fichiers et part. Il doit retrouver le travail **fait**, pas des
questions en attente. Donc, pendant toute la production :

- prendre seul toutes les micro-décisions (slug, nommage d'image, formulation
  d'une légende, placement d'une figure) ;
- **inventer le code de déblocage** s'il n'est pas fourni : 6 caractères, un mot
  clé du chapitre avec une lettre remplacée par un chiffre proche (`AT0MES`,
  `S0NORE`, `M1RAGE`), empreinte SHA-256 posée directement dans le HTML, jamais
  de placeholder ;
- **corriger les erreurs de physique évidentes**, sans demander — mais jamais en
  silence : voir §6 ;
- ne s'arrêter que si une source est inexploitable.

Le seul moment d'échange est le **relevé final** (§8). C'est là que Loïc
vérifie.

## 3. Extraction — le pipeline complet

Les trois passes se font **toutes les trois**, systématiquement. Chacune attrape
ce que les autres manquent.

```bash
# — Passe 1 : le texte des diapositives
pip install python-pptx --break-system-packages -q
python3 - <<'PY'
from pptx import Presentation
prs = Presentation('SOURCE.pptx')
for i, s in enumerate(prs.slides, 1):
    print(f"\n===== DIAPO {i} =====")
    def walk(shapes):
        for sh in shapes:
            if sh.shape_type == 6:            # groupe : descendre dedans
                walk(sh.shapes); continue
            if sh.has_text_frame and sh.text_frame.text.strip():
                print(sh.text_frame.text.strip())
    walk(s.shapes)
PY

# — Passe 2 : le rendu fidèle de chaque diapo (la vue qu'a Loïc en classe)
pdftoppm -r 130 -png SOURCE.pdf rendu/diapo

# — Passe 3 : les images embarquées, AVEC leur numéro de page
pdfimages -all -p SOURCE.pdf extrait/p
```

**Figure vectorielle absente de `pdfimages`** (graphique composé dans
PowerPoint, schéma fait de formes) : elle n'existe comme image nulle part. La
récupérer par **découpe du rendu** : `pdftoppm -r 200`, puis rognage aux
coordonnées lues sur la planche. C'est la méthode par défaut pour les graphiques
d'exercice.

**Liens — trois mécanismes coexistent, vérifier les trois** :

```bash
# a) QR codes embarqués comme images
apt-get install -y libzbar0 && pip install pyzbar --break-system-packages -q
python3 -c "
from pyzbar.pyzbar import decode; from PIL import Image
print(decode(Image.open('extrait/p-007-000.png')))"

# b) hyperliens portés par le texte (runs)
# c) hyperliens portés par la FORME elle-même (click-action) — fréquent sur les
#    pastilles « Réviser en vidéo » ; invisible en (b), il faut lire shape.click_action
python3 - <<'PY'
from pptx import Presentation
prs = Presentation('SOURCE.pptx')
for i, s in enumerate(prs.slides, 1):
    def walk(shapes):
        for sh in shapes:
            if sh.shape_type == 6: walk(sh.shapes); continue
            ca = getattr(sh, 'click_action', None)
            if ca is not None and ca.hyperlink and ca.hyperlink.address:
                print(i, 'FORME', sh.shape_id, '->', ca.hyperlink.address)
            if sh.has_text_frame:
                for p in sh.text_frame.paragraphs:
                    for r in p.runs:
                        if r.hyperlink and r.hyperlink.address:
                            print(i, repr(r.text), '->', r.hyperlink.address)
    walk(s.shapes)
PY
```

🔴 **Vérification visuelle obligatoire.** Le mapping diapo→image via les `.rels`
du PPTX est **trompeur**. `pdfimages -p` donne la bonne *page*, pas le bon
*emplacement*. Avant de poser une image sur la page : planche contact + `view`,
image par image. Si l'outil de visualisation est en panne, le déclarer dans le
relevé plutôt que de deviner.

## 4. Ce que devient chaque élément de la source

| Élément dans la source | Ce qu'on en fait en V1 |
|---|---|
| Texte de cours, définition, propriété, remarque | Transcrit **mot pour mot**, dans le composant de la charte qui convient (§3 de `CONSIGNES-chapitre-PC.md`) |
| **Paragraphe explicatif** (le « en effet… », le « c'est pourquoi… ») | Transcrit lui aussi. C'est le contenu qui se perd le plus facilement parce qu'il n'a ni titre ni encadré |
| Exercice + correction | **Intégralement** rédigés, énoncé et étapes, avec le graphique support à côté de l'énoncé |
| Formule rendue en image par PowerPoint | Retypée en `.formule-bloc` |
| **Photo réelle** (guitare, portrait, cristal, sonomètre) | **Extraite, optimisée** (≤ 900 px, JPEG q82), nommée parlant, déposée dans `assets/img/pc/<slug-de-page>/` |
| **Schéma, clipart, graphique, frise** | **Extrait tel quel** et posé sur la page, suffixé `-source` (ex. `t3c1-echelle-db-source.png`). Le SVG à la charte viendra en régime B et **remplacera** le fichier ; en attendant, le cours est complet |
| **Légende « Image N — … »** | **Reprise intégralement** en `<figcaption>`. Une figure sans sa légende est une figure à moitié récupérée |
| Tableau composé en image | Retranscrit en `table.tab`. L'image d'origine n'est pas conservée |
| **Donnée chiffrée prisonnière d'une image** (bornes d'un axe, valeurs d'un spectre, sous-domaines d'une frise) | **Extraite et écrite en toutes lettres** dans le texte ou dans un `table.tab`. C'est le point le plus souvent manqué |
| QR code / lien vidéo / Kahoot | Décodé, posé en `.video-chip` réel (`target="_blank" rel="noopener"`, `?si=` retiré) à l'endroit exact du QR |
| Lien vers un **DS** | **Seul `.a-faire` autorisé.** Le DS change chaque année, Loïc seul décide lequel lier |
| Erreur de physique évidente | Corrigée **et** marquée (§6) |

## 5. Droits d'usage — décision de Loïc, 25/08/2026

**Tout le contenu du cours est repris, y compris les images dont la licence
n'est pas identifiable.** Ce sont des supports de cours en usage depuis des
années ; l'objectif est d'abord que le cours existe en ligne, en entier.

Ce qu'on fait quand même, parce que ça ne coûte rien :

- **créditer** quand la source est connue (auteur, origine, licence) en fin de
  légende ;
- quand elle ne l'est pas, poser `data-origine="source PPTX — licence non
  identifiée"` sur la `<figure>` : ça rend l'inventaire greppable le jour où on
  voudra assainir ;
- **lister ces images dans le relevé** (§8), section « licences à confirmer ».

⚠ Une réserve à porter au dossier, pas un frein : le site est **public** par
construction (GitHub Pages). Le critère qui compte n'est donc pas l'usage
pédagogique non commercial mais le caractère public — c'est déjà la note versée
à la décision `T0-8`. Le jour où le site s'ouvrirait à d'autres établissements,
l'inventaire ci-dessus est ce qui permettra de trier sans tout rouvrir.

## 6. Erreurs de physique — corriger sans effacer la trace

Loïc doit pouvoir **vérifier chaque correction**. Donc, à chaque fois :

1. la page porte la **version corrigée**, pas la version fausse ;
2. un commentaire HTML est posé **au même endroit**, dans cette forme exacte :

```html
<!-- SOURCE → CORRIGÉ · diapo 9 · « deux fois plus intense si l'amplitude est
     deux fois plus grande » → l'intensité varie comme le CARRÉ de l'amplitude.
     Reformulé en lien qualitatif. À valider. -->
```

3. la ligne est reportée dans le relevé (§8).

Ainsi `grep -n "SOURCE → CORRIGÉ" pages/*.html` sort la liste complète des
retouches de fond du site entier, à tout moment.

**Vérifier chaque calcul des corrigés à la main**, y compris quand la source
donne le résultat : les incohérences de la source (arrondi qui change d'une
diapo à l'autre, chiffres significatifs incompatibles avec la lecture
graphique) se voient à ce moment-là et nulle part ailleurs.

**Ce qu'on ne corrige pas soi-même** : le fond pédagogique — choix des notions,
progression, formulations. Un défaut de guidage se signale en une ligne dans le
relevé ; Loïc juge.

## 7. Ce qu'on ne fait PAS en V1

- ❌ pas de fiche élève, pas de PDF, pas de pagination ;
- ❌ pas de SVG à la charte pour les schémas (l'image source suffit à ce stade) ;
- ❌ pas de maquette PNG soumise à validation — c'est le régime B ;
- ❌ pas de reformulation du cours ;
- ❌ pas de captures d'écran de la page.

## 8. Livrable par chapitre

1. `pages/2nde-pc-tX-cY-<nom-court>.html` — la page complète ;
2. `assets/img/pc/2nde-pc-tX-cY/` — toutes les images extraites ;
3. `_suivi/tXcY-releve.md` — **le relevé**, seul document que Loïc lit vraiment.
   Cinq sections, dans cet ordre :
   - **Erreurs de physique corrigées** — une ligne chacune : ce que disait la
     source, ce que dit la page, pourquoi ;
   - **Incohérences de calcul** — arrondis, chiffres significatifs, valeurs qui
     ne se recoupent pas d'un exercice à l'autre ;
   - **Contenus récupérés qui n'étaient nulle part ailleurs** — les données
     sorties des images ;
   - **Licences à confirmer** — les images sans origine identifiée ;
   - **Remarques pédagogiques** — une ligne chacune, sans correction : notion
     utilisée sans être définie, compétence du DS sans exercice en face,
     énoncé ambigu. Loïc tranche.
4. la page **liée** depuis `pages/2nde-physique-chimie.html` (règle
   anti-préfixe : `href="2nde-pc-t3-c1-….html"`, jamais `href="pages/…"`) ;
5. `_suivi/chapitres.md` mis à jour ;
6. une **archive delta** — jamais le site complet.

## 9. Validation avant livraison

```text
□ node --check sur les scripts extraits de la page
□ Playwright : chargement sans erreur JS
□ Playwright — verrou : verrouillé à l'arrivée → mauvais code rejeté → bon code
  en minuscules débloque → persiste au rechargement → ?verrou=1 reverrouille
□ Playwright — images : ouvrir TOUS les <details>, puis scrollIntoViewIfNeeded
  IMAGE PAR IMAGE avant de tester naturalWidth (le lazy loading donne des faux
  positifs si on défile d'un coup)
□ grep "a-faire" : il ne doit rester QUE le lien de DS
□ grep "SOURCE → CORRIGÉ" : le compte correspond au relevé
```

## 10. Message-type à coller en début de session

> Voici le PPTX (+ PDF) du chapitre [Thème X, Chapitre Y — TITRE, niveau].
> **V1 intégrale** : applique `_modeles/CONSIGNES-V1-integrale-PC.md`.
> Récupère **tout** — figures extraites et posées avec leurs légendes,
> graphiques d'exercice découpés du rendu, données chiffrées sorties des
> images, exercices et corrections rédigés en entier, liens et Kahoot décodés
> (QR + runs + click-action des formes). Aucun `.a-faire` sauf le DS. Corrige
> les erreurs de physique évidentes en posant le commentaire
> `<!-- SOURCE → CORRIGÉ … -->` à l'endroit exact et en les listant dans
> `_suivi/tXcY-releve.md`. Code de déblocage : invente-le. Lie la page depuis
> la page de niveau. Livraison : delta + relevé.

## 11. Où va la suite

La V1 n'est pas un chapitre fini. Une fois qu'elle est en ligne :

| Jalon | Ce qui se passe |
|---|---|
| 1. `V1 intégrale en ligne` | Loïc lit son cours entier à l'écran |
| 2. `Texte & exercices validés` | il annote, on corrige — conversation par chapitre |
| 3. `Images retravaillées` | les `-source` deviennent des SVG à la charte (régime B) |
| 4. `Ajouts & approfondissements` | ce qu'il veut en plus |
| 5. `Cours VALIDÉ` | « je peux l'utiliser l'an prochain » |
| 6. `Fiche élève faite` | **seulement ici**, cours figé — §6 de `CONSIGNES-chapitre-PC.md` |
| 7. `CHAPITRE CLOS` | |
