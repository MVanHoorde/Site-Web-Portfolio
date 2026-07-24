# Correctif 1.2 — « Changer de compte » (24/07/2026)

Extraire à la **racine du dépôt**. Petite archive : **un seul fichier de
code** a changé.

```
assets/js/progression.js                     modifié  <- le correctif
pages/2nde-snt.html                          version seulement (?v=11)
pages/2nde-snt-t1-internet.html              version seulement (?v=11)
pages/2nde-snt-t0-systemes-informatises.html version seulement (?v=11)
```

Puis :
```powershell
node verifier.mjs
```
→ **exactement 2 problèmes** : `docs/tp-1-1.pdf` et `id="ri"`.

---

## Le bug

Dans le menu du badge, **« Changer de compte » et « Se déconnecter »
étaient câblés sur la même fonction** :

```js
badge.querySelector('[data-changer]').addEventListener('click', deconnexion);
badge.querySelector('[data-deco]')   .addEventListener('click', deconnexion);
```

Les deux faisaient donc `quitter()` puis un rechargement. Tant que la
modale se montait partout, le rechargement la faisait réapparaître et
l'illusion tenait. Depuis que la connexion est réservée au hub, le
rechargement ne propose plus rien : « changer de compte » déconnectait,
point. Le bug existait avant, mon changement l'a seulement rendu visible.

## Le correctif

Deux gestes, deux fonctions :

- **Se déconnecter** → `quitter()` puis rechargement. Inchangé. Sur un
  poste partagé, le rechargement efface de l'écran le travail de l'élève
  précédent avant que le suivant n'arrive.
- **Changer de compte** → `quitter()` puis le formulaire **sur place**,
  déjà ouvert sur l'onglet « Me connecter ». L'élève **reste dans son
  thème** : après connexion, la même page se recharge sous le nouveau
  compte. Il ne repasse pas par le hub.

C'est exactement ce que faisait déjà le hub dans `afficherRetour()` ;
le badge est maintenant aligné dessus.

### Pourquoi on ferme la session AVANT d'afficher le formulaire

Si l'élève s'éloigne sans terminer, le compte précédent est déjà fermé.
C'est un poste de salle informatique, pas un portable personnel. S'il
renonce, le bandeau « mode invité » lui permet de rouvrir le formulaire
sans naviguer.

### Une exception assumée à « la connexion se fait au hub »

La règle protège d'une modale **subie** au milieu d'un cours. Ici l'élève
la demande explicitement en cliquant. C'est la seule exception, et elle
est documentée dans le code (§10 bis).

## Un second défaut trouvé au passage

`quitter()` ne retirait pas le badge du DOM. Ça ne se voyait pas tant
qu'un rechargement suivait toujours. Avec « Changer de compte », qui
reste sur la page, **l'ancien identifiant serait resté affiché derrière
le formulaire** — un badge qui affirme « connecté comme dede-33 » alors
que la session est fermée. Le badge est maintenant retiré dans
`quitter()` : valable pour tous les appelants, présents et futurs.

## Versions

Tout monte en **`?v=11`** — `progression.js`, le CSS et le JS de
séquence, sur les trois pages concernées. Un seul numéro pour tout le
site : plus simple à raisonner qu'un fichier en retard sur un autre.

---

## Ce que j'ai vérifié

Quatre bancs d'essai, tous verts. Le quatrième est nouveau : il simule
une session Supabase (fetch remplacé par un double) et pilote le menu.
**C'est ce que je n'avais pas pu tester la dernière fois** — le badge est
désormais couvert pour de bon.

```
— page de séquence, élève connecté —
  AUCUNE modale (règle « connexion au hub »)
  le badge est affiché · style injecté (position:fixed) · bon identifiant
  le menu s'ouvre · aria-expanded suit
— « Changer de compte » —
  le formulaire s'ouvre SUR PLACE
  on est resté sur la page du thème
  onglet « Me connecter » actif · champ en mode connexion
  le badge de l'ANCIEN compte a disparu · jeton effacé
  « sans compte » → bandeau récupérable
— « Se déconnecter » —
  jeton effacé · badge retiré · pas d'ouverture du formulaire
```

Plus les trois bancs précédents rejoués : non-régression du dessin,
états sur DOM réel, vraie page t1 pilotée (27 vérifications).

---

## À vérifier en ligne

1. Sur t1, badge → **« Changer de compte » ouvre le formulaire sans
   quitter le thème** ; après connexion, tu es toujours sur t1.
2. Le badge de l'ancien compte disparaît dès l'ouverture du formulaire.
3. « Se déconnecter » se comporte comme avant.
4. Si tu renonces (« Continuer sans compte »), le bandeau du bas te
   permet de rouvrir le formulaire sur place.

---

## Prochaine étape

Les lots **C** (le hub SNT : huit encarts, mini-cartes dépliables,
bascule en `sequence-snt.css`) et **D** (la reprise en modale bloquante,
aux deux échelles). La modale du sommaire livrée au correctif 1.1 servira
de base au lot D — le mécanisme est déjà en place et testé.

Et ta phrase coupée du message précédent, si elle contenait autre chose.
