/**
 * Subscriptions & Billing page — Manage subscriptions, churn risk, spend limits, billing processors.
 * Composes SubscriptionsListPanel, SpendLimitsPanel, ConnectorsPanel, and related components.
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  SubscriptionsListPanel,
  SpendLimitsPanel,
  ConnectorsPanel,
  ChurnRiskIndicator,
  AgentRecommendationsPanelBilling,
  FinanceAutomationSyncPanel,
  ForecastingSnapshotCard,
  MonthlyCloseChecklist,
  AuditTrailPanel,
  NotificationsTray,
  EditSubscriptionModal,
  AddSubscriptionModal,
} from "@/components/subscriptions-billing";
import type { NotificationItem } from "@/components/subscriptions-billing";
import { ConnectBillingProcessorModal } from "@/components/finance-dashboard";
import {
  useSubscriptionsBilling,
  useCreateSubscription,
  useUpdateSubscription,
  useSetSpendLimit,
  useConnectors,
  useConnectConnector,
  useDisconnectConnector,
  useForecastSubscriptions,
  useAuditSubscriptions,
  useRecommendationsBilling,
  useMonthlyCloseBilling,
  useIngestionStatusBilling,
  useNotificationsBilling,
} from "@/hooks/use-subscriptions-billing";
import { useConnectBillingProcessor } from "@/hooks/use-finance";
import type { SubscriptionBilling } from "@/types/finance";

function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function FinanceSubscriptionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionBilling | null>(null);
  const [enforceGlobalCap, setEnforceGlobalCap] = useState(false);
  const [globalCap, setGlobalCap] = useState<number | null>(null);

  const { items: subscriptions, isLoading: subsLoading } = useSubscriptionsBilling();
  const createSub = useCreateSubscription();
  const updateSub = useUpdateSubscription();
  const setLimit = useSetSpendLimit();
  const { items: connectors, isLoading: connLoading } = useConnectors();
  const connectConn = useConnectConnector();
  const disconnectConn = useDisconnectConnector();
  const connectBillingProcessor = useConnectBillingProcessor();
  const { lines, totalProjected, period, isLoading: forecastLoading } = useForecastSubscriptions();
  const { items: auditItems, isLoading: auditLoading } = useAuditSubscriptions();
  const { items: recommendations, isLoading: recLoading } = useRecommendationsBilling();
  const { items: monthlyCloseSteps, isLoading: mcLoading } = useMonthlyCloseBilling();
  const ingestionStatus = useIngestionStatusBilling();
  const { items: notifications } = useNotificationsBilling();

  const subs = Array.isArray(subscriptions) ? subscriptions : [];
  const totalMonthly = subs.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const atRiskCount = subs.filter((s) => (s.churnRiskScore ?? 0) >= 0.25).length;

  const churnRiskScore = useMemo(() => {
    const atRisk = subs.filter((s) => (s.churnRiskScore ?? 0) >= 0.25);
    if (atRisk.length === 0) return 0;
    return atRisk.reduce((sum, s) => sum + (s.churnRiskScore ?? 0), 0) / atRisk.length;
  }, [subs]);

  const churnRecommendedActions = useMemo(
    () =>
      subs
        .filter((s) => (s.churnRiskScore ?? 0) >= 0.25)
        .slice(0, 3)
        .map((s) => ({
          id: s.id,
          label: `Review ${s.vendor ?? "subscription"} retention`,
          type: (s.churnRiskScore ?? 0) >= 0.5 ? ("approval" as const) : ("auto" as const),
          rationale: "Churn risk detected",
        })),
    [subs]
  );

  const notificationItems: NotificationItem[] = useMemo(
    () =>
      (notifications ?? []).map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        actionLabel: "View",
        onAction: n.actionUrl ? () => navigate(n.actionUrl!) : undefined,
        severity:
          n.type === "churn_risk" || n.type === "limit_advisory"
            ? ("warning" as const)
            : ("info" as const),
      })),
    [notifications, navigate]
  );

  const monthlyCloseTasks = useMemo(
    () =>
      (monthlyCloseSteps ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        dueDate: s.dueDate ?? "",
        ownerId: "",
        status: s.status,
        relatedRuns: [],
      })),
    [monthlyCloseSteps]
  );

  const handleEdit = (sub: SubscriptionBilling) => {
    setEditingSubscription(sub);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (id: string, data: Partial<SubscriptionBilling>) => {
    updateSub.mutate({ id, payload: data });
    setEditModalOpen(false);
    setEditingSubscription(null);
  };

  const handleAdd = () => setAddModalOpen(true);

  const handleCreate = (data: {
    vendor: string;
    cadence: "monthly" | "quarterly" | "yearly";
    amount: number;
    currency: string;
    startDate: string;
    endDate?: string | null;
    isTracked: boolean;
  }) => {
    createSub.mutate(
      {
        vendor: data.vendor,
        cadence: data.cadence,
        amount: data.amount,
        currency: data.currency,
        startDate: data.startDate,
        endDate: data.endDate ?? undefined,
        status: "active",
        isTracked: data.isTracked,
      },
      { onSuccess: () => setAddModalOpen(false) }
    );
  };

  const handlePause = (sub: SubscriptionBilling) => {
    updateSub.mutate({ id: sub.id, payload: { status: "paused" } });
  };

  const handleResume = (sub: SubscriptionBilling) => {
    updateSub.mutate({ id: sub.id, payload: { status: "active" } });
  };

  const handleCancel = (sub: SubscriptionBilling) => {
    updateSub.mutate({ id: sub.id, payload: { status: "canceled" } });
  };

  const handleSetSpendLimit = (subscriptionId: string, limit: number, currency: string) => {
    setLimit.mutate({ subscriptionId, limit, currency });
  };

  const handleConnectProcessor = (provider: string) => {
    connectBillingProcessor.mutate(
      { provider, credentials: {} },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["subscriptions-billing", "connectors"] });
          queryClient.invalidateQueries({ queryKey: ["subscriptions-billing", "subscriptions"] });
        },
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Subscriptions & Billing</h2>
        <p className="text-sm text-muted-foreground">
          Manage subscriptions, churn risk, spend limits, and billing processors
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-white/[0.03] bg-card p-4 transition-all duration-200 hover:shadow-card-hover">
          <p className="text-sm font-medium text-muted-foreground">Active subscriptions</p>
          <p className="text-2xl font-bold text-foreground">
            {subs.filter((s) => s.status === "active").length}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.03] bg-card p-4 transition-all duration-200 hover:shadow-card-hover">
          <p className="text-sm font-medium text-muted-foreground">Monthly spend</p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(totalMonthly, "USD")}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.03] bg-card p-4 transition-all duration-200 hover:shadow-card-hover">
          <p className="text-sm font-medium text-muted-foreground">Churn risk</p>
          <p className="text-2xl font-bold text-foreground">{atRiskCount}</p>
          <p className="text-xs text-muted-foreground">at-risk subscriptions</p>
        </div>
        <div className="rounded-lg border border-white/[0.03] bg-card p-4 transition-all duration-200 hover:shadow-card-hover">
          <p className="text-sm font-medium text-muted-foreground">Processors</p>
          <p className="text-2xl font-bold text-foreground">
            {(connectors ?? []).filter((c) => c.status === "connected").length}
          </p>
          <button
            type="button"
            className="mt-2 text-sm text-primary hover:underline"
            onClick={() => setConnectModalOpen(true)}
          >
            Connect
          </button>
        </div>
      </div>

      {/* Notifications */}
      <NotificationsTray notifications={notificationItems} />

      {/* Main grid: Subscriptions + Spend Limits + Connectors */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SubscriptionsListPanel
            subscriptions={subs}
            isLoading={subsLoading}
            onEdit={handleEdit}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
            onAdd={handleAdd}
          />
        </div>
        <div className="space-y-6">
          <SpendLimitsPanel
            subscriptions={subs}
            globalCap={globalCap}
            enforceGlobalCap={enforceGlobalCap}
            isLoading={subsLoading}
            onSetSpendLimit={handleSetSpendLimit}
            onSetGlobalCap={setGlobalCap}
            onToggleEnforce={setEnforceGlobalCap}
          />
          <ConnectorsPanel
            connectors={connectors}
            isLoading={connLoading}
            onConnect={(id) => connectConn.mutate(id)}
            onDisconnect={(id) => disconnectConn.mutate(id)}
            onAddConnector={() => setConnectModalOpen(true)}
          />
        </div>
      </div>

      {/* Churn risk + Agent recommendations + Forecast */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChurnRiskIndicator
          riskScore={churnRiskScore}
          atRiskCount={atRiskCount}
          recommendedActions={churnRecommendedActions}
        />
        <AgentRecommendationsPanelBilling
          recommendations={recommendations}
          isLoading={recLoading}
          onExecute={() => {}}
          onDismiss={() => {}}
        />
        <ForecastingSnapshotCard
          lines={lines}
          totalProjected={totalProjected}
          period={period}
          isLoading={forecastLoading}
        />
      </div>

      {/* Finance Automation + Monthly Close + Audit */}
      <div className="grid gap-6 lg:grid-cols-3">
        <FinanceAutomationSyncPanel
          status={ingestionStatus.data ?? { status: "idle", newCount: 0, updatedCount: 0 }}
          isLoading={ingestionStatus.isLoading}
        />
        <MonthlyCloseChecklist tasks={monthlyCloseTasks} isLoading={mcLoading} />
        <AuditTrailPanel entries={auditItems} isLoading={auditLoading} />
      </div>

      <EditSubscriptionModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        subscription={editingSubscription}
        onSave={handleSaveEdit}
        isSaving={updateSub.isPending}
      />
      <AddSubscriptionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onCreate={handleCreate}
        isCreating={createSub.isPending}
      />
      <ConnectBillingProcessorModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
        onSuccess={(provider) => handleConnectProcessor(provider)}
      />
    </div>
  );
}
