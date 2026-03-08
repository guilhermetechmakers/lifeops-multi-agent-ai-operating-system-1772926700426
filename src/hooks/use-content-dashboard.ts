/**
 * Content Dashboard hooks — unified data-fetch with null-safety.
 * Uses mock when VITE_API_URL is not set or VITE_USE_MOCK_CONTENT is true.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/content-dashboard";
import * as mock from "@/api/content-dashboard-mock";
import type { ContentFilters } from "@/types/content-dashboard";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_CONTENT === "true";

interface ContentItemsParams {
  filters?: ContentFilters;
  page?: number;
  limit?: number;
  search?: string;
}

const QUERY_KEYS = {
  contentItems: (params?: ContentItemsParams) =>
    ["content-dashboard", "items", params] as const,
  contentItem: (id: string) => ["content-dashboard", "item", id] as const,
  cronjobs: ["content-dashboard", "cronjobs"] as const,
  seoInsights: (contentItemId?: string) =>
    ["content-dashboard", "seo", contentItemId] as const,
  performance: (contentItemId?: string) =>
    ["content-dashboard", "performance", contentItemId] as const,
  runAudit: (runId: string) => ["content-dashboard", "audit", runId] as const,
  agentRecommendations: ["content-dashboard", "recommendations"] as const,
  publishingQueue: ["content-dashboard", "publishing-queue"] as const,
  pipelineRuns: ["content-dashboard", "pipelines"] as const,
  approvalsQueue: ["content-dashboard", "approvals"] as const,
};

export function useContentItems(params: ContentItemsParams = {}) {
  const query = useQuery({
    queryKey: QUERY_KEYS.contentItems(params),
    queryFn: () =>
      USE_MOCK ? mock.mockFetchContentItems(params) : api.fetchContentItems(params),
    placeholderData: { items: [], count: 0, page: 1, limit: 20 },
  });
  const data = query.data ?? { items: [], count: 0, page: 1, limit: 20 };
  const items = Array.isArray(data.items) ? data.items : [];
  const count = data.count ?? 0;
  return { ...query, items, count };
}

export function useContentItem(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.contentItem(id ?? ""),
    queryFn: () =>
      id
        ? USE_MOCK
          ? mock.mockFetchContentItem(id)
          : api.fetchContentItem(id)
        : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCronjobs() {
  return useQuery({
    queryKey: QUERY_KEYS.cronjobs,
    queryFn: () =>
      USE_MOCK ? mock.mockFetchCronjobs() : api.fetchCronjobs(),
    placeholderData: [],
  });
}

export function useSEOInsights(contentItemId?: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.seoInsights(contentItemId),
    queryFn: () =>
      USE_MOCK
        ? mock.mockFetchSEOInsights(contentItemId)
        : api.fetchSEOInsights(contentItemId),
    placeholderData: [],
  });
  const data = query.data;
  const items = Array.isArray(data) ? data : [];
  return { ...query, data, items };
}

export function useAgentRecommendations() {
  const query = useQuery({
    queryKey: QUERY_KEYS.agentRecommendations,
    queryFn: () =>
      USE_MOCK
        ? mock.mockFetchAgentRecommendations()
        : api.fetchAgentRecommendations(),
    placeholderData: [],
  });
  const data = query.data;
  const items = Array.isArray(data) ? data : [];
  return { ...query, data, items };
}

export function usePublishingQueue() {
  const query = useQuery({
    queryKey: QUERY_KEYS.publishingQueue,
    queryFn: () =>
      USE_MOCK
        ? mock.mockGetPublishingQueue()
        : api.fetchPublishingQueue(),
    placeholderData: [],
  });
  const data = query.data;
  const items = Array.isArray(data) ? data : [];
  return { ...query, data, items };
}

export function useRetryPublish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK
        ? mock.mockRetryPublishingQueueItem(id)
        : api.retryPublishingQueueItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publishingQueue });
      toast.success("Retry scheduled");
    },
    onError: () => toast.error("Failed to schedule retry"),
  });
}

export function useRunAudit(runId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.runAudit(runId ?? ""),
    queryFn: () =>
      runId
        ? USE_MOCK
          ? mock.mockFetchRunArtifact(runId)
          : api.fetchRunArtifact(runId)
        : Promise.resolve(null),
    enabled: !!runId,
  });
}

export function useAdvanceContentStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = USE_MOCK
        ? await mock.mockAdvanceContentStage(id)
        : await api.advanceContentStage(id);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-dashboard"] });
      toast.success("Stage advanced");
    },
    onError: () => toast.error("Failed to advance stage"),
  });
}

export function useMoveContentCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, scheduledAt }: { id: string; scheduledAt: string }) => {
      const result = USE_MOCK
        ? await mock.mockMoveContentCalendar(id, scheduledAt)
        : await api.moveContentCalendar(id, scheduledAt);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-dashboard"] });
      toast.success("Rescheduled");
    },
    onError: () => toast.error("Failed to reschedule"),
  });
}

export function useOpenEditor() {
  return useMutation({
    mutationFn: (payload: {
      contentItemId?: string;
      topic?: string;
      template?: string;
    }) =>
      USE_MOCK
        ? mock.mockOpenEditorWithData(payload)
        : api.openEditorWithData(payload),
  });
}

export function usePipelineRuns() {
  const query = useQuery({
    queryKey: QUERY_KEYS.pipelineRuns,
    queryFn: () =>
      USE_MOCK
        ? mock.mockFetchPipelineRuns()
        : api.fetchPipelineRuns(),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}

export function useApprovalsQueue() {
  const query = useQuery({
    queryKey: QUERY_KEYS.approvalsQueue,
    queryFn: () =>
      USE_MOCK
        ? mock.mockFetchApprovalsQueue()
        : api.fetchApprovalsQueue(),
    placeholderData: [],
  });
  const items = Array.isArray(query.data) ? query.data : [];
  return { ...query, items };
}

export function useDecideApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      runId,
      approvalId,
      status,
      comments,
    }: {
      runId: string;
      approvalId: string;
      status: "approved" | "rejected";
      comments?: string;
    }) =>
      USE_MOCK
        ? mock.mockDecideApproval(runId, approvalId, { status, comments })
        : api.decideApproval(runId, approvalId, { status, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.approvalsQueue });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipelineRuns });
      toast.success("Approval decided");
    },
    onError: () => toast.error("Failed to decide approval"),
  });
}
