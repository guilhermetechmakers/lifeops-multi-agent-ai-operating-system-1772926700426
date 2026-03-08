/**
 * SupportModal — Contact support form with pre-filled error context.
 * Description required; validates length. Submit shows toast and closes (API-ready later).
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";
import type { ErrorContext, SupportTicketPayload } from "@/types/server-error";

const supportFormSchema = z.object({
  description: z
    .string()
    .min(10, "Please provide at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
  subject: z.string().max(200).optional(),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

export interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorContext?: ErrorContext | null;
  onSubmit?: (payload: SupportTicketPayload) => void | Promise<void>;
}

export function SupportModal({
  open,
  onOpenChange,
  errorContext,
  onSubmit,
}: SupportModalProps) {
  const [isSubmitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: { description: "", subject: "" },
  });

  React.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onFormSubmit = async (data: SupportFormValues) => {
    setSubmitting(true);
    try {
      const payload: SupportTicketPayload = {
        subject: data.subject ?? "Server error support request",
        description: data.description,
        errorId: errorContext?.errorId,
        page: errorContext?.page,
        timestamp: errorContext?.timestamp,
      };
      await Promise.resolve(onSubmit?.(payload));
      toast.success("Support request received. We'll get back to you shortly.");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const errorId = errorContext?.errorId ?? "";
  const page = errorContext?.page ?? "";
  const timestamp = errorContext?.timestamp ?? new Date().toISOString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showClose={true}
        aria-describedby="support-modal-description"
      >
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription id="support-modal-description">
            Include the reference details below so we can resolve your issue faster.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-error-id">Reference ID</Label>
            <Input
              id="support-error-id"
              readOnly
              value={errorId}
              className="font-mono text-muted-foreground bg-secondary/50"
              aria-label="Error reference ID (read-only)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-page">Page</Label>
            <Input
              id="support-page"
              readOnly
              value={page}
              className="text-muted-foreground bg-secondary/50"
              aria-label="Page where error occurred (read-only)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-timestamp">Time</Label>
            <Input
              id="support-timestamp"
              readOnly
              value={timestamp}
              className="text-muted-foreground bg-secondary/50"
              aria-label="Error timestamp (read-only)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="support-description"
              placeholder="What were you doing when the error occurred?"
              rows={4}
              className={cn(errors.description && "border-destructive")}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "desc-error" : undefined}
              {...register("description")}
            />
            {errors.description && (
              <p id="desc-error" className="text-xs text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
