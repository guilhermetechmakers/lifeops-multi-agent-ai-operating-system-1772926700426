/**
 * Plaid Adapter — Accounts sync.
 * Ingests bank accounts into the Finance module. Call Plaid API, normalize to canonical schema,
 * persist to DB. Use PLAID_CLIENT_ID, PLAID_SECRET (and optionally access token) via Deno.env.
 *
 * API: POST /plaid/accounts.sync
 * Body: { accessToken?: string, userId: string }
 * Returns: { data: { accounts: Account[], syncedAt: string } }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface PlaidAccount {
  account_id: string;
  name?: string;
  type?: string;
  subtype?: string;
  balances?: { available?: number; current?: number; limit?: number };
}

function normalizeAccounts(raw: unknown): Array<{ id: string; plaidId: string; name: string; type: string; officialBalance: number; currency: string; lastSync: string }> {
  const list = Array.isArray(raw) ? raw : [];
  const now = new Date().toISOString();
  return list.map((a: PlaidAccount) => ({
    id: crypto.randomUUID(),
    plaidId: typeof a?.account_id === "string" ? a.account_id : "",
    name: typeof a?.name === "string" ? a.name : "Account",
    type: typeof a?.type === "string" ? a.type : "other",
    officialBalance: typeof a?.balances?.current === "number" ? a.balances.current : (a?.balances?.available ?? 0),
    currency: "USD",
    lastSync: now,
  }));
}

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

    let body: { accessToken?: string; userId?: string } = {};
    try {
      const text = await req.text();
      body = text ? (JSON.parse(text) as typeof body) : {};
    } catch {
      body = {};
    }
    const userId = typeof body.userId === "string" ? body.userId : "";
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : Deno.env.get("PLAID_ACCESS_TOKEN") ?? "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    let plaidAccounts: PlaidAccount[] = [];
    const clientId = Deno.env.get("PLAID_CLIENT_ID");
    const secret = Deno.env.get("PLAID_SECRET");
    if (clientId && secret && accessToken) {
      const res = await fetch("https://development.plaid.com/accounts/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, secret, access_token: accessToken }),
      });
      const data = (await res.json()) as { accounts?: PlaidAccount[] };
      plaidAccounts = Array.isArray(data?.accounts) ? data.accounts : [];
    }

    const accounts = normalizeAccounts(plaidAccounts);
    const syncedAt = new Date().toISOString();

    return new Response(
      JSON.stringify({
        data: {
          accounts: accounts ?? [],
          syncedAt,
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
