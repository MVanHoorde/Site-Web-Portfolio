// Point d'entrée de la fonction : tout est expliqué dans cartes.ts.
import { traiter } from "./cartes.ts";

Deno.serve((req) => traiter(req, {
  url: Deno.env.get("SUPABASE_URL")!,
  service: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  anon: Deno.env.get("SUPABASE_ANON_KEY")!,
}));
