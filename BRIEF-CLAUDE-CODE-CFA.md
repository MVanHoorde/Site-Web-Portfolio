# Brief de mission — Espace CFA, lot 1

*À placer à la racine du dépôt sous ce nom, ou dans `_suivi/`. C'est le fichier à ouvrir en premier dans Claude Code.*

---

## 0. Contexte en dix lignes

Le dépôt `Site-Web-Portfolio` héberge le site pédagogique de Loïc Van Hoorde, enseignant. Il contient aujourd'hui deux familles de pages : les **chapitres de physique-chimie** et les **séquences SNT**. On ajoute une **troisième famille** : l'espace **CFA**, destiné à deux publics d'apprentis — BTS MMCM (maintenance des matériels de construction et de manutention) et terminale bac pro MVTR (maintenance des véhicules, option transport routier).

Le contenu à produire est un **livret transversal de 17 fiches-outils** de remise à niveau mathématique. Chaque fiche existe en deux formes : une **page écran** et une **fiche A4 recto-verso imprimable**.

Le papier est le format de référence. Le numérique est un supplément.

## 1. Périmètre du lot 1 — ce qu'il faut produire

| # | Livrable | Chemin |
|---|---|---|
| 1 | Feuille de style de la famille CFA | `assets/css/cfa-commun.css` |
| 2 | Gabarit page écran | `_modeles/gabarit-outil-CFA.html` |
| 3 | Gabarit fiche A4 | `_modeles/gabarit-fiche-outil-CFA.html` |
| 4 | Index du livret | `cfa/index.html` |
| 5 | 17 pages écran | `cfa/outil-NN-<slug>.html` |
| 6 | 17 fiches A4 | `fiches/cfa/fiche-outil-NN.html` |
| 7 | 17 corrigés A4, **hors dépôt** | `_corriges-cfa/corrige-outil-NN.html` |
| 8 | Deux portes sur l'accueil | modification de `index.html` |
| 9 | Mise à jour de la doc | `CLAUDE.md`, `MANIFESTE.md`, `_suivi/DECISIONS.md` |
| 10 | Troisième famille dans le vérificateur | `verifier.mjs` |
| 11 | Liste des figures à produire en V2 | `_suivi/CFA-figures-a-produire.md` |

Le contenu exact des 17 fiches est spécifié dans **`_suivi/CFA-contenu-17-outils.md`**. Les conventions de forme sont dans **`_modeles/CONSIGNES-fiche-outil-CFA.md`**. Le contexte pédagogique est dans **`_suivi/CFA-reference-livret.md`**. Ces trois fichiers sont fournis avec ce brief : lis-les intégralement avant d'écrire une ligne.

## 2. Ordre de travail et point d'arrêt obligatoire

**Étape A — infrastructure.** Livrables 1, 2, 3. Aucun contenu pédagogique.

**Étape B — les deux pilotes.** L'**Outil 0** et l'**Outil 2**, en page écran, fiche A4 et corrigé. Ces deux-là éprouvent les deux mécaniques d'exercice distinctes du livret : rédaction pour l'Outil 0, calcul pour l'Outil 2.

**→ ARRÊT. Ne pas continuer.** Rends compte de ce qui est fait, signale les points où tu as dû trancher, et attends validation. Les quinze fiches restantes se produisent après, en un seul passage.

**Étape C — les quinze autres**, puis livrables 4, 8, 9, 10, 11.

## 3. Fichiers du dépôt à lire, exhaustivement

### Obligatoires, dans cet ordre

| Fichier | Pourquoi |
|---|---|
| `CLAUDE.md` | règles de collaboration, conventions du dépôt |
| `MANIFESTE.md` | philosophie du site, les familles de pages |
| `style.css` | **la charte** : variables de couleur, typographie, grille |
| `assets/css/chapitre-commun.css` | **la bibliothèque de composants** dont `cfa-commun.css` dérive |
| `assets/css/fonts.css` | déclarations `@font-face` |
| `_modeles/gabarit-fiche.html` | le gabarit A4 existant, avec ses règles `@page` — c'est la base du livrable 3 |
| `_modeles/gabarit-chapitre.html` | le gabarit écran existant — base du livrable 2 |
| `_modeles/CONSIGNES-chapitre-PC.md` | conventions de production : nommage, structure, ton |
| `index.html` | à modifier au livrable 8 |
| `verifier.mjs` | à étendre au livrable 10 |

### Utiles

| Fichier | Pourquoi |
|---|---|
| `pages/2nde-pc-t2-c1-decrire-le-mouvement.html` | une page de chapitre réelle, pour voir les composants en usage |
| `fiches/fiche-2nde-t1c2.html` | une fiche A4 réelle |
| `assets/js/progression.js` | mécanique de progression existante, à réutiliser pour le compteur de complétion |
| `_suivi/ETAT-PROJET.md` | état des chantiers |
| `_suivi/DECISIONS.md` | à compléter au livrable 9 |
| `.gitignore` | à étendre, voir §5 |

### À ne pas ouvrir, à ne pas modifier

`ia-snt/`, `ia-correction/`, `bdd/`, `supabase/`, `prof/`, `serveur-frise/`, `cahier/`, `gravures/`, `audio/`, et toutes les pages existantes de `pages/` sauf en lecture. Le moteur SNT est hors périmètre. **L'espace CFA n'utilise ni Supabase, ni compte, ni donnée personnelle.**

## 4. Règles non négociables

1. **Recto-verso maximum** par fiche. Une fiche A4 qui déborde sur une troisième page est un bug.
2. **Utilisable imprimé, sans exception.** Aucun contenu ne peut vivre derrière un lien ou un QR code. Le public MVTR n'a pas le droit au téléphone en séance.
3. **Toujours un palier d'entrée où personne ne peut échouer.**
4. **Aucun corrigé en ligne.** Les corrigés vont dans `_corriges-cfa/`, qui est exclu du dépôt.
5. **Aucun énoncé d'examen reproduit**, ni cité, ni transposé à l'identique. Les sujets d'examen ne sont pas dans le dépôt et ne doivent jamais y entrer.
6. **Aucune donnée personnelle**, aucun stockage serveur. `localStorage` uniquement, et seulement pour le compteur de complétion.
7. **Sur le contenu partagé avec le collègue référent BTS 1 : refaire la forme, jamais le fond.**
8. **La charte ne se réinvente pas.** Toutes les couleurs viennent des variables de `style.css`. Aucune valeur hexadécimale en dur, aucune ombre, aucun coin arrondi, aucun dégradé.

## 5. `.gitignore` à étendre

```
# Corrigés élèves — imprimé et PDF individuel uniquement, jamais en ligne
/_corriges-cfa/

# Documents d'examen — ne JAMAIS committer.
# GitHub Pages est public par construction, y compris un dossier non référencé.
/cfa-prive/
*grille-jury*
*version-jury*
```

## 6. Le logo de l'établissement

Cinq fichiers PNG sont fournis, à ranger dans `assets/img/cfa/`. Deux sont des doublons binaires stricts — n'en garder qu'un.

- Version couleur avec baseline « faire briller les talents » : en-tête de `cfa/index.html`.
- Version couleur sans baseline : en-tête des fiches A4, en petit.
- Version blanche : réservée aux fonds sombres.

**Le logo ne se retouche jamais** : ni recoloré, ni redessiné, ni détouré. Et il n'est **pas** une source de palette : les couleurs du site restent celles de `style.css`. Le vectoriel n'est pas encore disponible ; prévoir un remplacement facile du PNG par un SVG plus tard, via une seule règle CSS ou un seul chemin.

## 7. V1 texte seul, figures en V2

Le lot 1 est **entièrement textuel**. Aucune illustration, aucun schéma, aucune photo.

Quand une fiche aurait besoin d'une figure, insère à sa place le composant `.figure-a-produire` — un cadre en pointillé portant une description d'une ligne de ce qu'il faudrait dessiner — et **ajoute une entrée dans `_suivi/CFA-figures-a-produire.md`** avec le numéro d'outil, le palier, et ce qui est attendu. Ce fichier sera relu et arbitré avant la V2. Ne produis pas de figure de ton propre chef.

## 8. Ton et registre des énoncés

Public : apprentis, niveaux très hétérogènes, lacunes mathématiques quasi générales, **manque de confiance marqué**, investissement personnel très limité hors séance.

- Phrases courtes. Une consigne par phrase. Pas de subordonnée qui empile deux conditions.
- Verbe d'action à l'infinitif en tête de consigne : *calculer*, *relever*, *comparer*, *conclure*.
- Jamais de tournure qui suppose un acquis : pas de « il suffit de », « on sait que », « rappelons que ».
- Le contexte tient en une phrase. Un énoncé de six lignes n'est pas lu.
- Le décor est **véhicule au sens large** : voiture, poids lourd, engin de chantier, matériel d'atelier. Les trois métiers partagent la cylindrée, la vitesse de rotation, la pression, le couple. Ne pas cloisonner.
- Les valeurs numériques doivent être **plausibles**, pas exactes. C'est une V1 de mise en situation, pas une fiche constructeur.

## 9. Rendu attendu à chaque point d'arrêt

- La liste des fichiers créés ou modifiés.
- Les décisions que tu as dû prendre faute de spécification, listées explicitement.
- Les points où la spécification t'a paru contradictoire.
- Les entrées ajoutées à `_suivi/CFA-figures-a-produire.md`.
- Rien d'autre. Pas de résumé du travail, pas de récapitulatif du brief.
