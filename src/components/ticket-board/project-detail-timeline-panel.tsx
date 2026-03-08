/**
 * ProjectDetailTimelinePanel — agent-run history, rule executions, PR summaries, artifacts.
 */

import { useState } from "react";
import { Clock, Zap, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTicketBoardRuns } from "@/hooks/use-ticket-board";

export interface ProjectDetailTimelinePanelProps {
  projectId: string;
  limit?: number;
  className?: string;
}

export function ProjectDetailTimelinePanel({
  projectId: _projectId,
  limit = 20,
  className,
}: ProjectDetailTimelinePanelProps) {
  const { items: runs, isLoading } = useTicketBoardRuns(limit);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const runList = runs ?? [];

  const formatTime = (iso: string | undefined) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Run History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {runList.length === 0 ? (
          <div className="py-6 text-center">
            <Zap className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No runs yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rule executions will appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[220px]">
            <div className="space-y-1 pr-2">
              {(runList ?? []).map((run) => (
                <div key={run.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expandedId === run.id ? null : run.id)
                    }
                    className={cn(
                      "w-full flex items-center gap-2 rounded-lg border border-white/[0.03] p-2.5",
                      "text-left hover:bg-secondary/30 transition-colors"
                    )}
                  >
                    {expandedId === run.id ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <Zap className="h-3.5 w-3.5 text-amber shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate flex-1">
                      {run.ruleOrAgentId}
                    </span>
                    <Badge
                      variant={
                        run.status === "succeeded" ? "default" : "secondary"
                      }
                      className={cn(
                        "text-[10px] shrink-0",
                        run.status === "succeeded" && "bg-teal/20 text-teal",
                        run.status === "failed" &&
                          "bg-destructive/20 text-destructive"
                      )}
                    >
                      {run.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatTime(run.startedAt)}
                    </span>
                  </button>
                  {expandedId === run.id && (
                    <div className="pl-8 pr-2 pb-2">
                      <div className="rounded border border-white/[0.03] bg-secondary/20 p-2 text-xs font-mono text-muted-foreground space-y-1 animate-fade-in">
                        {(run.logs ?? []).map((log, i) => (
                          <div key={i}>{log}</div>
                        ))}
                        {(run.logs ?? []).length === 0 && (
                          <span>No logs</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
