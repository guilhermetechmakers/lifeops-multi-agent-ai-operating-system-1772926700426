/**
 * LogsEventsPanel — structured logs with level filter, source, time; expandable rows for details.
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LogEvent } from "@/types/run-details";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

const LEVEL_COLOR: Record<LogEvent["level"], string> = {
  debug: "text-muted-foreground",
  info: "text-foreground",
  warn: "text-amber",
  error: "text-destructive",
};

function LogRow({ log, isExpanded, onToggle }: { log: LogEvent; isExpanded: boolean; onToggle: () => void }) {
  const hasMeta = log.metadata != null && Object.keys(log.metadata).length > 0;

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-start gap-2 border-b border-white/[0.03] py-2 text-left transition-colors hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          hasMeta && "cursor-pointer"
        )}
        disabled={!hasMeta}
        aria-expanded={hasMeta ? isExpanded : undefined}
      >
        {hasMeta ? (
          isExpanded ? (
            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">
          {formatTime(log.timestamp)}
        </span>
        <span className={cn("w-14 shrink-0 text-xs font-medium", LEVEL_COLOR[log.level])}>
          {log.level}
        </span>
        <span className="w-24 shrink-0 truncate text-xs text-muted-foreground">
          {log.source}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
          {log.message}
        </span>
      </button>
      {isExpanded && hasMeta && (
        <div className="bg-secondary/20 px-4 pb-2 pt-0">
          <pre className="rounded border border-white/[0.06] p-2 font-mono text-xs text-foreground">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}

export interface LogsEventsPanelProps {
  logs: LogEvent[];
  className?: string;
}

export function LogsEventsPanel({ logs, className }: LogsEventsPanelProps) {
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const list = useMemo(() => {
    const arr = Array.isArray(logs) ? logs : [];
    return arr.filter((l) => {
      if (levelFilter && (l.level ?? "") !== levelFilter) return false;
      if (sourceFilter && (l.source ?? "") !== sourceFilter) return false;
      return true;
    });
  }, [logs, levelFilter, sourceFilter]);

  const levels = useMemo(() => {
    const arr = Array.isArray(logs) ? logs : [];
    return [...new Set(arr.map((l) => l.level).filter(Boolean))].sort();
  }, [logs]);
  const sources = useMemo(() => {
    const arr = Array.isArray(logs) ? logs : [];
    return [...new Set(arr.map((l) => l.source).filter(Boolean))].sort();
  }, [logs]);

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 md:p-5">
        <CardTitle className="text-base">Logs & Events</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by level"
          >
            <option value="">All levels</option>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by source"
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto pt-0">
        {(list ?? []).length === 0 ? (
          <p className="rounded-md border border-white/[0.06] bg-secondary/20 p-4 text-sm text-muted-foreground">
            No log events. Run events and timestamps will appear here.
          </p>
        ) : (
          <div className="min-w-[500px]">
            <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] gap-2 border-b border-white/[0.06] px-2 pb-2 text-xs font-medium text-muted-foreground">
              <span />
              <span>Time</span>
              <span>Level</span>
              <span>Source</span>
              <span>Message</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {(list ?? []).map((log, i) => (
                <div key={`${log.timestamp}-${i}`}>
                  <LogRow
                    log={log}
                    isExpanded={expandedIndex === i}
                    onToggle={() => setExpandedIndex((idx) => (idx === i ? null : i))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
