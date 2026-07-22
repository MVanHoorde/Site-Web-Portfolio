/* ============================================================
   Pré-correction SNT — worker local
   ÉTAPE 1 : la plomberie (lecture + écriture), SANS modèle.

   Ce que fait ce script :
     1. lit dans reponses_libres les réponses 'en_attente' qui n'ont
        pas encore de correction_ia ;
     2. écrit dans chacune une pré-correction FACTICE (stub), pour
        prouver l'aller-retour PC ↔ base.

   Il NE change PAS le statut : celui-ci reste 'en_attente'
   (= attend TA correction). correction_ia = travail préparatoire de
   l'IA ; c'est Loïc qui valide (statut → 'corrige'). La présence de
   correction_ia suffit à ce que le worker ne reprenne pas la ligne.

   Étapes suivantes (plus tard) :
     2. brancher le modèle local (Ollama + Qwen 3) ;
     3. les consignes SNT (criteres-snt.json, par code_activite) ;
     4. durcir les garde-fous (anti-injection, jamais de note, format).

   Usage :  node precorrection-snt.mjs      (depuis le dossier ia-snt/)
   Prérequis : Node 18+ · un fichier .env renseigné (voir .env.exemple).
   ============================================================ */
import { readFileSync } from "node:fs";

/* --- Config depuis .env (JAMAIS commité — voir .gitignore) --------- */
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

const REST = URL_BASE.replace(/\/+$/, "") + "/rest/v1/reponses_libres";
const entetes = {
  "apikey": SERVICE,
  "Authorization": "Bearer " + SERVICE,
  "Content-Type": "application/json"
};

/* Confirmation SANS jamais afficher la clé. */
console.log("→ base :", URL_BASE.replace(/^https?:\/\//, "").split(".")[0],
            "· clé service_role chargée (" + SERVICE.length + " caractères)");

/* --- 1. Lire les réponses en attente, pas encore pré-corrigées ---- */
const urlLire = REST +
  "?statut=eq.en_attente&correction_ia=is.null" +
  "&select=id,code_activite,texte&order=envoye_le.asc&limit=20";

const repLire = await fetch(urlLire, { headers: entetes });
if (!repLire.ok)
  throw new Error("Lecture refusée (" + repLire.status + "). La clé service_role est-elle correcte ?");
const enAttente = await repLire.json();

if (enAttente.length === 0) {
  console.log("Rien à pré-corriger : aucune réponse en attente sans correction.");
  process.exit(0);
}
console.log("À traiter :", enAttente.length, "réponse(s).\n");

/* --- 2. Pour chacune : écrire une pré-correction FACTICE ---------- */
let ok = 0;
for (const r of enAttente) {
  const precorrection = {
    modele: "stub-plomberie",
    genere_le: new Date().toISOString(),
    mention: "Préparation de correction — la notation appartient à l'enseignant.",
    message: "Plomberie testée : lecture + écriture OK. Le modèle local sera branché à l'étape 2."
  };

  const patch = await fetch(REST + "?id=eq." + encodeURIComponent(r.id), {
    method: "PATCH",
    headers: { ...entetes, "Prefer": "return=minimal" },
    body: JSON.stringify({ correction_ia: precorrection })   // statut : inchangé
  });

  if (!patch.ok) { console.error("  ✗ échec sur", r.code_activite, "(" + patch.status + ")"); continue; }
  const apercu = r.texte.replace(/\s+/g, " ").slice(0, 40);
  console.log("  ✓", r.code_activite, "—", apercu + (r.texte.length > 40 ? "…" : ""));
  ok++;
}

console.log("\nTerminé :", ok, "pré-correction(s) écrite(s).");
console.log("Vérifie dans Supabase → Table Editor → reponses_libres :");
console.log("  • correction_ia est rempli · statut reste 'en_attente'.");
