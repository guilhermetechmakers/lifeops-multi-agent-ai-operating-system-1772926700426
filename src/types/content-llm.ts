/**
 * Content LLM Adapter types — draft, edit, research, seo, safety-check.
 * Aligned with Edge Function and runtime safety requirements.
 */

export interface DraftConstraints {
  tone?: string;
  length?: string;
  format?: string;
  maxLength?: number;
}

export interface DraftContentPayload {
  idea: string;
  constraints?: DraftConstraints;
  context?: Record<string, unknown>;
}

export interface DraftContentResult {
  draft: string;
  promptsUsed?: string[];
}

export interface EditContentPayload {
  draftId?: string;
  content?: string;
  edits: string;
  constraints?: { tone?: string; maxLength?: number };
}

export interface EditContentResult {
  editedDraft: string;
  changes?: string[];
}

export interface ResearchAssistPayload {
  topic: string;
  depth?: "shallow" | "medium" | "deep";
  sources?: string[];
}

export interface ResearchSource {
  url?: string;
  title?: string;
  snippet?: string;
}

export interface ResearchAssistResult {
  notes: string[];
  sources: (string | ResearchSource)[];
}

export interface SEOSuggestionsPayload {
  content: string;
  targetKeywords?: string[];
}

export interface SEOMeta {
  keywords: string[];
  metaDescription: string;
  readability?: number;
}

export interface SEOSuggestionsResult {
  seoMeta: SEOMeta;
  recommendations: string[];
}

export interface SafetyCheckPayload {
  content: string;
}

export interface SafetyCheckResult {
  allowed: boolean;
  rationale: string;
}
