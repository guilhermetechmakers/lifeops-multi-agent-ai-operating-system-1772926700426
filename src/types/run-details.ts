/**
 * Run Details types for LifeOps.
 * All arrays guarded with (data ?? []) and Array.isArray when consuming.
 */

export type RunStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "aborted"
  | "reverted";

/** Human-readable status labels for Run Details UI. */
export const RUN_STATUS_LABELS: Record<RunStatus, string> = {
  queued: "Scheduled",
  running: "Running",
  succeeded: "Completed",
  failed: "Failed",
  aborted: "Aborted",
  reverted: "Reverted",
};

export interface TraceEvent {
  id: string;
  timestamp: string;
  sender: string;
  receiver: string;
  type: string;
  payloadExcerpt?: string;
  fullPayload?: Record<string, unknown>;
  outcome?: string;
}

export interface LogEvent {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  source?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface DiffChunk {
  resourceId: string;
  before?: string | Record<string, unknown>;
  after?: string | Record<string, unknown>;
  changedFields?: string[];
  author?: string;
  reason?: string;
  revertRiskLevel?: "low" | "medium" | "high";
}

export interface Artifact {
  id: string;
  name: string;
  type: string;
  size?: number;
  producedAt: string;
  url?: string;
  checksum?: string;
  provenance?: {
    runId?: string;
    agent?: string;
    timestamp?: string;
  };
}

export interface TimingSection {
  name: string;
  durationMs: number;
  details?: string;
}

export interface RunOutcome {
  success: boolean;
  summary?: string;
  details?: string;
}

export interface ReversibleAction {
  actionId: string;
  type: string;
  targetResource?: string;
  requiredValidators?: string[];
  status?: "pending" | "passed" | "failed" | "approved" | "reverted";
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  action: string;
  details?: string | Record<string, unknown>;
}

export interface RunDetail {
  id: string;
  cronjobId: string;
  cronjobName: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  status: RunStatus;
  inputs?: Record<string, unknown>;
  effectiveInputs?: Record<string, unknown>;
  scope?: string[];
  permissions?: string[];
  trace: TraceEvent[];
  logs: LogEvent[];
  diffs: DiffChunk[];
  artifacts: Artifact[];
  timing: TimingSection[];
  outcome?: RunOutcome;
  reversibleActions: ReversibleAction[];
  auditTrail: AuditEvent[];
  relatedRuns?: { antecedent?: string[]; successor?: string[] };
  approvalId?: string;
}

export interface RevertPayload {
  reason?: string;
  validatorId?: string;
  confirmations?: string[];
}

export interface RevertResponse {
  success: boolean;
  message?: string;
  auditEntryId?: string;
}

/** Alias for ArtifactsPanel compatibility. */
export type RunArtifact = Artifact;
