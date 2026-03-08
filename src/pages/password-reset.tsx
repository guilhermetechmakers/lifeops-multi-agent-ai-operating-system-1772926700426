/**
 * Password reset page - re-exports the full flow from components.
 * Routes: /auth/forgot, /auth/reset (with ?token= for magic link).
 */

import { PasswordResetPage } from "@/components/auth/password-reset";

export default function PasswordReset() {
  return <PasswordResetPage />;
}
