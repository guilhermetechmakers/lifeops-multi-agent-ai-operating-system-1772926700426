/**
 * Settings Integrations section: adapter list, credentials, test connection.
 */

import { AnimatedPage } from "@/components/animated-page";
import { IntegrationsCard } from "@/components/settings";

export default function SettingsIntegrationsPage() {
  return (
    <AnimatedPage className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect and manage adapters: LLM, GitHub, Plaid, Stripe, QuickBooks, Health APIs
        </p>
      </div>
      <IntegrationsCard />
    </AnimatedPage>
  );
}
