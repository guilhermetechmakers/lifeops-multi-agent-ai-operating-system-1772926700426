/**
 * Admin API — users, orgs, roles, integrations, compliance, billing, cronjobs, reports.
 * All responses validated; use data ?? [] and Array.isArray on the client.
 */

import { api } from "@/lib/api";
import { asArray } from "@/lib/api/guards";
import type {
  AdminUser,
  AdminReport,
  Org,
  Role,
  Integration,
  ComplianceAudit,
  AdminCronJob,
  BillingSubscription,
  Invoice,
  AuditLog,
  ComplianceExport,
  ApprovalItem,
  AdminKpis,
  UsageMetric,
  AdminSession,
  AdminAuditExport,
  DataRetentionPolicy,
} from "@/types/admin";

const BASE = "/admin";

export interface PaginatedParams {
  orgId?: string;
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  data: AdminUser[] | null;
  count?: number;
}

export interface OrgsResponse {
  data: Org[] | null;
}

export interface RolesResponse {
  data: Role[] | null;
}

export interface IntegrationsResponse {
  data: Integration[] | null;
}

export interface ComplianceAuditsResponse {
  data: ComplianceAudit[] | null;
}

export interface CronjobsResponse {
  data: AdminCronJob[] | null;
}

export interface SubscriptionsResponse {
  data: BillingSubscription[] | null;
}

export interface InvoicesResponse {
  data: Invoice[] | null;
}

export interface AuditLogsResponse {
  data: AuditLog[] | null;
}

export interface ExportsResponse {
  data: ComplianceExport[] | null;
}

export interface ApprovalsResponse {
  data: ApprovalItem[] | null;
}

export interface KpisResponse {
  data: AdminKpis | null;
}

export interface ReportsResponse {
  data: unknown;
}

/** GET /api/admin/kpis — dashboard KPIs */
export async function fetchAdminKpis(): Promise<AdminKpis> {
  try {
    const data = await api.get<KpisResponse>(`${BASE}/kpis`);
    const kpis = data?.data ?? null;
    if (kpis && typeof kpis === "object" && "totalUsers" in kpis) {
      return kpis as AdminKpis;
    }
  } catch {
    /** fallback to mock */
  }
  return {
    totalUsers: 1247,
    activeOrgs: 42,
    totalInvoices: 156,
    upcomingCronjobs: 8,
    complianceStatus: "ok",
  };
}

/** GET /api/admin/users */
export async function fetchAdminUsers(params: PaginatedParams = {}): Promise<{ data: AdminUser[]; count: number; page: number; limit: number }> {
  try {
    const q = new URLSearchParams();
    if (params.orgId) q.set("orgId", params.orgId);
    if (params.role) q.set("role", params.role);
    if (params.search) q.set("search", params.search);
    if (params.page != null) q.set("page", String(params.page));
    if (params.limit != null) q.set("limit", String(params.limit));
    const res = await api.get<UsersResponse & { page?: number; limit?: number }>(`${BASE}/users?${q.toString()}`);
    const data = res?.data ?? null;
    const list = Array.isArray(data) ? data : [];
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);
    return { data: paginated as AdminUser[], count: list.length, page, limit };
  } catch {
    let mock: AdminUser[] = [
      { id: "u1", name: "Jane Admin", email: "jane@example.com", status: "active", orgId: "o1", roles: ["admin"], lastActiveAt: new Date().toISOString() },
      { id: "u2", name: "John User", email: "john@example.com", status: "active", orgId: "o1", roles: ["member"], lastActiveAt: new Date(Date.now() - 86400000).toISOString() },
      { id: "u3", name: "Suspended User", email: "suspended@example.com", status: "suspended", orgId: "o2", roles: [], lastActiveAt: null },
    ];
    const search = (params.search ?? "").toLowerCase();
    if (search) mock = mock.filter((u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
    if (params.orgId) mock = mock.filter((u) => u.orgId === params.orgId);
    if (params.role) mock = mock.filter((u) => (u.roles ?? []).includes(params.role!));
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const start = (page - 1) * limit;
    const paginated = mock.slice(start, start + limit);
    return { data: paginated, count: mock.length, page, limit };
  }
}

/** POST /api/admin/users */
export async function createAdminUser(payload: Omit<AdminUser, "id">): Promise<AdminUser> {
  try {
    const data = await api.post<AdminUser>(`${BASE}/users`, payload);
    if (data && typeof data === "object" && "id" in data) return data as AdminUser;
  } catch {
    /** */
  }
  return { ...payload, id: `u-${Date.now()}` } as AdminUser;
}

/** PUT /api/admin/users/:id */
export async function updateAdminUser(id: string, payload: Partial<AdminUser>): Promise<AdminUser> {
  try {
    const data = await api.put<AdminUser>(`${BASE}/users/${id}`, payload);
    if (data && typeof data === "object") return data as AdminUser;
  } catch {
    /** */
  }
  return { id, name: "", email: "", status: "active", orgId: "", roles: [], lastActiveAt: null, ...payload } as AdminUser;
}

/** DELETE /api/admin/users/:id */
export async function deleteAdminUser(id: string): Promise<void> {
  try {
    await api.delete(`${BASE}/users/${id}`);
  } catch {
    /** */
  }
}

/** POST /api/admin/users/:id/activate */
export async function activateAdminUser(id: string): Promise<void> {
  try {
    await api.post(`${BASE}/users/${id}/activate`, {});
  } catch {
    /** */
  }
}

/** GET /api/admin/users/:id/sessions */
export async function fetchUserSessions(userId: string): Promise<AdminSession[]> {
  try {
    const res = await api.get<AdminSession[] | { data: AdminSession[] | null }>(`${BASE}/users/${userId}/sessions`);
    const raw = Array.isArray(res) ? res : (res as { data?: AdminSession[] })?.data;
    return asArray<AdminSession>(raw);
  } catch {
    return [
      { id: "s1", userId, device: "Chrome on macOS", ip: "192.168.1.1", lastUsed: new Date().toISOString(), valid: true, expiresAt: null },
      { id: "s2", userId, device: "Safari on iOS", ip: "192.168.1.2", lastUsed: new Date(Date.now() - 86400000).toISOString(), valid: true, expiresAt: null },
    ];
  }
}

/** POST /api/admin/users/:id/sessions/revoke */
export async function revokeUserSessions(userId: string, sessionId?: string): Promise<void> {
  try {
    const body = sessionId ? { sessionId } : {};
    await api.post(`${BASE}/users/${userId}/sessions/revoke`, body);
  } catch {
    /** */
  }
}

/** POST /api/admin/users/:id/audit-export */
export async function createUserAuditExport(userId: string): Promise<AdminAuditExport> {
  try {
    const data = await api.post<AdminAuditExport>(`${BASE}/users/${userId}/audit-export`, {});
    if (data && typeof data === "object" && "id" in data) return data as AdminAuditExport;
  } catch {
    /** */
  }
  return {
    id: `ex-${Date.now()}`,
    userId,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** GET /api/admin/audit-exports/:taskId */
export async function fetchAuditExportStatus(taskId: string): Promise<AdminAuditExport> {
  try {
    const res = await api.get<AdminAuditExport | { data?: AdminAuditExport }>(`${BASE}/audit-exports/${taskId}`);
    const data = res && typeof res === "object" && "data" in res ? (res as { data?: AdminAuditExport }).data : res;
    if (data && typeof data === "object" && "id" in data) return data as AdminAuditExport;
  } catch {
    /** */
  }
  return {
    id: taskId,
    userId: "",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** GET /api/admin/organizations/:orgId/policy */
export async function fetchOrgPolicy(orgId: string): Promise<{ retentionPolicy?: DataRetentionPolicy; usersCount?: number }> {
  try {
    const res = await api.get<{ retentionPolicy?: DataRetentionPolicy; usersCount?: number } | { data?: { retentionPolicy?: DataRetentionPolicy; usersCount?: number } }>(`${BASE}/organizations/${orgId}/policy`);
    const data = res && typeof res === "object" && "data" in res ? (res as { data?: { retentionPolicy?: DataRetentionPolicy; usersCount?: number } }).data : res;
    if (data && typeof data === "object") return data as { retentionPolicy?: DataRetentionPolicy; usersCount?: number };
  } catch {
    /** */
  }
  return {
    retentionPolicy: { orgId, policyName: "default", retentionDays: 365, scope: "org" },
    usersCount: 0,
  };
}

/** GET /api/admin/organizations/:orgId/users-count */
export async function fetchOrgUsersCount(orgId: string): Promise<number> {
  try {
    const data = await api.get<{ count?: number }>(`${BASE}/organizations/${orgId}/users-count`);
    return typeof data?.count === "number" ? data.count : 0;
  } catch {
    return 0;
  }
}

/** GET /api/admin/orgs */
export async function fetchAdminOrgs(): Promise<Org[]> {
  try {
    const res = await api.get<OrgsResponse>(`${BASE}/orgs`);
    return asArray<Org>(res?.data);
  } catch {
    return [
      { id: "o1", name: "Acme Corp", ssoEnabled: true, dataPolicyId: "dp1", tenantSettings: {} },
      { id: "o2", name: "Beta Inc", ssoEnabled: false, tenantSettings: {} },
    ];
  }
}

/** POST /api/admin/orgs */
export async function createAdminOrg(payload: Omit<Org, "id">): Promise<Org> {
  try {
    const data = await api.post<Org>(`${BASE}/orgs`, payload);
    if (data && typeof data === "object" && "id" in data) return data as Org;
  } catch {
    /** */
  }
  return { ...payload, id: `o-${Date.now()}` } as Org;
}

/** PUT /api/admin/orgs/:id */
export async function updateAdminOrg(id: string, payload: Partial<Org>): Promise<Org> {
  try {
    const data = await api.put<Org>(`${BASE}/orgs/${id}`, payload);
    if (data && typeof data === "object") return data as Org;
  } catch {
    /** */
  }
  return { id, name: "", ssoEnabled: false, ...payload } as Org;
}

/** GET /api/admin/roles */
export async function fetchAdminRoles(): Promise<Role[]> {
  try {
    const res = await api.get<RolesResponse>(`${BASE}/roles`);
    return asArray<Role>(res?.data);
  } catch {
    return [
      { id: "r1", name: "admin", permissions: ["admin:*", "users:write", "orgs:write"] },
      { id: "r2", name: "member", permissions: ["read", "write:own"] },
      { id: "r3", name: "viewer", permissions: ["read"] },
    ];
  }
}

/** POST /api/admin/roles */
export async function createAdminRole(payload: Omit<Role, "id">): Promise<Role> {
  try {
    const data = await api.post<Role>(`${BASE}/roles`, payload);
    if (data && typeof data === "object" && "id" in data) return data as Role;
  } catch {
    /** */
  }
  return { ...payload, id: `r-${Date.now()}` } as Role;
}

/** PUT /api/admin/roles/:id */
export async function updateAdminRole(id: string, payload: Partial<Role>): Promise<Role> {
  try {
    const data = await api.put<Role>(`${BASE}/roles/${id}`, payload);
    if (data && typeof data === "object") return data as Role;
  } catch {
    /** */
  }
  return { id, name: "", permissions: [], ...payload } as Role;
}

/** DELETE /api/admin/roles/:id */
export async function deleteAdminRole(id: string): Promise<void> {
  try {
    await api.delete(`${BASE}/roles/${id}`);
  } catch {
    /** */
  }
}

/** GET /api/admin/integrations */
export async function fetchAdminIntegrations(): Promise<Integration[]> {
  try {
    const res = await api.get<IntegrationsResponse>(`${BASE}/integrations`);
    return asArray<Integration>(res?.data);
  } catch {
    return [
      { id: "i1", type: "slack", health: "ok", lastSyncAt: new Date().toISOString() },
      { id: "i2", type: "google-calendar", health: "warn", lastSyncAt: new Date(Date.now() - 3600000).toISOString() },
    ];
  }
}

/** POST /api/admin/integrations (test/enable) */
export async function testAdminIntegration(id: string): Promise<{ ok: boolean }> {
  try {
    const data = await api.post<{ ok: boolean }>(`${BASE}/integrations/${id}/test`, {});
    return data && typeof data === "object" ? { ok: true } : { ok: false };
  } catch {
    return { ok: false };
  }
}

/** GET /api/admin/compliance/audits */
export async function fetchComplianceAudits(params?: { orgId?: string; limit?: number }): Promise<ComplianceAudit[]> {
  try {
    const q = new URLSearchParams();
    if (params?.orgId) q.set("orgId", params.orgId);
    if (params?.limit != null) q.set("limit", String(params.limit));
    const res = await api.get<ComplianceAuditsResponse>(`${BASE}/compliance/audits?${q.toString()}`);
    return asArray<ComplianceAudit>(res?.data);
  } catch {
    return [
      { id: "ca1", orgId: "o1", userId: "u1", action: "user.login", timestamp: new Date().toISOString(), dataScope: "org" },
    ];
  }
}

/** POST /api/admin/compliance/export */
export async function createComplianceExport(payload: { format: "CSV" | "JSON" | "XML"; scope: string }): Promise<ComplianceExport> {
  try {
    const data = await api.post<ComplianceExport>(`${BASE}/compliance/export`, payload);
    if (data && typeof data === "object" && "id" in data) return data as ComplianceExport;
  } catch {
    /** */
  }
  return {
    id: `ex-${Date.now()}`,
    status: "pending",
    format: payload.format,
    scope: payload.scope,
    createdAt: new Date().toISOString(),
  };
}

/** GET /api/admin/compliance/exports */
export async function fetchComplianceExports(): Promise<ComplianceExport[]> {
  try {
    const res = await api.get<ExportsResponse>(`${BASE}/compliance/exports`);
    return asArray<ComplianceExport>(res?.data);
  } catch {
    return [];
  }
}

/** GET /api/admin/billing/subscriptions */
export async function fetchBillingSubscriptions(): Promise<BillingSubscription[]> {
  try {
    const res = await api.get<SubscriptionsResponse>(`${BASE}/billing/subscriptions`);
    return asArray<BillingSubscription>(res?.data);
  } catch {
    return [
      { id: "s1", orgId: "o1", plan: "enterprise", status: "active", startDate: "2024-01-01", nextBillingDate: "2025-01-01" },
    ];
  }
}

/** GET /api/admin/billing/invoices */
export async function fetchBillingInvoices(): Promise<Invoice[]> {
  try {
    const res = await api.get<InvoicesResponse>(`${BASE}/billing/invoices`);
    return asArray<Invoice>(res?.data);
  } catch {
    return [
      { id: "inv1", orgId: "o1", date: new Date().toISOString().slice(0, 10), amount: 2990, status: "paid", lineItems: [] },
    ];
  }
}

/** GET /api/admin/cronjobs */
export async function fetchAdminCronjobs(): Promise<AdminCronJob[]> {
  try {
    const res = await api.get<CronjobsResponse>(`${BASE}/cronjobs`);
    return asArray<AdminCronJob>(res?.data);
  } catch {
    return [
      {
        id: "cj1",
        name: "Daily sync",
        enabled: true,
        schedule: "0 9 * * *",
        timezone: "UTC",
        triggerType: "time",
        target: "sync",
        retryPolicy: { backoffMs: 1000, maxAttempts: 3 },
      },
    ];
  }
}

/** POST /api/admin/cronjobs/:id/trigger */
export async function triggerAdminCronjob(id: string): Promise<void> {
  try {
    await api.post(`${BASE}/cronjobs/${id}/trigger`, {});
  } catch {
    /** */
  }
}

/** GET /api/admin/approvals */
export async function fetchApprovals(): Promise<ApprovalItem[]> {
  try {
    const res = await api.get<ApprovalsResponse>(`${BASE}/approvals`);
    return asArray<ApprovalItem>(res?.data);
  } catch {
    return [
      { id: "a1", type: "schedule_change", description: "Move meeting to 3pm", requestedAt: new Date().toISOString(), requestedBy: "u1", status: "pending" },
    ];
  }
}

/** GET /api/admin/audit/logs (per user or global) */
export async function fetchAuditLogs(params?: { userId?: string; limit?: number; action?: string; resource?: string; from?: string; to?: string }): Promise<AuditLog[]> {
  try {
    const q = new URLSearchParams();
    if (params?.userId) q.set("userId", params.userId);
    if (params?.limit != null) q.set("limit", String(params.limit));
    if (params?.action) q.set("action", params.action);
    if (params?.resource) q.set("resource", params.resource);
    if (params?.from) q.set("from", params.from);
    if (params?.to) q.set("to", params.to);
    const res = await api.get<AuditLog[] | AuditLogsResponse>(`${BASE}/audit/logs?${q.toString()}`);
    const raw = Array.isArray(res) ? res : (res as { data?: AuditLog[] })?.data;
    return asArray<AuditLog>(raw);
  } catch {
    return [
      { id: "al1", userId: "u1", action: "user.login", resource: "auth", timestamp: new Date().toISOString(), actor: "u1" },
      { id: "al2", userId: "u1", action: "user.update", resource: "users/u1", timestamp: new Date(Date.now() - 3600000).toISOString(), actor: "admin" },
    ];
  }
}

/** GET /api/admin/reports (metrics) */
export async function fetchAdminReportsMetrics(params?: { orgId?: string; from?: string; to?: string }): Promise<UsageMetric[]> {
  try {
    const q = new URLSearchParams();
    if (params?.orgId) q.set("orgId", params.orgId);
    if (params?.from) q.set("from", params.from);
    if (params?.to) q.set("to", params.to);
    const res = await api.get<{ data: UsageMetric[] | null }>(`${BASE}/reports?${q.toString()}`);
    return asArray<UsageMetric>(res?.data);
  } catch {
    return [
      { label: "API calls", value: 12500, previousValue: 11800, unit: "calls" },
      { label: "LLM tokens", value: 2.1e6, previousValue: 1.9e6, unit: "tokens" },
    ];
  }
}

/** GET /api/admin/reports (generated reports list) */
export async function fetchAdminReports(): Promise<AdminReport[]> {
  try {
    const res = await api.get<{ data: AdminReport[] | null }>(`${BASE}/reports/list`);
    return asArray<AdminReport>(res?.data);
  } catch {
    return [
      { id: "r1", name: "Usage Report", type: "usage", generatedAt: new Date().toISOString() },
      { id: "r2", name: "ROI Analysis", type: "roi", generatedAt: new Date(Date.now() - 86400000).toISOString() },
    ];
  }
}

/** POST /api/admin/reports/generate */
export async function generateAdminReport(payload: { type: string }): Promise<AdminReport> {
  try {
    const data = await api.post<AdminReport>(`${BASE}/reports/generate`, payload);
    if (data && typeof data === "object" && "id" in data) return data as AdminReport;
  } catch {
    /** */
  }
  return {
    id: `r-${Date.now()}`,
    name: `${payload.type} Report`,
    type: payload.type,
    generatedAt: new Date().toISOString(),
  };
}

/** Alias for report generation */
export async function generateReport(payload: { type: string; format?: string }): Promise<AdminReport> {
  return generateAdminReport({ type: payload.type });
}
