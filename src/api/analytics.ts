/**
 * Analytics API — usage, ROI, cronjobs, agents, financial, reports.
 * Mock implementation; responses validated with Array.isArray and (data ?? []).
 */

import { api } from "@/lib/api";
import type {
  UsageMetric,
  ROIMetric,
  CronjobHealth,
  AgentPerformance,
  FinancialForecast,
  ReportTemplate,
  ScheduledReport,
  OrgOption,
} from "@/types/analytics";

export interface AnalyticsParams {
  orgId?: string;
  range?: string;
  from?: string;
  to?: string;
}

/** Normalize API response to array. */
function asList<T>(data: unknown): T[] {
  const raw = data ?? [];
  return Array.isArray(raw) ? (raw as T[]) : [];
}

/** Mock usage metrics for demo. */
const MOCK_USAGE: UsageMetric[] = [
  { date: "2025-03-01", mau: 1240, dau: 420, sessions: 1850, avgSession: 12.4 },
  { date: "2025-03-02", mau: 1250, dau: 435, sessions: 1920, avgSession: 12.8 },
  { date: "2025-03-03", mau: 1260, dau: 448, sessions: 1980, avgSession: 13.1 },
  { date: "2025-03-04", mau: 1270, dau: 460, sessions: 2050, avgSession: 13.2 },
  { date: "2025-03-05", mau: 1280, dau: 472, sessions: 2100, avgSession: 13.4 },
  { date: "2025-03-06", mau: 1290, dau: 380, sessions: 1650, avgSession: 12.1 },
  { date: "2025-03-07", mau: 1300, dau: 350, sessions: 1420, avgSession: 11.8 },
];

/** Mock ROI metrics. */
const MOCK_ROI: ROIMetric[] = [
  { date: "2025-03-01", timeSaved: 420, actionsSaved: 180, automationCount: 95, manualCount: 85, costSavings: 1200 },
  { date: "2025-03-02", timeSaved: 435, actionsSaved: 192, automationCount: 102, manualCount: 90, costSavings: 1280 },
  { date: "2025-03-03", timeSaved: 448, actionsSaved: 198, automationCount: 108, manualCount: 90, costSavings: 1320 },
  { date: "2025-03-04", timeSaved: 460, actionsSaved: 205, automationCount: 112, manualCount: 93, costSavings: 1380 },
  { date: "2025-03-05", timeSaved: 472, actionsSaved: 210, automationCount: 115, manualCount: 95, costSavings: 1420 },
  { date: "2025-03-06", timeSaved: 380, actionsSaved: 165, automationCount: 88, manualCount: 77, costSavings: 1100 },
  { date: "2025-03-07", timeSaved: 350, actionsSaved: 142, automationCount: 78, manualCount: 64, costSavings: 980 },
];

/** Mock cronjob health. */
const MOCK_CRONJOBS: CronjobHealth[] = [
  {
    id: "c1",
    name: "Daily sync",
    enabled: true,
    scheduleCron: "0 6 * * *",
    timezone: "UTC",
    nextRun: "2025-03-08T06:00:00Z",
    lastRun: "2025-03-07T06:00:00Z",
    status: "success",
    latency: 1240,
    retries: 0,
    runs: [
      { id: "r1", cronjobId: "c1", runAt: "2025-03-07T06:00:00Z", status: "success", durationMs: 1240 },
      { id: "r2", cronjobId: "c1", runAt: "2025-03-06T06:00:00Z", status: "success", durationMs: 1180 },
    ],
  },
  {
    id: "c2",
    name: "Weekly report",
    enabled: true,
    scheduleCron: "0 9 * * 1",
    timezone: "UTC",
    nextRun: "2025-03-10T09:00:00Z",
    lastRun: "2025-03-03T09:00:00Z",
    status: "success",
    latency: 3200,
    retries: 0,
    runs: [
      { id: "r3", cronjobId: "c2", runAt: "2025-03-03T09:00:00Z", status: "success", durationMs: 3200 },
    ],
  },
  {
    id: "c3",
    name: "Hourly cleanup",
    enabled: true,
    scheduleCron: "0 * * * *",
    timezone: "UTC",
    nextRun: "2025-03-08T08:00:00Z",
    lastRun: "2025-03-08T07:00:00Z",
    status: "failure",
    latency: 450,
    retries: 2,
    runs: [
      { id: "r4", cronjobId: "c3", runAt: "2025-03-08T07:00:00Z", status: "failure", durationMs: 450, errors: "Timeout" },
    ],
  },
];

/** Mock agent performance. */
const MOCK_AGENTS: AgentPerformance[] = [
  { agentId: "a1", name: "Content Generator", successCount: 245, failureCount: 8, avgRuntimeMs: 3200, errorTypes: ["rate_limit", "timeout"] },
  { agentId: "a2", name: "Data Sync", successCount: 512, failureCount: 3, avgRuntimeMs: 1800, errorTypes: ["network"] },
  { agentId: "a3", name: "Report Builder", successCount: 89, failureCount: 12, avgRuntimeMs: 5400, errorTypes: ["validation", "timeout"] },
];

/** Mock financial forecast. */
const MOCK_FINANCIAL: FinancialForecast[] = [
  { date: "2025-03-01", forecastAmount: 12500, savings: 3200, costs: 9300 },
  { date: "2025-03-02", forecastAmount: 12600, savings: 3280, costs: 9320 },
  { date: "2025-03-03", forecastAmount: 12700, savings: 3320, costs: 9380 },
  { date: "2025-03-04", forecastAmount: 12800, savings: 3380, costs: 9420 },
  { date: "2025-03-05", forecastAmount: 12900, savings: 3420, costs: 9480 },
  { date: "2025-03-06", forecastAmount: 13000, savings: 3100, costs: 9900 },
  { date: "2025-03-07", forecastAmount: 13100, savings: 2980, costs: 10120 },
];

/** Mock report templates. */
const MOCK_TEMPLATES: ReportTemplate[] = [
  { id: "t1", name: "Usage summary", type: "usage", format: "CSV" },
  { id: "t2", name: "ROI overview", type: "roi", format: "PDF" },
  { id: "t3", name: "Cronjob health", type: "cronjobs", format: "CSV" },
  { id: "t4", name: "Agent performance", type: "agents", format: "PDF" },
  { id: "t5", name: "Financial impact", type: "financial", format: "CSV" },
];

/** Mock scheduled reports. */
const MOCK_SCHEDULED: ScheduledReport[] = [
  { id: "s1", templateId: "t1", templateName: "Usage summary", cadence: "daily", timezone: "UTC", nextRun: "2025-03-08T08:00:00Z", enabled: true },
  { id: "s2", templateId: "t2", templateName: "ROI overview", cadence: "weekly", timezone: "UTC", nextRun: "2025-03-10T09:00:00Z", enabled: true },
];

/** Mock orgs. */
const MOCK_ORGS: OrgOption[] = [
  { id: "org1", name: "Default org" },
  { id: "org2", name: "Enterprise" },
];

async function fetchWithFallback<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const res = await api.get<{ data?: T } | T>(endpoint);
    if (res && typeof res === "object" && "data" in res) {
      const d = (res as { data?: T }).data;
      return d ?? fallback;
    }
    return (res as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function fetchUsageMetrics(params?: AnalyticsParams): Promise<UsageMetric[]> {
  const res = await fetchWithFallback<UsageMetric[] | { data?: UsageMetric[] }>(
    `/analytics/usage?orgId=${params?.orgId ?? ""}&range=${params?.range ?? "7d"}`,
    MOCK_USAGE
  );
  return asList(Array.isArray(res) ? res : res?.data);
}

export async function fetchROIMetrics(params?: AnalyticsParams): Promise<ROIMetric[]> {
  const res = await fetchWithFallback<ROIMetric[] | { data?: ROIMetric[] }>(
    `/analytics/roi?orgId=${params?.orgId ?? ""}&range=${params?.range ?? "7d"}`,
    MOCK_ROI
  );
  return asList(Array.isArray(res) ? res : res?.data);
}

export async function fetchCronjobHealth(params?: AnalyticsParams): Promise<CronjobHealth[]> {
  const res = await fetchWithFallback<CronjobHealth[] | { data?: CronjobHealth[] }>(
    `/analytics/cronjobs?orgId=${params?.orgId ?? ""}`,
    MOCK_CRONJOBS
  );
  return asList(Array.isArray(res) ? res : res?.data);
}

export async function fetchAgentPerformance(params?: AnalyticsParams): Promise<AgentPerformance[]> {
  const res = await fetchWithFallback<AgentPerformance[] | { data?: AgentPerformance[] }>(
    `/analytics/agents?orgId=${params?.orgId ?? ""}&range=${params?.range ?? "7d"}`,
    MOCK_AGENTS
  );
  return asList(Array.isArray(res) ? res : res?.data);
}

export async function fetchFinancialImpact(params?: AnalyticsParams): Promise<FinancialForecast[]> {
  const res = await fetchWithFallback<FinancialForecast[] | { data?: FinancialForecast[] }>(
    `/analytics/financial?orgId=${params?.orgId ?? ""}&range=${params?.range ?? "7d"}`,
    MOCK_FINANCIAL
  );
  return asList(Array.isArray(res) ? res : res?.data);
}

export async function fetchReportTemplates(): Promise<ReportTemplate[]> {
  const res = await fetchWithFallback<ReportTemplate[] | { data?: ReportTemplate[] }>(
    "/reports/templates",
    MOCK_TEMPLATES
  );
  return asList(Array.isArray(res) ? res : res?.data);
}

export async function fetchScheduledReports(): Promise<ScheduledReport[]> {
  const res = await fetchWithFallback<ScheduledReport[] | { data?: ScheduledReport[] }>(
    "/reports/scheduled",
    MOCK_SCHEDULED
  );
  return asList(Array.isArray(res) ? res : res?.data);
}

export async function fetchOrgs(): Promise<OrgOption[]> {
  const res = await fetchWithFallback<OrgOption[] | { data?: OrgOption[] }>(
    "/admin/orgs",
    MOCK_ORGS
  );
  return asList(Array.isArray(res) ? res : res?.data);
}

export async function generateReport(payload: { type: string; format?: "PDF" | "CSV"; templateId?: string }): Promise<{ id: string; status: string }> {
  try {
    return await api.post<{ id: string; status: string }>("/reports/generate", payload);
  } catch {
    return { id: "mock-" + Date.now(), status: "completed" };
  }
}

export async function scheduleReport(payload: {
  templateId: string;
  cadence: "daily" | "weekly" | "monthly";
  timezone: string;
}): Promise<ScheduledReport> {
  try {
    return await api.post<ScheduledReport>("/reports/schedule", payload);
  } catch {
    return {
      id: "s-new",
      templateId: payload.templateId,
      templateName: "New report",
      cadence: payload.cadence,
      timezone: payload.timezone,
      nextRun: new Date().toISOString(),
      enabled: true,
    };
  }
}
