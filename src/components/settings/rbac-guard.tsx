/**
 * RBACGuard — Gate UI by roles. Hides children if user lacks required role.
 */

import { type ReactNode } from "react";

export type UserRole = "admin" | "member" | "viewer" | "owner" | "billing";

export interface RBACGuardProps {
  children: ReactNode;
  /** Required roles: user must have at least one */
  roles: UserRole[];
  /** Current user roles (from auth/context). Defaults to ["member"] for demo. */
  userRoles?: UserRole[];
  /** Optional fallback when not allowed */
  fallback?: ReactNode;
}

/**
 * Renders children only if user has at least one of the required roles.
 * Uses userRoles ?? ["member"] so unauthenticated/demo still sees member content.
 */
export function RBACGuard({
  children,
  roles,
  userRoles = ["member"],
  fallback = null,
}: RBACGuardProps) {
  const allowed = Array.isArray(userRoles) && roles.some((r) => (userRoles as string[]).includes(r));
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
