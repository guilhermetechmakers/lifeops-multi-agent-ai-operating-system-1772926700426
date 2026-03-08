/**
 * Active Cronjobs Snapshot: next run, last outcome, schedule, enable/disable, view details.
 * Per-run detail panel: runId, start/end time, outcome, artifacts, trace, logs, diffs.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, ChevronRight, FileText, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMasterCronjobs, useUpdateCronjob, useRunArtifact } from "@/hooks/use-master-dashboard";
import type { MasterCronjob } from "@/types/master-dashboard";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

function formatNextRun(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "—";
  }
}

export function ActiveCronjobsSnapshot() {
  const { items: cronjobs, isLoading } = useMasterCronjobs();
  const updateCronjob = useUpdateCronjob();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [runDetailId, setRunDetailId] = useState<string | null>(null);

  const list = useMemo(() => cronjobs ?? [], [cronjobs]);
  const { data: runArtifact, isLoading: isRunLoading } = useRunArtifact(runDetailId);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === list.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(list.map((c) => c.id)));
  };

  const handleToggleEnabled = (job: MasterCronjob) => {
    updateCronjob.mutate({
      id: job.id,
      payload: { enabled: !job.enabled },
    });
  };

  const selectedCount = selectedIds.size;

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active cronjobs snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Active cronjobs snapshot
        </CardTitle>
        {list.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label={selectedIds.size === list.length ? "Deselect all" : "Select all"}
            >
              {selectedIds.size === list.length ? "Deselect all" : "Select all"}
            </button>
            <Link to="/dashboard/cronjobs">
              <Button variant="ghost" size="sm" className="text-xs">
                View all
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">Next run & status</p>
        {list.length === 0 ? (
          <div className="rounded-md border border-white/[0.03] bg-secondary/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No active cronjobs.{" "}
            <Link to="/dashboard/cronjobs/new" className="text-primary hover:underline">
              Create one
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {(list ?? []).map((cj) => (
              <li
                key={cj.id}
                className={cn(
                  "flex items-center gap-3 rounded-md border border-white/[0.03] bg-secondary/50 px-3 py-2 transition-colors",
                  selectedIds.has(cj.id) && "ring-1 ring-primary/30"
                )}
              >
                <Checkbox
                  checked={selectedIds.has(cj.id)}
                  onCheckedChange={() => toggleSelect(cj.id)}
                  aria-label={`Select ${cj.name}`}
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{cj.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Next: {formatNextRun(cj.nextRun)} · {cj.lastRunResult}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {cj.lastRun?.runId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setRunDetailId(cj.lastRun!.runId)}
                      aria-label="View last run"
                    >
                      Run
                    </Button>
                  )}
                  <Switch
                    checked={cj.enabled}
                    onCheckedChange={() => handleToggleEnabled(cj)}
                    disabled={updateCronjob.isPending}
                    aria-label={cj.enabled ? "Disable" : "Enable"}
                  />
                  <Link to={`/dashboard/cronjobs/${cj.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" aria-hidden />
                      <span className="sr-only">View details</span>
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        {selectedCount > 0 && (
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-white/[0.03]">
            <span className="text-xs text-muted-foreground">
              {selectedCount} selected
            </span>
            <Link to="/dashboard/cronjobs">
              <Button size="sm" variant="outline">
                Manage selected
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={runDetailId !== null} onOpenChange={(open) => !open && setRunDetailId(null)}>
      <DialogContent className="border-white/[0.03] bg-card max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Run details</DialogTitle>
        </DialogHeader>
        {runDetailId && (
          <div className="space-y-4">
            {isRunLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : runArtifact ? (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 pr-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Run ID</span>
                    <span className="font-mono text-foreground">{runArtifact.runId}</span>
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={cn(
                        "font-medium",
                        runArtifact.status === "success" && "text-teal",
                        runArtifact.status === "failed" && "text-destructive",
                        runArtifact.status === "pending" && "text-amber"
                      )}
                    >
                      {runArtifact.status}
                    </span>
                    {(() => {
                      const cj = list.find((c) => c.id === runArtifact.cronjobId);
                      const lr = cj?.lastRun;
                      if (lr) {
                        return (
                          <>
                            <span className="text-muted-foreground">Started</span>
                            <span className="text-foreground">
                              {format(new Date(lr.startedAt), "PPp")}
                            </span>
                            {lr.endedAt && (
                              <>
                                <span className="text-muted-foreground">Ended</span>
                                <span className="text-foreground">
                                  {format(new Date(lr.endedAt), "PPp")}
                                </span>
                              </>
                            )}
                          </>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  {(runArtifact.logs ?? []).length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Logs</h4>
                      <pre className="rounded-md bg-secondary/50 p-3 text-xs font-mono text-foreground overflow-x-auto">
                        {(runArtifact.logs ?? []).join("\n")}
                      </pre>
                    </div>
                  )}
                  {(runArtifact.artifacts ?? []).length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Artifacts</h4>
                      <ul className="space-y-1 text-sm text-foreground">
                        {(runArtifact.artifacts ?? []).map((a, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(runArtifact.diffs ?? []).length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Diffs</h4>
                      <pre className="rounded-md bg-secondary/50 p-3 text-xs font-mono text-foreground overflow-x-auto">
                        {(runArtifact.diffs ?? []).join("\n")}
                      </pre>
                    </div>
                  )}
                  {runArtifact.traceLink && (
                    <Link to={runArtifact.traceLink}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View trace
                      </Button>
                    </Link>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">Run not found.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
