# Brief — Volet base de données, jalon 4

> À coller en début de nouvelle conversation. Écrit le 20/07/2026.

---

## Le message à coller

> **Volet base de données du site pédagogique — jalon 4.**
> Les jalons 1 à 3 sont faits : consignes réécrites, projet Supabase créé,
> schéma des sept tables écrit et exécuté. Le récapitulatif complet est dans
> le fichier `BDD-cadrage.md` que je te joins — lis-le d'abord.
>
> Ce que j'attends de cette session, dans l'ordre :
> 1. installer la **CLI Supabase** sur Windows (méthode la plus simple, je suis
>    débutant, pas d'éditeur de code exotique — VS Code + terminal intégré) ;
> 2. les deux scripts **`.bat`** : sauvegarde hebdomadaire (`supabase db dump`
>    vers un dossier local + une ligne insérée dans la table `sauvegardes`) et
>    réveil quotidien (contre la mise en pause après 7 jours d'inactivité) ;
> 3. la marche à suivre pour les deux **tâches planifiées Windows** ;
> 4. `supabase init` puis `supabase db pull`, pour initialiser l'historique de
>    migrations et donner enfin un sens à l'intégration GitHub déjà activée.
>
> Rappels de méthode : tout en français ; aucune décision silencieuse, tu
> proposes avant d'implémenter ; livraison en **archive delta** reproduisant
> l'arborescence, jamais le site complet ; tu poses le concept d'abord, le
> détail ensuite ; tu me challenges si je me trompe.

---

## Fichiers à joindre à la nouvelle conversation

**Obligatoire**

- `_suivi/BDD-cadrage.md` — architecture, décisions, modèle de données, notions
  apprises, coordonnées du projet. C'est le document pivot.

**Utile si la conversation touche au dépôt**

- `bdd/README.md` — la discipline des fichiers de schéma et l'avertissement sur
  `supabase/migrations/`.
- `.gitignore` — pour vérifier que les dumps sont bien exclus avant le premier
  `supabase db dump`.

**Pas nécessaire au jalon 4**

- Les fichiers `bdd/schema/*.sql` : leur contenu est résumé dans le cadrage.
  À joindre seulement en cas de problème d'exécution.
- L'archive complète du site : inutile ici, le jalon 4 ne touche à aucune page.
  Elle redeviendra utile au jalon 6 (client `progression.js`) et au jalon 7
  (branchement d'un hub).

---

## Ce que la nouvelle session doit savoir sans avoir à demander

| | |
|---|---|
| Reference ID | `ztyvuiaohxekuyjeoaxz` |
| Project URL | `https://ztyvuiaohxekuyjeoaxz.supabase.co` |
| Région / plan | West EU (Paris) · Free |
| Intégration GitHub | activée, **sans effet** tant que `supabase/` n'existe pas |
| État des tables | 7 tables créées, RLS active, **aucune règle** — donc fermées à tous. C'est voulu, l'ouverture est le jalon 5 |
| Environnement | Windows, VS Code, Opera GX, dépôt poussé à la main depuis VS Code |
| Secrets | mot de passe de base et clé `service_role` dans un gestionnaire de mots de passe, **jamais** dans le dépôt ni dans une conversation |

## Décisions déjà prises — à ne pas rouvrir

- Supabase gratuit région Paris ; cible souveraine Clever Cloud en septembre.
- Identification par pseudonyme + code de classe (connexions anonymes).
  Aucun email, aucun nom, aucun mot de passe en base.
- Code de classe générique par classe, fermé via `actif = false` après la
  deuxième séance, rouvert à la demande (option B).
- Codes d'activité au tiret en base (`WEB-2b`), point médian conservé à l'écran.
- Historique des rédactions **conservé** : archivage automatique par déclencheur
  dans `reponses_versions`. Bouton « voir mes versions » prévu, non implémenté.
- Schéma dans `bdd/schema/`, exécuté à la main, **pas** dans
  `supabase/migrations/` avant que `supabase db pull` ait initialisé
  l'historique.
- Chapitres de physique-chimie **hors périmètre** pour l'instant (leur
  `localStorage` reste en place) ; migration après le pilote SNT.

## Questions encore ouvertes

- Quel hub SNT sert de pilote (une étape, un champ de texte libre) ?
- Le dossier de destination des sauvegardes sur le PC de Loïc, et la copie
  externe (disque, clé, cloud ?).
- Rythme du worker de correction (à la demande ? toutes les N minutes ?).
