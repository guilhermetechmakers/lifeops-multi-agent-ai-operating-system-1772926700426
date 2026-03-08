/**
 * IntegrationsList — billing-related integrations (Stripe, etc.) with status.
 * Guards: (integrations ?? []).map
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plug } from "lucide-react";
import { getAdminIntegrations } from "@/api/billing";
import { useQuery } from "@tanstack/react-query";

const INTEGRATIONS_QUERY_KEY = ["admin", "billing", "integrations"];

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "connected") return "secondary";
  if (s === "error") return "destructive";
  return "outline";
}

export function IntegrationsList() {
  const { data: integrations, isLoading } = useQuery({
    queryKey: INTEGRATIONS_QUERY_KEY,
    queryFn: () => getAdminIntegrations(),
    staleTime: 30 * 1000,
  });

  const list = Array.isArray(integrations) ? integrations : [];

  return (
    <Card className="card-health">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Integrations</CardTitle>
        <Plug className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No integrations configured.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium text-foreground">{i.name ?? i.type ?? i.id}</span>
                <Badge variant={statusVariant(i.status ?? "disconnected")}>
                  {i.status ?? "—"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/dashboard/admin/integrations"
          className="inline-block text-sm font-medium text-primary hover:underline mt-3"
        >
          Manage integrations →
        </Link>
      </CardContent>
    </Card>
  );
}
