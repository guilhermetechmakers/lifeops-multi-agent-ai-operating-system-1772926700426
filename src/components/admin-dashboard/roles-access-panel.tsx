/**
 * Roles & Access Control Editor — Role registry, create/edit/delete, permission matrix.
 * Guards: (roles ?? []).map
 */

import { useState, useCallback } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useAdminRoles, useCreateAdminRole, useUpdateAdminRole, useDeleteAdminRole } from "@/hooks/use-admin";
import type { Role } from "@/types/admin";

const EMPTY_ROLES: Role[] = [];

export function RolesAccessPanel() {
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { roles, data, isLoading } = useAdminRoles();
  const createRole = useCreateAdminRole();
  const updateRole = useUpdateAdminRole();
  const deleteRole = useDeleteAdminRole();

  const list = roles ?? data ?? EMPTY_ROLES;

  const handleCreate = useCallback(
    (payload: Omit<Role, "id"> | Partial<Role>) => {
      const p = payload as Partial<Role>;
      if (p?.name) {
        createRole.mutate(
          { name: p.name, permissions: Array.isArray(p.permissions) ? p.permissions : [] },
          { onSuccess: () => setCreateOpen(false) }
        );
      }
    },
    [createRole]
  );

  const handleUpdate = useCallback(
    (id: string, payload: Partial<Role>) => {
      updateRole.mutate({ id, payload }, { onSuccess: () => setEditRole(null) });
    },
    [updateRole]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("Delete this role?")) return;
      deleteRole.mutate(id);
    },
    [deleteRole]
  );

  return (
    <div className="space-y-6">
      <Card className="card-health">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle>Roles</CardTitle>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Create role
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">Loading...</div>
          ) : list.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
              <p>No roles.</p>
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                Create role
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/[0.03]">
              <table className="w-full text-sm" role="grid">
                <thead>
                  <tr className="border-b border-white/[0.03] bg-secondary/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Permissions</th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {(list ?? []).map((role) => (
                    <tr key={role.id} className="border-b border-white/[0.03] hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{role.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {(role.permissions ?? []).length === 0
                          ? "—"
                          : (role.permissions ?? []).slice(0, 5).join(", ") + ((role.permissions ?? []).length > 5 ? "…" : "")}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditRole(role)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(role.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
        <RoleFormModal
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
          isLoading={createRole.isPending}
        />
      )}
      {editRole && (
        <RoleFormModal
          role={editRole}
          onClose={() => setEditRole(null)}
          onSubmit={(payload) => handleUpdate(editRole.id, payload)}
          isLoading={updateRole.isPending}
        />
      )}
    </div>
  );
}

function RoleFormModal({
  role,
  onClose,
  onSubmit,
  isLoading,
}: {
  role?: Role | null;
  onClose: () => void;
  onSubmit: (payload: Omit<Role, "id"> | Partial<Role>) => void | Promise<void>;
  isLoading: boolean;
}) {
  const [name, setName] = useState(role?.name ?? "");
  const [permissions, setPermissions] = useState((role?.permissions ?? []).join(", "));
  const isEdit = Boolean(role?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const perms = permissions.split(",").map((p) => p.trim()).filter(Boolean);
    if (isEdit && role?.id) {
      onSubmit({ name: name || undefined, permissions: perms });
    } else {
      onSubmit({ name, permissions: perms });
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit role" : "Create role"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="role-name">Name</Label>
            <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="perms">Permissions (comma-separated)</Label>
            <Input
              id="perms"
              value={permissions}
              onChange={(e) => setPermissions(e.target.value)}
              className="mt-1"
              placeholder="read, write, admin:*"
            />
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
