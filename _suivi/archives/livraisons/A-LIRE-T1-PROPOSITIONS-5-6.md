# Propositions de contenu — thème 1, séances 5 et 6 · 22/08/2026

> 🔴 **Rien de ce qui suit n'est dans la page.** Ce sont les cinq morceaux de
> **fond pédagogique** du brief n° 3 (Q2, Q7, R4, R9b, R9c). Tout le reste du
> brief est appliqué et vérifié.
>
> Corrige directement dans ce fichier, ou dis-moi ce qui ne va pas : j'intègre
> ensuite. Tant que tu n'as pas tranché, les emplacements concernés gardent
> leur état actuel — rien n'est cassé entre-temps.

---

## Q2 — la 3ᵉ question du QCM `NET-Q4` (étape 5.1)

**Ce qui existe et qui saute** — *« Sur Internet, les protocoles sont
rassemblés dans… »* (le protocole / le modèle / le logiciel / la machine
TCP/IP). Vocabulaire pur, deux distracteurs morts.

**Ce que je propose à la place** — la même notion, mais *appliquée* au lieu
d'être nommée :

```json
{
 "q": "Lequel de ces trois éléments n'est pas un protocole ?",
 "o": [
  "HTTP",
  "TCP/IP",
  "DNS"
 ],
 "r": 1,
 "c": "TCP/IP est le <b>modèle</b> : le découpage en couches qui contient les autres. HTTP et DNS sont bien des protocoles — et TCP et IP aussi, pris séparément. C'est la seule des trois réponses qui désigne un ensemble, pas un service."
}
```

*Trois options seulement, comme la question 1 du même bloc. Écart de longueur
entre options : 2 caractères — très en deçà du seuil de `--qcm`.*

---

## Q7 — le champ de l'étape 5.5 (bonus, hors 100 %)

**Ce qui existe et qui saute** — `NET-R5`, *« Un réseau sans centre : qu'est-ce
que ça change ? »*. **Redondance vérifiée** : le QCM de la séance 2 pose déjà,
dans le même fichier, *« Un réseau "sans centre", qu'est-ce que cela veut
dire ? »* **et** *« Un réseau sans centre a aussi un prix. Lequel ? »*.

**Ce que je propose à la place** — un champ qui referme la séance sur son
propre sujet, sur le modèle des glossaires de 5.4 (recherche autorisée,
reformulation obligatoire) :

- **Titre** : Un protocole, à ta façon
- **Question** : « Choisis **un protocole** — dans la liste du bonus de
  l'étape 5.2 (`HTTP`, `DNS`, `SMTP`, `FTP`, `DHCP`, `SSH`) ou un autre que tu
  trouves — et écris **à quoi il sert**. Recherche autorisée, mais reformule
  avec tes mots : recopier une définition ne compte pas. Commence par écrire
  son nom. »
- **Consigne affichée** : « Tu en as croisé six dans le bonus de l'étape
  précédente. Un seul suffit — celui qui t'intrigue. »
- **Régime** : recherche autorisée · **min 20 · max 250**
- **Nouveau code** : **`NET-R5b`**

⚠️ **Deux points à trancher :**
1. Je ne mets **pas** de `data-glossaire` sur ce champ. Sinon l'entrée
   arriverait dans le glossaire de l'élève sous un nom fixe (« protocole
   choisi ») alors que chacun définit un mot différent. Dis-moi si tu veux au
   contraire que ça alimente le glossaire.
2. `NET-R5` **disparaît** : sa grille dans `criteres-snt.json` devient
   orpheline. Elle ne coûte rien à laisser, mais elle ne correspondra plus à
   rien. (Même situation que `NET-R-ville` et `NET-R4b`, déjà en attente.)

---

## R4 — la phrase manquante du « Doc — deux mondes d'adresses » (étape 6.2)

**Le problème** — le QCM `NET-Q7` demande *« Tu éteins ton téléphone une nuit,
puis tu le rallumes. Son adresse privée… »*, réponse *« peut avoir changé »*.
**Le Doc ne le dit nulle part.** L'élève ne peut pas le savoir.

**Ce que je propose** — une phrase à ajouter à la fin du paragraphe existant :

> Une adresse privée n'est pas gravée dans l'appareil&nbsp;: la box te la
> **prête pour un temps**, puis la reprend — on appelle ça un **bail**. Éteins
> ton téléphone une nuit, et rien ne garantit qu'il retrouvera la même au
> réveil&nbsp;: celle qu'il avait aura pu être prêtée à un autre appareil
> entre-temps.

*Deux phrases, ton de la page. Le mot « bail » est le terme exact du DHCP ;
je le laisse en gras mais il n'est pas exigible — dis-moi si tu préfères le
retirer.*

---

## R9b — les deux réponses rédigées de l'étape 6.4

Elles remplacent l'unique `NET-R6` (*« Lire deux tracert »*), qui **disparaît**
— sa grille devient orpheline elle aussi.

### 1. Ce que dit `ipconfig` — code **`NET-R8a`**

- **Titre** : Lire la configuration de mon poste
- **Question** : « Dans l'affichage d'`ipconfig`, relève trois lignes&nbsp;:
  ton **adresse IPv4**, ta **passerelle par défaut** et ton **serveur DNS**.
  Recopie-les. Puis explique&nbsp;: à quoi correspond, **physiquement, dans la
  salle**, la machine dont l'adresse est écrite en face de « passerelle par
  défaut »&nbsp;? »
- **min 20 · max 400**

🔴 **Pas de masque de sous-réseau** — hors programme, tu l'as exclu
explicitement.

### 2. Ce que disent `ping` et `tracert` — code **`NET-R8b`**

- **Titre** : Lire un ping et deux tracert
- **Question** : « Deux choses à regarder. **a)** Compare tes deux `tracert`
  (Google et Tokyo)&nbsp;: combien d'étapes chacun, et à partir d'où les
  chemins se séparent-ils&nbsp;? **b)** Reprends une ligne de réponse d'un
  `ping`&nbsp;: elle donne un nombre d'**octets**, un **temps** en
  millisecondes, et un **TTL**. Ce TTL est un compteur qui perd 1 à chaque
  routeur traversé — devine à quoi il sert à `tracert` pour découvrir le chemin
  routeur par routeur. »
- **min 20 · max 500**

⚠️ La question **b** est la plus ambitieuse de l'étape : elle demande à l'élève
de **reconstituer** le mécanisme de `tracert` à partir du TTL, pas de le
réciter. Dis-moi si tu la trouves trop haute pour une seconde — je peux la
transformer en question fermée dans le QCM et ne garder que la comparaison des
deux `tracert` en rédigé.

**Les grilles de `NET-R8a` et `NET-R8b` sont à toi.** Sans elles, la couverture
du thème 1 (aujourd'hui 30/30) se dégrade.

---

## R9c — le QCM de 15 questions de l'étape 6.4

Il absorbe les trois items du texte à trous supprimé (questions 1 à 3).
`node verifier.mjs --qcm` sera relancé après intégration.

| № | Question | Bonne réponse | Leurres |
|---|---|---|---|
| 1 | Quelle commande affiche la configuration réseau de ta machine ? | `ipconfig` | `ping` · `tracert` · `cmd` |
| 2 | Quelle commande sert à savoir si une machine répond ? | `ping` | `ipconfig` · `tracert` · `cmd` |
| 3 | Quelle commande liste les routeurs traversés par tes paquets ? | `tracert` | `ping` · `ipconfig` · `cmd` |
| 4 | La « passerelle par défaut » de ton poste, c'est… | la machine par laquelle il sort de son réseau local | le serveur qui héberge les sites · l'antenne Wi-Fi la plus proche · le premier routeur d'Internet |
| 5 | `ping 1.1.1.1` fonctionne sans que le DNS soit interrogé. Pourquoi ? | l'adresse est donnée directement : il n'y a aucun nom à traduire | 1.1.1.1 est une adresse spéciale, réservée aux tests · le DNS ne sert que pour les pages web · la commande `ping` n'utilise jamais le DNS |
| 6 | `www.qwant.com` ne répond pas au `ping`. Qu'est-ce que cela prouve ? | rien sur son état : il refuse simplement de répondre à ce type de demande | que le site est en panne · que ta connexion est coupée · que l'adresse du site a changé |
| 7 | Le nombre affiché par `ping` en « ms » mesure… | l'aller-retour d'un paquet jusqu'à la machine visée | la vitesse de ta connexion en mégabits · le temps de chargement de la page · le nombre de routeurs traversés |
| 8 | Pourquoi le `ping` vers Tokyo est-il plus long que vers Google ? | la distance est plus grande et les routeurs plus nombreux | le serveur japonais est plus lent · les caractères japonais alourdissent la réponse · le décalage horaire retarde la réponse |
| 9 | Le TTL d'un paquet, c'est… | un compteur qui perd 1 à chaque routeur traversé | le temps de réponse en millisecondes · la taille du paquet en octets · le nombre de fois que le paquet sera renvoyé |
| 10 | Que fait un routeur quand le TTL d'un paquet tombe à zéro ? | il jette le paquet et prévient celui qui l'a envoyé | il le renvoie à l'expéditeur intact · il le garde en attente d'un chemin libre · il le transmet quand même au suivant |
| 11 | Comment `tracert` s'y prend-il pour découvrir le chemin ? | il envoie des paquets avec un TTL de 1, puis 2, puis 3… | il demande la liste des routeurs à ta box · il consulte une carte d'Internet en ligne · il suit le paquet à la trace, en direct |
| 12 | Une ligne de `tracert` affiche `* * *`. Cela veut dire… | ce routeur n'a pas répondu, mais le chemin continue | le chemin est coupé à cet endroit · la commande a échoué, il faut la relancer · le routeur est en panne |
| 13 | Tes deux `tracert` commencent par les mêmes routeurs. Pourquoi ? | le début du trajet est commun : la salle, le lycée, l'opérateur | les deux sites sont hébergés au même endroit · `tracert` garde en mémoire le trajet précédent · c'est un hasard, cela change à chaque essai |
| 14 | Ton poste et celui de ton voisin de table ont-ils la même passerelle par défaut ? | oui : ils sont sur le même réseau local | non : chaque poste a la sienne · non : cela dépend de la session ouverte · oui, mais seulement s'ils ont la même adresse IP |
| 15 | `ipconfig` t'affiche une adresse en `10.x.x.x` ou `192.168.x.x`. C'est… | une adresse privée, valable seulement dans le réseau du lycée | l'adresse publique du lycée, vue d'Internet · l'adresse du serveur DNS de l'établissement · une adresse temporaire, le temps de la connexion |

**Corrigés** : je les rédige à l'intégration, sur le modèle des autres QCM de la
page (une phrase qui explique *pourquoi*, et qui ramène à ce que l'élève vient
de manipuler). Dis-moi si tu veux les relire aussi.

⚠️ **Conséquence à connaître avant de faire passer l'étape en classe** : avec
deux rédigées + un QCM + le reste, `bqReste()` comptera **quatre** blocs au
lieu de deux. Le bilan s'ouvrira donc plus tard, et l'étape 6.4 devient longue.
C'est bien ce que tu demandes, mais autant le savoir.

---

## Ce qui reste à toi, hors de ce fichier

1. **Les grilles de pré-correction** des trois nouveaux codes — `NET-R5b`,
   `NET-R8a`, `NET-R8b` — dans `ia-snt/criteres-snt.json`.
2. **Le test réseau de la salle** : `ping` échoue-t-il seulement sur Qwant, ou
   sur tout ? Aucun code ne répond à cette question.
3. **Playwright sur trois viewports** (1280 / 820 / 390 px) — Chromium n'est
   pas installable en session. Regarder en priorité la **fenêtre de rappel** de
   l'étape 6.3 sur 390 px.
