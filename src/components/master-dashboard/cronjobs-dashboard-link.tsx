/**
 * Cronjobs Dashboard link: contextual link with summary and quick-create trigger.
 */

import { Link } from "react-router-dom";
import { Clock, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMasterCronjobs } from "@/hooks/use-master-dashboard";

export function CronjobsDashboardLink() {
  const { items: cronjobs } = useMasterCronjobs();
  const list = cronjobs ?? [];
  const activeCount = list.filter((c) => c.enabled).length;

  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Cronjobs
        </CardTitle>
        <Link to="/dashboard/cronjobs/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Quick create
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-foreground">{list.length}</p>
        <p className="text-xs text-muted-foreground">{activeCount} enabled</p>
        <Link
          to="/dashboard/cronjobs"
          className="text-xs text-primary hover:underline mt-2 inline-block"
        >
          Open Cronjobs Dashboard →
        </Link>
      </CardContent>
    </Card>
  );
}
