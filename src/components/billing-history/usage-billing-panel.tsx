/**
 * UsageBillingPanel — compact line items and mini chart for usage vs cost.
 */

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartMini } from "./chart-mini";
import { cn } from "@/lib/utils";
import type { UsageEntry } from "@/types/billing-history";

export interface UsageBillingPanelProps {
  usageEntries: UsageEntry[];
  className?: string;
}

export function UsageBillingPanel({ usageEntries, className }: UsageBillingPanelProps) {
  const safeEntries = usageEntries ?? [];
  const totalUsage = safeEntries.reduce((sum, e) => sum + (e.units ?? 0), 0);
  const totalCost = safeEntries.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  const chartData = safeEntries
    .slice()
    .reverse()
    .slice(0, 14)
    .map((e) => ({
      date: e.date ? format(new Date(e.date), "MM/dd") : "",
      amount: e.amount ?? 0,
      units: e.units ?? 0,
    }));

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Usage-based billing</CardTitle>
        <p className="text-sm text-muted-foreground">
          LLM/API consumption and associated costs
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total units</p>
            <p className="text-lg font-semibold text-foreground">{totalUsage.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/[0.03] bg-secondary/30 p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total cost</p>
            <p className="text-lg font-semibold text-foreground">${totalCost.toFixed(2)}</p>
          </div>
        </div>
        {chartData.length > 0 && (
          <ChartMini
            data={chartData}
            dataKey="amount"
            xAxisKey="date"
            color="purple"
            height={140}
          />
        )}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Recent entries</p>
          <ul className="space-y-1.5 max-h-32 overflow-y-auto">
            {(safeEntries ?? []).slice(0, 5).map((e) => (
              <li
                key={e.id}
                className="flex justify-between text-sm py-1 border-b border-white/[0.03] last:border-0"
              >
                <span className="text-foreground truncate">{e.metric_name ?? "—"}</span>
                <span className="text-muted-foreground shrink-0 ml-2">
                  {e.units?.toLocaleString() ?? 0} · ${(e.amount ?? 0).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
