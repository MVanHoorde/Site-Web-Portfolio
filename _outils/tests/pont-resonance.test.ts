// Épreuve de la fonction pont-resonance (supabase/functions/pont-resonance/pont.ts),
// avec un faux réseau : Résonance (qui est ce jeton ?) et l'API d'administration des comptes.
//   deno test --allow-env _outils/tests/pont-resonance.test.ts      (depuis la racine du dépôt)
import { assert, assertEquals } from "jsr:@std/assert@1";
import { classeTerminale, traiter } from "../../supabase/functions/pont-resonance/pont.ts";

const ENV = { url: "https://ztyv.test", service: "cle-service" };
const UUID = "11111111-2222-3333-4444-555555555555";
const JETON = "aaa.bbb.ccc";

type Faux = {
  resonance?: { statut: number; corps?: unknown };
  creation?: number;
  lienMeta?: Record<string, unknown>;
};

function installer(f: Faux) {
  const appels: { url: string; corps: any; entetes: Headers }[] = [];
  globalThis.fetch = (async (entree: string | URL | Request, init?: RequestInit) => {
    const url = String(entree);
    const corps = init?.body ? JSON.parse(String(init.body)) : null;
    appels.push({ url, corps, entetes: new Headers(init?.headers) });
    if (url.endsWith("/auth/v1/user")) {
      const r = f.resonance ?? { statut: 200, corps: { id: UUID, app_metadata: { role: "eleve", classe: "B1_T_3_PH-CH_VANHOORDE", identifiant: "PC-AB12C" } } };
      return new Response(JSON.stringify(r.corps ?? {}), { status: r.statut });
    }
    if (url === `${ENV.url}/auth/v1/admin/users`) {
      return new Response(JSON.stringify({ id: "compte-ztyv" }), { status: f.creation ?? 200 });
    }
    if (url === `${ENV.url}/auth/v1/admin/generate_link`) {
      const meta = f.lienMeta ?? { pont: "resonance", resonance_id: UUID, identifiant: "PC-AB12C" };
      return new Response(JSON.stringify({ id: "compte-ztyv", app_metadata: meta, hashed_token: "ticket-123" }), { status: 200 });
    }
    return new Response("inattendu", { status: 500 });
  }) as typeof fetch;
  return appels;
}

const requete = (corps: unknown, origine = "https://mvanhoorde.github.io", methode = "POST") =>
  new Request("https://ztyv.test/functions/v1/pont-resonance", {
    method: methode,
    headers: { Origin: origine, "Content-Type": "application/json" },
    body: methode === "POST" ? JSON.stringify(corps) : undefined,
  });

Deno.test("règle des terminales identique à commun.js", () => {
  for (const c of ["B1_T_3_PH-CH_VANHOORDE", "TEST", "Tle spé 1"]) assert(classeTerminale(c), c);
  for (const c of ["B2_P_3_PH-CH_HUSSON", "", null, "1re spé"]) assert(!classeTerminale(c), String(c));
});

Deno.test("OPTIONS : CORS pour l'origine des dépôts, et repli pour une autre", async () => {
  installer({});
  let r = await traiter(requete(null, "https://mvanhoorde.github.io", "OPTIONS"), ENV);
  assertEquals(r.headers.get("Access-Control-Allow-Origin"), "https://mvanhoorde.github.io");
  r = await traiter(requete(null, "https://exemple.com", "OPTIONS"), ENV);
  assertEquals(r.headers.get("Access-Control-Allow-Origin"), "https://mvanhoorde.github.io");
  r = await traiter(requete(null, "http://127.0.0.1:8000", "OPTIONS"), ENV);
  assertEquals(r.headers.get("Access-Control-Allow-Origin"), "http://127.0.0.1:8000");
});

Deno.test("sans jeton : 400, Résonance n'est même pas interrogée", async () => {
  const appels = installer({});
  const r = await traiter(requete({}), ENV);
  assertEquals(r.status, 400);
  assertEquals(appels.length, 0);
});

Deno.test("jeton refusé par Résonance : 401, aucun compte créé", async () => {
  const appels = installer({ resonance: { statut: 401 } });
  const r = await traiter(requete({ jeton: JETON }), ENV);
  assertEquals(r.status, 401);
  assertEquals((await r.json()).erreur, "SESSION_RESONANCE");
  assertEquals(appels.length, 1);
});

for (const [cas, meta] of [
  ["élève de première", { role: "eleve", classe: "B2_P_3_PH-CH_HUSSON", identifiant: "PC-AB12C" }],
  ["enseignant", { role: "prof", classe: null, identifiant: "PR-AB12C" }],
  ["classe inconnue", { role: "eleve", identifiant: "PC-AB12C" }],
] as const) {
  Deno.test(`${cas} : 403, aucun compte créé`, async () => {
    const appels = installer({ resonance: { statut: 200, corps: { id: UUID, app_metadata: meta } } });
    const r = await traiter(requete({ jeton: JETON }), ENV);
    assertEquals(r.status, 403);
    assertEquals((await r.json()).erreur, "RESERVE_TERMINALE");
    assertEquals(appels.length, 1);
  });
}

Deno.test("terminale, premier passage : compte sans nom créé, ticket rendu", async () => {
  const appels = installer({});
  const r = await traiter(requete({ jeton: JETON }), ENV);
  assertEquals(r.status, 200);
  assertEquals(await r.json(), { ticket: "ticket-123", identifiant: "PC-AB12C" });
  // Le jeton de l'élève part chez Résonance, et nulle part ailleurs.
  assertEquals(appels[0].entetes.get("Authorization"), `Bearer ${JETON}`);
  assert(appels.slice(1).every((a) => a.entetes.get("Authorization") === "Bearer cle-service"));
  const creation = appels[1].corps;
  assertEquals(creation.email, `${UUID}@resonance.local`);
  assertEquals(creation.email_confirm, true);
  assertEquals(creation.app_metadata, { pont: "resonance", resonance_id: UUID, identifiant: "PC-AB12C" });
  assert(/[a-z]/.test(creation.password) && /[A-Z]/.test(creation.password) && /\d/.test(creation.password));
  assertEquals(appels[2].corps, { type: "magiclink", email: `${UUID}@resonance.local` });
});

Deno.test("deux passages : mots de passe différents, jamais réutilisés", async () => {
  const a = installer({});
  await traiter(requete({ jeton: JETON }), ENV);
  const b = installer({});
  await traiter(requete({ jeton: JETON }), ENV);
  assert(a[1].corps.password !== b[1].corps.password);
});

Deno.test("compte de TEST (classe « TEST ») : accepté", async () => {
  installer({ resonance: { statut: 200, corps: { id: UUID, app_metadata: { role: "eleve", classe: "TEST", identifiant: "PC-TEST1" } } }, lienMeta: { pont: "resonance", resonance_id: UUID } });
  const r = await traiter(requete({ jeton: JETON }), ENV);
  assertEquals(r.status, 200);
});

Deno.test("compte déjà créé par le pont (422) : retrouvé, ticket rendu", async () => {
  installer({ creation: 422 });
  const r = await traiter(requete({ jeton: JETON }), ENV);
  assertEquals(r.status, 200);
  assertEquals((await r.json()).ticket, "ticket-123");
});

Deno.test("compte préparé par un tiers à la même adresse : refusé (409), pas de ticket", async () => {
  installer({ creation: 422, lienMeta: {} });
  const r = await traiter(requete({ jeton: JETON }), ENV);
  assertEquals(r.status, 409);
  const corps = await r.json();
  assertEquals(corps.erreur, "COMPTE_ETRANGER");
  assertEquals(corps.ticket, undefined);
});

Deno.test("compte d'un autre élève Résonance (resonance_id différent) : refusé", async () => {
  installer({ creation: 422, lienMeta: { pont: "resonance", resonance_id: "99999999-2222-3333-4444-555555555555" } });
  const r = await traiter(requete({ jeton: JETON }), ENV);
  assertEquals(r.status, 409);
});

Deno.test("panne de l'API des comptes : 502, pas de ticket", async () => {
  installer({ creation: 500 });
  const r = await traiter(requete({ jeton: JETON }), ENV);
  assertEquals(r.status, 502);
});
