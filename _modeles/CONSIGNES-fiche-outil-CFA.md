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

**Un exemple entièrement résolu**, rédigé selon les cinq règles de l'Outil 0 — voir §5. C'est le seul endroit du recto où l'on montre un calcul complet. La méthode se montre, elle ne s'énonce pas.

## 3. Structure d'une fiche — verso

Trois paliers. Le gradient est **triple** : difficulté, contexte, appartenance.

| | Contexte | Chiffres | Public |
|---|---|---|---|
| **Palier 1 — guidé** | quotidien, universel | ronds, choisis | tout le monde |
| **Palier 2 — en autonomie** | atelier ou véhicule générique | réels | BTS et MVTR à parité |
| **Palier 3 — en situation** | engin, documentation, enchaînement | réels | marqué **BTS** |

**Palier 1.** Le calcul est déjà amorcé. Deux trous à combler, pas plus. Personne ne peut échouer. C'est le palier qui réamorce la confiance, il n'a aucune autre fonction.

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

## 5. Les cinq règles de rédaction — format de tous les exemples résolus

Tout calcul montré dans le livret, sans exception, suit ces cinq étapes :

1. **Relever et recopier les données avec leur unité**, avant tout calcul.
2. **Écrire la relation en lettres** avant de remplacer.
3. **Remplacer avec les unités**, y compris les unités intermédiaires.
4. **Encadrer le résultat avec son unité.**
5. **Conclure par une phrase chiffrée** — jamais « c'est bon » ou « ce n'est pas conforme » tout seul.

Ce sont des règles de bonne pratique universelles, qui se justifient d'elles-mêmes. Elles ne s'appuient sur aucun document interne et ne doivent jamais être présentées comme telles.

## 6. Composants CSS

`cfa-commun.css` dérive de `chapitre-commun.css`. Réutiliser les classes existantes plutôt que d'en créer.

**Repris tels quels** : `.formule-bloc`, `.eq-exo`, `.unites`, `.frac`, `.resultat`, `.etape`, `.methode`, `.encart`, `.aparte`, `.checklist`, `.exercice`.

**À créer** :

- `.poids` — le badge, carrés pleins et vides plus libellé, lisible en noir et blanc.
- `.palier` avec les variantes `.palier-1`, `.palier-2`, `.palier-3` — la troisième porte la marque BTS.
- `.trou` — l'emplacement à compléter du palier 1, un filet à remplir à la main.
- `.figure-a-produire` — cadre en pointillé, description d'une ligne, visible à l'écran comme à l'impression tant que la figure n'existe pas.
- `.cote` — la bande signature de la famille CFA. Remplace `.spectre`. Même silhouette : bande d'encre de 6 px avec les trois repères aux positions 18 %, 31 % et 76 %, dans les trois accents de la charte. Ce qui change : les deux extrémités portent une pointe de flèche en réserve et un trait d'attache vertical, ce qui la fait lire comme une ligne de cote de dessin technique.

**Retiré, et à ne pas réintroduire** : `details.correction`. Les corrigés ne sont pas en ligne.

## 7. Impression

Le gabarit A4 dérive de `_modeles/gabarit-fiche.html` et en conserve les règles `@page`.

- Une fiche = **exactement deux pages**. Déborder est un bug.
- Fond blanc forcé, pas d'aplat sombre : économie d'encre.
- Le badge, les paliers et les zones à compléter doivent rester lisibles en noir et blanc.
- Aucune information ne doit exister uniquement à l'écran. Si la page écran affiche quelque chose que la fiche A4 n'a pas, c'est une erreur.

## 8. Rédaction des énoncés

- Phrases courtes, une consigne par phrase.
- Verbe d'action à l'infinitif en tête : *calculer*, *relever*, *comparer*, *conclure*.
- Jamais « il suffit de », « on sait que », « rappelons que ».
- Le contexte tient en une phrase.
- Décor **véhicule au sens large** : voiture, poids lourd, engin de chantier, matériel d'atelier. Les trois partagent la cylindrée, la vitesse de rotation, la pression, le couple. Ne pas cloisonner par métier.
- Jamais le contexte d'un autre métier technique — pas d'usinage, pas de bureau d'études.
- Valeurs numériques **plausibles**, pas nécessairement exactes. C'est une mise en situation.
- Aucun énoncé d'examen reproduit, cité, ou transposé à l'identique.
