/**
 * Cronjob and run types for Cronjobs Dashboard and Engine.
 * Aligns with API contracts; use (data ?? []) and Array.isArray when consuming.
 */

export type TriggerType = "time" | "event" | "conditional";
export type TargetType = "agent" | "workflow";
export type PermissionsLevel = "viewer" | "editor" | "admin";
export type AutomationLevel =
  | "suggest-only"
  | "approval-required"
  | "auto-execute"
  | "bounded-autopilot";

export interface CronjobConstraints {
  maxActions?: number;
  spendLimit?: number;
  allowedTools?: string[];
  requiredConfirmations?: boolean;
}

export interface CronjobSafetyRails {
  confirmations?: number;
  manualReviewRequired?: boolean;
}

export interface CronjobAutomationBounds {
  maxActions?: number;
  spendLimit?: number;
  allowedTools?: string[];
}

export interface CronjobRetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffBaseMs?: number;
  backoffMultiplier?: number;
  maxBackoffMs?: number;
  deadLetterTarget?: string;
  deadLetterQueue?: boolean;
}

export interface CronjobOutputsConfig {
  artifacts?: string[];
  logs?: boolean;
  traceEnabled?: boolean;
  runHistory?: boolean;
  diffs?: boolean;
}

export interface CronjobLastRun {
  status: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
}

export interface Cronjob {
  id: string;
  name: string;
  enabled: boolean;
  scheduleExpression: string | null;
  scheduleUI: Record<string, unknown> | null;
  timezone: string;
  triggerType: TriggerType;
  targetType: TargetType;
  targetId: string;
  inputPayloadTemplate: string;
  permissionsLevel: PermissionsLevel;
  automationLevel: AutomationLevel;
  constraints: CronjobConstraints;
  safetyRails: string[];
  retryPolicy: CronjobRetryPolicy;
  outputsConfig: CronjobOutputsConfig;
  ownerId: string;
  module: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastRun?: CronjobLastRun;
  nextRun?: string;
}

export type CronjobRunStatus = "success" | "failure" | "skipped" | "running";

export interface CronjobRun {
  runId: string;
  cronjobId: string;
  status: CronjobRunStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  artifacts: unknown[];
  logs: string[];
  trace: unknown;
}

export interface CronjobListFilters {
  module?: string;
  owner?: string;
  status?: "enabled" | "paused" | "all";
  tag?: string;
  nextRunAfter?: string;
  nextRunBefore?: string;
  lastRunAfter?: string;
  lastRunBefore?: string;
}

/** Alias for filter bar and dashboard. */
export type CronjobFilters = CronjobListFilters;

export interface CronjobListParams extends CronjobListFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface CronjobListResponse {
  data: Cronjob[];
  count: number;
  page: number;
  pageSize: number;
}

export interface CreateCronjobInput {
  name: string;
  enabled?: boolean;
  scheduleExpression: string | null;
  scheduleUI?: Record<string, unknown> | null;
  timezone: string;
  triggerType: TriggerType;
  targetType: TargetType;
  targetId: string;
  inputPayloadTemplate?: string;
  permissionsLevel?: PermissionsLevel;
  automationLevel?: AutomationLevel;
  constraints?: CronjobConstraints;
  safetyRails?: string[];
  retryPolicy?: Partial<CronjobRetryPolicy>;
  outputsConfig?: Partial<CronjobOutputsConfig>;
  ownerId?: string;
  module?: string;
  tags?: string[];
}

export type UpdateCronjobInput = Partial<CreateCronjobInput>;

export interface BulkCronjobAction {
  ids: string[];
  action: "enable" | "disable" | "delete" | "run-now";
  payload?: Record<string, unknown>;
}

/** Legacy / compatibility: simplified cronjob for list display (maps from API). */
export interface CronjobListItem {
  id: string;
  name: string;
  enabled: boolean;
  schedule: string;
  scheduleExpression?: string | null;
  timezone: string;
  triggerType: TriggerType;
  targetType?: TargetType;
  targetId: string;
  module: string;
  ownerId?: string;
  tags: string[];
  nextRun?: string;
  lastRun?: CronjobLastRun;
  lastRunResult?: string;
}
