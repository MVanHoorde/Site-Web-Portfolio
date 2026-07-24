#!/usr/bin/env node
/* ============================================================
   verifier.mjs — la checklist du projet, en une commande.

     node verifier.mjs            contrôles complets
     node verifier.mjs --bilan    digest compact du dépôt (à coller en chat)
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
const pagesSNT = html.filter((f) => /pages\/2nde-snt-t\d/.test(f));
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
    ["snt-t7", "2nde-snt-t7-photographie-numerique.html"]
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
