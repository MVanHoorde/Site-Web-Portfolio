/* Banc d'essai du relevé et du rappel de mémoire — lot R6.
   On charge la VRAIE page dans jsdom, on extrait les VRAIES fonctions du
   moteur, et on rejoue le parcours d'un élève : relevé vide, relevé mal
   formé, relevé valide, rappel exact, rappel raté, fermeture, rechargement. */
import fs from 'fs';
import { JSDOM } from 'jsdom';

const DEPOT = '.';
const html = fs.readFileSync(DEPOT + '/pages/2nde-snt-t1-internet.html', 'utf8');
const js = fs.readFileSync(DEPOT + '/assets/js/sequence-snt.js', 'utf8');

function tranche(deb, fin) {
  const a = js.indexOf(deb), b = js.indexOf(fin, a);
  if (a < 0 || b < 0) { console.error('bloc introuvable :', deb); process.exit(1); }
  return js.slice(a, b);
}
const src = tranche('function clozeChamps(', 'function initCloze()')
          + tranche('function ipv4Ok(', 'function demarrer()');

const dom = new JSDOM(html, { runScripts: 'outside-only' });
const { document, window } = { document: dom.window.document, window: dom.window };
global.document = document; global.window = window;

const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

/* une base en mémoire, à la place de Supabase */
const store = {};
window.EtatSNT = {
  actif: () => true,
  cle: (step) => step.getAttribute('data-cle'),
  noterChamps: (k, v) => { store[k] = v.slice(); },
  champs: () => store,
};

const F = new Function('document', 'window', '$', '$$', 'EtatSNT',
  src + '\nreturn {ipv4Ok:ipv4Ok, initReleve:initReleve, clozeCle:clozeCle, clozeLire:clozeLire, clozeEcrire:clozeEcrire};');
const M = F(document, window, $, $$, window.EtatSNT);

let echecs = 0;
const ok = (nom, obtenu, attendu) => {
  const bon = String(obtenu) === String(attendu);
  if (!bon) echecs++;
  console.log(`  ${bon ? '✅' : '❌'} ${nom} — obtenu ${obtenu}, attendu ${attendu}`);
};

/* --- 0. le format, avant tout le reste --- */
console.log('Contrôle de format IPv4 :');
for (const [v, att] of [['192.168.1.226', true], ['0.0.0.0', true], ['255.255.255.255', true],
                        ['256.1.1.1', false], ['192.168.1', false], ['a.b.c.d', false],
                        ['192.168.1.226.5', false], ['', false], ['  10.0.0.1  ', true]]) {
  ok(`« ${v} »`, M.ipv4Ok(v), att);
}

/* --- 1. mise en place --- */
console.log('\nÀ l\'ouverture de la page :');
M.initReleve();
const step = $('[data-cle="t1-dns"]');
const bloc = $('[data-releve]', step);
const carteRappel = $('[data-rappel-bloc]', step);
const porte = $('.rappel-porte', step);
ok('le rappel est hors de vue', carteRappel.hidden, true);
ok('une porte le remplace', porte ? 1 : 0, 1);
ok('sa porte est ouvrable sans relevé', porte.querySelector('button').disabled, false);
ok('le relevé est saisissable', $$('[data-releve-champ]', bloc).every(c => !c.readOnly), true);

/* --- 2. validation à vide --- */
console.log('\nValidation d\'un relevé vide :');
const btn = $('[data-valider-releve]', step);
const verdict = $('[data-releve-verdict]', step);
btn.dispatchEvent(new dom.window.Event('click'));
ok('le relevé refuse', /manquante/.test(verdict.textContent), true);
ok('rien n\'est figé', btn.disabled, false);
ok('rien n\'est enregistré', Object.keys(store).length, 0);

/* --- 3. validation d'une saisie mal formée --- */
console.log('\nValidation d\'une adresse impossible :');
const champs = $$('[data-releve-champ]', bloc);
champs[0].value = '999.1.1.1';
champs[1].value = '192.168.1.226';
btn.dispatchEvent(new dom.window.Event('click'));
ok('le relevé refuse', /IPv4/.test(verdict.textContent), true);
ok('le champ fautif est signalé', champs[0].classList.contains('revoir'), true);
ok('l\'autre ne l\'est pas', champs[1].classList.contains('revoir'), false);
ok('rien n\'est enregistré', Object.keys(store).length, 0);

/* --- 4. relevé valide --- */
console.log('\nValidation d\'un relevé correct :');
champs[0].value = '194.167.30.129';
champs[1].value = '192.134.4.20';
btn.dispatchEvent(new dom.window.Event('click'));
ok('les champs passent en lecture seule', champs.every(c => c.readOnly), true);
ok('ils sont grisés', champs.every(c => c.classList.contains('releve-fige')), true);
ok('le bouton se retire', btn.disabled, true);
ok('la clé est celle attendue', Object.keys(store).join(','), 't1-dns/releve-dns');
ok('les valeurs sont enregistrées', (store['t1-dns/releve-dns'] || []).join('|'), '194.167.30.129|192.134.4.20');
ok('la fenêtre s\'ouvre', $('.focus-scene') ? 1 : 0, 1);
ok('la page se floute', document.body.classList.contains('focus-on'), true);
ok('le rappel est dans la fenêtre', $('.focus-scene [data-rappel-bloc]') ? 1 : 0, 1);
ok('et il est visible', carteRappel.hidden, false);
ok('le relevé, lui, reste hors de la fenêtre', $('.focus-scene [data-releve]') ? 1 : 0, 0);
ok('la note de la porte a changé', /c'est le but/.test(porte.textContent), true);

/* --- 5. rappel raté, puis exact --- */
console.log('\nComparaison du rappel :');
const rappels = $$('[data-rappel-champ]', carteRappel);
const comparer = $('[data-rappel-comparer]', $('.focus-scene'));
rappels[0].value = '194.167.30.129';
rappels[1].value = '192.134.4.99';
comparer.dispatchEvent(new dom.window.Event('click'));
const msg = $('[data-rappel-msg]');
ok('une exacte sur deux', /<b>1 sur 2<\/b>/.test(msg.innerHTML), true);
ok('le ton reste celui de la page', /pas faite pour être retenue/.test(msg.innerHTML), true);
ok('la juste est marquée', rappels[0].classList.contains('juste'), true);
ok('la fausse est marquée', rappels[1].classList.contains('revoir'), true);
ok('le rappel est enregistré', (store['t1-dns/cloze-1'] || []).length, 2);

rappels[1].value = '192.134.4.20';
comparer.dispatchEvent(new dom.window.Event('click'));
ok('deux sur deux', /<b>2 sur 2<\/b>/.test(msg.innerHTML), true);
ok('les deux sont marquées justes', rappels.every(r => r.classList.contains('juste')), true);

/* --- 6. fermeture : le bloc rentre chez lui --- */
console.log('\nFermeture de la fenêtre :');
$('[data-rappel-fermer]', $('.focus-scene')).dispatchEvent(new dom.window.Event('click'));
ok('la fenêtre disparaît', $('.focus-scene') ? 1 : 0, 0);
ok('le flou est levé', document.body.classList.contains('focus-on'), false);
ok('le rappel est revenu dans son étape', $('[data-cle="t1-dns"] [data-rappel-bloc]') ? 1 : 0, 1);
ok('il est de nouveau hors de vue', carteRappel.hidden, true);
ok('il est bien après son intitulé', (() => {
  const lab = $$('.block-label', step).filter(l => /De mémoire/.test(l.textContent))[0];
  let n = lab ? lab.nextElementSibling : null;
  while (n && n !== carteRappel && n.classList.contains('rappel-porte')) n = n.nextElementSibling;
  return n === carteRappel ? 1 : 0;
})(), 1);

/* --- 7. rechargement de la page : l'état revient --- */
console.log('\nRechargement de la page :');
const dom2 = new JSDOM(html, { runScripts: 'outside-only' });
global.document = dom2.window.document; global.window = dom2.window;
const $2 = (s, r) => (r || dom2.window.document).querySelector(s);
const $$2 = (s, r) => Array.prototype.slice.call((r || dom2.window.document).querySelectorAll(s));
dom2.window.EtatSNT = window.EtatSNT;
const M2 = new Function('document', 'window', '$', '$$', 'EtatSNT',
  src + '\nreturn {initReleve:initReleve, clozeCle:clozeCle, clozeEcrire:clozeEcrire};')(
  dom2.window.document, dom2.window, $2, $$2, dom2.window.EtatSNT);
M2.initReleve();
const bloc2 = $2('[data-cle="t1-dns"] [data-releve]');
M2.clozeEcrire(bloc2, store['t1-dns/releve-dns']);
ok('la fonction de reprise existe', typeof bloc2._figerReleve, 'function');
bloc2._figerReleve();
ok('le relevé est de nouveau figé', $$2('[data-releve-champ]', bloc2).every(c => c.readOnly), true);
ok('la note de la porte suit', /c'est le but/.test($2('.rappel-porte').textContent), true);

/* --- 8. le cas tranché d'avance : un rappel sans relevé --- */
console.log('\nRappel tenté sans relevé (autre poste, ou mode invité) :');
const dom3 = new JSDOM(html, { runScripts: 'outside-only' });
global.document = dom3.window.document; global.window = dom3.window;
const $3 = (s, r) => (r || dom3.window.document).querySelector(s);
const $$3 = (s, r) => Array.prototype.slice.call((r || dom3.window.document).querySelectorAll(s));
dom3.window.EtatSNT = { actif: () => true, cle: (s) => s.getAttribute('data-cle'),
                        noterChamps: () => {}, champs: () => ({}) };
new Function('document', 'window', '$', '$$', 'EtatSNT', src + '\nreturn initReleve;')(
  dom3.window.document, dom3.window, $3, $$3, dom3.window.EtatSNT)();
$3('.rappel-porte button').dispatchEvent(new dom3.window.Event('click'));
ok('la fenêtre s\'ouvre quand même', $3('.focus-scene') ? 1 : 0, 1);
$3('[data-rappel-champ]').value = '1.2.3.4';
$3('[data-rappel-comparer]').dispatchEvent(new dom3.window.Event('click'));
const msg3 = $3('[data-rappel-msg]');
ok('elle renvoie au temps 1', /refais le <b>temps 1<\/b>/.test(msg3.innerHTML), true);
ok('sans rien sanctionner', /gardée quand même/.test(msg3.innerHTML), true);
ok('aucun champ n\'est marqué faux', $$3('[data-rappel-champ]').some(r => r.classList.contains('revoir')), false);

console.log(echecs ? `\n❌ ${echecs} échec(s)` : '\n✅ relevé et rappel conformes');
process.exit(echecs ? 1 : 0);
