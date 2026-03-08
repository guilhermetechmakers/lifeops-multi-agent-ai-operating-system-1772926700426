/**
 * NutritionSummary — Daily/weekly totals, targets vs actuals, macro charts.
 * Uses accent colors (teal, amber, purple) for data viz.
 */

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NutritionTotals } from "@/types/training-meals";

const TEAL = "#00C2A8";
const AMBER = "#FFB020";
const PURPLE = "#8B5CF6";

const tooltipStyle = {
  backgroundColor: "rgb(21 23 24)",
  border: "1px solid rgba(255,255,255,0.03)",
  borderRadius: "8px",
  padding: "8px 12px",
};

export interface NutritionSummaryProps {
  dailyTotals: NutritionTotals[];
  weeklyTotals: NutritionTotals[];
  targets?: NutritionTotals | null;
  className?: string;
}

export function NutritionSummary({
  dailyTotals = [],
  weeklyTotals = [],
  targets = null,
  className,
}: NutritionSummaryProps) {
  const safeDaily = Array.isArray(dailyTotals) ? dailyTotals : [];
  const safeWeekly = Array.isArray(weeklyTotals) ? weeklyTotals : [];
  const [view, setView] = useState<"daily" | "weekly">("daily");

  const chartData = useMemo(() => {
    if (view === "daily") {
      return safeDaily.slice(0, 14).map((d, i) => ({
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

  const summaryTotals = useMemo(() => {
    const source = view === "daily" ? safeDaily : safeWeekly;
    const t = (source ?? []).reduce(
      (acc, d) => ({
        calories: acc.calories + (d?.calories ?? 0),
        protein: acc.protein + (d?.protein ?? 0),
        carbs: acc.carbs + (d?.carbs ?? 0),
        fat: acc.fat + (d?.fat ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    const count = source.length || 1;
    return {
      calories: Math.round(t.calories / count),
      protein: Math.round(t.protein / count),
      carbs: Math.round(t.carbs / count),
      fat: Math.round(t.fat / count),
    };
  }, [view, safeDaily, safeWeekly]);

  const targetCal = targets?.calories ?? 2000;
  const targetProtein = targets?.protein ?? 120;
  const targetCarbs = targets?.carbs ?? 200;
  const targetFat = targets?.fat ?? 65;

  if (safeDaily.length === 0 && safeWeekly.length === 0) {
    return (
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <UtensilsCrossed className="h-5 w-5 text-muted-foreground" aria-hidden />
            Nutrition summary
          </CardTitle>
          <p className="text-sm text-muted-foreground">No nutrition data yet. Generate a plan.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <UtensilsCrossed className="h-5 w-5 text-muted-foreground" aria-hidden />
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

          <div className="rounded-lg border border-white/[0.03] bg-secondary/20 p-4 mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-3">Averages</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Calories</p>
                <p className="text-lg font-semibold text-foreground">
                  {summaryTotals.calories}
                  {targets && (
                    <span
                      className={cn(
                        "ml-1 text-sm font-normal",
                        summaryTotals.calories <= targetCal ? "text-teal" : "text-amber"
                      )}
                    >
                      / {targetCal}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Protein (g)</p>
                <p className="text-lg font-semibold text-teal">
                  {summaryTotals.protein}
                  {targets && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      / {targetProtein}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Carbs (g)</p>
                <p className="text-lg font-semibold text-amber">
                  {summaryTotals.carbs}
                  {targets && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      / {targetCarbs}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fat (g)</p>
                <p className="text-lg font-semibold text-purple">
                  {summaryTotals.fat}
                  {targets && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      / {targetFat}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <TabsContent value="daily" className="mt-4">
            <div className="h-[220px] w-full" role="img" aria-label="Daily nutrition chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "rgb(157 163 166)", fontSize: 10 }}
                  />
                  <YAxis tick={{ fill: "rgb(157 163 166)", fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgb(255 255 255)" }} />
                  <Legend />
                  <Bar dataKey="protein" name="Protein (g)" fill={TEAL} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="carbs" name="Carbs (g)" fill={AMBER} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fat" name="Fat (g)" fill={PURPLE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="weekly" className="mt-4">
            <div className="h-[220px] w-full" role="img" aria-label="Weekly nutrition chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "rgb(157 163 166)", fontSize: 10 }}
                  />
                  <YAxis tick={{ fill: "rgb(157 163 166)", fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgb(255 255 255)" }} />
                  <Legend />
                  <Bar dataKey="protein" name="Protein (g)" fill={TEAL} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="carbs" name="Carbs (g)" fill={AMBER} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fat" name="Fat (g)" fill={PURPLE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
