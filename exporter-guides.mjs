/* ============================================================
 *  exporter-guides.mjs — les deux guides du tableau de bord en PDF
 *  ------------------------------------------------------------
 *  Les guides vivent en HTML dans prof/ : c'est la source, et
 *  c'est elle que le bouton « Aide » ouvre. Le PDF n'existe que
 *  pour la pièce jointe d'un courriel à un collègue. Jamais
 *  l'inverse : on ne retouche pas un PDF.
 *
 *  USAGE
 *    node exporter-guides.mjs                 les deux
 *    node exporter-guides.mjs prise-en-main   seulement celui-là
 *
 *  Sort en code 1 si un contrôle échoue.
 *
 *  🔴 POURQUOI CE FICHIER DUPLIQUE LE PILOTAGE DE CHROME
 *  Les soixante lignes de CDP ci-dessous existent déjà dans
 *  exporter-fiches.mjs. Les factoriser demanderait de toucher
 *  cette chaîne-là, qui produit les quatorze fiches élèves et qui
 *  est éprouvée. Le faire à la rentrée, pour une économie de
 *  soixante lignes, serait un mauvais échange. À reprendre quand
 *  un troisième exporteur apparaîtra — pas avant.
 *
 *  DIFFÉRENCE AVEC exporter-fiches.mjs : une fiche est une suite
 *  de feuilles A4 fixes, et le contrôle vérifie « une .feuille =
 *  une page ». Un guide est un texte qui coule : son nombre de
 *  pages dépend du contenu et n'a pas à être prédit. On contrôle
 *  donc le format, l'incorporation des polices et le fait qu'il
 *  y ait quelque chose — pas la pagination.
 * ============================================================ */

import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DOSSIER = 'assets/pdf/prof';

const GUIDES = [
  { cle: 'prise-en-main', html: 'prof/guide-prise-en-main.html', pdf: 'guide-prise-en-main.pdf' },
  { cle: 'dispositif',    html: 'prof/guide-dispositif.html',    pdf: 'guide-dispositif.pdf'    },
];

/* A4 en points PostScript, tel que Chrome le produit quand il
 * respecte le @page size:A4 du guide. Sans preferCSSPageSize, il
 * sort du Letter sans le dire. */
const A4 = { l: 595.276, h: 841.89, tol: 1 };

/* Nos six familles auto-hébergées. Une police hors liste veut
 * dire qu'un caractère est servi par un repli système. */
const NOTRES = ['EBGaramond', 'IBMPlexMono', 'IBMPlexSans', 'Inter', 'SpaceGrotesk', 'Spectral'];

const CHROMES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

function trouverChrome() {
  const trouve = CHROMES.find(existsSync);
  if (!trouve) {
    console.error('Chrome introuvable. Chemins essayés :\n  ' + CHROMES.join('\n  '));
    process.exit(1);
  }
  return trouve;
}

async function ouvrirChrome(chemin, port) {
  const proc = spawn(chemin, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--disable-extensions', '--hide-scrollbars',
    '--remote-debugging-port=' + port, 'about:blank',
  ], { stdio: 'ignore' });
  for (let essai = 0; essai < 60; essai++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const rep = await fetch('http://127.0.0.1:' + port + '/json/version');
      if (rep.ok) return proc;
    } catch { /* pas encore prêt */ }
  }
  proc.kill();
  throw new Error('Chrome ne répond pas sur le port ' + port);
}

function connecter(url) {
  return new Promise((ok, non) => {
    const ws = new WebSocket(url);
    ws.onopen = () => ok(ws);
    ws.onerror = (e) => non(new Error('WebSocket : ' + (e.message || 'échec')));
  });
}

function creerAppel(ws) {
  let id = 0;
  const attentes = new Map();
  const evenements = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && attentes.has(msg.id)) {
      const { ok, non } = attentes.get(msg.id);
      attentes.delete(msg.id);
      msg.error ? non(new Error(msg.error.message)) : ok(msg.result);
    } else if (msg.method && evenements.has(msg.method)) {
      evenements.get(msg.method)();
      evenements.delete(msg.method);
    }
  };
  const appel = (method, params = {}) => new Promise((ok, non) => {
    attentes.set(++id, { ok, non });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const attendre = (method) => new Promise((ok) => evenements.set(method, ok));
  return { appel, attendre };
}

/* Les métadonnées dont on a besoin sont en clair dans le PDF :
 * aucune dépendance à installer. */
function auditerPdf(chemin) {
  const brut = readFileSync(chemin).toString('latin1');
  const boites = [...brut.matchAll(/\/MediaBox\s*\[([^\]]*)\]/g)]
    .map((m) => m[1].trim().split(/\s+/).map(Number));
  const pages = Math.max(0, ...[...brut.matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1])));
  const polices = [...new Set([...brut.matchAll(/\/BaseFont\s*\/([A-Za-z0-9+-]+)/g)]
    .map((m) => m[1].replace(/^[A-Z]{6}\+/, '')))];
  const incorporees = [...brut.matchAll(/\/FontFile\d?/g)].length;
  return { boites, pages, polices, incorporees };
}

function mm(pt) { return (pt * 25.4) / 72; }

async function main() {
  const filtre = process.argv.slice(2);
  const liste = filtre.length ? GUIDES.filter((g) => filtre.includes(g.cle)) : GUIDES;
  if (!liste.length) {
    console.error('Aucun guide ne correspond à : ' + filtre.join(' ')
      + '\nClés connues : ' + GUIDES.map((g) => g.cle).join(', '));
    process.exit(1);
  }

  mkdirSync(DOSSIER, { recursive: true });
  const proc = await ouvrirChrome(trouverChrome(), 9334);
  let problemes = 0;
  const replis = [];

  try {
    for (const guide of liste) {
      if (!existsSync(guide.html)) {
        console.log('  ✗ ' + guide.cle + ' — source absente : ' + guide.html);
        problemes++;
        continue;
      }
      const rep = await fetch('http://127.0.0.1:9334/json/new?about:blank', { method: 'PUT' });
      const onglet = await rep.json();
      const ws = await connecter(onglet.webSocketDebuggerUrl);
      const { appel, attendre } = creerAppel(ws);

      await appel('Page.enable');
      const charge = attendre('Page.loadEventFired');
      await appel('Page.navigate', { url: pathToFileURL(resolve(guide.html)).href });
      await charge;
      /* Sans cette attente, l'export part avec les métriques de la
       * police de repli : la mise en page du PDF ne serait pas
       * celle de l'écran. */
      await appel('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });

      const { data } = await appel('Page.printToPDF', {
        printBackground: true,
        preferCSSPageSize: true,
        marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
      });
      const sortie = DOSSIER + '/' + guide.pdf;
      writeFileSync(sortie, Buffer.from(data, 'base64'));
      ws.close();
      await fetch('http://127.0.0.1:9334/json/close/' + onglet.id);

      /* --- les contrôles --- */
      const a = auditerPdf(sortie);
      const ecarts = [];
      const b = a.boites[0];
      if (!b || Math.abs(b[2] - A4.l) > A4.tol || Math.abs(b[3] - A4.h) > A4.tol) {
        ecarts.push('format ' + (b ? mm(b[2]).toFixed(1) + '×' + mm(b[3]).toFixed(1) + ' mm' : 'illisible')
          + ' au lieu de 209,9×297,0 mm');
      } else if (a.boites.some((x) => Math.abs(x[2] - b[2]) > A4.tol || Math.abs(x[3] - b[3]) > A4.tol)) {
        ecarts.push('toutes les pages ne font pas la même taille');
      }
      if (!a.pages) ecarts.push('aucune page');
      if (!a.incorporees) ecarts.push('aucune police incorporée');

      const etrangeres = a.polices.filter((p) => !NOTRES.some((n) => p.startsWith(n)));
      if (etrangeres.length) replis.push(guide.pdf + ' → ' + etrangeres.join(', '));

      const taille = (readFileSync(sortie).length / 1024).toFixed(0);
      if (ecarts.length) {
        problemes++;
        console.log('  ✗ ' + guide.pdf + '  (' + taille + ' Ko)');
        for (const e of ecarts) console.log('      · ' + e);
      } else {
        console.log('  ✓ ' + guide.pdf + '  ' + a.pages + ' page(s) · '
          + mm(b[2]).toFixed(1) + '×' + mm(b[3]).toFixed(1) + ' mm · '
          + a.incorporees + ' police(s) incorporée(s) · ' + taille + ' Ko');
      }
    }
  } finally {
    proc.kill();
  }

  console.log('');
  if (replis.length) {
    console.log('ℹ  Caractères servis par une police système (repli) — à corriger dans le HTML :');
    for (const r of replis) console.log('   · ' + r);
    console.log('');
  }
  if (problemes) {
    console.log('❌ ' + problemes + ' guide(s) en écart — ne pas envoyer ces PDF.');
    process.exit(1);
  }
  console.log('✔ ' + liste.length + ' guide(s) exporté(s) dans ' + DOSSIER + '/');
}

main().catch((e) => { console.error(e); process.exit(1); });
