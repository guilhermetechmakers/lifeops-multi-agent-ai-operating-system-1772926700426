/**
 * Subscriptions & Billing API — subscriptions, connectors, spend limits, forecast, audit.
 * Uses native fetch via src/lib/api.ts. All responses validated with safe array/object guards.
 */

import { api, safeArray } from "@/lib/api";
import type {
  SubscriptionBilling,
  Connector,
  ForecastSubscription,
  ForecastSubscriptionsResponse,
  AuditTrailSubscription,
  AgentRecommendationBilling,
  MonthlyCloseStepBilling,
  IngestionStatusBilling,
  NotificationItemBilling,
} from "@/types/finance";

const BASE = "/finance";

/** Safe extract arrays from API response */
function asSubscriptions(data: unknown): SubscriptionBilling[] {
  return safeArray<SubscriptionBilling>(data);
}

function asConnectors(data: unknown): Connector[] {
  return safeArray<Connector>(data);
}

function asForecastLines(data: unknown): ForecastSubscription[] {
  const raw = data ?? [];
  return Array.isArray(raw) ? (raw as ForecastSubscription[]) : [];
}

function asAuditTrail(data: unknown): AuditTrailSubscription[] {
  return safeArray<AuditTrailSubscription>(data);
}

export interface SubscriptionsResponse {
  data?: SubscriptionBilling[] | null;
  meta?: { total: number } | null;
}

export async function fetchSubscriptions(params?: {
  own?: boolean;
  tracked?: boolean;
}): Promise<{ data: SubscriptionBilling[]; meta: { total: number } }> {
  const q = new URLSearchParams();
  if (params?.own !== undefined) q.set("own", String(params.own));
  if (params?.tracked !== undefined) q.set("tracked", String(params.tracked));
  const suffix = q.toString() ? `?${q.toString()}` : "";
  const raw = await api.get<SubscriptionsResponse>(`${BASE}/subscriptions${suffix}`);
  const data = raw?.data ?? raw;
  const list = asSubscriptions(data);
  const meta = raw?.meta ?? { total: list.length };
  return { data: list, meta: { total: meta?.total ?? list.length } };
}

export interface CreateSubscriptionPayload {
  vendor: string;
  cadence: "monthly" | "quarterly" | "yearly";
  amount: number;
  currency: string;
  startDate: string;
  endDate?: string | null;
  status?: "active" | "paused" | "canceled";
  isTracked?: boolean;
}

export async function createSubscription(
  payload: CreateSubscriptionPayload
): Promise<SubscriptionBilling> {
  const res = await api.post<SubscriptionBilling>(`${BASE}/subscriptions`, payload);
  if (res && typeof res === "object" && "id" in res) {
    return res as SubscriptionBilling;
  }
  throw new Error("Invalid subscription response");
}

export async function updateSubscription(
  id: string,
  payload: Partial<SubscriptionBilling>
): Promise<SubscriptionBilling> {
  const res = await api.patch<SubscriptionBilling>(`${BASE}/subscriptions/${id}`, payload);
  if (res && typeof res === "object" && "id" in res) {
    return res as SubscriptionBilling;
  }
  throw new Error("Invalid subscription response");
}

export async function setSpendLimit(
  subscriptionId: string,
  payload: { limit: number; currency?: string }
): Promise<{ updated: boolean }> {
  const res = await api.post<{ updated?: boolean }>(
    `${BASE}/subscriptions/${subscriptionId}/spend-limit`,
    payload
  );
  return { updated: res?.updated ?? true };
}

export async function fetchConnectors(): Promise<Connector[]> {
  const raw = await api.get<Connector[] | { data?: Connector[] }>(`${BASE}/connectors`);
  const data = Array.isArray(raw) ? raw : (raw as { data?: Connector[] })?.data;
  return asConnectors(data);
}

export async function connectConnector(
  connectorId: string
): Promise<{ connected: boolean; oauthUrl?: string }> {
  const res = await api.post<{ connected?: boolean; oauthUrl?: string }>(
    `${BASE}/connectors/${connectorId}/connect`,
    {}
  );
  return {
    connected: res?.connected ?? false,
    oauthUrl: res?.oauthUrl,
  };
}

export async function disconnectConnector(connectorId: string): Promise<void> {
  await api.post(`${BASE}/connectors/${connectorId}/disconnect`, {});
}

export async function fetchForecastSubscriptions(): Promise<ForecastSubscriptionsResponse> {
  const raw = await api.get<ForecastSubscriptionsResponse>(`${BASE}/forecast/subscriptions`);
  const lines = asForecastLines(raw?.lines ?? raw);
  const totalProjected = raw?.totalProjected ?? lines.reduce((s, l) => s + (l.projectedAmount ?? 0), 0);
  const period = raw?.period ?? new Date().toISOString().slice(0, 7);
  return { lines, totalProjected, period };
}

export async function fetchAuditSubscriptions(
  subscriptionId?: string | null
): Promise<AuditTrailSubscription[]> {
  const path = subscriptionId
    ? `${BASE}/audit/subscriptions/${subscriptionId}`
    : `${BASE}/audit/subscriptions`;
  const raw = await api.get<AuditTrailSubscription[] | { data?: AuditTrailSubscription[] }>(path);
  const data = Array.isArray(raw) ? raw : (raw as { data?: AuditTrailSubscription[] })?.data;
  return asAuditTrail(data);
}

function asRecommendations(data: unknown): AgentRecommendationBilling[] {
  return safeArray<AgentRecommendationBilling>(data);
}

function asMonthlyCloseSteps(data: unknown): MonthlyCloseStepBilling[] {
  return safeArray<MonthlyCloseStepBilling>(data);
}

export async function fetchRecommendationsBilling(): Promise<AgentRecommendationBilling[]> {
  const raw = await api.get<AgentRecommendationBilling[] | { data?: AgentRecommendationBilling[] }>(
    `${BASE}/recommendations`
  );
  const data = Array.isArray(raw) ? raw : (raw as { data?: AgentRecommendationBilling[] })?.data;
  return asRecommendations(data ?? []);
}

export async function fetchMonthlyCloseBilling(): Promise<MonthlyCloseStepBilling[]> {
  const raw = await api.get<MonthlyCloseStepBilling[] | { data?: MonthlyCloseStepBilling[] }>(
    `${BASE}/monthly-close`
  );
  const data = Array.isArray(raw) ? raw : (raw as { data?: MonthlyCloseStepBilling[] })?.data;
  return asMonthlyCloseSteps(data ?? []);
}

export async function fetchIngestionStatus(): Promise<IngestionStatusBilling> {
  const raw = await api.get<IngestionStatusBilling | { data?: IngestionStatusBilling }>(
    `${BASE}/ingestion-status`
  );
  const data = (raw as { data?: IngestionStatusBilling })?.data ?? raw;
  if (data && typeof data === "object") {
    return {
      status: data.status ?? "idle",
      lastRun: data.lastRun ?? null,
      newCount: data.newCount ?? 0,
      updatedCount: data.updatedCount ?? 0,
      error: data.error ?? null,
    };
  }
  return { status: "idle", newCount: 0, updatedCount: 0 };
}

export async function fetchNotifications(): Promise<{ items: NotificationItemBilling[] }> {
  const raw = await api.get<{ items?: NotificationItemBilling[] }>(`${BASE}/notifications`);
  const items = Array.isArray((raw as { items?: unknown[] })?.items)
    ? ((raw as { items: NotificationItemBilling[] }).items ?? [])
    : [];
  return { items };
}
