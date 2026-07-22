# Worker de pré-correction SNT

Programme **local** (PC de Loïc) qui prépare la correction des **questions
libres** de la SNT. Il **ne note jamais** : il rédige un travail préparatoire
que Loïc valide.

> À ne pas confondre avec le worker de la **frise Terminale ES** (`ia-correction/`
> + `serveur-frise/`) : même cadre, code séparé.

## Architecture (étape 4)
On laisse au **modèle** ce qu'il fait bien (juger chaque critère, écrire un
message chaleureux) et on met en **code** tout ce qui est déterministe. Deux
appels au modèle :
1. **Passe 1** — le modèle juge chaque critère (constat + justification).
2. **[code]** — le worker calcule le **verdict** et l'**aide aux camarades** à
   partir des constats et des niveaux, applique les **garde-fous**.
3. **Passe 2** — le modèle rédige le **message élève** en SACHANT le verdict.

Ainsi le verdict ne dépend plus de l'humeur du modèle : « accepté / à compléter /
sans objet » est calculé, jamais oscillant.

## Fichiers
- `moteur.mjs` — cœur PARTAGÉ (worker + banc). Verdict, aide et garde-fous y sont.
- `prompt-cadre.md` — prompt de la **passe 1** (juger les critères).
- `prompt-message.md` — prompt de la **passe 2** (message élève).
- `criteres-snt.json` — grille par `code_activite`, à deux étages (`socle` /
  `plus_loin`). **Le fond appartient à Loïc.**
- `precorrection-snt.mjs` — le worker (lit la base, écrit `correction_ia`).
- `banc-essai.mjs` + `copies-test.json` — calibration locale, sans base.
- `evaluation.mjs` + `copies-eval.json` — suite d'évaluation : compare le
  résultat ATTENDU (annoté) au produit et sort un rapport de conformité (ne
  montre que les divergences). `node evaluation.mjs [--code NET-1b] [--repeat 3]`.
- `_test-verdict.mjs` — test des fonctions déterministes (aucun modèle requis).

## Cadre (acté, non négociable)
- **Jamais de note.** L'IA observe des critères + justifie ; Loïc reste souverain
  (AI Act art. 6(3) : tâche préparatoire). Garde-fou mécanique : toute sortie qui
  contient une note/pourcentage est rejetée.
- **100 % local** (Mistral Nemo via Ollama) : la réponse de l'élève ne quitte
  jamais la machine.
- **Pseudonymisation** : aucun nom en base ; le worker ne voit qu'un `eleve_id`.
- **La clé `service_role` vit dans `.env`, jamais ailleurs** (gitignorée).
- **Anti-injection** : la réponse élève est passée comme DONNÉE (rôle user) ;
  détection mécanique des tentatives d'injection ; le verdict est calculé en
  code, donc une injection ne peut pas forcer « accepté ».

## Réglages (dans `.env` ou en tête de `moteur.mjs`)
- `IA_MODELE` (défaut `mistral-nemo`) — changer de modèle = une ligne.
- `OLLAMA_URL` (défaut `http://localhost:11434`).
- `SEUIL_AIDE` dans `moteur.mjs` (défaut 2/3) — la « nette majorité » pour
  suggérer l'aide aux camarades. À monter/descendre selon ton envie d'entraide.

## Mise en route
1. Node 18+, Ollama lancé, `ollama pull mistral-nemo`.
2. `.env` renseigné (voir `.env.exemple`).
3. `node precorrection-snt.mjs`  (ou `node banc-essai.mjs` pour tester sans base).

## Le verdict, en clair
`accepté` si TOUS les critères `socle` sont « observé » (les `plus_loin` ne
bloquent jamais). Sinon `à compléter` (invitation à compléter et renvoyer —
la base remet `correction_ia` à NULL à la réécriture, le worker re-corrige).
`sans objet` pour un diagnostic.

## Feuille de route
- [x] Étape 1 — plomberie.
- [x] Étape 2 — modèle local + prompt-cadre.
- [x] Étape 3 — grille par activité (deux étages socle / plus_loin).
- [x] Étape 4 — deux temps, verdict + aide calculés en code, garde-fous durs.
- [ ] Étape 5 — relecture / validation par Loïc (relevé, puis tableau de bord
      iPad ; suppose le rôle enseignant Supabase).
