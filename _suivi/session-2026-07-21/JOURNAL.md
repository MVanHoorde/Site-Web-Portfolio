# Session du 21/07/2026 — refonte V3 de la séquence Internet

*Journal de la dictée vocale. À lire d'abord si tu reprends ce chantier dans quelques semaines.*

---

## 1. Ce qui a été livré

| Fichier | État |
|---|---|
| `pages/2nde-snt-t1-internet.html` | **V3** — restructurée, tous les mécanismes codés |
| `pages/2nde-snt-t0-systemes-informatises.html` | mécanismes **présentés** (texte), **pas encore codés** ici |
| `pages/2nde-snt-t2-le-web.html` | Minitel **développé** + image, encart 🇫🇷 refait |
| `assets/img/snt/2nde-snt-t1-internet/` | 8 images, optimisées (9,8 Mo → 2,1 Mo) |
| `assets/img/snt/2nde-snt-t2-le-web/` | 1 image (Minitel, Saint-Malo) |
| `_modeles/spec-snt-t1-internet.md` | **§13** ajouté — prime sur les §1-12 |
| `_modeles/CONSIGNES-sequence-SNT.md` | **§15** ajouté + règle des assets corrigée |
| `_suivi/session-2026-07-21/` | ce journal + les planches d'arbitrage |

---

## 2. Les décisions, en une page

**Structure.** S1 « C'est quoi Internet ? » = définitions **+** toute l'histoire.
S2 « Le réseau physique ». S3 inchangée. S4 (IP/DNS) **gelée**, sortira en séquences
séparées. « Internet ≠ Web » et le **Minitel** partent en séquence Web ; il n'en
reste ici qu'une mention avec picto.

**Évaluabilité.** Une échelle à cinq niveaux — ★★ à savoir · ★ à savoir faire ·
○ support · ✦ bonus · — non évalué — marquée en petit sur chaque bloc, expliquée
une fois pour toutes en t0. C'est autant un repère pour l'élève qu'une grille de
rigueur pour construire les sujets.

**Validation à l'envoi.** Une étape est validée dès que l'élève a répondu, juste ou
faux. La justesse est enregistrée à part, pour la vue enseignant.

**Forme.** Bandeaux allégés partout sauf « à retenir », seul bloc conservé en plein.
Barre de progression à gauche, repliable. Étapes révélées une par une.

**Correction.** QCM en plein écran avec flou et récapitulatif. Trous à trois états
avec variantes, tolérance orthographique et indices à deux niveaux.

**Glossaire.** Devenu un dictionnaire permanent, cherchable, prévu pour traverser
les séquences.

**Mode enseignant.** Code + minuterie de 30 minutes, discret en tête de page.

**PDF.** Feuille de style d'impression, pas de bibliothèque.

---

## 3. Ce qu'il faut savoir avant de reprendre

**Une règle du dépôt a été modifiée.** `CONSIGNES §5` interdisait tout asset externe
aux séquences SNT. Des photographies ne peuvent pas être inlinées sans faire exploser
le poids de la page. Les images matricielles sont désormais autorisées dans
`assets/img/snt/<slug>/`, optimisées. Les SVG restent inline.

**Le mode enseignant est un ralentisseur, pas une serrure.** Le code est `ROUTAGE`,
son empreinte SHA-256 est dans la page. Un élève qui ouvre l'inspecteur passe outre.
Ne jamais mettre de contenu sensible derrière ce verrou. La vraie serrure viendra du
rôle vérifié côté Supabase.

**Deux erreurs relevées dans le fichier équipe `02`.** Le premier message d'ARPANET
est du **29 octobre 1969** (le 21 novembre est la date du lien permanent). Et
« TCP/IP inventé en 1977 » est imprécis : TCP est décrit en 1974, la bascule est du
1ᵉʳ janvier 1983 — **1977 est l'année de la démonstration à trois réseaux**, ce que
l'image intégrée montre désormais. Le fond des collègues est conservé, la date reprend
son vrai sens.

**Le glossaire ne traverse pas encore les pages.** Tant que la clé anon n'est pas
renseignée, les définitions de l'élève restent dans la page où il les a écrites.

---

## 4. Reste à faire

### Avant la rentrée
- [ ] **Ouvrir les trois pages dans un navigateur** — le test Playwright de la
      checklist §10 n'a **pas** été exécuté. C'est le point le plus important de cette liste.
- [ ] **Porter les mécanismes V3 dans t0** : le texte de t0 décrit une barre de
      progression et des QCM plein écran que la page ne possède pas encore. Un élève
      qui lit l'introduction ne retrouvera pas ce qu'on lui a décrit.
- [ ] **Confirmer les licences ⚖️** sur Wikimedia Commons : croquis 1969, ARPANET
      années 1970, démonstration 1977, carte logique 1977, CYCLADES, Louis Pouzin,
      NSFNET, Minitel Saint-Malo. Huit pages de fichier à ouvrir, dix minutes.
- [ ] Changer le **code enseignant** si `ROUTAGE` ne convient pas.

### Ensuite
- [ ] Porter les mécanismes dans les six autres séquences.
- [ ] Extrait **Steve Jobs** sous-titré, ou encart écrit à la place.
- [ ] Épisode **5/8** du podcast France Culture, **réservé pour la séquence Web**.
- [ ] Sortir **adresse IP** et **DNS** en séquences dédiées (séance 4 gelée en attendant).

### Attention particulière
- [ ] La **carte Opte** est en CC BY 2.5 : bon pour le site, **à revérifier avant
      toute réutilisation commerciale** (chapitre vendu à Tableo).

---

## 5. Points laissés ouverts (aucune décision prise)

- La **note d'investissement** évoquée dans t0 suppose la correction entre camarades,
  qui n'est pas branchée.
- Les **dates cibles** de la barre de progression : le mécanisme existe, les champs
  sont vides. S'il faut un calendrier par groupe (tu en as trois), il devra vivre en
  base, pas dans le HTML — ce choix engage le schéma de données.
- L'extraction d'un vrai **`gabarit-sequence-snt.html`** : la condition est largement
  remplie, la décision t'appartient toujours.
