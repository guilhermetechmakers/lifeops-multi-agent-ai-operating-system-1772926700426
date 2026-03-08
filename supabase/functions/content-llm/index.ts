/**
 * Content LLM Adapter Edge Function
 * Proxies requests to OpenAI API with content-specific constraints and safety checks.
 * Endpoints: draft, edit, research, seo, safety-check
 *
 * Required secrets: OPENAI_API_KEY
 * API: POST /content-llm with body: { action, payload }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_CONTENT_LENGTH = 50000;
const MAX_OUTPUT_TOKENS = 4096;
const DEFAULT_MODEL = "gpt-4o-mini";

interface DraftPayload {
  idea: string;
  constraints?: { tone?: string; length?: string; format?: string };
  context?: Record<string, unknown>;
}

interface EditPayload {
  draftId?: string;
  content?: string;
  edits: string;
  constraints?: { tone?: string };
}

interface ResearchPayload {
  topic: string;
  depth?: "shallow" | "medium" | "deep";
  sources?: string[];
}

interface SEOPayload {
  content: string;
  targetKeywords?: string[];
}

interface SafetyPayload {
  content: string;
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message, data: null }, status);
}

async function callOpenAI(
  messages: { role: string; content: string }[],
  options?: { max_tokens?: number; temperature?: number }
): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      max_tokens: options?.max_tokens ?? 2048,
      temperature: options?.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data?.choices?.[0]?.message?.content ?? "";
  return content.trim();
}

function validateContent(content: unknown): string {
  if (content == null || typeof content !== "string") return "";
  return content.slice(0, MAX_CONTENT_LENGTH);
}

async function handleDraft(payload: DraftPayload): Promise<{ draft: string; promptsUsed?: string[] }> {
  const idea = validateContent(payload?.idea) || "General content";
  const tone = (payload?.constraints?.tone as string) ?? "professional";
  const length = (payload?.constraints?.length as string) ?? "medium";
  const format = (payload?.constraints?.format as string) ?? "markdown";

  const prompt = `You are a content writer. Create a draft based on this idea: "${idea}"

Requirements:
- Tone: ${tone}
- Length: ${length}
- Format: ${format}

Write only the draft content, no meta-commentary.`;

  const draft = await callOpenAI([{ role: "user", content: prompt }], { max_tokens: MAX_OUTPUT_TOKENS });
  return { draft, promptsUsed: [prompt.slice(0, 200) + "..."] };
}

async function handleEdit(payload: EditPayload): Promise<{ editedDraft: string; changes?: string[] }> {
  const edits = validateContent(payload?.edits) || "";
  const content = validateContent(payload?.content) || "";
  const tone = (payload?.constraints?.tone as string) ?? "match original";

  const prompt = content
    ? `You are an editor. Apply these edits to the following content.

Content:
"""
${content}
"""

Edits requested: "${edits}"
Tone: ${tone}. Output only the edited content, no explanations.`
    : `You are an editor. Apply these edits. Edits requested: "${edits}"
Tone: ${tone}. Output only the edited content, no explanations.`;

  const editedDraft = await callOpenAI([{ role: "user", content: prompt }], { max_tokens: MAX_OUTPUT_TOKENS });
  return { editedDraft, changes: [edits] };
}

async function handleResearch(payload: ResearchPayload): Promise<{ notes: string[]; sources: string[] }> {
  const topic = validateContent(payload?.topic) || "general topic";
  const depth = (payload?.depth as string) ?? "medium";

  const prompt = `Research the topic: "${topic}" at ${depth} depth.
Provide:
1. Key points and findings (3-5 bullet points)
2. Suggested sources (URLs or references)
Format as JSON: { "notes": ["point1", "point2"], "sources": ["url1", "url2"] }`;

  const raw = await callOpenAI([{ role: "user", content: prompt }], { max_tokens: 1024 });
  try {
    const parsed = JSON.parse(raw) as { notes?: string[]; sources?: string[] };
    const notes = Array.isArray(parsed?.notes) ? parsed.notes : [raw];
    const sources = Array.isArray(parsed?.sources) ? parsed.sources : [];
    return { notes, sources };
  } catch {
    return { notes: [raw], sources: [] };
  }
}

async function handleSEO(payload: SEOPayload): Promise<{
  seoMeta: { keywords: string[]; metaDescription: string; readability?: number };
  recommendations: string[];
}> {
  const content = validateContent(payload?.content) || "";
  const targetKeywords = Array.isArray(payload?.targetKeywords) ? payload.targetKeywords : [];

  const prompt = `Analyze this content for SEO:
"${content.slice(0, 3000)}"

Target keywords (optional): ${targetKeywords.join(", ") || "none specified"}

Respond as JSON:
{
  "seoMeta": {
    "keywords": ["keyword1", "keyword2"],
    "metaDescription": "150 char description",
    "readability": 0-100
  },
  "recommendations": ["rec1", "rec2"]
}`;

  const raw = await callOpenAI([{ role: "user", content: prompt }], { max_tokens: 512 });
  try {
    const parsed = JSON.parse(raw) as {
      seoMeta?: { keywords?: string[]; metaDescription?: string; readability?: number };
      recommendations?: string[];
    };
    const seoMeta = {
      keywords: Array.isArray(parsed?.seoMeta?.keywords) ? parsed.seoMeta.keywords : [],
      metaDescription: (parsed?.seoMeta?.metaDescription as string) ?? "",
      readability: (parsed?.seoMeta?.readability as number) ?? 70,
    };
    const recommendations = Array.isArray(parsed?.recommendations) ? parsed.recommendations : [];
    return { seoMeta, recommendations };
  } catch {
    return {
      seoMeta: { keywords: [], metaDescription: "", readability: 70 },
      recommendations: ["Could not parse SEO response"],
    };
  }
}

async function handleSafetyCheck(payload: SafetyPayload): Promise<{ allowed: boolean; rationale: string }> {
  const content = validateContent(payload?.content) || "";

  const prompt = `Safety check this content. Respond with JSON only:
{ "allowed": true/false, "rationale": "brief reason" }

Content to check:
"${content.slice(0, 2000)}"`;

  const raw = await callOpenAI([{ role: "user", content: prompt }], { max_tokens: 128, temperature: 0.2 });
  try {
    const parsed = JSON.parse(raw) as { allowed?: boolean; rationale?: string };
    return {
      allowed: Boolean(parsed?.allowed ?? true),
      rationale: (parsed?.rationale as string) ?? "Unable to assess",
    };
  } catch {
    return { allowed: true, rationale: "Parse error; defaulting to allowed" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return errorResponse("Missing authorization", 401);
  }

  try {
    const body = (await req.json()) as { action?: string; payload?: unknown };
    const action = body?.action ?? "";
    const payload = body?.payload ?? {};

    switch (action) {
      case "draft":
        return jsonResponse(await handleDraft(payload as DraftPayload));
      case "edit":
        return jsonResponse(await handleEdit(payload as EditPayload));
      case "research":
        return jsonResponse(await handleResearch(payload as ResearchPayload));
      case "seo":
        return jsonResponse(await handleSEO(payload as SEOPayload));
      case "safety-check":
        return jsonResponse(await handleSafetyCheck(payload as SafetyPayload));
      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message, data: null }, 500);
  }
});
