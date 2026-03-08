/**
 * RoleAssignmentPanel — Multi-select role assignment with scope controls.
 * Validates against org policy; shows current assignments with quick remove.
 */

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useUpdateAdminUser, useAdminRoles } from "@/hooks/use-admin";
import type { AdminUser, Role } from "@/types/admin";
import { Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoleAssignmentPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSuccess?: () => void;
}

export function RoleAssignmentPanel({
  open,
  onOpenChange,
  user,
  onSuccess,
}: RoleAssignmentPanelProps) {
  const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([]);
  const [policyError, setPolicyError] = useState<string | null>(null);

  const { roles: rolesList = [] } = useAdminRoles();
  const updateUser = useUpdateAdminUser();

  const currentRoles = Array.isArray(user?.roles) ? (user?.roles as string[]) : [];
  const roles: Role[] = rolesList ?? [];

  const toggleRole = useCallback((roleName: string) => {
    setSelectedRoleNames((prev) => {
      const next = prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName];
      setPolicyError(null);
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!user?.id) return;
    setPolicyError(null);
    try {
      await updateUser.mutateAsync({
        id: user.id,
        payload: { roles: selectedRoleNames },
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (e) {
      setPolicyError(e instanceof Error ? e.message : "Role assignment failed");
    }
  }, [user?.id, selectedRoleNames, updateUser, onSuccess, onOpenChange]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setSelectedRoleNames([...currentRoles]);
        setPolicyError(null);
      }
      onOpenChange(next);
    },
    [currentRoles, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] sm:max-w-md"
        aria-describedby="role-assignment-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-muted-foreground" aria-hidden />
            Assign roles
          </DialogTitle>
          <p id="role-assignment-description" className="text-sm text-muted-foreground">
            {user?.name ?? "User"} · Select roles aligned with org policy
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-xs text-muted-foreground">Current: {(currentRoles ?? []).join(", ") || "—"}</p>
          <div className="flex flex-wrap gap-3">
            {(roles ?? []).map((r) => (
              <label
                key={r?.id ?? ""}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.03] px-3 py-2 transition-colors duration-200 hover:bg-secondary/50",
                  selectedRoleNames.includes(r?.name ?? "") && "bg-secondary/80"
                )}
              >
                <Checkbox
                  checked={selectedRoleNames.includes(r?.name ?? "")}
                  onCheckedChange={() => toggleRole(r?.name ?? "")}
                  aria-label={`Assign role ${r?.name ?? ""}`}
                />
                <span className="text-sm font-medium">{r?.name ?? "—"}</span>
                {(r?.permissions ?? []).length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {(r?.permissions ?? []).length}
                  </Badge>
                )}
              </label>
            ))}
          </div>
          {policyError && (
            <p className="text-sm text-[#FF3B30]" role="alert">
              {policyError}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-white/[0.03] pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateUser.isPending}
            className="transition-transform duration-200 hover:scale-[1.02]"
          >
            {updateUser.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              "Save roles"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
