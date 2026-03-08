/**
 * IntegrationCard — provider type, status badge, last run, health score, quick actions.
 */

import { Play, FileText, RefreshCw, Settings, GitBranch, Zap, Server } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectorStatusPanel } from "./connector-status-panel";
import { TestTriggerBar } from "./test-trigger-bar";
import { HealthMetricsPanel } from "./health-metrics-panel";
import { cn } from "@/lib/utils";
import type { Integration, Connector } from "@/types/integrations";

export interface IntegrationCardProps {
  integration: Integration;
  connectors?: Connector[];
  onTestTrigger?: () => void;
  onViewLogs?: () => void;
  onRerun?: () => void;
  onEdit?: () => void;
  isRunning?: boolean;
  className?: string;
}

const TYPE_ICONS: Record<string, typeof GitBranch> = {
  git: GitBranch,
  ci: Zap,
  deploy: Server,
};

const STATUS_VARIANTS: Record<string, "success" | "destructive" | "secondary" | "outline"> = {
  active: "success",
  inactive: "secondary",
  error: "destructive",
  unknown: "outline",
};

function formatRelativeTime(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffM = Math.floor(diffMs / 60000);
    if (diffM < 60) return `${diffM}m ago`;
    const diffH = Math.floor(diffM / 60);
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d ago`;
  } catch {
    return "—";
  }
}

export function IntegrationCard({
  integration,
  connectors = [],
  onTestTrigger,
  onViewLogs,
  onRerun,
  onEdit,
  isRunning = false,
  className,
}: IntegrationCardProps) {
  const Icon = TYPE_ICONS[integration.type] ?? Zap;
  const statusVariant = STATUS_VARIANTS[integration.status] ?? "outline";

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-all hover:shadow-card-hover", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/50">
              <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">{integration.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {integration.provider} · Last run {formatRelativeTime(integration.lastRunAt)}
              </p>
            </div>
          </div>
          <Badge variant={statusVariant} className="shrink-0 capitalize">
            {integration.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <HealthMetricsPanel healthScore={integration.healthScore} />
        <ConnectorStatusPanel connectors={connectors} />
        <TestTriggerBar
          integrationId={integration.id}
          onTriggerRun={onTestTrigger}
          onFetchLogs={onViewLogs}
          onReplayWebhook={onRerun}
          isRunning={isRunning}
        />
        <div className="flex flex-wrap gap-2">
          {onTestTrigger && (
            <Button
              variant="default"
              size="sm"
              className="gap-1.5"
              onClick={onTestTrigger}
              disabled={isRunning}
              aria-label={`Trigger test for ${integration.name}`}
            >
              <Play className="h-4 w-4" />
              Test
            </Button>
          )}
          {onViewLogs && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-white/[0.03]"
              onClick={onViewLogs}
              aria-label={`View logs for ${integration.name}`}
            >
              <FileText className="h-4 w-4" />
              Logs
            </Button>
          )}
          {onRerun && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-white/[0.03]"
              onClick={onRerun}
              aria-label={`Rerun ${integration.name}`}
            >
              <RefreshCw className="h-4 w-4" />
              Rerun
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-white/[0.03]"
              onClick={onEdit}
              aria-label={`Edit ${integration.name}`}
            >
              <Settings className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
