/**
 * UserManagementPage — Main container with tabs: Users, Roles, Sessions, Audit Logs.
 * Master layout with header, content grid, and Admin & Compliance integration.
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTable } from "./user-table";
import { AdminDashboardWidgets } from "./admin-dashboard-widgets";
import { RolesPanel } from "@/components/admin/roles-panel";
import { Users, Shield, Monitor, FileText } from "lucide-react";
import { useAllSessions, useAuditLogs } from "@/hooks/use-admin";
import type { AdminSession, AuditLog } from "@/types/admin";
import { AnimatedPage } from "@/components/animated-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserManagementPage() {
  const [activeTab, setActiveTab] = useState("users");

  const { sessions } = useAllSessions();
  const sessionList = (sessions ?? []) as AdminSession[];
  const { logs } = useAuditLogs({ limit: 50 });
  const logList = (logs ?? []) as AuditLog[];

  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          User management
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage accounts, roles, sessions, and audit logs. Integrates with Admin & Compliance Tools.
        </p>
      </div>

      <AdminDashboardWidgets />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Monitor className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <FileText className="h-4 w-4" />
            Audit logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserTable />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RolesPanel />
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
            <CardHeader>
              <CardTitle>Active sessions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Recent sessions across all users. Use the Users tab to manage sessions per user.
              </p>
            </CardHeader>
            <CardContent>
              {sessionList.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No sessions to display. Select a user from the Users tab to view their sessions.
                </p>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                  {sessionList.slice(0, 20).map((s) => (
                    <li
                      key={s?.id ?? ""}
                      className="flex items-center justify-between rounded-md border border-white/[0.03] bg-secondary/30 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{s?.device ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          IP: {s?.ip ?? "—"} · {s?.lastUsed ? new Date(s.lastUsed).toLocaleString() : "—"}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">User: {s?.userId ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <Card className="border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B]">
            <CardHeader>
              <CardTitle>Audit logs</CardTitle>
              <p className="text-sm text-muted-foreground">
                Global audit trail. Use the Users tab to view or export per-user audit logs.
              </p>
            </CardHeader>
            <CardContent>
              {logList.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No audit logs. Activity will appear here as users perform actions.
                </p>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-y-auto divide-y divide-white/[0.03]">
                  {logList.map((log) => (
                    <li
                      key={log?.id ?? ""}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <div>
                        <span className="font-medium">{log?.action ?? "—"}</span>
                        <span className="text-muted-foreground"> · {log?.resource ?? "—"}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {log?.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AnimatedPage>
  );
}
