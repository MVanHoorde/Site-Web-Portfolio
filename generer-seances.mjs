/* ============================================================
 *  generer-seances.mjs — le sommaire des huit thèmes, généré
 *  ------------------------------------------------------------
 *  Lit les huit pages de séquence, en extrait les titres de séance,
 *  et écrit assets/js/seances-snt.js.
 *
 *  À QUOI ÇA SERT
 *  Le hub SNT dessine une mini-carte par thème. Quand l'élève a déjà
 *  ouvert un thème, les noms de séances viennent de la base (résumé
 *  écrit par la séquence elle-même). Mais tant qu'il ne l'a pas
 *  ouvert — c'est-à-dire sept thèmes sur huit en début d'année — la
 *  base ne sait rien, et les nœuds sortiraient sans nom.
 *
 *  POURQUOI GÉNÉRER PLUTÔT QU'ÉCRIRE À LA MAIN
 *  Une liste tenue à la main dérive. La preuve immédiate : les
 *  nombres de séances que j'avais estimés dans le hub étaient faux
 *  pour deux thèmes sur huit. La source de vérité, c'est la page.
 *  Ce script ne fait que la recopier.
 *
 *  QUAND LE RELANCER
 *  Après avoir ajouté, supprimé ou renommé une séance :
 *      node generer-seances.mjs
 *  verifier.mjs signale si le fichier généré est en retard sur les
 *  pages — on ne peut donc pas l'oublier silencieusement.
 *
 *  RGPD : ne lit que du contenu de cours, n'écrit que du contenu de
 *  cours. Aucune donnée d'élève n'approche ce script.
 * ============================================================ */

import fs from 'fs';
import path from 'path';

const DOSSIER = 'pages';
const SORTIE  = 'assets/js/seances-snt.js';

/* clé de progression  ->  fichier de la séquence */
const THEMES = [
  ['snt-t0', '2nde-snt-t0-systemes-informatises.html'],
  ['snt-t1', '2nde-snt-t1-internet.html'],
  ['snt-t2', '2nde-snt-t2-le-web.html'],
  ['snt-t3', '2nde-snt-t3-reseaux-sociaux.html'],
  ['snt-t4', '2nde-snt-t4-donnees-structurees.html'],
  ['snt-t5', '2nde-snt-t5-localisation-cartographie.html'],
  ['snt-t6', '2nde-snt-t6-informatique-embarquee.html'],
  ['snt-t7', '2nde-snt-t7-photographie-numerique.html']
];

/* Les entités HTML qu'on croise réellement dans ces titres. On ne
   « décode tout » pas : mieux vaut une liste courte et lisible qu'une
   dépendance pour six caractères. */
const ENTITES = {
  '&nbsp;': '\u00a0', '&amp;': '&', '&lt;': '<', '&gt;': '>',
  '&quot;': '"', '&#39;': "'", '&eacute;': 'é', '&egrave;': 'è',
  '&agrave;': 'à', '&ccedil;': 'ç', '&ocirc;': 'ô', '&rsquo;': '\u2019',
  '&laquo;': '\u00ab', '&raquo;': '\u00bb', '&hellip;': '\u2026',
  '&mdash;': '\u2014', '&ndash;': '\u2013'
};
function texteBrut(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&[a-zA-Z]+;|&#\d+;/g, (e) => (e in ENTITES ? ENTITES[e] : e))
    .replace(/\s+/g, ' ')
    .trim();
}

export function extraire(html) {
  const out = [];
  /* On repart de la section, pas du seul <h2> : c'est l'id de section
     qui sert d'ancre depuis le hub (lien vers 2nde-snt-tN.html#s2). */
  const re = /<section[^>]*\bclass="[^"]*\bseance\b[^"]*"[^>]*>([\s\S]*?)<\/h2>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const bloc = m[0];
    const id  = (/\bid="([^"]+)"/.exec(bloc) || [, ''])[1];
    const h2  = (/<h2[^>]*>([\s\S]*?)$/.exec(m[1] + '</h2>') || [, ''])[1];
    const sn  = (/<span class="s-num">([\s\S]*?)<\/span>/.exec(h2) || [, ''])[1];
    const num = texteBrut(sn);
    const nom = texteBrut(h2.replace(/<span class="s-num">[\s\S]*?<\/span>/, ''));
    if (id) out.push({ id, num, nom });
  }
  return out;
}

function principal() {
  const donnees = {};
  let total = 0, manquants = [];

  for (const [cle, fichier] of THEMES) {
    const chemin = path.join(DOSSIER, fichier);
    if (!fs.existsSync(chemin)) { manquants.push(fichier); continue; }
    const seances = extraire(fs.readFileSync(chemin, 'utf8'));
    donnees[cle] = seances;
    total += seances.length;
    console.log(`  ${cle}  ${String(seances.length).padStart(2)} séance(s)  ${fichier}`);
    for (const s of seances) console.log(`         ${s.num.padEnd(4)} ${s.nom}`);
  }

  if (manquants.length) {
    console.error('\n⚠  pages introuvables : ' + manquants.join(', '));
  }

  const entete =
`/* ============================================================
 *  seances-snt.js — GÉNÉRÉ, NE PAS MODIFIER À LA MAIN
 *  ------------------------------------------------------------
 *  Produit par  node generer-seances.mjs  à partir des huit pages
 *  de séquence. Toute correction se fait dans la page, puis on
 *  relance le script.
 *
 *  Sert au hub SNT à nommer les séances d'un thème que l'élève n'a
 *  pas encore ouvert. Dès qu'il l'ouvre, la base prend le relais
 *  avec les compteurs réels : ce fichier n'est qu'une amorce.
 * ============================================================ */
window.SEANCES_SNT = `;

  fs.writeFileSync(SORTIE, entete + JSON.stringify(donnees, null, 2) + ';\n', 'utf8');
  console.log(`\n✅ ${SORTIE} — ${THEMES.length} thèmes, ${total} séances.`);
}

if (import.meta.url === `file://${process.argv[1]}`) principal();
