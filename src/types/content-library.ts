/**
 * Content Library data models — aligned with API contracts and runtime safety.
 */

export type ContentLibraryStatus =
  | "idea"
  | "research"
  | "draft"
  | "edit"
  | "scheduled"
  | "published"
  | "archived";

export type PipelineState =
  | "ideation"
  | "research"
  | "draft"
  | "editing"
  | "scheduling"
  | "published";

export interface ContentItem {
  id: string;
  title: string;
  thumbnail?: string;
  status: ContentLibraryStatus;
  author: string;
  publishDate?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  channel?: string;
  owner?: string;
  summary?: string;
  seoScore?: number;
  version?: number;
  platform?: string;
  pipeline?: {
    state?: PipelineState;
    next?: string;
  };
  metrics?: {
    views?: number;
    engagements?: number;
  };
  versionHistory?: Array<{
    id: string;
    versionNumber: number;
    changedBy?: string;
    changedAt?: string;
    notes?: string;
  }>;
}

/** Alias for ContentItem used by Content Library components */
export type ContentLibraryItem = ContentItem;

export interface RunArtifact {
  runId: string;
  startedAt: string;
  status: string;
  logs?: string[];
}

export interface ContentLibraryFilters {
  search?: string;
  status?: ContentLibraryStatus | "";
  statuses?: ContentLibraryStatus[];
  tags?: string[];
  channel?: string;
  owner?: string;
  platform?: string;
  seoScoreMin?: number;
  dateFrom?: string;
  dateTo?: string;
  scope?: "assets" | "published" | "all";
}

export interface ContentLibraryMetadata {
  owners: string[];
  channels: string[];
  tags: string[];
  platforms?: string[];
}

export interface PipelineStateResponse {
  state: PipelineState;
  next?: string;
  runs: RunArtifact[];
}

export type BulkActionType =
  | "publish"
  | "unpublish"
  | "archive"
  | "export"
  | "move-to-draft"
  | "re-run-llm"
  | "schedule-republish";

export interface BulkActionPayload {
  ids: string[];
  action: BulkActionType;
  options?: Record<string, unknown>;
}

export interface BulkActionResponse {
  success: boolean;
  results: Array<{ id: string; success: boolean; error?: string }>;
}
