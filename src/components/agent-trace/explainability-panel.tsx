/**
 * ExplainabilityPanel — show rationale per action/message with links to artifacts.
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message, TraceStep } from "@/types/agent-trace";

export interface ExplainabilityPanelProps {
  steps: TraceStep[];
  messages: Message[];
  currentStepIndex: number;
  selectedAgentId?: string | null;
  className?: string;
}

export function ExplainabilityPanel({
  steps,
  messages,
  currentStepIndex,
  selectedAgentId,
  className,
}: ExplainabilityPanelProps) {
  const safeSteps = Array.isArray(steps) ? steps : [];
  const safeMessages = Array.isArray(messages) ? messages : [];
  const currentStep = safeSteps[currentStepIndex] ?? null;
  const messageId = currentStep?.messageId ?? null;

  const message = useMemo(() => {
    if (!messageId) return null;
    return safeMessages.find((m) => m.id === messageId) ?? null;
  }, [messageId, safeMessages]);

  const msgExt = message as Message & {
    rationale?: string;
    explainability?: { action?: string; decision?: string; rationale?: string; artifactIds?: string[] };
  };
  const rationale = msgExt?.explainability?.rationale ?? msgExt?.rationale ?? null;
  const action = msgExt?.explainability?.action ?? null;
  const decision = msgExt?.explainability?.decision ?? null;
  const artifactIds = msgExt?.explainability?.artifactIds ?? [];
  const payloadSummary = message?.payloadSummary ?? null;

  const hasContent = rationale || action || decision ||
    (Array.isArray(artifactIds) && artifactIds.length > 0) ||
    (message != null && (message.type || payloadSummary));

  return (
    <Card className={cn("rounded-lg border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Explainability
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Rationale for current step
          {selectedAgentId && ` · Agent: ${selectedAgentId}`}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-[160px]">
          {!hasContent ? (
            <div className="py-6 text-center text-muted-foreground text-sm">
              No explainability data for this step
            </div>
          ) : (
            <div className="space-y-3">
              {message != null && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Message</p>
                  <p className="text-sm text-foreground">{message.type ?? "—"}</p>
                  {payloadSummary != null && (
                    <p className="text-xs text-muted-foreground mt-0.5">{payloadSummary}</p>
                  )}
                </div>
              )}
              {action != null && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Action</p>
                  <p className="text-sm text-foreground">{action}</p>
                </div>
              )}
              {decision != null && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Decision</p>
                  <p className="text-sm text-foreground">{decision}</p>
                </div>
              )}
              {rationale != null && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Rationale</p>
                  <p className="text-sm text-muted-foreground">{rationale}</p>
                </div>
              )}
              {Array.isArray(artifactIds) && artifactIds.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Artifacts
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {artifactIds.map((id) => (
                      <li key={id} className="text-xs font-mono text-muted-foreground">
                        {id}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
