/**
 * Settings Profile link: redirect to User Profile.
 */

import { Navigate } from "react-router-dom";

export default function SettingsProfileRedirectPage() {
  return <Navigate to="/dashboard/profile" replace />;
}
