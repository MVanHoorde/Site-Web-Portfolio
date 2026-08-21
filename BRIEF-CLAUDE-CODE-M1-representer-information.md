# BRIEF — Module transversal M1 « Représenter l'information »

**Destinataire :** Claude Code, dans le dépôt `MVanHoorde/Site-Web-Portfolio` ouvert dans VS Code.
**Rédigé le :** 21/08/2026 · **Auteur du cadrage :** Loïc (arbitrages) + Claude (structure).
**Statut de tout contenu pédagogique ci-dessous :** proposition V1. Loïc reste souverain sur le fond, le ton et le barème. Ne rien inventer au-delà de ce brief : signaler et demander.

---

## 0. Périmètre — lire en premier

### Ce qu'il faut produire

Une **nouvelle page de séquence** SNT, portée d'emblée sur le moteur partagé, contenant **deux séances** et **deux ateliers d'exercices à liste fixe**, plus les **quatre points d'intégration** décrits au §4.

### Ce qu'il ne faut surtout PAS produire

- ❌ **Aucune migration de base de données.** Pas de `012`. Le module n'utilise que des mécanismes déjà en base.
- ❌ **Aucun nouveau type de champ.** Les ateliers sont des `data-cloze` classiques, exactement comme l'étape 5.1 de `t1`. Ne pas inventer de composant « exercice ».
- ❌ **Aucun générateur aléatoire, aucun tirage, aucune graine, aucun score chiffré.** Décision explicite de Loïc du 21/08 : listes **fixes, identiques pour tous les élèves**, pour qu'ils puissent s'entraider et que les résultats soient comparables. La version « entraînement illimité » est reportée dans `_suivi/IDEES.md`.
- ❌ **Aucune logique de note ou de seuil.** L'évaluation se fait sur un autre support, hors du site.
- ❌ Ne pas toucher aux six séquences non migrées, ni aux étapes 5.4/5.6 de `t1`, ni à la séance Filius. Hors périmètre de ce brief.

### Contrainte de contexte

Loïc veut **boucler un fonctionnement complet jusqu'à la fin du thème 2** avant la rentrée. Ce module est un ajout à ce périmètre. Rester strictement dans la commande, ne pas élargir.

---

## 1. Fichiers à lire avant d'écrire une ligne

Obligatoire, dans cet ordre :

| Fichier | Pourquoi |
|---|---|
| `_modeles/CONSIGNES-sequence-SNT.md` | La grammaire complète. §3 (trajet d'étape), §5 (règles techniques), §10 (validation), §11 (livraison), §15 (mécanismes transverses). |
| `pages/2nde-snt-t1-internet.html` | **La référence structurelle.** Seule page (avec t2) déjà sur le moteur partagé. Copier son entête, son marquage, sa navigation. Lire en particulier l'étape **5.1** : c'est le modèle exact du `data-cloze` à réutiliser pour les ateliers. |
| `assets/js/sequence-snt.js` · `assets/css/sequence-snt.css` | Le moteur. À **ne pas modifier** sauf nécessité démontrée — et alors le signaler, pas le faire en silence. |
| `verifier.mjs` | Sa checklist doit passer. Voir §4.1 : il faut l'étendre. |
| `generer-seances.mjs` | Doit connaître le nouveau module. Voir §4.2. |
| `pages/2nde-snt.html` | Le hub, où poser la carte. Voir §4.3. |
| `_suivi/DECISIONS.md` | Y consigner les décisions du §2. |

**Règle absolue du projet :** lire le vrai code avant de proposer. Ne jamais partir d'une hypothèse sur ce que contient un fichier.

---

## 2. Décisions déjà validées par Loïc (ne pas rouvrir)

| # | Décision | Date |
|---|---|---|
| D1 | Le binaire devient une **séquence autonome**, pas une annexe. Filius, lui, devient une **séance du thème 1** — hors de ce brief. | 21/08 |
| D2 | Titre du module : **« Représenter l'information »** (et non « Le binaire »), pour qu'on puisse y raccorder d'autres ateliers plus tard sans refonte. | 21/08 |
| D3 | **Aucun verrouillage inter-séquences.** C'est la progression annuelle de Loïc qui garantit que le binaire précède l'étape 5.1 de `t1`, pas le site. Ne coder aucune dépendance entre pages. | 21/08 |
| D4 | Le socle traite les conversions **dans les deux sens** — « historiquement dans l'équipe ». Donc décimal→binaire **et** binaire→décimal en séance 1. | 21/08 |
| D5 | Découpage en **deux séances**, chacune se terminant par son atelier. | 21/08 |
| D6 | Le **RVB est traité en entier dans `t7`** (photographie). Ici, ce n'est **qu'une ouverture** de quelques minutes : semer « 256 niveaux par canal » pour que la notion soit déjà en tête en fin d'année. La répétition est **voulue** et ne contrevient pas à la règle « un seul traitement complet par notion » (CONSIGNES §14.1) — le noter explicitement dans `DECISIONS.md` pour que la règle ne soit pas invoquée contre ce choix plus tard. | 21/08 |
| D7 | Le **masque de sous-réseau** n'entre pas ici. Il ira en bonus repliable dans la future séance Filius de `t1`. **Ne pas l'étiqueter « pont NSI »** : vérification faite sur les annexes du BO, il est absent du programme de SNT, de NSI première **et** de NSI terminale. C'est une note de compréhension, rien de plus. | 21/08 |
| D8 | **Pas d'estimation horaire figée** dans les attributs `seance-time`. Loïc n'a pas encore fait tourner le module devant une classe et le temps dépendra du travail donné à la maison. Mettre `≈ 1 h` à titre indicatif et le signaler comme provisoire dans le chantier de la page. | 21/08 |

---

## 3. Identité du module

| Élément | Valeur |
|---|---|
| Fichier | `pages/2nde-snt-m1-representer-information.html` |
| Clé de séquence | `snt-m1` → `<body data-sequence="snt-m1">` |
| Clé de carte au hub | `data-cle="snt-m1"` |
| Code d'activité | **`REP·x`** — mêmes conventions que `NET·x` / `WEB·x`. En base de données : `REP-x` avec un **tiret** (CONSIGNES §14.3, le point médian est fragile hors du texte). ⚠️ **Préfixe à faire confirmer par Loïc** avant de le figer partout. |
| Titre affiché | Représenter l'information |
| Sous-titre / `tag` | binaire · octet · ordres de grandeur |

⚠️ **Le préfixe `m` (module) au lieu de `t` (thème) est délibéré** : ce n'est pas un thème du programme SNT. Il a des conséquences techniques réelles — voir le §4 immédiatement.

---

## 4. Points d'intégration structurels — LE PIÈGE PRINCIPAL

Le dépôt est plein de listes en dur qui énumèrent les huit thèmes. Un module nommé `m1` **passe à travers toutes**. C'est le point le plus dangereux de ce brief : la page fonctionnera parfaitement tout en échappant silencieusement aux contrôles RGPD.

### 4.1 `verifier.mjs` — le filtre qui laisse tout passer

Ligne 40 :

```js
const pagesSNT = html.filter((f) => /pages\/2nde-snt-t\d/.test(f));
```

`2nde-snt-m1-…` **ne matche pas**. Conséquence : la page échapperait au contrôle `localStorage` (§2 du vérificateur) et à tous les contrôles qui suivent sur `pagesSNT`. Le contrôle CDN, lui, porte sur `html` entier : celui-là passe.

**À faire :** élargir le filtre.

```js
const pagesSNT = html.filter((f) => /pages\/2nde-snt-(t\d|m\d)/.test(f));
```

Puis **relire tout `verifier.mjs`** à la recherche d'autres occurrences de `snt-t` ou d'énumérations des huit thèmes, et les traiter de la même façon. Ligne ~230, le tableau des clés est à compléter (voir 4.2).

**🔴 Contrainte non négociable :** `node verifier.mjs` doit sortir **exactement 2 problèmes connus** (fichiers manquants connus). Tout écart est bloquant. Si le compte change après l'ajout du module, s'arrêter et rendre compte — ne pas « corriger » le vérificateur pour faire revenir le chiffre.

### 4.2 `generer-seances.mjs` et `assets/js/seances-snt.js`

Le tableau `THEMES` (ligne 38) énumère les huit pages. Ajouter :

```js
['snt-m1', '2nde-snt-m1-representer-information.html']
```

Le même tableau est **dupliqué dans `verifier.mjs`** vers la ligne 230 pour le contrôle de fraîcheur. Les deux doivent rester alignés. Puis relancer :

```
node generer-seances.mjs
```

et vérifier que `verifier.mjs` annonce bien `assets/js/seances-snt.js — à jour`.

### 4.3 Le hub `pages/2nde-snt.html`

Structure actuelle : des `<h2 class="hub-famille">` regroupant des `<article class="theme-carte" data-cle="snt-tN">`. Familles existantes : *Pour commencer* · *Réseaux et communication* · *Données et information* · *Objets numériques*.

**À faire :** créer une famille **« Outils transversaux »**, placée **après « Pour commencer »**, et y poser la carte `snt-m1`. Ne pas la ranger dans « Données et information » : ce n'est pas un thème du programme et le mélanger avec eux brouillerait la lecture.

⚠️ Le lien s'écrit `href="2nde-snt-m1-representer-information.html"` — **jamais** `href="pages/…"`, la page de niveau est elle-même dans `pages/` (CONSIGNES §9.4, erreur déjà commise). Vérifier par `grep` sur la forme du lien de `t1`.

### 4.4 Versionnage des assets

État actuel : `sequence-snt.css?v=32` et `sequence-snt.js?v=32`, sur `t1` et `t2`. La nouvelle page charge **les mêmes versions**. Si le CSS ou le JS partagé doit changer (à éviter), incrémenter **les deux ensemble et sur toutes les pages**, hub compris — `verifier.mjs` le contrôle.

L'entête à recopier depuis `t1`, à l'identique :

```html
<link rel="stylesheet" href="../assets/css/fonts.css">
<script src="../assets/js/progression.js?v=15"></script>
<script src="../assets/js/seances-snt.js?v=13"></script>
<script src="../assets/js/verrou-snt.js?v=2"></script>
<link rel="stylesheet" href="../assets/css/sequence-snt.css?v=32">
```

et en fin de body : `<script src="../assets/js/sequence-snt.js?v=32"></script>`.

Vérifier ces numéros dans `t1` au moment d'écrire — ils ont pu bouger.

### 4.5 Décision ouverte à ne pas trancher seul

Le dépôt a un **chantier ouvert** sur l'ajout de `data-cle` explicites sur les étapes, pour éviter la perte de données si les étapes sont réordonnées. Ce module crée **9 nouvelles étapes**. Si la décision a été prise entre-temps, l'appliquer ici dès l'écriture — c'est le bon moment, aucune donnée élève n'existe encore sur cette page. **Sinon, demander à Loïc avant de coder les étapes.**

---

## 5. Séance 1 — « Compter comme une machine »

Cinq étapes. Trajet d'étape standard (objectif 🎯 → doc/activité → vérification → « à retenir » **en dernier**, révélé automatiquement).

### 1.1 — Pourquoi seulement deux chiffres ? ★★

**Objectif :** comprendre que le binaire n'est pas un caprice d'informaticien mais une conséquence physique.

Doc court : un transistor est un interrupteur ; il laisse passer le courant ou non. Deux états fiables, pas dix. Un circuit qui devrait distinguer dix niveaux de tension se tromperait sans arrêt. **Le mot *bit* est la contraction de *binary digit*.**

Ouvrir sur : nous comptons en base 10 parce que nous avons dix doigts — ce n'est pas plus « naturel » que la base 2.

⚠️ **Ne pas reprendre « la base 5 utilisée par les Incas »** du TD source : c'est faux, voir §8.1.

Champ : QCM 3 questions (`REP·Q1`).

### 1.2 — Lire un nombre binaire ★

**Objectif :** convertir binaire → décimal avec le tableau des poids.

Doc : le tableau `128 64 32 16 8 4 2 1`, présenté comme une rangée de cases à cocher. Sous chaque 1, on prend le poids ; on additionne. Réutiliser **l'exemple `10011011 = 155`** de la marge du cours « Adresses IP » de Loïc — les élèves le reverront dans `t1`.

Illustration : **SVG inline**, tableau des poids interactif — l'élève clique sur les bits, le total se met à jour en direct. Pas d'image matricielle.

Champ : `data-cloze` de 3 items d'échauffement (pas l'atelier, qui vient en 1.5).

### 1.3 — Écrire un nombre en binaire ★

**Objectif :** convertir décimal → binaire, par **deux méthodes présentées côte à côte**.

**Méthode A — la soustraction descendante.** On part du plus grand poids qui tient dans le nombre, on soustrait, on continue. Rapide, mentale, suffisante pour un octet.

**Méthode B — les divisions successives « en potence ».** La méthode de la correction manuscrite de Loïc, celle qu'il tient à conserver : escalier de divisions par 2, restes encadrés, remontée par flèches, lecture du résultat de bas en haut. Spécification complète au §7.

Dire clairement à l'élève que **les deux donnent le même résultat** et qu'il utilisera celle qui lui parle. Aucune n'est imposée à l'examen — c'est un outil, pas un rituel.

Champ : `data-cloze` de 2 items, un par méthode, sur le même nombre.

### 1.4 — L'octet, et le piège du 255 ★★

**Objectif :** 8 bits → 256 combinaisons → valeurs de 0 à 255.

Le point dur, et il faut y insister : **256 combinaisons mais 255 comme valeur maximale**, parce qu'on compte à partir de zéro. C'est exactement l'erreur que l'étape 5.1 de `t1` fait travailler (« Attention au piège : on compte à partir de zéro »). Cohérence à préserver.

Mentionner que *byte* est le mot anglais pour octet — les élèves le croiseront partout.

Champ : QCM 4 questions (`REP·Q2`).

### 1.5 — Atelier 1 : les conversions ★ (étape `data-gate`)

Voir le contenu exact au §9.1. Un seul `data-cloze` de 12 items, bouton *Vérifier*, verdict. **Liste fixe.**

---

## 6. Séance 2 — « Mesurer l'information »

Quatre étapes.

### 2.1 — De l'octet au téraoctet ★

**Objectif :** connaître les préfixes et savoir passer de l'un à l'autre.

Tableau ko / Mo / Go / To avec les puissances de 10. Reprendre la structure du tableau du TD source, en **le corrigeant** : voir §8.9 sur la colonne « correspondance binaire ».

### 2.2 — Pourquoi ton disque de 500 Go n'en fait que 465 ★★

**Objectif :** comprendre le décalage 1000 / 1024.

C'est l'étape la plus intéressante de la séance parce qu'elle part d'une expérience réelle des élèves. 2¹⁰ = 1024, pas 1000. Le fabricant compte en puissances de 10, le système d'exploitation en puissances de 2, l'écart se creuse à chaque préfixe. Introduire les vrais noms normalisés — **kio, Mio, Gio** (CEI 80000-13) — sans en faire un objet de mémorisation.

Champ : QCM 3 questions (`REP·Q3`).

### 2.3 — Ouverture : et les couleurs ? ○ *(support, non évalué)*

**Objectif : semer, pas enseigner.** Quelques minutes, pas davantage. Voir la décision D6.

Un pixel se code par trois nombres — rouge, vert, bleu — chacun sur **un octet**, donc de 0 à 255. Trois octets par pixel, 256³ ≈ 16,7 millions de couleurs. Un petit nuancier SVG interactif où l'élève bouge trois curseurs de 0 à 255 suffit largement.

⚠️ **Ne pas expliquer la profondeur de couleur, ni les photosites, ni le codage hexadécimal `#FF0000`.** Tout cela appartient à `t7`, séance 2. Le bloc doit se terminer par une phrase du type : « on y reviendra en détail avec la photographie numérique ». Marquer le bloc `○ support` sur l'échelle d'évaluabilité (CONSIGNES §15.1).

### 2.4 — Atelier 2 : les grandeurs ★ (étape `data-gate`)

Voir le contenu exact au §9.2.

---

## 7. La potence en SVG — spécification

**Références visuelles présentes dans le dépôt :**

```
_modeles/reference-m1/potence-90.png
_modeles/reference-m1/potence-434.png
```

Ce sont les divisions successives manuscrites de Loïc, extraites de sa correction. **Les ouvrir et les regarder avant d'écrire le SVG** : c'est le geste exact à reproduire, et Loïc y tient. **Ne pas les intégrer dans la page** — ce sont des documents de travail, pas des illustrations. La potence doit être un SVG inline.

⚠️ **En fin de tâche, proposer leur suppression** une fois le SVG produit et validé : elles n'ont plus d'utilité et le dépôt est public. Proposer, ne pas supprimer d'office.

Ce qu'il faut conserver du modèle manuscrit, dans l'ordre :

1. **L'escalier** : chaque division engendre un nouveau bloc en bas à droite du précédent. C'est cette descente en diagonale qui rend la méthode lisible.
2. **Le dividende, le diviseur 2 à droite du trait vertical, le quotient en dessous.**
3. **Les restes encadrés**, en couleur d'accent, alignés à gauche de chaque bloc.
4. **Les flèches de remontée** qui relient les restes du dernier au premier — c'est elles qui disent le sens de lecture.
5. **Le résultat en bas**, `90₁₀ = 1011010₂`.

Contraintes techniques :

- **SVG inline**, aucune image matricielle, aucune police externe.
- **Toutes les couleurs via les variables CSS** existantes (`--link`, `--ok`, `--activity`…). Aucune couleur en dur hors du bloc `:root` — `verifier.mjs` le contrôle.
- **Animation pas à pas** : un bouton *Étape suivante* fait apparaître une division à la fois, puis la remontée. Respecter `prefers-reduced-motion` : sans animation, tout s'affiche d'un coup, dans le même ordre logique.
- **Cible iPad et téléphone** : `viewBox` avec `preserveAspectRatio`, cibles tactiles ≥ 44 px, lisible à 390 px de large. Sur mobile, l'escalier peut se replier verticalement plutôt que de sortir de l'écran.
- Le SVG doit être **réutilisable avec un autre nombre** : structure paramétrée, pas 90 codé en dur dans le balisage.

---

## 8. Corrections à appliquer aux documents source

Les PDF de Loïc contiennent des erreurs et des données périmées. **Ne pas les recopier.** Chacune ci-dessous est à corriger ; en cas de doute, signaler plutôt que trancher.

| # | Dans le document source | Correction |
|---|---|---|
| 8.1 | « la base 5 utilisée par les Incas » | **Faux.** Les quipus incas sont un système **décimal**. Si un exemple de base non décimale est souhaité : la base 60 babylonienne, dont nos heures et nos minutes descendent directement. |
| 8.2 | « IPv6 standardisé en 2017 » | Ambigu. IPv6 est **spécifié en 1998** (RFC 2460) ; la RFC 8200 de **juillet 2017** en fait un *Internet Standard*. Écrire les deux dates ou n'en garder aucune. |
| 8.3 | « IPv6 n'est encore que très peu utilisé » | **Périmé.** Le taux d'adoption a fortement progressé. ⚠️ **Chercher une mesure récente et sourcée** (statistiques IPv6 de Google, APNIC) au moment de la rédaction, ou supprimer l'affirmation. Ne pas inventer de chiffre. |
| 8.4 | « débit jusqu'à 100 Mbit/s » (Ethernet), « jusqu'à 1000 Mbit/s » (fibre) | **Périmé.** Le gigabit est le standard courant sur cuivre ; les offres fibre grand public le dépassent largement. Vérifier avant d'écrire un chiffre. |
| 8.5 | « Internet est apparu dans les années 80 » | **Contredit la séance 1 de `t1`**, qui traite ARPANET (1970) et CYCLADES (1971) avec Pouzin. Le BO lui-même situe la naissance d'Internet en 1983. Aligner sur `t1`. |
| 8.6 | « câbles Ethernet constitués de 8 fils torsadés par paire » | Formulation confuse. Ce sont **4 paires torsadées, soit 8 fils**. |
| 8.7 | « tous les réseaux domestiques ont des adresses de la forme 192.168.xxx.0 » | **Faux.** `10.0.0.0/8` et `172.16.0.0/12` sont aussi des plages privées, et beaucoup de box utilisent `192.168.0.x`. Écrire « souvent », pas « tous ». |
| 8.8 | « l'adresse .1 est réservée à la passerelle » | C'est une **convention très répandue**, pas une règle. Le dire. |
| 8.9 | Colonne « correspondance binaire (puissance de 2 la plus proche) » du tableau des multiples | Trompeur : ces valeurs ne sont pas des approximations du kilo-octet, ce sont les **préfixes binaires normalisés** kio/Mio/Gio/Tio (CEI 80000-13). Renommer la colonne. |
| 8.10 | « le protocole TCP/IP » | **Terminologie figée du projet** : on écrit toujours « **le modèle TCP/IP** ». Vérifier chaque occurrence. |

**Images des PDF :** plusieurs figures (frise des supports de stockage, table hexadécimale, schéma IPv6 avec la mention anglaise *« Zeroes can be omitted »*) sont manifestement d'origine externe, sans licence identifiée. **Ne pas les réutiliser.** Refaire en SVG, ou s'en passer.

---

## 9. Contenu exact des ateliers

*Proposition V1 — à valider par Loïc avant intégration. Les nombres sont choisis pour préparer `t1` : `172`, `168`, `226`, `254` sont les octets des adresses `192.168.1.226` et `172.16.254.1` qui apparaissent dans l'étape 5.1 et dans le cours « Adresses IP ». `90` et `434` viennent du TD de Loïc, dont il possède déjà les corrections manuscrites.*

Vérifier chaque réponse par le calcul avant de l'écrire dans le HTML.

### 9.1 Atelier 1 — les conversions (`REP·A1`)

**A. Binaire → décimal**

| Item | Réponse |
|---|---|
| `1011` | 11 |
| `10011` | 19 |
| `1110101` | 117 |
| `10101100` | 172 |
| `11111111` | 255 |

**B. Décimal → binaire**

| Item | Réponse |
|---|---|
| 90 | `1011010` |
| 168 | `10101000` |
| 226 | `11100010` |
| 254 | `11111110` |
| 434 | `110110010` |

**C. Raisonnement**

| Item | Réponse |
|---|---|
| Combien de bits au minimum pour écrire 200 en binaire ? | 8 |
| Parmi `100000000`, `11111111`, `101`, `1111111111` — laquelle **ne tient pas** dans un octet ? | `100000000` et `1111111111` (9 et 10 bits) |

**Tolérance de saisie** (`data-variantes`) : accepter les zéros de tête (`01011010` pour 90), les espaces de groupement (`1011 0010`), et pour les réponses décimales les espaces fine ou insécable. Réutiliser le mécanisme de trous tolérants du moteur (CONSIGNES §15.6) — ne pas réécrire de comparateur.

**Indices** : deux niveaux par item, conformément à la règle du projet — **l'indice de niveau 1 ne contient jamais la réponse** ; le niveau 2 est le filet de secours. Contrôlé par `verifier.mjs` §6 bis.

### 9.2 Atelier 2 — les grandeurs (`REP·A2`)

| Item | Réponse |
|---|---|
| 1 Mo = combien de ko ? | 1000 |
| 1 Go = combien de Mo ? | 1000 |
| 1 To = combien de Go ? | 1000 |
| 2¹⁰ vaut… | 1024 |
| Combien de photos de 4 Mo tiennent dans une carte de 64 Go ? | 16 000 |
| Un octet, c'est combien de bits ? | 8 |
| Combien de valeurs différentes dans un octet ? | 256 |
| Quelle est la plus grande valeur d'un octet ? | 255 |
| Pourquoi 255 et pas 256 ? *(QCM, pas un trou)* | parce qu'on compte à partir de 0 |

---

## 10. Validation avant livraison

Reprendre intégralement la checklist du §10 des CONSIGNES, plus les points propres à ce module :

```text
□ node --check sur le JS extrait de la page
□ node verifier.mjs → EXACTEMENT 2 problèmes connus (bloquant si écart)
□ node generer-seances.mjs → puis verifier.mjs annonce « seances-snt.js à jour »
□ grep : aucun googleapis / cdn / unpkg / jsdelivr
□ grep : aucun localStorage / sessionStorage
□ grep : aucune couleur en dur hors du bloc :root
□ grep : le lien du hub s'écrit bien href="2nde-snt-m1-…" (pas pages/…)
□ le filtre pagesSNT de verifier.mjs couvre bien la nouvelle page (le tester :
  y introduire volontairement un localStorage, vérifier qu'il est détecté,
  puis le retirer)
□ Playwright, sur la machine de Loïc (Chromium non installable en session Claude) :
  □ chargement sans erreur JS
  □ séance 2 verrouillée à l'arrivée → valider les data-gate de la séance 1
    → séance 2 débloquée
  □ mode enseignant : déverrouille tout, rétablit à l'extinction
  □ les deux ateliers : bonne réponse, mauvaise réponse, indices niveau 1 et 2
  □ réhydratation : recharger la page, les réponses sont toujours là
  □ potence SVG : animation pas à pas, puis avec prefers-reduced-motion
  □ « Télécharger ma fiche » contient les réponses des ateliers
  □ captures 1280 / 820 / 390 px
□ Contrôle visuel des captures AVANT livraison
```

**Tester sur l'état calculé** (`getComputedStyle` sur la vraie page), jamais sur le texte des règles CSS. Le projet a déjà connu 169 contrôles au vert avec 4 bugs réels en place.

---

## 11. Livraison attendue

1. **Archive delta** à la racine du dépôt, arborescence reproduite, **uniquement** les fichiers créés ou modifiés :
   - `pages/2nde-snt-m1-representer-information.html` *(créé)*
   - `pages/2nde-snt.html` *(carte + famille)*
   - `verifier.mjs` *(filtre + tableau des clés)*
   - `generer-seances.mjs` *(tableau THEMES)*
   - `assets/js/seances-snt.js` *(régénéré)*
   - `_suivi/DECISIONS.md`, `_suivi/ETAT-PROJET.md`, `_suivi/JOURNAL.md`, `_suivi/chapitres.md`, `_suivi/IDEES.md` *(mis à jour)*
2. Un fichier **`A-LIRE.md`** dans l'archive.
3. Le **`git diff --stat`**.
4. Les captures d'écran aux trois largeurs.
5. **Récapitulatif final** : décisions prises, décisions laissées ouvertes, liens encore inertes (`href="#"`), sources à confirmer (§8.3 et §8.4 en particulier).

**Jalons à porter dans `_suivi/chapitres.md`**, section Seconde — SNT, nouvelle entrée `snt-m1` : maquette V0 · contenu complet · interactivité complète · ressources définitives · VALIDÉ.

---

## 12. À ne pas décider seul — remonter à Loïc

- Le **préfixe de code d'activité** `REP·x` (§3).
- Les `data-cle` explicites sur les 9 étapes (§4.5).
- **Tout contenu pédagogique** des §5, §6 et §9 : ce sont des propositions V1. Loïc valide avant intégration définitive.
- Les **chiffres à rafraîchir** des §8.3 et §8.4 : chercher une source récente, et si le doute persiste, supprimer l'affirmation plutôt que d'écrire une donnée fragile.

Les chantiers ouverts se documentent **dans la page**, en `<aside class="chantier">`, pas en accumulation de marqueurs inline. Ne pas interrompre l'implémentation pour poser une question, sauf si la décision est réellement bloquante.
