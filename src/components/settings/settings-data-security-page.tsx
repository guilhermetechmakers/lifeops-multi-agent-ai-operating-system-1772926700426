/**
 * SettingsDataSecurityPage — privacy, export, audit trail.
 */

import { AnimatedPage } from "@/components/animated-page";
import { PrivacyDataCard } from "./privacy-data-card";
import { DataExportCard } from "./data-export-card";
import { AuditTrailPanel } from "./audit-trail-panel";

export function SettingsDataSecurityPage() {
  return (
    <AnimatedPage className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <PrivacyDataCard />
        <DataExportCard />
        <AuditTrailPanel />
      </div>
    </AnimatedPage>
  );
}
