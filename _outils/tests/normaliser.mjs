/* Banc d'essai de normaliser() — lot P du brief du 22/08/2026.
   On extrait les VRAIES fonctions du moteur (jamais une recopie : un test
   qui recopie le code ne teste que la copie), puis on rejoue la logique
   exacte du vérificateur de trous, ligne ~2617 de sequence-snt.js.

   Bug visé : normaliser("D") rend "" — la lettre D est dans la liste des
   mots vides à cause de l'élision « d' ». Le vérificateur lit alors une
   absence de réponse, et le .filter(Boolean) supprime en plus la réponse
   attendue elle-même. L'élève qui a juste est marqué faux. */
import fs from 'fs';

const DEPOT = '.';
const js = fs.readFileSync(DEPOT + '/assets/js/sequence-snt.js', 'utf8');

/* --- extraction des trois fonctions utiles --- */
function extraire(nom, finMarqueur) {
  const debut = js.indexOf('function ' + nom + '(');
  if (debut < 0) { console.error('fonction introuvable :', nom); process.exit(1); }
  const fin = js.indexOf(finMarqueur, debut);
  if (fin < 0) { console.error('fin introuvable pour :', nom); process.exit(1); }
  return js.slice(debut, fin);
}
const src = extraire('normaliser', 'function distance')
          + extraire('distance', 'function seuil')
          + extraire('seuil', "\n\n/* ---------- Défiler");

const F = new Function(src + '\nreturn {normaliser:normaliser, distance:distance, seuil:seuil};')();
const { normaliser, distance, seuil } = F;

/* --- la logique du vérificateur de trous, telle quelle --- */
function verifierTrou(saisiBrut, attenduBrut, variantes) {
  const saisi = normaliser(saisiBrut);
  if (!saisi) return 'revoir';
  const att = [attenduBrut].concat((variantes || '').split('|'))
                .map(normaliser).filter(Boolean);
  const exact = att.indexOf(saisi) >= 0;
  const proche = !exact && att.some(a => distance(saisi, a) <= seuil(a));
  return exact ? 'juste' : (proche ? 'presque' : 'revoir');
}
/* --- et celle des trous en menu déroulant, ligne ~2648 --- */
function verifierSelect(saisiBrut, attenduBrut) {
  if (!saisiBrut) return 'revoir';
  return normaliser(saisiBrut) === normaliser(attenduBrut) ? 'juste' : 'revoir';
}

/* --- les couples exigés par le brief, plus les gardes-fous --- */
const CAS = [
  // [saisie, attendu, variantes, verdict attendu, ce que le cas protège]
  ['D',            'D',    '', 'juste',   'lot P — table de routage de 5.4'],
  ['une',          'une',  '', 'juste',   'lot P — trilatération de t5'],
  ['le Web',       'web',  '', 'juste',   "l'article se retire toujours"],
  ["d'accord",     'accord', '', 'juste', "l'élision se retire toujours"],
  ['A',            'D',    '', 'revoir',  'une lettre fausse reste fausse'],
  ['de',           'D',    '', 'revoir',  'un mot vide ne vaut pas la lettre D'],
  ['d',            'D',    '', 'juste',   'la casse ne compte pas'],
  ['les datagrammes', 'datagrammes', '', 'juste', 'pluriel + article'],
  ['datagramne',   'datagramme', '', 'presque', "la tolérance d'orthographe survit"],
  ['un',           'une',  '', 'revoir',  'deux mots vides voisins restent distincts'],
  ['',             'D',    '', 'revoir',  'une case vide reste vide'],
  ['routeur',      'le routeur', '', 'juste', "l'article côté attendu aussi"],
];

let echecs = 0;
console.log('Trous à saisie libre :');
for (const [saisi, att, vars, attendu, motif] of CAS) {
  const obtenu = verifierTrou(saisi, att, vars);
  const ok = obtenu === attendu;
  if (!ok) echecs++;
  console.log(`  ${ok ? '✅' : '❌'} "${saisi}" / "${att}" — obtenu ${obtenu}, attendu ${attendu}  · ${motif}`);
}

const CAS_SELECT = [
  ['de', 'D', 'revoir', 'faux positif : « de » ne vaut pas « D »'],
  ['D',  'D', 'juste',  'la bonne option reste bonne'],
];
console.log('\nTrous en menu déroulant :');
for (const [saisi, att, attendu, motif] of CAS_SELECT) {
  const obtenu = verifierSelect(saisi, att);
  const ok = obtenu === attendu;
  if (!ok) echecs++;
  console.log(`  ${ok ? '✅' : '❌'} "${saisi}" / "${att}" — obtenu ${obtenu}, attendu ${attendu}  · ${motif}`);
}

/* --- balayage de TOUTES les réponses du dépôt : lesquelles normalisent en vide ? --- */
const pages = fs.readdirSync(DEPOT + '/pages').filter(f => f.endsWith('.html'));
const vides = [];
const toutes = new Set();
for (const p of pages) {
  const html = fs.readFileSync(DEPOT + '/pages/' + p, 'utf8');
  for (const m of html.matchAll(/data-answer="([^"]*)"/g)) {
    toutes.add(m[1]);
    if (!normaliser(m[1])) vides.push({ page: p, rep: m[1] });
  }
}
console.log(`\n${toutes.size} réponse(s) distincte(s) dans les pages.`);
if (vides.length) {
  console.log(`⚠  ${vides.length} réponse(s) normalisent en chaîne vide — donc impossibles à valider :`);
  for (const v of vides) console.log(`   · ${v.page} — data-answer="${v.rep}"`);
} else {
  console.log('✅ aucune réponse ne normalise en chaîne vide.');
}

console.log(echecs ? `\n❌ ${echecs} cas en échec` : '\n✅ normaliser() conforme');
process.exit(echecs ? 1 : 0);
