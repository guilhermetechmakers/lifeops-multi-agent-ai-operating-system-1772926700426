import { Navigate } from "react-router-dom";

/**
 * Legacy route - redirects to full password reset flow.
 */
export default function AuthForgotPage() {
  return <Navigate to="/auth/password-reset" replace />;
}
