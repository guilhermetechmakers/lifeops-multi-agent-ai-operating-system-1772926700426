/**
 * PrivacyDataCard — Data retention, export controls, delete requests.
 * Guards for null/undefined on all data.
 */

import { Shield, Download, Trash2 } from "lucide-react";
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
import { useSettingsGlobal, useUpdateSettingsGlobal, useRequestExport } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const RETENTION_OPTIONS = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "1 year" },
  { value: "730", label: "2 years" },
  { value: "-1", label: "Indefinite" },
];

export function PrivacyDataCard() {
  const { data: global, isLoading } = useSettingsGlobal();
  const update = useUpdateSettingsGlobal();
  const requestExport = useRequestExport();

  const privacy = global?.privacy ?? null;
  const dataRetentionDays = privacy?.data_retention_days ?? 365;
  const exportConsent = privacy?.export_consent ?? true;
  const deleteRequestPending = privacy?.delete_request_pending ?? false;

  const handleRetentionChange = (value: string) => {
    const days = value === "-1" ? 365 * 10 : parseInt(value, 10);
    update.mutate({
      privacy: {
        ...privacy,
        data_retention_days: days,
        export_consent: privacy?.export_consent ?? true,
        delete_request_pending: privacy?.delete_request_pending ?? false,
      },
    });
  };

  const handleExportNow = () => {
    requestExport.mutate(undefined, {
      onSuccess: () => toast.success("Export requested. You will be notified when ready."),
    });
  };

  const handleDeleteRequest = () => {
    update.mutate({
      privacy: {
        ...privacy,
        data_retention_days: privacy?.data_retention_days ?? 365,
        export_consent: privacy?.export_consent ?? true,
        delete_request_pending: true,
      },
    });
    toast.success("Delete request submitted. Our team will process it within 30 days.");
  };

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          Privacy & data
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Data retention policy, export, and delete requests
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Data retention</Label>
          <Select
            value={String(dataRetentionDays > 365 * 5 ? "-1" : dataRetentionDays)}
            onValueChange={handleRetentionChange}
          >
            <SelectTrigger className="bg-secondary border-white/[0.03] w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(RETENTION_OPTIONS ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How long we keep your data before automatic deletion
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={handleExportNow}
            disabled={requestExport.isPending}
            className="border-white/[0.03]"
          >
            <Download className="mr-2 h-4 w-4" />
            Export my data
          </Button>
          {exportConsent && (
            <span className="text-xs text-muted-foreground self-center">
              Export consent enabled
            </span>
          )}
        </div>

        <div className="rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Delete my data</p>
                <p className="text-xs text-muted-foreground">
                  {deleteRequestPending
                    ? "Request pending. We will process within 30 days."
                    : "Submit a request to delete all your data."}
                </p>
              </div>
            </div>
            {!deleteRequestPending && (
              <Button
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={handleDeleteRequest}
              >
                Request deletion
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
