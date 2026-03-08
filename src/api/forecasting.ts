/**
 * Forecasting & Reports API — internal LifeOps endpoints.
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api/guards";
import type {
  ScenarioInputs,
  ReportArtifact,
  InsightsResponse,
} from "@/types/forecasting";

export interface BaselineResponse {
  period: string;
  baseline: number[];
  horizon: number;
  status: string;
}

export interface ComputeForecastRequest {
  period: string;
  baselineInputs?: ScenarioInputs;
  scenarios: ScenarioInputs[];
  horizon: number;
}

export interface ComputeForecastResponse {
  runId: string;
  forecast: { dates: string[]; values: number[] };
  scenarios: Array<{ id: string; name: string; inputs: ScenarioInputs; values: number[] }>;
  status: string;
}

export interface ForecastDataResponse {
  dates: string[];
  baseline: number[];
  scenarios: Array<{ id: string; name: string; values: number[] }>;
  confidence: number[];
}

export interface ExportReportRequest {
  period: string;
  format: "pdf" | "csv";
  includeAudit: boolean;
  templates?: string[];
}

export interface ExportReportResponse {
  artifactId: string;
  status: string;
  url?: string;
}

export interface ReportsHistoryResponse {
  period: string;
  artifacts: ReportArtifact[];
}

export async function fetchBaseline(period: string): Promise<BaselineResponse> {
  const data = await api.get<BaselineResponse>(`/forecasting/baseline?period=${encodeURIComponent(period)}`);
  return data ?? { period, baseline: [], horizon: 12, status: "completed" };
}

export async function computeForecast(
  payload: ComputeForecastRequest
): Promise<ComputeForecastResponse> {
  const data = await api.post<ComputeForecastResponse>("/forecasting/compute", payload);
  return data ?? { runId: "", forecast: { dates: [], values: [] }, scenarios: [], status: "failed" };
}

export async function fetchForecastData(runId: string): Promise<ForecastDataResponse> {
  const data = await api.get<ForecastDataResponse>(`/forecasts/${encodeURIComponent(runId)}/data`);
  return data ?? { dates: [], baseline: [], scenarios: [], confidence: [] };
}

export async function exportReport(
  payload: ExportReportRequest
): Promise<ExportReportResponse> {
  const data = await api.post<ExportReportResponse>("/reports/export", payload);
  return data ?? { artifactId: "", status: "failed" };
}

export async function fetchReportsHistory(period: string): Promise<ReportArtifact[]> {
  const data = await api.get<ReportsHistoryResponse>(
    `/reports/history?period=${encodeURIComponent(period)}`
  );
  const artifacts = data?.artifacts ?? [];
  return safeArray<ReportArtifact>(artifacts);
}

export async function fetchInsights(period: string): Promise<InsightsResponse> {
  const data = await api.get<InsightsResponse>(
    `/insights?period=${encodeURIComponent(period)}`
  );
  const items = data?.items ?? [];
  return {
    id: data?.id ?? "",
    period: data?.period ?? period,
    items: safeArray(items),
  };
}
