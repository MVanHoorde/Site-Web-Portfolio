/* ============================================================
   assets/js/rappels-es.js — « Pour se remettre en route »
   ------------------------------------------------------------
   Demande de Loïc du 12/11/2026 (enseignement scientifique : les
   séances sont éloignées). À l'ouverture d'un chapitre, après plus
   de 2 h d'absence, l'élève connecté reçoit QUATRE questions sur ce
   qu'il a fait en dernier : trois tirées des trois dernières étapes
   qu'il a validées (dans l'ordre du cours), une plus ancienne.

   · La banque vit dans assets/js/rappels/<séquence>.js
     (window.RAPPELS['es1-t1-c2'] = [...]) ; ses formes de question
     (QCM, association, curseur, « révèle ») et leur rendu sont dans
     assets/js/rappels-rendu.js. Une question n'est posée qu'à un élève
     qui a validé SON étape : rien n'est demandé qui n'ait été présenté.
   · Une question déjà posée ne revient que si la dernière réponse
     était fausse — et elle passe alors avant les questions neuves.
     Des variantes d'une même question portent le même « groupe » :
     une seule par série. Tirage au hasard.
   · Sans enjeu : rien de noté, rien ne valide une étape. L'élève
     peut passer. Les résultats partent dans l'état de la séquence
     (EtatSNT.noterChamps) — le tableau de bord les relit
     (prof/rappels.html, onglet Statistiques) :
         'rappels/<id>'     → ['1','0',…]   une entrée par fois posée
         'rappels/_vu'      → [heure ISO]   dernier rappel montré
         'rappels/_series'  → ['heure|bonnes|posées|passé', …]
   · Allumé par <body data-rappels="actif">, une fois la banque
     auditée par Loïc. Avant : seulement avec ?rappels=essai dans
     l'adresse (essai, quel que soit le délai).
   · Après une absence, le moteur ouvre d'abord sa carte « Bon
     retour » (bloquante, décision de Loïc) : on attend qu'elle soit
     fermée, puis on enchaîne.
   Se charge en fin de body, APRÈS sequence-snt.js, rappels-rendu.js
   et la banque.
   ============================================================ */
(function(){
  'use strict';
  var essai = /[?&]rappels=essai\b/.test(location.search);
  var actif = document.body.getAttribute('data-rappels') === 'actif';
  if(!actif && !essai) return;
  var SEQ = document.body.getAttribute('data-sequence');
  var BANQUE = (window.RAPPELS || {})[SEQ], R = window.RappelsRendu;
  if(!SEQ || !BANQUE || !BANQUE.length || !R || !window.EtatSNT || !EtatSNT.actif()) return;
  var NB = 4, RECENTES = 3, ABSENCE_H = 2;

  function melanger(a){ a = a.slice(); for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* les étapes à valider de la page, dans l'ordre du cours */
  var etapes = Array.prototype.map.call(document.querySelectorAll('.step[data-gate][data-cle]'), function(s){
    var k = s.querySelector('.step-kicker'), m = k && /(\d+\.\d+)/.exec(k.textContent);
    return {cle: s.getAttribute('data-cle'), el: s, num: m ? m[1] : ''};
  });
  function etapeDe(cle){ for(var i = 0; i < etapes.length; i++) if(etapes[i].cle === cle) return etapes[i]; return null; }

  function historique(id){ var v = EtatSNT.champs()['rappels/' + id]; return v && v.length ? v : []; }
  function eligible(q){ var h = historique(q.id); return !h.length || h[h.length - 1] === '0'; }
  /* un groupe de variantes déjà réussi (une de ses questions) ne revient plus */
  function groupeReussi(q){
    if(!q.groupe) return false;
    return BANQUE.some(function(x){ var h = x.groupe === q.groupe && historique(x.id); return h && h.length && h[h.length - 1] === '1'; });
  }

  function tirer(){
    var faites = EtatSNT.etapes();
    var validees = etapes.filter(function(e){ return faites[e.cle] && faites[e.cle].fait; }).map(function(e){ return e.cle; });
    if(!validees.length) return [];
    var recentes = validees.slice(-RECENTES), anciennes = validees.slice(0, -RECENTES);
    /* les questions manquées la dernière fois passent d'abord, puis celles jamais posées — au hasard dans chaque paquet */
    var dans = function(liste){
      var l = BANQUE.filter(function(q){ return liste.indexOf(q.etape) >= 0 && eligible(q) && !groupeReussi(q); });
      var manquees = melanger(l.filter(function(q){ return historique(q.id).length; }));
      return manquees.concat(melanger(l.filter(function(q){ return !historique(q.id).length; })));
    };
    var pr = dans(recentes), pa = dans(anciennes);
    var choisies = [], etapesVues = {}, groupesVus = {};
    function prendre(q, max, uneParEtape){
      if(choisies.length >= max || choisies.indexOf(q) >= 0) return;
      if(q.groupe && groupesVus[q.groupe]) return;
      if(uneParEtape && etapesVues[q.etape]) return;
      choisies.push(q); etapesVues[q.etape] = 1; if(q.groupe) groupesVus[q.groupe] = 1;
    }
    /* trois récentes, d'étapes différentes autant que possible, puis une ancienne */
    pr.forEach(function(q){ prendre(q, NB - 1, true); });
    pr.forEach(function(q){ prendre(q, NB - 1, false); });
    pa.forEach(function(q){ prendre(q, NB, false); });
    pr.forEach(function(q){ prendre(q, NB, false); });
    return choisies;
  }

  /* ---------------- l'écran ---------------- */
  R.poserCss();
  var css = document.createElement('style');
  css.textContent =
    '.rap-voile{position:fixed;inset:0;z-index:9000;background:rgba(14,20,34,.55);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.rap-carte{background:var(--surface,#fff);color:var(--ink,#161f33);border-radius:16px;max-width:640px;width:100%;max-height:calc(100vh - 32px);overflow:auto;' +
      'padding:18px 20px 16px;box-shadow:0 18px 50px rgba(0,0,0,.25);font-size:15.5px;line-height:1.5}' +
    '.rap-tete{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:4px}' +
    '.rap-tete h2{margin:0;font:600 18px "Space Grotesk","Inter",system-ui,sans-serif}' +
    '.rap-tete h2:focus{outline:none}' +
    '.rap-compte{margin-left:auto;font:12.5px "IBM Plex Mono",monospace;color:var(--ink-soft,#4a566e)}' +
    '.rap-sous{margin:0 0 12px;font-size:13.5px;color:var(--ink-soft,#4a566e)}' +
    '.rap-q{font-weight:600;margin:6px 0 12px}' +
    '.rap-de{font:12px "IBM Plex Mono",monospace;color:var(--ink-faint,#8b97ad);margin:0 0 2px}' +
    '.rap-expl a{color:var(--link,#2445c7)}' +
    '.rap-pied{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center;margin-top:14px}' +
    '.rap-pied button{font:inherit;border:1px solid var(--line,#d3dae7);background:var(--surface-2,#f4f6fb);color:inherit;border-radius:10px;padding:10px 12px;min-height:44px;cursor:pointer}' +
    '.rap-pied .p{background:var(--link,#2445c7);border-color:var(--link,#2445c7);color:#fff}' +
    '.rap-pied .discret{background:none;border-color:transparent;color:var(--ink-soft,#4a566e);text-decoration:underline}' +
    '@media (prefers-reduced-motion:no-preference){.rap-carte{animation:rap-in .22s ease-out}@keyframes rap-in{from{transform:translateY(8px);opacity:0}}}';
  document.head.appendChild(css);

  var voile, carte, file = [], rang = 0, bonnes = 0, posees = 0, fini = false;

  function ouvrir(questions){
    file = questions; rang = 0; bonnes = 0; posees = 0; fini = false;
    voile = document.createElement('div'); voile.className = 'rap-voile';
    voile.innerHTML = '<div class="rap-carte" role="dialog" aria-modal="true" aria-labelledby="rap-titre"></div>';
    carte = voile.firstChild;
    document.body.appendChild(voile);
    document.body.classList.add('qcm-on');      /* écarte glossaire et boutons flottants */
    EtatSNT.noterChamps('rappels/_vu', [new Date().toISOString()]);
    question();
  }
  function fermer(passe){
    if(!voile) return;
    if(!fini) serie(passe);
    voile.remove(); voile = null;
    document.body.classList.remove('qcm-on');
  }
  function serie(passe){
    fini = true;
    var s = EtatSNT.champs()['rappels/_series'] || [];
    s = s.concat([new Date().toISOString() + '|' + bonnes + '|' + posees + '|' + (passe ? '1' : '0')]).slice(-40);
    EtatSNT.noterChamps('rappels/_series', s);
  }
  function tete(){
    return '<div class="rap-tete"><h2 id="rap-titre" tabindex="-1">⟲ Pour se remettre en route</h2>'
      + '<span class="rap-compte">' + (rang + 1) + ' / ' + file.length + '</span></div>'
      + (rang === 0 ? '<p class="rap-sous">Quelques questions sur ce que tu as fait les dernières fois. Rien n\'est noté — mais c\'est exactement ce qui te servira pour les évaluations.</p>' : '');
  }
  function noterReponse(q, juste){
    posees++; if(juste) bonnes++;
    EtatSNT.noterChamps('rappels/' + q.id, historique(q.id).concat([juste ? '1' : '0']).slice(-12));
  }
  function revoir(q){
    var e = etapeDe(q.etape);
    return e ? ' <a href="#" data-revoir="' + esc(q.etape) + '">Revoir l\'étape ' + esc(e.num) + '</a>' : '';
  }
  function pied(apres){
    return '<div class="rap-pied"><button type="button" class="discret" data-passer>' + (apres ? 'Arrêter là' : 'Passer ces questions') + '</button>'
      + (apres ? '<button type="button" class="p" data-suivant>' + (rang + 1 < file.length ? 'Question suivante →' : 'Terminer') + '</button>' : '') + '</div>';
  }
  function question(){
    var q = file[rang], e = etapeDe(q.etape);
    carte.setAttribute('data-id', q.id);   /* la question affichée (statistiques, banc d'essai) */
    carte.innerHTML = tete() + (e ? '<p class="rap-de">Étape ' + esc(e.num) + '</p>' : '')
      + '<p class="rap-q">' + R.fmt(q.q) + '</p><div class="rap-corps">' + R.corps(q) + '</div>' + pied(false);
    R.brancher(carte.querySelector('.rap-corps'), q, function(juste){
      noterReponse(q, juste);
      carte.querySelector('.rap-pied').outerHTML = pied(true);
      carte.querySelector('[data-suivant]').focus({preventScroll: true});
    }, revoir(q));
    var t = carte.querySelector('#rap-titre'); if(t) t.focus({preventScroll: true});
  }
  function afficherFin(){
    serie(false);
    carte.removeAttribute('data-id');
    carte.innerHTML = '<div class="rap-tete"><h2 id="rap-titre" tabindex="-1">⟲ C\'est reparti</h2></div>'
      + '<p class="rap-q">' + bonnes + ' sur ' + posees + '.</p>'
      + '<p class="rap-sous" style="margin-bottom:0">' + (bonnes === posees
          ? 'Tout y est&nbsp;: ces questions ne reviendront pas.'
          : 'Les questions manquées reviendront une prochaine fois. Le lien « Revoir l\'étape » mène à l\'endroit du cours.') + '</p>'
      + '<div class="rap-pied"><span></span><button type="button" class="p" data-fermer>Reprendre le cours</button></div>';
    carte.querySelector('[data-fermer]').focus();
  }

  /* les boutons du pied et le lien « Revoir » ; les gestes de la question sont dans rappels-rendu.js */
  document.addEventListener('click', function(ev){
    if(!voile || !voile.contains(ev.target)) return;
    var b = ev.target.closest('[data-passer],[data-fermer],[data-suivant],[data-revoir]'); if(!b) return;
    if(b.hasAttribute('data-passer')){ fermer(true); return; }
    if(b.hasAttribute('data-fermer')){ fermer(false); return; }
    if(b.hasAttribute('data-suivant')){ rang++; if(rang < file.length) question(); else afficherFin(); return; }
    ev.preventDefault();
    var e = etapeDe(b.getAttribute('data-revoir'));
    fermer(true);
    if(e){
      var top = e.el.querySelector('.card-top'), corps = e.el.querySelector('.card-body');
      if(corps && corps.offsetParent === null && top) top.click();
      e.el.scrollIntoView({block: 'start', behavior: 'instant'});
    }
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && voile) fermer(true); });

  /* ---------------- le déclenchement ---------------- */
  EtatSNT.charge.then(function(){
    var B = window.Progression;
    return (B && B.session ? B.session() : Promise.resolve(null)).then(function(moi){
      if(!moi) return;                                   /* invité : rien à reprendre, rien à garder */
      var vu = (EtatSNT.champs()['rappels/_vu'] || [])[0], d = vu ? Date.parse(vu) : 0;
      var recent = d && (Date.now() - d) < ABSENCE_H * 3600000;
      if(!essai && (!EtatSNT.absentDepuis(ABSENCE_H) || recent)) return;
      var q = tirer();
      if(!q.length) return;
      var essais = 0;
      function attendre(){
        var occupe = document.querySelector('.hub-modale') || document.body.classList.contains('focus-on');
        if(occupe){ if(++essais < 1500) setTimeout(attendre, 400); return; }
        ouvrir(q);
      }
      setTimeout(attendre, 1500);   /* la carte de reprise se pose juste après le chargement */
    });
  }).catch(function(){});
})();
