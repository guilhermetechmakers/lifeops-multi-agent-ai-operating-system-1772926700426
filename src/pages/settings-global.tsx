/**
 * Global Settings section: notifications, privacy, team/RBAC, autopilot, data export, profile link.
 */

import { AnimatedPage } from "@/components/animated-page";
import {
  NotificationPreferencesCard,
  PrivacyDataCard,
  TeamRBACCard,
  AutopilotDefaultsCard,
  DataExportCard,
  UserProfileLinkCard,
} from "@/components/settings";

export default function SettingsGlobalPage() {
  return (
    <AnimatedPage className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Global settings</h2>
        <p className="text-sm text-muted-foreground">
          Notifications, privacy, team & roles, autopilot, and data export
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <NotificationPreferencesCard />
        <PrivacyDataCard />
        <TeamRBACCard />
        <AutopilotDefaultsCard />
        <DataExportCard />
        <UserProfileLinkCard />
      </div>
    </AnimatedPage>
  );
}
