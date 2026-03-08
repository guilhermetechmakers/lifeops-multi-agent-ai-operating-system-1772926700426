/**
 * LogsEventsPanel — structured logs with level filter, source, search; expandable rows for details.
 */

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Search, Download } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const list = useMemo(() => {
    const arr = Array.isArray(logs) ? logs : [];
    const q = (searchQuery ?? "").trim().toLowerCase();
    return arr.filter((l) => {
      if (levelFilter && (l.level ?? "") !== levelFilter) return false;
      if (sourceFilter && (l.source ?? "") !== sourceFilter) return false;
      if (q && !(l.message ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [logs, levelFilter, sourceFilter, searchQuery]);

  const handleExportLogs = useCallback(() => {
    const lines = (list ?? []).map(
      (l) => `[${l.timestamp}] ${l.level} ${l.source ?? ""} ${l.message}`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "run-logs.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [list]);

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
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 bg-background"
              aria-label="Search logs"
            />
          </div>
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
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1"
            onClick={handleExportLogs}
            disabled={(list ?? []).length === 0}
            aria-label="Export logs"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
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
