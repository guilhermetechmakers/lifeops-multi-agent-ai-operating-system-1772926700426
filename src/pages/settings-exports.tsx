/**
 * Settings Exports section: data export card and audit trail.
 */

import { AnimatedPage } from "@/components/animated-page";
import { DataExportCard, AuditTrailPanel } from "@/components/settings";

export default function SettingsExportsPage() {
  return (
    <AnimatedPage className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Exports</h2>
        <p className="text-sm text-muted-foreground">
          Export your data and view audit history
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-1">
        <DataExportCard />
        <AuditTrailPanel />
      </div>
    </AnimatedPage>
  );
}
