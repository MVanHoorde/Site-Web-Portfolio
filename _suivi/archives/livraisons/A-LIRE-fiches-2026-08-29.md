# Consignes — les fiches élève : intégration, régénération, mise en ligne

**Livrées le 29/08/2026 avec la première fiche de chapitre produite par
générateur, T3-C1 · Émission et perception d'un son.**

Ce document couvre **les fiches élève uniquement**. La chaîne des diaporamas
de projection reste hors dépôt : elle n'a pas vocation à être publiée.

---

## 1. Ce qu'il y a dans cette livraison

```
fiches/fiche-2nde-t3c1.html            la fiche, 8 pages A4 — FICHIER GÉNÉRÉ
assets/img/logo-isaac-lycee.png        logo du lycée (version « LYCÉE »)
assets/img/pc/2nde-pc-t3-c1/
  t3c1-micro-bandeau.jpg               fond du cartouche, délavé en amont
_outils/fiches/gabarit_fiche.py        le gabarit, commun à toutes les fiches
_outils/fiches/fiche_t3c1.py           le contenu de CE chapitre
_outils/fiches/mesurer_pages.py        contrôle du remplissage des pages
```

**`fiches/fiche-2nde-t3c1.html` ne s'édite pas à la main.** Toute retouche se
fait dans `_outils/fiches/`, puis on régénère. Un en-tête HTML le rappelle en
tête de fichier.

---

## 2. Le principe, en trois lignes

La fiche **ne donne pas le cours, elle le fait écrire**. Définitions et
propriétés sont des cadres vides à lignes ; les formules, des boîtes à
remplir. Seules les **figures** sont fournies : les faire recopier à la main
coûterait la séance.

Les figures ne sont pas dupliquées : elles sont **relues dans la page du cours
à chaque génération**, par leur `aria-labelledby`. Une figure retravaillée en
ligne se retrouve donc automatiquement sur la fiche, dans sa version la plus
récente. La fiche ne peut pas diverger du cours.

---

## 2 bis. Ce qui n'est PAS pré-dessiné

Les exercices n'offrent que des **lignes horizontales**. Pas de tableau de
réponse, pas de cadre de calcul, pas de zone de schéma : un cadre imposé dit
à l'élève où s'arrêter, et il trace lui-même le tableau ou le croquis dont il
a besoin. La fonction `exercice(..., lignes=n)` ne sait faire que ça, c'est
volontaire.

Même principe pour les trois seuils d'intensité sonore : la propriété se
rédige en toutes lettres, sans grille à remplir.

---

## 2 ter. Le cartouche d'identification

La première page s'ouvre sur un **cartouche** de 60 mm : thème, chapitre,
deux phrases d'introduction, professeur, niveau, année, nature du document.
Il existe parce qu'une fiche imprimée et glissée dans un classeur doit
s'identifier d'un coup d'œil — un titre en une ligne ne suffisait pas.

Son fond est **l'image de la diapositive de titre du diaporama**, délavée en
amont vers la couleur du papier (`t3c1-micro-bandeau.jpg`). Fiche et
projection se répondent ainsi visuellement.

> ⚠ Le fond est une balise `<img>` en position absolue dans un conteneur de
> **hauteur explicite** (`height:60mm; overflow:hidden`). Ni `inset:0`, ni
> `background-size:cover` : les deux ont été essayés, les deux ont donné un
> cartouche de 170 mm débordant de la feuille. Si le texte d'introduction
> s'allonge, augmenter la hauteur du conteneur — il ne s'adapte pas seul.

Pour un nouveau chapitre : fabriquer le bandeau en délavant l'image de fond
du diaporama vers `#fdfcf8` (≈ 18 % d'image, 82 % de papier), au format
3,3 : 1.

---

## 3. Régénérer une fiche après modification du cours

```bash
cd _outils/fiches
pip install qrcode pillow                    # une fois
pip install cairosvg pyzbar                  # facultatif : relecture des QR
python3 fiche_t3c1.py                        # → ../../fiches/fiche-2nde-t3c1.html
```

Le script relit `pages/2nde-pc-t3-c1-emission-perception-son.html`, régénère
les cinq QR codes et **les relit par décodage** avant de les poser. Sortie
attendue :

```
QR codes :
  ✓ QR relu : https://mvanhoorde.github.io/...
  ✓ QR relu : https://youtu.be/baUAeWXAdX4
  …
→ …/fiches/fiche-2nde-t3c1.html  (110 Ko, 8 pages)
```

**Un `✗`, ou un `⚠ relecture impossible`, bloque la livraison** : un QR faux ne
se voit pas à l'œil et envoie la classe entière nulle part.

### Ce qu'il faut relire à la main après régénération

Le script ne sait pas si le **contenu** du cours a bougé. Après toute
modification de la page, vérifier dans `fiche_t3c1.py` :

- les **intitulés de définitions** (`encart("definition", "Définition — …")`)
  correspondent toujours à ceux de la page ;
- les **énoncés d'exercices** sont à jour ;
- le **tableau des célérités** correspond au Tableau 1 du cours — il est saisi
  en dur, c'est le seul endroit où fiche et cours peuvent diverger
  silencieusement ;
- les **URL de `LIENS`** pointent toujours quelque part.

---

## 4. Produire le PDF pour les élèves

Le dépôt sert les fiches en PDF depuis `assets/pdf/pc/fiches/`.

```
assets/pdf/pc/fiches/fiche-2nde-t3c1.pdf
```

**Le PDF se fabrique en imprimant le HTML depuis un navigateur** (Chrome ou
Edge → Imprimer → Enregistrer au format PDF, marges « aucune », taille réelle,
graphismes d'arrière-plan activés). Le `@page { size:A4; margin:0 }` et les
`page-break-after` du gabarit font le reste : huit pages, une par feuille.

> ⚠ Ne pas produire le PDF avec WeasyPrint pour la mise en ligne. Le CSS a été
> écrit pour rendre à l'identique dans les deux moteurs, mais c'est le
> navigateur qui fait foi — c'est lui qui a servi pour `fiche-2nde-t1c2.pdf`.
> WeasyPrint reste utile en contrôle rapide, pas en production.

Après génération, **vérifier que le PDF fait bien 8 pages** : une page en trop
signale un débordement de contenu, corrigé en réduisant un `hauteur=` ou une
largeur de figure dans `fiche_t3c1.py`.

### Contrôler le remplissage des pages

Une fiche à moitié vide en bas de page est du papier perdu et donne une
impression de bâclé. L'outil `mesurer_pages.py` dit, feuille par feuille, où
s'arrête le contenu :

```bash
python3 _outils/fiches/mesurer_pages.py fiche.pdf
```

```
 page   contenu jusqu’à     creux
    1            277 mm      4 mm
    …
  creux cumulé : 32 mm (≈ 0.1 page)
```

**Viser moins de 10 mm de creux par page.** Au-delà de 25 mm, l'outil affiche
« à combler » ; s'il trouve de l'encre sous la limite de page, il affiche
« DÉBORDE » — le contenu est alors rogné par `overflow:hidden` et **cela ne
se voit pas sur la mesure seule**, puisqu'une page pleine et une page qui
déborde s'arrêtent toutes deux à 281 mm.

On comble en agrandissant ce qui sert : nombre de lignes d'une définition ou
d'un exercice, taille d'une figure — jamais en ajoutant du remplissage
décoratif. Sur T3-C1, le creux est passé de 269 mm (une page entière perdue)
à 39 mm par cette seule méthode, sans aucun débordement.

---

## 5. Mettre le téléchargement à disposition sur la page du chapitre

La page `pages/2nde-pc-t3-c1-emission-perception-son.html` **n'a pas encore**
le bloc de téléchargement. L'ajouter, à l'identique de T1-C2, juste après le
sous-titre (ligne voisine de 277, après
`<p class="sous-titre">Thème 3 · Chapitre 1 — cours &amp; exercices corrigés</p>`) :

```html
<div class="fiche-vierge hors-verrou">
  <a href="../assets/pdf/pc/fiches/fiche-2nde-t3c1.pdf"><span aria-hidden="true">📄</span> Télécharger la fiche de cours (PDF, vierge)</a>
  <span class="quoi">la feuille distribuée en classe, à compléter — disponible en permanence, code ou pas</span>
</div>
```

La classe **`hors-verrou`** est essentielle : elle place le lien **avant** le
verrou de déblocage, donc accessible en permanence. Un élève absent doit
pouvoir récupérer sa feuille sans attendre la fin de séquence.

---

## 6. Produire la fiche d'un nouveau chapitre

1. Copier `_outils/fiches/fiche_t3c1.py` en `fiche_<code>.py`.
2. Changer en tête : `COURS_DEFAUT`, `SORTIE`, `TITRE`, `PIED`, `LIENS`.
3. Réécrire le corps de `construire()` — c'est la seule partie propre au
   chapitre. **Ne pas toucher à `gabarit_fiche.py`** : une correction de mise
   en page doit profiter aux quatorze fiches, pas à une seule.
4. Repérer les `aria-labelledby` des SVG à reprendre :
   `grep -o 'aria-labelledby="[^"]*"' pages/<page>.html`
5. **Écarter les SVG de correction** — sur T3-C1, `t3c1ex1c` et `t3c1ex3c`.
   Aucune correction ne figure sur la fiche.
6. Générer, contrôler le nombre de pages, imprimer le PDF, ajouter le bloc de
   téléchargement.

---

## 7. Les pièges de mise en page, déjà payés

Chacun a coûté une passe de correction. À relire avant de toucher au gabarit.

| Piège | Ce qui se passe | La règle |
|---|---|---|
| **Largeur du logo** | Sans contrainte CSS, le moteur prend la taille intrinsèque du PNG (2481 px ≈ 656 mm) : le tableau écrase toute la page | `.logo { width:34mm }` — non négociable |
| **`table > tr > td`** | Ne matche jamais : les moteurs insèrent un `tbody` implicite | Écrire `table.x td` |
| **Lignes de notes** | Un dégradé répété est arrondi par le moteur : l'interligne saute d'un demi-millimètre | Des `<i>` empilés de hauteur fixe |
| **Membre de gauche des formules** | Aligné à gauche, « f = » laissait un vide béant avant la fraction | Aligné à droite, ligne insécable |
| **Fraction à numérateur long** | « A = » passait au-dessus de sa fraction | `white-space:nowrap` sur `.eq` |
| **Flex et grid** | Rendus divergents entre navigateur et moteur d'impression | Tableaux et flottants partout où c'est possible |
| **Indices** | « U max » avec une espace se lit comme deux mots | `<sub>` — jamais d'espace |
| **Fond du cartouche** | `inset:0` et `background-size:cover` donnent tous deux un cartouche de 170 mm | `<img>` absolu + conteneur de hauteur explicite |
| **Figure en deux colonnes** | Réduite à 55 mm, la figure des quatre étapes devenait illisible | Une figure qui ne tient pas en pleine largeur n'a rien à faire sur la fiche |
| **Page pleine ou page rognée** | Les deux mesurent 281 mm : impossible de les distinguer sans regarder sous la limite | `mesurer_pages.py` inspecte la bande 281–286,5 mm et signale « DÉBORDE » |

---

## 8. Ce qui reste à trancher sur T3-C1

1. **La fiche s'arrête à l'exercice 6.** Les exercices 7 à 10 du cours en ligne
   n'y figurent pas — à confirmer.
2. **Deux figures du cours ne sont pas reprises** : les compressions et
   dilatations de la propagation, et les quatre étapes de la mesure d'une
   période. Dans les deux cas le texte de la fiche dit déjà tout, et l'élève
   retrouve la figure en ligne. À confirmer pour la seconde, qui était
   présente dans une version antérieure.
3. **Le code de déblocage** à six cases est en dernière page, comme sur T1-C2.
   Vérifier qu'un code est bien prévu pour ce chapitre.
