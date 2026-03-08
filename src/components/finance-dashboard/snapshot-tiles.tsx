/**
 * SnapshotTiles — Balance, Monthly Spend, Forecast, Savings Opportunities.
 * Data-driven with currency formatting, growth indicators, drill-through actions.
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, BarChart3, PiggyBank, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number, currency: string): string {
  const sign = amount >= 0 ? "" : "-";
  return `${sign}${currency} ${Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface SnapshotTilesProps {
  balance: number;
  currency: string;
  monthlySpend: number;
  spendTrend?: number;
  forecastValue: number;
  forecastHorizon: string;
  opportunitiesAmount: number;
  opportunitiesCount: number;
  isLoading?: boolean;
  className?: string;
}

const tileConfig = [
  {
    key: "balance",
    icon: Wallet,
    label: "Balance",
    getValue: (p: SnapshotTilesProps) => formatCurrency(p.balance, p.currency),
    getSub: () => null,
    trend: null,
    to: "/dashboard/finance",
  },
  {
    key: "spend",
    icon: TrendingUp,
    label: "Monthly Spend",
    getValue: (p: SnapshotTilesProps) => formatCurrency(Math.abs(p.monthlySpend), p.currency),
    getSub: (p: SnapshotTilesProps) =>
      p.spendTrend != null ? `${p.spendTrend > 0 ? "+" : ""}${(p.spendTrend * 100).toFixed(1)}% vs last month` : null,
    trend: (p: SnapshotTilesProps) => p.spendTrend,
    to: "/dashboard/finance/transactions",
  },
  {
    key: "forecast",
    icon: BarChart3,
    label: "Forecast",
    getValue: (p: SnapshotTilesProps) => formatCurrency(p.forecastValue, p.currency),
    getSub: (p: SnapshotTilesProps) => p.forecastHorizon,
    trend: null,
    to: "/dashboard/finance",
  },
  {
    key: "opportunities",
    icon: PiggyBank,
    label: "Savings Opportunities",
    getValue: (p: SnapshotTilesProps) => formatCurrency(p.opportunitiesAmount, p.currency),
    getSub: (p: SnapshotTilesProps) =>
      p.opportunitiesCount > 0 ? `${p.opportunitiesCount} actionable` : null,
    trend: null,
    to: "/dashboard/finance",
  },
];

export function SnapshotTiles({
  balance,
  currency,
  monthlySpend,
  spendTrend,
  forecastValue,
  forecastHorizon,
  opportunitiesAmount,
  opportunitiesCount,
  isLoading,
  className,
}: SnapshotTilesProps) {
  const props = {
    balance,
    currency,
    monthlySpend,
    spendTrend,
    forecastValue,
    forecastHorizon,
    opportunitiesAmount,
    opportunitiesCount,
  };

  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
      role="region"
      aria-label="Finance snapshot"
    >
      {tileConfig.map(({ key, icon: Icon, label, getValue, getSub, trend, to }) => (
        <Card
          key={key}
          className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon className="h-4 w-4" />
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-secondary" />
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      key === "spend" && monthlySpend < 0 ? "text-foreground" : "text-foreground",
                      key === "opportunities" && opportunitiesAmount > 0 && "text-teal"
                    )}
                  >
                    {getValue(props)}
                  </span>
                  {trend?.(props) != null && (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        (trend as (p: SnapshotTilesProps) => number)(props) >= 0
                          ? "text-teal"
                          : "text-destructive"
                      )}
                    >
                      {(trend as (p: SnapshotTilesProps) => number)(props) >= 0 ? "↑" : "↓"}
                    </span>
                  )}
                </div>
                {getSub(props) && (
                  <p className="mt-1 text-xs text-muted-foreground">{getSub(props)}</p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                  asChild
                >
                  <Link to={to}>
                    View details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
