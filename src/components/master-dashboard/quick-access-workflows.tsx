/**
 * Quick-access workflow tiles: templates with Run button and parameter prompts.
 * Context-aware suggestions from useMasterTemplates.
 */

import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Play, CheckSquare, FileText, Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useMasterTemplates } from "@/hooks/use-master-dashboard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MasterTemplate } from "@/types/master-dashboard";

const STATIC_ACTIONS = [
  { to: "/dashboard/cronjobs/new", label: "Create cronjob", icon: Plus },
  { to: "/dashboard/approvals", label: "Approvals", icon: CheckSquare },
  { to: "/dashboard/artifacts", label: "Asset actions", icon: Paperclip },
] as const;

function getInputSchemaKeys(schema: Record<string, unknown>): string[] {
  if (!schema || typeof schema !== "object") return [];
  return Object.keys(schema).filter((k) => schema[k] !== undefined);
}

export function QuickAccessWorkflows() {
  const navigate = useNavigate();
  const { items: templates, isLoading } = useMasterTemplates();
  const [promptTemplate, setPromptTemplate] = useState<MasterTemplate | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});

  const list = templates ?? [];

  const handleRunTemplate = useCallback(
    (t: MasterTemplate) => {
      const schema = t.inputSchema ?? {};
      const keys = getInputSchemaKeys(schema);
      if (keys.length > 0) {
        setPromptTemplate(t);
        setParams(Object.fromEntries(keys.map((k) => [k, ""])));
      } else {
        navigate(`/dashboard/cronjobs/new?template=${t.id}`);
        toast.success(`Launching ${t.name}`);
      }
    },
    [navigate]
  );

  const handleSubmitParams = useCallback(() => {
    if (!promptTemplate) return;
    const schema = promptTemplate.inputSchema ?? {};
    const keys = getInputSchemaKeys(schema);
    const missing = keys.filter((k) => !(params[k] ?? "").trim());
    if (missing.length > 0) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return;
    }
    const qs = new URLSearchParams({ template: promptTemplate.id, ...params });
    setPromptTemplate(null);
    setParams({});
    navigate(`/dashboard/cronjobs/new?${qs.toString()}`);
    toast.success(`Launching ${promptTemplate.name}`);
  }, [promptTemplate, params, navigate]);

  const handleClosePrompt = useCallback(() => {
    setPromptTemplate(null);
    setParams({});
  }, []);

  return (
    <>
      <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Quick actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {STATIC_ACTIONS.map((action) => {
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
          {isLoading ? (
            <Skeleton className="h-9 w-24 rounded-md" />
          ) : (
            (list ?? []).slice(0, 3).map((t) => {
              const hasParams = getInputSchemaKeys(t.inputSchema ?? {}).length > 0;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleRunTemplate(t)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground",
                    "transition-all duration-200 hover:scale-[1.02] hover:bg-secondary hover:shadow-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                >
                  <Play className="h-4 w-4 text-muted-foreground" />
                  {t.name}
                  {hasParams && (
                    <span className="text-[10px] text-muted-foreground">(params)</span>
                  )}
                </button>
              );
            })
          )}
          <Link to="/dashboard">
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-2 rounded-md border border-white/[0.03] bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground",
                "transition-all duration-200 hover:scale-[1.02] hover:bg-secondary hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
              All templates
            </button>
          </Link>
        </CardContent>
      </Card>

      <Dialog open={promptTemplate !== null} onOpenChange={(open) => !open && handleClosePrompt()}>
        <DialogContent className="border-white/[0.03] bg-card">
          <DialogHeader>
            <DialogTitle>
              {promptTemplate?.name ?? "Run workflow"}
            </DialogTitle>
          </DialogHeader>
          {promptTemplate && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                {promptTemplate.description}
              </p>
              {getInputSchemaKeys(promptTemplate.inputSchema ?? {}).map((key) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`param-${key}`} className="text-sm">
                    {key}
                  </Label>
                  <Input
                    id={`param-${key}`}
                    value={params[key] ?? ""}
                    onChange={(e) =>
                      setParams((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={`Enter ${key}`}
                    className="bg-secondary/50 border-white/[0.03]"
                  />
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleClosePrompt}>
              Cancel
            </Button>
            <Button onClick={handleSubmitParams} className="bg-primary hover:bg-primary/90">
              Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
