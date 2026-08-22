# Idées & améliorations à trier

> Mise à jour : 21/08/2026
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

## Outils & production
- 💡 Pont Claude Code / VS Code pour le raffinage (en cours de mise en place).
