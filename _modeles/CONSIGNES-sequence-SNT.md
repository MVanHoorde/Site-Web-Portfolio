# CONSIGNES — Séquence SNT (un thème du programme)

## Portée & contexte (à lire avant tout)

Ce document couvre **un seul des deux gabarits du site** : les **séquences SNT**
(Sciences numériques et technologie, seconde) — séquence → séance → étape →
champ, verrouillage progressif, mode enseignant, page autonome à CSS/JS inline.

⚠ **Il ne s'applique PAS aux chapitres de physique-chimie** (thème → chapitre →
sections, code de déblocage, fiche élève imprimable) : leurs consignes sont dans
`_modeles/CONSIGNES-chapitre-PC.md`. Ne jamais transposer ici les régimes A/B, la
bibliothèque de composants PC (`.encart`, `.formule-bloc`…), le verrou à code, ni
les jalons 1→7 : ce sont deux systèmes différents. Le système PC est **rodé** (14
chapitres ébauchés) ; le système SNT est en **phase 1**, avec **8 séquences** amorcées
(t0 à t7) : le Web (`t2`, la référence d'origine), Internet (`t1`) et
l'**Introduction — Les systèmes informatisés** (`t0`, statut particulier :
voir §8) sont en V0 complète ; Photographie (`t7`) et les quatre thèmes du
chantier du 18/07 — Réseaux sociaux (`t3`), Données structurées (`t4`),
Localisation (`t5`), Informatique embarquée (`t6`) — sont en **V0 partielle**
(S1 rédigée, suite en squelettes). Les conventions se confirment d'une séquence à
l'autre, mais **rien n'est validé** — voir « Ce qui n'est pas encore arrêté »,
en fin de document.

| | **Ce document (SNT)** | **Chapitre PC** |
|---|---|---|
| Structure | séquence → séance → étape → champ | thème → chapitre → sections |
| Style | CSS inline dans la page (autonome) | gabarit + `style.css` du site |
| Déblocage | verrouillage progressif + mode enseignant | code 6 caractères + SHA-256 |
| Persistance | **base de données** Supabase (voir §5, §7) | `localStorage` — hors périmètre |
| Trace élève | « Télécharger ma fiche » (récap HTML) | fiche imprimable A4 |
| Correction | en direct (QCM/trous/schéma), simulée (texte libre) | corrigés dépliables rédigés |

Communs aux deux : RGPD (polices auto-hébergées, jamais de CDN), HTML/CSS/JS
vanilla sans build, responsive (cible iPad), livraison en archive delta, mise à
jour de `_suivi/`.

## 1. Le projet en une phrase

Une **séquence numérique pour les élèves de seconde en SNT** : chaque séquence du
programme est une suite de **séances fléchées**. L'élève suit des activités
(vidéos, manips, exercices), puis **complète une fiche** dont une partie se
**corrige automatiquement**. À terme, cette séquence devient la colonne vertébrale de
l'enseignement SNT de Loïc.

Les 7 thèmes du programme sont listés sur `pages/2nde-snt.html` (cartes
`.chapitre`). Une séquence = un thème.

Sur le **fond pédagogique** (choix des notions, formulations, progression,
accroches), la vision de Loïc est souveraine : ton rôle est l'échafaudage —
chercher, structurer, coder, proposer une V1 dans son ton. Tout contenu que tu
proposes est signalé comme **proposition à valider**. La validation est un acte
explicite de Loïc, jamais présumée ; la mise en ligne n'est pas un jalon.

## 2. Fichiers de référence

| Fichier | Rôle |
|---|---|
| `pages/2nde-snt-t2-le-web.html` | **Séquence de référence (V0 d'origine)** — source de fait pour la structure, les champs et le JS. Page autonome, CSS/JS inline |
| `pages/2nde-snt-t1-internet.html` | Séquence Internet (V0) — première déclinaison, enseignée avant le Web |
| `pages/2nde-snt-t0-systemes-informatises.html` | **Introduction (V0)** — cours « Les systèmes informatisés » **entrelacé** avec le tutoriel du dispositif ; référentiel vivant du fonctionnement du cours (voir §8) |
| `pages/2nde-snt-t7-photographie-numerique.html` | Séquence Photographie (V0 partielle) — `PHO·x` |
| `pages/2nde-snt-t3-reseaux-sociaux.html` | Séquence Réseaux sociaux (V0 partielle) — `SOC·x`, chantier 18/07 (§14) |
| `pages/2nde-snt-t4-donnees-structurees.html` | Séquence Données structurées (V0 partielle) — `DAT·x`, court 2 séances (§14) |
| `pages/2nde-snt-t5-localisation-cartographie.html` | Séquence Localisation & cartographie (V0 partielle) — `LOC·x` (§14) |
| `pages/2nde-snt-t6-informatique-embarquee.html` | Séquence Informatique embarquée (V0 partielle) — `EMB·x` (§14) |
| `pages/2nde-snt.html` | Page de niveau SNT : carte « Pour commencer » + les 7 cartes de thèmes, d'où part chaque séquence |
| `assets/css/fonts.css` | Polices auto-hébergées (voir §5) — **seule** source de polices autorisée |
| `_suivi/chapitres.md` | Section « Seconde — SNT » : état réel de chaque séquence |

Il n'existe pas de fichier `gabarit-sequence-snt.html`, et il n'en faut plus :
**le gabarit, ce sont les deux ressources partagées** `assets/css/sequence-snt.css`
et `assets/js/sequence-snt.js` (extraites de `t1` le 23/07/2026). Une nouvelle
séquence les charge et n'écrit que son contenu. Pour la structure HTML, on part
de `pages/2nde-snt-t1-internet.html`, seule séquence déjà portée.

## 3. Grammaire de la séquence (à respecter partout)

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
  d'origine de la séquence du Web chargeait Space Grotesk / IBM Plex Sans / IBM Plex Mono
  depuis `fonts.googleapis.com` : chaque élève ouvrant la page aurait envoyé son
  IP à Google. Corrigé — IBM Plex Sans ajouté en woff2 local (400, 400i, 500,
  600 ; sous-ensemble latin, OFL) et déclaré dans `assets/css/fonts.css`.
  **À revérifier sur toute page importée de l'extérieur** (Claude Design compris).
- 🔴 **Aucune donnée de progression en `localStorage` / `sessionStorage`.**
  La progression, les réponses et les scores vivent **dans la base** (Supabase).
  Le seul contenu autorisé dans le `localStorage` est le **jeton de session
  Supabase** — c'est sa raison d'être : reconnaître l'élève d'une fois sur
  l'autre sans mot de passe.
  Interdit : recopier « pour aller plus vite » une réponse, un score, un état
  d'étape ou un déverrouillage en local. Si un cache d'affichage éphémère est
  nécessaire (éviter un rechargement pendant une même séance), il vit **en
  mémoire JS**, jamais persisté.
  (Les chapitres de PC utilisent encore `localStorage` pour leur checklist et
  leur verrou SHA-256 — gabarit distinct, **hors périmètre du branchement** :
  décision Loïc du 20/07/2026, la migration viendra après le pilote SNT, le RPG
  concernant aussi les élèves de physique-chimie.)
- **RGPD dès la conception** : aucune collecte cachée, aucune donnée sensible,
  données minimales.
- Pas de framework, pas de build : HTML/CSS/JS vanilla, lisible et modifiable.
- Responsive (**cible iPad**), focus clavier visible, `prefers-reduced-motion`
  respecté.
- Ressources externes chargées **par lien** (vidéos, CodeBetter…). Illustrations
  maison en **SVG** quand c'est possible.
- 🗂 **Une séquence SNT est autonome pour son code.** Tout le **CSS**, tout le **JS**
  et **tous les SVG** vivent **inline** dans `pages/2nde-snt-tN-….html`.
  ⚠️ **Modifié le 21/07/2026** : la règle « aucun fichier d'asset externe » s'est
  révélée intenable dès qu'une séquence utilise des **photographies** (une image
  matricielle en base64 fait passer la page à plusieurs mégaoctets, inutilisable
  sur l'iPad d'un élève). Les **images matricielles sont donc autorisées** dans
  `assets/img/snt/<slug-de-la-séquence>/`, à condition d'être **optimisées**
  (largeur ≤ 1400 px, JPEG progressif pour les photos, ~200 ko cible) et de porter
  **légende + source + licence** sous chaque image. Les illustrations qu'on peut
  dessiner restent en **SVG inline** — c'est toujours le premier réflexe.
  **Quatre ressources partagées, et quatre seulement** (décision de Loïc du
  23/07/2026 — l'audit a montré que sept séquences partageaient 98 % du même
  CSS et du même JS : une correction devait être répétée huit fois, ou oubliée
  sept) :

  | Fichier | Rôle |
  |---|---|
  | `assets/css/fonts.css` | polices auto-hébergées |
  | `assets/js/progression.js` | client de base de données |
  | `assets/css/sequence-snt.css` | 🆕 grammaire visuelle (`:root`, blocs, glisser-déposer) — **versionné `?v=N`** |
  | `assets/js/sequence-snt.js` | 🆕 moteur : progression, QCM, trous, glossaire, mode enseignant, impression, réhydratation |

  Reste **inline dans la page** : le CSS propre à la séquence (encarts de
  contenu), les SVG, les données JSON des QCM et du glossaire, et tout
  composant qui n'existe que là. Toute autre mise en commun se propose, elle
  ne se décide pas.

  ⚠ **État au 23/07/2026 : seule `t1-internet` est portée sur le moteur
  partagé.** Les sept autres tournent encore sur leur copie inline, plus
  ancienne. Les migrer demande d'adapter leur HTML au marquage attendu
  (`data-step`, `data-gate`, `.field[data-focus-code]`, `script.qcm-data`,
  `#dico-source`…) : **une séquence à la fois, testée avant de passer à la
  suivante**. Ne jamais brancher une page sans l'avoir ouverte.
  Arborescence des parties du projet : `CLAUDE.md` « Arborescence — une place
  par partie ».
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

## 7. Les deux phases — phase 1 acquise, phase 2 EN COURS

**Phase 1 — ACQUISE : le contenu, prêt pour la rentrée.**
Finaliser les séquences en **HTML statique autonome**. La correction locale (QCM,
trous, schémas) fonctionne pour de vrai ; le texte libre est **simulé** (passe
*en attente* puis *validé* après un délai, sans correction réelle). Présentable
en classe sans aucun serveur.
⚠ `t1-internet` est **branchée sur la base** : la simulation y a été retirée. Les
sept autres séquences la conservent jusqu'à leur tour, mais **aucune nouvelle
simulation ne s'écrit**.

**Phase 2 — EN COURS depuis le 20/07/2026 : le vrai système.**
Base de données **Supabase** (PostgreSQL managé, **région West EU — Paris**, plan
gratuit) pour l'apprentissage et le pilote ; cible souveraine **Clever Cloud**, à
proposer à l'établissement en septembre.

**Identification : identifiant + mot de passe choisis par l'élève.** L'adresse
`identifiant@snt.local` est une étiquette interne, jamais envoyée ; le mot de
passe est **haché par Supabase et jamais lisible** (on ne le consulte pas, on le
réinitialise depuis le PC de Loïc) ; aucun nom réel n'entre en base — la table
identifiant→nom vit sur le PC de Loïc, hors base. Les connexions anonymes sont
**désactivées** : elles ne permettaient pas la portabilité maison↔lycée.

**Correction du texte libre : worker 100 % local** (PC de Loïc, Ollama /
Mistral Nemo). Il lit les copies `en_attente`, écrit `correction_ia`, et **ne
touche jamais au statut**. Le passage `en_attente → corrige` est un geste
explicite de Loïc — c'est l'**étape 5, encore à écrire** : tant qu'elle n'existe
pas, la copie est corrigée mais l'élève ne voit rien. Aucun port ouvert, aucun
VPS nécessaire.

Ensuite : tableau de bord enseignant, alertes de décrochage **basées sur la
progression réelle** — pas sur la surveillance du temps ni la comparaison entre
élèves (piège RGPD/éthique). Cette base sert aussi de socle au RPG « fil rouge ».

**Coder désormais contre le contrat de données.** La règle « ne pas coder en
prévision de la phase 2 » est **caduque**. Tout nouveau champ de texte libre
s'écrit d'emblée contre l'API de progression (`assets/js/progression.js`),
jamais avec une simulation locale. La simulation *en attente → validé* est
**retirée** de chaque séquence au moment de son branchement ; les séquences non encore
branchés la conservent jusqu'à leur tour, mais **aucune nouvelle simulation
n'est écrite**.

**Ordre de branchement arrêté (20/07/2026)** : pilote sur **une séquence SNT**, une
étape, un champ de texte libre, cycle complet de bout en bout — puis les autres
séquences — puis seulement les chapitres de physique-chimie.

## 8. La séquence d'introduction — référentiel vivant du fonctionnement du cours

`pages/2nde-snt-t0-systemes-informatises.html` a un **statut particulier** :
c'est à la fois un **vrai cours** (« Les systèmes informatisés ») et le
**tutoriel du dispositif**, les deux **entrelacés** — chaque étape du cours est
l'occasion d'apprendre un geste de la séquence (valider un QCM, envoyer une réponse
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
   des séquences : *« Un doute sur le fonctionnement du cours (fiches, verrouillage,
   entraide) ? Revois l'introduction. »*
3. **On y revient sans cesse** : à chaque nouveau mécanisme ou modification
   d'un mécanisme existant, l'introduction est **mise à jour en premier**, puis
   on vérifie la cohérence des rappels dans les autres séquences, et on le note dans
   la section SNT de `_suivi/chapitres.md` (liste « mécanismes présentés »).

Corollaire pour Claude : à **chaque** chantier SNT qui introduit ou modifie un
mécanisme du dispositif, vérifier si l'introduction doit être mise à jour — et
le proposer si Loïc ne l'a pas demandé.

## 9. Produire une nouvelle séquence — marche à suivre

1. **Partir de la séquence du Web** (`pages/2nde-snt-t2-le-web.html`) : copier la
   structure, les variables CSS et le JS des champs. Slug :
   `2nde-snt-tN-nom-du-theme.html`.
2. **Proposer le découpage en séances AVANT de coder** (≈ 1h30 chacune,
   objectifs, volume horaire total) — c'est du fond pédagogique, Loïc arbitre.
3. Coder séance par séance, en respectant le trajet d'étape (§3).
4. **Lier la séquence depuis `pages/2nde-snt.html`** sur la carte du thème. ⚠ La page
   de niveau est elle-même dans `pages/` : le lien s'écrit
   `href="2nde-snt-tN-….html"` — **jamais** `href="pages/…"`, sinon
   `pages/pages/…` → 404. Aligner sur la forme du lien du Web (le vérifier par un
   `grep`).
5. **Valider** (§10) puis livrer (§11).
6. Mettre à jour la section « Seconde — SNT » de `_suivi/chapitres.md`.

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
   fichiers créés/modifiés (la séquence + `pages/2nde-snt.html` + `fonts.css` si une
   police a été ajoutée). **JAMAIS le site complet.**
2. Le fichier HTML **aussi présenté individuellement** dans le panneau.
3. Les captures d'écran (bureau + iPad + mobile).
4. Récapitulatif final : décisions prises, **décisions laissées ouvertes**, liens
   de ressources encore inertes (`href="#"`), licences des images à confirmer,
   points d'histoire dont la biblio reste à sourcer.

## 12. Jalons d'une séquence (`_suivi/chapitres.md`)

Les jalons 1→7 des chapitres de PC **ne sont pas transposables**. Une séquence suit :

1. `⬜ Maquette V0 en ligne` — structure et séances navigables
2. `⬜ Contenu complet` — toutes les séances rédigées, à retenir pré-remplis
3. `⬜ Interactivité complète` — tous les champs codés et corrigés en direct
4. `⬜ Ressources définitives` — plus aucun `href="#"`, biblio sourcée
5. `⬜ VALIDÉ` — « je peux l'utiliser en classe » ✅

Notation des flags : `⬜` à faire · `🔄` en cours · `✅` fait · `⚠` bloqué/attention.

## 13. Ce qui n'est pas encore arrêté

Huit séquences sont amorcées (Web, Internet, Introduction en V0 complète ;
Photographie et les quatre thèmes du 18/07 en V0 partielle) et les conventions
se confirment (codes `WEB·x` / `NET·x` / `SYS·x` / `PHO·x` / `SOC·x` / `DAT·x` /
`LOC·x` / `EMB·x`, ≈ 4 séances + 1 débranchée — 2 séances pour une séquence courte comme
Données structurées, mêmes champs et même JS). Restent **ouverts** — à proposer
à Loïc plutôt qu'à trancher seul :

- le **volume horaire** type d'une séquence (le Web fait ≈ 6 h sur 4 séances +
  1 débranchée) ;
- l'existence d'un **équivalent du régime A** (dégrossissage rapide multi-thèmes)
  pour peupler les séquences restantes — non tranché : une séquence se rédige,
  elle ne se transcrit pas depuis un PPTX.

**Tranché** : la persistance (Supabase), l'identification (identifiant + mot de
passe), l'ordre de branchement (SNT d'abord, PC ensuite).
Historique daté de ces décisions : `_suivi/DECISIONS.md`.

## 14. Règles ajoutées le 18/07/2026 (arbitrages Loïc — chantier des 4 thèmes)

### 14.1 Intégrer au maximum, ne pas renvoyer

**Le contenu élève vit dans la page où l'élève se trouve.** Renvoyer vers une
autre page du site pour comprendre une notion perd les élèves (arbitrage
explicite de Loïc : « dès qu'on peut intégrer, on le fait »). Concrètement :

- une notion nécessaire à une étape est **traitée dans l'étape**, même si elle
  touche un autre thème (ex. : le principe du CSV est expliqué dans la séance
  NMEA de la séquence Localisation, pas délégué à la séquence Données structurées) ;
- chaque donnée n'a qu'**un seul traitement complet** dans tout le site ; les
  autres séquences peuvent y faire un **rappel discret d'une ligne** (« revois
  l'introduction ») — navigation autorisée, délégation de contenu interdite ;
- les simulateurs/manipulations se codent **dans la séquence** quand c'est
  raisonnable (ex. : simulateur d'IHM de la séquence Informatique embarquée) plutôt
  que d'envoyer vers un outil externe en première approche ;
- corollaire : cartographier les **redondances** entre séquences (notes 🔁) pour
  décider où vit le traitement complet.

### 14.2 Notes de chantier dans les pages

Loïc pilote depuis le **site rendu**, pas depuis les fichiers. Tant qu'une séquence
n'est pas VALIDÉ, les remarques de production s'écrivent **dans la page**,
sous forme d'encarts visibles :

- `<aside class="chantier">` (jaune hachuré) pour les notes courantes,
  `<aside class="chantier decision">` (rouge hachuré) pour les **décisions en
  attente de Loïc** — à placer à l'endroit exact où la décision s'appliquera,
  pour qu'il la retrouve « au moment où il bosse dessus » ;
- chaque note est encadrée par `<!-- CHANTIER -->` … `<!-- /CHANTIER -->`
  pour être supprimée d'un geste à la validation ;
- catégories (emoji en tête de note) : 🚧 à écrire/coder · ⚖️ copyright ou
  licence à régler · 📌 décision Loïc attendue · 🔍 ressource à trouver/tester ·
  📅 fait d'actualité à re-vérifier (dater les vérifications) · ✏️ notion à
  creuser (y c. mini-cours de fond côté prof) · 🔁 redondance inter-séquences ·
  🧠 charge mentale / rythme élèves ;
- le CSS des notes vit dans le bloc commun (`.chantier`, variables `--work-*`
  et `--dec-*`) ; `body.eleve` masque toutes les notes d'un coup (filet pour
  une phase de test avec élèves avant validation complète) ;
- à la **validation** d'une séquence : suppression de tous les blocs CHANTIER = une
  étape de la checklist.

### 14.3 Codes d'activité des nouveaux séquences

`LOC·x` (Localisation) · `EMB·x` (Informatique embarquée) · `DAT·x` (Données
structurées) · `SOC·x` (Réseaux sociaux) — mêmes conventions que `WEB·x` /
`NET·x` / `SYS·x` / `PHO·x` (`·D` = débranchée, `·P` = projet).

**Forme en base de données (20/07/2026)** : le point médian est remplacé par un
**tiret** dès qu'un code sort de la page — `WEB·2b` s'écrit `WEB-2b` dans la
colonne `code_activite`, dans une URL et dans un nom de fichier (le `·` est
fragile partout ailleurs que dans du texte). L'**affichage** dans la séquence reste
libre : le point médian y est conservé.

### 14.4 Décisions de périmètre actées le 18/07/2026

- **Localisation** : tout sur **cartes.gouv.fr** (Géoportail ferme sept. 2026) ;
  éthique **intégrée en S4** (pas de séance dédiée — réévaluable) ; le
  microcontrôleur/capteur GPS est **cédé à la séquence Informatique embarquée** avec
  lien clair entre les deux.
- **Informatique embarquée** : format **4 séances** provisoire (repli 3
  possible, arbitrage ultérieur) ; simulateur d'IHM **intégré** ; activité
  **micro:bit réelle** (≈ 10 cartes au labo, 1 pour 2) à mettre en chantier ;
  IA embarquée / voitures autonomes : en chantier, non prioritaire.
- **Données structurées** : traitement **transversal d'abord** (étape « Ranger
  pour retrouver » à ajouter dans t0 ; EXIF branché à la séquence Photo ; NMEA→CSV
  dans Localisation ; rappels d'une ligne dans Internet/Web) + **séquence courte
  2 séances** mobilisable ponctuellement.
- **Réseaux sociaux** : le cadre légal 2026 est une **partie à part entière**
  (élèves de 13-15 ans : se positionner), précédée d'une **enquête « as-tu le
  droit ? »** volontairement piégeante ; le **projet « Invente ton réseau
  social »** remplace l'exposé ; règle générale : **plateformes fictives pour
  les exemples, vraies plateformes pour les faits sourcés uniquement**.

---

## 15. Mécanismes transverses arrêtés le 21/07/2026

Codés et éprouvés dans `pages/2nde-snt-t1-internet.html` (V3), **présentés dans t0**,
**à porter dans les six autres séquences**. Détail complet : `_modeles/spec-snt-t1-internet.md` §13.

### 15.1 Échelle d'évaluabilité (marquage `.niv` sur chaque bloc)

| Marque | Niveau | Blocs |
|---|---|---|
| `★★` | à savoir | à retenir · glossaire (définition **validée**) |
| `★` | à savoir faire | exercices, dont les exercices bilan |
| `○` | support | documents · vidéos · podcasts |
| `✦` | bonus | 🇫🇷 fierté française · le sais-tu |
| `—` | non évalué | pour aller plus loin · activité d'introduction |

⚠️ *bonus* ≠ *facultatif* : le bonus peut rapporter des points, le « pour aller plus
loin » jamais. **Formes visuelles distinctes** (seul le « plus loin » est hachuré).

### 15.2 Grammaire visuelle

La **couleur code le rôle** (lire / se repérer / faire / retenir / culture), la
**forme code le statut**. Bandeaux **allégés** partout **sauf « à retenir »**, seul
bloc conservé en plein (variable `--retain`). Drapeau tricolore réduit à un
**liseré** à côté du mot.

### 15.3 Barre de progression (`#prog` / `#prog4`)

Sommaire des **étapes groupées par séance**, à gauche, cliquable, états fait /
en attente / en cours / à venir. Repli en **bandeau horizontal**, réouverture par
**languette**. Repli d'office sous 1180 px et en **mode focus**.
🔴 **Aucun `localStorage`** — l'état vit en mémoire et en base. Ne jamais recopier
la barre du cahier de vacances, qui lit `localStorage`.
Attribut `data-echeance` prévu par étape, **laissé vide** par décision.

### 15.4 Révélation séquentielle

Une seule étape visible à la fois ; bouton « Étape suivante ↓ ». Le mode enseignant
ouvre tout d'un coup.

### 15.5 QCM — composant, plus jamais un champ inline

Bouton → **plein écran** + **flou** du reste de la page · questions **enchaînées
horizontalement**, jamais empilées · **3 à 4 minimum** · **récapitulatif des bonnes
réponses** en sortie, sur la page **et** sur la fiche, avec compléments
« hors programme, mais bon à savoir ». Données en JSON inline
(`<script type="application/json" class="qcm-data">`).

### 15.6 Trous tolérants

Normalisation (minuscules, accents, ponctuation, articles) · **variantes** par trou
(`data-variantes`, séparateur `|`) · **Levenshtein** (1 faute ≤ 7 caractères, 2 au-delà)
→ état **jaune « presque »** : l'étape est **validée**, l'orthographe corrigée et
signalée, **jamais sanctionnée** · **indices à deux niveaux** (`data-indice1`, `data-indice2`).

### 15.7 Validation d'une étape : **à l'envoi**

Validée dès que l'élève a **produit quelque chose**, juste ou faux.
⚠️ Schéma de données : deux informations distinctes, **fait** et **juste**, la
seconde réservée à la vue enseignant.

### 15.8 Mode enseignant

Hors du sommaire, **discret en tête de page**, **non collant** · **code** vérifié par
empreinte **SHA-256** dans la page · **coupé à 30 minutes**, minuterie visible.
🔴 **Limite à assumer** : page publique + inspecteur = contournable. **Ralentisseur,
pas serrure.** Jamais de contenu sensible derrière. La vraie serrure viendra du rôle
vérifié côté Supabase.

**Ce qu'il ouvre exactement** — `body.teacher` affiche les séances verrouillées
(`.lockable`) et `toutRevel(true)` retire `masque` et `replie` de **toutes** les
étapes : c'est l'outil de **relecture visuelle** d'une séquence entière. Il
**révèle sans valider** — aucune écriture en base, donc aucune donnée de test
injectée dans le compte pilote.

⚠️ **La vérification du code exige un contexte sécurisé** (`crypto.subtle`) : elle
fonctionne sur la page déployée en HTTPS et sur `localhost`, mais **échoue sur un
fichier ouvert en `file://`** — la page affiche alors « Le code ne peut être
vérifié que sur une page servie en https ». Pour relire une séquence en local,
passer par un serveur `localhost`, pas par un double-clic sur le fichier.

### 15.9 Glossaire permanent

Accessible en permanence (bouton en bas à droite), **cherchable**, conçu pour
**traverser les séquences**. Dictionnaire **embarqué** (JSON inline
`#dico-source`) — **jamais d'API externe** : appeler le Wiktionnaire depuis le
navigateur enverrait l'**IP de chaque élève** à Wikimedia.
⚠️ Sans clé anon, les définitions de l'élève **ne le suivent pas** d'une page à l'autre.

### 15.10 Impression et PDF

Une **feuille de style `@media print`** par séquence. Le PDF se fait par
« Imprimer → Enregistrer en PDF » du navigateur. **Aucune bibliothèque, aucun CDN.**

### 15.11 QR codes

Générés **une fois pour toutes** en SVG et collés inline. Aucune bibliothèque au
chargement, aucun appel externe, lisible sur la fiche imprimée.

### 15.12 Vocabulaire — figé

Une **séquence** contient des **séances**, qui contiennent des **étapes**, qui
contiennent des **champs**. Côté élève, on dit **thème**. N'y revenir sous aucun prétexte.

## 16. Cible matérielle : iPad et téléphone

🔴 **Contrainte acquise — ne pas la reposer en question.**

Les élèves travaillent sur **iPad et sur téléphone**. Toute interaction doit donc
fonctionner **au tactile** :

- **jamais de `:hover` comme seul déclencheur** — un survol n'existe pas sur une
  dalle tactile. Le `:hover` reste autorisé comme *confort* pour la souris, à
  condition que la même chose s'obtienne au **clic** (et au **clavier**, via
  `:focus`). Modèle en place : le picto « à voir plus tard » (`.plustard`), ouvert
  au clic, refermé par un clic ailleurs ;
- **jamais l'attribut `title` comme unique porteur d'information** — il ne
  s'affiche pas au tactile. Une définition, une précision, une source passent par
  une **bulle cliquable** ou par du texte visible. `title` reste acceptable en
  doublure d'un libellé déjà présent, et sur un `<iframe>` (où il est le nom
  accessible du cadre) ;
- **cibles tactiles ≥ 44 px** (recommandation Apple) : boutons, croix de
  fermeture, cases d'un QCM, boutons d'indice. Pour un élément **en ligne** dans
  un texte, élargir la zone de contact avec un pseudo-élément
  (`::before{position:absolute;inset:-11px -6px}`) plutôt que grossir le texte ;
- **aucun contenu ne doit exiger un survol pour être lu**, y compris les légendes,
  les sources d'images et les compléments « hors programme, mais bon à savoir » ;
- tout panneau plein écran (QCM, mode focus, zoom d'image) doit offrir une
  **porte de sortie visible et tactile** — pas seulement la touche `Échap`.

Vérification avant livraison : parcourir la page en **simulation tactile** (mode
appareil du navigateur, souris désactivée) ; tout ce qui ne s'atteint pas au doigt
est un défaut, pas un détail.

---

## 17. La fiche de révision — refonte du 23/08/2026

La fiche est produite par `ficheHTML()` dans `assets/js/sequence-snt.js`, à
partir de la page et du travail de l'élève. Elle s'ouvre dans un onglet ; l'élève
l'enregistre en PDF et la dépose dans le **dossier OneDrive qui sert de classeur
numérique**.

### 17.1 Ce que le contexte d'usage impose

**La fiche n'est jamais imprimée.** Elle est déposée. Trois conséquences, et
elles commandent toute la conception :

- **aucune contrainte de place** — six pages ne posent pas de problème. Chaque
  section a son cadre ; le document s'allonge selon ce que l'élève a produit ;
- **aucun cadre à remplir au crayon** — un tableau vierge à compléter à la main
  n'a plus d'objet sur un document qu'on ne sort pas de l'écran ;
- **rien à automatiser côté dépôt** — le circuit OneDrive est volontairement
  manuel : il sert autant à archiver qu'à évaluer l'investissement de l'élève.
  Le site produit une fiche déposable, c'est tout ce qu'on lui demande.

### 17.2 Les quatre parties

1. **L'en-tête** lit le **thème** dans `h1.title` (le `.tag` est retiré) et la
   **séance** dans `.seance-head h2` (le `.s-num` devient « Séance 1 »).
   🔴 **Jamais de chaîne en dur** : ce moteur sert les huit séquences. Jamais
   de « S1 » non plus — c'est un identifiant interne, l'élève ne le connaît pas.

2. **Le bandeau de complétion**, trois compteurs, parce que « fait » n'a pas le
   même sens selon l'objet : *étapes parcourues*, *questions ouvertes envoyées*,
   *corrections reçues*. Plus une ligne nommant ce qui manque.
   🔴 **Il appelle `EtatSNT.resume()`** — le calcul que la page écrit en base et
   que le tableau de bord relit. **Ne jamais écrire un second comptage à côté** :
   deux calculs séparés finissent par diverger, et c'est l'élève qui voit
   l'écart. Même règle que pour l'ordre des séances dans `verrou-snt.js`.
   Le bandeau est **informatif, pas probant** — il est calculé dans le navigateur
   de l'élève, et la fiche le dit.

3. **La partie fixe**, propre à chaque séance, déclarée **dans la page** :

   ```html
   <template data-fiche-fixe>
     <h2><span class="n">1</span>Titre de section</h2>
     <p class="fx-note">Une à deux phrases, pleine largeur.</p>
     <figure class="fx-fig"><svg …>…</svg><figcaption>…</figcaption></figure>
   </template>
   ```

   Posé **juste après `</div><!-- /lockable -->`**, dans la `<section class="seance">`.
   Un `<template>` n'est pas rendu : invisible pour l'élève tant qu'il n'ouvre
   pas sa fiche.

   **Principe éditorial : le schéma porte l'explication, le texte l'accompagne.**
   Compter environ **quatre schémas SVG par séance** — c'est le poste de travail
   le plus lourd du chantier, et le seul à refaire à chaque fois.

   🔴 **Aucune couleur en dur dans le template.** Les SVG emploient les classes
   `f-*` (`f-bleu`, `f-case`, `f-pris-vert`, `f-fleche`…) et la mise en page les
   classes `fx-*` (`fx-fig`, `fx-duo`, `fx-train`, `fx-loin`…). Elles sont
   toutes définies dans `ficheCSS()` : **une seule palette à tenir**.

   Les numéros de section du template sont **écrits à la main** ; les sections
   suivantes reprennent automatiquement après (le générateur compte les `<h2>`).

   Sans template, la fiche se rabat sur les « à retenir » et reste utilisable :
   c'est le cas de `t1` et de la séance 2 de `m1` aujourd'hui.

   **Le modèle est reproductible** : en-tête, numérotation, entraînement à
   réponses retournées (`.fx-train` + `.fx-rv`, qui pivote le corrigé à 180°),
   bloc mots-clés (`.fx-kw`) se recopient tels quels d'une séance à l'autre.

4. **La partie adaptative** — le travail de l'élève.

   | Entre | Sort |
   |---|---|
   | les réponses rédigées, **avec la correction et les conseils** | ❌ les bonnes réponses des QCM — elles feraient de la fiche un corrigé |
   | les recherches personnelles, enquêtes familiales (`.perso`) | ❌ « Sources des documents » — sans intérêt sur une fiche de révision |
   | les notes de visionnage, le glossaire | |
   | les tableaux complétés, **saisies figées** (`ficheFiger()`) | |

### 17.3 Le piège technique à ne pas rouvrir

Un `doc-table` peut désormais contenir de **vrais champs** (le tableau des
combinaisons de `m1` 1.4). `ficheFiger()` remplace chaque `input`/`select` par un
`span.saisi` portant la valeur, et retire boutons, bulles et messages. Sans lui,
la fiche embarquerait des formulaires vides à la place des réponses de l'élève.

### 17.4 Ce que l'élève ne doit pas lire

`correction_ia` contient aussi ce qui est destiné au professeur —
`analyse.tri.raisons`, `analyse.a_verifier_par_le_prof`, les constats critère par
critère. **`progression.js` ne rapatrie plus que les trois champs utiles**
(verdict, message, « pour aller plus loin ») par sélection de sous-champs jsonb.
C'est de l'hygiène, **pas un verrou** : le durcissement côté base est proposé,
non exécuté, dans `bdd/schema/015-correction-eleve.sql`.
