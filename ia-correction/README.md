# ⛔ Fusionné dans `ia-snt/` le 23/07/2026

Ce dossier dupliquait `ia-snt/` : même finalité (pré-correction locale,
jamais de note), même moteur (Ollama), même cadre réglementaire.

**Le moteur est désormais unique.** `ia-snt/moteur.mjs` corrige aussi bien
une question libre de SNT qu'une contribution de la frise ES : seule la
**grille** change.

## Ce qu'il reste à faire pour brancher la frise

1. Déplacer `criteres-frise.json` dans `ia-snt/` (une grille par
   `code_activite`, comme `criteres-snt.json`).
2. Écrire un worker jumeau de `precorrection-snt.mjs` qui lit
   `contributions` au lieu de `reponses_libres` — ou, mieux, paramétrer
   celui qui existe par un nom de table.
3. Vérifier que le prompt-cadre convient à une contribution de frise
   (elle porte une date et des sources, pas seulement une définition).

`prompt-cadre.md` et `criteres-frise.json` sont conservés ici en
attendant ce déplacement : ils contiennent du fond écrit par Loïc.
`precorrection.mjs` est périmé — il vise l'ancien serveur.

Cadre inchangé et non négociable : **jamais de note**, 100 % local,
pseudonymisation, souveraineté de Loïc sur toute notation.
