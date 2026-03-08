import { Link, useLocation } from "react-router-dom";
import { BookOpen, Code2, Plug, Bot, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const navSections = [
  { id: "overview", label: "Overview", to: "/docs", icon: BookOpen },
  { id: "api", label: "API Reference", to: "/docs/api", icon: Code2 },
  { id: "connectors", label: "Connectors", to: "/docs/connectors", icon: Plug },
  { id: "templates", label: "Agent Templates", to: "/docs/templates", icon: Bot },
  { id: "workflow", label: "Workflow Schema", to: "/docs/workflow-schema", icon: GitBranch },
];

export interface DocsSidebarProps {
  collapsed?: boolean;
  className?: string;
}

export function DocsSidebar({ collapsed = false, className }: DocsSidebarProps) {
  const location = useLocation();

  if (collapsed) {
    return (
      <aside
        className={cn(
          "hidden md:flex w-16 flex-col border-r border-white/[0.03] bg-card transition-[width] duration-200",
          className
        )}
        aria-label="Documentation navigation"
      >
        <ScrollArea className="flex-1 py-4">
          <nav className="grid gap-1 px-2">
            {(navSections ?? []).map((item) => {
              const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={cn(
                    "flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary hover:text-foreground"
                  )}
                  title={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "hidden md:flex w-[260px] shrink-0 flex-col border-r border-white/[0.03] bg-card transition-[width] duration-200",
        className
      )}
      aria-label="Documentation navigation"
    >
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-3">
          {(navSections ?? []).map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <div key={item.id}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
