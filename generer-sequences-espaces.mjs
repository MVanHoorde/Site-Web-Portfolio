/* ============================================================
 *  generer-sequences-espaces.mjs — le sommaire des espaces hors SNT
 *  ------------------------------------------------------------
 *  Lit les pages des outils de PC, de l'ES de 1re et de terminale et
 *  du livret CFA, et écrit assets/js/sequences-espaces.js.
 *
 *  À QUOI ÇA SERT
 *  Le tableau de bord, dans les espaces ES, PC et CFA, doit nommer
 *  les outils, les chapitres et leurs séances — comme seances-snt.js
 *  le fait pour le SNT. Même principe : la page est la source, ce
 *  script la recopie, une liste tenue à la main dériverait.
 *
 *  POURQUOI UN FICHIER À PART DE seances-snt.js
 *  seances-snt.js ne nomme pas seulement : verrou-snt.js tire l'ORDRE
 *  du plafond d'avance de ses clés. Y ajouter les outils de PC ou les
 *  chapitres d'ES les ferait entrer dans la file des séances SNT.
 *
 *  LES CLÉS
 *  Elles suivent la convention de famille du 018 (`famille_de_cle()`) :
 *  pc-oN, pc-tN-cN, es1-tN-cN, est-tN-cN, cfa-oNN. Chaque page porte la
 *  sienne (data-sequence, ou data-suivi pour un chapitre de PC) : les
 *  deux doivent rester identiques.
 *
 *  QUAND LE RELANCER
 *  Après avoir ajouté, supprimé ou renommé une séance, un outil ou un
 *  chapitre :
 *      node generer-sequences-espaces.mjs
 *
 *  RGPD : ne lit que du contenu de cours, n'écrit que du contenu de
 *  cours.
 * ============================================================ */

import fs from 'fs';
import { pathToFileURL } from 'url';
import { extraire } from './generer-seances.mjs';

const SORTIE = 'assets/js/sequences-espaces.js';

/* espace → [clé, fichier] — l'ordre est celui des menus */
export const ESPACES = {
  pc2: [
    ['pc-o1', 'pages/2nde-pc-o1-ecriture-scientifique.html'],
    ['pc-o2', 'pages/2nde-pc-o2-chiffres-significatifs.html'],
    ['pc-o3', 'pages/2nde-pc-o3-securite-laboratoire.html'],
    ['pc-o4', 'pages/2nde-pc-o4-verrerie-materiel.html'],
    ['pc-o5', 'pages/2nde-pc-o5-compte-rendu-tp.html'],
    ['pc-o6', 'pages/2nde-pc-o6-presenter-un-calcul.html'],
    ['pc-o7', 'pages/2nde-pc-o7-relation-algebrique.html'],
    ['pc-o8', 'pages/2nde-pc-o8-construire-un-graphique.html']
  ],
  es1: [
    ['es1-t1-c1', 'pages/1re-es-t1-c1-nucleosynthese.html'],
    ['es1-t1-c2', 'pages/1re-es-t1-c2-radioactivite.html'],
    ['es1-t1-c3', 'pages/1re-es-t1-c3-cristaux.html'],
    ['es1-t2-c1', 'pages/1re-es-t2-c1-son-et-musique.html'],
    ['es1-t2-c2', 'pages/1re-es-t2-c2-son-a-coder.html'],
    ['es1-t3-c1', 'pages/1re-es-t3-c1-forme-terre.html']
  ],
  est: [
    ['est-t2-c1', 'pages/term-es-t2-c1-deux-siecles-energie-electrique.html'],
    ['est-t2-c2', 'pages/term-es-t2-c2-production-stockage-electricite.html']
  ],
  /* Les chapitres de 2nde : pas de séances, une ligne de consultation
     par chapitre (assets/js/suivi-pc.js). Clé pc-tN-cN, famille PC. */
  pc2_chapitres: fs.readdirSync('pages')
    .filter((x) => /^2nde-pc-t\d+-c\d+-.*\.html$/.test(x)).sort()
    .map((x) => { const m = /^2nde-pc-(t\d+)-(c\d+)-/.exec(x); return ['pc-' + m[1] + '-' + m[2], 'pages/' + x]; }),
  cfa: Array.from({ length: 17 }, (_, i) => {
    const n = String(i).padStart(2, '0');
    const f = fs.readdirSync('cfa').find((x) => x.startsWith('outil-' + n + '-'));
    return ['cfa-o' + n, f ? 'cfa/' + f : 'cfa/outil-' + n + '-?.html'];
  })
};

/* Le nom court, tiré du PREMIER <title> — les pages d'ES en portent
   d'autres, dans leurs SVG, plus bas.
     « Outil 1 · Puissances de dix… — Physique-Chimie 2nde »  → tout avant « — »
     « ES 1re · La nucléosynthèse — Séquence élève »           → après « · », avant « — »
     « Outil 0 — Rédiger un calcul… · Livret CFA »             → après « — », avant « · Livret » */
function nomDePage(html, espace) {
  const t = (/<title>([^<]*)<\/title>/.exec(html) || [, ''])[1].replace(/\s+/g, ' ').trim();
  if (espace === 'pc2_chapitres') return t.split(' · ')[0].replace(/^(2nde|Seconde)\s*—\s*/, '');
  if (espace === 'cfa') return t.replace(/\s*·\s*Livret CFA\s*$/, '').replace(/^Outil \d+\s*—\s*/, '');
  const avant = t.split(' — ')[0];
  if (espace === 'es1' || espace === 'est') return avant.replace(/^ES [^·]*·\s*/, '');
  return avant.replace(/^Outil \d+\s*·\s*/, '');
}

/* « es1-t2-c1 » → « T2-C1 », « pc-o3 » → « O3 », « cfa-o07 » → « O7 » */
function numero(cle) {
  const m = /-(t\d+)-(c\d+)$/.exec(cle);
  if (m) return (m[1] + '-' + m[2]).toUpperCase();
  const o = /-o(\d+)$/.exec(cle);
  return o ? 'O' + Number(o[1]) : cle;
}

export function construire() {
  const donnees = {};
  for (const [espace, liste] of Object.entries(ESPACES)) {
    donnees[espace] = liste.map(([cle, fichier]) => {
      if (!fs.existsSync(fichier)) return { cle, num: numero(cle), nom: '(page introuvable)', seances: [] };
      const html = fs.readFileSync(fichier, 'utf8');
      return {
        cle,
        num: numero(cle),
        nom: nomDePage(html, espace),
        /* le livret CFA n'a pas de séances : une fiche = une ligne */
        seances: (espace === 'cfa' || espace === 'pc2_chapitres') ? [] : extraire(html)
      };
    });
  }
  return donnees;
}

function principal() {
  const donnees = construire();
  for (const [espace, liste] of Object.entries(donnees)) {
    console.log(`  ${espace}`);
    for (const s of liste) console.log(`    ${s.cle.padEnd(10)} ${String(s.seances.length).padStart(2)} séance(s)  ${s.nom}`);
  }
  const entete =
`/* ============================================================
 *  sequences-espaces.js — GÉNÉRÉ, NE PAS MODIFIER À LA MAIN
 *  ------------------------------------------------------------
 *  Produit par  node generer-sequences-espaces.mjs  à partir des
 *  pages des outils de PC, de l'ES et du livret CFA. Sert au tableau
 *  de bord à nommer outils, chapitres, fiches et séances.
 *  Le SNT n'y est pas : il vit dans seances-snt.js, dont l'ordre
 *  commande le plafond d'avance.
 * ============================================================ */
window.SEQUENCES_ESPACES = `;
  fs.writeFileSync(SORTIE, entete + JSON.stringify(donnees, null, 2) + ';\n', 'utf8');
  console.log(`\n✅ ${SORTIE}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) principal();
