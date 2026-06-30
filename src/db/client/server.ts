import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client, scoped to the `etim_core` schema.
 *
 * Requires the `etim_core` schema to be exposed (Supabase → Data API → Exposed
 * schemas) AND the API role to have USAGE + SELECT on it. In this project the
 * `anon` role holds those grants, so we use the anon/publishable key; the
 * service-role key is kept as a fallback.
 *
 * Reads are read-only; the data is a public classification standard.
 */
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SECRET_KEY;

/** True when Supabase credentials are configured (degrade gracefully otherwise). */
export const hasSupabase = Boolean(url && key);

function createEtimClient() {
  return createClient(url as string, key as string, {
    db: { schema: "etim_core" },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

declare global {
  var __etimSupabase: ReturnType<typeof createEtimClient> | undefined;
}

/** Returns the shared client, or null when credentials are missing. */
export function getSupabase(): ReturnType<typeof createEtimClient> | null {
  if (!hasSupabase) return null;
  const client = global.__etimSupabase ?? createEtimClient();
  if (process.env.NODE_ENV !== "production") global.__etimSupabase = client;
  return client;
}
