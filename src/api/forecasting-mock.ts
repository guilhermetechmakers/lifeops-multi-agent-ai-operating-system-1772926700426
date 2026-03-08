/**
 * Mock Forecasting & Reports API — realistic mock data for development.
 */

import { addMonths, format } from "date-fns";
import type {
  ScenarioInputs,
  ReportArtifact,
  InsightItem,
  InsightsResponse,
} from "@/types/forecasting";
import { DEFAULT_SCENARIO_INPUTS } from "@/types/forecasting";

const HORIZON = 12;
const BASE_CASH = 50000;

function generateBaselineDates(period: string): string[] {
  const [y, m] = period.split("-").map(Number);
  const start = new Date(y, (m ?? 1) - 1, 1);
  return Array.from({ length: HORIZON }, (_, i) =>
    format(addMonths(start, i), "yyyy-MM")
  );
}

function generateBaselineValues(period: string): number[] {
  const dates = generateBaselineDates(period);
  let cash = BASE_CASH;
  const values: number[] = [];
  for (let i = 0; i < dates.length; i++) {
    const inflow = 4200 + Math.sin(i * 0.5) * 200;
    const outflow = 1850 + Math.cos(i * 0.3) * 150;
    cash += inflow - outflow;
    values.push(Math.round(cash));
  }
  return values;
}

export function applyScenarioInputs(
  baseline: number[],
  inputs: ScenarioInputs
): number[] {
  return baseline.map((v, i) => {
    const growth = 1 + (inputs.revenueGrowth ?? 0) - (inputs.expenseGrowth ?? 0);
    const churn = 1 - (inputs.churnRate ?? 0) * (i / baseline.length);
    const season = inputs.seasonality ?? 1;
    const sub = (inputs.subscriptionDelta ?? 0) * (i + 1) * 50;
    const oneOff = (inputs.oneOffs ?? 0) * (i === 3 ? 1 : 0);
    return Math.round(v * Math.pow(growth, i * 0.1) * churn * season + sub + oneOff);
  });
}

export function getMockBaseline(period: string) {
  const baseline = generateBaselineValues(period);
  const dates = generateBaselineDates(period);
  return {
    period,
    baseline,
    horizon: HORIZON,
    status: "completed",
    dates,
  };
}

export function getMockComputeForecast(
  period: string,
  scenarios: ScenarioInputs[] = []
) {
  const { baseline, dates } = getMockBaseline(period);
  const scenarioResults = scenarios.map((inputs, idx) => ({
    id: `sc-${idx + 1}`,
    name: `Scenario ${String.fromCharCode(65 + idx)}`,
    inputs,
    values: applyScenarioInputs(baseline, inputs),
  }));
  return {
    runId: `run-${Date.now()}`,
    forecast: { dates, values: baseline },
    scenarios: scenarioResults,
    status: "completed",
  };
}

export function getMockForecastData(_runId: string) {
  const period = format(new Date(), "yyyy-MM");
  const { baseline, dates } = getMockBaseline(period);
  const upside: ScenarioInputs = {
    ...DEFAULT_SCENARIO_INPUTS,
    revenueGrowth: 0.08,
    expenseGrowth: 0.02,
  };
  const downside: ScenarioInputs = {
    ...DEFAULT_SCENARIO_INPUTS,
    revenueGrowth: 0.02,
    expenseGrowth: 0.05,
  };
  return {
    dates,
    baseline,
    scenarios: [
      { id: "sc-a", name: "Upside", values: applyScenarioInputs(baseline, upside) },
      { id: "sc-b", name: "Downside", values: applyScenarioInputs(baseline, downside) },
    ],
    confidence: baseline.map(() => 0.85 + Math.random() * 0.1),
  };
}

export function getMockReportsHistory(period: string): ReportArtifact[] {
  return [
    {
      id: "rpt-1",
      period,
      type: "pdf",
      status: "ready",
      url: "/exports/report.pdf",
      createdAt: new Date().toISOString(),
    },
    {
      id: "rpt-2",
      period,
      type: "csv",
      status: "ready",
      url: "/exports/report.csv",
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getMockInsights(period: string): InsightsResponse {
  const items: InsightItem[] = [
    {
      id: "ins-1",
      severity: "high",
      text: "Revenue growth assumption may be optimistic given recent churn signals.",
      suggestedAction: "Reduce revenueGrowth by 2% in downside scenario",
    },
    {
      id: "ins-2",
      severity: "medium",
      text: "Subscription delta could improve runway by 2 months if renewal rates hold.",
      suggestedAction: "Add +$500/mo to subscriptionDelta",
    },
    {
      id: "ins-3",
      severity: "low",
      text: "Seasonality factor aligns with historical Q3/Q4 patterns.",
      suggestedAction: undefined,
    },
  ];
  return { id: "insights-1", period, items };
}

export function mockExportReport(
  period: string,
  format: "pdf" | "csv"
): Promise<{ artifactId: string; status: string; url?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        artifactId: `rpt-${Date.now()}`,
        status: "ready",
        url: `/exports/${period}-report.${format}`,
      });
    }, 1500);
  });
}
