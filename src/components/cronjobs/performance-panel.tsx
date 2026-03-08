/**
 * PerformancePanel: caching, indexing, and monitoring health indicators.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Database, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_HEALTH = {
  cacheStatus: "healthy" as const,
  indexHealth: "healthy" as const,
  latencyMs: 12,
  cacheHitRate: 0.94,
  scheduleBottlenecks: 0,
};

export interface PerformancePanelProps {
  className?: string;
}

export function PerformancePanel({ className }: PerformancePanelProps) {
  const health = MOCK_HEALTH;
  const isLoading = false;

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  const h = health ?? {
    cacheStatus: "healthy" as const,
    indexHealth: "healthy" as const,
    latencyMs: 0,
    cacheHitRate: 1,
    scheduleBottlenecks: 0,
  };

  const cacheStatusVariant =
    h.cacheStatus === "healthy"
      ? "success"
      : h.cacheStatus === "degraded"
        ? "warning"
        : "destructive";

  const indexStatusVariant =
    h.indexHealth === "healthy"
      ? "success"
      : h.indexHealth === "rebuilding"
        ? "warning"
        : "destructive";

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Activity className="h-4 w-4" />
          Performance & monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4" />
            Cache
          </span>
          <Badge variant={cacheStatusVariant}>{h.cacheStatus}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" />
            Index
          </span>
          <Badge variant={indexStatusVariant}>{h.indexHealth}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Latency</span>
          <span className="font-mono text-foreground">{h.latencyMs}ms</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Cache hit rate</span>
          <span className="font-mono text-foreground">
            {Math.round((h.cacheHitRate ?? 0) * 100)}%
          </span>
        </div>
        {h.scheduleBottlenecks > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-amber/30 bg-amber/5 px-3 py-2 text-sm font-medium text-amber">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {h.scheduleBottlenecks} schedule bottleneck(s) detected
          </div>
        )}
      </CardContent>
    </Card>
  );
}
