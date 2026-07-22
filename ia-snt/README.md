# Worker de pré-correction SNT

Petit programme **local** (sur le PC de Loïc) qui prépare la correction des
**questions libres** de la SNT. Il **ne note jamais** : il rédige un travail
préparatoire que Loïc valide.

> À ne pas confondre avec le worker de la **frise Terminale ES** (dossier
> `ia-correction/` + `serveur-frise/`) : même cadre, code séparé.

## Cadre (acté, non négociable)
- **Jamais de note.** L'IA observe des critères + justifie ; Loïc reste
  souverain sur la notation (AI Act art. 6(3) : tâche préparatoire).
- **100 % local.** Le modèle (Mistral Nemo via Ollama) tourne sur le PC ;
  la réponse de l'élève ne sort jamais de la machine → pas de transfert à un
  tiers, RGPD simple.
- **Pseudonymisation structurelle.** La base ne contient aucun nom ; le worker
  ne voit qu'un `eleve_id` et un pseudo choisi.
- **La clé `service_role` vit dans `.env`, jamais ailleurs.** Elle contourne
  les règles RLS : jamais dans une page, jamais sur GitHub (`.env` est gitignoré).

## Comment le statut évolue
`en_attente` (réponse rendue) → le worker écrit `correction_ia` **sans changer
le statut** → Loïc relit, tranche, passe à `corrige` (ou `signale`). Le statut
`en_attente` veut dire « attend la correction du **prof** » ; la présence de
`correction_ia` suffit à ce que le worker ne repasse pas sur la copie.

## Mise en route
1. **Node 18+** installé (`node --version`).
2. Copier `.env.exemple` en `.env`, renseigner `SUPABASE_URL` et
   `SUPABASE_SERVICE_ROLE` (Supabase → Settings → API).
3. **Ollama** installé et lancé, modèle tiré : `ollama pull mistral-nemo`.
4. Lancer, depuis ce dossier : `node precorrection-snt.mjs`.

## Réglages (facultatifs, dans `.env`)
- `IA_MODELE` — le modèle Ollama à utiliser (défaut `mistral-nemo`). **Changer
  de cerveau = changer cette seule ligne.** Chaque pré-correction garde en
  mémoire le modèle qui l'a produite (champ `modele` de `correction_ia`).
- `OLLAMA_URL` — l'hôte Ollama (défaut `http://localhost:11434`).
- La **température** est fixée bas dans le code (0.2) pour des corrections
  constantes ; on l'ajustera si besoin.

## Ce que le worker met dans `correction_ia`
```json
{
  "modele": "mistral-nemo",
  "genere_le": "2026-…",
  "mention": "Préparation de correction générée par IA locale — la notation appartient à l'enseignant.",
  "analyse": {
    "criteres": [ { "id": "…", "constat": "observé|partiellement|non observé", "justification": "…" } ],
    "point_fort": "…",
    "point_a_travailler": "…",
    "a_verifier_par_le_prof": "…"
  }
}
```
Tant que `criteres-snt.json` n'existe pas (étape 3), `criteres` reste `[]` et
l'analyse est générale — c'est normal.

## Feuille de route
- [x] **Étape 1 — plomberie** : lire une réponse `en_attente`, écrire une
      pré-correction factice.
- [x] **Étape 2 — modèle local** : Ollama + Mistral Nemo, prompt-cadre,
      température basse, réponse élève traitée comme donnée (rôle système vs
      user). *(ce script)*
- [x] **Étape 3 — consignes** : `criteres-snt.json`, une grille par
      `code_activite`. V1 pour les 3 questions rédigées de la séquence Internet
      (NET-1a diagnostic non noté · NET-1b · NET-2c). Consommé automatiquement
      par le worker. Réglage orthographe présent mais volontairement léger.
- [ ] **Étape 4 — garde-fous durs** : rejet mécanique de toute sortie
      ressemblant à une note, format JSON vérifié, anti-injection renforcé.
- [ ] **Étape 5 — relecture** : comment Loïc voit et valide (relevé, puis
      tableau de bord).
