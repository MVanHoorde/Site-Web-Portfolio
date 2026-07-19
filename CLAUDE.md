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

La **validation** est un acte explicite de ma part (« oui, ce cours me convient,
je peux l'utiliser l'an prochain »), jamais présumée. La mise en ligne n'est pas
un jalon : tout est / sera en ligne.

---

## Les deux familles de pages (ne jamais les mélanger)

Le dépôt héberge **deux gabarits distincts**, chacun avec ses consignes :

| | **Chapitres physique-chimie** | **Hubs SNT** |
|---|---|---|
| 📘 **Consignes** | **`_modeles/CONSIGNES-chapitre-PC.md`** | **`_modeles/CONSIGNES-hub-SNT.md`** |
| Exemple | `pages/2nde-pc-t1-c3-constitution-atome.html` | `pages/2nde-snt-t2-le-web.html` |
| Structure | thème → chapitre → sections | séquence → séance → étape → champ |
| Style | `assets/css/chapitre-commun.css?v=N` | CSS inline dans la page |
| Déblocage | code de déblocage (`AT0MES`…) | verrouillage progressif + mode enseignant |
| Persistance | `localStorage` | **interdit** — téléchargement de fiche |
| Maturité | rodé (14 chapitres ébauchés) | phase 1, **8 hubs amorcés** (t0-t7 ; Web/Internet/Intro en V0, les autres partiels) |

**Avant de produire ou de modifier une page, ouvre la consigne correspondante.**
Elles sont autonomes : chacune rappelle son périmètre et ce qui ne se transpose
pas à l'autre famille.

🔴 **SNT — règle du référentiel vivant** : la séquence d'introduction
(`pages/2nde-snt-t0-systemes-informatises.html`) est à la fois le cours
« Systèmes informatisés » et le tutoriel du dispositif. **Toute nouvelle idée
de fonctionnement du cours se présente explicitement là en premier** ; les
autres séquences n'en portent que des rappels discrets. Détail :
`CONSIGNES-hub-SNT.md` §8.

🔴 **SNT — entrelacer l'essentiel et le « plus »** : un hub n'oppose pas un bloc
socle massif à un bloc d'approfondissement ; il **entrelace** notions
**essentielles/évaluables** et activités **« pour aller plus loin »**, chaque
élément étant clairement **marqué par son statut**. L'essentiel est toujours
**identifié et verrouillé** (ex. protocole TCP/IP, distinction moteur de
recherche / navigateur) ; le « plus » reste explicitement **facultatif, jamais
un substitut** à l'essentiel. La **passerelle vers la spé NSI** relève de ce
« plus » : **facultative et NON évaluée**, un simple **repérage de notions**
(tableau structuré → base de données, algorithme de tri, capteur piloté par du
code), pas un cours — elle peut vivre en **bonus dépliable** et ne pas figurer
sur la fiche élève téléchargeable.

🔴 **SNT — données structurées, notion transversale** : ne pas la cantonner à un
hub isolé du thème 4. **Avant de coder un nouveau hub ou d'en retoucher un**,
vérifier si une **activité ponctuelle** sur les données structurées y a sa
place — en particulier autour de la **prise en main M365/OneDrive dans
l'introduction (t0)**, où les élèves stockent et partagent leurs cours.

Ces deux principes sont de **nouveaux fonctionnements du cours** : conformément à
la règle du référentiel vivant ci-dessus, ils se présentent **d'abord dans le
hub d'introduction (t0)**, où un **tuto reste à rédiger** pour chacun. À
détailler dans `CONSIGNES-hub-SNT.md`.

## Règles techniques communes (valent pour les deux)

- **RGPD dès la conception** : aucune collecte cachée, aucune donnée sensible,
  données minimales. **Polices auto-hébergées** (`assets/css/fonts.css`) —
  jamais de `fonts.googleapis.com` ni d'autre CDN qui exposerait l'IP des élèves.
- Pas de framework, pas de build : HTML/CSS/JS vanilla, lisible et modifiable.
- Ressources externes chargées par lien (vidéos, CodeBetter…). Illustrations
  maison en **SVG** quand c'est possible.
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
| `_modeles/CONSIGNES-chapitre-PC.md` | Produire un chapitre de physique-chimie (+ fiche élève) |
| `_modeles/CONSIGNES-hub-SNT.md` | Produire un hub SNT |
| `_modeles/CONSIGNES-sequence-ES.md` | 🚧 Séquences ens. scientifique Term (frise, IA — 3ᵉ famille) |
| `_modeles/gabarit-chapitre.html` · `gabarit-fiche.html` | Gabarits **PC uniquement** (le SNT n'a pas de gabarit : on décline le hub du Web) |
| `_suivi/ETAT-PROJET.md` | Vue d'ensemble : avancement, **priorités**, alertes |
| `_suivi/chapitres.md` | Tableau de bord **par chapitre / par hub**, avec les jalons |
| `_suivi/IDEES.md` | Réservoir d'idées à trier |

## Arborescence — une place par partie (rangement du 18/07)

Chaque partie du projet porte son nom ; **rien ne se dépose à la racine** (elle a
été purgée de ses doublons). Où va quoi :

| Partie | Pages | Assets externes |
|---|---|---|
| **Physique-chimie** | `pages/2nde-pc-tX-cY-…html` | `assets/img/pc/2nde-pc-tX-cY/` · `assets/pdf/` · `audio/2nde-pc-tX-cY-intro.m4a` · fiches dans `fiches/` |
| **SNT** | `pages/2nde-snt-tN-…html` | **aucun** — SVG/CSS **inline** dans la page (autonome) |
| **Cahier de vacances** | `cahier/…html` | `assets/img/cahier/` · `assets/pdf/cahier/` |
| **Coque / accueil / niveaux** | `index.html` (racine) · `pages/2nde-physique-chimie.html`, `pages/…-scientifique.html`, `pages/terminale-…` | `assets/fonts/`, `assets/css/`, `gravures/` |

Détail des conventions de nommage (3 formes de slug par chapitre PC) :
`_modeles/CONSIGNES-chapitre-PC.md` §0. Un nouveau contenu se range **toujours**
dans le dossier de sa partie, jamais ailleurs.
