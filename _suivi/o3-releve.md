# Relevé — Outil 3 « Sécurité au laboratoire »

> **Inventaire des images de l'outil 3**, établi le 29/08/2026 à la passe qui a
> remplacé les dessins maison du 28/08. Les relevés voisins (`t3c1`, `t3c3`,
> `t3c4`) portent sur des chapitres transcrits d'un PPTX ; celui-ci porte sur un
> **outil transversal**, écrit ici, et se limite donc à ce qui l'engage : d'où
> vient chaque image, et lesquelles manquent encore.
>
> **Deux fichiers, un seul dessin.** L'outil vit dans
> `pages/2nde-pc-o3-securite-laboratoire.html` et
> `fiches/fiche-2nde-o3-securite-laboratoire.html`. Les deux doivent montrer
> **exactement** le même visuel : sinon l'élève apprend un symbole à l'écran et
> en reconnaît un autre sur le papier. Toute retouche se fait des deux côtés.

---

## 1. Ce qui est en place

| # | Visuel | Origine | Où | État |
|---|---|---|---|---|
| **I1** | **Illustration de la tenue** — deux élèves en activité expérimentale, quatre repères annotés | **Illustration générée**, fournie par Loïc le 28/08/2026. Retouches : recadrage des marges, réduction à 1280 px, quantification 128 couleurs | `assets/img/pc/2nde-pc-o3/o3-tenue-laboratoire.png` · 1280 × 935, 365 Ko, rapport 1,37 : 1 | ✅ posée · `data-origine` dans les deux fichiers |
| **I2** | **Les neuf pictogrammes CLP** (SGH01 à SGH09) | **Vectorisés** le 29/08/2026 depuis les neuf images embarquées dans `_a-deposer/fiches-outils/fiche_Pictogrammes de sécurité.pdf` (173 × 173 px, couche alpha) — `potrace`, suréchantillonnage 4×, alphamax 1.3. **Symboles réglementaires**, pas des créations graphiques | Sprite `<symbol>` inline, **identique dans les deux fichiers** | ✅ posés · appariement mesuré 9/9 |

**L'illustration I1 remplace** une silhouette SVG dessinée le 28/08 ; **le sprite
I2 remplace** neuf pictogrammes dessinés le 28/08, dont les formes étaient
**inventées**. Voir `DECISIONS.md`, entrée du 29/08/2026.

### Les neuf pictogrammes, un par un

Les `id` et les classes sont un **contrat d'intégration** : ils ne changent pas,
sans quoi il faudrait reprendre les 47 `<use>` des deux fichiers (28 dans la
page, 19 dans la fiche).

| `id` | Code | Ce que l'élève doit reconnaître |
|---|---|---|
| `clp-explosif` | SGH01 | Bombe explosant |
| `clp-inflammable` | SGH02 | Flamme sur un socle |
| `clp-comburant` | SGH03 | Flamme au-dessus d'un cercle |
| `clp-gaz` | SGH04 | Bouteille de gaz |
| `clp-corrosif` | SGH05 | Deux coulées rongeant une main et une surface |
| `clp-toxique` | SGH06 | Tête de mort sur deux tibias |
| `clp-exclamation` | SGH07 | Point d'exclamation |
| `clp-sante` | SGH08 | Buste marqué d'une étoile |
| `clp-environnement` | SGH09 | Arbre mort et poisson échoué sur la rive |

Classes : `.clp-fond` (le losange **entier**, cadre compris, posé en premier —
indispensable, la source a un intérieur transparent), `.clp-cadre` (le liseré
rouge), `.clp-s` (le symbole noir). `#clp-cadre`, l'ancien losange partagé,
n'existe plus : chaque pictogramme porte le sien.

---

## 2. Ce qui manque — cinq emplacements en attente

Les cinq icônes d'équipement, dessinées à la main le 28/08, n'avaient **pas de
source de remplacement**. Elles sont devenues des **cadres de réservation**
`.reserve` : l'emplacement est tenu, il porte le nom du fichier attendu et ce
qu'il faut y voir. L'outil 3 est **publié avec ces cinq trous visibles**, et
c'est assumé — un trou doit se voir.

**Dossier d'accueil : `assets/img/pc/2nde-pc-o3/`**, à côté de l'illustration.

| Fichier attendu | Ce qu'il faut y voir | Format | Série ISO |
|---|---|---|---|
| `o3-eq-douche.svg` | Douche de sécurité — signalétique normalisée, blanc sur fond vert | carré · ≥ 240 px | E (évacuation et secours) |
| `o3-eq-rincoeil.svg` | Rince-œil / douche oculaire — blanc sur fond vert | carré · ≥ 240 px | E |
| `o3-eq-extincteur.svg` | Extincteur — blanc sur fond **rouge** | carré · ≥ 240 px | F (matériel incendie) |
| `o3-eq-couverture.svg` | Couverture anti-feu — blanc sur fond **rouge** | carré · ≥ 240 px | F |
| `o3-eq-sortie.svg` | Sortie de secours — silhouette et flèche, blanc sur fond vert | carré · ≥ 240 px | E |

⚠️ **Les numéros ISO 7010 exacts ne sont pas donnés ici** : ils sont à relire sur
une planche ISO au moment de récupérer les fichiers. C'est précisément le genre
d'approximation de mémoire qui a produit les dessins qu'on remplace.

**À l'intégration**, deux choses à faire et une à trancher :

1. remplacer le `<div class="reserve">…</div>` par la balise `<img>` — **des deux
   côtés**, la fiche et la page ;
2. reporter les cinq lignes ci-dessus dans le tableau §1 ;
3. ⏳ **trancher le sort de `.eq.feu`.** La classe est encore posée sur
   l'extincteur et la couverture. Elle colorait l'icône en rouge ; si les images
   normalisées portent déjà leur fond de couleur, elle n'a plus d'objet.

---

## 3. Où le visuel apparaît dans l'outil

| Emplacement | Ce qui s'y trouve |
|---|---|
| Fiche p. 1, bloc `.schema` | L'illustration de la tenue (**I1**) |
| Fiche p. 2, les trois planches | Les neuf pictogrammes, **dix cases** — le corrosif figure dans deux familles |
| Fiche p. 3, grille `.equips` | Les cinq cadres de réservation |
| Fiche p. 4, tableau « du pictogramme au geste » | Les neuf pictogrammes à **8 mm** — la taille la plus contraignante, vérifiée lisible |
| Page web, bloc `.tenue` | L'illustration de la tenue (**I1**), en `loading="lazy"` |
| Page web, grille `.grille-picto` | Les neuf pictogrammes, dix cases |
| Page web, grille `.equipements` | Les cinq cadres de réservation |
| Page web, exercice d'identification | Les neuf pictogrammes à 44 px |

---

## 4. Trois réserves sur l'illustration — à ta main

Aucune n'est bloquante, et **aucune ne se corrige dans le code** : il faudrait
régénérer l'image.

1. **Le garçon a les cheveux courts, non attachés**, alors que le repère ① dit
   « cheveux attachés ». Le repère pointe une tête qui ne l'illustre pas. (La
   fille, elle, porte bien un chignon.)
2. **Les deux élèves portent lunettes et gants.** Or la fiche insiste, juste à
   côté, sur le fait que lunettes et gants ne sont **pas systématiques** et se
   portent sur consigne du professeur. L'image dit le contraire du texte qu'elle
   accompagne.
3. **Les quatre repères sont dupliqués** à gauche et à droite. C'est lisible,
   mais redondant sur une fiche où chaque millimètre compte.

---

## 5. Contrôles à rejouer après toute retouche

```bash
# aucun résidu de l'ancien losange partagé
grep -n 'href="#clp-cadre"' pages/2nde-pc-o3-securite-laboratoire.html \
                            fiches/fiche-2nde-o3-securite-laboratoire.html   # → 0

# les neuf symboles, des deux côtés
grep -c 'symbol id="clp-' pages/2nde-pc-o3-securite-laboratoire.html \
                          fiches/fiche-2nde-o3-securite-laboratoire.html     # → 9 et 9

# les deux fichiers portent le MÊME dessin
diff <(sed -n '/GÉOMÉTRIE OFFICIELLE/,/Les cinq équipements/p' fiches/fiche-2nde-o3-securite-laboratoire.html) \
     <(sed -n '/GÉOMÉTRIE OFFICIELLE/,/Les cinq équipements/p' pages/2nde-pc-o3-securite-laboratoire.html)

node verifier.mjs                      # → 18 problèmes, le repère
node exporter-fiches.mjs o3            # → 4 pages exactement, A4 mesuré
```

**Et à l'œil, une fois :** la planche de la page 2 et le tableau de la page 4
doivent être identiques pictogramme par pictogramme, et la page 1 ne doit pas
déborder — le bloc `.urgence` reste en pied de page 1, jamais ailleurs.
