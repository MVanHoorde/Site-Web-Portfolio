# Lot CFA — ce que contient cette archive

*À décompresser à la racine du dépôt : l'arborescence de l'archive reproduit
celle du projet, les fichiers vont donc s'écraser au bon endroit.*

---

## Fichiers livrés

```
assets/css/cfa-commun.css              feuille commune, version 5
assets/img/cfa/logo-isaac-baseline.png renommé (il avait deux extensions)
cfa/index.html                         texte des trois paliers réécrit
cfa/outil-00 … outil-16                les dix-sept fiches
cfa-pager.mjs                          script de navigation entre outils
LOT-CFA-a-lire.md                      ce fichier
```

**Le `?v=` de la feuille passe à 5 dans tous les fichiers livrés.** Sans cela un
navigateur qui a la version 4 en cache afficherait la nouvelle mise en page avec
l'ancienne feuille — colonne non centrée, pager sans mise en forme.

---

## Ce qui change dans la feuille commune

**Le centrage.** Chaque composant portait son propre `max-width` (70ch pour un
paragraphe, 62ch pour une formule, 68ch pour un tableau) à l'intérieur d'un
article large de 1 000 px : le contenu se tassait à gauche, avec 300 px de vide
inutile à droite. Une seule variable, `--mesure`, commande maintenant la largeur
de tout le contenu, et les enfants directs de `article.lecture` se centrent.

Pour déborder volontairement — un tableau de quinze lignes, une figure large —
poser `.pleine-largeur` sur l'élément. C'est le cas du tableau de gammes du
palier 1 de l'Outil 1.

**Le pager.** Trois liens en pied de fiche : outil précédent, index, outil
suivant. Le libellé porte le numéro *et* le titre, parce que « Outil 2 → »
n'apprend rien sur ce qui attend l'élève. Sur mobile la pile passe le suivant en
premier. Aux deux extrémités du livret, le lien manquant est remplacé par un
espace de même gabarit, sinon le lien restant sauterait d'un côté à l'autre.

**Trois composants nouveaux**, tous nés du nouveau palier 3 :
`.enonce` (la mise en situation), `table.constructeur` (l'extrait de
documentation, dont le `caption` porte obligatoirement la mention « valeurs
simulées »), et `figure.figure` avec ses conventions de tracé.

---

## Ce qui change dans les fiches

**Quatre étapes au lieu de cinq.** L'ancienne étape 3 (le calcul avec les
unités) et l'ancienne étape 4 (le résultat) fusionnent en une seule :
« L'application numérique ». Les unités ne sont plus recopiées sur chaque
opérande ; elles réapparaissent sur le résultat, encadré. Les seize autres
fiches sont alignées sur ce format.

*Sur le critère de la grille qui crédite les « unités intermédiaires » : chaque
résultat intermédiaire garde son unité et reste encadré. C'est seulement à
l'intérieur d'une ligne de calcul que les unités disparaissent.*

**Le palier 3 a la forme d'un sujet.** Partout : une mise en situation nommée,
un extrait de documentation constructeur simulé, et des questions **sans aucune
indication**. Le guidage décroît maintenant franchement — indications nombreuses
au palier 1, une seule au palier 2, zéro au palier 3.

Quand une relation est nécessaire mais ne relève pas de la fiche (le moment
`M = F × bras`, la composante `P × sin α`, la condition d'équilibre), elle est
**donnée dans l'énoncé, sous le tableau**. C'est ce que fait un sujet d'examen :
ce n'est pas une indication, c'est une donnée.

**Des données inutiles dans chaque tableau**, entre une et quatre lignes, jamais
signalées. Le tri fait partie du travail, et c'est l'un des gestes les mieux
payés à l'examen.

**Aucune valeur ne provient d'un sujet réel.** Les sujets restent entièrement
disponibles pour les examens blancs.

**Neuf figures ont été produites**, en SVG écrit dans la page : elles
s'impriment avec la fiche, ne dépendent d'aucun fichier et suivent les couleurs
de la charte. Outils 2, 5, 9, 10, 11, 12, 13, 14 (deux figures) et 16. Chacune
porte un `<title>` et un `<desc>`, et aucune information n'est portée par la
seule couleur.

---

## Corrections issues de l'audit

| | |
|---|---|
| Outil 4 | l'accroche divulguait les chiffres du palier 2 (114 / 129) — couple de valeurs remplacé |
| Outil 7 | le vérin de l'exemple est désormais *le même* que celui de l'Outil 2, mêmes chiffres, et la fiche le dit |
| Outil 9 | le palier 3 donnait un effort 30 % au-dessus de la documentation ; l'ajout de la ligne « nombre de pistons » ramène le résultat à moins de 1 % de la valeur annoncée, donc dans la tolérance |
| Outil 16 | la vérification des 45° affirmait « toujours », alors que l'encart juste au-dessus expliquait que l'angle peut être pris depuis la verticale |
| Outils 13 et 14 | ils étaient les seules fiches sous 8/10 sans contrepoids — la règle est maintenant uniforme |
| Outil 5 | la cote de 68 mm est portée par la figure, plus par le texte : il faut la lire sur le dessin |
| logo | `logo-isaac-baseline.png.png` renommé — l'en-tête de l'index était cassé |

---

## Ce qui reste à faire, et que ce lot ne fait pas

1. **Les quinze fiches A4 manquantes.** Les liens « version à imprimer »
   pointent toujours dans le vide pour les outils 1 et 3 à 16. C'est le chantier
   bloquant pour les MVTR, chez qui le papier est le seul canal.
2. **`fiches/cfa/fiche-outil-00.html` et `-02.html` sont périmées.** Elles
   portent encore cinq étapes, et le palier 3 de la 02 n'existe plus sous cette
   forme.
3. **`_corriges-cfa/corrige-outil-02.html` est faux** : son palier 3 a été
   remplacé. Le corrigé 00 est à revoir sur la numérotation des étapes.
4. **Quinze corrigés restent à écrire.** Le gabarit des deux existants — chemin
   alternatif crédité, pièges nommés, « ce qu'on valorise » — est le bon ; c'est
   lui qu'il faut suivre.
5. **La Cartographie parle encore des cinq règles.** Un paragraphe à reprendre.
6. **Décider de ce qui est réservé aux examens blancs.** Une ligne dans le socle
   suffit : sessions réservées d'un côté, sessions citables sur le site de
   l'autre. Tant que les paliers 3 sont entièrement simulés le risque est nul,
   mais il apparaîtra le jour où un extrait d'énoncé authentique daté ira sur le
   recto d'une fiche.

---

## Vérification

```bash
node verifier.mjs --silence     # liens, doublons d'identifiants
node cfa-pager.mjs --essai      # ce que le pager changerait, sans écrire
```

Le vérificateur signale encore les quinze fiches A4 absentes : c'est le point 1
ci-dessus, pas une régression.
