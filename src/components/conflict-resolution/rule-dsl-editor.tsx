/**
 * RuleDSLEditor — DSL editor with validation and live preview.
 * Syntax highlighting via CSS classes; validation feedback.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RuleDraft } from "@/types/conflicts";

export interface RuleDSLEditorProps {
  rule: RuleDraft;
  onChange: (rule: RuleDraft) => void;
  validationError?: string | null;
  onValidate?: (condition: string) => string | null;
  className?: string;
}

const EXAMPLE_CONDITIONS = [
  "agent.priority > other.priority",
  "timestamp < other.timestamp",
  "memory.scope === 'run'",
];

export function RuleDSLEditor({
  rule,
  onChange,
  validationError,
  onValidate,
  className,
}: RuleDSLEditorProps) {
  const [localCondition, setLocalCondition] = useState(rule.condition);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleConditionChange = useCallback(
    (value: string) => {
      setLocalCondition(value);
      const next = { ...rule, condition: value };
      onChange(next);
      if (onValidate) {
        const err = onValidate(value);
        setLocalError(err ?? null);
      }
    },
    [rule, onChange, onValidate]
  );

  const error = validationError ?? localError;
  const isValid = !error;

  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-card transition-all duration-200",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Rule DSL</CardTitle>
          {isValid ? (
            <Badge variant="secondary" className="gap-1 text-xs">
              <CheckCircle2 className="h-3 w-3" />
              Valid
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1 text-xs">
              <AlertCircle className="h-3 w-3" />
              Invalid
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Define conditions with priority order. Supports agent.priority, memory, timestamp.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="rule-name">Rule name</Label>
          <Input
            id="rule-name"
            value={rule.name}
            onChange={(e) => onChange({ ...rule, name: e.target.value })}
            placeholder="e.g. Higher priority wins"
            className="bg-background"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rule-priority">Priority (higher = evaluated first)</Label>
          <Input
            id="rule-priority"
            type="number"
            value={rule.priority}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!Number.isNaN(n)) onChange({ ...rule, priority: n });
            }}
            className="bg-background"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rule-condition">Condition (DSL)</Label>
          <Textarea
            id="rule-condition"
            value={localCondition}
            onChange={(e) => handleConditionChange(e.target.value)}
            placeholder="agent.priority > other.priority"
            className={cn(
              "min-h-[100px] font-mono text-sm bg-background",
              error && "border-destructive/50"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? "rule-condition-error" : undefined}
          />
          {error && (
            <p
              id="rule-condition-error"
              className="flex items-center gap-2 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Example conditions</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_CONDITIONS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => handleConditionChange(ex)}
                className="rounded-md border border-white/[0.06] bg-secondary/50 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-120"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
