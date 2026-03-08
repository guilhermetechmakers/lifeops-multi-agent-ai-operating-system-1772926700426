/**
 * Organization & Enterprise Settings Panel — Org list, create/edit modal, retention policy.
 * All array ops guarded: (orgs ?? []).map
 */

import { useState, useCallback } from "react";
import { MoreHorizontal, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminOrgs, useCreateAdminOrg, useUpdateAdminOrg } from "@/hooks/use-admin";
import type { Org } from "@/types/admin";

const EMPTY_ORGS: Org[] = [];

export function OrgsSettingsPanel() {
  const [editOrg, setEditOrg] = useState<Org | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { orgs, data, isLoading } = useAdminOrgs();
  const createOrg = useCreateAdminOrg();
  const updateOrg = useUpdateAdminOrg();

  const list = orgs ?? data ?? EMPTY_ORGS;

  const handleCreate = useCallback(
    (payload: Omit<Org, "id"> | Partial<Org>) => {
      const p = payload as Omit<Org, "id">;
      if (p?.name) {
        createOrg.mutate(p, { onSuccess: () => setCreateOpen(false) });
      }
    },
    [createOrg]
  );

  const handleUpdate = useCallback(
    (id: string, payload: Partial<Org>) => {
      updateOrg.mutate({ id, payload }, { onSuccess: () => setEditOrg(null) });
    },
    [updateOrg]
  );

  return (
    <div className="space-y-6">
      <Card className="card-health">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle>Organizations</CardTitle>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Create organization
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">Loading...</div>
          ) : list.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
              <p>No organizations.</p>
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                Create organization
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/[0.03]">
              <table className="w-full text-sm" role="grid">
                <thead>
                  <tr className="border-b border-white/[0.03] bg-secondary/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">SSO</th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {(list ?? []).map((org) => (
                    <tr key={org.id} className="border-b border-white/[0.03] hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{org.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={org.ssoEnabled ? "default" : "secondary"}>
                          {org.ssoEnabled ? "Enabled" : "Off"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditOrg(org)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {createOpen && (
        <OrgFormModal
          onClose={() => setCreateOpen(false)}
          onSubmit={(p) => handleCreate({ name: p.name ?? "", ssoEnabled: p.ssoEnabled ?? false, tenantSettings: p.tenantSettings })}
          isLoading={createOrg.isPending}
        />
      )}
      {editOrg && (
        <OrgFormModal
          org={editOrg}
          onClose={() => setEditOrg(null)}
          onSubmit={(payload) => handleUpdate(editOrg.id, payload)}
          isLoading={updateOrg.isPending}
        />
      )}
    </div>
  );
}

function OrgFormModal({
  org,
  onClose,
  onSubmit,
  isLoading,
}: {
  org?: Org | null;
  onClose: () => void;
  onSubmit: (payload: Omit<Org, "id"> | Partial<Org>) => void | Promise<void>;
  isLoading: boolean;
}) {
  const [name, setName] = useState(org?.name ?? "");
  const [ssoEnabled, setSsoEnabled] = useState(org?.ssoEnabled ?? false);
  const isEdit = Boolean(org?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && org?.id) {
      onSubmit({ name: name || undefined, ssoEnabled });
    } else {
      onSubmit({ name, ssoEnabled, tenantSettings: {} });
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit organization" : "Create organization"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="org-name">Name</Label>
            <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sso"
              checked={ssoEnabled}
              onChange={(e) => setSsoEnabled(e.target.checked)}
              className="rounded border-white/20"
            />
            <Label htmlFor="sso">SSO enabled</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
