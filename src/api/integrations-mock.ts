/**
 * Mock data for CI & Integrations when API is not configured.
 */

import type {
  Integration,
  Connector,
  DeploymentTarget,
  RunRecord,
  LogEntry,
  AdapterConfig,
  RepoLink,
  IntegrationAuditEntry,
} from "@/types/integrations";

const integrations: Integration[] = [
  {
    id: "int-1",
    projectId: "proj-1",
    name: "GitHub",
    type: "git",
    provider: "GitHub",
    status: "active",
    healthScore: 95,
    lastRunAt: "2025-03-06T10:00:00Z",
    nextRunAt: "2025-03-07T09:00:00Z",
    isActive: true,
    config: { repo: "lifeops-app", defaultBranch: "main" },
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2025-03-06T10:00:00Z",
  },
  {
    id: "int-2",
    projectId: "proj-1",
    name: "Jenkins CI",
    type: "ci",
    provider: "Jenkins",
    status: "active",
    healthScore: 78,
    lastRunAt: "2025-03-06T10:12:00Z",
    nextRunAt: "2025-03-06T14:00:00Z",
    isActive: true,
    config: { jobName: "lifeops-build", url: "https://jenkins.example.com" },
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2025-03-06T10:12:00Z",
  },
  {
    id: "int-3",
    projectId: "proj-1",
    name: "Staging Deploy",
    type: "deploy",
    provider: "Kubernetes",
    status: "error",
    healthScore: 45,
    lastRunAt: "2025-03-06T10:08:00Z",
    isActive: true,
    config: { cluster: "staging", namespace: "lifeops" },
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2025-03-06T10:12:00Z",
  },
];

const connectors: Connector[] = [
  { id: "conn-1", integrationId: "int-1", provider: "GitHub", tokenStatus: "valid", webhookUrl: "https://api.example.com/webhooks/github", errorCount: 0 },
  { id: "conn-2", integrationId: "int-2", provider: "Jenkins", tokenStatus: "valid", errorCount: 2, lastError: "Connection timeout" },
  { id: "conn-3", integrationId: "int-3", provider: "Kubernetes", tokenStatus: "expired", errorCount: 5, lastError: "Token expired" },
];

const deploymentTargets: DeploymentTarget[] = [
  { id: "dt-1", projectId: "proj-1", name: "Staging", environment: "staging", cluster: "k8s-staging", region: "us-east-1", config: {}, isActive: true },
  { id: "dt-2", projectId: "proj-1", name: "Production", environment: "production", cluster: "k8s-prod", region: "us-east-1", config: {}, isActive: false },
];

const runs: RunRecord[] = [
  { id: "run-1", integrationId: "int-1", startTime: "2025-03-06T10:00:00Z", endTime: "2025-03-06T10:02:00Z", durationMs: 120000, outcome: "success", traceId: "tr-abc-1", artifacts: [{ type: "commit", sha: "abc123" }] },
  { id: "run-2", integrationId: "int-2", startTime: "2025-03-06T10:05:00Z", endTime: "2025-03-06T10:12:00Z", durationMs: 420000, outcome: "failure", traceId: "tr-abc-2", artifacts: [] },
  { id: "run-3", integrationId: "int-3", startTime: "2025-03-06T10:08:00Z", endTime: "2025-03-06T10:12:00Z", durationMs: 240000, outcome: "partial", traceId: "tr-abc-3", artifacts: [] },
];

const logs: LogEntry[] = [
  { id: "log-1", runId: "run-1", level: "info", message: "Webhook received", timestamp: "2025-03-06T10:00:01Z", source: "github" },
  { id: "log-2", runId: "run-1", level: "info", message: "Sync completed", timestamp: "2025-03-06T10:02:00Z", source: "sync" },
  { id: "log-3", runId: "run-2", level: "error", message: "Deploy failed: env var missing", timestamp: "2025-03-06T10:12:00Z", source: "deploy" },
];

const adapters: AdapterConfig[] = [
  { id: "ad-1", integrationId: "int-1", eventName: "PR Created", workflowName: "pr-summary", payloadTemplate: "{\"prId\": \"{{pr.id}}\"}", scope: "project", requiredPermissions: ["repo:read"] },
  { id: "ad-2", integrationId: "int-1", eventName: "Push", workflowName: "sync-branches", payloadTemplate: "{}", scope: "repo", requiredPermissions: ["repo:read"] },
];

const repoLinks: RepoLink[] = [
  { id: "rl-1", projectId: "proj-1", url: "https://github.com/org/lifeops-app", branchPattern: "main|develop", createdAt: "2024-01-15T00:00:00Z" },
];

const auditEntries: IntegrationAuditEntry[] = [
  { id: "aud-1", integrationId: "int-1", action: "config_updated", actorName: "Alex", timestamp: "2025-03-06T09:00:00Z", details: { field: "webhook" } },
  { id: "aud-2", integrationId: "int-2", action: "run_triggered", actorName: "Sam", timestamp: "2025-03-06T10:05:00Z" },
];

export function mockGetIntegrations(projectId: string): Promise<Integration[]> {
  const list = (integrations ?? []).filter((i) => i.projectId === projectId);
  return Promise.resolve(list);
}

export function mockCreateIntegration(projectId: string, data: Partial<Integration>): Promise<Integration> {
  const item: Integration = {
    id: `int-${Date.now()}`,
    projectId,
    name: data.name ?? "New Integration",
    type: (data.type as Integration["type"]) ?? "git",
    provider: data.provider ?? "Unknown",
    status: (data.status as Integration["status"]) ?? "inactive",
    healthScore: data.healthScore ?? 0,
    isActive: data.isActive ?? false,
    config: data.config ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  integrations.push(item);
  return Promise.resolve(item);
}

export function mockUpdateIntegration(
  projectId: string,
  integrationId: string,
  data: Partial<Integration>
): Promise<Integration> {
  const item = integrations.find((i) => i.id === integrationId && i.projectId === projectId);
  if (item) {
    Object.assign(item, data, { updatedAt: new Date().toISOString() });
    return Promise.resolve(item);
  }
  return Promise.reject(new Error("Integration not found"));
}

export function mockTriggerRun(integrationId: string): Promise<RunRecord> {
  const run: RunRecord = {
    id: `run-${Date.now()}`,
    integrationId,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    durationMs: 0,
    outcome: "success",
    traceId: `tr-${Date.now()}`,
    artifacts: [],
  };
  runs.unshift(run);
  return Promise.resolve(run);
}

export function mockGetRuns(integrationId: string): Promise<{ items: RunRecord[]; count: number }> {
  const list = (runs ?? []).filter((r) => r.integrationId === integrationId);
  return Promise.resolve({ items: list, count: list.length });
}

export function mockGetLogs(integrationId: string, _params?: { runId?: string; level?: string }): Promise<LogEntry[]> {
  const list = (logs ?? []).filter((l) => {
    const run = runs.find((r) => r.id === l.runId);
    return run?.integrationId === integrationId;
  });
  return Promise.resolve(list);
}

export function mockGetAdapters(integrationId: string): Promise<AdapterConfig[]> {
  const list = (adapters ?? []).filter((a) => a.integrationId === integrationId);
  return Promise.resolve(list);
}

export function mockSaveAdapters(integrationId: string, newAdapters: Partial<AdapterConfig>[]): Promise<AdapterConfig[]> {
  const others = adapters.filter((a) => a.integrationId !== integrationId);
  const updated = newAdapters.map((a, i) => ({
    id: `ad-${Date.now()}-${i}`,
    integrationId,
    eventName: a.eventName ?? "",
    workflowName: a.workflowName ?? "",
    payloadTemplate: a.payloadTemplate ?? "{}",
    scope: a.scope ?? "project",
    requiredPermissions: Array.isArray(a.requiredPermissions) ? a.requiredPermissions : [],
    ...a,
  })) as AdapterConfig[];
  adapters.length = 0;
  adapters.push(...others, ...updated);
  return Promise.resolve(updated);
}

export function mockGetDeploymentTargets(projectId: string): Promise<DeploymentTarget[]> {
  const list = (deploymentTargets ?? []).filter((d) => d.projectId === projectId);
  return Promise.resolve(list);
}

export function mockActivateDeployment(_deploymentTargetId: string): Promise<{ ok: boolean }> {
  return Promise.resolve({ ok: true });
}

export function mockGetHealth(_projectId: string, integrationId: string): Promise<{ healthScore: number; lastError?: string }> {
  const int = integrations.find((i) => i.id === integrationId);
  const conn = connectors.find((c) => c.integrationId === integrationId);
  return Promise.resolve({
    healthScore: int?.healthScore ?? 0,
    lastError: conn?.lastError,
  });
}

export function mockGetConnectors(integrationId: string): Promise<Connector[]> {
  const list = (connectors ?? []).filter((c) => c.integrationId === integrationId);
  return Promise.resolve(list);
}

export function mockGetRepoLinks(projectId: string): Promise<RepoLink[]> {
  const list = (repoLinks ?? []).filter((r) => r.projectId === projectId);
  return Promise.resolve(list);
}

export function mockSaveRepoLink(projectId: string, data: Partial<RepoLink>): Promise<RepoLink> {
  const item: RepoLink = {
    id: data.id ?? `rl-${Date.now()}`,
    projectId,
    url: data.url ?? "",
    branchPattern: data.branchPattern,
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
  const idx = repoLinks.findIndex((r) => r.projectId === projectId && r.id === data.id);
  if (idx >= 0) repoLinks[idx] = item;
  else repoLinks.push(item);
  return Promise.resolve(item);
}

export function mockGetAuditTrail(projectId: string, integrationId?: string): Promise<IntegrationAuditEntry[]> {
  let list = (auditEntries ?? []).filter((a) => {
    const int = integrations.find((i) => i.id === a.integrationId);
    return int?.projectId === projectId;
  });
  if (integrationId) list = list.filter((a) => a.integrationId === integrationId);
  return Promise.resolve(list);
}
