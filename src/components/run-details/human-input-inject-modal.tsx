/**
 * HumanInputInjectModal — inject human input at governance points during a run.
 * Used for human-in-the-loop control when run is paused.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import type { HumanInputPayload } from "@/types/orchestration";

export interface HumanInputInjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: HumanInputPayload) => void;
  isSubmitting?: boolean;
  runId: string;
  stepId?: string;
  agentId?: string;
}

export function HumanInputInjectModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  runId,
  stepId,
  agentId,
}: HumanInputInjectModalProps) {
  const [inputKey, setInputKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    const input: Record<string, unknown> = {};
    if (inputKey.trim()) {
      try {
        input[inputKey.trim()] = JSON.parse(inputValue || "null");
      } catch {
        input[inputKey.trim()] = inputValue;
      }
    }
    onSubmit({
      stepId: stepId || undefined,
      agentId: agentId || undefined,
      input: Object.keys(input).length > 0 ? input : { override: inputValue || "user-input" },
      reason: reason.trim() || undefined,
    });
    setInputKey("");
    setInputValue("");
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-white/[0.03] bg-card">
        <DialogHeader>
          <DialogTitle>Inject Human Input</DialogTitle>
          <DialogDescription>
            Provide input to resume the run. Run ID: <code className="font-mono text-xs">{runId}</code>
            {stepId && (
              <span className="block mt-1">Step: {stepId}</span>
            )}
            {agentId && (
              <span className="block mt-1">Agent: {agentId}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="input-key">Key (optional)</Label>
            <Input
              id="input-key"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="e.g. decision, override"
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="input-value">Value (JSON or text)</Label>
            <Textarea
              id="input-value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='e.g. {"approved": true} or plain text'
              className="min-h-[80px] bg-background font-mono text-sm"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Manual approval for edge case"
              className="bg-background"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            <Send className="h-4 w-4" />
            {isSubmitting ? "Injecting…" : "Inject Input"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
