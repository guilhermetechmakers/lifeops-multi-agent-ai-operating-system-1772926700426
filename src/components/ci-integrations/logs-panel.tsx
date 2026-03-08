/**
 * LogsPanel — overlay/side panel to browse logs filtered by integration, level, time range.
 */

import { useState, useCallback } from "react";
import { X, Search, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { LogEntry, LogLevel } from "@/types/integrations";

export interface LogsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationName?: string;
  logs: LogEntry[];
  isLoading?: boolean;
  runId?: string;
  onFilterChange?: (params: { level?: LogLevel; search?: string }) => void;
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  info: "text-foreground",
  warn: "text-amber",
  error: "text-destructive",
  debug: "text-muted-foreground",
};

export function LogsPanel({
  open,
  onOpenChange,
  integrationName = "Integration",
  logs = [],
  isLoading = false,
  runId,
  onFilterChange,
}: LogsPanelProps) {
  const [level, setLevel] = useState<LogLevel | "all">("all");
  const [search, setSearch] = useState("");

  const handleLevelChange = useCallback(
    (v: string) => {
      const val = v as LogLevel | "all";
      setLevel(val);
      onFilterChange?.({ level: val === "all" ? undefined : val, search: search || undefined });
    },
    [onFilterChange, search]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setSearch(v);
      onFilterChange?.({ level: level === "all" ? undefined : level, search: v || undefined });
    },
    [onFilterChange, level]
  );

  const filteredLogs = (logs ?? []).filter((log) => {
    if (level !== "all" && log.level !== level) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] flex flex-col border-white/[0.03] bg-card"
        showClose={true}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            Logs — {integrationName}
            {runId && (
              <span className="text-xs font-normal text-muted-foreground">Run: {runId}</span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs…"
              value={search}
              onChange={handleSearchChange}
              className="pl-9 border-white/[0.03]"
              aria-label="Search logs"
            />
          </div>
          <Select value={level} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-[120px] border-white/[0.03]" aria-label="Filter by level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="flex-1 min-h-[200px] rounded-md border border-white/[0.03] bg-secondary/20 p-2 font-mono text-xs">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading logs…</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No logs</div>
          ) : (
            <div className="space-y-1">
              {(filteredLogs as LogEntry[]).map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "flex gap-2 py-1 px-2 rounded hover:bg-white/[0.03]",
                    LEVEL_COLORS[log.level]
                  )}
                >
                  <span className="shrink-0 text-muted-foreground w-12">{log.level}</span>
                  <span className="shrink-0 text-muted-foreground w-20">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                  </span>
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
