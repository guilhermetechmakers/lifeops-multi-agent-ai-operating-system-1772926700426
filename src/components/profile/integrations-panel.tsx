import { Plug } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationCard } from "./integration-card";
import { useIntegrations, useConnectIntegration, useDisconnectIntegration } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";

export function IntegrationsPanel() {
  const { items, isLoading } = useIntegrations();
  const connect = useConnectIntegration();
  const disconnect = useDisconnectIntegration();

  const integrations = items ?? [];

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
    <Card className="border-white/[0.03] bg-card">
      <CardHeader>
        <CardTitle>Connected Integrations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect LLM providers, GitHub, Stripe, Plaid, and more
        </p>
      </CardHeader>
      <CardContent>
        {integrations.length > 0 ? (
          <div className="space-y-3">
            {integrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={(p) => connect.mutate(p)}
                onDisconnect={(p) => disconnect.mutate(p)}
                isConnecting={connect.isPending}
                isDisconnecting={disconnect.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/[0.08] p-8 text-center">
            <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No integrations connected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your first integration to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
