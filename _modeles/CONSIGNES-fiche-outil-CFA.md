# CONSIGNES — fiche-outil CFA

*Conventions de production de la troisième famille de pages. Même rôle que `CONSIGNES-chapitre-PC.md` pour les chapitres de physique-chimie. La doc décrit l'état courant : quand une décision change, on réécrit le passage, on n'empile pas.*

---

## 1. Nommage

| Objet | Forme | Exemple |
|---|---|---|
| Page écran | `cfa/outil-NN-<slug>.html` | `cfa/outil-02-unites-de-pression.html` |
| Fiche A4 | `fiches/cfa/fiche-outil-NN.html` | `fiches/cfa/fiche-outil-02.html` |
| Corrigé A4 | `_corriges-cfa/corrige-outil-NN.html` | hors dépôt |
| Identifiant interne | `cfa-oNN` | `cfa-o02` |
| Images | `assets/img/cfa/outil-NN/` | — |

`NN` sur deux chiffres, de `00` à `16`. Le slug est en minuscules, sans accent, mots séparés par des tirets.

## 2. Structure d'une fiche — recto

Trois blocs, dans cet ordre, sans exception.

**En-tête.** Numéro et titre de l'outil, badge de poids, logo de l'établissement en petit. Une ligne, pas deux.

**À quoi ça sert.** Une phrase. Pas un paragraphe. Elle dit dans quelle situation concrète l'outil se déclenche, pas ce qu'il est.

**La règle.** Encadré, quatre lignes maximum. La formule, les grandeurs, les unités. Rien d'autre.

**Un exemple entièrement résolu**, rédigé selon les quatre règles de l'Outil 0 — voir §5. C'est le seul endroit du recto où l'on montre un calcul complet. La méthode se montre, elle ne s'énonce pas.

## 3. Structure d'une fiche — verso

Trois paliers. Le gradient est **triple** : difficulté, contexte, appartenance.

| | Contexte | Chiffres | Public |
|---|---|---|---|
| **Palier 1 — guidé** | quotidien, universel | ronds, choisis | tout le monde |
| **Palier 2 — en autonomie** | atelier ou véhicule générique | réels | BTS et MVTR à parité |
| **Palier 3 — en situation** | engin, documentation, enchaînement | réels | marqué **BTS** |

**Palier 1.** Le calcul est déjà amorcé. Deux trous à combler, pas plus. Personne ne peut échouer. C'est le palier qui réamorce la confiance, il n'a aucune autre fonction.

**Ce qui est amorcé, c'est la structure, pas l'opération.** Une amorce qui écrit
« V = 90 ÷ ___ » ne demande plus que d'appuyer sur une touche : elle a fait le
travail. Sur une série de questions semblables, **la première porte l'amorce
complète et sert de modèle** ; les suivantes n'ont qu'un trou de résultat.

**Palier 2.** Même outil, énoncé nu. C'est ici que se joue la mutualisation entre les deux publics — les deux métiers doivent s'y reconnaître également.

**Palier 3.** Enchaînement de deux ou trois étapes, contexte du diplôme. Porte la mention **BTS** de façon visible. Les MVTR le voient et peuvent s'y frotter ; ce n'est pas attendu d'eux.

Durée cible d'un passage complet sur une fiche : **30 minutes** — 5 pour le palier 1, 10 pour le 2, 15 pour le 3. C'est ce qui calibre la longueur des énoncés.

## 4. Badge de poids

```
⬛⬛⬛ Tombé dans 10 sujets d'examen sur 10
```

| Badge | Seuil |
|---|---|
| ⬛⬛⬛ Incontournable | 8–10 / 10 |
| ⬛⬛ Fréquent | 4–7 / 10 |
| ⬛ Ponctuel | 1–3 / 10 |

Pas de liste de sessions. Le décompte porte sur les dix dernières sessions de l'épreuve E4 du BTS ; une seule phrase l'explique sur la page d'index, et on n'y revient plus.

**Le badge est en carrés, pas en couleur** : il doit rester lisible en noir et blanc sur une photocopie.

**Sous 4/10, une ligne « Pourquoi elle compte quand même » est obligatoire**, plus la liste des outils que celui-ci débloque. Afficher « 1 sujet sur 10 » sur la fiche Pythagore sans contrepoids la ferait sauter. La motivation bascule alors du poids direct au poids indirect, ce qui est la vérité.

**Le compteur reste neutre dans la moitié haute de la fiche.** Le mot « examen » n'apparaît qu'au palier 3, qui est le seul élément marqué BTS.

## 5. Les quatre règles de rédaction — format de tous les exemples résolus

Tout calcul montré dans le livret, sans exception, suit ces quatre étapes :

1. **Relever les données utiles, avec leur unité**, avant tout calcul.
2. **Écrire la relation en lettres** avant de remplacer.
3. **Faire l'application numérique**, et **encadrer le résultat avec son unité**.
4. **Conclure par une phrase chiffrée** — jamais « c'est bon » ou « ce n'est pas conforme » tout seul.

L'application numérique se fait **en nombres** : on ne recopie pas les unités
à l'intérieur de la ligne de calcul, elles réapparaissent sur le résultat
encadré. C'est ce qui se fait partout, c'est plus rapide à écrire, et c'est ce
que le correcteur cherche — un résultat qui porte son unité, pas une unité
répétée trois fois sur la même ligne.

Ce sont des règles de bonne pratique universelles, qui se justifient d'elles-mêmes. Elles ne s'appuient sur aucun document interne et ne doivent jamais être présentées comme telles.

## 6. Mise en page — une colonne, un bord d'attaque

**Tout le contenu d'une page écran tient dans une seule colonne**, large de
`--mesure` (36 rem), centrée dans la page. Tous les blocs — titre, paragraphe,
encart, tableau, figure, palier — commencent sur **la même verticale**. C'est la
seule chose qui donne une ligne de fuite à l'œil.

- `--mesure` est **en rem, jamais en ch**. Une largeur en `ch` se recalcule dans
  la police de chaque bloc : un titre, un paragraphe et un aparté en monospace
  n'obtiennent pas la même largeur, donc pas la même marge une fois centrés, et
  le bord gauche descend en escalier.
- **Aucun composant ne pose de `max-width`.** La largeur est commandée une seule
  fois, au `:root`.
- **Aucun composant ne pose le raccourci `margin`** avec un sélecteur qui pèse
  autant que `article.lecture > *` (0-1-1) : le raccourci remet les marges
  latérales à zéro et le bloc sort seul de la colonne. Écrire `margin-block`.
- Pour déborder volontairement : `.pleine-largeur` sur l'élément. À n'employer
  que si le contenu le réclame vraiment — un tableau à quatre colonnes courtes
  n'en a pas besoin, et étalé sur toute la page il cesse de se lire en ligne.

### Quand centrer

Le centrage se **demande**, il n'est jamais le défaut. Il est réservé à :

- les **valeurs numériques** en colonne de tableau — `.valeurs` sur le `<table>`
  centre toutes les colonnes sauf la première, qui nomme ;
- les **schémas en cases** — le produit en croix de l'Outil 5, un relevé qui
  n'est fait que de nombres (Outil 14) : là, la première colonne se centre aussi ;
- les **blocs-repères courts** qu'on doit retrouver de mémoire (SOH · CAH · TOA
  de l'Outil 11) ;
- les **cases à cocher** et les fractions.

Tout le reste s'aligne à gauche, **en-têtes de colonnes compris** : un en-tête
centré au-dessus d'une colonne alignée à gauche décroche le tableau. Une valeur
relevée qui est une phrase — une direction, un sens — porte `.mots` et s'aligne
à gauche comme le texte qu'elle est.

### Figures SVG

Le texte d'une figure **ne dépasse jamais du `viewBox`** : le SVG le rogne en
plein mot, sans prévenir. Une légende de plusieurs lignes se place **sous le
dessin**, pas à sa droite — descendre ne coûte que de la hauteur, alors qu'un
`viewBox` élargi rapetisse le dessin **et** le texte, jusqu'à l'illisible sur
une photocopie.

## 7. Composants CSS

`cfa-commun.css` dérive de `chapitre-commun.css`. Réutiliser les classes existantes plutôt que d'en créer.

**Repris tels quels** : `.formule-bloc`, `.eq-exo`, `.unites`, `.frac`, `.resultat`, `.etape`, `.methode`, `.encart`, `.aparte`, `.checklist`, `.exercice`.

**À créer** :

- `.poids` — le badge, carrés pleins et vides plus libellé, lisible en noir et blanc.
- `.palier` avec les variantes `.palier-1`, `.palier-2`, `.palier-3` — la troisième porte la marque BTS.
- `.trou` — l'emplacement à compléter du palier 1, un filet à remplir à la main.
- `.figure-a-produire` — cadre en pointillé, description d'une ligne, visible à l'écran comme à l'impression tant que la figure n'existe pas.
- `.valeurs` — sur un `<table class="tab">`, centre toutes les colonnes sauf la première. Voir §6.
- `.mots` — sur une cellule de `table.constructeur` dont la valeur relevée est une phrase et non un nombre.
- `.vec` — la flèche d'un vecteur, tracée en `em` (hampe + pointe), jamais le
  caractère combinant U+20D7 : il se place au petit bonheur selon la fonte et
  disparaît de certaines impressions.
- `.rac` + `.sous` — une racine carrée dont le trait couvre tout le radicande.
  Elle rend les parenthèses inutiles, et surtout elle dit **où la racine
  s'arrête** : c'est là qu'on se trompe sur une photocopie.
- `.grec` — une lettre grecque posée dans un contexte en italique. Voir §10.
- `.l` — l'enveloppe d'une ligne de formule dans `.formule-bloc .eq`. Voir §10.
- `.frac.grande` — une fraction qu'on veut voir de loin, quand la formule est
  l'objet même de la fiche.
- `.cote` — la bande signature de la famille CFA. Remplace `.spectre`. Même silhouette : bande d'encre de 6 px avec les trois repères aux positions 18 %, 31 % et 76 %, dans les trois accents de la charte. Ce qui change : les deux extrémités portent une pointe de flèche en réserve et un trait d'attache vertical, ce qui la fait lire comme une ligne de cote de dessin technique.

**Retiré, et à ne pas réintroduire** : `details.correction`. Les corrigés ne sont pas en ligne.

## 7 bis. Où va le travail de l'élève

Le livret est branché sur le dispositif de comptes du site (le même que la SNT).
Deux régimes, et **un seul à la fois** :

| | Connecté | Sans compte |
|---|---|---|
| Où va le travail | base Supabase, région Paris | `localStorage` de l'appareil |
| Ce que l'élève retrouve | tout, sur n'importe quel appareil | tout, sur cet appareil seulement |
| Ce que voit le professeur | quelles fiches sont travaillées | rien |

**Trois règles de production qui en découlent :**

1. **Un champ mémorisé porte `data-cle`**, et cette clé commence par le numéro
   de l'outil : `o07-p2-e`. C'est ce préfixe qui range la réponse dans la bonne
   fiche — une clé qui ne le respecte pas est perdue à la première connexion.
   La clé ne se calcule JAMAIS depuis la position du champ dans la page :
   insérer une question plus tard décalerait tout.
2. **La mention de bas de fiche porte `data-mention-donnees`.** Le HTML écrit la
   version « sans compte », qui est vraie tant que rien n'est connecté et qui
   reste lisible si le JavaScript ne tourne pas ; le script la remplace quand un
   compte est ouvert. Une page qui promet « rien n'est envoyé » alors qu'un
   compte est ouvert est un mensonge, pas un raccourci.
3. **Les deux scripts se chargent dans cet ordre**, `progression.js` d'abord :

```html
<script src="../assets/js/progression.js?v=3" defer></script>
<script src="../assets/js/cfa-livret.js?v=3" defer></script>
```

L'index porte `<body data-accueil="hub" data-accueil-url="index.html">` — c'est
le seul point d'entrée, la modale de connexion ne s'affiche que là. Les fiches
portent `data-accueil-url` et un `data-renvoi-texte` propre au livret : le texte
par défaut annonce que le travail sera perdu, ce qui est vrai en SNT et faux
ici.

## 8. Impression

Le gabarit A4 dérive de `_modeles/gabarit-fiche.html` et en conserve les règles `@page`.

- Une fiche = **exactement deux pages**. Déborder est un bug.
- Fond blanc forcé, pas d'aplat sombre : économie d'encre.
- Le badge, les paliers et les zones à compléter doivent rester lisibles en noir et blanc.
- Aucune information ne doit exister uniquement à l'écran. Si la page écran affiche quelque chose que la fiche A4 n'a pas, c'est une erreur.

## 9. Rédaction des énoncés

### Une question = une question telle qu'un sujet la poserait

C'est la règle qui commande toutes les autres de cette section.

- **Ne jamais confondre la question du sujet et les étapes de la résolution.**
  « Déterminer la section, puis la force, puis comparer » est un découpage de
  correction, pas un énoncé : un sujet demande la force. Les sous-questions
  a/b/c ne se justifient que si elles correspondent à de **vraies questions
  successives**, dont chacune réutilise le résultat de la précédente.
- **Bannir les consignes qui n'existent pas dans un sujet.** « Relever, parmi
  les données ci-dessus, celles qui sont nécessaires au calcul » n'apparaît
  jamais dans une épreuve — et elle donne la moitié de la réponse. Le tri des
  données fait partie du travail, il ne se demande pas.
- **Quand on montre la copie d'un élève fictif, citer d'abord la question qui
  lui a été posée**, dans un bloc `.enonce` portant `<span class="situation">La
  question posée</span>`. Sans elle, on ne sait pas ce qu'on juge.
- **Ne pas décrire ce que la figure montre déjà.** « Le premier vecteur va de
  3 carreaux vers la droite et 4 vers le haut » remplace le schéma par du texte,
  et rend la lecture graphique inutile.
- **Ne pas annoncer le nombre de réponses attendues** — « les deux valeurs
  aberrantes » dit qu'il y en a deux.

### Le reste

- Phrases courtes, une consigne par phrase.
- Verbe d'action à l'infinitif en tête : *calculer*, *relever*, *comparer*, *conclure*.
- Jamais « il suffit de », « on sait que », « rappelons que ».
- Le contexte tient en une phrase.
- Décor **véhicule au sens large** : voiture, poids lourd, engin de chantier, matériel d'atelier. Les trois partagent la cylindrée, la vitesse de rotation, la pression, le couple. Ne pas cloisonner par métier.
- Jamais le contexte d'un autre métier technique — pas d'usinage, pas de bureau d'études.
- Valeurs numériques **plausibles**, pas nécessairement exactes. C'est une mise en situation.
- Aucun énoncé d'examen reproduit, cité, ou transposé à l'identique.

---

## 10. Notations — un seul mot, un seul symbole

Le livret se lit dans le désordre : une notation qui change d'une fiche à
l'autre est lue comme une notion différente.

| Ce dont on parle | Ce qu'on écrit | Jamais |
|---|---|---|
| Une action mécanique | **force** | « effort » |
| Un vecteur | **`<span class="vec">F</span>`** — la flèche est tracée, pas composée | `F` nu, ou le caractère combinant U+20D7 |
| La norme d'un vecteur | **‖F⃗‖** | `F` seul quand le vecteur est dans la même phrase |
| Un écart relatif | **ε** | `e`, `E` |
| L'angle d'une pente, d'une pièce | **α** | — |
| L'angle d'une **rotation** | **θ** | `α` — dès qu'il y a mouvement, c'est θ |
| Une racine carrée | **`<span class="rac">√<span class="sous">…</span></span>`** | `√( … )` : la parenthèse ne dit pas où la racine s'arrête |
| Une lettre grecque dans une formule en italique | **`<span class="grec">`** | la lettre nue : en Garamond italique, α et « a » ont le même dessin |

**Deux pièges de mise en œuvre, tous deux constatés :**

- `.formule-bloc .eq` est un conteneur **flex** : tout `<span>` qu'on y pose
  devient un item, et **les espaces qui l'entourent disparaissent**. Dès qu'une
  formule contient un span, envelopper toute la ligne dans `<span class="l">`.
- Une `.etq` passe en **capitales** par le CSS : une lettre grecque minuscule
  y devient sa majuscule, et « sin α ≈ tan α » s'y affiche « SIN A ≈ TAN A ».
  Reformuler le libellé en toutes lettres.

### La règle de rédaction compte quatre étapes, pas cinq

Le §5 en donne le détail. Cette précision figure ici parce que la fiche A4, le
corrigé et les deux gabarits ont annoncé cinq étapes pendant que la page écran
en annonçait quatre : **quand cette règle bouge, elle bouge dans les six
fichiers à la fois.**
