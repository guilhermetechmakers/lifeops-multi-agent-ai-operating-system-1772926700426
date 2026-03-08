/**
 * AnalyticsDashboardShell — Master container for Analytics & Reports.
 * Header, left navigation (AnalyticsNavPane), date range + org selector, content grid.
 * State: dateRange, selectedOrg; persists sidebar collapsed in localStorage.
 */

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { AnalyticsNavPane } from "./analytics-nav-pane";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PanelLeftClose, PanelLeftOpen, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrgs } from "@/hooks/use-analytics";

const STORAGE_KEY = "lifeops-analytics-sidebar-collapsed";

export const AnalyticsDashboardContext = createContext<{
  dateRange: string;
  orgId: string | undefined;
}>({ dateRange: "7d", orgId: undefined });

export function useAnalyticsDashboard() {
  return useContext(AnalyticsDashboardContext);
}
const DATE_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
] as const;

function getStoredCollapsed(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "true";
  } catch {
    return false;
  }
}

export interface AnalyticsDashboardShellProps {
  children?: ReactNode;
  dateRange?: string;
  onDateRangeChange?: (value: string) => void;
  selectedOrgId?: string;
  onOrgChange?: (orgId: string) => void;
}

export function AnalyticsDashboardShell({
  children,
  dateRange: controlledDateRange,
  onDateRangeChange,
  selectedOrgId: controlledOrgId,
  onOrgChange,
}: AnalyticsDashboardShellProps = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const [internalDateRange, setInternalDateRange] = useState<string>("7d");
  const [internalOrgId, setInternalOrgId] = useState<string>("");
  const { orgs = [] } = useOrgs();
  const orgList = Array.isArray(orgs) ? orgs : [];

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

  const dateRange = controlledDateRange ?? internalDateRange;
  const setDateRange = onDateRangeChange ?? setInternalDateRange;
  const selectedOrgId = controlledOrgId ?? internalOrgId;
  const setSelectedOrgId = (id: string) => {
    if (onOrgChange) onOrgChange(id);
    else setInternalOrgId(id);
  };

  return (
    <AnimatedPage className="flex flex-col gap-6">
      <header className="flex min-h-[56px] flex-col justify-center gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-muted-foreground" aria-hidden />
          Analytics & Reports
        </h1>
        <p className="text-sm text-muted-foreground">
          Usage metrics, automation ROI, cronjob health, agent performance, financial impact
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside
          className={cn(
            "shrink-0 transition-[width] duration-200 ease-in-out",
            collapsed ? "lg:w-[52px]" : "lg:w-56"
          )}
        >
          <div className="sticky top-4 flex flex-col gap-2">
            <AnalyticsNavPane collapsed={collapsed} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden h-8 w-8 text-muted-foreground hover:text-foreground lg:flex"
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

        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Date range</span>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[160px] bg-card border-white/[0.03]">
                  <SelectValue placeholder="Range" />
                </SelectTrigger>
                <SelectContent>
                  {(DATE_RANGES as readonly { value: string; label: string }[]).map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {orgList.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Organization</span>
                <Select
                  value={selectedOrgId || (orgList[0]?.id ?? "")}
                  onValueChange={setSelectedOrgId}
                >
                  <SelectTrigger className="w-[180px] bg-card border-white/[0.03]">
                    <SelectValue placeholder="Select org" />
                  </SelectTrigger>
                  <SelectContent>
                    {(orgList ?? []).map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name ?? org.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <AnalyticsDashboardContext.Provider
              value={{ dateRange, orgId: selectedOrgId || undefined }}
            >
              {children ?? <Outlet />}
            </AnalyticsDashboardContext.Provider>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
