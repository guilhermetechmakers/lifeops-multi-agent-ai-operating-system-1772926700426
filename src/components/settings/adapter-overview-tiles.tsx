/**
 * Adapter overview tiles: count by type, health status, last test.
 * Uses useAdapters and useAdaptersHealth; guards all arrays.
 */

import { Plug, Activity, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdapters, useAdaptersHealth } from "@/hooks/use-adapters";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { HealthStatusValue } from "@/types/adapters";

const HEALTH_ICONS: Record<HealthStatusValue, React.ComponentType<{ className?: string }>> = {
  healthy: CheckCircle,
  degraded: AlertCircle,
  unhealthy: XCircle,
};

export function AdapterOverviewTiles() {
  const { items: adapters, isLoading: adaptersLoading } = useAdapters();
  const { items: healthList, isLoading: healthLoading } = useAdaptersHealth();

  const list = adapters ?? [];
  const health = healthList ?? [];
  const healthyCount = health.filter((h) => h.status === "healthy").length;
  const total = list.length;

  if (adaptersLoading || healthLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-all duration-200 hover:shadow-card-hover"
          >
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-32 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Total adapters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-foreground">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {list.filter((a) => a.enabled).length} enabled
          </p>
        </CardContent>
      </Card>
      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-foreground">{healthyCount}</span>
            <span className="text-sm text-muted-foreground">/ {health.length} healthy</span>
          </div>
          <div className="flex gap-1 mt-2">
            {health.slice(0, 5).map((h) => {
              const Icon = HEALTH_ICONS[h.status] ?? XCircle;
              return (
                <span
                  key={h.adapterId}
                  className={cn(
                    "inline-flex items-center rounded-full p-0.5",
                    h.status === "healthy" && "text-teal",
                    h.status === "degraded" && "text-amber",
                    h.status === "unhealthy" && "text-muted-foreground"
                  )}
                  title={h.details ?? h.status}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Connected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-foreground">
            {list.filter((a) => (a.credentialsRef ?? "").length > 0).length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            With credentials linked
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
