/**
 * Cronjob Editor: full CRUD with schedule builder, tabs, validation.
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Play } from "lucide-react";
import { AnimatedPage } from "@/components/animated-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScheduleBuilderPanel, type ScheduleBuilderValue } from "@/components/cronjobs/schedule-builder-panel";
import { useCronjob, useUpdateCronjob, useCreateCronjob, useRunNowCronjob } from "@/hooks/use-cronjobs";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  timezone: z.string().min(1, "Timezone is required"),
  triggerType: z.enum(["time", "event", "conditional"]),
  targetType: z.enum(["agent", "workflow"]),
  targetId: z.string().min(1, "Target is required"),
  inputPayloadTemplate: z.string(),
  permissionsLevel: z.enum(["viewer", "editor", "admin"]),
  automationLevel: z.enum(["suggest-only", "approval-required", "auto-execute", "bounded-autopilot"]),
  module: z.string(),
});

type FormData = z.infer<typeof schema>;

const defaultSchedule: ScheduleBuilderValue = {
  expression: "0 9 * * 1-5",
  timezone: "UTC",
};

export default function CronjobEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new" || !id;
  const { data: job, isLoading } = useCronjob(isNew ? undefined : id);
  const update = useUpdateCronjob();
  const create = useCreateCronjob();
  const runNow = useRunNowCronjob();

  const [schedule, setSchedule] = useState<ScheduleBuilderValue>(defaultSchedule);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      timezone: "UTC",
      triggerType: "time",
      targetType: "agent",
      targetId: "",
      inputPayloadTemplate: "{}",
      permissionsLevel: "editor",
      automationLevel: "approval-required",
      module: "Developer",
    },
  });

  useEffect(() => {
    if (!job) return;
    reset({
      name: job.name,
      timezone: job.timezone,
      triggerType: job.triggerType,
      targetType: job.targetType,
      targetId: job.targetId,
      inputPayloadTemplate: job.inputPayloadTemplate ?? "{}",
      permissionsLevel: job.permissionsLevel,
      automationLevel: job.automationLevel,
      module: job.module ?? "Developer",
    });
    setSchedule({
      expression: job.scheduleExpression ?? "0 9 * * 1-5",
      timezone: job.timezone ?? "UTC",
    });
  }, [job, reset]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        if (isNew) {
          const created = await create.mutateAsync({
            name: data.name,
            enabled: false,
            scheduleExpression: schedule.expression || null,
            timezone: schedule.timezone,
            triggerType: data.triggerType,
            targetType: data.targetType,
            targetId: data.targetId,
            inputPayloadTemplate: data.inputPayloadTemplate,
            permissionsLevel: data.permissionsLevel,
            automationLevel: data.automationLevel,
            module: data.module,
          });
          if (created?.id) {
            toast.success("Cronjob created");
            navigate(`/dashboard/cronjobs/${created.id}/edit`);
          }
        } else {
          await update.mutateAsync({
            id: id!,
            payload: {
              name: data.name,
              timezone: schedule.timezone,
              scheduleExpression: schedule.expression || null,
              triggerType: data.triggerType,
              targetType: data.targetType,
              targetId: data.targetId,
              inputPayloadTemplate: data.inputPayloadTemplate,
              permissionsLevel: data.permissionsLevel,
              automationLevel: data.automationLevel,
              module: data.module,
            },
          });
        }
      } catch {
        // toast in hooks
      }
    },
    [
      isNew,
      id,
      schedule,
      create,
      update,
      navigate,
    ]
  );

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
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">
            {isNew ? "New cronjob" : "Edit cronjob"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isNew ? "Create a scheduled or event-triggered automation." : `ID: ${id}`}
          </p>
        </div>
        {!isNew && (
          <Button
            variant="outline"
            onClick={() => runNow.mutate(id!)}
            disabled={runNow.isPending}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Run now
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="bg-secondary border border-white/[0.03]">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="inputs">Inputs & permissions</TabsTrigger>
            <TabsTrigger value="constraints">Constraints & safety</TabsTrigger>
            <TabsTrigger value="outputs">Outputs</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card className="border-white/[0.03] bg-card">
              <CardHeader>
                <CardTitle className="text-base">Name & schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    className="bg-input border-white/[0.03]"
                    placeholder="e.g. PR triage"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <ScheduleBuilderPanel
                  value={schedule}
                  onChange={setSchedule}
                  showPresets={true}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="triggerType">Trigger type</Label>
                    <select
                      id="triggerType"
                      {...register("triggerType")}
                      className="flex h-9 w-full rounded-md border border-white/[0.03] bg-input px-3 text-sm"
                    >
                      <option value="time">Time</option>
                      <option value="event">Event</option>
                      <option value="conditional">Conditional</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetType">Target type</Label>
                    <select
                      id="targetType"
                      {...register("targetType")}
                      className="flex h-9 w-full rounded-md border border-white/[0.03] bg-input px-3 text-sm"
                    >
                      <option value="agent">Agent</option>
                      <option value="workflow">Workflow</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetId">Target ID</Label>
                  <Input
                    id="targetId"
                    {...register("targetId")}
                    className="bg-input border-white/[0.03] font-mono"
                    placeholder="e.g. tpl-dev-triage"
                  />
                  {errors.targetId && (
                    <p className="text-xs text-destructive">{errors.targetId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module">Module</Label>
                  <Input
                    id="module"
                    {...register("module")}
                    className="bg-input border-white/[0.03]"
                    placeholder="e.g. Developer"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inputs" className="space-y-4">
            <Card className="border-white/[0.03] bg-card">
              <CardHeader>
                <CardTitle className="text-base">Input payload & permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inputPayloadTemplate">Input payload (JSON)</Label>
                  <textarea
                    id="inputPayloadTemplate"
                    {...register("inputPayloadTemplate")}
                    rows={4}
                    className="flex w-full rounded-md border border-white/[0.03] bg-input px-3 py-2 font-mono text-sm"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="permissionsLevel">Permissions level</Label>
                    <select
                      id="permissionsLevel"
                      {...register("permissionsLevel")}
                      className="flex h-9 w-full rounded-md border border-white/[0.03] bg-input px-3 text-sm"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="automationLevel">Automation level</Label>
                    <select
                      id="automationLevel"
                      {...register("automationLevel")}
                      className="flex h-9 w-full rounded-md border border-white/[0.03] bg-input px-3 text-sm"
                    >
                      <option value="suggest-only">Suggest only</option>
                      <option value="approval-required">Approval required</option>
                      <option value="auto-execute">Auto execute</option>
                      <option value="bounded-autopilot">Bounded autopilot</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="constraints" className="space-y-4">
            <Card className="border-white/[0.03] bg-card">
              <CardHeader>
                <CardTitle className="text-base">Constraints & safety</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Optional limits and confirmations.
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure in a future update: max actions, spend limit, allowed tools, safety rails.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outputs" className="space-y-4">
            <Card className="border-white/[0.03] bg-card">
              <CardHeader>
                <CardTitle className="text-base">Outputs</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Artifacts, logs, and trace.
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Outputs configuration can be extended here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-2">
          <Link to={isNew ? "/dashboard/cronjobs" : `/dashboard/cronjobs/${id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 gap-2"
            disabled={isSubmitting || create.isPending || update.isPending}
          >
            <Save className="h-4 w-4" />
            {isNew ? "Create" : "Save"}
          </Button>
        </div>
      </form>
    </AnimatedPage>
  );
}
