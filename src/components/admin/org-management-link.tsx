/**
 * OrgManagementLink — Quick navigation to org-level settings for a selected user.
 * Links to Admin Organizations with optional orgId for deep link.
 */

import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OrgManagementLinkProps {
  orgId?: string | null;
  orgName?: string | null;
  className?: string;
  children?: React.ReactNode;
}

export function OrgManagementLink({
  orgId,
  orgName,
  className,
  children,
}: OrgManagementLinkProps) {
  const to = orgId
    ? `/dashboard/admin/organizations?orgId=${encodeURIComponent(orgId)}`
    : "/dashboard/admin/organizations";

  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      aria-label={orgName ? `Open ${orgName} in Organizations` : "Open Organizations"}
    >
      <Building2 className="h-4 w-4 shrink-0" aria-hidden />
      {children ?? (orgName || "Organizations")}
    </Link>
  );
}
