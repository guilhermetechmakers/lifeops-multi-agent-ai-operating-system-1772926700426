/**
 * AnalyticsOverview — Main analytics dashboard with KPI tiles and panels.
 */

import { useState } from "react";
import { AnimatedPage } from "@/components/animated-page";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UsageMetricsPanel } from "./usage-metrics-panel";
import { CronjobHealthPanel } from "./cronjob-health-panel";
import { AgentPerformancePanel } from "./agent-performance-panel";
import { ROIOverviewPanel } from "./roi-overview-panel";
import { FinancialImpactPanel } from "./financial-impact-panel";
import { ReportsExportPanel } from "./reports-export-panel";
import { AdminComplianceHintCard } from "./admin-compliance-hint-card";
import { useOrgs } from "@/hooks/use-analytics";

const DATE_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "30d", label: "Last 30 days" },
] as const;

export function AnalyticsOverview() {
  const [dateRange, setDateRange] = useState("7d");
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const { orgs = [] } = useOrgs();

  const orgList = Array.isArray(orgs) ? orgs : [];

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {orgList.length > 1 && (
            <Select
              value={selectedOrg ? selectedOrg : (orgList[0]?.id ?? "")}
              onValueChange={setSelectedOrg}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent>
                {(orgList ?? []).map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <AdminComplianceHintCard />

      <section className="space-y-6" aria-label="Usage metrics">
        <h2 className="text-lg font-semibold">Usage metrics</h2>
        <UsageMetricsPanel orgId={selectedOrg || undefined} range={dateRange} />
      </section>

      <section className="space-y-6" aria-label="ROI overview">
        <h2 className="text-lg font-semibold">ROI overview</h2>
        <ROIOverviewPanel orgId={selectedOrg || undefined} range={dateRange} />
      </section>

      <section className="space-y-6" aria-label="Cronjob health">
        <h2 className="text-lg font-semibold">Cronjob health</h2>
        <CronjobHealthPanel orgId={selectedOrg || undefined} />
      </section>

      <section className="space-y-6" aria-label="Agent performance">
        <h2 className="text-lg font-semibold">Agent performance</h2>
        <AgentPerformancePanel orgId={selectedOrg || undefined} range={dateRange} />
      </section>

      <section className="space-y-6" aria-label="Financial impact">
        <h2 className="text-lg font-semibold">Financial impact</h2>
        <FinancialImpactPanel orgId={selectedOrg || undefined} range={dateRange} />
      </section>

      <section className="space-y-6" aria-label="Reports & export">
        <h2 className="text-lg font-semibold">Reports & export</h2>
        <ReportsExportPanel />
      </section>
    </AnimatedPage>
  );
}
