/**
 * User Profile page: layout with left rail and outlet for section panels.
 * Used as parent route element; child routes render in the layout outlet.
 */

import { AnimatedPage } from "@/components/animated-page";
import { UserProfileLayout } from "@/components/profile/user-profile-layout";

export default function ProfilePage() {
  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, integrations, security, and preferences
        </p>
      </div>
      <UserProfileLayout />
    </AnimatedPage>
  );
}
