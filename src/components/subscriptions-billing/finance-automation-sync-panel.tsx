/**
 * FinanceAutomationSyncPanel — Inline status for transaction ingestion, categorization, anomalies feed.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IngestionStatusBilling } from "@/types/finance";

interface FinanceAutomationSyncPanelProps {
  status: IngestionStatusBilling;
  isLoading?: boolean;
  onSync?: () => void;
  className?: string;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function FinanceAutomationSyncPanel({
  status,
  isLoading,
  onSync,
  className,
}: FinanceAutomationSyncPanelProps) {
  const s = status?.status ?? "idle";
  const lastRun = status?.lastRun;
  const newCount = status?.newCount ?? 0;
  const updatedCount = status?.updatedCount ?? 0;
  const error = status?.error;

  const statusConfig = {
    idle: { label: "Idle", variant: "secondary" as const, icon: RefreshCw },
    running: { label: "Syncing", variant: "warning" as const, icon: Loader2 },
    completed: { label: "Synced", variant: "success" as const, icon: CheckCircle },
    failed: { label: "Failed", variant: "destructive" as const, icon: AlertCircle },
  };
  const config = statusConfig[s] ?? statusConfig.idle;
  const Icon = config.icon;

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Finance Automation</CardTitle>
        <p className="text-xs text-muted-foreground">
          Transaction ingestion & categorization
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-20 animate-pulse rounded-lg bg-secondary" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {s === "running" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-amber" />
                ) : (
                  <Icon className="h-4 w-4 text-muted-foreground" />
                )}
                <Badge variant={config.variant} className="text-[10px]">
                  {config.label}
                </Badge>
              </div>
              {s !== "running" && onSync && (
                <button
                  type="button"
                  onClick={onSync}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sync now
                </button>
              )}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Last run: {formatDate(lastRun)}</p>
              <p>New: {newCount} · Updated: {updatedCount}</p>
              {error && (
                <p className="text-destructive mt-1">{error}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
