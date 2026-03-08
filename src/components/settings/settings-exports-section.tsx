/**
 * SettingsExportsSection — Data export.
 */

import { AnimatedPage } from "@/components/animated-page";
import { DataExportCard } from "./data-export-card";

export function SettingsExportsSection() {
  return (
    <AnimatedPage className="space-y-6">
      <DataExportCard />
    </AnimatedPage>
  );
}
