/* ============================================================
 *  generer-json.mjs — les corrigés collectifs d'ES vers le site
 *  ------------------------------------------------------------
 *  Lit les sources _corriges-es/<séquence>.json (hors Git : elles
 *  portent aussi les remarques, motifs et notes d'audit) et écrit,
 *  pour chaque chapitre, assets/data/corriges/<séquence>.json :
 *  un objet { code: texte } que lisent la page élève et l'écran
 *  prof/corriges.html.
 *
 *  Depuis le 15/11/2026 (bdd/schema/045), les TEXTES sont sur le
 *  site — publics, choix de Loïc : « c'est pour réviser, ce n'est
 *  pas évalué ». La base ne garde que ce qui est ouvert à quelle
 *  classe. Retoucher un corrigé = modifier la source, relancer ce
 *  script, publier. Plus rien à coller dans Supabase.
 *
 *  Ne part sur le site que ce qui est « retenu » (règle de Loïc du
 *  14/11/2026) : les exercices qui se résolvent avec le cours ou un
 *  petit calcul — ni prise de notes, ni réflexion personnelle, ni
 *  question d'avis. Le TP son attend son tour (retenu: false).
 *
 *      node _outils/corriges/generer-json.mjs
 *
 *  Contrôles bloquants : code connu d'une page, pas de « √ » nu, pas
 *  de fraction en barre oblique hors unités évidentes, balises de la
 *  liste autorisée seulement.
 * ============================================================ */
import fs from 'fs';
import path from 'path';

const DOSSIER = '_corriges-es';
const SORTIE = path.join('assets', 'data', 'corriges');
const PAGES = {
  'es1-t1-c1': 'pages/1re-es-t1-c1-nucleosynthese.html',
  'es1-t1-c2': 'pages/1re-es-t1-c2-radioactivite.html',
  'es1-t1-c3': 'pages/1re-es-t1-c3-cristaux.html',
  'es1-t2-c1': 'pages/1re-es-t2-c1-son-et-musique.html',
  'es1-t2-c2': 'pages/1re-es-t2-c2-son-a-coder.html',
  'es1-t3-c1': 'pages/1re-es-t3-c1-forme-terre.html',
  'est-t2-c1': 'pages/term-es-t2-c1-deux-siecles-energie-electrique.html',
  'est-t2-c2': 'pages/term-es-t2-c2-production-stockage-electricite.html',
};

const parSeq = {}, erreurs = [];
for (const [seq, page] of Object.entries(PAGES)) {
  const f = path.join(DOSSIER, seq + '.json');
  if (!fs.existsSync(f)) continue;
  const html = fs.readFileSync(page, 'utf8');
  const sortie = {};
  for (const i of JSON.parse(fs.readFileSync(f, 'utf8'))) {
    if (!i.retenu) continue;
    const t = String(i.corrige || '').trim();
    if (!html.includes('data-focus-code="' + i.code + '"')) erreurs.push(i.code + ' : absent de ' + page);
    if (/√/.test(t)) erreurs.push(i.code + ' : « √ » nu — écrire {{rac:…}} ou <span class="rac">…</span>');
    const sansBalises = t.replace(/<\/?(b|i|sub|sup)>|<br\s*\/?>|<span class="rac">|<\/span>/g, '');
    if (/<[a-z\/]/i.test(sansBalises)) erreurs.push(i.code + ' : balise non autorisée');
    const barres = (sansBalises.replace(/\{\{[^}]*\}\}/g, '').match(/\S*\d\s*\/\s*\d\S*/g) || []);
    if (barres.length) erreurs.push(i.code + ' : fraction en barre oblique ? ' + barres.join(' '));
    if (t.length < 3) erreurs.push(i.code + ' : texte vide');
    if (sortie[i.code]) erreurs.push(i.code + ' : en double');
    sortie[i.code] = t;
  }
  if (Object.keys(sortie).length) parSeq[seq] = sortie;
}
if (erreurs.length) { console.error('✗ ' + erreurs.length + ' problème(s) :\n  ' + erreurs.join('\n  ')); process.exit(1); }

fs.mkdirSync(SORTIE, { recursive: true });
let total = 0;
for (const [seq, sortie] of Object.entries(parSeq)) {
  fs.writeFileSync(path.join(SORTIE, seq + '.json'), JSON.stringify(sortie, null, 1) + '\n', 'utf8');
  total += Object.keys(sortie).length;
  console.log('  ' + seq + '  ' + Object.keys(sortie).length + ' corrigé(s)');
}
console.log('✓ ' + SORTIE + ' — ' + total + ' corrigés');
