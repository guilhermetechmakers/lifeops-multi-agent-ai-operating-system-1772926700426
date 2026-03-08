/**
 * Cronjob detail: schedule, status, run history, actions.
 */

import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Pencil } from "lucide-react";
import { AnimatedPage } from "@/components/animated-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RunHistoryPanel } from "@/components/cronjobs";
import { useCronjob, useRunNowCronjob } from "@/hooks/use-cronjobs";
import { formatNextRun } from "@/lib/cron-utils";

export default function CronjobDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: job, isLoading, error } = useCronjob(id);
  const runNow = useRunNowCronjob();

  if (isLoading || !id) {
    return (
      <AnimatedPage className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-48" />
      </AnimatedPage>
    );
  }

  if (error || !job) {
    return (
      <AnimatedPage className="space-y-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-6 text-center text-sm text-foreground">
          Cronjob not found or failed to load.
          <Link to="/dashboard/cronjobs" className="ml-2 text-primary hover:underline">
            Back to list
          </Link>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/dashboard/cronjobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-foreground truncate">
            {job.name}
          </h1>
          <p className="text-sm text-muted-foreground">ID: {id}</p>
        </div>
        <Badge variant={job.enabled ? "success" : "secondary"}>
          {job.enabled ? "Enabled" : "Paused"}
        </Badge>
        <Link to={`/dashboard/cronjobs/${id}/edit`}>
          <Button variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
        <Button
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={() => runNow.mutate(id)}
          disabled={runNow.isPending}
        >
          <Play className="h-4 w-4" />
          Run now
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <CardTitle className="text-base">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm text-foreground">
              {job.scheduleExpression ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {job.timezone} · Next: {job.nextRun ? formatNextRun(job.nextRun) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <CardTitle className="text-base">Automation level</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{job.automationLevel}</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Target: {job.targetType} / {job.targetId}
            </p>
          </CardContent>
        </Card>
      </div>

      <RunHistoryPanel cronjobId={id} cronjobName={job.name} />
    </AnimatedPage>
  );
}
