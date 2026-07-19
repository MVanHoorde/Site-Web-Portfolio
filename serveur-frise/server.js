/* ============================================================
   🚧 CHANTIER — serveur de la frise (squelette de démarrage)
   Node >= 20, sans dépendance externe (http natif) pour rester
   lisible ; on pourra passer à Express/Fastify si besoin.
   Démarrage :  node server.js   →  http://localhost:8600
   ============================================================ */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8600;
const FICHIER = path.join(__dirname, "donnees.json");   // 🚧 remplacer par SQLite
const JETON_ENSEIGNANT = process.env.FRISE_JETON || ""; // 🚧 à définir (jamais en dur)

/* ---- garde-fou structurel : les champs autorisés. Tout champ ressemblant
   à une note est REJETÉ à l'écriture — c'est volontaire (AI Act / souveraineté
   de l'enseignant), ne pas « corriger ». ---- */
const CHAMPS_OK = ["code","sujet","objet","date","texte","source1","source2",
  "acte","place","titre","retenu","bonus","quand"];
const CHAMPS_INTERDITS = /note|score|moyenne|\/20|points?_finals?/i;

function chargerDonnees(){
  try { return JSON.parse(fs.readFileSync(FICHIER, "utf8")); }
  catch(e){ return { contributions:[], tirages:[] }; }
}
function sauver(d){ fs.writeFileSync(FICHIER, JSON.stringify(d, null, 1)); }

function assainir(objet){
  const propre = {};
  for (const k of Object.keys(objet||{})){
    if (CHAMPS_INTERDITS.test(k))
      throw new Error("Champ refusé (« "+k+" ») : aucune note ne transite par ce serveur.");
    if (CHAMPS_OK.includes(k)) propre[k] = objet[k];
  }
  if (propre.code && !/^E-\d{1,2}$/.test(String(propre.code)))
    throw new Error("Code élève attendu au format E-07 (pseudonyme).");
  return propre;
}

const server = http.createServer((req, res) => {
  // 🚧 CORS à restreindre au domaine du site en production
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Enseignant");
  if (req.method === "OPTIONS"){ res.end(); return; }

  const repondre = (code, corps) => {
    res.writeHead(code, {"Content-Type":"application/json; charset=utf-8"});
    res.end(JSON.stringify(corps));
  };
  const lireCorps = () => new Promise(ok => {
    let b = ""; req.on("data", x => b += x); req.on("end", () => {
      try { ok(JSON.parse(b||"{}")); } catch(e){ ok({}); } });
  });
  const estEnseignant = () =>
    JETON_ENSEIGNANT && req.headers["x-enseignant"] === JETON_ENSEIGNANT;

  (async () => {
    const d = chargerDonnees();
    const u = new URL(req.url, "http://x");

    if (u.pathname === "/api/contributions" && req.method === "GET")
      return repondre(200, d.contributions);

    if (u.pathname === "/api/contributions" && req.method === "POST"){
      try {
        const c = assainir(await lireCorps());
        c.quand = Date.now();
        d.contributions.push(c); sauver(d);
        return repondre(201, d.contributions);
      } catch(e){ return repondre(400, { erreur: e.message }); }
    }

    if (u.pathname === "/api/contributions" && req.method === "PUT"){
      if (!estEnseignant()) return repondre(403, { erreur:"Réservé à l'enseignant." });
      try {
        const corps = await lireCorps();
        d.contributions = (corps.contributions||[]).map(assainir);
        sauver(d);
        return repondre(200, d.contributions);
      } catch(e){ return repondre(400, { erreur: e.message }); }
    }

    if (u.pathname === "/api/tirages" && req.method === "GET")
      return repondre(200, d.tirages);

    if (u.pathname === "/api/tirages" && req.method === "POST"){
      const t = await lireCorps();
      if (!/^E-\d{1,2}$/.test(String(t.code||"")))
        return repondre(400, { erreur:"Code élève invalide." });
      const i = d.tirages.findIndex(x => x.code === t.code);
      if (i >= 0 && d.tirages[i].choisi)
        return repondre(409, { erreur:"Sujet déjà choisi — le tirage ne se refait pas.",
                               tirage: d.tirages[i] });
      if (i >= 0) d.tirages[i] = t; else d.tirages.push(t);
      sauver(d);
      return repondre(201, d.tirages);
    }

    // 🚧 GET /api/export.csv (enseignant) — à écrire
    // 🚧 POST /api/precorrection/:id (enseignant) — appelle /ia-correction/precorrection.mjs

    repondre(404, { erreur:"Route inconnue." });
  })();
});

server.listen(PORT, () =>
  console.log("🚧 Serveur frise (chantier) sur http://localhost:" + PORT));
