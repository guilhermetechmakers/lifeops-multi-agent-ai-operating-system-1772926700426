/**
 * IntegrationsCard — Adapter list from adapters API with status, test, run, rotate.
 * Uses useAdapters, useAdaptersHealth; guards (adapters ?? []).
 */

import {
  Plug,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Play,
  Key,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAdapters,
  useAdaptersHealth,
  useTestAdapter,
  useRunAdapter,
  useRotateCredential,
  useUpdateAdapter,
  useDeleteAdapter,
} from "@/hooks/use-adapters";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { AdapterInstance } from "@/types/adapters";

const ADAPTER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  llm: Plug,
  github: Plug,
  plaid: Plug,
  stripe: Plug,
  quickbooks: Plug,
  health: Plug,
};

function getStatusFromHealth(
  adapterId: string,
  healthList: { adapterId: string; status: string }[]
): "healthy" | "degraded" | "unhealthy" {
  const h = healthList.find((x) => x.adapterId === adapterId);
  if (!h) return "unhealthy";
  return h.status as "healthy" | "degraded" | "unhealthy";
}

export interface IntegrationsCardProps {
  onLinkCredentials?: (adapter: AdapterInstance) => void;
}

export function IntegrationsCard({ onLinkCredentials }: IntegrationsCardProps) {
  const { items: adapters, isLoading } = useAdapters();
  const { items: healthList } = useAdaptersHealth();
  const testAdapter = useTestAdapter();
  const runAdapter = useRunAdapter();
  const rotateCredential = useRotateCredential();
  const updateAdapter = useUpdateAdapter();
  const deleteAdapter = useDeleteAdapter();

  const list = adapters ?? [];
  const health = healthList ?? [];

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
          LLM, GitHub, Plaid, Stripe, QuickBooks, Health APIs. Test, run, rotate credentials.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {list.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/[0.08] p-8 text-center">
            <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No adapters configured</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add an adapter above to get started
            </p>
          </div>
        ) : (
          (list ?? []).map((adapter: AdapterInstance) => {
            const Icon = ADAPTER_ICONS[adapter.type] ?? Plug;
            const healthStatus = getStatusFromHealth(adapter.id, health);
            const isHealthy = healthStatus === "healthy";
            const isDegraded = healthStatus === "degraded";
            const hasCreds = (adapter.credentialsRef ?? "").length > 0;
            const StatusIcon = isHealthy ? CheckCircle : isDegraded ? AlertCircle : XCircle;
            const statusVariant = isHealthy ? "success" : isDegraded ? "warning" : "secondary";

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
                      {adapter.type} {!adapter.enabled && "· disabled"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant={statusVariant} className="text-xs">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {healthStatus}
                      </Badge>
                      {adapter.updatedAt && (
                        <span className="text-xs text-muted-foreground">
                          Updated {formatDistanceToNow(new Date(adapter.updatedAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {hasCreds ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testAdapter.mutate(adapter.id)}
                        disabled={testAdapter.isPending}
                        className="border-white/[0.03]"
                        title="Test connection"
                      >
                        {testAdapter.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Test"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runAdapter.mutate({ id: adapter.id, payload: {} })}
                        disabled={runAdapter.isPending}
                        className="border-white/[0.03]"
                        title="Run sample"
                      >
                        {runAdapter.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Run
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotateCredential.mutate(adapter.id)}
                        disabled={rotateCredential.isPending}
                        className="border-white/[0.03]"
                        title="Rotate credentials"
                      >
                        {rotateCredential.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Key className="h-4 w-4 mr-1" />
                            Rotate
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onLinkCredentials?.(adapter)}
                      className={cn("border-white/[0.03] transition-transform hover:scale-[1.02]")}
                    >
                      <Key className="h-4 w-4 mr-1" />
                      Link credentials
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" aria-label="More actions" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-white/[0.03] bg-card">
                      <DropdownMenuItem onClick={() => onLinkCredentials?.(adapter)}>
                        Link credentials
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          updateAdapter.mutate({
                            id: adapter.id,
                            input: { enabled: !adapter.enabled },
                          })
                        }
                      >
                        {adapter.enabled ? "Disable" : "Enable"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => deleteAdapter.mutate(adapter.id)}
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
