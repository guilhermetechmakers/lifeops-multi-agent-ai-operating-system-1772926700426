/**
 * HealthMetricsSummary — aggregated health across integrations.
 * Shows healthy count, at-risk, and failed with trend indicators.
 */

import { useMemo } from "react";
import { Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Integration } from "@/types/integrations";

export interface HealthMetricsSummaryProps {
  integrations: Integration[];
  className?: string;
}

export function HealthMetricsSummary({
  integrations,
  className,
}: HealthMetricsSummaryProps) {
  const stats = useMemo(() => {
    const list = Array.isArray(integrations) ? integrations : [];
    const healthy = list.filter((i) => i.healthScore >= 80).length;
    const atRisk = list.filter((i) => i.healthScore >= 50 && i.healthScore < 80).length;
    const failed = list.filter((i) => i.healthScore < 50 || i.status === "error").length;
    const avgScore =
      list.length > 0
        ? Math.round(
            list.reduce((s, i) => s + (i.healthScore ?? 0), 0) / list.length
          )
        : 0;
    return { healthy, atRisk, failed, avgScore, total: list.length };
  }, [integrations]);

  if (stats.total === 0) return null;

  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-card transition-all hover:shadow-card-hover",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Health at a glance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-2xl font-semibold",
                stats.avgScore >= 80 ? "text-teal" : stats.avgScore >= 50 ? "text-amber" : "text-destructive"
              )}
            >
              {stats.avgScore}%
            </span>
            <span className="text-xs text-muted-foreground">avg health</span>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-teal" aria-hidden />
              {stats.healthy} healthy
            </span>
            {stats.atRisk > 0 && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-amber" aria-hidden />
                {stats.atRisk} at risk
              </span>
            )}
            {stats.failed > 0 && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <XCircle className="h-4 w-4 text-destructive" aria-hidden />
                {stats.failed} failed
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
