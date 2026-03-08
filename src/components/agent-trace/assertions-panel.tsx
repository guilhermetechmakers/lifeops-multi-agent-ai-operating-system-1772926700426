/**
 * AssertionsPanel — conflict resolution decisions, applied rules, explanations.
 * Expandable items with explainability chain.
 */

import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Assertion, Conflict } from "@/types/agent-trace";

export interface AssertionsPanelProps {
  assertions?: Assertion[] | null;
  conflicts?: Conflict[] | null;
  runId?: string | null;
  className?: string;
}

export function AssertionsPanel({
  assertions = [],
  conflicts = [],
  className,
}: AssertionsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const safeAssertions = Array.isArray(assertions) ? assertions : [];
  const safeConflicts = Array.isArray(conflicts) ? conflicts : [];
  const hasItems = safeAssertions.length > 0 || safeConflicts.length > 0;

  return (
    <Card className={cn("rounded-lg border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium">Assertions &amp; Violations</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Conflict resolution decisions and applied rules
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-[280px]">
          {!hasItems ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No assertions or conflicts for this run
            </div>
          ) : (
            <ul className="space-y-2">
              {safeAssertions.map((a) => {
                const isExpanded = expandedId === a.id;
                return (
                  <li key={a.id} className="rounded-md border border-white/[0.03] bg-secondary/30 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : a.id)}
                      className="w-full flex items-center gap-2 p-3 text-left hover:bg-white/[0.02] transition-colors"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {a.violated ? (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
                      ) : (
                        <CheckCircle className="h-4 w-4 shrink-0 text-teal" aria-hidden />
                      )}
                      <span className="flex-1 text-sm font-medium">{a.ruleId}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 border-t border-white/[0.03]">
                        <p className="text-xs text-muted-foreground mt-2">{a.explanation}</p>
                        {a.details && Object.keys(a.details).length > 0 && (
                          <pre className="mt-2 text-xs bg-background/50 rounded p-2 overflow-x-auto">
                            {JSON.stringify(a.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
              {safeConflicts.map((c) => {
                const id = `conflict-${c.id}`;
                const isExpanded = expandedId === id;
                return (
                  <li key={c.id} className="rounded-md border border-white/[0.03] bg-secondary/30 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className="w-full flex items-center gap-2 p-3 text-left hover:bg-white/[0.02] transition-colors"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber" aria-hidden />
                      <span className="flex-1 text-sm font-medium">
                        Conflict: {Array.isArray(c.conflictPair) ? c.conflictPair.join(" ↔ ") : c.id}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 border-t border-white/[0.03]">
                        <p className="text-xs text-muted-foreground mt-2">{c.rationale}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied rules: {Array.isArray(c.appliedRules) ? c.appliedRules.join(", ") : "—"}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
