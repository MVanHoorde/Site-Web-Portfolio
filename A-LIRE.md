# Réparation — 23/07/2026

**Extraire à la racine du dépôt, écraser, committer.** Rien d'autre à faire :
pas de script, pas de renommage, pas de suppression.

## Ce qui était cassé, et pourquoi

Le commentaire CSS que j'avais écrit pour la règle `.a-venir` contenait un
exemple de balise, écrit en toutes lettres :

```
Un <a href="#"> avait l'air cliquable et ne faisait rien…
```

Mon script a fait deux choses, dans cet ordre : (1) insérer ce CSS dans les
pages, (2) transformer tous les `<a href="#">` en mentions « en travaux ». À
l'étape 2, il est tombé sur **son propre commentaire** et l'a traité comme un
vrai lien. Son expression régulière a alors cherché le `</a>` suivant — et a
avalé tout ce qui se trouvait entre les deux.

| Séquence | Contenu avalé |
|---|---|
| t0 | 1 322 caractères |
| **t1** | **5 534 caractères** |
| t2 | 1 174 · t3 1 253 · t4 1 259 · t5 1 263 · t6 1 267 · t7 1 186 |

Le CSS s'est en plus retrouvé **à l'intérieur d'un `<svg>`** au lieu de la
feuille de la page, et un vrai lien a perdu son `</a>`.

## Ce que la réparation fait

1. Retire le bloc CSS mal placé des huit séquences.
2. **Restitue caractère pour caractère** le contenu avalé.
3. Rend son `</a>` au lien qui l'avait perdu.
4. Repose le CSS dans la **feuille de la page** — jamais dans un `<svg>` —, et
   pour `t1` dans `assets/css/sequence-snt.css`, qu'elle charge déjà.
5. Réécrit le commentaire **sans la moindre balise**, avec la consigne de ne
   plus jamais en mettre.

## Contrôles passés

- `<a>` / `</a>` équilibrés sur les huit séquences, et les écarts avec l'état
  d'origine correspondent **exactement** aux liens légitimement convertis
  (t0 : 2 · t2 : 2 · t3 : 2 · t4 : 4 · t5 : 7 · t6 : 2 · t7 : 2).
- `<style>` / `</style>` équilibrés.
- Plus aucun CSS à l'intérieur d'un `<svg>`.
- `node verifier.mjs` → les 2 problèmes connus, rien de plus.

## Un défaut préexistant, repéré au passage

`cahier/cahier-vacances-2nde-1re-spe.html` a **2 `<style>` pour 1 `</style>`**.
Il est là depuis avant tous ces chantiers (vérifié sur l'archive d'origine) et
il n'est pas de mon fait. La ligne 13 mentionne `<style>` dans un commentaire
HTML — c'est probablement le faux positif. À regarder à froid, sans urgence.
