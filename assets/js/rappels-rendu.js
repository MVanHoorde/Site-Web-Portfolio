/* ============================================================
   assets/js/rappels-rendu.js — le rendu d'une question de rappel
   ------------------------------------------------------------
   Commun à l'élève (assets/js/rappels-es.js) et à l'audit de Loïc
   (prof/rappels.html, qui fait essayer chaque question telle qu'un
   élève la voit). Aucune donnée, aucune base : du rendu.

   Formes de question (banques : assets/js/rappels/<séquence>.js) :
     qcm     { q, choix:[2 à 6], r, expl }         choix mélangés à l'affichage
     assoc   { q, cases:[{t, r}], liens:['→',…], etiquettes:[…], expl }
             un schéma en cases ; sous chaque case, un menu déroulant.
             Juste si toutes les cases le sont. Étiquettes mélangées.
     curseur { q, min, max, pas, unite, r, tol, entre, expl }
             juste si |valeur − r| ≤ tol — ou, pour une estimation,
             si la valeur tombe dans l'encadrement entre:[bas, haut]
             (r reste la valeur exacte, affichée dans la correction).
             L'échelle doit contenir les erreurs classiques (A et Z
             confondus, division oubliée…) : sinon le curseur souffle.
     flash   { q, rep }   « réfléchis, puis révèle » : l'élève dit
             lui-même s'il l'avait. Réservé aux réponses précises.
   Champs communs facultatifs :
     groupe  — des variantes d'une même question ; une seule par série.
     figure  — un schéma de structure tracé ici, sous l'énoncé :
       { type:'nz', z:[zmin,zmax], n:[nmin,nmax],
         noyaux:[{a, z, x, num}], chemin:[[i, j, 'α'|'…'], …] }
       une portion de la carte des noyaux (Z en abscisse, N en
       ordonnée) ; num = repère affiché (①, ②…) ; chemin = flèches,
       en pointillé si l'étiquette est '…'.

   Écriture d'un noyau : {{nuc:A:Z:X}} → A au-dessus de Z, alignés à
   droite, devant le symbole (ex. {{nuc:226:88:Ra}}).
   ============================================================ */
(function(global){
  'use strict';
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function melanger(a){ a = a.slice(); for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }

  /* le texte des banques est du HTML de confiance (écrit dans le dépôt) ;
     seule la notation des noyaux est développée ici */
  function fmt(s){
    return String(s == null ? '' : s).replace(/\{\{nuc:([^:}]*):([^:}]*):([^}]*)\}\}/g, function(_, a, z, x){
      return '<span class="nuc"><span class="nuc-az"><span>' + esc(a) + '</span><span>' + esc(z) + '</span></span>' + esc(x) + '</span>';
    });
  }
  function texte(s){ var d = document.createElement('div'); d.innerHTML = fmt(s); return d.textContent; }

  var CSS =
    '.nuc{display:inline-flex;align-items:center;white-space:nowrap}' +
    '.nuc-az{display:inline-flex;flex-direction:column;align-items:flex-end;font-size:.72em;line-height:1;margin-right:.1em;font-variant-numeric:tabular-nums;font-weight:500}' +
    '.rr-choix{display:grid;gap:8px}' +
    '.rr-choix button,.rr-btn{font:inherit;text-align:left;border:1px solid var(--line,#d3dae7);background:var(--surface-2,#f4f6fb);color:inherit;border-radius:10px;padding:10px 12px;min-height:44px;cursor:pointer}' +
    '.rr-choix button:hover:not([disabled]){border-color:var(--link,#2445c7)}' +
    '.rr-choix button.bon,.rr-case.bon{background:var(--ok-wash,#e0f2ea);border-color:var(--ok,#12805c)}' +
    '.rr-choix button.faux,.rr-case.faux{background:var(--err-wash,#fbe6e3);border-color:var(--err,#c33a2f)}' +
    '.rr-choix button[disabled]{cursor:default}' +
    '.rr-btn.p{background:var(--link,#2445c7);border-color:var(--link,#2445c7);color:#fff;text-align:center}' +
    '.rr-btn[disabled]{opacity:.5;cursor:default}' +
    '.rr-schema{display:flex;flex-wrap:wrap;align-items:stretch;justify-content:center;gap:8px 6px;margin:4px 0 12px}' +
    '.rr-case{display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:8px;min-width:118px;flex:0 1 auto;' +
      'border:1.5px solid var(--line,#d3dae7);border-radius:12px;padding:10px 10px 8px;background:var(--surface,#fff)}' +
    '.rr-case .rr-t{font-size:1.25em;font-weight:600;text-align:center;line-height:1.25}' +
    '.rr-case select{font:inherit;font-size:14px;min-height:40px;max-width:100%;border:1px solid var(--line,#d3dae7);border-radius:8px;background:var(--surface-2,#f4f6fb);color:inherit;padding:4px 6px}' +
    '.rr-case .rr-attendu{font-size:12.5px;color:var(--ok,#12805c);font-weight:600}' +
    '.rr-lien{align-self:center;font-size:1.4em;color:var(--ink-soft,#4a566e);padding:0 2px}' +
    '.rr-curseur{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:4px 0 12px}' +
    '.rr-curseur input[type=range]{flex:1 1 220px;min-height:44px;accent-color:var(--link,#2445c7)}' +
    '.rr-val{font:600 20px "Space Grotesk","Inter",sans-serif;min-width:5.5em;text-align:right;font-variant-numeric:tabular-nums}' +
    '.rr-bornes{display:flex;justify-content:space-between;font:12px "IBM Plex Mono",monospace;color:var(--ink-faint,#8b97ad);margin-top:-8px}' +
    '.rr-expl{margin:12px 0 0;padding:10px 12px;border-left:3px solid var(--link,#2445c7);background:var(--link-wash,#e7ebfb);border-radius:0 10px 10px 0;font-size:14.5px}' +
    '.rr-expl.ok{border-color:var(--ok,#12805c);background:var(--ok-wash,#e0f2ea)}' +
    '.rr-expl.ko{border-color:var(--err,#c33a2f);background:var(--err-wash,#fbe6e3)}' +
    '.rr-flash{display:flex;gap:8px;flex-wrap:wrap}' +
    '.rr-sous{margin:12px 0 6px;font-size:13.5px;color:var(--ink-soft,#4a566e)}' +
    '.rr-fig{margin:0 0 12px;max-width:420px;color:var(--ink,#161f33)}' +
    '.rr-fig svg{display:block;width:100%;height:auto}' +
    '.rr-gr{stroke:var(--line,#d3dae7);stroke-width:1}' +
    '.rr-tk{font:11px "IBM Plex Mono",monospace;fill:var(--ink-soft,#4a566e)}' +
    '.rr-ti{font:12px "IBM Plex Sans","Inter",sans-serif;fill:var(--ink-soft,#4a566e)}' +
    '.rr-nz{fill:var(--activity-wash,#faeede);stroke:var(--activity,#c26a12);stroke-width:1.6}' +
    '.rr-nl{font:600 12.5px "IBM Plex Sans","Inter",sans-serif;fill:currentColor}' +
    '.rr-fl{stroke:currentColor;stroke-width:1.6}.rr-fl.pointille{stroke-dasharray:4 4}' +
    '.rr-pastille{fill:var(--ink,#161f33)}.rr-pastille-t{font:700 11px "IBM Plex Sans","Inter",sans-serif;fill:var(--surface,#fff)}' +
    '.rr-et{font:600 12px "IBM Plex Sans","Inter",sans-serif;fill:var(--activity,#c26a12)}' +
    '@media (max-width:520px){.rr-case{min-width:0;flex:1 1 40%}.rr-lien{display:none}}';
  var cssPose = false;
  function poserCss(){
    if(cssPose) return; cssPose = true;
    var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);
  }

  function virgule(v, pas){
    var d = String(pas || 1).indexOf('.') >= 0 ? String(pas).split('.')[1].length : 0;
    return Number(v).toFixed(d).replace('.', ',');
  }

  /* Une portion de la carte des noyaux (N en fonction de Z). */
  function figureNZ(f){
    var L = 400, H = 300, mg = 46, md = 70, mh = 14, mb = 38;
    var z0 = f.z[0], z1 = f.z[1], n0 = f.n[0], n1 = f.n[1];
    var X = function(z){ return mg + (L - mg - md) * (z - z0) / (z1 - z0); };
    var Y = function(n){ return mh + (H - mh - mb) * (1 - (n - n0) / (n1 - n0)); };
    var s = '<svg viewBox="0 0 ' + L + ' ' + H + '" role="img" aria-label="Portion de la carte des noyaux : nombre de neutrons en fonction du nombre de protons">'
      + '<defs><marker id="rr-fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>';
    var pz = (z1 - z0) > 12 ? 4 : 2, pn = (n1 - n0) > 24 ? 8 : 4, v;
    for(v = Math.ceil(z0 / pz) * pz; v <= z1; v += pz)
      s += '<line x1="' + X(v) + '" x2="' + X(v) + '" y1="' + mh + '" y2="' + (H - mb) + '" class="rr-gr"/><text x="' + X(v) + '" y="' + (H - mb + 15) + '" class="rr-tk" text-anchor="middle">' + v + '</text>';
    for(v = Math.ceil(n0 / pn) * pn; v <= n1; v += pn)
      s += '<line x1="' + mg + '" x2="' + (L - md) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" class="rr-gr"/><text x="' + (mg - 6) + '" y="' + (Y(v) + 4) + '" class="rr-tk" text-anchor="end">' + v + '</text>';
    s += '<text x="' + ((mg + L - md) / 2) + '" y="' + (H - 6) + '" class="rr-ti" text-anchor="middle">nombre de protons Z</text>'
      + '<text x="12" y="' + ((mh + H - mb) / 2) + '" class="rr-ti" text-anchor="middle" transform="rotate(-90 12 ' + ((mh + H - mb) / 2) + ')">nombre de neutrons N</text>';
    var pts = (f.noyaux || []).map(function(k){ return {x: X(k.z), y: Y(k.a - k.z), k: k}; });
    (f.chemin || []).forEach(function(c){
      var a = pts[c[0]], b = pts[c[1]]; if(!a || !b) return;
      var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, r = 11;
      s += '<line x1="' + (a.x + dx / d * r) + '" y1="' + (a.y + dy / d * r) + '" x2="' + (b.x - dx / d * r) + '" y2="' + (b.y - dy / d * r) + '" class="rr-fl' + (c[2] === '…' ? ' pointille' : '') + '" marker-end="url(#rr-fl)"/>';
      /* l'étiquette de la flèche, sur le côté (perpendiculaire), jamais sur un carré */
      if(c[2] && c[2] !== '…') s += '<text x="' + ((a.x + b.x) / 2 - dy / d * 14) + '" y="' + ((a.y + b.y) / 2 + dx / d * 14 + 4) + '" class="rr-et" text-anchor="middle">' + esc(c[2]) + '</text>';
    });
    /* le repère (①, 1…) dans une pastille dessinée : les chiffres cerclés passent mal dans certaines polices */
    var CERCLES = '①②③④⑤⑥⑦⑧⑨';
    pts.forEach(function(p){
      var num = p.k.num ? String(p.k.num) : '', ci = CERCLES.indexOf(num);
      if(num && ci >= 0) num = String(ci + 1);
      s += '<rect x="' + (p.x - 8) + '" y="' + (p.y - 8) + '" width="16" height="16" rx="3" class="rr-nz"/>';
      var x0 = p.x + 13;
      if(num){ s += '<circle cx="' + (x0 + 8) + '" cy="' + p.y + '" r="8.5" class="rr-pastille"/><text x="' + (x0 + 8) + '" y="' + (p.y + 4) + '" class="rr-pastille-t" text-anchor="middle">' + esc(num) + '</text>'; x0 += 21; }
      s += '<text x="' + x0 + '" y="' + (p.y + 4.5) + '" class="rr-nl">' + esc((p.k.x || '') + (p.k.a ? ' ' + p.k.a : '')) + '</text>';
    });
    return s + '</svg>';
  }
  function figure(f){
    if(!f) return '';
    if(f.type === 'nz') return '<div class="rr-fig">' + figureNZ(f) + '</div>';
    return '';
  }

  /* Le corps interactif d'une question : la figure éventuelle, puis les gestes. */
  function corps(q){
    return figure(q.figure) + corpsSeul(q);
  }
  function corpsSeul(q){
    if(q.type === 'flash'){
      return '<div class="rr-flash"><button type="button" class="rr-btn p" data-rr-retourner>Révéler la réponse</button></div><div data-rr-zone></div>';
    }
    if(q.type === 'assoc'){
      var et = melanger(q.etiquettes || q.cases.map(function(c){ return c.r; }));
      var h = '<div class="rr-schema">';
      q.cases.forEach(function(c, i){
        if(i) h += '<span class="rr-lien" aria-hidden="true">' + fmt((q.liens || [])[i - 1] || '') + '</span>';
        h += '<div class="rr-case" data-rr-case="' + i + '"><div class="rr-t">' + fmt(c.t) + '</div>'
          + '<select aria-label="Étiquette de la case ' + (i + 1) + '"><option value="">— choisis —</option>'
          + et.map(function(e){ return '<option value="' + esc(e) + '">' + esc(texte(e)) + '</option>'; }).join('') + '</select></div>';
      });
      return h + '</div><div class="rr-flash"><button type="button" class="rr-btn p" data-rr-valider disabled>Valider</button></div><div data-rr-zone></div>';
    }
    if(q.type === 'curseur'){
      /* départ au hasard, mais jamais près de la réponse (au moins un quart de l'échelle) :
         un curseur posé au milieu livrait les réponses du milieu */
      var mi = +q.min, ma = +q.max, pas = +q.pas || 1, depart = mi, essai = 0;
      do { depart = mi + Math.round(Math.random() * (ma - mi) / pas) * pas; }
      while(Math.abs(depart - q.r) < (ma - mi) / 4 && ++essai < 40);
      depart = +depart.toFixed(6);
      return '<div class="rr-curseur"><input type="range" min="' + mi + '" max="' + ma + '" step="' + pas + '" value="' + depart + '" aria-label="Ta valeur">'
        + '<span class="rr-val" data-rr-val>' + virgule(depart, pas) + ' ' + esc(q.unite || '') + '</span></div>'
        + '<div class="rr-bornes"><span>' + virgule(mi, pas) + '</span><span>' + virgule(ma, pas) + '</span></div>'
        + '<div class="rr-flash" style="margin-top:12px"><button type="button" class="rr-btn p" data-rr-valider>Valider</button></div><div data-rr-zone></div>';
    }
    var ordre = melanger(q.choix.map(function(_, i){ return i; }));
    return '<div class="rr-choix">' + ordre.map(function(i){ return '<button type="button" data-rr-i="' + i + '">' + fmt(q.choix[i]) + '</button>'; }).join('') + '</div><div data-rr-zone></div>';
  }

  /* Branche les gestes ; fin(juste) est appelé une fois, à la réponse.
     suite : HTML ajouté sous la correction (lien « Revoir l'étape »). */
  function brancher(el, q, fin, suite){
    var zone = el.querySelector('[data-rr-zone]'), fait = false;
    suite = suite || '';
    function finir(juste, html){
      if(fait) return; fait = true;
      zone.innerHTML = html;
      if(fin) fin(juste);
    }
    function correction(juste){
      return '<div class="rr-expl ' + (juste ? 'ok' : 'ko') + '">' + (juste ? '✓ ' : '✗ ') + fmt(q.expl || '') + suite + '</div>';
    }
    if(q.type === 'flash'){
      el.querySelector('[data-rr-retourner]').addEventListener('click', function(){
        this.parentNode.remove();
        zone.innerHTML = '<div class="rr-expl">' + fmt(q.rep) + suite + '</div><p class="rr-sous">Tu l\'avais&nbsp;?</p>'
          + '<div class="rr-flash"><button type="button" class="rr-btn" data-rr-avais="1">✓ Je l\'avais</button><button type="button" class="rr-btn" data-rr-avais="0">✗ Pas vraiment</button></div>';
        zone.querySelectorAll('[data-rr-avais]').forEach(function(b){
          b.addEventListener('click', function(){
            if(fait) return; fait = true;
            zone.querySelectorAll('[data-rr-avais]').forEach(function(x){ x.disabled = true; if(x !== b) x.style.opacity = '.45'; });
            if(fin) fin(b.getAttribute('data-rr-avais') === '1');
          });
        });
      });
      return;
    }
    if(q.type === 'assoc'){
      var selects = el.querySelectorAll('.rr-case select'), bv = el.querySelector('[data-rr-valider]');
      selects.forEach(function(s){ s.addEventListener('change', function(){
        bv.disabled = Array.prototype.some.call(selects, function(x){ return !x.value; });
      }); });
      bv.addEventListener('click', function(){
        var toutes = true;
        Array.prototype.forEach.call(selects, function(s, i){
          var c = q.cases[i], bon = s.value === c.r, cs = s.closest('.rr-case');
          s.disabled = true; cs.classList.add(bon ? 'bon' : 'faux');
          if(!bon){ toutes = false; var a = document.createElement('div'); a.className = 'rr-attendu'; a.innerHTML = '→ ' + fmt(c.r); cs.appendChild(a); }
        });
        bv.parentNode.remove();
        finir(toutes, correction(toutes));
      });
      return;
    }
    if(q.type === 'curseur'){
      var r = el.querySelector('input[type=range]'), v = el.querySelector('[data-rr-val]');
      r.addEventListener('input', function(){ v.textContent = virgule(r.value, q.pas) + ' ' + (q.unite || ''); });
      el.querySelector('[data-rr-valider]').addEventListener('click', function(){
        var x = +r.value, juste = q.entre ? (x >= q.entre[0] - 1e-9 && x <= q.entre[1] + 1e-9) : Math.abs(x - q.r) <= (+q.tol || 0);
        r.disabled = true; this.parentNode.remove();
        finir(juste, correction(juste).replace('</div>', '') + '<br><b>Attendu&nbsp;: ' + virgule(q.r, q.pas) + ' ' + esc(q.unite || '')
          + (q.entre ? ' — juste entre ' + virgule(q.entre[0], q.pas) + ' et ' + virgule(q.entre[1], q.pas) : (q.tol ? ' (à ' + virgule(q.tol, q.pas) + ' près)' : '')) + '</b> — toi&nbsp;: ' + virgule(x, q.pas) + '</div>');
      });
      return;
    }
    el.querySelectorAll('[data-rr-i]').forEach(function(b){
      b.addEventListener('click', function(){
        var i = +b.getAttribute('data-rr-i'), juste = i === q.r;
        el.querySelectorAll('[data-rr-i]').forEach(function(x){ x.disabled = true; if(+x.getAttribute('data-rr-i') === q.r) x.classList.add('bon'); });
        if(!juste) b.classList.add('faux');
        finir(juste, correction(juste));
      });
    });
  }

  /* Une ligne de texte lisible de la bonne réponse (audit, statistiques). */
  function attendu(q){
    if(q.type === 'flash') return texte(q.rep);
    if(q.type === 'assoc') return q.cases.map(function(c){ return texte(c.t) + ' → ' + texte(c.r); }).join(' · ');
    if(q.type === 'curseur') return virgule(q.r, q.pas) + ' ' + (q.unite || '') + (q.entre ? ' (juste entre ' + virgule(q.entre[0], q.pas) + ' et ' + virgule(q.entre[1], q.pas) + ')' : (q.tol ? ' (± ' + virgule(q.tol, q.pas) + ')' : ''));
    return texte(q.choix[q.r]);
  }

  global.RappelsRendu = { fmt: fmt, texte: texte, poserCss: poserCss, corps: corps, brancher: brancher, attendu: attendu };
})(window);
