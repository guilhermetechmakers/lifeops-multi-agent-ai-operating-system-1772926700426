/**
 * CREnginePanel — Card-style container for Conflict Resolution Engine config and status.
 * Quick overview: active conflicts, latest resolutions, run history.
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conflict, ResolutionRecord } from "@/types/conflicts";

export interface CREnginePanelProps {
  conflicts: Conflict[];
  resolutions: ResolutionRecord[];
  isResolving?: boolean;
  onResolve?: () => void;
  className?: string;
}

export function CREnginePanel({
  conflicts,
  resolutions,
  isResolving = false,
  onResolve,
  className,
}: CREnginePanelProps) {
  const safeConflicts = Array.isArray(conflicts) ? conflicts : [];
  const safeResolutions = Array.isArray(resolutions) ? resolutions : [];
  const openCount = safeConflicts.filter((c) => c.status === "open").length;
  const resolvedCount = safeResolutions.length;

  return (
    <Card
      className={cn(
        "border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Conflict Resolution Engine</CardTitle>
            <p className="text-xs text-muted-foreground">
              Deterministic rule evaluation with full explainability
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-white/[0.06] bg-secondary/20 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber" />
              <span className="text-sm font-medium text-foreground">Active conflicts</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{openCount}</p>
            <p className="text-xs text-muted-foreground">
              {safeConflicts.length} total
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-secondary/20 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal" />
              <span className="text-sm font-medium text-foreground">Latest resolutions</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{resolvedCount}</p>
            <p className="text-xs text-muted-foreground">
              {resolvedCount > 0 ? "Last run" : "No runs yet"}
            </p>
          </div>
        </div>

        {safeResolutions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recent
            </h4>
            <ul className="space-y-2" role="list">
              {(safeResolutions ?? []).slice(0, 3).map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-md border border-white/[0.06] bg-secondary/10 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-foreground">{r.conflictId}</span>
                  <Badge
                    variant={r.outcome === "resolved" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {r.outcome}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {onResolve && (
            <Button
              size="sm"
              onClick={onResolve}
              disabled={isResolving || openCount === 0}
              className="gap-2"
            >
              {isResolving ? "Resolving…" : "Resolve conflicts"}
            </Button>
          )}
          <Link to="/dashboard/conflict-resolution">
            <Button variant="outline" size="sm" className="gap-2">
              <span>Configure rules</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
