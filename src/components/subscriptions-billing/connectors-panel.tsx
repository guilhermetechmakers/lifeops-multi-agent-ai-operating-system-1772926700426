/**
 * ConnectorsPanel — Manage billing processors (Stripe, PayPal, etc.): status, connect/disconnect, last sync.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Connector } from "@/types/finance";

interface ConnectorsPanelProps {
  connectors: Connector[];
  isLoading?: boolean;
  onConnect?: (connectorId: string) => void;
  onDisconnect?: (connectorId: string) => void;
  onRefresh?: (connectorId: string) => void;
  onAddConnector?: () => void;
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

function getStatusBadge(status: Connector["status"]) {
  switch (status) {
    case "connected":
      return { variant: "success" as const, label: "Connected", icon: CheckCircle };
    case "error":
      return { variant: "destructive" as const, label: "Error", icon: AlertCircle };
    default:
      return { variant: "secondary" as const, label: "Disconnected", icon: XCircle };
  }
}

export function ConnectorsPanel({
  connectors,
  isLoading,
  onConnect,
  onDisconnect,
  onRefresh,
  onAddConnector,
  className,
}: ConnectorsPanelProps) {
  const items = Array.isArray(connectors) ? connectors : [];

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Billing Processors</CardTitle>
        <Button size="sm" variant="outline" className="gap-1" onClick={onAddConnector}>
          <Plus className="h-4 w-4" />
          Connect
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No connectors configured</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={onAddConnector}>
              Connect Billing Processor
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((conn) => {
              const badge = getStatusBadge(conn.status);
              const Icon = badge.icon;
              return (
                <div
                  key={conn.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] p-3 transition-all duration-200 hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{conn.type ?? "—"}</span>
                        <Badge variant={badge.variant} className="text-[10px]">
                          {badge.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last sync: {formatDate(conn.lastSync ?? conn.connectedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {conn.status === "connected" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => onRefresh?.(conn.id)}
                          aria-label="Refresh"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => onDisconnect?.(conn.id)}
                        >
                          Disconnect
                        </Button>
                      </>
                    )}
                    {conn.status === "disconnected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => onConnect?.(conn.id)}
                      >
                        Connect
                      </Button>
                    )}
                    {conn.status === "error" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => onConnect?.(conn.id)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
