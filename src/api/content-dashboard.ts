/**
 * Content Dashboard API — content items, cronjobs, analytics, agents, audit.
 */

import { api, safeArray } from "@/lib/api";
import type {
  ContentItem,
  ContentFilters,
  CronJob,
  RunArtifact,
  SEOInsight,
  AgentRecommendation,
  PublishingQueueItem,
} from "@/types/content-dashboard";

const BASE = "/content";
const CRON = "/cronjobs";
const ANALYTICS = "/analytics";
const AUDIT = "/audit";
const AGENTS = "/agents";

export interface ContentItemsResponse {
  items: ContentItem[];
  count: number;
  page: number;
  limit: number;
}

export async function fetchContentItems(params?: {
  filters?: ContentFilters;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ContentItemsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.limit != null) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.filters?.projectIds?.length)
    searchParams.set("projectIds", params.filters.projectIds.join(","));
  if (params?.filters?.statuses?.length)
    searchParams.set("statuses", params.filters.statuses.join(","));
  if (params?.filters?.dateFrom) searchParams.set("dateFrom", params.filters.dateFrom);
  if (params?.filters?.dateTo) searchParams.set("dateTo", params.filters.dateTo);

  const qs = searchParams.toString();
  const endpoint = qs ? `${BASE}/items?${qs}` : `${BASE}/items`;
  const raw = await api.get<{ data?: ContentItem[]; count?: number; page?: number; limit?: number }>(endpoint);
  const items = safeArray<ContentItem>(raw?.data ?? (raw as unknown as ContentItem[]));
  return {
    items,
    count: (raw as { count?: number })?.count ?? items.length,
    page: (raw as { page?: number })?.page ?? 1,
    limit: (raw as { limit?: number })?.limit ?? 20,
  };
}

export async function fetchContentItem(id: string): Promise<ContentItem | null> {
  const raw = await api.get<ContentItem | { data?: ContentItem }>(`${BASE}/item/${id}`);
  if (raw && typeof raw === "object" && "data" in raw) return (raw as { data?: ContentItem }).data ?? null;
  return (raw as ContentItem) ?? null;
}

export async function createContentItem(payload: Partial<ContentItem>): Promise<ContentItem> {
  const raw = await api.post<ContentItem | { data?: ContentItem }>(`${BASE}/item`, payload);
  if (raw && typeof raw === "object" && "data" in raw) return (raw as { data?: ContentItem }).data!;
  return raw as ContentItem;
}

export async function updateContentItem(id: string, payload: Partial<ContentItem>): Promise<ContentItem> {
  const raw = await api.put<ContentItem | { data?: ContentItem }>(`${BASE}/item/${id}`, payload);
  if (raw && typeof raw === "object" && "data" in raw) return (raw as { data?: ContentItem }).data!;
  return raw as ContentItem;
}

export async function advanceContentStage(id: string): Promise<ContentItem> {
  const raw = await api.patch<ContentItem | { data?: ContentItem }>(`${BASE}/item/${id}/advance`, {});
  if (raw && typeof raw === "object" && "data" in raw) return (raw as { data?: ContentItem }).data!;
  return raw as ContentItem;
}

export async function moveContentCalendar(id: string, scheduledAt: string): Promise<ContentItem> {
  const raw = await api.patch<ContentItem | { data?: ContentItem }>(
    `${BASE}/calendar/${id}/move`,
    { scheduledAt }
  );
  if (raw && typeof raw === "object" && "data" in raw) return (raw as { data?: ContentItem }).data!;
  return raw as ContentItem;
}

export async function fetchCronjobs(): Promise<CronJob[]> {
  const raw = await api.get<CronJob[] | { data?: CronJob[] }>(CRON);
  const arr = Array.isArray(raw) ? raw : (raw as { data?: CronJob[] })?.data;
  return safeArray<CronJob>(arr ?? raw);
}

export async function updateCronjob(id: string, payload: Partial<CronJob>): Promise<CronJob> {
  const raw = await api.put<CronJob | { data?: CronJob }>(`${CRON}/${id}`, payload);
  if (raw && typeof raw === "object" && "data" in raw) return (raw as { data?: CronJob }).data!;
  return raw as CronJob;
}

export async function runCronjobNow(id: string): Promise<RunArtifact> {
  const raw = await api.post<RunArtifact | { data?: RunArtifact }>(`${CRON}/${id}/run`, {});
  if (raw && typeof raw === "object" && "data" in raw) return (raw as { data?: RunArtifact }).data!;
  return raw as RunArtifact;
}

export async function fetchSEOInsights(contentItemId?: string): Promise<SEOInsight[]> {
  const qs = contentItemId ? `?contentItemId=${encodeURIComponent(contentItemId)}` : "";
  const raw = await api.get<SEOInsight[] | { data?: SEOInsight[] }>(`${ANALYTICS}/seo${qs}`);
  const arr = Array.isArray(raw) ? raw : (raw as { data?: SEOInsight[] })?.data;
  return safeArray<SEOInsight>(arr ?? raw);
}

export async function fetchPerformanceAnalytics(contentItemId?: string): Promise<{
  views?: number;
  ctr?: number;
  avgPosition?: number;
}> {
  const qs = contentItemId ? `?contentItemId=${encodeURIComponent(contentItemId)}` : "";
  const raw = await api.get<Record<string, number> | { data?: Record<string, number> }>(
    `${ANALYTICS}/performance${qs}`
  );
  const data = (raw as { data?: Record<string, number> })?.data ?? (raw as Record<string, number>);
  return data ?? {};
}

export async function fetchRunArtifact(runId: string): Promise<RunArtifact | null> {
  const raw = await api.get<RunArtifact | { data?: RunArtifact }>(`${AUDIT}/run/${runId}`);
  if (raw && typeof raw === "object" && "data" in raw) return (raw as { data?: RunArtifact }).data ?? null;
  return (raw as RunArtifact) ?? null;
}

export async function fetchAgentRecommendations(): Promise<AgentRecommendation[]> {
  const raw = await api.get<AgentRecommendation[] | { data?: AgentRecommendation[] }>(
    `${AGENTS}/recommendations`
  );
  const arr = Array.isArray(raw) ? raw : (raw as { data?: AgentRecommendation[] })?.data;
  return safeArray<AgentRecommendation>(arr ?? raw);
}

export async function openEditorWithData(payload: {
  contentItemId?: string;
  topic?: string;
  template?: string;
}): Promise<{ url?: string; contentItemId?: string }> {
  const raw = await api.post<{ url?: string; contentItemId?: string } | { data?: { url?: string; contentItemId?: string } }>(
    "/editor/open",
    payload
  );
  if (raw && typeof raw === "object" && "data" in raw)
    return (raw as { data?: { url?: string; contentItemId?: string } }).data ?? {};
  return (raw as { url?: string; contentItemId?: string }) ?? {};
}

export async function fetchPublishingQueue(): Promise<PublishingQueueItem[]> {
  const raw = await api.get<PublishingQueueItem[] | { data?: PublishingQueueItem[] }>(
    `${BASE}/publishing-queue`
  );
  return safeArray<PublishingQueueItem>(
    (raw as { data?: PublishingQueueItem[] })?.data ?? (raw as PublishingQueueItem[])
  );
}
