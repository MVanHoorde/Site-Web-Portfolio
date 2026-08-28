# Manifeste — par où entrer dans ce projet

> ## ⚡ Reprise d'une session en cours
>
> Si tu reprends le travail après une interruption, **ouvre `REPRISE.md`
> avant tout le reste** : il dit où on en est, ce qui reste ouvert, les bugs
> connus non corrigés, et les pièges à ne pas réintroduire. (~2 500 tokens)

> **À lire en premier, avant `CLAUDE.md`.** Ce fichier ne contient aucune règle :
> il dit seulement **quel fichier ouvrir pour quelle tâche**, et ce que ça coûte.
>
> Motif : lire tout le dépôt représente ≈ **375 000 tokens** — au-delà d'une
> fenêtre de contexte. Il faut donc choisir, et choisir demande une carte.

---

## Quelle tâche → quels fichiers

| Je veux… | J'ouvre | ~tokens |
|---|---|---|
| **reprendre après une interruption** | `REPRISE.md` | 2 500 |
| **savoir où on en est** | `_suivi/ETAT-PROJET.md` | 1 500 |
| savoir *pourquoi* c'est comme ça | `_suivi/DECISIONS.md` | 3 000 |
| retrouver ce qui s'est passé | `_suivi/JOURNAL.md` | *ne pas lire par défaut* |
| **produire une séquence SNT** | `_modeles/CONSIGNES-sequence-SNT.md` | 6 500 |
| **produire un outil transversal de PC** | `_modeles/CONSIGNES-outil-PC.md` + `_modeles/gabarit-outil-PC.html` + `_modeles/gabarit-fiche-outil-PC.html` | 7 000 |
| **récupérer un chapitre PC depuis son PPTX/PDF (V1 intégrale)** | `_modeles/CONSIGNES-V1-integrale-PC.md` + `_modeles/gabarit-chapitre.html` | 6 000 |
| **raffiner un chapitre PC / faire sa fiche** | `_modeles/CONSIGNES-chapitre-PC.md` + `_modeles/gabarit-chapitre.html` | 8 500 |
| l'état fin d'un chapitre / d'une séquence | `_suivi/chapitres.md` (section concernée) | 500 par section |
| toucher au **moteur** d'une séquence SNT | `assets/js/sequence-snt.js` (+ `_modeles/spec-snt-t1-internet.md` §13-15) | 21 000 |
| toucher à la **grammaire visuelle** SNT | `assets/css/sequence-snt.css` | 14 000 |
| toucher à la **base de données** | `_suivi/BDD-cadrage.md` + `bdd/schema/006-rls-et-fonctions.sql` | 8 000 |
| toucher au **client** de progression | `assets/js/progression.js` — 🔴 **partagé SNT + livret CFA** : `?v=` à incrémenter dans **24 fichiers** | 9 500 |
| **produire un outil du livret CFA** | `_modeles/gabarit-outil-CFA.html` + un `cfa/outil-NN-….html` existant | 6 000 |
| toucher à la **pré-correction IA** | `ia-snt/README.md` + `ia-snt/moteur.mjs` | 4 000 |
| **regénérer les fiches PDF** de 2nde PC 🆕 | `node exporter-fiches.mjs` — après toute retouche d'une fiche de `fiches/` | 0 |
| vérifier que rien n'est cassé | `node verifier.mjs` | 0 |
| donner un état du dépôt à un assistant | `node verifier.mjs --bilan` | ~800 |

## Ce qu'il ne faut PAS ouvrir en entier

| Fichier | Poids | À la place |
|---|---|---|
| `pages/2nde-snt-t1-internet.html` | ~72 000 tokens (383 → 256 ko depuis l'extraction du moteur) | `grep` ciblé, ou la section utile |
| `_suivi/JOURNAL.md` | croissant | n'y aller que sur une question précise |
| les 7 autres séquences SNT | ~158 000 tokens cumulés | une seule à la fois |

---

## Les deux gabarits — ne jamais les mélanger

| | **Chapitre PC** | **Séquence SNT** |
|---|---|---|
| Structure | thème → chapitre → sections | séquence → séance → étape → champ |
| Consignes | `_modeles/CONSIGNES-chapitre-PC.md` | `_modeles/CONSIGNES-sequence-SNT.md` |
| Exemple | `pages/2nde-pc-t1-c3-constitution-atome.html` | `pages/2nde-snt-t2-le-web.html` |
| Persistance | `localStorage` | base Supabase |
| Assets | `chapitre-commun.css?v=N` | `sequence-snt.css?v=N` + `sequence-snt.js` |
| Maturité | rodé, 14 chapitres | phase 2, 8 séquences, 0 validée |

Deux autres familles existent : les **outils transversaux de physique-chimie**
(`_modeles/CONSIGNES-outil-PC.md` — pas de progression, moteur SNT, fiche A4
complétée, corrigés en ligne) et l'**Enseignement scientifique Terminale**
(`_modeles/CONSIGNES-sequence-ES.md`).

---

## Ce qui bloque aujourd'hui

Détail dans `_suivi/ETAT-PROJET.md` § « Ce qui bloque ».

1. **L'étape 5** — rien ne peut faire passer une copie en `corrige` : l'élève ne
   voit jamais son retour. **Chemin critique** pour la rentrée.
2. **Le portage des sept séquences** sur le moteur partagé — `t1` seule y est.
   Une à la fois, ouverte et testée. Priorité `t0` et `t2`.
3. **La frise ES à brancher** — le modèle est écrit (`bdd/schema/007-frise-es.sql`),
   il attend la relecture de Loïc, puis les fonctions dans `progression.js`.

---

## Règles de collaboration, en trois lignes

- Sur le **fond pédagogique**, la vision de Loïc est souveraine. L'IA est
  l'échafaudage : chercher, structurer, coder, proposer une V1 dans son ton.
- **Un plan court avant de modifier des fichiers.** Point par point.
- **La doc décrit l'état courant**, jamais l'historique. Une décision qui change
  se **réécrit** ; elle ne s'empile pas.

Le détail : `CLAUDE.md`.

---

## Comment me transmettre le dépôt (sans zip à chaque fois)

Par ordre de préférence :

1. **Claude Code** — il lit et écrit directement dans le clone local. Zéro
   transfert, et il applique les corrections au lieu de livrer une archive.
   C'est la bonne méthode pour tout travail *sur* le dépôt.
2. **Un lien brut GitHub collé dans le message** — le dépôt est public :
   `https://raw.githubusercontent.com/MVanHoorde/Site-Web-Portfolio/main/<chemin>`.
   Un lien collé par Loïc est lisible ; un lien deviné ne l'est pas.
3. **`node verifier.mjs --bilan`** — ~800 tokens qui disent l'état du dépôt.
   Suffit à cadrer 80 % des conversations.
4. **Copier-coller** d'un fichier court, directement dans le message.
5. **Zip ciblé** — uniquement les fichiers concernés, jamais le dépôt entier.
   Le fabriquer avec `git archive` plutôt que par l'explorateur : Git n'y mettra
   jamais un fichier ignoré (le `.env` est parti comme ça une fois).
