/* Banc d'essai du moteur de révélation conditionnelle.
   On charge la VRAIE page dans jsdom, on n'exécute que les fonctions
   bq*, et on vérifie qu'elles répondent ce qu'on attend — d'abord sur
   une étape vide, puis sur la même étape une fois remplie.
   Motif : un moteur qui ne s'ouvre jamais et un moteur toujours ouvert
   se ressemblent beaucoup dans le code, et pas du tout en classe. */
import fs from 'fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('pages/2nde-snt-t1-internet.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only' });
const { document } = dom.window;
global.document = document;

/* Les mêmes raccourcis que le moteur */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

/* On extrait les fonctions bq* du fichier plutôt que de les recopier :
   un test qui recopie le code ne teste que la copie. */
const js = fs.readFileSync('assets/js/sequence-snt.js', 'utf8');
const debut = js.indexOf('function bqRempli');
const fin   = js.indexOf('/* ---------- Révélation du « à retenir »');
if (debut < 0 || fin < 0) { console.error('bloc bq* introuvable'); process.exit(1); }
const bloc = js.slice(debut, fin);
const fabrique = new Function('$', '$$', 'document', bloc + '\nreturn {bqRempli,bqReste,bqMaj};');
const { bqReste, bqMaj } = fabrique($, $$, document);

let echecs = 0;
function verifie(nom, reel, attendu) {
  const ok = reel === attendu;
  if (!ok) echecs++;
  console.log(`  ${ok ? '✅' : '❌'} ${nom} — obtenu ${reel}, attendu ${attendu}`);
}

/* --- 1. À l'ouverture, chaque étape à bilan doit avoir du travail --- */
console.log('\nÉtapes portant un bilan, page vierge :');
const wraps = $$('[data-bilan-wrap]');
verifie('nombre d\'étapes à bilan', wraps.length, 5);   // l'étape 6.4 a rejoint le lot le 22/08/2026
wraps.forEach((w) => {
  const step = w.closest('[data-step]');
  const titre = ($('.step-title', step) || {}).textContent || '?';
  const reste = bqReste(step, w);
  console.log(`     ${reste} réponse(s) attendue(s) — ${titre.trim().slice(0, 45)}`);
  if (reste === 0) { console.log('       ❌ s\'ouvrirait immédiatement'); echecs++; }
});

/* --- 2. bqMaj masque les bilans et neutralise les boutons --- */
bqMaj();
console.log('\nAprès un passage du moteur :');
verifie('bilans masqués', $$('[data-bilan-wrap]').filter((w) => w.hidden).length, wraps.length);
verifie('boutons désactivés',
  $$('[data-reveal-bilan]').filter((b) => b.disabled).length, wraps.length);

/* --- 3. La porte d'intuition ferme bien la suite de l'étape --- */
const porte = $('[data-porte]');
verifie('une porte d\'intuition', porte ? 1 : 0, 1);
let fermes = 0;
for (let n = porte.nextElementSibling; n; n = n.nextElementSibling)
  if (n.classList.contains('porte-close')) fermes++;
console.log(`  ${fermes > 0 ? '✅' : '❌'} porte fermée — ${fermes} bloc(s) masqué(s) après la question`);
if (fermes === 0) echecs++;

/* --- 4. On répond à l'intuition : la suite doit s'ouvrir --- */
$('textarea', porte).value = 'Je pense que ça arrive par un câble.';
bqMaj();
let restants = 0;
for (let n = porte.nextElementSibling; n; n = n.nextElementSibling)
  if (n.classList.contains('porte-close')) restants++;
verifie('porte ouverte après réponse', restants, 0);

/* --- 5. On remplit TOUT dans une étape : son bilan doit s'ouvrir --- */
const cible = wraps[1].closest('[data-step]');
$$('textarea', cible).forEach((t) => { t.value = 'réponse'; });
$$('select', cible).forEach((s) => { if (s.options.length > 1) s.selectedIndex = 1; });
$$('input', cible).forEach((i) => { i.value = 'x'; });
$$('[data-focus]', cible).forEach((f) => { f.classList.add('rempli'); });
$$('.qcmbox', cible).forEach((q) => {
  const d = document.createElement('span'); d.className = 'qcm-fait'; q.appendChild(d);
});
if (cible.querySelector('[data-tri]')) cible.dataset.triScore = '4/4';
bqMaj();
verifie('reste à répondre', bqReste(cible, wraps[1]), 0);
verifie('bilan révélé', wraps[1].hidden ? 1 : 0, 0);

/* --- 6. Les trois autres bilans, eux, restent fermés --- */
verifie('bilans encore fermés', $$('[data-bilan-wrap]').filter((w) => w.hidden).length, wraps.length - 1);

console.log(echecs === 0 ? '\n✅ moteur conforme\n' : `\n❌ ${echecs} échec(s)\n`);
process.exit(echecs === 0 ? 0 : 1);
