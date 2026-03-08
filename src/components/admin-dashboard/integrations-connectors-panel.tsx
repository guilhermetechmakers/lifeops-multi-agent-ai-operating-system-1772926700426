/**
 * Integrations & Connectors Panel — List with health status, last sync, test connection.
 * Guards: (integrations ?? []).map
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminIntegrations, useTestAdminIntegration } from "@/hooks/use-admin";
import { Plug, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const EMPTY_LIST: { id: string; type: string; health: string; lastSyncAt?: string }[] = [];

export function IntegrationsConnectorsPanel() {
  const { integrations, data, isLoading } = useAdminIntegrations();
  const testIntegration = useTestAdminIntegration();

  const list = integrations ?? data ?? EMPTY_LIST;

  const healthIcon = (health: string) => {
    switch (health) {
      case "ok":
        return <CheckCircle2 className="h-4 w-4 text-teal" />;
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-amber" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Plug className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-health">
        <CardHeader>
          <CardTitle>Connectors</CardTitle>
          <p className="text-sm text-muted-foreground">
            Health status and last sync. Use Test to verify connection.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">Loading...</div>
          ) : list.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No integrations configured.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/[0.03]">
              <table className="w-full text-sm" role="grid">
                <thead>
                  <tr className="border-b border-white/[0.03] bg-secondary/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Health</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last sync</th>
                    <th className="w-24 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {(list ?? []).map((conn) => (
                    <tr key={conn.id} className="border-b border-white/[0.03] hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{conn.type}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          {healthIcon(conn.health)}
                          <Badge variant={conn.health === "ok" ? "default" : conn.health === "warn" ? "secondary" : "destructive"}>
                            {conn.health}
                          </Badge>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {conn.lastSyncAt ? formatDistanceToNow(new Date(conn.lastSyncAt), { addSuffix: true }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => testIntegration.mutate(conn.id)}
                          disabled={testIntegration.isPending}
                          aria-label="Test connection"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
