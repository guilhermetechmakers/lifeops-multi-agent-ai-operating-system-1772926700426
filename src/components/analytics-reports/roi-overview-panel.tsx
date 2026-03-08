/**
 * ROIOverviewPanel — Cumulative/period ROI, charts, forecast.
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useROIMetrics } from "@/hooks/use-analytics";
import { KPIWidget } from "./kpi-widget";
import { TimeSeriesChart } from "./time-series-chart";
import { DollarSign, Zap, TrendingUp } from "lucide-react";

export interface ROIOverviewPanelProps {
  orgId?: string;
  range?: string;
}

export function ROIOverviewPanel({ orgId, range }: ROIOverviewPanelProps) {
  const { data: metrics = [], isLoading } = useROIMetrics({ orgId, range });

  const list = Array.isArray(metrics) ? metrics : [];

  const totals = useMemo(() => {
    const arr = list ?? [];
    if (arr.length === 0) return { timeSaved: 0, actionsSaved: 0, automationCount: 0, costSavings: 0 };
    return arr.reduce(
      (acc, m) => ({
        timeSaved: acc.timeSaved + (m.timeSaved ?? 0),
        actionsSaved: acc.actionsSaved + (m.actionsSaved ?? 0),
        automationCount: acc.automationCount + (m.automationCount ?? 0),
        costSavings: acc.costSavings + (m.costSavings ?? 0),
      }),
      { timeSaved: 0, actionsSaved: 0, automationCount: 0, costSavings: 0 }
    );
  }, [list]);

  if (isLoading) {
    return (
      <Card className="card-health">
        <CardHeader>
          <CardTitle className="text-base">ROI overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-secondary/50"
                aria-hidden
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget
          title="Time saved (min)"
          value={totals.timeSaved.toLocaleString()}
          trend="up"
          icon={<Zap className="h-5 w-5" />}
          tooltip="Total minutes saved by automation"
        />
        <KPIWidget
          title="Actions saved"
          value={totals.actionsSaved.toLocaleString()}
          trend="up"
          icon={<TrendingUp className="h-5 w-5" />}
          tooltip="Manual actions replaced by automation"
        />
        <KPIWidget
          title="Automations run"
          value={totals.automationCount.toLocaleString()}
          icon={<Zap className="h-5 w-5" />}
          tooltip="Total automation executions"
        />
        <KPIWidget
          title="Cost savings"
          value={`$${totals.costSavings.toLocaleString()}`}
          trend="up"
          icon={<DollarSign className="h-5 w-5" />}
          tooltip="Estimated cost savings"
        />
      </div>
      {list.length > 0 && (
        <TimeSeriesChart
          title="ROI trend"
          type="line"
          data={list.map((m) => ({
            date: m.date ?? "",
            timeSaved: m.timeSaved ?? 0,
            costSavings: m.costSavings ?? 0,
          }))}
          series={[
            { dataKey: "timeSaved", name: "Time saved (min)", colorIndex: 0 },
            { dataKey: "costSavings", name: "Cost savings", colorIndex: 1 },
          ]}
          categories={["date"]}
          height={240}
        />
      )}
    </div>
  );
}
