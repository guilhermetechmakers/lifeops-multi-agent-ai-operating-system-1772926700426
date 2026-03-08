/**
 * Data & Security section: privacy, export, audit trail.
 */

import { AnimatedPage } from "@/components/animated-page";
import { PrivacyDataCard, DataExportCard, AuditTrailPanel } from "@/components/settings";

export default function SettingsDataSecurityPage() {
  return (
    <AnimatedPage className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Data & security</h2>
        <p className="text-sm text-muted-foreground">
          Privacy, data export, and audit trail
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-1">
        <PrivacyDataCard />
        <DataExportCard />
        <AuditTrailPanel />
      </div>
    </AnimatedPage>
  );
}
