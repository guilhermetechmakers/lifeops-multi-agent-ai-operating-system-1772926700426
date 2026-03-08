/**
 * DataVizPanel — Streak and adherence charts for habits.
 * Uses project chart palette (teal, amber, purple); minimal, accessible.
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataVizChart } from "@/components/health-dashboard/data-viz-chart";
import type { Habit } from "@/types/health";
import { cn } from "@/lib/utils";

export interface DataVizPanelProps {
  habits: Habit[];
  /** Optional: streak history per habit for line chart. */
  streakHistory?: Array<{ habitId: string; date: string; streak: number }>;
  className?: string;
}

export function DataVizPanel({
  habits = [],
  streakHistory = [],
  className,
}: DataVizPanelProps) {
  const safeHabits = Array.isArray(habits) ? habits : [];
  const safeHistory = Array.isArray(streakHistory) ? streakHistory : [];

  const barData = useMemo(() => {
    return safeHabits.slice(0, 10).map((h) => ({
      name: (h?.name ?? "").slice(0, 12),
      streak: h?.streak ?? 0,
      fullName: h?.name ?? "",
    }));
  }, [safeHabits]);

  const lineData = useMemo(() => {
    if (safeHistory.length === 0) {
      return safeHabits.slice(0, 5).map((h, i) => ({
        day: `Day ${i + 1}`,
        streak: h?.streak ?? 0,
      }));
    }
    const byDate = new Map<string, number>();
    safeHistory.forEach(({ date, streak }) => {
      const prev = byDate.get(date) ?? 0;
      byDate.set(date, prev + streak);
    });
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, streak]) => ({ day: date.slice(5), streak }));
  }, [safeHistory, safeHabits]);

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader>
        <CardTitle className="text-base">Adherence &amp; streaks</CardTitle>
        <p className="text-sm text-muted-foreground">
          Current streak by habit (teal/amber/purple palette).
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {barData.length === 0 ? (
          <div
            className="flex min-h-[200px] items-center justify-center rounded-lg bg-secondary/20 text-sm text-muted-foreground"
            aria-label="No chart data"
          >
            No habits to display. Add habits to see streaks.
          </div>
        ) : (
          <DataVizChart
            type="bar"
            data={barData}
            categories={["name"]}
            series={[{ dataKey: "streak", name: "Streak", color: "teal" }]}
            height={220}
          />
        )}
        {lineData.length > 0 && (
          <DataVizChart
            type="line"
            data={lineData}
            categories={["day"]}
            series={[{ dataKey: "streak", name: "Combined streak", color: "purple" }]}
            height={180}
          />
        )}
      </CardContent>
    </Card>
  );
}
