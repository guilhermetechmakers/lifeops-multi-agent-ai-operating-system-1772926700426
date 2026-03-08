/**
 * Plaid Adapter — Transactions sync.
 * Ingests bank transactions into the Finance module. Normalize to canonical schema;
 * guard against null responses; validate array-like data.
 *
 * API: POST /plaid/transactions.sync
 * Body: { accessToken?: string, userId: string, startDate?: string, endDate?: string }
 * Returns: { data: { transactions: Transaction[], syncedAt: string } }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface PlaidTx {
  transaction_id?: string;
  account_id?: string;
  date?: string;
  amount?: number;
  name?: string;
  category?: string[];
  pending?: boolean;
}

function normalizeTransactions(raw: unknown): Array<{
  id: string;
  externalId: string;
  accountId: string;
  date: string;
  amount: number;
  merchant: string;
  categoryId: string | null;
  status: string;
  source: string;
}> {
  const list = Array.isArray(raw) ? raw : [];
  return list.map((t: PlaidTx) => ({
    id: crypto.randomUUID(),
    externalId: typeof t?.transaction_id === "string" ? t.transaction_id : "",
    accountId: typeof t?.account_id === "string" ? t.account_id : "",
    date: typeof t?.date === "string" ? t.date : new Date().toISOString().slice(0, 10),
    amount: typeof t?.amount === "number" ? t.amount : 0,
    merchant: typeof t?.name === "string" ? t.name : "Unknown",
    categoryId: null,
    status: t?.pending ? "pending" : "posted",
    source: "plaid",
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

    let body: { accessToken?: string; userId?: string; startDate?: string; endDate?: string } = {};
    try {
      const text = await req.text();
      body = text ? (JSON.parse(text) as typeof body) : {};
    } catch {
      body = {};
    }
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : Deno.env.get("PLAID_ACCESS_TOKEN") ?? "";

    let plaidTransactions: PlaidTx[] = [];
    const clientId = Deno.env.get("PLAID_CLIENT_ID");
    const secret = Deno.env.get("PLAID_SECRET");
    if (clientId && secret && accessToken) {
      const start = body.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const end = body.endDate ?? new Date().toISOString().slice(0, 10);
      const res = await fetch("https://development.plaid.com/transactions/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          secret,
          access_token: accessToken,
          start_date: start,
          end_date: end,
        }),
      });
      const data = (await res.json()) as { transactions?: PlaidTx[] };
      plaidTransactions = Array.isArray(data?.transactions) ? data.transactions : [];
    }

    const transactions = normalizeTransactions(plaidTransactions);
    const syncedAt = new Date().toISOString();

    return new Response(
      JSON.stringify({
        data: {
          transactions: transactions ?? [],
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
