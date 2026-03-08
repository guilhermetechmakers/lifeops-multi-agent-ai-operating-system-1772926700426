/**
 * Settings Billing section: redirect to profile billing or embed BillingPanel.
 */

import { Navigate } from "react-router-dom";

export default function SettingsBillingPage() {
  return <Navigate to="/dashboard/profile/billing" replace />;
}
