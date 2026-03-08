/**
 * User Management Panel — Table with search, row actions, bulk actions, create/edit modal.
 * Guards: (users ?? []).map; Array.isArray for all lists.
 */

import { useState, useCallback } from "react";
import {
  MoreHorizontal,
  Pencil,
  UserCheck,
  UserX,
  Trash2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import { useAdminUsers, useCreateAdminUser, useUpdateAdminUser, useDeleteAdminUser, useActivateAdminUser, useAuditLogs } from "@/hooks/use-admin";
import type { AdminUser, AuditLog } from "@/types/admin";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const EMPTY_USERS: AdminUser[] = [];

export function UserManagementPanel() {
  const [search, setSearch] = useState("");
  const [page] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [auditUserId, setAuditUserId] = useState<string | null>(null);

  const { users, isLoading } = useAdminUsers({ search: search || undefined, page, limit: 20 });
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();
  const activateUser = useActivateAdminUser();
  const { logs } = useAuditLogs(auditUserId ? { userId: auditUserId, limit: 20 } : undefined);

  const list = users ?? EMPTY_USERS;
  const allSelected = list.length > 0 && selectedIds.size === list.length;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(list.map((u) => u.id)));
  }, [allSelected, list]);

  const handleCreate = useCallback(
    (payload: Omit<AdminUser, "id"> | Partial<AdminUser>) => {
      const p = payload as Omit<AdminUser, "id">;
      if (p?.email && p?.name !== undefined) {
        createUser.mutate(
          {
            name: p.name ?? "",
            email: p.email,
            orgId: p.orgId ?? "",
            roles: Array.isArray(p.roles) ? p.roles : [],
            status: (p.status as AdminUser["status"]) ?? "active",
            lastActiveAt: p.lastActiveAt ?? null,
          },
          { onSuccess: () => setCreateOpen(false) }
        );
      }
    },
    [createUser]
  );

  const handleUpdate = useCallback(
    (id: string, payload: Partial<AdminUser>) => {
      updateUser.mutate({ id, payload }, { onSuccess: () => setEditingUser(null) });
    },
    [updateUser]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("Remove this user?")) return;
      deleteUser.mutate(id);
    },
    [deleteUser]
  );

  const handleActivate = useCallback(
    (id: string, activate: boolean) => {
      if (activate) {
        activateUser.mutate(id);
      } else {
        updateUser.mutate({ id, payload: { status: "suspended" } });
      }
    },
    [activateUser, updateUser]
  );

  return (
    <div className="space-y-6">
      <Card className="card-health">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle>Users</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
              aria-label="Search users"
            />
            <Button onClick={() => setCreateOpen(true)} size="sm">
              Create user
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">Loading...</div>
          ) : list.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
              <p>No users found.</p>
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                Create user
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/[0.03]">
              <table className="w-full text-sm" role="grid">
                <thead>
                  <tr className="border-b border-white/[0.03] bg-secondary/50">
                    <th className="w-10 px-4 py-3 text-left">
                      <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Roles</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last active</th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/[0.03] transition-colors hover:bg-secondary/30"
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds.has(user.id)}
                          onCheckedChange={() => toggleSelect(user.id)}
                          aria-label={`Select ${user.name}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        {(user.roles ?? []).length === 0 ? (
                          "—"
                        ) : (
                          <span className="flex flex-wrap gap-1">
                            {(user.roles ?? []).slice(0, 3).map((r) => (
                              <Badge key={r} variant="secondary" className="text-xs">
                                {r}
                              </Badge>
                            ))}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.lastActiveAt ? formatDistanceToNow(new Date(user.lastActiveAt), { addSuffix: true }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActivate(user.id, user.status !== "active")}>
                              {user.status === "active" ? (
                                <><UserX className="mr-2 h-4 w-4" /> Suspend</>
                              ) : (
                                <><UserCheck className="mr-2 h-4 w-4" /> Activate</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setAuditUserId(user.id)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Audit log
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive">
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
        <UserFormModal
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
          isLoading={createUser.isPending}
        />
      )}
      {editingUser && (
        <UserFormModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={(payload) => handleUpdate(editingUser.id, payload)}
          isLoading={updateUser.isPending}
        />
      )}
      {auditUserId && (
        <AuditLogModal
          logs={Array.isArray(logs) ? logs : []}
          onClose={() => setAuditUserId(null)}
        />
      )}
    </div>
  );
}

function UserFormModal({
  user,
  onClose,
  onSubmit,
  isLoading,
}: {
  user?: AdminUser | null;
  onClose: () => void;
  onSubmit: (payload: Omit<AdminUser, "id"> | Partial<AdminUser>) => void | Promise<void>;
  isLoading: boolean;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string>(user?.roles?.join(", ") ?? "");
  const isEdit = Boolean(user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roleList = roles.split(",").map((r) => r.trim()).filter(Boolean);
    if (isEdit && user?.id) {
      onSubmit({ name: name || undefined, email: email || undefined, roles: roleList });
    } else {
      if (!email) {
        toast.error("Email is required");
        return;
      }
      onSubmit({ name, email, password: password || undefined, status: "active", orgId: "", roles: roleList, lastActiveAt: null } as Omit<AdminUser, "id">);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Create user"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" disabled={isEdit} />
          </div>
          {!isEdit && (
            <div>
              <Label htmlFor="password">Password (optional)</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
            </div>
          )}
          <div>
            <Label htmlFor="roles">Roles (comma-separated)</Label>
            <Input id="roles" value={roles} onChange={(e) => setRoles(e.target.value)} className="mt-1" placeholder="admin, member" />
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

function AuditLogModal({ logs, onClose }: { logs: AuditLog[]; onClose: () => void }) {
  const list = Array.isArray(logs) ? logs : [];
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Audit log</DialogTitle>
        </DialogHeader>
        <div className="max-h-64 overflow-y-auto rounded border border-white/[0.03] p-2 text-sm">
          {list.length === 0 ? (
            <p className="text-muted-foreground">No audit entries.</p>
          ) : (
            <ul className="space-y-2">
              {list.map((log) => (
                <li key={log.id} className="flex justify-between gap-2 border-b border-white/[0.03] pb-2">
                  <span>{log.action}</span>
                  <span className="text-muted-foreground shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
