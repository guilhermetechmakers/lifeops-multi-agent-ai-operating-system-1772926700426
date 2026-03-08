/**
 * Conflict Resolution Engine widget for Master Dashboard.
 * Quick overview: active conflicts, latest resolutions, link to CRE.
 */

import { Link } from "react-router-dom";
import { GitMerge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ConflictResolutionWidgetProps {
  activeConflicts?: number;
  recentResolutions?: number;
  className?: string;
}

export function ConflictResolutionWidget({
  activeConflicts = 0,
  recentResolutions = 0,
}: ConflictResolutionWidgetProps) {
  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <GitMerge className="h-4 w-4" />
          Conflict Resolution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-4">
          <div>
            <p className="text-2xl font-bold text-foreground">{activeConflicts}</p>
            <p className="text-xs text-muted-foreground">Active conflicts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{recentResolutions}</p>
            <p className="text-xs text-muted-foreground">Resolved (24h)</p>
          </div>
        </div>
        <Link to="/dashboard/conflict-resolution" className="mt-3 block">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <GitMerge className="h-4 w-4" />
            Open Conflict Resolution Engine
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
