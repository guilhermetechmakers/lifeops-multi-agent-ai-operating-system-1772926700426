/**
 * AnnotationPanel — add human-readable notes; attach to steps or messages.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TraceStep, Message } from "@/types/agent-trace";

export interface Annotation {
  id: string;
  stepIndex?: number;
  messageId?: string;
  content: string;
  createdAt: string;
  author?: string;
}

export interface AnnotationPanelProps {
  steps: TraceStep[];
  messages: Message[];
  currentStepIndex: number;
  selectedAgentId?: string | null;
  annotations?: Annotation[];
  onAddAnnotation?: (annotation: Omit<Annotation, "id" | "createdAt">) => void;
  className?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AnnotationPanel({
  steps,
  messages,
  currentStepIndex,
  annotations = [],
  onAddAnnotation,
  className,
}: AnnotationPanelProps) {
  const [content, setContent] = useState("");
  const [attachTo, setAttachTo] = useState<"step" | "message">("step");
  const [targetStepIndex, setTargetStepIndex] = useState(currentStepIndex);
  const [targetMessageId, setTargetMessageId] = useState<string>("");

  const safeSteps = steps ?? [];
  const safeMessages = messages ?? [];
  const safeAnnotations = Array.isArray(annotations) ? annotations : [];

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = content.trim();
      if (!trimmed || !onAddAnnotation) return;

      onAddAnnotation({
        ...(attachTo === "step" && { stepIndex: targetStepIndex }),
        ...(attachTo === "message" && targetMessageId && { messageId: targetMessageId }),
        content: trimmed,
        author: "user",
      });
      setContent("");
    },
    [content, attachTo, targetStepIndex, targetMessageId, onAddAnnotation]
  );

  return (
    <Card className={cn("rounded-lg border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-muted-foreground" />
          Annotations
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Add notes to steps or messages for future reference
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAttachTo("step")}
              className={cn(
                "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                attachTo === "step"
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-white/[0.03] bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              Step
            </button>
            <button
              type="button"
              onClick={() => setAttachTo("message")}
              className={cn(
                "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                attachTo === "message"
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-white/[0.03] bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              Message
            </button>
          </div>
          {attachTo === "step" && (
            <select
              value={targetStepIndex}
              onChange={(e) => setTargetStepIndex(Number(e.target.value))}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
              aria-label="Select step"
            >
              {safeSteps.map((s, i) => (
                <option key={i} value={i}>
                  Step {i + 1}
                  {s.activeAgentId ? ` (${s.activeAgentId})` : ""}
                </option>
              ))}
            </select>
          )}
          {attachTo === "message" && (
            <select
              value={targetMessageId}
              onChange={(e) => setTargetMessageId(e.target.value)}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
              aria-label="Select message"
            >
              <option value="">Select message</option>
              {safeMessages.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fromAgentId} → {m.toAgentId}: {m.type}
                </option>
              ))}
            </select>
          )}
          <Textarea
            placeholder="Add annotation..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[72px] text-sm resize-none"
            aria-label="Annotation content"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim()}
            className="w-full gap-2"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Add Annotation
          </Button>
        </form>

        {safeAnnotations.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <span className="text-xs font-medium text-muted-foreground">
              Recent annotations
            </span>
            <ul className="space-y-2">
              {safeAnnotations.slice(-5).reverse().map((a) => (
                <li
                  key={a.id}
                  className="rounded-md border border-white/[0.06] bg-secondary/20 p-2 text-xs"
                >
                  <p className="text-foreground">{a.content}</p>
                  <p className="text-muted-foreground mt-1">
                    {a.stepIndex != null && `Step ${a.stepIndex + 1}`}
                    {a.messageId && ` · Message`}
                    {a.createdAt && ` · ${formatTime(a.createdAt)}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {safeAnnotations.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No annotations yet. Add notes to document rationale or decisions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
