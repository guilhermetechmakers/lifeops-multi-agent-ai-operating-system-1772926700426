/**
 * SettingsDashboard — Global settings overview.
 * NotificationPreferences, PrivacyData, TeamRBAC, AutopilotDefaults.
 */

import { AnimatedPage } from "@/components/animated-page";
import { NotificationPreferencesCard } from "./notification-preferences-card";
import { PrivacyDataCard } from "./privacy-data-card";
import { TeamRBACCard } from "./team-rbac-card";
import { AutopilotDefaultsCard } from "./autopilot-defaults-card";

export function SettingsDashboard() {
  return (
    <AnimatedPage className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <NotificationPreferencesCard />
        <PrivacyDataCard />
        <TeamRBACCard />
        <AutopilotDefaultsCard />
      </div>
    </AnimatedPage>
  );
}
