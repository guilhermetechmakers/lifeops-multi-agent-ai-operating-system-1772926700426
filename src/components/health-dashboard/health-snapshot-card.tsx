/**
 * HealthSnapshotCard — Quick snapshot: Sleep, Recovery Score, Weekly Training Load, next 7 days.
 * Card with gradient background, top icon, title, numeric value, trend indicator.
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataVizChart } from "./data-viz-chart";
import type { HealthSnapshot } from "@/types/health";
import { Moon, Activity, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HealthSnapshotCardProps {
  snapshot: HealthSnapshot | null | undefined;
  isLoading?: boolean;
  className?: string;
}

export function HealthSnapshotCard({
  snapshot,
  isLoading,
  className,
}: HealthSnapshotCardProps) {
  const sleep = snapshot?.sleepHours ?? 0;
  const recovery = snapshot?.recoveryScore ?? 0;
  const load = snapshot?.weeklyTrainingLoad ?? 0;
  const days = Array.isArray(snapshot?.next7Days) ? snapshot.next7Days : [];

  const chartData = useMemo(() => {
    return (days ?? []).map((d) => ({
      label: d?.date
        ? new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
        : "",
      value: d?.recovery ?? d?.sleep ?? d?.load ?? 0,
    }));
  }, [days]);

  if (isLoading) {
    return (
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse",
          className
        )}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-secondary/50" />
        ))}
      </div>
    );
  }

  const tiles = [
    {
      key: "sleep",
      icon: Moon,
      label: "Sleep",
      value: `${sleep.toFixed(1)}h`,
      sub: "Last night",
    },
    {
      key: "recovery",
      icon: Activity,
      label: "Recovery Score",
      value: `${recovery}%`,
      sub: recovery >= 80 ? "Good" : recovery >= 60 ? "Moderate" : "Low",
    },
    {
      key: "load",
      icon: Dumbbell,
      label: "Weekly Load",
      value: `${load} min`,
      sub: "Training this week",
    },
  ];

  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Health snapshot">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ key, icon: Icon, label, value, sub }) => (
          <Card
            key={key}
            className="card-health border-white/[0.03]"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="h-4 w-4" />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {chartData.length > 0 && (
        <Card className="card-health border-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next 7 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataVizChart
              type="line"
              data={chartData}
              categories={["label"]}
              series={[{ dataKey: "value", name: "Recovery", color: "teal" }]}
              height={160}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
