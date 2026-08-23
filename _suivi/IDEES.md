# Idées & améliorations à trier

> Mise à jour : 23/08/2026
> Réservoir vivant : Loïc y jette ses idées « au fil de l'eau », on les trie
> ensuite (garder / différer / abandonner) et on les bascule en jalon 4
> (« ajouts & approfondissements ») du chapitre concerné.

Statuts : 💡 à trier · 👍 retenu · 🔄 en cours · ✅ fait · ❌ abandonné

---

## Transverses (tout le site)

**Dispositifs pédagogiques réutilisables** (nés d'une séquence, valables ailleurs)

- 👍 **Faire échouer la mémorisation pour justifier l'outil.** L'élève relève des
  données, la page se floute, il doit les restituer de mémoire — et n'y arrive pas.
  L'échec est le ressort, pas un accident : l'outil (ici le DNS) répond alors à un
  besoin que l'élève a *ressenti*. Éprouvé en `t1` étape 4.3. Transposable partout
  où un outil sert à décharger la mémoire humaine (tableau périodique, formulaire,
  table de conversion, index…).
- 💡 **Transformer une contrainte technique en contenu.** Quand un exercice ne
  marche pas « proprement » pour une raison réelle, l'expliquer à l'élève au lieu
  de la masquer. Exemple : deux élèves relèvent deux adresses IP différentes pour
  un même site et ont tous les deux raison — c'est devenu un paragraphe et une
  question de QCM. Cherche systématiquement cette conversion avant de simplifier
  un exercice.
- 💡 **Nommer dans l'activité l'organisme dont on parle dans le cours.** En 4.3,
  l'un des trois sites à relever est celui de l'AFNIC, citée trois paragraphes plus
  loin. Boucle gratuite, effet mémoire réel.

## Fraîcheur des documents datés

- 💡 **`t1` étape 4.4 — doc 2 de l'Arcep, millésime « fin 2024 »** (reporté ici le
  22/08/2026, en retirant le bandeau de chantier de la page). Le document porte
  son année dans son titre et dans sa note, et les questions du QCM sont
  formulées en **ordres de grandeur** : elles ne se périment pas si le classement
  des plateformes bouge. À rafraîchir seulement le jour où tu voudras une
  édition plus récente de l'Arcep — ce n'est pas une dette, c'est un rendez-vous.

## Modules transversaux SNT à créer

- 💡 **Filius — un module transversal, plus tard** (posé le 23/08/2026, à la
  clôture de `t1`). *Statut : idée cadrée, pas de calendrier.*
  Filius ne sera **pas** une activité du thème 1. Il devient un **module
  transversal à part**, sur le modèle de `m1` « Représenter l'information » —
  hors des huit thèmes, mobilisable ou non selon l'année.
  Forme envisagée : plusieurs activités Filius, orientées « pour aller plus
  loin ». Possiblement un module entièrement de ce type. **Forme non arrêtée.**
  Motif du retrait de `t1` : (1) Filius dépasse le programme de SNT, tout en
  restant intéressant — réseau domestique, passerelles, routage manipulable ;
  (2) intégré au thème, il entrerait dans le décompte des **100 %**, et les
  élèves voudraient l'atteindre même les années où l'activité n'est pas menée.

## Passerelles vers la spé NSI

- 💡 **`t1` — la passerelle NSI d'adressage** (ports, masque de sous-réseau).
  *Posée le 23/08/2026, **abandonnée pour le moment** le même jour.*
  Elle devait clore le thème avec Filius, puis rejoindre le bonus 6.6 quand
  Filius est parti. Vérification faite : elle n'avait jamais été écrite — la
  déplacer revenait à s'engager à la rédiger. Loïc a préféré ne pas la faire
  maintenant, plutôt que de la garder en dette ouverte sur un thème par
  ailleurs terminé.
  Cadre si elle revient (règle `CLAUDE.md`) : **facultative, NON évaluée, hors
  100 %** — un simple **repérage de notions**, pas un cours. Sa place naturelle
  reste le bonus d'adressage 6.6, qui traite déjà IPv6 et l'hexadécimal. Elle
  ne doit pas figurer sur la fiche élève téléchargeable.

## Par chapitre
### T1-C4
- 💡 Réintégrer le tableau périodique complet (actuellement bloc 🚧 différé).

## Publicités sur les postes de visionnage

- 💡 **Supprimer les publicités des deux postes de visionnage du thème 1**
  (étapes 5.2, les couches, et 6.3, le DNS). `youtube-nocookie` supprime le
  cookie publicitaire, **pas les publicités** — c'est le motif de Loïc.
  Piste : **Digiview**, de La Digitale — lecteur épuré, sans publicité ni
  suggestions, qui fournit un **lien iframe**. Ce serait donc un remplacement
  direct des `<iframe src="https://www.youtube-nocookie.com/embed/…">`, sans
  toucher à la structure du `.poste`.

  Trois vérifications préalables, **à faire par Loïc** :
  1. **RGPD** — ouvrir F12 → Réseau sur un Digiview et regarder si des requêtes
     partent encore vers `googlevideo.com`. Si oui, on a gagné les publicités
     mais pas l'IP des élèves.
  2. **Dépendance externe** — `ladigitale.dev` deviendrait un point de panne
     unique pour les deux postes de visionnage.
  3. **Compatibilité** — certaines vidéos sont protégées par leurs auteurs et
     l'outil échoue. À tester sur les deux vidéos Cookie connecté
     (`26jazyc7VNk` et `qzWdzAvfBoo`).

  Piste PeerTube du ministère (`tube-numerique-educatif.apps.education.fr`) :
  suppose de réhéberger la vidéo, donc l'accord de l'auteur. Écartée pour la
  rentrée. Voir aussi la ligne « Hébergement des vidéos SNT » en attente
  d'arbitrage dans `DECISIONS.md` — PeerTube peut diffuser en pair-à-pair, ce
  qui exposerait l'IP de l'élève à d'autres spectateurs.

  🔴 **Repris à froid après la rentrée** : Loïc veut d'abord que le cours tourne.
  Confirmé le 23/08/2026 à la clôture de `t1` : **cette piste ne conditionne pas
  la validation du thème** — « ça fonctionne comme ça, c'est très bien ». Les
  quatre `<iframe>` gardent leur chargement actuel, et la façade « clic pour
  charger » n'est pas demandée.

---

## Fonctionnalités du site

- 💡 **Entraînement illimité aux conversions binaires** (posé le 21/08/2026, en
  écrivant `snt-m1`). Un générateur qui tire des nombres au hasard et laisse
  l'élève s'entraîner autant qu'il veut, avec correction immédiate. **Écarté
  pour la V1 du module** : Loïc a tranché pour des **listes fixes, identiques
  pour tous**, afin que les élèves puissent s'entraider et comparer leurs
  résultats. À reprendre plus tard comme **complément facultatif**, jamais en
  remplacement de l'atelier commun — et sans score chiffré ni note, l'évaluation
  se faisant hors du site. La potence SVG de l'étape 1.3 est **déjà
  paramétrable** (tout nombre de 1 à 4095) : la moitié du travail est faite.
- 💡 **Afficher sa classe à l'élève, sur le hub** (posé le 22/08/2026). Un
  après-midi perdu à chercher pourquoi les thèmes restaient fermés alors que le
  tableau de bord affichait « tout ouvert » : le compte de test n'était pas dans
  la classe qu'on réglait. Rien ne le disait nulle part — ni le hub, ni la page
  de séquence. Une mention discrète (« Classe SNTTEA ») près du badge de compte
  suffirait. Vaut aussi pour un élève qui se tromperait de code à l'inscription :
  aujourd'hui il travaillerait des semaines dans la mauvaise classe sans le voir.
- 💡 _(ex. moteur de recherche, index des notions, mode révision…)_

- 💡 **QR codes Kahoot sur les fiches de révision** (différé le 23/08/2026).
  Faire figurer sur la fiche téléchargeable un QR vers le Kahoot de la séance.
  **Pas maintenant : l'intérêt n'est pas établi** — la fiche n'est jamais
  imprimée, elle est déposée dans le OneDrive qui sert de classeur numérique,
  et un QR à l'écran ne se scanne pas depuis l'appareil qui l'affiche. À
  reprendre si un usage papier apparaît.
- 💡 **Renommer les Kahoots existants** pour les mettre en correspondance avec
  le nouveau découpage du cours (posé le 23/08/2026). Tâche de Loïc, **hors
  dépôt** : rien à coder ici, mais la correspondance sera nécessaire le jour
  où une fiche ou une séquence renverra vers un Kahoot nommément.

## Outils & production
- 💡 Pont Claude Code / VS Code pour le raffinage (en cours de mise en place).
- 💡 **Automatiser la production des « pour aller plus loin »** (posé le
  23/08/2026). Idée ouverte, **sans forme arrêtée** : ni le déclencheur, ni le
  gabarit, ni la part d'écriture automatique ne sont décidés. Motif de son
  apparition : le bonus 5.5 de `t1` a été supprimé parce qu'il n'était « pas
  très intéressant » — un bonus écrit pour remplir une case ne vaut pas mieux
  que pas de bonus du tout.
