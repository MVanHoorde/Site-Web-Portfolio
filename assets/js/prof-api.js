/* ============================================================
 *  prof-api.js — le client Supabase du tableau de bord enseignant
 *  ------------------------------------------------------------
 *  POURQUOI UN FICHIER SÉPARÉ DE progression.js
 *  progression.js sait déjà tout faire (connexion, jeton, appels).
 *  Mais il DÉMARRE SEUL au chargement de la page et injecte son
 *  interface élève : badge de session, modale de compte. L'inclure
 *  ici ferait pousser une interface d'élève par-dessus celle du
 *  professeur. On écrit donc un client mince, sans interface.
 *
 *  ⚠ L'URL et la clé anon sont DUPLIQUÉES depuis progression.js.
 *  C'est le prix de la séparation, et une duplication finit
 *  toujours par diverger — alors  verifier.mjs  compare les deux
 *  fichiers et refuse de passer si elles ne correspondent plus.
 *  Ne jamais corriger l'une sans l'autre.
 *
 *  RGPD — ce fichier ne connaît que des pseudonymes. La table
 *  identifiant → nom vit sur la machine de Loïc et n'est chargée
 *  qu'en mémoire vive (voir §5) : elle n'est jamais envoyée, jamais
 *  écrite sur le disque, et disparaît en fermant l'onglet.
 *
 *  SÉCURITÉ — la clé anon est publique par nature : elle ne donne
 *  aucun droit par elle-même, c'est la RLS qui décide. Le vrai
 *  secret, c'est le mot de passe du compte enseignant, qui n'est
 *  écrit nulle part.
 * ============================================================ */
(function (global) {
  'use strict';

  /* ----------------------------------------------------------
   *  1. Configuration — ⚠ doit rester identique à progression.js
   * ---------------------------------------------------------- */
  var URL_PROJET = 'https://ztyvuiaohxekuyjeoaxz.supabase.co';
  var CLE_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eXZ1aWFvaHhla3V5amVvYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDQzNTIsImV4cCI6MjEwMDEyMDM1Mn0.iBBZiAIec0hSxzAU8FKNe6AO-HeysuxBKXduURBP7Hc';

  /* Clé de stockage distincte de 'snt.session' : un poste de classe
     peut porter une session élève et une session professeur sans
     que l'une écrase l'autre. */
  var CLE_STOCKAGE = 'snt.prof';

  /* PÉREMPTION LOCALE — la vraie décision de sécurité de ce fichier.
     Supabase renouvelle indéfiniment un jeton tant qu'on présente le
     refresh_token : une session ouverte le resterait des semaines.
     Sur un iPad qui traîne en salle des profs, cela veut dire que
     n'importe qui ouvrant la page verrait toutes les copies.
     On pose donc notre propre limite : au-delà de 12 h après la
     connexion, la session est effacée quoi qu'il arrive et le mot
     de passe est redemandé. Douze heures couvrent une journée de
     cours entière, pas une semaine d'oubli. */
  var PEREMPTION = 12 * 3600000;

  var jeton = null;   /* { access_token, refresh_token, expires_at, ouverte } */
  var moi   = null;   /* { libelle } — rempli après vérification du rôle */

  /* ----------------------------------------------------------
   *  2. Le jeton : lecture, écriture, péremption
   * ---------------------------------------------------------- */
  function lireStocke() {
    try {
      var brut = global.localStorage.getItem(CLE_STOCKAGE);
      if (!brut) return null;
      var v = JSON.parse(brut);
      /* Péremption locale : au-delà, on efface sans discuter. */
      if (!v.ouverte || (Date.now() - v.ouverte) > PEREMPTION) {
        global.localStorage.removeItem(CLE_STOCKAGE);
        return null;
      }
      return v;
    } catch (e) { return null; }
  }

  function ecrireStocke(v) {
    try {
      if (v) global.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(v));
      else   global.localStorage.removeItem(CLE_STOCKAGE);
    } catch (e) { /* navigation privée : on reste en mémoire vive */ }
  }

  function poser(reponse, ouverte) {
    jeton = {
      access_token : reponse.access_token,
      refresh_token: reponse.refresh_token,
      /* expires_at est en secondes côté serveur ; on retire 60 s de
         marge pour ne jamais envoyer un jeton qui expire en vol. */
      expires_at   : (reponse.expires_at * 1000) - 60000,
      /* l'heure de la PREMIÈRE connexion, pas du renouvellement :
         sinon la péremption de 12 h se repousserait sans fin. */
      ouverte      : ouverte || Date.now()
    };
    ecrireStocke(jeton);
    return jeton;
  }

  function valide() {
    return !!(jeton && jeton.access_token && Date.now() < jeton.expires_at);
  }

  /* ----------------------------------------------------------
   *  3. Les appels HTTP
   * ---------------------------------------------------------- */
  function entetes(avecJeton) {
    var h = { apikey: CLE_ANON, 'Content-Type': 'application/json' };
    if (avecJeton && jeton) h.Authorization = 'Bearer ' + jeton.access_token;
    return h;
  }

  function auth(chemin, corps) {
    return fetch(URL_PROJET + '/auth/v1/' + chemin, {
      method: 'POST', headers: entetes(false), body: JSON.stringify(corps)
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) throw new Error(d.error_description || d.msg || d.message || 'auth');
        return d;
      });
    });
  }

  /* Renouvelle le jeton si nécessaire, puis exécute l'appel.
     Toute requête passe par ici : on ne se demande jamais ailleurs
     si le jeton est encore bon. */
  function assure() {
    if (valide()) return Promise.resolve();
    if (jeton && jeton.refresh_token) {
      var ouverte = jeton.ouverte;
      return auth('token?grant_type=refresh_token',
                  { refresh_token: jeton.refresh_token })
        .then(function (d) { poser(d, ouverte); })
        .catch(function () { deconnexion(); throw new Error('SESSION_EXPIREE'); });
    }
    return Promise.reject(new Error('SESSION_EXPIREE'));
  }

  /* Lecture de données (PostgREST). Le chemin est celui de l'API :
     'reponses_libres?select=*&statut=eq.en_attente' */
  function lire(chemin) {
    return assure().then(function () {
      return fetch(URL_PROJET + '/rest/v1/' + chemin, { headers: entetes(true) });
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t || ('HTTP ' + r.status)); });
      return r.json();
    });
  }

  /* Écriture (POST). « fusion » demande à PostgREST de remplacer une
     ligne existante au lieu d'échouer sur la clé primaire — c'est ce
     qui permet de re-clôturer une séance déjà enregistrée pour
     corriger une note, sans se demander si elle existe déjà. */
  function ecrire(chemin, corps, fusion) {
    return assure().then(function () {
      var h = entetes(true);
      h.Prefer = fusion ? 'resolution=merge-duplicates,return=minimal'
                        : 'return=minimal';
      return fetch(URL_PROJET + '/rest/v1/' + chemin, {
        method: 'POST', headers: h, body: JSON.stringify(corps)
      });
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t || ('HTTP ' + r.status)); });
      return true;
    });
  }

  /* Suppression. Le chemin DOIT porter un filtre : PostgREST refuse
     un delete sans clause, mais on ne compte pas là-dessus — une
     erreur de code ne doit pas pouvoir vider une table. */
  function supprimer(chemin) {
    if (chemin.indexOf('?') < 0) return Promise.reject(new Error('suppression sans filtre refusée'));
    return assure().then(function () {
      return fetch(URL_PROJET + '/rest/v1/' + chemin, {
        method: 'DELETE', headers: entetes(true)
      });
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t || ('HTTP ' + r.status)); });
      return true;
    });
  }

  /* Appel d'une fonction SQL (valider_copie, est_enseignant…). */
  function appeler(fonction, params) {
    return assure().then(function () {
      return fetch(URL_PROJET + '/rest/v1/rpc/' + fonction, {
        method: 'POST', headers: entetes(true),
        body: JSON.stringify(params || {})
      });
    }).then(function (r) {
      return r.text().then(function (t) {
        if (!r.ok) {
          /* PostgREST enveloppe le message de RAISE EXCEPTION dans
             un JSON : on le ressort tel quel, il est écrit en
             français dans les fonctions. */
          var m = t;
          try { m = (JSON.parse(t).message) || t; } catch (e) {}
          throw new Error(m);
        }
        try { return JSON.parse(t); } catch (e) { return t; }
      });
    });
  }

  /* ----------------------------------------------------------
   *  4. Connexion, rôle, déconnexion
   * ---------------------------------------------------------- */
  function connexion(email, motDePasse) {
    return auth('token?grant_type=password',
                { email: String(email || '').trim(), password: motDePasse })
      .then(function (d) { poser(d); return verifierRole(); });
  }

  /* Être connecté ne suffit pas : un compte élève est « authenticated »
     lui aussi. C'est est_enseignant() qui tranche, côté base, et c'est
     la même fonction que les policies interrogent — donc pas moyen que
     l'écran affiche autre chose que ce que la base autorise. */
  function verifierRole() {
    return appeler('est_enseignant').then(function (oui) {
      if (oui !== true) { deconnexion(); throw new Error('PAS_ENSEIGNANT'); }
      return lire('enseignants?select=libelle&limit=1').then(function (l) {
        moi = { libelle: (l && l[0] && l[0].libelle) || 'Professeur' };
        return moi;
      });
    });
  }

  function deconnexion() {
    jeton = null; moi = null; noms = {};
    ecrireStocke(null);
  }

  /* Reprise silencieuse au chargement de la page : s'il reste un
     jeton non périmé, on revérifie le rôle. Toute erreur ramène à
     l'écran de connexion — on ne devine jamais un droit. */
  function reprendre() {
    jeton = lireStocke();
    if (!jeton) return Promise.reject(new Error('AUCUNE_SESSION'));
    return verifierRole();
  }

  /* ----------------------------------------------------------
   *  5. La table des noms — mémoire vive UNIQUEMENT
   *
   *  Le fichier reste sur la machine ; le navigateur le lit sans
   *  rien envoyer. On ne l'écrit NI en base, NI en localStorage :
   *  un iPad ne doit pas garder de noms d'élèves en cache. Le prix
   *  est de le recharger à chaque session — deux touches, et c'est
   *  ce qui permet de projeter au tableau sans exposer personne.
   *
   *  Format attendu, une ligne par élève :  identifiant;Nom Prénom
   *  Le point-virgule ou la virgule font l'affaire (Excel français
   *  produit le premier).
   * ---------------------------------------------------------- */
  var noms = {};

  /* Renvoie { n, ignorees, apercu } plutôt qu'un simple compte.
     Motif (31/07, découvert au premier essai) : un compte seul ment
     par omission. Un fichier de cours à deux colonnes se charge
     sans broncher et annonce « 2 noms chargés » — et l'écran
     afficherait ensuite des noms FAUX en face des identifiants, ce
     qui est pire que pas de nom. L'aperçu permet de voir en une
     seconde qu'on s'est trompé de fichier. */
  function chargerNoms(texte) {
    var table = {}, n = 0, ignorees = 0, apercu = [];
    String(texte || '').split(/\r?\n/).forEach(function (ligne) {
      if (!ligne.trim()) return;
      var sep = ligne.indexOf(';') >= 0 ? ';' : ',';
      var m = ligne.split(sep);
      if (m.length < 2) { ignorees++; return; }
      var id  = m[0].trim();
      var nom = m.slice(1).join(sep).trim();
      if (!id || !nom) { ignorees++; return; }
      /* en-tête éventuel : on ne l'inscrit pas */
      if (/^(identifiant|pseudo|login|id)$/i.test(id)) return;
      table[id.toLowerCase()] = nom;
      n++;
      if (apercu.length < 3) apercu.push([id, nom]);
    });
    noms = table;
    return { n: n, ignorees: ignorees, apercu: apercu };
  }

  /* Renvoie le vrai nom si la table est chargée, le pseudonyme
     sinon. C'est ce repli qui fait le « mode projection ». */
  function nomDe(pseudo) {
    if (!pseudo) return '';
    return noms[String(pseudo).toLowerCase()] || pseudo;
  }

  function nomsCharges() { return Object.keys(noms).length; }
  function oublierNoms()  { noms = {}; }

  /* ---------------------------------------------------------- */
  global.ProfAPI = {
    connexion    : connexion,
    reprendre    : reprendre,
    deconnexion  : deconnexion,
    connecte     : function () { return !!moi; },
    moi          : function () { return moi; },
    lire         : lire,
    ecrire       : ecrire,
    supprimer    : supprimer,
    appeler      : appeler,
    chargerNoms  : chargerNoms,
    nomDe        : nomDe,
    nomsCharges  : nomsCharges,
    oublierNoms  : oublierNoms,
    PEREMPTION   : PEREMPTION
  };

})(window);
