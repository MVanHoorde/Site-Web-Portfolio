# Erreurs relevées dans les fiches de méthode de seconde

*Document destiné à l'équipe de physique-chimie. Établi le 28/08/2026 en
reprenant les douze fiches papier pour les porter en ligne.*

**Ce qu'il faut lire dans ce document.** Nous refaisons la **forme** de ces
fiches, jamais le **fond** — elles doivent rester compatibles avec les
progressions et les fichiers de chacun. La seule exception est l'**erreur de
calcul**, qui se corrige dans la version en ligne *et* se signale ici, pour que
personne ne distribue une correction fausse à des élèves.

Les sept points ci-dessous ont été **vérifiés un à un** contre les PDF, pas
recopiés d'une note. Rien d'autre n'a été touché au fond.

---

## 1 · Corrections de calcul — `Convertir (correction)`

| | |
|---|---|
| **Ligne** | `379,45 kW` |
| **Ce qui est écrit** | `379,45 kW = 358 × 10³ W = 3,58 × 10² × 10³ W = 3,58 × 10⁵ W = 3,58 × 10⁻⁴ × 10⁹ W = 3,58 × 10⁻⁴ GW` |
| **Ce qui s'est passé** | Les valeurs de la ligne précédente (`358 mV`) ont été recopiées ; le nombre de départ n'est jamais entré dans le calcul. |
| **Ce qui est juste** | `379,45 kW = 3,7945 × 10⁵ W = **3,7945 × 10⁻⁴ GW**` |

| | |
|---|---|
| **Ligne** | `5933 dag·cm⁻³` |
| **Ce qui est écrit** | `= 5,933 × 10³ × 10² g·cm⁻³ = 5,933 × 10⁵ g·cm⁻³ …` |
| **Ce qui s'est passé** | Le **déca** est pris pour `10²` au lieu de `10¹`. Toutes les lignes intermédiaires sont donc fausses — mais **le résultat final est juste**, deux erreurs se compensant en fin de chaîne. C'est le cas le plus dangereux : un élève qui suit le raisonnement ligne à ligne apprend une valeur fausse du préfixe, et rien ne l'alerte. |
| **Ce qui est juste** | `5,933 × 10⁴ g·cm⁻³` → `5,933 × 10⁶ cg·cm⁻³` → `5,933 × 10¹² cg·m⁻³` → `**5,933 × 10¹⁸ cg·hm⁻³**` (résultat final inchangé) |

| | |
|---|---|
| **Ligne** | `0,98 m·s⁻¹` |
| **Ce qui est écrit** | `= 0,98 × 3,6 km·h⁻¹ = 3,528 km·h⁻¹` |
| **Ce qui s'est passé** | Le produit est exact, mais il est rendu avec **quatre chiffres significatifs** pour une donnée qui n'en porte que deux. |
| **Ce qui est juste** | `**3,5 km·h⁻¹**` |

> ✅ **Une ligne voisine est bonne et mérite d'être signalée comme telle** :
> `130 km·h⁻¹ ≈ 36,1 m·s⁻¹` porte bien **trois** chiffres significatifs, ce qui
> est correct dès lors que les zéros de fin d'un entier comptent — c'est la
> convention retenue pour le site (`100` fait trois chiffres significatifs,
> `50` en fait deux). Rien à corriger.

## 2 · Corrections de calcul — `Manipuler une relation algébrique (correction)`

| | |
|---|---|
| **Niveau** | 1, relation `a = b/c` |
| **Ce qui est écrit** | `c = b/c` |
| **Ce qui s'est passé** | Coquille de recopie : le `a` du dénominateur est devenu `c`. |
| **Ce qui est juste** | `**c = b/a**` |

| | |
|---|---|
| **Niveau** | 5, expression de `c` |
| **Ce qui est écrit** | `c = (log(a/b))³ ⁄ (d−e)²`, en fraction |
| **Ce qui s'est passé** | Le passage de `(log(a/b))³ = c/(d−e)²` à `c` demande de **multiplier** les deux membres par `(d−e)²` ; c'est une division qui a été écrite. |
| **Ce qui est juste** | `**c = (log(a/b))³ × (d−e)²**` |

| | |
|---|---|
| **Niveau** | 5, expression de `e` |
| **Ce qui est écrit** | de `d − e = R`, la correction tire `e = R − d` |
| **Ce qui s'est passé** | Signe inversé au dernier geste. L'expression de `d`, juste au-dessus, est correcte : c'est bien la dernière ligne seule qui décroche. |
| **Ce qui est juste** | `**e = d − R**`, avec `R = √( c ⁄ (log(a/b))³ )` |

## 3 · Numérotation — `Fiche_guide - Rédiger un TP`

Trois défauts qui se tiennent, et qui rendent la fiche difficile à suivre :

1. **deux rubriques portent le n°6** — « expérience » et « observation et
   interprétation » ;
2. **le schéma est numéroté n°5 mais imprimé après le n°6 « expérience »**, alors
   que la numérotation elle-même indique qu'il vient avant : on pense le schéma
   *avant* de manipuler ;
3. **la conclusion renvoie aux « objectifs fixés dans le n°1 »**, alors que le
   n°1 est le titre du TP — l'objectif est le **n°2**.

**Ce qui est retenu pour la version en ligne** — huit rubriques renumérotées dans
l'ordre que la source révèle, et le renvoi final corrigé :

> 1 titre · 2 objectif · 3 hypothèse(s) · 4 matériel · 5 schéma de l'expérience ·
> 6 expérience · 7 observation et interprétation · 8 conclusion
>
> *« Elle doit être courte et doit répondre aux objectifs fixés dans le **n°2**. »*

Le **fond n'est pas touché** : aucune rubrique n'est ajoutée, retirée ni
réécrite, et la remarque sur les hypothèses — *avoir une hypothèse fausse n'est
pas une erreur mais laisser une hypothèse fausse en est une* — est conservée mot
pour mot ; elle est même reprise comme « à retenir » de l'outil.

---

## Coquilles de forme

Corrigées silencieusement dans nos pages, listées ici pour information — elles ne
changent rien au fond.

| Document | Écrit | Lire |
|---|---|---|
| `Présenter un calcul` | « les données présentes dans l'énoncer » | l'**énoncé** |
| `Présenter un calcul` | « sonnées » | **données** |
| `Écriture scientifique` | « On arrondi » | On **arrondit** |
| `Construire un graphique` | « On choisi » | On **choisit** |
| `Fiche_guide - Rédiger un TP` | « quelqu'un qui n'a jamais le TP » | qui n'a jamais **fait** le TP |
| `La verrerie de laboratoire` | « caratéristiques » | **caractéristiques** |
| `La verrerie de laboratoire` | « réfrigérant à serpenti » | à **serpentin** |

> Les deux dernières lignes concernent du texte **inclus dans une image** : elles
> ont été relevées à la lecture, et non par recherche automatique comme les
> autres. À confirmer d'un coup d'œil sur le document d'origine.

---

## Ce qui n'a **pas** été corrigé, et pourquoi

- **Le corrosif figure deux fois** dans `Pictogrammes de sécurité` — une fois
  parmi les dangers physiques, une fois parmi les dangers pour la santé. **Ce
  n'est pas une erreur** : le pictogramme couvre bien les deux familles. Nous le
  disons à l'élève plutôt que de le faire disparaître.
- **« DANGEREUX POUR LA SANTÉ » et « TRÈS DANGEREUX POUR LA SANTÉ »** sont deux
  pictogrammes distincts (le point d'exclamation et la silhouette). Les libellés
  sont repris **mot pour mot**, seuls les accents des capitales ont été rétablis.
- **Le tri de la verrerie** (*pour contenir* / *pour mesurer un volume* / *autre*)
  est conservé comme tri **principal**. Un second axe — la précision — lui est
  **ajouté**, sans que rien ne soit retiré : la compétence du programme est
  « choisir la verrerie adaptée », et le TP9 de l'établissement établit déjà ce
  classement expérimentalement.
- **Les cinq niveaux** de `Manipuler une relation algébrique` sont tous
  conservés, titres compris. Les niveaux 4 et 5 sont simplement marqués comme non
  évalués : le `log` est hors programme de seconde.

---

*Une question sur un de ces points ? Les PDF d'origine ne sont pas republiés — ils
restent des documents de travail internes.*
