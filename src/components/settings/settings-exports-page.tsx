/**
 * SettingsExportsPage — export history and scheduling.
 */

import { AnimatedPage } from "@/components/animated-page";
import { DataExportCard } from "./data-export-card";
import { AuditTrailPanel } from "./audit-trail-panel";

export function SettingsExportsPage() {
  return (
    <AnimatedPage className="space-y-6">
      <DataExportCard />
      <AuditTrailPanel />
    </AnimatedPage>
  );
}
