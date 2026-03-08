/**
 * Analytics & Reports page — Shell + overview; date range and org state lifted for filters.
 */

import { useState } from "react";
import { AnalyticsDashboardShell } from "@/components/analytics-reports/analytics-dashboard-shell";
import { AnalyticsReportsOverview } from "@/components/analytics-reports/analytics-reports-overview";

export default function AnalyticsReportsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const [selectedOrgId, setSelectedOrgId] = useState("");

  return (
    <AnalyticsDashboardShell
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      selectedOrgId={selectedOrgId || undefined}
      onOrgChange={setSelectedOrgId}
    >
      <AnalyticsReportsOverview dateRange={dateRange} orgId={selectedOrgId || undefined} />
    </AnalyticsDashboardShell>
  );
}
