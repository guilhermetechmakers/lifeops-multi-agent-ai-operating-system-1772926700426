/**
 * Nutrition Summary — Daily/weekly totals, macro breakdown, targets vs actuals.
 * Charts for nutrition vs targets using teal/amber/purple accents.
 */

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataVizChart } from "@/components/health-dashboard/data-viz-chart";
import { Flame, Beef, Wheat, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NutritionTotals } from "@/types/training-meals";

export interface NutritionSummaryProps {
  dailyTotals?: NutritionTotals[];
  weeklyTotals?: NutritionTotals[];
  targets?: Partial<NutritionTotals>;
  selectedDay?: number;
  onSelectedDayChange?: (day: number) => void;
  isLoading?: boolean;
  className?: string;
}

const MACRO_LABELS = {
  calories: { label: "Calories", icon: Flame, color: "text-amber" },
  protein: { label: "Protein", icon: Beef, color: "text-teal" },
  carbs: { label: "Carbs", icon: Wheat, color: "text-amber" },
  fat: { label: "Fat", icon: Droplets, color: "text-purple" },
};

export function NutritionSummary({
  dailyTotals = [],
  weeklyTotals = [],
  targets = {},
  selectedDay = 0,
  onSelectedDayChange,
  isLoading,
  className,
}: NutritionSummaryProps) {
  const [view, setView] = useState<"daily" | "weekly">("daily");

  const safeDaily = Array.isArray(dailyTotals) ? dailyTotals : [];
  const safeWeekly = Array.isArray(weeklyTotals) ? weeklyTotals : [];

  const chartData = useMemo(() => {
    if (view === "daily") {
      return safeDaily.map((d, i) => ({
        name: `Day ${i + 1}`,
        calories: d?.calories ?? 0,
        protein: d?.protein ?? 0,
        carbs: d?.carbs ?? 0,
        fat: d?.fat ?? 0,
      }));
    }
    return safeWeekly.map((w, i) => ({
      name: `Week ${i + 1}`,
      calories: w?.calories ?? 0,
      protein: w?.protein ?? 0,
      carbs: w?.carbs ?? 0,
      fat: w?.fat ?? 0,
    }));
  }, [view, safeDaily, safeWeekly]);

  const currentTotals = view === "daily"
    ? safeDaily[selectedDay] ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
    : safeWeekly[0] ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const targetCal = targets?.calories ?? 2000;
  const targetProtein = targets?.protein ?? 150;

  if (isLoading) {
    return (
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-48 animate-pulse rounded bg-secondary/50" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-secondary/30" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Flame className="h-5 w-5 text-amber" aria-hidden />
          Nutrition summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Daily and weekly totals vs targets
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={view} onValueChange={(v) => setView(v as "daily" | "weekly")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="mt-4">
            {safeDaily.length > 0 && (
              <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                {safeDaily.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSelectedDayChange?.(i)}
                    className={cn(
                      "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
                      selectedDay === i
                        ? "bg-[#FF3B30] text-white"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    )}
                    aria-pressed={selectedDay === i}
                  >
                    Day {i + 1}
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="weekly" className="mt-4" />
        </Tabs>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.entries(MACRO_LABELS) as [keyof NutritionTotals, typeof MACRO_LABELS.calories][]).map(
            ([key, { label, icon: Icon, color }]) => {
              const value = currentTotals?.[key] ?? 0;
              const target = key === "calories" ? targetCal : key === "protein" ? targetProtein : undefined;
              const diff = target !== undefined ? value - target : 0;
              return (
                <div
                  key={key}
                  className="rounded-lg border border-white/[0.03] bg-secondary/20 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", color)} aria-hidden />
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
                  {target !== undefined && (
                    <p
                      className={cn(
                        "text-xs",
                        diff > 0 ? "text-amber" : diff < 0 ? "text-teal" : "text-muted-foreground"
                      )}
                    >
                      {diff > 0 ? "+" : ""}
                      {diff} vs target
                    </p>
                  )}
                </div>
              );
            }
          )}
        </div>

        {chartData.length > 0 && (
          <div className="rounded-lg border border-white/[0.03] bg-secondary/10 p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Macro trend</p>
            <DataVizChart
              type="bar"
              data={chartData}
              categories={["name"]}
              series={[
                { dataKey: "protein", name: "Protein", color: "teal" },
                { dataKey: "carbs", name: "Carbs", color: "amber" },
                { dataKey: "fat", name: "Fat", color: "purple" },
              ]}
              height={180}
            />
          </div>
        )}

        {chartData.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
            <Flame className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No nutrition data yet</p>
            <p className="text-xs text-muted-foreground">Generate a plan to see totals</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
