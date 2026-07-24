# Correctif 1.1 — badge de compte + sommaire en grand (24/07/2026)

Extraire à la **racine du dépôt**. **Remplace** la livraison 1 : ne pas
extraire l'ancienne archive après celle-ci.

```
assets/js/carte-reseau.js                    NOUVEAU
assets/js/progression.js                     modifié  <- le correctif
assets/js/sequence-snt.js                    modifié
assets/css/sequence-snt.css                  modifié
pages/2nde-snt.html                          modifié
pages/2nde-snt-t1-internet.html              modifié
pages/2nde-snt-t0-systemes-informatises.html modifié (version seulement)
```

Puis :
```powershell
node verifier.mjs
```
→ **exactement 2 problèmes** : `docs/tp-1-1.pdf` et `id="ri"`.

---

## 1. Le badge de compte — ma faute, corrigée

**Ce qui s'est passé.** `afficherBadgeConnecte()` n'injecte pas son
propre CSS. Historiquement ce n'était pas un problème : on n'y arrivait
qu'APRÈS la modale d'accueil, qui l'avait déjà injecté. Depuis que le
badge peut s'afficher seul sur les pages autres que le hub, il arrivait
sans style : pas de `position:fixed`, donc rien en haut à droite, et un
bloc nu empilé en bas de page — le « truc pas cliquable » que tu as vu.

**Le correctif** est posé à la source : `injecterStyleAccueil()` est
maintenant appelé au début de `afficherBadgeConnecte()` **et** de
`afficherBandeauInvite()`. Les cinq fonctions d'affichage l'appellent
désormais, vérifié une par une. Ça ne peut plus se reproduire en
ajoutant un point d'entrée.

**Conséquence : `progression.js` est maintenant versionné (`?v=10`).**
Il ne l'avait jamais été. Sans ça, ton navigateur t'aurait resservi le
fichier cassé depuis son cache. Les trois pages qui le chargent sont
mises à jour, d'où la présence de t0 dans l'archive — **elle ne contient
que le changement de version.**

Tout est monté en `?v=10` : CSS, `sequence-snt.js`, `carte-reseau.js`,
`progression.js`.

---

## 2. Le sommaire s'ouvre en grand

Le bouton `⌂ Sommaire` n'envoie plus vers le haut de page : il ouvre la
carte **en modale, fond flouté**, jusqu'à 920 px de large.

- **Un clic sur une séance ferme la modale et t'y emmène.** Ouvrir un
  plan pour devoir ensuite le ranger à la main est une étape de trop.
- Ferment aussi : le bouton ×, la touche Échap, un clic sur le fond.
- Le focus revient sur le bouton qui a ouvert la modale.
- Une séance verrouillée n'est pas cliquable et ne ferme rien.
- `prefers-reduced-motion` : le flou est remplacé par un fond plus dense
  (sinon le contraste s'effondre pour ceux qui l'ont désactivé).
- Sans JavaScript, le `href="#hub"` est conservé : le lien saute à
  l'ancre. On ne casse pas la navigation de secours.

**La carte de la modale est dessinée à neuf**, elle ne déplace pas celle
du haut de page — sinon la page se viderait derrière, et tu perdrais ton
repère en fermant. Les deux cartes lisent le même calcul d'avancement
(`etatsSeances()`), donc elles ne peuvent pas diverger.

---

## 3. Un garde-fou ajouté au passage

`initHub()` est devenu idempotent : un second appel ne crée plus une
deuxième `<section id="hub">`. Un id dupliqué est exactement ce que
`verifier.mjs` traque — autant ne pas en fabriquer.

---

## Ce que j'ai vérifié, et comment

Trois bancs d'essai, tous verts :

1. **Non-régression du dessin** — l'ancien et le nouveau SVG comparés
   caractère par caractère, de 2 à 6 nœuds : identiques.
2. **États sur DOM réel** (19 vérifications) — anneaux, verrous,
   « à venir », marqueur, retour du href au déverrouillage.
3. **La vraie page t1 pilotée dans un DOM** (27 vérifications) — hub
   construit, boutons présents, étapes verrouillées sans href ni
   `aria-disabled` manquant, modale : ouverture, fermeture par nœud /
   × / Échap / fond, cartes synchronisées, aucun id dupliqué, aucune
   erreur JS.

Le banc n°3 a d'ailleurs commencé par échouer — c'était mon test qui
déclenchait un `DOMContentLoaded` de trop, pas le code. D'où le
garde-fou du point 3.

**Ce que je n'ai PAS pu tester ici : le badge lui-même**, qui demande
une vraie session Supabase. Le correctif est vérifié par lecture, pas
par exécution. C'est le point à confirmer en premier.

---

## À vérifier en ligne

1. **Connecté sur t1 : le badge « 👤 ton-identifiant ▾ » est en haut à
   droite**, le menu s'ouvre, « Se déconnecter » fonctionne. ← priorité
2. Plus rien d'anormal en bas de page.
3. `⌂ Sommaire` ouvre la carte en grand, fond flouté ; un clic sur une
   séance ferme et emmène ; ×, Échap et le fond ferment aussi.
4. Déconnecté sur t1 : le bandeau du bas renvoie vers le hub.
5. Sur téléphone : la modale passe en colonne, cibles ≥ 44 px.

---

## Ta dernière phrase a été coupée

Ton message s'arrête sur « Il ». Il manque probablement une demande —
dis-moi laquelle avant que j'attaque les lots C et D.
