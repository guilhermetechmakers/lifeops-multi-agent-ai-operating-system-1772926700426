/**
 * Conditional approval editor: time windows, spend limits, required tools, safety rails,
 * and required confirmations that must be checked before submit.
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const DEFAULT_REQUIRED_CONFIRMATIONS = [
  "I have reviewed the proposed changes",
  "The conditions satisfy policy requirements",
];

export interface ConditionalEditorProps {
  currentItemId: string;
  onSubmitConditions: (conditions: Record<string, unknown>) => void;
  onCancel: () => void;
  /** Required confirmations to check before submit. Defaults to standard set. */
  requiredConfirmations?: string[];
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
  requiredConfirmations = DEFAULT_REQUIRED_CONFIRMATIONS,
  isLoading = false,
  className,
}: ConditionalEditorProps) {
  const [values, setValues] = useState(DEFAULT_FIELDS);
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({});

  const confirmations = requiredConfirmations ?? [];
  const allConfirmed =
    confirmations.length === 0 ||
    confirmations.every((_, i) => confirmed[i] === true);

  const handleConfirmChange = (index: number, checked: boolean) => {
    setConfirmed((prev) => ({ ...prev, [index]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allConfirmed) return;
    const conditions: Record<string, unknown> = {};
    if (values.spendLimit) conditions.spendLimit = values.spendLimit;
    if (values.timeWindowStart) conditions.timeWindowStart = values.timeWindowStart;
    if (values.timeWindowEnd) conditions.timeWindowEnd = values.timeWindowEnd;
    if (values.requiredTools)
      conditions.requiredTools = values.requiredTools.split(",").map((s) => s.trim()).filter(Boolean);
    if (values.safetyRails) conditions.safetyRails = values.safetyRails;
    conditions.requiredConfirmations = confirmations;
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
      {confirmations.length > 0 && (
        <div className="space-y-3 rounded-lg border border-white/[0.06] bg-background/50 p-4">
          <p className="text-sm font-medium text-foreground">Required confirmations</p>
          <div className="space-y-2">
            {confirmations.map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-2"
              >
                <Checkbox
                  id={`confirm-${i}`}
                  checked={confirmed[i] === true}
                  onCheckedChange={(c) => handleConfirmChange(i, c === true)}
                  aria-label={text}
                />
                <Label
                  htmlFor={`confirm-${i}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {text}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={isLoading || !allConfirmed}>
          {isLoading ? "Submitting…" : !allConfirmed ? "Complete required confirmations" : "Submit with conditions"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
