/**
 * Profile Integrations panel: list of adapters with re-test and rotate credentials.
 * Uses useAdapters and useAdaptersHealth; guards all arrays.
 */

import { Link } from "react-router-dom";
import { Plug, RefreshCw, Key, Loader2, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useAdapters,
  useAdaptersHealth,
  useTestAdapter,
  useRotateCredential,
} from "@/hooks/use-adapters";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import type { HealthStatusValue } from "@/types/adapters";

const HEALTH_ICONS: Record<HealthStatusValue, React.ComponentType<{ className?: string }>> = {
  healthy: CheckCircle,
  degraded: AlertCircle,
  unhealthy: XCircle,
};

function getHealthStatus(
  adapterId: string,
  healthList: { adapterId: string; status: string }[]
): HealthStatusValue {
  const h = healthList.find((x) => x.adapterId === adapterId);
  if (!h) return "unhealthy";
  return h.status as HealthStatusValue;
}

export function IntegrationsPanel() {
  const { items: adapters, isLoading } = useAdapters();
  const { items: healthList } = useAdaptersHealth();
  const testAdapter = useTestAdapter();
  const rotateCredential = useRotateCredential();

  const list = adapters ?? [];
  const health = healthList ?? [];

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
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
        <CardTitle>Connected Integrations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Adapter status and actions. Manage adapters in Settings → Integrations.
        </p>
      </CardHeader>
      <CardContent>
        {list.length > 0 ? (
          <div className="space-y-3">
            {(list ?? []).map((adapter) => {
              const status = getHealthStatus(adapter.id, health);
              const Icon = HEALTH_ICONS[status] ?? XCircle;
              const hasCreds = (adapter.credentialsRef ?? "").length > 0;
              const statusVariant =
                status === "healthy" ? "success" : status === "degraded" ? "warning" : "secondary";

              return (
                <div
                  key={adapter.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-white/[0.03] bg-secondary/50 p-4 transition-all duration-200"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background">
                      <Plug className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{adapter.name ?? adapter.id}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant={statusVariant} className="text-xs">
                          <Icon className="h-3 w-3 mr-1" />
                          {status}
                        </Badge>
                        {adapter.updatedAt && (
                          <span className="text-xs text-muted-foreground">
                            Updated{" "}
                            {formatDistanceToNow(new Date(adapter.updatedAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testAdapter.mutate(adapter.id)}
                      disabled={testAdapter.isPending}
                      className="border-white/[0.03]"
                      aria-label={`Re-test ${adapter.name}`}
                    >
                      {testAdapter.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Re-test
                        </>
                      )}
                    </Button>
                    {hasCreds && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotateCredential.mutate(adapter.id)}
                        disabled={rotateCredential.isPending}
                        className="border-white/[0.03]"
                        aria-label={`Rotate credentials for ${adapter.name}`}
                      >
                        {rotateCredential.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Key className="h-4 w-4 mr-1" />
                            Rotate credentials
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground pt-2">
              <Link
                to="/dashboard/settings/integrations"
                className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Add or manage adapters in Settings →
              </Link>
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/[0.08] p-8 text-center">
            <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No adapters configured</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add adapters in Settings → Integrations to connect LLM, GitHub, Stripe, and more
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4 border-white/[0.03]">
              <Link to="/dashboard/settings/integrations">Go to Settings</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
