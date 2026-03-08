/**
 * Active Cronjobs Snapshot: next run, last outcome, schedule, enable/disable, view details.
 * Supports bulk selection and quick actions.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useMasterCronjobs, useUpdateCronjob } from "@/hooks/use-master-dashboard";
import type { MasterCronjob } from "@/types/master-dashboard";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

function formatNextRun(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "—";
  }
}

export function ActiveCronjobsSnapshot() {
  const { items: cronjobs, isLoading } = useMasterCronjobs();
  const updateCronjob = useUpdateCronjob();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const list = useMemo(() => cronjobs ?? [], [cronjobs]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === list.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(list.map((c) => c.id)));
  };

  const handleToggleEnabled = (job: MasterCronjob) => {
    updateCronjob.mutate({
      id: job.id,
      payload: { enabled: !job.enabled },
    });
  };

  const selectedCount = selectedIds.size;

  if (isLoading) {
    return (
      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active cronjobs snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
          <Clock className="h-4 w-4" />
          Active cronjobs snapshot
        </CardTitle>
        {list.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label={selectedIds.size === list.length ? "Deselect all" : "Select all"}
            >
              {selectedIds.size === list.length ? "Deselect all" : "Select all"}
            </button>
            <Link to="/dashboard/cronjobs">
              <Button variant="ghost" size="sm" className="text-xs">
                View all
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">Next run & status</p>
        {list.length === 0 ? (
          <div className="rounded-md border border-white/[0.03] bg-secondary/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No active cronjobs.{" "}
            <Link to="/dashboard/cronjobs/new" className="text-primary hover:underline">
              Create one
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {(list ?? []).map((cj) => (
              <li
                key={cj.id}
                className={cn(
                  "flex items-center gap-3 rounded-md border border-white/[0.03] bg-secondary/50 px-3 py-2 transition-colors",
                  selectedIds.has(cj.id) && "ring-1 ring-primary/30"
                )}
              >
                <Checkbox
                  checked={selectedIds.has(cj.id)}
                  onCheckedChange={() => toggleSelect(cj.id)}
                  aria-label={`Select ${cj.name}`}
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{cj.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Next: {formatNextRun(cj.nextRun)} · {cj.lastRunResult}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={cj.enabled}
                    onCheckedChange={() => handleToggleEnabled(cj)}
                    disabled={updateCronjob.isPending}
                    aria-label={cj.enabled ? "Disable" : "Enable"}
                  />
                  <Link to={`/dashboard/cronjobs/${cj.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" aria-hidden />
                      <span className="sr-only">View details</span>
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        {selectedCount > 0 && (
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-white/[0.03]">
            <span className="text-xs text-muted-foreground">
              {selectedCount} selected
            </span>
            <Link to="/dashboard/cronjobs">
              <Button size="sm" variant="outline">
                Manage selected
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
