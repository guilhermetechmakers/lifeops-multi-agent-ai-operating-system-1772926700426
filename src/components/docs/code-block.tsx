import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  label?: string;
}

export function CodeBlock({
  code,
  language = "text",
  className,
  label,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [code]);

  return (
    <div className={cn("relative rounded-lg border border-white/[0.06] bg-[#0d0d0e]", className)}>
      {(label ?? language) && (
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
          <span className="text-xs text-muted-foreground">{label ?? language}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-teal" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
          </Button>
        </div>
      )}
      {!label && !language && (
        <div className="absolute right-2 top-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-teal" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
          </Button>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm text-muted-foreground">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
