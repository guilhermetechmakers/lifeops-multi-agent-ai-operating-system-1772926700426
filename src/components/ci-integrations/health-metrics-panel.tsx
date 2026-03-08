/**
 * HealthMetricsPanel — badges, sparkline-ish charts for integration health.
 */

import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface HealthMetricsPanelProps {
  healthScore: number;
  errorRate?: number;
  recentFailures?: number;
  trend?: "up" | "down" | "stable";
  className?: string;
}

export function HealthMetricsPanel({
  healthScore,
  errorRate = 0,
  recentFailures = 0,
  trend = "stable",
  className,
}: HealthMetricsPanelProps) {
  const scoreColor =
    healthScore >= 80 ? "text-teal" : healthScore >= 50 ? "text-amber" : "text-destructive";

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={cn("text-2xl font-semibold", scoreColor)}>{healthScore}%</span>
          {trend !== "stable" && (
            <span className="text-muted-foreground" aria-hidden>
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-teal" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </span>
          )}
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          {errorRate > 0 && (
            <span>Error rate: <span className="text-foreground">{errorRate}%</span></span>
          )}
          {recentFailures > 0 && (
            <span>Failures: <span className="text-destructive">{recentFailures}</span></span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
