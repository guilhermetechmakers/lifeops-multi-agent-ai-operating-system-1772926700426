/**
 * Admin Dashboard data models.
 * All types align with API response shapes; use safe guards when consuming.
 */

export type UserStatus = "active" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  orgId: string;
  roles: string[];
  lastActiveAt: string | null;
}

export interface Org {
  id: string;
  name: string;
  ssoEnabled: boolean;
  dataPolicyId?: string;
  tenantSettings?: Record<string, unknown>;
}

/** Alias for API compatibility */
export type AdminOrg = Org;

export interface Role {
  id: string;
  name: string;
  permissions: string[];
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
  orgId: string;
  userId: string;
  action: string;
  timestamp: string;
  resource: string;
  changes?: unknown;
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
