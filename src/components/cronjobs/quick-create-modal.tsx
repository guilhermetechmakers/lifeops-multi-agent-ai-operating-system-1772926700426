/**
 * QuickCreateModal: lightweight form to create a new cronjob.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScheduleBuilderPanel, type ScheduleBuilderValue } from "@/components/cronjobs/schedule-builder-panel";
import { useCreateCronjob } from "@/hooks/use-cronjobs";
import { MODULES } from "@/api/cronjobs-mock";
import { cn } from "@/lib/utils";

export interface QuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCreateModal({ open, onOpenChange }: QuickCreateModalProps) {
  const navigate = useNavigate();
  const createCronjob = useCreateCronjob();
  const [name, setName] = useState("");
  const [targetId, setTargetId] = useState("");
  const [module, setModule] = useState("Developer");
  const [schedule, setSchedule] = useState<ScheduleBuilderValue>({
    expression: "0 9 * * 1-5",
    timezone: "UTC",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name?.trim()) e.name = "Name is required";
    if (!targetId?.trim()) e.targetId = "Target is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const result = await createCronjob.mutateAsync({
        name: name.trim(),
        targetId: targetId.trim(),
        targetType: "agent",
        module,
        scheduleExpression: schedule.expression,
        timezone: schedule.timezone,
        enabled: true,
        triggerType: "time",
        inputPayloadTemplate: "{}",
        permissionsLevel: "editor",
        automationLevel: "approval-required",
        safetyRails: [],
        retryPolicy: { maxRetries: 3, backoffMs: 1000 },
        outputsConfig: {},
        ownerId: "system",
        tags: [],
      });
      onOpenChange(false);
      reset();
      if (result?.id) navigate(`/dashboard/cronjobs/${result.id}`);
    } catch {
      // Error handled by mutation
    }
  };

  const reset = () => {
    setName("");
    setTargetId("");
    setModule("Developer");
    setSchedule({ expression: "0 9 * * 1-5", timezone: "UTC" });
    setErrors({});
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg border-white/[0.03] bg-card">
        <DialogHeader>
          <DialogTitle>Quick Create Cronjob</DialogTitle>
          <DialogDescription>
            Create a new cronjob with essential fields. You can configure more options in the editor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="qc-name">Name</Label>
            <Input
              id="qc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PR triage"
              className={cn("bg-input border-white/[0.03]", errors.name && "border-destructive")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qc-target">Target (agent or workflow ID)</Label>
            <Input
              id="qc-target"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="e.g. tpl-dev-triage"
              className={cn("bg-input border-white/[0.03]", errors.targetId && "border-destructive")}
              aria-invalid={!!errors.targetId}
            />
            {errors.targetId && (
              <p className="text-xs text-destructive">{errors.targetId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qc-module">Module</Label>
            <select
              id="qc-module"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {(MODULES ?? []).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <ScheduleBuilderPanel
            value={schedule}
            onChange={setSchedule}
            showPresets={true}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={createCronjob.isPending}
          >
            {createCronjob.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
