/* ============================================================
   Banc d'essai de la GRILLE — local, SANS Supabase (étape 4).
   Utilise le MÊME moteur que le worker : ce que tu vois ici est ce
   que tu obtiendras en production. Rien n'est écrit en base.

   Usage :  node banc-essai.mjs            (toutes les copies)
            node banc-essai.mjs NET-1b     (un seul code)
   Prérequis : Ollama lancé + modèle tiré (ollama pull mistral-nemo).
   ============================================================ */
import { readFileSync } from "node:fs";
import { precorrigerUne } from "./moteur.mjs";

const MODELE     = process.env.IA_MODELE  || "mistral-nemo";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

const criteres     = JSON.parse(readFileSync(new URL("./criteres-snt.json",  import.meta.url), "utf8"));
const cadreAnalyse = readFileSync(new URL("./prompt-cadre.md",   import.meta.url), "utf8");
const cadreMessage = readFileSync(new URL("./prompt-message.md", import.meta.url), "utf8");
const lot          = JSON.parse(readFileSync(new URL("./copies-test.json", import.meta.url), "utf8"));

const filtre = process.argv[2];
const copies = lot.copies.filter(c => !filtre || c.code === filtre);
console.log("Banc d'essai · modèle :", MODELE, "·", copies.length, "copie(s)\n");

function afficher(a) {
  for (const c of (a.criteres || []))
    console.log("   " + (c.id || "?").padEnd(4), (c.constat || "?").padEnd(14), "—", c.justification || "");
  console.log("   ─────");
  console.log("   ★ VERDICT :", a.verdict, "   (calculé en code)");
  if (a.feedback_eleve && a.feedback_eleve.message) console.log("   ★ élève   :", a.feedback_eleve.message);
  if (a.feedback_eleve && a.feedback_eleve.pour_aller_plus_loin) console.log("   ★ + loin  :", a.feedback_eleve.pour_aller_plus_loin);
  if (a.aide_camarades) console.log("   ⇄ aide    :", a.aide_camarades.suggestion, "(" + a.aide_camarades.pourquoi + ")");
  if (a.a_verifier_par_le_prof) console.log("   ! à vérif :", a.a_verifier_par_le_prof);
  if (a.note_orthographe) console.log("   ✎ ortho   :", a.note_orthographe);
  const g = a.garde_fous || {};
  console.log("   🛡 garde-fous : injection=" + !!g.injection_detectee,
              "· note_rejetée=" + !!g.note_rejetee, "· format_ok=" + (g.format_ok !== false));
  if (a.brut) console.log("   (passe 1 non-JSON) :", a.brut.slice(0, 160));
}

for (const c of copies) {
  console.log("──────────────────────────────────────────────────────────");
  console.log("[" + c.code + "] " + c.label);
  console.log("  « " + c.texte.slice(0, 88).replace(/\s+/g, " ") + (c.texte.length > 88 ? "…" : "") + " »");
  try {
    const res = await precorrigerUne({
      code: c.code, texte: c.texte, criteres, cadreAnalyse, cadreMessage,
      modele: MODELE, ollamaUrl: OLLAMA_URL
    });
    afficher(res.analyse);
  } catch (e) { console.error("   ✗", e.message); }
  console.log("");
}
console.log("Fin du banc d'essai.");
