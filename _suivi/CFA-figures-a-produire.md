# Figures du livret CFA — état

*Les dix emplacements réservés en V1 par le composant `.figure-a-produire` sont
tous pourvus : **plus aucune page écran ne porte de cadre en attente**. Ce
fichier décrit donc l'état courant des figures, et ce qui reste à leur sujet.*

**Discipline conservée.** Une entrée par emplacement, jamais par idée. Si un
cadre pointillé réapparaît dans une fiche, l'entrée se réinscrit ici — sinon on
produirait une figure qui n'a plus de place où aller.

---

## Ce qui existe, et ce qui a été corrigé le 19/08/2026

| Outil | Emplacement | État |
|:-:|---|---|
| 2 | recto | Coupe du vérin **reprise** : les deux chambres, le diamètre de tige coté, les sections S et S′ nommées. Une **seconde figure** montre les deux sections vues de face. |
| 5 | verso, palier 3 | **Produite.** Bras de levage à l'échelle 1:25, axes A et B, distance cotée au-dessus du bras, force perpendiculaire avec l'angle droit marqué. L'énoncé disait « reproduit ci-dessus » sans rien au-dessus. |
| 9 | recto | Couronne : inchangée, elle fonctionnait. |
| 10 | recto | **Corrigée** : l'angle droit était marqué sur un angle aigu, et le libellé de l'hypoténuse posé sur le trait. |
| 11 | recto | **Corrigée** : arc de l'angle α aligné sur l'hypoténuse, étiquette dans l'ouverture, rappel SOH · CAH · TOA remis en colonne (le tiret se lisait comme un signe moins). |
| 11 | exemple | **Produite.** Schéma de la rampe avec les données portées dessus — c'est l'objet de la nouvelle étape 2 de l'exemple. |
| 12 | recto | **Corrigée** : à 6,8°, aucune étiquette ne tient dans le secteur ; arc élargi et ligne de renvoi, comme sur un plan. |
| 13 | recto | Secteur de cercle : inchangé, α remplacé par θ. |
| 14 | recto | **Produite.** Les deux composantes d'une force inclinée, projections en pointillé, angle depuis l'horizontale, formules sous le dessin. |
| 14 | verso, palier 1 | **Reprise en entier.** Le quadrillage est un `<pattern>`, les axes portent leur pointe et leur nom, les vecteurs s'appellent F₁ F₂ F₃, et **les tracés correspondent enfin aux normes annoncées** (5, 10, 13). |
| 14 | verso, palier 2 | **Reprise en entier.** Le vérin était tracé à 18° pour un énoncé qui annonce 40° ; l'angle se posait sur la pièce ; l'axe du vérin n'était pas distingué de l'horizontale de référence. |
| 14 | verso, palier 3 | **Produite.** Les quatre actions tracées à l'échelle (un carreau = 1 000 N) depuis un même point, pour se comparer d'un coup d'œil. |
| 15 | recto | **Produite.** Les deux forces telles que l'énoncé les donne, puis la même addition faite bout à bout. |
| 15 | verso, palier 1 | **Reprise.** Vecteurs nommés, axes nommés, départ hors origine, résultante en pointillé. |
| 16 | recto | **Corrigée** : axes fléchés, angle dégagé, flèche sur le vecteur. |

## Ce qui reste

- **Les figures des fiches A4.** Seule la fiche 02 en porte une (les deux
  sections vues de face). Les autres fiches A4 n'existent pas encore ; quand
  elles seront produites, chaque figure de la page écran devra y être reportée —
  §8 des consignes : aucune information ne doit exister uniquement à l'écran.
- **Le contrôle sur photocopie.** Toutes les figures sont lisibles en noir et
  blanc à l'écran ; aucune n'a été vérifiée sur une vraie photocopie. À faire à
  la passe impression.

## Contraintes communes, inchangées

- **SVG**, jamais d'image bitmap.
- **Lisibles en noir et blanc.** Une figure qui ne se distingue qu'à la couleur
  est inutilisable : le livret vit sur des photocopies.
- **Cotées en toutes lettres.** Une grandeur portée par la seule position dans
  le dessin n'est pas lue par ce public.
- **Aucune figure n'est indispensable à la résolution.** L'énoncé doit rester
  suffisant sans elle.
- **Le texte ne dépasse jamais du `viewBox`** : le SVG le rogne en plein mot.
  Un harnais de mesure vérifie ce point sur les dix-huit pages — voir
  `JOURNAL.md`, 19/08/2026.
