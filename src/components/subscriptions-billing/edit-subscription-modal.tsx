/**
 * EditSubscriptionModal — Edit subscription cadence, amount, dates.
 * Validates inputs; emits save with optimistic UI.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SubscriptionBilling, SubscriptionCadence } from "@/types/finance";

const schema = z.object({
  vendor: z.string().min(1, "Vendor required"),
  cadence: z.enum(["monthly", "quarterly", "yearly"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().min(1, "Currency required"),
  nextChargeDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export interface EditSubscriptionModalProps {
  subscription: SubscriptionBilling;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: SubscriptionBilling) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function EditSubscriptionModal({
  subscription,
  open,
  onOpenChange,
  onSave,
  isSubmitting = false,
  className,
}: EditSubscriptionModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vendor: subscription.vendor ?? "",
      cadence: (subscription.cadence ?? "monthly") as SubscriptionCadence,
      amount: subscription.amount ?? 0,
      currency: subscription.currency ?? "USD",
      nextChargeDate: subscription.nextChargeDate ?? subscription.startDate ?? "",
    },
  });

  const cadence = watch("cadence");

  const onSubmit = (values: FormValues) => {
    const updated: SubscriptionBilling = {
      ...subscription,
      vendor: values.vendor,
      cadence: values.cadence as SubscriptionCadence,
      amount: values.amount,
      currency: values.currency,
      nextChargeDate: values.nextChargeDate ?? undefined,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle>Edit subscription</DialogTitle>
          <DialogDescription>
            Update vendor, cadence, amount, and next charge date.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input
              id="vendor"
              {...register("vendor")}
              placeholder="e.g. Netflix"
              className={errors.vendor ? "border-destructive" : ""}
            />
            {errors.vendor && (
              <p className="text-xs text-destructive">{errors.vendor.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cadence">Cadence</Label>
            <Select
              value={cadence}
              onValueChange={(v) => setValue("cadence", v as SubscriptionCadence)}
            >
              <SelectTrigger id="cadence">
                <SelectValue placeholder="Select cadence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount")}
                className={errors.amount ? "border-destructive" : ""}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                {...register("currency")}
                placeholder="USD"
                className={errors.currency ? "border-destructive" : ""}
              />
              {errors.currency && (
                <p className="text-xs text-destructive">{errors.currency.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nextChargeDate">Next charge date</Label>
            <Input
              id="nextChargeDate"
              type="date"
              {...register("nextChargeDate")}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
