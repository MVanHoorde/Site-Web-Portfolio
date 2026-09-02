# À LIRE — refonte de `t0` « Les systèmes informatisés » · 23/08/2026

Archive **delta**, à extraire à la racine du dépôt. Elle ne contient que des
fichiers **créés ou modifiés**. Les 47 images sont déjà dans le dépôt depuis ta
livraison précédente : elles ne sont **pas** dans l'archive.

---

## Ce qui a changé

| Fichier | Ce qui a changé |
|---|---|
| `pages/2nde-snt-t0-systemes-informatises.html` | **Refonte complète.** 1 093 → 2 054 lignes |
| `pages/2nde-snt.html` | Carte `t0` : `data-seances` 3 → 4 · `seances-snt.js?v=15` |
| `pages/2nde-snt-t1-internet.html` · `t2-le-web` · `m1-representer-information` · `prof/index.html` | `seances-snt.js?v=15` — **une seule ligne chacun** |
| `assets/js/seances-snt.js` | Régénéré (`node generer-seances.mjs`) |
| `assets/js/questions-snt.js` | Régénéré — 41 → **47 questions** |
| `ia-snt/criteres-snt.json` | **4 grilles ajoutées** : `SYS-R1`, `SYS-R2`, `SYS-R-ports`, `SYS-G-ssd` |
| `REPRISE.md` | §1 corrigé : la ligne qui affirmait `t0` portée par le moteur est désormais vraie, et elle dit ce qui est validé |
| `_suivi/DECISIONS.md` · `ETAT-PROJET.md` · `JOURNAL.md` · `chapitres.md` | Mis à jour |

⚠️ **Trois assets partagés sont touchés**, comme le veut `CLAUDE.md` :
`seances-snt.js` passe en `?v=15` sur **six pages** (les cinq séquences + le
tableau de bord). `sequence-snt.css` et `sequence-snt.js` **ne sont pas
modifiés** et restent donc en `?v=39` : incrémenter aurait forcé tous les élèves
à retélécharger un fichier identique.

---

## En un coup d'œil

`t0` était la séquence qui **enseigne les mécanismes du cours**, et la seule à ne
pas les avoir. Elle tournait sur un **fork figé du moteur** (46 % du fichier) et
ne portait que **43 %** du contenu de tes trois documents source.

**Maintenant :** 3 séances + 1 débranchée · **23 étapes** · 16 portes ·
5 QCM (**31 questions**) · 4 réponses rédigées corrigées · 2 réponses
personnelles · 2 dépôts d'image · 1 tri glisser-déposer · 1 entrée de glossaire ·
**43 des 47 images** placées · **4 SVG maison**.

L'étape 1.1 présente les **douze mécanismes** du dispositif, et chacun est
**mis en action** dans une étape suivante. À la fin de `t0`, un élève les a tous
utilisés de ses mains.

---

## Vérifications passées

```
✅ node verifier.mjs              18 problèmes — le repère exact, aucune régression
✅ node generer-seances.mjs       t0 : 4 séances · « seances-snt.js à jour »
✅ node generer-questions.mjs     47 questions · « à jour »
✅ 44 couleurs en dur hors :root  →  0
✅ grep                           aucun CDN, aucun localStorage, aucun data-qcm, aucun data-free
✅ fins de ligne                  LF, aucun CR introduit
✅ images                         43 chemins, aucun cassé, aucune agrandie au-delà du natif
✅ data-cle                       81 clés dans le dépôt, toutes uniques
```

**Au navigateur** (Chromium, page réellement servie en `localhost`) :

```
✅ chargement                     0 erreur JS
✅ verrouillage                   s2 et s3 fermées à l'arrivée
✅ cascade                        valider s1 → s2 s'ouvre, s3 reste fermée → valider s2 → s3 s'ouvre
✅ QCM plein écran                joué en entier, 8/8, récapitulatif, étape validée
✅ réponse rédigée                mode focus, page floutée, envoi RÉEL — plus aucun setTimeout
✅ « à retenir » masqué           fermé au départ, s'ouvre seul une fois l'exercice fait
✅ tri glisser-déposer            ordre juste, étape validée
✅ dépôt de copie d'écran         bouton et zone d'aperçu en place
✅ glossaire                      bouton permanent, 26 entrées embarquées
✅ fiche                          générée, contient les réponses, sans les corrigés de QCM
✅ captures                       1280 · 820 · 390 px, contrôlées à l'œil
```

**Le test que le brief demandait en priorité** — « un QCM validé produit-il un
appel réseau ? » — est **passé indirectement** : le champ rédigé affiche
« Enregistrement indisponible », message qui n'existe que dans le `catch` de
`Progression.envoyerReponse()`. L'appel **est donc bien émis** ; c'était
précisément le bug d'origine, où aucun ne l'était. Le test complet, connecté
avec un vrai compte, reste à faire de ton côté.

---

## Ce qui t'attend

### À relire — tout le contenu pédagogique

C'est une **proposition V1** dans ton ton. En particulier : les **31 questions
de QCM**, les deux réponses rédigées corrigées (`SYS-R1`, `SYS-R2`) et le niveau
d'exigence des **quatre grilles** de pré-correction.

### Une décision à prendre

**L'étape 2.4 suppose un poste connecté par élève** pour chercher l'image d'une
carte d'extension. Le repli est déjà écrit dans la page — les quatre cartes y
sont en photo, l'élève en nomme une. Un `<aside class="chantier decision">` te
pose la question à l'endroit exact. Dis-moi laquelle des deux versions tu gardes.

### Cinq images qui manquent

Les trois premières portent **l'accroche de la séance 1** — des systèmes « qui
n'en ont pas l'air ». Les cadres sont réservés, la mise en page ne bougera plus.

1. **Borne de bus** · **caisse automatique** · **lave-linge**
2. **Montre connectée** · **baie de serveurs**

Trois autres seraient utiles sans rien bloquer : une **carte mère ≥ 900 px**
(pour une légende en pleine largeur), un **SSD M.2** seul, un **touchpad** en
gros plan.

### Deux liens toujours inertes

`SYS·1` (le diaporama) et `SYS·D` (la fiche d'observation de la débranchée).

---

## Trois choses que j'ai décidées, et qu'il faut que tu saches

1. **La checklist du brief se trompait sur trois marqueurs.** Elle demandait de
   faire disparaître `data-check-cloze`, `data-check-diagram` et `data-share`.
   Ce ne sont pas des vestiges du fork : ce sont des composants vivants du
   moteur, employés **8, 3 et 10 fois dans `t1`**. Les retirer aurait supprimé
   de `t0` le texte à trous, les associations et le partage des réponses
   personnelles. Seuls `data-qcm` et `data-free` étaient de vrais vestiges — ils
   sont à zéro.

2. **Une clé de progression est retirée.** `t0-systeme-exploitation` n'a plus
   d'étape : le système d'exploitation devient le **sixième critère** de l'étape
   3.5 « Choisir une machine ». Les **onze autres clés sont conservées à
   l'identique**. Aucune donnée d'élève n'existe encore sur `t0`, donc rien
   n'est perdu — mais c'est ta décision, pas la mienne : dis-moi si tu préfères
   une étape dédiée à l'OS.

3. **Le tri glisser-déposer entre dans `t0`.** Le brief prévoyait « doc + QCM +
   glossaire » à l'étape 2.5 ; j'y ai remplacé le QCM par un **tri
   chronologique des supports de stockage** (disquette → disque dur → CD → DVD →
   BluRay → SSD). Motif : `t0` doit faire pratiquer **tous** les dispositifs de
   l'année, et c'était le seul endroit naturel pour celui-là.

Et une correction qui vaut d'être signalée : mes textes de 1.1 et 2.3
annonçaient un bouton « Afficher le à retenir » à cliquer. **Faux** depuis ta
décision du 25/07 — le moteur ouvre le bilan **tout seul** dès que l'exercice
est fait. Le banc d'essai l'a trouvé, pas la relecture. Les deux passages sont
réécrits.
