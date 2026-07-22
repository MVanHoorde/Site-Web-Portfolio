import { calculerVerdict, calculerAide } from "./moteur.mjs";
import { readFileSync } from "node:fs";
const C = JSON.parse(readFileSync(new URL("./criteres-snt.json", import.meta.url), "utf8"));

// Constats RÉELS produits par le modèle au dernier run (étape avant mécanisation).
const cas = [
  ["Solide",   "NET-1b", {R1:"observé",R2:"partiellement",R3:"observé",R4:"non observé",R5:"observé"}, "accepté"],
  ["Moyenne",  "NET-1b", {R1:"observé",R2:"non observé",R3:"partiellement",R4:"non observé",R5:"non observé"}, "accepté"],
  ["Vague",    "NET-1b", {R1:"partiellement",R2:"non observé",R3:"non observé",R4:"non observé",R5:"non observé"}, "à compléter"],
  ["Confusion","NET-1b", {R1:"observé",R2:"non observé",R3:"non observé",R4:"non observé",R5:"non observé"}, "accepté*"],
  ["Fautes",   "NET-1b", {R1:"observé",R2:"non observé",R3:"partiellement",R4:"non observé",R5:"non observé"}, "accepté"],
  ["NET-2c ok","NET-2c", {C1:"observé",C2:"observé",C3:"partiellement",C4:"non observé"}, "accepté"],
  ["Hors-sujet","NET-2c",{C1:"partiellement",C2:"non observé",C3:"non observé",C4:"partiellement"}, "à compléter"],
  ["Diagnostic","NET-1a",{D1:"observé",D2:"non observé",D3:"partiellement"}, "sans objet"],
];

console.log("Cas".padEnd(12), "verdict calculé".padEnd(16), "aide".padEnd(12), "attendu");
console.log("".padEnd(60,"-"));
for (const [label, code, map, attendu] of cas) {
  const grille = C[code];
  const constats = Object.entries(map).map(([id,constat]) => ({id, constat}));
  const { verdict } = calculerVerdict(grille, constats);
  const { suggestion } = calculerAide(grille, constats);
  const ok = attendu.replace("*","") === verdict ? "✓" : "✗ ATTENDU "+attendu;
  console.log(label.padEnd(12), verdict.padEnd(16), suggestion.padEnd(12), ok);
}
