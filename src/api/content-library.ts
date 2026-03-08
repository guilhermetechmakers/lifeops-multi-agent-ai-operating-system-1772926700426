/**
 * Content Library API — fetch content items, bulk actions, metadata, pipeline state, artifacts.
 * All responses validated; use data ?? [] and Array.isArray for runtime safety.
 */

import { api, safeArray } from "@/lib/api";
import type {
  ContentItem,
  ContentLibraryFilters,
  ContentLibraryMetadata,
  PipelineStateResponse,
  RunArtifact,
  BulkActionPayload,
  BulkActionResponse,
} from "@/types/content-library";

const BASE = "/content-items";

export interface ContentItemsApiResponse {
  data: ContentItem[] | null;
  total?: number;
}

/** GET /content-items?search=&filters... */
export async function fetchContentLibraryItems(params?: {
  search?: string;
  filters?: ContentLibraryFilters;
  page?: number;
  limit?: number;
}): Promise<{ data: ContentItem[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.limit != null) searchParams.set("limit", String(params.limit));
  const f = params?.filters ?? {};
  const statusVal = f.status as string | undefined;
  if (statusVal && statusVal !== "") searchParams.set("status", statusVal);
  if (Array.isArray(f.statuses) && f.statuses.length)
    searchParams.set("statuses", f.statuses.join(","));
  if (f.channel) searchParams.set("channel", f.channel);
  if (f.owner) searchParams.set("owner", f.owner);
  if (f.scope) searchParams.set("scope", f.scope);
  if (f.dateFrom) searchParams.set("dateFrom", f.dateFrom);
  if (f.dateTo) searchParams.set("dateTo", f.dateTo);
  if (Array.isArray(f.tags) && f.tags.length) searchParams.set("tags", f.tags.join(","));

  const qs = searchParams.toString();
  const endpoint = qs ? `${BASE}?${qs}` : BASE;
  const raw = await api.get<ContentItemsApiResponse | ContentItem[]>(endpoint);
  const data = Array.isArray(raw)
    ? raw
    : safeArray<ContentItem>((raw as ContentItemsApiResponse)?.data ?? null);
  const total =
    typeof raw === "object" && raw !== null && !Array.isArray(raw)
      ? (raw as { total?: number }).total ?? data.length
      : data.length;
  return { data, total };
}

/** POST /content-items/bulk */
export async function bulkActionContentItems(
  payload: BulkActionPayload
): Promise<BulkActionResponse> {
  const raw = await api.post<BulkActionResponse>(`${BASE}/bulk`, payload);
  const results = Array.isArray((raw as BulkActionResponse)?.results)
    ? (raw as BulkActionResponse).results
    : [];
  return {
    success: (raw as BulkActionResponse)?.success ?? false,
    results,
  };
}

/** GET /content-items/meta or /owners, /channels, /tags — metadata */
export async function fetchContentLibraryMetadata(): Promise<ContentLibraryMetadata> {
  try {
    const raw = await api.get<ContentLibraryMetadata & { data?: ContentLibraryMetadata }>(
      "/content-items/meta"
    );
    const data = (raw as { data?: ContentLibraryMetadata })?.data ?? raw;
    return {
      owners: Array.isArray((data as ContentLibraryMetadata)?.owners) ? (data as ContentLibraryMetadata).owners : [],
      channels: Array.isArray((data as ContentLibraryMetadata)?.channels) ? (data as ContentLibraryMetadata).channels : [],
      tags: Array.isArray((data as ContentLibraryMetadata)?.tags) ? (data as ContentLibraryMetadata).tags : [],
    };
  } catch {
    const [ownersRes, channelsRes, tagsRes] = await Promise.all([
      api.get<{ data?: string[] }>("/owners").catch(() => ({ data: [] })),
      api.get<{ data?: string[] }>("/channels").catch(() => ({ data: [] })),
      api.get<{ data?: string[] }>("/tags").catch(() => ({ data: [] })),
    ]);
    return {
      owners: safeArray<string>((ownersRes as { data?: string[] })?.data ?? []),
      channels: safeArray<string>((channelsRes as { data?: string[] })?.data ?? []),
      tags: safeArray<string>((tagsRes as { data?: string[] })?.data ?? []),
    };
  }
}

/** GET /content-items/:id/pipeline-state */
export async function fetchContentItemPipelineState(
  id: string
): Promise<PipelineStateResponse | null> {
  const raw = await api
    .get<{ state?: string; next?: string; runs?: RunArtifact[] } | PipelineStateResponse>(
      `${BASE}/${id}/pipeline-state`
    )
    .catch(() => null);
  if (!raw || typeof raw !== "object") return null;
  const runs = Array.isArray((raw as PipelineStateResponse).runs)
    ? (raw as PipelineStateResponse).runs
    : [];
  return {
    state: (raw as PipelineStateResponse).state ?? "draft",
    next: (raw as PipelineStateResponse).next,
    runs,
  };
}

/** GET /content-items/:id/artifacts */
export async function fetchContentItemArtifacts(id: string): Promise<RunArtifact[]> {
  const raw = await api
    .get<{ data?: RunArtifact[] }>(`${BASE}/${id}/artifacts`)
    .catch(() => ({}));
  const data = (raw as { data?: RunArtifact[] })?.data ?? (raw as RunArtifact[]);
  return Array.isArray(data) ? data : [];
}

/** Aliases for hook compatibility */
export const fetchContentItems = fetchContentLibraryItems;
export const fetchMetadata = fetchContentLibraryMetadata;
export const fetchPipelineState = fetchContentItemPipelineState;
export async function fetchArtifacts(id: string): Promise<{ data: RunArtifact[] }> {
  const data = await fetchContentItemArtifacts(id);
  return { data };
}
export const bulkAction = bulkActionContentItems;
