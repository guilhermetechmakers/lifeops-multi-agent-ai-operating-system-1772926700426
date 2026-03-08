/**
 * UserManagementPage — Main container for User Management with tabs:
 * Users, Roles, Sessions, Audit Logs. Integrates with Admin & Compliance.
 */

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Shield, Monitor, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { UserManagementPanel } from "./user-management-panel";
import { AuditLogsPanel } from "./audit-logs-panel";
import { AuditExportModal } from "./audit-export-modal";
import { useAdminUsers, useAdminRoles } from "@/hooks/use-admin";
import type { AdminUser } from "@/types/admin";

export function UserManagementPage() {
  const [auditUserId, setAuditUserId] = useState<string | null>(null);
  const [auditExportOpen, setAuditExportOpen] = useState(false);
  const [auditExportUserId, setAuditExportUserId] = useState<string | null>(null);
  const [auditExportUserName, setAuditExportUserName] = useState<string | null>(null);

  const { users = [] } = useAdminUsers({ limit: 200 });
  const { roles = [] } = useAdminRoles();
  const userList: AdminUser[] = Array.isArray(users) ? users : [];
  const selectedUser = auditUserId
    ? userList.find((u) => u?.id === auditUserId) ?? null
    : null;

  const handleExportAudit = useCallback((userId: string) => {
    const u = userList.find((x) => x?.id === userId);
    setAuditExportUserId(userId);
    setAuditExportUserName(u?.name ?? u?.email ?? null);
    setAuditExportOpen(true);
  }, [userList]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4 inline-flex h-10 w-full flex-wrap gap-1 rounded-lg border border-white/[0.03] bg-secondary/50 p-1 sm:w-auto">
          <TabsTrigger
            value="users"
            className="gap-2 data-[state=active]:bg-[#FF3B30] data-[state=active]:text-white"
          >
            <Users className="h-4 w-4" aria-hidden />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="gap-2 data-[state=active]:bg-[#FF3B30] data-[state=active]:text-white"
          >
            <Shield className="h-4 w-4" aria-hidden />
            Roles
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className="gap-2 data-[state=active]:bg-[#FF3B30] data-[state=active]:text-white"
          >
            <Monitor className="h-4 w-4" aria-hidden />
            Sessions
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="gap-2 data-[state=active]:bg-[#FF3B30] data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4" aria-hidden />
            Audit logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-0">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="roles" className="mt-0">
          <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
            <CardHeader>
              <CardTitle>Roles & access</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage roles and permissions in the dedicated Roles page.
              </p>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {(roles ?? []).length} role(s) defined. Use the Roles tab in the admin
                sidebar or the link above for full role management.
              </p>
              <Button asChild variant="outline" className="border-white/[0.03]">
                <Link to="/dashboard/admin/roles">Open Roles & access</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-0">
          <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and revoke user sessions from the Users table (Revoke sessions).
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                From the Users tab, open the actions menu on any user and choose
                &quot;Revoke sessions&quot; to manage that user&apos;s active sessions.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">User:</span>
              <Select
                value={auditUserId ?? "__all__"}
                onValueChange={(v) => setAuditUserId(v === "__all__" ? null : v)}
              >
                <SelectTrigger className="w-[220px] border-white/[0.03]">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All users</SelectItem>
                  {(userList ?? []).map((u) => (
                    <SelectItem key={u?.id ?? ""} value={u?.id ?? ""}>
                      {u?.name ?? u?.email ?? u?.id ?? "—"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <AuditLogsPanel
              userId={auditUserId}
              userName={selectedUser?.name ?? selectedUser?.email ?? null}
              onExportClick={auditUserId ? handleExportAudit : undefined}
            />
          </div>
        </TabsContent>
      </Tabs>

      <AuditExportModal
        open={auditExportOpen}
        onOpenChange={setAuditExportOpen}
        userId={auditExportUserId}
        userName={auditExportUserName}
        onSuccess={() => {
          setAuditExportUserId(null);
          setAuditExportUserName(null);
        }}
      />
    </div>
  );
}
