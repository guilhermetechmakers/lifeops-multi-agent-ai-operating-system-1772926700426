/**
 * AuditTrailPanel — per-item run artifacts, messages, diffs (collapsible).
 */

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRunAudit } from "@/hooks/use-content-dashboard";
import { useState } from "react";
import type { RunArtifact } from "@/types/content-dashboard";

export interface AuditTrailPanelProps {
  runId: string | null;
  runArtifact?: RunArtifact | null;
  isLoading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function AuditTrailPanel({
  runId,
  runArtifact: controlledArtifact,
  isLoading: controlledLoading,
  open: controlledOpen,
  onOpenChange,
  className,
}: AuditTrailPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const { data: fetchedAudit, isLoading: fetchLoading } = useRunAudit(runId);
  const audit = controlledArtifact ?? fetchedAudit;
  const isLoading = controlledLoading ?? fetchLoading;

  return (
    <Collapsible open={isOpen} onOpenChange={setOpen}>
      <Card className={cn("border-white/[0.03] bg-card", className)}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-secondary/30 transition-colors rounded-t-lg">
            <CardTitle className="text-base font-semibold flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Audit Trail
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </CardTitle>
            <p className="text-xs text-muted-foreground text-left">
              Run artifacts, logs, diffs
            </p>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            {!runId ? (
              <p className="text-sm text-muted-foreground py-4">
                Select a run to view audit trail
              </p>
            ) : isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : audit ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <span
                    className={cn(
                      "capitalize",
                      audit.status === "success" && "text-teal",
                      audit.status === "failed" && "text-destructive"
                    )}
                  >
                    {audit.status}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium mb-1">
                    Logs
                  </p>
                  <ul className="space-y-1 text-xs">
                    {(audit.logs ?? []).map((log: string, i: number) => (
                      <li key={i} className="font-mono text-muted-foreground">
                        {log}
                      </li>
                    ))}
                  </ul>
                </div>
                {audit.diffs && (
                  <div>
                    <p className="text-muted-foreground text-xs font-medium mb-1">
                      Diffs
                    </p>
                    <pre className="text-xs font-mono text-muted-foreground bg-secondary/50 p-2 rounded overflow-x-auto">
                      {audit.diffs}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                No audit data for this run
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
