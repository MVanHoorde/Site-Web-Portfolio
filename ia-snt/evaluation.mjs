/* ============================================================
   evaluation.mjs — suite d'évaluation de la grille (local).
   Compare, pour chaque copie annotée de copies-eval.json, le
   résultat ATTENDU au résultat PRODUIT par le moteur, et n'affiche
   que les DIVERGENCES + un tableau de bord de conformité.

   Usage :
     node evaluation.mjs                 (tout le lot, 1 passage)
     node evaluation.mjs --code NET-1b   (un seul code)
     node evaluation.mjs --repeat 3      (3 passages -> mesure la stabilité)
   Prérequis : Ollama lancé + modèle tiré.
   ============================================================ */
import { readFileSync } from "node:fs";
import { precorrigerUne } from "./moteur.mjs";

const MODELE     = process.env.IA_MODELE  || "mistral-nemo";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

const criteres     = JSON.parse(readFileSync(new URL("./criteres-snt.json",  import.meta.url), "utf8"));
const cadreAnalyse = readFileSync(new URL("./prompt-cadre.md",   import.meta.url), "utf8");
const cadreMessage = readFileSync(new URL("./prompt-message.md", import.meta.url), "utf8");
const lot          = JSON.parse(readFileSync(new URL("./copies-eval.json", import.meta.url), "utf8"));

// ---- args
const args = process.argv.slice(2);
const iCode = args.indexOf("--code");
const code = iCode !== -1 ? args[iCode + 1] : undefined;
const iRep = args.indexOf("--repeat");
const repeat = Math.max(1, iRep !== -1 ? (parseInt(args[iRep + 1], 10) || 1) : 1);
const copies = lot.copies.filter(c => !code || c.code === code);

const mode = arr => {
  const n = {}; for (const v of arr) n[v] = (n[v] || 0) + 1;
  return Object.entries(n).sort((a, b) => b[1] - a[1])[0][0];
};
const constatDe = (analyse, id) => {
  const c = (analyse.criteres || []).find(x => x.id === id);
  return c ? c.constat : "(absent)";
};

console.log("Évaluation · modèle :", MODELE, "·", copies.length, "copie(s) ·", repeat, "passage(s)\n");
console.log("(2 appels modèle par copie et par passage — patiente quelques minutes…)\n");

let vOK = 0, vTot = 0;                 // verdicts
let cOK = 0, cTot = 0;                 // constats annotés
let iOK = 0, iTot = 0;                 // injection
let oOK = 0, oTot = 0;                 // orthographe
let instables = 0;
const divergences = [];

for (const copie of copies) {
  const att = copie.attendu || {};
  const runs = [];
  for (let i = 0; i < repeat; i++) {
    try { runs.push((await precorrigerUne({
      code: copie.code, texte: copie.texte, criteres, cadreAnalyse, cadreMessage,
      modele: MODELE, ollamaUrl: OLLAMA_URL
    })).analyse); }
    catch (e) { runs.push({ _erreur: e.message }); }
  }
  const ok = runs.filter(r => !r._erreur);
  if (ok.length === 0) { divergences.push({ copie, note: "échec moteur : " + runs[0]._erreur }); continue; }

  const verdicts = ok.map(r => r.verdict);
  const verdict = mode(verdicts);
  const stable = verdicts.every(v => v === verdicts[0]);
  if (!stable) instables++;
  const ref = ok[0];                   // 1er passage pour les constats
  const soucis = [];

  // verdict
  if (att.verdict) {
    vTot++;
    if (verdict === att.verdict) vOK++;
    else soucis.push("verdict : attendu « " + att.verdict + " » · obtenu « " + verdict + " »");
  }
  // constats annotés
  for (const [id, attendu] of Object.entries(att.constats || {})) {
    cTot++;
    const obtenu = constatDe(ref, id);
    if (obtenu === attendu) cOK++;
    else soucis.push(id + " : attendu « " + attendu + " » · obtenu « " + obtenu + " »");
  }
  // injection (mécanique)
  if (att.injection !== undefined) {
    iTot++;
    const obtenu = !!(ref.garde_fous && ref.garde_fous.injection_detectee);
    if (obtenu === att.injection) iOK++;
    else soucis.push("injection : attendu " + att.injection + " · obtenu " + obtenu);
  }
  // orthographe (déclenchement attendu)
  if (att.orthographe) {
    oTot++;
    const obtenu = !!(ref.note_orthographe && ref.note_orthographe.trim());
    if (obtenu) oOK++;
    else soucis.push("orthographe : déclenchement attendu, non obtenu");
  }
  // stabilité
  if (!stable) soucis.push("verdict INSTABLE sur " + repeat + " passages : " + verdicts.join(", "));

  if (soucis.length) divergences.push({ copie, verdict, ref, soucis });
}

// ---- rapport
const pct = (a, b) => b ? Math.round(100 * a / b) + "%" : "—";
console.log("═══════════════ RAPPORT DE CONFORMITÉ ═══════════════");
console.log("Verdicts conformes :", vOK + "/" + vTot, "(" + pct(vOK, vTot) + ")");
console.log("Constats vérifiés  :", cOK + "/" + cTot, "(" + pct(cOK, cTot) + ")");
console.log("Injection          :", iOK + "/" + iTot, "(" + pct(iOK, iTot) + ")");
if (oTot) console.log("Orthographe        :", oOK + "/" + oTot, "(" + pct(oOK, oTot) + ")");
if (repeat > 1) console.log("Copies instables   :", instables + "/" + copies.length);
console.log("");

if (divergences.length === 0) {
  console.log("✓ Aucune divergence. Le modèle juge conforme aux attentes sur ce lot.");
} else {
  console.log("─── DIVERGENCES (" + divergences.length + ") ───\n");
  for (const d of divergences) {
    console.log("[" + d.copie.code + "] " + d.copie.label);
    console.log("  « " + d.copie.texte.slice(0, 80).replace(/\s+/g, " ") + (d.copie.texte.length > 80 ? "…" : "") + " »");
    if (d.note) { console.log("  ⚠", d.note, "\n"); continue; }
    for (const s of d.soucis) console.log("  ✗ " + s);
    // justification du modèle pour les critères en cause (contexte)
    for (const s of d.soucis) {
      const m = s.match(/^([A-Z]\d)\s/);
      if (m && d.ref) {
        const c = (d.ref.criteres || []).find(x => x.id === m[1]);
        if (c) console.log("      ↳ justif " + m[1] + " : " + c.justification);
      }
    }
    console.log("");
  }
}
