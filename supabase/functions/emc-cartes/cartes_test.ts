// Banc d'essai de cartes.ts, sur un faux réseau (aucun appel réel).
//   deno test supabase/functions/emc-cartes/cartes_test.ts
import { assert, assertEquals } from "jsr:@std/assert@1";
import { code, identifiant, motDePasse, MOTS, traiter } from "./cartes.ts";

const ENV = { url: "https://projet.test", service: "cle-service", anon: "cle-anon" };
const JETON_PROF = "aaa.bbb.ccc";
const CLASSE = "11111111-2222-3333-4444-555555555555";

type Appel = { methode: string; chemin: string; entetes: Headers; corps: any };

/** Un faux Supabase : comptes, refus réglables. */
function fauxReseau(opts: { refuserProf?: boolean; prefixe?: string | null; prisDeja?: Set<string>; inscriptionRate?: number } = {}) {
  const appels: Appel[] = [];
  const comptes = new Map<string, string>(); // id → email
  const pris = opts.prisDeja ?? new Set<string>();
  let n = 0, inscriptions = 0;
  globalThis.fetch = async (entree: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(entree));
    const corps = init?.body ? JSON.parse(String(init.body)) : null;
    const entetes = new Headers(init?.headers);
    appels.push({ methode: init?.method ?? "GET", chemin: url.pathname, entetes, corps });
    const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s });
    if (url.pathname === "/rest/v1/rpc/emc_cartes_autoriser") {
      if (opts.refuserProf || entetes.get("Authorization") !== `Bearer ${JETON_PROF}`) return json({ message: "PAS_MA_CLASSE" }, 403);
      return json({ prefixe: opts.prefixe === undefined ? "d" : opts.prefixe, libelle: "Groupe D", cartes: 0 });
    }
    if (url.pathname === "/auth/v1/admin/users" && init?.method === "POST") {
      if (entetes.get("Authorization") !== `Bearer ${ENV.service}`) return json({}, 401);
      if (pris.has(corps.email)) return json({ code: "email_exists" }, 422);
      pris.add(corps.email);
      const id = `00000000-0000-0000-0000-${String(++n).padStart(12, "0")}`;
      comptes.set(id, corps.email);
      return json({ id, email: corps.email });
    }
    if (url.pathname === "/rest/v1/rpc/emc_carte_inscrire") {
      inscriptions++;
      if (opts.inscriptionRate && inscriptions === opts.inscriptionRate) return json({ message: "boom" }, 500);
      return json(crypto.randomUUID());
    }
    if (url.pathname.startsWith("/auth/v1/admin/users/") && init?.method === "DELETE") {
      comptes.delete(url.pathname.split("/").pop()!);
      return json({});
    }
    return json({ message: "inconnu" }, 404);
  };
  return { appels, comptes };
}

const requete = (corps: unknown, jeton = JETON_PROF, methode = "POST") =>
  new Request("https://projet.test/functions/v1/emc-cartes", {
    method: methode,
    headers: { Authorization: `Bearer ${jeton}`, "Content-Type": "application/json", Origin: "https://mvanhoorde.github.io" },
    body: methode === "POST" ? JSON.stringify(corps) : undefined,
  });

Deno.test("identifiants et codes : au bon format", () => {
  for (let i = 0; i < 500; i++) {
    assert(/^d-[a-z]{3,12}-[0-9]{2}$/.test(identifiant("d")), identifiant("d"));
    assert(/^[0-9]{4}$/.test(code()));
  }
  assert(MOTS.every((m) => /^[a-z]{3,12}$/.test(m)));
  assertEquals(new Set(MOTS).size, MOTS.length);
});

Deno.test("le mot de passe dérivé respecte la politique du projet", () => {
  const m = motDePasse("0042");
  assert(m.length >= 6 && /[a-z]/.test(m) && /[A-Z]/.test(m) && /[0-9]/.test(m));
  assertEquals(m, "Emc-0042");
});

Deno.test("35 cartes d'un coup", async () => {
  const { appels, comptes } = fauxReseau();
  const r = await traiter(requete({ classe_id: CLASSE, nombre: 35 }), ENV);
  assertEquals(r.status, 200);
  const j = await r.json();
  assertEquals(j.cartes.length, 35);
  assertEquals(j.ratees, 0);
  assertEquals(new Set(j.cartes.map((c: any) => c.identifiant)).size, 35);
  assertEquals(comptes.size, 35);
  // chaque compte : la bonne adresse, le mot de passe dérivé, confirmé
  for (const a of appels.filter((x) => x.chemin === "/auth/v1/admin/users")) {
    assert(/^d-[a-z]+-\d\d@emc\.local$/.test(a.corps.email));
    assert(/^Emc-\d{4}$/.test(a.corps.password));
    assertEquals(a.corps.email_confirm, true);
  }
  // le code rendu est bien celui du mot de passe
  const parEmail = new Map(appels.filter((x) => x.chemin === "/auth/v1/admin/users").map((x) => [x.corps.email, x.corps.password]));
  for (const c of j.cartes) assertEquals(parEmail.get(`${c.identifiant}@emc.local`), `Emc-${c.code}`);
  // l'autorisation passe par le jeton du PROF, avec la clé anon
  const aut = appels.find((x) => x.chemin === "/rest/v1/rpc/emc_cartes_autoriser")!;
  assertEquals(aut.entetes.get("Authorization"), `Bearer ${JETON_PROF}`);
  assertEquals(aut.entetes.get("apikey"), ENV.anon);
});

Deno.test("un prof d'une autre classe : refus, aucun compte créé", async () => {
  const { comptes } = fauxReseau({ refuserProf: true });
  const r = await traiter(requete({ classe_id: CLASSE, nombre: 5 }), ENV);
  assertEquals(r.status, 403);
  assertEquals(comptes.size, 0);
});

Deno.test("sans jeton : refus", async () => {
  fauxReseau();
  const r = await traiter(new Request("https://x/functions/v1/emc-cartes", { method: "POST", body: "{}" }), ENV);
  assertEquals(r.status, 401);
});

Deno.test("nombre hors bornes, classe mal formée : refus", async () => {
  fauxReseau();
  assertEquals((await traiter(requete({ classe_id: CLASSE, nombre: 0 }), ENV)).status, 400);
  assertEquals((await traiter(requete({ classe_id: CLASSE, nombre: 41 }), ENV)).status, 400);
  assertEquals((await traiter(requete({ classe_id: "x", nombre: 3 }), ENV)).status, 400);
});

Deno.test("classe sans préfixe (pas une classe EMC) : refus", async () => {
  const { comptes } = fauxReseau({ prefixe: null });
  assertEquals((await traiter(requete({ classe_id: CLASSE, nombre: 3 }), ENV)).status, 403);
  assertEquals(comptes.size, 0);
});

Deno.test("identifiant déjà pris : on en tire un autre", async () => {
  // le tirage rend d'abord deux fois le même identifiant, déjà pris en base
  const deja = new Set([`d-${MOTS[0]}-01@emc.local`]);
  fauxReseau({ prisDeja: deja });
  const suite = [0, 0, 1234, /* pris */ 0, 0, /* encore pris */ 1, 1, 42];
  let i = 0;
  const tirer = (n: number) => (i < suite.length ? suite[i++] % n : Math.floor(Math.random() * n));
  const j = await (await traiter(requete({ classe_id: CLASSE, nombre: 1 }), ENV, tirer)).json();
  assertEquals(j.cartes.length, 1);
  assert(j.cartes[0].identifiant !== `d-${MOTS[0]}-01`);
});

Deno.test("inscription ratée : le compte créé est supprimé", async () => {
  const { comptes } = fauxReseau({ inscriptionRate: 1 });
  const j = await (await traiter(requete({ classe_id: CLASSE, nombre: 1 }), ENV)).json();
  assertEquals(j.cartes.length, 1);  // le second essai passe
  assertEquals(comptes.size, 1);     // et le premier compte n'a pas survécu
});

Deno.test("CORS : la requête préalable passe, l'origine du site est renvoyée", async () => {
  const r = await traiter(new Request("https://x", { method: "OPTIONS", headers: { Origin: "https://mvanhoorde.github.io" } }), ENV);
  assertEquals(r.status, 200);
  assertEquals(r.headers.get("Access-Control-Allow-Origin"), "https://mvanhoorde.github.io");
});
