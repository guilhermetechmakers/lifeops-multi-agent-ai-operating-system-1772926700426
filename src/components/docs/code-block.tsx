import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [code]);

  return (
    <div className={cn("relative group rounded-lg overflow-hidden", className)}>
      <pre
        className="rounded-lg bg-[#0d0d0f] border border-white/[0.03] p-4 text-sm overflow-x-auto"
        style={{ fontFamily: "ui-monospace, monospace" }}
      >
        <code className="text-muted-foreground">{code ?? ""}</code>
      </pre>
      {language && (
        <span className="absolute top-2 right-12 text-xs text-muted-foreground/70">
          {language}
        </span>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-120 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-4 w-4 text-teal" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
