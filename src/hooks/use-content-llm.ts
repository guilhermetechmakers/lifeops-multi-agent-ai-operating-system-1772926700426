/**
 * Content LLM hooks — draft, edit, research, seo, safety-check.
 * Uses TanStack Mutation for async LLM operations.
 */

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/content-llm";
import type {
  DraftContentPayload,
  EditContentPayload,
  ResearchAssistPayload,
  SEOSuggestionsPayload,
  SafetyCheckPayload,
} from "@/types/content-llm";

export function useDraftContent() {
  return useMutation({
    mutationFn: (payload: DraftContentPayload) => api.draftContent(payload),
    onError: () => toast.error("Draft generation failed"),
  });
}

export function useEditContent() {
  return useMutation({
    mutationFn: (payload: EditContentPayload) => api.editContent(payload),
    onError: () => toast.error("Edit failed"),
  });
}

export function useResearchAssist() {
  return useMutation({
    mutationFn: (payload: ResearchAssistPayload) => api.researchAssist(payload),
    onError: () => toast.error("Research assist failed"),
  });
}

export function useSEOSuggestions() {
  return useMutation({
    mutationFn: (payload: SEOSuggestionsPayload) => api.seoSuggestions(payload),
    onError: () => toast.error("SEO analysis failed"),
  });
}

export function useSafetyCheck() {
  return useMutation({
    mutationFn: (payload: SafetyCheckPayload) => api.safetyCheck(payload),
    onError: () => toast.error("Safety check failed"),
  });
}
