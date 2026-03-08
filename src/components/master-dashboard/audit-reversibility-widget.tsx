/**
 * AuditReversibilityWidget — Master Dashboard quick overview of audit metrics.
 * Links to Audit & Reversibility admin page.
 */

import { Link } from "react-router-dom";
import { History, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuditEvents } from "@/hooks/use-audit";
import { Skeleton } from "@/components/ui/skeleton";

export function AuditReversibilityWidget() {
  const { events, count, isLoading } = useAuditEvents({ limit: 100 });

  const reversibleCount = (events ?? []).filter(
    (e) => e.revertible && e.status === "COMPLETED"
  ).length;
  const pendingCount = (events ?? []).filter((e) => e.status === "PENDING").length;

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Audit & Reversibility
        </CardTitle>
        <History className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{count}</div>
        <p className="text-xs text-muted-foreground">
          {reversibleCount} reversible · {pendingCount} pending
        </p>
        <Link
          to="/dashboard/admin/audit"
          className="text-xs text-primary hover:underline mt-1 inline-block"
        >
          <RotateCcw className="h-3 w-3 inline mr-1" />
          View audit trail
        </Link>
      </CardContent>
    </Card>
  );
}
