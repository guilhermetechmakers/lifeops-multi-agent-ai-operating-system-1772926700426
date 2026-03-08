/**
 * Stripe Adapter — Subscriptions sync.
 * Syncs Stripe subscriptions into Finance module. Normalize payload to internal shapes;
 * guard optional fields; use data ?? [] for list results.
 *
 * API: POST /stripe/subscriptions.sync
 * Body: { customerId?: string, userId?: string }
 * Returns: { data: { subscriptions: Subscription[], syncedAt: string } }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

function normalizeSubscriptions(raw: unknown): Array<{
  id: string;
  userId: string;
  stripeCustomerId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  quantity: number;
  price: number;
}> {
  const list = Array.isArray(raw) ? raw : [];
  return list.map((s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : crypto.randomUUID(),
    userId: typeof s.userId === "string" ? s.userId : "",
    stripeCustomerId: typeof s.stripeCustomerId === "string" ? s.stripeCustomerId : (s.customer as string) ?? "",
    planId: typeof s.planId === "string" ? s.planId : (s.plan?.id as string) ?? "",
    status: typeof s.status === "string" ? s.status : "active",
    currentPeriodStart: typeof s.current_period_start === "number" ? new Date(s.current_period_start * 1000).toISOString() : new Date().toISOString(),
    currentPeriodEnd: typeof s.current_period_end === "number" ? new Date(s.current_period_end * 1000).toISOString() : new Date().toISOString(),
    quantity: Number(s.quantity ?? 1),
    price: Number((s as { plan?: { amount?: number } }).plan?.amount ?? 0) / 100,
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

    let body: { customerId?: string; userId?: string } = {};
    try {
      const text = await req.text();
      body = text ? (JSON.parse(text) as typeof body) : {};
    } catch {
      body = {};
    }
    const customerId = body.customerId ?? "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    let rawSubs: unknown[] = [];
    if (stripeKey && customerId) {
      const res = await fetch(`https://api.stripe.com/v1/customers/${customerId}/subscriptions?status=all`, {
        headers: { Authorization: `Bearer ${stripeKey}` },
      });
      const data = (await res.json()) as { data?: unknown[] };
      rawSubs = Array.isArray(data?.data) ? data.data : [];
    }

    const subscriptions = normalizeSubscriptions(rawSubs);
    const syncedAt = new Date().toISOString();

    return new Response(
      JSON.stringify({
        data: {
          subscriptions: subscriptions ?? [],
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
