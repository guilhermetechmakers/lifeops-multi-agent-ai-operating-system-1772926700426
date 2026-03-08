/**
 * CI & Integrations data models.
 * Use (data ?? []) and Array.isArray when consuming API responses.
 */

export type IntegrationType = "git" | "ci" | "deploy";
export type IntegrationStatus = "active" | "inactive" | "error" | "unknown";
export type TokenStatus = "valid" | "invalid" | "expired";
export type RunOutcome = "success" | "failure" | "partial";
export type LogLevel = "info" | "warn" | "error" | "debug";

export interface Integration {
  id: string;
  projectId: string;
  name: string;
  type: IntegrationType;
  provider: string;
  status: IntegrationStatus;
  healthScore: number;
  lastRunAt?: string;
  nextRunAt?: string;
  isActive: boolean;
  config: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Connector {
  id: string;
  integrationId: string;
  provider: string;
  tokenStatus: TokenStatus;
  webhookUrl?: string;
  lastError?: string;
  errorCount: number;
}

export interface DeploymentTarget {
  id: string;
  projectId: string;
  name: string;
  environment: string;
  cluster: string;
  region: string;
  config: Record<string, unknown>;
  isActive: boolean;
}

export interface RunRecord {
  id: string;
  integrationId: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  outcome: RunOutcome;
  traceId?: string;
  artifacts?: unknown[];
}

export interface LogEntry {
  id: string;
  runId: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  source?: string;
}

export interface AdapterConfig {
  id: string;
  integrationId: string;
  eventName: string;
  workflowName: string;
  payloadTemplate: string;
  scope: string;
  requiredPermissions: string[];
}

export interface RepoLink {
  id: string;
  projectId: string;
  url: string;
  branchPattern?: string;
  createdAt: string;
}

export interface IntegrationAuditEntry {
  id: string;
  integrationId: string;
  action: string;
  actorId?: string;
  actorName?: string;
  timestamp: string;
  details?: Record<string, unknown>;
}
