/* ============================================================
 *  quiz-commun.js — ce que partagent la page élève, l'écran
 *  projeté et les statistiques
 *  ------------------------------------------------------------
 *  1. Réglages (NOM de l'outil, base Supabase)
 *  2. Petits outils
 *  3. Rendu du texte : échappé, formules KaTeX entre $…$
 *  4. Client Supabase minimal (fetch) + session enseignant
 *  5. Temps réel : un « réveil » diffusé, l'état se relit en base
 *  6. Messages d'erreur lisibles
 *
 *  🔴 RIEN ne se charge depuis un CDN : KaTeX, polices et
 *  supabase-js sont servis par le site.
 *  🔴 Un énoncé est écrit par un enseignant mais lu sur le
 *  téléphone des élèves : il n'est JAMAIS injecté comme HTML.
 *  Tout passe par rendre(), qui échappe le texte et confie les
 *  formules à KaTeX (trust: false).
 * ============================================================ */
(function (global) {
  'use strict';

  /* ----------------------------------------------------------
   *  1. Réglages
   *  Le NOM de l'outil vit ici et nulle part ailleurs : le changer
   *  ici le change partout (titres de page compris).
   * ---------------------------------------------------------- */
  var NOM = 'Diapason';

  /* ⚠ Dupliqués depuis assets/js/progression.js (comme Padago). */
  var URL_PROJET = 'https://ztyvuiaohxekuyjeoaxz.supabase.co';
  var CLE_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eXZ1aWFvaHhla3V5amVvYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDQzNTIsImV4cCI6MjEwMDEyMDM1Mn0.iBBZiAIec0hSxzAU8FKNe6AO-HeysuxBKXduURBP7Hc';

  /* Session enseignant : clé propre à l'outil, distincte de
     'snt.prof' (tableau de bord) et 'padago.session'. 12 h comme
     le tableau de bord : les statistiques portent des pseudonymes. */
  var CLE_SESSION = 'quiz.prof';
  var PEREMPTION = 12 * 3600000;

  /* Adresse que les élèves ouvrent (QR code et texte projeté). */
  function urlEleve(pin) {
    var u = new URL('./', global.location.href);
    return u.href + (pin ? '?pin=' + pin : '');
  }
  /* L'adresse FIXE d'un quiz (QR code des diapositives et des fiches) :
     l'élève y attend la partie de l'auteur, ou s'entraîne seul. */
  function urlSalle(code) {
    return new URL('./', global.location.href).href + '?salle=' + code;
  }

  /* ----------------------------------------------------------
   *  2. Petits outils
   * ---------------------------------------------------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function $(sel, racine) { return (racine || document).querySelector(sel); }
  function $$(sel, racine) { return Array.prototype.slice.call((racine || document).querySelectorAll(sel)); }

  var LETTRES = ['A', 'B', 'C', 'D', 'E', 'F'];
  /* Une forme par réponse, en plus de la couleur : lisible par un
     élève daltonien, et sur un projecteur qui délave les teintes. */
  var FORMES = ['▲', '◆', '●', '■', '★', '⬟'];

  /* « 1,5 × 10^3 », « 1.5e3 », « 1 500 », « −2,4 » → nombre, ou NaN. */
  function lireNombre(s) {
    s = String(s == null ? '' : s).trim()
      .replace(/[\s  ]/g, '')
      .replace(/[−–]/g, '-')
      .replace(/,/g, '.')
      .replace(/(?:[×x*]|\.)10\^?\(?([+-]?\d+)\)?$/i, 'e$1')
      .replace(/^10\^?\(?([+-]?\d+)\)?$/, '1e$1');
    if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return NaN;
    return parseFloat(s);
  }
  /* 19.62 → « 19,62 » ; 0.000012 → « 1,2 × 10⁻⁵ » */
  function ecrireNombre(v) {
    if (v == null || isNaN(v)) return '';
    var a = Math.abs(v);
    if (a !== 0 && (a < 1e-3 || a >= 1e6)) {
      var e = Math.floor(Math.log10(a)), m = v / Math.pow(10, e);
      var exp = String(e).replace(/-/g, '⁻').replace(/\d/g, function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]; });
      return (+m.toPrecision(4)).toString().replace('.', ',') + ' × 10' + exp;
    }
    return (+v.toPrecision(6)).toLocaleString('fr-FR', { maximumFractionDigits: 6 });
  }

  /* Une image vient du site (chemin relatif à sa racine) ou d'une
     adresse https. Rien d'autre : ni data:, ni javascript:. */
  var RACINE_SITE = new URL('../../', document.currentScript ? document.currentScript.src : global.location.href).href;
  function urlImage(src) {
    src = String(src || '').trim();
    if (/^https:\/\/[^\s"'<>]+$/i.test(src)) return src;
    if (/^[a-z0-9][a-z0-9/._-]*\.(png|jpe?g|webp|gif|svg)$/i.test(src) && src.indexOf('..') < 0) return RACINE_SITE + src;
    return '';
  }
  /* « À revoir » (052) : une page de cours du site, avec son ancre
     (#sN : une séance, #etape-<clé> : une étape), ou une adresse https. */
  function urlCours(lien) {
    lien = String(lien || '').trim();
    if (/^https:\/\/[^\s"'<>]+$/i.test(lien)) return lien;
    if (/^[a-z0-9][a-z0-9\/._-]*\.html(#[A-Za-z0-9_-]+)?$/i.test(lien) && lien.indexOf('..') < 0) return RACINE_SITE + lien;
    return '';
  }
  /* Le lien affiché : « Revoir : <texte> → » ; rien si le lien est refusé. */
  function revoirHtml(r, classe) {
    var u = r && urlCours(r.lien);
    if (!u) return '';
    return '<a class="' + (classe || 'revoir') + '" href="' + esc(u) + '" target="_blank" rel="noopener">Revoir : ' + esc(r.texte || 'la partie du cours') + ' →</a>';
  }
  /* Le filigrane d'un dossier (051) : les mêmes adresses, plus une petite
     image déposée depuis l'ordinateur (data:image/…;base64), rangée en base. */
  function urlFiligrane(src) {
    src = String(src || '').trim();
    if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(src)) return src;
    return urlImage(src);
  }

  /* ----------------------------------------------------------
   *  3. Rendu du texte
   *  Le texte est coupé aux $…$ ; les morceaux de texte sont
   *  échappés (avec **gras** et retours à la ligne), les morceaux
   *  de formule passent par KaTeX. \$ écrit un dollar.
   * ---------------------------------------------------------- */
  function rendreTexte(t) {
    return esc(t)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
  function rendre(s) {
    s = String(s == null ? '' : s);
    var morceaux = s.replace(/\\\$/g, '\u0000').split('$'), html = '';
    for (var i = 0; i < morceaux.length; i++) {
      var m = morceaux[i].replace(/\u0000/g, '$');
      if (i % 2 === 0 || i === morceaux.length - 1 && morceaux.length % 2 === 0) {
        html += (i % 2 === 1 ? '$' : '') + rendreTexte(m);
      } else if (global.katex) {
        try {
          html += global.katex.renderToString(m, { throwOnError: false, trust: false, strict: 'ignore', output: 'htmlAndMathml' });
        } catch (e) { html += rendreTexte(m); }
      } else {
        html += '<span class="tex-brut">' + esc(m) + '</span>';
      }
    }
    return html;
  }

  /* ----------------------------------------------------------
   *  4. Client Supabase
   * ---------------------------------------------------------- */
  var jeton = null;   // { access_token, refresh_token, expires_at, ouverte, email }

  function lireJeton() {
    try {
      var v = JSON.parse(global.localStorage.getItem(CLE_SESSION) || 'null');
      if (!v || !v.ouverte || Date.now() - v.ouverte > PEREMPTION) {
        global.localStorage.removeItem(CLE_SESSION); return null;
      }
      return v;
    } catch (e) { return null; }
  }
  function ecrireJeton(v) {
    try {
      if (v) global.localStorage.setItem(CLE_SESSION, JSON.stringify(v));
      else global.localStorage.removeItem(CLE_SESSION);
    } catch (e) { /* navigation privée : on reste en mémoire */ }
  }
  function poser(d, ouverte) {
    jeton = {
      access_token: d.access_token, refresh_token: d.refresh_token,
      expires_at: (d.expires_at ? d.expires_at * 1000 : Date.now() + (d.expires_in || 3600) * 1000) - 60000,
      ouverte: ouverte || Date.now(),
      email: (d.user && d.user.email) || (jeton && jeton.email) || ''
    };
    ecrireJeton(jeton);
  }
  function entetes(avecJeton) {
    return {
      apikey: CLE_ANON, 'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (avecJeton && jeton ? jeton.access_token : CLE_ANON)
    };
  }
  function lireReponse(r) {
    return r.text().then(function (t) {
      var d = null;
      try { d = t ? JSON.parse(t) : null; } catch (e) { d = t; }
      if (!r.ok) {
        var m = (d && (d.error_description || d.msg || d.message || d.error_code)) || ('HTTP ' + r.status);
        var err = new Error(m); err.statut = r.status; err.code = d && (d.error_code || d.code); throw err;
      }
      return d;
    });
  }
  function auth(chemin, corps) {
    return fetch(URL_PROJET + '/auth/v1/' + chemin, {
      method: 'POST', headers: entetes(false), body: JSON.stringify(corps || {})
    }).then(lireReponse);
  }
  function assure() {
    if (!jeton) jeton = lireJeton();
    if (!jeton) return Promise.reject(new Error('SESSION_EXPIREE'));
    if (Date.now() < jeton.expires_at) return Promise.resolve();
    var ouverte = jeton.ouverte;
    return auth('token?grant_type=refresh_token', { refresh_token: jeton.refresh_token })
      .then(function (d) { poser(d, ouverte); })
      .catch(function () { deconnecter(); throw new Error('SESSION_EXPIREE'); });
  }
  function rest(chemin, options) {
    options = options || {};
    return assure().then(function () {
      var h = entetes(true);
      if (options.prefer) h.Prefer = options.prefer;
      return fetch(URL_PROJET + '/rest/v1/' + chemin, {
        method: options.methode || 'GET', headers: h,
        body: options.corps ? JSON.stringify(options.corps) : undefined
      });
    }).then(lireReponse);
  }
  /* anonyme = true pour l'élève : la clé publique seule, sans session. */
  function rpc(nom, params, anonyme) {
    var p = anonyme ? Promise.resolve() : assure();
    return p.then(function () {
      return fetch(URL_PROJET + '/rest/v1/rpc/' + nom, {
        method: 'POST', headers: entetes(!anonyme), body: JSON.stringify(params || {})
      });
    }).then(lireReponse);
  }
  function connecter(email, mdp) {
    return auth('token?grant_type=password', { email: String(email || '').trim(), password: mdp })
      .then(function (d) { poser(d); return rpc('est_enseignant', {}); })
      .then(function (ok) {
        if (ok !== true) { deconnecter(); throw new Error('QUIZ_PAS_ENSEIGNANT'); }
        return true;
      });
  }
  function deconnecter() {
    var j = jeton; jeton = null; ecrireJeton(null);
    if (j && j.access_token) {
      fetch(URL_PROJET + '/auth/v1/logout', { method: 'POST', headers: { apikey: CLE_ANON, Authorization: 'Bearer ' + j.access_token } })
        .catch(function () {});
    }
  }
  function session() { if (!jeton) jeton = lireJeton(); return jeton; }
  function monUid() {
    try {
      var p = session().access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(p + '==='.slice((p.length + 3) % 4))).sub || '';
    } catch (e) { return ''; }
  }

  /* L'écran de connexion des pages enseignant (animer, stats).
     Les comptes sont ceux du tableau de bord : aucun compte neuf. */
  function exigerConnexion(conteneur, suite) {
    var moi = document.getElementById('moi'), deco = document.getElementById('b-deco');
    function pret() {
      if (moi) moi.textContent = session().email || '';
      if (deco) { deco.hidden = false; deco.onclick = function () { deconnecter(); location.reload(); }; }
      // RGPD : à chaque ouverture, les pseudonymes de plus de 30 jours partent
      rpc('quiz_anonymiser', {}).catch(function () {});
      suite();
    }
    if (session()) return pret();
    conteneur.innerHTML =
      '<form class="connexion cadre-double" id="f-cnx">' +
        '<h1 class="titre-affiche">' + esc(NOM) + '</h1>' +
        '<p class="capitales filet" style="text-align:center">Espace enseignant</p>' +
        '<div class="champ"><label for="c-mail">Adresse</label><input id="c-mail" type="email" autocomplete="username" required></div>' +
        '<div class="champ"><label for="c-mdp">Mot de passe</label><input id="c-mdp" type="password" autocomplete="current-password" required></div>' +
        '<p class="erreur" id="c-err"></p>' +
        '<button class="bouton" type="submit">Me connecter</button>' +
        '<p class="note">Le compte du tableau de bord du site. Les élèves, eux, n\'ont pas de compte : ils entrent par le code de la partie.</p>' +
      '</form>';
    document.getElementById('f-cnx').onsubmit = function (e) {
      e.preventDefault();
      var b = this.querySelector('button'); b.disabled = true;
      connecter(document.getElementById('c-mail').value, document.getElementById('c-mdp').value)
        .then(function () { conteneur.innerHTML = ''; pret(); })
        .catch(function (err) { b.disabled = false; document.getElementById('c-err').textContent = messageErreur(err); });
    };
  }

  /* ----------------------------------------------------------
   *  5. Temps réel
   *  L'écran projeté diffuse un simple « réveil » ({ v: version })
   *  sur le canal de la partie ; chaque téléphone relit alors son
   *  état en base (quiz_etat). Le réveil ne porte AUCUNE donnée :
   *  un élève qui enverrait de faux messages sur le canal ne
   *  pourrait que faire relire l'état à ses camarades.
   *  Si le wifi bloque les WebSocket, la relecture périodique prend
   *  le relais : le jeu marche sans temps réel, en un peu plus lent.
   * ---------------------------------------------------------- */
  var clientRT = null;
  function canal(partie, surReveil, surStatut) {
    if (!global.supabase || !global.supabase.createClient) { if (surStatut) surStatut(false); return null; }
    try {
      if (!clientRT) {
        clientRT = global.supabase.createClient(URL_PROJET, CLE_ANON, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
          realtime: { params: { eventsPerSecond: 10 } }
        });
      }
      var c = clientRT.channel('quiz-' + partie, { config: { broadcast: { self: false } } });
      c.on('broadcast', { event: 'reveil' }, function (m) { surReveil(m && m.payload); });
      c.subscribe(function (statut) { if (surStatut) surStatut(statut === 'SUBSCRIBED'); });
      return {
        envoyer: function (v) {
          try { c.send({ type: 'broadcast', event: 'reveil', payload: { v: v } }); } catch (e) { /* relecture périodique */ }
        },
        fermer: function () { try { clientRT.removeChannel(c); } catch (e) { /* rien */ } }
      };
    } catch (e) { if (surStatut) surStatut(false); return null; }
  }

  /* ----------------------------------------------------------
   *  6. Messages d'erreur
   * ---------------------------------------------------------- */
  function messageErreur(e) {
    var m = String((e && e.message) || e || '');
    if (/Invalid login credentials/i.test(m)) return 'Adresse ou mot de passe incorrect.';
    if (/QUIZ_PAS_ENSEIGNANT/.test(m)) return 'Ce compte n\'est pas un compte enseignant du site.';
    if (/SESSION_EXPIREE/.test(m)) return 'Session expirée : reconnecte-toi.';
    if (/QUIZ_PIN_INCONNU/.test(m)) return 'Aucune partie ouverte avec ce code. Vérifie les 6 chiffres au tableau.';
    if (/QUIZ_PSEUDO_PRIS/.test(m)) return 'Ce nom est déjà pris dans cette partie : ajoute une lettre.';
    if (/QUIZ_PSEUDO_LONGUEUR/.test(m)) return 'Ton nom doit faire entre 2 et 24 caractères.';
    if (/QUIZ_PSEUDO_INVALIDE/.test(m)) return 'Ce nom contient des caractères interdits.';
    if (/QUIZ_COMPLET/.test(m)) return 'La partie est complète.';
    if (/QUIZ_TROP_TARD/.test(m)) return 'Trop tard : le temps de cette question est écoulé.';
    if (/QUIZ_DEJA_REPONDU/.test(m)) return 'Ta réponse est déjà enregistrée.';
    if (/QUIZ_EXCLU/.test(m)) return 'Tu as été retiré de la partie par le professeur.';
    if (/QUIZ_SLUG_PRIS/.test(m)) return 'Un collègue a déjà un quiz avec cet identifiant (slug) : change-le dans le fichier.';
    if (/QUIZ_QUESTION_INVALIDE: (.*)/.test(m)) return 'Quiz refusé — ' + /QUIZ_QUESTION_INVALIDE: (.*)/.exec(m)[1];
    if (/QUIZ_VIDE/.test(m)) return 'Ce quiz n\'a aucune question.';
    if (/QUIZ_PARTIE_INCONNUE/.test(m)) return 'Partie introuvable (ou ce n\'est pas la tienne).';
    if (/QUIZ_SALLE_INCONNUE/.test(m)) return 'Ce QR code ne mène à aucun quiz. Demande le bon au professeur.';
    if (/QUIZ_SALLE_INVALIDE/.test(m)) return 'Code de salle invalide dans le fichier : 6 caractères parmi A-Z et 2-9, sans I, L ni O.';
    if (/QUIZ_SALLE_PRISE/.test(m)) return 'Ce code de salle est déjà pris par un autre quiz : changez-le dans le fichier.';
    if (/QUIZ_TROP_D_ESSAIS/.test(m)) return 'Beaucoup d\'entraînements sur ce quiz en ce moment : réessaie dans un moment.';
    if (/QUIZ_DOSSIER_BOUCLE/.test(m)) return 'Un dossier ne se range pas dans un de ses propres sous-dossiers.';
    if (/QUIZ_DOSSIER_TROP_PROFOND/.test(m)) return 'Trop de dossiers emboîtés.';
    if (/quiz_categories_nom_unique/.test(m)) return 'Un dossier porte déjà ce nom à cet endroit.';
    if (/quiz_categories_image/.test(m)) return 'Image refusée : un chemin du site, une adresse https, ou une image de l\'ordinateur.';
    if (/QUIZ_PAS_MAINTENANT|QUIZ_PAS_DE_QUESTION/.test(m)) return 'Un instant…';
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Pas de connexion au serveur. Vérifie le wifi.';
    return m;
  }

  /* Titres de page : « … — NOM » réécrit au chargement. */
  function poserNom() {
    document.title = document.title.replace(/\{NOM\}/g, NOM);
    $$('[data-nom]').forEach(function (el) { el.textContent = NOM; });
  }

  global.Quiz = {
    NOM: NOM, LETTRES: LETTRES, FORMES: FORMES,
    esc: esc, $: $, $$: $$, rendre: rendre, lireNombre: lireNombre, ecrireNombre: ecrireNombre,
    urlImage: urlImage, urlFiligrane: urlFiligrane, urlCours: urlCours, revoirHtml: revoirHtml, urlEleve: urlEleve, urlSalle: urlSalle,
    rpc: rpc, rest: rest, connecter: connecter, deconnecter: deconnecter, session: session,
    monUid: monUid, exigerConnexion: exigerConnexion,
    canal: canal, messageErreur: messageErreur, poserNom: poserNom
  };
})(window);
