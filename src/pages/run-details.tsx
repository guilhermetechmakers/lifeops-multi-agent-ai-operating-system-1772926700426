/**
 * Run Details page — inspect a single run with artifacts, trace, logs.
 * LifeOps design system; artifacts section for run outputs.
 */

import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/animated-page";
import { ArtifactManagerPanel } from "@/components/artifacts";
import { ArrowLeft, FileText, Activity } from "lucide-react";
import { useCronjobRuns } from "@/hooks/use-cronjobs";
import { formatDistanceToNow } from "date-fns";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function RunDetailsPage() {
  const { id: cronjobId, runId } = useParams<{ id: string; runId: string }>();
  const { items: runs } = useCronjobRuns(cronjobId ?? null);
  const run = useMemo(
    () => (runs ?? []).find((r) => r.runId === runId),
    [runs, runId]
  );

  const status = run?.status ?? "unknown";
  const variant =
    status === "success"
      ? "success"
      : status === "failure"
        ? "destructive"
        : "secondary";

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={cronjobId ? `/dashboard/cronjobs/${cronjobId}` : "/dashboard/cronjobs"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">Run details</h1>
          <p className="text-sm text-muted-foreground">
            Run ID: {runId}
            {run && (
              <> · {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })} · {formatDuration(run.durationMs)}</>
            )}
          </p>
        </div>
        <Badge variant={variant as "success" | "destructive" | "secondary"}>{status}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Message trace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {run?.trace
                ? "Trace data available."
                : "Trace viewer placeholder — agent-to-agent messages"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Logs & events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {(run?.logs ?? []).length > 0
                ? (run?.logs ?? []).map((log, i) => (
                    <li key={i}>{log}</li>
                  ))
                : "Logs placeholder — run events and timestamps"}
            </ul>
          </CardContent>
        </Card>
      </div>

      <ArtifactManagerPanel compact />
    </AnimatedPage>
  );
}
