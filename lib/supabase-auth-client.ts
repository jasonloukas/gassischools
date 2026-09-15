import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Anon-key Supabase client used ONLY for verifying staff email/password
 * credentials against Supabase Auth (server-side, inside a Server
 * Action). Never used for querying trip data tables — that always goes
 * through the service-role client in supabase-admin.ts.
 */
export function getSupabaseAuthClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase auth environment variables (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_ANON_KEY)"
    );
  }
  client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}
