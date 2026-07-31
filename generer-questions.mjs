/* ============================================================
 *  generer-questions.mjs — le répertoire des questions libres
 *  ------------------------------------------------------------
 *  Lit les huit pages de séquence, en extrait chaque champ libre
 *  (data-focus-code) avec son titre et son énoncé, et écrit
 *  assets/js/questions-snt.js.
 *
 *  À QUOI ÇA SERT
 *  Le tableau de bord affiche une copie d'élève et le jugement de
 *  l'IA — mais pas la question posée. Corriger sans relire l'énoncé,
 *  c'est corriger de mémoire : au bout de la troisième copie on ne
 *  sait plus si « c'est court » est un défaut ou la consigne
 *  (NET-1a demande deux phrases maximum).
 *
 *  POURQUOI GÉNÉRER PLUTÔT QU'ÉCRIRE À LA MAIN
 *  Même motif que generer-seances.mjs : une liste tenue à la main
 *  dérive. La source de vérité est la page ; ce script la recopie.
 *  À noter, ce que la génération a révélé du premier coup : la
 *  grille de l'IA (ia-snt/criteres-snt.json) ne couvre que trois
 *  codes, quand les pages en portent des dizaines. Toutes les
 *  autres questions ressortent en « sans objet » côté worker.
 *
 *  QUAND LE RELANCER
 *  Après avoir ajouté, supprimé ou reformulé une question libre :
 *      node generer-questions.mjs
 *  verifier.mjs signale si le fichier généré est en retard.
 *
 *  RGPD : ne lit que du contenu de cours, n'écrit que du contenu de
 *  cours. Aucune donnée d'élève n'approche ce script.
 * ============================================================ */

import fs from 'fs';
import path from 'path';

const DOSSIER = 'pages';
const SORTIE  = 'assets/js/questions-snt.js';

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

/* Même liste courte d'entités que generer-seances.mjs : mieux vaut
   six caractères lisibles qu'une dépendance. */
const ENTITES = {
  '&nbsp;': '\u00a0', '&amp;': '&', '&lt;': '<', '&gt;': '>',
  '&quot;': '"', '&#39;': "'", '&eacute;': 'é', '&egrave;': 'è',
  '&agrave;': 'à', '&ccedil;': 'ç', '&ocirc;': 'ô', '&rsquo;': '\u2019',
  '&laquo;': '\u00ab', '&raquo;': '\u00bb', '&hellip;': '\u2026',
  '&mdash;': '\u2014', '&ndash;': '\u2013'
};

function texteBrut(html) {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&[a-zA-Z]+;|&#\d+;/g, (e) => (e in ENTITES ? ENTITES[e] : e))
    .replace(/\s+/g, ' ')
    .trim();
}

/* Les attributs sont écrits avec des guillemets doubles dans toutes
   les pages ; on lit l'ouvrant jusqu'au fermant. Les apostrophes
   françaises à l'intérieur ne gênent donc pas. */
function attribut(bloc, nom) {
  const m = new RegExp('\\b' + nom + '="([^"]*)"').exec(bloc);
  return m ? m[1] : '';
}

export function extraire(html) {
  const out = {};
  /* On repart du conteneur .field pour ramasser les attributs qui
     entourent data-focus-code, où qu'ils soient placés.

     ⚠ La forme naïve  <div[^>]*>  ÉCHOUE ici, et silencieusement :
     les énoncés contiennent du balisage (« …à ton avis, <b>pourquoi</b>
     une invention… »), donc des  >  À L'INTÉRIEUR d'un attribut. La
     regex s'arrêtait au premier, et la question sautait du répertoire
     sans un mot d'erreur. Même famille de piège que l'incident du
     commentaire CSS contenant un lien littéral.
     La forme ci-dessous consomme soit un caractère ordinaire, soit
     une chaîne entre guillemets ENTIÈRE — les chevrons qu'elle
     contient sont donc absorbés. */
  const re = /<div(?:[^>"]|"[^"]*")*>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const bloc = m[0];
    if (!/\bdata-focus\b/.test(bloc)) continue;
    const code = attribut(bloc, 'data-focus-code');
    if (!code) continue;
    out[code] = {
      titre   : texteBrut(attribut(bloc, 'data-focus-titre')),
      question: texteBrut(attribut(bloc, 'data-focus-question')),
      min     : attribut(bloc, 'data-focus-min') || null,
      max     : attribut(bloc, 'data-focus-max') || null
    };
  }
  return out;
}

function principal() {
  const donnees = {};
  let total = 0, manquants = [], doublons = [];

  for (const [cle, fichier] of THEMES) {
    const chemin = path.join(DOSSIER, fichier);
    if (!fs.existsSync(chemin)) { manquants.push(fichier); continue; }
    const trouve = extraire(fs.readFileSync(chemin, 'utf8'));
    for (const [code, q] of Object.entries(trouve)) {
      /* Un code d'activité est la CLÉ d'une copie en base
         (contrainte unique eleve_id + code_activite). Deux champs
         qui le partageraient écraseraient la réponse l'un de
         l'autre : c'est un défaut de contenu, pas un détail. */
      if (donnees[code]) doublons.push(code);
      donnees[code] = Object.assign({ sequence: cle }, q);
      total++;
    }
    console.log(`  ${cle}  ${String(Object.keys(trouve).length).padStart(3)} question(s)  ${fichier}`);
  }

  if (manquants.length) console.error('\n⚠  pages introuvables : ' + manquants.join(', '));
  if (doublons.length)  console.error('\n⚠  codes en double : ' + [...new Set(doublons)].join(', '));

  const entete =
`/* ============================================================
 *  questions-snt.js — GÉNÉRÉ, NE PAS MODIFIER À LA MAIN
 *  ------------------------------------------------------------
 *  Produit par  node generer-questions.mjs  à partir des huit pages
 *  de séquence. Toute correction se fait dans la page, puis on
 *  relance le script.
 *
 *  Sert au tableau de bord enseignant à rappeler la question posée
 *  en face de la copie de l'élève.
 * ============================================================ */
window.QUESTIONS_SNT = `;

  fs.writeFileSync(SORTIE, entete + JSON.stringify(donnees, null, 2) + ';\n', 'utf8');
  console.log(`\n✅ ${SORTIE} — ${total} question(s) libre(s).`);
}

if (import.meta.url === `file://${process.argv[1]}`) principal();
