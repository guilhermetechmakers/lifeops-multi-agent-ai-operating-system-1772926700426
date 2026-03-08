import { Plug, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Integration } from "@/types/profile";
import { formatDistanceToNow } from "date-fns";

const PROVIDER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Plug,
  openai: Plug,
  stripe: Plug,
  plaid: Plug,
  quickbooks: Plug,
};

export interface IntegrationCardProps {
  integration: Integration;
  onConnect?: (provider: string) => void;
  onDisconnect?: (provider: string) => void;
  isConnecting?: boolean;
  isDisconnecting?: boolean;
}

export function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  isConnecting = false,
  isDisconnecting = false,
}: IntegrationCardProps) {
  const Icon = PROVIDER_ICONS[integration.provider] ?? Plug;
  const displayName = integration.displayName ?? integration.provider;
  const isConnected = integration.status === "connected";
  const isError = integration.status === "error";

  const statusVariant = isConnected ? "success" : isError ? "destructive" : "secondary";
  const StatusIcon = isConnected ? CheckCircle : isError ? AlertCircle : XCircle;

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{displayName}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusVariant} className="text-xs">
                <StatusIcon className="h-3 w-3 mr-1" />
                {integration.status}
              </Badge>
              {integration.lastSyncedAt && (
                <span className="text-xs text-muted-foreground">
                  Synced {formatDistanceToNow(new Date(integration.lastSyncedAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDisconnect?.(integration.provider)}
              disabled={isDisconnecting}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {isDisconnecting ? "..." : "Disconnect"}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onConnect?.(integration.provider)}
              disabled={isConnecting}
            >
              {isConnecting ? "..." : "Connect"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
