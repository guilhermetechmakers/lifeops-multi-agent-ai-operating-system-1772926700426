/**
 * AddSubscriptionModal — Create new subscription with validation.
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const schema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  cadence: z.enum(["monthly", "quarterly", "yearly"]),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(1, "Currency is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  isTracked: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface AddSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: FormData) => void;
  isCreating?: boolean;
}

export function AddSubscriptionModal({
  open,
  onOpenChange,
  onCreate,
  isCreating,
}: AddSubscriptionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vendor: "",
      cadence: "monthly",
      amount: 0,
      currency: "USD",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      isTracked: true,
    },
  });

  const onSubmit = (data: FormData) => {
    onCreate(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
          <DialogDescription>
            Add a new subscription to track. You can connect a billing processor to import automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input
              id="vendor"
              {...register("vendor")}
              placeholder="e.g. Netflix"
              className={cn(errors.vendor && "border-destructive")}
            />
            {errors.vendor && (
              <p className="text-xs text-destructive">{errors.vendor.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cadence">Cadence</Label>
              <Select
                value={watch("cadence")}
                onValueChange={(v) => setValue("cadence", v as "monthly" | "quarterly" | "yearly")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step={0.01}
                min={0}
                {...register("amount", { valueAsNumber: true })}
                className={cn(errors.amount && "border-destructive")}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" {...register("currency")} placeholder="USD" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                className={cn(errors.startDate && "border-destructive")}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate.message}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isTracked"
              {...register("isTracked")}
              className="rounded border-input"
            />
            <Label htmlFor="isTracked" className="cursor-pointer">
              Track for forecasting
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
