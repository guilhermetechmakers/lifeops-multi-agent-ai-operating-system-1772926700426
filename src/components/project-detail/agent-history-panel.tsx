/**
 * AgentHistoryPanel — activity feed with run IDs, agents, results, log links.
 */

import { Link } from "react-router-dom";
import { Bot, ChevronRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectHistory } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { AgentRun } from "@/types/projects";
import { formatDistanceToNow } from "date-fns";

const TYPE_LABELS: Record<string, string> = {
  triage: "Triage",
  summarizePR: "PR Summary",
  generateReleaseNotes: "Release Notes",
  ciTrigger: "CI Trigger",
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  succeeded: CheckCircle,
  failed: XCircle,
  running: Loader2,
  pending: Loader2,
};

export interface AgentHistoryPanelProps {
  projectId: string;
  className?: string;
}

export function AgentHistoryPanel({ projectId, className }: AgentHistoryPanelProps) {
  const { items: runs, isLoading } = useProjectHistory(projectId);
  const list = runs ?? [];

  if (isLoading) {
    return (
      <Card className={cn("card-project-detail", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-project-detail", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4 text-purple" />
          Agent History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No agent runs yet
          </div>
        ) : (
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {list.map((run: AgentRun) => {
              const StatusIcon = STATUS_ICONS[run.status] ?? Loader2;
              return (
                <div
                  key={run.id}
                  className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusIcon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          run.status === "succeeded" && "text-teal",
                          run.status === "failed" && "text-destructive",
                          (run.status === "running" || run.status === "pending") && "text-amber animate-spin"
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {run.agentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {TYPE_LABELS[run.type] ?? run.type} • {run.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        run.status === "succeeded"
                          ? "success"
                          : run.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px] shrink-0 capitalize"
                    >
                      {run.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                    </span>
                    <div className="flex items-center gap-3">
                      {run.logsUrl && (
                        <Link to={run.logsUrl}>
                          <span className="flex items-center gap-1 text-xs text-primary hover:underline">
                            Logs
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        </Link>
                      )}
                      {run.artifactsUrl && (
                        <Link to={run.artifactsUrl}>
                          <span className="flex items-center gap-1 text-xs text-primary hover:underline">
                            Artifacts
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
