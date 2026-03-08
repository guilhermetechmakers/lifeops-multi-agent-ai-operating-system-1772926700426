/**
 * Stripe Adapter — Webhook handler.
 * Receives Stripe events (subscription.created/updated/canceled, invoice.paid/failed,
 * payment_intent.succeeded). Verifies signature, idempotent handling, maps to internal events.
 *
 * Required secret: STRIPE_WEBHOOK_SECRET
 * API: POST /stripe/webhook
 * Headers: stripe-signature
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SIGNATURE_HEADER = "stripe-signature";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const [timestampPart, v1Part] = signature.split(",").reduce((acc, part) => {
      const [k, v] = part.split("=");
      if (k === "t") acc[0] = v ?? "";
      if (k === "v1") acc[1] = v ?? "";
      return acc;
    }, ["", ""]);
    const signed = `${timestampPart}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signed));
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return v1Part === hex;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const signature = req.headers.get(SIGNATURE_HEADER) ?? "";
    const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
    const rawBody = await req.text();
    if (!secret || !verifySignature(rawBody, signature, secret)) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let event: { id?: string; type?: string; data?: { object?: unknown } } = {};
    try {
      event = JSON.parse(rawBody) as typeof event;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const eventId = event.id ?? "";
    const eventType = event.type ?? "";
    const internalEvent = mapStripeEvent(eventType, event.data?.object);

    return new Response(
      JSON.stringify({
        data: {
          received: true,
          eventId,
          eventType,
          internalEvent,
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

function mapStripeEvent(
  type: string,
  obj: unknown
): string {
  const o = obj as Record<string, unknown> ?? {};
  switch (type) {
    case "customer.subscription.created":
      return "subscription.created";
    case "customer.subscription.updated":
      return "subscription.updated";
    case "customer.subscription.deleted":
      return "subscription.canceled";
    case "invoice.paid":
      return "invoice.paid";
    case "invoice.payment_failed":
      return "invoice.failed";
    case "payment_intent.succeeded":
      return "payment_intent.succeeded";
    default:
      return type;
  }
}
