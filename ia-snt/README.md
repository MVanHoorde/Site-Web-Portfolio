# Worker de pré-correction SNT

Petit programme **local** (sur le PC de Loïc) qui prépare la correction des
**questions libres** de la SNT. Il **ne note jamais** : il rédige un travail
préparatoire que Loïc valide.

> À ne pas confondre avec le worker de la **frise Terminale ES** (dossier
> `ia-correction/` + `serveur-frise/`) : même cadre, code séparé.

## Cadre (acté, non négociable)
- **Jamais de note.** L'IA observe des critères + justifie ; Loïc reste
  souverain sur la notation (AI Act art. 6(3) : tâche préparatoire).
- **100 % local.** Le modèle (Qwen 3 via Ollama, à l'étape 2) tourne sur le PC ;
  la réponse de l'élève ne sort jamais de la machine → pas de transfert à un
  tiers, RGPD simple.
- **Pseudonymisation structurelle.** La base ne contient aucun nom ; le worker
  ne voit qu'un `eleve_id` et un pseudo choisi.
- **La clé `service_role` vit dans `.env`, jamais ailleurs.** Elle contourne les
  règles RLS : jamais dans une page, jamais sur GitHub (`.env` est gitignoré).

## Comment le statut évolue
`en_attente` (réponse rendue) → le worker écrit `correction_ia` **sans changer
le statut** → Loïc relit, tranche, passe à `corrige` (ou `signale`). Le statut
`en_attente` veut dire « attend la correction du **prof** » ; la présence de
`correction_ia` suffit à ce que le worker ne repasse pas sur la copie.

## Mise en route
1. **Node 18+** installé (`node --version`).
2. Copier `.env.exemple` en `.env`, renseigner `SUPABASE_URL` et
   `SUPABASE_SERVICE_ROLE` (Supabase → Settings → API).
3. Lancer, depuis ce dossier :
   ```
   node precorrection-snt.mjs
   ```

## Feuille de route
- [x] **Étape 1 — plomberie** : lire une réponse `en_attente`, écrire une
      pré-correction factice. *(ce script, `precorrection-snt.mjs`)*
- [ ] **Étape 2 — modèle local** : installer Ollama, tirer Qwen 3, remplacer le
      stub par un vrai appel + le prompt-cadre.
- [ ] **Étape 3 — consignes** : `criteres-snt.json`, une grille par
      `code_activite` (transposé de `criteres-frise.json`).
- [ ] **Étape 4 — garde-fous** : réponse élève traitée comme donnée (anti-
      injection), rejet de toute sortie ressemblant à une note, format vérifié.
- [ ] **Étape 5 — relecture** : comment Loïc voit et valide (relevé, puis
      tableau de bord).
