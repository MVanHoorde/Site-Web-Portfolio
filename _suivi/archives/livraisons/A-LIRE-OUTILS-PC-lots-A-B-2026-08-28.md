# À lire — Outils transversaux de PC · lots A et B · 28/08/2026

Deux lots livrés : **A** (catalogue, numérotation, gabarits) et **B** (`o3`
Sécurité au laboratoire, page et fiche). Les lots C à H attendent ton feu vert.

---

## 🔴 Le point qui demande ta relecture avant tout

**L'étape 1.5 « Si ça tourne mal » de `o3` est du contenu neuf.** Les douze fiches
sources ne disent rien de la conduite en cas d'incident — c'était leur seul manque
de fond, et tu l'as comblé par la décision O-27 du 28/08. La rédaction, elle,
reste à valider.

**C'est le seul contenu du dépôt qui engage la sécurité d'élèves.** Il doit être
relu contre :

- le **règlement du laboratoire** de ton établissement ;
- les **équipements réellement présents en salle 0.26** — la fiche annonce une
  douche de sécurité, un rince-œil, un extincteur, une couverture anti-feu et une
  sortie repérable. Si l'un manque, la page et la fiche se corrigent des deux
  côtés.

Ce que le texte dit, et qu'il faut confirmer : rinçage **15 minutes** à l'eau,
paupière ouverte, sans frotter · retirer le vêtement imbibé **pendant** le
rinçage · ne **pas** faire vomir · verre cassé au **conteneur à verre**, jamais la
poubelle · **c'est le professeur qui intervient** sur un début de feu · ne pas
éponger un produit renversé avant d'avoir demandé.

Ce que le texte s'interdit, volontairement : aucun conseil médical au-delà du
rinçage et de l'alerte, aucun geste où l'élève manipule un extincteur, aucun
numéro d'urgence à composer soi-même, aucun ton alarmiste — la page s'ouvre en
disant franchement que les produits d'une salle de seconde sont, pour
l'essentiel, bénins.

---

## Ce qui est fait

### Lot A — le catalogue et les gabarits

- **Catalogue renuméroté à huit outils**, dans l'ordre où un élève les rencontre.
  Aucun des fichiers concernés n'existait : l'opération n'a touché ni un
  `data-cle`, ni un QR code, ni un lien.
- **« Convertir » sort du catalogue** : `o1` en avait absorbé tout le fond le
  26/08. Sa série de douze conversions est réservée pour le lot H.
- **Deux gabarits créés** — `_modeles/gabarit-outil-PC.html` et
  `gabarit-fiche-outil-PC.html`, extraits de `o1` et vidés de toute physique.
  Les commentaires qui portent les décisions O-10, O-19, O-20 et O-21 sont
  conservés en entier.
- **Doc réécrite** (pas empilée) : `_suivi/chapitres.md`,
  `_modeles/CONSIGNES-outil-PC.md`, `_suivi/DECISIONS.md` (O-23 à O-29),
  `_suivi/IDEES.md`, `MANIFESTE.md`, `_suivi/ETAT-PROJET.md`, `_suivi/JOURNAL.md`.
- **`_suivi/erreurs-sources-fiches-outils.md`** — le document court à transmettre
  à l'équipe, avec les sept erreurs des fiches sources, **toutes vérifiées une à
  une contre les PDF**, pas recopiées de la note.

### Lot B — `o3` Sécurité au laboratoire

- **Page** : 5 étapes de méthode · 5 exercices · 17 questions de QCM · 30 champs à
  menu déroulant · deux paillasses aux erreurs cliquables (6 et 8 erreurs).
- **Les neuf pictogrammes CLP dessinés en SVG maison**, en `<symbol>` réutilisés
  sur la page et sur la fiche. Plus **cinq équipements de sécurité**. Rien n'est
  téléchargé.
- **Fiche A4 : 4 pages.** Page 1 la tenue, les gestes et les cinq réflexes, avec
  le **bloc d'urgence en pied** ; page 2 la planche des neuf pictogrammes ;
  page 3 le détail des six situations et les équipements ; page 4 la checklist,
  la table « du pictogramme au geste » et le QR code.
- **Carte posée au hub**, après OUTIL 2.

---

## Les propositions à valider

| # | Ce qui est proposé | Où |
|---|---|---|
| **O-23** | Catalogue à huit outils renumérotés · « Convertir » sort | `chapitres.md`, consignes |
| **O-24** | `o4` : tri fonctionnel principal + précision en seconde lecture | `chapitres.md` |
| **O-25** | `o6` : les **cinq étiquettes du cours en ligne**, mot pour mot | `chapitres.md` |
| **O-26** | `o7` : les cinq niveaux, marquage d'évaluabilité décroissant | `chapitres.md` |
| **O-27** | ✅ **tranché par toi** — reste la rédaction de l'étape 1.5 | `o3`, étape 1.5 |
| **O-28** | `o5` : le lien vidéo reste, sur la page seulement | `chapitres.md` |
| **O-29** | `o5` : huit rubriques renumérotées, renvoi corrigé vers le n°2 | `chapitres.md` |

S'y ajoutent, propres à `o3` et **tous rédigés par moi, donc à contester
librement** :

- la phrase d'ouverture qui **désamorce la peur** (« les produits d'une salle de
  seconde sont, pour l'essentiel, bénins ») ;
- l'explication du **coton** (une blouse synthétique fond et colle à la peau) —
  elle n'est pas dans ta fiche source, je l'ai ajoutée parce que la règle sans
  son motif ne tient pas ;
- les **trois flacons** de l'exercice 1 (éthanol, hydroxyde de sodium, sulfate de
  cuivre) et les **deux** de l'exercice 3 (eau oxygénée, acétone) : les mentions
  de danger sont réelles, mais le choix des produits est le mien ;
- la formule **« signaler un incident n'est jamais une faute, le cacher en est
  une »**, qui répond volontairement à ta remarque sur les hypothèses fausses
  (elle deviendra le « à retenir » de `o5`).

---

## Ce qui a surpris

**1 · `<svg hidden>` ne masque pas un SVG inline.** Il conserve sa taille par
défaut de 300 × 150 px et pousse toute la page vers le bas. Invisible à la lecture
du code, visible seulement au rendu. `style="display:none"` règle la question. Le
gabarit le dit maintenant, en toutes lettres.

**2 · `fill:none` ne capture pas le pointeur.** Les zones cliquables des
paillasses n'étaient atteignables **que sur les traits du dessin** — il fallait
viser un trait de 2 px. Trouvé en rejouant les 14 clics par script : le compteur
annonçait 0 sur 6 et 4 sur 8. `fill:transparent` rend toute la zone sensible.

**3 · Mesurer une fiche A4 avec `scrollHeight` ne prouve rien.** En `media print`,
`.feuille` porte `overflow:hidden` : un débordement est **écrêté avant d'être
mesuré**, et le test répond « OK » sur une page qui déborde. Il faut relâcher
`height` et `overflow`, puis mesurer le bas du dernier enfant. Les quatre pages
demandent 252, 254, 224 et 224 mm sur les 296 disponibles.

**4 · La fiche source des pictogrammes ne contient que des images.** Aucun texte
extractible pour la verrerie non plus — les deux coquilles « caratéristiques » et
« serpenti » que tu avais relevées sont dans une image, je les ai donc reportées
sur ta parole et non par recherche. Signalé comme tel dans le document d'équipe.

**5 · Le corrosif n'est dessiné qu'une fois dans la source**, alors que le texte
le liste dans deux familles. J'ai fait de cette bizarrerie un point
d'enseignement plutôt qu'un défaut à corriger : « neuf pictogrammes, dix cases ».

---

## Contrôles passés

- [x] `node verifier.mjs` → **18 problèmes**, avant comme après.
- [x] `git status -- assets/` **vide** : aucun asset partagé modifié.
- [x] `sequence-snt.css?v=41` · `sequence-snt.js?v=42` · `progression.js?v=16`.
- [x] Aucune collision de classe avec `sequence-snt.css` — vérifié **par script**.
      Les quatre classes communes (`cloze`, `glo-back`, `n`, `short`) sont des
      surcharges volontaires, qualifiées, identiques à celles de `o1`.
- [x] Aucune couleur en dur hors `:root`, dans le CSS comme dans le HTML.
      **Exception documentée** : les trois couleurs normatives du pictogramme CLP
      (rouge, noir, blanc), déclarées dans `:root` — un pictogramme de danger ne
      suit pas le thème sombre, sinon l'élève ne le reconnaît pas en salle.
- [x] Tous les `data-cle` préfixés `pc-o3-`, uniques, indépendants de la position.
- [x] `getBBox()` sur chaque `<text>` des SVG : **aucun débordement de viewBox**.
- [x] Les neuf pictogrammes **tiennent dans leur losange**, vérifié au **pixel**
      (rendu, puis recherche de tout pixel non-fond hors du losange rouge).
- [x] Rendu sans défilement horizontal à **1100, 768 et 390 px**, ce dernier
      **mesuré dans une iframe**.
- [x] Parcours complet : **zéro erreur console**. Les **30 champs** rejoués avec
      leurs bonnes réponses rendent « Tout est juste » sur les **7 blocs**. Les
      **14 zones** des deux paillasses répondent, comptent et se remettent à zéro.
- [x] QCM : **17 questions**, JSON valide, index de bonne réponse dans les bornes,
      corrigés non vides, **aucun biais de longueur** retenu.
- [x] Fiche A4 : **4 pages exactement**, aucune ne déborde.
- [x] QR code généré, jamais recopié : autovérifié par **syndromes Reed-Solomon
      nuls** sur les quatre blocs et par **relecture de la matrice** rendant
      l'URL. Le chemin collé a été comparé à la sortie du générateur.
- [x] La page s'ouvre sans base configurée.

⚠️ **Un contrôle n'a pas pu être fait** : aucun lecteur de QR tiers n'était
disponible dans la session. Le double contrôle interne est passé, mais
**scanne-le une fois avec ton téléphone** avant une impression en série.

---

## Ce qui reste

- **Lots C à G** : `o4` verrerie · `o5` compte rendu de TP · `o6` présenter un
  calcul · `o7` relation algébrique · `o8` graphique. Les sources sont lues et
  disponibles ; chaque lot attend ton feu vert.
- **Lot H** : la série de douze conversions versée dans `o1`. À ne lancer
  **qu'après validation d'O-23**.
- **Hors périmètre, comme convenu** : aligner les `.ex-lab` de `o1` et `o2` sur
  les cinq étiquettes (ligne ouverte dans `IDEES.md`) · élargir le filtre
  `pagesSNT` de `verifier.mjs` · poser des renvois « outils utiles » dans les
  quatorze chapitres · modifier T2-C2.
