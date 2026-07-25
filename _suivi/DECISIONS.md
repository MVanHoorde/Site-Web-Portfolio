# Registre des décisions

> **Une ligne par décision, datée, avec son statut.** En ajout seul : une
> décision remplacée n'est pas effacée, elle passe en ~~barré~~ avec un renvoi
> vers celle qui la remplace.
>
> **Pourquoi ce fichier existe.** Avant lui, une décision qui changeait laissait
> le paragraphe périmé en place, coiffé d'un « ⚠ Mise à jour du 20/07 ». Les
> fichiers de référence finissaient par contenir autant de faux que de vrai —
> l'audit du 23/07 y a trouvé six contradictions, dont cinq dans un seul
> paragraphe. Désormais : **les fichiers de référence décrivent l'état courant,
> l'historique vit ici.**

Statuts : ✅ en vigueur · ~~barré~~ remplacée · ⏳ en attente d'arbitrage

---

## En attente d'arbitrage

| Date posée | Sujet | Enjeu |
|---|---|---|
| 18/07/2026 | ⏳ Volume horaire type d'une séquence SNT | Le Web fait ≈ 6 h sur 4 séances + 1 débranchée. |
| 18/07/2026 | ⏳ Équivalent d'un « régime A » pour les séquences SNT | Non tranché : une séquence se rédige, elle ne se transcrit pas d'un PPTX. |
| 16/07/2026 | ⏳ Ordre du Thème 3 (PC) | Ordre des PPTX conservé, ou renumérotation son / spectres / signaux. |
| 21/07/2026 | ⏳ Harmonisation des codes d'activité `NET·xx` / `NET-xx` | Gelée le temps de traiter la couche Supabase. |
| — | ⏳ Sort de `2nde-snt.html` à la racine | Redirection conservée, ou `git rm`. |

---

## Architecture & dispositif

| Date | Décision | Statut |
|---|---|---|
| 23/07/2026 | **Gabarit SNT partagé : OUI**, extrait du terrain (le code de `t1`), pas réécrit. `assets/css/sequence-snt.css` + `assets/js/sequence-snt.js` deviennent les 3ᵉ et 4ᵉ ressources partagées. `t1` passe de 383 à 256 ko. Portage des sept autres : une à la fois, testée | ✅ |
| 23/07/2026 | **La frise ES passe sur Supabase**, comme la SNT. `serveur-frise/` abandonné : il demandait hébergement, auth, HTTPS, purge, sauvegardes, registre — Supabase les fournit, et son README envisageait d'exposer le PC personnel sur Internet. Modèle proposé dans `bdd/schema/007-frise-es.sql`, **à valider** | ✅ |
| 23/07/2026 | `ia-correction/` **fusionné dans `ia-snt/`** : même moteur, seule la grille change | ✅ |
| 23/07/2026 | Les liens inertes deviennent des **mentions « en travaux »** (`<span class="a-venir">` + picto 🚧 + texte pour lecteur d'écran), et **restent** ainsi tant que la ressource n'existe pas. Un lien qui ne mène nulle part n'a plus l'air cliquable | ✅ |
| 23/07/2026 | **Nommage unifié** : un préfixe de niveau par niveau (`2nde-` · `1re-` · `term-`), jours du cahier en `jNN-`, images préfixées par leur chapitre (`t1-`, `t1c1-`, `t2c1-`), minuscules et tirets partout. Motif : Windows est insensible à la casse, GitHub Pages non | ✅ |
| 20/07/2026 | Persistance des séquences SNT = **base Supabase**, plus de `localStorage` (sauf le jeton de session) | ✅ |
| 20/07/2026 | Région **West EU (Paris)**, plan gratuit. Cible souveraine Clever Cloud, à proposer à l'établissement en septembre | ✅ |
| 20/07/2026 | Ordre de branchement : **une séquence SNT pilote → les autres séquences → les chapitres de PC** | ✅ |
| 20/07/2026 | `assets/js/progression.js` autorisé comme **second asset partagé** (avec `fonts.css`) — dérogation à l'autonomie des séquences | ✅ |
| 20/07/2026 | Doublure GitHub Actions pour le réveil Supabase : **écartée en connaissance de cause** | ✅ |
| 20/07/2026 | ~~Identification par **pseudonyme + code de classe** via les connexions anonymes de Supabase~~ | ~~remplacée le 22/07~~ |
| 22/07/2026 | Identification par **identifiant + mot de passe choisis par l'élève**. Motif : portabilité maison↔lycée. Connexions anonymes désactivées. Email synthétique `identifiant@snt.local`, jamais envoyé. Mot de passe **haché**, jamais lisible : on réinitialise, on ne consulte pas | ✅ |
| 21/07/2026 | Images matricielles **autorisées** dans `assets/img/snt/<slug>/` (≤ 1400 px, JPEG progressif, ~200 ko), légende + source + licence obligatoires. Le SVG inline reste le premier réflexe | ✅ |
| 22/07/2026 | Affichage du retour élève : **`commentaire_prof` prime** ; à défaut, message IA validé + ligne de transparence. L'élève ne voit rien tant que `statut ≠ 'corrige'` | ✅ |

---

## Pré-correction IA

| Date | Décision | Statut |
|---|---|---|
| — | **Jamais de note.** L'IA observe des critères et justifie ; Loïc reste souverain. AI Act art. 6(3), tâche préparatoire. Garde-fou mécanique : toute sortie contenant une note est rejetée | ✅ non négociable |
| 22/07/2026 | **100 % local** (Ollama, PC de Loïc). L'API Mistral est écartée : la réponse de l'élève ne quitte jamais la machine | ✅ |
| 22/07/2026 | Modèle **Mistral Nemo**. Mistral Small (24B) déborde des 16 Go de VRAM (split 5/95 CPU/GPU) et le delta de qualité est dans le bruit | ✅ |
| 22/07/2026 | Architecture en **deux passes** : le modèle juge les critères → le **code** calcule verdict et aide → le modèle rédige le message en sachant le verdict | ✅ |
| 22/07/2026 | Le worker **ne touche jamais au statut**. Le passage `en_attente → corrige` est un geste de Loïc | ✅ |
| 22/07/2026 | **Retour à la grille d'origine** R1/C2 : le rework l'avait dégradée (3 → 11 divergences). Rework reporté à froid. Leçon : sur petit modèle, **restructurer** (un critère = une chose), pas reformuler | ✅ |
| 23/07/2026 | **Rôle d'aidant** : socle complet **+ au moins `AIDE_PLUS_LOIN_MINI` critère « pour aller plus loin »**. L'ancien ratio 2/3 sur l'ensemble des critères le rendait mathématiquement inatteignable (0,20 sur NET-1b avec un socle parfait) | ✅ |
| 22/07/2026 | Tri de relecture **asymétrique** : mieux vaut un drapeau de trop. Budget cible ≤ 1 copie sur 3 à vérifier, à mesurer sur de vraies copies | ✅ |
| 22/07/2026 | Une copie « à compléter » ou marquée ⚠ passe **forcément par le clic de Loïc** — jamais de validation en lot | ✅ |

---

## RGPD & conformité

| Date | Décision | Statut |
|---|---|---|
| — | **Aucune police, aucun script depuis un CDN.** Tout auto-hébergé | ✅ non négociable |
| — | Pseudonymisation : aucun nom réel en base. Table identifiant→nom **sur le PC de Loïc uniquement** | ✅ |
| — | Aucune donnée sensible : pas de photo, pas de voix d'élève | ✅ |
| — | Alertes de décrochage basées sur la **progression réelle**, jamais sur le temps passé ni la comparaison entre élèves | ✅ |
| 20/07/2026 | Ne **jamais** committer un fichier de sauvegarde (`*.dump`, `dump-*.sql`) : il contiendrait des données d'élèves | ✅ |
| — | La clé `service_role` vit dans `ia-snt/.env`, gitignorée, jamais dans une page | ✅ |
| — | Mode enseignant : **ralentisseur, pas serrure** (page publique + inspecteur = contournable). Jamais de contenu sensible derrière. La vraie serrure viendra du rôle vérifié côté Supabase | ✅ |
| 23/07/2026 | Le code enseignant se note **hors dépôt** : le dépôt est public | ✅ |

---

## Pédagogie & production

| Date | Décision | Statut |
|---|---|---|
| — | Sur le **fond pédagogique**, la vision de Loïc est souveraine. L'IA est l'échafaudage, jamais le concepteur | ✅ non négociable |
| — | Contenu partagé avec des collègues : **on refait la forme, jamais le fond** | ✅ |
| — | La **validation** est un acte explicite de Loïc. La mise en ligne n'est pas un jalon | ✅ |
| 17/07/2026 | **Référentiel vivant** : tout nouveau mécanisme du cours se présente d'abord dans `t0` ; les autres séquences n'en portent que des rappels discrets | ✅ |
| 18/07/2026 | **Intégrer plutôt que renvoyer** : la notion nécessaire à une étape est traitée dans l'étape. Navigation autorisée, délégation de contenu interdite | ✅ |
| 18/07/2026 | Notes de chantier **dans la page** (`<aside class="chantier">`), encadrées par `<!-- CHANTIER -->` pour être supprimées d'un geste à la validation | ✅ |
| 21/07/2026 | **Échelle d'évaluabilité** ★★ / ★ / ○ / ✦ / — sur chaque bloc. *bonus* ≠ *facultatif* | ✅ |
| 21/07/2026 | Validation d'une étape **à l'envoi** : validée dès que l'élève a produit quelque chose. Deux informations distinctes en base, **fait** et **juste** | ✅ |
| 21/07/2026 | Trous **tolérants** : variantes + Levenshtein → état « presque », l'étape est validée, l'orthographe signalée jamais sanctionnée | ✅ |
| 21/07/2026 | Vocabulaire **figé** : séquence → séance → étape → champ. Côté élève, on dit *thème* | ✅ |
| — | Cible matérielle **iPad et téléphone** : jamais de `:hover` seul, jamais de `title` seul, cibles ≥ 44 px | ✅ acquis |
| 18/07/2026 | Réseaux sociaux : **plateformes fictives** pour les exemples, vraies plateformes pour les faits sourcés uniquement | ✅ |
| 18/07/2026 | Localisation : tout sur **cartes.gouv.fr** (Géoportail ferme en sept. 2026) | ✅ |
| 23/07/2026 | La doc de référence décrit **l'état courant** ; l'historique va dans `JOURNAL.md`, les décisions ici. Plus de « ⚠ Mise à jour du… » empilé | ✅ |
| 25/07/2026 | **Les contenus du site ne seront pas vendus.** Les images sont donc évaluées pour un usage **pédagogique non commercial** uniquement. Chantier licences **clos** : ne pas le réouvrir sauf demande explicite de Loïc | ✅ clos |
| 25/07/2026 | Numérotation t1 de référence : S1 `1.1→1.10` · S2 `2.1→2.5` · S3 `3.1→3.5` · S4 `4.1→4.6`, *pour aller plus loin* compris. Calculée par `numeroter()` sur les blocs `.step` | ✅ |
| 25/07/2026 | **Décision du 21/07 annulée** : l'adresse IP et le DNS **restent** dans la séquence Internet. Un thème distinct sera consacré au binaire, et la séance 4 l'a en **prérequis** | ✅ |
| 25/07/2026 | Le « à retenir » s'affiche **automatiquement** à la fin de l'activité, plus par bouton — partout, blocs de définitions compris | ✅ |
| 25/07/2026 | Pas d'animation infoforall en 3.3 : Filius en fin de thème suffit comme temps fort. L'animation reste en réserve si l'étape doit être étoffée | ✅ |
| 25/07/2026 | **Texte à trous : variante « étiquette compacte »**. Interligne 1,85, champ dans la police du texte, largeur calculée par le moteur d'après la réponse attendue, `min-width:44px`. Le texte des indices se range en **pied de bloc**, relié au trou par un numéro qui n'apparaît qu'avec lui | ✅ |
| 25/07/2026 | **Bloc définition : « fiche de dictionnaire » (D1)**. Gouttière teintée de 46 px portant l'icône de glossaire, corps sur fond blanc. Faite en pseudo-éléments : aucun HTML ni JS à modifier, les blocs à venir en héritent | ✅ |
| 25/07/2026 | `.glosmot` était défini **deux fois** avec des styles contradictoires (bordure + rayon complets d'un côté, filet gauche et rayon droit de l'autre) : la cascade gardait les deux. Définition unique désormais, dans le § grammaire V2 | ✅ corrigé |
| 25/07/2026 | **Deux natures d'aide, selon ce que l'exercice demande.** Information à l'écran (lecture de carte, de schéma) → un seul rappel **« Où chercher »**, visible d'emblée, jamais de contenu, aucun indice par champ : `data-aide="localisation"` + `data-ou` sur le bloc. Information hors de vue (restitution) → indices à deux niveaux après échec, inchangés | ✅ |
| 25/07/2026 | Règle : **un indice de niveau 1 ne contient jamais la réponse.** Au niveau 2, c'est le filet de secours — admis en restitution, proscrit en lecture de document. Contrôlé par `verifier.mjs` (§ 6 bis) | ✅ |
| 25/07/2026 | **Gras** : un terme n'est mis en relief qu'à sa première apparition dans l'étape, et les intitulés de questions n'en portent aucun. Exclus : tableaux, « à retenir », bulles, et les `data-focus-question` (mode focus, hors flux). 80 balises retirées | ✅ 1re passe |
| 25/07/2026 | Exercice d'encapsulation : **banque de mots avant** les libellés Émission / modèle TCP/IP / Réception, pour qu'ils touchent la grille qu'ils nomment | ✅ |
