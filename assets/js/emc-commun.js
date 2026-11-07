/* ============================================================
 *  emc-commun.js — le socle des pages EMC (élève, pilotage,
 *  projection, contenus). Architecture : _suivi/AUDIT-EMC.md.
 *
 *  Expose window.EMC :
 *    EMC.demarrer('eleve' | 'prof')    choisit d'où vient le jeton
 *    EMC.lire(chemin)                  GET  /rest/v1/…
 *    EMC.ecrire(chemin, corps, opts)   POST (opts.fusion : upsert)
 *    EMC.modifier(chemin, corps)       PATCH (chemin filtré obligatoire)
 *    EMC.supprimer(chemin)             DELETE (idem)
 *    EMC.rpc(nom, params)              POST /rest/v1/rpc/…
 *    EMC.ecouter(table, filtre, rappel, relecture)
 *                                      Realtime + relecture de secours
 *    EMC.etatDirect()                  'direct' | 'relecture' | 'hors-ligne'
 *    EMC.contenus()                    { cle: valeur } (emc_contenus)
 *    EMC.file(cle)                     file d'attente hors ligne
 *    EMC.zoneDe, EMC.dansZone, EMC.geometrie, EMC.sousZones
 *    EMC.normaliserMot, EMC.uuid, EMC.echapper, EMC.el, EMC.message
 *
 *  Jetons : on NE réécrit PAS la gestion des sessions.
 *    · élève : la session de progression.js (localStorage
 *      'snt.session'). Pour la renouveler, on passe par une de ses
 *      fonctions publiques (mesInscriptions) : c'est elle qui fait
 *      tourner le jeton, et elle seule.
 *    · prof : la session de prof-api.js ('snt.prof'), renouvelée de
 *      la même façon par ProfAPI.lire.
 *
 *  🔴 URL_PROJET et CLE_ANON sont ceux de progression.js
 *  (contrôlé par verifier.mjs). La clé anonyme n'est pas un secret.
 *  🔴 La géométrie (§3) est le miroir de emc_zone_de / emc_dans_zone
 *  (bdd/schema/031-emc.sql) : on les change ensemble, et
 *  _outils/tests/emc-points.json les contrôle tous les deux.
 * ============================================================ */
(function (global) {
  'use strict';

  var URL_PROJET = 'https://ztyvuiaohxekuyjeoaxz.supabase.co';
  var CLE_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eXZ1aWFvaHhla3V5amVvYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDQzNTIsImV4cCI6MjEwMDEyMDM1Mn0.iBBZiAIec0hSxzAU8FKNe6AO-HeysuxBKXduURBP7Hc';

  /* ----------------------------------------------------------
   *  1. Jeton
   * ---------------------------------------------------------- */
  var mode = null;          // 'eleve' | 'prof'

  function lireStocke(cle) {
    try { var b = global.localStorage.getItem(cle); return b ? JSON.parse(b) : null; }
    catch (e) { return null; }
  }
  function jetonStocke() {
    var v = lireStocke(mode === 'prof' ? 'snt.prof' : 'snt.session');
    return v && v.access_token ? v : null;
  }
  function frais(v) { return v && v.expires_at && v.expires_at > Date.now() + 20000; }

  /* Un jeton valide, renouvelé au besoin par le client officiel. */
  var renouvellement = null;
  function jeton() {
    var v = jetonStocke();
    if (frais(v)) return Promise.resolve(v.access_token);
    if (renouvellement) return renouvellement;
    var p;
    if (mode === 'prof') {
      if (!global.ProfAPI) return Promise.reject(new Error('PAS_DE_SESSION'));
      p = global.ProfAPI.lire('emc_contenus?select=cle&limit=1');
    } else {
      if (!global.Progression) return Promise.reject(new Error('PAS_DE_SESSION'));
      p = global.Progression.mesInscriptions();
    }
    renouvellement = p.then(function () {
      renouvellement = null;
      var w = jetonStocke();
      if (!w) throw new Error('PAS_DE_SESSION');
      if (temps.client) temps.client.realtime.setAuth(w.access_token);
      return w.access_token;
    }, function (e) { renouvellement = null; throw e; });
    return renouvellement;
  }

  /* ----------------------------------------------------------
   *  2. REST
   * ---------------------------------------------------------- */
  function erreurDe(statut, texte) {
    var msg = texte;
    try { var j = JSON.parse(texte); msg = j.message || j.msg || j.error_description || texte; } catch (e) {}
    var err = new Error(msg || ('HTTP ' + statut));
    err.statut = statut;
    return err;
  }

  function appel(methode, chemin, corps, prefer) {
    return jeton().then(function (t) {
      var en = { apikey: CLE_ANON, Authorization: 'Bearer ' + t };
      if (corps !== undefined) en['Content-Type'] = 'application/json';
      if (prefer) en.Prefer = prefer;
      return fetch(URL_PROJET + '/rest/v1/' + chemin, {
        method: methode, headers: en,
        body: corps === undefined ? undefined : JSON.stringify(corps)
      });
    }).then(function (r) {
      return r.text().then(function (t) {
        if (!r.ok) throw erreurDe(r.status, t);
        return t ? JSON.parse(t) : null;
      });
    });
  }

  function garde(chemin) {
    if (chemin.indexOf('?') < 0) throw new Error('Chemin sans filtre : refusé (' + chemin + ')');
  }

  var EMC = {
    URL_PROJET: URL_PROJET,
    CLE_ANON: CLE_ANON,
    demarrer: function (m) { mode = m; },
    mode: function () { return mode; },
    jeton: jeton,
    lire: function (chemin) { return appel('GET', chemin); },
    ecrire: function (chemin, corps, opts) {
      opts = opts || {};
      var prefer = opts.retour ? 'return=representation' : 'return=minimal';
      if (opts.fusion) prefer += ',resolution=merge-duplicates';
      if (opts.ignorer) prefer += ',resolution=ignore-duplicates';
      return appel('POST', chemin, corps, prefer);
    },
    modifier: function (chemin, corps) { garde(chemin); return appel('PATCH', chemin, corps, 'return=minimal'); },
    supprimer: function (chemin) { garde(chemin); return appel('DELETE', chemin, undefined, 'return=minimal'); },
    rpc: function (nom, params) { return appel('POST', 'rpc/' + nom, params || {}); }
  };

  /* Les erreurs de la base, dites à un élève de seconde. */
  var MESSAGES = {
    CODE_EMC_INCONNU: 'Ce code ne correspond à aucune séance. Vérifie le code écrit au tableau.',
    PAS_DE_CLASSE_EMC: 'Entre le code écrit au tableau.',
    PAS_ENCORE_INSCRIT: 'Crée d\'abord ton compte avec le code écrit au tableau.',
    AUCUNE_SESSION: 'Tu n\'es pas connecté·e.',
    PAS_DE_SESSION: 'Tu n\'es pas connecté·e.',
    PAS_DANS_LA_SEANCE: 'Tu n\'es pas encore entré·e dans la séance.',
    ENQUETE_FERMEE: 'L\'enquête n\'est pas encore ouverte.',
    ENQUETE_COMPLETE: 'L\'enquête a déjà reçu toutes les réponses de la séance.',
    PLAFOND_AIDE: 'Tu as déjà envoyé beaucoup de messages : un adulte va venir te voir.',
    PLAFOND_CARTE: 'Tu as atteint le maximum d\'éléments sur la carte.',
    PAS_MA_CLASSE: 'Cette séance n\'est pas rattachée à ton compte.'
  };
  EMC.message = function (e) {
    var m = (e && e.message) || String(e || '');
    for (var k in MESSAGES) if (m.indexOf(k) >= 0) return MESSAGES[k];
    if (/row-level security|violates|permission/i.test(m)) return 'Ce n\'est pas possible maintenant (étape fermée, ou zone verrouillée).';
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Pas de réseau pour l\'instant : c\'est gardé sur ta tablette.';
    return m;
  };
  EMC.horsLigne = function (e) {
    return !e || !e.statut;    // pas de réponse du serveur = réseau
  };

  /* ----------------------------------------------------------
   *  3. Géométrie de la carte — miroir de 031 §2
   * ---------------------------------------------------------- */
  var R_CENTRE = 520, R_ANNEAU = 1250, DEMI = 2000;

  function zoneDe(x, y) {
    if (x == null || y == null || isNaN(x) || isNaN(y) || Math.abs(x) > DEMI || Math.abs(y) > DEMI) return null;
    var r = Math.sqrt(x * x + y * y);
    if (r <= R_CENTRE) return 0;
    var base = (x >= 0 && y < 0) ? 1 : (x < 0 && y < 0) ? 3 : (x < 0 && y >= 0) ? 5 : 7;
    return base + (r <= R_ANNEAU ? 0 : 1);
  }

  function estNombre(v) { return typeof v === 'number' && isFinite(v); }

  function dansZone(zone, type, d) {
    if (zone == null || !d || typeof d !== 'object') return false;
    if (type === 'trait' || type === 'fleche') {
      var p = d.points;
      if (!Array.isArray(p) || p.length < 2 || p.length > 4000 || p.length % 2) return false;
      for (var i = 0; i < p.length; i += 2) {
        if (!estNombre(p[i]) || !estNombre(p[i + 1])) return false;
        if (zoneDe(p[i], p[i + 1]) !== zone) return false;
      }
      return true;
    }
    if (type === 'texte' || type === 'autocollant' || type === 'forme') {
      if (!estNombre(d.x) || !estNombre(d.y) || !estNombre(d.l) || !estNombre(d.h)) return false;
      if (d.l < 1 || d.h < 1 || d.l > 4000 || d.h > 4000) return false;
      var x = d.x, y = d.y, l = d.l, h = d.h;
      return [[x, y], [x + l, y], [x, y + h], [x + l, y + h], [x + l / 2, y], [x + l / 2, y + h], [x, y + h / 2], [x + l, y + h / 2]]
        .every(function (q) { return zoneDe(q[0], q[1]) === zone; });
    }
    return false;
  }

  /* Ce qu'il faut pour dessiner une zone : quadrant, rayons, angles
   * (degrés, repère de l'écran, y vers le bas : le nord est à -90°).
   * Les angles tournent dans le sens des aiguilles d'une montre :
   * NE -90→0, SE 0→90, SO 90→180, NO 180→270. rmax = null : jusqu'au
   * bord du carré (anneau extérieur, coins compris). */
  var QUADRANTS = { 1: 'NE', 3: 'NO', 5: 'SO', 7: 'SE' };
  var ANGLES = { NE: [-90, 0], SE: [0, 90], SO: [90, 180], NO: [180, 270] };
  function geometrie(zone) {
    if (zone === 0) return { zone: 0, quadrant: null, rmin: 0, rmax: R_CENTRE, a0: 0, a1: 360 };
    var base = zone % 2 ? zone : zone - 1, q = QUADRANTS[base], ext = zone % 2 === 0;
    return { zone: zone, quadrant: q, anneau: ext ? 'exterieur' : 'interieur',
             rmin: ext ? R_ANNEAU : R_CENTRE, rmax: ext ? null : R_ANNEAU,
             a0: ANGLES[q][0], a1: ANGLES[q][1] };
  }

  /* Les sous-zones : n secteurs angulaires égaux de la zone, dans le
   * sens horaire. Ce sont des cadres de guidage (le serveur ne
   * verrouille que la zone). */
  function sousZones(zone, titres) {
    var g = geometrie(zone), n = (titres && titres.length) || 1, pas = (g.a1 - g.a0) / n, out = [];
    for (var i = 0; i < n; i++) out.push({ zone: zone, index: i, titre: titres ? titres[i] : '',
      rmin: g.rmin, rmax: g.rmax, a0: g.a0 + i * pas, a1: g.a0 + (i + 1) * pas });
    return out;
  }

  /* Le point d'une zone le plus « au milieu » (pour centrer la vue,
   * poser un texte par défaut). */
  function milieu(zone) {
    if (zone === 0) return { x: 0, y: 0 };
    var g = geometrie(zone), a = (g.a0 + g.a1) / 2 * Math.PI / 180;
    var r = g.rmax ? (g.rmin + g.rmax) / 2 : (R_ANNEAU + DEMI * 1.2) / 2;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  }

  EMC.R_CENTRE = R_CENTRE; EMC.R_ANNEAU = R_ANNEAU; EMC.DEMI = DEMI;
  EMC.zoneDe = zoneDe; EMC.dansZone = dansZone; EMC.geometrie = geometrie;
  EMC.sousZones = sousZones; EMC.milieu = milieu;
  EMC.NOMS_ZONES = { 0: 'Centre', 1: 'NE intérieur', 2: 'NE extérieur', 3: 'NO intérieur', 4: 'NO extérieur',
                     5: 'SO intérieur', 6: 'SO extérieur', 7: 'SE intérieur', 8: 'SE extérieur' };

  /* L'icône d'une mission : celle des contenus, sinon une par table. */
  var ICONES_MISSIONS = { 1: '🔎', 2: '💭', 3: '🎯', 4: '⚖️', 5: '👀', 6: '💡', 7: '🧭', 8: '🤝' };
  EMC.iconeMission = function (m) { return (m && m.icone) || (m && ICONES_MISSIONS[m.table]) || '📌'; };

  /* Les numéros tant que les contenus ne sont pas lus (avant la
     connexion). Les mêmes que emc_contenus.numeros (031, 033). */
  EMC.NUMEROS_DEFAUT = [
    { icone: '💬', numero: '3018', sens: 'Harcèlement et cyberharcèlement' },
    { icone: '💙', numero: '3114', sens: 'Prévention du suicide' },
    { icone: '🧒', numero: '119', sens: 'Enfance en danger' },
    { icone: '🚨', numero: '17', sens: 'Danger immédiat' }
  ];

  /* ----------------------------------------------------------
   *  4. Temps réel
   *
   *  supabase-js auto-hébergé, seulement pour Realtime. Chaque
   *  écoute a une RELECTURE de secours : appelée à l'abonnement,
   *  puis toutes les 20 s si le direct marche, toutes les 3 s s'il
   *  ne marche pas (wifi qui coupe les WebSocket, jeton renouvelé
   *  en retard…). Rien ne dépend donc du seul WebSocket.
   * ---------------------------------------------------------- */
  var temps = { client: null, ecoutes: [], etat: 'relecture', minuteur: null };

  function client() {
    if (temps.client || !global.supabase) return temps.client;
    temps.client = global.supabase.createClient(URL_PROJET, CLE_ANON, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      realtime: { params: { eventsPerSecond: 20 } }
    });
    /* Le jeton de Realtime suit celui des requêtes. */
    setInterval(function () { jeton().then(function (t) { temps.client.realtime.setAuth(t); }, function () {}); }, 4 * 60000);
    return temps.client;
  }

  function majEtat() {
    /* les écoutes « relecture seule » (tables hors de la publication
       Realtime, voulues ainsi) ne comptent pas */
    var directes = temps.ecoutes.filter(function (e) { return !e.sansDirect; });
    var vivant = directes.length && directes.every(function (e) { return e.direct; });
    var avant = temps.etat;
    temps.etat = !navigator.onLine ? 'hors-ligne' : (vivant ? 'direct' : 'relecture');
    if (avant !== temps.etat) {
      document.dispatchEvent(new CustomEvent('emc:direct', { detail: temps.etat }));
    }
  }
  global.addEventListener('online', majEtat);
  global.addEventListener('offline', majEtat);

  function boucleRelecture() {
    if (temps.minuteur) return;
    var tic = 0;
    temps.minuteur = setInterval(function () {
      if (document.hidden) return;
      tic++;
      temps.ecoutes.forEach(function (e) {
        if (!e.relecture) return;
        var periode = e.direct ? 20 : (e.periode || 3);
        if (tic % periode === 0) e.relecture();
      });
    }, 1000);
  }

  /* table : 'emc_seances'… · filtre : 'classe_id=eq.<uuid>' ou null ·
   * rappel(ligne, evenement) · relecture() : relit et rappelle.
   * opts.periode : secondes entre deux relectures sans le direct. */
  EMC.ecouter = function (table, filtre, rappel, relecture, opts) {
    opts = opts || {};
    var e = { table: table, direct: false, relecture: relecture, periode: opts.periode, canal: null,
              sansDirect: !!opts.sansDirect || !global.supabase };
    temps.ecoutes.push(e);
    if (relecture) relecture();
    boucleRelecture();
    var c = client();
    if (c && !opts.sansDirect) {
      jeton().then(function (t) {
        c.realtime.setAuth(t);
        var conf = { event: '*', schema: 'public', table: table };
        if (filtre) conf.filter = filtre;
        e.canal = c.channel('emc:' + table + ':' + (filtre || 'tout') + ':' + Math.random().toString(36).slice(2, 7))
          .on('postgres_changes', conf, function (p) {
            rappel(p.eventType === 'DELETE' ? p.old : p['new'], p.eventType);
          })
          .subscribe(function (statut) {
            var avant = e.direct;
            e.direct = statut === 'SUBSCRIBED';
            /* revenu en direct : on rattrape ce qui a pu passer pendant le trou */
            if (e.direct && !avant && relecture) relecture();
            majEtat();
          });
      }, function () {});
    }
    majEtat();
    return { arreter: function () {
      if (e.canal && c) c.removeChannel(e.canal);
      temps.ecoutes = temps.ecoutes.filter(function (x) { return x !== e; });
      majEtat();
    } };
  };
  EMC.etatDirect = function () { return temps.etat; };

  /* ----------------------------------------------------------
   *  5. Contenus (emc_contenus) : chargés une fois, tenus à jour.
   * ---------------------------------------------------------- */
  var contenus = null, enCharge = null;
  EMC.contenus = function () {
    if (contenus) return Promise.resolve(contenus);
    if (enCharge) return enCharge;
    enCharge = EMC.lire('emc_contenus?select=cle,valeur').then(function (l) {
      contenus = {};
      l.forEach(function (r) { contenus[r.cle] = r.valeur; });
      EMC.ecouter('emc_contenus', null, function (r) {
        if (!r || !r.cle) return;
        contenus[r.cle] = r.valeur;
        document.dispatchEvent(new CustomEvent('emc:contenus', { detail: r.cle }));
      }, null);
      return contenus;
    });
    return enCharge;
  };
  /* Après un enregistrement depuis l'éditeur de contenus. */
  EMC.poserContenu = function (cle, valeur) { if (contenus) contenus[cle] = valeur; };

  /* ----------------------------------------------------------
   *  6. File d'attente hors ligne
   *
   *  Une opération = { methode, chemin, corps, opts }. Gardée en
   *  localStorage tant que le serveur n'a pas répondu ; rejouée au
   *  retour du réseau. Un refus du serveur (4xx) la retire : la
   *  rejouer ne changerait rien (étape fermée…). Les écritures sont
   *  idempotentes (id fabriqué ici, ou upsert), un double envoi ne
   *  crée pas de doublon.
   *  🔴 Jamais de message d'aide là-dedans : il ne doit pas dormir
   *  sur la tablette.
   * ---------------------------------------------------------- */
  EMC.file = function (cle) {
    var CLE = 'emc.file.' + cle, enCours = false, refus = null;
    function lire() { var v = lireStocke(CLE); return Array.isArray(v) ? v : []; }
    function poser(l) { try { if (l.length) global.localStorage.setItem(CLE, JSON.stringify(l)); else global.localStorage.removeItem(CLE); } catch (e) {} }
    function signaler() { document.dispatchEvent(new CustomEvent('emc:file', { detail: lire().length })); }
    function executer(op) {
      if (op.methode === 'PATCH') return EMC.modifier(op.chemin, op.corps);
      if (op.methode === 'RPC') return EMC.rpc(op.chemin, op.corps);
      return EMC.ecrire(op.chemin, op.corps, op.opts);
    }
    function vider() {
      if (enCours) return Promise.resolve();
      var l = lire();
      if (!l.length) return Promise.resolve();
      enCours = true;
      var op = l[0];
      return executer(op).then(function () {
        poser(lire().filter(function (x) { return x.n !== op.n; }));
      }, function (e) {
        if (!EMC.horsLigne(e)) {
          poser(lire().filter(function (x) { return x.n !== op.n; }));
          if (refus) refus(e, op);
        } else throw e;
      }).then(function () { enCours = false; signaler(); return vider(); },
              function () { enCours = false; signaler(); });
    }
    global.addEventListener('online', vider);
    setInterval(vider, 5000);
    return {
      /* Envoie tout de suite si possible ; sinon garde. Une opération
       * qui porte une  cle  remplace la précédente de même clé (la
       * note, le vote : seule la dernière version compte). */
      pousser: function (op) {
        var l = lire();
        op.n = Date.now() + '-' + Math.random().toString(36).slice(2, 6);
        if (op.cle) l = l.filter(function (x) { return x.cle !== op.cle; });
        l.push(op);
        poser(l); signaler();
        return vider();
      },
      vider: vider,
      enAttente: function () { return lire().length; },
      surRefus: function (f) { refus = f; }
    };
  };

  /* ----------------------------------------------------------
   *  7. Petits outils
   * ---------------------------------------------------------- */
  /* Forme de comparaison d'un mot du nuage : minuscules, sans
   * accents ni ponctuation autour, espaces réduits. */
  EMC.normaliserMot = function (m) {
    return String(m || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9' -]+/g, ' ').replace(/\s+/g, ' ').trim();
  };
  EMC.uuid = function () {
    if (global.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  };
  EMC.echapper = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  /* el('div', { class: 'x', onclick: f }, enfant, 'texte'…) */
  EMC.el = function (tag, attrs) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else if (k === 'html') n.innerHTML = v;
      else n.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      (Array.isArray(c) ? c : [c]).forEach(function (x) {
        if (x == null || x === false) return;
        n.appendChild(typeof x === 'string' || typeof x === 'number' ? document.createTextNode(String(x)) : x);
      });
    }
    return n;
  };
  /* ?classe=NINA27 */
  EMC.parametre = function (nom) {
    var m = new RegExp('[?&]' + nom + '=([^&#]*)').exec(global.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  };

  global.EMC = EMC;
})(window);
