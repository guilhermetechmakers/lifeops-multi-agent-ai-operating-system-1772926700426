/**
 * RetryPolicyEditor: Backoff, max retries, dead-letter queue.
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import type { CronjobRetryPolicy } from "@/types/cronjob";

export interface RetryPolicyEditorProps {
  value?: Partial<CronjobRetryPolicy> | null;
  onChange: (v: Partial<CronjobRetryPolicy>) => void;
  className?: string;
  disabled?: boolean;
}

export function RetryPolicyEditor({
  value = {},
  onChange,
  className,
  disabled,
}: RetryPolicyEditorProps) {
  const p = value ?? {};

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <RotateCcw className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
        <Label className="text-sm font-medium">Retry policy</Label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="retry-max" className="text-xs text-muted-foreground">
            Max retries
          </Label>
          <Input
            id="retry-max"
            type="number"
            min={0}
            max={20}
            value={p.maxRetries ?? 3}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              onChange({ ...p, maxRetries: Number.isNaN(n) ? 3 : Math.max(0, Math.min(20, n)) });
            }}
            disabled={disabled}
            className="bg-input border-white/[0.03]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retry-backoff-base" className="text-xs text-muted-foreground">
            Backoff base (ms)
          </Label>
          <Input
            id="retry-backoff-base"
            type="number"
            min={100}
            value={p.backoffBaseMs ?? p.backoffMs ?? 1000}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              onChange({
                ...p,
                backoffBaseMs: Number.isNaN(n) ? 1000 : Math.max(100, n),
                backoffMs: Number.isNaN(n) ? 1000 : Math.max(100, n),
              });
            }}
            disabled={disabled}
            className="bg-input border-white/[0.03]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retry-multiplier" className="text-xs text-muted-foreground">
            Backoff multiplier
          </Label>
          <Input
            id="retry-multiplier"
            type="number"
            min={1}
            step={0.5}
            value={p.backoffMultiplier ?? 2}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              onChange({
                ...p,
                backoffMultiplier: Number.isNaN(n) ? 2 : Math.max(1, n),
              });
            }}
            disabled={disabled}
            className="bg-input border-white/[0.03]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retry-max-backoff" className="text-xs text-muted-foreground">
            Max backoff (ms)
          </Label>
          <Input
            id="retry-max-backoff"
            type="number"
            min={1000}
            value={p.maxBackoffMs ?? 60000}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              onChange({
                ...p,
                maxBackoffMs: Number.isNaN(n) ? 60000 : Math.max(1000, n),
              });
            }}
            disabled={disabled}
            className="bg-input border-white/[0.03]"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.03] bg-secondary/20 p-4">
        <div>
          <Label className="text-sm font-medium">Dead letter queue</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Send failed runs to a queue for later inspection
          </p>
        </div>
        <Switch
          checked={Boolean(p.deadLetterQueue)}
          onCheckedChange={(checked) => onChange({ ...p, deadLetterQueue: checked })}
          disabled={disabled}
          aria-label="Enable dead letter queue"
        />
      </div>
      {p.deadLetterQueue && (
        <div className="space-y-2">
          <Label htmlFor="retry-dlq-target" className="text-xs text-muted-foreground">
            Dead letter target (queue or URL)
          </Label>
          <Input
            id="retry-dlq-target"
            value={p.deadLetterTarget ?? ""}
            onChange={(e) => onChange({ ...p, deadLetterTarget: e.target.value || undefined })}
            placeholder="e.g. dlq://failed-runs"
            disabled={disabled}
            className="bg-input border-white/[0.03]"
          />
        </div>
      )}
    </div>
  );
}
