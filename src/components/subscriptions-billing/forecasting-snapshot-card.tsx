/**
 * ForecastingSnapshotCard — Quick view of forecasted spend,
 * upcoming charges, expected trajectory from subscription data.
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ArrowRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import type { ForecastSubscription } from "@/types/finance";

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export interface ForecastingSnapshotCardProps {
  lines?: ForecastSubscription[];
  totalProjected?: number;
  period?: string;
  isLoading?: boolean;
  onViewDetails?: () => void;
  className?: string;
}

export function ForecastingSnapshotCard({
  lines = [],
  totalProjected = 0,
  period = "",
  isLoading,
  onViewDetails,
  className,
}: ForecastingSnapshotCardProps) {
  const chartData = Array.isArray(lines)
    ? lines
        .filter((l) => (l.projectedAmount ?? 0) > 0)
        .slice(0, 5)
        .map((l, i) => ({
          name: `Sub ${i + 1}`,
          amount: l.projectedAmount ?? 0,
        }))
    : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="h-5 w-5 text-muted-foreground" aria-hidden />
          Forecast
        </CardTitle>
        {onViewDetails ? (
          <button
            type="button"
            onClick={onViewDetails}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            View full
            <ArrowRight className="h-3 w-3" />
          </button>
        ) : (
          <Link
            to="/dashboard/finance"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            View full
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[120px] animate-pulse rounded-lg bg-secondary" aria-hidden />
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(totalProjected)}
              </p>
              <p className="text-xs text-muted-foreground">
                Projected for {period || "current period"}
              </p>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `$${v}`}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(21 23 24)",
                      border: "1px solid rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Amount"]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#00C2A8"
                    radius={[4, 4, 0, 0]}
                    name="Amount"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                No forecast data
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
