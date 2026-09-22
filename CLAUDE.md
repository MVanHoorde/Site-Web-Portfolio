# Site pédagogique — contexte projet

> **Ce fichier est lu automatiquement au début de chaque session de Claude Code.**
> Il ne contient que le contexte et les renvois : les **consignes de production**
> vivent dans `_modeles/`, un fichier par type de page (voir plus bas).

---

## Qui je suis (ce qui est utile pour toi)

Loïc, professeur de physique-chimie et de SNT. Je tiens à la **qualité et à
l'originalité de mes contenus** — le réchauffé me démotive, la fierté de l'objet
est mon moteur. Je suis **non routinier** : je passe vite d'une idée à l'autre,
j'arrive préparé, je sais choisir mes combats. Ne me freine pas avec des
« priorise / tu en fais trop » génériques ; réserve les alertes aux **vrais
pièges concrets** (RGPD, dette technique, sécurité).

## Règle de collaboration (importante)

Sur tout ce qui touche le **fond pédagogique** (choix des notions, formulations,
progression, accroches), **ma vision est souveraine**. Ton rôle : échafaudage —
chercher, structurer, coder, encoder, proposer une V1 dans mon ton, assurer la
cohérence. Jamais concepteur à ma place. Quand tu proposes du contenu de cours,
signale-le comme une proposition à valider.

Contenu partagé avec des collègues : **on refait la forme, jamais le fond**
(compatibilité avec leur progression et leurs fichiers OneDrive).

**Commence toujours par proposer un plan court avant de modifier des fichiers,
et travaillons point par point.**

🔴 **RÈGLE — la doc décrit l'état courant, jamais l'historique.** Quand une
décision change, on **réécrit** le passage concerné ; on n'empile pas un
« ⚠ Mise à jour du … » au-dessus du texte devenu faux. La décision part datée
dans `_suivi/DECISIONS.md`, le récit dans `_suivi/JOURNAL.md`. Motif : l'audit du
23/07/2026 a trouvé six contradictions dans les fichiers de référence, dont cinq
dans un seul paragraphe — de quoi produire une session entière de travail faux.

La **validation** est un acte explicite de ma part (« oui, ce cours me convient,
je peux l'utiliser l'an prochain »), jamais présumée. La mise en ligne n'est pas
un jalon : tout est / sera en ligne.

---

## Les deux familles de pages (ne jamais les mélanger)

Le dépôt héberge **deux gabarits distincts**, chacun avec ses consignes :

| | **Chapitres physique-chimie** | **Séquences SNT** |
|---|---|---|
| 📘 **Consignes** | **`_modeles/CONSIGNES-chapitre-PC.md`** | **`_modeles/CONSIGNES-sequence-SNT.md`** |
| Exemple | `pages/2nde-pc-t1-c3-constitution-atome.html` | `pages/2nde-snt-t2-le-web.html` |
| Structure | thème → chapitre → sections | séquence → séance → étape → champ |
| Style | `assets/css/chapitre-commun.css?v=N` | CSS inline dans la page |
| Déblocage | code de déblocage (`AT0MES`…) | verrouillage progressif + mode enseignant |
| Persistance | `localStorage` | **base Supabase** ; en local, le jeton de session et rien d'autre |
| Maturité | rodé (14 chapitres ébauchés) | phase 1, **8 séquences amorcées** (t0-t7 ; Web/Internet/Intro en V0, les autres partielles) |

Deux autres familles vivent à côté, avec leurs propres consignes : les **outils
transversaux de physique-chimie** (`_modeles/CONSIGNES-outil-PC.md` — hors
progression, ouverts toute l'année, sur le moteur SNT) et l'**enseignement
scientifique** (`_modeles/CONSIGNES-sequence-ES.md`) — dont les **six chapitres de
1re**, portés sur le moteur SNT le 06/09/2026 (`pages/1re-es-tN-cN-…html`), qui
suivent la grammaire séquence → séance → étape → champ **sans être branchés en
base** : leur état et ce qui reste à décider vivent dans
`_suivi/es1-verification.md`.

**Avant de produire ou de modifier une page, ouvre la consigne correspondante.**
Elles sont autonomes : chacune rappelle son périmètre et ce qui ne se transpose
pas à l'autre famille.

🔴 **SNT — règle du référentiel vivant** : la séquence d'introduction
(`pages/2nde-snt-t0-systemes-informatises.html`) est à la fois le cours
« Systèmes informatisés » et le tutoriel du dispositif. **Toute nouvelle idée
de fonctionnement du cours se présente explicitement là en premier** ; les
autres séquences n'en portent que des rappels discrets. Détail :
`CONSIGNES-sequence-SNT.md` §8.

🔴 **SNT — entrelacer l'essentiel et le « plus »** : une séquence n'oppose pas un bloc
socle massif à un bloc d'approfondissement ; elle **entrelace** notions
**essentielles/évaluables** et activités **« pour aller plus loin »**, chaque
élément étant clairement **marqué par son statut**. L'essentiel est toujours
**identifié et verrouillé** (ex. modèle TCP/IP, distinction moteur de
recherche / navigateur) ; le « plus » reste explicitement **facultatif, jamais
un substitut** à l'essentiel. La **passerelle vers la spé NSI** relève de ce
« plus » : **facultative et NON évaluée**, un simple **repérage de notions**
(tableau structuré → base de données, algorithme de tri, capteur piloté par du
code), pas un cours — elle peut vivre en **bonus dépliable** et ne pas figurer
sur la fiche élève téléchargeable.

🔴 **SNT — données structurées, notion transversale** : ne pas la cantonner à une
séquence isolée du thème 4. **Avant de coder une nouvelle séquence ou d'en retoucher une**,
vérifier si une **activité ponctuelle** sur les données structurées y a sa
place — en particulier autour de la **prise en main M365/OneDrive dans
l'introduction (t0)**, où les élèves stockent et partagent leurs cours.

Ces deux principes sont de **nouveaux fonctionnements du cours** : conformément à
la règle du référentiel vivant ci-dessus, ils se présentent **d'abord dans la
séquence d'introduction (t0)**, où un **tuto reste à rédiger** pour chacun. À
détailler dans `CONSIGNES-sequence-SNT.md`.

## Règles techniques communes (valent pour les deux)

- **RGPD dès la conception** : aucune collecte cachée, aucune donnée sensible,
  données minimales. **Polices auto-hébergées** (`assets/css/fonts.css`) —
  jamais de `fonts.googleapis.com` ni d'autre CDN qui exposerait l'IP des élèves.
- Pas de framework, pas de build : HTML/CSS/JS vanilla, lisible et modifiable.
- Ressources externes chargées par lien (vidéos, CodeBetter…).
- 🔴 **Pas d'illustration figurative dessinée de mémoire.** Un schéma SVG maison
  est légitime quand il représente une **structure** : axes, flèches, graphes,
  montages, arbres de décision, schémas de principe — là, le tracé est le
  contenu. Il ne l'est pas pour un **objet du monde** : silhouette, appareil,
  animal, pictogramme réglementaire, matériel de laboratoire. Ces dessins-là
  sortent faux ou laids, et un pictogramme faux est une erreur de cours.
- 🔴 À la place : poser un **cadre de réservation** (`.reserve`) aux dimensions
  finales, portant le nom de fichier attendu, une phrase décrivant ce qu'il faut
  y voir, et la contrainte de format. Loïc récupère l'image ; l'intégration se
  réduit alors à remplacer une balise. Patron de référence :
  `pages/2nde-pc-o3-securite-laboratoire.html`.
- 🔴 Les **symboles CLP** ne se dessinent pas : le sprite vectorisé depuis les
  pictogrammes officiels fait référence, et se recopie tel quel d'un fichier à
  l'autre. Il annule la règle antérieure « symboles CLP toujours dessinés
  maison », qui avait produit neuf formes inventées.
- Responsive (**cible iPad**), focus clavier visible, `prefers-reduced-motion`
  respecté.
- Livraison en **archive delta** (jamais le site complet) + mise à jour de
  `_suivi/`.
- 🔴 **`assets/css/chapitre-commun.css` est versionné** : incrémenter le `?v=N`
  dès qu'une modification change le rendu, sinon les navigateurs des élèves
  servent l'ancienne feuille depuis leur cache (voir `_suivi/ETAT-PROJET.md`).

---

## Où est quoi

| Fichier | Rôle |
|---|---|
| `_modeles/CONSIGNES-V1-integrale-PC.md` | 🆕 **Récupérer un chapitre PC sans perte** depuis son PPTX/PDF : figures, légendes, exercices, corrections. Le passage obligé de tout chapitre. Remplace l'ancien « régime A » |
| `_modeles/CONSIGNES-chapitre-PC.md` | Raffiner un chapitre de physique-chimie une fois sa V1 en ligne |
| `_modeles/CONSIGNES-fiche-eleve-PC.md` | 🆕 **Concevoir la fiche élève** d'un chapitre PC — la feuille A4 distribuée en classe, qui *fait écrire* le cours. Sa chaîne vit dans `_outils/fiches/` : `python fiche_<code>.py` régénère, `node exporter-fiches.mjs` exporte |
| `_modeles/CONSIGNES-diaporama-PC.md` | 🆕 **Concevoir le diaporama de projection** d'un chapitre PC — support de classe, sans corrections, animé au clic. Référence : **T1-C2**. La chaîne vit dans `_outils/diaporamas/` : un diaporama se régénère en relançant un script |
| `_modeles/CONSIGNES-sequence-SNT.md` | Produire une séquence SNT |
| `_modeles/CONSIGNES-outil-PC.md` | 🆕 **Produire un outil transversal de PC** — méthode que tous les chapitres mobilisent, hors progression. Moteur SNT, fiche A4 **complétée**, corrigés **en ligne** |
| `_modeles/CONSIGNES-sequence-ES.md` | 🚧 Séquences ens. scientifique Term (frise, IA — 3ᵉ famille) |
| `_modeles/gabarit-chapitre.html` · `gabarit-fiche.html` | Gabarits **PC uniquement** (le SNT n'a pas de gabarit : on décline la séquence du Web) |
| `MANIFESTE.md` | 🆕 **Index d'entrée** : quelle tâche → quel fichier → quel coût de lecture. À lire en premier |
| `_suivi/ETAT-PROJET.md` | Où on en est · ce qui bloque · prochaine action. **Réécrit** à chaque session, jamais empilé |
| `_suivi/DECISIONS.md` | 🆕 Registre des décisions, datées, avec leur statut (en vigueur / remplacée / en attente) |
| `_suivi/JOURNAL.md` | 🆕 Historique en ajout seul. Pas relu par défaut |
| `_suivi/chapitres.md` | Tableau de bord **par chapitre / par séquence**, avec les jalons |
| `_suivi/IDEES.md` | Réservoir d'idées à trier |
| `_suivi/o7-o8-a-revoir.md` | 🆕 **Le fichier à ouvrir pour reprendre les outils 7 et 8** — quatre décisions à trancher, 3 figures et 8 captures à produire, 17 procédures de calculatrice à confirmer, et ce qu’il ne faut **pas** rouvrir |
| `verifier.mjs` | 🆕 `node verifier.mjs` rejoue la checklist · `--bilan` sort un digest compact du dépôt · `--qcm` liste les biais de longueur des QCM. **Repère au 19/09/2026 : exactement 19 problèmes** — les 18 liens `cfa/outil-*` vers des fiches à imprimer pas encore écrites, **plus** un indice de niveau 1 qui livre la réponse dans `term-es-t2-c2` (2 cas, à reprendre). Tout autre écart est une régression. 🆕 Sort aussi, en vigilance, les **contenus hors d'atteinte depuis l'accueil** : ce que les élèves et les collègues ne voient pas |
| `exporter-fiches.mjs` | 🆕 `node exporter-fiches.mjs` régénère les **fiches PDF de 2nde PC** depuis `fiches/*.html` vers `assets/pdf/pc/fiches/`, et contrôle chaque export à la mesure (A4 `209,9×297,0 mm`, une `.feuille` = une page, polices incorporées). **Le HTML est la source, le PDF un export** — jamais l'inverse |
| `_suivi/BDD-cadrage.md` | 🆕 Volet base de données : architecture, décisions, modèle de données, jalons |
| `bdd/README.md` | 🆕 Discipline des fichiers de schéma SQL + avertissement `supabase/migrations/` |

## Arborescence — une place par partie (rangement du 18/07)

Chaque partie du projet porte son nom ; **rien ne se dépose à la racine** (elle a
été purgée de ses doublons). Où va quoi :

| Partie | Pages | Assets externes |
|---|---|---|
| **Physique-chimie** | `pages/2nde-pc-tX-cY-…html` | `assets/img/pc/2nde-pc-tX-cY/` · `assets/pdf/` · `audio/2nde-pc-tX-cY-intro.m4a` · fiche **source** dans `fiches/`, **PDF distribué** dans `assets/pdf/pc/fiches/` 🆕 · **suivi de consultation** pour l'élève connecté : `progression.js` + `assets/js/suivi-pc.js` en fin de body, `data-suivi="pc-tX-cY"` (voir `CONSIGNES-chapitre-PC.md`) |
| **Outils transversaux PC** 🆕 | `pages/2nde-pc-oN-…html` (8 écrits, **5 ouverts** au hub : O6-O8 en relecture) | `assets/css/sequence-snt.css` + `assets/js/sequence-snt.js` (moteur partagé) · fiche A4 **complétée** : source `fiches/fiche-2nde-oN-…html`, **PDF** `assets/pdf/pc/fiches/` 🆕 · SVG inline |
| **SNT** | `pages/2nde-snt-tN-…html` | `assets/css/sequence-snt.css?v=N` + `assets/js/sequence-snt.js` (moteur partagé) · `assets/img/snt/<slug>/` pour les photos · SVG et CSS de contenu **inline** |
| **Cahier de vacances** | `cahier/…html` | `assets/img/cahier/` · `assets/pdf/cahier/` |
| **Diaporamas de projection PC** 🆕 | *(pas de page)* | `assets/pptx/pc/diaporama-2nde-<code>.pptx`. **`t1c2` se régénère** (`_outils/diaporamas/`) ; **`t3c1` non** — produit par une chaîne perdue, il est versionné pour cette raison et son tableau des célérités faux ne se corrige qu'à la main. 🔴 Aucune page n'y renvoie : c'est un support de projection, pas un document d'élève — mais le dépôt étant public, le fichier reste accessible par son URL. Consignes : `_modeles/CONSIGNES-diaporama-PC.md` |
| **Outillage** 🆕 | *(pas de page)* | `_outils/fiches/` **le générateur des fiches élève PC** — `gabarit_fiche.py` (commun aux 14 fiches, 🔴 ne pas y résoudre un problème de chapitre) + `fiche_<code>.py` + `paginer.py`/`paginer.mjs` (la découpe en pages, calculée à la mesure) + `mesurer_pages.py` · 🆕 `_outils/diaporamas/` **le générateur des diaporamas de projection** — `extraire_figures.mjs` + `gabarit_diapo.py` + `diapo_<code>.py` + `animer.py` + `controler.py` · `_outils/tests/` scripts de contrôle, à lancer depuis la racine |
| **Livret CFA** 🆕 | `cfa/index.html` · `cfa/outil-NN-…html` (17 outils) | `_modeles/gabarit-outil-CFA.html` · fiches à imprimer dans `fiches/cfa/` (**2 écrites sur 17** — les liens manquants forment le repère de 18 problèmes de `verifier.mjs`) · corrigés dans `_corriges-cfa/` · **client partagé** `assets/js/progression.js` |
| **Enseignement scientifique 1re** 🆕 | `pages/1re-es-tN-cN-…html` (6 chapitres, 18 séances) | `assets/css/sequence-snt.css` + `assets/js/sequence-snt.js` (moteur partagé) · `assets/img/es/1re-es-tN-cN/` · **branché en base** (13/09) : `data-sequence="es1-tN-cN"`, réponses rédigées en réponses personnelles — voir `_suivi/es1-verification.md` · 🔴 **seule la nucléosynthèse est ouverte aux élèves, fiches de séance coupées** (`data-fiche="non"`, repère `MASQUÉ-ES1`) : **dès qu'on retravaille l'ES 1re, tout démasquer** (§0bis) |
| **Enseignement scientifique Terminale** 🆕 | `pages/term-es-t2-cN-…html` (2 chapitres, 5 séances, portés le 12/09) · `pages/term-es-s01-frise.html` (la frise, à part) | `assets/css/sequence-snt.css` + `assets/js/sequence-snt.js` (moteur partagé) · `assets/img/es/term-es-t2-cN/` · **branché en base** comme la 1re (`est-tN-cN`) · 🔴 le hub n'affiche que les chapitres traités, les autres sont **en commentaire** — voir `_suivi/es-term-verification.md` |
| **Coque / accueil / niveaux** | `index.html` (racine) · `pages/2nde-physique-chimie.html`, `pages/…-scientifique.html`, `pages/terminale-…` | `assets/fonts/`, `assets/css/`, `gravures/` |
| **Base de données** 🆕 | *(pas de page)* | `bdd/schema/NNN-….sql` (schéma, numéroté, rejouable) · `bdd/README.md` · `supabase/migrations/` (horodaté par la CLI, **contenu recopié de `bdd/schema/`**) · client partagé `assets/js/progression.js` |
| **Tableau de bord enseignant** 🆕 | `prof/index.html` · `prof/guide-prise-en-main.html` · `prof/guide-dispositif.html` | `assets/js/prof-api.js` · PDF des guides dans `assets/pdf/prof/`, régénérés par `node exporter-guides.mjs` |

🔴 **Trois assets sont PARTAGÉS entre plusieurs parties.** Les toucher déborde du
périmètre où l'on croit travailler, et impose d'incrémenter le `?v=N` **partout
où ils sont chargés** — sinon les navigateurs des élèves servent l'ancienne
version depuis leur cache :

| Asset | Chargé par | À incrémenter dans |
|---|---|---|
| `assets/js/progression.js` | SNT (4 pages + hub), **livret CFA (18 pages)**, **ES (8 pages)**, **outils PC (8)**, **chapitres PC (14)** + `gabarit-outil-CFA.html` et `gabarit-outil-PC.html` | **55 fichiers** au 13/09/2026 |
| `assets/js/sequence-snt.js` · `assets/css/sequence-snt.css` | les séquences SNT, le hub `2nde-snt.html`, **les 8 outils transversaux de PC**, **les 6 chapitres d'ES de 1re** et **les 2 de terminale** | **22 fichiers** au 12/09/2026 (contrôlé par `verifier.mjs`, bloquant : toute page qui reste sur l'ancienne version le fait échouer) |
| `assets/css/chapitre-commun.css` | les 14 chapitres PC **et** `_modeles/gabarit-chapitre.html` | **15 fichiers** — les 2 pages d'ES de terminale en sont sorties le 12/09 |

Autrement dit : **une modification du client de progression faite pour le SNT
touche le livret CFA**, et réciproquement. Ce n'est pas un défaut de rangement,
c'est un choix — une seule copie du client Supabase à maintenir — mais il doit
être annoncé dans toute livraison qui y touche.

🔴 **Ce qui est prêt doit arriver aux collègues — sans que Loïc ait à y penser.**
Depuis le 17/09/2026, deux collègues enseignent avec ce site (enseignement
scientifique de 1re, AP de physique-chimie). Un contenu qui devient utilisable en
classe ne s'arrête donc plus à « Loïc s'en sert » : **dans la même livraison**, on
rétablit son lien sur le hub, on met à jour le **guide de la matière** et sa date
de révision, on régénère le PDF, et **on propose à Loïc le mot à envoyer** aux
collègues concernées. Le critère est le sien : *« quand c'est gérable pour un
cours et que je vais l'utiliser, elles doivent l'avoir »* — pas besoin d'attendre
la perfection.

Le rappel est **mécanique**, parce que Loïc dit lui-même qu'il oubliera :
`node verifier.mjs` liste, en points de vigilance, les **contenus écrits mais hors
d'atteinte depuis l'accueil** (parcours réel des liens, commentaires retirés).
Cette liste **est** celle de ce que les collègues ne voient pas. La parcourir fait
partie de toute session qui touche un cours partagé — et **le dire à Loïc** quand
l'un d'eux est devenu utilisable.

🔴 **Le tableau de bord se livre avec ses quatre guides** — un par public :
`prof/guide-prise-en-main.html` (SNT), `prof/guide-es.html` (ens. scientifique
de 1re), `prof/guide-ap.html` (AP de physique-chimie) et
`prof/guide-dispositif.html` (Loïc, avec la technique). 🔴 **Un guide par
matière, jamais par personne** : une collègue qui a deux de ces cours reçoit
deux guides et lit ce qu'elle veut. Les trois premiers **se recouvrent
volontairement** : chacun se lit et s'envoie seul, donc une modification d'un
écran commun — connexion, table des noms, suivi, code élèves — se reporte dans
les trois. Toute modification qui change un écran, un onglet, un
bouton ou un message **se répercute dans le ou les guides concernés au sein de la
même livraison**, leur date de révision est remise à jour, et
`node exporter-guides.mjs` régénère les PDF. Motif : un guide faux envoie
chercher le problème au mauvais endroit — il coûte plus cher que pas de guide du
tout.

🔴 **`assets/fonts/IBMPlexSans-*.woff2` sont inutilisables** — mesuré au
navigateur le 04/09/2026 : **5 glyphes sur 69**, sur les quatre faces (400, 400i,
500, 600). Tout texte qui demande cette famille tombe en Segoe UI, ou en **Times
New Roman** là où aucun repli n'est déclaré. Les cinq autres familles sont
saines. En attendant de vraies polices, intercaler `'Inter'` juste après
`'IBM Plex Sans'` dans la pile : Inter est auto-hébergée, complète et du même
genre, et Plex Sans reprendra la main d'elle-même une fois réparée. **Fait dans
`assets/css/sequence-snt.css`** (22/09/2026 — séquences SNT, outils PC, ES) ;
restent `prof/index.html` et 3 fiches.

🔴 **`_a-deposer/` — dossier tampon, hors Git.** Loïc y dépose les sources brutes
d'un chantier, dans un **sous-dossier par chantier** (`es1/`, `tp/`, `ds/`…). Rien de
ce qui s'y trouve ne part sur GitHub Pages. Contrepartie : **toute session qui
l'utilise rend un tri en fin de session** — une ligne par fichier, avec exactement
l'un de ces trois verdicts : **UTILISÉ — intégré** (tout ce qui compte est repris ;
dire *où*, sinon Loïc ne peut pas supprimer en confiance) · **UTILISÉ — à conserver**
(source non régénérable ; proposer le chemin cible dans `assets/` ou `_suivi/`) ·
**NON UTILISÉ** (avec la raison : hors périmètre, doublon, illisible, pas encore
traité). **Le dossier doit être vide entre deux chantiers.** Modèle de tri :
`_suivi/es1-verification.md` §8.
Deux choses n'ont pas à y être déposées : les **fichiers vidéo** — Claude ne peut pas
les regarder, et une vidéo pèse lourd dans un dépôt public ; il lui faut le **titre,
la durée et l'URL** dans un fichier texte. Et les fichiers **déjà présents dans le
dépôt**.
💡 Un **diaporama exporté en PDF perd ses liens hypertexte mais garde ses QR codes**,
et ceux-ci se décodent : c'est ainsi que les 24 URL du chantier ES1 ont été
retrouvées. Réflexe à avoir avant de déclarer un lien perdu.

Détail des conventions de nommage (3 formes de slug par chapitre PC) :
`_modeles/CONSIGNES-chapitre-PC.md` §0. Un nouveau contenu se range **toujours**
dans le dossier de sa partie, jamais ailleurs.
