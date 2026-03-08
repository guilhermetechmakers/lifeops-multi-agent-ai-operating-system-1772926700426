/**
 * AutosaveEngine — saves draft versions at configurable intervals; exposes save status.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface AutosaveEngineProps {
  onSave: (content: string) => Promise<void>;
  content: string;
  intervalMs?: number;
  debounceMs?: number;
  className?: string;
}

export function AutosaveEngine({
  onSave,
  content,
  intervalMs = 30000,
  debounceMs = 1500,
  className,
}: AutosaveEngineProps) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const lastSavedRef = useRef<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const performSave = useCallback(async () => {
    if (content === lastSavedRef.current) return;
    setStatus("saving");
    try {
      await onSave(content);
      lastSavedRef.current = content;
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }, [content, onSave]);

  useEffect(() => {
    if (content === lastSavedRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(performSave, debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, debounceMs, performSave]);

  useEffect(() => {
    intervalRef.current = setInterval(performSave, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs, performSave]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {status === "saving" && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3.5 w-3.5 text-teal" />
          <span className="text-teal">Saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-destructive">Save failed</span>
        </>
      )}
      {status === "idle" && <span className="opacity-0">·</span>}
    </div>
  );
}
