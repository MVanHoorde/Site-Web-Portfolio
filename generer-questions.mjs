/* ============================================================
 *  generer-questions.mjs — le répertoire des questions libres
 *  ------------------------------------------------------------
 *  Lit les pages de séquence (huit thèmes + les modules), en
 *  extrait chaque champ libre
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
import { pathToFileURL } from 'url';

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
  ['snt-t7', '2nde-snt-t7-photographie-numerique.html'],
  /* Module transversal : aucune question libre aujourd'hui, mais la liste
     doit le connaître d'avance — sinon la première question ajoutée au
     module manquerait au tableau de bord sans que rien ne le signale.
     Même remarque que dans generer-seances.mjs et verifier.mjs. */
  ['snt-m1', '2nde-snt-m1-representer-information.html'],
  /* Enseignement scientifique, branché le 13/09/2026. Ses réponses
     rédigées sont des réponses personnelles (corrigées en classe) : le
     tableau de bord s'en sert pour rappeler l'énoncé, jamais pour une
     file de correction. Clés alignées sur generer-sequences-espaces.mjs. */
  ['es1-t1-c1', '1re-es-t1-c1-nucleosynthese.html'],
  ['es1-t1-c2', '1re-es-t1-c2-radioactivite.html'],
  ['es1-t1-c3', '1re-es-t1-c3-cristaux.html'],
  ['es1-t2-c1', '1re-es-t2-c1-son-et-musique.html'],
  ['es1-t2-c2', '1re-es-t2-c2-son-a-coder.html'],
  ['es1-t3-c1', '1re-es-t3-c1-forme-terre.html'],
  ['est-t2-c1', 'term-es-t2-c1-deux-siecles-energie-electrique.html'],
  ['est-t2-c2', 'term-es-t2-c2-production-stockage-electricite.html']
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

  /* On repère d'abord où commence chaque séance, pour pouvoir dire
     à quelle séance appartient chaque question. Sans cette
     information, un code comme « NET-R-correze » ne dit rien de
     l'endroit du cours où il se trouve — et il faut rouvrir la page
     pour s'y retrouver. */
  const seances = [];
  const reSeance = /<section(?:[^>"]|"[^"]*")*>/g;
  let ms;
  while ((ms = reSeance.exec(html)) !== null) {
    if (!/class="[^"]*\bseance\b/.test(ms[0])) continue;
    seances.push({
      pos: ms.index,
      id : attribut(ms[0], 'id'),
      num: attribut(ms[0], 'data-seance')
    });
  }
  const seanceDe = (pos) => {
    let trouvee = null;
    for (const s of seances) { if (s.pos < pos) trouvee = s; else break; }
    return trouvee;
  };

  /* Même besoin, un cran plus fin : l'étape. La file de correction
     n'a que la largeur d'une colonne pour situer une copie, et « T1 ·
     S4 » ne suffit pas quand une séance porte cinq questions. On prend
     le numéro que l'élève voit (« ÉTAPE 1.3 ») ; à défaut de bandeau,
     le rang de l'étape dans sa séance. */
  const etapes = [];
  const reEtape = /<div(?:[^>"]|"[^"]*")*>/g;
  let me;
  while ((me = reEtape.exec(html)) !== null) {
    if (/\bdata-step\b/.test(me[0])) etapes.push({ pos: me.index });
  }
  etapes.forEach((e, i) => {
    const fin = i + 1 < etapes.length ? etapes[i + 1].pos : html.length;
    const bout = html.slice(e.pos, fin);
    /* Deux bandeaux possibles : « ÉTAPE 1.3 » pour l'essentiel, la
       pastille  .ix  d'un bonus « Pour aller plus loin ». */
    const k = /class="step-kicker"[^>]*>\s*[ÉE]TAPE\s+([\w.]+)/i.exec(bout)
           || /class="ix"[^>]*>\s*([\w.]+)/.exec(bout);
    const t = /class="step-title"[^>]*>([\s\S]*?)<\/h\d>/.exec(bout)
           || /<h4[^>]*>([\s\S]*?)<\/h4>/.exec(bout.slice(0, 1500));
    const s = seanceDe(e.pos);
    const rang = etapes.slice(0, i + 1).filter((x) => seanceDe(x.pos) === s).length;
    e.num = k ? k[1] : (s && s.num ? s.num + '.' + rang : String(rang));
    e.bonus = /\bdata-bonus\b|data-cle="[^"]*bonus/.test(bout.slice(0, 400));
    e.titre = t ? texteBrut(t[1]) : (e.bonus ? 'Pour aller plus loin' : null);
  });
  const etapeDe = (pos) => {
    let trouvee = null;
    for (const e of etapes) { if (e.pos < pos) trouvee = e; else break; }
    return trouvee;
  };
  /* Rang de la question corrigée dans sa séance : « question 2 / 5 ». */
  const rangs = new Map();
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
    const s = seanceDe(m.index);
    const e = etapeDe(m.index);
    const cle = s ? s.pos : -1;
    rangs.set(cle, (rangs.get(cle) || 0) + 1);
    out[code] = {
      titre   : texteBrut(attribut(bloc, 'data-focus-titre')),
      question: texteBrut(attribut(bloc, 'data-focus-question')),
      min     : attribut(bloc, 'data-focus-min') || null,
      max     : attribut(bloc, 'data-focus-max') || null,
      seance  : s ? (s.id || null) : null,
      seance_num: s ? (s.num || null) : null,
      etape   : e && e.pos > (s ? s.pos : -1) ? e.num : null,
      etape_titre: e && e.pos > (s ? s.pos : -1) ? e.titre : null,
      bonus   : !!(e && e.pos > (s ? s.pos : -1) && e.bonus),
      rang    : rangs.get(cle),
      _cle    : cle
    };
  }
  /* Le total par séance ne se connaît qu'une fois tout lu. */
  for (const q of Object.values(out)) {
    q.sur = rangs.get(q._cle);
    delete q._cle;
  }

  /* Les réponses PERSONNELLES (20/08/2026). Même besoin que les
     copies — le tableau de bord affiche un texte d'élève et doit
     dire à quelle question il répond — mais un destin différent :
     elles ne sont ni corrigées ni notées (statut 'partage' en base,
     bdd/schema/014). Le champ `notee` le dit explicitement, pour
     qu'aucune lecture ultérieure n'ait à le deviner d'après le
     préfixe du code. */
  const rePerso = /<div(?:[^>"]|"[^"]*")*>/g;
  let mp;
  while ((mp = rePerso.exec(html)) !== null) {
    const bloc = mp[0];
    const code = attribut(bloc, 'data-perso-code');
    if (!code) continue;
    const s = seanceDe(mp.index);
    out[code] = {
      titre   : texteBrut(attribut(bloc, 'data-perso-titre')),
      question: texteBrut(attribut(bloc, 'data-perso-question')),
      min     : null,
      max     : null,
      notee   : false,
      seance  : s ? (s.id || null) : null,
      seance_num: s ? (s.num || null) : null
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

/* Le garde d'exécution : « ce fichier est-il lancé directement, ou
   importé par verifier.mjs ? ». La comparaison naïve
   `file://${process.argv[1]}` est FAUSSE sous Windows — argv[1] y vaut
   C:\...\generer-x.mjs quand import.meta.url vaut file:///C:/.../generer-x.mjs.
   Le script se terminait donc sans rien faire et sans rien dire, sur la
   machine même où on le lance (constaté le 20/08/2026). pathToFileURL
   produit exactement la forme attendue, sur les deux systèmes. */
if (import.meta.url === pathToFileURL(process.argv[1]).href) principal();
