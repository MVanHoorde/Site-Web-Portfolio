// pont-resonance — un élève de terminale connecté à Résonance entre dans la Boîte à cartes
// (Leitner) sans compte ni mot de passe de plus.
//
// Le principe de « Se connecter avec Google » :
//   1. Résonance envoie ici le jeton de session de l'élève (projet mnqc…).
//   2. On ne le croit pas sur parole : on demande à Résonance, de serveur à serveur, à qui il
//      appartient. Rôle et classe viennent de app_metadata, que l'élève ne peut pas modifier.
//   3. Élève de terminale (même règle que classeTerminale() de Résonance) : on crée, ou on
//      retrouve, son compte de ce projet-ci (ztyv…), puis on rend un TICKET de connexion à
//      usage unique (le token_hash d'un lien magique, jamais envoyé par courriel).
//   4. Leitner échange le ticket contre une session (POST /auth/v1/verify).
//
// Le compte créé ne porte aucun nom : adresse <uuid Résonance>@resonance.local, mot de passe
// tiré au hasard et jeté, identifiant PC-XXXXX (déjà un pseudonyme) dans app_metadata. Il n'est
// inscrit dans aucune classe du site : les tables leitner_* ne demandent que le compte.
//
// Un compte de cette adresse qui n'aurait PAS été créé ici (inscription libre par /signup, qui
// ne peut pas écrire app_metadata) est refusé : sinon, qui devinerait l'uuid d'un élève pourrait
// préparer un compte à son nom et lire ses révisions.
//
// Logique seule : index.ts la sert, pont_test.ts l'éprouve avec un faux réseau.
//
// Déploiement (depuis Site-Web-Portfolio/, CLI liée à ztyv…) :
//   supabase functions deploy pont-resonance --no-verify-jwt
// « no-verify-jwt » : l'appelant n'a pas de session de ce projet, seulement celle de Résonance.

const RESONANCE_URL = Deno.env.get("RESONANCE_URL") ?? "https://mnqcmjmypkleptbmqtws.supabase.co";
// Clé « anon » de Résonance : publique par conception (commun.js la publie déjà).
const RESONANCE_ANON = Deno.env.get("RESONANCE_ANON") ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucWNtam15cGtsZXB0Ym1xdHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3OTg2MzgsImV4cCI6MjEwNTM3NDYzOH0.6D3QDDW4DYm_xErBwCom6xdKeMhOUf1TbUDZPN-Q0bc";
const DOMAINE = "resonance.local";

// Les quatre dépôts partagent l'origine mvanhoorde.github.io ; 127.0.0.1 et localhost pour les essais.
const ORIGINES = /^(https:\/\/mvanhoorde\.github\.io|http:\/\/(127\.0\.0\.1|localhost)(:\d+)?)$/;

function entetes(origine: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origine && ORIGINES.test(origine) ? origine : "https://mvanhoorde.github.io",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json",
  };
}

/** Même règle que RESONANCE.classeTerminale (commun.js) et classe_terminale() (migration 006). */
export function classeTerminale(c: unknown): boolean {
  const s = String(c ?? "").trim();
  return /_T_/i.test(s) || /^t/i.test(s);
}

function motDePasseJetable(): string {
  const octets = crypto.getRandomValues(new Uint8Array(32));
  // Majuscule, minuscule et chiffre garantis : la politique de mots de passe du projet les exige.
  return "Aa1-" + btoa(String.fromCharCode(...octets));
}

export async function traiter(req: Request, env: { url: string; service: string }): Promise<Response> {
  const h = entetes(req.headers.get("Origin"));
  const repondre = (corps: unknown, statut = 200) => new Response(JSON.stringify(corps), { status: statut, headers: h });
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return repondre({ erreur: "METHODE" }, 405);

  let jeton = "";
  try {
    jeton = String((await req.json()).jeton ?? "");
  } catch { /* corps illisible : traité comme un jeton absent */ }
  if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(jeton)) return repondre({ erreur: "JETON_ABSENT" }, 400);

  // 2. Qui est-ce, selon Résonance ?
  const qui = await fetch(`${RESONANCE_URL}/auth/v1/user`, {
    headers: { apikey: RESONANCE_ANON, Authorization: `Bearer ${jeton}` },
  });
  if (!qui.ok) return repondre({ erreur: "SESSION_RESONANCE" }, 401);
  const eleve = await qui.json();
  const meta = eleve.app_metadata ?? {};
  if (meta.role !== "eleve" || !classeTerminale(meta.classe)) return repondre({ erreur: "RESERVE_TERMINALE" }, 403);
  const identifiant = String(meta.identifiant ?? "");
  if (!/^[0-9a-f-]{36}$/.test(String(eleve.id)) || !/^PC-[A-Z0-9]{5}$/.test(identifiant)) {
    return repondre({ erreur: "SESSION_RESONANCE" }, 401);
  }

  // 3. Son compte ici : créé au premier passage, retrouvé ensuite.
  const admin = { apikey: env.service, Authorization: `Bearer ${env.service}`, "Content-Type": "application/json" };
  const email = `${eleve.id}@${DOMAINE}`;
  const creation = await fetch(`${env.url}/auth/v1/admin/users`, {
    method: "POST",
    headers: admin,
    body: JSON.stringify({
      email,
      password: motDePasseJetable(),
      email_confirm: true,
      app_metadata: { pont: "resonance", resonance_id: eleve.id, identifiant },
    }),
  });
  if (!creation.ok && creation.status !== 422) return repondre({ erreur: "CREATION" }, 502);
  if (!creation.ok) await creation.body?.cancel(); // 422 : le compte existe déjà, on le vérifie ci-dessous

  const lien = await fetch(`${env.url}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: admin,
    body: JSON.stringify({ type: "magiclink", email }),
  });
  if (!lien.ok) return repondre({ erreur: "TICKET" }, 502);
  const l = await lien.json();
  // L'API rend l'utilisateur à plat avec hashed_token ; supabase-js le range dans properties.
  const ticket = l.hashed_token ?? l.properties?.hashed_token;
  const compte = l.user ?? l;
  const a = compte.app_metadata ?? {};
  if (a.pont !== "resonance" || a.resonance_id !== eleve.id) return repondre({ erreur: "COMPTE_ETRANGER" }, 409);
  if (!ticket) return repondre({ erreur: "TICKET" }, 502);

  return repondre({ ticket, identifiant });
}
