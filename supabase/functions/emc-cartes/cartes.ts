// emc-cartes — préparer d'un coup les cartes éphémères d'une séance d'EMC (12 et 13/11/2026).
//
// Une carte = un identifiant lisible (d-renard-07) et un code à 4 chiffres. Derrière :
//   · un compte d'authentification <identifiant>@emc.local, mot de passe Emc-<code>
//     (la politique du projet exige majuscule, minuscule, chiffre, 6 caractères ; l'élève ne
//     tape que les 4 chiffres, la page élève ajoute le reste) ;
//   · une fiche élève inscrite dans la classe EMC, et la ligne emc_cartes (emc_carte_inscrire).
//
// Pourquoi une fonction Edge : un navigateur ne peut pas créer 35 comptes d'affilée (limite
// d'Auth par adresse IP, et chaque inscription remplacerait la session du prof). L'API
// d'administration n'a ni l'un ni l'autre problème.
//
// Qui a le droit : la BASE le décide. On appelle emc_cartes_autoriser() avec le jeton du prof
// lui-même (bdd/schema/034 §2) : enseignant de cette classe, classe EMC. La clé de service ne
// sert qu'ensuite, pour créer les comptes et les inscrire.
//
// Un compte créé dont l'inscription échoue est aussitôt supprimé : pas de compte orphelin.
//
// Logique seule : index.ts la sert, cartes_test.ts l'éprouve avec un faux réseau.
//
// Déploiement (depuis Site-Web-Portfolio/, CLI liée à ztyv…) :
//   supabase functions deploy emc-cartes --no-verify-jwt
// « no-verify-jwt » : la passerelle laisserait sinon échouer la requête préalable du
// navigateur (OPTIONS, sans jeton). Le jeton du prof est vérifié par PostgREST, à l'appel
// d'emc_cartes_autoriser.

export const DOMAINE = "emc.local";
export const MAX_PAR_APPEL = 40;

// Des mots courts, sans accent, faciles à lire et à taper sur un iPad, sans paire qui se confonde.
export const MOTS = [
  "renard", "loutre", "castor", "hibou", "lynx", "koala", "panda", "zebre", "tigre", "puma",
  "lama", "bison", "chamois", "marmotte", "herisson", "dauphin", "baleine", "phoque", "manchot",
  "mouette", "colibri", "toucan", "faucon", "cigogne", "abeille", "fourmi", "papillon", "tortue",
  "gecko", "iguane", "girafe", "jaguar", "kiwi", "lemurien", "morse", "ocelot", "pelican",
  "suricate", "tapir", "wapiti", "yak", "orque", "ecureuil", "blaireau", "chouette", "flamant",
];

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

/** Un entier tiré uniformément dans [0, n), par le générateur cryptographique. */
export function alea(n: number): number {
  const limite = Math.floor(0x100000000 / n) * n;
  const u = new Uint32Array(1);
  do crypto.getRandomValues(u); while (u[0] >= limite);
  return u[0] % n;
}

export function identifiant(prefixe: string, tirer: (n: number) => number = alea): string {
  return `${prefixe}-${MOTS[tirer(MOTS.length)]}-${String(1 + tirer(99)).padStart(2, "0")}`;
}

export function code(tirer: (n: number) => number = alea): string {
  return String(tirer(10000)).padStart(4, "0");
}

/** Le mot de passe réel d'une carte. Le même calcul vit dans assets/js/emc-commun.js. */
export function motDePasse(c: string): string {
  return `Emc-${c}`;
}

type Env = { url: string; service: string; anon: string };

export async function traiter(req: Request, env: Env, tirer: (n: number) => number = alea): Promise<Response> {
  const h = entetes(req.headers.get("Origin"));
  const repondre = (corps: unknown, statut = 200) => new Response(JSON.stringify(corps), { status: statut, headers: h });
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return repondre({ erreur: "METHODE" }, 405);

  const jeton = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(jeton)) return repondre({ erreur: "JETON_ABSENT" }, 401);

  let classe = "", nombre = 0;
  try {
    const corps = await req.json();
    classe = String(corps.classe_id ?? "");
    nombre = Number(corps.nombre);
  } catch { /* corps illisible : traité comme une demande invalide */ }
  if (!/^[0-9a-f-]{36}$/.test(classe)) return repondre({ erreur: "CLASSE_INVALIDE" }, 400);
  if (!Number.isInteger(nombre) || nombre < 1 || nombre > MAX_PAR_APPEL) return repondre({ erreur: "NOMBRE_INVALIDE" }, 400);

  // 1. Le prof a-t-il le droit ? La base répond, avec SON jeton.
  const autorise = await fetch(`${env.url}/rest/v1/rpc/emc_cartes_autoriser`, {
    method: "POST",
    headers: { apikey: env.anon, Authorization: `Bearer ${jeton}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_classe: classe }),
  });
  if (!autorise.ok) {
    await autorise.body?.cancel();
    return repondre({ erreur: "PAS_MA_CLASSE" }, 403);
  }
  const info = await autorise.json();
  const prefixe = String(info?.prefixe ?? "");
  if (!/^[a-z]$/.test(prefixe)) return repondre({ erreur: "PAS_UNE_CLASSE_EMC" }, 403);

  // 2. Les comptes, cinq par cinq.
  const admin = { apikey: env.service, Authorization: `Bearer ${env.service}`, "Content-Type": "application/json" };
  const pris = new Set<string>();

  async function uneCarte(): Promise<{ identifiant: string; code: string } | null> {
    for (let essai = 0; essai < 8; essai++) {
      const id = identifiant(prefixe, tirer);
      if (pris.has(id)) continue;
      pris.add(id);
      const c = code(tirer);
      const creation = await fetch(`${env.url}/auth/v1/admin/users`, {
        method: "POST",
        headers: admin,
        body: JSON.stringify({
          email: `${id}@${DOMAINE}`,
          password: motDePasse(c),
          email_confirm: true,
          app_metadata: { emc: true, classe_id: classe },
        }),
      });
      if (creation.status === 422) { await creation.body?.cancel(); continue; } // identifiant déjà pris : un autre
      if (!creation.ok) { await creation.body?.cancel(); return null; }
      const compte = await creation.json();
      const auth = String(compte?.id ?? compte?.user?.id ?? "");

      const inscription = await fetch(`${env.url}/rest/v1/rpc/emc_carte_inscrire`, {
        method: "POST",
        headers: admin,
        body: JSON.stringify({ p_classe: classe, p_auth: auth, p_identifiant: id, p_code: c }),
      });
      if (inscription.ok) {
        await inscription.body?.cancel();
        return { identifiant: id, code: c };
      }
      await inscription.body?.cancel();
      // pas de compte orphelin
      const sup = await fetch(`${env.url}/auth/v1/admin/users/${auth}`, { method: "DELETE", headers: admin });
      await sup.body?.cancel();
    }
    return null;
  }

  const cartes: { identifiant: string; code: string }[] = [];
  let ratees = 0;
  for (let fait = 0; fait < nombre; fait += 5) {
    const lot = await Promise.all(Array.from({ length: Math.min(5, nombre - fait) }, uneCarte));
    lot.forEach((x) => (x ? cartes.push(x) : ratees++));
  }
  return repondre({ cartes, ratees, libelle: info.libelle ?? "" }, cartes.length ? 200 : 502);
}
