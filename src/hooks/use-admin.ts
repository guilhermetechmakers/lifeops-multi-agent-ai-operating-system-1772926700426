/**
 * Admin dashboard hooks — KPIs, users, orgs, roles, integrations, compliance, billing, cronjobs, reports.
 * All array/object access guarded; useState<T[]>([]) for list state.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as adminApi from "@/api/admin";
import type { PaginatedParams } from "@/api/admin";
import type { AdminUser, Org, Role } from "@/types/admin";

const keys = {
  kpis: () => ["admin", "kpis"] as const,
  users: (p: PaginatedParams) => ["admin", "users", p] as const,
  orgs: () => ["admin", "orgs"] as const,
  roles: () => ["admin", "roles"] as const,
  integrations: () => ["admin", "integrations"] as const,
  complianceAudits: (p?: { orgId?: string; limit?: number }) => ["admin", "compliance", "audits", p] as const,
  complianceExports: () => ["admin", "compliance", "exports"] as const,
  subscriptions: () => ["admin", "billing", "subscriptions"] as const,
  invoices: () => ["admin", "billing", "invoices"] as const,
  cronjobs: () => ["admin", "cronjobs"] as const,
  approvals: () => ["admin", "approvals"] as const,
  auditLogs: (p?: { userId?: string; limit?: number; action?: string; resource?: string; from?: string; to?: string }) => ["admin", "audit", "logs", p] as const,
  reports: (p?: { orgId?: string; from?: string; to?: string }) => ["admin", "reports", p] as const,
  userSessions: (userId: string) => ["admin", "users", userId, "sessions"] as const,
  allSessions: () => ["admin", "sessions"] as const,
  auditExport: (taskId: string) => ["admin", "audit-exports", taskId] as const,
  orgPolicy: (orgId: string) => ["admin", "organizations", orgId, "policy"] as const,
  orgUsersCount: (orgId: string) => ["admin", "organizations", orgId, "users-count"] as const,
};

export function useAdminKpis() {
  return useQuery({
    queryKey: keys.kpis(),
    queryFn: () => adminApi.fetchAdminKpis(),
    staleTime: 60 * 1000,
  });
}

export function useAdminUsers(params: PaginatedParams = {}) {
  const query = useQuery({
    queryKey: keys.users(params),
    queryFn: () => adminApi.fetchAdminUsers(params),
    staleTime: 30 * 1000,
  });
  const data = query.data ?? { data: [], count: 0 };
  const list = Array.isArray(data.data) ? data.data : [];
  const count = typeof data.count === "number" ? data.count : list.length;
  return { ...query, users: list, data: list, count };
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<AdminUser, "id">) => adminApi.createAdminUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User created");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create user"),
  });
}

export function useUpdateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminUser> }) =>
      adminApi.updateAdminUser(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update user"),
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAdminUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User removed");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to remove user"),
  });
}

export function useActivateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.activateAdminUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User activated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update status"),
  });
}

export function useAdminOrgs() {
  const query = useQuery({
    queryKey: keys.orgs(),
    queryFn: () => adminApi.fetchAdminOrgs(),
    staleTime: 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, orgs: list, data: list };
}

export function useCreateAdminOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Org, "id">) => adminApi.createAdminOrg(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.orgs() });
      toast.success("Organization created");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create organization"),
  });
}

export function useUpdateAdminOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Org> }) => adminApi.updateAdminOrg(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.orgs() });
      toast.success("Organization updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update organization"),
  });
}

export function useAdminRoles() {
  const query = useQuery({
    queryKey: keys.roles(),
    queryFn: () => adminApi.fetchAdminRoles(),
    staleTime: 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, roles: list, data: list };
}

export function useCreateAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Role, "id">) => adminApi.createAdminRole(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.roles() });
      toast.success("Role created");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create role"),
  });
}

export function useUpdateAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Role> }) => adminApi.updateAdminRole(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.roles() });
      toast.success("Role updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update role"),
  });
}

export function useDeleteAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAdminRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.roles() });
      toast.success("Role deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete role"),
  });
}

export function useAdminIntegrations() {
  const query = useQuery({
    queryKey: keys.integrations(),
    queryFn: () => adminApi.fetchAdminIntegrations(),
    staleTime: 30 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, integrations: list, data: list };
}

export function useTestAdminIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.testAdminIntegration(id),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: keys.integrations() });
      toast.success(result?.ok ? "Connection successful" : "Connection failed");
    },
    onError: () => toast.error("Test failed"),
  });
}

export function useComplianceAudits(params?: { orgId?: string; limit?: number }) {
  const query = useQuery({
    queryKey: keys.complianceAudits(params),
    queryFn: () => adminApi.fetchComplianceAudits(params),
    staleTime: 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, audits: list, data: list };
}

export function useComplianceExports() {
  const query = useQuery({
    queryKey: keys.complianceExports(),
    queryFn: () => adminApi.fetchComplianceExports(),
    staleTime: 30 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, exports: list, data: list };
}

export function useCreateComplianceExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { format: "CSV" | "JSON" | "XML"; scope: string }) => adminApi.createComplianceExport(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.complianceExports() });
      toast.success("Export started");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Export failed"),
  });
}

export function useBillingSubscriptions() {
  const query = useQuery({
    queryKey: keys.subscriptions(),
    queryFn: () => adminApi.fetchBillingSubscriptions(),
    staleTime: 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, subscriptions: list, data: list };
}

export function useBillingInvoices() {
  const query = useQuery({
    queryKey: keys.invoices(),
    queryFn: () => adminApi.fetchBillingInvoices(),
    staleTime: 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, invoices: list, data: list };
}

export function useAdminCronjobs() {
  const query = useQuery({
    queryKey: keys.cronjobs(),
    queryFn: () => adminApi.fetchAdminCronjobs(),
    staleTime: 30 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, cronjobs: list, data: list };
}

export function useTriggerAdminCronjob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.triggerAdminCronjob(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.cronjobs() });
      toast.success("Cronjob triggered");
    },
    onError: () => toast.error("Trigger failed"),
  });
}

export function useApprovals() {
  const query = useQuery({
    queryKey: keys.approvals(),
    queryFn: () => adminApi.fetchApprovals(),
    staleTime: 30 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, approvals: list, data: list };
}

export function useAuditLogs(params?: { userId?: string; limit?: number; action?: string; resource?: string; from?: string; to?: string }) {
  const query = useQuery({
    queryKey: keys.auditLogs(params),
    queryFn: () => adminApi.fetchAuditLogs(params),
    staleTime: 30 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, logs: list, data: list };
}

export function useAdminReports() {
  const query = useQuery({
    queryKey: keys.reports(),
    queryFn: () => adminApi.fetchAdminReports(),
    staleTime: 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, metrics: list, data: list };
}

export function useAdminReportsMetrics(params?: { orgId?: string; from?: string; to?: string }) {
  const query = useQuery({
    queryKey: [...keys.reports(params), "metrics"],
    queryFn: () => adminApi.fetchAdminReportsMetrics(params),
    staleTime: 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, metrics: list, data: list };
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { type: string; format?: string }) => adminApi.generateReport(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "reports"] });
      toast.success("Report generated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Report generation failed"),
  });
}

export function useAllSessions() {
  const query = useQuery({
    queryKey: keys.allSessions(),
    queryFn: () => adminApi.fetchAllSessions(),
    staleTime: 30 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, sessions: list, data: list };
}

export function useUserSessions(userId: string | null) {
  const query = useQuery({
    queryKey: keys.userSessions(userId ?? ""),
    queryFn: () => adminApi.fetchUserSessions(userId ?? ""),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, sessions: list, data: list };
}

export function useRevokeUserSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, sessionId }: { userId: string; sessionId?: string }) =>
      adminApi.revokeUserSessions(userId, sessionId),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: keys.userSessions(userId) });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Sessions revoked");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to revoke sessions"),
  });
}

export function useCreateUserAuditExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.createUserAuditExport(userId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: keys.auditExport(data?.id ?? "") });
      toast.success("Audit export started");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Export failed"),
  });
}

export function useAuditExportStatus(taskId: string | null) {
  const query = useQuery({
    queryKey: keys.auditExport(taskId ?? ""),
    queryFn: () => adminApi.fetchAuditExportStatus(taskId ?? ""),
    enabled: !!taskId,
    refetchInterval: (q) => {
      const d = q.state?.data as { status?: string } | undefined;
      return d?.status === "pending" || d?.status === "in-progress" ? 2000 : false;
    },
  });
  return query;
}

export function useOrgPolicy(orgId: string | null) {
  const query = useQuery({
    queryKey: keys.orgPolicy(orgId ?? ""),
    queryFn: () => adminApi.fetchOrgPolicy(orgId ?? ""),
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
  return query;
}

export function useOrgUsersCount(orgId: string | null) {
  const query = useQuery({
    queryKey: keys.orgUsersCount(orgId ?? ""),
    queryFn: () => (orgId ? adminApi.fetchOrgUsersCount(orgId) : Promise.resolve(0)),
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
  return { ...query, count: typeof query.data === "number" ? query.data : 0 };
}
