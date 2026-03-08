/**
 * Stripe Adapter — Invoices sync.
 * Syncs Stripe invoices for billing and Finance reconciliation.
 *
 * API: POST /stripe/invoices.sync
 * Body: { customerId?: string, subscriptionId?: string }
 * Returns: { data: { invoices: Invoice[], syncedAt: string } }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

function normalizeInvoices(raw: unknown): Array<{
  id: string;
  subscriptionId: string;
  periodStart: string;
  periodEnd: string;
  amountDue: number;
  amountPaid: number;
  status: string;
}> {
  const list = Array.isArray(raw) ? raw : [];
  return list.map((i: Record<string, unknown>) => ({
    id: typeof i.id === "string" ? i.id : crypto.randomUUID(),
    subscriptionId: (i.subscription as string) ?? "",
    periodStart: typeof (i as { period_start?: number }).period_start === "number"
      ? new Date((i as { period_start: number }).period_start * 1000).toISOString()
      : new Date().toISOString(),
    periodEnd: typeof (i as { period_end?: number }).period_end === "number"
      ? new Date((i as { period_end: number }).period_end * 1000).toISOString()
      : new Date().toISOString(),
    amountDue: Number((i as { amount_due?: number }).amount_due ?? 0) / 100,
    amountPaid: Number((i as { amount_paid?: number }).amount_paid ?? 0) / 100,
    status: typeof i.status === "string" ? i.status : "draft",
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

    let body: { customerId?: string; subscriptionId?: string } = {};
    try {
      const text = await req.text();
      body = text ? (JSON.parse(text) as typeof body) : {};
    } catch {
      body = {};
    }
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    let rawInvoices: unknown[] = [];
    if (stripeKey) {
      const params = new URLSearchParams();
      if (body.customerId) params.set("customer", body.customerId);
      if (body.subscriptionId) params.set("subscription", body.subscriptionId);
      const res = await fetch(`https://api.stripe.com/v1/invoices?${params.toString()}`, {
        headers: { Authorization: `Bearer ${stripeKey}` },
      });
      const data = (await res.json()) as { data?: unknown[] };
      rawInvoices = Array.isArray(data?.data) ? data.data : [];
    }

    const invoices = normalizeInvoices(rawInvoices);
    const syncedAt = new Date().toISOString();

    return new Response(
      JSON.stringify({
        data: {
          invoices: invoices ?? [],
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
