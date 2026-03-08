/**
 * Stripe Adapter — Get subscriptions by customer.
 *
 * API: GET /stripe/subscriptions/:customerId
 * Returns: { data: { subscriptions: Subscription[] } }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const pathParts = url.pathname.split("/");
    const customerId = pathParts[pathParts.length - 1] ?? "";

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    let subscriptions: unknown[] = [];
    if (stripeKey && customerId) {
      const res = await fetch(`https://api.stripe.com/v1/customers/${customerId}/subscriptions?status=all`, {
        headers: { Authorization: `Bearer ${stripeKey}` },
      });
      const data = (await res.json()) as { data?: unknown[] };
      subscriptions = Array.isArray(data?.data) ? data.data : [];
    }

    return new Response(
      JSON.stringify({
        data: {
          subscriptions: subscriptions ?? [],
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
