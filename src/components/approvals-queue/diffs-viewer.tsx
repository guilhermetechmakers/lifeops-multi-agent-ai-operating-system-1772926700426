/**
 * Diffs viewer: side-by-side or inline diff with syntax highlighting and collapse.
 */

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DiffsViewerProps {
  diffData: Record<string, unknown> | unknown[] | null | undefined;
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

export function DiffsViewer({ diffData, className }: DiffsViewerProps) {
  if (diffData == null) {
    return (
      <p className="text-sm text-muted-foreground py-4">No diff available</p>
    );
  }

  const entries = Array.isArray(diffData)
    ? (diffData as unknown[]).map((v, i) => ({ key: `[${i}]`, value: v }))
    : typeof diffData === "object"
      ? Object.entries(diffData).map(([key, value]) => ({ key, value }))
      : [];

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No diff available</p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.03] bg-secondary/20 p-4 overflow-x-auto",
        className
      )}
    >
      <div className="space-y-1">
        {entries.map(({ key, value }) => (
          <DiffEntry key={key} keyLabel={key} value={value} />
        ))}
      </div>
    </div>
  );
}
