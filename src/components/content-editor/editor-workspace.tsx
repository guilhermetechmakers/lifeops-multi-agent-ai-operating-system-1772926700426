/**
 * EditorWorkspace — WYSIWYG + Markdown toggle canvas for content editing.
 */

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { FileText, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markdownToHtml } from "@/lib/markdown";

export type EditorMode = "wysiwyg" | "markdown";

export interface EditorWorkspaceProps {
  value: string;
  onChange: (value: string) => void;
  mode?: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function EditorWorkspace({
  value,
  onChange,
  mode = "markdown",
  onModeChange,
  placeholder = "Write your content...",
  className,
  disabled = false,
}: EditorWorkspaceProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value ?? "");
    },
    [onChange]
  );

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.03] bg-secondary/30 transition-all duration-200",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/[0.03] px-3 py-2">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs",
              mode === "markdown"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            onClick={() => onModeChange?.("markdown")}
          >
            <Code className="h-4 w-4" />
            Markdown
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs",
              mode === "wysiwyg"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            onClick={() => onModeChange?.("wysiwyg")}
          >
            <FileText className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>
      <div className="min-h-[280px] p-4">
        {mode === "markdown" ? (
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "w-full min-h-[240px] resize-y rounded-md border-0 bg-transparent px-0 py-2",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-0 font-mono"
            )}
            spellCheck
          />
        ) : (
          <div
            className={cn(
              "min-h-[240px] rounded-md px-0 py-2 text-sm text-foreground",
              "prose prose-invert prose-sm max-w-none",
              "[&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base"
            )}
          >
            {markdownToHtml(value) ? (
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }} />
            ) : (
              <p className="text-muted-foreground">{placeholder}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
