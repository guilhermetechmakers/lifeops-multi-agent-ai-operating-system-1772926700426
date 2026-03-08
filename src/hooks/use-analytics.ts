/**
 * Analytics & Reports hooks — usage, ROI, cronjobs, agents, financial, reports.
 * All array operations guarded; useState<T[]>([]) for list state.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as analyticsApi from "@/api/analytics";
import type { AnalyticsParams } from "@/api/analytics";

const keys = {
  usage: (p?: AnalyticsParams) => ["analytics", "usage", p] as const,
  roi: (p?: AnalyticsParams) => ["analytics", "roi", p] as const,
  cronjobs: (p?: AnalyticsParams) => ["analytics", "cronjobs", p] as const,
  agents: (p?: AnalyticsParams) => ["analytics", "agents", p] as const,
  financial: (p?: AnalyticsParams) => ["analytics", "financial", p] as const,
  templates: () => ["analytics", "templates"] as const,
  scheduled: () => ["analytics", "scheduled"] as const,
  orgs: () => ["analytics", "orgs"] as const,
};

export function useUsageMetrics(params?: AnalyticsParams) {
  const query = useQuery({
    queryKey: keys.usage(params),
    queryFn: () => analyticsApi.fetchUsageMetrics(params),
    staleTime: 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, data: list, metrics: list };
}

export function useROIMetrics(params?: AnalyticsParams) {
  const query = useQuery({
    queryKey: keys.roi(params),
    queryFn: () => analyticsApi.fetchROIMetrics(params),
    staleTime: 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, data: list, metrics: list };
}

export function useCronjobHealth(params?: AnalyticsParams) {
  const query = useQuery({
    queryKey: keys.cronjobs(params),
    queryFn: () => analyticsApi.fetchCronjobHealth(params),
    staleTime: 30 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, data: list, cronjobs: list };
}

export function useAgentPerformance(params?: AnalyticsParams) {
  const query = useQuery({
    queryKey: keys.agents(params),
    queryFn: () => analyticsApi.fetchAgentPerformance(params),
    staleTime: 30 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, data: list, agents: list };
}

export function useFinancialImpact(params?: AnalyticsParams) {
  const query = useQuery({
    queryKey: keys.financial(params),
    queryFn: () => analyticsApi.fetchFinancialImpact(params),
    staleTime: 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, data: list, financial: list };
}

export function useReportTemplates() {
  const query = useQuery({
    queryKey: keys.templates(),
    queryFn: () => analyticsApi.fetchReportTemplates(),
    staleTime: 5 * 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, data: list, templates: list };
}

export function useScheduledReports() {
  const query = useQuery({
    queryKey: keys.scheduled(),
    queryFn: () => analyticsApi.fetchScheduledReports(),
    staleTime: 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, data: list, scheduled: list };
}

export function useOrgs() {
  const query = useQuery({
    queryKey: keys.orgs(),
    queryFn: () => analyticsApi.fetchOrgs(),
    staleTime: 5 * 60 * 1000,
  });
  const list = Array.isArray(query.data) ? query.data : [];
  return { ...query, data: list, orgs: list };
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { type: string; format?: "PDF" | "CSV"; templateId?: string }) =>
      analyticsApi.generateReport(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Report generated");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Report generation failed"),
  });
}

export function useScheduleReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      templateId: string;
      cadence: "daily" | "weekly" | "monthly";
      timezone: string;
    }) => analyticsApi.scheduleReport(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.scheduled() });
      toast.success("Report scheduled");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Failed to schedule report"),
  });
}
