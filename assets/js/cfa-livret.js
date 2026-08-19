/* ============================================================
   cfa-livret.js — le seul script des pages écran du livret CFA.

   USAGE — en fin de <body>, APRÈS progression.js :
     <script src="../assets/js/progression.js?v=3" defer></script>
     <script src="../assets/js/cfa-livret.js?v=3" defer></script>

   Il fait trois choses, et rien d'autre :

     1. la barre de symboles au-dessus de chaque zone de réponse ;
     2. la conservation de ce que l'élève écrit ;
     3. le marqueur « j'ai travaillé cette fiche ».

   ------------------------------------------------------------
   OÙ VA CE QUE L'ÉLÈVE ÉCRIT — DEUX RÉGIMES, ET UN SEUL À LA FOIS
   ------------------------------------------------------------
   · CONNECTÉ. Le travail part dans la base du dispositif (Supabase,
     Paris) et revient sur n'importe quel appareil : au CFA, en
     entreprise, à la maison. C'est la seule raison d'être du compte.
     Une ligne par fiche — domaine « cours », clé « cfa-oNN » — dont
     la valeur est un objet JSON { champs, fait }.

   · SANS COMPTE. Rien ne sort de l'appareil : tout reste dans le
     localStorage du navigateur, sous des clés préfixées cfa-. Le
     professeur n'y a pas accès, le site non plus. C'est le régime de
     repli, et il reste entier : personne n'est bloqué devant une
     fiche parce qu'il a oublié son mot de passe.

   Ce que l'élève lit à l'écran doit dire lequel des deux s'applique
   — c'est le rôle du témoin sous chaque champ et de la mention en
   pied de fiche. Une page qui promet « rien n'est envoyé » alors
   qu'un compte est ouvert est un mensonge, pas un raccourci.

   RGPD : aucun nom réel, aucune adresse réelle ne circule. Le compte
   est un identifiant choisi par l'élève ; le détail est dans
   assets/js/progression.js et _suivi/BDD-cadrage.md.

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

   Si la base est injoignable alors qu'un compte est ouvert, le champ
   reste utilisable et le témoin le dit ; la sauvegarde est retentée
   à la frappe suivante. On ne recopie PAS en local dans ce cas : ce
   serait promettre deux fois la même chose et n'en tenir aucune.

   localStorage lève une exception en navigation privée sur certains
   navigateurs. Chaque accès est donc protégé : en cas d'échec, la
   page reste utilisable, simplement sans mémoire.
   ============================================================ */

(function () {
  'use strict';

  var PREFIXE  = 'cfa-';        // préfixe des clés locales
  var DOMAINE  = 'cours';       // domaine de la table progression
  var TOTAL_OUTILS = 17;

  /* ----------------------------------------------------------
     Accès au stockage de l'appareil, tolérants à l'échec.
     ---------------------------------------------------------- */
  function lireLocal(cle) {
    try { return localStorage.getItem(cle); } catch (e) { return null; }
  }
  function ecrireLocal(cle, valeur) {
    try {
      if (valeur === '' || valeur === null) { localStorage.removeItem(cle); }
      else { localStorage.setItem(cle, valeur); }
      return true;
    } catch (e) { return false; }
  }
  function clesLocales() {
    var t = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(PREFIXE) === 0) { t.push(k); }
      }
    } catch (e) { /* navigation privée : on fait sans */ }
    return t;
  }


  /* ==========================================================
     LE DÉPÔT — la seule couche qui sait où va le travail
     ==========================================================
     Tout le reste du fichier ignore s'il y a un compte ou non :
     il appelle depot.charger() puis depot.poser(). C'est ce qui
     permet de ne pas dupliquer la logique des champs, du marqueur
     et du compteur en deux versions.

     `numero` est le numéro d'outil sur deux chiffres ('00'…'16'),
     lu sur la case de complétion de la fiche. Sur l'index, il n'y
     a pas de champ : seul le compteur travaille.
     ---------------------------------------------------------- */

  function cleFiche(numero) { return 'cfa-o' + numero; }

  /* ---- Régime « appareil » : une clé localStorage par champ ---- */
  var depotAppareil = {
    mode: 'appareil',
    libelle: 'enregistré sur cet appareil',
    charger: function () { return Promise.resolve(null); },  // lecture directe
    valeur: function (dataCle) { return lireLocal(PREFIXE + dataCle); },
    poser: function (numero, dataCle, valeur) {
      return ecrireLocal(PREFIXE + dataCle, valeur)
        ? Promise.resolve()
        : Promise.reject(new Error('STOCKAGE_REFUSE'));
    },
    marquer: function (numero, fait) {
      return ecrireLocal(PREFIXE + 'o' + numero, fait ? '1' : '')
        ? Promise.resolve()
        : Promise.reject(new Error('STOCKAGE_REFUSE'));
    },
    marque: function (numero) { return lireLocal(PREFIXE + 'o' + numero) === '1'; },
    faits: function () {
      var s = {};
      for (var n = 0; n < TOTAL_OUTILS; n++) {
        var num = (n < 10 ? '0' : '') + n;
        if (lireLocal(PREFIXE + 'o' + num) === '1') { s[num] = true; }
      }
      return Promise.resolve(s);
    }
  };

  /* ---- Régime « base » : une ligne de progression par fiche ----
     L'état de la fiche est tenu en mémoire et réécrit en entier à
     chaque enregistrement : Progression.ecrire() fait une fusion
     superficielle, un objet `champs` partiel écraserait les autres
     réponses de la même fiche. */
  function creerDepotBase() {
    var etats = {};   // numero → { champs: {…}, fait: bool }

    function etat(numero) {
      if (!etats[numero]) { etats[numero] = { champs: {}, fait: false }; }
      return etats[numero];
    }

    function pousser(numero) {
      var e = etat(numero);
      return window.Progression.ecrire(DOMAINE, cleFiche(numero), {
        v: 1, champs: e.champs, fait: e.fait
      });
    }

    return {
      mode: 'base',
      libelle: 'enregistré dans ton espace',
      charger: function (numero) {
        return window.Progression.lire(DOMAINE, cleFiche(numero))
          .then(function (v) {
            etats[numero] = {
              champs: (v && v.champs) || {},
              fait  : !!(v && v.fait)
            };
            return etats[numero];
          });
      },
      valeur: function (dataCle, numero) {
        var c = etat(numero).champs;
        return Object.prototype.hasOwnProperty.call(c, dataCle) ? c[dataCle] : null;
      },
      poser: function (numero, dataCle, valeur) {
        etat(numero).champs[dataCle] = valeur;
        return pousser(numero);
      },
      marquer: function (numero, fait) {
        etat(numero).fait = fait;
        return pousser(numero);
      },
      marque: function (numero) { return etat(numero).fait; },
      faits: function () {
        return window.Progression.lireTout(DOMAINE).then(function (tout) {
          var s = {};
          Object.keys(tout || {}).forEach(function (cle) {
            var m = /^cfa-o(\d\d)$/.exec(cle);
            if (m && tout[cle] && tout[cle].fait) { s[m[1]] = true; }
          });
          return s;
        });
      }
    };
  }

  /* ---- Choix du régime, une fois pour toutes au chargement ---- */
  function choisirDepot() {
    if (!window.Progression || !window.Progression.disponible()) {
      return Promise.resolve(depotAppareil);
    }
    return window.Progression.session()
      .then(function (profil) { return profil ? creerDepotBase() : depotAppareil; })
      .catch(function () { return depotAppareil; });
  }


  /* ==========================================================
     LA REPRISE DU TRAVAIL FAIT SANS COMPTE
     ==========================================================
     Un apprenti travaille trois fiches en invité, puis se crée un
     compte. Sans cette étape, il ouvre son espace et le trouve vide :
     la seule chose que le compte devait lui apporter — ne rien
     perdre — est précisément ce qu'il perd.

     Règle de fusion : la base gagne toujours. On ne remonte qu'un
     champ absent de la base, jamais un champ qui y existe déjà — un
     travail repris et corrigé en ligne ne doit pas être écrasé par
     une vieille copie restée dans un navigateur.

     Les clés locales reprises sont ensuite effacées : la doctrine du
     dispositif est qu'un élève connecté n'a rien en localStorage
     hors son jeton de session.
     ---------------------------------------------------------- */
  function reprendreTravailLocal(depot) {
    if (depot.mode !== 'base') { return Promise.resolve(); }

    var cles = clesLocales();
    if (!cles.length) { return Promise.resolve(); }

    // Regroupe les clés locales par fiche : cfa-o03-p1-t2 → 03
    var parFiche = {};
    cles.forEach(function (cleComplete) {
      var brut = cleComplete.slice(PREFIXE.length);      // o03-p1-t2  |  o03
      var m = /^o(\d\d)/.exec(brut);
      if (!m) { return; }
      var num = m[1];
      if (!parFiche[num]) { parFiche[num] = []; }
      parFiche[num].push({ cle: cleComplete, champ: brut });
    });

    var numeros = Object.keys(parFiche);
    if (!numeros.length) { return Promise.resolve(); }

    return numeros.reduce(function (chaine, num) {
      return chaine.then(function () {
        return window.Progression.lire(DOMAINE, cleFiche(num)).then(function (v) {
          var champs = (v && v.champs) || {};
          var fait   = !!(v && v.fait);
          var change = false;

          parFiche[num].forEach(function (item) {
            var valeur = lireLocal(item.cle);
            if (valeur === null) { return; }
            if (item.champ === 'o' + num) {              // le marqueur de fiche
              if (!fait && valeur === '1') { fait = true; change = true; }
            } else if (!Object.prototype.hasOwnProperty.call(champs, item.champ)) {
              champs[item.champ] = valeur; change = true;
            }
          });

          var suite = change
            ? window.Progression.ecrire(DOMAINE, cleFiche(num), { v: 1, champs: champs, fait: fait })
            : Promise.resolve();

          return suite.then(function () {
            parFiche[num].forEach(function (item) { ecrireLocal(item.cle, ''); });
          });
        });
      });
    }, Promise.resolve()).catch(function () {
      /* Base injoignable au mauvais moment : on ne touche à rien.
         Les clés locales restent en place et la reprise se rejouera
         au prochain chargement. */
    });
  }


  /* ----------------------------------------------------------
     1. La barre de symboles
     ----------------------------------------------------------
     Les symboles retenus sont ceux qu'un élève a réellement à écrire
     dans une ligne de calcul. Pas de fraction empilée, pas d'intégrale :
     la rédaction attendue par les quatre règles est linéaire.

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
    { s: 'Ø', nom: 'diamètre' }
  ];

  function inserer(champ, texte) {
    var debut = champ.selectionStart, fin = champ.selectionEnd;
    var avant = champ.value.slice(0, debut), apres = champ.value.slice(fin);
    champ.value = avant + texte + apres;
    champ.selectionStart = champ.selectionEnd = debut + texte.length;
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

     L'écriture est différée après la dernière frappe : sans cela, on
     écrirait à chaque caractère — et, en régime connecté, on
     enverrait une requête à chaque caractère.
     ---------------------------------------------------------- */
  var ATTENTE = { appareil: 400, base: 900 };

  function poserMemoire(champ, depot, numero) {
    var dataCle = champ.dataset.cle;
    var minuteur = null;

    var garde = depot.valeur(dataCle, numero);
    if (garde !== null && garde !== undefined) { champ.value = garde; }

    var temoin = document.createElement('span');
    temoin.className = 'temoin-enregistre';
    temoin.setAttribute('aria-live', 'polite');
    champ.insertAdjacentElement('afterend', temoin);

    function montrer(texte, enErreur) {
      temoin.textContent = texte;
      temoin.classList.toggle('erreur', !!enErreur);
      temoin.classList.add('visible');
      if (!enErreur) {
        setTimeout(function () { temoin.classList.remove('visible'); }, 1800);
      }
    }

    champ.addEventListener('input', function () {
      if (minuteur) { clearTimeout(minuteur); }
      minuteur = setTimeout(function () {
        depot.poser(numero, dataCle, champ.value)
          .then(function () { montrer(depot.libelle, false); })
          .catch(function () {
            montrer('pas enregistré — vérifie ta connexion', true);
          });
      }, ATTENTE[depot.mode]);
    });
  }

  /* Les cases à cocher d'un exercice. Même mécanique, valeur "1" ou
     rien — c'est aussi le format qu'avaient les clés locales, ce qui
     rend la reprise du travail fait sans compte immédiate. */
  function poserCase(champ, depot, numero) {
    var dataCle = champ.dataset.cle;
    champ.checked = depot.valeur(dataCle, numero) === '1';
    champ.addEventListener('change', function () {
      depot.poser(numero, dataCle, champ.checked ? '1' : '');
    });
  }


  /* ----------------------------------------------------------
     3. Le marqueur de complétion
     ----------------------------------------------------------
     Un booléen par outil. C'est lui que compte l'index du livret
     pour afficher « N outils sur 17 travaillés ».
     ---------------------------------------------------------- */
  function poserMarqueur(depot, numero) {
    var marqueur = document.getElementById('fait');
    if (!marqueur) { return; }

    marqueur.checked = depot.marque(numero);
    marqueur.addEventListener('change', function () {
      depot.marquer(numero, marqueur.checked);
    });
  }


  /* ----------------------------------------------------------
     4. Le compteur de l'index
     ----------------------------------------------------------
     « 7 outils sur 17 travaillés ». Ce compteur produit plus d'effet
     chez ce public qu'une note, et il ne coûte rien à la souveraineté
     du professeur sur l'évaluation : il dit ce qui a été parcouru,
     jamais ce qui a été réussi. Un élève ne peut pas y échouer.

     Le décompte se refait à chaque affichage de la page, y compris au
     retour par le bouton « précédent » du navigateur — d'où l'écoute
     de pageshow, que le seul DOMContentLoaded manquerait.
     ---------------------------------------------------------- */
  function majCompteur(depot) {
    var zone = document.getElementById('compteur');
    if (!zone) { return Promise.resolve(); }

    return depot.faits().then(function (faits) {
      var n = Object.keys(faits).length;

      var nombre = zone.querySelector('.compteur-nombre');
      var texte  = zone.querySelector('.compteur-texte');
      if (nombre) { nombre.textContent = n; }
      if (texte) {
        texte.textContent = n <= 1
          ? 'outil sur ' + TOTAL_OUTILS + ' travaillé'
          : 'outils sur ' + TOTAL_OUTILS + ' travaillés';
      }

      var jauge = zone.querySelector('.jauge-fait');
      if (jauge) { jauge.style.width = (n / TOTAL_OUTILS * 100) + '%'; }

      var entrees = document.querySelectorAll('.outil[data-outil]');
      Array.prototype.forEach.call(entrees, function (entree) {
        entree.classList.toggle('fait', !!faits[entree.dataset.outil]);
      });
    });
  }


  /* ----------------------------------------------------------
     5. La mention de bas de fiche
     ----------------------------------------------------------
     Elle dit où va le travail, et elle doit donc changer avec le
     régime. Le HTML porte la version « sans compte » — c'est celle
     qui est vraie tant que rien n'est connecté, et c'est aussi celle
     que lit un élève dont le JavaScript ne tourne pas.
     ---------------------------------------------------------- */
  function majMention(depot) {
    var zone = document.querySelector('[data-mention-donnees]');
    if (!zone || depot.mode !== 'base') { return; }
    zone.textContent = 'Tu es connecté : ce que tu écris est enregistré dans '
      + 'ton espace et te suivra sur tous tes appareils. Ton professeur voit '
      + 'quelles fiches tu as travaillées, pas ce que tu as écrit dedans.';
  }


  /* ----------------------------------------------------------
     Mise en route
     ---------------------------------------------------------- */
  function numeroDeLaFiche() {
    var marqueur = document.getElementById('fait');
    return marqueur ? marqueur.dataset.outil : null;
  }

  function demarrer() {
    // La barre de symboles ne dépend d'aucun stockage : on la pose
    // tout de suite, sans attendre le réseau. Un élève doit pouvoir
    // écrire avant que la session soit résolue.
    var zones = document.querySelectorAll('textarea[data-cle]');
    Array.prototype.forEach.call(zones, poserBarre);

    choisirDepot().then(function (depot) {
      majMention(depot);

      return reprendreTravailLocal(depot).then(function () {
        var numero = numeroDeLaFiche();

        var pret = (depot.mode === 'base' && numero)
          ? depot.charger(numero)
          : Promise.resolve();

        return pret.then(function () {
          if (numero) {
            Array.prototype.forEach.call(zones, function (champ) {
              poserMemoire(champ, depot, numero);
            });
            var trous = document.querySelectorAll('input.trou[data-cle]');
            Array.prototype.forEach.call(trous, function (champ) {
              poserMemoire(champ, depot, numero);
            });
            var cases = document.querySelectorAll('input[type="checkbox"][data-cle]');
            Array.prototype.forEach.call(cases, function (champ) {
              poserCase(champ, depot, numero);
            });
            poserMarqueur(depot, numero);
          }
          return majCompteur(depot);
        });
      });
    }).catch(function (e) {
      if (window.console) { console.warn('[cfa-livret]', e); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }

  // Retour à l'index par le bouton « précédent » : la page peut être
  // restituée depuis le cache sans rejouer DOMContentLoaded. Sans cela,
  // l'élève qui vient de cocher une fiche retrouverait l'ancien compte.
  window.addEventListener('pageshow', function (ev) {
    if (!ev.persisted) { return; }
    choisirDepot().then(majCompteur);
  });
})();
