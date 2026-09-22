// extraire_figures.mjs — sort en PNG les figures SVG d'une page de cours.
//
// POURQUOI — le diaporama doit reprendre les figures du SITE, dans leur
// version la plus récente (règle R5). Sur T3-C1, neuf figures avaient été
// prises en version ancienne et une avait même été redessinée dans
// PowerPoint alors que celle du site était meilleure. Ici, la seule source
// est la page de cours, et l'extraction se rejoue à chaque génération.
//
// Les SVG sont rendus par Chrome (cairosvg exige la DLL cairo, absente des
// postes Windows), à 3× pour rester nets une fois projetés.
//
// USAGE
//   node extraire_figures.mjs <page.html> <dossier-sortie> [echelle]
//
// Les SVG de CORRECTION ne doivent pas être extraits (règle R1 : aucune
// correction à l'écran). Ils sont écartés ici par leur clé : tout
// aria-labelledby contenant « c-t » ou finissant par « corr ».

import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL, } from 'node:url';
import { dirname, resolve } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';

const BIN = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const [PAGE, SORTIE, ECH] = process.argv.slice(2);
const echelle = Number(ECH || 3);
const PORT = 9451;

if (!PAGE || !SORTIE) {
  console.error('usage : node extraire_figures.mjs <page.html> <sortie> [echelle]');
  process.exit(1);
}
mkdirSync(SORTIE, { recursive: true });

const src = readFileSync(resolve(PAGE), 'utf8');
const figures = [];
const re = /<svg viewBox="([^"]*)"[^>]*aria-labelledby="([^" ]+)[^"]*"[\s\S]*?<\/svg>/g;
for (const m of src.matchAll(re)) {
  const cle = m[2].replace(/-t$/, '');
  if (/c-t$|corr/.test(m[2])) { console.log(`  écarté (correction) : ${cle}`); continue; }
  figures.push({ cle, viewBox: m[1], svg: m[0] });
}
console.log(`${figures.length} figure(s) dans ${PAGE}`);

// une page de rendu : chaque SVG isolé, fond transparent, taille naturelle.
// 🔴 fonts.css est OBLIGATOIRE : sans lui les textes des SVG tombent en
// Times New Roman et la figure projetée ne ressemble plus à celle du site.
const racine = resolve(dirname(resolve(PAGE)), '..');

// 🔴 Une figure composite (photo + schéma, T1-C1 Images 2 et 3) embarque sa
// photo par un <image href="../assets/…"> RELATIF À LA PAGE. La page de rendu
// est écrite dans le dossier de sortie : le chemin n'y pointait plus sur rien,
// et Chrome dessinait son icône d'image cassée à la place de la photo. On le
// rend absolu avant le rendu. Les ancres internes (<use href="#…">) et les
// URL déjà absolues ne sont pas touchées.
const dossierPage = dirname(resolve(PAGE));
const absolu = svg => svg.replace(/(\shref=")(?!#|data:|https?:|file:)([^"]+)"/g,
  (_, debut, rel) => `${debut}${pathToFileURL(resolve(dossierPage, rel)).href}"`);
const fonts = pathToFileURL(resolve(racine, 'assets/css/fonts.css')).href;
const rendu = `${SORTIE}/_rendu.html`;
writeFileSync(rendu, `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link rel="stylesheet" href="${fonts}">
<style>html,body{margin:0;background:transparent}
 .f{display:block;margin:0}
 .f svg{display:block}</style></head><body>
${figures.map(f => {
  const [, , w, h] = f.viewBox.trim().split(/\s+/).map(Number);
  return `<div class="f" id="f-${f.cle}" style="width:${w * echelle}px;height:${h * echelle}px">`
    + absolu(f.svg).replace('<svg ', `<svg width="${w * echelle}" height="${h * echelle}" `)
    + '</div>';
}).join('\n')}
</body></html>`);

const chrome = spawn(BIN, ['--headless=new', `--remote-debugging-port=${PORT}`,
  '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
  '--window-size=2400,2000',
  `--user-data-dir=${process.env.TEMP || '/tmp'}/chrome-figs-${process.pid}`,
  'about:blank'], { stdio: 'ignore' });

let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try {
    const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    wsUrl = l.find(t => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await pause(250);
}
if (!wsUrl) { console.error('Chrome ne repond pas sur le port ' + PORT); process.exit(1); }
const ws = new WebSocket(wsUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const att = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data);
  if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); } });
const envoi = (m, p = {}) => { const n = ++id;
  return new Promise(r => { att.set(n, r); ws.send(JSON.stringify({ id: n, method: m, params: p })); }); };

await envoi('Page.enable');
await envoi('Emulation.setDefaultBackgroundColorOverride',
            { color: { r: 0, g: 0, b: 0, a: 0 } });
await envoi('Page.navigate', { url: 'file:///' + resolve(rendu).replace(/\\/g, '/').replace(/ /g, '%20') });
await pause(2500);

for (const f of figures) {
  const b = await envoi('Runtime.evaluate', { returnByValue: true, expression:
    `(() => { const e = document.getElementById('f-${f.cle}'); if (!e) return null;
       const r = e.getBoundingClientRect();
       return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; })()` });
  const clip = b.result?.result?.value;
  if (!clip) { console.log(`  ✗ ${f.cle} : introuvable`); continue; }
  const s = await envoi('Page.captureScreenshot',
    { format: 'png', clip: { ...clip, scale: 1 }, captureBeyondViewport: true });
  if (!s.result?.data) { console.log(`  ✗ ${f.cle} : capture vide`); continue; }
  writeFileSync(`${SORTIE}/site-${f.cle}.png`, Buffer.from(s.result.data, 'base64'));
  console.log(`  ✓ site-${f.cle}.png  ${Math.round(clip.width)}×${Math.round(clip.height)}`);
}

ws.close(); chrome.kill();
