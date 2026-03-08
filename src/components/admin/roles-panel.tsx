/**
 * RolesPanel — Role registry with permission matrix.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Plus } from "lucide-react";
import { useAdminRoles } from "@/hooks/use-admin";
import { AnimatedPage } from "@/components/animated-page";

export function RolesPanel() {
  const { roles, isLoading } = useAdminRoles();

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Roles & access control</h2>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create role
        </Button>
      </div>

      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
        <CardHeader>
          <CardTitle>Role registry</CardTitle>
          <p className="text-sm text-muted-foreground">
            Permissions per module; assign to users/orgs
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (roles ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.03] bg-secondary/30 px-6 py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No roles defined.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(roles ?? []).map((r) => (
                <div
                  key={r?.id ?? ""}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] px-4 py-3 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{r?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {(r?.permissions ?? []).slice(0, 3).join(", ")}
                        {((r?.permissions ?? []).length ?? 0) > 3 ? "…" : ""}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
