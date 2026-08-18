# Logos de l'établissement — espace CFA

Les gabarits CFA référencent ces fichiers. **Ils ne sont pas encore déposés** :
les déposer ici sous exactement ces noms, sinon l'image des fiches sera cassée.

| Fichier attendu | Version | Où il sert |
|---|---|---|
| `logo-isaac-baseline.png` | couleur, avec « faire briller les talents » | en-tête de `cfa/index.html` |
| `logo-isaac.png` | couleur, sans baseline | en-tête des fiches A4, en petit |
| `logo-isaac-blanc.png` | texte en réserve blanche | fonds sombres uniquement |
| `logo-isaac-academy-campus.png` | variante « Academy · Campus », texte en réserve | fonds sombres uniquement |

## Règles

**Le logo ne se retouche jamais** : ni recoloré, ni redessiné, ni détouré, ni
recadré. On choisit la version qui convient au fond, on ne fabrique pas la
sienne.

**Ce n'est pas une source de palette.** Les couleurs du site restent celles de
`style.css`, reprises dans `assets/css/cfa-commun.css`. Le vert, le jaune, le
corail et le rouge du symbole n'entrent nulle part dans la feuille de style.

**Passage au vectoriel.** Le SVG n'est pas encore disponible. Quand il le sera,
le remplacement se fait en changeant l'attribut `src` des pages — un seul chemin
par fichier. Le CSS ne fixe que la hauteur (`.logo-etab`), il n'a pas à bouger.
