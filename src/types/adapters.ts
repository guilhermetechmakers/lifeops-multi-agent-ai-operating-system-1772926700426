/**
 * Adapter system types: AdapterInstance, Run, Telemetry, Health, Credential.
 * Aligns with REST /api/adapters, /api/telemetry/adapters, /api/health/adapters.
 */

export type AdapterType =
  | "llm"
  | "github"
  | "plaid"
  | "stripe"
  | "quickbooks"
  | "health";

export interface AdapterConfig {
  id: string;
  type: AdapterType;
  name: string;
  credentialsRef: string;
  enabled: boolean;
  rateLimit?: number;
  retryPolicy?: {
    maxRetries?: number;
    backoffMs?: number;
  };
}

export interface AdapterInstance {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  credentialsRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface Credential {
  id: string;
  adapterId: string;
  type: string;
  secretRef: string;
  metadata: Record<string, unknown>;
  rotatedAt: string;
}

export type RunStatus = "pending" | "running" | "success" | "failed";

export interface Run {
  id: string;
  adapterId: string;
  payloadHash: string;
  status: RunStatus;
  startedAt: string;
  completedAt: string | null;
  result: unknown;
}

export interface TelemetryEvent {
  id: string;
  adapterId: string;
  eventType: string;
  latencyMs: number;
  success: boolean;
  errorCode?: string;
  timestamp: string;
}

export type HealthStatusValue = "healthy" | "degraded" | "unhealthy";

export interface HealthStatus {
  adapterId: string;
  status: HealthStatusValue;
  checkedAt: string;
  details?: string;
}

export interface CreateAdapterInput {
  type: AdapterType;
  name: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  credentialsRef?: string;
}

export interface UpdateAdapterInput {
  name?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  credentialsRef?: string;
}

export interface TestAdapterResult {
  ok: boolean;
  message?: string;
  latencyMs?: number;
}

export interface RunAdapterInput {
  payload: Record<string, unknown>;
}

export interface RunAdapterResult {
  runId: string;
  status: RunStatus;
  result?: unknown;
  error?: string;
}
