/**
 * Approvals Queue Widget: compact list of pending approvals for Master Dashboard.
 * Filter/sort capabilities, link to full approvals page.
 */

import { Link } from "react-router-dom";
import { CheckSquare, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMasterApprovals } from "@/hooks/use-master-dashboard";
import { formatDistanceToNow } from "date-fns";

export function ApprovalsQueueWidget() {
  const { items: approvals, isLoading } = useMasterApprovals();

  const list = (approvals ?? []).filter((a) => a.status === "pending");
  const pendingCount = list.length;

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Approvals queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          Approvals queue
          {pendingCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pendingCount}
            </Badge>
          )}
        </CardTitle>
        <Link to="/dashboard/approvals">
          <Button variant="ghost" size="sm" className="text-xs">
            View all
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">Actions requiring review</p>
        {list.length === 0 ? (
          <div className="rounded-md border border-white/[0.03] bg-secondary/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No pending approvals.
          </div>
        ) : (
          <ul className="space-y-2" role="list">
            {(list ?? []).slice(0, 5).map((a) => (
              <li
                key={a.id}
                className="rounded-md border border-white/[0.03] bg-secondary/30 px-3 py-2"
              >
                <Link to={`/dashboard/approvals?itemId=${a.id}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm truncate">
                        {a.itemType} #{a.itemId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.requester} · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
