/**
 * Analytics & Reports Dashboard — Usage metrics, chart, report builder/export.
 * Guards: (metrics ?? [])
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminReportsMetrics, useGenerateReport } from "@/hooks/use-admin";
import { AdminChartPanel } from "./admin-chart-panel";
import { FileDown } from "lucide-react";

const EMPTY_METRICS: { label: string; value: number; previousValue?: number; unit?: string }[] = [];

export function AnalyticsReportsPanel() {
  const { metrics, data, isLoading } = useAdminReportsMetrics();
  const generateReport = useGenerateReport();

  const list = metrics ?? data ?? EMPTY_METRICS;

  const chartData = useMemo(() => {
    const arr = Array.isArray(list) ? list : [];
    return arr.map((m) => ({
      name: m.label,
      value: typeof m.value === "number" ? m.value : 0,
    }));
  }, [list]);

  const handleGenerate = () => {
    generateReport.mutate({ type: "usage", format: "CSV" });
  };

  return (
    <div className="space-y-6">
      <Card className="card-health">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Usage metrics</CardTitle>
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generateReport.isPending}>
            <FileDown className="mr-2 h-4 w-4" />
            Generate report
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No metrics available.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {(list ?? []).map((m: { label?: string; value?: number; previousValue?: number; unit?: string }) => (
                <div key={m.label ?? ""} className="rounded-lg border border-white/[0.03] p-3">
                  <p className="text-sm text-muted-foreground">{m.label ?? ""}</p>
                  <p className="text-xl font-semibold">
                    {typeof m.value === "number" && m.value >= 1e6
                      ? (m.value / 1e6).toFixed(1) + "M"
                      : m.value ?? 0}
                    {m.unit != null ? ` ${m.unit}` : ""}
                  </p>
                  {m.previousValue != null && (
                    <p className="text-xs text-muted-foreground">
                      Previous: {m.previousValue >= 1e6 ? (m.previousValue / 1e6).toFixed(1) + "M" : m.previousValue}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <AdminChartPanel
          title="Usage overview"
          type="bar"
          data={chartData}
          series={[{ dataKey: "value", name: "Value" }]}
          xKey="name"
          height={240}
        />
      )}
    </div>
  );
}
