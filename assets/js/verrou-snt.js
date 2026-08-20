/* ============================================================
 *  verrou-snt.js — le plafond d'avance
 *  ------------------------------------------------------------
 *  Une classe peut ouvrir au plus `avance_max` séances (2 par
 *  défaut) au-delà de la dernière séance réellement faite, toutes
 *  séquences confondues — le plafond franchit donc les fins de
 *  thème.
 *
 *  DEUX VERROUS QUI S'ADDITIONNENT
 *  Le verrou de mérite existe depuis l'origine : la séance N+1
 *  s'ouvre quand la N est finie. Il n'avait pas de plafond, et un
 *  élève rapide traversait la séquence en une soirée. Celui-ci se
 *  pose par-dessus. Une séance est ouverte si elle passe les deux.
 *
 *  LE CURSEUR NE SE SAISIT PAS
 *  Il se déduit de `seances_faites`, donc de la clôture déjà faite
 *  pour le cahier de textes. Aucune saisie nouvelle pour Loïc.
 *
 *  🔴 TROIS RÈGLES DE REPLI, TOUTES DANS LE MÊME SENS : OUVRIR
 *   1. tant que la réponse de la base n'est pas arrivée, rien n'est
 *      fermé — sinon la page clignoterait, fermée puis ouverte ;
 *   2. pas de compte, pas de classe, base muette, fonction pas
 *      encore appliquée → rien n'est fermé ;
 *   3. une séance que `seances-snt.js` ne connaît pas → ouverte.
 *  Le cours passe avant le dispositif. Un élève qui a oublié son
 *  mot de passe ne doit pas se retrouver devant une page morte.
 *
 *  ⚠ C'EST UN PANNEAU, PAS UN MUR. Le site est public : une URL
 *  tapée à la main mène au thème. Décision de Loïc, déjà inscrite
 *  dans hub-snt.js. Ne pas essayer d'en faire une sécurité.
 *
 *  RGPD : aucune donnée personnelle n'entre ni ne sort. Le plafond
 *  est un fait de classe, pas un fait d'élève.
 * ============================================================ */
(function (global) {
  'use strict';

  var doc = global.document;

  /* ----------------------------------------------------------
   *  1. L'ordre des séances
   *
   *  Source unique : `window.SEANCES_SNT`, produit par
   *  generer-seances.mjs à partir des huit pages. On linéarise
   *  t0 → t7, et dans chaque thème l'ordre du fichier.
   *
   *  Le tableau de bord du professeur lit CE calcul-ci, il n'en
   *  refait pas un second : deux ordres séparés finiraient par ne
   *  plus dire la même chose, et c'est l'élève qui verrait la
   *  différence.
   * ---------------------------------------------------------- */
  var _rangs = null;

  function rangs() {
    if (_rangs) return _rangs;
    var table = global.SEANCES_SNT || {};
    var themes = Object.keys(table).sort();   /* snt-t0, snt-t1, … */
    var liste = [];
    themes.forEach(function (sequence) {
      (table[sequence] || []).forEach(function (s) {
        liste.push({
          sequence: sequence,
          seance  : s.id,
          num     : s.num || '',
          nom     : s.nom || '',
          rang    : liste.length
        });
      });
    });
    _rangs = liste;
    return _rangs;
  }

  function cle(sequence, seance) { return sequence + '/' + seance; }

  function rangDe(sequence, seance) {
    var liste = rangs();
    for (var i = 0; i < liste.length; i++) {
      if (liste[i].sequence === sequence && liste[i].seance === seance) return liste[i].rang;
    }
    return -1;                                 /* inconnue du référentiel */
  }

  /* ----------------------------------------------------------
   *  2. L'état, tel qu'on le connaît à cet instant
   * ---------------------------------------------------------- */
  var etatCourant = {
    connu       : false,   /* la base a-t-elle répondu ? */
    classe      : false,   /* l'élève est-il rattaché à une classe ? */
    avanceMax   : null,
    plafondLeve : false,
    dernierFait : -1,      /* rang de la dernière séance faite, -1 si aucune */
    plafond     : Infinity /* rang maximal ouvert */
  };

  function etat() { return etatCourant; }

  /* Une séance est-elle ouverte, au regard du seul plafond ?
   * Le verrou de mérite, lui, reste l'affaire du moteur de page. */
  function ouverteSeance(sequence, seance) {
    if (!etatCourant.connu || !etatCourant.classe) return true;   /* repli 1 et 2 */
    if (etatCourant.plafondLeve) return true;                     /* soupape */
    var r = rangDe(sequence, seance);
    if (r < 0) return true;                                       /* repli 3 */
    return r <= etatCourant.plafond;
  }

  /* Raccourci pour une page de séquence : `ouverte('s3')` — la
   * séquence est celle de la page, lue dans <body data-sequence>. */
  function sequenceDeLaPage() {
    return (doc && doc.body && doc.body.getAttribute('data-sequence')) || '';
  }

  function ouverte(idSeance) {
    var sequence = sequenceDeLaPage();
    if (!sequence) return true;
    return ouverteSeance(sequence, idSeance);
  }

  /* ----------------------------------------------------------
   *  3. Calculer le plafond à partir de la réponse
   * ---------------------------------------------------------- */
  function appliquer(reponse) {
    etatCourant.connu = true;
    if (!reponse || !reponse.classe) { etatCourant.classe = false; return etatCourant; }

    etatCourant.classe      = true;
    etatCourant.avanceMax   = typeof reponse.avanceMax === 'number' ? reponse.avanceMax : 2;
    etatCourant.plafondLeve = !!reponse.plafondLeve;

    /* Rang de la dernière séance faite, tous thèmes confondus. Une
     * séance faite mais absente du référentiel (page pas encore
     * générée) est ignorée : elle ne doit ni ouvrir, ni fermer. */
    var dernier = -1, vues = {};
    (reponse.faites || []).forEach(function (f) {
      if (!f || vues[cle(f.sequence, f.seance)]) return;
      vues[cle(f.sequence, f.seance)] = true;
      var r = rangDe(f.sequence, f.seance);
      if (r > dernier) dernier = r;
    });
    etatCourant.dernierFait = dernier;
    etatCourant.plafond = etatCourant.plafondLeve
      ? Infinity
      : dernier + etatCourant.avanceMax;
    return etatCourant;
  }

  /* ----------------------------------------------------------
   *  4. Marquer les séances de la page
   *
   *  `.plafonne` ne ferme rien par elle-même : c'est `.locked`,
   *  posée par le moteur, qui commande le sommaire, la barre « tu es
   *  ici » et les gardes de saisie. `.plafonne` sert seulement à
   *  choisir le TEXTE du bandeau — dire « finis la séance
   *  précédente » à un élève qui l'a finie serait un mensonge.
   *
   *  On réutilise le `.lock-banner` déjà présent dans la page plutôt
   *  que d'en empiler un second : deux bandeaux l'un sous l'autre,
   *  dont un faux, c'est pire que pas de bandeau du tout. Le texte
   *  d'origine est mis de côté et remis en place si le plafond se
   *  lève sans rechargement.
   *
   *  La séance 1 n'a pas de bandeau dans le HTML — elle n'est jamais
   *  verrouillée par le mérite. Le plafond, lui, peut la fermer
   *  (avance_max = 0, rien de clôturé) : on en crée un, sinon
   *  l'élève verrait une séance vide sans un mot d'explication.
   * ---------------------------------------------------------- */

  /* ⏳ Texte à valider par Loïc : c'est du fond pédagogique, pas un
   * acquis (inscrit en attente d'arbitrage dans DECISIONS.md). */
  var MOT_PLAFOND = "<b>Cette séance n'est pas encore ouverte.</b> On avance ensemble : "
                  + "elle s'ouvrira quand la classe aura terminé les séances précédentes.";

  function bandeauDe(sec) {
    var b = sec.querySelector('.lock-banner');
    if (b) return b;
    var cible = sec.querySelector('.lockable');
    if (!cible) return null;
    b = doc.createElement('div');
    b.className = 'lock-banner';
    b.setAttribute('data-plafond-cree', '');
    b.innerHTML = '<span class="k"></span><span class="mot"></span>';
    cible.parentNode.insertBefore(b, cible);
    return b;
  }

  /* 🔴 Le span DU MESSAGE, et lui seul.
   *
   *  Le bandeau porte jusqu'à trois enfants :
   *    <span class="k">      le cadenas, posé par le CSS
   *    <span>                le message
   *    <span class="compte"> « 5 étapes », ajouté APRÈS coup par
   *                          compteurSeances() (sequence-snt.js)
   *
   *  Viser `span:last-child` attrapait donc le compteur dès qu'il
   *  était là : le message du plafond partait dans un élément
   *  `white-space:nowrap` en chasse fixe, qui débordait du cadre,
   *  et le vrai message se retrouvait comprimé sur une colonne de
   *  trois mots. Au passage, `data-mot-origine` mémorisait
   *  « 5 étapes » et le recollait à la place du message de mérite
   *  quand le plafond se levait. Un seul sélecteur, deux dégâts.
   *
   *  On désigne donc le message par élimination — ni le cadenas, ni
   *  le compteur — et on le marque `.mot` pour que la fois d'après
   *  soit directe. Enfants directs seulement : le message contient
   *  du <b>, un jour peut-être un <span>. */
  function motDe(b) {
    var m = b.querySelector(':scope > span.mot');
    if (m) return m;
    var enfants = b.children;
    for (var i = 0; i < enfants.length; i++) {
      var e = enfants[i];
      if (e.tagName !== 'SPAN') continue;
      if (e.classList.contains('k') || e.classList.contains('compte')) continue;
      e.classList.add('mot');
      return e;
    }
    /* Aucun : bandeau réduit au cadenas. On insère le message AVANT
     * le compteur, qui doit rester le dernier — son `margin-left:auto`
     * est ce qui le colle à droite. */
    m = doc.createElement('span');
    m.className = 'mot';
    b.insertBefore(m, b.querySelector(':scope > span.compte'));
    return m;
  }

  function marquerLaPage() {
    if (!doc) return;
    var sections = doc.querySelectorAll('.seance[id]');
    Array.prototype.forEach.call(sections, function (sec) {
      var fermee = !ouverte(sec.id);
      sec.classList.toggle('plafonne', fermee);
      var b = bandeauDe(sec);
      if (!b) return;
      var texte = motDe(b);
      if (!texte) return;
      if (fermee) {
        if (b.getAttribute('data-mot-origine') === null) {
          b.setAttribute('data-mot-origine', texte.innerHTML);
        }
        texte.innerHTML = MOT_PLAFOND;
      } else if (b.hasAttribute('data-plafond-cree')) {
        b.parentNode.removeChild(b);
      } else if (b.getAttribute('data-mot-origine') !== null) {
        texte.innerHTML = b.getAttribute('data-mot-origine');
        b.removeAttribute('data-mot-origine');
      }
    });
  }

  /* ----------------------------------------------------------
   *  5. Démarrage
   *
   *  On interroge la base une fois, puis on prévient la page par un
   *  événement : le plafond arrive APRÈS le premier rendu, et sans
   *  ce signal la cascade de déverrouillage ne se rejouerait jamais.
   * ---------------------------------------------------------- */
  var _pret = null;

  function demarrer() {
    if (_pret) return _pret;
    var source = (global.Progression && global.Progression.plafond)
      ? global.Progression.plafond()
      : Promise.resolve({ classe: false });

    _pret = source
      .catch(function () { return { classe: false }; })
      .then(function (reponse) {
        appliquer(reponse);
        marquerLaPage();
        if (doc) doc.dispatchEvent(new CustomEvent('plafond-connu', { detail: etatCourant }));
        return etatCourant;
      });
    return _pret;
  }

  global.VerrouSNT = {
    rangs        : rangs,
    rangDe       : rangDe,
    etat         : etat,
    ouverte      : ouverte,
    ouverteSeance: ouverteSeance,
    appliquer    : appliquer,      /* exposé pour les tests et le tableau de bord */
    marquerLaPage: marquerLaPage,
    pret         : demarrer
  };

  if (doc) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', demarrer);
    else demarrer();
  }

})(window);
