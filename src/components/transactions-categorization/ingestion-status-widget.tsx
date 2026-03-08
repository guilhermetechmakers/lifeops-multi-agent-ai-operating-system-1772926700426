/**
 * IngestionStatusWidget — Latest ingestion run, status, counts, rerun button.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IngestionRun } from "@/types/finance";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export interface IngestionStatusWidgetProps {
  ingestion: IngestionRun | null;
  onRerun: () => void;
  isRerunning?: boolean;
}

export function IngestionStatusWidget({
  ingestion,
  onRerun,
  isRerunning = false,
}: IngestionStatusWidgetProps) {
  const job = ingestion ?? null;
  const status = job?.status ?? "unknown";

  const StatusIcon =
    status === "completed" ? CheckCircle :
    status === "running" || status === "pending" ? Loader2 :
    AlertCircle;

  return (
    <Card className="border-white/[0.03] bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Latest Ingestion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusIcon
              className={cn(
                "h-5 w-5",
                status === "completed" && "text-teal",
                (status === "running" || status === "pending") && "animate-spin text-amber",
                status === "failed" && "text-destructive"
              )}
            />
            <div>
              <Badge
                variant={
                  status === "completed"
                    ? "secondary"
                    : status === "failed"
                    ? "destructive"
                    : "outline"
                }
              >
                {status}
              </Badge>
              {job?.startedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(job.startedAt)}
                  {job.completedAt && ` → ${formatTime(job.completedAt)}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {job && (
              <>
                <span className="text-muted-foreground">
                  +{job.newCount ?? 0} new
                </span>
                <span className="text-muted-foreground">
                  {job.updatedCount ?? 0} updated
                </span>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={onRerun}
              disabled={isRerunning}
            >
              {isRerunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Rerun
            </Button>
          </div>
        </div>
        {job?.error && (
          <p className="mt-2 text-xs text-destructive">{job.error}</p>
        )}
      </CardContent>
    </Card>
  );
}
