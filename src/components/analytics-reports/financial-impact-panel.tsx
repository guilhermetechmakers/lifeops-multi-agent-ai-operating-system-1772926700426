/**
 * FinancialImpactPanel — Forecast, variance, spent, savings; stacked bars, line forecast, drill-down.
 * Guards: (financial ?? []).map(...)
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSeriesChart } from "./time-series-chart";
import { useFinancialImpact } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";

export interface FinancialImpactPanelProps {
  orgId?: string;
  range?: string;
  financial?: unknown;
  isLoading?: boolean;
  className?: string;
}

export function FinancialImpactPanel({
  orgId,
  range = "7d",
  financial: financialProp,
  isLoading: isLoadingProp,
  className,
}: FinancialImpactPanelProps) {
  const params = useMemo(() => ({ orgId, range }), [orgId, range]);
  const { data: hookData, isLoading: hookLoading } = useFinancialImpact(params);
  const financial = financialProp ?? hookData;
  const isLoading = isLoadingProp ?? hookLoading;
  const list = Array.isArray(financial) ? financial : [];

  const chartData = useMemo(() => {
    return (list ?? []).map((f) => ({
      date: f.date ?? "",
      forecast: f.forecastAmount ?? 0,
      savings: f.savings ?? 0,
      costs: f.costs ?? 0,
    }));
  }, [list]);

  const totals = useMemo(() => {
    const arr = list ?? [];
    return arr.reduce(
      (acc, f) => ({
        forecast: acc.forecast + (f.forecastAmount ?? 0),
        savings: acc.savings + (f.savings ?? 0),
        costs: acc.costs + (f.costs ?? 0),
      }),
      { forecast: 0, savings: 0, costs: 0 }
    );
  }, [list]);

  const latest = list.length > 0 ? list[list.length - 1] : null;
  const variance = latest
    ? (latest.forecastAmount ?? 0) - (latest.savings ?? 0) + (latest.costs ?? 0)
    : 0;

  if (isLoading) {
    return (
      <Card className={cn("card-health", className)}>
        <CardHeader>
          <CardTitle className="text-base">Financial impact</CardTitle>
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
          <CardTitle className="text-base">Financial impact</CardTitle>
          <p className="text-sm text-muted-foreground">
            Forecast, savings, costs, variance vs budget
          </p>
        </CardHeader>
        <CardContent>
          {empty ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No financial data available.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-white/[0.03] p-3">
                <p className="text-xs text-muted-foreground">Forecast (period)</p>
                <p className="text-xl font-semibold">${totals.forecast.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-white/[0.03] p-3">
                <p className="text-xs text-muted-foreground">Savings</p>
                <p className="text-xl font-semibold text-teal">${totals.savings.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-white/[0.03] p-3">
                <p className="text-xs text-muted-foreground">Costs</p>
                <p className="text-xl font-semibold">${totals.costs.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-white/[0.03] p-3">
                <p className="text-xs text-muted-foreground">Variance</p>
                <p
                  className={cn(
                    "text-xl font-semibold",
                    variance >= 0 ? "text-teal" : "text-destructive"
                  )}
                >
                  {variance >= 0 ? "+" : ""}${variance.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <TimeSeriesChart
          title="Financial trend"
          type="line"
          data={chartData}
          series={[
            { dataKey: "forecast", name: "Forecast", colorIndex: 0 },
            { dataKey: "savings", name: "Savings", colorIndex: 1 },
            { dataKey: "costs", name: "Costs", colorIndex: 2 },
          ]}
          xKey="date"
          height={220}
        />
      )}
    </div>
  );
}
