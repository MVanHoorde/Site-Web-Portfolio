# A-LIRE — Livraison du 22/08/2026 · audit des séances 2 et 3 du thème 1

## Contenu de l'archive

```
BRIEF-CLAUDE-CODE-T1-audit-seances-2-3.md   ← à la racine du dépôt
A-LIRE-T1-AUDIT-2.md                        ← ce fichier
img/Principe_fibre_optique_2.png            ← à ranger dans assets/img/snt/
img/MultimodeFiber.jpg                      ← à ranger dans assets/img/snt/
```

Le brief et ce fichier vont **à la racine**. Les deux images vont dans
`assets/img/snt/` — ce sont des illustrations destinées aux élèves, donc dans
le circuit de publication, contrairement aux PNG de `_modeles/`.

## `git diff --stat` attendu

Quatre créations, aucun fichier modifié :

```
 A-LIRE-T1-AUDIT-2.md                        | (nouveau)
 BRIEF-CLAUDE-CODE-T1-audit-seances-2-3.md   | (nouveau)
 assets/img/snt/MultimodeFiber.jpg           | (nouveau, binaire)
 assets/img/snt/Principe_fibre_optique_2.png | (nouveau, binaire)
```

## Le point le plus important du brief

**La numérotation.** Ce brief a été écrit sur l'état du dépôt d'avant le brief
n° 1. Si Claude Code a déjà appliqué la découpe de la séance 1, tous les numéros
ont glissé d'un cran. Le §0 du brief porte la table de correspondance et la
consigne : se repérer aux `data-cle`, jamais aux numéros seuls.

## Attribution des images — à ne pas négliger

Les deux fichiers viennent de Wikimedia Commons et **exigent l'attribution** :

- `Principe_fibre_optique_2.png` — Christophe.Finot, **CC BY-SA 2.5**
  (partage à l'identique imposé)
- `MultimodeFiber.jpg` — Hhedeshian, **CC BY 3.0**

Chaque légende doit porter auteur, nom de fichier, licence et lien. Le dépôt
est public : « source : Wikimedia » ne suffit pas.

## Ce que Claude Code ne doit PAS faire

**Trois choses sont explicitement hors de sa main.**

1. **La migration 014.** Le bouton « Partager avec la classe » échoue parce que
   `bdd/schema/014-reponses-personnelles.sql` n'a pas été exécuté — pas à cause
   d'un bug JS. Le code de la page est correct. Tu l'exécutes toi-même.

2. **L'allègement de l'étape 3.2** (lot M10). Claude Code produit un plan, il
   n'applique rien. Le contenu pédagogique est à toi.

3. **Le déplacement du « pour aller plus loin » vers la nouvelle séance 2.** La
   dictée était ambiguë et tu n'as pas pu la reconstituer. Le brief expose les
   deux lectures possibles et laisse en l'état. Ma lecture : c'est le bonus
   Pouzin / CYCLADES de l'ancienne étape 1.5 qui devient le bonus de fin de la
   nouvelle séance 2 — il porte déjà le podcast France Culture sur CYCLADES, et
   l'enquête box n'a rien à voir avec ARPANET. Mais je ne tranche pas.

## Un point resté sans diagnostic

**Le bilan de l'activité qui refuse de s'ouvrir** (lot N6). Je n'ai pas pu
identifier la cause par la lecture seule, et le test navigateur n'a pas pu être
fait. J'ai écarté deux fausses pistes — ce n'est ni l'échec du partage, ni les
dépôts de copie d'écran — et le brief demande à Claude Code de diagnostiquer
dans un navigateur, avec la consigne de corriger la cause et non de relâcher la
condition d'ouverture du bilan.

## Ta question sur les grilles de pré-correction

Réponse : **couverture complète pour le thème 1.** 30 codes `data-focus-code`
dans la page, 30 grilles dans `ia-snt/criteres-snt.json`, aucun orphelin dans
un sens ni dans l'autre. Rien à produire. C'est hors brief, il n'y a rien à
faire.
