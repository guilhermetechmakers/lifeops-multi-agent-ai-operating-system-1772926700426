/**
 * EnterpriseSettingsPanel — enterprise billing/settings summary and edit link.
 * Uses billing API; arrays and objects guarded.
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { getEnterpriseSettings } from "@/api/billing";
import { useQuery } from "@tanstack/react-query";

const ENTERPRISE_QUERY_KEY = ["admin", "enterprise", "settings"];

export function EnterpriseSettingsPanel() {
  const { data: enterprise, isLoading } = useQuery({
    queryKey: ENTERPRISE_QUERY_KEY,
    queryFn: () => getEnterpriseSettings(),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card className="card-health">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Enterprise settings</CardTitle>
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  const name = enterprise?.name ?? "—";
  const planLimit = enterprise?.planLimit ?? "—";
  const taxId = enterprise?.taxId ? "••••" : "Not set";

  return (
    <Card className="card-health">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Enterprise settings</CardTitle>
        <Building2 className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium text-foreground">{name}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Plan limit</dt>
            <dd className="font-medium text-foreground">{String(planLimit)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Tax ID</dt>
            <dd className="font-medium text-foreground">{taxId}</dd>
          </div>
        </dl>
        <Link
          to="/dashboard/admin/organizations"
          className="inline-block text-sm font-medium text-primary hover:underline mt-2"
        >
          Manage organizations →
        </Link>
      </CardContent>
    </Card>
  );
}
