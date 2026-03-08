/**
 * Cronjob Editor: full CRUD with schedule builder, target picker, validation, dry-run.
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SectionPanel,
  ScheduleBuilder,
  TargetPicker,
  PayloadTemplateEditor,
  PermissionsAutomationControl,
  ConstraintsSafetyRailEditor,
  RetryPolicyEditor,
  OutputsConfigPanel,
  ValidationPreviewPanel,
  RunDetailsPanel,
  RunsTimelineTable,
  ToolbarActions,
} from "@/components/cronjobs/cronjob-editor";
import type { ScheduleBuilderValue } from "@/components/cronjobs/cronjob-editor";
import type { TargetValue } from "@/components/cronjobs/cronjob-editor";
import type { DryRunResult } from "@/components/cronjobs/cronjob-editor";
import { useCronjob, useUpdateCronjob, useCreateCronjob, useRunNowCronjob, useDeleteCronjob, useCronjobRuns } from "@/hooks/use-cronjobs";
import { cronjobsApi } from "@/api/cronjobs";
import * as mock from "@/api/cronjobs-mock";
import { builderToCron } from "@/lib/cron-utils";
import { toast } from "sonner";
import { ArrowLeft, Settings, Target, FileCode, Shield, AlertTriangle, RotateCcw, FileOutput, CheckCircle2, Play } from "lucide-react";
import type { CronjobDraft, Cronjob, CronjobRun } from "@/types/cronjob";

const USE_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_CRONJOBS === "true";

function jobToDraft(job: Cronjob | null): CronjobDraft {
  if (!job) {
    return {
      name: "",
      enabled: false,
      schedule: { type: "expression", expression: "0 9 * * 1-5" },
      timezone: "UTC",
      triggerType: "time",
      target: null,
      inputPayloadTemplate: "{}",
      permissionsLevel: "editor",
      automationLevel: "approval-required",
      constraints: {},
      safetyRails: [],
      retryPolicy: { maxRetries: 3, backoffMs: 1000 },
      outputsConfig: { logs: true, traceEnabled: true, runHistory: true },
      module: "Developer",
      tags: [],
    };
  }
  const automationBounds =
    job.constraints?.maxActions != null || job.constraints?.spendLimit != null
      ? {
          maxActions: job.constraints.maxActions,
          spendLimit: job.constraints.spendLimit,
          allowedTools: job.constraints.allowedTools,
        }
      : undefined;
  return {
    id: job.id,
    name: job.name,
    enabled: job.enabled,
    schedule: {
      type: "expression",
      expression: job.scheduleExpression ?? "0 9 * * 1-5",
    },
    timezone: job.timezone ?? "UTC",
    triggerType: job.triggerType,
    target:
      job.targetId != null && job.targetId !== ""
        ? {
            kind: job.targetType ?? "agent",
            id: job.targetId,
            name: job.targetId,
          }
        : null,
    inputPayloadTemplate: job.inputPayloadTemplate ?? "{}",
    permissionsLevel: job.permissionsLevel ?? "editor",
    automationLevel: job.automationLevel ?? "approval-required",
    automationBounds,
    constraints: job.constraints ?? {},
    safetyRails: Array.isArray(job.safetyRails) ? [...job.safetyRails] : [],
    safetyRailsConfig: {},
    retryPolicy: job.retryPolicy ?? { maxRetries: 3, backoffMs: 1000 },
    outputsConfig: job.outputsConfig ?? { logs: true, traceEnabled: true },
    module: job.module ?? "Developer",
    tags: Array.isArray(job.tags) ? [...job.tags] : [],
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

function draftToCreateInput(draft: CronjobDraft) {
  const expr =
    draft.schedule?.type === "builder" && draft.schedule?.builder
      ? builderToCron(draft.schedule.builder)
      : draft.schedule?.expression ?? "0 9 * * 1-5";
  const scheduleUI =
    draft.schedule?.type === "builder" && draft.schedule?.builder
      ? (draft.schedule.builder as Record<string, unknown>)
      : null;
  return {
    name: draft.name,
    enabled: draft.enabled,
    scheduleExpression: expr || null,
    scheduleUI,
    timezone: draft.timezone ?? "UTC",
    triggerType: draft.triggerType,
    targetType: draft.target?.kind ?? "agent",
    targetId: draft.target?.id ?? "",
    inputPayloadTemplate: draft.inputPayloadTemplate ?? "{}",
    permissionsLevel: draft.permissionsLevel,
    automationLevel: draft.automationLevel,
    automationBounds: draft.automationBounds,
    constraints: draft.constraints ?? {},
    safetyRails: draft.safetyRails ?? [],
    safetyRailsConfig: draft.safetyRailsConfig,
    retryPolicy: draft.retryPolicy,
    outputsConfig: draft.outputsConfig,
    module: draft.module,
    tags: draft.tags ?? [],
  };
}

export default function CronjobEditor() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isNew = id === "new" || !id;
  const { data: job, isLoading } = useCronjob(isNew ? undefined : id);
  const { items: runs } = useCronjobRuns(isNew ? undefined : id);
  const update = useUpdateCronjob();
  const create = useCreateCronjob();
  const runNow = useRunNowCronjob();
  const deleteJob = useDeleteCronjob();

  const [draft, setDraft] = useState<CronjobDraft>(() => jobToDraft(null));
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [selectedRun, setSelectedRun] = useState<CronjobRun | null>(null);

  useEffect(() => {
    const dup = (location.state as { duplicateFrom?: CronjobDraft })?.duplicateFrom;
    if (dup && isNew) {
      setDraft({ ...dup, id: undefined, name: `${dup.name} (copy)` });
      return;
    }
    if (job) {
      setDraft(jobToDraft(job));
    } else if (isNew) {
      setDraft(jobToDraft(null));
    }
  }, [job, isNew, location.state]);

  const scheduleValue: ScheduleBuilderValue = useMemo(
    () => ({
      type: draft.schedule?.type ?? "expression",
      expression: draft.schedule?.expression ?? "0 9 * * 1-5",
      timezone: draft.timezone ?? "UTC",
      builder: draft.schedule?.builder,
    }),
    [draft.schedule, draft.timezone]
  );

  const targetValue: TargetValue | null = useMemo(
    () =>
      draft.target?.id
        ? {
            kind: draft.target.kind,
            id: draft.target.id,
            name: draft.target.name,
          }
        : null,
    [draft.target]
  );

  const handleScheduleChange = useCallback((v: ScheduleBuilderValue) => {
    setDraft((prev) => ({
      ...prev,
      schedule: {
        type: v.type ?? "expression",
        expression: v.expression,
        builder: v.builder,
      },
      timezone: v.timezone ?? prev.timezone,
    }));
  }, []);

  const handleTargetChange = useCallback((v: TargetValue) => {
    setDraft((prev) => ({
      ...prev,
      target: { kind: v.kind, id: v.id, name: v.name },
    }));
  }, []);

  const handleSave = useCallback(async () => {
    const input = draftToCreateInput(draft);
    if (!input.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!input.targetId?.trim()) {
      toast.error("Target is required");
      return;
    }
    try {
      if (isNew) {
        const created = await create.mutateAsync(input);
        if (created?.id) {
          navigate(`/dashboard/cronjobs/${created.id}/edit`);
        }
      } else {
        await update.mutateAsync({ id: id!, payload: input });
      }
    } catch {
      // toast in hooks
    }
  }, [draft, isNew, id, create, update, navigate]);

  const handleDryRun = useCallback(async (): Promise<DryRunResult> => {
    const input = draftToCreateInput(draft);
    try {
      const result = USE_MOCK
        ? await mock.mockPreviewCronjob(input as unknown as Record<string, unknown>)
        : await cronjobsApi.preview(input as unknown as Record<string, unknown>);
      const dryResult = result as DryRunResult;
      setDryRunResult(dryResult);
      return dryResult;
    } catch (err) {
      const errResult: DryRunResult = {
        valid: false,
        errors: [err instanceof Error ? err.message : "Dry-run failed"],
      };
      setDryRunResult(errResult);
      return errResult;
    }
  }, [draft]);

  const handleRunNow = useCallback(async () => {
    if (!id || isNew) return;
    try {
      await runNow.mutateAsync(id);
      const run = (runs ?? [])[0];
      if (run) setSelectedRun(run);
    } catch {
      // toast in hooks
    }
  }, [id, isNew, runNow, runs]);

  const handleDelete = useCallback(async () => {
    if (!id || isNew) return;
    try {
      await deleteJob.mutateAsync(id);
      navigate("/dashboard/cronjobs");
    } catch {
      // toast in hooks
    }
  }, [id, isNew, deleteJob, navigate]);

  const handleDuplicate = useCallback(() => {
    navigate("/dashboard/cronjobs/new", {
      state: { duplicateFrom: { ...draft, id: undefined, name: `${draft.name} (copy)` } },
    });
  }, [navigate, draft]);

  const isValid =
    (draft.name?.trim() ?? "").length > 0 &&
    (draft.target?.id ?? "").length > 0;

  const runList = Array.isArray(runs) ? runs : [];
  const latestRun = runList[0] ?? null;
  const displayRun = selectedRun ?? latestRun;

  if (!isNew && isLoading) {
    return (
      <AnimatedPage className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to={isNew ? "/dashboard/cronjobs" : `/dashboard/cronjobs/${id}`}>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-transparent hover:bg-secondary"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">
            {isNew ? "New cronjob" : "Edit cronjob"}
          </h1>
          <p className="text-sm text-muted-foreground truncate">
            {isNew
              ? "Create a scheduled or event-triggered automation."
              : `ID: ${id}`}
          </p>
        </div>
        <ToolbarActions
          isNew={isNew}
          enabled={draft.enabled}
          onEnabledChange={(v) => setDraft((p) => ({ ...p, enabled: v }))}
          onSave={handleSave}
          onValidate={() => void handleDryRun()}
          onDryRun={() => void handleDryRun()}
          onRunNow={() => void handleRunNow()}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          isSaving={create.isPending || update.isPending}
          isRunning={runNow.isPending}
          isValid={isValid}
        />
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-secondary border border-white/[0.03] flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="target" className="gap-2">
            <Target className="h-4 w-4" />
            Target
          </TabsTrigger>
          <TabsTrigger value="payload" className="gap-2">
            <FileCode className="h-4 w-4" />
            Payload
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="constraints" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Constraints
          </TabsTrigger>
          <TabsTrigger value="retry" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Retry
          </TabsTrigger>
          <TabsTrigger value="outputs" className="gap-2">
            <FileOutput className="h-4 w-4" />
            Outputs
          </TabsTrigger>
          <TabsTrigger value="validation" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="runs" className="gap-2">
            <Play className="h-4 w-4" />
            Runs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <SectionPanel
            title="General"
            description="Name, schedule, and trigger type."
            help="Configure the cronjob identity and when it runs."
            icon={<Settings className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. PR triage"
                  className="bg-input border-white/[0.03]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="triggerType">Trigger type</Label>
                <select
                  id="triggerType"
                  value={draft.triggerType}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      triggerType: e.target.value as "time" | "event" | "conditional",
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-input px-3 text-sm border-white/[0.03]"
                >
                  <option value="time">Time</option>
                  <option value="event">Event</option>
                  <option value="conditional">Conditional</option>
                </select>
              </div>
              <ScheduleBuilder
                value={scheduleValue}
                onChange={handleScheduleChange}
              />
            </div>
          </SectionPanel>
        </TabsContent>

        <TabsContent value="target" className="space-y-4">
          <SectionPanel
            title="Target"
            description="Select the agent or workflow to run."
            help="Choose an agent or workflow template as the execution target."
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
          >
            <TargetPicker value={targetValue} onChange={handleTargetChange} />
          </SectionPanel>
        </TabsContent>

        <TabsContent value="payload" className="space-y-4">
          <SectionPanel
            title="Input payload template"
            description="JSON template with variables for each run."
            help="Use {{variable}} syntax for dynamic values."
            icon={<FileCode className="h-4 w-4 text-muted-foreground" />}
          >
            <PayloadTemplateEditor
              value={draft.inputPayloadTemplate ?? "{}"}
              onChange={(v) =>
                setDraft((p) => ({ ...p, inputPayloadTemplate: v }))
              }
            />
          </SectionPanel>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <SectionPanel
            title="Permissions & automation"
            description="Automation mode and bounds."
            help="Control how much autonomy the cronjob has."
            icon={<Shield className="h-4 w-4 text-muted-foreground" />}
          >
            <PermissionsAutomationControl
              permissionsLevel={draft.permissionsLevel}
              automationLevel={draft.automationLevel}
              automationBounds={draft.automationBounds}
              onPermissionsChange={(v) =>
                setDraft((p) => ({ ...p, permissionsLevel: v }))
              }
              onAutomationChange={(v) =>
                setDraft((p) => ({ ...p, automationLevel: v }))
              }
              onBoundsChange={(v) =>
                setDraft((p) => ({ ...p, automationBounds: v }))
              }
            />
          </SectionPanel>
        </TabsContent>

        <TabsContent value="constraints" className="space-y-4">
          <SectionPanel
            title="Constraints & safety rails"
            description="Limits and confirmations."
            help="Max actions, spend limits, required confirmations."
            icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          >
            <ConstraintsSafetyRailEditor
              constraints={draft.constraints}
              onConstraintsChange={(v) =>
                setDraft((p) => ({ ...p, constraints: v }))
              }
              safetyRailsConfig={draft.safetyRailsConfig}
              onSafetyRailsConfigChange={(v) =>
                setDraft((p) => ({ ...p, safetyRailsConfig: v }))
              }
              safetyRails={draft.safetyRails}
              onSafetyRailsChange={(v) =>
                setDraft((p) => ({ ...p, safetyRails: v }))
              }
            />
          </SectionPanel>
        </TabsContent>

        <TabsContent value="retry" className="space-y-4">
          <SectionPanel
            title="Retry policy"
            description="Backoff and dead-letter configuration."
            help="Configure retries and failure handling."
            icon={<RotateCcw className="h-4 w-4 text-muted-foreground" />}
          >
            <RetryPolicyEditor
              value={draft.retryPolicy}
              onChange={(v) =>
                setDraft((p) => ({ ...p, retryPolicy: v }))
              }
            />
          </SectionPanel>
        </TabsContent>

        <TabsContent value="outputs" className="space-y-4">
          <SectionPanel
            title="Outputs"
            description="Run history, logs, artifacts, trace."
            help="Configure what outputs to capture and display."
            icon={<FileOutput className="h-4 w-4 text-muted-foreground" />}
          >
            <OutputsConfigPanel
              value={draft.outputsConfig}
              onChange={(v) =>
                setDraft((p) => ({ ...p, outputsConfig: v }))
              }
            />
          </SectionPanel>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <SectionPanel
            title="Validation & preview"
            description="Dry-run to validate configuration."
            help="Simulate a run without executing."
            icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
          >
            <ValidationPreviewPanel
              onDryRun={() => handleDryRun()}
              lastResult={dryRunResult}
            />
          </SectionPanel>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionPanel
              title="Runs timeline"
              description="Recent and upcoming runs."
              icon={<Play className="h-4 w-4 text-muted-foreground" />}
            >
              <RunsTimelineTable
                runs={runList}
                upcoming={job?.nextRun ? [{ nextRun: job.nextRun }] : []}
                cronjobId={id}
                onRunNow={isNew ? undefined : handleRunNow}
                isLoading={runNow.isPending}
              />
            </SectionPanel>
            <SectionPanel
              title="Run details"
              description="Inspect a run's inputs, trace, logs."
              icon={<FileOutput className="h-4 w-4 text-muted-foreground" />}
            >
              <RunDetailsPanel
                run={displayRun}
                cronjobId={id}
              />
            </SectionPanel>
          </div>
        </TabsContent>
      </Tabs>
    </AnimatedPage>
  );
}
