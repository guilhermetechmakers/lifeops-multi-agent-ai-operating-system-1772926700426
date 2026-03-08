/**
 * FinanceOverview — Main dashboard content: SnapshotTiles, TransactionsOverview, panels.
 */

import { SnapshotTiles } from "./snapshot-tiles";
import { TransactionsOverview } from "./transactions-overview";
import { SubscriptionsPanel } from "./subscriptions-panel";
import { AnomaliesPanel } from "./anomalies-panel";
import { ForecastingPanel } from "./forecasting-panel";
import { MonthlyClosePanel } from "./monthly-close-panel";
import { FinanceAgentRecommendationsPanel } from "./agent-recommendations-panel";
import { FinanceAutomationBridge } from "./finance-automation-bridge";
import { AuditTrailPane } from "./audit-trail-pane";
import { useFinanceDashboard, useApproveCloseTask } from "@/hooks/use-finance";

export function FinanceOverview() {
  const {
    data,
    transactions,
    subscriptions,
    anomalies,
    forecastData,
    monthlyCloseItems,
    recommendations,
    isLoading,
  } = useFinanceDashboard();
  const approveTask = useApproveCloseTask();

  const balances = data?.balances ?? { total: 0, currency: "USD" };
  const spend = data?.spend ?? { monthly: 0, currency: "USD" };
  const forecast = data?.forecast ?? { value: 0, currency: "USD", horizon: "30d" };
  const opportunities = data?.opportunities ?? { amount: 0, count: 0 };

  return (
    <div className="space-y-6">
      <SnapshotTiles
        balance={balances.total ?? 0}
        currency={balances.currency ?? "USD"}
        monthlySpend={Math.abs(spend.monthly ?? 0)}
        spendTrend={spend.trend}
        forecastValue={forecast.value ?? 0}
        forecastHorizon={forecast.horizon ?? "30d"}
        opportunitiesAmount={opportunities.amount ?? 0}
        opportunitiesCount={opportunities.count ?? 0}
        isLoading={isLoading}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TransactionsOverview
            transactions={transactions}
            isLoading={isLoading}
          />
        </div>
        <div className="space-y-6">
          <SubscriptionsPanel
            subscriptions={subscriptions}
            isLoading={isLoading}
          />
          <AnomaliesPanel anomalies={anomalies} isLoading={isLoading} />
          <ForecastingPanel forecastData={forecastData} isLoading={isLoading} />
          <MonthlyClosePanel
            tasks={monthlyCloseItems}
            isLoading={isLoading}
            onApprove={(id) => approveTask.mutate({ taskId: id, approverId: "current-user" })}
          />
          <FinanceAgentRecommendationsPanel
            recommendations={recommendations}
            isLoading={isLoading}
          />
          <FinanceAutomationBridge
            runs={[
              { id: "w1", name: "Ingestion", status: "completed", traceId: "tr-1" },
              { id: "w2", name: "Categorization", status: "completed", traceId: "tr-2" },
              { id: "w3", name: "Anomaly detection", status: "idle" },
            ]}
            isLoading={isLoading}
          />
          <AuditTrailPane entries={[]} />
        </div>
      </div>
    </div>
  );
}
