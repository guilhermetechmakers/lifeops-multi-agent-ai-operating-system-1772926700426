/**
 * AnalyticsReportsOverview — Main dashboard content: KPIs + Usage, ROI, Cronjob, Agent, Financial, Reports, Admin hint.
 * All data guarded; uses dateRange and orgId for hooks.
 */

import { useMemo } from "react";
import { KPIWidget } from "./kpi-widget";
import { UsageMetricsPanel } from "./usage-metrics-panel";
import { ROIOverviewPanel } from "./roi-overview-panel";
import { CronjobHealthPanel } from "./cronjob-health-panel";
import { AgentPerformancePanel } from "./agent-performance-panel";
import { FinancialImpactPanel } from "./financial-impact-panel";
import { ReportsExportPanel } from "./reports-export-panel";
import { AdminComplianceHintCard } from "./admin-compliance-hint-card";
import {
  useUsageMetrics,
  useROIMetrics,
  useCronjobHealth,
  useAgentPerformance,
  useFinancialImpact,
} from "@/hooks/use-analytics";
import { Users, Zap, Clock, Bot, TrendingUp } from "lucide-react";

export interface AnalyticsReportsOverviewProps {
  dateRange?: string;
  orgId?: string;
}

export function AnalyticsReportsOverview({ dateRange = "7d", orgId }: AnalyticsReportsOverviewProps) {
  const params = useMemo(() => ({ orgId, range: dateRange }), [orgId, dateRange]);

  const { data: usageData = [] } = useUsageMetrics(params);
  const { data: roiData = [] } = useROIMetrics(params);
  const { cronjobs = [] } = useCronjobHealth(params);
  const { agents = [] } = useAgentPerformance(params);
  const { financial = [] } = useFinancialImpact(params);

  const usageList = Array.isArray(usageData) ? usageData : [];
  const roiList = Array.isArray(roiData) ? roiData : [];
  const latestUsage = usageList.length > 0 ? usageList[usageList.length - 1] : null;
  const latestRoi = roiList.length > 0 ? roiList[roiList.length - 1] : null;

  const cronSuccessCount = useMemo(() => {
    const list = Array.isArray(cronjobs) ? cronjobs : [];
    return list.filter((c) => c.status === "success").length;
  }, [cronjobs]);
  const cronTotal = (cronjobs ?? []).length;
  const agentSuccessRate = useMemo(() => {
    const list = Array.isArray(agents) ? agents : [];
    if (list.length === 0) return 0;
    const total = list.reduce((s, a) => s + (a.successCount ?? 0) + (a.failureCount ?? 0), 0);
    const success = list.reduce((s, a) => s + (a.successCount ?? 0), 0);
    return total > 0 ? Math.round((success / total) * 100) : 0;
  }, [agents]);
  const financialList = Array.isArray(financial) ? financial : [];
  const totalSavings = useMemo(() => {
    return (financialList ?? []).reduce((s, f) => s + (f.savings ?? 0), 0);
  }, [financialList]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPIWidget
          title="MAU"
          value={
            latestUsage?.mau != null
              ? latestUsage.mau >= 1e6
                ? `${(latestUsage.mau / 1e6).toFixed(1)}M`
                : latestUsage.mau.toLocaleString()
              : "—"
          }
          trend="up"
          trendLabel="vs last period"
          icon={<Users className="h-5 w-5" />}
          tooltip="Monthly active users"
        />
        <KPIWidget
          title="Time saved (min)"
          value={latestRoi?.timeSaved ?? "—"}
          trend="up"
          icon={<Zap className="h-5 w-5" />}
          tooltip="Cumulative time saved this period"
        />
        <KPIWidget
          title="Cronjob health"
          value={cronTotal > 0 ? `${cronSuccessCount}/${cronTotal} OK` : "—"}
          trend={cronSuccessCount === cronTotal && cronTotal > 0 ? "up" : cronTotal > 0 ? "down" : "neutral"}
          icon={<Clock className="h-5 w-5" />}
          tooltip="Successful vs total cronjobs"
        />
        <KPIWidget
          title="Agent success rate"
          value={agents.length > 0 ? `${agentSuccessRate}%` : "—"}
          trend={agentSuccessRate >= 90 ? "up" : agentSuccessRate >= 70 ? "neutral" : "down"}
          icon={<Bot className="h-5 w-5" />}
          tooltip="Aggregate agent success rate"
        />
        <KPIWidget
          title="Cost savings"
          value={totalSavings > 0 ? `$${totalSavings.toLocaleString()}` : "—"}
          trend="up"
          icon={<TrendingUp className="h-5 w-5" />}
          tooltip="Total savings in period"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <UsageMetricsPanel orgId={orgId} range={dateRange} />
        <ROIOverviewPanel orgId={orgId} range={dateRange} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CronjobHealthPanel orgId={orgId} />
        <AgentPerformancePanel orgId={orgId} range={dateRange} />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <FinancialImpactPanel orgId={orgId} range={dateRange} />
        <ReportsExportPanel />
        <AdminComplianceHintCard />
      </div>
    </div>
  );
}
