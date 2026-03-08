/**
 * Mock data for Content Library when API is not configured.
 * All arrays guarded; safe for (data ?? []).map patterns.
 */

import type {
  ContentItem,
  ContentLibraryFilters,
  ContentLibraryMetadata,
  PipelineStateResponse,
  RunArtifact,
  BulkActionPayload,
  BulkActionResponse,
} from "@/types/content-library";

const MOCK_ITEMS: ContentItem[] = [
  {
    id: "cl-1",
    title: "Getting Started with LifeOps",
    status: "draft",
    author: "Alex Chen",
    publishDate: undefined,
    createdAt: "2025-03-01T00:00:00Z",
    tags: ["lifeops", "automation"],
    channel: "Blog",
    owner: "Marketing",
    summary: "Intro to the LifeOps platform.",
    pipeline: { state: "draft", next: "editing" },
  },
  {
    id: "cl-2",
    title: "Content Pipeline Best Practices",
    status: "scheduled",
    author: "Sam Rivera",
    publishDate: "2025-03-18T14:00:00Z",
    createdAt: "2025-02-20T00:00:00Z",
    tags: ["content", "pipeline"],
    channel: "Blog",
    owner: "Content",
    pipeline: { state: "scheduling", next: "published" },
  },
  {
    id: "cl-3",
    title: "AI-Assisted Writing Workflow",
    status: "draft",
    author: "Alex Chen",
    createdAt: "2025-03-05T00:00:00Z",
    tags: ["ai", "workflow"],
    channel: "Docs",
    owner: "Product",
    pipeline: { state: "ideation", next: "research" },
  },
  {
    id: "cl-4",
    title: "SEO Optimization Guide",
    status: "published",
    author: "Jordan Lee",
    publishDate: "2025-03-10T09:00:00Z",
    createdAt: "2025-02-01T00:00:00Z",
    tags: ["seo", "optimization"],
    channel: "Blog",
    owner: "Marketing",
    metrics: { views: 1200, engagements: 340 },
    pipeline: { state: "published" },
  },
  {
    id: "cl-5",
    title: "Multi-Agent Orchestration",
    status: "draft",
    author: "Sam Rivera",
    createdAt: "2025-03-04T00:00:00Z",
    tags: ["agents", "automation"],
    channel: "Docs",
    owner: "Engineering",
    pipeline: { state: "research", next: "draft" },
  },
  {
    id: "cl-6",
    title: "Release Notes Automation",
    status: "published",
    author: "Alex Chen",
    publishDate: "2025-03-01T12:00:00Z",
    createdAt: "2025-02-15T00:00:00Z",
    tags: ["release", "automation"],
    channel: "Changelog",
    owner: "Product",
    metrics: { views: 800 },
    pipeline: { state: "published" },
  },
  {
    id: "cl-7",
    title: "Archived: Old Campaign Copy",
    status: "archived",
    author: "Jordan Lee",
    publishDate: "2024-11-01T00:00:00Z",
    createdAt: "2024-10-01T00:00:00Z",
    tags: ["campaign"],
    channel: "Email",
    owner: "Marketing",
    pipeline: { state: "published" },
  },
];

const MOCK_METADATA: ContentLibraryMetadata = {
  owners: ["Marketing", "Content", "Product", "Engineering"],
  channels: ["Blog", "Docs", "Changelog", "Email", "Social"],
  tags: ["lifeops", "automation", "content", "pipeline", "ai", "workflow", "seo", "optimization", "agents", "release", "campaign"],
};

function filterItems(items: ContentItem[], filters: ContentLibraryFilters | undefined): ContentItem[] {
  if (!filters) return [...items];
  let out = [...items];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    out = out.filter(
      (i) =>
        i.title?.toLowerCase().includes(q) ||
        (i.summary ?? "").toLowerCase().includes(q) ||
        (i.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  }
  const statusVal = filters.status as string | undefined;
  if (statusVal && statusVal !== "" && statusVal !== "all")
    out = out.filter((i) => i.status === statusVal);
  if (filters.channel) out = out.filter((i) => i.channel === filters.channel);
  if (filters.owner) out = out.filter((i) => i.owner === filters.owner);
  if (Array.isArray(filters.tags) && filters.tags.length)
    out = out.filter((i) => (i.tags ?? []).some((t) => (filters.tags ?? []).includes(t)));
  if (filters.dateFrom)
    out = out.filter(
      (i) => (i.publishDate ?? i.createdAt ?? "") >= (filters.dateFrom ?? "")
    );
  if (filters.dateTo)
    out = out.filter(
      (i) => (i.publishDate ?? i.createdAt ?? "") <= (filters.dateTo ?? "")
    );
  if (filters.scope === "published") out = out.filter((i) => i.status === "published");
  if (filters.scope === "assets") out = out.filter((i) => i.status !== "published");
  return out;
}

export function mockFetchContentLibraryItems(params?: {
  search?: string;
  filters?: ContentLibraryFilters;
  page?: number;
  limit?: number;
}): Promise<{ data: ContentItem[]; total: number }> {
  const filters = {
    ...params?.filters,
    search: params?.search ?? params?.filters?.search,
  };
  const filtered = filterItems(MOCK_ITEMS, filters);
  const limit = params?.limit ?? 20;
  const page = (params?.page ?? 1) - 1;
  const start = page * limit;
  const data = filtered.slice(start, start + limit);
  return Promise.resolve({ data, total: filtered.length });
}

export function mockFetchContentLibraryMetadata(): Promise<ContentLibraryMetadata> {
  return Promise.resolve({ ...MOCK_METADATA });
}

export function mockFetchContentItemPipelineState(
  id: string
): Promise<PipelineStateResponse | null> {
  const item = MOCK_ITEMS.find((i) => i.id === id);
  const state = (item?.pipeline?.state ?? "draft") as PipelineStateResponse["state"];
  const runs: RunArtifact[] = [
    { runId: "run-1", startedAt: "2025-03-07T10:00:00Z", status: "success", logs: ["Step 1 ok"] },
  ];
  return Promise.resolve({ state, next: item?.pipeline?.next, runs });
}

export function mockFetchContentItemArtifacts(_id: string): Promise<RunArtifact[]> {
  return Promise.resolve([
    { runId: "run-1", startedAt: "2025-03-07T10:00:00Z", status: "success", logs: ["Completed"] },
  ]);
}

export function mockBulkActionContentItems(
  payload: BulkActionPayload
): Promise<BulkActionResponse> {
  const ids = payload.ids ?? [];
  const results = ids.map((itemId) => ({ id: itemId, success: true } as const));
  return Promise.resolve({ success: true, results });
}
