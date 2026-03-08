/**
 * Master Dashboard data models.
 * Aligns with API contracts and runtime-safe usage.
 */

export type CronjobTriggerType = "time" | "event" | "conditional";
export type AutomationLevel =
  | "suggest-only"
  | "approval-required"
  | "conditional-auto"
  | "bounded-autopilot";

export interface CronjobPermissions {
  automationLevel: AutomationLevel;
}

export interface CronjobConstraints {
  maxActions?: number;
  spendLimit?: number;
  allowedTools?: string[];
}

export interface CronjobSafetyRails {
  confirmationsRequired?: boolean;
  confirmationsGiven?: boolean;
}

export interface CronjobRetryPolicy {
  backoffMs?: number;
  maxRetries?: number;
  deadLetter?: string;
}

export interface CronjobOutputs {
  runHistoryId?: string;
  logs?: string[];
  artifacts?: string[];
}

export interface MasterCronjob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: string;
  timezone: string;
  triggerType: CronjobTriggerType;
  targetId: string;
  inputPayload: Record<string, unknown>;
  permissions: CronjobPermissions;
  constraints?: CronjobConstraints;
  safetyRails?: CronjobSafetyRails;
  retryPolicy?: CronjobRetryPolicy;
  outputs?: CronjobOutputs;
  nextRun: string;
  lastRunResult: string;
  /** Last run info for per-run detail panel */
  lastRun?: {
    runId: string;
    startedAt: string;
    endedAt?: string;
    status: string;
  };
}

export type TemplateDomain = "developer" | "content" | "finance" | "health";

export interface MasterTemplate {
  id: string;
  domain: TemplateDomain;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  previewSnippet: string;
  tags: string[];
}

export type AlertSeverity = "info" | "warning" | "critical" | "error";

export interface MasterAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
  sourceModule: string;
  timestamp: string;
  acknowledged: boolean;
  digestible: boolean;
  snoozedUntil?: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface MasterApproval {
  id: string;
  itemType: string;
  itemId: string;
  requester: string;
  status: ApprovalStatus;
  createdAt: string;
  dueAt?: string;
}

export type RunArtifactStatus = "pending" | "running" | "success" | "failed";

export interface RunArtifact {
  runId: string;
  cronjobId: string;
  status: RunArtifactStatus;
  logs: string[];
  artifacts: string[];
  diffs: string[];
  errors: string[];
  traceLink?: string;
}

export interface ProjectsSummary {
  total: number;
  active: number;
  lastUpdated: string;
}

export interface FinanceSnapshot {
  pendingCount: number;
  reconciledCount: number;
  lastUpdated: string;
}

export interface HealthWorkload {
  activeTasks: number;
  completedToday: number;
  lastUpdated: string;
}

export interface PublishingQueueSummary {
  queued: number;
  inProgress: number;
  published: number;
  lastUpdated: string;
}

export type SearchResultModule =
  | "projects"
  | "cronjobs"
  | "agents"
  | "templates"
  | "approvals"
  | "alerts";

export interface GlobalSearchResult {
  id: string;
  /** Same as module; for compatibility with command palette key/display. */
  type?: string;
  module: SearchResultModule;
  title: string;
  subtitle?: string;
  url: string;
  metadata?: Record<string, string>;
}

/** Chart metrics for cronjob success rate and run duration. */
export interface CronjobMetrics {
  successRate: number;
  totalRuns: number;
  successCount: number;
  failedCount: number;
  byDay: Array<{ day: string; success: number; failed: number }>;
  durationDistribution: Array<{ bucket: string; count: number }>;
}

/** Chart metrics for alert trends by severity and over time. */
export interface AlertTrends {
  bySeverity: Array<{ severity: string; count: number }>;
  byDay: Array<{ day: string; count: number }>;
}
