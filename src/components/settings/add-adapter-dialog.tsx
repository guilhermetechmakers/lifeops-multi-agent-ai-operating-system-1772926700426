/**
 * Add Adapter dialog: type, name, rate limit, enabled, credential link.
 * Uses adapters API; guards all inputs and arrays.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { useCreateAdapter } from "@/hooks/use-adapters";
import type { AdapterType } from "@/types/adapters";
import { Loader2 } from "lucide-react";

const ADAPTER_TYPES: { value: AdapterType; label: string }[] = [
  { value: "llm", label: "LLM Provider" },
  { value: "github", label: "GitHub" },
  { value: "plaid", label: "Plaid" },
  { value: "stripe", label: "Stripe" },
  { value: "quickbooks", label: "QuickBooks" },
  { value: "health", label: "Health APIs" },
];

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["llm", "github", "plaid", "stripe", "quickbooks", "health"]),
  rateLimit: z.coerce.number().int().min(0).optional(),
  enabled: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export interface AddAdapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAdapterDialog({ open, onOpenChange }: AddAdapterDialogProps) {
  const [credentialsRef, setCredentialsRef] = useState("");
  const createAdapter = useCreateAdapter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "llm",
      rateLimit: 100,
      enabled: true,
    },
  });

  const enabled = watch("enabled");
  const selectedType = watch("type");

  const onSubmit = (data: FormValues) => {
    createAdapter.mutate(
      {
        type: data.type,
        name: data.name,
        enabled: data.enabled,
        config:
          typeof data.rateLimit === "number" && data.rateLimit >= 0
            ? { rateLimit: data.rateLimit }
            : {},
        credentialsRef: credentialsRef || undefined,
      },
      {
        onSuccess: () => {
          reset();
          setCredentialsRef("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add adapter</DialogTitle>
          <DialogDescription>
            Configure a new integration. Choose type, name, and optional rate limit. Link credentials in the next step.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={selectedType}
              onValueChange={(v) => setValue("type", v as FormValues["type"])}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {(ADAPTER_TYPES ?? []).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g. Production LLM"
              className="border-white/[0.03]"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rateLimit">Rate limit (requests/min, optional)</Label>
            <Input
              id="rateLimit"
              type="number"
              min={0}
              {...register("rateLimit")}
              className="border-white/[0.03]"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/[0.03] p-4">
            <Label htmlFor="enabled" className="cursor-pointer">
              Enabled
            </Label>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={(v) => setValue("enabled", v)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/[0.03]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAdapter.isPending}
              className="transition-transform hover:scale-[1.02]"
            >
              {createAdapter.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
