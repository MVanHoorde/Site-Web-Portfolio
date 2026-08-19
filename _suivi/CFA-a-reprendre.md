# Livret CFA — points de forme reportés

*Ce qui est repéré mais volontairement remis à plus tard, pour ne pas
interrompre la production du contenu. Une ligne disparaît d'ici quand elle
est traitée — ce fichier décrit le reste à faire, pas l'historique.*

---

## À la passe « impression et PDF », après validation des contenus

Cette passe se fait **une seule fois**, sur les dix-sept fiches A4 en même
temps, quand le contenu écran est arrêté. Rien ne sert d'ajuster au millimètre
des énoncés qui bougent encore.

| Point | Détail |
|---|---|
| **Fond blanc** | Les fiches A4 affichent le papier crème `--papier` à l'écran. Le `@media print` force déjà `#fff`, mais la fiche doit être blanche **dès l'écran** : c'est ce qu'on relit avant d'envoyer à la photocopieuse, et c'est là qu'on juge l'encre. Relevé le 18/08/2026. |
| **Taille de police** | Calibrée à 10,5 pt au jugé, jamais vérifiée sur une impression réelle. |
| **Tenue en deux pages** | La règle « exactement deux pages » n'a jamais été contrôlée sur du papier. Le verso de l'Outil 0 est le plus chargé : à imprimer en premier. |
| **Arrangement général** | Reprise de la mise en page des fiches à cette occasion. |

## Contenu

| Outil | Point |
|---|---|
| **1** | Le « à quoi ça sert » est trop court. L'étoffer, et surtout **faire le lien explicite entre l'exposant et la dimension** : pourquoi 10³ pour une longueur, 10⁶ pour une surface, 10⁹ pour un volume. Le tableau montre le résultat sans dire d'où il vient. |

## Liens vers les fiches A4

Les dix-sept pages écran annoncent « Fiche A4 recto-verso : version à
imprimer ». **Quinze de ces liens ne mènent nulle part** — seules les fiches 00
et 02 existent. `verifier.mjs` les signale comme liens cassés. Ils se
résorberont d'eux-mêmes à la passe « impression et PDF » ci-dessus ; d'ici là,
un élève qui clique tombe sur une page d'erreur.

## Règle de structure, acquise

**Une question par zone de travail, sans exception.** Un palier qui présente
un énoncé puis un espace de réponse sans consigne explicite est incomplet,
même quand la consigne semble évidente.

Les dix-sept pages écran sont à cette structure — `.contexte`, `.question`
nommée, `.reponse` — et plus aucune ne porte l'ancien `.ligne` / `span.trou`.
