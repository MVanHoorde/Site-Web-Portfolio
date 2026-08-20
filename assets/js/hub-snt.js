/* ============================================================
 *  hub-snt.js — le hub des huit thèmes
 *  ------------------------------------------------------------
 *  Point d'entrée élève. On arrive ici, on se connecte (la modale est
 *  montée par progression.js, §10 bis), on voit sa progression sur les
 *  huit thèmes, on choisit où aller.
 *
 *  D'OÙ VIENNENT LES CHIFFRES
 *  Chaque séquence écrit, en même temps que son état, un « résumé » :
 *  ses séances, leurs noms, et combien d'étapes y sont faites sur
 *  combien (EtatSNT.resume, dans sequence-snt.js). Le hub lit ces
 *  résumés — TOUS EN UNE REQUÊTE via Progression.lireTout('cours') —
 *  et n'a donc rien à savoir du contenu des pages. Ajouter une séance
 *  à un thème met le hub à jour sans qu'on y touche.
 *
 *  CE QUE LE HUB NE FAIT PAS
 *  Il ne lit pas les huit pages, il ne tient pas de liste de séances
 *  écrite à la main. La seule chose déclarée dans le HTML est ce que
 *  la base ne peut pas savoir : le titre du thème, son lien, et le
 *  nombre de séances ATTENDU (pour dessiner une carte plausible avant
 *  que l'élève n'ait ouvert le thème).
 *
 *  VERROUILLAGE — deux sources, une seule apparence
 *  Pédagogique, pas sécuritaire — le site est public, une URL tapée à
 *  la main mène au thème. C'est assumé (décision de Loïc).
 *   · MANUEL : data-verrou="oui" dans le HTML ferme un thème à la
 *     main. N'est posé nulle part aujourd'hui.
 *   · PLAFOND (20/08/2026) : la classe ne dépasse pas la dernière
 *     séance faite de plus de avance_max séances. Calculé par
 *     verrou-snt.js, qui le tient de la base.
 *  Le plafond se juge SÉANCE par séance, pas thème par thème : un
 *  thème entamé garde ses premières séances ouvertes et ne ferme que
 *  la suite. Une carte entièrement fermée porte une note qui dit
 *  pourquoi — une carte grisée sans motif se lit comme une panne.
 *
 *  RGPD : ce fichier ne lit que la progression de l'élève connecté
 *  (la RLS s'en charge côté base) et n'écrit rien.
 * ============================================================ */

(function (global) {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(x) {
    return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var CLES = [];          /* les thèmes, dans l'ordre de la page */
  var RESUMES = {};       /* cle -> résumé lu en base */

  function lireThemes() {
    return $$('.theme-carte').map(function (el, i) {
      return {
        el      : el,
        cle     : el.dataset.cle,
        lien    : el.dataset.lien || '',
        attendu : parseInt(el.dataset.seances || '0', 10) || 0,
        chantier: el.dataset.etat === 'chantier',
        verrouManuel: el.dataset.verrou === 'oui',
        rang    : i
      };
    });
  }

  /* ----------------------------------------------------------
   *  Les nœuds d'un thème
   *
   *  Trois cas, et il est important de ne pas les confondre :
   *    · résumé en base   → les vraies séances, avec leurs noms
   *    · pas de résumé    → des séances attendues, sans nom : l'élève
   *                         n'a pas encore ouvert le thème
   *    · chantier         → des nœuds fantômes : le contenu n'existe
   *                         pas encore. Ce n'est PAS un verrou.
   * ---------------------------------------------------------- */
  function noeudsDe(t) {
    var r = RESUMES[t.cle];
    /* 1. l'élève a ouvert le thème : la base fait foi */
    if (r && r.seances && r.seances.length) {
      return r.seances.map(function (s, i) {
        return { id: t.cle + '::' + s.id, num: s.num || ('S' + (i + 1)),
                 nom: s.nom || '', classe: 'th' + (t.rang % 8), ancre: s.id };
      });
    }
    /* 2. pas encore ouvert : le sommaire généré depuis les pages
       (generer-seances.mjs). C'est le cas de sept thèmes sur huit en
       début d'année — sans lui, la carte serait muette au moment où
       l'élève en a le plus besoin. */
    var gen = (global.SEANCES_SNT || {})[t.cle];
    if (gen && gen.length) {
      return gen.map(function (s, i) {
        return { id: t.cle + '::' + s.id, num: s.num || ('S' + (i + 1)),
                 nom: s.nom || '', classe: 'th' + (t.rang % 8), ancre: s.id };
      });
    }
    /* 3. ni l'un ni l'autre : des nœuds anonymes, en dernier recours */
    var n = Math.max(t.attendu, 2), out = [];
    for (var i = 0; i < n; i++) {
      out.push({ id: t.cle + '::s' + (i + 1), num: t.chantier ? '?' : ('S' + (i + 1)),
                 nom: '', classe: 'th' + (t.rang % 8), ancre: null });
    }
    return out;
  }

  /* Le plafond, séance par séance. Sans verrou-snt.js chargé — ou tant
     qu'il n'a pas de réponse — tout est ouvert : le repli va toujours
     dans le sens de l'ouverture. */
  function seanceOuverte(t, noeud) {
    if (!global.VerrouSNT || !noeud.ancre) return true;
    return global.VerrouSNT.ouverteSeance(t.cle, noeud.ancre);
  }

  /* Un thème n'est « fermé » que si AUCUNE de ses séances n'est
     ouverte. Fermer la carte entière parce que la dernière séance
     dépasse le plafond priverait l'élève de ce qu'il a le droit de
     faire. */
  function themePlafonne(t, noeuds) {
    if (t.chantier) return false;
    return noeuds.length > 0 && noeuds.every(function (n) { return !seanceOuverte(t, n); });
  }

  function etatsDe(t, noeuds) {
    var r = RESUMES[t.cle], etats = {};
    noeuds.forEach(function (n, i) {
      var s = (r && r.seances && r.seances[i]) || null;
      var part = (s && s.t) ? s.f / s.t : 0;
      var ferme = t.verrouManuel || !seanceOuverte(t, n);
      etats[n.id] = {
        part  : part,
        verrou: ferme,
        avenir: t.chantier,
        etat  : t.chantier ? 'à venir'
              : ferme       ? 'pas encore ouverte'
              : !s          ? 'pas commencée'
              : (s.t && s.f === s.t) ? 'terminée'
              : s.f + ' sur ' + s.t,
        href  : (t.chantier || ferme) ? null
              : (t.lien + (n.ancre ? '#' + n.ancre : ''))
      };
    });
    return etats;
  }

  /* Avancement global d'un thème, pour l'anneau de l'encart fermé. */
  function partDe(t) {
    var r = RESUMES[t.cle];
    return (r && r.t) ? Math.max(0, Math.min(1, r.f / r.t)) : 0;
  }

  /* ----------------------------------------------------------
   *  Rendu d'un encart
   *
   *  La mini-carte est REPLIÉE par défaut (décision de Loïc) : huit
   *  cartes-réseau ouvertes en même temps font une page illisible sur
   *  iPad. L'encart fermé porte quand même l'information essentielle —
   *  un anneau et un compteur — pour qu'on n'ait pas à déplier pour
   *  savoir où on en est.
   * ---------------------------------------------------------- */
  /* ⏳ Texte à valider par Loïc : c'est du fond pédagogique, pas un
     acquis (inscrit en attente d'arbitrage dans DECISIONS.md). */
  var MOT_PLAFOND = 'Pas encore ouvert : la classe n’y est pas encore. '
                  + 'Ce thème s’ouvrira au fil des séances.';

  function noterPlafond(t, afficher) {
    var note = $('.tc-plafond', t.el);
    if (!afficher) { if (note) note.parentNode.removeChild(note); return; }
    if (note) return;
    note = document.createElement('p');
    note.className = 'tc-plafond';
    note.textContent = MOT_PLAFOND;
    var jauge = $('.tc-jauge', t.el);
    var hote = jauge && jauge.parentNode ? jauge.parentNode : t.el;
    hote.appendChild(note);
  }

  function rendre(t) {
    var part = partDe(t), r = RESUMES[t.cle];
    var jauge = $('.tc-jauge', t.el);
    if (jauge) {
      var C = 2 * Math.PI * 15;
      jauge.innerHTML =
        '<svg viewBox="0 0 36 36" class="tc-anneau" aria-hidden="true">'
        + '<circle class="tc-piste" cx="18" cy="18" r="15"/>'
        + '<circle class="tc-arc" cx="18" cy="18" r="15" transform="rotate(-90 18 18)" '
        +   'stroke-dasharray="' + (C * part).toFixed(1) + ' ' + (C * (1 - part) + 1).toFixed(1) + '"/>'
        + '</svg>'
        + '<span class="tc-compte">' + (
            t.chantier ? 'en construction'
          : !r         ? (function(){ var g=(global.SEANCES_SNT||{})[t.cle];
                            return g && g.length ? g.length + ' séances' : 'pas commencé'; })()
          : (r.t && r.f === r.t) ? 'terminé'
          : r.f + ' / ' + r.t + ' étapes'
          ) + '</span>';
    }
    var noeudsPourEtat = noeudsDe(t);
    var ferme = t.verrouManuel || themePlafonne(t, noeudsPourEtat);
    t.el.classList.toggle('est-chantier', !!t.chantier);
    t.el.classList.toggle('est-verrou',  !!ferme);
    noterPlafond(t, ferme && !t.verrouManuel);
    t.el.classList.toggle('est-fini',    !!(r && r.t && r.f === r.t));
    t.el.classList.toggle('est-commence', part > 0);

    var hote = $('.tc-carte', t.el);
    if (hote && global.CarteReseau) {
      var noeuds = noeudsDe(t);
      hote.innerHTML = global.CarteReseau.dessiner(noeuds, { decor: false });
      global.CarteReseau.majNoeuds(hote, etatsDe(t, noeuds));
    }
  }

  /* ----------------------------------------------------------
   *  Reprise à l'échelle du hub
   *
   *  Même principe que dans une séquence, un cran au-dessus : « tu en
   *  étais au thème X ». Bloquante et floutée (décision de Loïc), avec
   *  deux issues explicites — reprendre, ou rester ici pour choisir
   *  autre chose. Bloquant ne veut pas dire piégé.
   *
   *  Elle ne s'affiche que si un thème est réellement en cours :
   *  commencé, pas terminé, pas en chantier.
   * ---------------------------------------------------------- */
  function reprise(themes) {
    var cible = null, quand = 0;
    themes.forEach(function (t) {
      var r = RESUMES[t.cle];
      if (!r || t.chantier || t.verrouManuel) return;
      if (!r.t || !r.f || r.f >= r.t) return;
      var d = Date.parse(r.vu_le || 0);
      if (isFinite(d) && d > quand) { quand = d; cible = t; }
    });
    if (!cible) return;
    if (Date.now() - quand < 2 * 3600000) return;   /* même seuil : 2 h */

    var r = RESUMES[cible.cle];
    var enCours = null;
    (r.seances || []).some(function (s) { if (s.t && s.f < s.t) { enCours = s; return true; } return false; });
    var titre = $('.tc-titre', cible.el);

    var m = document.createElement('div');
    m.className = 'hub-modale hm-reprise';
    m.innerHTML = '<div class="hm-carte" role="dialog" aria-modal="true" aria-labelledby="hmr-t">'
      + '<div class="hr-haut" id="hmr-t">Bon retour</div>'
      + '<div class="hr-ou">Tu en étais au thème</div>'
      + '<div class="hr-nom">' + esc(titre ? titre.textContent : cible.cle) + '</div>'
      + (enCours ? '<div class="hr-ligne"><span class="hr-s">' + esc(enCours.num) + '</span>'
                 + '<span class="hr-ix">' + esc(enCours.nom) + '</span></div>' : '')
      + '<div class="hr-bas">' + r.f + ' étape' + (r.f > 1 ? 's' : '') + ' sur ' + r.t + ' déjà faites</div>'
      + '<div class="hr-actions">'
      +   '<a class="hr-go" href="' + esc(cible.lien + (enCours ? '#' + enCours.id : '')) + '">Continuer &rarr;</a>'
      +   '<button class="hr-sortie" type="button">Rester sur le sommaire</button>'
      + '</div></div>';
    document.body.appendChild(m);
    document.body.classList.add('modale-ouverte');
    $('.hr-sortie', m).addEventListener('click', function () {
      m.remove();
      document.body.classList.remove('modale-ouverte');
      cible.el.classList.remove('plie');
      cible.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    $('.hr-go', m).focus();
  }

  /* ---------------------------------------------------------- */
  function plier(t, replie) {
    t.el.classList.toggle('plie', replie);
    var b = $('.tc-plier', t.el);
    if (b) b.setAttribute('aria-expanded', String(!replie));
  }

  function demarrer() {
    var themes = lireThemes();
    if (!themes.length) return;
    CLES = themes.map(function (t) { return t.cle; });

    themes.forEach(function (t) {
      plier(t, true);
      var b = $('.tc-plier', t.el);
      if (b) b.addEventListener('click', function () {
        plier(t, !t.el.classList.contains('plie'));
      });
      rendre(t);                       /* rendu immédiat, sans attendre le réseau */
    });

    /* Le plafond arrive de la base après ce premier rendu : sans cette
       écoute, les cartes resteraient ouvertes jusqu'au rechargement
       suivant. Même signal que dans les pages de séquence. */
    document.addEventListener('plafond-connu', function () { themes.forEach(rendre); });

    if (!global.Progression || !global.Progression.disponible()) return;

    /* UNE requête pour les huit thèmes. */
    global.Progression.lireTout('cours').then(function (tout) {
      RESUMES = {};
      Object.keys(tout || {}).forEach(function (k) {
        var v = tout[k];
        if (v && v.resume) { RESUMES[k] = v.resume; RESUMES[k].vu_le = v.vu_le || null; }
      });
      themes.forEach(rendre);
      /* le thème en cours s'ouvre tout seul : c'est celui qu'on vient
         consulter neuf fois sur dix */
      var enCours = null;
      themes.forEach(function (t) {
        var r = RESUMES[t.cle];
        if (r && r.t && r.f > 0 && r.f < r.t && !enCours) enCours = t;
      });
      if (enCours) plier(enCours, false);
      reprise(themes);
    }).catch(function () { /* hors ligne : la page reste utilisable */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();

})(window);
