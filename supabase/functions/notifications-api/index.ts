/**
 * LifeOps Notifications API Edge Function
 * Handles notification events, preferences, digests, snooze, mark read.
 * Integrates with SendGrid (email) and Firebase (push) - secrets required.
 *
 * API routes:
 * - POST /notifications/events
 * - GET /notifications?channel=&status=&limit=&offset=
 * - PATCH /notifications/:id/read
 * - POST /notifications/snooze
 * - POST /notifications/resend/:id
 * - GET /notifications/users/:userId/preferences
 * - PUT /notifications/users/:userId/preferences
 * - GET /notifications/digests?limit=
 * - GET /notifications/digests/:id
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
  const path = url.pathname.replace(/^\/notifications-api/, "") || "/";
  const segments = path.split("/").filter(Boolean);

  const authHeader = req.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // POST /events
    if (req.method === "POST" && segments[0] === "events") {
      const body = (await req.json()) as {
        eventType?: string;
        data?: Record<string, unknown>;
        userIds?: string[];
        channels?: string[];
      };
      const userIds = Array.isArray(body.userIds) ? body.userIds : [];
      if (userIds.length === 0) {
        return errorResponse("userIds required", 400);
      }
      const now = new Date().toISOString();
      const notifications = userIds.flatMap((uid) =>
        (body.channels ?? ["in_app"]).map((ch) => ({
          user_id: uid,
          channel: ch,
          payload: body.data ?? {},
          status: "pending",
          created_at: now,
          retry_count: 0,
        }))
      );
      const { data, error } = await supabase
        .from("notifications")
        .insert(notifications)
        .select("id");
      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ success: true, count: data?.length ?? 0 });
    }

    // GET / (list notifications)
    if (req.method === "GET" && segments.length === 0) {
      const channel = url.searchParams.get("channel");
      const status = url.searchParams.get("status");
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
      const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

      let q = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (channel) q = q.eq("channel", channel);
      if (status) q = q.eq("status", status);

      const { data, error } = await q;
      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ data: data ?? [] });
    }

    // PATCH /:id/read
    if (req.method === "PATCH" && segments.length === 1 && segments[0] !== "snooze" && segments[0] !== "events") {
      const id = segments[0];
      if (id === "users" || id === "digests") {
        return errorResponse("Not found", 404);
      }
      const { error } = await supabase
        .from("notifications")
        .update({ status: "read", read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ success: true });
    }

    // POST /snooze
    if (req.method === "POST" && segments[0] === "snooze") {
      const body = (await req.json()) as { notificationId?: string; durationMinutes?: number };
      const id = body.notificationId;
      const duration = body.durationMinutes ?? 60;
      if (!id) return errorResponse("notificationId required", 400);
      const until = new Date(Date.now() + duration * 60 * 1000).toISOString();
      const { error } = await supabase
        .from("notifications")
        .update({ status: "snoozed", snoozed_until: until })
        .eq("id", id);
      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ success: true });
    }

    // POST /resend/:id
    if (req.method === "POST" && segments[0] === "resend" && segments[1]) {
      const id = segments[1];
      const { error } = await supabase
        .from("notifications")
        .update({ status: "pending", retry_count: 0 })
        .eq("id", id);
      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ success: true });
    }

    // GET /users/:userId/preferences
    if (req.method === "GET" && segments[0] === "users" && segments[2] === "preferences") {
      const userId = segments[1];
      const { data, error } = await supabase
        .from("notification_channels")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error && error.code !== "PGRST116") return errorResponse(error.message, 500);
      const prefs = data ?? {
        in_app: true,
        email: true,
        push: false,
        digest_enabled: false,
        digest_frequency: "daily",
      };
      return jsonResponse(prefs);
    }

    // PUT /users/:userId/preferences
    if (req.method === "PUT" && segments[0] === "users" && segments[2] === "preferences") {
      const userId = segments[1];
      const body = (await req.json()) as Record<string, unknown>;
      const { error } = await supabase.from("notification_channels").upsert(
        {
          user_id: userId,
          in_app: body.in_app ?? true,
          email: body.email ?? true,
          push: body.push ?? false,
          digest_enabled: body.digest_enabled ?? false,
          digest_frequency: body.digest_frequency ?? "daily",
          quiet_hours_start: body.quiet_hours_start ?? null,
          quiet_hours_end: body.quiet_hours_end ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (error) return errorResponse(error.message, 500);
      const { data } = await supabase
        .from("notification_channels")
        .select("*")
        .eq("user_id", userId)
        .single();
      return jsonResponse(data ?? body);
    }

    // GET /digests
    if (req.method === "GET" && segments[0] === "digests" && segments.length === 1) {
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "5", 10), 20);
      const { data, error } = await supabase
        .from("notification_digests")
        .select("*")
        .order("window_end", { ascending: false })
        .limit(limit);
      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ data: data ?? [] });
    }

    // GET /digests/:id
    if (req.method === "GET" && segments[0] === "digests" && segments.length === 2) {
      const id = segments[1];
      const { data, error } = await supabase
        .from("notification_digests")
        .select("*, notifications(*)")
        .eq("id", id)
        .single();
      if (error) return errorResponse(error.message, 500);
      return jsonResponse(data);
    }

    return errorResponse("Not found", 404);
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
