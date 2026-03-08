/**
 * SettingsProfilePage — gateway to User Profile.
 * Redirects to the full profile page.
 */

import { Navigate } from "react-router-dom";

export function SettingsProfilePage() {
  return <Navigate to="/dashboard/profile/personal" replace />;
}
