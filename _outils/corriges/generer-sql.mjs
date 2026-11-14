/* ============================================================
 *  generer-sql.mjs — les corrigés collectifs d'ES vers la base
 *  ------------------------------------------------------------
 *  Lit _corriges-es/*.json (HORS GIT : le dépôt est public et un
 *  corrigé non activé ne doit pas être lisible) et écrit
 *  _corriges-es/corriges-es.sql, à coller dans Supabase (SQL Editor)
 *  APRÈS bdd/schema/044-corriges-collectifs.sql.
 *
 *  Ne part en base que ce qui est « retenu » (règle de Loïc du
 *  14/11/2026) : les exercices qui se résolvent avec le cours ou un
 *  petit calcul — ni prise de notes, ni réflexion personnelle, ni
 *  question d'avis. Le TP son attend son tour (retenu: false).
 *
 *  Rejouable : un code déjà en base est remplacé par le texte du
 *  JSON. ⚠ Une retouche faite depuis prof/corriges.html serait donc
 *  ÉCRASÉE : `--nouveaux` n'insère que les codes absents.
 *
 *      node _outils/corriges/generer-sql.mjs            (tout, remplace)
 *      node _outils/corriges/generer-sql.mjs --nouveaux (ajoute seulement)
 *
 *  Contrôles bloquants : code connu d'une page, pas de « √ » nu, pas
 *  de fraction en barre oblique hors unités évidentes, balises de la
 *  liste autorisée seulement.
 * ============================================================ */
import fs from 'fs';
import path from 'path';

const DOSSIER = '_corriges-es';
const SORTIE = path.join(DOSSIER, 'corriges-es.sql');
const NOUVEAUX = process.argv.includes('--nouveaux');
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

const lignes = [], erreurs = [];
for (const [seq, page] of Object.entries(PAGES)) {
  const f = path.join(DOSSIER, seq + '.json');
  if (!fs.existsSync(f)) continue;
  const html = fs.readFileSync(page, 'utf8');
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
    lignes.push({ code: i.code, sequence: seq, texte: t });
  }
}
if (erreurs.length) { console.error('✗ ' + erreurs.length + ' problème(s) :\n  ' + erreurs.join('\n  ')); process.exit(1); }

const q = s => "'" + s.replace(/'/g, "''") + "'";
const sql = [
  '-- Corrigés collectifs d\'ES — généré par _outils/corriges/generer-sql.mjs le ' + new Date().toISOString().slice(0, 16).replace('T', ' '),
  '-- HORS GIT. À coller dans Supabase (SQL Editor) après bdd/schema/044. ' + lignes.length + ' corrigés.',
  '-- ' + (NOUVEAUX ? 'Mode --nouveaux : les codes déjà en base ne sont pas touchés.' : '⚠ Remplace le texte des codes déjà en base (retouches faites dans prof/corriges.html comprises).'),
  'insert into public.corriges (code, sequence, texte) values',
  lignes.map(l => '  (' + q(l.code) + ', ' + q(l.sequence) + ', ' + q(l.texte) + ')').join(',\n'),
  NOUVEAUX ? 'on conflict (code) do nothing;'
           : 'on conflict (code) do update set sequence = excluded.sequence, texte = excluded.texte;',
  '',
  'select sequence, count(*) from public.corriges group by sequence order by sequence;',
  '',
].join('\n');
fs.writeFileSync(SORTIE, sql, 'utf8');
const parSeq = {}; lignes.forEach(l => { parSeq[l.sequence] = (parSeq[l.sequence] || 0) + 1; });
console.log('✓ ' + SORTIE + ' — ' + lignes.length + ' corrigés', parSeq);
