/**
 * CREnginePanel — Card-style container for Conflict Resolution Engine configuration and status.
 * LifeOps design system; dark elevated cards, 8px grid.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CREnginePanelProps {
  /** Engine status: idle, resolving, ready */
  status?: "idle" | "resolving" | "ready";
  /** Count of active (open) conflicts */
  activeConflicts?: number;
  /** Count of resolutions in last 24h */
  recentResolutions?: number;
  /** Last resolution timestamp */
  lastResolvedAt?: string;
  className?: string;
}

export function CREnginePanel({
  status = "idle",
  activeConflicts = 0,
  recentResolutions = 0,
  lastResolvedAt,
  className,
}: CREnginePanelProps) {
  const statusConfig = {
    idle: { label: "Idle", variant: "secondary" as const, icon: Cpu },
    resolving: { label: "Resolving", variant: "warning" as const, icon: Cpu },
    ready: { label: "Ready", variant: "success" as const, icon: CheckCircle2 },
  };

  const config = statusConfig[status] ?? statusConfig.idle;
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          Conflict Resolution Engine
        </CardTitle>
        <Badge variant={config.variant} className="gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Active conflicts</p>
            <p className="text-xl font-bold text-foreground">{activeConflicts}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Resolved (24h)</p>
            <p className="text-xl font-bold text-foreground">{recentResolutions}</p>
          </div>
        </div>
        {lastResolvedAt != null && (
          <p className="text-xs text-muted-foreground">
            Last resolved: {new Date(lastResolvedAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
