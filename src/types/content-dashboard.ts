/**
 * Content Dashboard data models — aligned with API schemas.
 */

export type ContentStatus =
  | "idea"
  | "research"
  | "draft"
  | "edit"
  | "ready-to-publish"
  | "published";

export interface ContentItem {
  id: string;
  title: string;
  slug?: string;
  projectId: string;
  status: ContentStatus;
  authorId: string;
  authorName?: string;
  assigneeIds?: string[];
  assigneeNames?: string[];
  eta?: string;
  calendarItem?: { start: string; end?: string; allDay?: boolean };
  scheduledAt?: string;
  publishedAt?: string;
  version?: number;
  seoKeywords?: string[];
  performanceMetrics?: { views?: number; ctr?: number; avgPosition?: number };
  createdAt: string;
  updatedAt: string;
}

export type CronJobTriggerType = "time" | "event" | "conditional";
export type CronJobPermission =
  | "suggest-only"
  | "approval-required"
  | "conditional-auto"
  | "bounded-autopilot";

export interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  scheduleCron?: string;
  timezone: string;
  triggerType: CronJobTriggerType;
  targetAgentId?: string;
  inputPayload?: Record<string, unknown>;
  permissions?: CronJobPermission;
  constraints?: { maxActions?: number; spendLimit?: number; allowedTools?: string[] };
  safetyRails?: { confirmationsRequired?: boolean; approvalsNeeded?: string[] };
  retryPolicy?: { maxRetries?: number; backoffMs?: number; deadLetterQueue?: string };
  outputs?: { runHistory?: string[]; logs?: string[]; artifacts?: string[] };
  createdAt: string;
  updatedAt: string;
}

export type RunArtifactStatus = "queued" | "running" | "success" | "failed" | "skipped";

export interface RunArtifact {
  id: string;
  cronJobId: string;
  status: RunArtifactStatus;
  startedAt: string;
  finishedAt?: string;
  artifacts?: unknown;
  logs?: string[];
  diffs?: string;
}

export interface SEOInsight {
  id: string;
  contentItemId: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  suggestedTitle: string;
  metaDescription: string;
}

export interface AgentRecommendation {
  id: string;
  topic: string;
  rationale: string;
  confidence: number;
}

export interface PublishingQueueItem {
  id: string;
  contentItemId: string;
  title: string;
  status: "queued" | "scheduled" | "publishing" | "published" | "failed";
  nextRun?: string;
  channels?: string[];
  retries?: number;
  maxRetries?: number;
  outcome?: string;
  lastRunAt?: string;
}

export interface ContentFilters {
  projectIds?: string[];
  statuses?: ContentStatus[];
  authorIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  search?: string;
}

export interface PipelineRunSummary {
  id: string;
  draftId: string;
  contentTitle?: string;
  status: "pending" | "running" | "completed" | "failed";
  currentStep?: string;
  progress?: number;
  eta?: string;
  lastAction?: string;
  startedAt: string;
  endedAt?: string;
}

export interface ApprovalItem {
  id: string;
  runId: string;
  contentTitle?: string;
  reviewerId: string;
  reviewerName?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  comments?: string;
}
