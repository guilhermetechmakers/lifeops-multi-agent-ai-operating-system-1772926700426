/**
 * ConnectBillingProcessorModal — Add/remove connectors, OAuth flows.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  { id: "stripe", name: "Stripe" },
  { id: "paddle", name: "Paddle" },
  { id: "recurly", name: "Recurly" },
];

interface ConnectBillingProcessorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (provider: string) => void;
  className?: string;
}

export function ConnectBillingProcessorModal({
  open,
  onOpenChange,
  onSuccess,
  className,
}: ConnectBillingProcessorModalProps) {
  const [provider, setProvider] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConnect = async () => {
    if (!provider) {
      toast.error("Select a provider");
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: call API when backend is ready; OAuth flow
      await new Promise((r) => setTimeout(r, 500));
      toast.success("Billing processor connected");
      const p = provider;
      setProvider("");
      onOpenChange(false);
      onSuccess?.(p);
    } catch {
      toast.error("Failed to connect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle>Connect Billing Processor</DialogTitle>
          <DialogDescription>
            Connect your billing provider to import subscriptions automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isSubmitting || !provider}>
            {isSubmitting ? "Connecting…" : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
