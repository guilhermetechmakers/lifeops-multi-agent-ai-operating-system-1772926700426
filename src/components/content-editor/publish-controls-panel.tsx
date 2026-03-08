/**
 * PublishControlsPanel — channel selectors, scheduling UI, metadata (SEO, tags), publish vs test run.
 * Integrates Content LLM Adapter for SEO suggestions.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Calendar, Tag, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { seoSuggestions } from "@/lib/content-llm-adapter";
import { toast } from "sonner";

const CHANNELS = [
  { id: "blog", label: "Blog" },
  { id: "newsletter", label: "Newsletter" },
  { id: "social", label: "Social" },
  { id: "cms", label: "CMS" },
];

export interface PublishControlsPanelProps {
  content?: string;
  onPublish: (payload: {
    channel: string;
    schedule?: string;
    seoTitle?: string;
    seoDescription?: string;
    tags?: string[];
  }) => void;
  onTestRun?: () => void;
  isPublishing?: boolean;
  className?: string;
}

export function PublishControlsPanel({
  content = "",
  onPublish,
  onTestRun,
  isPublishing = false,
  className,
}: PublishControlsPanelProps) {
  const [channel, setChannel] = useState("blog");
  const [schedule, setSchedule] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isSeoLoading, setIsSeoLoading] = useState(false);

  const handleSuggestSeo = useCallback(async () => {
    const text = (content ?? "").trim();
    if (!text) {
      toast.error("Add content first to get SEO suggestions");
      return;
    }
    setIsSeoLoading(true);
    try {
      const result = await seoSuggestions({ content: text });
      const meta = result?.seoMeta ?? {};
      if (meta.metaDescription) setSeoDescription(meta.metaDescription);
      if (Array.isArray(meta.keywords) && meta.keywords.length > 0) {
        setTags(meta.keywords.join(", "));
      }
      if (!seoTitle && text) setSeoTitle(text.slice(0, 60) + (text.length > 60 ? "..." : ""));
    } catch {
      toast.error("SEO suggestions failed");
    } finally {
      setIsSeoLoading(false);
    }
  }, [content, seoTitle]);

  const handlePublish = () => {
    onPublish({
      channel,
      schedule: schedule || undefined,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    });
  };

  return (
    <Card className={cn("border-white/[0.03] bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Publish Controls
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Channels, schedule, metadata, publish vs test
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Channel</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChannel(ch.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  channel === ch.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Schedule (optional)
          </Label>
          <Input
            type="datetime-local"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="mt-1.5 text-sm"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Search className="h-3.5 w-3.5" />
              SEO Title
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-amber"
              onClick={handleSuggestSeo}
              disabled={isSeoLoading || !content?.trim()}
            >
              <Sparkles className="h-3 w-3" />
              Suggest SEO
            </Button>
          </div>
          <Input
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Meta title"
            className="mt-1.5 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">SEO Description</Label>
          <Input
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Meta description"
            className="mt-1.5 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            Tags (comma-separated)
          </Label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="mt-1.5 text-sm"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            className="flex-1 gap-2"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <span className="animate-pulse">Publishing...</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Publish
              </>
            )}
          </Button>
          {onTestRun && (
            <Button
              type="button"
              variant="outline"
              onClick={onTestRun}
              disabled={isPublishing}
            >
              Test Run
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
