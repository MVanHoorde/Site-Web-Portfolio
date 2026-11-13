/* ============================================================
   assets/js/cristaux-3d.js — les structures cristallines en 3D, à tourner
   ------------------------------------------------------------
   Demande de Loïc du 13/11/2026 (ES 1re, « Les cristaux ») : Figure 3
   (diamant, graphite), Figure 6 (les trois mailles, éclatées et
   compactes) et Figure 12 (l'empilement hexagonal compact, animé).

   · Le rendu est le MÊME que celui des PNG de _outils/es/mailles.py :
     lancer de rayons orthographique, sphères dures aux vrais rayons,
     coupées par le cube en représentation compacte, même lumière, mêmes
     couleurs de position, arêtes cachées en pointillés. Il tourne dans
     un shader WebGL 2, sans bibliothèque ni CDN (règle RGPD du site).
   · UN SEUL contexte WebGL pour toute la page : chaque vue est un canvas
     2D où l'on recopie l'image calculée (Safari limite le nombre de
     contextes). On ne calcule qu'à la demande : quand on tourne, quand
     une animation joue, quand la vue entre à l'écran.
   · Balisage : <div class="v3d" data-3d="cfc-compacte" data-3d-groupe="fig6">
     <img …></div>. L'image reste la vue de repli (pas de WebGL 2, pas de
     JS, impression, fiche) ; elle n'est remplacée qu'une fois le shader
     compilé. Même groupe = même orientation (on compare éclatée et
     compacte en les tournant ensemble).
   · Les exercices, la fiche et les rappels gardent les PNG fixes
     (décision de Loïc du 13/11) : seules les figures du cours portent
     data-3d.
   · Doigt sur iPad : sur une vignette, le glissement horizontal fait
     tourner, le vertical fait défiler la page ; dans la vue agrandie
     (⤢), les deux font tourner. Souris : les deux. Clavier : flèches,
     Début pour revenir à la vue de départ.
   · prefers-reduced-motion : une animation s'affiche directement à sa
     dernière image ; la rotation à la main reste possible.
   ============================================================ */
(function(){
  'use strict';
  var vues=document.querySelectorAll('[data-3d]');
  if(!vues.length) return;

  /* ---------- le contexte WebGL partagé ---------- */
  var glcv=document.createElement('canvas');
  var gl=null;
  try{ gl=glcv.getContext('webgl2',{antialias:false,preserveDrawingBuffer:true,alpha:false}); }catch(e){ gl=null; }
  if(!gl) return;

  var VS='#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS=[
    '#version 300 es',
    'precision highp float;precision highp int;',
    'uniform sampler2D uD;uniform int uNS,uNC,uClip;',
    'uniform vec3 uR,uU,uC,uCtr,uLo,uHi;uniform float uK,uDist;uniform vec2 uRes;',
    'out vec4 o;',
    'vec4 T(int i){return texelFetch(uD,ivec2(i%1024,i/1024),0);}',
    'const vec3 ENCRE=vec3(34.,34.,40.)/255.;const vec3 GRIS=vec3(150.,150.,158.)/255.;',
    'void main(){',
    ' vec2 q=(gl_FragCoord.xy-.5*uRes)/uK;',
    ' vec3 rd=-uC, ro=uCtr+q.x*uR+q.y*uU+uDist*uC;',
    ' float w=1.15/uK;',
    ' vec3 L=normalize(.55*uC-.45*uR+.7*uU), Hv=normalize(L+uC);',
    /* le cube de coupe : entrée, sortie, et l'axe de la face d'entrée */
    ' float tb0=-1e9,tb1=1e9;int ax=0;',
    ' if(uClip==1){',
    '  vec3 r2=vec3(abs(rd.x)<1e-6?1e-6:rd.x,abs(rd.y)<1e-6?1e-6:rd.y,abs(rd.z)<1e-6?1e-6:rd.z);',
    '  vec3 a=(uLo-ro)/r2,b=(uHi-ro)/r2,mn=min(a,b),mx=max(a,b);',
    '  tb0=max(max(mn.x,mn.y),mn.z);tb1=min(min(mx.x,mx.y),mx.z);',
    '  ax=(tb0==mn.x)?0:((tb0==mn.y)?1:2);',
    ' }',
    /* les sphères (coupées par le cube s'il y en a un) */
    ' float tb=1e9;int ib=-1;bool fl=false;',
    ' for(int i=0;i<512;i++){if(i>=uNS)break;',
    '  vec4 s=T(2*i);if(s.w<=0.)continue;vec3 oc=ro-s.xyz;float b=dot(oc,rd),c=dot(oc,oc)-s.w*s.w,h=b*b-c;',
    '  if(h<0.)continue;h=sqrt(h);float t0=-b-h,t1=-b+h,e=t0;bool f=false;',
    '  if(uClip==1){e=max(t0,tb0);float so=min(t1,tb1);if(e>=so)continue;f=tb0>t0;}',
    '  if(e<tb){tb=e;ib=i;fl=f;}',
    ' }',
    ' vec3 col=vec3(1.);',
    ' if(ib>=0){',
    '  vec4 s=T(2*ib);vec3 base=T(2*ib+1).rgb;vec3 P=ro+tb*rd;bool encre=false;',
    '  if(fl){',
    '   vec3 n=vec3(0.);n[ax]=rd[ax]>0.?-1.:1.;',
    '   col=(.52*base+.48)*(.9+.1*clamp(dot(n,L),-1.,1.));',
    '   if(s.w-length(P-s.xyz)<w*.9)encre=true;',
    '  }else{',
    '   vec3 n=(P-s.xyz)/s.w;float dif=clamp(dot(n,L),0.,1.),spe=pow(clamp(dot(n,Hv),0.,1.),38.);',
    '   col=clamp(base*(.32+.68*dif)+.45*spe,0.,1.);',
    '   vec3 oc=ro-s.xyz;float b=dot(oc,rd);float d=sqrt(max(0.,dot(oc,oc)-b*b));',
    '   if(s.w-d<w)encre=true;',
    '   if(uClip==1){vec3 m=min(P-uLo,uHi-P);if(min(min(m.x,m.y),m.z)<w*.8)encre=true;}',
    '  }',
    '  if(encre)col=ENCRE*.9+.1*col;',
    ' }',
    /* les cylindres : liaisons (éclairées) et traits (arêtes, guides) */
    ' float tc=1e9;int ic=-1;vec3 nc=vec3(0.);float sc=0.;',
    ' for(int j=0;j<512;j++){if(j>=uNC)break;',
    '  int k=2*uNS+3*j;vec4 A=T(k),B=T(k+1);vec3 ba=B.xyz-A.xyz,oc=ro-A.xyz;',
    '  float baba=dot(ba,ba),bard=dot(ba,rd),baoc=dot(ba,oc);',
    '  float k2=baba-bard*bard,k1=baba*dot(oc,rd)-baoc*bard,k0=baba*dot(oc,oc)-baoc*baoc-A.w*A.w*baba;',
    '  float h=k1*k1-k2*k0;if(h<0.||k2<1e-9)continue;h=sqrt(h);float t=(-k1-h)/k2;float y=baoc+t*bard;',
    '  if(y<0.||y>baba||t>tc)continue;',
    '  int sty=int(B.w+.5);',
    '  if(sty>=2){float sp=y/sqrt(baba)*uK;bool on;',
    '   if(sty==2)on=mod(sp,16.)<9.;else if(sty==3)on=mod(sp,9.)<4.;else{float m=mod(sp,27.);on=m<14.||(m>=19.&&m<22.);}',
    '   if(!on)continue;}',
    '  float bias=(sty>=1)?3.*w:0.;',
    '  if(t>tb+bias)continue;',
    '  tc=t;ic=j;nc=(oc+t*rd-ba*y/baba)/A.w;sc=y;',
    ' }',
    ' if(ic>=0){',
    '  int k=2*uNS+3*ic;vec4 B=T(k+1),Cc=T(k+2);int sty=int(B.w+.5);vec3 cc;',
    '  if(sty==0){float dif=clamp(dot(nc,L),0.,1.),spe=pow(clamp(dot(nc,Hv),0.,1.),30.);',
    '   cc=clamp(Cc.rgb*(.4+.6*dif)+.3*spe,0.,1.);',
    '   if(abs(dot(nc,rd))<.28)cc=mix(cc,ENCRE,.55);}',
    '  else cc=Cc.rgb;',
    '  col=mix(col,cc,Cc.a);',
    ' }',
    ' o=vec4(col,1.);',
    '}'
  ].join('\n');

  function shader(type,src){
    var s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){ if(window.console) console.warn('cristaux-3d :',gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs=shader(gl.VERTEX_SHADER,VS), fs=shader(gl.FRAGMENT_SHADER,FS);
  if(!vs||!fs) return;
  var prog=gl.createProgram(); gl.attachShader(prog,vs); gl.attachShader(prog,fs); gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  var buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var lp=gl.getAttribLocation(prog,'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
  var U={}; ['uD','uNS','uNC','uClip','uR','uU','uC','uCtr','uLo','uHi','uK','uDist','uRes'].forEach(function(n){ U[n]=gl.getUniformLocation(prog,n); });
  var tex=gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.uniform1i(U.uD,0);
  document.documentElement.classList.add('avec-3d');   /* la page peut dire « fais-les tourner » */

  /* ---------- petits outils ---------- */
  function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
  function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
  function mul(a,k){return [a[0]*k,a[1]*k,a[2]*k];}
  function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
  function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function nrm(a){var l=Math.hypot(a[0],a[1],a[2]);return [a[0]/l,a[1]/l,a[2]/l];}
  function dist(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);}
  function lisse(u){u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);}
  function rgb(r,g,b){return [r/255,g/255,b/255];}
  var COUL={sommet:rgb(47,98,168),face:rgb(38,140,88),arete:rgb(132,64,170),centre:rgb(222,112,28),
            carbone:rgb(62,64,74),liaison:rgb(168,171,182)};
  var ENCRE=rgb(34,34,40), GRIS=rgb(150,150,158), GUIDE=rgb(120,120,128);
  var reduit=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* la caméra de mailles.py : az autour de l'axe vertical z, el au-dessus */
  function camera(az,el){
    var a=az*Math.PI/180, e=el*Math.PI/180;
    var c=nrm([Math.sin(a)*Math.cos(e),-Math.cos(a)*Math.cos(e),Math.sin(e)]);
    var r=nrm(cross([0,0,1],c)), u=cross(c,r);
    return {c:c,r:r,u:u};
  }

  /* ---------- les scènes ---------- */
  var COINS=[], FACES=[[.5,.5,0],[.5,.5,1],[.5,0,.5],[.5,1,.5],[0,.5,.5],[1,.5,.5]], CENTRE=[.5,.5,.5];
  for(var x=0;x<2;x++) for(var y=0;y<2;y++) for(var z=0;z<2;z++) COINS.push([x,y,z]);
  /* les douze arêtes, chacune avec les normales de ses deux faces */
  var ARETES=[];
  COINS.forEach(function(p,i){ COINS.forEach(function(q,j){
    if(j<=i) return;
    var d=sub(q,p); if(Math.abs(d[0])+Math.abs(d[1])+Math.abs(d[2])!==1) return;
    var faces=[];
    for(var k=0;k<3;k++) if(d[k]===0) { var n=[0,0,0]; n[k]=p[k]===0?-1:1; faces.push(n); }
    ARETES.push({a:p,b:q,faces:faces,style:'plein'});
  }); });
  var R_CS=0.5, R_CC=Math.sqrt(3)/4, R_CFC=Math.sqrt(2)/4, PETIT=0.085;

  function maille(type,compacte){
    var R=compacte?{cs:R_CS,cc:R_CC,cfc:R_CFC}[type]:PETIT;
    var sp=COINS.map(function(c){ return {p:c,r:R,c:COUL.sommet}; });
    if(type==='cc') sp.push({p:CENTRE,r:R,c:COUL.centre});
    if(type==='cfc') FACES.forEach(function(f){ sp.push({p:f,r:R,c:COUL.face}); });
    var tr=ARETES.slice();
    if(!compacte){
      if(type==='cc') COINS.forEach(function(a){ if(a[0]===0) tr.push({a:a,b:sub([1,1,1],a),style:'axe'}); });
      if(type==='cfc') for(var i=0;i<6;i+=2) tr.push({a:FACES[i],b:FACES[i+1],style:'guide'});
    }
    return {spheres:sp,traits:tr,clip:compacte?{lo:[0,0,0],hi:[1,1,1]}:null,cachees:!compacte,
            centre:CENTRE,rayon:0.894,az:28,el:20};
  }

  /* le diamant : réseau CFC + le même décalé d'un quart de diagonale
     (a = 3,567 Å, C–C = 1,545 Å) — les atomes à moins de 1,1 a du centre */
  function diamant(){
    var A=3.567, base=[[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]], at=[];
    for(var i=-1;i<=2;i++) for(var j=-1;j<=2;j++) for(var k=-1;k<=2;k++)
      base.forEach(function(b){ [0,.25].forEach(function(d){
        var p=mul([i+b[0]+d,j+b[1]+d,k+b[2]+d],A);
        if(dist(p,mul([.5,.5,.5],A))<=1.02*A) at.push(p);
      }); });
    return liaisons(at,1.545,{centre:mul([.5,.5,.5],A),rayon:1.12*A,az:24,el:16});
  }
  /* le graphite : feuillets d'hexagones (C–C = 1,42 Å), empilés ABA à
     3,35 Å les uns des autres — trois feuillets */
  function graphite(){
    var a=2.46, cc=1.42, at=[], a1=[a,0,0], a2=[a/2,a*Math.sqrt(3)/2,0];
    [0,1,2].forEach(function(n){
      var dec=(n%2)?[0,cc,0]:[0,0,0], z=(n-1)*3.35;
      for(var i=-6;i<=6;i++) for(var j=-6;j<=6;j++){
        [[0,0,0],[0,cc,0]].forEach(function(b){
          var p=add(add(add(mul(a1,i),mul(a2,j)),b),dec); p[2]=z;
          if(Math.hypot(p[0]-dec[0],p[1]-dec[1])<=5.3) at.push(p);
        });
      }
    });
    return liaisons(at,cc,{centre:[0,0,0],rayon:7.0,az:20,el:14,elagage:true});
  }
  function liaisons(at,d,o){
    var bonds=[], deg=at.map(function(){return 0;});
    for(var i=0;i<at.length;i++) for(var j=i+1;j<at.length;j++)
      if(Math.abs(dist(at[i],at[j])-d)<0.05){ bonds.push([i,j]); deg[i]++; deg[j]++; }
    var garde=at.map(function(p,i){ return !o.elagage || deg[i]>=2; });
    var sp=[], tr=[];
    at.forEach(function(p,i){ if(garde[i]) sp.push({p:p,r:0.3,c:COUL.carbone}); });
    bonds.forEach(function(b){ if(garde[b[0]]&&garde[b[1]]) tr.push({a:at[b[0]],b:at[b[1]],style:'liaison',r:0.1}); });
    return {spheres:sp,traits:tr,clip:null,cachees:false,centre:o.centre,rayon:o.rayon,az:o.az,el:o.el};
  }

  /* l'hexagonal compact, animé : couche A, couche B dans les creux, de
     nouveau A, puis on réduit les sphères pour voir la maille (prisme
     hexagonal, c/a = 1,633 — comme fig-maille-hexagonale.png) */
  function hexagonal(){
    var C=1.633, hexa=[];
    for(var k=0;k<6;k++){ var t=k*Math.PI/3; hexa.push([Math.cos(t),Math.sin(t),0]); }
    var haut=hexa.map(function(v){ return [v[0],v[1],C]; });
    var sp=[];
    function couche(pts,coul,debut){ pts.forEach(function(p,n){ sp.push({p0:p,p:p,r:0,c:coul,t0:debut+n*0.09}); }); }
    couche([[0,0,0]].concat(hexa),null,0.2);
    var B=[30,150,270].map(function(d){ var r=1/Math.sqrt(3), t=d*Math.PI/180; return [r*Math.cos(t),r*Math.sin(t),C/2]; });
    couche(B,COUL.centre,2.0);
    couche([[0,0,C]].concat(haut),null,3.6);
    sp.forEach(function(s){ if(!s.c) s.c=(s.p0[0]===0&&s.p0[1]===0)?COUL.face:COUL.sommet; });
    var tr=[];
    function lat(k){ var t=(k*60+30)*Math.PI/180; return [Math.cos(t),Math.sin(t),0]; }
    for(var i=0;i<6;i++){
      var j=(i+1)%6;
      tr.push({a:hexa[i],b:hexa[j],faces:[[0,0,-1],lat(i)],style:'plein',alpha:0});
      tr.push({a:haut[i],b:haut[j],faces:[[0,0,1],lat(i)],style:'plein',alpha:0});
      tr.push({a:hexa[i],b:haut[i],faces:[lat((i+5)%6),lat(i)],style:'plein',alpha:0});
    }
    var sc={spheres:sp,traits:tr,clip:null,cachees:true,centre:[0,0,C/2],rayon:2.0,az:24,el:22,duree:8.2};
    var ETAPES=['① Une couche de sphères qui se touchent : la couche A.',
                '② La couche B se pose dans les creux de la couche A.',
                '③ De nouveau une couche A, exactement au-dessus de la première : A B A B…',
                '④ On réduit les sphères pour voir leurs positions : c’est la maille hexagonale.'];
    sc.legende=ETAPES[3];
    sc.maj=function(t){
      var reduc=lisse((t-5.6)/1.6);
      sp.forEach(function(s){
        var u=lisse((t-s.t0)/0.75);
        s.r=u>0?0.5+(PETIT*1.25-0.5)*reduc:0;
        s.p=[s.p0[0],s.p0[1],s.p0[2]+3.2*(1-u)*(1-u)];
      });
      tr.forEach(function(e){ e.alpha=reduc; });
      sc.rayon=2.0-0.5*reduc;
      sc.legende=t<2.0?ETAPES[0]:t<3.6?ETAPES[1]:t<5.6?ETAPES[2]:ETAPES[3];
    };
    return sc;
  }

  var SCENES={
    'cs-eclatee':function(){return maille('cs',false);},  'cs-compacte':function(){return maille('cs',true);},
    'cc-eclatee':function(){return maille('cc',false);},  'cc-compacte':function(){return maille('cc',true);},
    'cfc-eclatee':function(){return maille('cfc',false);},'cfc-compacte':function(){return maille('cfc',true);},
    'diamant':diamant, 'graphite':graphite, 'hexagonal':hexagonal
  };

  /* ---------- le calcul d'une image ---------- */
  var DATA=new Float32Array(1024*4*4);
  function rendre(sc,az,el,cw,ch,cible){
    var cam=camera(az,el);
    var K=Math.min(cw,ch)/2/sc.rayon;
    var sp=sc.spheres, tr=[];
    sc.traits.forEach(function(e){
      var style=e.style;
      if(e.faces){
        var cache=e.faces.every(function(n){ return dot(n,cam.c)<0; });
        if(cache){ if(!sc.cachees) return; style='cache'; }
      }
      tr.push({e:e,style:style});
    });
    var n=2*sp.length+3*tr.length, rows=Math.max(1,Math.ceil(n/1024));
    if(DATA.length<rows*1024*4) DATA=new Float32Array(rows*1024*4);
    var d=DATA, o=0;
    sp.forEach(function(s){ d.set([s.p[0],s.p[1],s.p[2],s.r, s.c[0],s.c[1],s.c[2],1],o); o+=8; });
    tr.forEach(function(t){
      var e=t.e, st={liaison:0,plein:1,cache:2,guide:3,axe:4}[t.style];
      var px={plein:1.1,cache:0.8,guide:0.75,axe:0.8}[t.style]||0;
      var r=st===0?e.r:px*(cible.ss||1)/K;
      var c=st===0?COUL.liaison:st===1?ENCRE:st===4?GUIDE:GRIS;
      d.set([e.a[0],e.a[1],e.a[2],r, e.b[0],e.b[1],e.b[2],st, c[0],c[1],c[2],e.alpha==null?1:e.alpha],o); o+=12;
    });
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,1024,rows,0,gl.RGBA,gl.FLOAT,d.subarray(0,rows*1024*4));
    if(glcv.width!==cw) glcv.width=cw;
    if(glcv.height!==ch) glcv.height=ch;
    gl.viewport(0,0,cw,ch);
    gl.uniform1i(U.uNS,sp.length); gl.uniform1i(U.uNC,tr.length);
    gl.uniform1i(U.uClip,sc.clip?1:0);
    if(sc.clip){ gl.uniform3fv(U.uLo,sc.clip.lo); gl.uniform3fv(U.uHi,sc.clip.hi); }
    gl.uniform3fv(U.uR,cam.r); gl.uniform3fv(U.uU,cam.u); gl.uniform3fv(U.uC,cam.c); gl.uniform3fv(U.uCtr,sc.centre);
    gl.uniform1f(U.uK,K); gl.uniform1f(U.uDist,2.2*sc.rayon); gl.uniform2f(U.uRes,cw,ch);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }

  /* ---------- les vues ---------- */
  var GROUPES={}, aRendre=[], prevu=false;
  function demander(v){ if(aRendre.indexOf(v)<0) aRendre.push(v); if(!prevu){ prevu=true; requestAnimationFrame(tour); } }
  function tour(ts){
    prevu=false;
    var liste=aRendre; aRendre=[];
    liste.forEach(function(v){ v.dessiner(ts); });
  }

  function Vue(boite,sc,etat,opts){
    var self=this; opts=opts||{};
    this.sc=sc; this.etat=etat; this.boite=boite; this.grand=!!opts.grand;
    var cv=this.cv=document.createElement('canvas');
    cv.className='v3d-cv'; cv.tabIndex=0;
    var img=boite.querySelector('img');
    cv.setAttribute('role','img');
    cv.setAttribute('aria-label',(img&&img.alt?img.alt+' — ':'')+'modèle 3D : fais-le tourner au doigt, à la souris ou avec les flèches du clavier.');
    this.visible=false;
    this.t=sc.duree?0:null; this.t0=null; this.joue=false;
    if(sc.maj) sc.maj(sc.duree&&reduit?sc.duree:0);
    if(sc.duree&&reduit) this.t=sc.duree;
    /* tourner */
    var prec=null, bouge=false;
    cv.addEventListener('pointerdown',function(e){ prec=[e.clientX,e.clientY]; bouge=false; try{cv.setPointerCapture(e.pointerId);}catch(_){}; });
    cv.addEventListener('pointermove',function(e){
      if(!prec) return;
      var dx=e.clientX-prec[0], dy=e.clientY-prec[1]; prec=[e.clientX,e.clientY];
      var vertical=self.grand||e.pointerType!=='touch';
      self.tourner(-dx*0.6, vertical?dy*0.5:0);
      bouge=true;
    });
    function fin(){ prec=null; }
    cv.addEventListener('pointerup',fin); cv.addEventListener('pointercancel',fin);
    cv.addEventListener('keydown',function(e){
      var k=e.key;
      if(k==='ArrowLeft') self.tourner(10,0); else if(k==='ArrowRight') self.tourner(-10,0);
      else if(k==='ArrowUp') self.tourner(0,-8); else if(k==='ArrowDown') self.tourner(0,8);
      else if(k==='Home'){ etat.az=sc.az; etat.el=sc.el; etat.touche=true; tous(etat); }
      else return;
      e.preventDefault();
    });
  }
  Vue.prototype.tourner=function(daz,del){
    var e=this.etat; e.az+=daz; e.el=Math.max(-80,Math.min(85,e.el+del)); e.touche=true;
    var pastille=this.boite.querySelector('.v3d-aide'); if(pastille) pastille.classList.add('vu');
    tous(e);
  };
  function tous(etat){ etat.vues.forEach(function(v){ if(v.visible) demander(v); }); }
  Vue.prototype.taille=function(){
    var r=this.cv.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
    var w=Math.max(1,Math.round(r.width)), h=Math.max(1,Math.round(r.height));
    var ss=Math.min(2.5,Math.max(2,dpr));   /* suréchantillonnage : l'anticrénelage */
    if(this.grand) ss=Math.min(ss,2);
    var cw=Math.round(w*dpr), ch=Math.round(h*dpr);
    if(this.cv.width!==cw) this.cv.width=cw;
    if(this.cv.height!==ch) this.cv.height=ch;
    return {w:w,h:h,gw:Math.round(w*ss),gh:Math.round(h*ss),ss:ss};
  };
  Vue.prototype.dessiner=function(ts){
    var sc=this.sc, e=this.etat;
    if(sc.duree && this.joue){
      if(this.t0===null) this.t0=ts-this.t*1000;
      this.t=Math.min(sc.duree,(ts-this.t0)/1000);
      if(!e.touche) e.az=sc.az+40*lisse(this.t/sc.duree);
      if(this.t>=sc.duree){ this.joue=false; this.t0=null; } else demander(this);
    }
    if(sc.maj) sc.maj(this.t==null?0:this.t);
    var leg=this.boite.querySelector('.v3d-legende');
    if(leg && sc.legende && leg.textContent!==sc.legende) leg.textContent=sc.legende;
    var tl=this.taille();
    if(tl.w<4) return;
    rendre(sc,e.az,e.el,tl.gw,tl.gh,{ss:tl.ss});
    var c2=this.cv.getContext('2d');
    c2.imageSmoothingEnabled=true; c2.imageSmoothingQuality='high';
    c2.drawImage(glcv,0,0,tl.gw,tl.gh,0,0,this.cv.width,this.cv.height);
    /* les autres vues du groupe suivent l'animation, s'il y en a une */
    var self=this;
    if(sc.duree && this.joue) e.vues.forEach(function(v){ if(v!==self && v.visible && v.sc===sc) demander(v); });
  };
  Vue.prototype.jouer=function(){
    if(!this.sc.duree) return;
    this.t=0; this.t0=null; this.joue=true; this.etat.touche=false; demander(this);
  };

  /* ---------- la vue agrandie ---------- */
  var dlg=null, vueGrande=null;
  function agrandir(source){
    if(!dlg){
      dlg=document.createElement('dialog'); dlg.className='v3d-dlg';
      dlg.innerHTML='<div class="v3d-dlg-tete"><span class="v3d-dlg-titre"></span><button type="button" class="btn ghost v3d-fermer">✕ Fermer</button></div><div class="v3d v3d-grande"><p class="v3d-legende" aria-live="polite"></p></div>';
      document.body.appendChild(dlg);
      dlg.querySelector('.v3d-fermer').addEventListener('click',function(){ dlg.close(); });
      dlg.addEventListener('click',function(e){ if(e.target===dlg) dlg.close(); });
      dlg.addEventListener('close',function(){
        if(vueGrande){ var i=vueGrande.etat.vues.indexOf(vueGrande); if(i>=0) vueGrande.etat.vues.splice(i,1); vueGrande.cv.remove(); vueGrande=null; }
        tous(source.etat);
      });
    }
    var zone=dlg.querySelector('.v3d-grande');
    dlg.querySelector('.v3d-dlg-titre').textContent=source.boite.getAttribute('data-3d-titre')||'';
    var leg=zone.querySelector('.v3d-legende'); leg.textContent=''; leg.hidden=!source.sc.legende;
    var img=source.boite.querySelector('img');
    var faux={querySelector:function(s){ return s==='img'?img:zone.querySelector(s); }};
    var v=new Vue(faux,source.sc,source.etat,{grand:true}); v.boite=zone;
    zone.insertBefore(v.cv,leg);
    source.etat.vues.push(v); v.visible=true; vueGrande=v;
    v.t=source.t;
    dlg.showModal();
    if(source.sc.duree){ if(source.joue||source.t<source.sc.duree){ source.joue=false; v.jouer(); v.t=source.t||0; } }
    demander(v);
    v.cv.focus();
  }

  /* ---------- montage ---------- */
  var io='IntersectionObserver' in window ? new IntersectionObserver(function(es){
    es.forEach(function(en){
      var v=en.target.__vue; if(!v) return;
      v.visible=en.isIntersecting;
      if(v.visible){ demander(v); if(v.sc.duree && !v.lance && !reduit && en.intersectionRatio>=0.5){ v.lance=true; v.jouer(); } }
    });
  },{threshold:[0,0.5]}) : null;

  Array.prototype.forEach.call(vues,function(boite){
    var fab=SCENES[boite.getAttribute('data-3d')]; if(!fab) return;
    var sc=fab();
    var g=boite.getAttribute('data-3d-groupe')||('seul-'+Math.random());
    var etat=GROUPES[g]||(GROUPES[g]={az:sc.az,el:sc.el,vues:[],touche:false});
    var v=new Vue(boite,sc,etat);
    etat.vues.push(v);
    var img=boite.querySelector('img'); if(img) img.classList.add('v3d-repli');
    boite.insertBefore(v.cv,boite.firstChild);
    boite.classList.add('v3d-actif');
    var outils=document.createElement('div'); outils.className='v3d-outils';
    outils.innerHTML='<span class="v3d-aide" aria-hidden="true">↻ fais-moi tourner</span>'+
      (sc.duree?'<button type="button" class="v3d-btn v3d-rejouer" title="Rejouer l’animation">↻ Rejouer</button>':'')+
      '<button type="button" class="v3d-btn v3d-agrandir" title="Agrandir" aria-label="Agrandir le modèle 3D">⤢</button>';
    boite.appendChild(outils);
    outils.querySelector('.v3d-agrandir').addEventListener('click',function(){ agrandir(v); });
    var rj=outils.querySelector('.v3d-rejouer'); if(rj) rj.addEventListener('click',function(){ v.jouer(); });
    v.cv.__vue=v;
    if(io) io.observe(v.cv); else { v.visible=true; demander(v); }
  });
  window.addEventListener('resize',function(){ for(var g in GROUPES) tous(GROUPES[g]); });
  /* une vue montée dans une étape encore masquée a une taille nulle : on
     la redessine quand le moteur révèle une étape */
  document.addEventListener('etape-revelee',function(){ for(var g in GROUPES) tous(GROUPES[g]); });
  window.Cristaux3D={groupes:GROUPES};
})();
