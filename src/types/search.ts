/**
 * Search & Filter system types.
 * Aligns with API contracts and runtime-safe usage (data ?? [], Array.isArray guards).
 */

export type SearchScope = "global" | "module";

export type SearchModule =
  | "content"
  | "cronjobs"
  | "projects"
  | "runs"
  | "users";

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet?: string;
  status?: string;
  owner?: string;
  projectId?: string;
  lastUpdated?: string;
  score?: number;
  url?: string;
  metadata?: Record<string, string>;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export type FacetType = "multi" | "single" | "range" | "date-range";

export interface ActiveFacets {
  [field: string]: string | string[] | number | [number, number] | undefined;
}

export interface FacetMeta {
  field: string;
  label: string;
  type: FacetType;
  options: FacetOption[];
  min?: number;
  max?: number;
  step?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  description?: string;
  query: string;
  scope: SearchScope;
  module?: SearchModule;
  filters?: Record<string, unknown>;
  ownerId: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  version?: number;
  lastUsed?: string;
  usageCount?: number;
}

export interface GlobalSearchRequestBody {
  query: string;
  scope: SearchScope;
  module?: SearchModule;
  facets?: Record<string, unknown>;
  page?: number;
  pageSize?: number;
  include?: string[];
}

export interface GlobalSearchResponse {
  results: SearchResult[];
  total: number;
  facets?: FacetMeta[];
  tookMs?: number;
}

export interface FacetsResponse {
  facets: FacetMeta[];
  total: number;
}

export interface AutocompleteResponse {
  suggestions: string[];
}

export type SearchViewMode = "list" | "card";
