/**
 * Content LLM Adapter API — calls Supabase Edge Function when configured,
 * or backend /llm/* when VITE_API_URL is set, else mock. All responses guarded.
 */

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { api, safeArray } from "@/lib/api";
import type {
  DraftContentPayload,
  DraftContentResult,
  EditContentPayload,
  EditContentResult,
  ResearchAssistPayload,
  ResearchAssistResult,
  SEOSuggestionsPayload,
  SEOSuggestionsResult,
  SafetyCheckPayload,
  SafetyCheckResult,
} from "@/types/content-llm";

const USE_MOCK =
  !import.meta.env.VITE_API_URL && !import.meta.env.VITE_SUPABASE_URL;
const USE_BACKEND = Boolean(import.meta.env.VITE_API_URL);

async function invokeEdgeFunction<T>(action: string, payload: unknown): Promise<T> {
  if (USE_MOCK) return mockInvoke<T>(action, payload);

  if (USE_BACKEND) {
    const endpoint = `/llm/${action}`;
    const body = payload;
    try {
      const res = await api.post<T>(endpoint, body);
      return res as T;
    } catch {
      return mockInvoke<T>(action, payload);
    }
  }

  const client = await getSupabaseClient();
  if (!client || !isSupabaseConfigured()) return mockInvoke<T>(action, payload);

  type SupabaseClient = { functions: { invoke: (n: string, o: { body: unknown }) => Promise<{ data?: T; error?: unknown }> } };
  const supabase = client as SupabaseClient;
  const { data, error } = await supabase.functions.invoke("content-llm", {
    body: { action, payload },
  });

  if (error) throw new Error(String(error));
  if (data && typeof data === "object" && "error" in data && (data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }
  return (data ?? {}) as T;
}

async function mockInvoke<T>(action: string, payload: unknown): Promise<T> {
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

  const p = (payload ?? {}) as Record<string, unknown>;
  const idea = String(p?.idea ?? "").trim() || "Sample topic";
  const content = String(p?.content ?? "").trim() || "Sample content for analysis.";
  const edits = String(p?.edits ?? "").trim() || "Improve clarity";
  const topic = String(p?.topic ?? "").trim() || idea;

  switch (action) {
    case "draft":
      return {
        draft: `# ${idea}\n\nThis is a mock draft for "${idea}". Replace with real LLM output when OPENAI_API_KEY is configured in Supabase secrets.\n\n## Key points\n- Point one\n- Point two\n- Point three`,
        promptsUsed: ["mock"],
      } as T;
    case "edit":
      return {
        editedDraft: `${content}\n\n[Edited per: ${edits}]`,
        changes: [edits],
      } as T;
    case "research":
      return {
        notes: [
          `Key finding 1 for "${topic}"`,
          `Key finding 2`,
          `Key finding 3`,
        ],
        sources: ["https://example.com/source1", "https://example.com/source2"],
      } as T;
    case "seo":
      return {
        seoMeta: {
          keywords: [topic, "content", "guide"],
          metaDescription: `A comprehensive guide about ${topic}.`,
          readability: 72,
        },
        recommendations: ["Add more headings", "Include internal links"],
      } as T;
    case "safety-check":
      return { allowed: true, rationale: "Mock: content appears safe" } as T;
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

export async function draftContent(payload: DraftContentPayload): Promise<DraftContentResult> {
  const normalized = {
    idea: payload?.idea ?? "",
    constraints: payload?.constraints ?? {},
    context: payload?.context ?? {},
  };
  const result = await invokeEdgeFunction<DraftContentResult>("draft", normalized);
  return {
    draft: result?.draft ?? "",
    promptsUsed: safeArray<string>(result?.promptsUsed),
  };
}

export async function editContent(payload: EditContentPayload): Promise<EditContentResult> {
  const normalized = {
    draftId: payload?.draftId ?? "",
    content: payload?.content ?? "",
    edits: payload?.edits ?? "",
    constraints: payload?.constraints ?? {},
  };
  const result = await invokeEdgeFunction<EditContentResult>("edit", normalized);
  return {
    editedDraft: result?.editedDraft ?? "",
    changes: safeArray<string>(result?.changes),
  };
}

export async function researchAssist(payload: ResearchAssistPayload): Promise<ResearchAssistResult> {
  const normalized = {
    topic: payload?.topic ?? "",
    depth: payload?.depth ?? "medium",
    sources: Array.isArray(payload?.sources) ? payload.sources : [],
  };
  const result = await invokeEdgeFunction<ResearchAssistResult>("research", normalized);
  return {
    notes: safeArray<string>(result?.notes),
    sources: safeArray<string>(result?.sources),
  };
}

export async function seoSuggestions(payload: SEOSuggestionsPayload): Promise<SEOSuggestionsResult> {
  const normalized = {
    content: payload?.content ?? "",
    targetKeywords: Array.isArray(payload?.targetKeywords) ? payload.targetKeywords : [],
  };
  const result = await invokeEdgeFunction<SEOSuggestionsResult>("seo", normalized);
  const seoMeta = result?.seoMeta ?? {};
  return {
    seoMeta: {
      keywords: safeArray<string>(seoMeta.keywords),
      metaDescription: seoMeta.metaDescription ?? "",
      readability: seoMeta.readability ?? 70,
    },
    recommendations: safeArray<string>(result?.recommendations),
  };
}

export async function safetyCheck(payload: SafetyCheckPayload): Promise<SafetyCheckResult> {
  const normalized = { content: payload?.content ?? "" };
  const result = await invokeEdgeFunction<SafetyCheckResult>("safety-check", normalized);
  return {
    allowed: Boolean(result?.allowed ?? true),
    rationale: result?.rationale ?? "Unable to assess",
  };
}
