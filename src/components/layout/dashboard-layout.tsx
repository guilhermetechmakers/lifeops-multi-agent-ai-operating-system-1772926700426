import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Clock,
  CheckSquare,
  Bug,
  FolderKanban,
  FileText,
  Paperclip,
  Wallet,
  Heart,
  Settings,
  User,
  ChevronLeft,
  Menu,
  Search,
  Bell,
  HelpCircle,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNotificationsList } from "@/hooks/use-notifications";
import { useCommandPalette } from "@/contexts/command-palette-context";
import { GlobalSearchCommandPalette } from "@/components/master-dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 64;
const SIDEBAR_COLLAPSED_KEY = "lifeops_sidebar_collapsed_v1";

function getInitialCollapsed(): boolean {
  try {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    // ignore
  }
  return false;
}

const navItems = [
  { to: "/dashboard", label: "Master", icon: LayoutDashboard },
  { to: "/dashboard/analytics-reports", label: "Analytics & Reports", icon: BarChart3 },
  { to: "/dashboard/admin", label: "Admin", icon: Shield },
  { to: "/dashboard/cronjobs", label: "Cronjobs", icon: Clock },
  { to: "/dashboard/approvals", label: "Approvals", icon: CheckSquare },
  { to: "/dashboard/debug", label: "Agent Trace", icon: Bug },
  { to: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { to: "/dashboard/content", label: "Content", icon: FileText },
  { to: "/dashboard/artifacts", label: "Artifacts", icon: Paperclip },
  { to: "/dashboard/finance", label: "Finance", icon: Wallet },
  { to: "/dashboard/health", label: "Health", icon: Heart },
];

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { items: notifications } = useNotificationsList();
  const { setOpen: setCommandOpen } = useCommandPalette();
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => n.status !== "read").length
    : 0;

  return (
    <div className="flex min-h-screen bg-background">
      <GlobalSearchCommandPalette />
      {/* Sidebar - desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-white/[0.03] bg-[#151718] transition-[width] duration-200",
          collapsed ? "w-[64px]" : "w-[240px]"
        )}
        style={{
          width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          minWidth: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-white/[0.03]">
          {!collapsed && (
            <Link to="/dashboard" className="font-semibold text-foreground">
              LifeOps
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            />
          </Button>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to || location.pathname.startsWith(to + "/");
              return (
                <Link key={to} to={to}>
                  <span
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </span>
                </Link>
              );
            })}
          </nav>
          <Separator className="my-2 bg-white/[0.03]" />
          <nav className="px-2 pb-2 space-y-1">
            <Link to="/dashboard/profile">
              <span
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                  location.pathname.startsWith("/dashboard/profile") && "bg-primary text-primary-foreground"
                )}
              >
                <User className="h-5 w-5 shrink-0" />
                {!collapsed && <span>Profile</span>}
              </span>
            </Link>
            <Link to="/dashboard/about-help">
              <span
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                  location.pathname.startsWith("/dashboard/about-help") && "bg-primary text-primary-foreground"
                )}
              >
                <HelpCircle className="h-5 w-5 shrink-0" />
                {!collapsed && <span>About & Help</span>}
              </span>
            </Link>
            <Link to="/dashboard/settings">
              <span
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                  location.pathname === "/dashboard/settings" && "bg-primary text-primary-foreground"
                )}
              >
                <Settings className="h-5 w-5 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </span>
            </Link>
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-white/[0.03] bg-[#151718] transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-white/[0.03]">
          <span className="font-semibold text-foreground">LifeOps</span>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    location.pathname === to || location.pathname.startsWith(to + "/")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </span>
              </Link>
            ))}
            <Link to="/dashboard/profile" onClick={() => setMobileOpen(false)}>
              <span className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                location.pathname.startsWith("/dashboard/profile")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
                <User className="h-5 w-5 shrink-0" />
                Profile
              </span>
            </Link>
            <Link to="/dashboard/about-help" onClick={() => setMobileOpen(false)}>
              <span className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                location.pathname.startsWith("/dashboard/about-help")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
                <HelpCircle className="h-5 w-5 shrink-0" />
                About & Help
              </span>
            </Link>
            <Link to="/dashboard/settings" onClick={() => setMobileOpen(false)}>
              <span className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                location.pathname === "/dashboard/settings"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
                <Settings className="h-5 w-5 shrink-0" />
                Settings
              </span>
            </Link>
          </nav>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/[0.03] bg-background px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center gap-4">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="relative flex flex-1 max-w-md items-center gap-2 rounded-md border-0 bg-secondary px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Open global search"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span>Search cronjobs, runs, agents, templates...</span>
              <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border border-white/10 bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>
        </header>
        <main className="flex-1 flex flex-col min-w-0">
          {location.pathname.startsWith("/dashboard/content") && (
            <nav
              className="flex gap-1 px-4 md:px-6 pt-4 pb-0 border-b border-white/[0.03]"
              aria-label="Content section"
            >
              <NavLink
                to="/dashboard/content"
                end
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    isActive
                      ? "bg-card text-foreground border border-white/[0.03] border-b-transparent -mb-px"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/dashboard/content/library"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    isActive
                      ? "bg-card text-foreground border border-white/[0.03] border-b-transparent -mb-px"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`
                }
              >
                Library
              </NavLink>
              <NavLink
                to="/dashboard/content/calendar"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    isActive
                      ? "bg-card text-foreground border border-white/[0.03] border-b-transparent -mb-px"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`
                }
              >
                Calendar
              </NavLink>
              <NavLink
                to="/dashboard/content/editor"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    isActive
                      ? "bg-card text-foreground border border-white/[0.03] border-b-transparent -mb-px"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`
                }
              >
                Editor
              </NavLink>
            </nav>
          )}
          {location.pathname.startsWith("/dashboard/finance") && (
            <nav
              className="flex gap-1 px-4 md:px-6 pt-4 pb-0 border-b border-white/[0.03]"
              aria-label="Finance section"
            >
              <NavLink
                to="/dashboard/finance"
                end
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    isActive
                      ? "bg-card text-foreground border border-white/[0.03] border-b-transparent -mb-px"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/dashboard/finance/forecasting"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    isActive
                      ? "bg-card text-foreground border border-white/[0.03] border-b-transparent -mb-px"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`
                }
              >
                Forecasting & Reports
              </NavLink>
              <NavLink
                to="/dashboard/finance/subscriptions"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    isActive
                      ? "bg-card text-foreground border border-white/[0.03] border-b-transparent -mb-px"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`
                }
              >
                Subscriptions & Billing
              </NavLink>
              <NavLink
                to="/dashboard/finance/transactions"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    isActive
                      ? "bg-card text-foreground border border-white/[0.03] border-b-transparent -mb-px"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`
                }
              >
                Transactions & Categorization
              </NavLink>
              <NavLink
                to="/dashboard/finance/history"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    isActive
                      ? "bg-card text-foreground border border-white/[0.03] border-b-transparent -mb-px"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`
                }
              >
                Order / Transaction History
              </NavLink>
            </nav>
          )}
          <div className="flex-1 p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
