// Point d'entrée de la fonction : tout est expliqué dans pont.ts.
import { traiter } from "./pont.ts";

Deno.serve((req) => traiter(req, {
  url: Deno.env.get("SUPABASE_URL")!,
  service: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
}));
