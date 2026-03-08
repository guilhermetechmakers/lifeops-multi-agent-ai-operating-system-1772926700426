/**
 * Run Details DiffsViewer — before/after resource diffs; author, reason, revert risk.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiffChunk } from "@/types/run-details";

function RiskBadge({ level }: { level?: DiffChunk["revertRiskLevel"] }) {
  if (!level) return null;
  const style =
    level === "high"
      ? "bg-destructive/20 text-destructive"
      : level === "medium"
        ? "bg-amber/20 text-amber"
        : "bg-teal/20 text-teal";
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", style)}>
      {level} risk
    </span>
  );
}

function DiffBlock({ chunk, defaultOpen }: { chunk: DiffChunk; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const beforeStr =
    chunk.before === undefined || chunk.before === null
      ? "—"
      : JSON.stringify(chunk.before, null, 2);
  const afterStr =
    chunk.after === undefined || chunk.after === null
      ? "—"
      : JSON.stringify(chunk.after, null, 2);

  return (
    <div className="rounded-md border border-white/[0.06] bg-secondary/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 p-3 text-left transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div className="flex min-w-0 items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate font-mono text-sm text-foreground">
            {chunk.resourceId}
          </span>
          {chunk.changedFields && chunk.changedFields.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({chunk.changedFields.join(", ")})
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {chunk.author != null && (
            <span className="text-xs text-muted-foreground">{chunk.author}</span>
          )}
          <RiskBadge level={chunk.revertRiskLevel} />
        </div>
      </button>
      {open && (
        <div className="border-t border-white/[0.06] p-3">
          {chunk.reason != null && (
            <p className="mb-2 text-xs text-muted-foreground">{chunk.reason}</p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Before</span>
              <pre className="max-h-48 overflow-auto rounded border border-white/[0.06] bg-background/80 p-2 font-mono text-xs text-foreground">
                {beforeStr}
              </pre>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">After</span>
              <pre className="max-h-48 overflow-auto rounded border border-white/[0.06] bg-background/80 p-2 font-mono text-xs text-foreground">
                {afterStr}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface RunDetailsDiffsViewerProps {
  diffs: DiffChunk[];
  className?: string;
}

export function RunDetailsDiffsViewer({ diffs, className }: RunDetailsDiffsViewerProps) {
  const list = Array.isArray(diffs) ? diffs : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 md:p-5">
        <CardTitle className="text-base">Diffs</CardTitle>
        <p className="text-sm text-muted-foreground">
          Resource changes from this run; who approved and why.
        </p>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {list.length === 0 ? (
          <p className="rounded-md border border-white/[0.06] bg-secondary/20 p-4 text-sm text-muted-foreground">
            No diffs recorded. Changes to resources during this run will appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {list.map((chunk, i) => (
              <li key={chunk.resourceId + String(i)}>
                <DiffBlock chunk={chunk} defaultOpen={i === 0} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
