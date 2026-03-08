/**
 * Cronjob Editor utils: default draft, map to/from API. All array/object access guarded.
 */

import { builderToCron } from "@/lib/cron-utils";
import type {
  Cronjob,
  CronjobDraft,
  CronjobOutputsConfig,
  CreateCronjobInput,
  UpdateCronjobInput,
  CronjobTarget,
} from "@/types/cronjob";

const DEFAULT_RETRY = {
  maxRetries: 3,
  backoffMs: 1000,
  backoffBaseMs: 1000,
  backoffMultiplier: 2,
  maxBackoffMs: 60000,
  deadLetterQueue: false,
  deadLetterTarget: undefined,
};

const DEFAULT_OUTPUTS: Partial<CronjobOutputsConfig> = {
  runHistory: true,
  logs: true,
  artifacts: [],
  diffs: true,
  traceEnabled: true,
};

/** Default empty draft for new cronjob. */
export function getDefaultCronjobDraft(): CronjobDraft {
  return {
    name: "",
    enabled: false,
    schedule: {
      type: "expression",
      expression: "0 9 * * 1-5",
    },
    timezone: "UTC",
    triggerType: "time",
    target: null,
    inputPayloadTemplate: "{}",
    permissionsLevel: "editor",
    automationLevel: "approval-required",
    automationBounds: {},
    constraints: {},
    safetyRails: [],
    safetyRailsConfig: {},
    retryPolicy: { ...DEFAULT_RETRY },
    outputsConfig: { ...DEFAULT_OUTPUTS },
    module: "Developer",
    tags: [],
  };
}

/** Map API Cronjob to editor CronjobDraft. */
export function cronjobToDraft(job: Cronjob | null | undefined): CronjobDraft | null {
  if (!job) return null;
  const scheduleExpression = job.scheduleExpression ?? "";
  const hasBuilder = job.scheduleUI && typeof job.scheduleUI === "object";
  const draft: CronjobDraft = {
    id: job.id,
    name: job.name ?? "",
    enabled: Boolean(job.enabled),
    schedule: {
      type: hasBuilder ? "builder" : "expression",
      expression: scheduleExpression || "0 9 * * 1-5",
      builder: hasBuilder ? (job.scheduleUI as CronjobDraft["schedule"]["builder"]) : undefined,
    },
    timezone: job.timezone ?? "UTC",
    triggerType: job.triggerType ?? "time",
    target:
      job.targetId != null && String(job.targetId).trim() !== ""
        ? ({
            kind: job.targetType ?? "agent",
            id: job.targetId,
            name: job.targetId,
          } as CronjobTarget)
        : null,
    inputPayloadTemplate: job.inputPayloadTemplate ?? "{}",
    permissionsLevel: job.permissionsLevel ?? "editor",
    automationLevel: job.automationLevel ?? "approval-required",
    automationBounds: job.constraints ? { ...job.constraints } : undefined,
    constraints: job.constraints ?? {},
    safetyRails: Array.isArray(job.safetyRails) ? [...job.safetyRails] : [],
    safetyRailsConfig: {},
    retryPolicy: job.retryPolicy ? { ...DEFAULT_RETRY, ...job.retryPolicy } : { ...DEFAULT_RETRY },
    outputsConfig: (() => {
      const base = { ...DEFAULT_OUTPUTS };
      if (job.outputsConfig) {
        const oc = job.outputsConfig;
        return {
          ...base,
          ...oc,
          artifacts: Array.isArray(oc.artifacts) ? oc.artifacts : (base.artifacts ?? []) as string[],
        } as Partial<import("@/types/cronjob").CronjobOutputsConfig>;
      }
      return base as Partial<import("@/types/cronjob").CronjobOutputsConfig>;
    })(),
    module: job.module ?? "Developer",
    tags: Array.isArray(job.tags) ? [...job.tags] : [],
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
  return draft;
}

/** Resolve schedule expression from draft (expression or builder). */
function getScheduleExpression(draft: CronjobDraft): string | null {
  const sch = draft.schedule ?? { type: "expression" };
  if (sch.type === "expression" && sch.expression?.trim()) {
    return sch.expression.trim();
  }
  if (sch.type === "builder" && sch.builder) {
    return builderToCron(sch.builder);
  }
  return (sch as { expression?: string }).expression?.trim() || null;
}

/** Map CronjobDraft to CreateCronjobInput for API. */
export function draftToCreateInput(draft: CronjobDraft): CreateCronjobInput {
  const scheduleExpression = getScheduleExpression(draft);
  const scheduleUI =
    draft.schedule?.type === "builder" && draft.schedule?.builder
      ? (draft.schedule.builder as Record<string, unknown>)
      : null;
  return {
    name: draft.name,
    enabled: draft.enabled,
    scheduleExpression,
    scheduleUI,
    timezone: draft.timezone ?? "UTC",
    triggerType: draft.triggerType ?? "time",
    targetType: draft.target?.kind ?? "agent",
    targetId: draft.target?.id ?? "",
    inputPayloadTemplate: draft.inputPayloadTemplate ?? "{}",
    permissionsLevel: draft.permissionsLevel ?? "editor",
    automationLevel: draft.automationLevel ?? "approval-required",
    constraints: draft.constraints ?? {},
    safetyRails: draft.safetyRails ?? [],
    safetyRailsConfig: draft.safetyRailsConfig,
    automationBounds: draft.automationBounds,
    retryPolicy: draft.retryPolicy,
    outputsConfig: draft.outputsConfig,
    module: draft.module ?? "Developer",
    tags: draft.tags ?? [],
  };
}

/** Map CronjobDraft to UpdateCronjobInput for API. */
export function draftToUpdateInput(draft: CronjobDraft): UpdateCronjobInput {
  return draftToCreateInput(draft);
}
