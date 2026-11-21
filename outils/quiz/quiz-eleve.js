/* ============================================================
 *  quiz-eleve.js — la page que les élèves ouvrent (sans compte)
 *  ------------------------------------------------------------
 *  L'élève entre le PIN (ou scanne le QR code, qui le porte dans
 *  l'adresse) et un pseudonyme. La base lui rend un jeton, gardé
 *  sur l'appareil : recharger la page, perdre le wifi ou verrouiller
 *  le téléphone ne fait pas perdre la partie.
 *
 *  Toute la vérité vient de quiz_etat : la page ne fait qu'afficher.
 *  Elle ne connaît jamais la bonne réponse avant la correction.
 *
 *  ?salle=CODE : le QR code FIXE d'un quiz (diapositive, fiche). L'élève
 *  donne son nom, puis attend que le professeur lance la partie (la page
 *  redemande toute seule) ; s'il n'y a pas de partie, il peut s'entraîner
 *  seul : il avance lui-même, la correction suit chaque réponse.
 * ============================================================ */
(function () {
  'use strict';
  var Q = window.Quiz, $ = Q.$, esc = Q.esc;
  var CLE = 'quiz.joueur', CLE_PSEUDO = 'quiz.pseudo';

  var S = {
    joueur: null,      // { jeton, partie, pseudo, pin }
    etat: null,        // dernier quiz_etat
    cle: '',           // ce qui est affiché (évite de redessiner pour rien)
    echeance: 0,       // performance.now() de la fin du chrono
    brouillon: {},     // saisie en cours : choix multiples, ordre, point, nombre
    sur: false,        // pari de confiance coché
    envoi: false,
    envoye: {},        // idx → true quand la base a accepté la réponse
    rt: null, rtOk: false,
    minuteur: null, chronoTimer: null, echecs: 0,
    salle: '',         // code de salle venu du QR code fixe
    salleTimer: null
  };
  function solo() { return !!(S.etat && S.etat.mode === 'solo') || !!(S.joueur && S.joueur.mode === 'solo'); }

  function lire(cle) { try { return JSON.parse(localStorage.getItem(cle) || 'null'); } catch (e) { return null; } }
  function ecrire(cle, v) { try { if (v == null) localStorage.removeItem(cle); else localStorage.setItem(cle, JSON.stringify(v)); } catch (e) { /* privé */ } }
  var app = $('#app');

  /* ---------------- entrée ---------------- */
  function pinDeLAdresse() {
    var m = /[?&#]pin=(\d[\d\s]{4,8}\d)/.exec(location.search + location.hash);
    return m ? m[1].replace(/\D/g, '') : '';
  }

  function ecranEntree(message) {
    arreter();
    S.cle = 'entree';
    $('#qui').textContent = '';
    var pin = pinDeLAdresse();
    app.innerHTML =
      '<div class="entree">' +
        '<h1 class="titre-affiche">En piste&nbsp;!</h1>' +
        '<p class="capitales filet">Rejoindre la partie</p>' +
        '<form id="f-entree" novalidate>' +
          '<div class="champ"><label for="pin">Code de la partie</label>' +
            '<input id="pin" class="pin-saisie" inputmode="numeric" autocomplete="off" maxlength="7" placeholder="000 000" value="' + esc(pin ? pin.replace(/(\d{3})(\d{3})/, '$1 $2') : '') + '"></div>' +
          '<div class="champ"><label for="pseudo">Ton prénom et l\'initiale de ton nom</label>' +
            '<input id="pseudo" autocomplete="off" maxlength="24" placeholder="Inès B." value="' + esc(lire(CLE_PSEUDO) || '') + '"></div>' +
          '<p class="erreur" id="err">' + esc(message || '') + '</p>' +
          '<button class="bouton rouge" type="submit">Entrer</button>' +
          '<p class="note">Pas de compte, pas de mot de passe. Ton nom ne sert qu\'au classement de la séance ; il est effacé au bout de 30 jours.</p>' +
        '</form>' +
        '<p><a href="entrainement.html">Pas de partie en cours ? S\'entraîner seul →</a></p>' +
      '</div>';
    var champPin = $('#pin');
    champPin.addEventListener('input', function () {
      var c = champPin.value.replace(/\D/g, '').slice(0, 6);
      champPin.value = c.length > 3 ? c.slice(0, 3) + ' ' + c.slice(3) : c;
    });
    (pin ? $('#pseudo') : champPin).focus();
    $('#f-entree').addEventListener('submit', function (e) {
      e.preventDefault();
      var p = champPin.value.replace(/\D/g, ''), nom = $('#pseudo').value.trim();
      if (p.length !== 6) { $('#err').textContent = 'Le code a 6 chiffres.'; return; }
      if (nom.length < 2) { $('#err').textContent = 'Écris ton prénom et l\'initiale de ton nom.'; return; }
      var b = this.querySelector('button'); b.disabled = true; $('#err').textContent = '';
      Q.rpc('quiz_rejoindre', { p_pin: p, p_pseudo: nom }, true).then(function (r) {
        S.joueur = { jeton: r.jeton, partie: r.partie, pseudo: r.pseudo, pin: p };
        ecrire(CLE, S.joueur); ecrire(CLE_PSEUDO, nom);
        if (pinDeLAdresse()) history.replaceState(null, '', location.pathname);
        demarrer();
      }).catch(function (err) {
        b.disabled = false; $('#err').textContent = Q.messageErreur(err);
      });
    });
  }

  function quitter() {
    ecrire(CLE, null); S.joueur = null; S.etat = null; S.envoye = {}; S.cle = '';
    if (S.rt) { S.rt.fermer(); S.rt = null; }
    if (S.salle) ecranSalle(''); else ecranEntree('');
  }

  /* « Ce n'est pas mon nom » : on change le pseudo du MÊME joueur
     (quiz_renommer, 048). Sortir puis revenir ajoutait un concurrent :
     l'ancien nom restait inscrit (signalé par Loïc le 15/11). */
  function renommer() {
    S.renommage = true;
    app.innerHTML =
      '<div class="entree">' +
        '<h1 class="titre-affiche">Ton nom</h1>' +
        '<form id="f-nom" novalidate>' +
          '<div class="champ"><label for="r-pseudo">Ton prénom et l’initiale de ton nom</label>' +
            '<input id="r-pseudo" autocomplete="off" maxlength="24" value="' + esc(S.joueur.pseudo) + '"></div>' +
          '<p class="erreur" id="err"></p>' +
          '<button class="bouton rouge" type="submit">Changer mon nom</button>' +
          '<button class="lien-bouton" type="button" id="b-annuler">Annuler</button>' +
        '</form>' +
      '</div>';
    var champ = $('#r-pseudo'); champ.focus(); champ.select();
    var fin = function () { S.renommage = false; S.cle = ''; relire(); };
    $('#b-annuler').onclick = fin;
    $('#f-nom').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var nom = champ.value.trim();
      if (nom.length < 2) { $('#err').textContent = 'Écris ton prénom et l’initiale de ton nom.'; return; }
      var b = this.querySelector('button[type=submit]'); b.disabled = true;
      Q.rpc('quiz_renommer', { p_jeton: S.joueur.jeton, p_pseudo: nom }, true).then(function (r) {
        S.joueur.pseudo = r.pseudo; ecrire(CLE, S.joueur); ecrire(CLE_PSEUDO, r.pseudo);
        $('#qui').textContent = r.pseudo;
        fin();
      }).catch(function (err) {
        // base pas encore à jour (048 non passé) : l'ancien comportement
        if (/quiz_renommer|Could not find|PGRST202|does not exist/i.test(String(err && err.message))) { S.renommage = false; return quitter(); }
        b.disabled = false; $('#err').textContent = Q.messageErreur(err);
      });
    });
  }

  /* ---------------- la salle (QR code fixe) ---------------- */
  function salleDeLAdresse() {
    var m = /[?&#]salle=([A-Za-z0-9]{6})\b/.exec(location.search + location.hash);
    return m ? m[1].toUpperCase() : '';
  }

  /* &seul=1 : venu de la page d'entraînement — pas de salle d'attente */
  function seulDeLAdresse() { return /[?&#]seul=1\b/.test(location.search + location.hash); }

  function ecranSalle(message) {
    arreter(); clearTimeout(S.salleTimer);
    S.cle = 'salle';
    $('#qui').textContent = '';
    app.innerHTML =
      '<div class="entree">' +
        '<h1 class="titre-affiche">En piste&nbsp;!</h1>' +
        '<p class="capitales filet" id="s-titre">Quiz</p>' +
        '<form id="f-salle" novalidate>' +
          '<div class="champ"><label for="pseudo">Ton prénom et l\'initiale de ton nom</label>' +
            '<input id="pseudo" autocomplete="off" maxlength="24" placeholder="Inès B." value="' + esc(lire(CLE_PSEUDO) || '') + '"></div>' +
          '<p class="erreur" id="err">' + esc(message || '') + '</p>' +
          '<button class="bouton rouge" type="submit">' + (seulDeLAdresse() ? 'Commencer l\'entraînement' : 'Entrer') + '</button>' +
          '<p class="note">Pas de compte, pas de mot de passe. Ton nom ne sert qu\'au classement de la séance ; il est effacé au bout de 30 jours.</p>' +
          (seulDeLAdresse() ? '<p><a href="entrainement.html">← Choisir un autre quiz</a></p>' : '') +
        '</form>' +
      '</div>';
    Q.rpc('quiz_salle', { p_code: S.salle }, true).then(function (r) {
      var t = $('#s-titre'); if (t) t.textContent = r.titre;
    }).catch(function (err) { var e = $('#err'); if (e) e.textContent = Q.messageErreur(err); });
    $('#pseudo').focus();
    $('#f-salle').addEventListener('submit', function (e) {
      e.preventDefault();
      var nom = $('#pseudo').value.trim();
      if (nom.length < 2) { $('#err').textContent = 'Écris ton prénom et l\'initiale de ton nom.'; return; }
      ecrire(CLE_PSEUDO, nom);
      if (seulDeLAdresse()) { entrainer(nom, this.querySelector('button')); return; }
      this.querySelector('button').disabled = true;
      attendreSalle(nom);
    });
  }

  /* Demande à la base s'il y a une partie où entrer ; sinon, attend et
     redemande. L'attente est la « file » : dès que le professeur lance,
     tous ceux qui attendaient entrent d'eux-mêmes. */
  function attendreSalle(nom) {
    clearTimeout(S.salleTimer);
    Q.rpc('quiz_salle', { p_code: S.salle }, true).then(function (r) {
      if (r.etat === 'ouverte') {
        return Q.rpc('quiz_rejoindre', { p_pin: r.pin, p_pseudo: nom }, true).then(function (j) {
          S.joueur = { jeton: j.jeton, partie: j.partie, pseudo: j.pseudo, pin: r.pin, salle: S.salle };
          S.etat = null; S.envoye = {}; S.cle = '';
          ecrire(CLE, S.joueur);
          demarrer();
        });
      }
      if (S.cle !== 'salle-attente') ecranSalleAttente(r, nom);
      S.salleTimer = setTimeout(function () { attendreSalle(nom); }, document.hidden ? 8000 : 3500);
    }).catch(function (err) {
      var m = String(err && err.message);
      if (/QUIZ_PSEUDO|QUIZ_COMPLET|QUIZ_SALLE_INCONNUE/.test(m)) return ecranSalle(Q.messageErreur(err));
      // réseau : on réessaie sans bruit
      S.salleTimer = setTimeout(function () { attendreSalle(nom); }, 5000);
    });
  }

  function ecranSalleAttente(r, nom) {
    S.cle = 'salle-attente';
    $('#qui').textContent = nom;
    app.innerHTML =
      '<div class="attente">' +
        '<p class="capitales">' + esc(r.titre) + '</p>' +
        '<h1 class="titre-affiche">' + esc(nom) + '</h1>' +
        '<p><span class="point-attente" aria-hidden="true"></span> En attente du professeur : tu entreras dans la partie dès qu\'il la lance.</p>' +
        '<p class="note">Pas de partie en classe&nbsp;? Tu peux faire le quiz seul, à ton rythme : la correction s\'affiche après chaque question.</p>' +
        '<p class="erreur" id="err"></p>' +
        '<button class="bouton" type="button" id="b-seul">S\'entraîner seul (' + r.questions + ' question' + (r.questions > 1 ? 's' : '') + ')</button>' +
        '<button class="lien-bouton" type="button" id="b-nom">Ce n\'est pas mon nom</button>' +
      '</div>';
    $('#b-nom').onclick = function () { ecranSalle(''); };
    $('#b-seul').onclick = function () { entrainer(nom, this); };
  }

  function entrainer(nom, bouton) {
    clearTimeout(S.salleTimer);
    if (bouton) bouton.disabled = true;
    Q.rpc('quiz_entrainer', { p_code: S.salle, p_pseudo: nom }, true).then(function (j) {
      S.joueur = { jeton: j.jeton, partie: j.partie, pseudo: j.pseudo, salle: S.salle, mode: 'solo' };
      S.etat = null; S.envoye = {}; S.cle = '';
      ecrire(CLE, S.joueur);
      demarrer();
    }).catch(function (err) {
      if (bouton) bouton.disabled = false;
      var e = $('#err'); if (e) e.textContent = Q.messageErreur(err);
    });
  }

  /* L'élève qui s'entraîne avance lui-même. */
  function avancer(action, bouton) {
    if (bouton) bouton.disabled = true;
    Q.rpc('quiz_solo', { p_jeton: S.joueur.jeton, p_action: action }, true).then(relire, function (err) {
      if (/QUIZ_PAS_MAINTENANT|QUIZ_PAS_DE_QUESTION/.test(String(err && err.message))) return relire();
      if (bouton) bouton.disabled = false;
      var e = $('#err'); if (e) e.textContent = Q.messageErreur(err) + ' Réessaie.';
    });
  }

  /* ---------------- boucle ---------------- */
  function arreter() {
    clearTimeout(S.minuteur); clearInterval(S.chronoTimer);
  }
  function demarrer() {
    $('#qui').textContent = S.joueur.pseudo;
    clearTimeout(S.salleTimer);
    // en solo, personne ne sonne le réveil : la page relit après chaque geste
    if (!S.rt && S.joueur.mode !== 'solo') {
      S.rt = Q.canal(S.joueur.partie, function () {
        clearTimeout(S.minuteur);
        // un petit décalage : trente téléphones ne frappent pas la base à la même milliseconde
        S.minuteur = setTimeout(relire, Math.random() * 250);
      }, function (ok) { S.rtOk = ok; });
    }
    relire();
  }
  function prochaine() {
    clearTimeout(S.minuteur);
    var e = S.etat, d;
    if (!e) d = 2000;
    else if (e.phase === 'fin' || e.phase === 'exclu' || e.phase === 'expiree') return;
    else if (solo()) d = 10000;      // c'est l'élève qui fait avancer : relu après chaque geste
    else if (e.phase === 'question' && S.echeance - performance.now() < 1500) d = 900;   // la correction arrive
    else d = S.rtOk ? 4000 : 1500;
    if (document.hidden) d = Math.max(d, 5000);
    S.minuteur = setTimeout(relire, d);
  }
  function relire() {
    if (!S.joueur) return;
    Q.rpc('quiz_etat', { p_jeton: S.joueur.jeton }, true).then(function (e) {
      S.echecs = 0; afficher(e); prochaine();
    }).catch(function () {
      S.echecs++;
      if (S.echecs === 3) bandeauReseau(true);
      clearTimeout(S.minuteur); S.minuteur = setTimeout(relire, Math.min(8000, 1000 * S.echecs));
    });
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && S.joueur) relire(); });
  window.addEventListener('online', function () { if (S.joueur) relire(); });

  function bandeauReseau(oui) {
    var b = $('#reseau');
    if (oui && !b) {
      b = document.createElement('p'); b.id = 'reseau'; b.className = 'encart rouge';
      b.textContent = 'Connexion perdue… ta partie est gardée, la page réessaie toute seule.';
      app.prepend(b);
    }
  }

  /* ---------------- affichage ---------------- */
  function afficher(e) {
    if (S.renommage) { S.etat = e; return; }   // le formulaire du nom reste à l'écran
    var precedent = S.etat;
    S.etat = e;
    if (e.phase === 'exclu') { ecrire(CLE, null); return ecranMessage('Tu n\'es plus dans cette partie', 'Le professeur t\'a retiré de la partie, ou elle a été supprimée.'); }
    if (e.phase === 'expiree') { ecrire(CLE, null); return ecranMessage('Partie terminée', 'Cette partie est trop ancienne.'); }

    if (e.phase === 'question' && typeof e.reste_ms === 'number') {
      var ech = performance.now() + e.reste_ms;
      // on ne recule l'échéance que d'un écart net : pas de chrono qui tressaute
      if (!precedent || precedent.idx !== e.idx || precedent.phase !== 'question' || Math.abs(ech - S.echeance) > 700) S.echeance = ech;
    }
    if (!precedent || precedent.idx !== e.idx || precedent.phase !== e.phase) {
      if (e.phase === 'question' && (!precedent || precedent.idx !== e.idx)) { S.brouillon = {}; S.sur = false; S.envoi = false; }
    }
    var repondu = !!(e.ma_reponse || S.envoye[e.idx]);
    var cle = [e.phase, e.idx, e.version, repondu ? 1 : 0].join('|');
    if (cle === S.cle) { majChrono(); return; }
    S.cle = cle;
    clearInterval(S.chronoTimer);
    if (e.phase === 'accueil') ecranAttente(e);
    else if (e.phase === 'question') repondu ? ecranEnvoye(e) : ecranQuestion(e);
    else if (e.phase === 'correction') ecranCorrection(e);
    else if (e.phase === 'fin') ecranFin(e);
    window.scrollTo(0, 0);
  }

  function ecranMessage(titre, texte) {
    arreter(); S.cle = 'message';
    app.innerHTML = '<div class="attente"><h1 class="titre-affiche">' + esc(titre) + '</h1><p class="note">' + esc(texte) + '</p>' +
      '<button class="bouton" type="button" id="b-autre">Rejoindre une autre partie</button></div>';
    $('#b-autre').onclick = quitter;
  }

  function ecranAttente(e) {
    if (e.mode === 'solo') {
      app.innerHTML =
        '<div class="attente">' +
          '<p class="capitales">Entraînement</p>' +
          '<h1 class="titre-affiche">' + esc(e.titre) + '</h1>' +
          '<p class="filet">' + e.total + ' question' + (e.total > 1 ? 's' : '') + ', à ton rythme. Après chaque réponse, la correction s\'affiche.</p>' +
          '<p class="erreur" id="err"></p>' +
          '<button class="bouton rouge" type="button" id="b-go">Commencer</button>' +
          '<button class="lien-bouton" type="button" id="b-quitter">Ce n\'est pas mon nom</button>' +
        '</div>';
      $('#b-go').onclick = function () { avancer('suivante', this); };
      $('#b-quitter').onclick = renommer;
      return;
    }
    app.innerHTML =
      '<div class="attente">' +
        '<p class="capitales">Bienvenue dans la partie</p>' +
        '<h1 class="titre-affiche">' + esc(e.pseudo) + '</h1>' +
        '<p class="filet capitales">' + esc(e.titre) + '</p>' +
        '<p><span class="point-attente" aria-hidden="true"></span> Regarde le tableau : la partie va commencer.</p>' +
        '<p class="note">' + e.joueurs + ' joueur' + (e.joueurs > 1 ? 's' : '') + ' dans la partie.</p>' +
        '<button class="lien-bouton" type="button" id="b-quitter">Ce n\'est pas mon nom</button>' +
      '</div>';
    $('#b-quitter').onclick = renommer;
  }

  function teteQuestion(e) {
    var q = e.question;
    return '<div class="tete-q"><span>Question ' + (e.idx + 1) + ' / ' + e.total + '</span><span>' + esc(q.notion || '') + '</span></div>' +
      '<p class="enonce">' + Q.rendre(q.enonce) + '</p>' +
      (q.image && Q.urlImage(q.image.src) && q.type !== 'zone'
        ? '<img src="' + esc(Q.urlImage(q.image.src)) + '" alt="' + esc(q.image.alt || '') + '" style="max-width:100%;border:2px solid var(--encre)">' : '');
  }

  function chronoHtml() { return '<div class="chrono" aria-hidden="true"><i id="barre"></i></div>'; }
  function majChrono() {
    var b = $('#barre'); if (!b || !S.etat || S.etat.phase !== 'question') return;
    var duree = (S.etat.question.temps || 20) * 1000, reste = Math.max(0, S.echeance - performance.now());
    b.style.transform = 'scaleX(' + Math.min(1, reste / duree).toFixed(3) + ')';
    if (reste <= 0 && !S.envoi && !S.envoye[S.etat.idx]) {
      var z = $('#saisie'); if (z && !z.dataset.fini) { z.dataset.fini = '1'; finTemps(); }
    }
  }
  function lancerChrono() { majChrono(); S.chronoTimer = setInterval(majChrono, 200); }

  function pariHtml(e) {
    if (!e.pari) return '';
    return '<label class="pari" id="pari"><input type="checkbox" id="c-pari"' + (S.sur ? ' checked' : '') + '>' +
      '<span><b>Je suis sûr de moi</b> — bonus de 25 % si c\'est juste, 200 points perdus sinon.</span></label>';
  }
  function brancherPari() {
    var c = $('#c-pari'); if (!c) return;
    c.onchange = function () { S.sur = c.checked; $('#pari').classList.toggle('actif', c.checked); };
  }

  function ecranQuestion(e) {
    var q = e.question, h = teteQuestion(e) + chronoHtml() + '<div id="saisie">';
    if (q.type === 'qcm' || q.type === 'vf') {
      var une = q.options.some(function (o) { return String(o).length > 38; });
      h += '<div class="grille-rep' + (une || q.options.length > 4 ? ' une-colonne' : '') + '" id="grille">' +
        q.options.map(function (o, i) {
          return '<button type="button" class="rep c' + i + '" data-i="' + i + '"' + (q.multiple ? ' aria-pressed="false"' : '') + '>' +
            '<span class="lettre">' + Q.LETTRES[i] + '</span><span class="texte">' + Q.rendre(o) + '</span></button>';
        }).join('') + '</div>';
      if (q.multiple) h += '<p class="note">Plusieurs réponses sont justes : coche-les toutes, puis valide.</p><button class="bouton" type="button" id="b-valider" disabled>Valider</button>';
    } else if (q.type === 'num') {
      var unites = q.unites || [];
      h += '<div class="saisie-num' + (unites.length ? '' : ' sans-unite') + '">' +
        '<div class="champ"><label for="n-val">Valeur</label><input id="n-val" inputmode="decimal" autocomplete="off" placeholder="ex. 1,5 ou 2,4×10^3"></div>' +
        // une seule unité proposée : elle est imposée (conversion demandée)
        (unites.length ? '<div class="champ"><label for="n-unite">Unité' + (unites.length === 1 ? ' imposée' : '') + '</label><select id="n-unite"' + (unites.length === 1 ? ' disabled' : '') + '>' + (unites.length === 1 ? '' : '<option value="">—</option>') +
          unites.map(function (u) { return '<option>' + esc(u) + '</option>'; }).join('') + '</select></div>' : '') +
        '</div><p class="apercu-num" id="n-apercu"></p><button class="bouton" type="button" id="b-valider" disabled>Valider</button>';
    } else if (q.type === 'ordre') {
      h += '<p class="note">Touche les éléments dans le bon ordre. Touche à nouveau pour retirer.</p><ul class="ordre-liste" id="ordre">' +
        q.items.map(function (it) {
          return '<li><button type="button" data-id="' + it.id + '"><span class="rang"></span><span>' + Q.rendre(it.texte) + '</span></button></li>';
        }).join('') + '</ul><button class="bouton" type="button" id="b-valider" disabled>Valider</button>';
    } else if (q.type === 'zone') {
      h += '<p class="note">Touche l\'endroit sur l\'image, puis valide.</p><div class="zone-cadre" id="zone"><img src="' + esc(Q.urlImage(q.zone.src)) + '" alt="' + esc(q.zone.alt || '') + '"></div>' +
        '<button class="bouton" type="button" id="b-valider" disabled>Valider</button>';
    } else if (q.type === 'assoc') {
      h += '<p class="note">Touche un élément à gauche, puis son partenaire à droite. Touche une paire pour la défaire.</p>' +
        '<div class="assoc" id="assoc"><div class="col"><h4>À relier</h4>' +
          q.gauche.map(function (t, i) { return '<button type="button" data-g="' + i + '"><span class="pastille"></span><span>' + Q.rendre(t) + '</span></button>'; }).join('') +
        '</div><div class="col"><h4>Avec</h4>' +
          q.droite.map(function (t, i) { return '<button type="button" data-d="' + i + '"><span class="pastille"></span><span>' + Q.rendre(t) + '</span></button>'; }).join('') +
        '</div></div><button class="bouton" type="button" id="b-valider" disabled>Valider</button>';
    } else if (q.type === 'mot') {
      h += '<div class="champ saisie-mot"><label for="m-val">Ta réponse' + (q.indice ? ' <span class="note">(' + esc(q.indice) + ')</span>' : '') + '</label>' +
        '<input id="m-val" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="60"></div>' +
        '<button class="bouton" type="button" id="b-valider" disabled>Valider</button>';
    } else if (q.type === 'curseur') {
      var cu = q.curseur, pas = cu.pas || 1;
      var milieu = cu.min + Math.round((cu.max - cu.min) / 2 / pas) * pas;
      h += '<div class="curseur"><div class="valeur" aria-live="polite"><span id="c-aff"></span><small>' + esc(cu.unite || '') + '</small></div>' +
        '<input type="range" id="c-val" min="' + cu.min + '" max="' + cu.max + '" step="' + pas + '" value="' + milieu + '" aria-label="Ta réponse">' +
        '<div class="bornes"><span>' + Q.ecrireNombre(cu.min) + '</span><span>' + Q.ecrireNombre(cu.max) + '</span></div></div>' +
        '<button class="bouton" type="button" id="b-valider">Valider</button>';
    }
    h += pariHtml(e) + '<p class="erreur" id="err"></p></div>';
    app.innerHTML = h;
    brancherPari();
    brancherSaisie(e);
    lancerChrono();
  }

  function brancherSaisie(e) {
    var q = e.question, valider = $('#b-valider');
    if (q.type === 'qcm' || q.type === 'vf') {
      app.querySelectorAll('#grille .rep').forEach(function (b) {
        b.onclick = function () {
          var i = +b.dataset.i;
          if (!q.multiple) return envoyer({ choix: [i] }, b);
          var c = S.brouillon.choix = S.brouillon.choix || [];
          var k = c.indexOf(i); if (k < 0) c.push(i); else c.splice(k, 1);
          b.setAttribute('aria-pressed', k < 0 ? 'true' : 'false');
          valider.disabled = c.length === 0;
        };
      });
      if (valider) valider.onclick = function () { envoyer({ choix: S.brouillon.choix.slice().sort() }); };
    } else if (q.type === 'num') {
      var champ = $('#n-val'), unite = $('#n-unite'), apercu = $('#n-apercu');
      var maj = function () {
        var v = Q.lireNombre(champ.value);
        apercu.textContent = champ.value.trim() === '' ? '' : isNaN(v) ? 'Je ne lis pas ce nombre.' : 'Lu : ' + Q.ecrireNombre(v) + (unite && unite.value ? ' ' + unite.value : '');
        valider.disabled = isNaN(v) || (unite && !unite.value);
      };
      champ.oninput = maj; if (unite) unite.onchange = maj;
      champ.onkeydown = function (ev) { if (ev.key === 'Enter' && !valider.disabled) valider.click(); };
      valider.onclick = function () {
        var r = { valeur: Q.lireNombre(champ.value) };
        if (unite) r.unite = unite.value;
        envoyer(r);
      };
    } else if (q.type === 'ordre') {
      var ordre = S.brouillon.ordre = [];
      var peindre = function () {
        app.querySelectorAll('#ordre button').forEach(function (b) {
          var k = ordre.indexOf(+b.dataset.id);
          b.classList.toggle('pris', k >= 0); b.querySelector('.rang').textContent = k >= 0 ? k + 1 : '';
        });
        valider.disabled = ordre.length !== q.items.length;
      };
      app.querySelectorAll('#ordre button').forEach(function (b) {
        b.onclick = function () {
          var id = +b.dataset.id, k = ordre.indexOf(id);
          if (k >= 0) ordre.splice(k, 1); else ordre.push(id);
          peindre();
        };
      });
      valider.onclick = function () { envoyer({ ordre: ordre.slice() }); };
    } else if (q.type === 'zone') {
      var cadre = $('#zone'), img = cadre.querySelector('img');
      cadre.onclick = function (ev) {
        var r = img.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width * 100, y = (ev.clientY - r.top) / r.height * 100;
        if (x < 0 || y < 0 || x > 100 || y > 100) return;
        S.brouillon.point = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
        var m = cadre.querySelector('.marque-zone') || cadre.appendChild(document.createElement('span'));
        m.className = 'marque-zone'; m.style.left = x + '%'; m.style.top = y + '%';
        valider.disabled = false;
      };
      valider.onclick = function () { envoyer(S.brouillon.point); };
    } else if (q.type === 'assoc') {
      // paires : gauche → position à droite ; chaque paire garde sa couleur
      var paires = S.brouillon.paires = {}, choixG = null;
      var peindreA = function () {
        var rangs = Object.keys(paires).map(Number).sort(function (a, b) { return a - b; });
        app.querySelectorAll('#assoc button').forEach(function (b) {
          b.className = ''; b.querySelector('.pastille').textContent = '';
          var g = b.dataset.g != null ? +b.dataset.g : null, d = b.dataset.d != null ? +b.dataset.d : null, k = -1;
          if (g != null && paires[g] != null) k = rangs.indexOf(g);
          if (d != null) rangs.forEach(function (gg, kk) { if (paires[gg] === d) k = kk; });
          if (k >= 0) { b.classList.add('lie', 'p' + (k % 6)); b.querySelector('.pastille').textContent = k + 1; }
          if (g != null && g === choixG) b.classList.add('choisi');
        });
        valider.disabled = rangs.length !== q.gauche.length;
      };
      app.querySelectorAll('#assoc button').forEach(function (b) {
        b.onclick = function () {
          if (b.dataset.g != null) {
            var g = +b.dataset.g;
            if (paires[g] != null) { delete paires[g]; choixG = null; }
            else choixG = choixG === g ? null : g;
          } else {
            var d = +b.dataset.d, deja = null;
            Object.keys(paires).forEach(function (gg) { if (paires[gg] === d) deja = gg; });
            if (deja != null) delete paires[deja];
            else if (choixG != null) { paires[choixG] = d; choixG = null; }
          }
          peindreA();
        };
      });
      peindreA();
      valider.onclick = function () {
        envoyer({ paires: Object.keys(paires).map(function (g) { return [+g, paires[g]]; }) });
      };
    } else if (q.type === 'mot') {
      var champM = $('#m-val');
      champM.oninput = function () { valider.disabled = champM.value.trim() === ''; };
      champM.onkeydown = function (ev) { if (ev.key === 'Enter' && !valider.disabled) valider.click(); };
      valider.onclick = function () { envoyer({ texte: champM.value.trim() }); };
      champM.focus();
    } else if (q.type === 'curseur') {
      var r = $('#c-val'), aff = $('#c-aff');
      var majC = function () { aff.textContent = Q.ecrireNombre(+r.value); };
      r.oninput = majC; majC();
      valider.onclick = function () { envoyer({ valeur: +r.value }); };
    }
  }

  function envoyer(reponse, bouton) {
    if (S.envoi || !S.etat || S.etat.phase !== 'question') return;
    S.envoi = true;
    var idx = S.etat.idx;
    var grille = $('#grille');
    if (grille && bouton) { bouton.classList.add('choisi'); grille.classList.add('envoye'); }
    app.querySelectorAll('#saisie button, #saisie input, #saisie select').forEach(function (b) { b.disabled = true; });
    Q.rpc('quiz_repondre', { p_jeton: S.joueur.jeton, p_idx: idx, p_reponse: reponse, p_sur: !!S.sur }, true).then(function () {
      S.envoye[idx] = true; S.envoi = false;
      if (solo()) return relire();          // la correction est déjà prête
      if (S.etat.idx === idx) { S.cle = ''; afficher(S.etat); }
    }).catch(function (err) {
      S.envoi = false;
      var m = String(err && err.message);
      if (/QUIZ_DEJA_REPONDU/.test(m)) { S.envoye[idx] = true; S.cle = ''; return afficher(S.etat); }
      if (/QUIZ_TROP_TARD/.test(m)) return finTemps();
      // erreur réseau : on laisse réessayer
      if (grille) grille.classList.remove('envoye');
      if (bouton) bouton.classList.remove('choisi');
      app.querySelectorAll('#saisie button, #saisie input, #saisie select').forEach(function (b) { b.disabled = false; });
      var e = $('#err'); if (e) e.textContent = Q.messageErreur(err) + ' Réessaie.';
    });
  }

  function finTemps() {
    clearInterval(S.chronoTimer);
    if (solo()) return avancer('corriger');
    var z = $('#saisie');
    if (z) z.innerHTML = '<div class="envoye-msg"><b>Temps écoulé.</b><br>La correction arrive au tableau.</div>';
  }

  function ecranEnvoye(e) {
    app.innerHTML = teteQuestion(e) + chronoHtml() +
      '<div class="envoye-msg"><b>Réponse envoyée' + (e.sur || S.sur ? ' — tu as parié' : '') + '.</b><br>' +
      '<span class="point-attente" aria-hidden="true"></span> Attends la correction au tableau.</div>';
    lancerChrono();
  }

  function bonneReponseHtml(e) {
    var q = e.question, c = e.correction;
    if (q.type === 'qcm' || q.type === 'vf') {
      return (c.correct || []).map(function (i) {
        return '<p><b>' + Q.FORMES[i] + ' ' + Q.LETTRES[i] + '</b> · ' + Q.rendre(q.options[i]) + '</p>';
      }).join('');
    }
    if (q.type === 'num') {
      var t = Q.ecrireNombre(c.valeur) + (c.unite ? ' ' + esc(c.unite) : '');
      (c.autres || []).forEach(function (a) { t += ' <span class="note">(ou ' + Q.ecrireNombre(a.valeur) + ' ' + esc(a.unite || '') + ')</span>'; });
      var m = e.ma_reponse;
      return '<p><b>' + t + '</b></p>' + (m && typeof m.valeur === 'number' ? '<p class="note">Ta réponse : ' + Q.ecrireNombre(m.valeur) + ' ' + esc(m.unite || '') + '</p>' : '');
    }
    if (q.type === 'ordre') {
      return '<ol style="margin:0;padding-left:1.4em">' + (c.items || []).map(function (t) { return '<li>' + Q.rendre(t) + '</li>'; }).join('') + '</ol>';
    }
    if (q.type === 'zone') {
      var h = '<div class="zone-cadre" style="cursor:default"><img src="' + esc(Q.urlImage(q.zone.src)) + '" alt="' + esc(q.zone.alt || '') + '">';
      (c.cibles || []).forEach(function (z) { h += '<span class="cible" style="left:' + z.x + '%;top:' + z.y + '%;width:' + z.l + '%;height:' + z.h + '%"></span>'; });
      if (e.ma_reponse && typeof e.ma_reponse.x === 'number') h += '<span class="marque-zone" style="left:' + e.ma_reponse.x + '%;top:' + e.ma_reponse.y + '%"></span>';
      return h + '</div>';
    }
    if (q.type === 'assoc') {
      return '<ul class="assoc-corr">' + (c.paires || []).map(function (p) {
        return '<li><span>' + Q.rendre(p[0]) + '</span><b>→</b><span>' + Q.rendre(p[1]) + '</span></li>';
      }).join('') + '</ul>';
    }
    if (q.type === 'mot') {
      var a = c.acceptes || [], mr = e.ma_reponse;
      return '<p><b>' + esc(a[0] || '') + '</b>' + (a.length > 1 ? ' <span class="note">(accepté aussi : ' + esc(a.slice(1).join(', ')) + ')</span>' : '') + '</p>' +
        (mr && mr.texte ? '<p class="note">Ta réponse : ' + esc(mr.texte) + '</p>' : '');
    }
    if (q.type === 'curseur') {
      var u = c.unite ? ' ' + esc(c.unite) : '', m2 = e.ma_reponse;
      return '<p><b>' + Q.ecrireNombre(c.valeur) + u + '</b>' + (c.tolerance ? ' <span class="note">(± ' + Q.ecrireNombre(c.tolerance) + u + ' acceptés)</span>' : '') + '</p>' +
        (m2 && typeof m2.valeur === 'number' ? '<p class="note">Ta réponse : ' + Q.ecrireNombre(m2.valeur) + u + '</p>' : '');
    }
    return '';
  }

  function ecranCorrection(e) {
    var c = e.correction || {};
    var part = /^partiel:(\d+)$/.exec(c.categorie || '');
    var v = !c.repondu ? ['rien', 'Pas de réponse', 'Le temps est passé.']
          : c.juste ? ['juste', 'Juste !', '+ ' + c.points + ' points']
          : c.points > 0 ? ['partiel', 'Presque !', (part ? part[1] + ' paire' + (+part[1] > 1 ? 's' : '') + ' juste' + (+part[1] > 1 ? 's' : '') + ' sur ' + e.question.gauche.length + ' · ' : '') + '+ ' + c.points + ' points']
          : ['faux', 'Raté', c.points < 0 ? c.points + ' points (pari perdu)' : 'Pas de point cette fois'];
    app.innerHTML =
      '<div class="tete-q"><span>Question ' + (e.idx + 1) + ' / ' + e.total + '</span><span>' + esc(e.question.notion || '') + '</span></div>' +
      '<div class="verdict ' + v[0] + '"><div class="titre-affiche">' + v[1] + '</div><p>' + esc(v[2]) + '</p></div>' +
      (c.pourquoi && !c.juste ? '<div class="encart rouge"><h3>Pourquoi ce n\'est pas ça</h3><p>' + Q.rendre(c.pourquoi) + '</p></div>' : '') +
      (c.juste ? '' : '<div class="encart"><h3>La bonne réponse</h3>' + bonneReponseHtml(e) + '</div>') +
      (c.cours || (c.revoir && !c.juste) ? '<div class="encart"><h3>À retenir</h3>' + (c.cours ? '<p>' + Q.rendre(c.cours) + '</p>' : '') +
        // 052 : l'erreur renvoie à la partie du cours qui la réexplique
        (!c.juste ? Q.revoirHtml(c.revoir) : '') + '</div>' : '') +
      (e.mode === 'solo'
        ? '<div class="score-ligne"><span>Ton score<br><b>' + e.score + '</b></span><span style="text-align:right">Question<br><b>' + (e.idx + 1) + '</b> / ' + e.total + '</span></div>' +
          '<p class="erreur" id="err"></p>' +
          '<button class="bouton rouge" type="button" id="b-suite">' + (e.idx + 1 < e.total ? 'Question suivante' : 'Voir mon bilan') + '</button>'
        : '<div class="score-ligne"><span>Ton score<br><b>' + e.score + '</b></span><span style="text-align:right">Rang<br><b>' + e.rang + '</b> / ' + e.joueurs + '</span></div>');
    var b = $('#b-suite'); if (b) b.onclick = function () { avancer('suivante', b); };
  }

  function ecranFin(e) {
    arreter();
    var b = e.bilan || { justes: 0, notions: [] };
    if (e.mode === 'solo') return ecranFinSolo(e, b);
    app.innerHTML =
      '<div class="attente" style="margin:0">' +
        '<p class="capitales">Partie terminée</p>' +
        '<h1 class="titre-affiche">' + (e.rang === 1 ? 'Victoire&nbsp;!' : e.rang <= 3 ? 'Sur le podium&nbsp;!' : 'Bien joué') + '</h1>' +
      '</div>' +
      '<div class="score-ligne"><span>Score<br><b>' + e.score + '</b></span><span style="text-align:center">Réussite<br><b>' + b.justes + '</b> / ' + e.total + '</span><span style="text-align:right">Rang<br><b>' + e.rang + '</b> / ' + e.joueurs + '</span></div>' +
      (b.notions.length
        ? '<div class="encart"><h3>À revoir en priorité</h3><ul class="bilan-notions">' + b.notions.map(function (n) {
            return '<li><span>' + esc(n.notion) + '</span><span>' + n.ratees + ' / ' + n.sur + ' ratée' + (n.ratees > 1 ? 's' : '') + '</span>' +
            // 052 : où c'est réexpliqué dans le cours
            (n.revoir || []).map(function (r) { return Q.revoirHtml(r); }).join('') + '</li>';
          }).join('') + '</ul></div>'
        : '<div class="encart"><h3>Bilan</h3><p>Tout est juste : rien à revoir sur ce quiz.</p></div>') +
      '<button class="bouton creux" type="button" id="b-fin">Quitter</button>' +
      '<p style="text-align:center"><a href="entrainement.html">D\'autres quiz pour s\'entraîner →</a></p>';
    $('#b-fin').onclick = quitter;
  }

  function notionsHtml(b) {
    return b.notions.length
      ? '<div class="encart"><h3>À revoir en priorité</h3><ul class="bilan-notions">' + b.notions.map(function (n) {
          return '<li><span>' + esc(n.notion) + '</span><span>' + n.ratees + ' / ' + n.sur + ' ratée' + (n.ratees > 1 ? 's' : '') + '</span>' +
            // 052 : où c'est réexpliqué dans le cours
            (n.revoir || []).map(function (r) { return Q.revoirHtml(r); }).join('') + '</li>';
        }).join('') + '</ul></div>'
      : '<div class="encart"><h3>Bilan</h3><p>Tout est juste : rien à revoir sur ce quiz.</p></div>';
  }

  function ecranFinSolo(e, b) {
    var pseudo = e.pseudo;
    app.innerHTML =
      '<div class="attente" style="margin:0">' +
        '<p class="capitales">Entraînement terminé</p>' +
        '<h1 class="titre-affiche">' + (b.justes === e.total ? 'Sans faute&nbsp;!' : 'Bien joué') + '</h1>' +
      '</div>' +
      '<div class="score-ligne"><span>Score<br><b>' + e.score + '</b></span><span style="text-align:right">Réussite<br><b>' + b.justes + '</b> / ' + e.total + '</span></div>' +
      notionsHtml(b) +
      '<p class="erreur" id="err"></p>' +
      (S.joueur && S.joueur.salle ? '<button class="bouton rouge" type="button" id="b-encore">Recommencer</button>' : '') +
      '<button class="bouton creux" type="button" id="b-fin">Quitter</button>';
    var r = $('#b-encore');
    if (r) r.onclick = function () { S.salle = S.joueur.salle; entrainer(pseudo, r); };
    $('#b-fin').onclick = quitter;
  }

  /* ---------------- démarrage ---------------- */
  Q.poserNom();
  var garde = lire(CLE), pin = pinDeLAdresse();
  S.salle = salleDeLAdresse() || (garde && !pin && garde.salle) || '';
  if (salleDeLAdresse()) {
    // QR code fixe : on reprend la partie gardée si elle vient de cette
    // salle, sinon on demande le nom (la base dira s'il y a une partie)
    if (garde && garde.jeton && garde.salle === S.salle) { S.joueur = garde; demarrer(); }
    else ecranSalle('');
  } else if (garde && garde.jeton && (!pin || pin === garde.pin)) {
    S.joueur = garde;
    if (pin) history.replaceState(null, '', location.pathname);
    demarrer();
  } else {
    ecranEntree('');
  }
})();
