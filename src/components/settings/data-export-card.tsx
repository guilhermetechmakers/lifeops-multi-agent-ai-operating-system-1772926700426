/**
 * DataExportCard — Export history, export options, scheduling.
 * Guards: (history ?? []).map(...)
 */

import { FileDown, Calendar, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsGlobal, useUpdateSettingsGlobal, useExportHistory, useRequestExport, useScheduleExport } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const TZ_OPTIONS = [
  { value: "America/New_York", label: "Eastern" },
  { value: "America/Los_Angeles", label: "Pacific" },
  { value: "Europe/London", label: "London" },
  { value: "UTC", label: "UTC" },
];

export function DataExportCard() {
  const { data: global, isLoading: globalLoading } = useSettingsGlobal();
  const update = useUpdateSettingsGlobal();
  const { items: history, isLoading: historyLoading } = useExportHistory();
  const requestExport = useRequestExport();
  const scheduleExport = useScheduleExport();

  const dataExport = global?.data_export ?? null;
  const scheduleEnabled = dataExport?.schedule_enabled ?? false;
  const scheduleFrequency = dataExport?.schedule_frequency ?? "weekly";
  const timezone = dataExport?.timezone ?? "America/New_York";

  const exportList = history ?? [];

  const handleToggleSchedule = (checked: boolean) => {
    update.mutate({
      data_export: {
        ...dataExport,
        schedule_enabled: checked,
        schedule_frequency: dataExport?.schedule_frequency ?? "weekly",
        timezone: dataExport?.timezone ?? "America/New_York",
        last_export_at: dataExport?.last_export_at ?? null,
      },
    });
    toast.success(checked ? "Scheduled export enabled" : "Scheduled export disabled");
  };

  const handleScheduleSave = () => {
    scheduleExport.mutate(
      { frequency: scheduleFrequency as "weekly" | "monthly", timezone },
      {
        onSuccess: () => {
          update.mutate({
            data_export: {
              ...dataExport,
              schedule_enabled: true,
              schedule_frequency: scheduleFrequency,
              timezone,
              last_export_at: dataExport?.last_export_at ?? null,
            },
          });
        },
      }
    );
  };

  const handleExportNow = () => {
    requestExport.mutate(undefined, {
      onSuccess: () => toast.success("Export requested. You will be notified when ready."),
    });
  };

  const isLoading = globalLoading || historyLoading;

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5 text-muted-foreground" />
          Data export
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Export your data now or schedule recurring exports
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={handleExportNow} disabled={requestExport.isPending}>
            <Download className="mr-2 h-4 w-4" />
            Export now
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Scheduled exports</p>
              <p className="text-xs text-muted-foreground">Automatically export data on a schedule</p>
            </div>
          </div>
          <Switch
            checked={scheduleEnabled}
            onCheckedChange={handleToggleSchedule}
            aria-label="Toggle scheduled export"
          />
        </div>

        {scheduleEnabled && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={scheduleFrequency}
                  onValueChange={(v) =>
                    update.mutate({
                      data_export: {
                        ...dataExport,
                        schedule_frequency: v as "weekly" | "monthly",
                        schedule_enabled: true,
                        timezone: dataExport?.timezone ?? "America/New_York",
                        last_export_at: dataExport?.last_export_at ?? null,
                      },
                    })
                  }
                >
                  <SelectTrigger className="bg-secondary border-white/[0.03]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={(v) =>
                  update.mutate({
                    data_export: {
                      ...dataExport,
                      timezone: v,
                      schedule_frequency: dataExport?.schedule_frequency ?? "weekly",
                      schedule_enabled: true,
                      last_export_at: dataExport?.last_export_at ?? null,
                    },
                  })
                }>
                  <SelectTrigger className="bg-secondary border-white/[0.03]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(TZ_OPTIONS ?? []).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleScheduleSave} className="border-white/[0.03]">
              Save schedule
            </Button>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Export history</h4>
          {exportList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exports yet.</p>
          ) : (
            <ul className="space-y-2" role="list">
              {(exportList ?? []).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.status} · {item.format}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {item.download_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={item.download_url} download>
                        Download
                      </a>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
