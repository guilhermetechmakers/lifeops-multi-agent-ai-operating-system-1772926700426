/**
 * SettingsBillingPage — plan, usage, invoices.
 */

import { AnimatedPage } from "@/components/animated-page";
import { BillingPanel } from "@/components/profile/billing-panel";

export function SettingsBillingPage() {
  return (
    <AnimatedPage>
      <BillingPanel />
    </AnimatedPage>
  );
}
