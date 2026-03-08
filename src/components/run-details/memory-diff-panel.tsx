/**
 * MemoryDiffPanel — per-memory diffs with redaction indicators and redact/unredact controls.
 * Shows before/after for memory changes; policy-enforced redaction toggles.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Eye, EyeOff, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemoryDiff } from "@/types/scoped-memory";

function safeStringify(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "—";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const REDACT_TOKEN = "••••••";

export interface MemoryDiffPanelProps {
  diffs: MemoryDiff[];
  runId?: string;
  onRedactToggle?: (memoryId: string, field: string, redacted: boolean) => void;
  className?: string;
}

function MemoryDiffBlock({
  diff,
  redactedFields,
  onRedactToggle,
}: {
  diff: MemoryDiff;
  redactedFields: string[];
  onRedactToggle?: (memoryId: string, field: string, redacted: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const beforeRedacted = redactedFields.includes("before");
  const afterRedacted = redactedFields.includes("after");
  const hasRedactableFields =
    (diff.before !== undefined && diff.before !== null) ||
    (diff.after !== undefined && diff.after !== null);

  const beforeDisplay = beforeRedacted ? REDACT_TOKEN : safeStringify(diff.before);
  const afterDisplay = afterRedacted ? REDACT_TOKEN : safeStringify(diff.after);

  return (
    <div className="rounded-md border border-white/[0.06] bg-secondary/20 transition-colors hover:bg-secondary/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div className="flex min-w-0 items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate font-mono text-sm text-foreground">
            {diff.key}
          </span>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
            {diff.scopeType}:{diff.scopeId.slice(0, 12)}
          </span>
          {diff.changedFields && diff.changedFields.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({diff.changedFields.join(", ")})
            </span>
          )}
        </div>
      </button>
      {open && (
        <div className="border-t border-white/[0.06] p-3 space-y-3">
          {hasRedactableFields && onRedactToggle && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Redaction:</span>
              <button
                type="button"
                onClick={() =>
                  onRedactToggle(diff.memoryId, "before", !beforeRedacted)
                }
                className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-secondary transition-colors"
                aria-label={beforeRedacted ? "Reveal before" : "Redact before"}
              >
                {beforeRedacted ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
                Before
              </button>
              <button
                type="button"
                onClick={() =>
                  onRedactToggle(diff.memoryId, "after", !afterRedacted)
                }
                className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-secondary transition-colors"
                aria-label={afterRedacted ? "Reveal after" : "Redact after"}
              >
                {afterRedacted ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
                After
              </button>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Before
              </span>
              <pre className="max-h-48 overflow-auto rounded border border-white/[0.06] bg-background/80 p-2 font-mono text-xs text-foreground">
                {beforeDisplay}
              </pre>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                After
              </span>
              <pre className="max-h-48 overflow-auto rounded border border-white/[0.06] bg-background/80 p-2 font-mono text-xs text-foreground">
                {afterDisplay}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MemoryDiffPanel({
  diffs,
  runId,
  onRedactToggle,
  className,
}: MemoryDiffPanelProps) {
  const [redactedFields, setRedactedFields] = useState<Record<string, string[]>>(
    () => {
      const init: Record<string, string[]> = {};
      (diffs ?? []).forEach((d) => {
        if (Array.isArray(d.redactedFields) && d.redactedFields.length > 0) {
          init[d.memoryId] = [...d.redactedFields];
        }
      });
      return init;
    }
  );

  const handleRedactToggle = useCallback(
    (memoryId: string, field: string, redacted: boolean) => {
      setRedactedFields((prev) => {
        const current = prev[memoryId] ?? [];
        const next = redacted
          ? [...current, field]
          : current.filter((f) => f !== field);
        return { ...prev, [memoryId]: next };
      });
      onRedactToggle?.(memoryId, field, redacted);
    },
    [onRedactToggle]
  );

  const handleExport = useCallback(() => {
    const payload = {
      runId,
      diffs: (diffs ?? []).map((d) => ({
        ...d,
        before: (redactedFields[d.memoryId] ?? []).includes("before")
          ? REDACT_TOKEN
          : d.before,
        after: (redactedFields[d.memoryId] ?? []).includes("after")
          ? REDACT_TOKEN
          : d.after,
      })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `run-${runId ?? "memory"}-diffs.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [diffs, runId, redactedFields]);

  const list = Array.isArray(diffs) ? diffs : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Memory Diffs</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Per-memory changes with redaction controls
            </p>
          </div>
          {list.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
              aria-label="Export memory diffs"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {list.length === 0 ? (
          <p className="rounded-md border border-white/[0.06] bg-secondary/20 p-4 text-sm text-muted-foreground">
            No memory diffs for this run. Memory changes during agent execution
            will appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {list.map((diff, i) => (
              <li key={diff.memoryId + String(i)}>
                <MemoryDiffBlock
                  diff={diff}
                  redactedFields={redactedFields[diff.memoryId] ?? diff.redactedFields ?? []}
                  onRedactToggle={handleRedactToggle}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
