/**
 * CronjobDetailDrawer: per-cronjob run history, logs, and traces.
 * Opens from the right; shows RunHistoryPanel and selected run details (logs, trace link).
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, FileText, ListChecks } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RunHistoryPanel } from "@/components/cronjobs/run-history-panel";
import { useCronjob, useCronjobRun } from "@/hooks/use-cronjobs";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export interface CronjobDetailDrawerProps {
  cronjobId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CronjobDetailDrawer({
  cronjobId,
  open,
  onOpenChange,
}: CronjobDetailDrawerProps) {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const { data: job, isLoading: jobLoading } = useCronjob(cronjobId ?? undefined, open && Boolean(cronjobId));

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectedRunId(null);
    onOpenChange(next);
  };
  const { data: runDetail, isLoading: runLoading } = useCronjobRun(
    selectedRunId ?? undefined,
    open && Boolean(selectedRunId)
  );

  const logs = useMemo(() => {
    const list = runDetail?.logs;
    return Array.isArray(list) ? list : [];
  }, [runDetail?.logs]);

  const traceId = runDetail?.traceId ?? (runDetail as { traceId?: string } | undefined)?.traceId;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showClose={true}
        className={cn(
          "fixed left-auto right-0 top-0 h-full max-h-none w-full max-w-md translate-x-0 translate-y-0 rounded-l-lg rounded-r-none border-l border-white/[0.03] p-0",
          "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full"
        )}
        aria-label="Cronjob details"
      >
        <div className="flex h-full flex-col">
          <DialogHeader className="shrink-0 border-b border-white/[0.03] px-6 py-4">
            <DialogTitle className="text-left text-lg">
              {jobLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                job?.name ?? "Cronjob details"
              )}
            </DialogTitle>
            {job && (
              <p className="text-left text-xs text-muted-foreground">
                {job.scheduleExpression ?? "—"} · {job.timezone}
                {job.nextRun && ` · Next: ${formatDistanceToNow(new Date(job.nextRun), { addSuffix: true })}`}
              </p>
            )}
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-4 px-6 py-4">
              {cronjobId && (
                <RunHistoryPanel
                  cronjobId={cronjobId}
                  className="border-0 bg-transparent p-0 shadow-none"
                  onSelectRun={setSelectedRunId}
                />
              )}

              {selectedRunId && (
                <Card className="border-white/[0.03] bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ListChecks className="h-4 w-4" />
                      Run details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/dashboard/cronjobs/${cronjobId}/runs/${selectedRunId}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Full run page
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      {traceId && (
                        <span className="text-xs text-muted-foreground">
                          Trace: {traceId}
                        </span>
                      )}
                    </div>
                    {runLoading ? (
                      <Skeleton className="h-24 w-full rounded-md" />
                    ) : logs.length > 0 ? (
                      <div className="rounded-md border border-white/[0.03] bg-secondary/30 p-3">
                        <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          Logs
                        </p>
                        <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                          {logs.join("\n")}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No logs for this run.</p>
                    )}
                  </CardContent>
                </Card>
              )}

              <p className="text-xs text-muted-foreground">
                Click a run in the history above to view logs and trace. Or open the full run page from the table.
              </p>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
