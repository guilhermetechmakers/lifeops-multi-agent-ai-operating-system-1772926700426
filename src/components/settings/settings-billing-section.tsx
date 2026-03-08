/**
 * SettingsBillingSection — Billing summary.
 */

import { AnimatedPage } from "@/components/animated-page";
import { BillingSummaryCard } from "./billing-summary-card";

export function SettingsBillingSection() {
  return (
    <AnimatedPage className="space-y-6">
      <BillingSummaryCard />
    </AnimatedPage>
  );
}
