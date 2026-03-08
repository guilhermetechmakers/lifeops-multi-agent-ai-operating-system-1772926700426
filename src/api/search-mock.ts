/**
 * Mock Search API for development and when backend is unavailable.
 * Returns safe arrays and shapes; guards all data access.
 */

import type {
  GlobalSearchResponse,
  FacetMeta,
  FacetOption,
  SavedQuery,
  SearchResult,
  SearchModule,
} from "@/types/search";

const MOCK_SAVED: SavedQuery[] = [
  {
    id: "sq-1",
    name: "Pending content approvals",
    description: "Content items awaiting approval",
    query: "pending approval",
    scope: "module",
    module: "content",
    filters: { status: "review" },
    ownerId: "user-1",
    isShared: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    lastUsed: new Date().toISOString(),
    usageCount: 12,
  },
  {
    id: "sq-2",
    name: "Failed cronjob runs",
    query: "failed",
    scope: "module",
    module: "cronjobs",
    ownerId: "user-1",
    isShared: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function buildFacets(_scope: string, module?: string): FacetMeta[] {
  const statusOpts: FacetOption[] = [
    { value: "draft", label: "Draft", count: 5 },
    { value: "scheduled", label: "Scheduled", count: 3 },
    { value: "published", label: "Published", count: 10 },
    { value: "archived", label: "Archived", count: 2 },
  ];
  const typeOpts: FacetOption[] = [
    { value: "content", label: "Content", count: 8 },
    { value: "project", label: "Project", count: 4 },
    { value: "cronjob", label: "Cronjob", count: 6 },
    { value: "run", label: "Run", count: 15 },
  ];
  const facets: FacetMeta[] = [
    { field: "type", label: "Type", type: "multi", options: typeOpts },
    { field: "status", label: "Status", type: "multi", options: statusOpts },
  ];
  if (module === "content") {
    facets.push({
      field: "seoScore",
      label: "SEO Score",
      type: "range",
      options: [],
      min: 0,
      max: 100,
      step: 10,
    });
  }
  return facets;
}

function mockResults(query: string, _scope: string, _module?: string): SearchResult[] {
  const q = (query ?? "").toLowerCase().trim();
  const list: SearchResult[] = [
    { id: "1", type: "content", title: "Getting started with LifeOps", status: "published", owner: "Alice", lastUpdated: "2025-03-01T10:00:00Z", score: 0.95, url: "/dashboard/content/library/1" },
    { id: "2", type: "project", title: "Content Pipeline Automation", status: "active", owner: "Bob", lastUpdated: "2025-03-02T14:00:00Z", score: 0.88, url: "/dashboard/projects/2" },
    { id: "3", type: "cronjob", title: "Daily digest cronjob", status: "enabled", owner: "Alice", lastUpdated: "2025-03-03T09:00:00Z", score: 0.82, url: "/dashboard/cronjobs/3" },
    { id: "4", type: "content", title: "Draft: API documentation", status: "draft", owner: "Bob", lastUpdated: "2025-03-04T11:00:00Z", score: 0.78, url: "/dashboard/content/editor/4" },
    { id: "5", type: "run", title: "Run #42 — Daily digest", status: "success", owner: "System", lastUpdated: "2025-03-05T08:00:00Z", score: 0.75, url: "/dashboard/cronjobs/3/runs/42" },
  ];
  if (!q) return list;
  return list.filter((r) => r.title.toLowerCase().includes(q) || (r.snippet ?? "").toLowerCase().includes(q));
}

export const searchMock = {
  global: (body: { query?: string; scope?: string; module?: string; page?: number; pageSize?: number }): Promise<GlobalSearchResponse> => {
    const results = mockResults(body.query ?? "", body.scope ?? "global", body.module);
    const total = results.length;
    const facets = buildFacets(body.scope ?? "global", body.module);
    return Promise.resolve({
      results,
      total,
      facets,
      tookMs: 45,
    });
  },

  getFacets: (params: { scope: string; module?: string }): Promise<{ facets: FacetMeta[]; total: number }> => {
    const facets = buildFacets(params.scope, params.module);
    return Promise.resolve({ facets, total: facets.length });
  },

  getAutocomplete: (params: { q: string }): Promise<{ suggestions: string[] }> => {
    const q = (params.q ?? "").toLowerCase().trim();
    const all = ["pending approval", "content draft", "failed runs", "published", "scheduled", "cronjob", "project"];
    const suggestions = q.length < 2 ? [] : all.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
    return Promise.resolve({ suggestions });
  },

  getSavedQueries: (): Promise<SavedQuery[]> =>
    Promise.resolve([...MOCK_SAVED]),

  createSavedQuery: (body: { name: string; query: string; scope: "global" | "module"; module?: string; isShared?: boolean }): Promise<SavedQuery> => {
    const sq: SavedQuery = {
      id: `sq-${Date.now()}`,
      name: body.name,
      query: body.query,
      scope: body.scope,
      module: body.module as SearchModule | undefined,
      ownerId: "user-1",
      isShared: body.isShared ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_SAVED.push(sq);
    return Promise.resolve(sq);
  },

  updateSavedQuery: (id: string, body: Partial<SavedQuery>): Promise<SavedQuery> => {
    const i = MOCK_SAVED.findIndex((s) => s.id === id);
    if (i === -1) return Promise.reject(new Error("Saved query not found"));
    const updated = { ...MOCK_SAVED[i], ...body, updatedAt: new Date().toISOString() };
    MOCK_SAVED[i] = updated;
    return Promise.resolve(updated);
  },

  deleteSavedQuery: (id: string): Promise<{ success: boolean }> => {
    const i = MOCK_SAVED.findIndex((s) => s.id === id);
    if (i !== -1) MOCK_SAVED.splice(i, 1);
    return Promise.resolve({ success: true });
  },

  runSavedQuery: (id: string): Promise<GlobalSearchResponse> => {
    const sq = MOCK_SAVED.find((s) => s.id === id);
    const query = sq?.query ?? "";
    const scope = sq?.scope ?? "global";
    const module = sq?.module;
    const results = mockResults(query, scope, module);
    return Promise.resolve({
      results,
      total: results.length,
      facets: buildFacets(scope, module),
      tookMs: 30,
    });
  },
};
