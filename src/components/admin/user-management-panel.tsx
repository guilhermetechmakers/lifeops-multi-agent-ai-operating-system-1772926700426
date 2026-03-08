/**
 * UserManagementPanel — Table of users with search, filters, bulk actions.
 * Per-row: edit, suspend/activate, reset password, assign roles.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, UserPlus, Edit, Play, Pause, Key, Shield } from "lucide-react";
import { useAdminUsers, useActivateAdminUser, useUpdateAdminUser, useAdminOrgs, useAdminRoles } from "@/hooks/use-admin";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { AdminUser } from "@/types/admin";
import { UserCreateEditModal } from "./user-create-edit-modal";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export function UserManagementPanel() {
  const [search, setSearch] = useState("");
  const [orgId, setOrgId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebouncedValue(search, 300);

  const { users, count, isLoading } = useAdminUsers({
    search: debouncedSearch,
    orgId: orgId || undefined,
    role: role || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const { orgs } = useAdminOrgs();
  const { roles: rolesList } = useAdminRoles();
  const activateUser = useActivateAdminUser();
  const updateUser = useUpdateAdminUser();

  const userList = (users ?? []) as AdminUser[];
  const totalCount = count ?? userList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === userList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(userList.map((u) => u.id)));
    }
  }, [userList, selectedIds.size]);

  const handleActivate = useCallback(
    (u: AdminUser) => {
      if (u?.status === "active") {
        updateUser.mutate({ id: u?.id ?? "", payload: { status: "suspended" } });
      } else {
        activateUser.mutate(u?.id ?? "");
      }
    },
    [activateUser, updateUser]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={orgId} onValueChange={setOrgId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All orgs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All orgs</SelectItem>
              {(orgs ?? []).map((o: { id?: string; name?: string }) => (
                <SelectItem key={o?.id ?? ""} value={o?.id ?? ""}>
                  {o?.name ?? "—"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All roles</SelectItem>
              {(rolesList ?? []).map((r: { id?: string; name?: string }) => (
                <SelectItem key={r?.id ?? ""} value={r?.name ?? ""}>
                  {r?.name ?? "—"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Create user
        </Button>
      </div>

      <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <p className="text-sm text-muted-foreground">
            {totalCount} total · Edit, activate/deactivate, assign roles
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (userList ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.03] bg-secondary/30 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">No users match your filters.</p>
              <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                Create user
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.03]">
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === userList.length && userList.length > 0}
                          onChange={toggleSelectAll}
                          aria-label="Select all"
                        />
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
                    {(userList ?? []).map((u) => (
                      <tr
                        key={u?.id ?? ""}
                        className="border-b border-white/[0.03] transition-colors hover:bg-secondary/30"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(u?.id ?? "")}
                            onChange={() => toggleSelect(u?.id ?? "")}
                            aria-label={`Select ${u?.name ?? ""}`}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{u?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u?.email ?? "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {((u?.roles ?? []) as string[]).map((r) => (
                              <Badge key={r} variant="secondary" className="text-xs">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={u?.status === "active" ? "default" : "destructive"}
                            className={cn(
                              u?.status === "active" && "bg-teal/20 text-teal hover:bg-teal/30"
                            )}
                          >
                            {u?.status ?? "—"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {u?.lastActiveAt
                            ? new Date(u.lastActiveAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => setEditUser(u ?? null)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleActivate(u ?? ({} as AdminUser))}>
                                {u?.status === "active" ? (
                                  <>
                                    <Pause className="mr-2 h-4 w-4" />
                                    Suspend
                                  </>
                                ) : (
                                  <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Key className="mr-2 h-4 w-4" />
                                Reset password
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Assign roles
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.03] pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} · {totalCount} total
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <UserCreateEditModal
        open={createOpen || !!editUser}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditUser(null);
          }
        }}
        user={editUser}
        orgs={orgs ?? []}
        roles={rolesList ?? []}
        onSuccess={() => {
          setCreateOpen(false);
          setEditUser(null);
        }}
      />
    </div>
  );
}
