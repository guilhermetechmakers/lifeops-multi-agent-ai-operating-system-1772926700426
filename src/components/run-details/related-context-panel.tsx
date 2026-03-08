/**
 * RelatedContextPanel — links to preceding/following runs, cronjob, approval state.
 */

import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, FileCheck, Bug } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RunDetail } from "@/types/run-details";

export interface RelatedContextPanelProps {
  run: RunDetail | null;
  className?: string;
}

export function RelatedContextPanel({ run, className }: RelatedContextPanelProps) {
  const { id: cronjobId } = useParams<{ id: string }>();
  const effectiveCronjobId = cronjobId ?? run?.cronjobId;
  const preceding = run?.relatedRuns?.antecedent ?? [];
  const following = run?.relatedRuns?.successor ?? [];
  const approvalId = run?.approvalId;
  const hasPreceding = Array.isArray(preceding) && preceding.length > 0;
  const hasFollowing = Array.isArray(following) && following.length > 0;

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 md:p-5">
        <CardTitle className="text-base">Related Context</CardTitle>
        <p className="text-sm text-muted-foreground">
          Related runs, cronjob, approvals, and debug tools.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {effectiveCronjobId != null && (
          <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-secondary/20 p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Cronjob</span>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link to={`/dashboard/cronjobs/${effectiveCronjobId}/edit`}>
                Edit in Cronjob Editor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {approvalId != null && (
          <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-secondary/20 p-3">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Approval</span>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link to={`/dashboard/approvals?approval=${approvalId}`}>
                View in Approvals Queue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-secondary/20 p-3">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Agent Trace & Debugger</span>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link to={`/dashboard/agent-trace?runId=${run?.id ?? ""}`}>
              Inspect
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {(hasPreceding || hasFollowing) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Related runs</p>
            <div className="flex flex-wrap gap-2">
              {hasPreceding &&
                (preceding ?? []).slice(0, 3).map((runId) => (
                  <Button key={runId} variant="outline" size="sm" asChild>
                    <Link
                      to={effectiveCronjobId ? `/dashboard/cronjobs/${effectiveCronjobId}/runs/${runId}` : "#"}
                    >
                      {runId}
                    </Link>
                  </Button>
                ))}
              {hasFollowing &&
                (following ?? []).slice(0, 3).map((runId) => (
                  <Button key={runId} variant="outline" size="sm" asChild>
                    <Link
                      to={effectiveCronjobId ? `/dashboard/cronjobs/${effectiveCronjobId}/runs/${runId}` : "#"}
                    >
                      {runId}
                    </Link>
                  </Button>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
