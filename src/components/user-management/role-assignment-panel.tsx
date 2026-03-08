/**
 * RoleAssignmentPanel — Modal for assigning roles with scope controls.
 * Multi-select interface; validates against org policy.
 */

import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateAdminUser } from "@/hooks/use-admin";
import type { AdminUser, Org, Role } from "@/types/admin";
import { cn } from "@/lib/utils";

export interface RoleAssignmentPanelProps {
  user: AdminUser | null;
  onClose: () => void;
  orgs: Org[];
  roles: Role[];
}

export function RoleAssignmentPanel({ user, onClose, orgs, roles }: RoleAssignmentPanelProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const updateUser = useUpdateAdminUser();

  const currentRoles = Array.isArray(user?.roles) ? (user.roles as string[]) : [];
  const rolesList = (roles ?? []) as Role[];

  useEffect(() => {
    if (user) {
      setSelectedRoles([...currentRoles]);
    }
  }, [user?.id, currentRoles.join(",")]);

  const toggleRole = useCallback((roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  }, []);

  const handleSave = useCallback(() => {
    if (!user?.id) return;
    updateUser.mutate(
      { id: user.id, payload: { roles: selectedRoles } },
      {
        onSuccess: () => onClose(),
      }
    );
  }, [user?.id, selectedRoles, updateUser, onClose]);

  const filteredRoles = rolesList.filter((r) =>
    (r?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby="role-assignment-desc">
        <DialogHeader>
          <DialogTitle>Assign roles</DialogTitle>
          <p id="role-assignment-desc" className="text-sm text-muted-foreground">
            {user?.name ?? "—"} · Select roles to assign. Changes are validated against org policy.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="role-search">Search roles</Label>
            <Input
              id="role-search"
              placeholder="Filter roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="max-h-48 overflow-y-auto rounded-md border border-white/[0.03] bg-secondary/30 p-2">
            {(filteredRoles ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No roles match</p>
            ) : (
              <div className="space-y-2">
                {filteredRoles.map((r) => (
                  <label
                    key={r?.id ?? ""}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors duration-200 hover:bg-secondary/50",
                      selectedRoles.includes(r?.name ?? "") && "bg-primary/10"
                    )}
                  >
                    <Checkbox
                      checked={selectedRoles.includes(r?.name ?? "")}
                      onCheckedChange={() => toggleRole(r?.name ?? "")}
                      aria-label={`Assign role ${r?.name ?? ""}`}
                    />
                    <span className="font-medium">{r?.name ?? "—"}</span>
                    <span className="text-xs text-muted-foreground">
                      {(r?.permissions ?? []).slice(0, 2).join(", ")}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Org: {(orgs ?? []).find((o) => o?.id === user?.orgId)?.name ?? "—"}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateUser.isPending || JSON.stringify(selectedRoles.sort()) === JSON.stringify([...currentRoles].sort())}
          >
            {updateUser.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
