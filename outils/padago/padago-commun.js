/* ============================================================
 *  padago-commun.js — ce que l'éditeur et le mode élève partagent
 *  ------------------------------------------------------------
 *  1. Réglages (nom de l'outil, base Supabase)
 *  2. Petits outils (échappement, identifiants, normalisation)
 *  3. Empreintes des codes (SHA-256 + sel du pad)
 *  4. Publication : brouillon (codes en clair) → version élève
 *  5. Client Supabase minimal (fetch, aucune bibliothèque)
 *  6. Rendu des cartes (texte, image, lien, vidéo, chiffre caché)
 *
 *  🔴 RIEN ne se charge depuis un CDN : l'IP des élèves ne part
 *  nulle part ailleurs que vers la base du site.
 *  🔴 Le contenu d'un pad est écrit par une prof mais lu par des
 *  élèves : il n'est JAMAIS injecté comme HTML. Le texte passe par
 *  une mise en forme minimale (gras, italique, listes, liens) qui
 *  échappe tout le reste.
 * ============================================================ */
(function (global) {
  'use strict';

  /* ----------------------------------------------------------
   *  1. Réglages
   *  Le NOM de l'outil vit ici et nulle part ailleurs dans le code :
   *  le changer ici le change partout (titres de page compris, que
   *  les scripts réécrivent au chargement).
   * ---------------------------------------------------------- */
  var NOM = 'Padago';

  /* ⚠ Dupliqués depuis assets/js/progression.js — verifier.mjs
     compare les trois fichiers. Ne jamais corriger l'un sans l'autre. */
  var URL_PROJET = 'https://ztyvuiaohxekuyjeoaxz.supabase.co';
  var CLE_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eXZ1aWFvaHhla3V5amVvYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDQzNTIsImV4cCI6MjEwMDEyMDM1Mn0.iBBZiAIec0hSxzAU8FKNe6AO-HeysuxBKXduURBP7Hc';

  /* Session de l'autrice. Clé distincte de 'snt.session' (élève) et
     de 'snt.prof' (tableau de bord) : aucune n'écrase l'autre. */
  var CLE_SESSION = 'padago.session';
  /* Une autrice reste connectée 14 jours sur son appareil. Ce qu'elle
     expose si elle oublie sa tablette : ses pads, pas des copies
     d'élèves — d'où une durée plus longue que les 12 h du tableau
     de bord. Le bouton « Me déconnecter » reste en vue. */
  var PEREMPTION = 14 * 24 * 3600000;

  /* ----------------------------------------------------------
   *  2. Petits outils
   * ---------------------------------------------------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var ALPHA = 'abcdefghjkmnpqrstuvwxyz23456789';   // ni 0/O, ni 1/I/L
  function aleatoire(n) {
    var o = new Uint8Array(n), s = '';
    global.crypto.getRandomValues(o);
    for (var i = 0; i < n; i++) s += ALPHA[o[i] % ALPHA.length];
    return s;
  }
  function nouvelId(prefixe) { return prefixe + '_' + aleatoire(8); }

  /* Un code se compare sans casse, sans accents, sans espaces en
     trop : « Électron », « electron » et « ELECTRON » se valent. */
  function normaliser(s) {
    return String(s == null ? '' : s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }

  /* N'accepte que les liens web : pas de javascript:, pas de data:. */
  function urlSure(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) {
      if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) u = 'https://' + u;
      else return '';
    }
    try { var x = new URL(u); return (x.protocol === 'https:' || x.protocol === 'http:') ? x.href : ''; }
    catch (e) { return ''; }
  }

  /* ----------------------------------------------------------
   *  3. Empreintes
   *  Le but n'est pas une sécurité forte : c'est qu'un élève qui
   *  ouvre l'inspecteur ne lise pas les réponses. Le sel est propre
   *  au pad, l'empreinte d'un même code diffère d'un pad à l'autre.
   * ---------------------------------------------------------- */
  function empreinte(sel, code) {
    var donnees = new TextEncoder().encode(sel + '|' + normaliser(code));
    return global.crypto.subtle.digest('SHA-256', donnees).then(function (h) {
      return Array.prototype.map.call(new Uint8Array(h), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    });
  }

  /* ----------------------------------------------------------
   *  4. Publication
   *  Prend le brouillon (codes en clair) et rend la version élève :
   *  même structure, chaque code remplacé par son empreinte.
   *  Les commentaires « pour la prof » ne partent pas.
   * ---------------------------------------------------------- */
  function publier(b) {
    var p = JSON.parse(JSON.stringify(b));
    p.sel = p.sel || aleatoire(16);
    var attentes = [];
    function remplacer(obj, champ, cible) {
      var v = obj[champ];
      delete obj[champ];
      if (v == null || String(v).trim() === '') return;
      attentes.push(empreinte(p.sel, v).then(function (h) { obj[cible] = h; }));
    }
    remplacer(p, 'codeMaitre', 'codeMaitreHash');
    (p.colonnes || []).forEach(function (c) {
      if (c.cadenas) remplacer(c.cadenas, 'code', 'codeHash');
      if (c.coffre) {
        c.coffre.longueur = String(c.coffre.code || '').replace(/\s/g, '').length;
        remplacer(c.coffre, 'code', 'codeHash');
      }
      (c.cartes || []).forEach(function (k) { delete k.notePourMoi; });
    });
    return Promise.all(attentes).then(function () { return p; });
  }

  /* Le pad vierge : une colonne, une carte, un cadenas libre. */
  function padVierge(titre) {
    return {
      id: nouvelId('pad'), version: 1, titre: titre || 'Mon nouveau pad',
      couverture: '', codeMaitre: '', sel: aleatoire(16),
      options: { salleSecrete: false, indices: false, ressentis: false, carteParcours: true },
      medailles: [],
      colonnes: [{
        id: nouvelId('c'), titre: 'Document 1', secrete: false,
        cartes: [{ id: nouvelId('k'), type: 'texte', contenu: 'Écris ici la consigne ou le document.' }],
        cadenas: { type: 'libre' }, coffre: null
      }]
    };
  }

  /* ----------------------------------------------------------
   *  5. Client Supabase
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
    var h = { apikey: CLE_ANON, 'Content-Type': 'application/json' };
    h.Authorization = 'Bearer ' + (avecJeton && jeton ? jeton.access_token : CLE_ANON);
    return h;
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
  function auth(chemin, corps, methode, avecJeton) {
    return fetch(URL_PROJET + '/auth/v1/' + chemin, {
      method: methode || 'POST', headers: entetes(!!avecJeton), body: JSON.stringify(corps || {})
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
  function rpc(nom, params, anonyme) {
    var p = anonyme ? Promise.resolve() : assure();
    return p.then(function () {
      return fetch(URL_PROJET + '/rest/v1/rpc/' + nom, {
        method: 'POST', headers: entetes(!anonyme), body: JSON.stringify(params || {})
      });
    }).then(lireReponse);
  }
  function deconnecter() {
    var j = jeton; jeton = null; ecrireJeton(null);
    if (j && j.access_token) {
      fetch(URL_PROJET + '/auth/v1/logout', { method: 'POST', headers: { apikey: CLE_ANON, Authorization: 'Bearer ' + j.access_token } })
        .catch(function () {});
    }
  }

  /* Messages lisibles pour les erreurs les plus probables. */
  function messageErreur(e) {
    var m = String((e && e.message) || e || '');
    if (/Invalid login credentials/i.test(m)) return 'Adresse ou mot de passe incorrect.';
    if (/already registered|already been registered|user_already_exists/i.test(m)) return 'Un compte existe déjà avec cette adresse : utilise « Me connecter ».';
    if (/Password should be|weak_password/i.test(m)) return 'Mot de passe trop court : 8 caractères au moins.';
    if (/PADAGO_CODE_INVALIDE/.test(m)) return 'Ce code d\'invitation n\'est pas reconnu (ou il a déjà servi).';
    if (/PADAGO_PAS_AUTEUR/.test(m)) return 'Ce compte n\'a pas encore le droit de créer des pads : entre ton code d\'invitation.';
    if (/PADAGO_TROP_DE_PADS/.test(m)) return 'Limite de 200 pads atteinte : supprime d\'anciens pads.';
    if (/padago_pads_taille/.test(m)) return 'Ce pad est trop lourd. Les images doivent passer par un lien, pas être collées.';
    if (/SESSION_EXPIREE/.test(m)) return 'Ta session a expiré : reconnecte-toi.';
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Pas de connexion à Internet pour l\'instant.';
    if (/rate limit|over_email_send_rate_limit/i.test(m)) return 'Trop de mails envoyés en peu de temps : réessaie dans une heure.';
    return m;
  }

  var Api = {
    connecte: function () { if (!jeton) jeton = lireJeton(); return !!jeton; },
    email: function () { return (jeton && jeton.email) || ''; },
    seConnecter: function (email, mdp) {
      return auth('token?grant_type=password', { email: email.trim(), password: mdp })
        .then(function (d) { poser(d); });
    },
    creerCompte: function (email, mdp) {
      return auth('signup', { email: email.trim(), password: mdp }).then(function (d) {
        if (d && d.access_token) { poser(d); return true; }
        return false;   // confirmation par mail exigée par le projet
      });
    },
    motDePassePerdu: function (email, retour) {
      return auth('recover?redirect_to=' + encodeURIComponent(retour), { email: email.trim() });
    },
    adopterRetourMail: function (frag) {
      // lien de récupération : #access_token=…&refresh_token=…&expires_in=…&type=recovery
      var p = new URLSearchParams(frag.replace(/^#/, ''));
      if (!p.get('access_token')) return null;
      poser({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'),
              expires_in: +p.get('expires_in') || 3600 });
      return p.get('type') || 'connexion';
    },
    changerMotDePasse: function (mdp) {
      return assure().then(function () { return auth('user', { password: mdp }, 'PUT', true); });
    },
    deconnecter: deconnecter,
    suisAuteur: function () { return rpc('padago_suis_auteur'); },
    accepterInvitation: function (code) { return rpc('padago_accepter_invitation', { p_code: code }); },
    mesPads: function () {
      return rest('padago_pads?select=id,slug,titre,maj_le,copiable&order=maj_le.desc');
    },
    lirePad: function (id) {
      return rest('padago_pads?select=*&id=eq.' + encodeURIComponent(id)).then(function (l) { return l && l[0]; });
    },
    creerPad: function (ligne) {
      return rest('padago_pads', { methode: 'POST', corps: ligne, prefer: 'return=representation' })
        .then(function (l) { return l && l[0]; });
    },
    enregistrerPad: function (id, champs) {
      return rest('padago_pads?id=eq.' + encodeURIComponent(id), { methode: 'PATCH', corps: champs, prefer: 'return=minimal' });
    },
    supprimerPad: function (id) {
      return rest('padago_pads?id=eq.' + encodeURIComponent(id), { methode: 'DELETE', prefer: 'return=minimal' });
    },
    copierPad: function (slug) { return rpc('padago_copier', { p_slug: slug }); },
    lirePublie: function (slug) { return rpc('padago_lire', { p_slug: slug }, true); }
  };

  /* ----------------------------------------------------------
   *  6. Rendu des cartes
   * ---------------------------------------------------------- */

  /* Mise en forme minimale, tout le reste échappé :
       **gras**   *italique*   - liste   1. liste   [texte](https://…)
     Une ligne vide sépare les paragraphes. */
  function enLigne(t) {
    var s = esc(t);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, txt, url) {
      var u = urlSure(url.replace(/&amp;/g, '&'));
      return u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + txt + '</a>' : txt;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    return s;
  }
  function texteRiche(t) {
    var lignes = String(t || '').replace(/\r/g, '').split('\n');
    var html = '', liste = null, para = [];
    function fermerPara() { if (para.length) { html += '<p>' + para.map(enLigne).join('<br>') + '</p>'; para = []; } }
    function fermerListe() { if (liste) { html += '</' + liste + '>'; liste = null; } }
    lignes.forEach(function (l) {
      var m;
      if ((m = /^\s*[-•]\s+(.*)$/.exec(l))) {
        fermerPara(); if (liste !== 'ul') { fermerListe(); html += '<ul>'; liste = 'ul'; }
        html += '<li>' + enLigne(m[1]) + '</li>';
      } else if ((m = /^\s*\d+[.)]\s+(.*)$/.exec(l))) {
        fermerPara(); if (liste !== 'ol') { fermerListe(); html += '<ol>'; liste = 'ol'; }
        html += '<li>' + enLigne(m[1]) + '</li>';
      } else if (!l.trim()) { fermerPara(); fermerListe(); }
      else { fermerListe(); para.push(l); }
    });
    fermerPara(); fermerListe();
    return html;
  }

  /* Vidéo : un MP4 (ou un lien de partage OneDrive/SharePoint, lu en
     ajoutant download=1) passe au lecteur natif. YouTube et PeerTube
     restent de simples liens : YouTube est bloqué au lycée, et une
     intégration enverrait l'IP des élèves à Google. */
  function sourceVideo(url) {
    var u = urlSure(url);
    if (!u) return null;
    if (/sharepoint\.com|1drv\.ms|onedrive\.live\.com/i.test(u)) {
      return { lecteur: /download=1/.test(u) ? u : u + (u.indexOf('?') < 0 ? '?' : '&') + 'download=1', page: u };
    }
    if (/\.(mp4|webm|m4v|mov)(\?|#|$)/i.test(u)) return { lecteur: u, page: u };
    return { lecteur: null, page: u };
  }

  function nomDuSite(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }

  /* Rend une carte en HTML. ctx = { coffres: {id: titre}, indices: bool,
     indicesVus: {cardId: true}, apercu: bool (éditeur) } */
  function rendreCarte(k, ctx) {
    ctx = ctx || {};
    var h = '';
    if (k.titre && k.type !== 'lien') h += '<h4 class="k-titre">' + esc(k.titre) + '</h4>';
    switch (k.type) {
      case 'texte':
        h += '<div class="k-texte">' + texteRiche(k.contenu) + '</div>';
        break;
      case 'image':
        var src = urlSure(k.src);
        h += src ? '<figure class="k-image"><img src="' + esc(src) + '" alt="' + esc(k.alt || k.legende || '') + '" loading="lazy">'
                 + (k.legende ? '<figcaption>' + enLigne(k.legende) + '</figcaption>' : '') + '</figure>'
                 : '<p class="k-vide">🖼 Image : lien à renseigner</p>';
        break;
      case 'lien':
        var u = urlSure(k.url);
        h += u ? '<a class="k-lien" href="' + esc(u) + '" target="_blank" rel="noopener">'
               + '<span class="k-lien-ico" aria-hidden="true">🔗</span><span><b>' + esc(k.titre || nomDuSite(u)) + '</b>'
               + (k.contenu ? '<small>' + esc(k.contenu) + '</small>' : '') + '<small class="k-site">' + esc(nomDuSite(u)) + '</small></span></a>'
               : '<p class="k-vide">🔗 Lien à renseigner</p>';
        break;
      case 'video':
        var v = sourceVideo(k.url);
        if (!v) { h += '<p class="k-vide">🎬 Vidéo : lien à renseigner</p>'; break; }
        if (v.lecteur) {
          h += '<video class="k-video" controls preload="metadata" playsinline src="' + esc(v.lecteur) + '"></video>';
        } else {
          h += '<a class="k-lien" href="' + esc(v.page) + '" target="_blank" rel="noopener"><span class="k-lien-ico" aria-hidden="true">▶</span>'
             + '<span><b>Ouvrir la vidéo</b><small class="k-site">' + esc(nomDuSite(v.page)) + '</small></span></a>';
        }
        if (k.credit) h += '<p class="k-credit">Vidéo : ' + esc(k.credit) + '</p>';
        break;
      case 'chiffre':
        var nomCoffre = (ctx.coffres && ctx.coffres[k.coffre]) || 'le coffre';
        h += '<div class="k-chiffre"><span class="k-chiffre-ico" aria-hidden="true">🗝</span><span>'
           + (k.contenu ? '<span class="k-chiffre-txt">' + enLigne(k.contenu) + '</span>' : '')
           + 'Fragment de code pour <b>' + esc(nomCoffre) + '</b>'
           + (k.position ? ' — position <b>' + esc(k.position) + '</b>' : '')
           + '&nbsp;: <span class="k-chiffre-val">' + esc(k.valeur || '?') + '</span></span></div>';
        break;
    }
    if (ctx.indices && k.indice && k.indice.texte) {
      var cout = k.indice.cout ? ' <small>(ta médaille plafonne à ' + (k.indice.cout === 'bronze' ? 'bronze' : 'argent') + ')</small>' : '';
      if (ctx.indicesVus && ctx.indicesVus[k.id]) {
        h += '<div class="k-indice ouvert"><b>💡 Indice&nbsp;:</b> ' + enLigne(k.indice.texte) + '</div>';
      } else {
        h += '<button type="button" class="k-indice-btn" data-indice="' + esc(k.id) + '">💡 Voir un indice' + cout + '</button>';
      }
    }
    return h;
  }

  /* Médailles : couleur → teinte. */
  var COULEURS = { or: '#c9a227', argent: '#9aa3ad', bronze: '#b0703c' };
  function teinte(c) { return COULEURS[c] || (/^#[0-9a-f]{6}$/i.test(c || '') ? c : COULEURS.or); }
  var RANG = { bronze: 1, argent: 2, or: 3 };

  global.Padago = {
    NOM: NOM, URL_PROJET: URL_PROJET, CLE_ANON: CLE_ANON,
    esc: esc, aleatoire: aleatoire, nouvelId: nouvelId, normaliser: normaliser, urlSure: urlSure,
    empreinte: empreinte, publier: publier, padVierge: padVierge,
    texteRiche: texteRiche, enLigne: enLigne, rendreCarte: rendreCarte, sourceVideo: sourceVideo,
    teinte: teinte, RANG: RANG, Api: Api, messageErreur: messageErreur
  };

  /* Le nom de l'outil dans la page : tout élément [data-nom] et le titre. */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-nom]').forEach(function (e) { e.textContent = NOM; });
    document.title = document.title.replace(/Padago/g, NOM);
  });
})(window);
