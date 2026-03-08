/**
 * SettingsDataSecuritySection — Privacy, export, audit.
 */

import { AnimatedPage } from "@/components/animated-page";
import { PrivacyDataCard } from "./privacy-data-card";
import { DataExportCard } from "./data-export-card";
import { AuditTrailPanel } from "./audit-trail-panel";

export function SettingsDataSecuritySection() {
  return (
    <AnimatedPage className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <PrivacyDataCard />
        <DataExportCard />
      </div>
      <AuditTrailPanel />
    </AnimatedPage>
  );
}
