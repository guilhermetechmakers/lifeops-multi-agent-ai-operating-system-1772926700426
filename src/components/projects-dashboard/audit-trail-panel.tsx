/**
 * AuditTrailPanel — run artifacts, logs, reversibility controls.
 */

import { Link } from "react-router-dom";
import { FileText, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectRuns } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

export interface AuditTrailPanelProps {
  projectId: string;
  className?: string;
}

export function AuditTrailPanel({ projectId, className }: AuditTrailPanelProps) {
  const { items: runs, isLoading } = useProjectRuns(projectId);
  const list = Array.isArray(runs) ? runs : [];

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-all hover:shadow-card-hover", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No run artifacts
          </div>
        ) : (
          <div className="space-y-2">
            {list.slice(0, 3).map((r) => (
              <Link key={r.id} to={`/dashboard/runs/${r.runId}`} aria-label={`View run ${r.runId}`}>
                <div className="flex items-center justify-between rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2 hover:bg-secondary/50 transition-colors">
                  <span className="text-sm text-foreground">{r.type ?? "artifact"}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
