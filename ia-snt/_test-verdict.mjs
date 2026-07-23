import { calculerVerdict, calculerAide } from "./moteur.mjs";
import { readFileSync } from "node:fs";
const C = JSON.parse(readFileSync(new URL("./criteres-snt.json", import.meta.url), "utf8"));

// Constats RÉELS produits par le modèle au dernier run (étape avant mécanisation).
/* Chaque cas déclare le verdict ET l'aide attendus.
   ⚠ Les attendus s'écrivent depuis l'INTENTION, jamais depuis la sortie du
   code : c'est ce qui permet au test d'échouer quand le code a tort.
   L'ancienne version n'assertait que le verdict — d'où un bug de
   `calculerAide` resté invisible jusqu'à l'audit du 23/07/2026. */
const cas = [
  // libellé          code      constats                                                                          verdict        aide
  ["Solide",         "NET-1b", {R1:"observé",R2:"partiellement",R3:"observé",R4:"non observé",R5:"observé"},       "accepté",     "à valider"],
  ["Socle seul",     "NET-1b", {R1:"observé",R2:"non observé",R3:"non observé",R4:"non observé",R5:"non observé"}, "accepté",     "pas encore"],
  ["Moyenne",        "NET-1b", {R1:"observé",R2:"non observé",R3:"partiellement",R4:"non observé",R5:"non observé"}, "accepté",   "pas encore"],
  ["Vague",          "NET-1b", {R1:"partiellement",R2:"non observé",R3:"non observé",R4:"non observé",R5:"non observé"}, "à compléter", "pas encore"],
  ["Fautes",         "NET-1b", {R1:"observé",R2:"non observé",R3:"partiellement",R4:"non observé",R5:"non observé"}, "accepté",   "pas encore"],
  ["NET-2c ok",      "NET-2c", {C1:"observé",C2:"observé",C3:"partiellement",C4:"non observé"},                    "accepté",     "pas encore"],
  ["NET-2c aidant",  "NET-2c", {C1:"observé",C2:"observé",C3:"observé",C4:"non observé"},                          "accepté",     "à valider"],
  ["Hors-sujet",     "NET-2c", {C1:"partiellement",C2:"non observé",C3:"non observé",C4:"partiellement"},           "à compléter", "pas encore"],
  ["Diagnostic",     "NET-1a", {D1:"observé",D2:"non observé",D3:"partiellement"},                                 "sans objet",  "sans objet"],
];

console.log("Cas".padEnd(16), "verdict".padEnd(14), "aide".padEnd(12), "résultat");
console.log("".padEnd(72,"-"));
let echecs = 0;
for (const [label, code, map, verdictAttendu, aideAttendue] of cas) {
  const grille = C[code];
  const constats = Object.entries(map).map(([id,constat]) => ({id, constat}));
  const { verdict } = calculerVerdict(grille, constats);
  const { suggestion, pourquoi } = calculerAide(grille, constats);
  const pbs = [];
  if (verdict   !== verdictAttendu) pbs.push("verdict attendu « "+verdictAttendu+" »");
  if (suggestion !== aideAttendue)  pbs.push("aide attendue « "+aideAttendue+" »");
  if (pbs.length) echecs++;
  console.log(label.padEnd(16), verdict.padEnd(14), suggestion.padEnd(12),
              pbs.length ? "✗ " + pbs.join(" · ") : "✓");
  if (pbs.length) console.log(" ".repeat(16) + "→ " + pourquoi);
}
console.log("".padEnd(72,"-"));
console.log(echecs ? `❌ ${echecs} cas en échec sur ${cas.length}` : `✅ ${cas.length} cas conformes`);
process.exit(echecs ? 1 : 0);
