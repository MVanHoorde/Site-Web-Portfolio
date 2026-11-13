# Projet expérimental et numérique (PEN) — ES 1re, 2026-2027 — cadrage

> Ouvert le 13/11/2026. **Maquette cliquable** (données fictives, sans base) :
> `pages/1re-es-projet-maquette.html`, à montrer à Mme Joannes. Rien n'est branché.
> Source : BO n° 25 du 22/06/2023 (§5), présentation Canva de Loïc, grille 2025-2026
> (M. Van Hoorde & Mme Joannes).

## 1. Ce qui est décidé (Loïc, 13/11/2026)

- **Projet libre**, en physique-chimie (Loïc) **ou** en SVT (Mme Joannes).
- **Groupes préconstruits** : 33 élèves, **9 groupes de 4 places** — 5 en PC, 4 en SVT.
  Les élèves entrent et sortent librement ; **Loïc ferme les groupes** quand il veut.
  2 à 4 élèves par groupe, jamais seul ; les groupes de 2 se règlent en classe s'il y
  en a trop. La classe se coupe en deux selon ce choix ; chaque enseignant suit sa
  moitié tout le projet. **Lundi 1 h = classe entière**, les deux enseignants peuvent
  y être (temps bonus).
- **Premiers arrivés, premiers servis** : l'ordre d'arrivée et l'ordre des envois
  comptent (équilibre PC / SVT), tout est horodaté.
- **Une partie ouverte sans compte** (de quoi il s'agit, calendrier, où mesurer,
  pièges), et une **tuile « Projet » sur l'écran de l'élève, à côté des cours**.
- **En amont** :
  - présentation du projet (diaporama Canva, dates à corriger) à la classe entière du
    **lundi 23/11/2026** ; consigne au cahier de textes ;
  - **groupes déclarés avant les vacances** ;
  - **au retour (lundi 4/01/2027)** : pré-projet — problématique, hypothèses, idées
    d'expériences (combien, où, combien de temps), matériel. Loïc vérifie la
    faisabilité et réoriente ; **version validée avant les vacances de février**.
- **Fenêtre du projet : 1/03 → 9/04/2027**, dates exactes à confirmer :
  lun. 1/03 classe entière 1 h · ven. 5/03 1 h 15 · ven. 12/03 demi-groupe 1 h 15
  (manip) · lun. 15/03 classe entière 1 h · ven. 19/03 demi-groupe (manip) ·
  ven. 2/04 1 h 15 · ven. 9/04 demi-groupe (**oraux**).
- Deux séances de manip suffisent **si c'est préparé en amont** : mesures en extérieur
  possibles pendant les classes entières, et **beaucoup de manips à la maison — à
  écrire explicitement partout** (diaporama, récap, appli).
- Mini-formations **en libre-service, sur le côté** : les pièges, de quoi parler des
  données, des **fichiers tout prêts** pour ceux qui ne sont pas en spécialité PC,
  une piste avancée.
- La grille se remplit **dans l'appli**, par groupe.
- Matériel : **les élèves écrivent eux-mêmes au labo** (Coralie, EcoleDirecte, une
  semaine avant, avec le protocole). L'appli ne fait que **rappeler** : icône 🧪 avec
  pastille partout, rappel à la connexion, cases à cocher (demande envoyée, réponse
  reçue, on a ce qu'il faut) visibles du groupe et de l'enseignant.
- **Tout s'exporte à tout moment** (journal, synthèse par groupe, tout) pour évaluer
  l'investissement, les échanges, la qualité des dépôts.
- Classes entières ou moitiés entre le 1/03 et le 2/04 : **selon l'arrangement avec
  Mme Joannes, à préciser**.

## 2. L'appli — proposition

Tout se fait sur le site, avec le compte d'ES que l'élève a déjà. **Aucun nom en
base** : les membres d'un groupe sont des identifiants ; les noms viennent de la table
des noms chargée localement, comme ailleurs.

### Côté élève — `pages/1re-es-projet.html`, une page par étape

| Étape | Échéance | Ce que l'élève fait | Horodaté |
|---|---|---|---|
| 1. Groupe | avant le 18/12 | choisit une place dans l'un des 9 groupes préconstruits (PC ou SVT), peut en changer tant que c'est ouvert | chaque arrivée, chaque départ |
| 2. Pré-projet | 4/01 | fiche commune au groupe : problématique, hypothèses, expériences envisagées (pour chacune : où — labo / maison / extérieur / données en ligne —, nombre de mesures, durée), matériel | chaque envoi |
| 3. Retour et version validée | février | lit le commentaire, corrige, renvoie jusqu'à « validé » | chaque envoi |
| 4. Labo | une semaine avant chaque manip | rappels et trois cases à cocher ; la demande elle-même part par EcoleDirecte | chaque case |
| 5. Journal de bord | à chaque séance | date + ce qui a été fait (sert le critère « respect du calendrier ») | chaque entrée |
| 6. Données et oral | 9/04 | dépôt des fichiers (stockage `depots`, 025) et du support | dépôt |

Le cahier de laboratoire reste celui du groupe (papier ou numérique) : l'appli ne le
remplace pas, elle trace les jalons.

### Côté enseignant — un onglet « Projet » dans le tableau de bord (espace es1)

- Les 9 groupes, membres **dans l'ordre d'arrivée**, compteurs (placés, sans groupe,
  PC · SVT, seuls, groupes de 2) ; **fermer / rouvrir** ; déplacer ou retirer un élève.
- Pour chaque étape : qui a envoyé quoi et quand, statut (envoyé / à revoir / validé),
  commentaire au groupe.
- **Grille par groupe** (composante de groupe /53, individuelle /10 par élève, total
  /63 → /20), remplie sur tablette pendant l'oral ; export.
- Mme Joannes : un compte enseignant rattaché à la classe (comme Mme Castel, 020) ;
  elle voit les deux moitiés et note les groupes SVT.

### Base (projet `ztyv…`) — une migration à écrire

`pen_groupes` (classe, nom, discipline, code, créé le), `pen_membres` (groupe, élève,
arrivé le), `pen_depots` (groupe, étape, contenu jsonb, envoyé le, statut,
commentaire), `pen_evaluations` (groupe, grille jsonb, notes individuelles).
**Poids** : du texte, quelques Ko par groupe et par étape, soit une dizaine de groupes
par classe — négligeable. En base parce que le travail est partagé entre les membres
du groupe et lu par deux enseignants : une page HTML ne peut pas le faire. Les fichiers
vont dans le stockage `depots` (quota fichiers), pas dans la base.

## 3. Mini-formations en libre-service (page « Ressources »)

- Défis de mesure à la maison : règle qui tombe, pendule-clé, tasse qui refroidit,
  téléphone-capteur (phyphox).
- Fiches courtes : une mesure n'est pas une valeur · combien de mesures · planifier une
  acquisition · les pièges (une seule mesure, axes sans unité, courbe reliée point à
  point, conclusion qui dépasse les données).
- **Classeurs tout prêts** : on colle ses mesures, on obtient moyenne, écart-type,
  histogramme et graphique.
- Piste avancée : un petit script Python qui lit un CSV et trace.

## 4. Questions ouvertes

- À proposer à Mme Castel (1re 5 et 1re 6), puis aux autres collègues d'ES.
- Date exacte de la validation (avant les vacances de février).
- Classes entières ou moitiés du 1/03 au 2/04 : selon l'arrangement avec Mme Joannes.
- Grille 2026-2027 : la variante « données en ligne » de la phase 3 et un critère
  numérique (proposés le 13/11) ?

## 5. Décisions du 13/11/2026 (deuxième passage sur la maquette)

- **Bandeau IA** en tête de l'espace projet : *l'IA générative n'est pas autorisée*
  (ni pour écrire, ni pour inventer des données, ni pour les graphiques).
- **Rien n'est jamais verrouillé** : un élève regarde tous les onglets quand il veut ;
  écrire demande seulement d'être connecté et dans un groupe.
- **Place dans l'écran de l'élève** : en attendant la séparation cours / projet (prévue
  d'ici une semaine), le projet s'ajoute **sous les cours** sur la page de première.
  Pendant la phase de projet (01/03 → notes rendues), il passe **au-dessus** des cours,
  puis repasse dessous.
- **Correction « comme au bac »** : la copie du groupe (pré-projet, journal, fichiers,
  labo) à gauche, la grille à droite, saisie en direct.
- **Notation (proposition à valider)** : écrit /27 et travail du groupe /11 en note de
  groupe ; oral commun /5 (5 étapes, support, temps de parole) ; **oral individuel /10
  sur les cinq critères du Grand oral** (niveaux TI / I / S / TS, mêmes points qu'en
  2025-2026) ; investissement personnel /5. Total 58 → /20. « Qualité de la prise de
  parole /5 » est absorbée par l'oral individuel. Les notes se construisent toutes
  seules à partir des saisies ; export CSV.
- **Collègues** : Mme Joannes (Clémence) — Loïc lui demande d'abord par courriel si
  elle veut suivre ses groupes sur le site ; sinon les groupes de SVT se forment ici et
  la suite se fait avec elle (réglage « Mme Joannes suit ses groupes sur le site »).
  Mme Castel : le projet apparaît d'office dans son tableau de bord. Autres collègues
  d'ES : sur demande.
