/**
 * OrgManagementLink — Quick navigation to org-level settings.
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useAdminOrgs } from "@/hooks/use-admin";

export interface OrgManagementLinkProps {
  orgId: string;
  className?: string;
}

export function OrgManagementLink({ orgId, className }: OrgManagementLinkProps) {
  const { orgs } = useAdminOrgs();
  const org = (orgs ?? []).find((o: { id?: string }) => o?.id === orgId);
  const orgName = org?.name ?? "Organization";

  if (!orgId) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={className}
    >
      <Link to="/dashboard/admin/organizations" className="gap-2">
        <Building2 className="h-4 w-4" />
        {orgName}
      </Link>
    </Button>
  );
}
