# À LIRE — livraison t0 du 23/08/2026

Archive à **extraire à la racine du dépôt**. Elle ne modifie aucun fichier
existant : elle en ajoute.

## Ce que contient l'archive

```
BRIEF-CLAUDE-CODE-T0-refonte.md                    (créé)
A-LIRE-T0-images-et-brief.md                       (créé — ce fichier)
_suivi/t0-audit-2026-08-23.md                      (créé)
_suivi/t0-images.md                                (créé)
assets/img/snt/2nde-snt-t0-systemes-informatises/  (créé — 47 images, 2,3 Mo)
```

`_suivi/t0-images-a-trouver.md`, envoyé plus tôt dans la session, est
**remplacé** par `_suivi/t0-images.md`. Si tu l'avais déjà déposé, supprime-le.

## Ce qu'il faut faire ensuite

1. Extraire l'archive à la racine.
2. `git status` — vérifier que rien d'existant n'est touché.
3. Ouvrir Claude Code dans VS Code, terminal intégré sur le dépôt, et lui
   donner l'instruction de lancement (voir plus bas).

## Les 47 images

Extraites de tes trois PDF de cours (41), de Wikimedia Commons (2) et de tes
propres photos (4). Toutes redimensionnées à 1100 px maximum, jamais agrandies,
JPEG qualité 84.

**Le numéro de série de la vieille tour est flouté.** Repéré par analyse de
pixels puis contrôlé au zoom.

**Tes photos sont redressées.** Elles sortaient du téléphone en 4000 × 3000
paysage avec une balise EXIF d'orientation que tous les navigateurs
n'honorent pas — un iPad ancien pouvait les afficher couchées.

Trois pièges sont documentés dans `_suivi/t0-images.md` et repris dans le
brief : la carte mère est trop petite pour l'exercice de légende pleine
largeur, le schéma de résolution d'écran est à refaire en SVG, et six images
ne valent qu'en vignette.

## Ce qui reste de ton côté

Rien de bloquant. Par ordre d'utilité :

1. **Deux ou trois systèmes « qui n'en ont pas l'air »** — borne de bus, caisse
   automatique, lave-linge. C'est l'accroche de la séance 1 et aucun de tes
   documents ne la couvre.
2. **Une carte mère haute définition** si tu tiens à l'exercice de légende en
   pleine largeur. Sinon on se rabat sur la photo de l'intérieur de ta machine.
3. Montre connectée, baie de serveurs, touchpad, SSD M.2 seul.

## L'instruction pour Claude Code

```
Lis BRIEF-CLAUDE-CODE-T0-refonte.md en entier, puis les fichiers
de son §1 dans l'ordre. Ne commence à écrire qu'ensuite.
Travaille lot par lot, avec vérification intermédiaire :
d'abord le portage sur le moteur, puis les trois séances, puis
les points d'intégration du §7. Attends ma validation entre chaque.
```

Le découpage en lots avec pause est important : sur une refonte de cette
taille, une passe unique produit un diff que personne ne peut relire.
