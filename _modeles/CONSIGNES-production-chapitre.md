# CONSIGNES — Production d'un chapitre (page de cours + fiche élève)

Tu produis un chapitre du site pédagogique de Loïc Van Hoorde (professeur de
physique-chimie, lycée Isaac de l'Étoile) à partir de ses sources PPTX/PDF.
**Tout se fait en français.** La charte et la bibliothèque de composants sont
validées et NON négociables : ta mission est un travail de fidélité et de
rigueur, pas de créativité de mise en page.

## 0. Fichiers de référence (dans le dépôt)

| Fichier | Rôle |
|---|---|
| `_modeles/gabarit-chapitre.html` | Squelette de page de cours + **un exemplaire de chaque composant validé** (CSS/JS réels) |
| `_modeles/gabarit-fiche.html` | Squelette de la fiche élève imprimable (style v4 aligné sur le site) |
| `pages/2nde-pc-t1-c2-transformations-physiques-chimiques.html` | **Exemple complet de référence v2** (composants, exercices, SVG, verrou centré) |
| `fiches/fiche-2nde-t1c2.html` | Exemple complet de fiche v2 |
| `style.css`, `assets/css/fonts.css` | Charte du site (ne pas modifier) |

En cas de doute sur un composant : ouvrir l'exemple de référence et copier
sa manière de faire.

## 1. Entrées attendues de Loïc

- Le PPTX et/ou le PDF du chapitre (le PDF fait foi pour le rendu final).
- Le niveau, le thème, le numéro de chapitre → **slug** : `2nde-t1c2`, etc.
- Le code de déblocage à 6 caractères, si Loïc veut le fixer lui-même.
  **En régime A, s'il ne le donne pas : ne PAS demander — l'inventer** (voir
  §1ter, « Codes de déblocage »). En régime B, où l'on peut échanger, demander
  reste possible si Loïc n'a rien précisé.

## 1bis. Deux régimes de production

La production d'un chapitre se fait en **deux temps**, à ne pas confondre :

- **Régime A — Ébauche rapide** (§1ter) : transcription texte-only du cours,
  manques signalés par des blocs `.a-faire` 🚧. But : **peupler le site d'un
  coup**, avoir un ensemble navigable, à moindre coût en tokens. Plusieurs
  chapitres peuvent s'enchaîner dans une même conversation.
- **Régime B — Raffinage** (§2 et suivants) : reprise d'une ébauche, une
  **conversation dédiée par chapitre**, pour traiter les `.a-faire` (images,
  schémas SVG validés, fiche élève paginée, tests, delta). C'est le mode qui a
  produit T1-C2 et T1-C4.

Par défaut, si Loïc ne précise rien : demander lequel des deux régimes.

## 1ter. Régime A — Ébauche rapide (chaîne de peuplement)

**Objectif** : à partir du PPTX/PDF, produire *vite* une page de cours HTML
fidèle dans le texte, structurée, verrouillée et liée depuis la page de niveau,
où **tout ce qui demande un travail à part est remplacé par un bloc `.a-faire`
visible** (🚧). On ne cherche pas la perfection visuelle : on cherche un site
complet et honnête sur ses manques, prêt à être raffiné chapitre par chapitre.

### Autonomie TOTALE — zéro interaction (règle capitale du régime A)

En régime A, **ne JAMAIS interrompre Loïc, ne poser AUCUNE question, ne
demander AUCUNE validation.** C'est une exception explicite et assumée à la
règle générale « décisions silencieuses interdites » (qui, elle, reste
pleinement en vigueur en régime B). Loïc dépose des fichiers et part vaquer à
ses occupations ; il doit retrouver le travail **fait**, pas des questions en
attente.

Concrètement, en régime A :
- prendre TOUTES les micro-décisions seul (choix de slug par convention,
  placement des blocs 🚧, formulation des `.a-faire`, etc.) ;
- **codes de déblocage : si Loïc n'en fournit pas, les inventer soi-même**,
  un par chapitre, 6 caractères, sur le principe déjà en usage sur le site
  (un mot clé du chapitre, une lettre remplacée par un chiffre visuellement
  proche — ex. `AT0MES`, `AV0G4D`, `S0LUTE`, `C0UCHE`, `ST4BLE`). Calculer
  l'empreinte SHA-256 et la poser directement dans le HTML — ne jamais
  laisser `EMPREINTE_SHA256_A_REMPLACER` en placeholder. **Tester chaque
  verrou via Playwright** (verrouillé au départ → mauvais code rejeté → bon
  code en minuscules déverrouille → persiste au reload → `?verrou=1`
  reverrouille) : c'est le seul test Playwright que le régime A ne s'interdit
  pas (§ Budget), le verrou étant fonctionnel et pas seulement visuel. Lister
  tous les codes en clair dans le récap final (Loïc les redonnera en classe) ;
- **corriger automatiquement** les erreurs scientifiques évidentes, sans
  demander — juste les lister dans le récap final ;
- ne PAS reformuler le cours (fidélité au texte) ; **sauf** défaut manifeste
  de formulation ou de guidage pédagogique : dans ce cas, un **mini-diagnostic
  d'une ligne** dans le récap (« diapo 5 : l'énoncé de l'ex. 3 ne donne pas
  l'unité de M — à préciser »), sans corriger le fond et sans y passer de
  tokens ; Loïc jugera lui-même. Réservé aux défauts **gros et nets**.
- ne s'arrêter que si une source est **inexploitable** (fichier corrompu,
  contenu absent) : le signaler brièvement et passer au chapitre suivant.

Le seul moment d'échange est **après** la chaîne, via le récap groupé. La
phase riche en allers-retours, c'est le régime B.

### Budget (ce qu'on NE fait PAS en régime A)

Pour ne pas consommer de tokens inutilement :

- ❌ pas d'extraction/optimisation de **photos réelles** (aucune photo copiée
  ni recadrée — elles restent en `.a-faire type="image"`) ;
- ❌ pas de maquette PNG, pas de SVG produit pour les **schémas et
  illustrations récapitulatives** (protocoles en images, coupes d'atome,
  graphiques à redessiner — cf. tableau de détection) ;
- ✅ **le décodage des QR/liens vidéo et Kahoot est fait** (voir « Décodage
  des liens ») — ce n'est plus un `.a-faire`, sauf lien indécodable ou lien
  de DS (toujours différé, voir tableau) ;
- ✅ **les exercices et leurs corrections sont rédigés en entier**, y compris
  quand une image accompagne l'énoncé dans la source (seule l'image reste
  `.a-faire`) ;
- ✅ **les encarts formule (`.formule-bloc`) sont posés** quand la source les
  rend comme une image (équation composée par le logiciel de présentation) —
  ce n'est pas un schéma, c'est du texte scientifique à retyper ;
- ✅ une **courte recherche web est possible** si un contenu semble manquant
  pour que le cours reste compréhensible (ex. une définition implicite) —
  à utiliser avec parcimonie, et à signaler dans le récap ;
- ❌ pas de fiche élève, pas de PDF, pas de pagination ;
- ❌ pas de Playwright pour le contenu (images, sommaire, captures) ;
  **exception : test du verrou** (voir ci-dessus, un test court par chapitre,
  pas de captures) ;
- ❌ pas de vérification exhaustive des corrigés à la main au-delà du calcul
  donné par la source (recalculer l'application numérique pour la valider
  reste bienvenu — voir §5.2 — mais pas de contre-expertise scientifique
  approfondie, **reportée au régime B**) ;
- ❌ pas d'archive delta zippée par chapitre (livraison groupée en fin de
  chaîne, §1ter-livraison).

### Extraction (texte seul)

Une seule extraction, le texte des diapositives, via `python-pptx` :

```bash
pip install python-pptx --break-system-packages -q
python3 - <<'PY'
from pptx import Presentation
prs = Presentation('SOURCE.pptx')
for i, s in enumerate(prs.slides, 1):
    print(f"\n===== DIAPO {i} =====")
    def walk(shapes):
        for sh in shapes:
            if sh.shape_type == 6:      # groupe
                walk(sh.shapes); continue
            if sh.has_text_frame and sh.text_frame.text.strip():
                print(sh.text_frame.text.strip())
    walk(s.shapes)
PY
```

Le PPTX peut tronquer les exposants à l'affichage (ex. `10⁻²` au lieu de
`10⁻²⁷`). En cas de doute sur une puissance de 10, **se fier au résultat
numérique du corrigé** pour retrouver le bon exposant, et le signaler.

### Détection : que devient chaque élément de la source

| Élément dans la source | Action en régime A |
|---|---|
| Texte de cours, énoncé, corrigé | **Transcrit** directement (fidèle, §5) |
| Exercice + correction, **même si une image l'accompagne** | **Transcrit intégralement** (énoncé + étapes de correction) ; seule l'image elle-même (photo, graphique support) devient `.a-faire` — le texte de l'exercice, lui, n'attend pas le régime B |
| Formule donnée en image dans la source (équation rendue comme graphique par le logiciel de présentation) | **Reconstituée en `.formule-bloc`** (charte, §3) — ce n'est pas un schéma à dessiner, c'est du texte scientifique à retyper |
| Définition, propriété ou tableau de données **essentiel à la compréhension**, piégé dans une image (ex. tableau grandeur/valeur, légende chiffrée) | **Extrait et retranscrit** en `.encart`/`table.tab` ; si un détail précis manque pour boucler l'explication, une **recherche web courte** est possible pour compléter (le signaler dans le récap) |
| Photo réelle (halite, portrait, modèle 3D…) | Bloc `.a-faire type="image"` avec description ; **rien** dans le HTML |
| Schéma pédagogique **illustratif ou récapitulatif** (protocole en images, cristal, coupes d'atome, graphique à redessiner) | Bloc `.a-faire type="schéma"` : décrire ce qu'il faut produire — ça reste un travail de maquette/SVG validé, donc régime B |
| QR code / lien vidéo (Kahoot compris) | **Décoder et poser en vrai lien** `.video-chip` (voir « Décodage des liens », ci-dessous) — ce n'est plus un `.a-faire` |
| Lien vers un **DS** | **Toujours en `.a-faire`**, quel que soit ce que contient la source : le DS change chaque année, seul Loïc décide lequel lier. Si un lien DS existe déjà dans le PPTX/PDF (ex. année précédente), le mentionner dans le `.a-faire` sans l'activer |
| Tableau complexe / classification (grand tableau périodique illustré, etc.) | Bloc `.a-faire type="tableau"` : « à intégrer plus tard » |
| Erreur scientifique **évidente** (exposant tronqué, formule ionique inversée type S₃Al₂→Al₂S₃, unité aberrante) | **Corrigée** + notée en une ligne dans le récap |
| Corrigé au calcul non trivial | Transcrit tel quel ; vérification fine **reportée au régime B** |

### Décodage des liens (QR + hyperliens texte)

Deux mécanismes coexistent dans les PPTX de Loïc — vérifier les deux :

```bash
# 1) QR codes intégrés comme images
apt-get install -y libzbar0 && pip install pyzbar --break-system-packages -q
python3 -c "
from pyzbar.pyzbar import decode
from PIL import Image
print(decode(Image.open('image_extraite.png')))
"
# extraire les images du PPTX au préalable (python-pptx : shape.image.blob
# pour chaque shape.shape_type == PICTURE)

# 2) hyperliens portés directement par le texte (fréquent quand la diapo
# écrit « Apprendre en vidéo », « Pour réviser en vidéo »… en toutes lettres)
python3 -c "
from pptx import Presentation
prs = Presentation('SOURCE.pptx')
for i, s in enumerate(prs.slides, 1):
    for sh in s.shapes:
        if sh.has_text_frame:
            for p in sh.text_frame.paragraphs:
                for r in p.runs:
                    if r.hyperlink and r.hyperlink.address:
                        print(i, r.text, '->', r.hyperlink.address)
"
```

Convertir le PPTX en PDF (`scripts/office/soffice.py`) puis en PNG
(`pdftoppm -r 130`) donne un rendu fidèle des diapos pour repérer visuellement
ce qui accompagne chaque lien et vérifier le sens de chaque exercice avant
transcription — c'est la même vue que Loïc a en présentant son cours.

Les liens décodés se posent en `.video-chip` réel (`href` direct, `target=
"_blank" rel="noopener"`, `?si=` retiré) à l'endroit exact où le QR/texte
apparaissait. Le Kahoot suit la même règle. Le DS, jamais (voir tableau
ci-dessus).

### Le bloc `.a-faire` (gabarit)

Structure minimale (le CSS est dans `gabarit-chapitre.html`) :

```html
<div class="a-faire">
  <span class="type">image</span>
  <span class="quoi">Photo — cristal de halite (échantillon de sel gemme)</span>
  <span class="detail">source : diapo 2 ; à extraire et optimiser en régime B</span>
</div>
```

`type` ∈ { image, schéma, vidéo, tableau }. Le bloc se pose **exactement à
l'emplacement du manque**, dans le fil du cours — pas de récapitulatif en fin
de page (la navigation sur le site suffit à les repérer). Le type `vidéo` ne
sert plus qu'au cas résiduel d'un lien indécodable (QR flou, image trop
compressée) ou à un lien de DS laissé en attente — pas aux vidéos normales,
désormais décodées.

### Ce qu'on fait quand même (non négociable même en ébauche)

- structure complète : sections `<details class="partie">`, `h2 id="ancre-N"`,
  sommaires latéral + mobile synchronisés, checklist finale, signature ;
- typographie scientifique (`.nb`, `<sub>`/`<sup>`, flèches `→`) — §5.3 ;
- verrou v2 : si Loïc donne le code, calculer l'empreinte et le poser ;
  sinon, laisser les placeholders et le signaler ;
- **lier la page depuis `pages/NIVEAU-physique-chimie.html`** en respectant la
  règle anti-préfixe (§5.8).

### Chaîne multi-chapitres & livraison groupée

En régime A, on peut enchaîner plusieurs chapitres dans **une même
conversation** : traiter les sources l'une après l'autre. À la fin de la
chaîne seulement :

1. une **archive delta unique** regroupant tous les chapitres ébauchés
   (`pages/…-cN.html` + la page de niveau mise à jour) ;
2. un récapitulatif compact : par chapitre, la liste des `.a-faire` posés et
   les erreurs corrigées.

Aucune capture, aucun PDF. Le contrôle se fait **par Loïc, sur le site en
ligne**, après push : il repère ce qui doit être retravaillé et ouvre une
conversation de régime B par chapitre.

## 2. Régime B — Raffinage : workflow imposé (maquettes AVANT implémentation)

Le régime B reprend une ébauche (§1ter) et traite ses blocs `.a-faire` un par
un, jusqu'à un chapitre « utilisable en classe l'an prochain ». Une
**conversation dédiée par chapitre**. Beaucoup d'échanges : ici, on valide.

**Ordre de travail** : d'abord le **cours** (texte affiné, images, schémas,
approfondissements) jusqu'à validation complète par Loïc ; **la fiche élève ne
se fait qu'en tout dernier**, une fois le cours figé (sinon elle est à refaire
à chaque changement).

**Pour chaque bloc `.a-faire`, proposer l'outil adapté** (Loïc veut savoir où
il doit intervenir et éviter les chantiers inadaptés) :

| Nature du chantier | Qui / quel outil |
|---|---|
| Schéma pédagogique simple (cristal, atome, cycle, case…) | **Ici** (SVG à la charte, maquette PNG validée) |
| Composant visuel complexe / exploration graphique | Proposer **Claude Design** (canvas), puis réintégrer le SVG |
| Photo réelle présente dans la source | **Ici** (extraction + optimisation) |
| Image libre à récupérer (Wikimedia…) | ⚠ accès réseau bloqué ici → **fournir le lien à Loïc** pour téléchargement, ou fabriquer un SVG maison |
| Contenu sous droits (personnage, presse, IP) | Écarter, signaler, **remplacer** (SVG maison ou équivalent libre) |
| Tableau complexe (classification…) | Selon le cas : réutiliser un existant du site, SVG, ou garder l'image en le signalant |
| Push / commit sur le dépôt | **Loïc ou Claude Code** (je n'ai pas d'accès en écriture GitHub) |

Signaler aussi, quand c'est pertinent, si un chantier **dépasse mes moyens
actuels** (skill/outil manquant) plutôt que de produire un résultat médiocre.

Étapes :

1. Extraire et analyser les sources (§4).
2. **Pour tout composant nouveau ou schéma refait : produire un PNG individuel**
   (une capture par composant, via Playwright sur une page de maquette) et le
   soumettre à Loïc. S'il y a une vraie hésitation possible : proposer 2-3
   variantes. Ne JAMAIS implémenter un visuel non validé (sauf accord explicite
   « sans me le montrer »).
3. Implémenter après validation, d'un bloc.
4. **Une fois le cours entièrement validé**, proposer les choix de trous de la
   fiche, Loïc arbitre, puis produire la fiche.
5. Valider (§7) puis livrer (§8).
6. Mettre à jour les flags du chapitre dans `_suivi/chapitres.md` (§10).

## 3. Bibliothèque de composants (validée — quand utiliser quoi)

Tous les styles sont dans le gabarit ; ne pas les réinventer.

Largeurs (validées) : le texte courant est **justifié** (`hyphens:auto`) ;
exercices, exemples détaillés, histoire des sciences et synthèses de TP sont
en **pleine largeur** de la colonne ; définitions et propriétés restent
alignées à gauche (70ch) ; le bloc formule garde sa largeur mais est
**centré**. Chaque section est enveloppée dans `<details class="partie" open>`
(titre h2 dans le `<summary>`, contenu dans `.partie-corps`) : les parties
s'ouvrent et se ferment au clic, bandeau + chevron marquent la délimitation,
et le JS du gabarit rouvre la section visée depuis le sommaire. Le cours se
termine par la signature `.signature` (M. Van Hoorde — Lycée général Isaac de
l'Étoile · Poitiers), après la checklist.

| Composant | Classe(s) | Usage | Accent |
|---|---|---|---|
| Définition | `.encart.definition` + `.terme` | Toute définition ; le terme défini est surligné avec `.terme` | Hβ cyan |
| Propriété | `.encart.propriete` | Lois, relations, propriétés ; équations centrées `.eq-ligne` HORS des paragraphes | Hγ violet |
| Formule | `.formule-bloc` | Formules à retenir : formule en réserve blanche sur panneau encre, grandeurs mono à droite, lettres en violet | encre + Hγ |
| Notation | `.notation` | Conventions d'écriture ; chips centrées, cas particulier sous filet pointillé | gris, pointillés |
| Méthode | `.methode` | Démarches pas-à-pas ; étapes en chiffres ROMAINS automatiques | or |
| Exemple détaillé | `.encart.exemple` | Exemple travaillé dans le fil du cours ; étiquette mono verte, duo image+texte possible | vert |
| Exemples illustrés | `figure` + `.pill-ex.phys/.chim` | Paires de photos d'illustration ; pastille pleine cyan (physique) / rouge (chimique) ; équation centrée `.eqc` dans la légende | — |
| Histoire des sciences | `.histoire` | Encadré patrimonial : double filet sépia, portrait crédité, citation SOURCÉE, pastille 🎬 unique | sépia |
| Synthèse de TP | `.synthese-tp` | Restitution d'un TP dans le cours : contexte italique, graphique, sous-étapes Analyse/Conclusion ; volontairement SOBRE (pointillés gris) | gris |
| Picto fiche | `.a-noter` (crayon ✎) | Sur chaque encart/figure repris dans la fiche élève (coin haut droit) | — |
| Exercice | `.exercice` | Voir §5 | Hα rouge |

## 4. Protocole d'extraction des sources

```bash
python3 /mnt/skills/public/pptx/scripts/office/unpack.py SOURCE.pptx unpacked/
apt-get install -y libzbar0 && pip install pyzbar --break-system-packages   # décoder TOUS les QR (pas cv2 seul)
pdfimages -all -p -f 2 -l N SOURCE.pdf pdfimg/p    # images AVEC numéro de page
```

Règles d'or (leçons des chapitres 1 et 2) :
- Le mapping diapo→image via les `.rels` du PPTX est **trompeur**. Le mapping
  page→image de `pdfimages -p` est fiable pour la PAGE, pas pour l'attribution
  au bon emplacement : **vérification VISUELLE de chaque image obligatoire**
  (planche contact + `view`). Si l'outil de visualisation est en panne :
  contrôle colorimétrique (luminosité, couleurs dominantes) + le déclarer
  honnêtement dans le récapitulatif.
- Figure vectorielle absente de `pdfimages` → découpe dans `pdftoppm -r 200`
  par coordonnées, rognage des marges.
- Schémas/graphiques/cliparts/tableaux-images → REFAITS (SVG charte ou
  `table.tab`). Photos réelles → conservées (≤900 px, JPEG q82,
  `assets/img/SLUG/`, noms parlants).
- Images libres complémentaires : Wikimedia Commons ; crédit en fin de légende
  (auteur, source, licence) ; vérifier la licence exacte avant publication.
- QR codes → pastilles `.video-chip` (libellé court + ↗, `_blank`,
  `rel="noopener"`, retirer `?si=`). Kahoot et DS → fin de checklist.

## 5. Règles de contenu

1. **Texte fidèle à la source, mot pour mot.** Aucune reformulation non
   signalée. Erreur scientifique dans la source → corriger ET signaler dans le
   récapitulatif (jamais de correction silencieuse).
2. **Vérifier chaque calcul des corrigés à la main.**
3. Typographie scientifique :
   - **Jamais de retour à la ligne entre une valeur et son unité** :
     envelopper dans `<span class="nb">…</span>`.
   - Indices/exposants : `<sub>`/`<sup>` systématiques (pas de caractères
     Unicode mélangés aux balises dans une même équation) ; dans `.eq-ligne`
     et `.eq-exo` ils passent automatiquement en mono.
   - Équations de réaction : TOUJOURS une flèche « → », jamais « = ».
   - Équations : centrées via `.eq-ligne`, jamais dans le fil d'un paragraphe.
4. Structure d'exercice normalisée :
   - étiquette rouge « Exercice N — intitulé » ;
   - contexte en romain ; **question(s) en italique** (`.question`) ;
   - données en mono séparées par filet pointillé (`.donnees`) ;
   - photo À CÔTÉ de l'énoncé (`.duo-x`), jamais dans la correction ;
   - correction dépliable séquencée par `.etape` :
     « Extraction des informations » → « **Formule du cours** » (application
     directe : rappel générique petit `.formule-cours-rappel` + version avec
     les **notations de l'énoncé en avant** en `.eq-ligne`) OU « Manipulation
     d'expression algébrique » (UNIQUEMENT si vraie manipulation) →
     « Application numérique » (résultat souligné `.resultat`) →
     « Conclusion » (si interprétation pertinente).
   - Exercices qualitatifs : étapes adaptées (ex. « Lecture en proportions »),
     ou pas d'étapes si trivial.
5. Schémas SVG : mêmes valeurs que la source ; annotations de graphiques par
   pastilles numérotées ①② hors des tracés ; étiquettes avec halo papier
   (`paint-order:stroke`) si posées sur un trait ; `dominant-baseline="central"`
   pour centrer un texte dans une forme ; jamais de texte qui déborde du cadre.
6. Sections : `h2 id="ancre-N"` numérotées 01, 02… ; sommaire latéral ET mobile
   synchronisés ; checklist finale `ds1…dsN` + Kahoots + DS.
7. Verrou v2 (porte centrée) : remplacer `EMPREINTE_SHA256_A_REMPLACER`
   (commande en commentaire) et les deux `SLUG`. `crypto.subtle` exige un
   contexte sécurisé : ne pas « simplifier ».
8. Lier la page depuis la page du niveau (`pages/NIVEAU-physique-chimie.html`).
   **Règle anti-préfixe (bug rencontré au C4)** : la page de niveau est
   elle-même dans `pages/`. Un lien vers un chapitre voisin s'écrit donc
   `href="2nde-pc-t1-cN-….html"` — **jamais** `href="pages/2nde-pc-…"`, sinon
   le navigateur cherche `pages/pages/…` → 404. Aligner tout nouveau lien sur
   la forme des chapitres déjà présents (les vérifier par un `grep`).
9. Gras minimal dans les textes pédagogiques.

## 6. Règles de la fiche élève (v4)

- Style aligné sur le site : mêmes encarts (`.definition`, `.propriete`,
  `.methode-f`, `.exercice-f`), **AUCUN pictogramme crayon** sur la fiche
  (le crayon ✎ n'existe que dans le cours en ligne).
- Chaque partie du chapitre est nettement délimitée : h2 avec numéro + champ
  **« date : ...... »** à droite (autonomie de gestion du temps des élèves) ;
  pages de continuation marquées par `<p class="suite">` discret.
- **TOUTES les définitions**, à rédiger **en entier** : cadre titré
  « Définition — [terme] » + lignes `.ligne` vides (les élèves écrivent les
  phrases complètes). Définition à plusieurs parties → sous-titres
  `.partie-def` pour chaque partie, dans le même cadre.
- **TOUTES les propriétés**, à compléter (trous `.trou` sur les notions clés).
- **Méthode (`.methode-f`) : PAS de texte à trous.** Une méthode se lit et se
  suit, elle ne se mémorise pas par cœur comme une définition : les étapes
  sont rédigées **en clair**, sans blancs à compléter.
- **TOUS les exercices du chapitre**, systématiquement : énoncé abrégé fidèle
  + zone de réponse adaptée (`.ligne` pour du rédigé, `.calc.lignes` pour du
  calcul, boîtes `.boite.pt` pour des coefficients à trouver).
- **PAS d'images, PAS d'exemples** : les élèves notent leurs propres exemples
  dans la colonne de notes. (Exception possible si un exemple est vraiment
  structurant — demander à Loïc.)
- Seulement les **schémas essentiels**, identifiés chapitre par chapitre,
  repris **TELS QUELS du cours** (mêmes SVG, réduits, avec leur légende dans
  `.schema .legende`). Pour T1-C2 : endo/exo, trois états, six changements
  (triangle), hot-dog avec sa légende. Un schéma contraint à une taille
  arbitrairement petite (`max-width` trop serré) doit être agrandi — ça sert
  aussi à équilibrer le remplissage des pages (voir pagination ci-dessous).
- Formule : cadre sobre `.formule-s`, formule en boîtes vides à gauche,
  « Grandeurs & unités » en lignes vides à droite, **rien de pré-rempli**,
  pas de panneau sombre.
- Structure Cornell : colonne de notes latérale qui s'étire jusqu'au pied de
  page (`.feuille` en flex, `.corps { flex:1 }`).
- Dernière page : « L'essentiel du chapitre, avec mes mots » + encadré code
  de déblocage (6 cases) ; signature dans le pied de la dernière page.
- Nombre de pages **pair** (recto-verso) ; ~250 mm utiles par page. Si le
  compte tombe impair une fois le contenu réparti, **replier la clôture**
  (« l'essentiel » + déblocage) sur la dernière page de contenu plutôt que
  de lui dédier une page à part entière.
- **Impression — fond blanc.** En `@media print`, le fond de `.feuille` est
  blanc pur (`#fff`), jamais le papier crème `--papier` (réservé à l'écran) :
  ça économise l'encre sur les tirages classe entière.
- **Aération.** Marge haute de 8mm au-dessus de chaque `h2` (pas 4mm), pour
  ne pas tasser les pages qui contiennent plusieurs grandes parties.
- **Pagination — mesurer, ne jamais estimer à l'œil.** Écrire un script
  Playwright qui mesure la hauteur réelle de chaque bloc de contenu
  (`getBoundingClientRect`), avec les polices du site installées localement
  (paquets `@fontsource/*` via npm — jamais de CDN) pour un rendu fidèle aux
  vraies métriques. Cible ~75-98 % de remplissage par page ; aucun titre de
  section (`h2`) seul en bas de page (le repousser à la page suivante).

## 7. Validation OBLIGATOIRE avant livraison

```text
□ node --check sur les scripts extraits de chaque fichier livré (page ET gabarits)
□ Playwright (CommonJS, require('/home/claude/.npm-global/lib/node_modules/playwright')) :
  □ chargement sans erreur JS
  □ verrou : verrouillé à l'arrivée (porte CENTRÉE, champ 6 caractères sans
    débordement) → mauvais code rejeté → bon code débloque (tester en
    minuscules) → persistance au rechargement → ?verrou=1 reverrouille
  □ images : OUVRIR tous les <details> puis scrollIntoViewIfNeeded IMAGE PAR
    IMAGE avant de tester naturalWidth (lazy loading : le défilement global
    donne des faux positifs)
  □ sommaire : section active correcte après 3 sauts de navigation
  □ captures bureau (1280px) : haut, 2 zones à figures, checklist + 1 mobile (390px)
□ Fiche : PDF via Playwright p.pdf({format:'A4', printBackground:true}) ;
  nombre de pages EXACT et PAIR (pdfinfo) ; contrôle du débordement de chaque
  .feuille (scrollHeight vs limite 297mm) ET de la marge entre le bas du
  contenu et le pied absolu (.pied) ; aperçu PNG de CHAQUE page via pdftoppm
□ Fiche — remplissage par page : mesurer (jamais estimer) la hauteur réelle
  de chaque page via getBoundingClientRect, avec les polices du site
  installées localement (@fontsource/*). Cible ~75-98 % par page, aucune
  page avec un titre de section seul en bas.
□ Contrôle visuel des captures AVANT livraison. Outil de visualisation en
  panne → contrôles automatiques (dimensions, contraste, couleurs charte,
  symétrie) + transparence dans le récapitulatif
```

Pièges connus (ne pas les reproduire) :
- Scripts Python d'édition : `assert count` avant chaque remplacement, écrire
  fichier par fichier (jamais tout accumuler puis écrire à la fin).
- Impression : `.feuille { height:296mm; overflow:hidden }` en `@media print`
  sinon pages fantômes ; `padding-bottom` suffisant pour le pied absolu.
- Sommaire actif : calcul à la position de défilement, PAS IntersectionObserver.
- `.formule-bloc` : PAS d'overflow:hidden (rogne le picto ✎) ; l'arrondi est
  sur `.eq` (border-radius:11px 0 0 11px).
- Repagination de la fiche : si le bloc de clôture (`.pleine-largeur`/
  `.deblocage`) est repositionné pour équilibrer les pages, ne l'insérer
  qu'à UN SEUL endroit — jamais à la fois dans la boucle normale des blocs de
  contenu ET en ajout spécial hors grille, sinon il apparaît en double
  silencieusement.
- Citations historiques : vérifier l'exactitude et la source ; mention
  « formule attribuée à » si paraphrase.

## 8. Livraison (format imposé)

1. **Archive delta** reproduisant l'arborescence, contenant UNIQUEMENT les
   fichiers créés/modifiés. **JAMAIS le site complet.**
2. Les fichiers HTML **aussi présentés individuellement** dans le panneau.
3. Le PDF de la fiche + aperçus PNG de chaque page.
4. Les captures d'écran de la page (bureau + mobile).
5. Récapitulatif final : erreurs corrigées dans la source (à signaler aux
   collègues le cas échéant), décisions prises, **décisions laissées ouvertes**,
   licences des images à confirmer, le code de déblocage et son empreinte.

## 9. Messages-types que Loïc colle en début de session

### 9a. Régime A — ébauche (chaîne de peuplement)

> Voici le PPTX (+ PDF) du/des chapitre(s) [préciser]. **Régime A — ébauche.**
> Applique le §1ter de `_modeles/CONSIGNES-production-chapitre.md` :
> transcription texte-only sur `gabarit-chapitre.html`, exercices et
> corrections rédigés en entier (même quand une image accompagne l'énoncé —
> seule l'image reste `.a-faire`), encarts formule reconstitués quand la
> source les rend en image, QR/liens vidéo et Kahoot décodés et posés en
> vrais liens, lien de DS toujours en `.a-faire`. Tout élément restant
> (photo réelle, schéma/illustration récapitulative, tableau complexe)
> remplacé par un bloc `.a-faire` 🚧 à son emplacement, correction des
> seules erreurs évidentes. Pas de fiche, pas de maquette, pas de captures.
> Slug(s) : à construire par convention. Code(s) de déblocage :
> **invente-les toi-même** (6 caractères, même principe que les codes déjà
> en usage sur le site), pose l'empreinte SHA-256 directement dans le HTML,
> teste chaque verrou via Playwright et liste les codes en clair dans le
> récap. Lie chaque page depuis la page de niveau. En fin de chaîne : un
> seul delta groupé + la liste des `.a-faire` par chapitre + les codes de
> déblocage.

### 9b. Régime B — raffinage (une conversation par chapitre)

> Voici le PPTX et le PDF du chapitre [Thème X, Chapitre Y — TITRE, niveau
> NIVEAU]. Slug : `SLUG`. Code de déblocage : `XXXXXX` (ou : « invente-le »,
> selon le §1ter).
> Applique `_modeles/CONSIGNES-production-chapitre.md` (**régime B**) :
> extraction complète (images + QR, vérification visuelle des attributions),
> maquettes PNG des composants nouveaux avant implémentation, page de cours sur
> `gabarit-chapitre.html`, fiche élève sur `gabarit-fiche.html`, vérification
> scientifique des corrigés, validation Playwright, livraison en delta +
> fichiers HTML séparés + PDF + captures. Propose-moi les choix de trous de
> la fiche avant de finaliser.

## 10. Suivi de progression du projet (`_suivi/`)

Trois documents Markdown vivent dans le dépôt et servent de tableau de bord.
Les mettre à jour est **obligatoire** dès qu'un chapitre change d'état.

| Fichier | Rôle |
|---|---|
| `_suivi/ETAT-PROJET.md` | Vue d'ensemble : avancement global, **priorités**, alertes (« ⚠ ce chapitre n'est pas prêt »), prochaines actions |
| `_suivi/chapitres.md` | Tableau de bord détaillé **par chapitre** avec les flags de jalons |
| `_suivi/IDEES.md` | Réservoir d'idées et d'améliorations à trier (Loïc en aura « au fil de l'eau ») |

### Jalons d'un chapitre (dans l'ordre)

Un chapitre progresse par ces étapes ; la **fiche élève est le dernier jalon**,
faite seulement une fois le cours validé « utilisable en classe » :

1. `⬜ Ébauche en ligne` — régime A poussé, page navigable
2. `⬜ Texte & exercices validés` — Loïc a relu, corrigé, ok
3. `⬜ Images retravaillées` — photos extraites, schémas SVG, droits OK
4. `⬜ Ajouts & approfondissements` — les « on va plus loin » intégrés
5. `⬜ Cours VALIDÉ` — « je peux l'utiliser l'an prochain » ✅
6. `⬜ Fiche élève faite` — produite en tout dernier
7. `⬜ CHAPITRE CLOS` — cours + fiche + ajouts présents, rien en attente

Notation des flags : `⬜` à faire · `🔄` en cours · `✅` fait · `⚠` bloqué/attention.

En **fin de chaîne de régime A**, mettre `chapitres.md` à jour (tous les
chapitres ébauchés passent au jalon 1) et rafraîchir les priorités de
`ETAT-PROJET.md`.
