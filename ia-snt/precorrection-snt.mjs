/* ============================================================
   Pré-correction SNT — worker local
   ÉTAPE 4 : deux temps + verdict/aide calculés en code + garde-fous.

   Le worker lit reponses_libres (statut 'en_attente', correction_ia
   NULL), délègue tout le raisonnement à moteur.mjs (partagé avec le
   banc d'essai), et écrit le résultat dans correction_ia. Le statut
   n'est JAMAIS touché : 'en_attente' = attend TA correction.

   Verdict, aide aux camarades et garde-fous (rejet de note, format,
   anti-injection) sont dans moteur.mjs — déterministes, hors du modèle.

   Usage :  node precorrection-snt.mjs      (depuis le dossier ia-snt/)
   Prérequis : Node 18+ · .env renseigné · Ollama lancé, modèle tiré.
   ============================================================ */
import { readFileSync } from "node:fs";
import { precorrigerUne } from "./moteur.mjs";

function lireEnv() {
  let txt;
  try { txt = readFileSync(new URL("./.env", import.meta.url), "utf8"); }
  catch { throw new Error("ia-snt/.env introuvable. Copie .env.exemple en .env et renseigne-le."); }
  const env = {};
  for (const ligne of txt.split(/\r?\n/)) {
    const l = ligne.trim();
    if (!l || l.startsWith("#")) continue;
    const i = l.indexOf("=");
    if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  }
  return env;
}

const env      = lireEnv();
const URL_BASE = env.SUPABASE_URL;
const SERVICE  = env.SUPABASE_SERVICE_ROLE;
if (!URL_BASE || !SERVICE)
  throw new Error("SUPABASE_URL et SUPABASE_SERVICE_ROLE doivent être renseignés dans ia-snt/.env");

const MODELE     = env.IA_MODELE  || "mistral-nemo";
const OLLAMA_URL = env.OLLAMA_URL || "http://localhost:11434";

const criteres     = JSON.parse(readFileSync(new URL("./criteres-snt.json",  import.meta.url), "utf8"));
const cadreAnalyse = readFileSync(new URL("./prompt-cadre.md",   import.meta.url), "utf8");
const cadreMessage = readFileSync(new URL("./prompt-message.md", import.meta.url), "utf8");

const REST = URL_BASE.replace(/\/+$/, "") + "/rest/v1/reponses_libres";
const entetes = {
  "apikey": SERVICE,
  "Authorization": "Bearer " + SERVICE,
  "Content-Type": "application/json"
};

console.log("→ base :", URL_BASE.replace(/^https?:\/\//, "").split(".")[0],
            "· clé chargée (" + SERVICE.length + " car.)", "· modèle :", MODELE);

const urlLire = REST +
  "?statut=eq.en_attente&correction_ia=is.null" +
  "&select=id,code_activite,texte&order=envoye_le.asc&limit=20";
const repLire = await fetch(urlLire, { headers: entetes });
if (!repLire.ok)
  throw new Error("Lecture refusée (" + repLire.status + "). Clé service_role correcte ?");
const enAttente = await repLire.json();

if (enAttente.length === 0) {
  console.log("Rien à pré-corriger : aucune réponse en attente sans correction.");
  process.exit(0);
}
console.log("À traiter :", enAttente.length, "réponse(s).\n");

let ok = 0;
for (const r of enAttente) {
  let precorrection;
  try {
    precorrection = await precorrigerUne({
      code: r.code_activite, texte: r.texte,
      criteres, cadreAnalyse, cadreMessage, modele: MODELE, ollamaUrl: OLLAMA_URL
    });
  } catch (e) { console.error("  ✗", r.code_activite, "—", e.message); continue; }

  const patch = await fetch(REST + "?id=eq." + encodeURIComponent(r.id), {
    method: "PATCH",
    headers: { ...entetes, "Prefer": "return=minimal" },
    body: JSON.stringify({ correction_ia: precorrection })   // statut : inchangé
  });
  if (!patch.ok) { console.error("  ✗ écriture", r.code_activite, "(" + patch.status + ")"); continue; }

  const a = precorrection.analyse;
  const marque = a.tri && a.tri.a_verifier ? "  ⚠ à vérifier — " + a.tri.raisons.join(" ; ") : "";
  console.log("  ✓", r.code_activite, "→ verdict:", a.verdict, marque);
  ok++;
}

console.log("\nTerminé :", ok, "pré-correction(s) écrite(s).");
console.log("Table Editor → reponses_libres : correction_ia rempli · statut reste 'en_attente'.");
