/**
 * Plaid Adapter — Get accounts status.
 * Returns list of linked accounts and last sync status for the Finance module.
 *
 * API: GET /plaid/accounts
 * Query: userId (optional)
 * Returns: { data: { accounts: Account[], lastSync?: string } }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId") ?? "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: rows, error } = await supabase
      .from("finance_accounts")
      .select("id, plaid_id, name, type, official_balance, currency, last_sync")
      .eq("user_id", userId);

    const accounts = Array.isArray(rows)
      ? rows.map((r: Record<string, unknown>) => ({
          id: r.id,
          plaidId: r.plaid_id,
          name: r.name ?? "Account",
          type: r.type ?? "other",
          officialBalance: Number(r.official_balance ?? 0),
          currency: (r.currency as string) ?? "USD",
          lastSync: r.last_sync ?? null,
        }))
      : [];
    const lastSync = rows?.length
      ? (rows as Record<string, unknown>[]).reduce((acc, r) => {
          const t = r.last_sync as string | undefined;
          return t && (!acc || t > acc) ? t : acc;
        }, "" as string)
      : undefined;

    if (error && error.code !== "PGRST116") {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        data: {
          accounts: accounts ?? [],
          lastSync: lastSync ?? undefined,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
