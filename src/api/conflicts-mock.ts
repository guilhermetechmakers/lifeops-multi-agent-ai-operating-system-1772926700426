/**
 * Mock Conflict Resolution Engine API for development.
 * Returns consistent shapes; consume with (data ?? []).
 */

import type {
  Conflict,
  Resolution,
  ConflictInput,
  RuleDraft,
  ResolveConflictsRequest,
  ResolveConflictsResponse,
  ResolutionRecord,
  ExplanationTrail,
  ArtifactListItem,
} from "@/types/conflicts";
import { safeArray } from "@/lib/api";

const MOCK_AGENTS = [
  { id: "agent-pr-triage", role: "pr-triage", priority: 10 },
  { id: "agent-notifier", role: "notifier", priority: 5 },
  { id: "agent-reviewer", role: "reviewer", priority: 8 },
];

const MOCK_CONFLICTS: Conflict[] = [
  {
    id: "conflict-1",
    agents: MOCK_AGENTS,
    context: { resource: "pr-status-123", competingActions: ["approve", "reject"] },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: "open",
  },
  {
    id: "conflict-2",
    agents: MOCK_AGENTS.slice(0, 2),
    context: { resource: "slack-channel", competingActions: ["notify", "silence"] },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    status: "resolved",
  },
];

export async function mockResolveConflicts(
  payload: ResolveConflictsRequest
): Promise<ResolveConflictsResponse> {
  await new Promise((r) => setTimeout(r, 500));

  const conflicts = safeArray<ConflictInput>(payload.conflicts);
  const rules = safeArray<RuleDraft>(payload.rules);

  const resolutions: ResolutionRecord[] = conflicts.map((c) => ({
    id: `res-${c.id}-${Date.now()}`,
    conflictId: c.id,
    outcome: "resolved",
    explanations: [
      `Rule "Higher priority wins" matched: agent-pr-triage (priority 10) deferred to agent-reviewer (priority 8).`,
      "Deterministic evaluation completed in priority order.",
    ],
    appliedActions: [
      { agentId: "agent-pr-triage", action: "defer", success: true },
      { agentId: "agent-reviewer", action: "accept", success: true },
    ],
    timestamp: new Date().toISOString(),
  }));

  const trace: ExplanationTrail = {
    ruleHits: rules.slice(0, 1).map((r) => ({
      ruleId: r.id,
      ruleName: r.name,
      rationale: "Condition matched: higher priority agent deferred.",
    })),
    inputs: conflicts[0]?.context ?? {},
    agentJustifications: {
      "agent-pr-triage": ["Deferred per rule-1 (higher priority wins)"],
      "agent-reviewer": ["Accepted primary action per rule-2"],
    },
  };

  const artifacts: ArtifactListItem[] = [
    {
      id: "art-res-1",
      name: "resolution-log.json",
      uri: "/artifacts/resolution-log.json",
      type: "application/json",
    },
  ];

  return {
    resolutions,
    trace,
    artifacts,
  };
}

export function mockGetConflicts(): Conflict[] {
  return [...MOCK_CONFLICTS];
}

export async function mockGetConflict(id: string): Promise<Conflict | null> {
  await new Promise((r) => setTimeout(r, 200));
  const found = MOCK_CONFLICTS.find((c) => c.id === id);
  return found ?? null;
}

export async function mockOverrideConflict(
  id: string,
  _payload: { outcome?: string; notes?: string }
): Promise<Resolution> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    id: `res-override-${id}`,
    conflictId: id,
    outcome: "overridden",
    explanations: ["Human override applied"],
    appliedActions: [],
    overrides: "Manual resolution by user",
    timestamp: new Date().toISOString(),
  };
}
