# A-LIRE — Audit du module `m1` « Représenter l'information », 22/08/2026

Les **onze lots** de `AUDIT-representer-information-2026-08-22.md` sont traités.
Rien n'a été livré en archive : le travail est fait **directement dans le dépôt
local**, il suffit de relire le diff.

---

## Ce qui a changé, en une ligne par fichier

```
 pages/2nde-snt-m1-representer-information.html   le module, remanié en profondeur
 assets/js/sequence-snt.js                        3 corrections + 1 mécanisme, valables PARTOUT
 pages/2nde-snt-t1-internet.html                  1 ligne : ?v=35 → ?v=36
 pages/2nde-snt-t2-le-web.html                    1 ligne : ?v=35 → ?v=36
 assets/img/snt/2nde-snt-m1-.../ (nouveau)        les 6 fichiers d'images
 _suivi/ETAT-PROJET.md · DECISIONS.md · JOURNAL.md · chapitres.md
```

`node verifier.mjs` → **19 problèmes**, exactement comme avant l'intervention
(18 liens `cfa/` cassés + 1 id dupliqué dans le cahier, tous préexistants et
hors module). L'audit annonçait « 2 problèmes connus » : ce repère ne
correspondait plus à l'état du dépôt. **Aucun problème nouveau.**

---

## 🔴 Trois corrections qui touchent TOUTES les séquences

Elles sont dans `sequence-snt.js` (v36). À relire en priorité, parce qu'elles
sortent du périmètre du module.

1. **`baliserSobre()` — les balises à attribut.** La fonction rouvrait `<i>`
   mais pas `<i lang="en">` : l'option de QCM affichait son code source en
   clair. C'était le bug du §2.1. `lang` est désormais le seul attribut
   restauré ; `class`, `style` et `on*` restent neutralisés (vérifié sur des
   cas hostiles).

2. **La même fonction — les entités.** Elle échappait tout, y compris
   `&nbsp;` : « 1&nbsp;073&nbsp;741&nbsp;824 » se lisait en toutes lettres dans
   une option. C'était le bug du §8.1 — **même cause que le §2.1**, un seul
   correctif règle les deux. Au passage, le libellé de la bonne réponse dans le
   retour passe enfin par le même chemin que l'option.

3. **Le « à retenir » attend le clic sur « Vérifier ».** Il s'ouvrait dès la
   dernière case saisie, donc avant que l'élève ait vu sa correction (§4.7).
   ⚠ C'est un **changement de règle** : le commentaire du moteur assumait
   depuis le 22/07 que « la révélation se fait dès la dernière réponse ». La
   nouvelle règle est écrite dans `DECISIONS.md` et le commentaire réécrit.
   Détail qui compte : la trace du clic est portée par le **bloc**, pas par
   l'étape — sinon une étape à deux exercices se validerait à moitié.
   *Testé sur `t0`, `t1` et `t2` : aucune erreur, le décompte suit.*

**Ajout :** `[data-reveal-juste]` révèle une correction détaillée **uniquement
quand tout est juste**, et la referme si l'élève fausse une réponse. Disponible
pour toutes les séquences.

---

## Deux bugs trouvés en chemin, non signalés par l'audit

- **`.demo-a` n'était styé nulle part.** Le cadre de démonstration de la méthode
  A (étape 1.3), écrit le 21/08, n'avait ni règle dans `sequence-snt.css` ni
  règle inline : il s'affichait sans cadre ni titre, noyé dans le texte. Renommé
  `.exemple`, stylé, et réutilisé pour les exemples travaillés de 1.2 et 1.3.
- **Collision de nom de classe.** Le résultat d'un calcul utilisait
  `class="res"` — or `.res{display:flex;flex-direction:column}` existe déjà dans
  le CSS partagé : « 77 » et son indice « 10 » se retrouvaient l'un **sous**
  l'autre. Invisible en relisant le code, évident à la capture. Renommé
  `.res-calc`.

---

## Le module, lot par lot

| Lot | Fait | Où |
|---|---|---|
| **0** | 3 images déposées, servies en `<picture>` webp + repli, dimensions déclarées, légendes et crédits complets. Rangées dans `assets/img/snt/2nde-snt-m1-representer-information/` (convention du dépôt) et non `assets/img/rep-info/` | 1.1 · 1.1 bonus · 2.2 |
| **1** | Exercice d'entrée « qu'est-ce qu'une base ? » : décomposition de 4073 en base 10, puis 2 h 15 min 30 s en base 60 | 1.1 |
| **2** | Bug corrigé · QCM porté à **5 questions** (le transistor, la base 60) · **notation de la base en indice** posée une fois pour toutes · figure des transistors + encart d'échelle · **loi de Moore en bonus non évalué**, figure révélée après la réponse de l'élève | 1.1 |
| **3** | Pont **puissances de 10 → puissances de 2** · exercice sur 2⁰→2⁷ · **ligne des puissances** ajoutée au tableau des poids, titre qui dit « octet » · exemple travaillé de la méthode manuelle · consigne « le tableau vérifie, il ne résout pas » · correction détaillée après réussite · à-retenir reformulé en puissances | 1.2 |
| **4** | **Nouvel outil « méthode A pas à pas »** · exemple déroulé de la méthode B avant l'animation · **une seule grande flèche** de remontée, note à 17 px et résultat à 30 px · **77 dans les deux méthodes**, et retiré des exercices · trois conversions au choix de la méthode (45, 203, **2010**) · « Exercice » au lieu de « texte à trous » · à-retenir réécrit | 1.3 |
| **5** | **Les 30 combinaisons de 1 à 4 bits écrites en clair**, seul le bit ajouté coloré · colonne « valeurs possibles » qui distingue *combien* de *lesquelles* · **adresse IP présentée avant** d'être interrogée | 1.4 |
| **6** | Items 12 et 13 remplacés (nouveau raisonnement + comparaison sans conversion) · **classement en glisser-déposer**, sans convertir · **« à retenir » supprimé** | 1.5 |
| **7** | Transition depuis la séance 1 (une image se ramène à des nombres, sans empiéter sur `t7`) · **pont explicite vers la physique-chimie** · texte à trous remplacé par un **QCM de 10 questions** | 2.1 |
| **8** | Bug corrigé · **photo du Seagate ST33232A** et son cas d'école (3 227 Mo = 3,005 Gio) · **téraoctet binaire calculé par les élèves** : 2⁴⁰, l'écart de 9,95 %, et les 931 Go affichés | 2.2 |
| **9** | Le nuancier affiche l'**écriture binaire** de chaque dose sous sa bande, et les **trois octets à la suite** sous l'aplat — mis à jour en direct | 2.3 |
| **10** | L'atelier devient un **bilan unique de 12 questions** couvrant les neuf étapes | 2.4 |
| **11** | Codes d'activité retirés des libellés (`data-code` conservé) · plus d'« Atelier » · format unique « Vérifie ta compréhension » + « QCM » partout | tout le module |

---

## Les six points du récapitulatif de l'audit

| # | Réponse |
|---|---|
| 1 | **Résolu par lecture** : `pages/2nde-snt-m1-representer-information.html` |
| 2 | **Résolu par lecture** : la question dit déjà « ne compte-t-elle **qu'**avec deux chiffres ». Gardée telle quelle |
| 3 | ⏳ **À trancher.** J'ai posé la figure **dans le document**, juste après le paragraphe qui nomme les transistors — c'est là qu'elle éclaire le texte, et le QCM vient après. L'audit proposait « après la question 3 du QCM » |
| 4 | ⏳ **À trancher.** Le calcul est revérifié (28 × 10⁹ × 4 cm = 1,12 × 10⁹ m = **1,12 million de km**, soit 2,9 fois la distance Terre-Lune). C'est la **formulation** qui attend votre avis |
| 5 | ⏳ **À trancher.** Bilan écrit à **12 questions**, une par notion de la liste |
| 6 | **Résolu par vérification** : `data-code` et `field-type` ne sont lus par **aucun** code du dépôt. Les libellés sont partis, l'attribut `data-code` reste (il est réservé à la base). Et le travers n'existe **nulle part ailleurs** : aucune autre séquence n'affiche de code ni d'« Atelier N » |

Deux précisions sur des points que l'audit soulevait :

- **« Monsieur Jean-Luc » (§6.1) n'existe nulle part dans le dépôt.** Ce n'était
  pas une référence orpheline dans cette page. Les items 12 et 13 étaient bien
  bizarres, en revanche — ils posaient deux questions pour un seul raisonnement.
  Ils sont remplacés.
- **Périmètre asymétrique (§3.6)** : appliqué **silencieusement**. Aucun
  exercice, aucun QCM ne convertit binaire → décimal au-delà de 8 bits, et
  **aucune phrase méta** sur le périmètre ne figure dans la page élève. La
  contrainte est consignée dans `DECISIONS.md` et dans `chapitres.md`.

---

## Ce qui a été vérifié pour de vrai, au navigateur

Pas à la relecture du code — dans un Chromium piloté, sur la page réelle :

- les **deux bugs de QCM** : les options se lisent maintenant
  « *binary digit*, c'est-à-dire "chiffre binaire" » et
  « 2³⁰ octets, soit 1 073 741 824 » ;
- le **parcours du « à retenir »** : rempli sans clic → fermé ; premier
  Vérifier → « encore une réponse » ; second Vérifier → ouvert, correction
  détaillée visible ; une réponse faussée et revérifiée → correction refermée ;
- les **images** chargent (naturalWidth mesurée), la page ne déborde jamais
  latéralement à 1280, 820 et 390 px ;
- les **quatre composants SVG** se replient correctement à 390 px (2 rangées,
  cases à 52 px, au-dessus des 44 px de cible tactile) ;
- le **nuancier** : binaire juste et synchrone sur quatre états testés ;
- **aucune erreur JS** sur `m1`, ni sur `t0`, `t1`, `t2` après le changement de
  moteur ;
- **toutes les conversions et tous les calculs recalculés en machine** : les
  trois exercices de 1.3, les six écritures du classement, 2⁴⁰, l'écart de
  9,95 %, les 931 Go, les 3,005 Gio du Seagate, les 30 combinaisons.

---

## Un point de vigilance signalé par ❌ 19 problème(s) :

  lien interne cassé (18)
     · cfa/outil-01-conversions-unites.html → ../fiches/cfa/fiche-outil-01.html
     · cfa/outil-03-vitesses-rotation.html → ../fiches/cfa/fiche-outil-03.html
     · cfa/outil-04-pourcentages.html → ../fiches/cfa/fiche-outil-04.html
     · cfa/outil-05-proportionnalite-echelles.html → ../fiches/cfa/fiche-outil-05.html
     · cfa/outil-06-ordres-de-grandeur.html → ../fiches/cfa/fiche-outil-06.html
     · cfa/outil-07-isoler-une-inconnue.html → ../fiches/cfa/fiche-outil-07.html
     · cfa/outil-08-enchainer-des-formules.html → ../fiches/cfa/fiche-outil-08.html
     · cfa/outil-09-aires-et-volumes.html → ../fiches/cfa/fiche-outil-09.html
     … et 10 autre(s)
  id dupliqué (1)
     · cahier/diag-j03-formation-image.html — ri

ℹ  Points de vigilance (pas bloquants) :
   · couleurs en dur hors :root — 2nde-snt-t0-systemes-informatises.html : 44
   · couleurs en dur hors :root — 2nde-snt-t1-internet.html : 3
   · couleurs en dur hors :root — 2nde-snt-t3-reseaux-sociaux.html : 46
   · couleurs en dur hors :root — 2nde-snt-t4-donnees-structurees.html : 46
   · couleurs en dur hors :root — 2nde-snt-t5-localisation-cartographie.html : 46
   · couleurs en dur hors :root — 2nde-snt-t6-informatique-embarquee.html : 46
   · couleurs en dur hors :root — 2nde-snt-t7-photographie-numerique.html : 46
   · indices de niveau 2 proches de la réponse — 2nde-snt-m1-representer-information.html : 1 (filet de secours : vérifier qu'aucun n'est sur un exercice de lecture)
   · indices de niveau 2 proches de la réponse — 2nde-snt-t1-internet.html : 3 (filet de secours : vérifier qu'aucun n'est sur un exercice de lecture)
   · liens inertes href="#" visibles des élèves : 2
   · chapitre-commun.css?v=3 — cohérent partout
   · étapes sans data-cle (clé positionnelle, fragile) — pages/2nde-snt-t3-reseaux-sociaux.html, pages/2nde-snt-t4-donnees-structurees.html, pages/2nde-snt-t5-localisation-cartographie.html, pages/2nde-snt-t6-informatique-embarquee.html, pages/2nde-snt-t7-photographie-numerique.html
   · data-cle d'étape — 71 clé(s), toutes uniques
   · assets/js/seances-snt.js — à jour
   · seances-snt.js?v=14 — même version sur les 6 pages qui le chargent
   · assets/js/questions-snt.js en retard (1 écart(s)) — relancer : node generer-questions.mjs
   · versions d'assets — alignées : sequence-snt.css?v=35 · sequence-snt.js?v=36
   · biais de longueur dans 23 question(s) de QCM — dont 20 marquée(s) · 53 écart(s) sous le seuil non retenu(s) · liste complète : --qcm :
   ·    🔴 2nde-snt-t2-le-web.html — « Quelle est la différence entre un cookie de se… » : la bonne réponse est la plus longue de 74 car. (149 %)
   ·    🔴 2nde-snt-t2-le-web.html — « Deux navigateurs ne proposent pas la même faço… » : la bonne réponse est la plus longue de 49 car. (90 %)
   ·    🔴 2nde-snt-t2-le-web.html — « Qu'est-ce que le PageRank mesure ?… » : la bonne réponse est la plus longue de 46 car. (96 %)
   ·    🔴 2nde-snt-t2-le-web.html — « Deux élèves tapent les mêmes mots au même mome… » : la bonne réponse est la plus longue de 40 car. (92 %)
   ·    🔴 2nde-snt-t2-le-web.html — « Tu navigues en navigation privée. Le site que … » : la bonne réponse est la plus longue de 38 car. (87 %)
   ·    🔴 2nde-snt-t2-le-web.html — « Tu modifies une page Wikipédia dans l'inspecte… » : la bonne réponse est la plus longue de 37 car. (78 %)
   ·    🔴 2nde-snt-t2-le-web.html — « Pourquoi les sites affichent-ils un bandeau « … » : la bonne réponse est la plus longue de 37 car. (91 %)
   ·    🔴 2nde-snt-t2-le-web.html — « Quel signal doit le plus te rendre méfiant ?… » : la bonne réponse est la plus longue de 35 car. (82 %)
   ·    …et 15 autre(s), moins marquée(s)
   · 2 script(s) PowerShell — BOM et caractères vérifiés
   · configuration Supabase — identique dans progression.js et prof-api.js

Le filet « indices de niveau 2 proches de la réponse » remonte **1 cas** sur le
module. Vérifié : c'est l'indice 2 de la question « un disque de 1 To s'affiche
à combien de Go ? », qui donne le calcul et son résultat. Ce n'est **pas** un
exercice de lecture — c'est un calcul, et la page annonce que le second indice
« dépanne vraiment ». Rien à corriger, mais c'est dit ici pour que le prochain
audit n'ait pas à le rechercher.

---

## Deux pièges pour la prochaine fois

- **`String.replace()` interprète `$$`** dans le texte de remplacement : un
  `$$('…')` de patch est arrivé dans le moteur en `$('…')`, et le bloc s'est
  appliqué deux fois. Tous les patchs passent maintenant une **fonction** de
  remplacement.
- **`io.open(…, 'w')` en Python réécrit un fichier en CRLF** sur Windows. Une
  correction d'une seule coquille a converti les 1394 lignes du HTML, alors que
  tout le dépôt est en LF. Rattrapé avant le commit — mais la leçon vaut : pour
  retoucher un fichier du dépôt, **Node, pas Python en mode texte**.

---

## Rien n'est validé

Tout le contenu pédagogique reste une **proposition** : formulations, choix des
nombres, les 34 questions de QCM et leurs leurres, les items d'exercice. Les
trois points ⏳ ci-dessus attendent un arbitrage explicite avant d'être
considérés comme acquis.
