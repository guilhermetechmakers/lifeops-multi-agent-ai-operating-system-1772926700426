/**
 * Admin Dashboard data models.
 * All types align with API response shapes; use safe guards when consuming.
 */

export type UserStatus = "active" | "suspended" | "disabled";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  orgId: string;
  roles: string[];
  lastActiveAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Session entity for user session management */
export interface AdminSession {
  id: string;
  userId: string;
  device: string;
  ip: string;
  lastUsed: string;
  valid: boolean;
  expiresAt: string | null;
}

/** Per-user audit log entry */
export interface AdminAuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  actor: string;
  details?: Record<string, unknown>;
  cronjobRunId?: string;
}

/** Audit export task for compliance */
export interface AdminAuditExport {
  id: string;
  userId: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
  exportUrl?: string;
  reason?: string;
}

/** Data retention policy for org/user scope */
export interface DataRetentionPolicy {
  orgId: string;
  policyName: string;
  retentionDays: number;
  scope: "org" | "user";
}

/** Alias for per-user audit log entries */
export type AdminAuditLog = AdminAuditLogEntry | AuditLog;

export interface Org {
  id: string;
  name: string;
  ssoEnabled: boolean;
  dataPolicyId?: string;
  tenantSettings?: Record<string, unknown>;
  policies?: Record<string, unknown>;
  retentionPolicy?: DataRetentionPolicy;
  usersCount?: number;
}

/** Alias for API compatibility */
export type AdminOrg = Org;

export interface RoleScope {
  resourceType: string;
  resourceId?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  scope?: RoleScope[];
  inheritedFromOrg?: boolean;
}

/** Alias for API compatibility */
export type AdminRole = Role;

export type IntegrationHealth = "ok" | "warn" | "error";

export interface Integration {
  id: string;
  type: string;
  config?: Record<string, unknown>;
  health: IntegrationHealth;
  lastSyncAt?: string;
}

/** Alias for API compatibility */
export type AdminIntegration = Integration;

export interface ComplianceAudit {
  id: string;
  orgId: string;
  userId: string;
  action: string;
  timestamp: string;
  dataScope: string;
}

export type CronjobTriggerType = "time" | "event" | "conditional";

export interface CronjobRetryPolicy {
  backoffMs: number;
  maxAttempts: number;
}

export interface AdminCronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: string;
  timezone: string;
  triggerType: CronjobTriggerType;
  target: string;
  inputPayload?: Record<string, unknown>;
  permissions?: string;
  constraints?: Record<string, unknown>;
  safetyRails?: Record<string, unknown>;
  retryPolicy?: CronjobRetryPolicy;
  outputs?: Record<string, unknown>;
}

export interface BillingSubscription {
  id: string;
  orgId: string;
  plan: string;
  status: string;
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
}

export interface Invoice {
  id: string;
  orgId: string;
  date: string;
  amount: number;
  status: string;
  lineItems?: unknown[];
}

/** Alias for API compatibility */
export type AdminInvoice = Invoice;

export interface AuditLog {
  id: string;
  orgId?: string;
  userId: string;
  action: string;
  timestamp: string;
  resource: string;
  actor?: string;
  changes?: unknown;
  details?: Record<string, unknown>;
  cronjobRunId?: string;
}

export interface ComplianceExport {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  format: "CSV" | "JSON" | "XML";
  scope: string;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

export interface ApprovalItem {
  id: string;
  type: string;
  description: string;
  requestedAt: string;
  requestedBy: string;
  status: "pending" | "approved" | "denied";
}

export interface AdminKpis {
  totalUsers: number;
  activeOrgs: number;
  totalInvoices: number;
  upcomingCronjobs: number;
  complianceStatus: "ok" | "warn" | "error" | "pending";
}

/** Alias for API compatibility */
export type AdminKPIs = AdminKpis;

export interface AdminReport {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
}

export interface UsageMetric {
  label: string;
  value: number;
  previousValue?: number;
  unit?: string;
}
