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
scientifique de Terminale** (`_modeles/CONSIGNES-sequence-ES.md`).

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
| `_modeles/CONSIGNES-chapitre-PC.md` | Raffiner un chapitre de physique-chimie une fois sa V1 en ligne (+ fiche élève) |
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
| `verifier.mjs` | 🆕 `node verifier.mjs` rejoue la checklist · `--bilan` sort un digest compact du dépôt · `--qcm` liste les biais de longueur des QCM. **Repère : exactement 18 problèmes** — les 18 liens `cfa/outil-*` vers des fiches à imprimer pas encore écrites. Tout autre écart est une régression |
| `exporter-fiches.mjs` | 🆕 `node exporter-fiches.mjs` régénère les **fiches PDF de 2nde PC** depuis `fiches/*.html` vers `assets/pdf/pc/fiches/`, et contrôle chaque export à la mesure (A4 `209,9×297,0 mm`, une `.feuille` = une page, polices incorporées). **Le HTML est la source, le PDF un export** — jamais l'inverse |
| `_suivi/BDD-cadrage.md` | 🆕 Volet base de données : architecture, décisions, modèle de données, jalons |
| `bdd/README.md` | 🆕 Discipline des fichiers de schéma SQL + avertissement `supabase/migrations/` |

## Arborescence — une place par partie (rangement du 18/07)

Chaque partie du projet porte son nom ; **rien ne se dépose à la racine** (elle a
été purgée de ses doublons). Où va quoi :

| Partie | Pages | Assets externes |
|---|---|---|
| **Physique-chimie** | `pages/2nde-pc-tX-cY-…html` | `assets/img/pc/2nde-pc-tX-cY/` · `assets/pdf/` · `audio/2nde-pc-tX-cY-intro.m4a` · fiche **source** dans `fiches/`, **PDF distribué** dans `assets/pdf/pc/fiches/` 🆕 |
| **Outils transversaux PC** 🆕 | `pages/2nde-pc-oN-…html` (4 sur 8 écrits) | `assets/css/sequence-snt.css` + `assets/js/sequence-snt.js` (moteur partagé) · fiche A4 **complétée** : source `fiches/fiche-2nde-oN-…html`, **PDF** `assets/pdf/pc/fiches/` 🆕 · SVG inline |
| **SNT** | `pages/2nde-snt-tN-…html` | `assets/css/sequence-snt.css?v=N` + `assets/js/sequence-snt.js` (moteur partagé) · `assets/img/snt/<slug>/` pour les photos · SVG et CSS de contenu **inline** |
| **Cahier de vacances** | `cahier/…html` | `assets/img/cahier/` · `assets/pdf/cahier/` |
| **Livret CFA** 🆕 | `cfa/index.html` · `cfa/outil-NN-…html` (17 outils) | `_modeles/gabarit-outil-CFA.html` · fiches à imprimer dans `fiches/cfa/` (**2 écrites sur 17** — les liens manquants forment le repère de 18 problèmes de `verifier.mjs`) · corrigés dans `_corriges-cfa/` · **client partagé** `assets/js/progression.js` |
| **Coque / accueil / niveaux** | `index.html` (racine) · `pages/2nde-physique-chimie.html`, `pages/…-scientifique.html`, `pages/terminale-…` | `assets/fonts/`, `assets/css/`, `gravures/` |
| **Base de données** 🆕 | *(pas de page)* | `bdd/schema/NNN-….sql` (schéma, numéroté, rejouable) · `bdd/README.md` · plus tard `supabase/` (produit par la CLI, **jamais à la main**) · client partagé `assets/js/progression.js` |

🔴 **Trois assets sont PARTAGÉS entre plusieurs parties.** Les toucher déborde du
périmètre où l'on croit travailler, et impose d'incrémenter le `?v=N` **partout
où ils sont chargés** — sinon les navigateurs des élèves servent l'ancienne
version depuis leur cache :

| Asset | Chargé par | À incrémenter dans |
|---|---|---|
| `assets/js/progression.js` | SNT (4 pages + hub) **et livret CFA (18 pages)** + `_modeles/gabarit-outil-CFA.html` | **24 fichiers** |
| `assets/js/sequence-snt.js` · `assets/css/sequence-snt.css` | `m1`, `t1`, `t2`, le hub `2nde-snt.html` **et les 2 outils transversaux de PC** | **6 fichiers** (contrôlé par `verifier.mjs`, bloquant) |
| `assets/css/chapitre-commun.css` | les 14 chapitres PC | toutes les pages PC |

Autrement dit : **une modification du client de progression faite pour le SNT
touche le livret CFA**, et réciproquement. Ce n'est pas un défaut de rangement,
c'est un choix — une seule copie du client Supabase à maintenir — mais il doit
être annoncé dans toute livraison qui y touche.

Détail des conventions de nommage (3 formes de slug par chapitre PC) :
`_modeles/CONSIGNES-chapitre-PC.md` §0. Un nouveau contenu se range **toujours**
dans le dossier de sa partie, jamais ailleurs.
