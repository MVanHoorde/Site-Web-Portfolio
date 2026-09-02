# Vérifications visuelles — thème 1, séances 5 et 6 · 22/08/2026

> À lancer **sur ta machine** : Chromium n'est pas installable en session
> Claude Code ici. Le bloc ci-dessous est autonome — colle-le tel quel dans une
> session Claude Code ouverte sur le dépôt.

---

## Le prompt à coller

```
Contexte : dépôt Site-Web-Portfolio, branche main. Le working tree contient les
modifications non commitées de l'audit du thème 1, séances 5 et 6 (22/08/2026) :
refonte du relevé/rappel DNS en 6.3, nouveau bloc .manip en 6.4, bandeau de
prérequis en tête de séance 6, calculatrice ajoutée en 6.1, bilan descendu en 5.2.

Je veux une vérification VISUELLE au Playwright sur trois viewports, avec captures.
Ne modifie aucun fichier du dépôt : tu observes et tu rapportes.

MISE EN PLACE
1. npm i -D playwright puis npx playwright install chromium
2. Sers le dépôt en local : npx serve -l 8080 .   (ou python -m http.server 8080)
   ⚠️ OBLIGATOIREMENT http://localhost:8080, JAMAIS file:// — le mode enseignant
   utilise crypto.subtle, indisponible hors contexte sécurisé : en file:// le code
   est refusé et les séances 5 et 6 restent verrouillées.
3. Page : http://localhost:8080/pages/2nde-snt-t1-internet.html
4. Déverrouille les séances 5 et 6 avec le bouton « Mode enseignant » et le code.
   ⚠️ NE FORCE PAS en console avec document.body.classList : un MutationObserver
   écoute les changements de classe dans .steps et la page réagit mal.

VIEWPORTS : 1280x900 · 820x1180 (iPad) · 390x844 (téléphone)

CE QU'IL FAUT REGARDER — capture pour chaque point, sur chaque viewport

1. ÉTAPE 6.3, la fenêtre de rappel — LE POINT PRIORITAIRE, surtout en 390 px.
   Parcours : saisir deux adresses valides (194.167.30.129 et 192.134.4.20),
   cliquer « Valider mes adresses ».
   Attendu : les champs passent en gris et en lecture seule ; une fenêtre
   s'ouvre sur fond flouté ET MASQUE LE RELEVÉ (c'est tout l'objet de l'exercice :
   si le relevé reste lisible derrière, c'est un échec) ; les champs de rappel
   font au moins 44 px de haut ; les deux boutons du pied ne débordent pas et
   passent en pleine largeur sous 430 px. Cliquer « Comparer à mon relevé »
   avec une bonne et une mauvaise adresse : message « 1 sur 2 », le juste en
   vert, le faux en rouge. Puis « Plus tard » : la fenêtre se ferme et le bloc
   redescend sous son intitulé « De mémoire, maintenant », masqué.
   Vérifie aussi : recharger la page après validation doit rendre le relevé
   figé et rempli (il est enregistré en base sous la clé …/releve-dns).

2. ÉTAPE 6.4, le bloc « Manipule d'abord » (classe .manip).
   Attendu : liste numérotée, liseré sombre à gauche, nettement DISTINCT des
   blocs de ressource orange de la page — mets une capture des deux côte à côte.
   Les <code> (ping www.u-tokyo.ac.jp, tracert www.google.fr) ne doivent pas
   déborder ni forcer un défilement horizontal en 390 px.

3. ÉTAPE 6.1, la calculatrice insérée avant la question 6 du texte à trous.
   Attendu : touches d'au moins 44 px, pas de débordement, et la calculatrice
   de l'étape 4.2 continue de fonctionner indépendamment (les deux sont sur la
   même page : tape un calcul dans chacune et vérifie qu'elles ne partagent pas
   leur écran).

4. TÊTE DE SÉANCE 6, le bandeau de prérequis « binaire » (.prereq-banner).
   Attendu : visible DANS LES DEUX ÉTATS — séance encore verrouillée ET séance
   ouverte. C'est le piège du composant dont il est issu. Le lien « Revoir le
   thème » doit ouvrir 2nde-snt-m1-representer-information.html#s1 et arriver
   sur la séance « Compter comme une machine ».

5. ÉTAPE 5.2, le bilan descendu.
   Attendu : le bouton « Afficher le bilan » est en FIN d'étape, après les trois
   glossaires (protocole, modèle TCP/IP, datagramme), et il reste désactivé tant
   que les trois ne sont pas remplis. Remplis-les : il doit s'activer, et le
   bilan s'ouvrir sans que l'élève ait à remonter.

6. LES PASTILLES DES POSTES DE VISIONNAGE.
   Quatre à contrôler : t1 étapes 1.x (poste d'écoute), 5.2 et 6.3, plus
   t2 (2nde-snt-t2-le-web.html, étape de la requête HTTP).
   Attendu : « ○ support » EN LIGNE, à côté du titre du bloc — exactement comme
   « Doc — pourquoi des couches ? ». Plus aucune pastille qui pend en bas à
   droite du cadre vidéo.

7. ÉTAPE 5.4, la table de routage.
   Tape « D » dans la case « Pour D » et clique Vérifier.
   Attendu : accepté, en vert. C'était le bug corrigé — la bonne réponse était
   comptée fausse. Tape « A » ensuite : doit rester faux.

8. prefers-reduced-motion.
   Relance le contexte avec reducedMotion: 'reduce' et rouvre la fenêtre de
   rappel de 6.3.
   Attendu : plus de flou, mais un fond nettement plus dense — le texte de la
   fenêtre doit rester parfaitement lisible, sans que la page derrière
   redevienne lisible elle aussi.

CE QUE JE VEUX EN RETOUR
- Les captures, nommées <point>-<viewport>.png dans un dossier à part.
- Un tableau des écarts constatés : point, viewport, ce qui cloche, gravité.
- N'invente pas de correctif : signale, je tranche.
```

---

## Ce que le prompt ne couvre pas — à faire à la main

**Le test réseau de la salle**, sur une machine de la salle et pas sur la
tienne. Ouvre `cmd` et lance dans l'ordre :

```
ping www.google.fr
ping www.qwant.com
tracert www.google.fr
```

Trois cas, trois conclusions très différentes :

| Ce que tu observes | Ce que ça veut dire | Conséquence |
|---|---|---|
| Google répond, Qwant non, `tracert` fonctionne | Qwant refuse l'ICMP, comme prévu | ✅ l'étape 6.4 tourne, Qwant reste le contre-exemple |
| **Rien** ne répond, Google compris | le réseau du lycée bloque l'ICMP sortant | 🔴 **l'étape 6.4 entière tombe** — aucun code ne répare ça |
| Les `ping` échouent mais `tracert` aboutit | ICMP echo filtré, TTL non | l'étape tient en retirant les `ping` |

Fais-le **avant** la première séance : dans le deuxième cas il faut repenser
l'étape, pas la corriger.
