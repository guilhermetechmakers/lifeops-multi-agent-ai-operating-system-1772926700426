/**
 * FinanceKpiStrip — Runway, MRR, ARR, churn rate, forecast variance.
 * Design: dark elevated cards, chart colors (teal, amber, purple), 8–12px radius.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, DollarSign, Percent, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FinanceKpiStripProps {
  runwayMonths?: number | null;
  mrr?: number | null;
  arr?: number | null;
  churnRate?: number | null;
  forecastVariance?: number | null;
  currency?: string;
  isLoading?: boolean;
  className?: string;
}

const kpiConfig = [
  {
    key: "runway" as const,
    icon: Calendar,
    label: "Runway",
    format: (v: number) => `${v} mo`,
    color: "text-teal",
  },
  {
    key: "mrr" as const,
    icon: DollarSign,
    label: "MRR",
    format: (v: number, c: string) => `${c} ${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    color: "text-foreground",
  },
  {
    key: "arr" as const,
    icon: TrendingUp,
    label: "ARR",
    format: (v: number, c: string) => `${c} ${v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    color: "text-foreground",
  },
  {
    key: "churnRate" as const,
    icon: Percent,
    label: "Churn rate",
    format: (v: number) => `${(v * 100).toFixed(2)}%`,
    color: "text-amber",
  },
  {
    key: "forecastVariance" as const,
    icon: BarChart3,
    label: "Forecast variance",
    format: (v: number) => `${(v * 100).toFixed(1)}%`,
    color: "text-purple",
  },
];

export function FinanceKpiStrip({
  runwayMonths,
  mrr,
  arr,
  churnRate,
  forecastVariance,
  currency = "USD",
  isLoading,
  className,
}: FinanceKpiStripProps) {
  const values = {
    runway: typeof runwayMonths === "number" ? runwayMonths : 0,
    mrr: typeof mrr === "number" ? mrr : 0,
    arr: typeof arr === "number" ? arr : 0,
    churnRate: typeof churnRate === "number" ? churnRate : 0,
    forecastVariance: typeof forecastVariance === "number" ? forecastVariance : 0,
  };

  return (
    <div
      className={cn("grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5", className)}
      role="region"
      aria-label="Finance KPIs"
    >
      {kpiConfig.map(({ key, icon: Icon, label, format, color }) => (
        <Card
          key={key}
          className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
        >
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon className="h-4 w-4" />
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-secondary" />
            ) : (
              <span className={cn("text-xl font-semibold", color)}>
                {key === "mrr" || key === "arr"
                  ? format(values[key], currency)
                  : format(values[key])}
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
