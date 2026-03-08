/**
 * PayloadTemplateEditor: Input payload template with variables palette and scope.
 * Live validation against JSON schema placeholder.
 */

import { useMemo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FileJson, AlertCircle, CheckCircle2 } from "lucide-react";

const TEMPLATE_VARS = ["{{date}}", "{{time}}", "{{user}}", "{{context}}", "{{env}}"];

export interface PayloadTemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  scope?: string[];
  onScopeChange?: (scope: string[]) => void;
  className?: string;
  disabled?: boolean;
}

function tryParseJson(str: string): { valid: boolean; error?: string } {
  if (!str?.trim()) return { valid: true };
  try {
    JSON.parse(str);
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }
}

export function PayloadTemplateEditor({
  value,
  onChange,
  scope = [],
  onScopeChange,
  className,
  disabled,
}: PayloadTemplateEditorProps) {
  const validation = useMemo(() => tryParseJson(value ?? ""), [value]);
  const safeScope = Array.isArray(scope) ? scope : [];

  const insertVar = useCallback(
    (v: string) => {
      onChange((value ?? "") + v);
    },
    [value, onChange]
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <FileJson className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
        <Label className="text-sm font-medium">Input payload template (JSON)</Label>
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {(TEMPLATE_VARS ?? []).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVar(v)}
              disabled={disabled}
              className="rounded-md border border-white/[0.03] bg-secondary/80 px-2 py-1 text-xs font-mono text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
              aria-label={`Insert ${v}`}
            >
              {v}
            </button>
          ))}
        </div>
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={6}
          placeholder='{"task": "{{context}}", "at": "{{date}}"}'
          className={cn(
            "flex w-full rounded-md border bg-input px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-white/[0.03]",
            !validation.valid && "border-destructive/50"
          )}
          aria-invalid={!validation.valid}
          aria-describedby="payload-validation"
        />
        <div id="payload-validation" className="flex items-center gap-2 text-xs">
          {validation.valid ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-teal shrink-0" aria-hidden />
              <span className="text-muted-foreground">Valid JSON</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" aria-hidden />
              <span className="text-destructive">{validation.error ?? "Invalid"}</span>
            </>
          )}
        </div>
      </div>
      {onScopeChange && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Scope (variables in use)</Label>
          <p className="text-xs text-muted-foreground">
            {(safeScope ?? []).length > 0 ? safeScope.join(", ") : "None selected"}
          </p>
        </div>
      )}
    </div>
  );
}
