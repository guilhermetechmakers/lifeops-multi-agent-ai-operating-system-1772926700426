/**
 * ReportsExportPanel — Month-end report exports (PDF/CSV) with metadata and history.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportArtifact } from "@/types/forecasting";

interface ReportsExportPanelProps {
  period: string;
  onPeriodChange?: (period: string) => void;
  artifacts: ReportArtifact[];
  isLoading?: boolean;
  onExport: (payload: { period: string; format: "pdf" | "csv" }) => void;
  isExporting?: boolean;
  className?: string;
}

function getMonthOptions(): Array<{ value: string; label: string }> {
  const opts: Array<{ value: string; label: string }> = [];
  const d = new Date();
  for (let i = 0; i < 12; i++) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const val = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    opts.push({ value: val, label: m.toLocaleDateString("en-US", { month: "short", year: "numeric" }) });
  }
  return opts;
}

export function ReportsExportPanel({
  period,
  onPeriodChange,
  artifacts,
  isLoading,
  onExport,
  isExporting,
  className,
}: ReportsExportPanelProps) {
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [includeAudit] = useState(true);
  const monthOptions = getMonthOptions();

  const safeArtifacts = Array.isArray(artifacts) ? artifacts : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FileDown className="h-5 w-5 text-amber" />
          Report Exports
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Generate month-end reports with audit trail
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="export-period" className="text-xs">
              Period
            </Label>
            <Select
              value={period}
              onValueChange={(v) => onPeriodChange?.(v)}
            >
              <SelectTrigger id="export-period" className="h-9">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-format" className="text-xs">
              Format
            </Label>
            <Select
              value={format}
              onValueChange={(v) => setFormat(v as "pdf" | "csv")}
            >
              <SelectTrigger id="export-format" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </span>
                </SelectItem>
                <SelectItem value="csv">
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => onExport({ period, format })}
          disabled={isExporting}
          aria-busy={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting…
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Export {format.toUpperCase()} Report
            </>
          )}
        </Button>

        {includeAudit && (
          <p className="text-xs text-muted-foreground">
            Audit trail and data provenance will be included.
          </p>
        )}

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Export history</Label>
          {isLoading ? (
            <div className="h-16 animate-pulse rounded-lg bg-secondary/50" />
          ) : safeArtifacts.length === 0 ? (
            <div className="rounded-lg border border-white/[0.03] bg-secondary/30 py-6 text-center">
              <FileDown className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No exports yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {safeArtifacts.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {a.type === "pdf" ? (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      {a.period} · {a.type.toUpperCase()}
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        a.status === "ready" && "text-teal",
                        a.status === "in_progress" && "text-amber",
                        a.status === "failed" && "text-destructive"
                      )}
                    >
                      {a.status}
                    </span>
                  </div>
                  {a.status === "ready" && a.url && (
                    <a
                      href={a.url}
                      download
                      className="text-xs text-teal hover:underline"
                    >
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
