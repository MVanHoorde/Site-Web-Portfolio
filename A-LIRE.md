# Livraison 2 — lots C + D, et le centrage de reprise (24/07/2026)

Extraire à la **racine du dépôt**. Deux fichiers nouveaux.

```
assets/js/hub-snt.js                         NOUVEAU
assets/css/hub-snt.css                       NOUVEAU
pages/2nde-snt.html                          RÉÉCRIT
assets/js/sequence-snt.js                    modifié
assets/css/sequence-snt.css                  modifié
assets/js/carte-reseau.js                    inchangé (fourni pour cohérence)
assets/js/progression.js                     inchangé (fourni pour cohérence)
pages/2nde-snt-t1-internet.html              version seulement (?v=12)
pages/2nde-snt-t0-systemes-informatises.html version seulement (?v=12)
```

```powershell
node verifier.mjs
```
→ **exactement 2 problèmes** : `docs/tp-1-1.pdf` et `id="ri"`.

---

## 0. Le détail demandé : la reprise centre l'étape

`block:'start'` → `block:'center'` aux **deux** moments de reprise :
au retour sur une page (reconnexion, rechargement) et sur le bouton
« Continuer » de la carte de reprise.

Deux raisons : la barre « tu es ici » est collante et mangeait le haut
de l'étape ; et surtout une reprise n'est pas une avancée — on revient
pour se resituer, voir ce qui précède aide.

Les défilements d'**avancement** (« Étape suivante », dépliage d'une
étape) restent en `block:'start'` : là on veut le maximum de contenu
sous les yeux. Si tu veux les centrer aussi, c'est deux lignes.

---

## 1. Le socle de données du hub — le vrai problème à résoudre

Le hub doit dessiner un anneau par thème. Or la base ne stocke que les
étapes **faites** : ni le nombre total d'étapes, ni le nom des séances.
Sans totaux, pas de ratio.

Deux façons de lui donner ces chiffres :

- un **manifeste écrit à la main** dans le hub — qui dériverait du
  contenu réel dès la première séance ajoutée ;
- la **séquence les écrit elle-même**, en même temps que son état.

C'est la seconde. `EtatSNT` produit désormais un `resume` à partir de
son propre DOM : `{ seances:[{id,num,nom,f,t}], f, t }`. Il **ne peut
pas** être en retard sur la page qui le fabrique. Le hub lit les huit
résumés **en une requête** (`lireTout('cours')`, livré au lot A) et n'a
rien à savoir du contenu des pages.

**Conséquence concrète : tu ajoutes une séance à un thème, le hub se
met à jour tout seul.** Rien à maintenir en double.

RGPD : le résumé ne contient que du contenu de cours (noms de séances,
compteurs). Aucune donnée personnelle.

---

## 2. Le hub — `pages/2nde-snt.html`

Réécrite. Bascule en **option A** : elle charge `sequence-snt.css` puis
`hub-snt.css`. Elle parle donc la même langue visuelle que les huit
pages où l'élève passera l'année, pas celle du portfolio.

Elle n'utilise **pas** la classe `.wrap` : `sequence-snt.css` lui
applique une marge gauche calculée pour la barre latérale, qui n'existe
pas ici. C'est `.hub-wrap`.

### Un encart par thème, mini-carte repliée (option 2)

L'encart **fermé** porte déjà l'essentiel : un anneau et un compteur
(`7 / 20 étapes`, `terminé`, `pas commencé`, `en construction`). Pas
besoin de déplier pour savoir où on en est. **Le thème en cours se
déplie tout seul** — c'est celui qu'on vient consulter neuf fois sur dix.

Trois états de mini-carte, et il est important de ne pas les confondre :

| Cas | Rendu |
|---|---|
| Thème déjà ouvert | les **vraies** séances, avec leurs noms et `2 sur 6` |
| Thème jamais ouvert | N nœuds attendus, sans nom, anneaux vides, **cliquables** |
| Thème en chantier | nœuds **fantômes** en pointillés, non cliquables |

*Chantier* ≠ *verrouillé*. Le premier dit « ce n'est pas encore écrit »,
le second « ce n'est pas encore ton tour ». Les confondre ferait croire
à un blocage là où il n'y a qu'un chantier.

### Ce qui est déclaré dans le HTML, et pourquoi si peu

```html
data-cle="snt-t1"        clé de progression en base
data-lien="…​.html"       la page de la séquence
data-seances="4"         nombre ATTENDU — sert seulement à dessiner une
                         carte plausible AVANT la première ouverture.
                         Dès que l'élève a ouvert le thème, la base prend
                         le relais : ce nombre ne peut pas faire mentir
                         la page.
data-etat="chantier"     contenu pas encore écrit → nœuds fantômes.
                         ⚠ À RETIRER quand une séquence est terminée.
data-verrou="oui"        thème fermé. NON POSÉ aujourd'hui : tout ouvert.
```

J'ai mis `data-etat="chantier"` sur **t3, t4, t5, t6** — ceux qui
portaient 🚧 dans l'ancienne page. Corrige si je me suis trompé.

### Verrouillage

Le mécanisme est en place (`data-verrou`), **rien n'est verrouillé
aujourd'hui**. Le déblocage par classe rejoindra l'appli de validation
des corrections, comme convenu.

---

## 3. Lot D — les reprises bloquantes

**Deux échelles**, même grammaire : fond flouté, deux issues explicites,
ni Échap ni clic sur le fond ne ferment. Bloquant ne veut pas dire
piégé : la seconde issue est toujours une sortie.

- **Dans un thème** (au-delà de 2 h d'absence) — « Tu en étais à S2 ·
  étape 2.3 ». Boutons : **Continuer →** (centre l'étape) et **Revenir
  au sommaire principal**. L'ancien encart dans la page est supprimé.
- **Sur le hub** (même seuil de 2 h) — « Tu en étais au thème Internet,
  S2 Adresses IP ». Boutons : **Continuer →** (mène directement à
  l'ancre de la séance) et **Rester sur le sommaire** (qui déplie et
  centre l'encart du thème).

---

## 4. Ce que j'ai vérifié

Cinq bancs d'essai, tous verts. Le cinquième est nouveau (33
vérifications sur le hub, avec une base simulée) :

```
structure       8 encarts · point d'accueil déclaré · option A · pas de .wrap
                versions alignées
repli           replié par défaut · thème en cours déplié seul · aria-expanded
progression     terminé / 7 sur 20 / pas commencé / en construction
mini-cartes     vraies séances nommées · bonnes ancres · non ouvert cliquable
                chantier fantôme et non cliquable · chantier ≠ verrou
reprise hub     bon thème · bonne séance · bonne ancre · fond bloqué
                « Rester ici » libère · visite fraîche → pas de modale
```

Plus les quatre précédents rejoués : non-régression du dessin (identique
à l'octet), états sur DOM réel, menu de compte, et la vraie page t1
pilotée (27 vérifications).

---

## 5. À vérifier à l'œil

1. **Le hub** : allure générale — c'est le premier vrai test de
   l'option A. Si ça te déplaît, on rhabille sans toucher la logique.
2. Ouvre t1, fais deux ou trois étapes, reviens au hub : l'anneau de
   t1 doit avoir bougé et la mini-carte doit porter les vrais noms de
   séances.
3. Déplie / replie quelques thèmes. Sur iPad et sur téléphone.
4. Reprise : difficile à provoquer (il faut 2 h d'absence). Tu la verras
   demain matin.
5. Les thèmes marqués « en construction » : dis-moi si ma liste est la
   bonne.

---

## Reste ouvert

- **Portage des 7 autres séquences** sur le moteur partagé — tant qu'il
  n'est pas fait, seul t1 alimente vraiment le hub (t0 charge
  `progression.js` mais pas `sequence-snt.js`, donc pas de `resume`).
  **C'est la prochaine étape logique.**
- `ia-snt/valider.mjs`.
- Le déblocage par classe.
