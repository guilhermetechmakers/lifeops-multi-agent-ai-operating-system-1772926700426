/**
 * Supabase client for LifeOps.
 * Initialize when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
 * Used for Auth, Database, and Storage when configured.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Supabase client instance (lazy). Artifact storage uses API layer; Supabase for future Auth/DB. */
let _client: unknown = null;

export async function getSupabaseClient(): Promise<unknown> {
  if (!isSupabaseConfigured()) return null;
  if (_client) return _client;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    _client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    return _client;
  } catch {
    return null;
  }
}
