/**
 * Content Editor hooks — drafts, versions, artifacts, pipelines, approvals.
 * Uses mock when VITE_API_URL is not set or VITE_USE_MOCK_CONTENT is true.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/content-editor";
import * as mock from "@/api/content-editor-mock";
import type { Draft, PipelineRun } from "@/types/content-editor";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_CONTENT === "true";

const QUERY_KEYS = {
  draft: (id: string | null) => ["content-editor", "draft", id] as const,
  versions: (draftId: string) => ["content-editor", "versions", draftId] as const,
  artifacts: (draftId: string) => ["content-editor", "artifacts", draftId] as const,
  citations: (draftId: string) => ["content-editor", "citations", draftId] as const,
  pipeline: (runId: string | null) => ["content-editor", "pipeline", runId] as const,
};

export function useDraft(draftId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.draft(draftId),
    queryFn: () =>
      draftId
        ? USE_MOCK
          ? mock.mockGetDraft(draftId)
          : api.getDraft(draftId)
        : Promise.resolve(null),
    enabled: !!draftId,
  });
}

export function useVersions(draftId: string | null) {
  const query = useQuery({
    queryKey: QUERY_KEYS.versions(draftId ?? ""),
    queryFn: () =>
      draftId
        ? USE_MOCK
          ? mock.mockGetVersions(draftId)
          : api.getVersions(draftId)
        : Promise.resolve([]),
    enabled: !!draftId,
  });
  const data = query.data;
  const items = Array.isArray(data) ? data : [];
  return { ...query, items };
}

export function useArtifacts(draftId: string | null) {
  const query = useQuery({
    queryKey: QUERY_KEYS.artifacts(draftId ?? ""),
    queryFn: () =>
      draftId
        ? USE_MOCK
          ? mock.mockGetArtifacts(draftId)
          : api.getArtifacts(draftId)
        : Promise.resolve([]),
    enabled: !!draftId,
  });
  const data = query.data;
  const items = Array.isArray(data) ? data : [];
  return { ...query, items };
}

export function useCitations(draftId: string | null) {
  const query = useQuery({
    queryKey: QUERY_KEYS.citations(draftId ?? ""),
    queryFn: () =>
      draftId
        ? USE_MOCK
          ? mock.mockGetCitations(draftId)
          : api.getCitations(draftId)
        : Promise.resolve([]),
    enabled: !!draftId,
  });
  const data = query.data;
  const items = Array.isArray(data) ? data : [];
  return { ...query, items };
}

export function usePipeline(runId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.pipeline(runId),
    queryFn: () =>
      runId
        ? USE_MOCK
          ? mock.mockGetPipeline(runId)
          : api.getPipeline(runId)
        : Promise.resolve(null),
    enabled: !!runId,
  });
}

export function useCreateDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; content?: string; format?: "markdown" | "html" }) =>
      USE_MOCK ? mock.mockCreateDraft(payload) : api.createDraft(payload),
    onSuccess: (draft) => {
      queryClient.setQueryData(QUERY_KEYS.draft(draft.id), draft);
      toast.success("Draft created");
    },
    onError: () => toast.error("Failed to create draft"),
  });
}

export function useUpdateDraft(draftId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Pick<Draft, "title" | "content" | "format" | "seoMetadata">>) =>
      draftId
        ? USE_MOCK
          ? mock.mockUpdateDraft(draftId, payload)
          : api.updateDraft(draftId, payload)
        : Promise.reject(new Error("No draft ID")),
    onSuccess: (draft) => {
      queryClient.setQueryData(QUERY_KEYS.draft(draft.id), draft);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.versions(draft.id) });
      toast.success("Draft saved");
    },
    onError: () => toast.error("Failed to save draft"),
  });
}

export function useCreateVersion(draftId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { content: string; changeSummary?: string }) =>
      draftId
        ? USE_MOCK
          ? mock.mockCreateVersion(draftId, payload)
          : api.createVersion(draftId, payload)
        : Promise.reject(new Error("No draft ID")),
    onSuccess: () => {
      if (draftId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.versions(draftId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.draft(draftId) });
      }
      toast.success("Version saved");
    },
    onError: () => toast.error("Failed to save version"),
  });
}

export function useUploadArtifact(draftId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formData,
      onProgress,
    }: {
      formData: FormData;
      onProgress?: (pct: number) => void;
    }) =>
      draftId
        ? USE_MOCK
          ? mock.mockUploadArtifact(draftId, formData, onProgress)
          : api.uploadArtifact(draftId, formData, onProgress)
        : Promise.reject(new Error("No draft ID")),
    onSuccess: () => {
      if (draftId)
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.artifacts(draftId) });
      toast.success("File uploaded");
    },
    onError: () => toast.error("Failed to upload file"),
  });
}

export function useAddCitation(draftId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { url: string; title?: string; snippet?: string }) =>
      draftId
        ? USE_MOCK
          ? mock.mockAddCitation(draftId, payload)
          : api.addCitation(draftId, payload)
        : Promise.reject(new Error("No draft ID")),
    onSuccess: () => {
      if (draftId)
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.citations(draftId) });
      toast.success("Citation added");
    },
    onError: () => toast.error("Failed to add citation"),
  });
}

export function useDeleteArtifact(draftId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (artifactId: string) =>
      draftId
        ? USE_MOCK
          ? mock.mockDeleteArtifact(draftId, artifactId)
          : api.deleteArtifact(draftId, artifactId)
        : Promise.reject(new Error("No draft ID")),
    onSuccess: () => {
      if (draftId)
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.artifacts(draftId) });
      toast.success("Artifact removed");
    },
    onError: () => toast.error("Failed to remove artifact"),
  });
}

export function useStartPipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      draftId: string;
      plan?: string;
      scope?: Record<string, unknown>;
    }) =>
      USE_MOCK ? mock.mockStartPipeline(payload) : api.startPipeline(payload),
    onSuccess: (run: PipelineRun) => {
      queryClient.setQueryData(QUERY_KEYS.pipeline(run.id), run);
      toast.success("Pipeline started");
    },
    onError: () => toast.error("Failed to start pipeline"),
  });
}

export function useAdvancePipeline(runId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { step: string; payload?: Record<string, unknown> }) =>
      runId
        ? USE_MOCK
          ? mock.mockAdvancePipeline(runId, payload)
          : api.advancePipeline(runId, payload)
        : Promise.reject(new Error("No run ID")),
    onSuccess: (run) => {
      queryClient.setQueryData(QUERY_KEYS.pipeline(run.id), run);
      toast.success("Pipeline advanced");
    },
    onError: () => toast.error("Failed to advance pipeline"),
  });
}

export function usePublishToChannel() {
  return useMutation({
    mutationFn: (payload: { runId: string; channel: string; schedule?: string }) =>
      USE_MOCK ? mock.mockPublishToChannel(payload) : api.publishToChannel(payload),
    onSuccess: () => toast.success("Published successfully"),
    onError: () => toast.error("Failed to publish"),
  });
}
