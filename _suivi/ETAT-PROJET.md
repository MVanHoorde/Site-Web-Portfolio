# État du projet — Site pédagogique Physique-Chimie & SNT

> Dernière mise à jour : 18/07/2026 · tenu à jour par Loïc + Claude
> Site : https://mvanhoorde.github.io/Site-Web-Portfolio/ · Repo : MVanHoorde/Site-Web-Portfolio

Vue d'ensemble. Détail par chapitre dans `chapitres.md` ; idées dans `IDEES.md`.
Contexte et règles de collaboration : `CLAUDE.md` à la racine. Consignes de
production, un fichier par gabarit : `_modeles/CONSIGNES-chapitre-PC.md` et
`_modeles/CONSIGNES-hub-SNT.md`.

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

## ⚠ Alertes

- 🆕 **SNT — règle du référentiel vivant (17/07).** La séquence d'introduction
  (`pages/2nde-snt-t0-systemes-informatises.html`) = cours « Systèmes
  informatisés » **entrelacé** avec le tutoriel du dispositif. **Toute nouvelle
  idée de fonctionnement du cours s'y présente explicitement en premier** ; les
  autres séquences n'en portent que des rappels discrets (pied de page). Voir
  `CONSIGNES-hub-SNT.md` §8 — et y revenir sans cesse.
- ✅ **Vestige RGPD corrigé (17/07)** : la page orpheline `2nde-snt.html` à la
  **racine** (doublon obsolète, chargeait encore Google Fonts, liens `#`) est
  remplacée par une redirection propre vers `pages/2nde-snt.html`. Option plus
  radicale possible : `git rm` (décision Loïc).
- 🆕 **SNT — le hub « Le Web » est en ligne (17/07)** : `pages/2nde-snt-t2-le-web.html`,
  lié depuis la carte SNT 2 de `pages/2nde-snt.html`. **Maquette V0, non validée.**
  C'est un **second gabarit**, distinct des chapitres de PC (séquence → séance →
  étape → champ ; pas de `localStorage` ; CSS inline) — voir
  `_modeles/CONSIGNES-hub-SNT.md`.
- 🔴 **RÈGLE — aucune police depuis un CDN.** La maquette du hub chargeait Space
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

- 🆕 **SNT — hub « Photographie numérique » S1 en ligne (18/07)** :
  `pages/2nde-snt-t7-photographie-numerique.html`, lié depuis la carte SNT 7.
  **Maquette V0, non validée** — S1 complète et testée (Playwright), S2-S5 en
  squelettes 🚧 verrouillés. Découpage 5 séances + frise débranchée arbitré par
  Loïc le 18/07. Détail, arbitrages et restes à faire : `_suivi/chapitres.md`
  (section SNT-T7). Deux erreurs de la source corrigées au passage dans le
  contenu à venir (canal alpha ≠ « saturation » ; formats d'images datés).

- 🆕 **SNT — chantier des 4 thèmes lancé (18/07)** : hubs **Réseaux sociaux**
  (`t3`, `SOC·x`), **Données structurées** (`t4`, `DAT·x`, court 2 séances),
  **Localisation & cartographie** (`t5`, `LOC·x`) et **Informatique embarquée**
  (`t6`, `EMB·x`) créés en **V0 partielle** (S1 rédigées, suite en squelettes
  🚧), liés depuis `pages/2nde-snt.html`. Arbitrages de périmètre et nouvelles
  règles de production (intégrer plutôt que renvoyer, notes de chantier dans la
  page, plateformes fictives) consignés dans `CONSIGNES-hub-SNT.md` §14. Détail
  par hub : `chapitres.md`. **Décisions 📌/⚖️/📅 en attente** signalées par des
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

**Nouveau (17-18/07).** Gabarit « hub élève », distinct des chapitres de PC.
Les 7 thèmes sont listés sur `pages/2nde-snt.html` ; **8 hubs existent** (t0 à
t7), tous liés depuis la page de niveau. Détail par hub et restes à faire :
section « Seconde — SNT » de `chapitres.md`.

| Thème | Hub en ligne | Validé | Ressources définitives |
|---|---|---|---|
| SNT 0 · Introduction 🧭 | ✅ V0 (2 séances + débranchée) | ⬜ non | ⬜ `SYS·1`, `SYS·D` à brancher |
| SNT 1 · Internet | ✅ V0 (4 séances + débranchée) | ⬜ non | ⬜ `NET·2b`, `NET·D`, liens `NET·3/4` à tester |
| SNT 2 · Le Web | ✅ V0 (4 séances + frise) | ⬜ non | ⬜ activités cahier + frise à brancher |
| SNT 3 · Réseaux sociaux | 🔄 V0 partiel (S1 OK, S2 aux ⅔, S4 enquête codée ; S3 + fin S4 🚧) | ⬜ non | ⬜ `SOC·P`, `SOC·D`, biblio Skyblog-BnF |
| SNT 4 · Données structurées | 🔄 V0 partiel (S1 Titanic OK ; S2 🚧) — hub court 2 séances | ⬜ non | ⬜ `DAT·1`, `DAT·1b`, `DAT·D`, biblio Légifrance |
| SNT 5 · Localisation & cartographie | 🔄 V0 partiel (S1-S2 OK ; S3-S4 🚧) | ⬜ non | ⬜ `LOC·1`, `LOC·2b`, `LOC·D`, biblios |
| SNT 6 · Informatique embarquée | 🔄 V0 partiel (S1 OK ; S2-S4 🚧) — 4 séances provisoire | ⬜ non | ⬜ `EMB·D`, biblios Moreno/IoT |
| SNT 7 · Photographie numérique | ✅ V0 (S1 complète + S2-S5 🚧 + débranchée cadrée) | ⬜ non | ⬜ `PHO·1`, `PHO·D` à brancher |

> Phase 1 (rentrée) : HTML statique autonome, correction locale réelle, texte
> libre **simulé**. Phase 2 (plus tard) : VPS + base de données + correction IA
> + comptes élèves. Ne pas mélanger les deux — voir
> `_modeles/CONSIGNES-hub-SNT.md` §7.

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
- [ ] **SNT — finir les 4 hubs du 18/07** (T3-T6) : rédiger les séances en
      squelette, brancher les ressources définitives, lever les décisions 📌/⚖️/📅
      posées en encarts `chantier` dans chaque page. Détail : `chapitres.md`.
- [ ] **SNT — étape « Ranger pour retrouver » à ajouter dans t0** (données
      structurées en transversal, référentiel vivant — voir `CONSIGNES-hub-SNT.md`
      §14.4).
- [ ] **SNT — trancher l'extraction d'un `gabarit-hub-snt.html`** : conventions
      désormais confirmées par 8 hubs (décision de Loïc — `CONSIGNES-hub-SNT.md` §13).
