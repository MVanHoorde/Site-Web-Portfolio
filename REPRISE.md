# REPRISE — à lire en premier

> **Ce fichier est le point d'entrée de toute nouvelle conversation sur le
> projet SNT.** Il dit où on en est, ce qui reste ouvert, et ce qui ne doit
> surtout pas être refait. Le détail des décisions vit dans
> `_suivi/DECISIONS.md` ; l'état des chantiers dans `_suivi/ETAT-PROJET.md`.
>
> Dernière réécriture : **23 août 2026**.
> Ce fichier décrit l'**état courant**. Quand une chose change, on réécrit le
> passage ; on n'empile pas de mise à jour au-dessus du texte devenu faux.

---

## 1. Où on en est

Le dispositif tourne de bout en bout : un élève répond → le worker
pré-corrige sur le PC → le professeur valide depuis son iPad → l'élève voit
le retour. Cette boucle a été **éprouvée en conditions réelles** avec deux
comptes de test.

**En production, vérifié :**

- Migrations `008` à `014` appliquées et contrôlées (RLS active, `anon` sans
  aucun droit, fonctions `security definer`). `013` (plafond d'avance) et
  `014` (réponses personnelles) exécutées les 20 et 22/08.
- Compte enseignant `l.vanhoorde@enseignant.isaac-etoile.fr` reconnu
- Tableau de bord `prof/index.html` : connexion, file de correction,
  validation en lot, rituel de séance, grille de suivi, fiche élève,
  bibliothèque de réponses types
- Worker automatisé (tâche planifiée Windows, toutes les 15 min)
- Grilles de pré-correction : **thème 1 complet, 28 sur 28**. Les trois
  `NET-P*` n'en ont pas et n'en attendent pas : ce sont des **réponses
  personnelles** (`.perso`), elles ne partent jamais en correction.

**Contenu :** 8 séquences de thème (`t0`→`t7`) + le module transversal `m1`
« Représenter l'information ». `t0`, `t1`, `t2` en V0 complète et portées par
le moteur partagé ; `t3`→`t7` en V0 partielle. Seul **`t1` est validé sur le
fond** (23/08) — tout le reste est une proposition. `t0` a été **refondue le
23/08** : fork inline supprimé, portage sur le moteur, **trois séances** au lieu
de deux, contenu des documents source porté en entier. Non validée.

**Comptes de test : CONSERVÉS** (décision du 04/09/2026). Ils ne sont plus des
reliquats à effacer mais le **bac à sable de démonstration** — c'est sur eux que
se font les captures d'écran des guides, plutôt que sur des copies de vrais
élèves. Deux classes s'en chargent, et elles ne font pas le même travail :

| Code | Rôle |
|---|---|
| `SNTDEM` | L'ancienne classe pilote, renommée pour libérer `SNT26A`. **35 copies** : le seul matériel du dépôt qui montre une vraie file de correction. Rattachée à Loïc seul |
| `PROF26` | Le terrain d'essai **commun aux cinq enseignants**, où chacun crée ses élèves fictifs. Convention : pseudo préfixé `zz-`, pour qu'ils restent repérables et supprimables en bloc |

🔴 **Le relevé du 01/08 était faux, et personne ne l'avait revérifié.** Il
annonçait deux classes de test, `SNTTSA` et `SNTTSB` : ni l'une ni l'autre
n'existait. Il n'y en avait qu'une, `SNTTEA` « Test - Classe A », **supprimée le
04/09** après déplacement de ses 2 élèves vers `SNTDEM`. Le ménage écrit d'après
ce relevé avait d'abord visé à côté sans rien trouver.

---

## 2. 🔴 À faire avant toute autre chose

### 2.1 Les `data-cle` sur `t3` → `t7` — SEUL POINT IRRÉVERSIBLE

Une clé de progression **positionnelle** (`et-s3-2`) réaffecte silencieusement
le travail déjà enregistré dès qu'on insère une étape ailleurs qu'en fin de
séance. Aujourd'hui c'est sans conséquence — personne n'a de vraies données.
**Après la rentrée, c'est du travail d'élève perdu, sans message d'erreur.**

**Fait** : `t0`, `t1` (27 clés), `t2` et `m1` (9 clés) portent des clés
sémantiques — 71 clés uniques au total, et `verifier.mjs` refuse un doublon.
**Reste** : `t3`, `t4`, `t5`, `t6`, `t7`, que `verifier.mjs` signale à chaque
passage. À poser **avant** toute retouche de leur structure.

### 2.2 Régénérer la clé `service_role`

Elle a transité dans une archive le 31/07. Supabase → Settings → API Keys →
régénérer, puis remettre dans `ia-snt/.env` et relancer le worker.
**Statut : non confirmé par Loïc.**

### 2.3 Ne jamais inclure `ia-snt/.env` dans une archive

Il est gitignoré, donc absent du dépôt public — mais `zip -r` l'emporte
quand même. Il était **encore présent** dans l'archive du 01/08.

```
zip -r depot.zip . -x "ia-snt/.env" ".git/*"
```

---

## 3. Bugs connus et non corrigés

| # | Où | Quoi |
|---|---|---|
| B1 | QCM, toutes séquences | **23 questions** ont leur bonne réponse trahie par sa longueur, dont **20 marquées**. `t2` en porte à elle seule les 20, pour 42 questions. `node verifier.mjs --qcm` les liste. Non bloquant. Méthode arrêtée : **étoffer les leurres**, jamais raccourcir la bonne réponse. |
| B2 | `criteres-snt.json` | Le thème 2 (`WEB-*`, 10 questions libres) n'a **aucune grille**. Les copies ressortiront en « sans objet ». Sans urgence : `t2` n'est pas abordée en septembre. |
| B3 | `criteres-snt.json` | `REP-R1` (module `m1`) n'a **pas encore de grille**, et son niveau d'exigence n'est pas fixé. La question est par ailleurs en cours de refonte en QCM adossé à une vidéo. |
| B4 | RGPD, `t1` | Les quatre `<iframe>` se chargent **à l'ouverture de la page**, sans clic — l'IP des élèves part chez Radio France et YouTube. Détail et mesures dans `ETAT-PROJET.md`. |

**Jamais reproduit en test automatisé, à confirmer sur iPad :** le
défilement vers une étape (le haut du cadre doit arriver juste sous la barre
`#prog4`) et le placement du menu des retours, qui s'ouvre au-dessus de la
pastille flottante.

**Deux vérifications impossibles hors du lycée**, à faire depuis un poste de
la salle avant de finaliser `t1` :
1. `ping` / `tracert` — si l'ICMP sortant est bloqué, l'étape 6.4 tombe entière ;
2. `nslookup` sur les trois sites du relevé de 6.3 — pas de CDN, pas trois
   adresses dans le même /16. Remplaçants notés dans `DECISIONS.md`.

---

## 4. Ce qui attend une décision ou un contenu de Loïc

- **Relecture de fond de `m1` et de `t1`** — aucun texte n'est validé. Tous les
  textes neufs sont marqués « PROPOSITION À VALIDER » dans le HTML.
- **Phrases toutes faites du tableau de bord** — constante `PHRASES` en tête
  du script de `prof/index.html`. Les quatre formulations actuelles sont des
  propositions, à réécrire dans son ton.
- **`NET-G-modele-tcpip`** — l'emploi de « modèle » plutôt que « protocole »
  est en critère `plus_loin`. Le passer en `socle` ?
- **`NET-G-modem`** — retrouver « moduler / démoduler » est en `socle`.
  Trop exigeant ?
- **Quatre grilles de raisonnement à calibrer** avec de fausses copies,
  comme on l'a fait pour `NET-R3a` : `NET-R1` (datagramme), `NET-R2`
  (invention en avance), `NET-R4` (Marseille), `NET-R5` (réseau sans centre).
- **Niveau d'exigence de la grille `REP-R1`** (voir B3).
- **Volume de la séance 4 de `t1`** — elle porte **67 champs, 33 questions de
  QCM et 14 réponses rédigées**, soit la moitié de la charge de correction du
  thème. `t1-jusqua-la-maison` porte à elle seule 8 rédigés. Garder, élaguer,
  ou répartir : décision ouverte.
- **Rattachement du module `m1`** — il n'est **référencé depuis aucune
  séquence**, alors que `t7` (photographie numérique) mobilise le poids des
  fichiers. Décision de progression ouverte.

---

## 5. Chantiers différés, avec leurs décisions déjà prises

Ne pas rediscuter le principe : il est arrêté. Reprendre l'exécution.

### 5.1 Cadence du worker — dès que Loïc aura son emploi du temps (~fin août)

Remplacer la cadence unique de 15 min par des déclencheurs différenciés dans
`ia-snt/planifier-worker.ps1` : **toutes les 5 min (voire 1–2) pendant les
créneaux SNT**, toutes les heures le reste du temps. Trois séances d'1 h 15
par semaine, horaires fixes. Le rattrapage à l'allumage existe déjà
(déclencheur `AtLogOn`). Prévoir un petit fichier d'horaires que Loïc
remplit, à partir duquel le script génère les déclencheurs.

### 5.2 Sélection de sous-champs jsonb dans PostgREST — **devenue un prérequis**

`assets/js/progression.js` récupère `correction_ia` **en entier** pour le
navigateur élève. Tant que c'est le cas, un élève peut lire `tri.raisons` et
`a_verifier_par_le_prof` dans le code source de sa page. Longtemps différé
sans conséquence — **le générateur de fiches de révision le rend bloquant**,
puisque la fiche imprimera la correction. À traiter **avant** ce chantier.

### 5.3 Correction par les pairs — ~novembre 2026

Circuit arrêté : **l'élève corrige d'abord, l'IA en repli** si personne ne
prend la copie (délai généreux, type 24 h). Toute correction d'élève remonte
à Loïc et passe par lui avant d'atteindre le destinataire — rien
d'automatique. Éligibilité du correcteur : séance entièrement terminée ET
toutes ses propres réponses validées. Copies anonymisées, pool de 3-4 qui se
poussent. Grille simplifiée à cocher + appréciation obligatoire.

**Motif du report :** la grille simplifiée ne peut pas être écrite avant
d'avoir de vraies copies de secondes.

À construire : table `corrections_pairs` + attribution avec verrou, écran
élève, second type d'objet dans la file de correction (~2-3 sessions).
Conséquences acceptées : le retour à l'élève arrive **plus tard** qu'avec
l'IA seule, et le volume de relecture de Loïc **double**.

### 5.4 Ouverture aux collègues — pas en 2026-2027

Loïc est seul en SNT cette année. Technique : table `enseignants_classes`
(`auth_id` + `classe_id`), et les policies passent de « est enseignant » à
« est enseignant **de cette classe** » — environ une demi-journée.

Trois points non techniques à régler **avant** d'ouvrir :
1. les rattachements sont posés par un administrateur (Loïc), jamais
   auto-attribués ;
2. le cloisonnement est réciproque — Loïc ne verrait plus les groupes des
   collègues sans un statut à part, à décider ;
3. à plusieurs, cela devient un traitement d'établissement : accord du chef
   d'établissement, inscription au registre des traitements, information des
   familles.

---

## 6. Pièges rencontrés — ne pas les réintroduire

Chacun a coûté du temps. Ils sont documentés en détail dans
`_suivi/DECISIONS.md` ; voici le rappel court.

- 🔴 **Un `MutationObserver` surveille les classes des étapes.** Il rappelle
  `majBarre()` → `majLignes()` à chaque changement. Une écriture de classe
  inconditionnelle dans ce chemin **fige la page au chargement** — c'est
  arrivé le 01/08, l'onglet tournait en boucle. Toujours vérifier qu'une
  valeur change avant de l'écrire : `classList.remove()` sur une classe
  absente déclenche quand même l'observateur. Le test `t-mutation` (vraie
  page + observateur réel) l'attrape ; les tests unitaires, non.
- **Un correctif JS peut être annulé par une règle CSS plus spécifique.**
  `.rempli .gaction{display:none}` l'emportait sur `style="display:''"`. Le
  bug était invisible en test automatisé : le test vérifiait que le JS
  faisait le bon geste, pas que le geste avait un effet à l'écran.
- **La remontée de déclaration ne traverse pas un IIFE.** Une fonction
  définie au niveau global était invisible depuis un module → `ReferenceError`
  silencieux, la pastille ne se créait jamais.
- **`scrollIntoView()` dans la même frame qu'un changement de classe** vise
  une position périmée. Toujours attendre deux `requestAnimationFrame`.
- **Ne jamais ancrer une extraction HTML sur un crochet ou une chaîne
  fixe** : l'ordre des attributs varie, et les tableaux d'options
  contiennent des `[`.
- **Une regex `<div[^>]*>` casse sur les attributs contenant `>`** (ex.
  `<b>pourquoi</b>` dans un énoncé). 17 questions sur 40 étaient perdues
  silencieusement.
- **Windows PowerShell 5.1 lit un `.ps1` sans BOM comme de l'ANSI.** Les
  tirets cadratins deviennent des guillemets et cassent le script, avec un
  message désignant une ligne sans rapport. `verifier.mjs` le contrôle
  désormais.
- **Un heredoc de shell mange les antislashs.** Un `\b` avalé devient un
  caractère invisible qui casse une regex en silence : écrire les scripts
  dans un fichier, jamais par heredoc.
- **Toutes les étapes n'ont pas le même gabarit** : les encadrés spéciaux
  (`.france-box`) portent leur titre dans `.fl`, pas `.step-title`.

---

## 7. Méthode de travail — ce qui marche

1. **Lire le vrai code avant de proposer.** Plusieurs bugs venaient d'une
   supposition sur le fonctionnement du moteur.
2. **Se repérer aux `data-cle`, jamais aux numéros d'étape.** Les numéros ont
   glissé après la découpe de la séance 1 de `t1`.
3. **Tester avant de livrer.** L'environnement dispose de PostgreSQL 16
   (migrations), `jsdom` (comportement des pages), PowerShell 7 (analyse
   syntaxique des `.ps1`), et d'un Chromium sans interface pour mesurer un
   rendu au lieu de le déduire d'une feuille de style.
4. **Vérifier qu'un test échoue quand on casse la chose testée.** Un test
   qui répond toujours « OK » ne vaut rien.
5. **Incrémenter `?v=N` sur `sequence-snt.css` ET `.js`, dans TOUTES les
   pages**, y compris le hub `2nde-snt.html`. `verifier.mjs` le contrôle
   (bloquant).
6. **Pour retoucher un fichier du dépôt : Node, jamais Python en mode texte.**
   `io.open(…, 'w')` réécrit en CRLF alors que tout le dépôt est en LF. Et ne
   jamais relancer un script de traitement sur un fichier qu'il vient de
   modifier.
7. **Sortie attendue de `node verifier.mjs` : exactement 18 problèmes** — les
   18 liens `cfa/outil-*` → `fiches/cfa/fiche-outil-NN.html`, fiches à
   imprimer pas encore écrites, en attente de la validation des versions en
   ligne. **Tout autre écart est une régression.**
8. **Livraison en archives ZIP delta**, extractibles à la racine.

---

## 8. Ordre suggéré pour la prochaine session

1. Les `data-cle` de `t3`→`t7` (§2.1) — le seul point qui devienne irréversible
2. La sélection de sous-champs jsonb (§5.2), prérequis du générateur de fiches
3. Les décisions en attente du §4, qui débloquent les grilles
4. Le reste au fil de l'eau

Tout le reste peut vivre toute l'année sans gêner personne.
