/* ============================================================
 *  emc-eleve.js — la page élève de la séance EMC (emc/index.html)
 *
 *  Porte d'entrée : la CARTE de l'élève (identifiant + code à 4
 *  chiffres, saisis ou lus dans le QR code) → emc_entrer() → l'étape
 *  que l'enseignant a ouverte, et elle seule. Architecture :
 *  _suivi/AUDIT-EMC.md. Base : bdd/schema/031 et 034.
 *
 *  Trois modules (emc_seances.module) : 'nina' (le Labyrinthe, ses
 *  étapes sont ici), 'accueil' (le jeu de rôle, emc-accueil.js) et
 *  'restitution'. Un module autre que Nina s'enregistre dans
 *  EMC.Modules et reçoit le contexte de la page (§5).
 *
 *  Règles tenues ici :
 *  · identifiants seulement : on ne demande ni nom ni prénom ;
 *  · la session de la carte est À PART de celle du site (emc-commun
 *    §1b) : progression.js n'est pas chargé ici ;
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

  function stocker(cle, v) { try { if (v == null) localStorage.removeItem(cle); else localStorage.setItem(cle, v); } catch (e) {} }
  function relire(cle) { try { return localStorage.getItem(cle); } catch (e) { return null; } }

  /* Le « sub » de la carte : c'est l'auteur d'un élément de carte
     mentale (la policy exige auteur = auth.uid()). */
  function subDuJeton() { var c = EMC.carte(); return (c && c.sub) || null; }

  function contenu(cle) { return (S.contenus && S.contenus[cle]) || null; }
  function module() { return EMC.Modules && S.seance && EMC.Modules[S.seance.module] || null; }
  function titreEtape(n) {
    var m = module();
    var l = contenu(m && m.cleEtapes ? m.cleEtapes : 'etapes') || [];
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
          el('p', null, 'Pour envoyer un message, entre d\'abord avec ta carte (identifiant et code).'),
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
  /* Une seule porte : la carte. Les élèves qui ont un compte sur le
     site entrent AUSSI par une carte (décision du 08/11/2026) : leur
     compte habituel reste intact sur la tablette, la page EMC n'y
     touche pas. */
  function porte(messageDepart, identDepart) {
    var main = $('#principal');
    main.innerHTML = '';
    $('#btn-aide').hidden = true;
    var alerte = el('div', { class: 'alerte err', role: 'alert' });
    var cadre = el('div', { class: 'carte-blanche porte' });
    main.appendChild(cadre);
    function montrerErreur(t) { alerte.textContent = t; alerte.classList.add('show'); }

    cadre.appendChild(el('h1', null, 'Bienvenue 👋'));
    cadre.appendChild(el('p', { class: 'muet' }, 'Prends la carte que ton professeur t\'a donnée.'));
    var ident = el('input', { type: 'text', id: 'p-id', class: 'ident-carte', autocomplete: 'off', autocapitalize: 'none',
      spellcheck: 'false', maxlength: '20', placeholder: 'd-renard-07', value: identDepart || '' });
    var code = el('input', { type: 'text', id: 'p-code', class: 'code', inputmode: 'numeric', pattern: '[0-9]*',
      autocomplete: 'off', maxlength: '8', placeholder: '••••' });
    code.addEventListener('input', function () { code.value = code.value.replace(/\D/g, '').slice(0, 4); });
    cadre.appendChild(el('label', { for: 'p-id' }, 'Identifiant (sur ta carte)'));
    cadre.appendChild(ident);
    cadre.appendChild(el('label', { for: 'p-code' }, 'Code à 4 chiffres'));
    cadre.appendChild(code);
    cadre.appendChild(alerte);
    var valider = el('button', { type: 'button', class: 'primaire', style: 'width:100%;margin-top:.6rem' }, 'Entrer');
    cadre.appendChild(valider);
    cadre.appendChild(el('p', { class: 'regle', style: 'margin-top:.8rem' },
      '📷 Plus rapide : scanne le QR code de ta carte avec l\'appareil photo de la tablette.'));
    cadre.appendChild(el('div', { class: 'encadre orange', style: 'margin-top:.8rem' },
      el('b', null, '✍️ Note ton identifiant sur la feuille qui circule'),
      ', avec ton nom et ton prénom : c\'est la seule trace de ton nom, et elle reste sur papier.'));
    cadre.appendChild(el('p', { class: 'tresmuet', style: 'margin-top:.6rem' },
      'Ta carte ne sert que pour cette séance. Si tu as déjà un compte sur le site, il reste tel quel sur ta tablette.'));

    function go() {
      alerte.classList.remove('show');
      valider.disabled = true; valider.textContent = 'Un instant…';
      EMC.connecterCarte(ident.value, code.value).then(function () { return entrer(); }).catch(function (e) {
        valider.disabled = false; valider.textContent = 'Entrer';
        montrerErreur(EMC.message(e));
      });
    }
    valider.addEventListener('click', go);
    code.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    if (messageDepart) montrerErreur(messageDepart);
    (identDepart ? code : ident).focus();
  }

  /* ----------------------------------------------------------
   *  3. Entrer dans la séance
   * ---------------------------------------------------------- */
  function entrer() {
    return EMC.rpc('emc_entrer', { p_code: null }).then(function (j) {
      S.classe = j.classe_id; S.libelle = j.libelle; S.table = j.table_num;
      S.auteur = subDuJeton();
      return Promise.all([
        EMC.lire('emc_participants?select=eleve_id,table_num,pret&classe_id=eq.' + S.classe),
        EMC.contenus(),
        EMC.lire('emc_seances?select=*&classe_id=eq.' + S.classe)
      ]);
    }).then(function (r) {
      var moi = r[0] && r[0][0];
      if (!moi) throw new Error('PAS_DANS_LA_SEANCE');
      S.eleveId = moi.eleve_id; S.table = moi.table_num; S.pret = !!moi.pret;
      S.contenus = r[1];
      if (r[2] && r[2][0]) S.seance = r[2][0];
      S.pseudo = (EMC.carte() || {}).identifiant || '';
      S.file = EMC.file(S.classe + '.' + S.eleveId);
      S.file.surRefus(function (e) { toast(EMC.message(e), 'err'); });
      demarrerSeance();
    });
  }

  function demarrerSeance() {
    var m = module();
    /* Le bandeau des numéros d'urgence n'a sa place qu'au Labyrinthe
       (Loïc, 08/11) ; ailleurs, « J'ai besoin d'en parler » passe dans
       la barre du haut. */
    document.body.classList.toggle('avec-aide', !(m && m.sansBandeau));
    $('#bandeau-aide').hidden = !!(m && m.sansBandeau);
    rendreBarre();
    rendreNumeros();
    $('#btn-aide').hidden = false;
    $('#principal').innerHTML = '';
    $('#principal').appendChild(el('div', { id: 'scene' }));
    document.title = m && m.titre ? 'EMC — ' + m.titre : 'EMC — Le Labyrinthe de Nina';
    if (m && m.demarrer) m.demarrer(ctx);
    if (S.seance) rendreEtape();

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
      if (module()) return;
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
      var m = module();
      if (m && m.quitter) m.quitter(ctx);
      EMC.quitterCarte();
      location.replace(location.pathname);
    });
    var m = module();
    var badge = m && m.badge ? m.badge(ctx) : el('span', { class: 'pastille table grande-table' }, 'TABLE ' + S.table);
    b.appendChild(el('div', { class: 'entete-eleve' },
      badge,
      pret,
      el('span', null, el('span', { class: 'seance' }, S.libelle), el('br'), el('span', { class: 'qui' }, S.pseudo))));
    b.appendChild(el('span', { class: 'espace' }));
    b.appendChild(el('span', { class: 'pastille direct-etat ' + d[0], id: 'etat-direct', title: 'Liaison avec la classe' }, d[1]));
    if (attente) b.appendChild(el('span', { class: 'pastille att', id: 'etat-file' }, '⏳ ' + attente + ' envoi' + (attente > 1 ? 's' : '') + ' en attente'));
    if (m && m.sansBandeau) b.appendChild(el('button', { type: 'button', class: 'lien', id: 'btn-aide-barre', onclick: ouvrirAide }, '💬 Besoin d\'en parler'));
    b.appendChild(sortir);
  }
  /* « Prêt » est à sens unique (Loïc, 11/11) : une fois touché, le
     bouton reste vert et ne fait plus rien — on ne se « dé-prépare »
     pas d'un doigt qui glisse. */
  function boutonPret(geant) {
    var p = el('button', { type: 'button', class: (S.pret ? 'pret-oui' : 'pret-non') + (geant ? ' pret-geant' : ' pret-grand'),
      'aria-pressed': S.pret ? 'true' : 'false', 'aria-disabled': S.pret ? 'true' : null }, S.pret ? '✅ Je suis prêt·e' : '✋ Je suis prêt·e');
    if (!S.pret) p.addEventListener('click', function () { p.disabled = true; mettrePret(); });
    return p;
  }
  document.addEventListener('emc:direct', function () { if (S.classe) rendreBarre(); });
  document.addEventListener('emc:file', function () { if (S.classe) rendreBarre(); });

  function mettrePret() {
    if (S.pret) return;
    EMC.rpc('emc_pret', { p_classe: S.classe, p_pret: true }).then(function () {
      S.pret = true; rendreBarre();
      if (S.seance && S.seance.etape === 0) { S.etapeAffichee = null; rendreEtape(); }
    }, function (e) { toast(EMC.message(e), 'err'); rendreBarre(); if (S.seance && S.seance.etape === 0) { S.etapeAffichee = null; rendreEtape(); } });
  }

  /* Ce qu'un module (EMC.Modules.<nom>) reçoit de la page. */
  var ctx = {
    S: S, el: el, contenu: contenu, toast: toast, stocker: stocker, relire: relire,
    bloc: function () { return bloc(); },
    boutonPret: function (geant) { return boutonPret(geant); },
    majEtatEnvoi: function (etat, texte) { return majEtatEnvoi(etat, texte); },
    rendreBarre: function () { rendreBarre(); },
    rafraichir: function () { S.etapeAffichee = null; rendreEtape(); },
    enQuittant: function (f) { S.nettoyer.push(f); }
  };

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
    var m = module();
    if (!avant || avant.etape !== ligne.etape || !!avant.cloturee_le !== !!ligne.cloturee_le) {
      rendreEtape();
      if (m) rendreBarre();        /* le badge du module (symbole) suit l'état */
      return;
    }
    if (m) { if (m.majSeance) m.majSeance(ctx, avant, ligne); return; }
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
    var m = module();
    if (S.seance.cloturee_le) { if (m && m.fin) m.fin(ctx); etapeFin(neuf); return; }
    var n = S.seance.etape;
    neuf.appendChild(el('div', { class: 'etape-titre' },
      el('span', { class: 'num' }, 'Étape ' + n), el('h1', null, titreEtape(n))));
    try {
      if (m) m.etapes[n](neuf, ctx);
      else [etape0, etape1, etape2, etape3, etape4, etape5, etape6, etape7][n](neuf);
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
    var m = module();
    if (!(m && m.sansBandeau)) {
      var nz = el('div'); b.appendChild(nz);
      EMC.Vues.numerosDetailles(nz, contenu('numeros') || NUMEROS_DEFAUT);
    }
    s.appendChild(b);
    $('#btn-aide').hidden = true;
  }

  /* ----------------------------------------------------------
   *  6. Démarrage
   * ---------------------------------------------------------- */
  $('#btn-aide').addEventListener('click', ouvrirAide);
  rendreNumeros();
  EMC.demarrer('eleve');

  /* Le QR code de la carte : ?carte=d-renard-07&k=4821. On lit, on
     efface aussitôt de l'adresse (et de l'historique), on entre. */
  var qrId = EMC.parametre('carte'), qrCode = EMC.parametre('k');
  if (qrId || qrCode) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }

  function apresEchec(e) {
    var m = (e && e.message) || '';
    /* la carte n'ouvre plus rien (comptes supprimés, séance d'un
       autre jour) : on l'oublie et on montre la porte */
    if (/PAS_DE_SESSION|AUCUNE_SESSION|PAS_ENCORE_INSCRIT|PAS_DE_CLASSE_EMC/.test(m) || (e && e.statut === 401)) {
      EMC.quitterCarte(); porte();
    } else porte(EMC.message(e), (EMC.carte() || {}).identifiant);
  }

  if (qrId && qrCode) {
    /* une autre carte était ouverte : la nouvelle la remplace */
    if (EMC.carte() && EMC.carte().identifiant !== EMC.normaliserCarte(qrId).identifiant) EMC.quitterCarte();
    EMC.connecterCarte(qrId, qrCode).then(function () { return entrer(); })
      .catch(function (e) { porte(EMC.message(e), qrId); });
  } else if (EMC.carte()) {
    /* rechargement, coupure : la carte de cette tablette */
    entrer().catch(apresEchec);
  } else {
    porte(null, qrId);
  }
})();
