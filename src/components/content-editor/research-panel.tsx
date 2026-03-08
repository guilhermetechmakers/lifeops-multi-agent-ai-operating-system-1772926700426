/**
 * ResearchPanel — linked sources, citation manager, LLM-assisted research.
 */

import { useState, useCallback } from "react";
import { Search, Plus, ExternalLink, Trash2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { researchAssist } from "@/lib/content-llm-adapter";
import { toast } from "sonner";
import type { Citation } from "@/types/content-editor";

export interface ResearchPanelProps {
  citations?: Citation[];
  onAddCitation?: (payload: { url: string; title?: string; snippet?: string }) => void;
  onRemoveCitation?: (id: string) => void;
  researchTopic?: string;
  className?: string;
}

export function ResearchPanel({
  citations = [],
  onAddCitation,
  onRemoveCitation,
  researchTopic,
  className,
}: ResearchPanelProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [topicInput, setTopicInput] = useState(researchTopic ?? "");
  const [researchNotes, setResearchNotes] = useState<string[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const items = Array.isArray(citations) ? citations : [];

  const handleResearchAssist = useCallback(async () => {
    const topic = topicInput.trim();
    if (!topic) {
      toast.error("Enter a topic to research");
      return;
    }
    setIsResearching(true);
    setResearchNotes([]);
    try {
      const result = await researchAssist({
        topic,
        depth: "medium",
      });
      setResearchNotes(Array.isArray(result?.notes) ? result.notes : []);
      const sources = result?.sources ?? [];
      (Array.isArray(sources) ? sources : []).forEach((s: string | { url?: string }) => {
        const u = typeof s === "string" ? s : s?.url;
        if (u && onAddCitation) onAddCitation({ url: u });
      });
    } catch {
      toast.error("Research assist failed");
    } finally {
      setIsResearching(false);
    }
  }, [topicInput, onAddCitation]);

  const handleAdd = () => {
    if (!url.trim()) return;
    onAddCitation?.({ url: url.trim(), title: title.trim() || undefined });
    setUrl("");
    setTitle("");
  };

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="h-4 w-4 text-teal" />
          Research
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Linked sources and citations
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">LLM Research Assist</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter topic to research..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              className="h-9 border-white/[0.03] bg-secondary/50 flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 border-white/[0.03] shrink-0"
              onClick={handleResearchAssist}
              disabled={isResearching || !topicInput.trim()}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber" />
              Research
            </Button>
          </div>
          {(researchNotes?.length ?? 0) > 0 && (
            <div className="rounded-md border border-white/[0.03] bg-secondary/20 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Research notes</p>
              <ul className="space-y-1 text-sm text-foreground">
                {(researchNotes ?? []).map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Add citation manually</label>
          <Input
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-9 border-white/[0.03] bg-secondary/50"
          />
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 border-white/[0.03] bg-secondary/50"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full gap-1.5 border-white/[0.03]"
            onClick={handleAdd}
            disabled={!url.trim()}
          >
            <Plus className="h-3.5 w-3.5" />
            Add citation
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="rounded-md border border-white/[0.03] bg-secondary/20 p-3 text-xs text-muted-foreground">
            No citations yet. Add sources to support your content.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between gap-2 rounded-md border border-white/[0.03] bg-secondary/20 p-2"
              >
                <div className="min-w-0 flex-1">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-foreground hover:text-primary"
                  >
                    {c.title ?? c.url}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                  {c.snippet && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {c.snippet}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveCitation?.(c.id)}
                  aria-label="Remove citation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
