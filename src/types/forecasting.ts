/**
 * Forecasting & Reports — data models aligned with API contracts.
 */

export interface ScenarioInputs {
  revenueGrowth: number;
  expenseGrowth: number;
  churnRate: number;
  seasonality: number;
  subscriptionDelta: number;
  oneOffs: number;
}

export interface ForecastPoint {
  date: string;
  value: number;
  scenario?: string;
  confidence?: number;
}

export interface Scenario {
  id: string;
  name: string;
  inputs: ScenarioInputs;
  createdAt: string;
}

export interface ForecastRun {
  id: string;
  period: string;
  baseline: number[];
  scenarios: Array<{
    id: string;
    name: string;
    inputs: ScenarioInputs;
    values: number[];
  }>;
  horizon: number;
  createdAt: string;
  status: "completed" | "in_progress" | "failed";
}

export interface ReportArtifact {
  id: string;
  period: string;
  type: "pdf" | "csv";
  status: "ready" | "in_progress" | "failed";
  url?: string;
  createdAt: string;
}

export interface InsightItem {
  id: string;
  severity: "low" | "medium" | "high";
  text: string;
  suggestedAction?: string;
}

export interface InsightsResponse {
  id: string;
  period: string;
  items: InsightItem[];
}

export const DEFAULT_SCENARIO_INPUTS: ScenarioInputs = {
  revenueGrowth: 0.05,
  expenseGrowth: 0.03,
  churnRate: 0.02,
  seasonality: 1.0,
  subscriptionDelta: 0,
  oneOffs: 0,
};
