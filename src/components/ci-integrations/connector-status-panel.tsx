/**
 * ConnectorStatusPanel — webhook status, token validity, recent errors, retry hints.
 */

import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Connector } from "@/types/integrations";

export interface ConnectorStatusPanelProps {
  connectors: Connector[];
  onRetry?: () => void;
  className?: string;
}

const TOKEN_STATUS_CONFIG: Record<
  string,
  { icon: typeof CheckCircle; variant: "success" | "destructive" | "warning"; label: string }
> = {
  valid: { icon: CheckCircle, variant: "success", label: "Valid" },
  invalid: { icon: XCircle, variant: "destructive", label: "Invalid" },
  expired: { icon: AlertCircle, variant: "warning", label: "Expired" },
};

export function ConnectorStatusPanel({
  connectors,
  onRetry,
  className,
}: ConnectorStatusPanelProps) {
  const list = connectors ?? [];
  if (list.length === 0) return null;

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Connector Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(list as Connector[]).map((conn) => {
          const config = TOKEN_STATUS_CONFIG[conn.tokenStatus] ?? TOKEN_STATUS_CONFIG.invalid;
          const Icon = config.icon;
          return (
            <div
              key={conn.id}
              className="flex items-center justify-between gap-2 rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    config.variant === "success" && "text-teal",
                    config.variant === "destructive" && "text-destructive",
                    config.variant === "warning" && "text-amber"
                  )}
                  aria-hidden
                />
                <span className="text-sm text-foreground truncate">{conn.provider}</span>
                <Badge variant={config.variant === "success" ? "success" : config.variant === "destructive" ? "destructive" : "warning"} className="shrink-0">
                  {config.label}
                </Badge>
              </div>
              {conn.errorCount > 0 && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {conn.errorCount} error{conn.errorCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          );
        })}
        {list.some((c) => c.errorCount > 0) && onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 border-white/[0.03]"
            onClick={onRetry}
            aria-label="Retry failed connectors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
