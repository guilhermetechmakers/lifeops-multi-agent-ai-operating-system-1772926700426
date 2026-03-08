/**
 * CronjobHealthPanel — Per-cron summary, expandable details, per-run detail drawer.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCronjobHealth } from "@/hooks/use-analytics";
import { ChevronDown, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CronjobHealth, CronjobRun } from "@/types/analytics";

const statusIcon = (status: string) => {
  if (status === "success") return <CheckCircle className="h-4 w-4 text-teal" />;
  if (status === "failure") return <XCircle className="h-4 w-4 text-destructive" />;
  return <Clock className="h-4 w-4 text-amber" />;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export interface CronjobHealthPanelProps {
  orgId?: string;
}

export function CronjobHealthPanel({ orgId }: CronjobHealthPanelProps) {
  const { cronjobs = [], isLoading } = useCronjobHealth({ orgId });
  const [selectedRun, setSelectedRun] = useState<CronjobRun | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const list = Array.isArray(cronjobs) ? cronjobs : [];

  if (isLoading) {
    return (
      <Card className="card-health">
        <CardHeader>
          <CardTitle className="text-base">Cronjob health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-secondary/50"
                aria-hidden
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (list.length === 0) {
    return (
      <Card className="card-health">
        <CardHeader>
          <CardTitle className="text-base">Cronjob health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No cronjobs configured.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-health">
      <CardHeader>
        <CardTitle className="text-base">Cronjob health</CardTitle>
        <p className="text-sm text-muted-foreground">
          Next run, last run, success rate, per-run details
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(list ?? []).map((cron: CronjobHealth) => (
            <Collapsible key={cron.id}>
              <div className="rounded-lg border border-white/[0.03] p-4 transition-colors hover:bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcon(cron.status ?? "idle")}
                    <div>
                      <p className="font-medium">{cron.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Next: {cron.nextRun ? formatDate(cron.nextRun) : "—"} · Last:{" "}
                        {cron.lastRun ? formatDate(cron.lastRun) : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {cron.successRate ?? 0}% success
                    </span>
                    {cron.latency != null && (
                      <span className="text-xs text-muted-foreground">
                        {cron.latency}ms
                      </span>
                    )}
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="mt-4 space-y-2 border-t border-white/[0.03] pt-4">
                    {(cron.runs ?? []).map((run: CronjobRun) => (
                      <button
                        key={run.id}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/50",
                          selectedRun?.id === run.id && "bg-secondary/50"
                        )}
                        onClick={() => {
                          setSelectedRun(run);
                          setSheetOpen(true);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          {statusIcon(run.status)}
                          {formatDate(run.runAt)}
                        </span>
                        <span className="text-muted-foreground">
                          {run.durationMs ?? 0}ms
                        </span>
                      </button>
                    ))}
                    {(cron.runs ?? []).length === 0 && (
                      <p className="text-sm text-muted-foreground">No run history</p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>

        {selectedRun && (
          <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Run details</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Run at</p>
                  <p className="font-medium">{formatDate(selectedRun.runAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedRun.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedRun.durationMs ?? 0}ms</p>
                </div>
                {selectedRun.errors && (
                  <div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <p className="font-medium text-destructive">{selectedRun.errors}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
