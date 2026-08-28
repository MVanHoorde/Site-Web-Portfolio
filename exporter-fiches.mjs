/* ============================================================
 *  exporter-fiches.mjs — les fiches de 2nde PC en PDF
 *  ------------------------------------------------------------
 *  Le HTML est la source, le PDF est un export. Jamais l'inverse.
 *  Ce script régénère assets/pdf/pc/fiches/*.pdf depuis fiches/*.html
 *  et contrôle chaque export À LA MESURE, pas à l'œil.
 *
 *  POURQUOI UN SCRIPT PLUTÔT QUE « Ctrl+P → Enregistrer en PDF »
 *  L'impression manuelle du navigateur donne du Letter (612×792 pt)
 *  au lieu de l'A4, oublie les arrière-plans une fois sur deux, et
 *  ne dit rien du nombre de pages ni des polices réellement
 *  incorporées. Trois écarts invisibles à l'écran, tous visibles
 *  sur la photocopie distribuée en classe.
 *
 *  CE QUE LE SCRIPT CONTRÔLE, ET REFUSE
 *    · format : la page fait 595,3 × 841,9 pt, soit 209,9 × 297,0 mm.
 *      Tout écart signale une mise à l'échelle (Chrome a ignoré
 *      le @page size:A4 de la fiche).
 *    · pagination : une .feuille dans la source, une page dans le
 *      PDF. Une page de plus, c'est du contenu qui a débordé de sa
 *      feuille. Pour les outils, la consigne plafonne en plus à deux
 *      pages, quatre pour o3 (CONSIGNES-outil-PC.md §7).
 *    · polices : les six familles du dépôt sont auto-hébergées,
 *      elles doivent se retrouver INCORPORÉES dans le PDF. Une
 *      police système dans la liste (Consolas, Segoe UI…) veut dire
 *      qu'un caractère n'est couvert par aucune de nos polices et
 *      s'affiche par repli : c'est le piège qui a coûté le fleuron
 *      U+2766 des encarts d'histoire.
 *
 *  USAGE
 *    node exporter-fiches.mjs            toutes les fiches
 *    node exporter-fiches.mjs t1c2 o1    seulement celles-là
 *
 *  Sort en code 1 si un contrôle échoue : rien n'est déposé à
 *  l'aveugle, et le lien de la page ne doit pas basculer.
 * ============================================================ */

import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/* ---- Le parc de fiches -------------------------------------
 * On ne tient pas de liste : le parc grandit vite, et une liste
 * tenue à la main dérive (même motif que generer-questions.mjs).
 * Toute fiche de 2nde PC qui apparaît dans fiches/ est exportée,
 * sans rien avoir à déclarer ici. Les fiches de CFA (fiches/cfa/)
 * restent dehors : la décision du 28/08 ne vaut que pour la 2nde PC.
 *
 * On ne fige pas non plus le nombre de pages : la source le dit
 * déjà, une .feuille valant une page A4. Le contrôle devient
 * « une feuille dedans, une page dehors », qui attrape le
 * débordement d'un paragraphe ajouté sans y penser.
 * Les outils ont en plus un plafond de consigne : deux pages
 * (CONSIGNES-outil-PC.md §7), sauf exception déclarée ici. */
const MAXI_OUTIL = 2;
const EXCEPTIONS = { o3: 4 };   // o3 : la planche des neuf pictogrammes de danger

function parc() {
  return readdirSync('fiches')
    .filter((n) => /^fiche-2nde-.+\.html$/.test(n))
    .sort()
    .map((n) => {
      const base = n.replace(/\.html$/, '');
      const cle = base.replace(/^fiche-2nde-/, '').replace(/-.*$/, '');
      const outil = /^o\d+$/.test(cle);
      return {
        cle, html: 'fiches/' + n, pdf: base + '.pdf',
        famille: outil ? 'outil' : 'chapitre',
        maxi: outil ? (EXCEPTIONS[cle] || MAXI_OUTIL) : null,
      };
    });
}

const DOSSIER = 'assets/pdf/pc/fiches';

/* A4 en points PostScript, tel que Chrome le produit quand il
 * respecte le @page size:A4 de la fiche. */
const A4 = { l: 595.276, h: 841.89, tol: 1 };

/* Les six familles auto-hébergées (assets/css/fonts.css). Tout
 * autre nom dans le PDF est une police système, donc un repli. */
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

/* ---- Pilotage de Chrome par CDP ----------------------------
 * On passe par le protocole plutôt que par --print-to-pdf : seul
 * printToPDF expose preferCSSPageSize, qui fait respecter le
 * @page size:A4 de la fiche. En ligne de commande, Chrome force
 * du Letter sans le dire. */
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

/* ---- Lecture du PDF produit --------------------------------
 * Pas de dépendance : les métadonnées dont on a besoin sont en
 * clair dans le fichier. */
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
  const FICHES = parc();
  const liste = filtre.length ? FICHES.filter((f) => filtre.includes(f.cle)) : FICHES;
  if (!liste.length) {
    console.error('Aucune fiche ne correspond à : ' + filtre.join(' '));
    process.exit(1);
  }

  mkdirSync(DOSSIER, { recursive: true });
  const chrome = trouverChrome();
  const port = 9333;
  const proc = await ouvrirChrome(chrome, port);
  let problemes = 0;
  const replis = [];

  try {
    for (const fiche of liste) {
      if (!existsSync(fiche.html)) {
        console.log('  ✗ ' + fiche.cle + ' — source absente : ' + fiche.html);
        problemes++;
        continue;
      }
      const rep = await fetch('http://127.0.0.1:' + port + '/json/new?about:blank', { method: 'PUT' });
      const onglet = await rep.json();
      const ws = await connecter(onglet.webSocketDebuggerUrl);
      const { appel, attendre } = creerAppel(ws);

      await appel('Page.enable');
      const charge = attendre('Page.loadEventFired');
      await appel('Page.navigate', { url: pathToFileURL(resolve(fiche.html)).href });
      await charge;
      /* les polices sont chargées en @font-face : sans cette attente,
       * l'export part avec les métriques de la police de repli. */
      await appel('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });

      const { data } = await appel('Page.printToPDF', {
        printBackground: true,
        preferCSSPageSize: true,
        marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
      });
      const sortie = DOSSIER + '/' + fiche.pdf;
      writeFileSync(sortie, Buffer.from(data, 'base64'));
      ws.close();
      await fetch('http://127.0.0.1:' + port + '/json/close/' + onglet.id);

      /* --- les contrôles --- */
      const a = auditerPdf(sortie);
      const ecarts = [];
      const b = a.boites[0];
      if (!b || Math.abs(b[2] - A4.l) > A4.tol || Math.abs(b[3] - A4.h) > A4.tol) {
        ecarts.push('format ' + (b ? mm(b[2]).toFixed(1) + '×' + mm(b[3]).toFixed(1) + ' mm' : 'illisible')
          + ' au lieu de 209,9×297,0 mm');
      }
      if (a.boites.some((x) => Math.abs(x[2] - b[2]) > A4.tol || Math.abs(x[3] - b[3]) > A4.tol)) {
        ecarts.push('toutes les pages ne font pas la même taille');
      }
      const feuilles = (readFileSync(fiche.html, 'utf8').match(/class="feuille"/g) || []).length;
      if (a.pages !== feuilles) {
        ecarts.push(a.pages + ' page(s) pour ' + feuilles + ' feuille(s) dans la source'
          + (a.pages > feuilles ? ' — du contenu déborde de sa feuille' : ''));
      }
      if (fiche.maxi && feuilles > fiche.maxi) {
        ecarts.push(feuilles + ' feuilles alors que la consigne en prévoit ' + fiche.maxi);
      }
      if (!a.incorporees) ecarts.push('aucune police incorporée');

      /* Le repli ne bloque pas l'export — le PDF reste juste, la fiche
       * imprimée aussi. Mais il dit qu'un caractère n'est couvert par
       * aucune de nos six familles : à corriger dans le HTML source. */
      const etrangeres = a.polices.filter((p) => !NOTRES.some((n) => p.startsWith(n)));
      if (etrangeres.length) replis.push(fiche.pdf + ' → ' + etrangeres.join(', '));

      const taille = (readFileSync(sortie).length / 1024).toFixed(0);
      if (ecarts.length) {
        problemes++;
        console.log('  ✗ ' + fiche.pdf + '  (' + taille + ' Ko)');
        for (const e of ecarts) console.log('      · ' + e);
      } else {
        console.log('  ✓ ' + fiche.pdf + '  ' + a.pages + ' page(s) · '
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
    console.log('❌ ' + problemes + ' fiche(s) en écart — ne pas faire basculer les liens vers ces PDF.');
    process.exit(1);
  }
  console.log('✔ ' + liste.length + ' fiche(s) exportée(s) dans ' + DOSSIER + '/');
}

main().catch((e) => { console.error(e); process.exit(1); });
