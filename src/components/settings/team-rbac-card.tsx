/**
 * TeamRBACCard — Team roster, invite modal, roles, SSO settings.
 * All array operations guarded: (members ?? []).map(...)
 */

import { useState } from "react";
import { Users, UserPlus, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsGlobal, useUpdateSettingsGlobal } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { TeamMember, Role } from "@/types/settings";

export function TeamRBACCard() {
  const { data: global, isLoading } = useSettingsGlobal();
  const update = useUpdateSettingsGlobal();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState<string>("");

  const teamRbac = global?.team_rbac ?? null;
  const members = teamRbac?.members ?? [];
  const roles = teamRbac?.roles ?? [];
  const ssoEnabled = teamRbac?.sso_enabled ?? false;

  const handleToggleSso = (checked: boolean) => {
    update.mutate({
      team_rbac: {
        ...teamRbac,
        members: teamRbac?.members ?? [],
        roles: teamRbac?.roles ?? [],
        sso_enabled: checked,
      },
    });
    toast.success(checked ? "SSO enabled" : "SSO disabled");
  };

  const handleInvite = () => {
    const email = inviteEmail?.trim();
    if (!email) {
      toast.error("Email is required");
      return;
    }
    const roleId = inviteRoleId || (roles[0] as Role | undefined)?.id;
    if (!roleId) {
      toast.error("Select a role");
      return;
    }
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      user_id: "",
      email,
      name: email.split("@")[0] ?? "Invited",
      role_id: roleId,
      role_name: (roles.find((r) => r.id === roleId) as Role | undefined)?.name ?? "Member",
      invited_at: new Date().toISOString(),
      status: "pending",
    };
    update.mutate({
      team_rbac: {
        ...teamRbac,
        members: [...members, newMember],
        roles: teamRbac?.roles ?? [],
        sso_enabled: teamRbac?.sso_enabled ?? false,
      },
    });
    setInviteOpen(false);
    setInviteEmail("");
    setInviteRoleId("");
    toast.success("Invitation sent");
  };

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Team & roles
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Team roster, roles, and SSO settings
            </p>
          </div>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Members</h4>
          <ul className="space-y-2" role="list">
            {(members ?? []).map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{member.name ?? member.email}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {member.role_name}
                </Badge>
                <Badge
                  variant={member.status === "active" ? "default" : "outline"}
                  className="text-xs"
                >
                  {member.status}
                </Badge>
              </li>
            ))}
          </ul>
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground">No team members yet. Invite someone.</p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-secondary/50 p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="sso-toggle" className="font-medium text-foreground">
                SSO (Single sign-on)
              </Label>
              <p className="text-xs text-muted-foreground">Use organization SSO to sign in</p>
            </div>
          </div>
          <Switch
            id="sso-toggle"
            checked={ssoEnabled}
            onCheckedChange={handleToggleSso}
            aria-label="Toggle SSO"
          />
        </div>
      </CardContent>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="border-white/[0.03] bg-card">
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>Send an invitation by email. They will receive a link to join.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-secondary border-white/[0.03]"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRoleId} onValueChange={setInviteRoleId}>
                <SelectTrigger className="bg-secondary border-white/[0.03]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {(roles ?? []).map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
