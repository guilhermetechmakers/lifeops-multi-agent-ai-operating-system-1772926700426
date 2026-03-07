/**
 * LifeOps Approvals API Edge Function
 * Handles approval queue: list, approve, reject, conditional-approve.
 *
 * API routes:
 * - GET /approvals/queue?status=&cronjob=&limit=
 * - POST /approvals/queue/:id/approve
 * - POST /approvals/queue/:id/reject
 * - POST /approvals/queue/:id/conditional-approve
 */

import { serve } from "https://deno.land/std@0.168.0/http_server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-correlation-id",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status: number) {
  return jsonResponse({ error: message }, status);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const pathMatch = url.pathname.match(/(?:approvals-api|approvals)(?:\/(.*))?$/);
  const path = (pathMatch?.[1] ?? "").replace(/^\/+/, "") || "";
  const segments = path ? path.split("/").filter(Boolean) : [];

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // GET / or /queue (list queue)
    if (req.method === "GET" && (segments.length === 0 || segments[0] === "queue")) {
      const status = url.searchParams.get("status");
      const cronjob = url.searchParams.get("cronjob");
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 100);

      let q = supabase
        .from("approvals_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (status) q = q.eq("status", status);
      if (cronjob) q = q.ilike("rationale", `%${cronjob}%`);

      const { data, error } = await q;
      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ data: data ?? [] });
    }

    // POST /queue/:id/approve | /queue/:id/reject | /queue/:id/conditional-approve
    if (req.method === "POST" && segments.length >= 3 && segments[0] === "queue") {
      const id = segments[1];
      const actionPath = segments[2];
      const action = actionPath === "conditional-approve" ? "conditional" : actionPath === "approve" ? "approve" : "reject";

      const body = await req.json().catch(() => ({})) as { comment?: string; conditions?: Record<string, unknown> };
      const newStatus =
        action === "approve"
          ? "approved"
          : action === "conditional"
          ? "conditional"
          : "rejected";

      const updates: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        comments: body.comment ?? null,
      };
      if (action === "conditional" && body.conditions) {
        updates.diff_blob = { ...(updates.diff_blob as object), conditions: body.conditions };
      }

      const { error } = await supabase
        .from("approvals_queue")
        .update(updates)
        .eq("id", id);
      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ success: true });
    }

    return errorResponse("Not found", 404);
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
