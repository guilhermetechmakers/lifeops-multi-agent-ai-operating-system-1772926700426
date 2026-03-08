/**
 * Quick-access workflow tiles: Create Cronjob, Run Workflow, Approvals, Templates, Asset actions.
 */

import { Link } from "react-router-dom";
import { Plus, Play, CheckSquare, FileText, Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    to: "/dashboard/cronjobs/new",
    label: "Create cronjob",
    icon: Plus,
    description: "Schedule a new automated run",
  },
  {
    to: "/dashboard/cronjobs",
    label: "Run workflow",
    icon: Play,
    description: "Launch workflow from templates",
  },
  {
    to: "/dashboard/approvals",
    label: "Approvals",
    icon: CheckSquare,
    description: "Review pending approvals",
  },
  {
    to: "/dashboard",
    label: "Templates",
    icon: FileText,
    description: "Browse agent templates",
  },
  {
    to: "/dashboard/artifacts",
    label: "Asset actions",
    icon: Paperclip,
    description: "View run artifacts",
  },
] as const;

export function QuickAccessWorkflows() {
  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Quick actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {(ACTIONS ?? []).map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.to} to={action.to}>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground",
                  "transition-all duration-200 hover:scale-[1.02] hover:bg-secondary hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {action.label}
              </button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
