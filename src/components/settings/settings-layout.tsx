/**
 * Settings & Preferences layout.
 * Left navigation rail, header, content region. Collapsible sidebar.
 */

import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { SettingsNavPane } from "./settings-nav-pane";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lifeops-settings-sidebar-collapsed";

function getStoredCollapsed(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "true";
  } catch {
    return false;
  }
}

export function SettingsLayout() {
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings & preferences
        </h1>
        <p className="text-sm text-muted-foreground">
          Global configuration, user profile, integrations, and data controls
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
            <SettingsNavPane collapsed={collapsed} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden h-8 w-8 text-muted-foreground hover:text-foreground lg:block"
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
