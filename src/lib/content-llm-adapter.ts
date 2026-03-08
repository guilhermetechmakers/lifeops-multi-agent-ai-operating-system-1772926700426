/**
 * Content LLM Adapter — module-local API for drafting, editing, research, SEO, safety.
 * Proxies to backend /llm/* endpoints when configured; uses mock otherwise.
 */

import * as contentLlmApi from "@/api/content-llm";
import * as contentLlmMock from "@/api/content-llm-mock";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_CONTENT === "true";
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

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= MAX_RETRIES; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
      }
    }
  }
  throw lastError;
}

/**
 * Draft content from an idea with optional constraints.
 */
export async function draftContent(
  input: DraftContentPayload
): Promise<DraftContentResult & { debugInfo?: Record<string, unknown> }> {
  const normalized: DraftContentPayload = {
    idea: input?.idea ?? "",
    constraints: input?.constraints ?? {},
    context: input?.context ?? {},
  };
  if (!normalized.idea.trim()) {
    return { draft: "", promptsUsed: [], debugInfo: {} };
  }
  return withRetry(() =>
    USE_MOCK ? contentLlmMock.mockDraftContent(normalized) : contentLlmApi.draftContent(normalized)
  );
}

/**
 * Edit existing draft with edits and constraints.
 */
export async function editContent(input: EditContentPayload): Promise<EditContentResult> {
  const normalized: EditContentPayload = {
    draftId: input?.draftId ?? "",
    content: input?.content ?? "",
    edits: input?.edits ?? "",
    constraints: input?.constraints ?? {},
  };
  if (!normalized.edits.trim()) {
    return { editedDraft: "", changes: [] };
  }
  return withRetry(() =>
    USE_MOCK ? contentLlmMock.mockEditContent(normalized) : contentLlmApi.editContent(normalized)
  );
}

/**
 * Research assist for a topic with optional depth and sources.
 */
export async function researchAssist(input: ResearchAssistPayload): Promise<ResearchAssistResult> {
  const normalized: ResearchAssistPayload = {
    topic: input?.topic ?? "",
    depth: input?.depth ?? "medium",
    sources: Array.isArray(input?.sources) ? input.sources : [],
  };
  if (!normalized.topic.trim()) {
    return { notes: [], sources: [] };
  }
  return withRetry(() =>
    USE_MOCK ? contentLlmMock.mockResearchAssist(normalized) : contentLlmApi.researchAssist(normalized)
  );
}

/**
 * SEO suggestions for content and target keywords.
 */
export async function seoSuggestions(input: SEOSuggestionsPayload): Promise<SEOSuggestionsResult> {
  const normalized: SEOSuggestionsPayload = {
    content: input?.content ?? "",
    targetKeywords: Array.isArray(input?.targetKeywords) ? input.targetKeywords : [],
  };
  if (!normalized.content.trim()) {
    return {
      seoMeta: { keywords: [], metaDescription: "" },
      recommendations: [],
    };
  }
  return withRetry(() =>
    USE_MOCK ? contentLlmMock.mockSEOSuggestions(normalized) : contentLlmApi.seoSuggestions(normalized)
  );
}

/**
 * Safety check for content (policy, filters).
 */
export async function safetyCheck(input: SafetyCheckPayload): Promise<SafetyCheckResult> {
  const normalized: SafetyCheckPayload = {
    content: input?.content ?? "",
  };
  if (!normalized.content.trim()) {
    return { allowed: true, rationale: "Empty content" };
  }
  return withRetry(() =>
    USE_MOCK ? contentLlmMock.mockSafetyCheck(normalized) : contentLlmApi.safetyCheck(normalized)
  );
}
