#!/usr/bin/env node
/* ============================================================
   cfa-pager.mjs — pose (ou remet à jour) la navigation « outil
   précédent / index / outil suivant » au pied des dix-sept fiches
   du livret CFA.

     node cfa-pager.mjs            écrit les fichiers
     node cfa-pager.mjs --essai    montre ce qui changerait, n'écrit rien

   Aucune dépendance : Node 18+ et rien d'autre.

   ------------------------------------------------------------
   POURQUOI UN SCRIPT PLUTÔT QUE DIX-SEPT COPIER-COLLER
   ------------------------------------------------------------
   L'ordre des outils vit dans UN seul endroit : cfa/index.html.
   Ce script le lit et en déduit les liens. Le jour où un outil
   change de titre ou de rang, on corrige l'index et on relance —
   on ne repasse pas sur dix-sept pieds de page à la main, ce qui
   est exactement le genre de tâche où l'on en oublie un.

   Le script est IDEMPOTENT : relancé, il remplace le pager
   existant au lieu d'en ajouter un second.
   ============================================================ */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RACINE = process.cwd();
const ESSAI = process.argv.includes("--essai");
const DOSSIER = join(RACINE, "cfa");

/* ------------------------------------------------------------
   1. Lire l'ordre des outils dans l'index
   ------------------------------------------------------------ */
const index = readFileSync(join(DOSSIER, "index.html"), "utf8");

const outils = [];
const motif = /<div class="outil" data-outil="(\d{2})">[\s\S]*?<a href="(outil-[^"]+\.html)">([^<]+)<\/a>/g;
let m;
while ((m = motif.exec(index)) !== null) {
  outils.push({ num: m[1], fichier: m[2], titre: m[3].trim() });
}

if (outils.length === 0) {
  console.error("Aucun outil trouvé dans cfa/index.html — structure changée ?");
  process.exit(1);
}
console.log(`${outils.length} outils lus dans l'index.`);

/* ------------------------------------------------------------
   2. Fabriquer le pager d'une fiche
   ------------------------------------------------------------
   Le libellé porte le NUMÉRO ET LE TITRE de l'outil visé. « Outil
   suivant → » seul n'apprend rien à l'élève sur ce qui l'attend.

   Aux deux extrémités, le lien manquant est remplacé par un
   <span class="vide"> de même gabarit : sans lui, le lien restant
   sauterait d'un côté de la page à l'autre selon la fiche.
   ------------------------------------------------------------ */
function libelle(o) {
  return `${Number(o.num)} · ${o.titre}`;
}

function pager(i) {
  const prec = i > 0 ? outils[i - 1] : null;
  const suiv = i < outils.length - 1 ? outils[i + 1] : null;

  const blocPrec = prec
    ? `    <a class="prec" href="${prec.fichier}">\n` +
      `      <span class="sens">Outil précédent</span>\n` +
      `      <span class="quoi">${libelle(prec)}</span>\n` +
      `    </a>`
    : `    <span class="vide" aria-hidden="true"></span>`;

  const blocSuiv = suiv
    ? `    <a class="suiv" href="${suiv.fichier}">\n` +
      `      <span class="sens">Outil suivant</span>\n` +
      `      <span class="quoi">${libelle(suiv)}</span>\n` +
      `    </a>`
    : `    <span class="vide" aria-hidden="true"></span>`;

  return (
    `  <nav class="pager" aria-label="Navigation entre les outils">\n` +
    `${blocPrec}\n` +
    `    <a class="index" href="index.html">Les dix-sept outils</a>\n` +
    `${blocSuiv}\n` +
    `  </nav>`
  );
}

/* ------------------------------------------------------------
   3. Poser le pager, juste avant </article>
   ------------------------------------------------------------ */
const PAGER_EXISTANT = /[ \t]*<nav class="pager"[\s\S]*?<\/nav>\n?/;

let ecrits = 0;
let inchanges = 0;

outils.forEach((o, i) => {
  const chemin = join(DOSSIER, o.fichier);
  let html;
  try {
    html = readFileSync(chemin, "utf8");
  } catch {
    console.warn(`  ⚠ ${o.fichier} — fichier absent, ignoré`);
    return;
  }

  const bloc = pager(i);
  let sortie;

  if (PAGER_EXISTANT.test(html)) {
    sortie = html.replace(PAGER_EXISTANT, bloc + "\n");
  } else if (html.includes("</article>")) {
    sortie = html.replace("</article>", `\n${bloc}\n\n</article>`);
  } else {
    console.warn(`  ⚠ ${o.fichier} — pas de </article>, ignoré`);
    return;
  }

  /* Le pager arrive avec la version 5 de la feuille commune : sans
     ce coup de pouce, un navigateur qui a l'ancienne en cache
     afficherait trois liens sans mise en forme. */
  sortie = sortie.replace(/cfa-commun\.css\?v=\d+/g, "cfa-commun.css?v=5");

  if (sortie === html) {
    inchanges++;
    return;
  }
  if (!ESSAI) writeFileSync(chemin, sortie, "utf8");
  console.log(`  ${ESSAI ? "≈" : "✓"} ${o.fichier}`);
  ecrits++;
});

/* L'index lui-même n'a pas de pager mais charge la même feuille. */
{
  const chemin = join(DOSSIER, "index.html");
  const sortie = index.replace(/cfa-commun\.css\?v=\d+/g, "cfa-commun.css?v=5");
  if (sortie !== index) {
    if (!ESSAI) writeFileSync(chemin, sortie, "utf8");
    console.log(`  ${ESSAI ? "≈" : "✓"} index.html (version de feuille)`);
    ecrits++;
  }
}

console.log(
  ESSAI
    ? `\n${ecrits} fichier(s) seraient modifiés, ${inchanges} déjà à jour.`
    : `\n${ecrits} fichier(s) écrits, ${inchanges} déjà à jour.`
);
