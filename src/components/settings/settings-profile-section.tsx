/**
 * SettingsProfileSection — User profile quick access.
 */

import { AnimatedPage } from "@/components/animated-page";
import { UserProfileLinkCard } from "./user-profile-link-card";

export function SettingsProfileSection() {
  return (
    <AnimatedPage className="space-y-6">
      <UserProfileLinkCard />
    </AnimatedPage>
  );
}
