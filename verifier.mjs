#!/usr/bin/env node
/* ============================================================
   verifier.mjs — la checklist du projet, en une commande.

     node verifier.mjs            contrôles complets
     node verifier.mjs --bilan    digest compact du dépôt (à coller en chat)
     node verifier.mjs --qcm      liste complète des biais de longueur des QCM
     node verifier.mjs --silence  ne sort que les problèmes (pour un hook git)

   Aucune dépendance : Node 18+ et rien d'autre.
   Ce fichier ne modifie JAMAIS un fichier du dépôt.
   ============================================================ */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, normalize, relative, basename, extname } from "node:path";
import { execSync } from "node:child_process";

const RACINE = process.cwd();
const ARGS = process.argv.slice(2);
const BILAN = ARGS.includes("--bilan");
const QCM_DETAIL = ARGS.includes("--qcm");   /* liste complète des biais de longueur */
const SILENCE = ARGS.includes("--silence");

const IGNORE = new Set([".git", "node_modules", "assets/fonts", "audio", "_suivi/archives"]);
const problemes = [];
const notes = [];

function parcourir(d, acc = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    const rel = relative(RACINE, p).replace(/\\/g, "/");
    if (IGNORE.has(e.name) || IGNORE.has(rel)) continue;
    e.isDirectory() ? parcourir(p, acc) : acc.push(rel);
  }
  return acc;
}
const FICHIERS = parcourir(RACINE);
const lire = (f) => readFileSync(join(RACINE, f), "utf8");
const html = FICHIERS.filter((f) => f.endsWith(".html"));
/* Les pages qui tournent sur le MOTEUR de séquences : les huit thèmes SNT
   (t0…t7), les modules transversaux (m1…), et depuis le 06/09/2026 les
   chapitres d'enseignement scientifique de 1re (1re-es-tN-cN-…). Ils ne
   sont pas tous des thèmes du programme, mais tous suivent la même
   grammaire — et surtout, un fichier qui échapperait à ce filtre
   passerait aussi à travers le contrôle localStorage, §2 plus bas, sans
   qu'aucune erreur ne le signale. Le piège avait déjà été rencontré pour
   le module m1.
   ⚠ Les pages ES ne sont volontairement PAS dans les tables de
   generer-seances / generer-questions : elles n'ont pas de data-sequence
   tant que la base n'est pas branchée (décision du chantier ES1). */
const pagesSNT = html.filter((f) => /pages\/(2nde-snt-(t\d|m\d)|1re-es-t\d-c\d)/.test(f));
/* Parmi elles, celles qui sont RÉELLEMENT branchées en base : elles seules
   portent un data-sequence sur <body>. Le répertoire des questions ne
   concerne qu'elles — une page non branchée n'a pas de copie à rappeler au
   tableau de bord, et l'y compter ferait clignoter un faux retard. */
const pagesEnBase = pagesSNT.filter((f) => /<body[^>]*data-sequence=/.test(lire(f)));
const scripts = FICHIERS.filter((f) => /\.(mjs|js)$/.test(f) && !f.startsWith("assets/fonts"));

function ko(regle, detail) { problemes.push({ regle, detail }); }
function info(t) { notes.push(t); }

/* ---------- 1. Aucun CDN, aucune police externe (règle RGPD dure) ---------- */
const CDN = /googleapis|gstatic|cdnjs|unpkg|jsdelivr|cdn\.[a-z]/i;
for (const f of html) {
  for (const [i, l] of lire(f).split("\n").entries()) {
    if (CDN.test(l) && !/^\s*(\/\*|\*|<!--|\/\/)/.test(l.trim()))
      ko("CDN interdit", `${f}:${i + 1}`);
  }
}

/* ---------- 2. Aucun localStorage de progression dans les séquences SNT ---------- */
for (const f of pagesSNT) {
  const src = lire(f);
  // on ne compte que le code, pas les commentaires qui rappellent la règle
  const sansCommentaires = src
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  for (const [i, l] of sansCommentaires.split("\n").entries())
    if (/\b(localStorage|sessionStorage)\s*\./.test(l))
      ko("localStorage interdit en SNT", `${f}:~${i + 1}`);
}

/* ---------- 3. Équilibre des <div> (le défaut du 21/07) ---------- */
for (const f of html) {
  const s = lire(f);
  const o = (s.match(/<div\b/g) || []).length;
  const c = (s.match(/<\/div>/g) || []).length;
  if (o !== c) ko("déséquilibre <div>", `${f} — ${o} ouverts / ${c} fermés`);
}

/* ---------- 4. Syntaxe de tout le JS (fichiers + blocs inline) ---------- */
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
const TMP = mkdtempSync(join(tmpdir(), "verif-"));
for (const f of scripts) {
  try { execSync(`node --check "${join(RACINE, f)}"`, { stdio: "pipe" }); }
  catch (e) { ko("syntaxe JS", `${f} — ${String(e.stderr).split("\n")[1] || ""}`); }
}
const RE_SCRIPT = /<script(?![^>]*\bsrc=)(?![^>]*type\s*=\s*["']application\/json)[^>]*>([\s\S]*?)<\/script>/gi;
for (const f of html) {
  const s = lire(f); let m, n = 0;
  while ((m = RE_SCRIPT.exec(s))) {
    n++;
    const tmp = join(TMP, "b.js");
    writeFileSync(tmp, m[1]);
    try { execSync(`node --check "${tmp}"`, { stdio: "pipe" }); }
    catch { ko("syntaxe JS inline", `${f} — bloc #${n} (ligne ~${s.slice(0, m.index).split("\n").length})`); }
  }
}

/* ---------- 5. Notes de chantier encadrées (sinon elles survivent au nettoyage) ---------- */
for (const f of pagesSNT) {
  const s = lire(f);
  const ouv = [...s.matchAll(/<!--\s*CHANTIER/g)].map((m) => m.index);
  const fer = [...s.matchAll(/<!--\s*\/CHANTIER/g)].map((m) => m.index);
  if (ouv.length !== fer.length) ko("marqueurs CHANTIER déséquilibrés", `${f} — ${ouv.length} / ${fer.length}`);
  const zones = ouv.map((o) => [o, fer.find((x) => x > o) ?? Infinity]);
  for (const m of s.matchAll(/<aside[^>]*class="[^"]*chantier/g)) {
    if (!zones.some(([a, b]) => a < m.index && m.index < b))
      ko("note de chantier NON encadrée", `${f}:~${s.slice(0, m.index).split("\n").length} — survivra au nettoyage`);
  }
}

/* ---------- 6. Couleurs en dur hors :root, dans le CSS des séquences ---------- */
for (const f of pagesSNT) {
  const css = [...lire(f).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
  const n = (css.replace(/:root\s*\{[\s\S]*?\}/g, "").match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g) || []).length;
  if (n > 0) info(`couleurs en dur hors :root — ${basename(f)} : ${n}`);
}

/* ---------- 6 bis. Indices qui livrent la réponse ----------
   Un indice de niveau 1 qui contient la réponse attendue supprime le travail :
   toujours à corriger. Au niveau 2, c'est le filet de sécurité après échec —
   légitime sur un exercice de restitution, à proscrire sur un exercice de
   lecture de document, où l'information est déjà à l'écran (ceux-là portent
   data-aide="localisation" et n'affichent plus d'indice du tout).
   Volontairement en `info` et non en `ko` : c'est un arbitrage pédagogique,
   pas un défaut technique. */
const sansAccent = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "");
for (const f of pagesSNT) {
  const s = lire(f);
  let n1 = 0, n2 = 0;
  for (const bloc of s.matchAll(/<div class="cloze"[^>]*>([\s\S]*?)<\/div>\s*<div/g)) {
    if (/data-aide="localisation"/.test(bloc[0])) continue; // plus d'indice affiché
    for (const inp of bloc[1].matchAll(/<input[^>]*>/g)) {
      const rep = /data-answer="([^"]*)"/.exec(inp[0])?.[1];
      if (!rep) continue;
      const cle = sansAccent(rep);
      if (cle.length < 2) continue;
      for (const [k, cpt] of [["1", 1], ["2", 2]]) {
        const ind = new RegExp(`data-indice${k}="([^"]*)"`).exec(inp[0])?.[1];
        if (ind && sansAccent(ind).includes(cle)) cpt === 1 ? n1++ : n2++;
      }
    }
  }
  if (n1) ko("indice de niveau 1 livrant la réponse", `${basename(f)} — ${n1} cas`);
  if (n2) info(`indices de niveau 2 proches de la réponse — ${basename(f)} : ${n2} (filet de secours : vérifier qu'aucun n'est sur un exercice de lecture)`);
}

/* ---------- 7. Liens internes cassés + liens inertes ---------- */
let inertes = 0;
for (const f of html) {
  if (f.startsWith("_modeles/") || f.startsWith("_suivi/")) continue; // gabarits : placeholders normaux
  for (const m of lire(f).matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const u = m[1].trim();
    if (u === "#") { inertes++; continue; }
    if (/^(https?:|mailto:|data:|#|javascript:|tel:|\$\{)/i.test(u)) continue;
    const cible = normalize(join(dirname(join(RACINE, f)), decodeURIComponent(u.split("#")[0].split("?")[0])));
    if (!existsSync(cible)) ko("lien interne cassé", `${f} → ${u}`);
  }
}
if (inertes) info(`liens inertes href="#" visibles des élèves : ${inertes}`);

/* ---------- 8. Versionnage du CSS commun (piège du cache navigateur) ---------- */
const versions = new Set();
for (const f of html) for (const m of lire(f).matchAll(/chapitre-commun\.css(\?v=(\d+))?/g))
  versions.add(m[2] ?? "SANS VERSION");
if (versions.size > 1) ko("versions de chapitre-commun.css incohérentes", [...versions].join(" / "));
else if (versions.size) info(`chapitre-commun.css?v=${[...versions][0]} — cohérent partout`);

/* ---------- 9. Secrets : rien qui ressemble à une clé service_role ---------- */
for (const f of FICHIERS) {
  if (f.endsWith(".env") || extname(f) === "") continue;
  let s; try { s = lire(f); } catch { continue; }
  if (/\bsb_secret_[A-Za-z0-9_-]{10,}/.test(s) || /service_role["'\s:=]+ey[A-Za-z0-9._-]{40,}/.test(s))
    ko("SECRET dans un fichier suivi", f);
}

/* ---------- 10. id dupliqués ---------- */
for (const f of html) {
  const ids = [...lire(f).matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dup.length) ko("id dupliqué", `${f} — ${[...new Set(dup)].join(", ")}`);
}

/* ---------- 11. data-cle des étapes SNT : uniques dans tout le dépôt ----------
   La clé identifie l'étape dans la table progression. Deux étapes qui
   partagent une clé, c'est la progression de l'une écrasée par l'autre, en
   silence. Posé au lot H du 22/08/2026, en préalable au renumérotage : c'est
   la clé qui rend le déplacement d'une étape sans effet sur l'élève. */
{
  const vues = new Map();
  for (const f of pagesSNT) {
    for (const m of lire(f).matchAll(/<div class="step"[^>]*\bdata-cle="([^"]+)"/g)) {
      const c = m[1];
      if (vues.has(c)) ko("data-cle dupliquée", `${c} — ${vues.get(c)} et ${f}`);
      else vues.set(c, f);
    }
  }
  const sansCle = pagesSNT.filter((f) => {
    const s = lire(f);
    const tot = [...s.matchAll(/<div class="step"[^>]*>/g)].length;
    const avec = [...s.matchAll(/<div class="step"[^>]*\bdata-cle="/g)].length;
    return tot && tot !== avec;
  });
  if (sansCle.length) info("étapes sans data-cle (clé positionnelle, fragile) — " + sansCle.join(", "));
  info(`data-cle d'étape — ${vues.size} clé(s), toutes uniques`);
}

/* ---------- Bilan compact ---------- */
function bilan() {
  const poids = (f) => statSync(join(RACINE, f)).size;
  const tok = (n) => Math.round(n / 3.6 / 100) * 100;
  const l = [];
  l.push("## Bilan du dépôt — " + new Date().toISOString().slice(0, 10));
  try {
    l.push("\nDernier commit : " + execSync("git log -1 --format='%ad %s' --date=short", { encoding: "utf8" }).trim());
    const sale = execSync("git status --short", { encoding: "utf8" }).trim();
    l.push("Modifs non commitées : " + (sale ? sale.split("\n").length + " fichier(s)" : "aucune"));
  } catch { l.push("\n(hors dépôt git)"); }

  l.push("\n### Séquences SNT");
  l.push("| séquence | ko | ~tokens | étapes | champs | 🚧 | href=# |");
  l.push("|---|---|---|---|---|---|---|");
  for (const f of pagesSNT) {
    const s = lire(f);
    l.push(`| ${basename(f).replace(/2nde-snt-|\.html/g, "")} | ${Math.round(poids(f) / 1024)} | ${tok(poids(f))} | ` +
      `${(s.match(/data-step/g) || []).length} | ${(s.match(/data-(qcm|cloze|diagram|free|share|focus-code)/g) || []).length} | ` +
      `${(s.match(/🚧/g) || []).length - (s.match(/class="tv"/g) || []).length} | ${(s.match(/href="#"/g) || []).length} |`);
  }

  l.push("\n### Chapitres PC");
  const pc = html.filter((f) => /pages\/2nde-pc-/.test(f));
  const af = pc.reduce((a, f) => a + (lire(f).match(/a-faire/g) || []).length, 0);
  l.push(`${pc.length} chapitres · ${af} blocs \`.a-faire\` restants`);

  l.push("\n### Les fichiers texte les plus lourds à lire");
  const texte = FICHIERS.filter((f) => /\.(html|md|js|mjs|css|sql)$/.test(f));
  const gros = texte.map((f) => [f, poids(f)]).filter(([, n]) => n > 60 * 1024).sort((a, b) => b[1] - a[1]);
  for (const [f, n] of gros.slice(0, 6)) l.push(`- ${f} — ${Math.round(n / 1024)} ko (~${tok(n)} tokens)`);
  l.push(`\nTout le texte du dépôt : ~${tok(texte.reduce((a, f) => a + poids(f), 0))} tokens ` +
         `— soit plusieurs fenêtres de contexte. Ne jamais tout charger : voir MANIFESTE.md.`);
  return l.join("\n");
}

/* ---------- Le sommaire généré est-il à jour ? ----------
   assets/js/seances-snt.js est produit par generer-seances.mjs à partir
   des huit pages de séquence. Renommer une séance sans relancer le
   script laisserait le hub afficher un ancien titre. On ne l'oublie pas
   silencieusement : on compare, et on le signale.
   Non bloquant — un titre en retard n'empêche personne de travailler. */
try {
  const { extraire } = await import("./generer-seances.mjs");
  const genere = readFileSync("assets/js/seances-snt.js", "utf8");
  const actuel = JSON.parse(genere.slice(genere.indexOf("{"), genere.lastIndexOf("}") + 1));
  const ecarts = [];
  for (const [cle, fichier] of [
    ["snt-t0", "2nde-snt-t0-systemes-informatises.html"],
    ["snt-t1", "2nde-snt-t1-internet.html"],
    ["snt-t2", "2nde-snt-t2-le-web.html"],
    ["snt-t3", "2nde-snt-t3-reseaux-sociaux.html"],
    ["snt-t4", "2nde-snt-t4-donnees-structurees.html"],
    ["snt-t5", "2nde-snt-t5-localisation-cartographie.html"],
    ["snt-t6", "2nde-snt-t6-informatique-embarquee.html"],
    ["snt-t7", "2nde-snt-t7-photographie-numerique.html"],
    ["snt-m1", "2nde-snt-m1-representer-information.html"]
  ]) {
    const chemin = "pages/" + fichier;
    if (!existsSync(chemin)) continue;
    const frais = JSON.stringify(extraire(readFileSync(chemin, "utf8")));
    if (frais !== JSON.stringify(actuel[cle] || [])) ecarts.push(cle);
  }
  if (ecarts.length) {
    notes.push(`assets/js/seances-snt.js en retard sur ${ecarts.join(", ")} — relancer : node generer-seances.mjs`);
  } else {
    notes.push("assets/js/seances-snt.js — à jour");
  }
} catch (e) {
  notes.push("assets/js/seances-snt.js absent ou illisible — lancer : node generer-seances.mjs");
}

/* ---------- Le sommaire généré est-il servi dans la MÊME version partout ? ----------
   `seances-snt.js` porte l'ordre des séances : c'est lui qui donne son rang à
   chacune, donc le plafond d'avance. Deux pages qui n'en servent pas la même
   version ne calculent pas le même plafond — le professeur ouvre un thème que
   l'élève voit fermé, et rien ne le signale.
   Vécu le 22/08/2026 : le fichier régénéré (t1 passé à 6 séances) est resté à
   `?v=13` sur les pages élèves, pendant que `prof/index.html` le chargeait sans
   `?v=` du tout et recevait donc la version fraîche. Bloquant. */
{
  const refs = [];
  for (const f of html) {
    for (const m of lire(f).matchAll(/seances-snt\.js(\?v=(\d+))?/g)) refs.push({ f, v: m[2] || null });
  }
  const sansVersion = refs.filter((r) => !r.v).map((r) => r.f);
  const versions = [...new Set(refs.filter((r) => r.v).map((r) => r.v))];
  if (sansVersion.length)
    ko("seances-snt.js sans ?v=", `${[...new Set(sansVersion)].join(", ")} — le cache y servira une version différente des autres pages`);
  if (versions.length > 1)
    ko("seances-snt.js en versions divergentes", `?v=${versions.join(" · ?v=")} — le plafond d'avance ne se calcule pas pareil d'une page à l'autre`);
  if (refs.length && !sansVersion.length && versions.length === 1)
    info(`seances-snt.js?v=${versions[0]} — même version sur les ${refs.length} pages qui le chargent`);
}

/* ---------- Le répertoire des questions est-il à jour ? ----------
   assets/js/questions-snt.js est produit par generer-questions.mjs. Il
   sert au tableau de bord à rappeler l'énoncé en face d'une copie.
   Reformuler une question sans relancer le script ferait corriger sur
   un énoncé périmé — plus sournois qu'un titre de séance en retard,
   mais toujours non bloquant : la file fonctionne sans lui. */
try {
  const { extraire } = await import("./generer-questions.mjs");
  const genere = readFileSync("assets/js/questions-snt.js", "utf8");
  const actuel = JSON.parse(genere.slice(genere.indexOf("{"), genere.lastIndexOf("}") + 1));
  let frais = 0, ecarts = 0;
  for (const f of pagesEnBase) {
    const trouve = extraire(readFileSync(f, "utf8"));
    for (const [code, q] of Object.entries(trouve)) {
      frais++;
      const a = actuel[code];
      if (!a || a.question !== q.question || a.titre !== q.titre) ecarts++;
    }
  }
  const enTrop = Object.keys(actuel).length - frais;
  if (ecarts || enTrop > 0) {
    notes.push(`assets/js/questions-snt.js en retard (${ecarts} écart(s)${enTrop > 0 ? ", " + enTrop + " question(s) disparue(s)" : ""}) — relancer : node generer-questions.mjs`);
  } else {
    notes.push(`assets/js/questions-snt.js — à jour (${frais} questions)`);
  }
} catch (e) {
  notes.push("assets/js/questions-snt.js absent ou illisible — lancer : node generer-questions.mjs");
}

/* ---------- Versions d'assets synchronisées ----------
   Le paramètre ?v=N force le rechargement après modification. Si une
   page reste en arrière, elle sert une version périmée depuis le cache
   du navigateur — et le défaut est invisible en local, où le cache est
   souvent vide. Constaté le 01/08/2026 : pages/2nde-snt.html était
   resté en ?v=19 alors que les séquences étaient en ?v=28.
   BLOQUANT : une page qui charge un CSS d'une autre époque est un bug
   d'affichage garanti chez l'élève. */
try {
  const versions = new Map();
  for (const f of readdirSync("pages").filter((n) => n.endsWith(".html"))) {
    const html = readFileSync("pages/" + f, "utf8");
    for (const m of html.matchAll(/(sequence-snt\.(?:css|js))\?v=(\d+)/g)) {
      if (!versions.has(m[1])) versions.set(m[1], new Map());
      const par = versions.get(m[1]);
      if (!par.has(m[2])) par.set(m[2], []);
      par.get(m[2]).push(f);
    }
  }
  let ecart = false;
  for (const [asset, par] of versions) {
    if (par.size > 1) {
      ecart = true;
      const detail = [...par.entries()]
        .map(([v, fs]) => `v=${v} (${fs.join(", ")})`).join(" · ");
      ko("versions d'assets désynchronisées", `${asset} — ${detail}`);
    }
  }
  if (!ecart && versions.size) {
    const resume = [...versions.entries()]
      .map(([a, p]) => `${a}?v=${[...p.keys()][0]}`).join(" · ");
    notes.push("versions d'assets — alignées : " + resume);
  }
} catch (e) {
  notes.push("contrôle des versions non effectué : " + e.message);
}

/* ---------- Biais de longueur dans les QCM ----------
   Défaut classique et sournois : la bonne réponse est plus longue que
   les autres, parce qu'on y met la nuance et la justification. L'élève
   la repère alors sans lire — le QCM ne mesure plus rien.
   Constaté le 01/08/2026 sur 9 questions rédigées sur 11, y compris
   après une première relecture.

   Seuil affiné le 20/08/2026. La première version signalait toute bonne
   réponse strictement la plus longue ou la plus courte, sans regarder de
   combien : sur 60 signalements, 13 tenaient à 1 à 3 caractères — invisibles
   pour un élève — pendant que la queue montait à 74. Le bruit masquait les
   vrais cas. On mesure maintenant l'ampleur, de deux façons à la fois :
     · l'écart en caractères avec l'option la plus proche (moins d'un mot
       ne se voit pas) ;
     · ce même écart rapporté à la longueur moyenne des options — 10
       caractères sur des options de 20 sautent aux yeux, sur des options
       de 90 non.
   Le filtre « options courtes » de la première version devient inutile :
   « 213 » face à « 4 » ne franchit ni l'un ni l'autre de ces seuils. Le
   signalement reste non bloquant — c'est un jugement de rédaction. */
const QCM_ECART_MIN = 6,  QCM_PART_MIN = 0.15;   /* en deçà : non significatif */
const QCM_ECART_NET = 12, QCM_PART_NET = 0.30;   /* au-delà : à reprendre en priorité */
try {
  const suspects = [];
  let ecartes = 0;
  for (const f of pagesSNT) {
    const html = lire(f);
    const re = /<script[^>]*class="qcm-data"[^>]*>([\s\S]*?)<\/script>/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      let data;
      try { data = JSON.parse(m[1]); } catch {
        ko("QCM illisible", `${f} — un bloc qcm-data n'est pas du JSON valide`);
        continue;
      }
      for (const q of data) {
        const opts = q.o || [];
        if (opts.length < 3) continue;
        const L = opts.map((o) => String(o).replace(/<[^>]+>/g, "").length);
        const bons = Array.isArray(q.r) ? q.r : [q.r];
        const mx = Math.max(...L), mn = Math.min(...L);
        const plusLongue = L.filter((x) => x === mx).length === 1 && bons.includes(L.indexOf(mx));
        const plusCourte = L.filter((x) => x === mn).length === 1 && bons.includes(L.indexOf(mn));
        if (!plusLongue && !plusCourte) continue;
        /* écart avec l'option la plus proche, et sa part de la longueur moyenne */
        const tri = [...L].sort((a, b) => (plusLongue ? b - a : a - b));
        const ecart = Math.abs(tri[0] - tri[1]);
        const moyenne = L.reduce((a, b) => a + b, 0) / L.length;
        const part = moyenne ? ecart / moyenne : 0;
        if (ecart < QCM_ECART_MIN || part < QCM_PART_MIN) { ecartes++; continue; }
        suspects.push({
          ecart, part,
          net: ecart >= QCM_ECART_NET && part >= QCM_PART_NET,
          texte: `${f.split("/").pop()} — « ${q.q.replace(/<[^>]+>/g, "").slice(0, 46)}… » : la bonne réponse est `
               + `${plusLongue ? "la plus longue" : "la plus courte"} de ${ecart} car. (${Math.round(part * 100)} %)`,
        });
      }
    }
  }
  suspects.sort((a, b) => b.ecart - a.ecart);
  const nets = suspects.filter((s) => s.net).length;
  if (suspects.length) {
    notes.push(`biais de longueur dans ${suspects.length} question(s) de QCM — dont ${nets} marquée(s) `
             + `· ${ecartes} écart(s) sous le seuil non retenu(s)${QCM_DETAIL ? "" : " · liste complète : --qcm"} :`);
    const combien = QCM_DETAIL ? suspects.length : 8;
    suspects.slice(0, combien).forEach((s) => notes.push(`   ${s.net ? "🔴" : "· "} ${s.texte}`));
    if (suspects.length > combien) notes.push(`   …et ${suspects.length - combien} autre(s), moins marquée(s)`);
  } else {
    notes.push(`QCM — aucune bonne réponse trahie par sa longueur (${ecartes} écart(s) sous le seuil)`);
  }
} catch (e) {
  notes.push("contrôle des QCM non effectué : " + e.message);
}

/* ---------- Les scripts PowerShell sont-ils lisibles par Windows ? ----------
   Windows PowerShell 5.1 — celui livré avec Windows, celui que Loïc
   lance — décode un .ps1 SANS BOM comme de l'ANSI, pas comme de
   l'UTF-8. Les tirets cadratins deviennent alors « â€" », et ce
   guillemet typographique est traité par l'analyseur comme un VRAI
   guillemet : les chaînes se déséquilibrent et le script refuse de
   démarrer, avec un message qui désigne une ligne sans rapport
   (incident du 31/07/2026 : erreur annoncée ligne 246, cause réelle
   ligne 226).
   Deux garde-fous, parce qu'un seul finit toujours par sauter :
   le BOM, et l'absence de caractères typographiques. BLOQUANT. */
try {
  const psFichiers = readdirSync("ia-snt")
    .filter((n) => n.endsWith(".ps1"))
    .map((n) => "ia-snt/" + n);
  for (const f of psFichiers) {
    const octets = readFileSync(f);
    if (!(octets[0] === 0xef && octets[1] === 0xbb && octets[2] === 0xbf)) {
      ko("script PowerShell sans BOM", `${f} — Windows PowerShell 5.1 le lira en ANSI`);
    }
    const texte = octets.toString("utf8");
    const piegeux = [...new Set(texte.match(/[\u2013\u2014\u2018\u2019\u201c\u201d]/g) || [])];
    if (piegeux.length) {
      ko("caractère typographique dans un .ps1",
         `${f} — ${piegeux.join(" ")} : remplacer par de l'ASCII`);
    }
  }
  if (psFichiers.length) notes.push(`${psFichiers.length} script(s) PowerShell — BOM et caractères vérifiés`);
} catch (e) {
  notes.push("scripts PowerShell non vérifiés : " + e.message);
}

/* ---------- Cohérence de la configuration Supabase ----------
   prof-api.js duplique volontairement l'URL du projet et la clé anon
   de progression.js (voir l'entête de prof-api.js : le second
   s'auto-démarre et injecte une interface élève, on ne peut pas le
   charger dans le tableau de bord). Une duplication finit toujours
   par diverger ; ce contrôle est la contrepartie de ce choix.
   BLOQUANT : si les deux ne correspondent plus, le tableau de bord
   interroge un projet qui n'est pas celui des élèves — et il ne le
   dirait pas, il afficherait simplement zéro copie. */
try {
  const extraireConf = (src) => ({
    url: (src.match(/URL_PROJET\s*=\s*'([^']+)'/) || [])[1] || null,
    cle: (src.match(/CLE_ANON\s*=\s*'([^']+)'/) || [])[1] || null
  });
  const a = extraireConf(lire("assets/js/progression.js"));
  const b = extraireConf(lire("assets/js/prof-api.js"));
  if (!a.url || !a.cle || !b.url || !b.cle) {
    ko("configuration Supabase illisible",
       "URL_PROJET ou CLE_ANON introuvable dans progression.js ou prof-api.js");
  } else if (a.url !== b.url) {
    ko("configuration Supabase divergente",
       `URL_PROJET diffère entre progression.js et prof-api.js`);
  } else if (a.cle !== b.cle) {
    ko("configuration Supabase divergente",
       `CLE_ANON diffère entre progression.js et prof-api.js`);
  } else {
    notes.push("configuration Supabase — identique dans progression.js et prof-api.js");
  }
} catch (e) {
  notes.push("assets/js/prof-api.js absent — contrôle de configuration non effectué");
}

/* ---------- Sortie ---------- */
if (BILAN) { console.log(bilan()); process.exit(0); }

if (problemes.length === 0) {
  if (!SILENCE) console.log("✅ Aucun problème bloquant.\n");
} else {
  console.log(`❌ ${problemes.length} problème(s) :\n`);
  const par = {};
  for (const p of problemes) (par[p.regle] ??= []).push(p.detail);
  for (const [r, d] of Object.entries(par)) {
    console.log(`  ${r} (${d.length})`);
    for (const x of d.slice(0, 8)) console.log(`     · ${x}`);
    if (d.length > 8) console.log(`     … et ${d.length - 8} autre(s)`);
  }
  console.log();
}
if (notes.length && !SILENCE) {
  console.log("ℹ  Points de vigilance (pas bloquants) :");
  for (const n of notes) console.log("   · " + n);
  console.log();
}
process.exit(problemes.length ? 1 : 0);
