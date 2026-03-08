/**
 * FinanceDashboardShell — Layout with NavPane and content region.
 * Persisted UI state (collapsed sidebar, active tab).
 */

import { Outlet } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { FinanceNavPane } from "./nav-pane";

export function FinanceDashboardShell() {
  return (
    <AnimatedPage className="flex flex-col gap-6">
      <header className="flex flex-col gap-1" style={{ minHeight: "56px" }}>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Finance
        </h1>
        <p className="text-sm text-muted-foreground">
          Categorized transactions, subscriptions, anomalies, forecasting, monthly close
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 shrink-0">
          <FinanceNavPane />
        </aside>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </AnimatedPage>
  );
}
