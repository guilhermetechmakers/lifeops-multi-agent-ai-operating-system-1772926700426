/**
 * SandboxRunnerPanel — dry-run output, logs, artifact diffs.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Loader2, FileText, AlertCircle } from "lucide-react";
import { useSandboxRun } from "@/hooks/use-sandbox";
import type { AgentTemplate } from "@/types/templates-personas";
import type { SandboxRunResult } from "@/types/templates-personas";

export interface SandboxRunnerPanelProps {
  template: AgentTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SandboxRunnerPanel({
  template,
  open,
  onOpenChange,
}: SandboxRunnerPanelProps) {
  const [inputPayload, setInputPayload] = useState("{}");
  const sandboxMutation = useSandboxRun();
  const [result, setResult] = useState<SandboxRunResult | null>(null);

  const handleRun = () => {
    if (!template) return;
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(inputPayload || "{}");
    } catch {
      payload = {};
    }
    sandboxMutation.mutate(
      {
        templateId: template.id,
        inputPayload: payload,
      },
      {
        onSuccess: (data) => {
          setResult(data ?? null);
        },
      }
    );
  };

  const logs = result?.logs ?? [];
  const artifacts = result?.artifacts ?? [];
  const errors = result?.errors ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={true}
        className="max-w-2xl max-h-[90vh] flex flex-col"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Sandbox: {template?.name ?? "Template"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 overflow-hidden">
          <div>
            <Label htmlFor="sandbox-payload">Input payload (JSON)</Label>
            <Textarea
              id="sandbox-payload"
              value={inputPayload}
              onChange={(e) => setInputPayload(e.target.value)}
              placeholder='{"topic": "example", "tone": "professional"}'
              className="mt-1 font-mono text-xs min-h-[80px]"
              aria-label="Input payload JSON"
            />
          </div>

          <Button
            onClick={handleRun}
            disabled={!template || sandboxMutation.isPending}
            className="gap-2"
          >
            {sandboxMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run sandbox
          </Button>

          {sandboxMutation.isPending && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}

          {result && !sandboxMutation.isPending && (
            <Tabs defaultValue="logs" className="flex-1 min-h-0 overflow-hidden">
              <TabsList>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="result">Result</TabsTrigger>
                <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
                {errors.length > 0 && (
                  <TabsTrigger value="errors" className="text-destructive">
                    Errors ({errors.length})
                  </TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="logs" className="mt-0 pt-4">
                <ScrollArea className="h-48 rounded-md border border-white/[0.03] bg-secondary/30 p-3 font-mono text-xs">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground">No logs.</p>
                  ) : (
                    logs.map((line, i) => (
                      <div key={i} className="whitespace-pre-wrap">
                        {line}
                      </div>
                    ))
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="result" className="mt-0 pt-4">
                <ScrollArea className="h-48 rounded-md border border-white/[0.03] bg-secondary/30 p-3 font-mono text-xs">
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="artifacts" className="mt-0 pt-4">
                <ScrollArea className="h-48">
                  {artifacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No artifacts.</p>
                  ) : (
                    <ul className="space-y-2">
                      {artifacts.map((a, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {a.name} ({a.type})
                        </li>
                      ))}
                    </ul>
                  )}
                </ScrollArea>
              </TabsContent>
              {errors.length > 0 && (
                <TabsContent value="errors" className="mt-0 pt-4">
                  <ScrollArea className="h-48 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                    <ul className="space-y-1 text-sm text-destructive">
                      {errors.map((e, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
