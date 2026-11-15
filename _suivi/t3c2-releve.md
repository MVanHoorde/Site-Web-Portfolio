# Relevé — T3-C2 « Signaux et capteurs »

> **V1 intégrale produite le 13/11/2026** selon `_modeles/CONSIGNES-V1-integrale-PC.md`.
> Source : `Thème 3 - Chapitre 2 (correction) - Signaux et capteurs.pptx` (+ PDF, 12 diapos +
> couverture), comparée à la version élève du même diaporama →
> `pages/2nde-pc-t3-c2-signaux-et-capteurs.html`.
>
> **Ce qui a été produit** : 32 schémas SVG inline (6 symboles de dipôles, 18 schémas de
> cours, 8 figures d'exercice dont 2 de correction), 15 photos extraites dans
> `assets/img/pc/2nde-pc-t3-c2/` (+ `CREDITS.md`), 1 cadre de réservation, 7 exercices et
> une activité, tous corrigés, 1 retouche de fond tracée par `<!-- SOURCE → CORRIGÉ … -->`.
> Plus aucun `.a-faire` sauf le lien de DS. Code de déblocage inchangé : **S1GNAL**.
>
> Le texte de l'ébauche du 25/08 était reformulé (définitions résumées, phrases
> inventées) : il a été **remplacé par le texte de la source, mot pour mot**.

---

## 1. Erreurs de physique corrigées

| # | Diapo | Ce que disait la source | Ce que dit la page | Pourquoi |
|---|---|---|---|---|
| **E1** | 7 (Ex. 2) | « Au nœud B, les courants entrants sont I₃ ; I₅ et I₆, il n'y a pas de courant sortant ; ainsi : I₃ + I₅ + I₆ = 0 » | « Au nœud B, les courants entrants sont I₃ et I₆, le courant sortant est I₅ ; ainsi : **I₃ + I₆ = I₅** » + un aparté sur le sens de I₅ | Sur le schéma **distribué aux élèves** (PPTX sans correction), la flèche de I₅ **sort** du nœud B. Seule l'image de la version corrigée retourne cette flèche pour coller au corrigé. La relation « tous entrants, somme nulle » est formellement juste mais impose qu'une intensité soit négative, hors de portée en seconde. Le schéma de la page suit l'énoncé élève. |

## 2. Incohérences de calcul

**Tous les calculs ont été refaits : aucun n'est faux.**

| Exercice | Calcul | Contrôle |
|---|---|---|
| Ex. 3 | U<sub>AB</sub> = 4,5 − 1,2 − 0,4 − 1,1 = 1,8 V | ✅ ; signes de la loi des mailles vérifiés sur le fléchage (parcours horaire) |
| Ex. 4 | U<sub>P</sub> = 4,00 + 1,25 + 0,75 = 6,00 V | ✅ ; fléchage de la correction cohérent (convention récepteur pour D, R1, R2 ; générateur pour la pile) |
| Ex. 5 | (8 ; 0,08) et (2 ; 0,02) | ✅ points relevés sur la droite, cohérents avec R = 100 Ω et le point (5 V ; 0,05 A) de l'Image 17 |
| Ex. 6 | R = (9 − 3) ÷ (0,060 − 0,020) = 150 Ω | ✅ ; la droite du graphe atteint bien 12 V à 0,080 A |
| Ex. 7 | U = 10 × 0,5 = 5 V | ✅ |
| Image 22 | « 40 °C → environ 500 Ω » | ✅ les points relevés donnent ≈ 490 Ω à 40 °C |

**Incohérences de numérotation de la source** (gardées telles quelles sur la page, à toi de trancher) :

- les parties vont de **I à VII sans IV** (la caractéristique est « V ») — la page numérote 01 à 06 ;
- **deux « Image 9 »** (l'analogie hydraulique, diapo 5, et le branchement du multimètre, diapo 6) ;
- **pas d'Image 18** (on passe de 17 à 19).

## 3. Contenus récupérés qui n'étaient nulle part ailleurs

| # | Diapo | Ce qui manquait | Où c'est maintenant |
|---|---|---|---|
| **M1** | 12, Image 22 | La **courbe d'étalonnage de la thermistance** — 16 points relevés au pixel sur l'image de la source : (7,6 °C ; 1934 Ω) · (11,8 ; 1600) · (15,7 ; 1328) · (21,1 ; 1053) · (26,5 ; 842) · (29,8 ; 732) · (34,0 ; 622) · (37,0 ; 536) · (41,2 ; 472) · (45,4 ; 401) · (50,6 ; 336) · (54,7 ; 291) · (59,3 ; 244) · (66,4 ; 200) · (70,9 ; 179) · (74,5 ; 154) | SVG retracé depuis ces points (courbe lissée qui passe par chacun) ; valeurs clés dans la description accessible |
| **M2** | 10, Image 17 | Les **cinq points de mesure** du résistor : (0,02 A ; 2 V) … (0,10 A ; 10 V), et le repère vert 0,05 A / 5 V | SVG, points marqués d'une croix |
| **M3** | 11, Ex. 6 | La droite du graphe : de l'origine à **(0,080 A ; 12 V)**, axes 0–14 V et 0–0,080 A | SVG |
| **M4** | 4, Ex. 1 | Le schéma, ses **six légendes** (pile, lampe ×2, interrupteur ouvert, diode bloquante, résistance) et les **dix flèches de courant** de la correction — formes PowerPoint, absentes de toute image | Deux SVG : énoncé nu, correction légendée |
| **M5** | 9, Ex. 4 | Les **flèches de tension et de courant** et la flèche de parcours de la correction (formes PowerPoint) | SVG de correction |
| **M6** | 11, Ex. 7 | Le circuit et toutes ses données (E = 12 V, r = 2 Ω, I = 500 mA, R1 = 10 Ω, R3 = 5 Ω, I2 = 100 mA) | SVG |
| **M7** | 10, Image 16 | La caractéristique réelle d'une diode (zones de polarisation, V<sub>A</sub>, V<sub>RM</sub>, I<sub>R</sub>, V<sub>F</sub>, I<sub>FM</sub>) et le modèle à seuil (i max, uinv max) | Un SVG, les deux tracés côte à côte |
| **M8** | 3, Image 4 | **Masquées par un rognage du PPTX**, les valeurs du circuit complexe : « On donne : R1 = R2 = 5 Ω ; R3 = R4 = R5 = 10 Ω ; E1 = 8 V ; E2 = 12 V ; E3 = 6 V ; E4 = 2 V » | **Non posées** (invisibles dans la source) — notées ici au cas où tu voudrais en faire un exercice |
| **M9** | 10 | Titre masqué par un rognage au-dessus du modèle à seuil : « Caractéristique idéalisée d'une diode silicium » | Non posé (invisible dans la source) |

## 4. Licences à confirmer

Toutes les photos sont des **images tierces d'origine inconnue**, extraites du PPTX ;
chaque `<figure>` porte `data-origine="source PPTX — licence non identifiée"`, et le
détail fichier par fichier est dans `assets/img/pc/2nde-pc-t3-c2/CREDITS.md` :
résistance, générateur, LED, piles (marque visible), diode, lampe, coupe de fil (Image 7),
multimètre (bricoman.fr d'après le lien du PPTX), oscilloscope Hantek (circuitspecialists.com),
centrale Sysam SP5 (pierron.fr), micro de guitare, thermistance, thermocouple, micro:bit, rover Arduino.

🔴 **Image 19 (circuit imprimé, diapo 11) non reprise** : l'image d'origine porte, sous le
rognage du PPTX, le **filigrane d'Alamy** (banque d'images payante, réf. TN9AWG). Sa
licence est donc identifiée — et elle interdit la reprise sur un site public. Un **cadre
de réservation** (`t3c2-circuit-imprime.jpg`, paysage ≈ 600 × 360 px) garde la place et
la légende ; il faut une photo libre (Wikimedia Commons en a beaucoup).

## 5. Remarques pédagogiques

Une ligne chacune, sans correction sur la page : tu tranches.

- **Intensité (diapo 5)** : « Elle correspond à la quantité et la vitesse du courant électrique » — l'intensité est un débit de charges ; « vitesse du courant » peut installer une confusion avec la vitesse des électrons.
- **Impédance (diapo 10)** : « Cette relation est caractérisée par l'impédance du dipôle » — notion jamais définie, hors programme de seconde.
- **Image 16** : V<sub>RM</sub>, I<sub>FM</sub>, V<sub>F</sub>, V<sub>A</sub>, I<sub>R</sub> sont des notations de fiche technique, jamais expliquées.
- **Ex. 4** : U<sub>D</sub> = 4,00 V pour une diode est peu réaliste (une diode au silicium chute d'environ 0,6 V, une LED de 1,8 à 3 V). Et le schéma élève ne nomme ni D ni R1 ni R2 : impossible de savoir quelle résistance porte 1,25 V (étiquettes ajoutées, voir § 6).
- **Ex. 7** : le circuit porte beaucoup de données inutiles à la question (E, r, R2 avec « ? », R3, R4, I2) et un symbole de générateur (cercle traversé d'un trait, norme CEI) jamais présenté dans le cours ; « la tension de R1 » plutôt que « la tension aux bornes de R1 ». Peut-être un exercice plus riche tronqué ?
- **Ex. 1, question 3** : sans texte dans la source (« 3. … ? » puis deux cases).
- **Diapo 2** : les cases « Générateur / Récepteur » ne sont pas cochées dans la version corrigée : pas de corrigé dans la source.
- **Image 12** note les intensités i<sub>1</sub>… en minuscules, le reste du chapitre en majuscules (I<sub>1</sub>…).
- **Image 23** : « deux microcontrôleurs à processeurs ARM Cortex-M0 » vaut pour la micro:bit V1 (et le second est un Cortex-M0+) ; la V2, vendue aujourd'hui, a un Cortex-M4. À vérifier selon les cartes du labo.
- **Compétences du programme sans exercice** : rien ne fait manipuler les capteurs — aucun exercice sur une courbe d'étalonnage (lire une température à partir d'une résistance), ni sur le microcontrôleur. La partie 06 est entièrement descriptive.
- **Typographie** : « 1ère / 2ème loi de Kirchhoff » écrits « 1<sup>re</sup> / 2<sup>e</sup> » ; « Evolution » (titre du graphe de l'Ex. 6) accentué.
- **Légendes de position** adaptées à la mise en page (photos côte à côte au lieu d'empilées) : Image 10 « ci-dessus / ci-contre » → « à gauche / à droite » ; Image 16 « ci-dessous » → « à droite » ; Image 21 « au-dessus » → « à gauche ». Chaque fois un commentaire HTML le signale sur place.
- **Schémas retracés, petites libertés** (chacune visible au premier coup d'œil) : Image 2, le circuit « interrupteur fermé » porte un interrupteur fermé (la source montrait un simple fil) ; Image 3, les deux points du côté gauche sont dessinés en interrupteur fermé ; Image 14, les flèches de tension passent du rouge au cyan pour suivre le code couleur du chapitre (rouge = courant, cyan = tension).

### Vidéos

- **Deux liens introuvables, rien n'est posé** (un commentaire `VIDÉO SANS LIEN` marque la place) :
  - diapo 11 — « S'exercer en vidéo : La loi d'Ohm ✏️ Exercice facile, Paul Olivier » : l'hyperlien pointe vers la vidéo « Loi des nœuds » (N-Johiwk-To), déjà posée en partie 02 ;
  - diapo 12 — « Réviser en vidéo : Capteurs et Microcontrôleurs, Florence RAFFIN » : l'hyperlien pointe vers la vidéo Mathrix « Dipôles et circuits électriques » (_BEr9CPHnAc), déjà posée en partie 01-B.
  Il me faut les deux bonnes URL.
- **Liens fantômes retirés** : diapos 7 et 11, un caractère espace porte un second lien vers 8_TFftdCO6E (la vidéo de la caractéristique, posée en partie 04).
- Les `?si=` des liens courts ont été retirés. Les 13 vidéos posées sont en `video-chip` YouTube comme dans T3-C1 ; le passage aux MP4 sur OneDrive (règle du 03/10) reste à faire pour ce chapitre comme pour les autres.

## 6. Propositions de Claude à valider

Toutes marquées `<!-- PROPOSITION … -->` à leur place dans la page.

1. **« Pour le DS, je sais »** — la source n'en a pas (ni Kahoot). Dix lignes tirées du programme de seconde, chacune renvoyant à la partie qui la traite ; la page affiche « Proposition — en attente de validation ». Rien n'y est demandé qui ne soit montré dans le cours ; la capacité « utiliser un dispositif avec microcontrôleur et capteur » n'y est **pas**, faute de contenu travaillé.
2. **Activité « Générateur ou récepteur ? »** (diapo 2) — consigne et corrigé (tableau + une phrase) rédigés par Claude.
3. **Schéma « grandeur physique → capteur → grandeur électrique »** (partie 06-A), exemple thermistance.
4. **Ex. 1** : texte de la question 3 ; phrase de conclusion de la correction (« le courant ne parcourt qu'une seule boucle »).
5. **Ex. 4** : étiquettes D, R1, R2 sur le schéma de l'énoncé.
6. **Ex. 2** : aparté « Attention au sens des flèches : I<sub>5</sub> repart du nœud B ».
7. **Ex. 5** : précision « avec U en volts et I en ampères » (la source écrit les couples sans unités).
8. Une phrase de liaison avant les symboles : « Chaque dipôle se représente sur un schéma par un symbole normalisé. »

---

**Pour la page, côté technique** : CSS local dans le `<style>` de la page (`.dipoles`,
`.photos`, `.paire`, `.reserve` repris du patron O3, `.fig-svg`, `.avec-frac`, `h4.sous`) ;
`chapitre-commun.css` n'a pas été touché.
