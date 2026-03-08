/**
 * UsageMetricsPanel — MAU, DAU, sessions, avg session; trend charts.
 * Guards: (metrics ?? []).map(...)
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSeriesChart } from "./time-series-chart";
import { useUsageMetrics } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";

export interface UsageMetricsPanelProps {
  orgId?: string;
  range?: string;
  metrics?: unknown;
  isLoading?: boolean;
  className?: string;
}

export function UsageMetricsPanel({
  orgId,
  range = "7d",
  metrics: metricsProp,
  isLoading: isLoadingProp,
  className,
}: UsageMetricsPanelProps) {
  const params = useMemo(() => ({ orgId, range }), [orgId, range]);
  const { data: hookData, isLoading: hookLoading } = useUsageMetrics(params);
  const metrics = metricsProp ?? hookData;
  const isLoading = isLoadingProp ?? hookLoading;
  const list = Array.isArray(metrics) ? metrics : [];

  const latest = useMemo(() => {
    const arr = list ?? [];
    return arr.length > 0 ? arr[arr.length - 1] : null;
  }, [list]);

  const chartData = useMemo(() => {
    return (list ?? []).map((m) => ({
      date: m.date ?? "",
      mau: m.mau ?? 0,
      dau: m.dau ?? 0,
      sessions: m.sessions ?? 0,
      avgSession: m.avgSession ?? 0,
    }));
  }, [list]);

  if (isLoading) {
    return (
      <Card className={cn("card-health", className)}>
        <CardHeader>
          <CardTitle className="text-base">Usage metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse rounded-lg bg-secondary/50" />
        </CardContent>
      </Card>
    );
  }

  const empty = list.length === 0;

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="card-health">
        <CardHeader>
          <CardTitle className="text-base">Usage metrics</CardTitle>
          <p className="text-sm text-muted-foreground">
            MAU, DAU, sessions, avg session duration
          </p>
        </CardHeader>
        <CardContent>
          {empty ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No usage data available.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-white/[0.03] p-3">
                <p className="text-xs text-muted-foreground">MAU</p>
                <p className="text-xl font-semibold">{latest?.mau ?? 0}</p>
              </div>
              <div className="rounded-lg border border-white/[0.03] p-3">
                <p className="text-xs text-muted-foreground">DAU</p>
                <p className="text-xl font-semibold">{latest?.dau ?? 0}</p>
              </div>
              <div className="rounded-lg border border-white/[0.03] p-3">
                <p className="text-xs text-muted-foreground">Sessions</p>
                <p className="text-xl font-semibold">{latest?.sessions ?? 0}</p>
              </div>
              <div className="rounded-lg border border-white/[0.03] p-3">
                <p className="text-xs text-muted-foreground">Avg session (min)</p>
                <p className="text-xl font-semibold">{latest?.avgSession ?? 0}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <TimeSeriesChart
          title="Usage over time"
          type="line"
          data={chartData}
          series={[
            { dataKey: "mau", name: "MAU", colorIndex: 0 },
            { dataKey: "dau", name: "DAU", colorIndex: 1 },
            { dataKey: "sessions", name: "Sessions", colorIndex: 2 },
          ]}
          categories={["date"]}
          xKey="date"
          height={220}
        />
      )}
    </div>
  );
}
