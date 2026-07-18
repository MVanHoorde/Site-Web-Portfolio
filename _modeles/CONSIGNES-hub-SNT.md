# CONSIGNES — Hub SNT (séquence d'un thème du programme)

## Portée & contexte (à lire avant tout)

Ce document couvre **un seul des deux gabarits du site** : les **hubs SNT**
(Sciences numériques et technologie, seconde) — séquence → séance → étape →
champ, verrouillage progressif, mode enseignant, page autonome à CSS/JS inline.

⚠ **Il ne s'applique PAS aux chapitres de physique-chimie** (thème → chapitre →
sections, code de déblocage, fiche élève imprimable) : leurs consignes sont dans
`_modeles/CONSIGNES-chapitre-PC.md`. Ne jamais transposer ici les régimes A/B, la
bibliothèque de composants PC (`.encart`, `.formule-bloc`…), le verrou à code, ni
les jalons 1→7 : ce sont deux systèmes différents. Le système PC est **rodé** (14
chapitres ébauchés) ; le système SNT est en **phase 1**, avec **trois hubs V0**
produits : le Web (`t2`, la référence d'origine), Internet (`t1`) et
l'**Introduction — Les systèmes informatisés** (`t0`, statut particulier :
voir §8). Les conventions se confirment d'un hub à l'autre, mais **rien n'est
validé** — voir « Ce qui n'est pas encore arrêté », en fin de document.

| | **Ce document (SNT)** | **Chapitre PC** |
|---|---|---|
| Structure | séquence → séance → étape → champ | thème → chapitre → sections |
| Style | CSS inline dans la page (autonome) | gabarit + `style.css` du site |
| Déblocage | verrouillage progressif + mode enseignant | code 6 caractères + SHA-256 |
| Persistance | **interdite** (voir §5) | `localStorage` |
| Trace élève | « Télécharger ma fiche » (récap HTML) | fiche imprimable A4 |
| Correction | en direct (QCM/trous/schéma), simulée (texte libre) | corrigés dépliables rédigés |

Communs aux deux : RGPD (polices auto-hébergées, jamais de CDN), HTML/CSS/JS
vanilla sans build, responsive (cible iPad), livraison en archive delta, mise à
jour de `_suivi/`.

## 1. Le projet en une phrase

Un **hub numérique pour les élèves de seconde en SNT** : chaque séquence du
programme est une suite de **séances fléchées**. L'élève suit des activités
(vidéos, manips, exercices), puis **complète une fiche** dont une partie se
**corrige automatiquement**. À terme, ce hub devient la colonne vertébrale de
l'enseignement SNT de Loïc.

Les 7 thèmes du programme sont listés sur `pages/2nde-snt.html` (cartes
`.chapitre`). Un hub = un thème.

Sur le **fond pédagogique** (choix des notions, formulations, progression,
accroches), la vision de Loïc est souveraine : ton rôle est l'échafaudage —
chercher, structurer, coder, proposer une V1 dans son ton. Tout contenu que tu
proposes est signalé comme **proposition à valider**. La validation est un acte
explicite de Loïc, jamais présumée ; la mise en ligne n'est pas un jalon.

## 2. Fichiers de référence

| Fichier | Rôle |
|---|---|
| `pages/2nde-snt-t2-le-web.html` | **Hub de référence (V0 d'origine)** — source de fait pour la structure, les champs et le JS. Page autonome, CSS/JS inline |
| `pages/2nde-snt-t1-internet.html` | Hub Internet (V0) — première déclinaison, enseigné avant le Web |
| `pages/2nde-snt-t0-systemes-informatises.html` | **Introduction (V0)** — cours « Les systèmes informatisés » **entrelacé** avec le tutoriel du dispositif ; référentiel vivant du fonctionnement du cours (voir §8) |
| `pages/2nde-snt.html` | Page de niveau SNT : carte « Pour commencer » + les 7 cartes de thèmes, d'où part chaque hub |
| `assets/css/fonts.css` | Polices auto-hébergées (voir §5) — **seule** source de polices autorisée |
| `_suivi/chapitres.md` | Section « Seconde — SNT » : état réel de chaque hub |

Il n'existe **pas** de `gabarit-hub-snt.html` : on décline en partant du hub du
Web. Trois hubs existent désormais et confirment les conventions — extraire un
vrai gabarit est donc devenu pertinent, mais c'est une **décision de Loïc**,
pas un réflexe (voir « Ce qui n'est pas encore arrêté »).

## 3. Grammaire du hub (à respecter partout)

**Hiérarchie :** `séquence` → `séance` (≈ 1h30) → `étape` (une notion) →
`champ` (exercice).

**Trajet d'une étape**, toujours dans cet ordre :

1. **objectif** (🎯) ;
2. **ressources fléchées** — chacune avec un *code d'activité* en monospace type
   `WEB·2b`, un *type*, et un *timing* ;
3. **à retenir** ;
4. **champ à compléter**.

### Types de champs (déjà codés — les réutiliser, ne pas les réinventer)

| Champ | Correction | Marquage dans le HTML |
|---|---|---|
| **QCM** | en direct (vert/rouge), valide l'étape | `data-qcm`, `data-correct` |
| **Texte à trous** | en direct | `data-cloze`, `data-check-cloze` |
| **Schéma à légender** (SVG + menus déroulants) | en direct | `data-diagram`, `data-check-diagram` |
| **Définition / texte libre** | copier-coller **bloqué**, envoi « pour correction », statut *en attente* → *validé* | `data-free`, `data-send-free` |
| **Réflexion perso** | **non notée**, bouton « Partager avec la classe » | `data-share`, `data-share-note` |

- Une réponse de texte libre validée peut **révéler un encadré de contexte**
  (point d'histoire, biblio) — `data-reveal`.
- La **réflexion perso ne juge jamais** : pas de bon/mauvais, on valorise.
  C'est un choix arrêté, ne pas y ajouter de correction.

### Éléments transverses

- **Verrouillage progressif** : une séance se débloque quand la précédente est
  **entièrement validée** (étapes marquées `data-gate`). Barre de progression par
  séance (`data-progress`, `data-navlock`).
- **Mode enseignant** : interrupteur qui déverrouille tout — télécommande de
  coordination, et sortie de secours quand un élève est coincé.
- **Télécharger ma fiche** (récap HTML) + **Recommencer** + **pop-up de fin de
  séance**.
- **Encadrés spéciaux** : « fierté française » 🇫🇷 (bandeau tricolore), « le
  sais-tu » (histoire), **biblio** (liens sources) — la biblio est à ajouter
  **systématiquement** dès qu'on ouvre un point d'histoire.
- **Bonus « pour aller plus loin »** (`data-bonus`) : dépliable, avec des
  **manips fun/geek** (ex. trafiquer un titre via l'inspecteur — `data-trap`,
  `data-trap-reveal`) et des questions ouvertes ambitieuses.
- **Easter eggs** discrets bienvenus (message console, etc.).
- **Activité débranchée** : au moins une par séquence quand le thème s'y prête
  (le Web a sa frise) — tout ne se fait pas devant un écran.

### Statut des étapes : l'essentiel évaluable et le « plus »

Un hub **n'oppose pas** un bloc socle massif à un bloc d'approfondissement : il
**entrelace** deux statuts, chaque élément clairement marqué.

- **Essentiel / évaluable** — les étapes `data-gate` (« à valider »). Elles
  portent les notions de base à verrouiller (ex. protocole TCP/IP, distinction
  moteur de recherche / navigateur) ; leur validation **débloque la suite**.
  C'est le cœur, jamais optionnel.
- **Le « plus »** — les blocs `data-bonus` (« pour aller plus loin »),
  dépliables. **Facultatifs** mais valorisés, **jamais un substitut** à
  l'essentiel. On peut les semer au fil de la séquence, pas seulement à la fin.

**Passerelle vers la spé NSI** (quand le thème s'y prête) : elle relève du
« plus » — **facultative et NON évaluée**. Un simple **repérage de notions**
(tableau structuré → base de données, algorithme de tri, capteur piloté par du
code), **pas un cours**. Elle peut vivre en **bonus dépliable** et **ne pas
figurer sur la fiche élève téléchargeable** (le récap n'embarque que les
`[data-step]`, pas les `[data-bonus]` — c'est déjà le cas).

🔴 Ces deux principes sont des **mécanismes du cours** : au sens du §8, ils se
présentent **d'abord dans la séquence d'introduction (t0)** ; les autres hubs
n'en portent que des rappels discrets.

## 4. Design (identité visuelle à conserver)

- **Polices** : `Space Grotesk` (titres), `IBM Plex Sans` (corps),
  `IBM Plex Mono` (codes, balises, URL) — toutes servies par
  `../assets/css/fonts.css`. Voir l'alerte RGPD du §5.
- **Palette** : variables CSS en tête de fichier — fond gris-bleu froid, accent
  **bleu hypertexte** `--link:#2445c7`, **ambre** `--activity` pour les activités,
  **vert** `--ok` pour « validé », plus `--wait` (en attente), `--err`, et les
  teintes dédiées `--france`, `--hist`, `--bonus`. Chacune a son `-wash` (fond
  clair associé). **Réutiliser les variables, ne jamais écrire une couleur en
  dur.**
- `--radius:14px` et `--shadow` sont définis en tête : les reprendre tels quels.

## 5. Règles techniques (les pièges déjà rencontrés)

- 🔴 **Aucune police, aucun script, aucune ressource depuis un CDN.** La maquette
  d'origine du hub du Web chargeait Space Grotesk / IBM Plex Sans / IBM Plex Mono
  depuis `fonts.googleapis.com` : chaque élève ouvrant la page aurait envoyé son
  IP à Google. Corrigé — IBM Plex Sans ajouté en woff2 local (400, 400i, 500,
  600 ; sous-ensemble latin, OFL) et déclaré dans `assets/css/fonts.css`.
  **À revérifier sur toute page importée de l'extérieur** (Claude Design compris).
- 🔴 **`localStorage` / `sessionStorage` INTERDITS en phase 1.** Ça casse
  l'aperçu et ce n'est pas la vraie solution. La persistance passe par le
  **téléchargement de fichier** ; en phase 2, par la base de données côté serveur.
  (Les chapitres de PC, eux, utilisent `localStorage` — gabarit distinct.)
- **RGPD dès la conception** : aucune collecte cachée, aucune donnée sensible,
  données minimales.
- Pas de framework, pas de build : HTML/CSS/JS vanilla, lisible et modifiable.
- Responsive (**cible iPad**), focus clavier visible, `prefers-reduced-motion`
  respecté.
- Ressources externes chargées **par lien** (vidéos, CodeBetter…). Illustrations
  maison en **SVG** quand c'est possible.
- Un lien de ressource pas encore arbitré reste **inerte** (`href="#"`) et doit
  être **listé dans le récap** — sinon il se perd (cas des activités `WEB·2b` et
  de la frise `WEB·D`, toujours inertes à ce jour).

## 6. Ton & pédagogie

Niveau seconde, **langage simple et direct**. Loïc aime : les **points
d'histoire** contextualisés, la **fierté française** (avec sources), les
**questions sur les usages perso** des élèves, les **manips concrètes et
amusantes**, l'esprit critique (fiabilité, IA, sécurité).

**Ton des « à retenir »** : simples, calibrés seconde, et **pré-remplis** — c'est
une trace de référence, pas un champ à compléter. Choix arrêté.

Chaque ouverture historique s'accompagne de **liens biblio**.

## 7. Les deux phases (ne jamais les mélanger)

**Phase 1 — MAINTENANT : le contenu, prêt pour la rentrée.**
Finaliser les séquences en **HTML statique autonome**. La correction locale (QCM,
trous, schémas) fonctionne pour de vrai ; le texte libre est **simulé** (passe
*en attente* puis *validé* après un délai, sans correction réelle). Présentable
en classe sans aucun serveur.

**Phase 2 — PLUS TARD : le vrai système.**
VPS Linux en Europe (RGPD) hébergeant l'application + une **base de données** ;
correction du texte libre par IA (**Ollama en local sur RTX 5080** en test, ou
**API Claude** — modèle Haiku, quelques euros/an) ; **comptes élèves**, sauvegarde
côté serveur, tableau de bord enseignant, alertes de décrochage **basées sur la
progression réelle** — pas sur la surveillance du temps ni la comparaison entre
élèves (piège RGPD/éthique). Cette base « progression exportable » servira aussi
un futur projet de jeu pédagogique.

**En phase 1, ne pas coder « en prévision » de la phase 2** : pas de couche
d'abstraction serveur, pas de faux appels réseau. Le hub doit rester une page
qu'on ouvre en double-cliquant.

## 8. La séquence d'introduction — référentiel vivant du fonctionnement du cours

`pages/2nde-snt-t0-systemes-informatises.html` a un **statut particulier** :
c'est à la fois un **vrai cours** (« Les systèmes informatisés ») et le
**tutoriel du dispositif**, les deux **entrelacés** — chaque étape du cours est
l'occasion d'apprendre un geste du hub (valider un QCM, envoyer une réponse
rédigée, télécharger sa fiche et la déposer sur OneDrive, comprendre le
verrouillage et l'entraide…). Choix arrêté : pas de séance « mode d'emploi »
sèche, le contenu sert de terrain d'entraînement.

### 🔴 RÈGLE — l'introduction est le référentiel des mécanismes du cours

Quand Loïc décide de **faire vivre une nouvelle idée de fonctionnement**
(exemple : la correction entre camarades qui accroît la note d'investissement,
un nouveau type de champ, un changement du rituel de fin de séance…) :

1. **Elle est présentée explicitement dans la séquence d'introduction** —
   c'est LE lieu où un mécanisme s'explique en entier (nouvelle étape ou
   enrichissement d'une étape existante).
2. **Les autres séquences n'en portent que des rappels discrets** : une ligne
   dans le pied de page, un encart léger, un renvoi vers l'intro — **jamais**
   une ré-explication complète. Le rappel type, présent dans le pied de page
   des hubs : *« Un doute sur le fonctionnement du cours (fiches, verrouillage,
   entraide) ? Revois l'introduction. »*
3. **On y revient sans cesse** : à chaque nouveau mécanisme ou modification
   d'un mécanisme existant, l'introduction est **mise à jour en premier**, puis
   on vérifie la cohérence des rappels dans les autres hubs, et on le note dans
   la section SNT de `_suivi/chapitres.md` (liste « mécanismes présentés »).

Corollaire pour Claude : à **chaque** chantier SNT qui introduit ou modifie un
mécanisme du dispositif, vérifier si l'introduction doit être mise à jour — et
le proposer si Loïc ne l'a pas demandé.

## 9. Produire un nouveau hub — marche à suivre

1. **Partir du hub du Web** (`pages/2nde-snt-t2-le-web.html`) : copier la
   structure, les variables CSS et le JS des champs. Slug :
   `2nde-snt-tN-nom-du-theme.html`.
2. **Proposer le découpage en séances AVANT de coder** (≈ 1h30 chacune,
   objectifs, volume horaire total) — c'est du fond pédagogique, Loïc arbitre.
3. **Données structurées — vérifier la transversalité** : avant de coder un
   nouveau hub **ou d'en retoucher un**, se demander si une **activité
   ponctuelle** sur les données structurées y a sa place — en particulier autour
   de la prise en main **M365/OneDrive dans l'introduction (t0)**, où les élèves
   stockent et partagent leurs fiches. Ne pas réserver la notion au seul hub du
   thème 4.
4. Coder séance par séance, en respectant le trajet d'étape (§3).
5. **Lier le hub depuis `pages/2nde-snt.html`** sur la carte du thème. ⚠ La page
   de niveau est elle-même dans `pages/` : le lien s'écrit
   `href="2nde-snt-tN-….html"` — **jamais** `href="pages/…"`, sinon
   `pages/pages/…` → 404. Aligner sur la forme du lien du Web (le vérifier par un
   `grep`).
6. **Valider** (§10) puis livrer (§11).
7. Mettre à jour la section « Seconde — SNT » de `_suivi/chapitres.md`.

**Où intervenir avec quel outil** : un composant visuel complexe ou une
exploration graphique → proposer **Claude Design** (canvas), puis réintégrer le
SVG **après avoir purgé toute ressource CDN** (§5). Push/commit → Loïc ou Claude
Code.

## 10. Validation avant livraison

```text
□ node --check sur le JS extrait de la page
□ grep : aucune occurrence de googleapis / cdn / unpkg / jsdelivr
□ grep : aucune occurrence de localStorage / sessionStorage
□ grep : aucune couleur en dur hors du bloc :root
□ Playwright :
  □ chargement sans erreur JS
  □ verrouillage progressif : séance 2 verrouillée à l'arrivée → valider toutes
    les étapes data-gate de la séance 1 → séance 2 débloquée
  □ mode enseignant : déverrouille tout, et le rétablit à l'extinction
  □ chaque type de champ : QCM (bon/mauvais), trous, schéma à légender,
    texte libre (en attente → validé), réflexion perso (jamais de verdict)
  □ « Télécharger ma fiche » : le fichier se génère et contient les réponses
  □ « Recommencer » : remet tout à zéro
  □ captures bureau (1280px) + iPad (820px) + mobile (390px)
□ Contrôle visuel des captures AVANT livraison
```

## 11. Livraison

1. **Archive delta** reproduisant l'arborescence, contenant UNIQUEMENT les
   fichiers créés/modifiés (le hub + `pages/2nde-snt.html` + `fonts.css` si une
   police a été ajoutée). **JAMAIS le site complet.**
2. Le fichier HTML **aussi présenté individuellement** dans le panneau.
3. Les captures d'écran (bureau + iPad + mobile).
4. Récapitulatif final : décisions prises, **décisions laissées ouvertes**, liens
   de ressources encore inertes (`href="#"`), licences des images à confirmer,
   points d'histoire dont la biblio reste à sourcer.

## 12. Jalons d'un hub (`_suivi/chapitres.md`)

Les jalons 1→7 des chapitres de PC **ne sont pas transposables**. Un hub suit :

1. `⬜ Maquette V0 en ligne` — structure et séances navigables
2. `⬜ Contenu complet` — toutes les séances rédigées, à retenir pré-remplis
3. `⬜ Interactivité complète` — tous les champs codés et corrigés en direct
4. `⬜ Ressources définitives` — plus aucun `href="#"`, biblio sourcée
5. `⬜ VALIDÉ` — « je peux l'utiliser en classe » ✅

Notation des flags : `⬜` à faire · `🔄` en cours · `✅` fait · `⚠` bloqué/attention.

## 13. Ce qui n'est pas encore arrêté (honnêteté de phase 1)

Trois hubs existent (Web, Internet, Introduction) et les conventions se
confirment (codes `WEB·x` / `NET·x` / `SYS·x`, ≈ 4 séances + 1 débranchée,
mêmes champs et même JS). Restent **ouverts** — à proposer à Loïc plutôt qu'à
trancher seul :

- l'extraction d'un vrai **`gabarit-hub-snt.html`** : la condition (conventions
  confirmées par plusieurs hubs) est désormais remplie, mais l'extraction reste
  une décision de Loïc ;
- le **volume horaire** type d'une séquence (le Web fait ≈ 6 h sur 4 séances +
  1 débranchée) ;
- l'existence d'un **équivalent du régime A** (dégrossissage rapide multi-thèmes)
  pour peupler les 7 hubs — non tranché : les hubs se rédigent, ils ne se
  transcrivent pas depuis un PPTX.
