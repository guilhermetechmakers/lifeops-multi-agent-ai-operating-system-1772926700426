/**
 * ReportsPanel — Usage metrics, report builder, export.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataVizChart } from "@/components/health-dashboard/data-viz-chart";
import { BarChart3, FileDown } from "lucide-react";
import { useAdminReports, useGenerateReport } from "@/hooks/use-admin";
import { AnimatedPage } from "@/components/animated-page";

const MOCK_USAGE = [
  { label: "Mon", api: 1200, llm: 800 },
  { label: "Tue", api: 1400, llm: 950 },
  { label: "Wed", api: 1100, llm: 700 },
  { label: "Thu", api: 1600, llm: 1100 },
  { label: "Fri", api: 1300, llm: 900 },
  { label: "Sat", api: 600, llm: 400 },
  { label: "Sun", api: 500, llm: 300 },
];

export function ReportsPanel() {
  const { metrics: reports = [], isLoading } = useAdminReports();
  const generateReport = useGenerateReport();

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Analytics & reports</h2>
        <Button
          className="gap-2"
          onClick={() => generateReport.mutate({ type: "usage", format: "CSV" })}
          disabled={generateReport.isPending}
        >
          <FileDown className="h-4 w-4" />
          Generate report
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              API & LLM usage
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Token consumption per week (mock)
            </p>
          </CardHeader>
          <CardContent>
            <DataVizChart
              type="bar"
              data={MOCK_USAGE}
              categories={["label"]}
              series={[
                { dataKey: "api", name: "API", color: "teal" },
                { dataKey: "llm", name: "LLM", color: "amber" },
              ]}
              height={220}
            />
          </CardContent>
        </Card>

        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
          <CardHeader>
            <CardTitle>Generated reports</CardTitle>
            <p className="text-sm text-muted-foreground">
              Download or schedule delivery
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-24 animate-pulse rounded bg-secondary/50" />
            ) : (reports ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No reports generated yet.
              </p>
            ) : (
              <div className="space-y-2">
                {(reports ?? []).map((r) => (
                  <div
                    key={r?.id ?? ""}
                    className="flex items-center justify-between rounded-md border border-white/[0.03] px-3 py-2 text-sm"
                  >
                    <span>{r?.name ?? "—"}</span>
                    <span className="text-muted-foreground">
                      {r?.generatedAt ? new Date(r.generatedAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
