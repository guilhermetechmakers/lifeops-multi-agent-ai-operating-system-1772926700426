/**
 * Diffs viewer: side-by-side or unified (inline) diff with syntax highlighting.
 * Safe rendering for null payloads; supports JSON proposed vs current comparison.
 */

import { useState } from "react";
import { ChevronDown, ChevronRight, Columns3, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DiffViewMode = "side-by-side" | "unified";

export interface DiffsViewerProps {
  diffData: Record<string, unknown> | unknown[] | null | undefined;
  /** Optional current payload for side-by-side comparison. */
  currentPayload?: Record<string, unknown> | null;
  /** Optional proposed payload for side-by-side comparison. */
  proposedPayload?: Record<string, unknown> | null;
  className?: string;
}

function DiffEntry({
  keyLabel,
  value,
  depth = 0,
}: {
  keyLabel: string;
  value: unknown;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isObject =
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value as Record<string, unknown>).length > 0;
  const isArray = Array.isArray(value) && value.length > 0;

  if (isObject) {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div className="rounded border border-white/[0.06] overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-1 px-2 py-1.5 text-left text-sm bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-muted-foreground font-mono">{keyLabel}</span>
        </button>
        {open && (
          <div className="pl-4 border-l-2 border-white/[0.06] ml-2 my-1 space-y-0.5">
            {entries.map(([k, v]) => (
              <DiffEntry key={k} keyLabel={k} value={v} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isArray) {
    return (
      <div className="rounded border border-white/[0.06] overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-1 px-2 py-1.5 text-left text-sm bg-secondary/30 hover:bg-secondary/50"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-muted-foreground font-mono">{keyLabel}</span>
          <span className="text-xs text-muted-foreground">[{value.length}]</span>
        </button>
        {open && (
          <div className="pl-4 border-l-2 border-white/[0.06] ml-2 my-1 space-y-0.5">
            {(value as unknown[]).map((v, i) => (
              <DiffEntry key={i} keyLabel={`[${i}]`} value={v} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const raw =
    value === null
      ? "null"
      : typeof value === "string"
        ? `"${value}"`
        : String(value);
  return (
    <div className="flex gap-2 py-0.5 font-mono text-xs">
      <span className="text-muted-foreground shrink-0">{keyLabel}:</span>
      <span className="text-foreground break-all">{raw}</span>
    </div>
  );
}

function JsonBlock({
  data,
  label,
  variant,
}: {
  data: Record<string, unknown>;
  label: string;
  variant: "current" | "proposed";
}) {
  const json = JSON.stringify(data, null, 2);
  return (
    <div className="flex flex-col min-w-0 flex-1">
      <div
        className={cn(
          "text-xs font-medium px-2 py-1.5 rounded-t border-b",
          variant === "current"
            ? "bg-destructive/10 text-destructive border-destructive/20"
            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        )}
      >
        {label}
      </div>
      <pre className="text-xs font-mono text-foreground whitespace-pre-wrap p-3 overflow-x-auto overflow-y-auto max-h-[300px] break-all">
        {json}
      </pre>
    </div>
  );
}

export function DiffsViewer({
  diffData,
  currentPayload,
  proposedPayload,
  className,
}: DiffsViewerProps) {
  const [viewMode, setViewMode] = useState<DiffViewMode>("unified");

  const hasSideBySide =
    currentPayload &&
    proposedPayload &&
    typeof currentPayload === "object" &&
    typeof proposedPayload === "object" &&
    (Object.keys(currentPayload).length > 0 || Object.keys(proposedPayload).length > 0);

  if (diffData == null && !hasSideBySide) {
    return (
      <p className="text-sm text-muted-foreground py-4">No diff available</p>
    );
  }

  if (hasSideBySide && viewMode === "side-by-side") {
    const mode = viewMode as DiffViewMode;
    return (
      <div
        className={cn(
          "rounded-lg border border-white/[0.03] bg-secondary/20 overflow-hidden",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/[0.03] bg-secondary/30">
          <span className="text-sm font-medium text-foreground">Payload comparison</span>
          <div className="flex gap-1">
            <Button
              variant={mode === "side-by-side" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("side-by-side")}
              aria-label="Side-by-side view"
            >
              <Columns3 className="h-4 w-4" />
            </Button>
            <Button
              variant={mode === "unified" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("unified")}
              aria-label="Unified view"
            >
              <Rows3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-0 border-t border-white/[0.03]">
          <JsonBlock
            data={currentPayload as Record<string, unknown>}
            label="Current"
            variant="current"
          />
          <div className="w-px bg-white/[0.06]" />
          <JsonBlock
            data={proposedPayload as Record<string, unknown>}
            label="Proposed"
            variant="proposed"
          />
        </div>
      </div>
    );
  }

  const entries = Array.isArray(diffData)
    ? (diffData as unknown[]).map((v, i) => ({ key: `[${i}]`, value: v }))
    : diffData && typeof diffData === "object"
      ? Object.entries(diffData).map(([key, value]) => ({ key, value }))
      : [];

  if (entries.length === 0 && !hasSideBySide) {
    return (
      <p className="text-sm text-muted-foreground py-4">No diff available</p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.03] bg-secondary/20 overflow-hidden",
        className
      )}
    >
      {hasSideBySide && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/[0.03] bg-secondary/30">
          <span className="text-sm font-medium text-foreground">Payload diff</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("side-by-side")}
              aria-label="Side-by-side view"
            >
              <Columns3 className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewMode("unified")}
              aria-label="Unified view"
            >
              <Rows3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <div className="p-4 overflow-x-auto">
        <div className="space-y-1">
          {entries.map(({ key, value }) => (
            <DiffEntry key={key} keyLabel={key} value={value} />
          ))}
        </div>
      </div>
    </div>
  );
}
