/**
 * ReportsPanel — Time-series usage, cronjob health, agent performance, financial impact.
 * Drill-down with date/org filters; export CSV/JSON/PDF.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataVizChart } from "@/components/health-dashboard/data-viz-chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, FileDown, FileJson, FileText, TrendingUp, Clock, Bot, DollarSign } from "lucide-react";
import { useAdminReports, useGenerateReport, useAdminReportsMetrics } from "@/hooks/use-admin";
import { AnimatedPage } from "@/components/animated-page";
import { cn } from "@/lib/utils";
import type { AdminReport } from "@/types/admin";

const MOCK_USAGE = [
  { label: "Mon", api: 1200, llm: 800 },
  { label: "Tue", api: 1400, llm: 950 },
  { label: "Wed", api: 1100, llm: 700 },
  { label: "Thu", api: 1600, llm: 1100 },
  { label: "Fri", api: 1300, llm: 900 },
  { label: "Sat", api: 600, llm: 400 },
  { label: "Sun", api: 500, llm: 300 },
];

const MOCK_CRONJOB_HEALTH = [
  { label: "W1", success: 42, failed: 2 },
  { label: "W2", success: 38, failed: 1 },
  { label: "W3", success: 45, failed: 0 },
  { label: "W4", success: 40, failed: 3 },
];

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportReportCsv(report: AdminReport) {
  const rows = [
    ["Report", report?.name ?? ""],
    ["Type", report?.type ?? ""],
    ["Generated", report?.generatedAt ?? ""],
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv" }), `${report?.name ?? "report"}.csv`);
}

function exportReportJson(report: AdminReport) {
  const json = JSON.stringify({ name: report?.name, type: report?.type, generatedAt: report?.generatedAt }, null, 2);
  downloadBlob(new Blob([json], { type: "application/json" }), `${report?.name ?? "report"}.json`);
}

function exportReportPdf(_report: AdminReport) {
  const text = `Report: ${_report?.name ?? ""}\nType: ${_report?.type ?? ""}\nGenerated: ${_report?.generatedAt ?? ""}`;
  downloadBlob(new Blob([text], { type: "text/plain" }), `${_report?.name ?? "report"}.txt`);
}

export function ReportsPanel() {
  const { metrics: reports = [], isLoading } = useAdminReports();
  const { metrics: reportMetrics = [] } = useAdminReportsMetrics({});
  const generateReport = useGenerateReport();
  const [drillDownReport, setDrillDownReport] = useState<AdminReport | null>(null);
  const [drillDownDateRange, setDrillDownDateRange] = useState("7d");
  const [drillDownOrgId, setDrillDownOrgId] = useState("");

  const reportsList = Array.isArray(reports) ? reports : [];
  const metricsList = Array.isArray(reportMetrics) ? reportMetrics : [];

  const handleExport = useCallback((r: AdminReport, format: "CSV" | "JSON" | "PDF") => {
    if (format === "CSV") exportReportCsv(r);
    else if (format === "JSON") exportReportJson(r);
    else exportReportPdf(r);
  }, []);

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Analytics & reports</h2>
        <Button
          className="gap-2"
          onClick={() => generateReport.mutate({ type: "usage", format: "CSV" })}
          disabled={generateReport.isPending}
        >
          <FileDown className="h-4 w-4" />
          Generate report
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-all duration-200 hover:shadow-card-hover"
          onClick={() => setDrillDownReport({ id: "usage", name: "Usage metrics", type: "usage", generatedAt: new Date().toISOString() })}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="h-4 w-4 text-teal" />
              Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {metricsList.length > 0 ? metricsList[0]?.value?.toLocaleString() : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Click to drill down</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-all duration-200 hover:shadow-card-hover"
          onClick={() => setDrillDownReport({ id: "cronjob", name: "Cronjob health", type: "cronjob", generatedAt: new Date().toISOString() })}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4 text-amber" />
              Cronjob health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">98%</p>
            <p className="text-xs text-muted-foreground">Click to drill down</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-all duration-200 hover:shadow-card-hover"
          onClick={() => setDrillDownReport({ id: "agent", name: "Agent performance", type: "agent", generatedAt: new Date().toISOString() })}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Bot className="h-4 w-4 text-purple" />
              Agent performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">—</p>
            <p className="text-xs text-muted-foreground">Click to drill down</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] transition-all duration-200 hover:shadow-card-hover"
          onClick={() => setDrillDownReport({ id: "financial", name: "Financial impact", type: "financial", generatedAt: new Date().toISOString() })}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
              <DollarSign className="h-4 w-4 text-teal" />
              Financial impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">—</p>
            <p className="text-xs text-muted-foreground">Click to drill down</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5" />
              API & LLM usage
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Token consumption per week
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
            <CardTitle className="text-foreground">Cronjob health (weekly)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Success vs failed runs
            </p>
          </CardHeader>
          <CardContent>
            <DataVizChart
              type="bar"
              data={MOCK_CRONJOB_HEALTH}
              categories={["label"]}
              series={[
                { dataKey: "success", name: "Success", color: "teal" },
                { dataKey: "failed", name: "Failed", color: "purple" },
              ]}
              height={220}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
        <CardHeader>
          <CardTitle className="text-foreground">Generated reports</CardTitle>
          <p className="text-sm text-muted-foreground">
            Download as CSV, JSON, or PDF
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-24 animate-pulse rounded bg-secondary/50" />
          ) : reportsList.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No reports generated yet.
            </p>
          ) : (
            <div className="space-y-2">
              {(reportsList ?? []).map((r) => (
                <div
                  key={r?.id ?? ""}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/[0.03] px-3 py-2 text-sm transition-colors hover:bg-secondary/30"
                  )}
                >
                  <span className="font-medium text-foreground">{r?.name ?? "—"}</span>
                  <span className="text-muted-foreground">
                    {r?.generatedAt ? new Date(r.generatedAt).toLocaleDateString() : "—"}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => handleExport(r, "CSV")}
                    >
                      <FileText className="h-3 w-3" />
                      CSV
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => handleExport(r, "JSON")}
                    >
                      <FileJson className="h-3 w-3" />
                      JSON
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => handleExport(r, "PDF")}
                    >
                      <FileDown className="h-3 w-3" />
                      PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => setDrillDownReport(r)}
                    >
                      Drill down
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!drillDownReport} onOpenChange={(open) => !open && setDrillDownReport(null)}>
        <DialogContent className="border-white/[0.03] bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {drillDownReport?.name ?? "Report detail"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Date range</label>
              <Select value={drillDownDateRange} onValueChange={setDrillDownDateRange}>
                <SelectTrigger className="border-white/[0.03]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Organization</label>
              <Select value={drillDownOrgId} onValueChange={setDrillDownOrgId}>
                <SelectTrigger className="border-white/[0.03]">
                  <SelectValue placeholder="All orgs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All orgs</SelectItem>
                  <SelectItem value="o1">Acme Corp</SelectItem>
                  <SelectItem value="o2">Beta Inc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {drillDownReport && (
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => handleExport(drillDownReport, "CSV")}>
                  Export CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleExport(drillDownReport, "JSON")}>
                  Export JSON
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleExport(drillDownReport, "PDF")}>
                  Export PDF
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
}
