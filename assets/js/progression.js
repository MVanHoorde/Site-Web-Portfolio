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
 *  RGPD — ce qui part sur le réseau : un identifiant pseudonyme, un
 *  mot de passe (haché par Supabase, jamais lisible), un code de
 *  classe, des réponses de cours. Aucun nom réel, aucune adresse
 *  réelle : l'« email » est une étiquette interne identifiant@snt.local,
 *  jamais envoyée. La table identifiant→nom vit sur le PC du prof.
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
  var CLE_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eXZ1aWFvaHhla3V5amVvYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDQzNTIsImV4cCI6MjEwMDEyMDM1Mn0.iBBZiAIec0hSxzAU8FKNe6AO-HeysuxBKXduURBP7Hc';

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
   *  d'exploitable → pas de session (mode invité) tant que l'élève
   *  ne s'est pas connecté ou n'a pas créé de compte.
   * ---------------------------------------------------------- */
  var sessionEnCours = null;   // évite deux ouvertures simultanées

  function assurerSession() {
    if (jetonValide()) return Promise.resolve(jeton);
    if (sessionEnCours) return sessionEnCours;

    if (!jeton) jeton = lireJetonStocke();
    if (jetonValide()) return Promise.resolve(jeton);

    // Jeton expiré mais rafraîchissable : on le renouvelle sans
    // redemander le mot de passe à l'élève.
    if (jeton && jeton.refresh_token) {
      sessionEnCours = auth('token?grant_type=refresh_token', { refresh_token: jeton.refresh_token })
        .then(memoriser)
        .then(function (j) { sessionEnCours = null; return j; })
        .catch(function (e) { sessionEnCours = null; jeton = null; ecrireJetonStocke(null); throw e; });
      return sessionEnCours;
    }

    // Aucun jeton exploitable. On NE crée PLUS de session anonyme :
    // une session s'obtient désormais en créant un compte ou en se
    // connectant (creerCompte / seConnecter). Sans cela on reste en
    // mode invité, et rien ne s'enregistre — le cours passe avant le
    // dispositif. C'est aussi ce qui fait taire l'ancienne erreur 422.
    return Promise.reject(new Error('PAS_DE_SESSION'));
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

  /* Normalise et vérifie l'identifiant choisi par l'élève.
   * Règle retenue (décision Loïc, 22/07) : minuscules, chiffres et
   * tirets, de 3 à 32 caractères. Il sert de pseudo affiché au
   * professeur ET à fabriquer l'adresse interne identifiant@snt.local
   * — d'où l'interdiction des espaces et des accents. */
  function normaliserIdentifiant(brut) {
    var id = String(brut || '').trim().toLowerCase();
    if (!/^[a-z0-9-]{3,32}$/.test(id)) {
      var e = new Error('IDENTIFIANT_INVALIDE'); e.code = 'IDENTIFIANT_INVALIDE'; throw e;
    }
    return id;
  }

  function emailSynthetique(id) { return id + '@snt.local'; }

  /* Créer un compte : identifiant + mot de passe + code de classe.
   * Deux temps : (1) Supabase crée le compte et ouvre la session ;
   * (2) rejoindre_classe() crée la fiche élève, avec l'identifiant
   * comme pseudo. Le mot de passe est haché par Supabase, jamais
   * lisible. Erreurs possibles :
   *   IDENTIFIANT_INVALIDE · MOT_DE_PASSE_TROP_COURT ·
   *   IDENTIFIANT_DEJA_PRIS · CODE_CLASSE_INCONNU · PSEUDO_DEJA_PRIS */
  function creerCompte(identifiant, motDePasse, codeClasse) {
    return Promise.resolve().then(function () {
      exigeConfiguration();
      var id  = normaliserIdentifiant(identifiant);
      var mdp = String(motDePasse || '');
      if (mdp.length < 6) { var em = new Error('MOT_DE_PASSE_TROP_COURT'); em.code = 'MOT_DE_PASSE_TROP_COURT'; throw em; }
      return auth('signup', { email: emailSynthetique(id), password: mdp })
        .catch(function (e) {
          // GoTrue renvoie 422/400 quand l'adresse existe déjà.
          if (e.statut === 422 || e.statut === 400) { var d = new Error('IDENTIFIANT_DEJA_PRIS'); d.code = 'IDENTIFIANT_DEJA_PRIS'; throw d; }
          throw e;
        })
        .then(memoriser)
        .then(function () {
          return rpc('rejoindre_classe', {
            p_code  : String(codeClasse || '').trim().toUpperCase(),
            p_pseudo: id
          });
        })
        .then(function () { profil = null; return session(); });
    });
  }

  /* Se connecter : identifiant + mot de passe. Pour les visites
   * suivantes, depuis n'importe quel appareil (la maison comprise).
   * Erreurs possibles : IDENTIFIANT_INVALIDE · IDENTIFIANTS_INCORRECTS */
  function seConnecter(identifiant, motDePasse) {
    return Promise.resolve().then(function () {
      exigeConfiguration();
      var id = normaliserIdentifiant(identifiant);
      return auth('token?grant_type=password', {
          email: emailSynthetique(id), password: String(motDePasse || '')
        })
        .catch(function (e) {
          if (e.statut === 400) { var d = new Error('IDENTIFIANTS_INCORRECTS'); d.code = 'IDENTIFIANTS_INCORRECTS'; throw d; }
          throw e;
        })
        .then(memoriser)
        .then(function () { profil = null; return session(); });
    });
  }

  /* Quitter : on oublie le jeton local. Le compte reste en base ;
   * l'élève se reconnecte avec son identifiant + mot de passe, depuis
   * n'importe quel appareil, et retrouve toute sa progression. */
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
   *  10. Accueil — la modale « créer / se connecter / invité »
   *
   *  Injectée ici, pas dans chaque page : même raison que tout le
   *  reste du fichier, une seule copie à maintenir. Toute page SNT
   *  qui charge progression.js reçoit la modale.
   *
   *  Règles (décisions Loïc) : elle s'affiche à CHAQUE arrivée
   *  (protège les postes partagés) ; « continuer sans compte » n'est
   *  jamais mémorisé (elle revient à la page suivante) ; un compte
   *  reconnu voit « content de te revoir » plutôt que le formulaire.
   *  Ne s'affiche pas si la base n'est pas configurée : on ne bloque
   *  jamais une page derrière un dispositif absent.
   *
   *  RGPD : la modale ne stocke rien de plus que le jeton déjà géré
   *  plus haut. Le choix « invité » vit en mémoire de page, pas sur
   *  le disque.
   * ---------------------------------------------------------- */

  var CSS_ACCUEIL =
   '.acc-fond{position:fixed;inset:0;z-index:9999;background:rgba(22,31,51,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;font-family:"IBM Plex Sans",system-ui,sans-serif}'+
   '.acc-carte{background:var(--surface,#fff);border:1px solid var(--line,#d3dae7);border-radius:16px;max-width:420px;width:100%;padding:22px 24px;box-shadow:0 20px 60px rgba(0,0,0,.3);color:var(--ink,#161f33);max-height:92vh;overflow:auto}'+
   '.acc-tete{display:flex;align-items:center;gap:10px;margin-bottom:6px}'+
   '.acc-pastille{width:34px;height:34px;border-radius:50%;background:var(--link-wash,#e7ebfb);color:var(--link,#2445c7);display:inline-flex;align-items:center;justify-content:center;flex:none}'+
   '.acc-titre{font-size:18px;font-weight:600}'+
   '.acc-intro{font-size:14px;color:var(--ink-soft,#4a566e);line-height:1.55;margin:0 0 16px}'+
   '.acc-onglets{display:flex;gap:6px;background:var(--bg,#e9edf4);padding:4px;border-radius:10px;margin-bottom:16px}'+
   '.acc-onglet{flex:1;text-align:center;font-size:13px;padding:8px;border-radius:7px;color:var(--ink-soft,#4a566e);background:none;border:0;cursor:pointer;font-family:inherit}'+
   '.acc-onglet.actif{background:var(--link-wash,#e7ebfb);color:var(--link,#2445c7);font-weight:600}'+
   '.acc-label{display:block;font-size:13px;margin:0 0 4px}'+
   '.acc-carte input{width:100%;box-sizing:border-box;min-height:44px;border:1px solid var(--line,#d3dae7);border-radius:10px;padding:0 12px;font-size:15px;font-family:inherit;background:#fff;color:var(--ink,#161f33)}'+
   '.acc-carte input:focus{outline:2px solid var(--link,#2445c7);outline-offset:1px;border-color:var(--link,#2445c7)}'+
   '.acc-aide{font-size:12px;color:var(--ink-faint,#8b97ad);margin:4px 0 12px}'+
   '.acc-primaire{width:100%;min-height:46px;background:var(--link,#2445c7);color:#fff;border:0;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:4px}'+
   '.acc-primaire:disabled{opacity:.6;cursor:default}'+
   '.acc-rassure{font-size:12px;color:var(--ink-faint,#8b97ad);line-height:1.5;margin:14px 0 0;display:flex;gap:6px}'+
   '.acc-pied{text-align:center;margin-top:14px;padding-top:14px;border-top:1px solid var(--line,#d3dae7);font-size:13px;color:var(--ink-soft,#4a566e)}'+
   '.acc-lien{background:none;border:0;color:var(--link,#2445c7);cursor:pointer;font-family:inherit;font-size:13px;padding:0;text-decoration:underline}'+
   '.acc-err{font-size:13px;color:#a3271f;background:#fbeceb;border:1px solid #f0c9c6;border-radius:8px;padding:8px 10px;margin:0 0 12px}'+
   '.acc-bandeau{position:fixed;left:0;right:0;bottom:0;z-index:9998;background:#fdf1dd;border-top:1px solid #f0d9a8;color:#8a5a0c;font-family:"IBM Plex Sans",system-ui,sans-serif;font-size:13px;display:flex;align-items:center;gap:8px;padding:9px 14px}'+
   '.acc-bandeau button{margin-left:auto;background:none;border:0;color:#8a5a0c;font-weight:700;text-decoration:underline;cursor:pointer;font-family:inherit;font-size:13px}'+
   '@media (prefers-reduced-motion:reduce){.acc-fond{backdrop-filter:none}}'+
   '.acc-badge{position:fixed;top:10px;right:12px;z-index:9997;font-family:"IBM Plex Sans",system-ui,sans-serif}'+
   '.acc-badge-btn{display:inline-flex;align-items:center;gap:6px;background:var(--surface,#fff);border:1px solid var(--line,#d3dae7);border-radius:999px;padding:6px 12px;font-size:13px;color:var(--ink,#161f33);cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(0,0,0,.08)}'+
   '.acc-badge-nom{font-weight:600;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
   '.acc-menu{position:absolute;right:0;margin-top:6px;background:var(--surface,#fff);border:1px solid var(--line,#d3dae7);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.14);overflow:hidden;min-width:180px}'+
   '.acc-menu button{display:block;width:100%;text-align:left;background:none;border:0;padding:11px 14px;font-size:13px;color:var(--ink,#161f33);cursor:pointer;font-family:inherit}'+
   '.acc-menu button:hover{background:var(--bg,#e9edf4)}';

  var ICONE_BOUCLIER =
   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6z"/><path d="M9 12l2 2 4-4"/></svg>';

  var MSG_ERREUR = {
    IDENTIFIANT_INVALIDE   : 'Identifiant : seulement des minuscules, des chiffres et des tirets (3 à 32 caractères).',
    MOT_DE_PASSE_TROP_COURT: 'Mot de passe : 6 caractères minimum.',
    IDENTIFIANT_DEJA_PRIS  : 'Cet identifiant est déjà pris. Choisis-en un autre.',
    IDENTIFIANTS_INCORRECTS: 'Identifiant ou mot de passe incorrect.',
    CODE_CLASSE_INCONNU    : 'Code de classe inconnu, ou inscriptions fermées.',
    PSEUDO_DEJA_PRIS       : 'Cet identifiant est déjà utilisé dans cette classe.'
  };
  function messageErreur(e) {
    return (e && MSG_ERREUR[e.code]) || 'Quelque chose n\'a pas fonctionné. Réessaie dans un instant.';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var accueilMonte = false;
  var styleInjecte = false;

  function injecterStyleAccueil() {
    if (styleInjecte) return;
    var s = global.document.createElement('style');
    s.textContent = CSS_ACCUEIL;
    global.document.head.appendChild(s);
    styleInjecte = true;
  }

  function retirerFond() {
    var f = global.document.querySelector('.acc-fond');
    if (f) f.parentNode.removeChild(f);
  }

  /* Bandeau permanent du mode invité : « ton travail n'est pas
   * enregistré ». Un clic rouvre la modale sur l'onglet connexion. */
  function afficherBandeauInvite() {
    if (global.document.querySelector('.acc-bandeau')) return;
    var b = global.document.createElement('div');
    b.className = 'acc-bandeau';
    b.innerHTML = '<span aria-hidden="true">⚠️</span>'
      + '<span>Mode invité — ton travail n\'est pas enregistré.</span>'
      + '<button type="button">Se connecter</button>';
    b.querySelector('button').addEventListener('click', function () {
      b.parentNode.removeChild(b);
      afficherPortes('connecter');
    });
    global.document.body.appendChild(b);
  }

  /* Badge permanent « connecté comme … », coin haut droit, avec un
   * menu Se déconnecter. La déconnexion recharge la page : sur un
   * poste partagé, cela efface de l'écran le travail de l'élève
   * précédent avant que le suivant n'arrive. */
  function afficherBadgeConnecte(profil) {
    var ancien = global.document.querySelector('.acc-badge');
    if (ancien) ancien.parentNode.removeChild(ancien);

    var badge = global.document.createElement('div');
    badge.className = 'acc-badge';
    badge.innerHTML =
      '<button type="button" class="acc-badge-btn" aria-haspopup="true" aria-expanded="false">'
      +   '<span aria-hidden="true">👤</span>'
      +   '<span class="acc-badge-nom">' + esc(profil.pseudo) + '</span>'
      +   '<span aria-hidden="true">▾</span>'
      + '</button>'
      + '<div class="acc-menu" hidden>'
      +   '<button type="button" data-changer>Changer de compte</button>'
      +   '<button type="button" data-deco>Se déconnecter</button>'
      + '</div>';

    var btn  = badge.querySelector('.acc-badge-btn');
    var menu = badge.querySelector('.acc-menu');
    btn.addEventListener('click', function () {
      var ouvert = !menu.hidden;
      menu.hidden = ouvert;
      btn.setAttribute('aria-expanded', String(!ouvert));
    });
    // Un clic ailleurs referme le menu.
    global.document.addEventListener('click', function (ev) {
      if (!badge.contains(ev.target)) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    });

    function deconnexion() { quitter().then(function () { global.location.reload(); }); }
    badge.querySelector('[data-changer]').addEventListener('click', deconnexion);
    badge.querySelector('[data-deco]').addEventListener('click', deconnexion);

    global.document.body.appendChild(badge);
  }

  /* Compte reconnu : on ne redemande pas le mot de passe, on
   * confirme juste que c'est bien lui (postes partagés). */
  function afficherRetour(profil) {
    injecterStyleAccueil();
    retirerFond();
    var fond = global.document.createElement('div');
    fond.className = 'acc-fond';
    fond.innerHTML =
      '<div class="acc-carte" role="dialog" aria-modal="true" aria-label="Reprendre ta session">'
      +   '<div class="acc-tete"><span class="acc-pastille">' + ICONE_BOUCLIER + '</span>'
      +     '<span class="acc-titre">Content de te revoir</span></div>'
      +   '<p class="acc-intro">Tu es connecté comme <b>' + esc(profil.pseudo) + '</b>'
      +     (profil.classe ? ' — ' + esc(profil.classe) : '') + '. On continue&nbsp;?</p>'
      +   '<button class="acc-primaire" data-continuer>Continuer</button>'
      +   '<div class="acc-pied">Ce n\'est pas toi&nbsp;? '
      +     '<button class="acc-lien" data-changer>Changer de compte</button></div>'
      + '</div>';
    fond.querySelector('[data-continuer]').addEventListener('click', function () {
      retirerFond();
      afficherBadgeConnecte(profil);
    });
    fond.querySelector('[data-changer]').addEventListener('click', function () {
      quitter().then(function () { afficherPortes('connecter'); });
    });
    global.document.body.appendChild(fond);
    fond.querySelector('[data-continuer]').focus();
  }

  /* Première visite (ou déconnexion) : les trois portes.
   * onglet = 'creer' | 'connecter'. */
  function afficherPortes(onglet) {
    injecterStyleAccueil();
    retirerFond();
    var estCreer = onglet !== 'connecter';

    var champs = estCreer
      ? '<label class="acc-label" for="acc-id">Identifiant</label>'
        + '<input id="acc-id" type="text" autocomplete="username" placeholder="dede-33">'
        + '<p class="acc-aide">Minuscules, chiffres et tirets. C\'est le nom que ton professeur verra.</p>'
        + '<label class="acc-label" for="acc-mdp">Mot de passe</label>'
        + '<input id="acc-mdp" type="password" autocomplete="new-password" placeholder="6 caractères minimum">'
        + '<div style="height:12px"></div>'
        + '<label class="acc-label" for="acc-code">Code de la classe</label>'
        + '<input id="acc-code" type="text" autocomplete="off" placeholder="donné par ton professeur">'
      : '<label class="acc-label" for="acc-id">Identifiant</label>'
        + '<input id="acc-id" type="text" autocomplete="username" placeholder="dede-33">'
        + '<div style="height:12px"></div>'
        + '<label class="acc-label" for="acc-mdp">Mot de passe</label>'
        + '<input id="acc-mdp" type="password" autocomplete="current-password" placeholder="ton mot de passe">';

    var fond = global.document.createElement('div');
    fond.className = 'acc-fond';
    fond.innerHTML =
      '<div class="acc-carte" role="dialog" aria-modal="true" aria-label="Se connecter à la SNT">'
      +   '<div class="acc-tete"><span class="acc-pastille">' + ICONE_BOUCLIER + '</span>'
      +     '<span class="acc-titre">Avant de commencer</span></div>'
      +   '<p class="acc-intro">Connecte-toi pour retrouver ton travail d\'une fois sur l\'autre, au lycée comme à la maison. Aucun nom, aucune adresse mail&nbsp;: juste un identifiant que tu choisis.</p>'
      +   '<div class="acc-onglets">'
      +     '<button type="button" class="acc-onglet' + (estCreer ? ' actif' : '') + '" data-onglet="creer">Créer mon compte</button>'
      +     '<button type="button" class="acc-onglet' + (estCreer ? '' : ' actif') + '" data-onglet="connecter">Me connecter</button>'
      +   '</div>'
      +   '<div class="acc-err" role="alert" hidden></div>'
      +   '<form data-form>' + champs
      +     '<button type="submit" class="acc-primaire">' + (estCreer ? 'Créer mon compte' : 'Me connecter') + '</button>'
      +   '</form>'
      +   (estCreer ? '<p class="acc-rassure"><span aria-hidden="true">🔒</span><span>Ton mot de passe est chiffré&nbsp;: personne ne peut le lire, pas même ton professeur — il peut seulement le réinitialiser si tu l\'oublies.</span></p>' : '')
      +   '<div class="acc-pied">Juste regarder&nbsp;? '
      +     '<button class="acc-lien" data-invite>Continuer sans compte →</button></div>'
      + '</div>';

    fond.querySelectorAll('[data-onglet]').forEach(function (b) {
      b.addEventListener('click', function () { afficherPortes(b.getAttribute('data-onglet')); });
    });
    fond.querySelector('[data-invite]').addEventListener('click', function () {
      retirerFond();
      afficherBandeauInvite();
    });

    var form   = fond.querySelector('[data-form]');
    var erreur = fond.querySelector('.acc-err');
    var bouton = fond.querySelector('.acc-primaire');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      erreur.hidden = true;
      var id  = (fond.querySelector('#acc-id')  || {}).value || '';
      var mdp = (fond.querySelector('#acc-mdp') || {}).value || '';
      var code = (fond.querySelector('#acc-code') || {}).value || '';
      bouton.disabled = true; bouton.textContent = 'Un instant…';
      var promesse = estCreer ? creerCompte(id, mdp, code) : seConnecter(id, mdp);
      promesse.then(function () {
        // Session ouverte : on recharge pour repartir proprement (les
        // notes et la progression se rechargent avec la session).
        global.location.reload();
      }).catch(function (e) {
        erreur.textContent = messageErreur(e);
        erreur.hidden = false;
        bouton.disabled = false;
        bouton.textContent = estCreer ? 'Créer mon compte' : 'Me connecter';
      });
    });

    global.document.body.appendChild(fond);
    var premier = fond.querySelector('input');
    if (premier) premier.focus();
  }

  /* Point d'entrée : appelé automatiquement au chargement de la page,
   * ou à la main. Un garde-fou window.SNT_SANS_ACCUEIL = true permet
   * à une page de s'en passer (démos, tests). */
  function monterAccueil() {
    if (accueilMonte) return;
    if (!disponible()) return;               // base non configurée
    if (global.SNT_SANS_ACCUEIL) return;     // échappatoire
    accueilMonte = true;
    session().then(function (profil) {
      if (profil) afficherRetour(profil);
      else        afficherPortes('creer');
    });
  }

  /* ----------------------------------------------------------
   *  11. Surface publique
   * ---------------------------------------------------------- */
  global.Progression = {
    disponible    : disponible,
    session       : session,
    creerCompte   : creerCompte,
    seConnecter   : seConnecter,
    quitter       : quitter,
    monterAccueil : monterAccueil,
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

  /* Démarrage : dès que la page est prête, on présente la modale
   * d'accueil (si la base est configurée). */
  if (global.document) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', monterAccueil);
    } else {
      monterAccueil();
    }
  }

})(window);
