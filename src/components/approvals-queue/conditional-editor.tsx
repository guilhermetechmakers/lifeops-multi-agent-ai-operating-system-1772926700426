/**
 * Conditional approval editor: time windows, spend limits, required tools, safety rails.
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConditionalEditorProps {
  currentItemId: string;
  onSubmitConditions: (conditions: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_FIELDS = {
  spendLimit: "",
  timeWindowStart: "",
  timeWindowEnd: "",
  requiredTools: "",
  safetyRails: "",
};

export function ConditionalEditor({
  onSubmitConditions,
  onCancel,
  isLoading = false,
  className,
}: ConditionalEditorProps) {
  const [values, setValues] = useState(DEFAULT_FIELDS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const conditions: Record<string, unknown> = {};
    if (values.spendLimit) conditions.spendLimit = values.spendLimit;
    if (values.timeWindowStart) conditions.timeWindowStart = values.timeWindowStart;
    if (values.timeWindowEnd) conditions.timeWindowEnd = values.timeWindowEnd;
    if (values.requiredTools)
      conditions.requiredTools = values.requiredTools.split(",").map((s) => s.trim()).filter(Boolean);
    if (values.safetyRails) conditions.safetyRails = values.safetyRails;
    onSubmitConditions(conditions);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-lg border border-white/[0.03] bg-secondary/20 p-4 space-y-4",
        className
      )}
      aria-labelledby="conditional-editor-title"
    >
      <h3 id="conditional-editor-title" className="text-sm font-semibold text-foreground">
        Approve with conditions
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="spend-limit">Spend limit (optional)</Label>
          <Input
            id="spend-limit"
            value={values.spendLimit}
            onChange={(e) => setValues((v) => ({ ...v, spendLimit: e.target.value }))}
            placeholder="e.g. 1000"
            className="bg-input border-white/[0.03]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time-start">Time window start (optional)</Label>
          <Input
            id="time-start"
            type="time"
            value={values.timeWindowStart}
            onChange={(e) => setValues((v) => ({ ...v, timeWindowStart: e.target.value }))}
            className="bg-input border-white/[0.03]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time-end">Time window end (optional)</Label>
          <Input
            id="time-end"
            type="time"
            value={values.timeWindowEnd}
            onChange={(e) => setValues((v) => ({ ...v, timeWindowEnd: e.target.value }))}
            className="bg-input border-white/[0.03]"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="required-tools">Required tools (comma-separated, optional)</Label>
        <Input
          id="required-tools"
          value={values.requiredTools}
          onChange={(e) => setValues((v) => ({ ...v, requiredTools: e.target.value }))}
          placeholder="tool1, tool2"
          className="bg-input border-white/[0.03]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="safety-rails">Safety rails / notes (optional)</Label>
        <Input
          id="safety-rails"
          value={values.safetyRails}
          onChange={(e) => setValues((v) => ({ ...v, safetyRails: e.target.value }))}
          placeholder="e.g. require 2FA for payouts"
          className="bg-input border-white/[0.03]"
        />
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting…" : "Submit with conditions"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
