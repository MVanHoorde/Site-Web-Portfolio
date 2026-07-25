# Lot 0 — la séquence Web passe sur le moteur partagé (25/07/2026)

Extraire à la **racine du dépôt**.

```
pages/2nde-snt-t2-le-web.html   portée      98,9 Ko → 62,7 Ko
assets/js/sequence-snt.js       modifié     + piège à clic, console corrigée
assets/css/sequence-snt.css     modifié     + habillage du piège à clic
pages/2nde-snt-t1-internet.html modifié     version (?v=19)
pages/2nde-snt.html             modifié     version (?v=19)
_suivi/DECISIONS.md             + 4 lignes
_suivi/ETAT-PROJET.md           cases à jour
```

```powershell
node verifier.mjs
```
→ **exactement 2 problèmes** connus.

---

## 1. Ce qui a changé dans la page

Plus une seule ligne de CSS ni de JavaScript propre à cette page : 21 000
caractères de `<style>` et 16 000 de `<script>` sont partis. Elle charge
désormais les mêmes moteurs que la séquence Internet.

| Avant | Après |
|---|---|
| 6 QCM inline, une question chacun | **QCM plein écran** `WEB-Q1` → `WEB-Q6` |
| 9 zones de texte libre | **mode focus** `WEB-R1` → `WEB-R9`, copier-coller bloqué |
| interrupteur « mode enseignant » dans la barre | **zone à code** avec chronomètre |
| — | barre « tu es ici », pliage automatique, numérotation calculée, feuille mobile, carte de reprise |

Les blocs « ⏳ Le sais-tu ? » et leurs liens n'ont pas été perdus au passage :
ils sont devenus le **complément de la bonne réponse**, affiché au
récapitulatif du QCM.

## 2. Ce qui est remonté dans le moteur partagé

Le **piège à clic** de la séance 4 — le faux bouton « +10 points bonus » —
n'existait que dans cette page. Il est maintenant dans `sequence-snt.js` et
`sequence-snt.css`, remise à zéro comprise quand l'élève recommence la séance.
Aucun effet sur les autres séquences : sans les attributs `data-trap`, la
boucle ne trouve rien.

Au passage, le moteur écrivait **« SNT · Internet »** dans la console de
*toutes* les séquences. Il lit maintenant le titre de la page.

## 3. Vérifié

```
verifier.mjs          2 problèmes connus, rien de neuf
node --check          moteur : syntaxe bonne
generer-seances.mjs   37 séances, à jour
structure             353 balises ouvrantes / 353 fermantes
contenu               5 séances · 22 étapes · 13 à valider — identique à l'original
reveals               les 4 restants ont bien un moteur qui les déclenche
```

## 4. À vérifier en ligne, chez toi

1. Les **trois largeurs** (1280 / 820 / 390) — je ne peux pas lancer Playwright ici.
2. Le **QCM plein écran** de l'étape 1.1 : le « Le sais-tu ? » du CERN doit
   apparaître dans le récapitulatif, ses deux liens compris.
3. Le **mode focus** sur une réponse rédigée : plein écran, copier-coller refusé.
4. Le **piège à clic** en séance 4 : la page vire de couleur trois secondes,
   l'étape se valide, et « recommencer » remet le bouton en état.
5. Le **mode enseignant** par code, en tête de page.

## 5. Deux réserves à connaître

**Les codes `WEB-R1` à `WEB-R9` n'existent pas dans `criteres-snt.json`.**
Les réponses partiront en base, mais l'IA de pré-correction n'aura pas de
grille à leur appliquer. À écrire une fois le contenu définitif posé —
donc après les lots 1 à 5, pas avant.

**Le contrôle « couleurs en dur » affiche zéro pour cette page, et c'est
trompeur** : le vérificateur ne lit que les balises `<style>`. Il reste
**18 couleurs codées en dur dans les SVG**. Elles seront traitées avec la
refonte des schémas au lot 1, plutôt que deux fois.

## 6. Ensuite

**Lot 1 — la séance 1 refondue**, avec les documents OneDrive dépouillés :

- `1.1` grande introduction : histoire du Web, et tout le vocabulaire du
  thème disséminé avec les pictos 🔭 « à voir plus tard »
- `1.2` navigateur ≠ moteur de recherche : la question ouverte est **posée
  avant** la recherche, puis **reposée à la fin** pour validation
- `1.3` la requête HTTP : poste de visionnage (cadre de vidéo laissé vide,
  questions à écrire après visionnage) puis schéma à compléter
- `1.4` l'URL, enrichie du port, des paramètres et de l'ancre

Les alertes du dépouillement — scans Nathan à ne pas republier, chiffres de
2017 et 2019 à refaire, « Word Wide Web », le modèle TCP/IP, les fausses
extensions `.asso` et `.univ` — sont consignées dans `DECISIONS.md` et dans
la note de chantier de la séance 1.
