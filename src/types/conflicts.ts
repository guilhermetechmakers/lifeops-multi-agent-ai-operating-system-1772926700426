/**
 * Conflict Resolution Engine (CRE) data models.
 * All arrays consumed with (data ?? []) and Array.isArray checks.
 */

export type ConflictStatus = "open" | "resolved" | "overridden";

export interface AgentSlot {
  id: string;
  role: string;
  priority: number;
}

export interface Conflict {
  id: string;
  agents: AgentSlot[];
  context: Record<string, unknown> | null;
  createdAt: string;
  status: ConflictStatus;
}

export interface RuleAction {
  type: string;
  payload?: Record<string, unknown>;
}

export interface Rule {
  id: string;
  name: string;
  priority: number;
  condition: string;
  conditionAST?: unknown;
  actions: RuleAction[];
}

export interface AppliedAction {
  agentId: string;
  action: string;
  success: boolean;
}

export interface Resolution {
  id: string;
  conflictId: string;
  outcome: string;
  explanations: string[];
  appliedActions: AppliedAction[];
  overrides?: string;
  timestamp: string;
}

export interface ConflictInput {
  id: string;
  agents: AgentSlot[];
  context?: Record<string, unknown> | null;
}

export interface RuleDraft {
  id: string;
  name: string;
  priority: number;
  condition: string;
  actions: RuleAction[];
}

export interface ResolutionRecord {
  id: string;
  conflictId: string;
  outcome: string;
  explanations: string[];
  appliedActions: AppliedAction[];
  overrides?: string;
  timestamp: string;
}

export interface ExplanationTrail {
  ruleHits: Array<{ ruleId: string; ruleName: string; rationale: string }>;
  inputs: Record<string, unknown>;
  agentJustifications: Record<string, string[]>;
}

export interface ArtifactListItem {
  id: string;
  name: string;
  uri: string;
  type: string;
}

export interface ResolveConflictsRequest {
  conflicts: ConflictInput[];
  rules: RuleDraft[];
}

export interface ResolveConflictsResponse {
  resolutions: ResolutionRecord[];
  trace: ExplanationTrail;
  artifacts: ArtifactListItem[];
}
