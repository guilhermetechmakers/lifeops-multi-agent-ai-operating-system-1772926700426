/**
 * ForecastingPanel — Time-series charts with selectable horizons and scenarios.
 * ROI/impact indicators and scenario comparison.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Forecast } from "@/types/finance";

interface ForecastingPanelProps {
  forecastData: Forecast[];
  isLoading?: boolean;
  className?: string;
}

export function ForecastingPanel({
  forecastData,
  isLoading,
  className,
}: ForecastingPanelProps) {
  const [horizon, setHorizon] = useState<"30d" | "60d">("30d");

  const chartData = useMemo(() => {
    const list = Array.isArray(forecastData) ? forecastData : [];
    const filtered = list.filter((f) => f.horizon === horizon);
    const revenue = filtered.find((f) => f.series === "revenue");
    const expense = filtered.find((f) => f.series === "expense");
    const net = (revenue?.value ?? 0) + (expense?.value ?? 0);
    return [
      { month: "Current", revenue: revenue?.value ?? 0, expense: Math.abs(expense?.value ?? 0), net },
      {
        month: horizon === "30d" ? "Next 30d" : "Next 60d",
        revenue: revenue?.value ?? 0,
        expense: Math.abs(expense?.value ?? 0),
        net,
      },
    ];
  }, [forecastData, horizon]);

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <BarChart3 className="h-5 w-5" />
            Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] animate-pulse rounded-lg bg-secondary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="h-5 w-5" />
          Forecast
        </CardTitle>
        <div className="flex items-center gap-2">
          <Link to="/dashboard/finance/forecasting">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              Forecasting & Reports
            </Button>
          </Link>
          <div className="flex gap-1">
          {(["30d", "60d"] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHorizon(h)}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium transition-colors",
                horizon === h
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {h}
            </button>
          ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" />
            <XAxis dataKey="month" className="text-xs text-muted-foreground" />
            <YAxis className="text-xs text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(21 23 24)",
                border: "1px solid rgba(255,255,255,0.03)",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#00C2A8"
              fill="#00C2A8/20"
              strokeWidth={2}
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#FFB020"
              fill="#FFB020/20"
              strokeWidth={2}
              name="Expense"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
