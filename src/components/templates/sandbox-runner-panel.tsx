/**
 * Sandbox runner panel: run template in sandbox and show logs, artifacts, errors.
 * All array reads guarded with (data ?? []) and Array.isArray.
 */

import { useState } from "react";
import { Play, Loader2, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sandboxApi } from "@/api/sandbox";
import type { SandboxRunResult } from "@/types/templates-personas";

export interface SandboxRunnerPanelProps {
  templateId: string;
  templateName?: string;
  personaId?: string;
  onClose?: () => void;
}

export function SandboxRunnerPanel({
  templateId,
  templateName,
  personaId,
}: SandboxRunnerPanelProps) {
  const [inputPayload, setInputPayload] = useState("{}");
  const [scope, setScope] = useState("test");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SandboxRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);
    try {
      let payload: Record<string, unknown> = {};
      try {
        payload = JSON.parse(inputPayload || "{}") as Record<string, unknown>;
      } catch {
        setError("Invalid JSON in input payload");
        setIsRunning(false);
        return;
      }
      const res = await sandboxApi.run({
        templateId,
        personaId,
        inputPayload: payload,
        scope: scope ? [scope] : undefined,
      });
      setResult(res ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sandbox run failed");
    } finally {
      setIsRunning(false);
    }
  };

  const logs = result?.logs ?? [];
  const artifacts = result?.artifacts ?? [];
  const errors = result?.errors ?? [];
  const hasErrors = Array.isArray(errors) && errors.length > 0;
  const hasArtifacts = Array.isArray(artifacts) && artifacts.length > 0;

  return (
    <Card className="border-white/[0.03] bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Play className="h-4 w-4" />
          Sandbox test
          {templateName && (
            <span className="font-normal text-foreground">— {templateName}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label className="text-xs">Input payload (JSON)</Label>
          <Textarea
            value={inputPayload}
            onChange={(e) => setInputPayload(e.target.value)}
            placeholder='{"key": "value"}'
            className="min-h-[80px] font-mono text-xs bg-secondary/50"
            aria-label="Input payload JSON"
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-xs">Scope</Label>
          <input
            type="text"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-secondary/50 px-3 py-1 text-sm"
            placeholder="test"
            aria-label="Scope"
          />
        </div>
        <Button
          onClick={handleRun}
          disabled={isRunning}
          className="w-full transition-transform duration-120 hover:scale-[1.02]"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {isRunning ? "Running…" : "Run sandbox"}
        </Button>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {hasErrors ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-teal" />
              )}
              {hasErrors ? "Run completed with errors" : "Run completed"}
            </div>

            {Array.isArray(logs) && logs.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Logs
                </p>
                <ScrollArea className="h-32 rounded-md border border-white/[0.03] bg-secondary/30 p-2">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                    {(logs ?? []).join("\n")}
                  </pre>
                </ScrollArea>
              </div>
            )}

            {hasErrors && (
              <div>
                <p className="text-xs font-medium text-destructive mb-1">Errors</p>
                <ul className="list-disc list-inside text-xs text-destructive space-y-0.5">
                  {(errors ?? []).map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {hasArtifacts && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Artifacts</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {(artifacts ?? []).map((a, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <span>{a.name}</span>
                      <span className="text-muted-foreground/70">({a.type})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
