# Reprise — chantiers « pré-correction IA SNT » + « affichage élève »

*Note de reprise (session du 22/07/2026). À déposer dans les fichiers du projet
« préparation de rentrée », ou à coller en tête d'une prochaine conversation.
Le socle général et le dépôt Site-Web-Portfolio sont dans les fichiers du projet.*

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
