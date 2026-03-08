/**
 * IdeaCaptureCard — lightweight brainstorming prompts, draft-from-idea via LLM.
 */

import { useState, useCallback } from "react";
import { Lightbulb, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { draftContent } from "@/lib/content-llm-adapter";
import { toast } from "sonner";

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "conversational", label: "Conversational" },
];

const LENGTH_OPTIONS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

export interface IdeaCaptureCardProps {
  onDraftGenerated?: (draft: string) => void;
  className?: string;
}

export function IdeaCaptureCard({ onDraftGenerated, className }: IdeaCaptureCardProps) {
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(true);

  const handleGenerate = useCallback(async () => {
    const text = (idea ?? "").trim();
    if (!text) {
      toast.error("Enter an idea first");
      return;
    }
    setIsLoading(true);
    try {
      const result = await draftContent({
        idea: text,
        constraints: { tone, length, format: "markdown" },
      });
      const draft = result?.draft ?? "";
      if (draft) {
        onDraftGenerated?.(draft);
        toast.success("Draft generated");
        setOpen(false);
      } else {
        toast.error("No draft returned");
      }
    } catch {
      toast.error("Draft generation failed");
    } finally {
      setIsLoading(false);
    }
  }, [idea, tone, length, onDraftGenerated]);

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="p-4">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              aria-expanded={open}
            >
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-amber" />
                Idea capture
              </CardTitle>
              {open ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
          <p className="text-xs text-muted-foreground">
            Start with an idea; LLM generates a draft
          </p>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 p-4 pt-0">
            <div className="space-y-2">
              <Label className="text-xs">Idea or topic</Label>
              <Input
                placeholder="e.g. 5 tips for remote productivity"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="h-9 border-white/[0.03] bg-secondary/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Tone</Label>
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
              <div className="space-y-1.5">
                <Label className="text-xs">Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="h-9 border-white/[0.03] bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LENGTH_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full gap-2 transition-all duration-200 hover:scale-[1.02]"
              onClick={handleGenerate}
              disabled={isLoading || !idea.trim()}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isLoading ? "Generating…" : "Generate draft"}
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
