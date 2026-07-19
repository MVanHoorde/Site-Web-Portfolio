/* ============================================================
   🚧 CHANTIER — pré-correction locale (Ollama, modèle à choisir)
   Usage prévu :  node precorrection.mjs fiche.json
   Prérequis :    Ollama en service local (http://localhost:11434)
                  et un modèle tiré, ex.:  ollama pull qwen3
   ============================================================ */
import { readFileSync } from "node:fs";

const MODELE = process.env.IA_MODELE || "qwen3";      // 🚧 à valider sur copies témoins
const OLLAMA = "http://localhost:11434/api/generate"; // local uniquement (RGPD)

const promptCadre = readFileSync(new URL("./prompt-cadre.md", import.meta.url), "utf8");
const criteres = readFileSync(new URL("./criteres-frise.json", import.meta.url), "utf8");
const fiche = JSON.parse(readFileSync(process.argv[2], "utf8"));

/* Garde-fou d'entrée : jamais de nom, seulement un code pseudonyme. */
if (!/^E-\d{1,2}$/.test(String(fiche.code||"")))
  throw new Error("Fiche refusée : code élève pseudonymisé attendu (E-07).");

const prompt = [
  promptCadre,
  "\n## Grille de critères\n", criteres,
  "\n## Production à pré-corriger (code " + fiche.code + ")\n",
  JSON.stringify(fiche, null, 1)
].join("");

const rep = await fetch(OLLAMA, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ model: MODELE, prompt, stream: false })
});
if (!rep.ok) throw new Error("Ollama injoignable — le modèle local est-il lancé ?");
const { response } = await rep.json();

/* Garde-fou de sortie : si le modèle a produit quelque chose qui ressemble
   à une note, on refuse la sortie entière. Volontaire — ne pas assouplir. */
if (/\b\d{1,2}\s*\/\s*20\b|\bnote\s*[:=]/i.test(response))
  throw new Error("Sortie rejetée : le modèle a produit une note. Ajuster le prompt, pas ce garde-fou.");

console.log(response);
console.log("\n---\n🚧 Rappel : document de travail. La notation appartient à l'enseignant.");
