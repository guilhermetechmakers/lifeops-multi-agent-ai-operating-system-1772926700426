/**
 * Agent Trace & Debugger types.
 * All arrays consumed with (data ?? []) and Array.isArray guards.
 */

export interface Agent {
  id: string;
  name: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export type MessageType = "handoff" | "negotiation" | "alert" | "consensus" | "request" | "response";

export interface Message {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  type: MessageType;
  timestamp: string;
  payloadSummary?: string;
  state?: Record<string, unknown>;
}

export interface GraphData {
  agents: Agent[];
  messages: Message[];
}

export interface MemoryScope {
  id: string;
  agentId: string;
  scope: string;
  encrypted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryEntry {
  id: string;
  scopeId: string;
  key: string;
  value: unknown;
  timestamp: string;
  encrypted: boolean;
}

export interface MemorySnapshot {
  scopes: MemoryScope[];
  entries: MemoryEntry[];
}

export interface TraceStep {
  stepIndex: number;
  messageId?: string;
  timestamp: string;
  memorySnapshot?: Record<string, unknown>;
  activeAgentId?: string;
}

export interface RunSummary {
  id: string;
  cronJobId: string;
  cronJobName?: string;
  status: "queued" | "running" | "succeeded" | "failed" | "aborted";
  startedAt: string;
  finishedAt?: string;
  nextRunAt?: string;
}

export interface TraceResponse {
  graph: GraphData;
  memory: MemorySnapshot;
  steps: TraceStep[];
  artifacts?: ArtifactRef[];
  runId: string;
}

export interface ArtifactRef {
  id: string;
  runId: string;
  type: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface Assertion {
  id: string;
  runId: string;
  ruleId: string;
  explanation: string;
  violated: boolean;
  details?: Record<string, unknown>;
}

export interface Conflict {
  id: string;
  runId: string;
  conflictPair: string[];
  appliedRules: string[];
  rationale: string;
}

export interface RevertPayload {
  stepId?: string;
  reason: string;
  justification?: string;
}

export interface RevertResponse {
  success: boolean;
  updatedState?: Record<string, unknown>;
  auditLog?: { id: string; timestamp: string; action: string };
}

export interface ExportOptions {
  format: "json" | "zip";
  scope: "single" | "aggregate" | "workspace";
  runIds?: string[];
}

export interface RunDetailsPayload {
  id: string;
  cronjobId: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  inputs?: Record<string, unknown>;
  trace: unknown[];
  logs: unknown[];
  diffs: unknown[];
  artifacts: unknown[];
  timing: unknown[];
  outcome?: { success: boolean; summary?: string };
}
