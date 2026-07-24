# Livraison 1 — lots A + B + E (24/07/2026)

Extraire à la **racine du dépôt**. Six fichiers, dont un nouveau.

```
assets/js/carte-reseau.js          NOUVEAU
assets/js/progression.js           modifié
assets/js/sequence-snt.js          modifié
assets/css/sequence-snt.css        modifié
pages/2nde-snt.html                modifié (2 lignes)
pages/2nde-snt-t1-internet.html    modifié (versions + 1 script)
```

## Vérification après extraction

```powershell
node verifier.mjs
```
→ doit sortir **exactement 2 problèmes** : `docs/tp-1-1.pdf` et `id="ri"`.
Tout écart = quelque chose est cassé, on s'arrête.

---

## Lot A — un seul point d'entrée

**`progression.js`**

1. **`lireTout(domaine)`** — nouvelle fonction publique. Renvoie
   `{ cle: valeur }` pour tout un domaine en **une seule requête**.
   C'est ce qui permettra au hub SNT d'afficher les huit thèmes sans
   huit allers-retours réseau. La RLS filtre déjà sur l'élève : demander
   le domaine entier ne révèle rien de plus qu'une clé.

2. **La modale de connexion ne s'affiche plus que sur le hub.** Elle se
   déclenche sur la page qui porte `<body data-accueil="hub">`, et
   nulle part ailleurs. Sur les autres pages :
   - session ouverte → le badge « connecté comme … », rien de plus ;
   - pas de session → un bandeau discret en bas, avec un lien vers le hub.

   `monterAccueil()` reste appelable à la main : la surface publique ne
   change pas, seul le déclenchement automatique est restreint.
   `window.SNT_SANS_ACCUEIL = true` fonctionne toujours.

**`pages/2nde-snt.html`** reçoit le strict minimum pour que la connexion
marche dès aujourd'hui : la balise `<script>` et `data-accueil="hub"`.
**L'habillage de la page, c'est le lot C** — elle est encore en « papier
d'étude », la modale y aura donc l'air un peu étrangère. C'est normal et
transitoire.

**Sans ces deux lignes, plus personne ne pourrait se connecter nulle
part.** Ne pas extraire cette livraison à moitié.

---

## Lot B — le moteur de carte-réseau devient partageable

**`assets/js/carte-reseau.js`** (nouveau) porte désormais le dessin :

```js
CarteReseau.dessiner(noeuds, options)   // -> SVG (deux dispositions)
CarteReseau.majNoeuds(racine, etats)    // -> met a jour anneaux et etats
```

Le dessin ne lit plus le DOM d'une séquence. Il reçoit des données et
dessine. Deux adaptateurs le nourrissent : `sequence-snt.js` traduit le
DOM d'une séquence, et le futur `hub-snt.js` traduira des lignes
Supabase. C'est ce qui rend le hub SNT possible sans dupliquer la carte.

**Ce qui change pour toi, visuellement : rien.** Un test de
non-régression compare le SVG produit par l'ancien code et par le
nouveau, pour 2 à 6 nœuds : **identique caractère par caractère**.

Nouveautés du moteur, pas encore utilisées :
- **7 et 8 nœuds** — une seule ligne devenait illisible (huit disques de
  68 px dans 680 px se touchent). Passage à **deux rangées en serpentin**
  dans une boîte de 400 px. La disposition téléphone reste une colonne.
- **État « à venir »** (`.hub-n.avenir`) — cercle en pointillés, disque
  vide, texte en italique grisé. Pour les thèmes dont le contenu n'est
  pas écrit. Distinct de « verrouillé » : *verrouillé* = ça existe, pas
  encore ton tour ; *à venir* = ce n'est pas encore écrit. Les confondre
  ferait croire à un blocage là où il n'y a qu'un chantier.

**Ordre de chargement** : `carte-reseau.js` **avant** `sequence-snt.js`.
C'est déjà fait dans t1 ; à reproduire lors du portage des autres
séquences. Si le moteur manque, le hub ne se dessine pas — la page reste
utilisable, elle ne plante pas.

---

## Lot E — la navigation

**Deux boutons de retour** dans la barre collante, au lieu d'une flèche
muette :
- `← Thèmes` — vers `2nde-snt.html` ;
- `⌂ Sommaire` — vers `#hub`, le haut de la séquence.

Le second n'est ajouté **que si un hub existe réellement** sur la page :
on ne propose pas une destination qu'on n'a pas construite. Sous 720 px
les libellés disparaissent, les icônes restent, cibles ≥ 44 px, noms
accessibles conservés.

**Le bug du survol, corrigé.** Ce que tu voyais sur 1.6 / 1.7 : la règle
`#prog a.it:hover` s'appliquait à **tous** les liens du sommaire, y
compris verrouillés — d'où le cadre gris. Et `.it.locked` ne faisait que
griser le texte : le `href` restait, donc le clic partait vraiment vers
une étape masquée, et il ne se passait rien. Une promesse de clic sans
clic est pire qu'un verrou visible.

Désormais : le `href` est retiré (ce qui la sort aussi de la tabulation),
`aria-disabled` est posé, le survol ne s'allume plus, la pastille passe
en pointillés et un cadenas apparaît.

**Les séances verrouillées le disent aussi.** S2, S3 n'avaient aucun
état : elles ressemblaient à des titres inertes. Elles restent pliables
(c'est utile), mais affichent maintenant un cadenas au lieu de `0/5`, en
gris, avec une infobulle « Séance pas encore ouverte ».

---

## Ce que je te demande de vérifier à l'œil

Sur `pages/2nde-snt-t1-internet.html`, en ligne :

1. La carte-réseau du haut est **exactement comme avant**.
2. Deux boutons en haut à gauche de la barre collante ; `⌂ Sommaire`
   remonte bien à la carte.
3. Sur une étape non révélée du sommaire : **plus de cadre gris au
   survol**, un cadenas, et le clic ne fait plus semblant.
4. Une séance verrouillée affiche un cadenas dans le sommaire.
5. Déconnecté, sur t1 : **pas de modale**, juste le bandeau du bas qui
   renvoie au hub. Le clic dessus arrive sur `2nde-snt.html`, où la
   modale s'affiche.
6. Sur téléphone (390 px) : les libellés des boutons disparaissent,
   les icônes restent cliquables.

Le point 5 est le plus important : c'est ton objectif n°1 de la journée.

---

## Ce qui n'est PAS dans cette livraison

- **Lot C** — le hub SNT lui-même : les huit encarts, les mini-cartes
  dépliables (option 2 retenue), le basculement en `sequence-snt.css`
  (option A retenue).
- **Lot D** — la reprise en modale bloquante, aux deux échelles.
- Le **déblocage par classe** : rangé au chantier « appli de validation »,
  avec la validation des corrections IA. Tout est ouvert d'ici là.

## Rappel RGPD

Rien de nouveau ne part sur le réseau. `lireTout` demande un domaine au
lieu d'une clé, sur des lignes que la RLS restreint déjà à l'élève
connecté. `carte-reseau.js` ne connaît ni élève, ni identifiant, ni
réseau : il reçoit des nombres entre 0 et 1 et dessine des arcs.
