/**
 * SettingsIntegrationsSection — Integrations adapter list.
 */

import { AnimatedPage } from "@/components/animated-page";
import { IntegrationsCard } from "./integrations-card";

export function SettingsIntegrationsSection() {
  return (
    <AnimatedPage className="space-y-6">
      <IntegrationsCard />
    </AnimatedPage>
  );
}
