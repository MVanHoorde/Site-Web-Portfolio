# A-LIRE — Livraison du 21/08/2026 · brief du module M1

## Contenu de l'archive

```
BRIEF-CLAUDE-CODE-M1-representer-information.md   ← à la racine du dépôt
_modeles/reference-m1/potence-90.png              ← référence visuelle
_modeles/reference-m1/potence-434.png             ← référence visuelle
A-LIRE-M1.md                                      ← ce fichier
```

**Extraire à la racine du dépôt.** L'arborescence est reproduite : les deux PNG
se rangent tout seuls dans `_modeles/reference-m1/`. Aucun fichier existant
n'est écrasé, les trois chemins sont neufs.

## `git diff --stat` attendu

Aucun fichier modifié — **trois créations seulement** :

```
 A-LIRE-M1.md                                     | (nouveau)
 BRIEF-CLAUDE-CODE-M1-representer-information.md  | (nouveau)
 _modeles/reference-m1/potence-434.png            | (nouveau, binaire)
 _modeles/reference-m1/potence-90.png             | (nouveau, binaire)
```

Si `git status` signale autre chose, s'arrêter et vérifier.

## Les deux PNG

Extraits de la correction manuscrite de Loïc (`03 bis — Le codage de
l'information (AD) — correction.pdf`, page 2). Ce sont les divisions
successives en potence pour **90** et pour **434**.

Ils servent de **modèle à reproduire en SVG**, conformément au §7 du brief.
Ils ne sont **pas** destinés à être affichés dans la page : la potence doit être
un SVG inline, animé pas à pas, paramétrable avec n'importe quel nombre.

### Deux points de vigilance

1. **Le dépôt est public** (GitHub Pages). Ces images sont des corrections
   d'exercice. L'enjeu est mince — l'écriture binaire de 90 n'est un secret pour
   personne — mais si les nombres 90 et 434 sont repris comme items d'atelier
   (ils le sont, §9.1 du brief), leur corrigé sera consultable dans le dépôt.
   À accepter ou à arbitrer.

2. **Une fois le SVG produit et validé, ces PNG n'ont plus d'utilité.** Le brief
   demande à Claude Code de proposer leur suppression en fin de tâche, plutôt
   que de les laisser s'accumuler.

## Emplacement retenu, et pourquoi

`_modeles/reference-m1/` et non `assets/img/snt/…` : les images de `assets/`
sont servies aux élèves par GitHub Pages. Ces deux-là sont des documents de
travail interne, elles n'ont rien à faire dans le circuit de publication.
`_modeles/` accueille déjà les consignes, les gabarits et les specs — c'est sa
place.
