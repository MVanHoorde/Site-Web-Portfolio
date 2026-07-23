# Archive du 23/07/2026 — corrections de vérité + les cinq arbitrages

Extraire **à la racine du dépôt** (`Site-Web-Portfolio/`).

---

## Marche à suivre — dans cet ordre

```bash
# 1. extraire l'archive à la racine du dépôt

# 2. déplacer les fichiers renommés (Git Bash sous Windows, ou WSL)
sh renommer.sh

# 3. retirer les deux fichiers absorbés dans _suivi/JOURNAL.md
git rm Reprise_IA-SNT_et_affichage-eleve.md
git rm _suivi/BDD-brief-jalon4.md

# 4. ranger les artefacts de session
mkdir -p _suivi/archives
git mv _suivi/session-2026-07-21 _suivi/archives/session-2026-07-21

# 5. contrôler
node verifier.mjs
```

**Attendu à l'étape 5 : exactement 2 problèmes**, tous deux antérieurs à cette
archive :

- `pages/term-spe-physique-chimie.html → docs/tp-1-1.pdf` — lien réellement
  cassé, le dossier `docs/` n'existe pas ;
- `cahier/diag-j03-formation-image.html` — `id="ri"` en double, dans deux
  chaînes JS alternatives (`siFaux` / `siJuste`). Une seule entre dans le DOM à
  la fois : faux positif en pratique.

**Si tu en vois d'autres, ne commite pas et dis-le-moi** : ça voudrait dire que
quelque chose a été cassé.

`renommer.sh` fonctionne avant ou après l'extraction : quand les deux noms
coexistent, il retire l'ancien plutôt que d'échouer.

---

## Ce que contient l'archive

### ① Le moteur SNT extrait du terrain

`assets/css/sequence-snt.css` (50 ko) et `assets/js/sequence-snt.js` (75 ko) sont
sortis de `t1-internet.html` **à l'identique** — pas une règle CSS, pas une ligne
de JS n'a été modifiée, seulement déplacée, dans l'ordre de la source. J'ai
vérifié au préalable qu'aucun sélecteur du bloc « glisser-déposer » n'entrait en
collision avec le CSS resté inline : la cascade est inchangée.

`t1` passe de **383 à 262 ko** (−32 %). Il ne lui reste que 3 ko de CSS propre,
un composant JS local et ses données JSON. L'ordre de chargement est préservé :
`progression.js` en tête, le moteur juste avant `</body>` — il travaille sur un
DOM déjà construit.

🔴 **Seule `t1` est portée.** Les sept autres tournent encore sur leur copie
inline, plus ancienne. Leur HTML n'est pas marqué comme ce moteur l'attend
(`data-step`, `data-gate`, `.field[data-focus-code]`, `script.qcm-data`,
`#dico-source`). Les migrer se fait **une à la fois, page ouverte et testée**.
Priorité : `t0` et `t2`, les deux qui serviront en septembre.

### ② La frise ES bascule sur Supabase

- `bdd/schema/007-frise-es.sql` — **proposition à valider.** Quatre tables
  (`eleves_es`, `contributions`, `tirages`, `sources_bannies`), l'archivage des
  versions et les policies RLS, décalquées du fichier 006. Le modèle est déduit
  du contrat d'interface de `serveur-frise/README.md` et des colonnes de ton
  export CSV — **rien n'est inventé, mais rien n'est validé non plus.** À relire
  avant d'écrire la migration.
- `serveur-frise/README.md` et `ia-correction/README.md` réécrits : la décision
  y est consignée, avec ce qui reste vrai et ne doit pas se perdre
  (pseudonymisation à la source, aucun champ note, DPD à prévenir, test de charge
  35 élèves). `server.js` est conservé pour mémoire.

### ③ Les liens morts deviennent des mentions « en travaux »

**200 liens** transformés : `<a href="#">Exercices</a>` devient
`<span class="a-venir">Exercices 🚧</span>`. Plus cliquable, couleur atténuée,
soulignement pointillé, et le picto est doublé d'un texte pour les lecteurs
d'écran (règle §16 : jamais une information portée par le seul survol).

La règle `.a-venir` est posée dans `style.css`, `chapitre-commun.css`,
`sequence-snt.css` et dans le CSS inline des huit séquences.
`chapitre-commun.css` étant modifié, le `?v=2` passe à **`?v=3`** sur les
17 fichiers concernés — sinon les navigateurs qui ont déjà ouvert un chapitre
servent l'ancienne feuille depuis leur cache.

Vérifié : aucun de ces liens ne portait de `onclick`, d'`id` ou de `data-*`. Les
vraies ancres (`href="#gravures"`) ne sont pas touchées.

### ④ Renommages — 50 déplacements

Un préfixe de niveau par niveau : `2nde-` · `1re-` · `term-`.

| Avant | Après |
|---|---|
| `1ere-enseignement-scientifique.html` | `1re-enseignement-scientifique.html` |
| `terminale-enseignement-scientifique.html` | `term-enseignement-scientifique.html` |
| `terminale-spe-physique-chimie.html` | `term-spe-physique-chimie.html` |
| `cours-1ere-cristaux.html` | `1re-pc-cristaux.html` |
| `jour4-…` `jour8-…` `jour11-…` | `j04-…` `j08-…` `j11-…` |
| `A_sketch_of_the_ARPANET_in_December_1969.jpg` | `t1-a-sketch-of-the-arpanet-in-december-1969.jpg` |
| `alliance.jpg` (t1-c1) | `t1c1-alliance.jpg` |
| `wafer-silicium.jpg` (term-es) | `t2c1-wafer-silicium.jpg` |

Les 56 références dans les HTML sont déjà à jour dans l'archive.

⚠ Ce sont des **URL publiques qui changent**. Sans importance tant que personne
n'utilise le site — c'est justement l'argument pour le faire maintenant.

### ⑤ `calculerAide()` réécrit

L'ancienne règle (ratio 2/3 sur l'ensemble des critères) rendait le rôle
d'aidant **mathématiquement inatteignable** : sur NET-1b (1 socle, 4 `plus_loin`),
un élève au socle parfait plafonnait à 0,20. Le `plus_loin` bloquait donc quelque
chose, à rebours du principe posé.

Nouvelle règle, indépendante du nombre de bonus écrits dans la grille :

> **socle complet + au moins `AIDE_PLUS_LOIN_MINI` critère « pour aller plus loin »**
> (défaut 1 · 0 = le socle complet suffit · 2 = plus exigeant)

`_test-verdict.mjs` est réécrit : il **assert désormais l'aide autant que le
verdict**, et les attendus sont écrits depuis l'intention, pas depuis la sortie
du code. C'est ce qui manquait — l'ancien test ne regardait que le verdict, d'où
un bug resté invisible. `node _test-verdict.mjs` → 9 cas conformes, dont deux
nouveaux qui échouaient avec l'ancien code.

### ⑥ Les 6 corrections de vérité et la restructuration du suivi

Inchangées depuis l'archive précédente (que tu n'as pas extraite) : `§7` et `§13`
des consignes SNT, le tableau BDD de `ETAT-PROJET`, `bdd/README.md`, la ligne
« persistance » de `CLAUDE.md`, le commentaire « note » de `bdd/schema/003`.
Plus `ETAT-PROJET.md` réécrit en une page, `DECISIONS.md` et `JOURNAL.md`
nouveaux, `MANIFESTE.md`, `verifier.mjs`, et les correctifs de `t1` (code
enseignant en clair, bloc CHANTIER non encadré).

---

## Deux bugs que le vérificateur a attrapés pendant ce travail

Ils illustrent pourquoi l'outil valait la peine — je ne les aurais pas vus.

1. **Collision de sous-chaînes au renommage.** En renommant `cuivre.jpg` en
   `t1c1-cuivre.jpg`, le remplacement naïf a transformé
   `t1c2-solution-sulfate-cuivre.jpg` en
   `t1c2-solution-sulfate-t1c1-cuivre.jpg`. Deux images du chapitre C2 cassées.
2. **Liste de fichiers périmée.** La référence vers `cours-1ere-cristaux.html`
   n'a pas été mise à jour, parce que la page qui la contenait avait elle-même
   été renommée entre-temps.

Les deux sont corrigés. Sans `verifier.mjs`, ils seraient partis en production.
