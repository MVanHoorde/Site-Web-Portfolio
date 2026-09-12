# Passation — ES 1re T1-C1 « La nucléosynthèse », audit n° 2 de Loïc (12/09/2026)

> **À lire en entier avant de toucher à la page.** Ce fichier est un relais entre
> deux sessions : il se **supprime** une fois le chantier fini (le récit part dans
> `_suivi/JOURNAL.md`, les décisions dans `_suivi/DECISIONS.md`).
>
> Page : `pages/1re-es-t1-c1-nucleosynthese.html`
> Consignes : `_modeles/CONSIGNES-sequence-ES.md` (conventions gras / rouge `.cle` / `.activite` / `.transi`)
> Rien n'est commité. Branche `main`. Loïc a **validé le plan** ; il veut ensuite le commit, puis les PDF.

---

## 0. Pièges déjà rencontrés dans cette session (ne pas les rejouer)

- **Fins de ligne** : le dépôt est en **LF**. En Python sous Windows, `io.open(..., "w")`
  écrit du CRLF → toujours `newline="\n"`. Vérifier avec `git diff --stat` (un diff
  de toute la page = CRLF).
- **Ne pas écrire de script avec `sed` ou heredoc contenant `\n` ou `\`** : ils sont
  mangés. Écrire le script avec l'outil Write, puis l'exécuter.
- **Playwright Python** fonctionne tel quel (`from playwright.sync_api import sync_playwright`).
  Lancer avec `PYTHONIOENCODING=utf-8`. Le mode enseignant exige un code : pour
  tout afficher, retirer à la main `masque`/`replie` des `.step` et `locked` des `.seance`.
  Une modale « Séance terminée » s'ouvre quand toutes les étapes d'une séance sont
  `is-done` : la fermer par un clic sur `.modal-back` lui-même.
- **Ne pas modifier `assets/js/sequence-snt.js`** : partagé par 22 pages (bump `?v=`
  partout). Tout ce chantier se fait **dans la page**.
- Les SVG de noyaux et de tableaux périodiques sont **générés** : modifier
  `_outils/es/noyaux.py` ou `_outils/es/tableau_periodique.py`, puis
  `python _outils/es/noyaux.py` (injecte entre les marqueurs `<!-- SVG:… -->`).

---

## 1. Ce qui est FAIT (copie de travail)

### Générateur `_outils/es/noyaux.py` (régénéré, injecté)
- Chaîne proton-proton redessinée : flèche horizontale = transformation ; ce qui
  s'ajoute arrive par-dessous sur la hampe ; ce qui part sort par-dessus. Bilan
  `4 ¹H → ⁴He + 2 e⁺ + 2 ν`.
- Couches de l'étoile massive : disques pleins teintés, étiquettes dans une colonne
  à droite reliées par des traits. **Erreur de cours corrigée : ²⁸Si → ⁵⁶Ni** (le
  source disait ⁵⁸Ni).
- Chaîne primordiale : doublons « 2²H » / « 3³He » corrigés.
- Légende en vraies billes (`legende_pn`) : fusions, fission, chaînes.
- Schéma `noyaux-legers` supprimé (fonction + fichier SVG), l'atelier ayant été retiré.
- Nouvelles classes CSS dans la page : `.nx .g`, `.cq-f`, `.cq-pt`, `.cq-lien`, `.cq-n`, `.lg-pn`.

### Page
- **Partout** : 13 occurrences « cours de M. Van Hoorde » retirées ; les 6 cadres
  « ⬖ Proposition — Difficulté » retirés ; `.reac` centrées (`width:fit-content`) ;
  figures `centree` (fusions, fissions) et `large` (couches).
- **1.1** : encart « 🧭 Première mécanique : le QCM » remonté avant le QCM NUC-1z ;
  « Deuxième mécanique : la réponse rédigée ».
- **1.2** : photo `assets/img/es/1re-es-t1-c1/t1c1-reacteur-pulstar.jpg` (480×640),
  crédit CC BY-SA 3.0 Wikimedia Commons ; chantier « image à déposer » retiré.
  QCM NUC-1b, question « éléments naturels » : options 92 / **94** / 118 / 103.
- **1.3** : 5e rang au tableau (Ca 4,1 % ; autres lithosphère 8,2 %). Étiquettes
  remplacées par le composant **`.legende-libre`** (image + repères `.ll-n`
  positionnés en % mesurés, et lignes « élément / % » en saisie libre, **sans
  correction**). Graphique 3 : 5 repères. Dans chaque graphique, la légende (1)
  passe avant le choix du titre (2). Encart « 🧭 Quatrième mécanique : la légende
  à compléter ». CSS `.legende-libre …` ajouté. Gras réduit dans « Ce qu'il fallait remarquer ».
- **1.4** : explications des items réécrites — item 3 accepte aussi « fission »
  (`data-aussi="fission"` + `data-exp-aussi`, script des choix adapté) avec
  explication du piège (désintégration α, hors niveau, chapitre 2) ; item 4 fait
  remarquer le neutron à gauche ; item 5 explique le piège du **4 devant ¹H**.
  Message d'erreur : méthode de comptage. Champ rédigé NUC-2f **supprimé**
  (redondant). QCM NUC-2e réécrit : **8 questions**, aucune ne repose le classement.
- **2.1** : second cadre « Mes notes de visionnage » supprimé ; atelier
  « reconnaître les noyaux » supprimé ; bloc Observatoire de Paris déplacé dans le
  bonus 2.6.
- **2.3** : paragraphe « rémanent de supernova » + image
  `t1c1-supernova-kepler.jpg` (800×1000, crédit NASA/ESA/R. Sankrit et W. Blair,
  domaine public) ; les deux chantiers « animation » et « légende à trancher »
  retirés ; question « Qu'est-ce qu'une supernova ? » ajoutée au QCM NUC-2c.
  L'image de la géante rouge reste.
- **2.4** : ancien point 2 (tableau à compléter) supprimé ; l'activité « Chaque
  noyau à son usine » devient le point 2 ; le bilan du chapitre reste en 2.4.
- **2.5** : le tableau des provenances est placé **après** la réponse rédigée,
  titre « Pour conclure — qui a fabriqué quoi ».
- **2.6 (bonus)** : texte d'intro revu, lien Observatoire en tête ; vidéo de
  révision et Kahoot **retirés** d'ici.
- **S3, étape 3.2** « Revoir les vidéos, puis jouer » : accueille la vidéo de
  révision (lecteur incorporé) et le Kahoot ; 5 liens réparés en
  `https://www.youtube.com/watch?v=…` (le `youtube-nocookie.com/watch` n'existe pas).
- Contrôle de structure : balises `div/figure/section/aside/p/ul/table/svg/a/button` équilibrées.

---

## 2. Ce qui RESTE à faire, dans l'ordre

### 2.1 Validation bloc par bloc (le « cercle ») — JS à coller avant `</body>`
Cause : le moteur pose `is-done` sur l'étape au **premier** bloc réussi (cloze,
QCM…). En 1.3, un seul « Vérifier » remplissait le cercle. Solution dans la page,
en phase de capture. **Brouillon prêt, non inséré, non testé** :

```html
<script>
/* ---------- Une étape se valide quand TOUT y est fait (audit du 12/09/2026) ----------
   Le moteur valide une étape au premier bloc réussi. On ne touche pas au moteur
   (22 pages) : on intercepte ici, en CAPTURE, « etape-validee ». Si l'étape n'est
   pas finie, on retire is-done et l'événement s'arrête là. Le cercle se remplit
   au prorata des blocs faits. */
(function(){
  function blocs(step){
    return Array.prototype.filter.call(
      step.querySelectorAll('[data-focus], .qcmbox:not([data-facultatif]), .cloze, [data-tri], .legende-libre'),
      function(el){ return !el.closest('.bonus-wrap') && !(el.matches('.cloze') && el.closest('[data-focus]')); });
  }
  function fait(el){
    if(el.matches('[data-focus]')){
      var echo = el.querySelector('[data-focus-echo]');
      return el.classList.contains('rempli') || !!(echo && echo.textContent.trim());
    }
    if(el.matches('.qcmbox')){
      var rec = el.querySelector('.qcm-recap');
      return !!el.querySelector('.qcm-fait') || !!(rec && rec.textContent.trim());
    }
    if(el.matches('.cloze'))  return el.dataset.verifie === '1';
    if(el.matches('[data-tri]')) return el.dataset.fait === '1';
    if(el.matches('.legende-libre'))
      return Array.prototype.every.call(el.querySelectorAll('input'), function(i){ return i.value.trim(); });
    return true;
  }
  function etat(step){
    var liste = blocs(step), total = liste.length, faits = liste.filter(fait).length;
    var choix = step.querySelectorAll('[data-choix-item]');
    if(choix.length){
      total++;
      if(Array.prototype.every.call(choix, function(c){ return c.querySelector('button.juste'); })) faits++;
    }
    return {faits: faits, total: total};
  }
  function peindre(step, e){
    var v = String(e.total ? Math.round(100 * e.faits / e.total) : 0);
    if(step.dataset.avance !== v){ step.dataset.avance = v; step.style.setProperty('--avance', v); }
  }
  document.addEventListener('etape-validee', function(ev){
    var step = ev.target && ev.target.closest ? ev.target.closest('.step') : null;
    if(!step || !step.hasAttribute('data-gate')) return;
    var e = etat(step);
    peindre(step, e);
    if(e.faits < e.total){
      if(step.classList.contains('is-done')) step.classList.remove('is-done');
      ev.stopImmediatePropagation();
    }
  }, true);
  function tenter(step){
    if(!step || !step.hasAttribute('data-gate')) return;
    var e = etat(step);
    peindre(step, e);
    if(e.faits === e.total && !step.classList.contains('is-done')){
      step.classList.add('is-done');
      step.dispatchEvent(new CustomEvent('etape-validee', {bubbles:true}));
    }
  }
  window.esTenterEtape = tenter;
  document.addEventListener('input', function(ev){
    var ll = ev.target.closest && ev.target.closest('.legende-libre');
    if(ll) tenter(ll.closest('.step'));
  });
  document.addEventListener('click', function(ev){
    var step = ev.target.closest && ev.target.closest('.step[data-gate]');
    if(step) setTimeout(function(){ peindre(step, etat(step)); }, 80);
  });
})();

/* ---------- Légende à compléter : le repère met le curseur dans sa ligne ---------- */
(function(){
  document.querySelectorAll('.legende-libre').forEach(function(ll){
    function ligne(n){ var i = ll.querySelector('[data-ll-el="' + n + '"]'); return i ? i.closest('.ll-ligne') : null; }
    ll.querySelectorAll('.ll-n').forEach(function(m){
      m.addEventListener('click', function(){
        var l = ligne(m.dataset.ll); if(!l) return;
        ll.querySelectorAll('.ll-ligne.vise').forEach(function(x){ x.classList.remove('vise'); });
        l.classList.add('vise');
        l.querySelector('input').focus();
      });
    });
    ll.addEventListener('input', function(){
      ll.querySelectorAll('.ll-n').forEach(function(m){
        var n = m.dataset.ll;
        var el = ll.querySelector('[data-ll-el="' + n + '"]'), pc = ll.querySelector('[data-ll-pc="' + n + '"]');
        var plein = !!(el && pc && el.value.trim() && pc.value.trim());
        if(m.classList.contains('rempli') !== plein) m.classList.toggle('rempli', plein);
      });
    });
  });
})();
</script>
```

À compléter en même temps :
- dans le script du **tri des noyaux** (page), poser `jeu.dataset.fait='1'` quand
  `justes === total` ;
- CSS : `.step[data-avance]:not(.is-done) .step-pip{background:conic-gradient(var(--link) calc(var(--avance)*1%),var(--bg) 0);border-color:var(--link)}` ;
- vérifier que le bilan de 1.4 (`data-bilan-wrap`) s'ouvre toujours après le QCM ;
- 🔴 le moteur a un `MutationObserver` sur `class` : ne jamais écrire une classe
  sans vérifier qu'elle change (mémoire « classList.remove réveille le MutationObserver »).

### 2.2 Panneau « classification périodique » (demande de Loïc)
Pouvoir consulter la classification pendant la prise de notes, avec des infos
sur les éléments. Proposition : bouton fixe `🧪 Classification` en bas à droite,
au-dessus de `#glo-ouvrir` (qui est à `right:14px;bottom:14px`) ; panneau qui
clone le SVG `.tp-etats` ; clic sur une case → nom français, symbole, Z (= nombre
de protons), état à 20 °C, présent dans le corps (CHON). Ajouter les **noms
français** et `data-z` dans `_outils/es/tableau_periodique.py`, puis régénérer.
Ne pas afficher la provenance (réponse de la séance 2). Présenter la chose à Loïc
comme proposition.

### 2.3 Gras et rouge
Relire toute la page contre la table de `_modeles/CONSIGNES-sequence-ES.md` :
`<b>` = terme de programme à sa 1re occurrence (2 max par paragraphe, 0 en
légende de figure) ; `<b class="cle">` rouge = mot à restituer (1 par « à retenir »).
Loïc trouve qu'il y a encore trop de gras et que le rouge doit marquer les notions nouvelles.

### 2.4 Vérification au navigateur
Captures de 1.3 (légendes), 1.4, 2.3 (supernova), 2.5, S3 ; zéro erreur JS ;
parcours réel de 1.3 (le cercle se remplit progressivement, l'étape ne se valide
qu'à la fin) et de 1.4 (choix + QCM).
**Bug « Étape suivante descend trop loin »** (séance 1, après le bilan) : **non
reproduit** en 820×1180 ni en 1024×768 (l'étape 1.5 arrive à 108 px du haut).
Demander à Loïc le contexte exact avant de toucher au moteur.

### 2.5 Contrôles et suivi
- `node verifier.mjs` → repère : **exactement 18 problèmes**.
- Mettre à jour `_suivi/es1-verification.md`, `_suivi/ETAT-PROJET.md`,
  `_suivi/DECISIONS.md` (validation bloc par bloc gérée dans la page ; légendes
  libres sans correction ; ⁵⁶Ni), `_suivi/JOURNAL.md`.
- Provenance des images reprises du cours source : les crédits ont été retirés de
  la page, la question « provenance à confirmer » doit rester tracée dans
  `_suivi/es1-verification.md`.

### 2.6 Tri de `_a-deposer/es1/` (obligatoire en fin de session)
- `Pulstar2.jpg` — UTILISÉ, intégré → `assets/img/es/1re-es-t1-c1/t1c1-reacteur-pulstar.jpg`
- `NASA's_Great_Observatories_…_Kepler's_Supernova_Remnant.jpg` — UTILISÉ, intégré (réduit) → `t1c1-supernova-kepler.jpg`
- les autres fichiers : NON UTILISÉS ici (autres chapitres d'ES 1re).

### 2.7 Fin
Montrer à Loïc, puis commit (message terminé par la ligne Co-Authored-By), puis
PDF quand il valide. Supprimer ce fichier de passation.
