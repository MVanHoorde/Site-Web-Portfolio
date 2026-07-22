# Biblio & sources — séquences SNT (document vivant)

> **À quoi ça sert.** Point d'entrée prioritaire quand on cherche une info fiable
> pour une séquence SNT : on regarde ici **avant** d'ouvrir une recherche web au
> hasard. Sources primaires privilégiées (institutions, acteurs d'origine),
> Wikipédia bannie des séquences (mais admise comme point de départ de recherche).
> Chaque point d'histoire mis en page dans une séquence **doit** porter sa source ;
> ce fichier centralise le vivier.
>
> **Entretien.** Domaine mouvant : dater chaque vérification. Quand une source est
> périmée, on la barre sans la supprimer (trace de la péremption = matière
> pédagogique « une donnée numérique se périme »).
>
> *Dernière mise à jour : 22/07/2026.*

---

## 0. Règles d'usage

- **Licence toujours mentionnée** sous chaque image intégrée (Wikimedia Commons :
  copier la ligne exacte depuis la page du fichier — non récupérable par l'outil).
- **Primaire > secondaire** : ARCEP, Inria, Internet Society, Computer History
  Museum, TeleGeography… avant tout agrégateur.
- **RGPD** : aucune ressource chargée par CDN dans une page élève ; les liens
  externes s'ouvrent dans un onglet, ils ne s'embarquent pas (sauf iframes
  audio/vidéo déjà arbitrées : Radio France, YouTube).
- **Fraîcheur** : pour tout chiffre (taux de connexion, part de la fibre, volume
  de trafic…), vérifier la dernière édition disponible avant de figer une valeur.

---

## 1. Séquence t1 — Internet (histoire, réseau, protocoles)

Reprend et complète la spec `spec-snt-t1-internet.md` §11.

**Histoire & culture du réseau**
- France Culture, *Une histoire de l'Internet*, Julien Le Bot, 2022 — série 8 ép.
  https://www.radiofrance.fr/franceculture/podcasts/serie-une-histoire-de-l-internet
- Interstices (Inria) — articles de vulgarisation histoire/réseaux : https://interstices.info
- Internet Society — histoire d'Internet : https://www.internetsociety.org
- Computer History Museum : https://computerhistory.org
- P. Mounier-Kuhn, *L'Informatique en France…*, PUPS, 2010 (Cyclades, Plan Calcul).
- France Télévisions, doc. *Les Français qui n'ont pas inventé Internet* (Cyclades/Pouzin).

**Protocoles & couches**
- Cookie connecté, *Modèle OSI / TCP-IP* (YouTube) : https://www.youtube.com/watch?v=26jazyc7VNk

**Chiffres de connexion mondiale (à re-vérifier chaque année)**
- We Are Social / Meltwater, *Digital Report* — dernier connu : 2026.
  (~6,04 Md connectés début 2026, 73 % de l'humanité.)

**Images (Wikimedia Commons — licences ⚖️ à confirmer sur chaque page)**
- Croquis ARPANET déc. 1969 · ARPANET années 1970 · démo 1977 · carte logique 1977
- CYCLADES · Louis Pouzin · backbone NSFNET
- The Opte Project (carte Internet) — CC BY 2.5, OK site, **revérifier avant usage
  commercial** (Tableo).

---

## 2. Séance t1-S2 — Réseau physique (câbles, débits, trafic)

### 2.1 Câbles sous-marins
- **TeleGeography — Submarine Cable Map** : https://www.submarinecablemap.com
  (activité élève ; fiches câbles Apollo, HUGO, Amitié, 2Africa ; data ouverte).
- TeleGeography, blog / FAQ câbles : https://www2.telegeography.com
- 🔍 *à sourcer proprement* : causes de coupures (ancres, chaluts, séismes),
  navires câbliers, gaine kevlar Google (chercher source primaire, pas forum).

### 2.2 Débits & couverture du territoire
- **ARCEP — Ma connexion internet** (carte débits/technologies par adresse) :
  https://maconnexioninternet.arcep.fr/
- **ARCEP — La fermeture du réseau cuivre** (⭐ pour l'encart « l'ADSL/le cuivre
  va disparaître ») : https://www.arcep.fr/nos-sujets/la-fermeture-du-reseau-cuivre.html
- ARCEP — grands dossiers réseaux fixes : https://www.arcep.fr/la-regulation/grands-dossiers-reseaux-fixes.html

### 2.3 Données & trafic (nouvelle étape 2.5)
- **ARCEP — Baromètre du numérique** :
  - ⚠️ **Édition 2026 disponible (publiée le 9 février 2026)** — plus récente que
    le lien fourni. Édition 2025 = données 2024. À utiliser de préférence :
    https://www.arcep.fr/cartes-et-donnees/nos-publications-chiffrees/barometre-du-numerique/le-barometre-du-numerique-edition-2026.html
  - Infographie 2026 (PDF) :
    https://www.arcep.fr/uploads/tx_gspublication/barometre-du-numerique-edition-2026_INFOGRAPHIE.pdf
  - Édition 2025 (rapport, infographie, présentation, open data) :
    https://www.arcep.fr/cartes-et-donnees/nos-publications-chiffrees/barometre-du-numerique/le-barometre-du-numerique-edition-2025.html
  - Open data (toutes éditions depuis 2007) :
    https://www.data.gouv.fr/fr/datasets/barometre-du-numerique/
- **ARCEP — Numérique et environnement** (pour le volet écologie/énergie du trafic) :
  https://www.arcep.fr/nos-sujets/numerique-et-environnement.html
- **ARCEP — décomposition du trafic vers les clients des principaux FAI** (image
  fournie par Loïc, « fin 2024 » : GAFAM/CDN/streaming/cloud/jeux) — source ARCEP,
  rapport « État d'internet en France ». 🔍 retrouver le PDF/rapport exact et son année.
- Statista — volume mondial de données (zettaoctets) 2010→2025 (graphe du fichier
  équipe) : source secondaire, **à réactualiser** avec un chiffre plus récent si trouvé.
- ⭐ **Banque mondiale — Rapport développement 2021, « Flux transfrontaliers »**
  (croissance du trafic Internet mondial sur ~30 ans, données TeleGeography) :
  https://wdr2021.worldbank.org/fr/stories/flux-transfrontaliers
  → série longue et parlante : 1992 ≈ 100 Go/**jour** · 2002 ≈ 156 Go/s ·
  2012 ≈ 16 800 Go/s · 2022 ≈ 153 000 Go/s (« ×1000 en 20 ans »). **Candidat
  n°1 pour la figure "évolution des données échangées depuis les débuts"** — à
  redessiner en SVG maison (échelle log) plutôt qu'à capturer. 🔍 chercher une
  actualisation post-2022 (Cisco VNI arrêté en 2019).
- ITU (2023) : ~5 100 Eo/an fixe + ~1 074 Eo/an mobile (via Sofrecom, 03/2025) —
  pour un point récent.

---

## 3. Réservé aux autres séquences (à ne pas doubler ici)

- t2 Web : ép. 5/8 du podcast France Culture (Berners-Lee/Cailliau) — réservé.
- t3 Réseaux sociaux : ép. 3, 4, 6 du podcast ; cadre légal 2026.
- Localisation : cartes.gouv.fr (Géoportail ferme sept. 2026).

---

## 4. À faire / à retrouver (file d'attente sources)

- 🔍 Rapport ARCEP source exacte de l'image « trafic FAI fin 2024 » + année.
- 🔍 Source primaire coupures de câbles (pas Wikipédia).
- 📅 Baromètre : basculer les chiffres sur l'édition 2026.
- ⚖️ Licences Commons des 6 images t1 encore « à confirmer ».
- 🔍 Chiffre mondial de trafic plus récent que Statista 2022 (VNI Cisco arrêté ;
  chercher un substitut fiable — ITU, Sandvine Global Internet Phenomena…).
