/**
 * ApprovalsQueue — scheduled actions requiring human approval.
 */

import { Link } from "react-router-dom";
import { CheckSquare, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectApprovals } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

export interface ApprovalsQueueProps {
  projectId: string;
  className?: string;
}

export function ApprovalsQueue({ projectId, className }: ApprovalsQueueProps) {
  const { items: approvals, isLoading } = useProjectApprovals(projectId);
  const list = approvals ?? [];

  if (isLoading) {
    return (
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/[0.03] bg-card transition-all hover:shadow-card-hover", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
          Approvals
        </CardTitle>
        {list.length > 0 && (
          <Link to="/dashboard/approvals">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              View all
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No pending approvals
          </div>
        ) : (
          <div className="space-y-2">
            {list.slice(0, 3).map((a: { id: string }) => (
              <Link key={a.id} to="/dashboard/approvals">
                <div className="flex items-center justify-between rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2 hover:bg-secondary/50 transition-colors">
                  <span className="text-sm text-foreground">Action pending</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
