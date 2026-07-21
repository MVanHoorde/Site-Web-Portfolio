/* ============================================================
 *  progression.js — client de base de données des séquences SNT
 *  ------------------------------------------------------------
 *  Ressource PARTAGÉE : c'est, avec assets/css/fonts.css, la seule
 *  dérogation à la règle « une séquence SNT est autonome »
 *  (CONSIGNES-sequence-SNT.md §5, dérogation validée le 20/07/2026).
 *  Dupliquer ce fichier dans huit pages rendrait toute correction
 *  impossible à propager.
 *
 *  Ce qu'il fait : parler à Supabase (PostgreSQL managé, Paris) en
 *  HTTP nu. Pas de bibliothèque supabase-js — elle ne se charge que
 *  depuis un CDN, ce qui exposerait l'IP des élèves. Ici : fetch().
 *
 *  Contrat de données : _suivi/BDD-cadrage.md §4
 *  Règles d'accès    : bdd/schema/006-rls-et-fonctions.sql
 *
 *  RGPD — ce qui part sur le réseau : un pseudonyme, un code de
 *  classe, des réponses de cours. Aucun nom, aucun email, aucun mot
 *  de passe, aucune adresse. La session est anonyme.
 *
 *  localStorage — un seul contenu autorisé, et c'est ici : le jeton
 *  de session. C'est sa raison d'être (reconnaître l'élève d'une
 *  fois sur l'autre sans mot de passe). Aucune réponse, aucun score,
 *  aucun état d'étape ne doit y être recopié : ils vivent en base.
 * ============================================================ */

(function (global) {
  'use strict';

  /* ----------------------------------------------------------
   *  1. Réglages
   *
   *  La clé anonyme n'est PAS un secret : elle est faite pour vivre
   *  en clair dans une page publique. Ce qui protège les données,
   *  ce sont les règles RLS de la base, pas la discrétion de cette
   *  chaîne. La clé service_role, elle, ne doit jamais approcher ce
   *  fichier.
   *
   *  ⚠ À REMPLIR : tableau de bord Supabase → Project Settings →
   *    API Keys → « anon public ». Tant que c'est vide, le client
   *    reste en sommeil et les séquences fonctionnent sans base.
   * ---------------------------------------------------------- */
  var URL_PROJET = 'https://ztyvuiaohxekuyjeoaxz.supabase.co';
  var CLE_ANON   = '';

  var CLE_STOCKAGE = 'snt.session';   // seul usage du localStorage
  var SAISON       = '2026-2027';     // doit suivre la table evenements

  /* Session en mémoire. Rien d'autre que le jeton ne sera persisté. */
  var jeton   = null;   // { access_token, refresh_token, expires_at }
  var profil  = null;   // { eleveId, pseudo, classe, annee }

  /* ----------------------------------------------------------
   *  2. Disponibilité
   *
   *  Une séquence doit rester utilisable si la base est absente,
   *  injoignable ou pas encore configurée : le cours passe avant le
   *  dispositif. Les appelants testent Progression.disponible() et
   *  se replient proprement quand c'est faux.
   * ---------------------------------------------------------- */
  function disponible() {
    return CLE_ANON.length > 0;
  }

  function exigeConfiguration() {
    if (!disponible()) {
      throw new Error('BASE_NON_CONFIGUREE : renseigner CLE_ANON dans assets/js/progression.js.');
    }
  }

  /* ----------------------------------------------------------
   *  3. Le jeton de session
   * ---------------------------------------------------------- */
  function lireJetonStocke() {
    try {
      var brut = global.localStorage.getItem(CLE_STOCKAGE);
      return brut ? JSON.parse(brut) : null;
    } catch (e) {
      return null;   // navigation privée, quota, JSON abîmé : on repart à zéro
    }
  }

  function ecrireJetonStocke(valeur) {
    try {
      if (valeur) global.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(valeur));
      else        global.localStorage.removeItem(CLE_STOCKAGE);
    } catch (e) { /* stockage refusé : la session ne durera que l'onglet */ }
  }

  function memoriser(reponseAuth) {
    jeton = {
      access_token : reponseAuth.access_token,
      refresh_token: reponseAuth.refresh_token,
      // expires_at est en secondes côté serveur ; on le passe en
      // millisecondes et on retire 60 s de marge, pour ne jamais
      // envoyer un jeton qui expire pendant le voyage.
      expires_at   : (reponseAuth.expires_at * 1000) - 60000
    };
    ecrireJetonStocke(jeton);
    return jeton;
  }

  function jetonValide() {
    return jeton && jeton.access_token && Date.now() < jeton.expires_at;
  }

  /* ----------------------------------------------------------
   *  4. Les trois appels HTTP de base
   * ---------------------------------------------------------- */
  function enteteCommune() {
    return { apikey: CLE_ANON, 'Content-Type': 'application/json' };
  }

  function auth(chemin, corps) {
    return fetch(URL_PROJET + '/auth/v1/' + chemin, {
      method : 'POST',
      headers: enteteCommune(),
      body   : JSON.stringify(corps || {})
    }).then(lireReponse);
  }

  /* Toute requête sur les tables passe par ici : le jeton est
   * rafraîchi d'abord si nécessaire, jamais au milieu. */
  function api(chemin, options) {
    exigeConfiguration();
    options = options || {};
    return assurerSession().then(function () {
      var entetes = enteteCommune();
      entetes.Authorization = 'Bearer ' + jeton.access_token;
      if (options.prefer) entetes.Prefer = options.prefer;
      return fetch(URL_PROJET + '/rest/v1/' + chemin, {
        method : options.method || 'GET',
        headers: entetes,
        body   : options.body ? JSON.stringify(options.body) : undefined
      }).then(lireReponse);
    });
  }

  /* Un appel de fonction SQL (§8-9 du fichier 006). */
  function rpc(nom, arguments_) {
    exigeConfiguration();
    var entetes = enteteCommune();
    if (jetonValide()) entetes.Authorization = 'Bearer ' + jeton.access_token;
    return fetch(URL_PROJET + '/rest/v1/rpc/' + nom, {
      method : 'POST',
      headers: entetes,
      body   : JSON.stringify(arguments_ || {})
    }).then(lireReponse);
  }

  function lireReponse(r) {
    return r.text().then(function (texte) {
      var donnees = null;
      if (texte) { try { donnees = JSON.parse(texte); } catch (e) { donnees = texte; } }
      if (r.ok) return donnees;

      // PostgREST range le  hint  de nos exceptions SQL dans .hint,
      // et le message ('CODE_CLASSE_INCONNU'…) dans .message.
      var e = new Error((donnees && (donnees.hint || donnees.message || donnees.error_description)) || ('HTTP ' + r.status));
      e.code   = (donnees && donnees.message) || String(r.status);
      e.statut = r.status;
      throw e;
    });
  }

  /* ----------------------------------------------------------
   *  5. Ouvrir / retrouver une session
   *
   *  Trois cas, dans l'ordre : jeton encore valide → on garde ;
   *  jeton expiré mais rafraîchissable → on le renouvelle ; rien
   *  d'exploitable → nouvelle session anonyme.
   * ---------------------------------------------------------- */
  var sessionEnCours = null;   // évite deux ouvertures simultanées

  function assurerSession() {
    if (jetonValide()) return Promise.resolve(jeton);
    if (sessionEnCours) return sessionEnCours;

    if (!jeton) jeton = lireJetonStocke();
    if (jetonValide()) return Promise.resolve(jeton);

    var demarche = jeton && jeton.refresh_token
      ? auth('token?grant_type=refresh_token', { refresh_token: jeton.refresh_token })
          .catch(function () { return auth('signup', {}); })   // jeton périmé côté serveur
      : auth('signup', {});                                    // connexion anonyme

    sessionEnCours = demarche
      .then(memoriser)
      .then(function (j) { sessionEnCours = null; return j; })
      .catch(function (e) { sessionEnCours = null; jeton = null; ecrireJetonStocke(null); throw e; });

    return sessionEnCours;
  }

  /* ----------------------------------------------------------
   *  6. Identité de l'élève
   * ---------------------------------------------------------- */

  /* Qui est là ? Renvoie null si la session n'est rattachée à aucun
   * élève (première visite, ou classe jamais rejointe). */
  function session() {
    if (!disponible()) return Promise.resolve(null);
    if (profil) return Promise.resolve(profil);
    return assurerSession()
      .then(function () { return rpc('ma_session'); })
      .then(function (lignes) {
        if (!lignes || !lignes.length) return null;
        profil = {
          eleveId: lignes[0].eleve_id,
          pseudo : lignes[0].pseudo,
          classe : lignes[0].classe_libelle,
          annee  : lignes[0].annee_scolaire
        };
        return profil;
      })
      .catch(function () { return null; });   // hors ligne : la séquence continue
  }

  /* Inscription : pseudo + code de classe, rien d'autre.
   * Erreurs possibles, telles que les lève la fonction SQL :
   *   CODE_CLASSE_INCONNU · PSEUDO_DEJA_PRIS · AUCUNE_SESSION */
  function rejoindre(pseudo, codeClasse) {
    exigeConfiguration();
    return assurerSession()
      .then(function () {
        return rpc('rejoindre_classe', {
          p_code  : String(codeClasse || '').trim().toUpperCase(),
          p_pseudo: String(pseudo || '').trim()
        });
      })
      .then(function () { profil = null; return session(); });
  }

  /* Quitter : on oublie le jeton. Les données restent en base — un
   * élève qui se reconnecte avec le même pseudo dans la même classe
   * repart d'une session vierge ; c'est une limite connue du choix
   * « pas de mot de passe », à traiter au moment du pilote. */
  function quitter() {
    jeton = null; profil = null;
    ecrireJetonStocke(null);
    return Promise.resolve();
  }

  /* ----------------------------------------------------------
   *  7. progression — l'état courant
   *
   *  domaine : 'cours' | 'deverrouillage' | 'rpg' | 'profil'
   *            (liste fermée en base : une faute de frappe est
   *             refusée au lieu de créer une catégorie fantôme)
   *  cle     : 'snt-t1', 'NET-2b', 'avatar'…
   *
   *  Règle d'or du JSONB : on lit TOUJOURS avec une valeur par
   *  défaut, et on AJOUTE des champs sans jamais en renommer ni en
   *  supprimer. D'où la fusion dans ecrire() : l'appelant n'a pas à
   *  connaître les champs posés par les autres composants.
   * ---------------------------------------------------------- */
  function lire(domaine, cle) {
    return api('progression?select=valeur'
             + '&domaine=eq.' + encodeURIComponent(domaine)
             + '&cle=eq.'     + encodeURIComponent(cle))
      .then(function (lignes) {
        return (lignes && lignes.length) ? lignes[0].valeur : {};
      })
      .catch(function () { return {}; });
  }

  function ecrire(domaine, cle, valeur) {
    return session().then(function (moi) {
      if (!moi) throw new Error('PAS_INSCRIT : rejoindre une classe avant d\'enregistrer.');
      return lire(domaine, cle).then(function (existant) {
        var fusion = Object.assign({ v: 1 }, existant, valeur);
        return api('progression?on_conflict=eleve_id,domaine,cle', {
          method: 'POST',
          prefer: 'resolution=merge-duplicates,return=representation',
          body  : [{ eleve_id: moi.eleveId, domaine: domaine, cle: cle, valeur: fusion }]
        }).then(function () { return fusion; });
      });
    });
  }

  /* ----------------------------------------------------------
   *  8. evenements — le journal
   *
   *  En ajout seul, côté base comme ici : pas de fonction pour
   *  modifier ou effacer, c'est délibéré. Une erreur se corrige par
   *  un événement compensatoire (logique comptable).
   * ---------------------------------------------------------- */
  function journal(type, charge) {
    return session().then(function (moi) {
      if (!moi) return null;
      return api('evenements', {
        method: 'POST',
        prefer: 'return=minimal',
        body  : [{
          eleve_id: moi.eleveId,
          type    : type,
          charge  : Object.assign({ v: 1 }, charge || {}),
          saison  : SAISON
        }]
      });
    }).catch(function () { return null; });   // un journal ne bloque jamais un élève
  }

  /* ----------------------------------------------------------
   *  9. reponses_libres — les copies de texte libre
   *
   *  codeActivite s'écrit avec un TIRET hors de la page : 'NET-2b',
   *  jamais 'NET·2b' (le point médian est fragile en base, en URL et
   *  en nom de fichier — CONSIGNES §14.3). L'affichage dans la
   *  séquence, lui, garde le point médian.
   *
   *  Renvoyer une réponse ne crée pas de doublon : la base met à
   *  jour la copie courante et archive automatiquement la
   *  précédente dans reponses_versions (déclencheur du fichier 005).
   *  Le statut repart à « en_attente », la correction s'efface :
   *  un nouveau texte mérite une nouvelle relecture.
   * ---------------------------------------------------------- */
  function envoyerReponse(codeActivite, texte) {
    return session().then(function (moi) {
      if (!moi) throw new Error('PAS_INSCRIT : rejoindre une classe avant d\'envoyer une réponse.');
      var propre = String(texte || '').trim();
      if (!propre)               throw new Error('REPONSE_VIDE');
      if (propre.length > 2000)  throw new Error('REPONSE_TROP_LONGUE : 2000 caractères maximum.');

      return api('reponses_libres?on_conflict=eleve_id,code_activite', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=representation',
        body  : [{ eleve_id: moi.eleveId, code_activite: codeActivite, texte: propre }]
      }).then(function (lignes) {
        journal('reponse_envoyee', { code_activite: codeActivite });
        return lignes && lignes[0];
      });
    });
  }

  /* Mes copies, avec leur statut et la correction si elle est là.
   * codes : tableau de codes d'activité, ou rien pour tout prendre. */
  function mesReponses(codes) {
    var chemin = 'reponses_libres?select=code_activite,texte,statut,version,correction_ia,commentaire_prof,envoye_le,corrige_le';
    if (codes && codes.length) {
      chemin += '&code_activite=in.(' + codes.map(encodeURIComponent).join(',') + ')';
    }
    return api(chemin).catch(function () { return []; });
  }

  /* Mes brouillons précédents pour une activité — support du futur
   * bouton « voir mes versions » (prévu, pas encore posé dans les
   * séquences : décision du 20/07). */
  function versions(codeActivite) {
    return api('reponses_versions?select=version,texte,statut,correction_ia,archive_le'
             + '&code_activite=eq.' + encodeURIComponent(codeActivite)
             + '&order=version.asc')
      .catch(function () { return []; });
  }

  /* ----------------------------------------------------------
   *  10. Surface publique
   * ---------------------------------------------------------- */
  global.Progression = {
    disponible    : disponible,
    session       : session,
    rejoindre     : rejoindre,
    quitter       : quitter,
    lire          : lire,
    ecrire        : ecrire,
    journal       : journal,
    envoyerReponse: envoyerReponse,
    mesReponses   : mesReponses,
    versions      : versions
  };

  if (!disponible() && global.console) {
    console.info('[progression] Base non configurée : les séquences fonctionnent sans enregistrement. Renseigner CLE_ANON dans assets/js/progression.js.');
  }

})(window);
