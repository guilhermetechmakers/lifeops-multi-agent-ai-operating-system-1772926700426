/**
 * LLMAssistantPanel — prompts, tone controls, expansion, rewrite, summarize, outline.
 * Uses Content LLM Adapter for drafting, editing, and suggestions.
 */

import { useState, useCallback } from "react";
import { Sparkles, Expand, RefreshCw, FileText, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  draftContent,
  editContent,
  seoSuggestions,
} from "@/lib/content-llm-adapter";
import { toast } from "sonner";

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "conversational", label: "Conversational" },
];

export interface LLMAssistantPanelProps {
  content: string;
  draftId?: string | null;
  onApplySuggestion?: (suggestion: string) => void;
  className?: string;
}

export function LLMAssistantPanel({
  content,
  draftId,
  onApplySuggestion,
  className,
}: LLMAssistantPanelProps) {
  const [tone, setTone] = useState("professional");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = useCallback(
    async (action: "expand" | "rewrite" | "summarize" | "outline") => {
      setIsLoading(true);
      setSuggestion("");
      try {
        if (action === "expand") {
          const result = await draftContent({
            idea: content || "Expand this section",
            constraints: { tone, maxLength: 2000 },
          });
          setSuggestion(result?.draft ?? "");
        } else if (action === "rewrite") {
          const result = await editContent({
            draftId: draftId ?? undefined,
            content,
            edits: `Rewrite this content in a ${tone} tone`,
            constraints: { tone },
          });
          setSuggestion(result?.editedDraft ?? "");
        } else if (action === "summarize") {
          const result = await seoSuggestions({
            content,
            targetKeywords: [],
          });
          const meta = result?.seoMeta?.metaDescription ?? "";
          setSuggestion(meta || `Summary: ${content.slice(0, 200)}${content.length > 200 ? "..." : ""}`);
        } else {
          const result = await draftContent({
            idea: `Create an outline for: ${content.slice(0, 300)}`,
            constraints: { tone },
          });
          const outline = result?.draft ?? "1. Introduction\n2. Main points\n3. Conclusion";
          setSuggestion(outline);
        }
      } catch {
        toast.error("LLM request failed. Retry or check connection.");
      } finally {
        setIsLoading(false);
      }
    },
    [content, tone, draftId]
  );

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-amber" />
          LLM Assistant
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Expand, rewrite, adjust tone, or generate outline
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Tone
          </label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="h-9 border-white/[0.03] bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-white/[0.03]"
            onClick={() => handleAction("expand")}
            disabled={isLoading || !content}
          >
            <Expand className="h-3.5 w-3.5" />
            Expand
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-white/[0.03]"
            onClick={() => handleAction("rewrite")}
            disabled={isLoading || !content}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Rewrite
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-white/[0.03]"
            onClick={() => handleAction("summarize")}
            disabled={isLoading || !content}
          >
            <FileText className="h-3.5 w-3.5" />
            Summarize
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-white/[0.03]"
            onClick={() => handleAction("outline")}
            disabled={isLoading || !content}
          >
            <List className="h-3.5 w-3.5" />
            Outline
          </Button>
        </div>

        {suggestion && (
          <div className="rounded-md border border-white/[0.03] bg-secondary/30 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Suggestion
            </p>
            <div className="max-h-32 overflow-y-auto text-sm text-foreground">
              {suggestion}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2 h-8"
              onClick={() => onApplySuggestion?.(suggestion)}
            >
              Apply
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
