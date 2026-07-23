# Journal du projet

> **En ajout seul.** On n'y corrige rien, on n'y relit rien par défaut : c'est la
> mémoire longue. L'état courant vit dans `ETAT-PROJET.md`, les décisions dans
> `DECISIONS.md`.
>
> Ce fichier absorbe, au 23/07/2026 : l'ancien `ETAT-PROJET.md` (format
> chronologique), la note de reprise `Reprise_IA-SNT_et_affichage-eleve.md` et le
> brief `BDD-brief-jalon4.md`. **Rien n'a été supprimé** — les alertes techniques
> par chapitre (T2-C2 Ex8, T3-C2 nœud B, T3-C4 corrections à valider…) sont
> conservées telles quelles plus bas et restent la référence pour le régime B.

---

## 23/07/2026 — Audit complet du dépôt

Audit exhaustif (SNT en priorité, puis l'ensemble du site). Constats principaux :

- **≈ 375 000 tokens** pour lire tout le projet — au-delà d'une fenêtre de
  contexte. `pages/2nde-snt-t1-internet.html` seul pèse ≈ 109 000 tokens.
- **6 contradictions** dans les fichiers de référence, dont **5 dans le seul §7**
  de `CONSIGNES-sequence-SNT.md` : région « Francfort » au lieu de Paris ·
  identification par connexions anonymes · « aucun mot de passe en base » ·
  « API Mistral ou modèle local » · « le worker réécrit le statut ». Toutes
  corrigées ce jour.
- **~260 ko de code dupliqué** : sept séquences partagent 98 % du même CSS/JS.
  `t1` a forké (CSS 60 %, JS 34 % de similarité avec le Web) et porte **seule**
  les 10 mécanismes du §15 — aucun n'est porté ailleurs.
- **La boucle SNT est ouverte** : rien dans le dépôt ne peut écrire
  `statut = 'corrige'`. L'élève ne voit donc jamais son retour.
- **94 couleurs en dur** hors `:root` et **144 attributs `style=`** dans `t1`
  (0 et 15-38 dans les autres séquences).
- **196 liens `href="#"`** visibles des élèves ; 1 lien réellement cassé
  (`term-spe-physique-chimie.html` → `docs/tp-1-1.pdf`).
- Le code enseignant `ROUTAGE` figurait **en clair** à côté de son empreinte
  SHA-256, et dans une note de chantier. Corrigé.
- Un `<aside class="chantier">` de `t1` (étape 3.3) n'était pas encadré par les
  marqueurs `<!-- CHANTIER -->` : il aurait survécu au nettoyage de validation
  et se serait affiché en classe. Corrigé.
- `bdd/schema/003` a été modifié après exécution (un commentaire seulement), ce
  que la discipline de `bdd/README.md` interdit. Règle à tenir, ou à relaxer
  explicitement en « commentaires autorisés ».
- `assets/img/snt/` a gardé les noms bruts de Wikimedia (majuscules, doubles
  underscores) : risque de 404 en production, Windows étant insensible à la casse
  et GitHub Pages non. Aujourd'hui tout correspond.
- `maquette-affichage-eleve.html`, annoncée « à garder en référence », n'est pas
  dans le dépôt. `moteur.mjs` est toujours en `temperature: 0.2` — préalable non
  levé avant tout re-benchmark.
- **Deux backends parallèles** : SNT sur Supabase (en service) et ES sur
  `serveur-frise/` (à héberger, auth/HTTPS/purge à faire). Même finalité.

Vérifié et **sans défaut** : aucun CDN ni Google Fonts sur les 8 séquences ·
aucun `localStorage` de progression (les 5 occurrences dans `t1` sont des
commentaires qui rappellent l'interdiction) · équilibre des `<div>` parfait sur
les 8 · 0 erreur de syntaxe sur les 76 blocs JS inline des 48 pages et sur les
8 fichiers `.mjs`/`.js` · 0 `id` dupliqué · 0 `<img>` sans `alt` · `?v=2`
cohérent sur les 17 fichiers · aucune dérive entre `bdd/schema/006` et la
migration Supabase (mêmes 10 policies, mêmes 4 fonctions) · les 8 cas de
`_test-verdict.mjs` passent.

**Fausse alerte levée** : la policy `reponses_reecrire` semble interdire le
renvoi après correction (`correction_ia is null`), mais le déclencheur
`before update` de 005 remet `correction_ia` à NULL **avant** l'évaluation du
`WITH CHECK` par PostgreSQL. Ça marche, et c'est finement pensé. Reste un cas
limite : renvoyer un texte **identique** ne déclenche rien et produit une erreur
HTTP brute — une ligne dans `envoyerReponse` suffirait.

**Bug ouvert — l'aide aux camarades est inatteignable.** `calculerAide()` fait le
ratio des critères « observé » sur le **total** (socle + `plus_loin`), seuil 2/3.
Or NET-1b a 1 socle pour 4 `plus_loin` → un élève au socle parfait plafonne à
0,20 ; NET-2c plafonne à 0,50. La suggestion « à valider » ne peut donc jamais
sortir. Contraire au principe affiché (« `plus_loin` ne bloque jamais »).
`_test-verdict.mjs` ne le voit pas : il n'assert que le verdict, jamais l'aide.

Corrections appliquées le même jour : les 6 corrections de vérité, la
restructuration de `_suivi/`, `MANIFESTE.md`, `verifier.mjs`, la fuite du code
enseignant, le bloc CHANTIER non encadré, le commentaire « note » de
`bdd/schema/003`.

---

## Archive — ancien `ETAT-PROJET.md` (format chronologique, jusqu'au 22/07/2026)


Vue d'ensemble. Détail par chapitre dans `chapitres.md` ; idées dans `IDEES.md`.
Contexte et règles de collaboration : `CLAUDE.md` à la racine. Consignes de
production, un fichier par gabarit : `_modeles/CONSIGNES-chapitre-PC.md` et
`_modeles/CONSIGNES-sequence-SNT.md`.

---

## 🎨 Identité graphique (décision du 16/07)

**Reliure « papier d'étude »** (variante B validée sur maquettes) appliquée à la
**coque du site uniquement** : accueil refondu (page de titre, gravure du jour en
rotation quotidienne, table des matières des classes, Mission Spectra), pages de
niveau via `style.css`, et fond/nav/pied des pages de chapitre via un bloc
`reliure-papier-etude` injecté (aussi dans `gabarit-chapitre.html`).
**L'intérieur des cours est intact** : encarts Hα/Hβ/Hγ, panneau de formule
sombre, verrou, JS — rien n'a bougé (vérifié par Playwright).
EB Garamond auto-hébergée (RGPD) dans `assets/fonts/`. Les 8 gravures du domaine
public restent à déposer dans `gravures/` (voir `gravures/A-LIRE.txt`) ; en
attendant, l'accueil affiche un cadre vide annoté.

---

## ⏳ En attente de Loïc — rappels récurrents

> Tâches côté Loïc, à ressortir régulièrement tant qu'elles ne sont pas cochées.
> Claude : rappeler ces points quand on retravaille le site (surtout l'accueil).

**Gravures de l'accueil** (domaine public, à déposer dans `gravures/` — détail et
sources dans `gravures/A-LIRE.txt`). Tant qu'un fichier manque, l'accueil montre
un cadre vide annoté à la place de la planche.

- [ ] `01-prisme-newton.jpg` — Newton, prisme, 1704
- [ ] `02-machine-nollet.jpg` — Nollet, machine électrostatique, 1743
- [ ] `03-alambic-encyclopedie.jpg` — Encyclopédie, distillation, 1765
- [ ] `04-pile-volta.jpg` — Volta, la pile, 1800
- [ ] `05-camera-obscura.jpg` — Kircher, chambre noire, 1646
- [ ] `06-barometre-torricelli.jpg` — Torricelli, baromètre, 1644
- [ ] `07-champ-faraday.jpg` — Faraday, lignes de champ, 1852
- [ ] `08-spectre-fraunhofer.jpg` — Fraunhofer, spectre solaire, 1814

**Autres retouches d'accueil en attente**

- [ ] Remplacer le courriel placeholder `prenom.nom@exemple.fr` par la vraie adresse
- [ ] Mettre le vrai lien de l'espace classe ENT (actuellement `href="#"`)
- [ ] (plus tard) Créer la page « collection de gravures » ; le lien
      « Parcourir la collection » de l'accueil boucle pour l'instant sur `#gravures`

**Base de données — vigilance permanente** (pas une case à cocher, un réflexe)

- Le PC de Loïc porte les deux tâches planifiées et, bientôt, le worker de
  correction IA. **Sept jours consécutifs sans allumer le PC = projet Supabase
  mis en pause.** Rien n'est perdu, la relance se fait d'un clic au tableau de
  bord — mais le site ne répond plus tant qu'elle n'a pas eu lieu.
- Vérifier de temps en temps `C:\Sauvegardes-SNT\journal.log` : une ligne `OK`
  par semaine. Une ligne `ECHEC` ou une absence de ligne = sauvegarde muette.
- Faire le ménage dans `C:\Sauvegardes-SNT` quand la base contiendra des
  copies d'élèves (règle de purge à ajouter au script à ce moment-là).

---

## 🎯 Objectif de la période (vacances)

**Dégrossir un maximum de chapitres** (régime A) : mettre TOUT en ligne à l'état
d'ébauche navigable, manques signalés par blocs 🚧. Loïc va déposer les PPTX de
tous les chapitres. Le raffinage et la **validation** viendront ensuite, en
régime B, chapitre par chapitre.

**Régime A élargi depuis le 15/07** (voir `_modeles/CONSIGNES-chapitre-PC.md`) :
exercices et corrections rédigés en entier même quand une image les accompagne,
encarts formule reconstitués depuis la source, QR codes et hyperliens vidéo
décodés et posés en vrais liens (Kahoot compris), courte recherche web possible
si un point manque pour la compréhension. Restent en régime B : photos réelles,
schémas/illustrations à redessiner en SVG, grands tableaux, et — toujours —
le lien du DS (jamais posé automatiquement, quel que soit le contenu de la
source, puisqu'il change chaque année).

## ⚠ Statut de validation — à lire

- **Aucun cours n'est validé à ce jour.** Certaines fiches ont été *proposées*
  (C2, C3, C4) mais **aucune n'est validée**.
- La **mise en ligne n'est pas un jalon** : tout est / sera en ligne. Ce qui se
  suit, c'est le **niveau de finition validé** (jalons 2 → 7 de `chapitres.md`).
- La validation est un **acte explicite de Loïc** (« oui, ce cours me convient,
  je peux l'utiliser l'an prochain »), jamais présumée par Claude.

## 🚦 Priorités

1. **Finir le dégrossissage** de tous les chapitres disponibles (régime A).
2. Mettre en place le travail en **Claude Code / VS Code** pour le raffinage.
3. Démarrer le raffinage + la validation, en commençant par les chapitres les
   plus utilisés en début d'année.
4. Intégrer le **calendrier scolaire** (fourni plus tard) pour ordonner les priorités.
5. 🆕 **Volet base de données** — jalons 4 à 7 (voir `_suivi/BDD-cadrage.md`).
   Ne bloque pas la rentrée : le site reste fonctionnel sans, mais c'est le
   socle du RPG et du suivi réel de progression.
6. 🆕 **SNT-T1 Internet — relire la séquence après les lots A→E du 21/07.**
   Six chantiers d'affilée y ont touché : numérotation des étapes, frise devenue
   exercice, glossaire automatique, images ré-agencées et ré-optimisées, QCM
   élargi, fiche téléchargée enrichie. C'est la séquence la plus avancée du
   site : elle sert de référence aux sept autres, donc **la valider avant de
   décliner**.

## ⚠ Alertes

- 🆕 **SNT-T1 — défaut de structure corrigé le 21/07, à surveiller ailleurs.**
  Un `</div>` surnuméraire refermait le conteneur `.wrap` au milieu de la page :
  quatre séances sur cinq s'affichaient **sur toute la largeur de l'écran**, hors
  colonne, et le bouton « Étape suivante » remontait au milieu du parcours. Rien
  ne le signalait — ni erreur JS, ni page cassée. **Les sept autres séquences SNT
  sont déclinées du même fichier : vérifier l'équilibre des `<div>` sur chacune**
  (comptage `<div` / `</div>` par section).

- 🆕 **SNT-T1 — deux décisions gelées par Loïc (21/07).** (1) Les **codes
  d'activité** ne sont pas renommés tant que la couche Supabase n'est pas
  traitée ; deux familles de clés cohabitent (`NET·xx` et `NET-xx`), à
  harmoniser plus tard. (2) Les **licences de six crédits images** restent « à
  confirmer » : vérification à faire en ligne par Loïc lui-même.

- 🆕 **SNT — règle du référentiel vivant (17/07).** La séquence d'introduction
  (`pages/2nde-snt-t0-systemes-informatises.html`) = cours « Systèmes
  informatisés » **entrelacé** avec le tutoriel du dispositif. **Toute nouvelle
  idée de fonctionnement du cours s'y présente explicitement en premier** ; les
  autres séquences n'en portent que des rappels discrets (pied de page). Voir
  `CONSIGNES-sequence-SNT.md` §8 — et y revenir sans cesse.
- ✅ **Vestige RGPD corrigé (17/07)** : la page orpheline `2nde-snt.html` à la
  **racine** (doublon obsolète, chargeait encore Google Fonts, liens `#`) est
  remplacée par une redirection propre vers `pages/2nde-snt.html`. Option plus
  radicale possible : `git rm` (décision Loïc).
- 🆕 **SNT — la séquence « Le Web » est en ligne (17/07)** : `pages/2nde-snt-t2-le-web.html`,
  lié depuis la carte SNT 2 de `pages/2nde-snt.html`. **Maquette V0, non validée.**
  C'est un **second gabarit**, distinct des chapitres de PC (séquence → séance →
  étape → champ ; pas de `localStorage` ; CSS inline) — voir
  `_modeles/CONSIGNES-sequence-SNT.md`.
- 🔴 **RÈGLE — aucune police depuis un CDN.** La maquette de la séquence chargeait Space
  Grotesk / IBM Plex Sans / IBM Plex Mono depuis `fonts.googleapis.com` : chaque
  élève ouvrant la page aurait envoyé son IP à Google, à rebours de la règle du
  site (polices auto-hébergées, `assets/css/fonts.css`). Corrigé : **IBM Plex Sans
  ajouté** en woff2 local (400, 400i, 500, 600 — latin, OFL) et déclaré dans
  `fonts.css`. À vérifier sur toute page importée de l'extérieur.
- ✅ **Page de niveau `pages/2nde-physique-chimie.html` mise à jour et fournie** :
  les 4 chapitres du Thème 3 y sont **liés** (liens anti-préfixe, mêmes cartes
  `.chapitre` que les Thèmes 1-2, descriptions à puces conservées).
- ⚠ **T3 — divergence de structure à trancher (décision de Loïc).** L'ancienne
  page prévoyait 3 chapitres, avec **spectres en CH.2 et signaux en CH.3** ; les
  PPTX déposés donnent **4 chapitres** dans l'ordre son / signaux / spectres /
  réfraction (+ réfraction, absent de l'ancienne page). La page a été alignée sur
  **l'ordre des PPTX/slugs** (obligatoire pour que carte et page portent le même
  numéro). Deux ajustements faits, réversibles : (1) « Vision et image — spectres
  lumineux » renommé **« Dispersion et spectres »** (titre réel de la page de
  cours) ; (2) signaux et spectres permutés. Si Loïc préfère l'ordre pédagogique
  son / spectres / signaux, il faut **renuméroter les fichiers** (t3-c2 ↔ t3-c3 :
  noms, clés localStorage, titres internes) — à faire en régime B.
- ⚠ **T3-C2 (signaux et capteurs) Ex2, loi des nœuds au point B : correction de
  la source fausse → corrigée.** La source écrivait une relation incohérente au
  nœud B ; rétablie en **I₃ + I₆ = I₅** (I₅ sortant), avec un aparté explicatif.
  À revoir en régime B.
- ⚠ **T3-C2 : pas de diapositive « Pour le DS » ni de Kahoot** dans la source →
  liste de compétences à fournir (bloc 🚧), pas de chip Kahoot.
- ⚠ **T3-C2 : hyperliens vidéo dupliqués dans la source** (mêmes URLs sur
  plusieurs diapositives) → posés au mieux à leur emplacement le plus probable ;
  à vérifier en régime B.
- 🔴 **T3-C4 (réfraction et réflexion) : la source est une VERSION ÉLÈVE, sans
  corrigés.** Les **5 corrections ont été rédigées par Claude** (calculs vérifiés)
  et **portent la mention « à valider »** sur la page. À contrôler en priorité en
  régime B. En particulier **Ex3** (température de l'eau depuis n=1,333) dépend
  d'un **graphe n=f(θ) laissé en 🚧** : réponse ≈ 20 °C donnée sous réserve.
- ⚠ **T3 (4 chapitres) : liens DS laissés en attente** — jamais posés
  automatiquement (ils changent chaque année). Bloc 🚧 dédié dans chaque
  checklist.
- ⚠ **C6 et C7 : pas de diapositive « Pour le DS »** dans les sources — listes de compétences à fournir (et pas de Kahoot non plus pour ces deux chapitres).
- ⚠ **C5 : lien DS laissé en attente** — un lien existe dans la source (étiqueté « DS - 2024 », donc 2024/2025) mais n'a pas été activé, dans l'attente du choix de Loïc (DS de cette année ou de l'an dernier).
- ⚠ **T2 (3 chapitres) : liens DS laissés en attente** — comme pour C5, des liens « DS » figurent dans les sources mais ne sont jamais posés automatiquement.
- ⚠ **T2-C2 Ex6 : unité corrigée** — la source notait le résultat « ≈ 1,98×10²⁰ kg » ; corrigé en **newton (N)** (la valeur numérique est exacte).
- ⚠ **T2-C2 Ex8 : deux points à trancher** — (1) la correction inverse g Paris (9,73) et g équateur (9,81) par rapport à l'énoncé et à l'Image 13 (physiquement, g est plus grand à Paris ≈ 9,81) ; (2) l'écart annoncé « 8 % » est en réalité ≈ **0,8 %**. Transcrit fidèlement, avec aparté ; à revoir en régime B.
- ⚠ **T2-C2 : doublon de numéro d'exercice** — deux « Exercice 10 » dans la source (diapos 11 et 13) ; le second (plan incliné) a été renuméroté **Ex11**.
- ⚠ **T2-C3 : coquille corrigée** — « le masse » → « la masse » (définition de l'inertie).
- 🔴 **RÈGLE — `assets/css/chapitre-commun.css` est versionné : incrémenter le
  `?v=N` dès qu'une modification change le rendu** (retoucher un commentaire du
  fichier ne compte pas). Les pages le chargent via
  `<link ... href="../assets/css/chapitre-commun.css?v=2">`. Si on modifie le CSS
  sans toucher au `?v=N`, l'URL reste identique et **les navigateurs qui ont déjà
  ouvert un chapitre servent l'ancienne feuille depuis leur cache** : la
  correction est invisible pour les élèves, qui ne feront jamais de Ctrl+Shift+R.
  Passer `?v=2` → `?v=3` partout : `git grep -l 'chapitre-commun.css' -- '*.html'`
  (14 chapitres + `_modeles/gabarit-chapitre.html`). Cas vécu le 16/07 : barre de
  fraction des blocs-formule corrigée, mais restée invisible jusqu'au versionnage.
- 💡 **Décision (T2) — convention d'écriture des vecteurs** : en ébauche, la flèche est rendue par un caractère combinant Unicode placé au-dessus du symbole (lisible, mais imparfait sur les groupes multi-lettres). À raffiner en régime B (petit composant SVG ou notation dédiée).

- 🆕 **SNT — séquence « Photographie numérique » S1 en ligne (18/07)** :
  `pages/2nde-snt-t7-photographie-numerique.html`, lié depuis la carte SNT 7.
  **Maquette V0, non validée** — S1 complète et testée (Playwright), S2-S5 en
  squelettes 🚧 verrouillés. Découpage 5 séances + frise débranchée arbitré par
  Loïc le 18/07. Détail, arbitrages et restes à faire : `_suivi/chapitres.md`
  (section SNT-T7). Deux erreurs de la source corrigées au passage dans le
  contenu à venir (canal alpha ≠ « saturation » ; formats d'images datés).

- 🆕 **SNT — chantier des 4 thèmes lancé (18/07)** : séquences **Réseaux sociaux**
  (`t3`, `SOC·x`), **Données structurées** (`t4`, `DAT·x`, court 2 séances),
  **Localisation & cartographie** (`t5`, `LOC·x`) et **Informatique embarquée**
  (`t6`, `EMB·x`) créés en **V0 partielle** (S1 rédigées, suite en squelettes
  🚧), liés depuis `pages/2nde-snt.html`. Arbitrages de périmètre et nouvelles
  règles de production (intégrer plutôt que renvoyer, notes de chantier dans la
  page, plateformes fictives) consignés dans `CONSIGNES-sequence-SNT.md` §14. Détail
  par séquence : `chapitres.md`. **Décisions 📌/⚖️/📅 en attente** signalées par des
  encarts `<aside class="chantier decision">` dans chaque page (voir §14.2).

## 📊 Avancement (Seconde — Thème 1)

Tout est en ligne à l'état d'ébauche. Niveau de finition **validé** :

| Chapitre | Cours validé | Fiche |
|---|---|---|
| T1-C1 Matière macroscopique | ⬜ non | — |
| T1-C2 Transformations phys./chim. | ⬜ non | proposée, non validée |
| T1-C3 Constitution de l'atome | ⬜ non | proposée, non validée |
| T1-C4 Dénombrer les entités | ⬜ non | proposée, non validée |
| T1-C5 Solutions aqueuses | ⬜ non | — |
| T1-C6 Cortège électronique | ⬜ non | — |
| T1-C7 Stabilité des entités chimiques | ⬜ non | — |

> Les autres thèmes/chapitres s'ajouteront au fil du dégrossissage.

## 📊 Avancement (Seconde — Thème 2)

Tout est en ligne à l'état d'ébauche (régime A élargi). Niveau de finition **validé** :

| Chapitre | Cours validé | Fiche | Code |
|---|---|---|---|
| T2-C1 Décrire le mouvement | ⬜ non | — | REP3RE |
| T2-C2 Modéliser une action sur un système | ⬜ non | — | F0RCES |
| T2-C3 Le principe d'inertie | ⬜ non | — | IN3RTE |

> Codes de déblocage choisis par Claude, à transmettre via le cahier de textes (modifiables).

## 📊 Avancement (Seconde — Thème 3 · Ondes et signaux)

**Nouveau (16/07).** Les 4 chapitres sont **en ligne à l'état d'ébauche**
(régime A élargi) et **liés** depuis `pages/2nde-physique-chimie.html` (fait —
voir Alerte plus haut). Niveau de finition **validé** :

| Chapitre | Cours validé | Fiche | Code |
|---|---|---|---|
| T3-C1 Émission et perception d'un son | ⬜ non | — | S0NORE |
| T3-C2 Signaux et capteurs | ⬜ non | — | S1GNAL |
| T3-C3 Dispersion et spectres | ⬜ non | — | PR1SME |
| T3-C4 Réfraction et réflexion | ⬜ non | — | M1RAGE |

> Codes de déblocage choisis par Claude, à transmettre via le cahier de textes (modifiables).
> **Rappels de vigilance pour le régime B** : C2 (nœud B corrigé, pas de DS/Kahoot,
> vidéos dupliquées) et surtout **C4 (corrections rédigées par Claude, à valider)**.

## 📊 Avancement (Seconde — SNT)

**Nouveau (17-18/07).** Gabarit « séquence élève », distinct des chapitres de PC.
Les 7 thèmes sont listés sur `pages/2nde-snt.html` ; **8 séquences existent** (t0 à
t7), tous liés depuis la page de niveau. Détail par séquence et restes à faire :
section « Seconde — SNT » de `chapitres.md`.

| Thème | Séquence en ligne | Validé | Ressources définitives |
|---|---|---|---|
| SNT 0 · Introduction 🧭 | ✅ V0 (2 séances + débranchée) | ⬜ non | ⬜ `SYS·1`, `SYS·D` à brancher |
| SNT 1 · Internet | ✅ V0 (4 séances + débranchée) | ⬜ non | ⬜ `NET·2b`, `NET·D`, liens `NET·3/4` à tester |
| SNT 2 · Le Web | ✅ V0 (4 séances + frise) | ⬜ non | ⬜ activités cahier + frise à brancher |
| SNT 3 · Réseaux sociaux | 🔄 V0 partiel (S1 OK, S2 aux ⅔, S4 enquête codée ; S3 + fin S4 🚧) | ⬜ non | ⬜ `SOC·P`, `SOC·D`, biblio Skyblog-BnF |
| SNT 4 · Données structurées | 🔄 V0 partiel (S1 Titanic OK ; S2 🚧) — séquence courte 2 séances | ⬜ non | ⬜ `DAT·1`, `DAT·1b`, `DAT·D`, biblio Légifrance |
| SNT 5 · Localisation & cartographie | 🔄 V0 partiel (S1-S2 OK ; S3-S4 🚧) | ⬜ non | ⬜ `LOC·1`, `LOC·2b`, `LOC·D`, biblios |
| SNT 6 · Informatique embarquée | 🔄 V0 partiel (S1 OK ; S2-S4 🚧) — 4 séances provisoire | ⬜ non | ⬜ `EMB·D`, biblios Moreno/IoT |
| SNT 7 · Photographie numérique | ✅ V0 (S1 complète + S2-S5 🚧 + débranchée cadrée) | ⬜ non | ⬜ `PHO·1`, `PHO·D` à brancher |

> Phase 1 (rentrée) : HTML statique autonome, correction locale réelle, texte
> libre **simulé**. Phase 2 (plus tard) : VPS + base de données + correction IA
> + comptes élèves. Ne pas mélanger les deux — voir
> `_modeles/CONSIGNES-sequence-SNT.md` §7.

## 🔜 Prochaines actions

- [ ] **Trancher la structure du Thème 3** (ordre des PPTX conservé, ou
      renumérotation vers son / spectres / signaux — voir Alertes).
- [ ] **Valider les 5 corrections de T3-C4** rédigées par Claude (source sans corrigé).
- [ ] Trancher le nœud B de **T3-C2 Ex2** et la loi des nœuds associée.
- [ ] Déposer les PPTX des chapitres restants pour dégrossissage (régime A).
- [ ] Vérifier que chaque ébauche est liée depuis `pages/2nde-physique-chimie.html`.
- [ ] Cloner le repo dans VS Code + extension Claude Code (pour le raffinage).
- [ ] Fournir le calendrier scolaire pour ordonner les priorités.
- [ ] **SNT — finaliser la séquence Web à 100 %** : étoffer la frise débranchée
      (étiquettes datées + corrigé), ajouter le bonus geek « 404 & codes HTTP »
      en séance 1, brancher les ressources définitives (`WEB·2b`, `WEB·D`).
- [ ] **SNT T7 Photo — rédiger S2 à S5** (séance par séance, arbitrage fait) +
      la frise débranchée `PHO·D` ; choisir la vidéo-débat deepfake (`PHO·1`).
- [ ] **SNT — finir les 4 séquences du 18/07** (T3-T6) : rédiger les séances en
      squelette, brancher les ressources définitives, lever les décisions 📌/⚖️/📅
      posées en encarts `chantier` dans chaque page. Détail : `chapitres.md`.
- [ ] **SNT — étape « Ranger pour retrouver » à ajouter dans t0** (données
      structurées en transversal, référentiel vivant — voir `CONSIGNES-sequence-SNT.md`
      §14.4).
- [ ] **SNT — trancher l'extraction d'un `gabarit-sequence-snt.html`** : conventions
      désormais confirmées par 8 séquences (décision de Loïc — `CONSIGNES-sequence-SNT.md` §13).
- [ ] 🆕 **BDD — jalon 4** : CLI Supabase sur Windows, `.bat` de sauvegarde et de
      réveil + tâches planifiées, puis `supabase init` / `db pull`.
- [ ] 🆕 **BDD — choisir la séquence pilote** (une séquence SNT, une étape, un champ de
      texte libre) pour le branchement de bout en bout.

---

## 🗄 Nouvelle partie (20/07) — Volet base de données

**Décision : la phase 2 des séquences SNT est ouverte.** La progression des élèves
quitte le `localStorage` pour une vraie base. Cadrage complet, modèle de données
et notions apprises : `_suivi/BDD-cadrage.md`.

| Pièce | État |
|---|---|
| Projet Supabase `pedagogie-vanhoorde`, région **West EU (Paris)**, plan gratuit | ✅ créé le 20/07 · ref `ztyvuiaohxekuyjeoaxz` |
| Sécurité à la création : Data API + expose new tables + **automatic RLS** | ✅ les trois activées |
| Intégration GitHub | ✅ **active** depuis le 20/07 — `supabase/migrations/` existe et l'historique est amorcé |
| `bdd/schema/001` à `005` — sept tables, contraintes, déclencheurs, vue | ✅ écrits et **exécutés** |
| Jalon 4 — CLI, sauvegardes, réveil, historique de migrations | ✅ fait le 20/07 · détail au §9 du cadrage |
| Règles RLS | ⬜ jalon 5 — **tables actuellement FERMÉES à tous, c'est voulu** |
| `assets/js/progression.js` (client partagé) | ⬜ jalon 6 |
| Pilote sur une séquence SNT | ⬜ jalon 7 — séquence à choisir |

**Conséquences déjà actées ailleurs** : `CONSIGNES-sequence-SNT.md` §5 (progression en
base, jeton seul en local ; `progression.js` autorisé comme second asset
partagé), §7 (phase 2 ouverte, coder contre le contrat de données, ordre de
branchement SNT → PC), §13 (encadré de mise à jour), §14.3 (codes d'activité au
tiret en base). Les chapitres de PC restent **hors périmètre** pour l'instant.

⚠ **Ne jamais committer un fichier de sauvegarde** (`*.sql` de dump, `*.dump`) :
il contiendrait des données d'élèves. Entrées ajoutées au `.gitignore` le 20/07.

**Ce qui tourne désormais tout seul** (scripts dans `bdd/outils/`, notice sur
place) : sauvegarde le mercredi 18 h vers `C:\Sauvegardes-SNT`, réveil quotidien
à 12 h 30. Les deux ont le rattrapage activé.

⚠ **Dépendance au PC de Loïc — à rappeler régulièrement.** Les deux tâches
planifiées et le futur worker de correction IA tournent sur son poste. Le
rattrapage sauve la sauvegarde, pas le réveil : si le PC reste éteint plus de
sept jours d'affilée (vacances), le projet Supabase est mis en pause. Données
intactes, relance d'un clic au tableau de bord, mais le site ne répond plus
entre-temps. Doublure GitHub Actions **écartée en connaissance de cause** le
20/07.

---

## 🚧 Nouvelle partie (19/07) — Séquence ES Terminale « frise & IA »

**Décision de Loïc : chantier ouvert d'un coup, architecture complète visée**
(pas de version dégradée) — frise participative + serveur de classe +
pré-correction IA locale. Détail des règles : `_modeles/CONSIGNES-sequence-ES.md`.

| Pièce | État |
|---|---|
| `pages/term-es-s01-frise.html` | ✅ fonctionnel en local (tirage 2→1, dépôt 2 sources + bannies, jetons, `?prof=1`, export CSV) |
| Page de niveau Term ES | ✅ lien séquence 1 activé (+ liste des chantiers) |
| `serveur-frise/` | 🚧 squelette Node natif : endpoints figés, garde-fou anti-note codé, auth enseignant à poser |
| `ia-correction/` | 🚧 prompt-cadre V1 + grille critères publiée + script Ollama (modèle à choisir : Qwen 3 candidat) avec garde-fous entrée/sortie |
| Cours 1 (histoire) / Cours 2 (IA) | 🚧 s'écrivent après S3/S5 |
| `pages/term-es-t2-c1-…` + `t2-c2-…` | ✅ ébauches complètes sur gabarit chapitre (texte fidèle aux PDF, images c1 posées, .a-faire sur QR/verrou/fiches) |
| Pack débat IA | grille .docx livrée hors dépôt ; plans de travail + cartes contraintes 🚧 |

**Rappels réglementaires actés** : AI Act annexe III applicable 02/08/2026 —
la pré-correction reste « tâche préparatoire » (art. 6(3)) : aucune note machine,
souveraineté de Loïc sur toute notation. RGPD : codes pseudonymes seuls sur
serveur, table code↔nom sur le PC de Loïc, purge fin d'année, DPD à prévenir
avant mise en service du serveur.

---

## Archive — note de reprise du 22/07/2026 (pré-correction IA SNT + affichage élève)

---

## Cadre de collaboration (inchangé)

- Répondre en français, une tâche à la fois, en réexpliquant le pourquoi niveau
  apprenti-éclairé. Sur le fond (grille, critères, ton des messages élèves, UX),
  **Loïc est souverain** ; l'IA est l'échafaudage.
- Livrer le code en **archives à extraire à la RACINE du dépôt** (chemins
  `ia-snt/…`, `pages/…`, etc.).
- **N'inventer rien : lire le vrai code avant de proposer.** Ne pas pousser de
  logistique de rentrée (rentrée à >1 mois, pas encore de classes/horaires).

---

## CHANTIER 1 — Outil IA de pré-correction des questions libres SNT (`ia-snt/`)

### Ce qui était déjà construit (rappel)
Worker local (`precorrection-snt.mjs`) : lit `reponses_libres` (Supabase, statut
`en_attente`, `correction_ia` NULL), délègue à `moteur.mjs`, écrit dans
`correction_ia`, ne touche JAMAIS au statut. Deux passes (le modèle juge chaque
critère ; le CODE calcule verdict + aide ; le modèle rédige le message élève).
Grille `criteres-snt.json` à deux étages (`socle` décide l'acceptation, `plus_loin`
= ambition, ne bloque jamais). Garde-fous : rejet de note, anti-injection,
validation de format. 100 % local, RGPD. Modèle via variable `IA_MODELE`.

### Matériel (mesuré cette session)
- **RTX 5080, 16 Go de VRAM.** Machine rapide → le goulot n'est jamais la vitesse,
  toujours le plafond 16 Go.
- **Mistral Small (24B) DÉBORDE** : `ollama ps` montre un split `5%/95% CPU/GPU`,
  d'où sa lenteur. Un modèle qui déborde fausse toute comparaison (Nemo « tout
  GPU » vs Small « moitié CPU »).
- Règle de conversion Q4 : ~0,6–0,7 Go/milliard. Tient large : 12–14B. Ne tient
  pas : 24–27B dense.

### Benchmark Small vs Nemo (ancienne grille)
- Small : 23/26 (88 %), 2 instables, injection 100 %, ortho 1/1.
- Nemo : 22/26 (85 %), 3 instables, injection 100 %, ortho 0/1.
- **Delta dans le bruit** (n=26, IC large). **Décision : rester sur Nemo**
  (léger, tient en VRAM, permet des `--repeat` élevés). Ne PAS passer à Small.

### Grille : édition ratée puis retour arrière
- Mon rework R1/C2 a **empiré** Nemo (3 → 11 divergences) + régression sur de
  bonnes copies C2. Causes : (a) un petit modèle **n'honore pas une clause
  d'exclusion** (« les paquets ne comptent pas pour R1 ») ; (b) un « bonus
  facultatif » ajouté à C2 a été lu comme une **exigence** → « partiellement »
  partout.
- **Retour à la grille d'origine** (`grille-origine.zip`). Le rework R1/C2 est
  **reporté à froid**. Leçon : sur petit modèle, **restructurer** (un critère =
  une seule chose à vérifier), pas reworder ; envisager d'**interdire
  « partiellement » sur les critères socle** (forcer binaire observé/non-observé).

### Tri de relecture — LIVRÉ et appliqué (`tri-relecture.zip`)
- Fonction `calculerTri(grille, …)` dans `moteur.mjs`, branchée dans les 3 sorties
  de `precorrigerUne` ; marqueur ⚠ dans le log du worker. Chaque
  `correction_ia.analyse` porte désormais `tri:{a_verifier, niveau, raisons}`.
- **Règle asymétrique** (coulant pour laisser passer, strict là où une copie en
  difficulté pourrait se cacher). Part en « ⚠ à vérifier » si : injection ·
  format KO · note rejetée · **un critère socle en « partiellement »** · ortho
  signalée. Net (socle clairement observé/non observé) → passe. Diagnostic ignore
  le socle.
- **Limite connue à ne pas oublier** : le tri n'attrape PAS un *« accepté »
  confiant mais faux* (ex. bug R1 « paquets → réseau », stable). Parades réelles :
  (1) corriger la grille à froid, (2) **sondage aléatoire** du bucket
  auto-validé.
- **Rectification importante** : l'**instabilité n'est PAS mesurée en prod** (le
  worker fait 1 passe/copie) ; c'est `evaluation.mjs --repeat` qui la mesure. Pour
  en faire un signal de tri, il faudrait faire tourner la passe 1 N fois dans le
  worker (double le temps) — cran optionnel.

### Arbitrage Loïc validé (côté enseignant)
« Net → passe sans vérification · doute → vérification · budget **≤ 1 copie sur 3**
à vérifier. » À mesurer sur de **VRAIES copies** (pas `copies-eval.json`, banc de
stress qui surestime le taux d'alerte). Si ça déborde : curseur = couper l'ortho
d'abord, puis ne garder qu'injection + format + socle indécis.

---

## CHANTIER 2 — Affichage du retour à l'élève, après correction (page t1)

### Terrain (lu cette session)
- Le **moteur focus/verdict est inline dans `pages/2nde-snt-t1-internet.html`**
  (~180 réf.), **pas** dans `progression.js`.
- `progression.js` s'expose sous le global **`Progression`** (`envoyerReponse`,
  `mesReponses`, `versions`…). Les réponses libres **partent en base** via
  `BASE.envoyerReponse` ; le `.verdict` du champ affiche déjà « ✅ enregistrée ».
- **Trou comblé** : `mesReponses()` n'était appelé **nulle part** → au
  rechargement, la réponse envoyée ET la correction étaient perdues.
- Pièges écartés : `.verdict` sert aussi aux **QCM** (ne pas écraser) ;
  `data-tri-verdict` = la **frise d'ordonnancement** (rien à voir avec nous).

### LIVRÉ (`t1-rehydratation.zip`) — que des ajouts, rien de modifié
- Fonction `rehydraterReponses()` dans le JS de la page : au chargement, si
  `Progression` dispo, balaie les `[data-focus-code]`, appelle `mesReponses()`,
  restaure l'écho + états (comme `validerFocus`) et remplit le `.verdict` via le
  helper `verdict()` existant. Ne duplique rien.
- CSS ajouté : `.verdict.amb` (à compléter, orange) · `.verdict.diag`
  (diagnostic, bleu) · styles internes (pastille, message, ligne IA, « pour aller
  plus loin »).
- Maquette de validation : `maquette-affichage-eleve.html` (à garder en référence).

### Décisions de fond validées
1. **Gating** : l'élève ne voit rien tant que `statut ≠ 'corrige'`. Le passage
   `en_attente → corrige` reste le geste de Loïc.
2. **L'élève ne lit que du validé.** Politique : **`commentaire_prof` PRIME** (s'il
   existe, l'élève ne lit que ça, sans texte IA ni ligne de transparence) ;
   sinon **message IA validé + ligne de transparence**. (Assouplissable en une
   ligne pour montrer les deux.)
3. **Ligne de transparence gardée et explicitée** : « préparé par une IA qui
   tourne seulement sur l'ordinateur de ton professeur — "locale" = ta réponse ne
   part pas sur Internet — puis relu et validé ».
4. **Couleurs** : accepté → `ok` (vert) · à compléter → `amb` (orange) ·
   diagnostic → `diag` (bleu) · en attente → `wait` (or).
5. **Hydratation réservée aux connectés** (invité → `mesReponses` [] → rien).
6. **« à compléter » ou copie ⚠ → forcément le clic de Loïc** (jamais de passage
   `corrige` en lot). Règle **côté enseignant**, à porter dans l'étape de
   validation (étape 5).

### Convention pour que ça s'étende tout seul
Une nouvelle question libre corrigée = `.field[data-focus-code="NET-XXX"]` + un
slot `.verdict` + une ligne `code_activite` en base + une entrée dans
`criteres-snt.json`. **Respect du patron = allumage automatique, zéro JS à
toucher.** C'est la seule règle de maintenance.

---

## Fils ouverts / prochains crans (par dépendance)

1. **`temperature: 0` + `seed` fixe** dans `moteur.mjs` (`appelOllama`, aujourd'hui
   0.2 en dur). **Préalable** à tout re-benchmark et au rework de grille : sans ça,
   on tune contre des dés. → me coller `moteur.mjs`.
2. **Rework grille R1/C2 à froid** : restructurer (un critère = une chose),
   envisager binaire sur le socle. Après le point 1.
3. **Comparer Gemma 4 / Qwen 3 vs Nemo** APRÈS le point 1, sur grille figée.
   Candidats qui tiennent en 16 Go : Gemma 4 (sortie JSON structurée native,
   pertinent pour la passe 1), Qwen 3 8B/14B. Pas le 24–27B dense.
4. **Instabilité comme signal de tri en prod** (optionnel) : passe 1 ×N dans le
   worker ; réutiliser la détection d'oscillation d'`evaluation.mjs`.
5. **Événement de connexion** dans `progression.js` (`seConnecter`) → rappeler
   `rehydraterReponses()` pour couvrir la connexion en cours de page. → touche
   `progression.js`.
6. **Bouton « réécrire » conditionnel** : NET-1a/1b sont marquées *définitives* ;
   décider quelles questions sont « rejouables » + confirmer que la base remet
   `correction_ia` à NULL. Décision de fond de Loïc.
7. **Étape 5** : validation enseignante + tableau de bord iPad (relève des
   `correction_ia`, filtre `tri.a_verifier`, passage `en_attente → corrige`).
   C'est là que vit la règle « ⚠ → forcément le clic ». Suppose le vrai rôle
   enseignant Supabase.
8. **Mesurer le taux de ⚠ sur de vraies copies** pour caler le ≤ 1/3.
9. **Nettoyage avant rentrée** : compte test `leproftest` + lignes de test.

---

## Archives produites cette session (à ranger dans le dépôt)

- **`grille-origine.zip`** — retour à la grille R1/C2 d'origine. **À extraire**
  pour repartir du meilleur point connu.
- **`tri-relecture.zip`** — `moteur.mjs` + `precorrection-snt.mjs` (le tri de
  relecture). **À extraire.**
- **`t1-rehydratation.zip`** — `pages/2nde-snt-t1-internet.html` (affichage élève).
  **À extraire.**
- **`maquette-affichage-eleve.html`** — maquette de validation (référence design).
- ⚠ **`grille-r1-c2.zip`** — mon édition ratée de la grille. **NE PAS extraire.**

---

*Fin de la note de reprise. Mettre à jour à chaque décision prise ou chantier avancé.*

---

## Archive — brief jalon 4 (base de données)

# Brief — Volet base de données, jalon 4

> À coller en début de nouvelle conversation. Écrit le 20/07/2026.

---

## Le message à coller

> **Volet base de données du site pédagogique — jalon 4.**
> Les jalons 1 à 3 sont faits : consignes réécrites, projet Supabase créé,
> schéma des sept tables écrit et exécuté. Le récapitulatif complet est dans
> le fichier `BDD-cadrage.md` que je te joins — lis-le d'abord.
>
> Ce que j'attends de cette session, dans l'ordre :
> 1. installer la **CLI Supabase** sur Windows (méthode la plus simple, je suis
>    débutant, pas d'éditeur de code exotique — VS Code + terminal intégré) ;
> 2. les deux scripts **`.bat`** : sauvegarde hebdomadaire (`supabase db dump`
>    vers un dossier local + une ligne insérée dans la table `sauvegardes`) et
>    réveil quotidien (contre la mise en pause après 7 jours d'inactivité) ;
> 3. la marche à suivre pour les deux **tâches planifiées Windows** ;
> 4. `supabase init` puis `supabase db pull`, pour initialiser l'historique de
>    migrations et donner enfin un sens à l'intégration GitHub déjà activée.
>
> Rappels de méthode : tout en français ; aucune décision silencieuse, tu
> proposes avant d'implémenter ; livraison en **archive delta** reproduisant
> l'arborescence, jamais le site complet ; tu poses le concept d'abord, le
> détail ensuite ; tu me challenges si je me trompe.

---

## Fichiers à joindre à la nouvelle conversation

**Obligatoire**

- `_suivi/BDD-cadrage.md` — architecture, décisions, modèle de données, notions
  apprises, coordonnées du projet. C'est le document pivot.

**Utile si la conversation touche au dépôt**

- `bdd/README.md` — la discipline des fichiers de schéma et l'avertissement sur
  `supabase/migrations/`.
- `.gitignore` — pour vérifier que les dumps sont bien exclus avant le premier
  `supabase db dump`.

**Pas nécessaire au jalon 4**

- Les fichiers `bdd/schema/*.sql` : leur contenu est résumé dans le cadrage.
  À joindre seulement en cas de problème d'exécution.
- L'archive complète du site : inutile ici, le jalon 4 ne touche à aucune page.
  Elle redeviendra utile au jalon 6 (client `progression.js`) et au jalon 7
  (branchement d'une séquence).

---

## Ce que la nouvelle session doit savoir sans avoir à demander

| | |
|---|---|
| Reference ID | `ztyvuiaohxekuyjeoaxz` |
| Project URL | `https://ztyvuiaohxekuyjeoaxz.supabase.co` |
| Région / plan | West EU (Paris) · Free |
| Intégration GitHub | activée, **sans effet** tant que `supabase/` n'existe pas |
| État des tables | 7 tables créées, RLS active, **aucune règle** — donc fermées à tous. C'est voulu, l'ouverture est le jalon 5 |
| Environnement | Windows, VS Code, Opera GX, dépôt poussé à la main depuis VS Code |
| Secrets | mot de passe de base et clé `service_role` dans un gestionnaire de mots de passe, **jamais** dans le dépôt ni dans une conversation |

## Décisions déjà prises — à ne pas rouvrir

- Supabase gratuit région Paris ; cible souveraine Clever Cloud en septembre.
- Identification par **compte identifiant + mot de passe** choisis par l'élève
  (virage du 22/07/2026, portabilité maison↔lycée ; l'identifiant fabrique une
  adresse interne `identifiant@snt.local`, jamais envoyée).
  Aucun email, aucun nom, aucun mot de passe en base.
- Code de classe générique par classe, fermé via `actif = false` après la
  deuxième séance, rouvert à la demande (option B).
- Codes d'activité au tiret en base (`WEB-2b`), point médian conservé à l'écran.
- Historique des rédactions **conservé** : archivage automatique par déclencheur
  dans `reponses_versions`. Bouton « voir mes versions » prévu, non implémenté.
- Schéma dans `bdd/schema/`, exécuté à la main, **pas** dans
  `supabase/migrations/` avant que `supabase db pull` ait initialisé
  l'historique.
- Chapitres de physique-chimie **hors périmètre** pour l'instant (leur
  `localStorage` reste en place) ; migration après le pilote SNT.

## Questions encore ouvertes

- Quelle séquence SNT sert de pilote (une étape, un champ de texte libre) ?
- Le dossier de destination des sauvegardes sur le PC de Loïc, et la copie
  externe (disque, clé, cloud ?).
- Rythme du worker de correction (à la demande ? toutes les N minutes ?).
