/**
 * FinanceDashboardShell — Layout with collapsible NavPane and content region.
 * Persisted UI state (collapsed sidebar) via localStorage.
 */

import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { FinanceNavPane } from "./nav-pane";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lifeops-finance-sidebar-collapsed";

function getStoredCollapsed(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "true";
  } catch {
    return false;
  }
}

export function FinanceDashboardShell() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(getStoredCollapsed());
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /**/
      }
      return next;
    });
  };

  return (
    <AnimatedPage className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 min-h-[56px] justify-center">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Finance
        </h1>
        <p className="text-sm text-muted-foreground">
          Categorized transactions, subscriptions, anomalies, forecasting, monthly close
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside
          className={cn(
            "shrink-0 transition-[width] duration-200 ease-in-out",
            collapsed ? "lg:w-[52px]" : "lg:w-56"
          )}
        >
          <div className="sticky top-4 flex flex-col gap-2">
            <FinanceNavPane collapsed={collapsed} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground lg:block hidden"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </AnimatedPage>
  );
}
