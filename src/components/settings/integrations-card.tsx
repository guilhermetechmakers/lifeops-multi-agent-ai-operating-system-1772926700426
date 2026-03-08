/**
 * IntegrationsCard — Adapter list with status, credential management, test connection.
 * Uses settings API IntegrationAdapter[]; guards (adapters ?? []).
 */

import { Plug, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettingsIntegrations, useConnectIntegration, useTestIntegration } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import type { IntegrationAdapter } from "@/types/settings";
import { cn } from "@/lib/utils";

const ADAPTER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  llm: Plug,
  github: Plug,
  plaid: Plug,
  stripe: Plug,
  quickbooks: Plug,
  health: Plug,
};

export function IntegrationsCard() {
  const { items: adapters, isLoading } = useSettingsIntegrations();
  const connect = useConnectIntegration();
  const test = useTestIntegration();

  const list = adapters ?? [];

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-muted-foreground" />
          Integrations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          LLM, GitHub, Plaid, Stripe, QuickBooks, Health APIs. Connect and test.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {list.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/[0.08] p-8 text-center">
            <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No adapters configured</p>
            <p className="text-sm text-muted-foreground mt-1">
              Integrations will appear here when available
            </p>
          </div>
        ) : (
          (list ?? []).map((adapter: IntegrationAdapter) => {
            const Icon = ADAPTER_ICONS[adapter.type] ?? Plug;
            const isConnected = adapter.status === "connected";
            const isError = adapter.status === "error";
            const StatusIcon = isConnected ? CheckCircle : isError ? AlertCircle : XCircle;
            const statusVariant = isConnected ? "default" : isError ? "destructive" : "secondary";
            const isTesting = test.isPending;

            return (
              <div
                key={adapter.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-white/[0.03] bg-secondary/50 p-4 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{adapter.name ?? adapter.id}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {adapter.description ?? adapter.type}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant={statusVariant} className="text-xs">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {adapter.status}
                      </Badge>
                      {adapter.last_connected && (
                        <span className="text-xs text-muted-foreground">
                          Last connected{" "}
                          {formatDistanceToNow(new Date(adapter.last_connected), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isConnected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => test.mutate(adapter.id)}
                      disabled={isTesting}
                      className="border-white/[0.03]"
                    >
                      {isTesting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Test connection"
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => connect.mutate({ id: adapter.id, credentials: {} })}
                      disabled={connect.isPending}
                      className={cn("transition-transform hover:scale-[1.02]")}
                    >
                      {connect.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
