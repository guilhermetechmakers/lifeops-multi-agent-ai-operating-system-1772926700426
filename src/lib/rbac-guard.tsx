/**
 * RBACGuard — gates UI actions by user roles.
 * Hides or disables elements when user lacks required permission.
 */

import type { ReactNode } from "react";

export type UserRole = "admin" | "member" | "viewer" | "owner";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

/** Permissions that each role has. * means all. */
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  owner: ["*"],
  admin: ["settings:write", "team:manage", "integrations:manage", "export:run", "audit:read"],
  member: ["settings:read", "export:run", "audit:read"],
  viewer: ["settings:read", "audit:read"],
};

function hasPermission(userRoles: UserRole[], required: string): boolean {
  const roles = userRoles ?? [];
  if (roles.length === 0) return false;
  const maxLevel = Math.max(...roles.map((r) => ROLE_HIERARCHY[r] ?? 0));
  const topRole = (Object.entries(ROLE_HIERARCHY) as [UserRole, number][]).find(
    ([, l]) => l === maxLevel
  )?.[0];
  if (!topRole) return false;
  const perms = ROLE_PERMISSIONS[topRole] ?? [];
  if (perms.includes("*")) return true;
  return perms.includes(required);
}

export interface RBACGuardProps {
  children: ReactNode;
  permission: string;
  roles?: UserRole[];
  fallback?: ReactNode;
  /** If true, render children but disabled; otherwise hide. */
  disableInsteadOfHide?: boolean;
}

/**
 * Gates content by permission. Renders fallback (or null) when user lacks permission.
 */
export function RBACGuard({
  children,
  permission,
  roles = ["member"],
  fallback = null,
  disableInsteadOfHide = false,
}: RBACGuardProps) {
  const allowed = hasPermission(roles, permission);
  if (allowed) return <>{children}</>;
  if (disableInsteadOfHide) {
    return (
      <span className="pointer-events-none opacity-50" aria-disabled>
        {children}
      </span>
    );
  }
  return <>{fallback}</>;
}

/**
 * Hook to check permission. Use for conditional rendering or logic.
 */
export function useHasPermission(
  permission: string,
  roles: UserRole[] = ["member"]
): boolean {
  return hasPermission(roles, permission);
}
