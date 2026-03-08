/**
 * IntegrationsPanel — Connectors with health status, last sync.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, RefreshCw } from "lucide-react";
import { useAdminIntegrations } from "@/hooks/use-admin";
import { AnimatedPage } from "@/components/animated-page";
import { cn } from "@/lib/utils";
import type { Integration } from "@/types/admin";

export function IntegrationsPanel() {
  const { integrations, isLoading } = useAdminIntegrations();

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Integrations & connectors</h2>
        <Button variant="outline" className="gap-2">
          <Plug className="h-4 w-4" />
          Add integration
        </Button>
      </div>

      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
        <CardHeader>
          <CardTitle>Connectors</CardTitle>
          <p className="text-sm text-muted-foreground">
            Health status, last sync, configuration
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (integrations ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.03] bg-secondary/30 px-6 py-12 text-center">
              <Plug className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No integrations configured.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(integrations ?? []).map((i: Integration) => (
                <div
                  key={i?.id ?? ""}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] px-4 py-3 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <Plug className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium capitalize">{i?.type ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        Last sync: {i?.lastSyncAt ? new Date(i.lastSyncAt).toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        i?.health === "ok" && "bg-teal/20 text-teal",
                        i?.health === "warn" && "bg-amber/20 text-amber",
                        i?.health === "error" && "bg-[#FF3B30]/20 text-[#FF3B30]"
                      )}
                    >
                      {i?.health ?? "—"}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
