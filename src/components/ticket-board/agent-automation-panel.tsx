/**
 * AgentAutomationPanel — define, edit, test automation rules for tickets.
 */

import { useState, useCallback } from "react";
import {
  Zap,
  Plus,
  Play,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Rule } from "@/types/ticket-board";
import {
  useTicketBoardRules,
  useCreateTicketBoardRule,
  useUpdateTicketBoardRule,
  useRunTicketBoardAutomation,
} from "@/hooks/use-ticket-board";

export interface AgentAutomationPanelProps {
  projectId: string;
  className?: string;
}

export function AgentAutomationPanel({ projectId, className }: AgentAutomationPanelProps) {
  const { items: rules, isLoading } = useTicketBoardRules(projectId);
  const createRule = useCreateTicketBoardRule(projectId);
  const updateRule = useUpdateTicketBoardRule(projectId);
  const runAutomation = useRunTicketBoardAutomation(projectId);

  const [createOpen, setCreateOpen] = useState(false);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [newRuleName, setNewRuleName] = useState("");

  const ruleList = rules ?? [];

  const handleCreate = useCallback(() => {
    if (!newRuleName.trim()) return;
    createRule.mutate(
      { name: newRuleName.trim(), conditions: [], actions: [], enabled: true },
      {
        onSuccess: () => {
          setNewRuleName("");
          setCreateOpen(false);
        },
      }
    );
  }, [newRuleName, createRule]);

  const handleToggleEnabled = useCallback(
    (rule: Rule) => {
      updateRule.mutate({
        ruleId: rule.id,
        data: { enabled: !rule.enabled },
      });
    },
    [updateRule]
  );

  const handleRun = useCallback(
    (ruleId: string) => {
      runAutomation.mutate(ruleId);
    },
    [runAutomation]
  );

  if (isLoading) {
    return (
      <Card className={cn("card-project-detail", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("card-project-detail", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber" />
              Automation Rules
            </CardTitle>
            <Button size="sm" className="gap-1" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ruleList.length === 0 ? (
            <div className="py-6 text-center">
              <Zap className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No automation rules</p>
              <Button
                size="sm"
                className="mt-2"
                onClick={() => setCreateOpen(true)}
              >
                Create first rule
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[280px]">
              <div className="space-y-2 pr-2">
                {(ruleList ?? []).map((rule) => (
                  <div
                    key={rule.id}
                    className="rounded-lg border border-[rgb(255_255_255/0.03)] bg-secondary/30 p-3 transition-all duration-200 hover:bg-secondary/40"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedRuleId(
                            expandedRuleId === rule.id ? null : rule.id
                          )
                        }
                        className="p-0.5 text-muted-foreground hover:text-foreground"
                        aria-label={expandedRuleId === rule.id ? "Collapse" : "Expand"}
                      >
                        {expandedRuleId === rule.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <span className="text-sm font-medium text-foreground flex-1 truncate">
                        {rule.name}
                      </span>
                      <Badge
                        variant={rule.enabled ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {rule.enabled ? "On" : "Off"}
                      </Badge>
                      <Switch
                        checked={rule.enabled ?? false}
                        onCheckedChange={() => handleToggleEnabled(rule)}
                        aria-label={`Toggle rule ${rule.name}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRun(rule.id)}
                        disabled={runAutomation.isPending}
                        aria-label="Run rule"
                      >
                        <Play className="h-3.5 w-3.5 text-teal" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            aria-label="Rule actions"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {expandedRuleId === rule.id && (
                      <div className="mt-2 pl-6 text-xs text-muted-foreground">
                        <p>
                          Conditions:{" "}
                          {JSON.stringify(rule.conditions ?? [])}
                        </p>
                        <p className="mt-0.5">
                          Actions: {JSON.stringify(rule.actions ?? [])}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-[rgb(255_255_255/0.03)] bg-card">
          <DialogHeader>
            <DialogTitle>Create automation rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rule-name">Rule name</Label>
              <Input
                id="rule-name"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                placeholder="e.g. Auto-assign high priority"
                className="mt-1 border-[rgb(255_255_255/0.03)]"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Configure conditions and actions in the rule editor after creating.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newRuleName.trim() || createRule.isPending}
            >
              {createRule.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
