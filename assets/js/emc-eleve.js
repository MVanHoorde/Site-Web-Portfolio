/* ============================================================
 *  emc-eleve.js — la page élève de la séance EMC (emc/index.html)
 *
 *  Porte d'entrée (créer son compte / se connecter, avec le code
 *  EMC écrit au tableau) → emc_entrer() → la table → l'étape que
 *  l'enseignant a ouverte, et elle seule. Architecture :
 *  _suivi/AUDIT-EMC.md. Base : bdd/schema/031-emc.sql.
 *
 *  Règles tenues ici :
 *  · identifiants seulement : on ne demande ni nom ni prénom ;
 *  · les écritures passent par la file d'attente (EMC.file) : une
 *    coupure de réseau ne perd rien ;
 *  · 🔴 « J'ai besoin d'en parler » ne passe JAMAIS par la file ni
 *    par le localStorage : il s'envoie tout de suite, et en cas de
 *    panne on réessaie en mémoire seulement.
 * ============================================================ */
(function () {
  'use strict';

  var el = EMC.el;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* Ce que la page sait de l'élève et de sa séance. */
  var S = {
    classe: null, libelle: '', table: null, eleveId: null, pseudo: '', auteur: null,
    pret: false, seance: null, contenus: null, file: null,
    etapeAffichee: null, nettoyer: []      // fonctions à appeler en quittant l'étape
  };

  /* Les numéros, tant que les contenus ne sont pas lus (avant la
     connexion) : emc-commun.js. */
  var NUMEROS_DEFAUT = EMC.NUMEROS_DEFAUT;

  /* Messages de progression.js (MSG_ERREUR), plus ceux de l'EMC. */
  var MESSAGES_COMPTE = {
    IDENTIFIANT_INVALIDE: 'Identifiant : seulement des minuscules, des chiffres et des tirets (3 à 32 caractères).',
    IDENTIFIANT_REFUSE: 'Cet identifiant n\'est pas accepté. Essaie sans tiret au début ni à la fin.',
    MOT_DE_PASSE_TROP_COURT: 'Mot de passe : 6 caractères minimum, dont une majuscule et un chiffre.',
    MOT_DE_PASSE_FAIBLE: 'Mot de passe : il faut au moins une majuscule et un chiffre. Exemple : Atelier7.',
    IDENTIFIANT_DEJA_PRIS: 'Cet identifiant est déjà pris. Choisis-en un autre — ou passe par « J\'ai déjà un compte » si c\'est le tien.',
    IDENTIFIANTS_INCORRECTS: 'Identifiant ou mot de passe incorrect.',
    TROP_DE_TENTATIVES: 'Trop d\'essais en peu de temps. Attends une minute et recommence.',
    CODE_CLASSE_INCONNU: 'Ce code ne correspond à aucune séance. Vérifie le code écrit au tableau.',
    PSEUDO_DEJA_PRIS: 'Cet identifiant est déjà utilisé dans cette séance.'
  };
  function messageCompte(e) {
    var m = (e && (e.code || e.message)) || '';
    for (var k in MESSAGES_COMPTE) if (m.indexOf(k) >= 0) return MESSAGES_COMPTE[k];
    return EMC.message(e);
  }

  function stocker(cle, v) { try { if (v == null) localStorage.removeItem(cle); else localStorage.setItem(cle, v); } catch (e) {} }
  function relire(cle) { try { return localStorage.getItem(cle); } catch (e) { return null; } }

  /* Le « sub » du jeton élève : c'est l'auteur d'un élément de carte
     (la policy exige auteur = auth.uid()). */
  function subDuJeton() {
    try {
      var v = JSON.parse(localStorage.getItem('snt.session'));
      var p = v.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (p.length % 4) p += '=';
      return JSON.parse(decodeURIComponent(escape(atob(p)))).sub || null;
    } catch (e) { return null; }
  }

  function contenu(cle) { return (S.contenus && S.contenus[cle]) || null; }
  function titreEtape(n) {
    var l = contenu('etapes') || [];
    for (var i = 0; i < l.length; i++) if (l[i].n === n) return l[i].titre;
    return 'Étape ' + n;
  }
  function mission() { var m = contenu('missions') || []; return m[S.table - 1] || null; }

  /* ----------------------------------------------------------
   *  1. Bandeau du bas : numéros d'urgence + « J'ai besoin d'en parler »
   * ---------------------------------------------------------- */
  function rendreNumeros() {
    var l = contenu('numeros') || NUMEROS_DEFAUT, box = $('#numeros');
    box.innerHTML = '';
    l.forEach(function (n) { box.appendChild(el('span', null, n.icone ? el('span', { 'aria-hidden': 'true' }, n.icone + ' ') : null, el('b', null, n.numero), ' ' + n.sens)); });
  }

  /* L'envoi d'aide en cours, en mémoire seulement. */
  var aideEnAttente = null;

  function ouvrirAide() {
    /* Pas encore entré dans la séance : rien ne peut partir (le message
       est rattaché à l'identifiant). On dit quoi faire, sans détour. */
    if (!S.classe || !S.eleveId) {
      var f0 = el('button', { type: 'button', class: 'primaire' }, 'J\'ai compris');
      var fond0 = el('div', { class: 'modale-fond' },
        el('div', { class: 'modale', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'aide-titre0' },
          el('h2', { id: 'aide-titre0' }, '💬 J\'ai besoin d\'en parler'),
          el('p', null, 'Pour envoyer un message, connecte-toi d\'abord (en haut de la page).'),
          el('p', null, el('b', null, 'Si c\'est urgent, lève la main ou va voir M. Van Hoorde ou Mme Castel tout de suite.')),
          el('div', { class: 'rangee' }, f0)));
      f0.addEventListener('click', function () { fond0.remove(); $('#btn-aide').focus(); });
      document.body.appendChild(fond0); f0.focus();
      return;
    }
    var a = contenu('aide') || {
      titre: 'J\'ai besoin d\'en parler',
      avertissement: 'Ce message n\'est pas anonyme : il sera lu par M. Van Hoorde et Mme Castel pour pouvoir venir te voir.',
      cases: ['Cette activité me met mal à l\'aise', 'Je me sens concerné·e', 'J\'aimerais parler à un adulte']
    };
    var etat = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var cases = a.cases.map(function (c) {
      return el('label', { class: 'case' }, el('input', { type: 'checkbox', value: c }), c);
    });
    var msg = el('textarea', { id: 'aide-message', maxlength: '1000', placeholder: 'Ton message (facultatif)' });
    var envoyer = el('button', { type: 'button', class: 'primaire' }, 'Envoyer');
    var fermer = el('button', { type: 'button' }, 'Fermer');
    var modale = el('div', { class: 'modale', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'aide-titre' },
      el('h2', { id: 'aide-titre' }, '💬 ' + a.titre),
      el('div', { class: 'encadre orange' }, el('b', null, a.avertissement)),
      el('div', null, cases),
      el('label', { for: 'aide-message' }, 'Si tu veux, écris quelques mots'),
      msg,
      etat,
      el('div', { class: 'rangee' }, envoyer, fermer));
    var fond = el('div', { class: 'modale-fond' }, modale);
    function clore() { fond.remove(); $('#btn-aide').focus(); }
    fermer.addEventListener('click', clore);
    fond.addEventListener('click', function (e) { if (e.target === fond) clore(); });
    fond.addEventListener('keydown', function (e) { if (e.key === 'Escape') clore(); });

    if (aideEnAttente) {
      etat.className = 'etat-envoi att';
      etat.textContent = 'Ton message précédent n\'est pas encore parti : on réessaie. Lève la main si c\'est urgent.';
    }

    envoyer.addEventListener('click', function () {
      var choisies = cases.map(function (l) { return l.firstChild; }).filter(function (i) { return i.checked; })
        .map(function (i) { return i.value; });
      var texte = msg.value.trim().slice(0, 1000);
      if (!choisies.length && !texte) {
        etat.className = 'etat-envoi err';
        etat.textContent = 'Coche une case ou écris un message.';
        return;
      }
      envoyer.disabled = true;
      etat.className = 'etat-envoi att'; etat.textContent = 'Envoi…';
      envoyerAide({ classe_id: S.classe, eleve_id: S.eleveId, cases: choisies, message: texte || null }, function (statut, info) {
        if (!document.body.contains(etat)) return;
        if (statut === 'ok') {
          etat.className = 'etat-envoi ok';
          etat.textContent = 'Message envoyé. Un adulte va venir te voir.';
          cases.forEach(function (l) { l.firstChild.checked = false; });
          msg.value = '';
          envoyer.disabled = false;
        } else if (statut === 'attente') {
          etat.className = 'etat-envoi att';
          etat.textContent = 'Pas encore envoyé (pas de réseau) : on réessaie toutes les 5 secondes. Lève la main si c\'est urgent.';
        } else {
          etat.className = 'etat-envoi err';
          etat.textContent = info;
          envoyer.disabled = false;
        }
      });
    });
    document.body.appendChild(fond);
    (cases[0] ? cases[0].firstChild : msg).focus();
  }

  /* Envoi direct, réessai en mémoire toutes les 5 s si le réseau manque.
     🔴 Rien n'est écrit sur la tablette. */
  function envoyerAide(corps, rappel) {
    aideEnAttente = { corps: corps, rappel: rappel };
    function tenter() {
      if (!aideEnAttente) return;
      var a = aideEnAttente;
      EMC.ecrire('emc_aide', a.corps).then(function () {
        if (aideEnAttente === a) aideEnAttente = null;
        a.rappel('ok');
      }, function (e) {
        if (EMC.horsLigne(e)) {
          a.rappel('attente');
          setTimeout(tenter, 5000);
        } else {
          if (aideEnAttente === a) aideEnAttente = null;
          a.rappel('err', EMC.message(e) + ' Lève la main : un adulte va venir.');
        }
      });
    }
    tenter();
  }

  /* ----------------------------------------------------------
   *  2. Porte d'entrée
   * ---------------------------------------------------------- */
  /* dejaConnecte : le pseudo du compte déjà ouvert sur la tablette
     (ou null). La porte propose TOUJOURS de créer un compte ou de se
     connecter ; un compte déjà ouvert est proposé en plus, jamais
     imposé : une tablette peut garder le compte d'un autre. */
  function porte(dejaConnecte, messageDepart) {
    var main = $('#principal');
    main.innerHTML = '';
    $('#btn-aide').hidden = true;
    var mode = 'creer';
    var alerte = el('div', { class: 'alerte err', role: 'alert' });
    var cadre = el('div', { class: 'carte-blanche porte' });
    main.appendChild(cadre);
    var codeDepart = (EMC.parametre('code') || relire('emc.code') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

    function montrerErreur(t) { alerte.textContent = t; alerte.classList.add('show'); }

    function rendre() {
      cadre.innerHTML = '';
      alerte.classList.remove('show');
      cadre.appendChild(el('h1', null, 'Bienvenue 👋'));
      cadre.appendChild(el('p', { class: 'muet' }, 'Séance d\'EMC autour du jeu ', el('i', null, 'Le Labyrinthe de Nina'), '.'));

      var code = el('input', { type: 'text', id: 'p-code', class: 'code', maxlength: '6', autocomplete: 'off',
        autocapitalize: 'characters', spellcheck: 'false', inputmode: 'text', value: codeDepart });
      code.addEventListener('input', function () { code.value = code.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); codeDepart = code.value; });

      if (dejaConnecte) {
        var go = el('button', { type: 'button', class: 'primaire', style: 'width:100%;margin-top:.5rem' }, 'Continuer avec ce compte');
        cadre.appendChild(el('div', { class: 'encadre deja' },
          el('p', { style: 'margin:0' }, 'Cette tablette est déjà connectée au compte ', el('b', null, dejaConnecte), '.'),
          el('p', { class: 'tresmuet', style: 'margin:.2rem 0 0' }, 'Si ce n\'est pas le tien, choisis plus bas « Je crée mon compte » ou « J\'ai déjà un compte ».'),
          go));
        go.addEventListener('click', function () {
          var c = code.value.trim();
          if (c.length !== 6) { montrerErreur('Écris d\'abord le code de la séance (6 caractères, au tableau).'); code.focus(); return; }
          go.disabled = true;
          entrer(c).catch(function (e) { go.disabled = false; montrerErreur(messageCompte(e)); });
        });
      }

      var bCreer = el('button', { type: 'button', class: mode === 'creer' ? 'actif' : '' }, 'Je crée mon compte');
      var bCo = el('button', { type: 'button', class: mode === 'connecter' ? 'actif' : '' }, 'J\'ai déjà un compte');
      bCreer.addEventListener('click', function () { mode = 'creer'; rendre(); });
      bCo.addEventListener('click', function () { mode = 'connecter'; rendre(); });
      cadre.appendChild(el('div', { class: 'choix', role: 'group', 'aria-label': 'Compte' }, bCreer, bCo));

      var ident = el('input', { type: 'text', id: 'p-id', autocomplete: 'username', autocapitalize: 'none',
        spellcheck: 'false', maxlength: '32' });
      var mdp = el('input', { type: 'password', id: 'p-mdp', autocomplete: mode === 'creer' ? 'new-password' : 'current-password' });
      var mdp2 = el('input', { type: 'password', id: 'p-mdp2', autocomplete: 'new-password' });

      cadre.appendChild(el('label', { for: 'p-id' }, 'Identifiant'));
      cadre.appendChild(ident);
      if (mode === 'creer') {
        cadre.appendChild(el('p', { class: 'regle' }, 'Minuscules, chiffres et tirets, 3 à 32 caractères. Pas ton nom : un identifiant inventé (ex. ', el('i', null, 'renard-bleu-27'), ').'));
      }
      cadre.appendChild(el('label', { for: 'p-mdp' }, 'Mot de passe'));
      cadre.appendChild(mdp);
      if (mode === 'creer') {
        cadre.appendChild(el('p', { class: 'regle' }, 'Au moins 6 caractères, dont une majuscule et un chiffre.'));
        cadre.appendChild(el('label', { for: 'p-mdp2' }, 'Mot de passe, encore une fois'));
        cadre.appendChild(mdp2);
      }
      cadre.appendChild(el('label', { for: 'p-code' }, 'Code de la séance (écrit au tableau)'));
      cadre.appendChild(code);
      cadre.appendChild(el('div', { class: 'encadre orange' },
        el('b', null, '✍️ Note ton identifiant sur la feuille qui circule'), ' (avec ton nom et ton prénom : c\'est la seule trace de ton nom, et elle reste sur papier).'));
      cadre.appendChild(alerte);
      var valider = el('button', { type: 'button', class: 'primaire', style: 'width:100%' },
        mode === 'creer' ? 'Créer mon compte et rejoindre' : 'Me connecter et rejoindre');
      cadre.appendChild(valider);

      valider.addEventListener('click', function () {
        alerte.classList.remove('show');
        var c = code.value.trim();
        if (!ident.value.trim()) { montrerErreur('Écris ton identifiant.'); ident.focus(); return; }
        if (!mdp.value) { montrerErreur('Écris ton mot de passe.'); mdp.focus(); return; }
        if (mode === 'creer' && mdp.value !== mdp2.value) { montrerErreur('Les deux mots de passe ne sont pas identiques.'); mdp2.focus(); return; }
        if (c.length !== 6) { montrerErreur('Le code fait 6 caractères : regarde au tableau.'); code.focus(); return; }
        valider.disabled = true; valider.textContent = 'Un instant…';
        /* un autre compte était ouvert : on le ferme d'abord */
        var p = (dejaConnecte ? Progression.quitter() : Promise.resolve()).then(function () {
          return mode === 'creer'
            ? Progression.creerCompte(ident.value, mdp.value, c)
            : Progression.seConnecter(ident.value, mdp.value);
        });
        p.then(function () { dejaConnecte = null; return entrer(c); }).catch(function (e) {
          valider.disabled = false;
          valider.textContent = mode === 'creer' ? 'Créer mon compte et rejoindre' : 'Me connecter et rejoindre';
          montrerErreur(messageCompte(e));
        });
      });
      if (messageDepart) montrerErreur(messageDepart);
    }
    rendre();
  }

  /* ----------------------------------------------------------
   *  3. Entrer dans la séance
   * ---------------------------------------------------------- */
  function entrer(code) {
    return EMC.rpc('emc_entrer', { p_code: code || null }).then(function (j) {
      if (code) stocker('emc.code', code.toUpperCase());
      S.classe = j.classe_id; S.libelle = j.libelle; S.table = j.table_num;
      S.auteur = subDuJeton();
      return Promise.all([
        EMC.lire('emc_participants?select=eleve_id,table_num,pret&classe_id=eq.' + S.classe),
        EMC.contenus(),
        Progression.session()
      ]);
    }).then(function (r) {
      var moi = r[0] && r[0][0];
      if (!moi) throw new Error('PAS_DANS_LA_SEANCE');
      S.eleveId = moi.eleve_id; S.table = moi.table_num; S.pret = !!moi.pret;
      S.contenus = r[1];
      S.pseudo = (r[2] && r[2].pseudo) || '';
      S.file = EMC.file(S.classe + '.' + S.eleveId);
      S.file.surRefus(function (e) { toast(EMC.message(e), 'err'); });
      demarrerSeance();
    });
  }

  function demarrerSeance() {
    rendreBarre();
    rendreNumeros();
    $('#btn-aide').hidden = false;
    $('#principal').innerHTML = '';
    $('#principal').appendChild(el('div', { id: 'scene' }));

    /* l'étape en cours : direct + relecture de secours */
    EMC.ecouter('emc_seances', 'classe_id=eq.' + S.classe, function (ligne) {
      if (ligne && ligne.classe_id === S.classe) recevoirSeance(ligne);
    }, function () {
      EMC.lire('emc_seances?select=*&classe_id=eq.' + S.classe).then(function (l) {
        if (l && l[0]) recevoirSeance(l[0]);
      }, function () {});
    });
    /* la table a pu être réattribuée par l'enseignant */
    setInterval(function () {
      if (document.hidden) return;
      EMC.lire('emc_participants?select=table_num,pret&classe_id=eq.' + S.classe).then(function (l) {
        if (!l || !l[0]) return;
        var changeTable = l[0].table_num !== S.table;
        S.table = l[0].table_num; S.pret = !!l[0].pret;
        rendreBarre();
        if (changeTable) { toast('L\'enseignant t\'a placé·e à la table ' + S.table + '.', 'ok'); S.etapeAffichee = null; rendreEtape(); }
      }, function () {});
    }, 20000);

    document.addEventListener('emc:contenus', function () {
      rendreNumeros();
      if (S.seance && [0, 2, 5].indexOf(S.seance.etape) >= 0) { S.etapeAffichee = null; rendreEtape(); }
    });
  }

  /* ----------------------------------------------------------
   *  4. Barre du haut
   * ---------------------------------------------------------- */
  var etatDirect = { direct: ['ok', 'en direct'], relecture: ['att', 'relecture'], 'hors-ligne': ['err', 'hors ligne'] };
  function rendreBarre() {
    var b = $('#barre');
    b.innerHTML = '';
    var d = etatDirect[EMC.etatDirect()] || etatDirect.relecture;
    var attente = S.file ? S.file.enAttente() : 0;
    var pret = boutonPret();
    var sortir = el('button', { type: 'button', class: 'lien' }, 'Se déconnecter');
    sortir.addEventListener('click', function () {
      if (S.file && S.file.enAttente() && !confirm('Des envois attendent encore le réseau. Se déconnecter quand même ? Ils seront envoyés à ta prochaine connexion sur cette tablette.')) return;
      Progression.quitter().then(function () { location.reload(); });
    });
    b.appendChild(el('div', { class: 'entete-eleve' },
      el('span', { class: 'pastille table grande-table' }, 'TABLE ' + S.table),
      pret,
      el('span', null, el('span', { class: 'seance' }, S.libelle), el('br'), el('span', { class: 'qui' }, S.pseudo))));
    b.appendChild(el('span', { class: 'espace' }));
    b.appendChild(el('span', { class: 'pastille direct-etat ' + d[0], id: 'etat-direct', title: 'Liaison avec la classe' }, d[1]));
    if (attente) b.appendChild(el('span', { class: 'pastille att', id: 'etat-file' }, '⏳ ' + attente + ' envoi' + (attente > 1 ? 's' : '') + ' en attente'));
    b.appendChild(sortir);
  }
  function boutonPret(geant) {
    var p = el('button', { type: 'button', class: (S.pret ? 'pret-oui' : 'pret-non') + (geant ? ' pret-geant' : ' pret-grand'),
      'aria-pressed': S.pret ? 'true' : 'false' }, S.pret ? '✅ Je suis prêt·e' : '✋ Je suis prêt·e');
    p.addEventListener('click', basculerPret);
    return p;
  }
  document.addEventListener('emc:direct', function () { if (S.classe) rendreBarre(); });
  document.addEventListener('emc:file', function () { if (S.classe) rendreBarre(); });

  function basculerPret() {
    var voulu = !S.pret;
    EMC.rpc('emc_pret', { p_classe: S.classe, p_pret: voulu }).then(function () {
      S.pret = voulu; rendreBarre();
      if (S.seance && S.seance.etape === 0) { S.etapeAffichee = null; rendreEtape(); }
    }, function (e) { toast(EMC.message(e), 'err'); });
  }

  /* Petit message qui s'efface. */
  function toast(t, genre) {
    var n = el('div', { class: 'alerte show ' + (genre || 'ok'), role: 'status',
      style: 'position:fixed;left:50%;transform:translateX(-50%);top:4.5rem;z-index:60;max-width:90vw;box-shadow:var(--ombre)' }, t);
    document.body.appendChild(n);
    setTimeout(function () { n.remove(); }, 4500);
  }

  /* ----------------------------------------------------------
   *  5. Les étapes
   * ---------------------------------------------------------- */
  function recevoirSeance(ligne) {
    var avant = S.seance;
    S.seance = ligne;
    if (!avant || avant.etape !== ligne.etape || !!avant.cloturee_le !== !!ligne.cloturee_le) { rendreEtape(); return; }
    /* même étape : seules les mises à jour partielles */
    if (ligne.etape === 4 && majCarteEtat) majCarteEtat();
    if (ligne.etape === 6 && (avant.situation_courante !== ligne.situation_courante || avant.situation_revelee !== ligne.situation_revelee)) {
      S.etapeAffichee = null; rendreEtape();
    }
  }

  function quitterEtape() {
    S.nettoyer.forEach(function (f) { try { f(); } catch (e) {} });
    S.nettoyer = [];
    majCarteEtat = null;
    document.body.classList.remove('carte-plein');
  }

  function rendreEtape() {
    if (!S.seance) return;
    var cle = S.seance.cloturee_le ? 'fin' : S.seance.etape + (S.seance.etape === 6 ? ':' + S.seance.situation_courante + ':' + S.seance.situation_revelee : '');
    if (S.etapeAffichee === cle) return;
    S.etapeAffichee = cle;
    quitterEtape();
    var scene = $('#scene');
    var neuf = el('div', { id: 'scene' });
    scene.replaceWith(neuf);
    if (S.seance.cloturee_le) { etapeFin(neuf); return; }
    var n = S.seance.etape;
    neuf.appendChild(el('div', { class: 'etape-titre' },
      el('span', { class: 'num' }, 'Étape ' + n), el('h1', null, titreEtape(n))));
    try {
      [etape0, etape1, etape2, etape3, etape4, etape5, etape6, etape7][n](neuf);
    } catch (e) {
      neuf.appendChild(el('div', { class: 'encadre err' }, 'Cette étape n\'a pas pu s\'afficher. Recharge la page ; si ça continue, lève la main.'));
      if (window.console) console.error(e);
    }
  }

  function bloc() { return el('div', { class: 'carte-blanche' }); }

  /* 0 — Installation */
  function etape0(s) {
    var b = bloc();
    b.appendChild(el('div', { class: 'table-geante' },
      el('div', { class: 'muet' }, 'Tu es à la'), el('div', { class: 'n' }, 'TABLE ' + S.table),
      el('div', { class: 'tresmuet' }, 'Cette table te suit : si tu te reconnectes, tu la retrouves.')));
    s.appendChild(b);
    var c = bloc();
    c.appendChild(el('h2', null, 'Pour commencer'));
    c.appendChild(el('ol', null,
      el('li', null, 'Installe le jeu ', el('b', null, el('i', null, 'Le Labyrinthe de Nina')), ' (application de la MAE et d\'e-Enfance / 3018) sur ta tablette, si ce n\'est pas déjà fait. Ne le lance pas encore.'),
      el('li', null, 'Garde cette page ouverte : c\'est elle qui te guidera pendant la séance.'),
      el('li', null, 'Quand tout est prêt, touche ', el('b', null, '✋ Je suis prêt·e'), ' ci-dessous (ou en haut, à côté de ta table).')));
    c.appendChild(boutonPret(true));
    c.appendChild(el('p', { class: 'etat-envoi ' + (S.pret ? 'ok' : 'att') }, S.pret ? '✅ Tu es prêt·e. Attends la suite.' : 'Pas encore prêt·e.'));
    s.appendChild(c);
  }

  /* 1 — Nuage de mots et météo des émotions */
  function etape1(s) {
    var c = contenu('mots') || { question_mots: 'Quels mots te viennent ?', emojis: [] };
    var b = bloc();
    b.appendChild(el('h2', null, c.question_mots));
    b.appendChild(el('p', { class: 'muet' }, c.aide_mots || '1 à 3 mots'));
    var champs = [0, 1, 2].map(function (i) {
      return el('input', { type: 'text', maxlength: '40', 'aria-label': 'Mot ' + (i + 1), placeholder: 'Mot ' + (i + 1) + (i ? ' (facultatif)' : '') });
    });
    b.appendChild(el('div', { class: 'mots' }, champs));
    b.appendChild(el('h2', { style: 'margin-top:1.2rem' }, c.question_emojis));
    b.appendChild(el('p', { class: 'muet' }, c.aide_emojis || '1 ou 2 émojis'));
    var choisis = [];
    var grille = el('div', { class: 'emojis', role: 'group', 'aria-label': 'Émotions' });
    var boutons = (c.emojis || []).map(function (x) {
      var btn = el('button', { type: 'button', 'aria-pressed': 'false' }, el('span', { class: 'e', 'aria-hidden': 'true' }, x.e), x.l);
      btn.addEventListener('click', function () {
        var i = choisis.indexOf(x.e);
        if (i >= 0) choisis.splice(i, 1);
        else { if (choisis.length >= 2) choisis.shift(); choisis.push(x.e); }
        majBoutons();
      });
      btn.dataset.e = x.e;
      return btn;
    });
    function majBoutons() { boutons.forEach(function (bt) { bt.setAttribute('aria-pressed', choisis.indexOf(bt.dataset.e) >= 0 ? 'true' : 'false'); }); }
    boutons.forEach(function (bt) { grille.appendChild(bt); });
    b.appendChild(grille);
    var etat = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var envoyer = el('button', { type: 'button', class: 'primaire', style: 'margin-top:1rem' }, 'Envoyer');
    b.appendChild(envoyer); b.appendChild(etat);
    s.appendChild(b);

    /* Le brouillon de la tablette (rien n'est perdu si l'étape change
       avant l'envoi), puis ce qui a déjà été envoyé. */
    var cleBrouillon = 'emc.mots.' + S.classe;
    function garderBrouillon() {
      stocker(cleBrouillon, JSON.stringify({ mots: champs.map(function (x) { return x.value; }), emojis: choisis }));
    }
    try {
      var br = JSON.parse(relire(cleBrouillon) || 'null');
      if (br) {
        (br.mots || []).forEach(function (m, i) { if (champs[i]) champs[i].value = m || ''; });
        choisis = (br.emojis || []).slice(0, 2); majBoutons();
      }
    } catch (e) {}
    champs.forEach(function (x) { x.addEventListener('input', garderBrouillon); });
    grille.addEventListener('click', function () { setTimeout(garderBrouillon, 0); });
    EMC.lire('emc_mots?select=mots,emojis&classe_id=eq.' + S.classe).then(function (l) {
      if (!l || !l[0]) return;
      if (relire(cleBrouillon)) { etat.className = 'etat-envoi ok'; etat.textContent = '✓ Déjà envoyé. Tu peux encore modifier.'; return; }
      (l[0].mots || []).forEach(function (m, i) { if (champs[i] && !champs[i].value) champs[i].value = m; });
      choisis = (l[0].emojis || []).slice(0, 2); majBoutons();
      etat.className = 'etat-envoi ok'; etat.textContent = '✓ Déjà envoyé. Tu peux encore modifier.';
    }, function () {});

    envoyer.addEventListener('click', function () {
      var mots = champs.map(function (x) { return x.value.trim().slice(0, 40); }).filter(Boolean);
      if (!mots.length) { etat.className = 'etat-envoi err'; etat.textContent = 'Écris au moins un mot.'; return; }
      if (!choisis.length) { etat.className = 'etat-envoi err'; etat.textContent = 'Choisis au moins une émotion.'; return; }
      S.file.pousser({ methode: 'POST', chemin: 'emc_mots?on_conflict=classe_id,eleve_id',
        corps: { classe_id: S.classe, eleve_id: S.eleveId, mots: mots, emojis: choisis.slice() },
        opts: { fusion: true }, cle: 'mots' });
      majEtatEnvoi(etat, '✓ Envoyé ! Tu peux encore modifier tant que l\'étape est ouverte.');
    });
  }

  /* L'état d'un envoi passé par la file : envoyé, ou en attente du réseau. */
  function majEtatEnvoi(etat, texteOk) {
    function maj() {
      if (!document.body.contains(etat)) { document.removeEventListener('emc:file', maj); return; }
      if (S.file.enAttente()) { etat.className = 'etat-envoi att'; etat.textContent = '⏳ Gardé sur ta tablette : ça part dès que le réseau revient.'; }
      else { etat.className = 'etat-envoi ok'; etat.textContent = texteOk; }
    }
    document.addEventListener('emc:file', maj);
    maj();
    setTimeout(maj, 600);
  }

  /* 2 — Révélation de la mission */
  function blocMission(grand) {
    var m = mission(), b = bloc();
    if (!m) { b.appendChild(el('p', null, 'Ta mission arrive…')); return b; }
    b.appendChild(el('div', { class: 'tresmuet' }, 'Ta mission — table ' + S.table + ' · zone ' + (EMC.NOMS_ZONES[S.table] || '') + ' de la carte'));
    b.appendChild(el(grand ? 'div' : 'h2', { class: grand ? 'verbe' : '' }, el('span', { 'aria-hidden': 'true' }, EMC.iconeMission(m) + ' '), m.verbe));
    b.appendChild(el('p', { class: 'mission-texte' }, m.texte));
    if (m.questions && m.questions.length) {
      b.appendChild(el('ul', { class: 'questions' }, m.questions.map(function (q) { return el('li', null, q); })));
    }
    return b;
  }
  function etape2(s) {
    s.appendChild(blocMission(true));
    s.appendChild(el('div', { class: 'encadre' }, 'Pendant le jeu, garde cette mission en tête et prends des notes : elles serviront à ta table pour la carte mentale.'));
  }

  /* 3 — Le jeu, et les notes */
  function blocNotes(avecTable) {
    var cleLocale = 'emc.note.' + S.classe;
    var b = bloc();
    b.appendChild(el('label', { for: 'ma-note' }, '📝 Mes notes de mission'));
    var t = el('textarea', { id: 'ma-note', class: 'notes', maxlength: '4000', placeholder: 'Ce que tu repères pendant le jeu…' });
    var etat = el('p', { class: 'tresmuet', role: 'status', 'aria-live': 'polite' });
    b.appendChild(t); b.appendChild(etat);
    var brouillon = relire(cleLocale);
    if (brouillon != null) t.value = brouillon;
    else EMC.lire('emc_notes?select=texte&classe_id=eq.' + S.classe + '&eleve_id=eq.' + S.eleveId).then(function (l) {
      if (l && l[0] && !t.value) t.value = l[0].texte;
    }, function () {});
    var minuteur = null;
    function enregistrer() {
      minuteur = null;
      S.file.pousser({ methode: 'POST', chemin: 'emc_notes?on_conflict=classe_id,eleve_id',
        corps: { classe_id: S.classe, eleve_id: S.eleveId, texte: t.value.slice(0, 4000) },
        opts: { fusion: true }, cle: 'notes' });
      majEtatEnvoi(etat, '✓ Enregistré');
    }
    t.addEventListener('input', function () {
      stocker(cleLocale, t.value);          // brouillon immédiat, pour survivre à une coupure
      etat.textContent = '…';
      if (minuteur) clearTimeout(minuteur);
      minuteur = setTimeout(enregistrer, 1500);
    });
    S.nettoyer.push(function () { if (minuteur) { clearTimeout(minuteur); enregistrer(); } });

    if (avecTable) {
      var autres = el('div', { 'aria-live': 'polite' });
      b.appendChild(el('h3', { style: 'margin-top:1rem' }, '👥 Les notes de ta table'));
      b.appendChild(autres);
      function relireTable() {
        if (document.hidden) return;
        EMC.lire('emc_notes?select=eleve_id,texte,maj_le&classe_id=eq.' + S.classe + '&order=eleve_id').then(function (l) {
          autres.innerHTML = '';
          var k = 0;
          (l || []).forEach(function (n) {
            if (n.eleve_id === S.eleveId) return;
            k++;
            if (!n.texte || !n.texte.trim()) return;
            autres.appendChild(el('div', { class: 'note-camarade' }, el('b', null, 'Camarade ' + k), n.texte));
          });
          if (!autres.children.length) autres.appendChild(el('p', { class: 'tresmuet' }, 'Pas encore de notes de tes camarades.'));
        }, function () {});
      }
      relireTable();
      var iv = setInterval(relireTable, 8000);
      S.nettoyer.push(function () { clearInterval(iv); });
    }
    return b;
  }
  function etape3(s) {
    s.appendChild(el('div', { class: 'encadre orange' }, '🎮 Lance ', el('b', null, el('i', null, 'Le Labyrinthe de Nina')), '. Garde ta mission en tête : reviens ici pour noter ce que tu repères.'));
    s.appendChild(blocMission(false));
    s.appendChild(blocNotes(true));
  }

  /* 4 — La carte mentale */
  var majCarteEtat = null;
  function etape4(s) {
    var c = contenu('carte') || {};
    var m = mission();
    var outils = el('div', { class: 'rangee', style: 'margin-bottom:.5rem' });
    var plein = el('button', { type: 'button' }, '⛶ Plein écran');
    outils.appendChild(el('span', { class: 'muet' }, 'Tu écris dans ta zone : ', el('b', null, EMC.NOMS_ZONES[S.table]), m ? ' — ' + m.verbe + ' ' + m.texte : ''));
    outils.appendChild(el('span', { class: 'espace', style: 'flex:1' }));
    outils.appendChild(plein);
    var hote = el('div', { id: 'carte-hote', class: 'carte-cadre' });
    var cadre = el('div', { class: 'carte-plein-cadre' }, outils, hote);
    s.appendChild(cadre);
    var details = el('details', { class: 'panneau-notes', style: 'margin-top:.6rem' }, el('summary', null, 'Ma mission et les notes de ma table'));
    details.appendChild(blocMission(false));
    details.appendChild(blocNotes(true));
    s.appendChild(details);

    plein.addEventListener('click', function () {
      var on = document.body.classList.toggle('carte-plein');
      plein.textContent = on ? '✕ Quitter le plein écran' : '⛶ Plein écran';
      window.dispatchEvent(new Event('resize'));
    });

    if (!window.EMC.Carte) {
      hote.appendChild(el('div', { class: 'encadre err' }, 'La carte n\'a pas pu se charger. Recharge la page.'));
      return;
    }
    var carte = EMC.Carte.monter(hote, {
      mode: 'eleve', zone: S.table, eleveId: S.eleveId,
      contenus: { carte: c, missions: contenu('missions') || [] },
      persister: function (ligne) {
        return S.file.pousser({ methode: 'POST', chemin: 'emc_carte', opts: { ignorer: true },
          corps: { id: ligne.id, classe_id: S.classe, eleve_id: S.eleveId, auteur: S.auteur,
                   zone: ligne.zone, type: ligne.type, couleur: ligne.couleur, donnees: ligne.donnees } });
      },
      modifier: function (id, champs) {
        return S.file.pousser({ methode: 'PATCH', chemin: 'emc_carte?id=eq.' + id, corps: champs,
          cle: 'carte:' + id + ':' + Object.keys(champs).sort().join(',') });
      }
    });
    majCarteEtat = function () {
      carte.etat({ ouverte: S.seance.etape === 4 && !S.seance.cloturee_le,
                   figee: !!S.seance.carte_figee, zonesVerrouillees: S.seance.zones_verrouillees || [] });
    };
    majCarteEtat();

    /* Toute la carte au départ, puis : ma zone en direct, les autres
       relues toutes les 3 s (budget Realtime, AUDIT-EMC §3.4). */
    var dernier = null;
    function noter(l) {
      (l || []).forEach(function (x) { if (!dernier || x.maj_le > dernier) dernier = x.maj_le; });
    }
    EMC.lire('emc_carte?select=*&classe_id=eq.' + S.classe + '&order=maj_le').then(function (l) {
      carte.charger(l || []); noter(l);
      try { carte.centrerSur(S.table); } catch (e) {}
    }, function () {});
    var iv = setInterval(function () {
      if (document.hidden) return;
      var depuis = dernier ? new Date(new Date(dernier).getTime() - 5000).toISOString() : null;
      EMC.lire('emc_carte?select=*&classe_id=eq.' + S.classe + '&order=maj_le' + (depuis ? '&maj_le=gt.' + encodeURIComponent(depuis) : ''))
        .then(function (l) { (l || []).forEach(function (x) { carte.appliquer(x); }); noter(l); }, function () {});
    }, 3000);
    var ecoute = EMC.ecouter('emc_carte', 'canal=eq.' + S.classe + ':' + S.table, function (ligne) {
      if (ligne && ligne.id) { carte.appliquer(ligne); noter([ligne]); }
    }, null, {});
    S.nettoyer.push(function () { clearInterval(iv); ecoute.arreter(); carte.detruire(); });
    setTimeout(function () { try { carte.centrerSur(S.table); } catch (e) {} }, 50);
  }

  /* 5 — Vidéo et numéros d'urgence */
  /* 🔴 Rien de YouTube ne se charge sur la tablette : la vidéo passe
     à la projection ; ici, un MP4 (OneDrive) ou le lien seulement. */
  function etape5(s) {
    var n = bloc();
    n.appendChild(el('h2', null, '📞 Les numéros à connaître'));
    var nz = el('div'); n.appendChild(nz);
    EMC.Vues.numerosDetailles(nz, contenu('numeros') || NUMEROS_DEFAUT);
    n.appendChild(el('p', { class: 'muet', style: 'margin-top:.8rem' }, 'Tu peux aussi parler à la CPE, à l\'infirmière, à un professeur, à un adulte de confiance.'));
    s.appendChild(n);
    (contenu('videos') || []).forEach(function (v) {
      var b = bloc();
      b.appendChild(el('h2', null, '🎬 ' + (v.titre || 'Vidéo')));
      if (v.mp4) {
        b.appendChild(el('video', { controls: true, playsinline: true, preload: 'metadata', src: v.mp4 + (v.mp4.indexOf('?') >= 0 ? '&' : '?') + 'download=1' }));
        if (v.credits) b.appendChild(el('p', { class: 'tresmuet' }, v.credits));
      } else {
        b.appendChild(el('p', { class: 'muet' }, 'La vidéo est projetée au tableau.'));
      }
      if (v.note) b.appendChild(el('div', { class: 'encadre orange' }, v.note));
      if (v.lien) b.appendChild(el('p', null, el('a', { href: v.lien, target: '_blank', rel: 'noopener' }, 'Revoir la vidéo plus tard (lien d\'origine)')));
      s.appendChild(b);
    });
  }

  /* 6 — Harcèlomètre */
  var COULEURS_ECHELLE = ['#2fae6a', '#f0a72e', '#e8743b', '#d6402b'];
  function etape6(s) {
    var h = contenu('harcelometre') || { echelle: [], situations: [], criteres: [] };
    var sid = S.seance.situation_courante, revelee = !!S.seance.situation_revelee;
    var sit = null;
    (h.situations || []).forEach(function (x) { if (x.id === sid) sit = x; });
    var b = bloc();
    if (!sit) {
      b.appendChild(el('p', { class: 'muet' }, 'La première situation va s\'afficher…'));
      s.appendChild(b);
      return;
    }
    b.appendChild(el('div', { class: 'tresmuet' }, 'Situation'));
    b.appendChild(el('p', { class: 'situation' }, sit.texte));
    b.appendChild(el('p', { class: 'muet' }, revelee ? 'Le vote est fermé.' : 'Place le curseur : de 0 (pas du harcèlement) à 10 (harcèlement grave), puis valide.'));

    var ech = h.echelle || [];
    /* la piste du curseur, colorée par zone de l'échelle */
    var stops = ech.map(function (z, i) {
      var a = z.de === 0 ? 0 : (z.de - 0.5) * 10, c = z.a === 10 ? 100 : (z.a + 0.5) * 10;
      return COULEURS_ECHELLE[i % 4] + ' ' + a + '% ' + c + '%';
    }).join(', ');
    var valeur = el('div', { class: 'valeur-vote', 'aria-live': 'polite' }, '—');
    var zoneTexte = el('div', { class: 'muet' });
    var curseur = el('input', { type: 'range', class: 'harcelo', min: '0', max: '10', step: '1', value: '5',
      'aria-label': 'Ton avis, de 0 à 10', disabled: revelee });
    curseur.style.setProperty('--piste', stops ? 'linear-gradient(to right, ' + stops + ')' : 'var(--line)');
    var grad = el('div', { class: 'graduations', 'aria-hidden': 'true' });
    for (var i = 0; i <= 10; i++) grad.appendChild(el('span', null, String(i)));
    var echelle = el('div', { class: 'echelle' }, ech.map(function (z, i) {
      return el('div', { style: 'background:' + COULEURS_ECHELLE[i % 4] }, el('b', null, z.de + '–' + z.a), el('br'), z.titre);
    }));
    var etat = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var valider = el('button', { type: 'button', class: 'primaire', disabled: revelee }, 'Valider mon vote');

    function titreZone(v) { for (var i = 0; i < ech.length; i++) if (v >= ech[i].de && v <= ech[i].a) return ech[i].titre; return ''; }
    var touche = false;
    function maj() { valeur.textContent = touche || revelee ? curseur.value : '—'; zoneTexte.textContent = touche || revelee ? titreZone(+curseur.value) : 'Pas encore voté'; }
    curseur.addEventListener('input', function () { touche = true; maj(); });

    b.appendChild(el('div', { class: 'rangee' }, valeur, zoneTexte));
    b.appendChild(el('div', { class: 'curseur-cadre' }, curseur, grad));
    b.appendChild(echelle);
    if (!revelee) b.appendChild(el('div', { class: 'rangee', style: 'margin-top:1rem' }, valider));
    b.appendChild(etat);
    s.appendChild(b);

    EMC.lire('emc_votes?select=valeur&classe_id=eq.' + S.classe + '&situation=eq.' + encodeURIComponent(sid)).then(function (l) {
      if (l && l[0] && !touche) {
        curseur.value = l[0].valeur; touche = true; maj();
        etat.className = 'etat-envoi ok';
        etat.textContent = revelee ? 'Ton vote : ' + l[0].valeur : '✓ Vote envoyé. Tu peux le changer tant que le vote est ouvert.';
      } else if (revelee && !touche) { etat.className = 'etat-envoi'; etat.textContent = 'Tu n\'as pas voté sur cette situation.'; }
    }, function () {});
    maj();

    valider.addEventListener('click', function () {
      if (!touche) { etat.className = 'etat-envoi err'; etat.textContent = 'Déplace d\'abord le curseur.'; return; }
      S.file.pousser({ methode: 'POST', chemin: 'emc_votes?on_conflict=classe_id,situation,eleve_id',
        corps: { classe_id: S.classe, situation: sid, eleve_id: S.eleveId, valeur: +curseur.value },
        opts: { fusion: true }, cle: 'vote:' + sid });
      majEtatEnvoi(etat, '✓ Vote envoyé. Tu peux le changer tant que le vote est ouvert.');
    });

    if (revelee) {
      var r = el('div', { class: 'carte-blanche' });
      r.appendChild(el('h2', null, 'Ce qu\'on en pense'));
      if (sit.attendu) r.appendChild(el('p', null, 'Zone attendue : ', el('b', null, sit.attendu)));
      if (h.criteres && h.criteres.length) {
        r.appendChild(el('p', { class: 'muet' }, 'Les questions à se poser :'));
        r.appendChild(el('ul', null, h.criteres.map(function (c) { return el('li', null, c); })));
      }
      s.appendChild(r);
    }
  }

  /* 7 — Enquête et témoignage anonymes */
  function etape7(s) {
    var q = contenu('enquete') || { questions: [] };
    var cleFaite = 'emc.enquete.' + S.classe;
    var b = bloc();
    if (relire(cleFaite)) {
      b.appendChild(el('h2', null, 'Merci 🙏'));
      b.appendChild(el('p', null, 'Tes réponses ont bien été envoyées, de façon anonyme.'));
      b.appendChild(el('div', { class: 'encadre orange' }, q.mention || ''));
      s.appendChild(b);
      return;
    }
    b.appendChild(el('div', { class: 'encadre' }, el('b', null, '🔒 Cette enquête est anonyme.'),
      ' Rien ne relie tes réponses à ton identifiant : ni ton nom, ni ton compte, ni l\'heure ne sont gardés. Tu peux ne pas répondre.'));
    var reponses = {};
    (q.questions || []).forEach(function (x) {
      var f = el('fieldset', { class: 'q' }, el('legend', null, x.texte));
      (x.choix || []).forEach(function (ch) {
        var inp = el('input', { type: 'radio', name: 'enq-' + x.id, value: ch });
        inp.addEventListener('change', function () { reponses[x.id] = ch; });
        f.appendChild(el('label', null, inp, ch));
      });
      b.appendChild(f);
    });
    b.appendChild(el('label', { for: 'temoignage' }, q.temoignage || 'Témoignage libre, anonyme et facultatif.'));
    var tem = el('textarea', { id: 'temoignage', maxlength: '3000' });
    b.appendChild(tem);
    b.appendChild(el('div', { class: 'encadre orange' }, q.mention || ''));
    var etat = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var envoyer = el('button', { type: 'button', class: 'primaire' }, 'Envoyer mes réponses');
    b.appendChild(envoyer); b.appendChild(etat);
    s.appendChild(b);
    envoyer.addEventListener('click', function () {
      envoyer.disabled = true;
      etat.className = 'etat-envoi att'; etat.textContent = 'Envoi…';
      EMC.rpc('emc_repondre_enquete', { p_classe: S.classe, p_reponses: reponses, p_temoignage: tem.value.trim().slice(0, 3000) || null })
        .then(function () {
          stocker(cleFaite, '1');
          S.etapeAffichee = null; rendreEtape();
        }, function (e) {
          envoyer.disabled = false;
          etat.className = 'etat-envoi err';
          etat.textContent = EMC.horsLigne(e) ? 'Pas de réseau : réessaie dans un instant.' : EMC.message(e);
        });
    });
  }

  function etapeFin(s) {
    var b = bloc();
    b.appendChild(el('h1', null, 'La séance est terminée. Merci ! 🙏'));
    b.appendChild(el('p', null, 'Si tu as besoin d\'en parler plus tard, tu peux aller voir la CPE, l\'infirmière, ou un professeur.'));
    var nz = el('div'); b.appendChild(nz);
    EMC.Vues.numerosDetailles(nz, contenu('numeros') || NUMEROS_DEFAUT);
    s.appendChild(b);
    $('#btn-aide').hidden = true;
  }

  /* ----------------------------------------------------------
   *  6. Démarrage
   * ---------------------------------------------------------- */
  $('#btn-aide').addEventListener('click', ouvrirAide);
  rendreNumeros();
  EMC.demarrer('eleve');

  if (!window.Progression || !Progression.disponible()) {
    $('#principal').innerHTML = '';
    $('#principal').appendChild(el('div', { class: 'encadre err' }, 'Le service n\'est pas disponible. Recharge la page ; si ça continue, lève la main.'));
    return;
  }
  Progression.session().then(function (profil) {
    if (!profil) { porte(null); return; }
    /* Déjà entré dans CETTE séance sur cette tablette (rechargement,
       coupure) : on y retourne directement. Sinon, la porte. */
    var retenu = relire('emc.code'), demande = (EMC.parametre('code') || '').toUpperCase();
    if (!retenu || (demande && demande !== retenu)) { porte(profil.pseudo || 'inconnu'); return; }
    entrer(retenu).catch(function (e) {
      var m = (e && e.message) || '';
      if (/PAS_ENCORE_INSCRIT|AUCUNE_SESSION|PAS_DE_SESSION/.test(m)) porte(null);
      else if (/PAS_DE_CLASSE_EMC|CODE_EMC_INCONNU/.test(m)) porte(profil.pseudo || 'inconnu');
      else porte(profil.pseudo || 'inconnu', EMC.message(e));
    });
  });
})();
