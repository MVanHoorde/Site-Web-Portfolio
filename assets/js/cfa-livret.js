/* ============================================================
   cfa-livret.js — le seul script des pages écran du livret CFA.

   USAGE — en fin de <body> :
     <script src="../assets/js/cfa-livret.js?v=1" defer></script>

   Il fait trois choses, et rien d'autre :

     1. la barre de symboles au-dessus de chaque zone de réponse ;
     2. la conservation de ce que l'élève écrit ;
     3. le marqueur « j'ai travaillé cette fiche ».

   ------------------------------------------------------------
   RGPD — CE QUI SORT DE L'APPAREIL : RIEN.
   ------------------------------------------------------------
   Aucun appel réseau, aucun compte, aucun identifiant. Tout vit dans
   le localStorage du navigateur de l'élève, sous des clés préfixées
   cfa-. Ni le professeur ni le site ne peuvent lire ces réponses :
   elles ne quittent jamais la machine. C'est à dire aux élèves en
   clair — un public qui se méfie n'écrit rien.

   ------------------------------------------------------------
   POURQUOI CE FICHIER EXISTE
   ------------------------------------------------------------
   Chaque page portait la même dizaine de lignes de script inline pour
   le seul marqueur de complétion. À dix-sept fiches, c'est dix-sept
   copies à corriger le jour où une virgule change. Tout est ici.

   ------------------------------------------------------------
   DÉGRADATION
   ------------------------------------------------------------
   Le <textarea> et les champs de trou sont écrits dans le HTML, pas
   créés par ce script. Si le JavaScript ne tourne pas — vieux
   navigateur, blocage, erreur — l'élève garde une page où il peut
   écrire. Il perd la barre de symboles et la conservation, pas la
   possibilité de travailler.

   localStorage lève une exception en navigation privée sur certains
   navigateurs. Chaque accès est donc protégé : en cas d'échec, la
   page reste utilisable, simplement sans mémoire.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Accès au stockage, tolérants à l'échec.
     ---------------------------------------------------------- */
  function lire(cle) {
    try { return localStorage.getItem(cle); } catch (e) { return null; }
  }
  function ecrire(cle, valeur) {
    try {
      if (valeur === '' || valeur === null) { localStorage.removeItem(cle); }
      else { localStorage.setItem(cle, valeur); }
      return true;
    } catch (e) { return false; }
  }


  /* ----------------------------------------------------------
     1. La barre de symboles
     ----------------------------------------------------------
     Les symboles retenus sont ceux qu'un élève a réellement à écrire
     dans une ligne de calcul. Pas de fraction empilée, pas d'intégrale :
     la rédaction attendue par les cinq règles est linéaire.

     Le moins est le vrai signe moins (−, U+2212) et non le trait
     d'union du clavier : c'est lui qu'on veut voir devant un écart
     négatif.
     ---------------------------------------------------------- */
  var SYMBOLES = [
    { s: '×', nom: 'multiplié par' },
    { s: '÷', nom: 'divisé par' },
    { s: '−', nom: 'moins' },
    { s: '±', nom: 'plus ou moins' },
    { s: '²', nom: 'au carré' },
    { s: '³', nom: 'au cube' },
    { s: '√', nom: 'racine carrée' },
    { s: 'π', nom: 'pi' },
    { s: '≈', nom: 'environ égal à' },
    { s: '°', nom: 'degré' },
    { s: '·', nom: 'point médian' },
    { s: '⌀', nom: 'diamètre' }
  ];

  /* Insère un symbole à la position du curseur, sans écraser la
     sélection en cours ailleurs dans la page, et rend le focus au
     champ — sinon l'élève doit recliquer après chaque symbole. */
  function inserer(champ, symbole) {
    var debut = champ.selectionStart;
    var fin = champ.selectionEnd;
    var texte = champ.value;
    champ.value = texte.slice(0, debut) + symbole + texte.slice(fin);
    champ.selectionStart = champ.selectionEnd = debut + symbole.length;
    champ.focus();
    champ.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function poserBarre(champ) {
    var barre = document.createElement('div');
    barre.className = 'barre-symboles';
    barre.setAttribute('role', 'group');
    barre.setAttribute('aria-label', 'Symboles à insérer');

    SYMBOLES.forEach(function (item) {
      var bouton = document.createElement('button');
      bouton.type = 'button';
      bouton.textContent = item.s;
      bouton.title = item.nom;
      bouton.setAttribute('aria-label', item.nom);
      bouton.addEventListener('click', function () { inserer(champ, item.s); });
      barre.appendChild(bouton);
    });

    champ.parentNode.insertBefore(barre, champ);
  }


  /* ----------------------------------------------------------
     2. La conservation de ce qui est écrit
     ----------------------------------------------------------
     Une clé par champ, portée par data-cle dans le HTML — jamais
     calculée depuis la position du champ dans la page. Sinon, insérer
     une question plus tard décalerait toutes les clés suivantes et
     l'élève retrouverait ses réponses dans les mauvaises cases.

     L'écriture est différée de 400 ms après la dernière frappe : sans
     cela, on écrit dans le stockage à chaque caractère.
     ---------------------------------------------------------- */
  var ATTENTE = 400;

  function poserMemoire(champ) {
    var cle = 'cfa-' + champ.dataset.cle;
    var minuteur = null;

    var garde = lire(cle);
    if (garde !== null) { champ.value = garde; }

    var temoin = document.createElement('span');
    temoin.className = 'temoin-enregistre';
    temoin.setAttribute('aria-live', 'polite');
    champ.insertAdjacentElement('afterend', temoin);

    champ.addEventListener('input', function () {
      if (minuteur) { clearTimeout(minuteur); }
      minuteur = setTimeout(function () {
        if (ecrire(cle, champ.value)) {
          temoin.textContent = 'enregistré sur cet appareil';
          temoin.classList.add('visible');
          setTimeout(function () { temoin.classList.remove('visible'); }, 1800);
        }
      }, ATTENTE);
    });
  }


  /* ----------------------------------------------------------
     3. Le marqueur de complétion
     ----------------------------------------------------------
     Une clé booléenne par outil : cfa-oNN. C'est elle que compte
     l'index du livret pour afficher « N outils sur 17 travaillés ».
     ---------------------------------------------------------- */
  function poserMarqueur() {
    var marqueur = document.getElementById('fait');
    if (!marqueur) { return; }
    var cle = 'cfa-o' + marqueur.dataset.outil;

    marqueur.checked = lire(cle) === '1';
    marqueur.addEventListener('change', function () {
      ecrire(cle, marqueur.checked ? '1' : '');
    });
  }


  /* ----------------------------------------------------------
     4. Le compteur de l'index
     ----------------------------------------------------------
     « 7 outils sur 17 travaillés ». Il compte les clés cfa-oNN posées
     par le marqueur de chaque fiche.

     Ce compteur produit plus d'effet chez ce public qu'une note, et il
     ne coûte rien à la souveraineté du professeur sur l'évaluation :
     il dit ce qui a été parcouru, jamais ce qui a été réussi. Un élève
     ne peut pas y échouer.

     Le décompte se refait à chaque affichage de la page, y compris au
     retour par le bouton « précédent » du navigateur — d'où l'écoute
     de pageshow, que le seul DOMContentLoaded manquerait.
     ---------------------------------------------------------- */
  var TOTAL_OUTILS = 17;

  function majCompteur() {
    var zone = document.getElementById('compteur');
    if (!zone) { return; }

    var faits = 0;
    for (var n = 0; n < TOTAL_OUTILS; n++) {
      var num = (n < 10 ? '0' : '') + n;
      if (lire('cfa-o' + num) === '1') { faits++; }
    }

    var nombre = zone.querySelector('.compteur-nombre');
    var texte = zone.querySelector('.compteur-texte');
    if (nombre) { nombre.textContent = faits; }
    if (texte) {
      texte.textContent = faits <= 1
        ? 'outil sur ' + TOTAL_OUTILS + ' travaillé'
        : 'outils sur ' + TOTAL_OUTILS + ' travaillés';
    }

    var jauge = zone.querySelector('.jauge-fait');
    if (jauge) { jauge.style.width = (faits / TOTAL_OUTILS * 100) + '%'; }

    // Marque les entrées déjà travaillées dans la liste des outils.
    var entrees = document.querySelectorAll('.outil[data-outil]');
    Array.prototype.forEach.call(entrees, function (entree) {
      var fait = lire('cfa-o' + entree.dataset.outil) === '1';
      entree.classList.toggle('fait', fait);
    });
  }


  /* ----------------------------------------------------------
     Mise en route
     ---------------------------------------------------------- */
  function demarrer() {
    // Les zones de rédaction : barre de symboles puis mémoire.
    // L'ordre compte — poserBarre insère un élément AVANT le champ,
    // poserMemoire en insère un APRÈS. L'inverse marcherait aussi,
    // mais autant garder la lecture du DOM dans l'ordre visuel.
    var zones = document.querySelectorAll('textarea[data-cle]');
    Array.prototype.forEach.call(zones, function (champ) {
      poserBarre(champ);
      poserMemoire(champ);
    });

    // Les trous d'un calcul amorcé : mémoire seule. Une barre de
    // symboles au-dessus d'un champ de six caractères serait absurde,
    // et le palier 1 ne demande que des nombres.
    var trous = document.querySelectorAll('input.trou[data-cle]');
    Array.prototype.forEach.call(trous, function (champ) {
      poserMemoire(champ);
    });

    // Les cases à cocher d'un exercice (chasse à l'erreur, plausible
    // ou aberrant). Même mécanique, valeur "1" ou rien.
    var cases = document.querySelectorAll('input[type="checkbox"][data-cle]');
    Array.prototype.forEach.call(cases, function (champ) {
      var cle = 'cfa-' + champ.dataset.cle;
      champ.checked = lire(cle) === '1';
      champ.addEventListener('change', function () {
        ecrire(cle, champ.checked ? '1' : '');
      });
    });

    poserMarqueur();
    majCompteur();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }

  // Retour à l'index par le bouton « précédent » : la page peut être
  // restituée depuis le cache sans rejouer DOMContentLoaded. Sans cela,
  // l'élève qui vient de cocher une fiche retrouverait l'ancien compte.
  window.addEventListener('pageshow', majCompteur);
})();
