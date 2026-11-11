/* ============================================================
 *  emc-accueil.js — le jeu de rôle « Je m'appelle… », côté élève
 *  (module 'accueil' de emc/index.html, 034 et 035).
 *
 *  9 étapes : 0 accueil (classe d'origine, prêt) · 1 consignes ·
 *  2 trouve ton binôme (symbole) · 3 choix des questions · 4 échange
 *  (chrono, notes) · 5 feu vert / feu rouge · 6 présentations ·
 *  7 portrait mystère · 8 la liberté, pour moi (fiche papier) ·
 *  9 clôture.
 *
 *  🔴 Les NOTES de l'échange (famille, phobies, une personne
 *  admirée…) :
 *  · étape 4 : sur la tablette seulement (localStorage, jamais la
 *    file d'envoi) ;
 *  · étapes 5 à 7 : envoyées à emc_jdr_notes, que SEUL le binôme lit
 *    (pas les enseignants : la base le refuse), pour qu'il donne ses
 *    feux en connaissance de cause (décision de Loïc, 08/11) ;
 *  · étape 8, fin, déconnexion : effacées de la tablette ET de la
 *    base (la clôture efface aussi ce qui reste).
 *
 *  « Je me suis reconnu·e » est facultatif et n'est jamais affiché
 *  par personne : seul un bilan anonyme est projeté à la fin.
 *
 *  Contenus réglables : emc_contenus 'jdr' et 'etapes_accueil'.
 *  L'état piloté (chrono de l'échange, ordre de passage, binôme en
 *  cours, portrait projeté) vit dans emc_seances.etat.
 * ============================================================ */
(function (global) {
  'use strict';
  var EMC = global.EMC, el = EMC.el;
  EMC.Modules = EMC.Modules || {};

  var J = { moi: null, binome: [], lignes: [], notesBinome: {}, ecoute: null };
  var TEINTES = ['#fde8d7', '#dff1fb', '#e3f6ea', '#fff3c4', '#efe4fb', '#fde2e7'];

  function jdr(cx) { return cx.contenu('jdr') || { themes: [], consignes: [], symboles: [] }; }
  function toutes(cx) {
    var l = [];
    (jdr(cx).themes || []).forEach(function (t) { (t.questions || []).forEach(function (q) { l.push({ id: q.id, texte: q.texte, theme: t }); }); });
    return l;
  }
  function question(cx, id) { return toutes(cx).filter(function (q) { return q.id === id; })[0]; }
  function texteQ(cx, id) { if (id === 0) return jdr(cx).obligatoire || 'Prénom, nom'; var q = question(cx, id); return q ? q.texte : 'Question ' + id; }
  function iconeQ(cx, id) { var q = question(cx, id); return id === 0 ? '🪪' : (q && q.theme.icone) || '❓'; }

  /* ---------- les notes ---------- */
  function cleNotes(cx) { return 'emc.jdr.notes.' + cx.S.classe; }
  function notes(cx) { try { return JSON.parse(localStorage.getItem(cleNotes(cx)) || '{}') || {}; } catch (e) { return {}; } }
  function poserNote(cx, id, t) { var n = notes(cx); n[id] = t; try { localStorage.setItem(cleNotes(cx), JSON.stringify(n)); } catch (e) {} }
  /* À partir de l'étape 5 : pour le binôme, et pour lui seul. Envoi
     direct (jamais la file : rien ne doit dormir sur la tablette). */
  function partagerNotes(cx) {
    var n = notes(cx), propres = {};
    Object.keys(n).forEach(function (k) { if (String(n[k] || '').trim()) propres[k] = String(n[k]).slice(0, 600); });
    if (!Object.keys(propres).length) return Promise.resolve();
    return EMC.ecrire('emc_jdr_notes?on_conflict=classe_id,eleve_id', { classe_id: cx.S.classe, eleve_id: cx.S.eleveId, notes: propres }, { fusion: true })
      .catch(function () {});
  }
  function lireNotesBinome(cx) {
    return EMC.lire('emc_jdr_notes?select=eleve_id,notes&classe_id=eq.' + cx.S.classe).then(function (l) {
      J.notesBinome = {};
      (l || []).forEach(function (x) { if (x.eleve_id !== cx.S.eleveId) J.notesBinome[x.eleve_id] = x.notes || {}; });
      return J.notesBinome;
    }, function () { return J.notesBinome; });
  }
  function effacerNotes(cx) {
    try { localStorage.removeItem(cleNotes(cx)); } catch (e) {}
    if (cx.S.classe && cx.S.eleveId) EMC.supprimer('emc_jdr_notes?classe_id=eq.' + cx.S.classe + '&eleve_id=eq.' + cx.S.eleveId).catch(function () {});
  }

  /* ---------- ma ligne emc_jdr, envoyée entière par la file ---------- */
  function maLigne(cx) {
    return J.moi || (J.moi = { classe_id: cx.S.classe, eleve_id: cx.S.eleveId, origine: null, questions: [], feux: {}, reconnu: null });
  }
  function envoyer(cx, champs) {
    var m = maLigne(cx);
    Object.keys(champs).forEach(function (k) { m[k] = champs[k]; });
    try { localStorage.setItem('emc.jdr.moi.' + cx.S.classe, JSON.stringify(m)); } catch (e) {}
    return cx.S.file.pousser({ methode: 'POST', chemin: 'emc_jdr?on_conflict=classe_id,eleve_id', cle: 'jdr', opts: { fusion: true },
      corps: { classe_id: m.classe_id, eleve_id: m.eleve_id, origine: m.origine, questions: m.questions, feux: m.feux, reconnu: m.reconnu } });
  }
  function relireLignes(cx) {
    return EMC.lire('emc_jdr?select=eleve_id,origine,questions,feux,reconnu&classe_id=eq.' + cx.S.classe).then(function (l) {
      J.lignes = l || [];
      var moi = J.lignes.filter(function (x) { return x.eleve_id === cx.S.eleveId; })[0];
      if (moi && !cx.S.file.enAttente()) J.moi = Object.assign({ classe_id: cx.S.classe }, moi);
      return J.lignes;
    });
  }
  function partenaires() { return J.lignes.filter(function (x) { return J.moi && x.eleve_id !== J.moi.eleve_id; }); }
  function monSymbole() { return J.binome[0] ? J.binome[0].symbole : null; }
  function monNumero() { return J.binome[0] ? J.binome[0].binome : null; }

  /* ---------- morceaux d'interface ---------- */
  function encadre(texte, genre) { return el('div', { class: 'encadre' + (genre ? ' ' + genre : '') }, texte); }
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  var audio = null;
  function bip(f) {
    try {
      audio = audio || new (global.AudioContext || global.webkitAudioContext)();
      var o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = f || 660; o.connect(g); g.connect(audio.destination);
      g.gain.setValueAtTime(0.0001, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, audio.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.35);
      o.start(); o.stop(audio.currentTime + 0.4);
    } catch (e) {}
  }

  /* Les consignes : une carte de couleur par consigne, émoji en tête,
     **gras** des contenus. Reprises par la projection. */
  function consignes(cx) {
    return el('div', { class: 'consignes-cartes' }, (jdr(cx).consignes || []).map(function (t, i) {
      var m = /^(\S+)\s+(.*)$/.exec(t), emoji = m && /\p{Extended_Pictographic}/u.test(m[1]) ? m[1] : null;
      return el('div', { class: 'consigne', style: 'background:' + TEINTES[i % TEINTES.length] },
        el('span', { class: 'consigne-n' }, emoji || String(i + 1)), el('p', null, EMC.riche(emoji ? m[2] : t)));
    }));
  }

  /* L'exemple en trois temps : les questions choisies, les réponses
     notées, le portrait à la première personne. */
  function blocExemple(cx, ouvert) {
    var x = jdr(cx).exemple;
    if (!x) return null;
    var rep = {};
    (x.reponses || []).forEach(function (r) { rep[r.q] = r.r; });
    return el('details', { class: 'exemple', open: ouvert || null },
      el('summary', null, '🎭 ' + (x.titre || 'Exemple')),
      el('div', { class: 'exemple-temps' },
        el('div', { class: 'exemple-etape' }, el('h3', null, '① Les questions choisies'),
          el('ol', null, (x.questions || []).map(function (id) { return el('li', null, iconeQ(cx, id) + ' ' + texteQ(cx, id)); }))),
        (x.reponses || []).length ? el('div', { class: 'exemple-etape' }, el('h3', null, '② Les réponses notées (des mots-clés)'),
          el('ul', { class: 'exemple-notes' }, (x.questions || []).filter(function (id) { return rep[id]; }).map(function (id) {
            return el('li', null, el('span', { class: 'tresmuet' }, texteQ(cx, id)), el('br'), '✏️ ' + rep[id]);
          }))) : null,
        el('div', { class: 'exemple-etape' }, el('h3', null, '③ Le portrait, à la première personne'),
          el('p', { class: 'exemple-texte' }, x.texte))));
  }

  /* ============================================================
   *  Les étapes
   * ============================================================ */

  /* 0 — Accueil : ma classe d'origine, puis prêt */
  function e0(s, cx) {
    var j = jdr(cx), b = cx.bloc();
    b.appendChild(el('h2', null, '👋 ' + (j.titre || 'Je m\'appelle…')));
    b.appendChild(el('p', { class: 'mission-texte' }, EMC.riche(j.accroche || '')));
    s.appendChild(b);
    var c = cx.bloc();
    c.appendChild(el('h2', null, 'Ta classe de seconde'));
    c.appendChild(el('p', { class: 'muet' }, 'Pour former des binômes de deux classes différentes.'));
    var grille = el('div', { class: 'origines', role: 'group', 'aria-label': 'Ta classe de seconde' });
    for (var i = 1; i <= (j.origines || 10); i++) (function (i) {
      grille.appendChild(el('button', { type: 'button', 'aria-pressed': maLigne(cx).origine === i ? 'true' : 'false',
        onclick: function () { envoyer(cx, { origine: i }); cx.rafraichir(); } }, '2nde ' + i));
    })(i);
    c.appendChild(grille);
    if (maLigne(cx).origine) {
      c.appendChild(cx.boutonPret(true));
      c.appendChild(el('p', { class: 'etat-envoi ' + (cx.S.pret ? 'ok' : 'att') }, cx.S.pret ? '✅ Tu es prêt·e. Attends la suite.' : 'Touche « Je suis prêt·e » quand c\'est bon.'));
    } else c.appendChild(el('p', { class: 'etat-envoi att' }, 'Choisis ta classe pour continuer.'));
    s.appendChild(c);
  }

  /* 1 — Les consignes, et l'exemple */
  function e1(s, cx) {
    s.appendChild(consignes(cx));
    var ex = blocExemple(cx, true);
    if (ex) s.appendChild(el('div', { class: 'carte-blanche' }, ex));
  }

  /* 2 — Trouve ton binôme */
  function e2(s, cx) {
    var b = cx.bloc();
    if (!monSymbole()) {
      b.appendChild(el('p', { class: 'muet', style: 'text-align:center;font-size:1.2rem' }, '🎲 Le tirage arrive…'));
      s.appendChild(b); return;
    }
    var trio = J.binome.length === 3;
    b.appendChild(el('div', { class: 'symbole-geant', 'aria-label': 'Ton symbole' }, monSymbole()));
    b.appendChild(el('p', { class: 'consigne-geante' }, trio ? 'Trouve les DEUX autres ' + monSymbole() + ' : vous êtes trois !' : 'Trouve l\'autre ' + monSymbole() + ' !'));
    b.appendChild(el('p', { class: 'muet', style: 'text-align:center' }, 'Lève ta tablette pour montrer ton symbole. Puis asseyez-vous ensemble.'));
    s.appendChild(b);
  }

  /* 3 — Choisis tes questions. On peut tout cocher ; c'est « Valider »
     qui reste gris tant que le choix ne va pas, et dit pourquoi. */
  function e3(s, cx) {
    var j = jdr(cx), min = j.min || 6, max = j.max || 8;
    var choisies = (maLigne(cx).questions || []).slice();
    var etat = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var compteur = el('div', { class: 'compteur-themes' });
    /* Deux boutons « Valider » qui font la même chose : l'un dans la
       barre collée EN HAUT (sous la barre de l'élève), l'autre en bas,
       après la dernière question. En bas d'écran, Safari sur iPad
       recalait mal la barre pendant un défilement rapide et cachait
       la question 30 (essai du 11/11). */
    var valider = el('button', { type: 'button', class: 'primaire' }, '✔ Valider');
    var validerBas = el('button', { type: 'button', class: 'primaire', style: 'width:100%;margin-top:.8rem' }, 'Valider mes questions');
    s.appendChild(encadre(el('span', null, 'Choisis ', el('b', null, min + ' à ' + max + ' questions'), ', avec ', el('b', null, 'au moins une par thème'),
      '. Obligatoire en plus : « ' + (j.obligatoire || 'Prénom, nom') + ' »')));
    var sticky = el('div', { class: 'barre-choix' }, el('div', { class: 'barre-choix-ligne' }, compteur, valider));
    var etatBas = el('p', { class: 'etat-envoi', 'aria-hidden': 'true' });
    function caler() {
      var b = document.getElementById('barre');
      sticky.style.top = (b ? b.getBoundingClientRect().height : 0) + 'px';
    }
    global.addEventListener('resize', caler);
    cx.enQuittant(function () { global.removeEventListener('resize', caler); });
    var valide = false;
    function probleme() {
      var manque = (j.themes || []).filter(function (t) { return !t.questions.some(function (q) { return choisies.indexOf(q.id) >= 0; }); });
      if (choisies.length > max) { var d = choisies.length - max; return 'Tu en as ' + choisies.length + ' : décoche-en ' + d + ' pour pouvoir valider.'; }
      if (choisies.length < min) { var e = min - choisies.length; return 'Encore ' + e + ' question' + (e > 1 ? 's' : '') + ' au moins.'; }
      if (manque.length) return 'Il manque une question pour : ' + manque.map(function (t) { return (t.icone || '') + ' ' + t.titre; }).join(', ') + '.';
      return null;
    }
    function maj() {
      compteur.innerHTML = '';
      compteur.appendChild(el('span', { class: 'pastille ' + (choisies.length >= min && choisies.length <= max ? 'ok' : choisies.length > max ? 'err' : 'att') }, choisies.length + ' / ' + min + '–' + max));
      (j.themes || []).forEach(function (t) {
        var k = t.questions.filter(function (q) { return choisies.indexOf(q.id) >= 0; }).length;
        compteur.appendChild(el('span', { class: 'pastille ' + (k ? 'ok' : 'att'), title: t.titre }, (t.icone || '') + ' ' + k));
      });
      var p = probleme();
      valider.disabled = !!p; validerBas.disabled = !!p;
      if (p) { etat.className = 'etat-envoi ' + (choisies.length > max ? 'err' : 'att'); etat.textContent = p; }
      else if (!valide) { etat.className = 'etat-envoi'; etat.textContent = '👍 C\'est bon : valide !'; }
      copierEtat();
    }
    function copierEtat() { etatBas.className = etat.className; etatBas.textContent = etat.textContent; }
    (j.themes || []).forEach(function (t) {
      var f = el('fieldset', { class: 'q theme' }, el('legend', null, (t.icone ? t.icone + ' ' : '') + 'Thème ' + t.n + ' : ' + t.titre));
      t.questions.forEach(function (q) {
        var inp = el('input', { type: 'checkbox', value: q.id, checked: choisies.indexOf(q.id) >= 0 || null });
        inp.addEventListener('change', function () {
          var i = choisies.indexOf(q.id);
          if (inp.checked && i < 0) choisies.push(q.id);
          if (!inp.checked && i >= 0) choisies.splice(i, 1);
          valide = false; maj();
        });
        f.appendChild(el('label', null, inp, el('span', null, el('b', { class: 'num-q' }, q.id + '. '), q.texte)));
      });
      s.appendChild(f);
    });
    sticky.appendChild(etat);
    /* la barre se place juste après la consigne, avant les thèmes */
    s.insertBefore(sticky, s.querySelector('fieldset.theme'));
    s.appendChild(validerBas);
    s.appendChild(etatBas);
    caler(); setTimeout(caler, 300);
    if ((maLigne(cx).questions || []).length) valide = true;
    maj();
    if (valide && !probleme()) { etat.className = 'etat-envoi ok'; etat.textContent = '✓ Questions validées. Tu peux encore changer.'; copierEtat(); }
    function envoyerChoix() {
      if (probleme()) return;
      var ordre = toutes(cx).map(function (q) { return q.id; });
      choisies.sort(function (a, b) { return ordre.indexOf(a) - ordre.indexOf(b); });
      envoyer(cx, { questions: choisies.slice() });
      valide = true;
      cx.majEtatEnvoi(etat, '✓ Questions validées. Tu peux encore changer tant que l\'étape est ouverte.');
      copierEtat(); setTimeout(copierEtat, 1500); setTimeout(copierEtat, 5000);
    }
    valider.addEventListener('click', envoyerChoix);
    validerBas.addEventListener('click', envoyerChoix);
  }

  /* 4 — L'échange : chrono, et les notes (sur la tablette) */
  /* L'échange en deux tours (Loïc, 11/11) : on lance les 20 minutes,
     mais on voit le tour en cours (10 min chacun). À la bascule, un
     grand bandeau « On change ! » pendant 20 s, avec un son — même
     signal qu'au tableau. Un trinôme se répartit les deux tours. */
  function bandeauBascule(texte, sous) {
    var vieux = document.getElementById('emc-bascule'); if (vieux) vieux.remove();
    var b = el('div', { id: 'emc-bascule', class: 'bascule', role: 'alert' },
      el('div', { class: 'bascule-ic', 'aria-hidden': 'true' }, '🔄'), el('b', null, texte), sous ? el('span', null, sous) : null,
      el('span', { class: 'tresmuet' }, 'Touche pour fermer'));
    b.addEventListener('click', function () { b.remove(); });
    document.body.appendChild(b);
    setTimeout(function () { b.remove(); }, 20000);
    return b;
  }
  function chronoEchange(cx, zone) {
    var j = jdr(cx), total = (j.echange_minutes || 20) * 60, depuis = (cx.S.seance.etat || {}).echange_depuis;
    var tour = total / 2, alerte = false, fin = false;
    function tic() {
      if (!document.body.contains(zone)) return clearInterval(iv);
      if (!depuis) { zone.innerHTML = ''; zone.appendChild(el('div', { class: 'chrono-eleve att' }, '⏳ Le chrono démarre au signal')); return; }
      var ecoule = (Date.now() - depuis) / 1000, reste = total - ecoule, mi = ecoule >= tour;
      if (mi && !alerte) {
        alerte = true;
        /* la bascule vient de passer (ou passe pendant qu'on regarde) */
        if (ecoule < tour + 20) {
          bip(880); setTimeout(function () { bip(880); }, 300); setTimeout(function () { bip(990); }, 600);
          bandeauBascule('On change !', 'Celui ou celle qui répondait pose maintenant ses questions.');
        }
      }
      if (reste <= 0 && !fin) { fin = true; if (reste > -3) bip(520); }
      var resteTour = mi ? reste : tour - ecoule;
      zone.innerHTML = '';
      zone.appendChild(el('div', { class: 'chrono-eleve' + (reste <= 0 ? ' fini' : mi ? ' moitie' : '') },
        reste > 0 ? el('span', { class: 'tour' }, 'Tour ' + (mi ? 2 : 1) + ' sur 2') : null,
        el('div', null, reste > 0 ? '⏱ ' + mmss(resteTour) : '⏰ Temps écoulé'),
        el('span', null, reste <= 0 ? '' : mi ? '🔄 Vous avez changé de rôle' : 'L\'un interroge, l\'autre répond. On change dans ' + mmss(resteTour) + '.')));
    }
    var iv = setInterval(tic, 500); tic();
    cx.enQuittant(function () { clearInterval(iv); var b = document.getElementById('emc-bascule'); if (b) b.remove(); });
  }
  function e4(s, cx) {
    var z = el('div'); s.appendChild(z); chronoEchange(cx, z);
    s.appendChild(encadre(el('span', null, el('b', null, '🔒 Tes notes restent sur ta tablette pendant l\'échange.'),
      ' À l\'étape suivante, ton binôme les relira pour te dire ce que tu peux raconter : lui seul, ni la classe ni les professeurs. Elles sont effacées à la fin. Note des mots-clés, pas des phrases.'), 'cyan'));
    var mes = [0].concat(maLigne(cx).questions || []);
    if (mes.length === 1) s.appendChild(encadre('Tu n\'as pas validé de questions à l\'étape précédente : pose celles que tu veux, et note ici.', 'orange'));
    var n = notes(cx), b = cx.bloc();
    b.appendChild(el('h2', null, '📝 Tes questions, et ce que ton binôme répond'));
    mes.forEach(function (id) {
      var t = el('textarea', { class: 'note-q', rows: '2', maxlength: '600', 'aria-label': texteQ(cx, id), placeholder: 'Sa réponse, en quelques mots…' });
      t.value = n[id] || '';
      t.addEventListener('input', function () { poserNote(cx, id, t.value); });
      b.appendChild(el('label', { class: 'q-note' }, el('span', { class: 'q-texte' }, el('span', { 'aria-hidden': 'true' }, iconeQ(cx, id) + ' '), texteQ(cx, id)), t));
    });
    if (mes.length === 1) {
      var libre = el('textarea', { class: 'note-q', rows: '6', maxlength: '2000', 'aria-label': 'Notes libres' });
      libre.value = n.libre || '';
      libre.addEventListener('input', function () { poserNote(cx, 'libre', libre.value); });
      b.appendChild(el('label', { class: 'q-note' }, el('span', null, 'Notes libres'), libre));
    }
    s.appendChild(b);
  }

  /* 5 — Feu vert, feu rouge : je décide ce qu'on peut dire de moi,
     en lisant ce que mon binôme a noté. */
  function e5(s, cx) {
    var j = jdr(cx);
    partagerNotes(cx);
    s.appendChild(encadre(el('span', null, '🤝 ', EMC.riche(j.feux || '')), 'orange'));
    var b = cx.bloc(); s.appendChild(b);
    var etat = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    b.appendChild(el('p', { class: 'muet' }, j.feux_consigne || ''));
    var zone = el('div'); b.appendChild(zone); b.appendChild(etat);
    zone.appendChild(el('p', { class: 'tresmuet' }, 'Chargement des questions de ton binôme…'));
    var feux = Object.assign({}, maLigne(cx).feux || {}), ids = [];
    function garder() {
      envoyer(cx, { feux: Object.assign({}, feux) });
      var faits = ids.filter(function (id) { return typeof feux[id] === 'boolean'; }).length;
      cx.majEtatEnvoi(etat, faits === ids.length ? '✓ C\'est noté pour toutes les questions.' : '✓ Noté (' + faits + ' / ' + ids.length + ').');
    }
    function noteSur(id) {
      var l = [];
      Object.keys(J.notesBinome).forEach(function (k) { var t = (J.notesBinome[k] || {})[id]; if (t) l.push(t); });
      return l;
    }
    function rendre() {
      ids = [];
      partenaires().forEach(function (p) { (p.questions || []).forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); }); });
      zone.innerHTML = '';
      if (!ids.length) { zone.appendChild(el('p', { class: 'muet' }, 'Ton binôme n\'a pas validé de questions sur le site : dis-lui de vive voix ce qu\'il ou elle peut raconter.')); return; }
      ids.forEach(function (id) {
        var ligne = el('div', { class: 'feu-ligne' });
        (function dessiner() {
          ligne.innerHTML = '';
          var v = feux[id], ns = noteSur(id);
          ligne.appendChild(el('div', { class: 'feu-q' }, el('div', null, iconeQ(cx, id) + ' ' + texteQ(cx, id)),
            el('div', { class: 'note-binome' + (ns.length ? '' : ' vide') }, ns.length ? '✏️ ' + ns.join(' · ') : 'Pas de note de ton binôme sur cette question.')));
          ligne.appendChild(el('div', { class: 'feu-boutons', role: 'group' },
            el('button', { type: 'button', class: 'feu vert', 'aria-pressed': v === true ? 'true' : 'false', onclick: function () { feux[id] = true; dessiner(); garder(); } }, '🟢 Oui'),
            el('button', { type: 'button', class: 'feu rouge', 'aria-pressed': v === false ? 'true' : 'false', onclick: function () { feux[id] = false; dessiner(); garder(); } }, '🔴 Non')));
        })();
        zone.appendChild(ligne);
      });
    }
    Promise.all([relireLignes(cx), lireNotesBinome(cx)]).then(rendre, function () {
      zone.innerHTML = ''; zone.appendChild(el('p', { class: 'encadre err' }, 'Pas de réseau : réessaie dans un instant.'));
    });
    /* les notes du binôme arrivent quand SA tablette passe à l'étape 5 */
    var iv = setInterval(function () {
      if (document.hidden) return;
      var avant = JSON.stringify(J.notesBinome);
      Promise.all([relireLignes(cx), lireNotesBinome(cx)]).then(function () { if (avant !== JSON.stringify(J.notesBinome)) rendre(); }, function () {});
    }, 5000);
    cx.enQuittant(function () { clearInterval(iv); });
  }

  /* 6 — Les présentations */
  function feuxDesPartenaires(id) {
    var vals = partenaires().map(function (p) { return (p.feux || {})[id]; }).filter(function (v) { return typeof v === 'boolean'; });
    if (!vals.length) return null;
    return vals.every(function (v) { return v; });
  }
  function e6(s, cx) {
    partagerNotes(cx);
    var et = cx.S.seance.etat || {}, ordre = et.ordre || [], i = et.courant, cour = ordre[i];
    var j = jdr(cx);
    var tete = cx.bloc(); s.appendChild(tete);
    if (cour == null) tete.appendChild(el('p', { class: 'muet' }, 'L\'ordre de passage va être tiré au sort…'));
    else if (cour === monNumero()) {
      tete.appendChild(el('div', { class: 'symbole-geant petit' }, monSymbole()));
      tete.appendChild(el('p', { class: 'consigne-geante' }, '🎤 C\'est à vous !'));
      var ch = el('div', { class: 'chrono-eleve' }); tete.appendChild(ch);
      var total = j.presentation_secondes || 60;
      var iv = setInterval(function () {
        if (!document.body.contains(ch)) return clearInterval(iv);
        if (!et.depuis) { ch.textContent = '⏱ ' + mmss(total); return; }
        var r = total - (Date.now() - et.depuis) / 1000;
        ch.className = 'chrono-eleve' + (r <= 0 ? ' fini' : r <= 15 ? ' moitie' : '');
        ch.textContent = r > 0 ? '⏱ ' + mmss(r) : '⏰ La minute est passée';
      }, 500);
      cx.enQuittant(function () { clearInterval(iv); });
    } else {
      tete.appendChild(el('p', { class: 'muet', style: 'text-align:center' }, 'En ce moment : binôme ' + (i + 1) + ' sur ' + ordre.length));
      var pos = ordre.indexOf(monNumero());
      if (pos > i) tete.appendChild(el('p', { style: 'text-align:center' }, 'Votre tour : dans ' + (pos - i) + ' passage' + (pos - i > 1 ? 's' : '') + '.'));
    }
    /* je me suis reconnu·e ? — facultatif, jamais affiché */
    if (cour != null && cour === monNumero()) {
      var r = cx.bloc(); s.appendChild(r);
      r.appendChild(el('h2', null, j.reconnu_question || 'Je me suis reconnu·e ?'));
      r.appendChild(el('p', { class: 'muet' }, 'Facultatif. Ta réponse n\'est montrée à personne : elle compte seulement dans le bilan de la fin, sans nom.'));
      var g = el('div', { class: 'reconnu', role: 'group' });
      (j.reconnu || []).forEach(function (x) {
        g.appendChild(el('button', { type: 'button', 'aria-pressed': maLigne(cx).reconnu === x.v ? 'true' : 'false',
          onclick: function () { envoyer(cx, { reconnu: x.v }); cx.rafraichir(); } }, el('span', { class: 'e' }, x.e), x.l));
      });
      r.appendChild(g);
    }
    var b = cx.bloc(); s.appendChild(b);
    b.appendChild(el('h2', null, '🗣 Ma présentation'));
    b.appendChild(el('p', { class: 'muet' }, 'À la première personne : « Je m\'appelle… ». Un petit récit, environ 1 minute. Les 🔴 restent entre vous.'));
    var liste = el('div'); b.appendChild(liste);
    function rendre() {
      var n = notes(cx); liste.innerHTML = '';
      [0].concat(maLigne(cx).questions || []).forEach(function (id) {
        var f = id === 0 ? true : feuxDesPartenaires(id);
        liste.appendChild(el('div', { class: 'note-feu ' + (f === false ? 'rouge' : f === true ? 'vert' : '') },
          el('span', { class: 'pastille-feu' }, f === false ? '🔴' : f === true ? '🟢' : '⚪'),
          el('div', null, el('div', { class: 'tresmuet' }, texteQ(cx, id)), el('div', null, f === false ? '— on n\'en parle pas —' : (n[id] || '…')))));
      });
      if (n.libre) liste.appendChild(el('div', { class: 'note-feu' }, el('span', { class: 'pastille-feu' }, '📝'), el('div', null, n.libre)));
    }
    rendre();
    relireLignes(cx).then(rendre, function () {});
    var ex = blocExemple(cx, false); if (ex) b.appendChild(ex);
  }

  /* 7 — Portrait mystère : un détail surprenant, en feu vert */
  /* Le bandeau « C'est toi ! » se met à jour SEUL quand le prof
     projette ou révèle un portrait : avant le 11/11, toute l'étape se
     redessinait sur chaque tablette (texte en cours de saisie perdu,
     deux lectures en base par tablette et par clic du prof — la
     lenteur constatée à l'essai). */
  function majCestToi(cx) {
    var z = document.getElementById('c-est-toi-zone');
    if (!z) return;
    var et = (cx.S.seance && cx.S.seance.etat) || {};
    var auteur = et.portrait, surMoi = auteur && auteur !== cx.S.eleveId && J.binome.some(function (b) { return b.eleve_id === auteur; });
    z.innerHTML = '';
    if (et.revele && surMoi) {
      z.appendChild(el('div', { class: 'carte-blanche c-est-toi' }, el('div', { class: 'symbole-geant petit' }, '🎉'),
        el('p', { class: 'consigne-geante' }, 'C\'est toi ! Lève la main 🙋')));
    }
  }
  function e7(s, cx) {
    var j = jdr(cx);
    s.appendChild(el('div', { id: 'c-est-toi-zone' }));
    majCestToi(cx);
    s.appendChild(encadre(j.portrait_consigne || ''));
    var b = cx.bloc(); s.appendChild(b);
    var etat = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var sel = el('select', { id: 'pm-q', 'aria-label': 'La question' });
    var t = el('textarea', { id: 'pm-t', rows: '3', maxlength: '300', placeholder: j.portrait_exemple ? 'Exemple : ' + j.portrait_exemple : '' });
    var env = el('button', { type: 'button', class: 'primaire' }, 'Envoyer mon portrait mystère');
    b.appendChild(el('label', { for: 'pm-q' }, 'La question (seulement celles en feu vert)'));
    b.appendChild(sel);
    b.appendChild(el('label', { for: 'pm-t' }, 'Le détail, à la première personne, sans prénom'));
    b.appendChild(t); b.appendChild(env); b.appendChild(etat);
    relireLignes(cx).then(function () {
      var vertes = (maLigne(cx).questions || []).filter(function (id) { return feuxDesPartenaires(id) === true; });
      sel.innerHTML = '';
      if (!vertes.length) sel.appendChild(el('option', { value: '' }, 'Aucune question en feu vert : choisis un détail que ton binôme accepte'));
      vertes.forEach(function (id) { sel.appendChild(el('option', { value: id }, texteQ(cx, id))); });
    }, function () {});
    /* le brouillon survit à un rafraîchissement de l'étape */
    if (J.brouillonPortrait) t.value = J.brouillonPortrait;
    t.addEventListener('input', function () { J.brouillonPortrait = t.value; });
    EMC.lire('emc_mur?select=question,texte,statut&sorte=eq.portrait&classe_id=eq.' + cx.S.classe).then(function (l) {
      if (!l || !l[0]) return;
      if (l[0].statut === 'propose' && J.brouillonPortrait && J.brouillonPortrait !== l[0].texte) { etat.className = 'etat-envoi att'; etat.textContent = 'Modifié : touche « Envoyer » pour garder ta correction.'; return; }
      t.value = l[0].texte;
      if (l[0].statut !== 'propose') { t.disabled = true; env.disabled = true; etat.className = 'etat-envoi ok'; etat.textContent = l[0].statut === 'valide' ? '✓ Retenu par le professeur. Surprise à la projection !' : 'Le professeur ne l\'a pas retenu.'; }
      else { etat.className = 'etat-envoi ok'; etat.textContent = '✓ Envoyé. Tu peux encore le corriger.'; }
    }, function () {});
    env.addEventListener('click', function () {
      var x = t.value.trim();
      if (!x) { etat.className = 'etat-envoi err'; etat.textContent = 'Écris le détail.'; return; }
      env.disabled = true;
      EMC.ecrire('emc_mur?on_conflict=classe_id,eleve_id,sorte', { classe_id: cx.S.classe, eleve_id: cx.S.eleveId, sorte: 'portrait',
        question: sel.value ? +sel.value : null, texte: x.slice(0, 300) }, { fusion: true }).then(function () {
        J.brouillonPortrait = null;
        env.disabled = false; etat.className = 'etat-envoi ok'; etat.textContent = '✓ Envoyé. Le professeur le relit avant de le projeter.';
      }, function (e) { env.disabled = false; etat.className = 'etat-envoi err'; etat.textContent = EMC.horsLigne(e) ? 'Pas de réseau : réessaie.' : 'Déjà relu par le professeur : il ne se modifie plus.'; });
    });
  }

  /* 8 — La liberté, pour moi : sur une fiche papier (l'aller d'une
     boucle dont le retour est « Ma définition », vendredi) */
  function eFiche(s, cx) {
    effacerNotes(cx);
    var j = jdr(cx), b = cx.bloc(); s.appendChild(b);
    b.appendChild(el('div', { class: 'symbole-geant petit' }, '📝'));
    b.appendChild(el('p', { class: 'consigne-geante' }, 'Pour moi, la liberté, c’est…'));
    b.appendChild(el('p', { class: 'mission-texte', style: 'text-align:center' },
      EMC.riche(j.liberte_fiche || 'Prends la fiche qu’on te distribue. Écris ce qu’est pour toi la liberté : un mot, une phrase, un exemple. Vendredi, on y reviendra.')));
    b.appendChild(el('p', { class: 'tresmuet', style: 'text-align:center' }, 'Sur papier : rien à écrire sur la tablette.'));
  }

  /* 9 — Clôture : les notes s'effacent ; une phrase, si on veut */
  function e8(s, cx) {
    effacerNotes(cx);
    var j = jdr(cx), b = cx.bloc(); s.appendChild(b);
    b.appendChild(el('h2', null, 'Merci ! 🙏'));
    b.appendChild(encadre('🧹 Tes notes de l\'échange viennent d\'être effacées, de cette tablette et du site.', 'cyan'));
    var etat = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var t = el('textarea', { id: 'retiens', rows: '3', maxlength: '300' });
    var env = el('button', { type: 'button', class: 'primaire' }, 'Envoyer');
    b.appendChild(el('label', { for: 'retiens' }, j.retiens_question || 'Ce que je retiens de mon binôme (facultatif)'));
    b.appendChild(t); b.appendChild(env); b.appendChild(etat);
    env.addEventListener('click', function () {
      var x = t.value.trim();
      if (!x) { etat.className = 'etat-envoi err'; etat.textContent = 'C\'est facultatif : rien à envoyer.'; return; }
      EMC.ecrire('emc_mur?on_conflict=classe_id,eleve_id,sorte', { classe_id: cx.S.classe, eleve_id: cx.S.eleveId, sorte: 'retiens', texte: x.slice(0, 300) }, { fusion: true })
        .then(function () { etat.className = 'etat-envoi ok'; etat.textContent = '✓ Merci, c\'est envoyé.'; },
              function (e) { etat.className = 'etat-envoi err'; etat.textContent = EMC.message(e); });
    });
  }

  /* ============================================================ */
  EMC.Modules.accueil = {
    titre: 'Je m\'appelle…',
    cleEtapes: 'etapes_accueil',
    sansBandeau: true,                 /* pas de numéros d'urgence ici (Loïc, 08/11) */
    etapes: [e0, e1, e2, e3, e4, e5, e6, e7, eFiche, e8],
    demarrer: function (cx) {
      try { var m = JSON.parse(localStorage.getItem('emc.jdr.moi.' + cx.S.classe) || 'null'); if (m && m.eleve_id === cx.S.eleveId) J.moi = m; } catch (e) {}
      relireLignes(cx).then(function () { if (cx.S.seance && cx.S.seance.etape === 0) cx.rafraichir(); }, function () {});
      J.ecoute = EMC.ecouter('emc_binomes', 'classe_id=eq.' + cx.S.classe, function () { relireBinome(cx); }, function () { relireBinome(cx); }, { periode: 4 });
    },
    badge: function () {
      return monSymbole() ? el('span', { class: 'pastille table grande-table symbole-badge', title: 'Ton symbole' }, monSymbole())
                          : el('span', { class: 'pastille grande-table' }, '🎭');
    },
    majSeance: function (cx, avant, ligne) {
      var a = avant.etat || {}, b = ligne.etat || {};
      if (JSON.stringify(a) === JSON.stringify(b)) return;
      if (ligne.etape === 4 || ligne.etape === 6) cx.rafraichir();
      if (ligne.etape === 7 && (a.portrait !== b.portrait || a.revele !== b.revele)) majCestToi(cx);
    },
    fin: function (cx) { effacerNotes(cx); },
    quitter: function (cx) { effacerNotes(cx); try { localStorage.removeItem('emc.jdr.moi.' + cx.S.classe); } catch (e) {} }
  };

  function relireBinome(cx) {
    return EMC.lire('emc_binomes?select=eleve_id,binome,symbole&classe_id=eq.' + cx.S.classe).then(function (l) {
      var avant = JSON.stringify(J.binome);
      J.binome = l || [];
      if (avant !== JSON.stringify(J.binome)) {
        cx.rendreBarre();
        if (cx.S.seance && [2, 6].indexOf(cx.S.seance.etape) >= 0) cx.rafraichir();
        if (cx.S.seance && cx.S.seance.etape === 7) majCestToi(cx);
      }
    }, function () {});
  }

  /* pour la projection (prof/emc-accueil.html) */
  EMC.Accueil = { consignes: function (contenus) { return consignes({ contenu: function (k) { return contenus[k]; } }); } };
})(window);
