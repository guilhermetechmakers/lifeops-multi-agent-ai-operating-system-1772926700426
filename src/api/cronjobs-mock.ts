/**
 * Mock Cronjobs API for development. Returns consistent shapes; consume with (data ?? []).
 */

import type {
  Cronjob,
  CronjobRun,
  CronjobListParams,
  CronjobListResponse,
  CreateCronjobInput,
  UpdateCronjobInput,
  BulkCronjobAction,
} from "@/types/cronjob";

export const MODULES = ["Developer", "Content", "Finance", "Health"];
export const OWNERS = ["user-1", "user-2", "system"];

const defaultRetry = { maxRetries: 3, backoffMs: 1000 };
const defaultOutputs = { logs: true, traceEnabled: true, artifacts: [] };

let MOCK_CRONJOBS: Cronjob[] = [
  {
    id: "1",
    name: "PR triage",
    enabled: true,
    scheduleExpression: "0 9 * * 1-5",
    scheduleUI: null,
    timezone: "UTC",
    triggerType: "time",
    targetType: "agent",
    targetId: "tpl-dev-triage",
    inputPayloadTemplate: "{}",
    permissionsLevel: "editor",
    automationLevel: "approval-required",
    constraints: {},
    safetyRails: [],
    retryPolicy: defaultRetry,
    outputsConfig: defaultOutputs,
    ownerId: "user-1",
    module: "Developer",
    tags: ["pr", "triage"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastRun: {
      status: "success",
      runId: "run-1-1",
      startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      finishedAt: new Date(Date.now() - 2 * 60 * 1000 + 5000).toISOString(),
      durationMs: 5000,
    },
    nextRun: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Daily digest",
    enabled: true,
    scheduleExpression: "0 8 * * *",
    scheduleUI: null,
    timezone: "UTC",
    triggerType: "time",
    targetType: "workflow",
    targetId: "digest-wf",
    inputPayloadTemplate: "{}",
    permissionsLevel: "editor",
    automationLevel: "auto-execute",
    constraints: {},
    safetyRails: [],
    retryPolicy: defaultRetry,
    outputsConfig: defaultOutputs,
    ownerId: "user-1",
    module: "Content",
    tags: ["digest", "content"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastRun: {
      status: "success",
      runId: "run-2-1",
      startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      finishedAt: new Date(Date.now() - 60 * 60 * 1000 + 12000).toISOString(),
      durationMs: 12000,
    },
    nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Monthly close",
    enabled: true,
    scheduleExpression: "0 0 L * *",
    scheduleUI: null,
    timezone: "UTC",
    triggerType: "time",
    targetType: "workflow",
    targetId: "finance-close",
    inputPayloadTemplate: "{}",
    permissionsLevel: "admin",
    automationLevel: "approval-required",
    constraints: {},
    safetyRails: ["confirm-close"],
    retryPolicy: defaultRetry,
    outputsConfig: defaultOutputs,
    ownerId: "user-2",
    module: "Finance",
    tags: ["finance", "close"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastRun: undefined,
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Content publish",
    enabled: false,
    scheduleExpression: "0 10 * * 2,4",
    scheduleUI: null,
    timezone: "UTC",
    triggerType: "time",
    targetType: "agent",
    targetId: "content-publisher",
    inputPayloadTemplate: "{}",
    permissionsLevel: "editor",
    automationLevel: "approval-required",
    constraints: {},
    safetyRails: [],
    retryPolicy: defaultRetry,
    outputsConfig: defaultOutputs,
    ownerId: "user-1",
    module: "Content",
    tags: ["content", "publish"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastRun: undefined,
    nextRun: undefined,
  },
];

const RUNS_BY_CRONJOB: Record<string, CronjobRun[]> = {
  "1": [
    {
      runId: "run-1-1",
      cronjobId: "1",
      status: "success",
      startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      finishedAt: new Date(Date.now() - 2 * 60 * 1000 + 5000).toISOString(),
      durationMs: 5000,
      artifacts: [],
      logs: ["Run started", "Completed"],
      trace: {},
    },
    {
      runId: "run-1-2",
      cronjobId: "1",
      status: "success",
      startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      finishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 4000).toISOString(),
      durationMs: 4000,
      artifacts: [],
      logs: [],
      trace: {},
    },
  ],
  "2": [
    {
      runId: "run-2-1",
      cronjobId: "2",
      status: "success",
      startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      finishedAt: new Date(Date.now() - 60 * 60 * 1000 + 12000).toISOString(),
      durationMs: 12000,
      artifacts: [],
      logs: [],
      trace: {},
    },
  ],
};

function applyFilters(list: Cronjob[], params: CronjobListParams): Cronjob[] {
  let out = [...list];
  const search = (params.search ?? "").trim().toLowerCase();
  if (search) {
    out = out.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        (c.module ?? "").toLowerCase().includes(search) ||
        (c.tags ?? []).some((t) => t.toLowerCase().includes(search)) ||
        (c.targetId ?? "").toLowerCase().includes(search)
    );
  }
  if (params.module) out = out.filter((c) => c.module === params.module);
  if (params.owner) out = out.filter((c) => c.ownerId === params.owner);
  if (params.status === "enabled") out = out.filter((c) => c.enabled);
  if (params.status === "paused") out = out.filter((c) => !c.enabled);
  if (params.tag)
    out = out.filter((c) => (c.tags ?? []).includes(params.tag as string));
  const t = params.triggerType as string | undefined;
  if (t && t !== "")
    out = out.filter((c) => c.triggerType === params.triggerType);
  const tg = params.targetType as string | undefined;
  if (tg && tg !== "")
    out = out.filter((c) => c.targetType === params.targetType);
  const a = params.automationLevel as string | undefined;
  if (a && a !== "")
    out = out.filter((c) => c.automationLevel === params.automationLevel);
  return out;
}

export async function mockGetCronjobsList(
  params: CronjobListParams = {}
): Promise<CronjobListResponse> {
  const filtered = applyFilters(MOCK_CRONJOBS, params);
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  return {
    data,
    count: filtered.length,
    page,
    pageSize,
  };
}

export async function mockGetCronjob(id: string): Promise<Cronjob> {
  const found = MOCK_CRONJOBS.find((c) => c.id === id);
  if (!found) throw new Error("Cronjob not found");
  return found;
}

export async function mockCreateCronjob(
  payload: CreateCronjobInput
): Promise<Cronjob> {
  const newJob: Cronjob = {
    id: `mock-${Date.now()}`,
    name: payload.name,
    enabled: payload.enabled ?? true,
    scheduleExpression: payload.scheduleExpression ?? null,
    scheduleUI: payload.scheduleUI ?? null,
    timezone: payload.timezone ?? "UTC",
    triggerType: payload.triggerType ?? "time",
    targetType: payload.targetType ?? "agent",
    targetId: payload.targetId,
    inputPayloadTemplate: payload.inputPayloadTemplate ?? "{}",
    permissionsLevel: payload.permissionsLevel ?? "editor",
    automationLevel: payload.automationLevel ?? "approval-required",
    constraints: payload.constraints ?? {},
    safetyRails: payload.safetyRails ?? [],
    retryPolicy: {
      maxRetries: payload.retryPolicy?.maxRetries ?? defaultRetry.maxRetries,
      backoffMs: payload.retryPolicy?.backoffMs ?? defaultRetry.backoffMs,
      deadLetterTarget: payload.retryPolicy?.deadLetterTarget,
    },
    outputsConfig: { ...defaultOutputs, ...payload.outputsConfig },
    ownerId: payload.ownerId ?? "user-1",
    module: payload.module ?? "Developer",
    tags: payload.tags ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  newJob.nextRun = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  MOCK_CRONJOBS = [...MOCK_CRONJOBS, newJob];
  return newJob;
}

export async function mockUpdateCronjob(
  id: string,
  payload: UpdateCronjobInput
): Promise<Cronjob | null> {
  const idx = MOCK_CRONJOBS.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const current = MOCK_CRONJOBS[idx];
  MOCK_CRONJOBS[idx] = {
    ...current,
    ...payload,
    retryPolicy: { ...defaultRetry, ...payload.retryPolicy },
    updatedAt: new Date().toISOString(),
  };
  return MOCK_CRONJOBS[idx];
}

export async function mockDeleteCronjob(id: string): Promise<boolean> {
  const before = MOCK_CRONJOBS.length;
  MOCK_CRONJOBS = MOCK_CRONJOBS.filter((c) => c.id !== id);
  return MOCK_CRONJOBS.length < before;
}

export async function mockRunNow(id: string): Promise<CronjobRun> {
  const job = MOCK_CRONJOBS.find((c) => c.id === id);
  if (!job) throw new Error("Cronjob not found");
  const run: CronjobRun = {
    runId: `run-${id}-${Date.now()}`,
    cronjobId: id,
    status: "success",
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    durationMs: 0,
    artifacts: [],
    logs: [],
    trace: {},
  };
  const runs = RUNS_BY_CRONJOB[id] ?? [];
  RUNS_BY_CRONJOB[id] = [run, ...runs];
  return run;
}

export async function mockCloneCronjob(id: string): Promise<Cronjob> {
  const job = MOCK_CRONJOBS.find((c) => c.id === id);
  if (!job) throw new Error("Cronjob not found");
  const input: CreateCronjobInput = {
    name: `${job.name} (copy)`,
    enabled: job.enabled,
    scheduleExpression: job.scheduleExpression,
    scheduleUI: job.scheduleUI,
    timezone: job.timezone,
    triggerType: job.triggerType,
    targetType: job.targetType,
    targetId: job.targetId,
    inputPayloadTemplate: job.inputPayloadTemplate,
    permissionsLevel: job.permissionsLevel,
    automationLevel: job.automationLevel,
    constraints: job.constraints,
    safetyRails: job.safetyRails,
    retryPolicy: job.retryPolicy,
    outputsConfig: job.outputsConfig,
    ownerId: job.ownerId,
    module: job.module,
    tags: job.tags,
  };
  const cloned = await mockCreateCronjob(input);
  return cloned;
}

export async function mockPauseCronjob(id: string): Promise<Cronjob | null> {
  return mockUpdateCronjob(id, { enabled: false });
}

export async function mockResumeCronjob(id: string): Promise<Cronjob | null> {
  return mockUpdateCronjob(id, { enabled: true });
}

export async function mockBulkCronjobs(
  payload: BulkCronjobAction
): Promise<{ updated: number; errors?: string[] }> {
  const ids = payload.ids ?? [];
  let updated = 0;
  const errors: string[] = [];
  for (const id of ids) {
    try {
      if (payload.action === "enable") {
        const j = MOCK_CRONJOBS.find((c) => c.id === id);
        if (j) {
          j.enabled = true;
          j.updatedAt = new Date().toISOString();
          updated++;
        }
      } else if (payload.action === "disable") {
        const j = MOCK_CRONJOBS.find((c) => c.id === id);
        if (j) {
          j.enabled = false;
          j.updatedAt = new Date().toISOString();
          updated++;
        }
      } else if (payload.action === "pause") {
        const j = MOCK_CRONJOBS.find((c) => c.id === id);
        if (j) {
          j.enabled = false;
          j.updatedAt = new Date().toISOString();
          updated++;
        }
      } else if (payload.action === "resume") {
        const j = MOCK_CRONJOBS.find((c) => c.id === id);
        if (j) {
          j.enabled = true;
          j.updatedAt = new Date().toISOString();
          updated++;
        }
      } else if (payload.action === "clone") {
        await mockCloneCronjob(id);
        updated++;
      } else if (payload.action === "delete") {
        MOCK_CRONJOBS = MOCK_CRONJOBS.filter((c) => c.id !== id);
        updated++;
      } else if (payload.action === "run-now") {
        await mockRunNow(id);
        updated++;
      }
    } catch (e) {
      errors.push(id + ": " + (e instanceof Error ? e.message : "Unknown error"));
    }
  }
  return { updated, errors: errors.length > 0 ? errors : undefined };
}

export async function mockGetCronjobRuns(
  id: string,
  _params?: { status?: string; from?: string; to?: string }
): Promise<CronjobRun[]> {
  const runs = RUNS_BY_CRONJOB[id] ?? [];
  return [...runs];
}

export async function mockGetCronjobsStats(): Promise<{
  runsLast24h: number;
  totalCronjobs: number;
  enabledCount: number;
}> {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  let runsLast24h = 0;
  for (const runs of Object.values(RUNS_BY_CRONJOB)) {
    runsLast24h += (runs ?? []).filter(
      (r) => new Date(r.startedAt).getTime() >= dayAgo
    ).length;
  }
  const totalCronjobs = MOCK_CRONJOBS.length;
  const enabledCount = MOCK_CRONJOBS.filter((c) => c.enabled).length;
  return { runsLast24h, totalCronjobs, enabledCount };
}

export async function mockGetCronjobAlerts(): Promise<unknown[]> {
  return [
    {
      id: "alert-1",
      severity: "info",
      message: "PR triage completed successfully",
      sourceModule: "cronjobs",
      timestamp: new Date().toISOString(),
    },
  ];
}

export async function mockValidateCronjob(
  _id: string,
  _payload?: Record<string, unknown>
): Promise<{ valid: boolean; errors?: string[] }> {
  return { valid: true };
}

export async function mockPreviewCronjob(
  payload: Record<string, unknown>
): Promise<{
  valid: boolean;
  estimatedCost?: number;
  estimatedDurationMs?: number;
  conflicts?: string[];
  errors?: string[];
  nextRunPreview?: string;
}> {
  const name = (payload?.name as string) ?? "";
  const expr = (payload?.scheduleExpression as string) ?? "";
  const errors: string[] = [];
  if (!name?.trim()) errors.push("Name is required");
  if (!expr?.trim()) errors.push("Schedule expression is required");
  const valid = errors.length === 0;
  return {
    valid,
    errors: valid ? undefined : errors,
    estimatedCost: 0.05,
    estimatedDurationMs: 5000,
    nextRunPreview: valid ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : undefined,
  };
}

export async function mockScheduleValidate(payload: {
  expression?: string;
  timezone?: string;
  builder?: object;
}): Promise<{ valid: boolean; errors?: string[]; nextRunPreview?: string }> {
  const expr = (payload?.expression as string) ?? "";
  const errors: string[] = [];
  if (!expr?.trim()) errors.push("Schedule expression is required");
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    nextRunPreview:
      errors.length === 0 ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : undefined,
  };
}

export async function mockGetCronjobTemplates(): Promise<
  Array<{ id: string; name: string; module?: string }>
> {
  return (MODULES ?? []).map((m, i) => ({
    id: `tpl-${m.toLowerCase()}-${i}`,
    name: `${m} template`,
    module: m,
  }));
}

function findRunByRunId(runId: string): { cronjobId: string; run: CronjobRun } | null {
  for (const [cronjobId, runs] of Object.entries(RUNS_BY_CRONJOB)) {
    const run = (runs ?? []).find((r) => r.runId === runId);
    if (run) return { cronjobId, run };
  }
  return null;
}

export async function mockGetCronjobRun(runId: string): Promise<CronjobRun> {
  const found = findRunByRunId(runId);
  if (!found) throw new Error("Run not found");
  return {
    ...found.run,
    traceId: `trace-${runId}`,
    summary: found.run.status === "success" ? "Completed successfully" : undefined,
    logs: Array.isArray(found.run.logs) ? found.run.logs : ["No logs"],
  };
}
