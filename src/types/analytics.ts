/**
 * Analytics & Reports — Type definitions for usage, ROI, cronjobs, agents, financial.
 * All shapes validated; use (data ?? []) and Array.isArray on consumption.
 */

export interface UsageMetric {
  date: string;
  mau: number;
  dau: number;
  sessions: number;
  avgSession: number;
}

export interface ROIMetric {
  orgId?: string;
  date: string;
  timeSaved: number;
  actionsSaved: number;
  automationCount: number;
  manualCount: number;
  costSavings?: number;
}

export interface CronjobRun {
  id: string;
  cronjobId: string;
  runAt: string;
  status: "success" | "failure" | "pending" | "running";
  durationMs?: number;
  logs?: string;
  artifacts?: unknown;
  errors?: string;
}

export interface CronjobHealth {
  id: string;
  name: string;
  enabled: boolean;
  scheduleCron?: string;
  timezone?: string;
  nextRun?: string;
  lastRun?: string;
  status?: "success" | "failure" | "pending" | "running";
  latency?: number;
  retries?: number;
  runs?: CronjobRun[];
}

export interface AgentPerformance {
  agentId: string;
  orgId?: string;
  name: string;
  date?: string;
  successCount: number;
  failureCount: number;
  avgRuntimeMs: number;
  errorTypes?: string[];
}

export interface FinancialForecast {
  orgId?: string;
  date: string;
  forecastAmount: number;
  savings: number;
  costs: number;
}

export interface AuditLogEntry {
  id: string;
  orgId?: string;
  action: string;
  timestamp: string;
  userId?: string;
  subject?: string;
  details?: unknown;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: "usage" | "roi" | "cronjobs" | "agents" | "financial" | "audit";
  format: "PDF" | "CSV";
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  cadence: "daily" | "weekly" | "monthly";
  timezone: string;
  nextRun: string;
  enabled: boolean;
}

export interface OrgOption {
  id: string;
  name: string;
}
