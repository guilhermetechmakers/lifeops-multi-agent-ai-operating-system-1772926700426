/**
 * Finance API — dashboard, transactions, subscriptions, anomalies, forecast, monthly close, recommendations.
 * Uses native fetch via src/lib/api.ts. All responses validated with safe array/object guards.
 */

import { api, safeArray } from "@/lib/api";
import type {
  FinanceDashboardData,
  Transaction,
  Subscription,
  Anomaly,
  Forecast,
  MonthlyCloseTask,
  AgentRecommendation,
} from "@/types/finance";

const BASE = "/finance";

/** Safe extract arrays from API response */
function asTransactions(data: unknown): Transaction[] {
  return safeArray<Transaction>(data);
}

function asSubscriptions(data: unknown): Subscription[] {
  return safeArray<Subscription>(data);
}

function asAnomalies(data: unknown): Anomaly[] {
  return safeArray<Anomaly>(data);
}

function asForecasts(data: unknown): Forecast[] {
  return safeArray<Forecast>(data);
}

function asMonthlyCloseTasks(data: unknown): MonthlyCloseTask[] {
  return safeArray<MonthlyCloseTask>(data);
}

function asRecommendations(data: unknown): AgentRecommendation[] {
  return safeArray<AgentRecommendation>(data);
}

export async function fetchFinanceDashboard(): Promise<FinanceDashboardData> {
  const raw = await api.get<FinanceDashboardData | { data?: FinanceDashboardData }>(`${BASE}/dashboard`);
  const data = (raw as { data?: FinanceDashboardData })?.data ?? raw;
  if (typeof data !== "object" || data === null) {
    return getDefaultDashboardData();
  }
  return {
    balances: data.balances ?? { total: 0, currency: "USD" },
    spend: data.spend ?? { monthly: 0, currency: "USD" },
    forecast: data.forecast ?? { value: 0, currency: "USD", horizon: "30d" },
    opportunities: data.opportunities ?? { amount: 0, count: 0 },
    transactions: asTransactions(data.transactions),
    subscriptions: asSubscriptions(data.subscriptions),
    anomalies: asAnomalies(data.anomalies),
    forecastData: asForecasts(data.forecastData),
    monthlyCloseItems: asMonthlyCloseTasks(data.monthlyCloseItems),
    recommendations: asRecommendations(data.recommendations),
  };
}

function getDefaultDashboardData(): FinanceDashboardData {
  return {
    balances: { total: 0, currency: "USD" },
    spend: { monthly: 0, currency: "USD" },
    forecast: { value: 0, currency: "USD", horizon: "30d" },
    opportunities: { amount: 0, count: 0 },
    transactions: [],
    subscriptions: [],
    anomalies: [],
    forecastData: [],
    monthlyCloseItems: [],
    recommendations: [],
  };
}

export async function ingestTransactions(transactions: Transaction[]): Promise<{ count: number }> {
  const payload = Array.isArray(transactions) ? { transactions } : { transactions: [] };
  const res = await api.post<{ count?: number }>(`${BASE}/ingest-transactions`, payload);
  return { count: res?.count ?? 0 };
}

export async function categorizeTransactions(ruleId: string, transactionIds: string[]): Promise<void> {
  await api.post(`${BASE}/categorize`, {
    ruleId,
    transactionIds: Array.isArray(transactionIds) ? transactionIds : [],
  });
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const raw = await api.get<Subscription[] | { data?: Subscription[] }>(`${BASE}/subscriptions`);
  const data = Array.isArray(raw) ? raw : (raw as { data?: Subscription[] })?.data;
  return asSubscriptions(data);
}

export async function connectBillingProcessor(provider: string, credentials: unknown): Promise<void> {
  await api.post(`${BASE}/subscriptions/connect`, { provider, credentials });
}

export async function fetchAnomalies(): Promise<Anomaly[]> {
  const raw = await api.get<Anomaly[] | { data?: Anomaly[] }>(`${BASE}/anomalies`);
  const data = Array.isArray(raw) ? raw : (raw as { data?: Anomaly[] })?.data;
  return asAnomalies(data);
}

export async function fetchForecast(): Promise<Forecast[]> {
  const raw = await api.get<Forecast[] | { data?: Forecast[] }>(`${BASE}/forecast`);
  const data = Array.isArray(raw) ? raw : (raw as { data?: Forecast[] })?.data;
  return asForecasts(data);
}

export async function fetchMonthlyClose(): Promise<MonthlyCloseTask[]> {
  const raw = await api.get<MonthlyCloseTask[] | { data?: MonthlyCloseTask[] }>(`${BASE}/monthly-close`);
  const data = Array.isArray(raw) ? raw : (raw as { data?: MonthlyCloseTask[] })?.data;
  return asMonthlyCloseTasks(data);
}

export async function approveCloseTask(
  taskId: string,
  approverId: string,
  notes?: string
): Promise<void> {
  await api.post(`${BASE}/close/approve`, { taskId, approverId, notes });
}

export async function fetchRecommendations(): Promise<AgentRecommendation[]> {
  const raw = await api.get<AgentRecommendation[] | { data?: AgentRecommendation[] }>(
    `${BASE}/recommendations`
  );
  const data = Array.isArray(raw) ? raw : (raw as { data?: AgentRecommendation[] })?.data;
  return asRecommendations(data);
}
