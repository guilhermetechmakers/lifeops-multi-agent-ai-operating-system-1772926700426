/**
 * ReportsExportPanel — Create/edit scheduling, generate on-demand, export PDF/CSV.
 * Guards: (templates ?? []), (scheduled ?? []).
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileDown, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReportTemplates, useScheduledReports, useGenerateReport, useScheduleReport } from "@/hooks/use-analytics";
import type { ReportTemplate, ScheduledReport } from "@/types/analytics";
import { toast } from "sonner";

const CADENCE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

const FORMAT_OPTIONS = [
  { value: "PDF", label: "PDF" },
  { value: "CSV", label: "CSV" },
] as const;

export interface ReportsExportPanelProps {
  className?: string;
}

export function ReportsExportPanel({ className }: ReportsExportPanelProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [format, setFormat] = useState<"PDF" | "CSV">("CSV");
  const [cadence, setCadence] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [timezone, setTimezone] = useState("UTC");

  const { templates = [], isLoading: templatesLoading } = useReportTemplates();
  const { scheduled = [], isLoading: scheduledLoading } = useScheduledReports();
  const generateReport = useGenerateReport();
  const scheduleReport = useScheduleReport();

  const templateList = Array.isArray(templates) ? templates : [];
  const scheduledList = Array.isArray(scheduled) ? scheduled : [];

  const handleGenerate = () => {
    const templateId = selectedTemplateId || templateList[0]?.id;
    if (!templateId) {
      toast.error("Select a report template");
      return;
    }
    generateReport.mutate({ type: templateId, format });
  };

  const handleSchedule = () => {
    const templateId = selectedTemplateId || templateList[0]?.id;
    if (!templateId) {
      toast.error("Select a report template");
      return;
    }
    scheduleReport.mutate({ templateId, cadence, timezone });
  };

  const isLoading = templatesLoading || scheduledLoading;

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="card-health">
        <CardHeader>
          <CardTitle className="text-base">Export reports</CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate on-demand or schedule recurring reports (PDF/CSV)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Template</label>
              <Select
                value={selectedTemplateId ? selectedTemplateId : (templateList[0]?.id ?? "")}
                onValueChange={setSelectedTemplateId}
                disabled={templateList.length === 0}
              >
                <SelectTrigger className="w-[200px] bg-card border-white/[0.03]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {(templateList ?? []).map((t: ReportTemplate) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name ?? t.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Format</label>
              <Select value={format} onValueChange={(v) => setFormat(v as "PDF" | "CSV")}>
                <SelectTrigger className="w-[100px] bg-card border-white/[0.03]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(FORMAT_OPTIONS as readonly { value: string; label: string }[]).map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generateReport.isPending || templateList.length === 0}
              className="gap-2"
            >
              {generateReport.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Generate report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-health">
        <CardHeader>
          <CardTitle className="text-base">Schedule report</CardTitle>
          <p className="text-sm text-muted-foreground">
            Daily, weekly, or monthly with time zone
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Template</label>
              <Select
                value={selectedTemplateId ? selectedTemplateId : (templateList[0]?.id ?? "")}
                onValueChange={setSelectedTemplateId}
                disabled={templateList.length === 0}
              >
                <SelectTrigger className="w-[200px] bg-card border-white/[0.03]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {(templateList ?? []).map((t: ReportTemplate) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name ?? t.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Cadence</label>
              <Select value={cadence} onValueChange={(v) => setCadence(v as "daily" | "weekly" | "monthly")}>
                <SelectTrigger className="w-[120px] bg-card border-white/[0.03]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(CADENCE_OPTIONS as readonly { value: string; label: string }[]).map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Timezone</label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-[120px] bg-card border-white/[0.03]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">ET</SelectItem>
                  <SelectItem value="Europe/London">GMT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSchedule}
              disabled={scheduleReport.isPending || templateList.length === 0}
              variant="secondary"
              className="gap-2"
            >
              {scheduleReport.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-health">
        <CardHeader>
          <CardTitle className="text-base">Scheduled reports</CardTitle>
          <p className="text-sm text-muted-foreground">
            Recurring reports and next run
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary/50" />
              ))}
            </div>
          ) : scheduledList.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No scheduled reports. Create one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {(scheduledList ?? []).map((s: ScheduledReport) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.03] p-3"
                >
                  <span className="font-medium">{s.templateName ?? s.templateId}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {s.cadence}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Next: {s.nextRun ? new Date(s.nextRun).toLocaleString() : "—"}
                    </span>
                    {s.enabled && (
                      <Badge variant="default" className="text-xs bg-teal/20 text-teal border-0">
                        Active
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
