/**
 * Settings Integrations: adapter overview tiles, add adapter, list with test/run/rotate.
 */

import { useState } from "react";
import { AnimatedPage } from "@/components/animated-page";
import {
  IntegrationsCard,
  AdapterOverviewTiles,
  AddAdapterDialog,
  CredentialLinkDialog,
  AdapterTelemetryCard,
  RBACGuard,
} from "@/components/settings";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUpdateAdapter } from "@/hooks/use-adapters";
import type { AdapterInstance } from "@/types/adapters";

export default function SettingsIntegrationsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [credentialAdapter, setCredentialAdapter] = useState<AdapterInstance | null>(null);
  const updateAdapter = useUpdateAdapter();

  const handleLinkCredentials = (adapter: AdapterInstance) => {
    setCredentialAdapter(adapter);
  };

  const handleCredentialLinked = (credentialsRef: string) => {
    if (credentialAdapter) {
      updateAdapter.mutate({
        id: credentialAdapter.id,
        input: { credentialsRef },
      });
      setCredentialAdapter(null);
    }
  };

  return (
    <AnimatedPage className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Connect and manage adapters: LLM, GitHub, Plaid, Stripe, QuickBooks, Health APIs
          </p>
        </div>
        <RBACGuard roles={["admin", "member"]}>
          <Button
            onClick={() => setAddOpen(true)}
            className="transition-transform hover:scale-[1.02] shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add adapter
          </Button>
        </RBACGuard>
      </div>

      <AdapterOverviewTiles />

      <IntegrationsCard onLinkCredentials={handleLinkCredentials} />

      <AdapterTelemetryCard />

      <AddAdapterDialog open={addOpen} onOpenChange={setAddOpen} />

      <CredentialLinkDialog
        open={!!credentialAdapter}
        onOpenChange={(open) => !open && setCredentialAdapter(null)}
        adapterId={credentialAdapter?.id ?? null}
        adapterName={credentialAdapter?.name ?? ""}
        onLinked={handleCredentialLinked}
      />
    </AnimatedPage>
  );
}
