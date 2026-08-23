# t0 — Manifeste des images

> Réécrit le 23/08/2026. Remplace `t0-images-a-trouver.md`.
>
> **47 fichiers**, 2,3 Mo au total, dans
> `assets/img/snt/2nde-snt-t0-systemes-informatises/`.
>
> Trois provenances, et elles ne se traitent pas pareil :
>
> `📷` **photo de Loïc** — sa propre machine. Aucune restriction. Peut et doit
> être présentée comme telle dans le cours.
> `🌐` **Wikimedia Commons** — licence libre identifiée. **Crédit auteur +
> licence obligatoires** à côté de l'image.
> `📄` **extraite des documents de cours de Loïc** — provenance tierce inconnue.
> Voir l'avertissement ci-dessous.

---

## ⚠️ Le point de provenance, à lire une fois

Les images marquées `📄` ont été extraites des trois PDF du cours (présentation,
fiche élève, activité). Loïc est l'auteur du cours ; il n'est pas l'auteur de
ces images, qui sont pour l'essentiel des visuels de fabricants récupérés au
fil du montage. Les publier sur un dépôt **public** relève de la même décision
que celle prise pour les captures macOS et ChromeOS (**T0-8** du brief) : usage
pédagogique, non commercial, assumé par Loïc.

Deux conséquences pratiques :

1. **Aucun crédit n'est possible** pour ces images — leur origine n'est pas
   traçable. C'est précisément ce qui les distingue des `🌐`.
2. **Si le site s'ouvre un jour à d'autres établissements**, ce sont les
   premières à remplacer. Une bonne partie a un équivalent libre sur Commons
   (`Category:Motherboards`, `Category:Hard disk drives`,
   `Category:Expansion cards`, `Category:USB connectors`).

Rien de tout cela ne bloque la rentrée.

---

## Résolutions : ce qui tient, ce qui ne tient pas

Les images extraites des PDF ont la **résolution du PDF**, souvent modeste.
Elles conviennent en vignette ou en illustration de demi-colonne, pas en
pleine largeur.

| Usage | Largeur minimale | Ce qui passe |
|---|---|---|
| Vignette de bandeau | ≥ 220 px | presque tout |
| Illustration de demi-colonne | ≥ 400 px | la majorité |
| Support d'exercice de légende, pleine largeur | ≥ 900 px | **seulement les 📷 et les 🌐** |

**Trois cas à surveiller :**

- `t0-carte-mere.jpg` — 640 × 480. Suffisant pour illustrer, **insuffisant pour
  l'exercice de légende** prévu à l'étape 2.3. Chercher un remplaçant sur
  Commons, ou rabattre l'exercice sur la photo intérieure de Loïc.
- `t0-resolution-ecran.jpg` — 284 × 177. **À ne pas utiliser** : c'est
  précisément le schéma que le brief demande de refaire en SVG (§5), et il
  confond définition et résolution comme le fait le document source.
- `t0-boitier-tour.jpg`, `t0-moniteur.jpg`, `t0-cable-vga.jpg`,
  `t0-cable-rca.jpg`, `t0-ssd-et-hdd.jpg`, `t0-logos-os.png` — sous 300 px.
  Vignettes uniquement.

---

## Séance 2 — composants internes

| Fichier | Contenu | Source |
|---|---|---|
| `t0-carte-mere.jpg` | Carte mère seule, vue de dessus | 📄 |
| `t0-slots-pcie.jpg` | Ports PCIe sur une carte mère | 📄 |
| `t0-cpu-deux-faces.jpg` | Processeur Intel, **les deux faces** — contacts et capot | 📄 |
| `t0-cpu-intel-i9-14900kf.jpg` | Processeur Intel Core i9-14900KF, face sérigraphiée | 🌐 CC BY-SA 4.0 · Pstrahl, 2024 |
| `t0-barrette-ram.jpg` | Barrette de mémoire vive | 📄 |
| `t0-alimentation-ouverte.jpg` | Bloc d'alimentation ouvert, ventilateur et prise secteur | 📄 |
| `t0-disque-dur-ouvert.jpg` | **Disque dur ouvert** : plateau et bras de lecture | 📄 |
| `t0-disque-dur-carte.jpg` | Disque dur, face électronique et connecteur SATA | 📄 |
| `t0-ssd-2p5.jpg` | SSD au format 2,5 pouces | 📄 |
| `t0-ssd-msata-sur-hdd-2p5.jpg` | SSD mSATA posé sur un disque dur 2,5″ — **écart de taille** | 🌐 CC BY-SA 3.0 · Vladsinger, 2013 |
| `t0-ssd-et-hdd.jpg` | SSD et disque dur empilés | 📄 |
| `t0-lecteur-dvd.jpg` | Lecteur-graveur DVD | 📄 |
| `t0-carte-graphique.jpg` | Carte graphique | 📄 |
| `t0-carte-graphique-basse.jpg` | Carte graphique à profil bas, sorties VGA/DVI/HDMI | 📄 |
| `t0-carte-son.jpg` | Carte son et ses sorties jack | 📄 |
| `t0-carte-reseau.jpg` | Carte réseau à ports RJ45 | 📄 |
| `t0-carte-wifi.jpg` | Carte Wi-Fi et ses deux antennes | 📄 |
| `t0-carte-controleur-usb.jpg` | Carte contrôleur USB | 📄 |
| `t0-port-ide.jpg` | Connecteur IDE sur un disque dur | 📄 |
| `t0-nappe-ide.jpg` | Nappe IDE | 📄 |
| `t0-cable-sata.jpg` | Câbles SATA | 📄 |
| `t0-boitier-tour.jpg` | Boîtier d'unité centrale | 📄 |
| `t0-photo-machine-recente-interieur.jpg` | **Intérieur de la machine de Loïc** — carte mère, RAM, RTX 5080, watercooling, slot M.2 | 📷 |

## Séance 3 — périphériques externes et connectiques

| Fichier | Contenu | Source |
|---|---|---|
| `t0-moniteur.jpg` | Moniteur | 📄 |
| `t0-cable-vga.jpg` | Câbles VGA | 📄 |
| `t0-cable-dvi.jpg` | Câbles DVI | 📄 |
| `t0-jacks-audio.jpg` | Code couleur des prises jack et S/PDIF | 📄 |
| `t0-cable-rca.jpg` | Câble RCA coaxial | 📄 |
| `t0-box-internet.jpg` | Box internet | 📄 |
| `t0-cable-rj45.jpg` | Câble réseau RJ45 | 📄 |
| `t0-port-rj45.jpg` | Port RJ45 en gros plan | 📄 |
| `t0-imprimante.jpg` | Imprimante | 📄 |
| `t0-clavier-souris-imprimante.jpg` | Clavier, souris et imprimante | 📄 |
| `t0-usb-a-et-c.jpg` | USB-C et USB-A 3.x côte à côte | 📄 |
| `t0-formats-usb.jpg` | Les formats USB : A 3.1, C, micro-B | 📄 |
| `t0-hub-usb.jpg` | Hub USB | 📄 |
| `t0-port-usb-c-smartphone.jpg` | Port USB-C sur un smartphone | 📄 |
| `t0-photo-tour-ancienne-arriere.jpg` | **Arrière d'une vieille tour** — support de l'exercice de légende. Numéro de série flouté. | 📷 |
| `t0-photo-machine-recente-arriere.jpg` | **Arrière de la machine de Loïc**, câblée — comparaison ancien / récent | 📷 |
| `t0-tour-dell.jpg` | Unité centrale compacte Dell — face avant de l'Activité N°1 | 📄 |
| `t0-tour-dell-arriere-schema.jpg` | Face arrière annotée de l'Activité N°1 | 📄 |

## Séances 1 et 3 — terminaux et caractéristiques

| Fichier | Contenu | Source |
|---|---|---|
| `t0-ordinateur-bureau.jpg` | Ordinateur de bureau | 📄 |
| `t0-ordinateur-portable.jpg` | Ordinateur portable | 📄 |
| `t0-smartphone.jpg` | Smartphone | 📄 |
| `t0-photo-machine-recente-boitier.jpg` | Unité centrale fermée — la machine de Loïc | 📷 |
| `t0-logos-os.png` | Logos Windows, macOS, Linux, iOS, Android | 📄 |
| `t0-resolution-ecran.jpg` | Définition d'écran — ⚠️ **ne pas utiliser**, refaire en SVG | 📄 |

### Déjà dans le dépôt, hors ce dossier

`Summit__supercomputer_` 🌐 · `Pocket_PC` 🌐 · `LYF_WATER_2_Smartphone` 🌐 ·
comparaison de tablettes 🌐 · `Nvidia_Shield_Tablet` 🌐 ·
`Windows_logo…2021` 🌐 · `MacOS_Golden_Gate_screenshot` ⚠️ ·
`ChromeOS_screenshot` ⚠️ — à verser dans le même dossier au moment du portage.

---

## Toujours à produire en SVG

Le brief §5 les décrit. Aucun n'est couvert par ce qui précède.

1. **Le jeu de connecteurs** à la même échelle, pour l'exercice d'association —
   remplace le tableau anglophone écarté. Les photos ci-dessus servent
   d'illustration, pas d'exercice : elles n'ont ni la même échelle ni le même
   fond.
2. **Slots PCIe x1 / x4 / x16** comparés.
3. **Pouces et diagonale** — le 15″ = 38,1 cm.
4. **Définition vs résolution** — les deux notions distinguées proprement.

## Toujours à trouver

- 🔍 **Carte mère haute définition** (≥ 900 px) si l'exercice de légende de 2.3
  est maintenu en pleine largeur.
- 🔍 **SSD M.2** seul, format actuel.
- 🔍 **Montre connectée**, **baie de serveurs**.
- 🔍 **Deux ou trois systèmes « qui n'en ont pas l'air »** — borne de bus, caisse
  automatique, lave-linge. C'est l'accroche de la séance 1, et rien dans les
  documents source ne la couvre.
- 🔍 **Touchpad** en gros plan.

## Convention de dépôt

- **Dossier** : `assets/img/snt/2nde-snt-t0-systemes-informatises/`
- **Nom** : préfixe `t0-`, minuscules, tirets, descriptif
- **Traitement** : maximum **1100 px de large** (jamais agrandir), JPEG
  qualité 84, progressif, optimisé. Cible : **sous 300 Ko**
- **EXIF** : redresser à l'enregistrement (`ImageOps.exif_transpose`) — les
  photos de téléphone sortent en paysage avec une balise d'orientation que
  tous les navigateurs n'honorent pas
- Originaux haute définition **hors du dépôt**, sur le PC de Loïc
- Aucune image appelée depuis un domaine extérieur
