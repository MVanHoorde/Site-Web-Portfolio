# Livret transversal CFA — référence pédagogique

*Extrait expurgé du document de conception, destiné au dépôt. Il ne contient que ce qui est publiable : l'architecture, les fréquences, le partage livret/cours, et les règles de rédaction. Le document de travail complet reste hors dépôt.*

---

## 0. Ce que ce livret cherche à corriger

Deux publics d'apprentis, un même constat : niveaux très hétérogènes, **lacunes mathématiques quasi générales** — y compris chez les meilleurs, sur les conversions d'unités et l'isolement d'une inconnue — et un **manque de confiance** qui est le facteur limitant principal, avant le niveau réel.

L'investissement hors séance est très limité. Ce qui se joue en séance se joue vraiment. Les polycopiés denses ne passent pas : un document long est un document non lu.

D'où le format : recto-verso, attaquable sans lecture préalable, commençant par un palier où personne ne peut échouer.

## 1. Le résultat qui fonde le livret

Le dépouillement de dix sessions de l'épreuve E4 du BTS MMCM donne un constat net.

> **Sept choses sont présentes dans chacune des dix sessions** : les conversions d'unités, les unités de pression, les aires et volumes, l'enchaînement de plusieurs formules, l'isolement d'une inconnue, la lecture d'un document constructeur, et l'encadrement dans une tolérance.
>
> Aucune n'est de la mécanique. Toutes sont de niveau collège, ou de la lecture de tableau.

Trois écarts à l'intuition en découlent :

**La cinématique élémentaire est le vrai poids lourd, pas la statique.** `V = d/t` et ses réarrangements sont présents partout, systématiquement en début d'épreuve — c'est-à-dire à l'endroit où l'élève doit encore accrocher le sujet. La statique, elle, n'apparaît que dans trois sessions sur dix.

**La lecture de documents rapporte plus que le calcul.** Relever une valeur dans un tableau ou sur une courbe, la comparer à un intervalle, conclure : c'est présent dans les dix sessions, dans toutes les parties de l'épreuve.

**La résolution graphique est une porte de sortie, pas une charge.** Certaines sessions laissent explicitement le choix entre graphique et analytique pour le même résultat. Pour un groupe fragile en algèbre, c'est le même nombre de points sans une seule équation. À enseigner comme une stratégie d'examen, en le disant en clair.

## 2. Les cinq règles de rédaction d'un calcul

Elles fondent l'Outil 0 et servent de format à **tous** les exemples résolus du livret.

1. **Relever et recopier les données avec leur unité**, avant tout calcul.
2. **Écrire la relation en lettres** avant de remplacer.
3. **Remplacer avec les unités**, y compris les unités intermédiaires.
4. **Encadrer le résultat avec son unité.**
5. **Conclure par une phrase chiffrée.**

Le message à donner au public, et il est vrai :

> Un calcul posé proprement et faux rapporte une part importante des points.
> Une bonne réponse jetée sans détail en perd une part équivalente.
> La seule copie qui ne rapporte rien est la copie vide.

Pour des apprentis qui se bloquent par peur de se tromper, c'est un déverrouillage. C'est aussi de la bonne pratique universelle, qui se justifie d'elle-même : ces règles ne sont adossées à aucun document interne et ne doivent jamais être présentées comme telles.

## 3. Les dix-sept outils

**Fiche d'ouverture**

| N° | Fiche | Poids |
|:-:|---|:-:|
| 0 | Rédiger un calcul qui rapporte des points | 10/10 |

**Bloc A — Nombres, unités, grandeurs**

| N° | Fiche | Poids |
|:-:|---|:-:|
| 1 | Conversions d'unités et puissances de dix | 10/10 |
| 2 | Les unités de pression — bar, Pa, kPa, MPa, et `1 MPa = 1 N/mm²` | 10/10 |
| 3 | Vitesses et fréquences de rotation — km/h ↔ m/s, tr/min ↔ rad/s | 9/10 |
| 4 | Pourcentages — appliquer, variation, écart à une référence, pente en % | 8/10 |
| 5 | Proportionnalité, produit en croix et échelles | 8/10 |
| 6 | Ordres de grandeur, arrondis, « montrer que ≈ » | 10/10 |

**Bloc B — Calcul littéral**

| N° | Fiche | Poids |
|:-:|---|:-:|
| 7 | Isoler une inconnue dans une formule | 10/10 |
| 8 | Enchaîner plusieurs formules | 10/10 |

L'outil 8 est la structure même de l'épreuve : le résultat d'un calcul devient la donnée du suivant, et une conversion ratée au départ fait tomber une partie entière. C'est l'argument à donner aux élèves pour justifier le temps passé sur les outils 1 à 3.

**Bloc C — Géométrie**

| N° | Fiche | Poids |
|:-:|---|:-:|
| 9 | Aires et volumes utiles — disque, **couronne**, cylindre, prisme, tas de matériau | 10/10 |
| 10 | Pythagore et distances | 1/10 |
| 11 | Trigonométrie dans le triangle rectangle | 4/10 |
| 12 | Angles, pentes et inclinaisons — pente en % ↔ angle, `sin α ≈ tan α` | 4/10 |
| 13 | Arc de cercle, tours et radians | 5/10 |

La couronne, `π(D² − d²)/4`, est bien plus fréquente en hydraulique que le disque simple : toute chambre annulaire de vérin ou de piston de frein la demande. À traiter explicitement dans l'outil 9.

**Bloc D — Vecteurs**

| N° | Fiche | Poids |
|:-:|---|:-:|
| 14 | Lire un vecteur — direction, sens, norme, composantes | 5/10 |
| 15 | Additionner des vecteurs — composition des vitesses, résultante | 2/10 |
| 16 | Projeter une force sur deux axes | 2/10 |

## 4. Deux points de frontière tranchés

**L'échelle.** « Lire et utiliser une échelle » relève de l'outil 5, comme proportionnalité appliquée à un dessin. La **méthode** de résolution graphique en statique reste au cours.

**La projection d'une force (outil 16).** La fiche traite la projection d'un vecteur quelconque ; le cours reprend le geste sur une force, avec le vocabulaire mécanique.

## 5. Socle garanti et ambition détachable

Le programme demande d'aller plus loin que l'examen. Certains groupes ne suivront pas. La règle : pour chaque notion, le socle non négociable est défini à l'avance, de sorte qu'un groupe qui décroche s'arrête proprement au socle au lieu de sortir du chapitre les mains vides.

| Notion | Socle — jamais sacrifié | Ambition — détachable |
|---|---|---|
| Rédaction d'un calcul | les cinq règles, appliquées systématiquement | *sans objet* |
| Cinématique | `V = d/t`, `a = V/t`, `ω = 2πN/60`, `V = R·ω` sur valeurs converties | CIR, équiprojectivité, composition des vitesses |
| Documents constructeur | relever une valeur, la comparer à un intervalle, conclure par une phrase chiffrée | arbre de défaillance, méthode complète de diagnostic |
| Énergie / puissance | `P = F·V`, `P = W/t`, `W = mgh`, en chaîne | bilans énergétiques complets |
| Débit / cylindrée | `Q = N × Cy`, maîtrise des unités | rendements volumétriques distincts |
| Rendements | rendement global = produit des rendements | analyse de l'origine des pertes |
| Rapports de transmission | rapport global = produit des rapports ; sens de rotation | Willis, trains épicycloïdaux |
| Moment / couple | `C = F × bras`, avec conversion mm → m | moment d'inertie, équilibrage |
| Statique | somme des moments = 0, isoler `F` à partir d'un bilan **fourni** | écriture torsorielle par l'élève |
| Résolution graphique | choisir une échelle, tracer, mesurer, revenir aux newtons | dynamique des forces complète |
| Barycentre | `xG = Σmᵢxᵢ / Σmᵢ` sur deux ou trois masses | cas spatial |
| RdM | `σ = F/S`, comparaison à `Re`, conclusion binaire | flexion, torsion, flambage |

La colonne de gauche est exactement le contenu qui permet de composer honorablement. Tout ce qui est à droite est du référentiel légitime, pas du remplissage — mais rien à droite ne doit conditionner l'accès à ce qui est à gauche.

## 6. Ce qui se mutualise entre les deux publics

Les deux diplômes s'achèvent sur une **épreuve écrite d'analyse sur dossier technique**. Le bac pro comporte en outre une épreuve scientifique avec une partie mathématiques, sur laquelle le livret tombe directement.

**Se mutualise** : les dix-sept fiches intégralement, le format à trois paliers, la colonne socle du tableau ci-dessus, et la lecture de documentation avec jugement de conformité — cœur des deux métiers.

**Ne se mutualise pas** : le palier 3, la colonne ambition, le rythme et les attentes d'évaluation.

**Réserve honnête** : le côté BTS repose sur le dépouillement de dix sessions réelles. Rien d'équivalent n'existe encore côté bac pro. Tant que ce travail n'est pas fait, « les mêmes outils servent aux deux » reste une hypothèse raisonnable, pas un résultat démontré.

## 7. Principe de niveau

Le niveau se joue **par outil, jamais par élève**. Trois paliers par fiche ; chacun avance jusqu'où il tient, fiche par fiche. Pas d'étiquetage, pas de choix à assumer devant le groupe.

Un compteur de complétion sur l'index — « 7 outils sur 17 travaillés » — produit plus d'effet chez ce public qu'une note, et ne coûte rien à la souveraineté de l'enseignant sur l'évaluation.
