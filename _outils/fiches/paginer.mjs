// paginer.mjs — moitie « mesure » de l'outil de pagination des fiches.
// Lance par paginer.py, qui ecrit la page-sonde. Voir son en-tete pour le
// pourquoi. Ici : Chrome mesure chaque bloc, puis une programmation dynamique
// choisit les coupes.
// Le critere : on minimise la somme des carres des creux, ce qui
// repartit le vide au lieu de le concentrer sur une page.
import { spawn } from 'node:child_process';
import { setTimeout as pause } from 'node:timers/promises';

const BIN = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.argv[2];
const BUDGET = Number(process.argv[3] || 267);   // mm utiles par page
const PAGES_VOULUES = Number(process.argv[4] || 0); // 0 = libre (mais pair)
const PORT = 9421;

const chrome = spawn(BIN, ['--headless=new', `--remote-debugging-port=${PORT}`,
  '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
  '--window-size=900,1200',
  `--user-data-dir=${process.env.TEMP || '/tmp'}/chrome-paginer-fiches`,
  'about:blank'], { stdio: 'ignore' });

let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try {
    const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    wsUrl = l.find(t => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await pause(250);
}
const ws = new WebSocket(wsUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const att = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); }
});
const envoi = (m, p = {}) => { const n = ++id;
  return new Promise(r => { att.set(n, r); ws.send(JSON.stringify({ id: n, method: m, params: p })); }); };

await envoi('Page.enable');
await envoi('Emulation.setEmulatedMedia', { media: 'print' });
await envoi('Page.navigate', { url: URL });
await pause(3500);

const r = await envoi('Runtime.evaluate', { returnByValue: true, expression: `
  (() => { const MM = 96 / 25.4;
    return [...document.querySelectorAll('.sonde')].map(d => {
      // display:flow-root -> la div contient les marges de ses enfants : sa
      // hauteur est bien celle qu'occupera le bloc dans la colonne.
      const e = d.firstElementChild || d;
      const h = d.getBoundingClientRect().height;
      return { i: d.dataset.i, titre: d.dataset.titre || '',
        etq: (e.querySelector('.etq')?.textContent || e.textContent).trim().slice(0,46).replace(/\\s+/g,' '),
        h: +(h / MM).toFixed(1) };
    });
  })()` });
const tous = r.result.result.value;
ws.close(); chrome.kill();

const svc = Object.fromEntries(tous.filter(b => b.i.startsWith('s:'))
  .map(b => [b.i.slice(2), b.h]));
const B = tous.filter(b => !b.i.startsWith('s:')).map(b => ({ ...b, i: +b.i }));

console.log(`\nblocs : ${B.length} · cartouche ${svc.cartouche} mm · suite ${svc.suite} mm · cloture ${svc.cloture} mm`);
console.log(`budget par page : ${BUDGET} mm\n`);
for (const b of B) console.log(`  ${String(b.i).padStart(3)}  ${String(b.h).padStart(6)} mm  ${b.titre || b.etq}`);

const total = B.reduce((s, b) => s + b.h, 0);
console.log(`\nsomme des blocs : ${total.toFixed(1)} mm`);

// un titre de partie (h2) ou de sous-partie (« A · … ») ne finit pas une page
const orphelin = b => b.titre !== '' || /^[A-H] · /.test(b.etq);

// cout d'une page [i, j) : surcharge fixe selon la position
function hauteur(i, j, n, N) {
  let h = B.slice(i, j).reduce((s, b) => s + b.h, 0);
  if (n === 0) h += svc.cartouche;
  else if (B[i].titre === '') h += svc.suite;   // page de continuation
  if (n === N - 1) h += svc.cloture;
  return h;
}

function paginer(N) {
  const n = B.length;
  const INF = 1e12;
  // dp[k][i] = cout minimal pour placer B[i..] en k pages
  const dp = Array.from({ length: N + 1 }, () => new Float64Array(n + 1).fill(INF));
  const ch = Array.from({ length: N + 1 }, () => new Int32Array(n + 1).fill(-1));
  dp[0][n] = 0;
  for (let k = 1; k <= N; k++) {
    for (let i = n - 1; i >= 0; i--) {
      for (let j = i + 1; j <= n; j++) {
        const h = hauteur(i, j, N - k, N);
        if (h > BUDGET) break;
        // 🔴 une page ne se termine jamais sur un titre (h2 « 03 … » ou
        // sous-partie « C · … ») : il serait seul en bas, séparé de ce qu'il
        // annonce. La première découpe de T1-C2 en laissait deux.
        if (j < n && orphelin(B[j - 1])) continue;
        const reste = dp[k - 1][j];
        if (reste >= INF) continue;
        const creux = BUDGET - h;
        const c = creux * creux + reste;
        if (c < dp[k][i]) { dp[k][i] = c; ch[k][i] = j; }
      }
    }
  }
  if (dp[N][0] >= INF) return null;
  const coupes = []; let i = 0;
  for (let k = N; k >= 1; k--) { const j = ch[k][i]; if (k > 1) coupes.push(j); i = j; }
  return { coupes, cout: dp[N][0] };
}

const candidats = PAGES_VOULUES ? [PAGES_VOULUES] : [10, 11, 12, 13, 14];
for (const N of candidats) {
  const res = paginer(N);
  if (!res) { console.log(`\n${N} pages : impossible dans ce budget`); continue; }
  const bornes = [0, ...res.coupes, B.length];
  const hs = [];
  for (let n = 0; n < N; n++) hs.push(hauteur(bornes[n], bornes[n + 1], n, N));
  const creux = hs.map(h => BUDGET - h);
  console.log(`\n${N} pages  COUPES = [${res.coupes.join(', ')}]`);
  console.log(`   hauteurs : ${hs.map(h => h.toFixed(0)).join(' · ')}`);
  console.log(`   creux    : ${creux.map(c => c.toFixed(0)).join(' · ')}  (cumulé ${creux.reduce((a, b) => a + b, 0).toFixed(0)} mm, max ${Math.max(...creux).toFixed(0)} mm)`);
}
