/**
 * RunDetailsPanel — summary and link to full Run Details page.
 * Shows inputs, message count, logs, artifacts, timing, outcome, revert pathway.
 */

import { Link } from "react-router-dom";
import { ExternalLink, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface RunDetailsPanelProps {
  runId: string | null;
  cronJobId?: string | null;
  status?: string | null;
  startedAt?: string | null;
  messageCount?: number;
  artifactCount?: number;
  onRevert?: () => void;
  isReverting?: boolean;
  className?: string;
}

export function RunDetailsPanel({
  runId,
  cronJobId,
  status,
  startedAt,
  messageCount = 0,
  artifactCount = 0,
  onRevert,
  isReverting = false,
  className,
}: RunDetailsPanelProps) {
  const detailsUrl = cronJobId
    ? `/dashboard/cronjobs/${cronJobId}/runs/${runId}`
    : `/dashboard/runs/${runId}`;

  const statusVariant =
    status === "succeeded"
      ? "default"
      : status === "failed" || status === "aborted"
        ? "destructive"
        : "secondary";

  return (
    <Card className={cn("rounded-lg border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium">Run Details</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Full inputs, message trace, logs, diffs, artifacts, timing
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {runId ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {status != null && (
                <Badge variant={statusVariant} className="text-xs">
                  {status}
                </Badge>
              )}
              {startedAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(startedAt).toLocaleString()}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Messages: {messageCount}</p>
              <p>Artifacts: {artifactCount}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link to={detailsUrl}>
                <Button variant="outline" size="sm" className="w-full border-white/[0.03]" asChild>
                  <span>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open full Run Details
                  </span>
                </Button>
              </Link>
              {onRevert && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/[0.03] text-muted-foreground hover:text-destructive hover:border-destructive/50"
                  onClick={onRevert}
                  disabled={isReverting}
                  aria-label="Revert run"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {isReverting ? "Reverting…" : "Revert run"}
                </Button>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Select a run to view details</p>
        )}
      </CardContent>
    </Card>
  );
}
