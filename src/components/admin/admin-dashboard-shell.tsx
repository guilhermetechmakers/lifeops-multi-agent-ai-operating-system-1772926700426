/**
 * AdminDashboardShell — Master container for Admin Dashboard.
 * Persistent left nav, top bar with global actions, responsive content region.
 * Layout: 220–260px sidebar; card-based content; dark UI with accent pill.
 */

import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { AdminNavPane } from "./admin-nav-pane";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen, UserPlus, Building2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lifeops-admin-sidebar-collapsed";

function getStoredCollapsed(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "true";
  } catch {
    return false;
  }
}

export function AdminDashboardShell() {
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
      <header className="flex min-h-[56px] flex-col justify-center gap-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Admin dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Users, organizations, roles, integrations, compliance, billing, cronjobs, reports
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/dashboard/admin/users">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/[0.03] hover:bg-secondary"
              >
                <UserPlus className="h-4 w-4" />
                Create user
              </Button>
            </Link>
            <Link to="/dashboard/admin/organizations">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/[0.03] hover:bg-secondary"
              >
                <Building2 className="h-4 w-4" />
                Create org
              </Button>
            </Link>
            <Link to="/dashboard/admin/reports">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/[0.03] hover:bg-secondary"
              >
                <FileText className="h-4 w-4" />
                Generate report
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside
          className={cn(
            "shrink-0 transition-[width] duration-200 ease-in-out",
            collapsed ? "lg:w-[52px]" : "lg:w-56"
          )}
        >
          <div className="sticky top-4 flex flex-col gap-2">
            <AdminNavPane collapsed={collapsed} />
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
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </AnimatedPage>
  );
}
