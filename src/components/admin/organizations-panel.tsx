/**
 * OrganizationsPanel — Org list with create/edit, retention policies, SSO.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Pencil } from "lucide-react";
import { useAdminOrgs } from "@/hooks/use-admin";
import { AnimatedPage } from "@/components/animated-page";
import { OrgCreateEditModal } from "./org-create-edit-modal";
import type { Org } from "@/types/admin";

export function OrganizationsPanel() {
  const { orgs, isLoading } = useAdminOrgs();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<Org | null>(null);

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Organizations</h2>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create org
        </Button>
      </div>

      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
        <CardHeader>
          <CardTitle>Organization list</CardTitle>
          <p className="text-sm text-muted-foreground">
            SSO, data policies, tenant settings
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (orgs ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.03] bg-secondary/30 px-6 py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No organizations yet.</p>
              <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                Create organization
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {(orgs ?? []).map((o: Org) => (
                <div
                  key={o?.id ?? ""}
                  className="flex items-center justify-between rounded-lg border border-white/[0.03] px-4 py-3 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{o?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{o?.id ?? ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={o?.ssoEnabled ? "default" : "secondary"}>
                      {o?.ssoEnabled ? "SSO enabled" : "SSO disabled"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditOrg(o ?? null)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <OrgCreateEditModal
        open={createOpen || !!editOrg}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditOrg(null);
          }
        }}
        org={editOrg}
        onSuccess={() => {
          setCreateOpen(false);
          setEditOrg(null);
        }}
      />
    </AnimatedPage>
  );
}
