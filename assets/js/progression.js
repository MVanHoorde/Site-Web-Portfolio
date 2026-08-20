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
      expires_at   : (reponseAuth.expires_at * 1000) - 60000,
      /* on repart de maintenant : une connexion ou un renouvellement
         de jeton EST un passage */
      vu           : Date.now()
    };
    ecrireJetonStocke(jeton);
    return jeton;
  }

  function jetonValide() {
    return jeton && jeton.access_token && Date.now() < jeton.expires_at;
  }

  /* ----------------------------------------------------------
   *  Dernier passage — pour ne pas dire « content de te revoir »
   *  à quelqu'un qui n'est allé nulle part.
   *
   *  La modale de retour se montrait à CHAQUE arrivée sur le hub.
   *  L'intention était bonne (postes partagés), l'effet non : en
   *  passant du hub à un thème et retour, l'élève la voyait trois
   *  fois en deux minutes. Un message de retrouvailles adressé à
   *  quelqu'un qui n'est pas parti ne protège personne, il agace.
   *
   *  On la réserve donc à une VRAIE absence, avec le même seuil de
   *  2 h que les cartes de reprise — un seul seuil dans tout le
   *  dispositif, plus facile à expliquer et à régler.
   *
   *  Stockage : un champ de plus dans l'enregistrement de session
   *  DÉJÀ présent (clé 'snt.session'). Aucune nouvelle clé, aucune
   *  donnée de travail — la règle « le localStorage ne contient que
   *  le jeton de session » tient toujours.
   * ---------------------------------------------------------- */
  var SEUIL_RETOUR = 2 * 3600000;

  function absenceLongue() {
    var v = jeton && jeton.vu;
    if (!v) return true;                 /* jamais noté : on considère un retour */
    return (Date.now() - v) > SEUIL_RETOUR;
  }

  function noterPassage() {
    if (!jeton) return;
    jeton.vu = Date.now();
    ecrireJetonStocke(jeton);
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

      // Deux services, deux formes d'erreur, et il faut lire les deux :
      //  · PostgREST range le  hint  de nos exceptions SQL dans .hint,
      //    et le message ('CODE_CLASSE_INCONNU'…) dans .message ;
      //  · GoTrue (l'authentification) range le motif réel dans
      //    .error_code — 'weak_password', 'user_already_exists',
      //    'over_request_rate_limit'… — et le texte dans .msg.
      //
      // Ne lire que .message revenait à confondre TOUTES les erreurs
      // d'inscription : un mot de passe refusé par la politique du
      // projet s'affichait « cet identifiant est déjà pris », et
      // l'élève changeait d'identifiant à l'infini sans jamais toucher
      // à la seule chose qui n'allait pas.
      var e = new Error((donnees && (donnees.hint || donnees.message
                                  || donnees.msg || donnees.error_description))
                        || ('HTTP ' + r.status));
      e.code    = (donnees && donnees.message) || String(r.status);
      e.motif   = (donnees && (donnees.error_code || donnees.error)) || '';
      e.statut  = r.status;
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

  /* Jusqu'où la classe a le droit d'aller.
   *
   * Le curseur ne se saisit pas : il se déduit de `seances_faites`,
   * donc de la clôture déjà faite pour le cahier de textes. On ne
   * reçoit ici QUE des couples (séquence, séance) et deux réglages —
   * la fonction `mon_plafond()` du fichier 013 ne rend rien d'autre,
   * et surtout aucune note de séance.
   *
   * Le résultat est mis en cache pour la durée de la page : le
   * plafond d'une classe ne bouge pas trois fois dans une heure, et
   * le relire à chaque cascade de déverrouillage ferait un appel
   * réseau par clic. Conséquence assumée : si le professeur lève le
   * plafond en cours de séance, l'élève doit recharger la page.
   *
   * En cas d'erreur — hors ligne, base muette, fonction pas encore
   * appliquée — on renvoie `{ classe:false }`, c'est-à-dire « pas de
   * plafond ». Même doctrine que le reste du dispositif : le cours
   * passe avant le dispositif, et un élève qui a oublié son mot de
   * passe ne doit pas rester devant une page morte. */
  var plafondEnCache = null;

  function plafond() {
    if (plafondEnCache) return plafondEnCache;
    if (!disponible()) {
      plafondEnCache = Promise.resolve({ classe: false });
      return plafondEnCache;
    }
    plafondEnCache = assurerSession()
      .then(function () { return rpc('mon_plafond'); })
      .then(function (reponse) {
        if (!reponse || typeof reponse !== 'object' || !reponse.classe) return { classe: false };
        return {
          classe        : true,
          avanceMax     : typeof reponse.avance_max === 'number' ? reponse.avance_max : 2,
          plafondLeve   : !!reponse.plafond_leve,
          ouvertJusquAu : reponse.ouvert_jusqu_au || null,
          faites        : Array.isArray(reponse.faites) ? reponse.faites : []
        };
      })
      .catch(function () { return { classe: false }; });
    return plafondEnCache;
  }

  /* Normalise et vérifie l'identifiant choisi par l'élève.
   * Règle retenue (décision Loïc, 22/07) : minuscules, chiffres et
   * tirets, de 3 à 32 caractères. Il sert de pseudo affiché au
   * professeur ET à fabriquer l'adresse interne identifiant@snt.local
   * — d'où l'interdiction des espaces et des accents. */
  /* ----------------------------------------------------------
   *  Le mot de passe, tel que le projet Supabase l'exige
   *  ----------------------------------------------------------
   *  La politique est réglée dans le tableau de bord (Authentication
   *  → Password settings), pas ici : ce code ne fait que la refléter
   *  pour éviter un aller-retour réseau et, surtout, pour l'annoncer
   *  AVANT que l'élève tape. Une règle qu'on ne découvre qu'après
   *  coup, sur un message d'erreur, se vit comme une brimade.
   *
   *  Si la politique change côté Supabase, ces deux constantes
   *  changent avec elle — sinon le client refusera des mots de passe
   *  que le serveur accepte.
   * ---------------------------------------------------------- */
  var REGLE_MDP = 'Au moins 6 caractères, dont une majuscule et un chiffre.';

  function motDePasseInsuffisant(mdp) {
    if (mdp.length < 6)        return 'MOT_DE_PASSE_TROP_COURT';
    if (!/[a-z]/.test(mdp))    return 'MOT_DE_PASSE_FAIBLE';
    if (!/[A-Z]/.test(mdp))    return 'MOT_DE_PASSE_FAIBLE';
    if (!/[0-9]/.test(mdp))    return 'MOT_DE_PASSE_FAIBLE';
    return null;
  }

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
      var faible = motDePasseInsuffisant(mdp);
      if (faible) { var em = new Error(faible); em.code = faible; throw em; }
      return auth('signup', { email: emailSynthetique(id), password: mdp })
        .then(memoriser)
        .catch(function (e) {
          /* Un 422 de GoTrue ne veut pas dire « identifiant pris » :
             il faut lire le motif. Les confondre a coûté une séance
             de tâtonnement — l'élève changeait d'identifiant alors
             que c'était son mot de passe qui était refusé. */
          var d;
          if (e.motif === 'weak_password') {
            d = new Error('MOT_DE_PASSE_FAIBLE'); d.code = 'MOT_DE_PASSE_FAIBLE'; throw d;
          }
          if (e.motif === 'email_address_invalid') {
            d = new Error('IDENTIFIANT_REFUSE'); d.code = 'IDENTIFIANT_REFUSE'; throw d;
          }
          if (e.statut === 429 || /rate_limit/.test(e.motif)) {
            d = new Error('TROP_DE_TENTATIVES'); d.code = 'TROP_DE_TENTATIVES'; throw d;
          }

          /* ------------------------------------------------------
             L'identifiant existe déjà. Ce n'est pas forcément la
             faute de l'élève : créer un compte se fait en DEUX temps
             — le compte d'abord, l'inscription en classe ensuite —
             et si le second échoue (code de classe faux, réseau
             coupé), il reste un compte d'authentification que rien
             ne rattache à une classe. `ma_session()` ne renvoie
             alors rien, l'élève est traité comme non connecté, et
             « Créer mon compte » lui répond éternellement que son
             identifiant est pris : une impasse.

             On tente donc la connexion avec le mot de passe qu'il
             vient de taper. Si elle passe, c'est bien son compte :
             on le reprend là où il en était. Sinon seulement,
             l'identifiant appartient à quelqu'un d'autre.
             ------------------------------------------------------ */
          if (e.motif === 'user_already_exists' || e.motif === 'email_exists') {
            return auth('token?grant_type=password',
                        { email: emailSynthetique(id), password: mdp })
              .then(memoriser)
              .catch(function () {
                var pris = new Error('IDENTIFIANT_DEJA_PRIS');
                pris.code = 'IDENTIFIANT_DEJA_PRIS'; throw pris;
              });
          }

          /* Motif inconnu : on garde le texte du serveur plutôt que
             d'inventer une cause. Mieux vaut un message brut qu'un
             message faux. */
          throw e;
        })
        .then(function () {
          /* Déjà inscrit en classe ? rejoindre_classe() est idempotente
             (elle met à jour la date de visite et sort), mais l'appeler
             avec un code vide échouerait — on ne le fait donc que si
             l'élève n'a pas encore de fiche. */
          profil = null;
          return session();
        })
        .then(function (dejaInscrit) {
          if (dejaInscrit) return dejaInscrit;
          return rpc('rejoindre_classe', {
            p_code  : String(codeClasse || '').trim().toUpperCase(),
            p_pseudo: id
          }).then(function () { profil = null; return session(); });
        });
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
          var d;
          if (e.statut === 429 || /rate_limit/.test(e.motif)) {
            d = new Error('TROP_DE_TENTATIVES'); d.code = 'TROP_DE_TENTATIVES'; throw d;
          }
          if (e.statut === 400 || e.motif === 'invalid_credentials') {
            d = new Error('IDENTIFIANTS_INCORRECTS'); d.code = 'IDENTIFIANTS_INCORRECTS'; throw d;
          }
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
    /* Le badge affirme « connecté comme … » : le laisser après avoir
       fermé la session le ferait mentir. Tant que quitter() était
       toujours suivi d'un rechargement, ça ne se voyait pas ; depuis
       « Changer de compte », qui reste sur la page, ça se verrait —
       l'ancien identifiant s'afficherait derrière le formulaire.
       Retiré ici, donc valable pour tous les appelants. */
    var badge = global.document && global.document.querySelector('.acc-badge');
    if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
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

  /* Tout un domaine d'un coup.
   *
   *  POURQUOI : le hub SNT affiche l'avancement des huit thèmes. Huit
   *  appels à lire() = huit allers-retours réseau avant que la page ne
   *  s'affiche, sur le wifi d'un lycée. Ici la RLS filtre déjà sur
   *  l'élève connecté : demander le domaine entier ne révèle rien de
   *  plus qu'une clé, et coûte UNE requête au lieu de huit.
   *
   *  Renvoie { cle: valeur }. Une clé absente est simplement absente :
   *  l'appelant lit toujours avec une valeur par défaut (règle d'or du
   *  JSONB, §7 ci-dessus). */
  function lireTout(domaine) {
    return api('progression?select=cle,valeur'
             + '&domaine=eq.' + encodeURIComponent(domaine))
      .then(function (lignes) {
        var o = {};
        (lignes || []).forEach(function (l) { o[l.cle] = l.valeur || {}; });
        return o;
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

  /* ----------------------------------------------------------
   *  9 bis. partager() — la réponse personnelle, non notée
   *
   *  Même table que les copies, même limite, même unicité : pour
   *  l'élève comme pour le professeur, c'est un texte écrit, rangé
   *  au même endroit que le reste. Ce qui change est le STATUT.
   *
   *  'partage' n'entre pas dans le cycle de correction :
   *   · la file du tableau de bord filtre `statut = en_attente` ;
   *   · l'index partiel que lit le worker IA ne vise que ce même
   *     statut — la réponse n'est donc jamais soumise au modèle ;
   *   · la fiche élève, elle, lit tous les statuts : le professeur
   *     la voit, et c'est tout le but (il en fera une sélection
   *     pour lancer la discussion en classe).
   *
   *  ⚠ Exige `bdd/schema/014-reponses-personnelles.sql`. Sans lui,
   *  la contrainte de statut et les policies refusent 'partage' :
   *  l'appel échoue proprement (la page garde le texte à l'écran et
   *  le dit), rien n'est écrit de travers.
   * ---------------------------------------------------------- */
  function partager(codeActivite, texte) {
    return session().then(function (moi) {
      if (!moi) throw new Error('PAS_INSCRIT : rejoindre une classe avant de partager une réponse.');
      var propre = String(texte || '').trim();
      if (!propre)               throw new Error('REPONSE_VIDE');
      if (propre.length > 2000)  throw new Error('REPONSE_TROP_LONGUE : 2000 caractères maximum.');

      return api('reponses_libres?on_conflict=eleve_id,code_activite', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=representation',
        body  : [{ eleve_id: moi.eleveId, code_activite: codeActivite,
                   texte: propre, statut: 'partage' }]
      }).then(function (lignes) {
        journal('reponse_partagee', { code_activite: codeActivite });
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
   '.acc-bandeau button,.acc-bandeau a{margin-left:auto;background:none;border:0;color:#8a5a0c;font-weight:700;text-decoration:underline;cursor:pointer;font-family:inherit;font-size:13px;display:inline-flex;align-items:center;min-height:44px;padding:0 4px}'+
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
    IDENTIFIANT_REFUSE     : 'Cet identifiant n\'est pas accepté. Essaie sans tiret au début ni à la fin.',
    MOT_DE_PASSE_TROP_COURT: 'Mot de passe : 6 caractères minimum, dont une majuscule et un chiffre.',
    MOT_DE_PASSE_FAIBLE    : 'Mot de passe : il faut au moins une majuscule et un chiffre. Exemple : Atelier7.',
    IDENTIFIANT_DEJA_PRIS  : 'Cet identifiant est déjà pris. Choisis-en un autre — ou passe par « Me connecter » si c\'est le tien.',
    IDENTIFIANTS_INCORRECTS: 'Identifiant ou mot de passe incorrect.',
    TROP_DE_TENTATIVES     : 'Trop d\'essais en peu de temps. Attends une minute et recommence.',
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
    injecterStyleAccueil();          /* même raison que le badge */
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
    /* Le style est injecté ICI et pas seulement chez l'appelant : cette
       fonction n'était historiquement atteinte qu'APRÈS la modale, qui
       l'avait déjà injecté. Depuis que le badge peut s'afficher seul
       (pages autres que le hub, §10 bis), l'oublier le laissait sans
       position:fixed — donc invisible en haut à droite, et empilé nu en
       bas de page. Corrigé à la source. */
    injecterStyleAccueil();
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

    /* Deux entrées, deux gestes différents — elles pointaient sur la
       même fonction, si bien que « Changer de compte » déconnectait
       sans jamais proposer de compte.

       · Se déconnecter  → on quitte et on recharge. Sur un poste
         partagé, le rechargement efface de l'écran le travail de
         l'élève précédent avant que le suivant n'arrive.

       · Changer de compte → on quitte, PUIS on ouvre le formulaire
         SUR PLACE, sur l'onglet « Me connecter ». L'élève reste dans
         son thème : après connexion, afficherPortes() recharge la
         même page, désormais sous le nouveau compte.

       On quitte AVANT d'afficher le formulaire, et pas après : si
       l'élève s'éloigne sans finir, le compte précédent est déjà
       fermé. C'est un poste de salle informatique, pas un portable.

       Ceci est la seule exception assumée à « la connexion se fait au
       hub » (§10 bis). La règle protège d'une modale SUBIE au milieu
       d'un cours ; ici l'élève la demande explicitement. */
    function deconnexion() { quitter().then(function () { global.location.reload(); }); }
    function changerDeCompte() { quitter().then(function () { afficherPortes('connecter'); }); }
    badge.querySelector('[data-changer]').addEventListener('click', changerDeCompte);
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
        + '<input id="acc-mdp" type="password" autocomplete="new-password" placeholder="Atelier7">'
        + '<p class="acc-aide">' + REGLE_MDP + '</p>'
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
      '<div class="acc-carte" role="dialog" aria-modal="true" aria-label="Se connecter">'
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
      if (!profil) { afficherPortes('creer'); return; }
      /* déjà connecté : on ne l'accueille que s'il revient vraiment */
      if (absenceLongue()) afficherRetour(profil);
      else                 afficherBadgeConnecte(profil);
      noterPassage();
    });
  }

  /* ----------------------------------------------------------
   *  10 bis. UN SEUL point d'entrée : le hub SNT
   *
   *  Décision de Loïc (24/07/2026) : on se connecte au hub des thèmes,
   *  et nulle part ailleurs.
   *
   *  POURQUOI. La modale s'affichait sur toute page chargeant ce
   *  fichier. Un élève arrivant directement sur une séquence par un
   *  favori se voyait demander de créer un compte au milieu du cours,
   *  sans savoir où il était. Un point d'entrée unique donne une
   *  géographie : on entre par le hub, on voit sa progression, on
   *  choisit. Une séquence est une salle, pas une porte d'entrée.
   *
   *  MISE EN ŒUVRE. La page d'accueil se déclare : <body
   *  data-accueil="hub">. Elle est la seule à monter la modale. Sur
   *  toute autre page, deux cas :
   *    · session ouverte  → le badge « connecté comme … », rien de plus
   *    · pas de session   → un bandeau discret qui renvoie au hub
   *  Jamais de modale bloquante ailleurs : elle interromprait un élève
   *  déjà au travail sans rien lui apprendre d'utile.
   *
   *  monterAccueil() reste appelable à la main : la surface publique
   *  ne change pas, seul le déclenchement AUTOMATIQUE est restreint.
   * ---------------------------------------------------------- */
  function estPageAccueil() {
    var b = global.document && global.document.body;
    return !!(b && b.getAttribute('data-accueil') === 'hub');
  }

  /* Chemin du hub. Les séquences vivent dans le même dossier que lui,
   * d'où le défaut ; une page d'un autre dossier surcharge avec
   * <body data-accueil-url="…">. */
  function urlAccueil() {
    var b = global.document && global.document.body;
    return (b && b.getAttribute('data-accueil-url')) || '2nde-snt.html';
  }

  /* Bandeau de renvoi — pages autres que le hub, élève non connecté.
   *
   * Le texte se surcharge par <body data-renvoi-texte="…">. Il le faut :
   * sur les séquences SNT, rien n'est conservé sans compte, et le
   * bandeau doit le dire ; sur le livret CFA, le travail reste dans le
   * navigateur, et annoncer qu'il est perdu serait faux — un élève qui
   * lit une alerte inexacte cesse de croire les suivantes. */
  function afficherRenvoi() {
    if (global.document.querySelector('.acc-bandeau')) return;
    injecterStyleAccueil();
    var b = global.document.body;
    var texte = (b && b.getAttribute('data-renvoi-texte'))
      || 'Tu n\'es pas connecté — ton travail ne sera pas enregistré.';
    var bandeau = global.document.createElement('div');
    bandeau.className = 'acc-bandeau';
    bandeau.innerHTML = '<span aria-hidden="true">⚠️</span>'
      + '<span>' + esc(texte) + '</span>'
      + '<a href="' + esc(urlAccueil()) + '">Se connecter →</a>';
    global.document.body.appendChild(bandeau);
  }

  /* Ce qui se joue au chargement, selon la page. */
  function demarrer() {
    if (!disponible()) return;
    if (global.SNT_SANS_ACCUEIL) return;
    if (estPageAccueil()) { monterAccueil(); return; }
    session().then(function (profil) {
      if (profil) { afficherBadgeConnecte(profil); noterPassage(); }
      else        afficherRenvoi();
    });
  }

  /* ----------------------------------------------------------
   *  11. Surface publique
   * ---------------------------------------------------------- */
  global.Progression = {
    disponible    : disponible,
    session       : session,
    plafond       : plafond,
    creerCompte   : creerCompte,
    seConnecter   : seConnecter,
    quitter       : quitter,
    monterAccueil : monterAccueil,
    lire          : lire,
    lireTout      : lireTout,
    ecrire        : ecrire,
    journal       : journal,
    envoyerReponse: envoyerReponse,
    partager      : partager,
    mesReponses   : mesReponses,
    versions      : versions
  };

  if (!disponible() && global.console) {
    console.info('[progression] Base non configurée : les séquences fonctionnent sans enregistrement. Renseigner CLE_ANON dans assets/js/progression.js.');
  }

  /* Démarrage : dès que la page est prête. La modale d'accueil ne
   * s'affiche QUE sur le hub (voir §10 bis) ; ailleurs on se contente
   * du badge ou du bandeau de renvoi. */
  if (global.document) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', demarrer);
    } else {
      demarrer();
    }
  }

})(window);
