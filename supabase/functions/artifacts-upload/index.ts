/**
 * LifeOps Artifact Upload Edge Function
 * Handles multipart form upload, stores in Supabase Storage, creates artifact metadata.
 * Virus scan integration can be added via webhook.
 *
 * Required secrets: SUPABASE_SERVICE_ROLE_KEY (for storage)
 * API: POST /artifacts/upload
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file in request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tenantId = (formData.get("tenantId") as string) ?? "default";
    const contentItemId = (formData.get("contentItemId") as string) || null;
    const description = (formData.get("description") as string) || null;
    let tags: string[] = [];
    const tagsRaw = formData.get("tags");
    if (typeof tagsRaw === "string") {
      try {
        tags = JSON.parse(tagsRaw) as string[];
      } catch {
        tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    const artifactId = crypto.randomUUID();
    const versionId = crypto.randomUUID();
    const path = `${tenantId}/artifacts/${artifactId}/v1`;

    const { error: uploadError } = await supabase.storage
      .from("artifacts")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: insertError } = await supabase.from("artifacts").insert({
      id: artifactId,
      tenant_id: tenantId,
      content_item_id: contentItemId,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      current_version_id: null,
      status: "clean",
      description,
      tags,
    });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: versionError } = await supabase.from("artifact_versions").insert({
      id: versionId,
      artifact_id: artifactId,
      version_number: 1,
      s3_key: path,
      uploaded_at: new Date().toISOString(),
    });

    if (versionError) {
      return new Response(
        JSON.stringify({ error: versionError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("artifacts").update({ current_version_id: versionId }).eq("id", artifactId);

    return new Response(
      JSON.stringify({
        data: {
          artifactId,
          versionId,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          status: "clean",
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
