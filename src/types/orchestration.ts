/**
 * Agent Orchestration & Messaging types.
 * Message envelopes, run lifecycle, scoped memory, conflict resolution.
 * All arrays consumed with (data ?? []) and Array.isArray guards.
 */

export type RunState =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "halted"
  | "aborted";

export interface MessageEnvelope {
  id: string;
  runId: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  version: string;
  priorMessageId?: string;
  traceContext?: Record<string, unknown>;
  actionType: string;
  payload: Record<string, unknown>;
  explainability?: ExplainabilityMetadata;
  ttl?: number;
  state?: "pending" | "delivered" | "processed" | "failed";
}

export interface ExplainabilityMetadata {
  action?: string;
  decision?: string;
  rationale?: string;
  artifacts?: string[];
}

export interface MemoryScope {
  id: string;
  runId: string;
  scope: string;
  tenant?: string;
  data: Record<string, unknown>;
  ttl?: number;
  governance?: Record<string, unknown>;
  createdAt: string;
  expiresAt?: string;
}

export interface RunConstraints {
  maxDurationMs?: number;
  maxRetries?: number;
  userOverrides?: Record<string, unknown>;
}

export interface SafetyRails {
  allowedActions?: string[];
  blockedPatterns?: string[];
  rateLimits?: Record<string, number>;
}

export interface RunLifecyclePayload {
  reason?: string;
  humanInput?: Record<string, unknown>;
}

export interface HumanInputPayload {
  stepId?: string;
  agentId?: string;
  input: Record<string, unknown>;
  reason?: string;
}
