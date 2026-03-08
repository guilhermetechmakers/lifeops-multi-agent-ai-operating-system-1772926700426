/**
 * AuditTrailPanel — Run history, changes, reversible actions.
 * Data from useAuditLogs; guards (items ?? []).
 */

import { History, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuditLogs } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import type { AuditRun } from "@/types/settings";

export function AuditTrailPanel() {
  const { items, isLoading } = useAuditLogs(20);
  const list = items ?? [];

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Audit trail
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Recent actions and run artifacts
        </p>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit entries yet.</p>
        ) : (
          <ul className="space-y-2" role="list">
            {(list ?? []).map((entry: AuditRun) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.03] bg-secondary/50 p-3 transition-colors hover:bg-secondary/70"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {entry.action} → {entry.target}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0" aria-label="View details">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
