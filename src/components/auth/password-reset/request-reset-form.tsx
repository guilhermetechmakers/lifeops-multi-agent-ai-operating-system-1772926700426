/**
 * Step 1: Request reset email. Non-revealing success message, inline validation.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationMessage } from "@/components/auth/validation-message";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export type RequestResetFormData = z.infer<typeof schema>;
export type RequestResetFormValues = { email: string };

export interface RequestResetFormProps {
  onSubmit: (values: RequestResetFormValues) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  success?: boolean;
  rateLimited?: boolean;
  successMessage?: string | null;
  className?: string;
}

export function RequestResetForm({
  onSubmit,
  isSubmitting = false,
  error = null,
  success = false,
  rateLimited = false,
  successMessage = null,
  className,
}: RequestResetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestResetFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const handleFormSubmit = async (data: RequestResetFormData) => {
    await onSubmit({ email: data.email });
  };

  const displaySuccess = success || successMessage;

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={className}
      noValidate
    >
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}
      {displaySuccess ? (
        <div
          role="status"
          className="rounded-lg border border-teal/30 bg-teal/10 px-4 py-3 text-sm text-teal animate-fade-in"
        >
          If this email is registered, you will receive a reset link. Check your inbox.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="request-reset-email">Email</Label>
            <Input
              id="request-reset-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="bg-input border-white/[0.03]"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "request-reset-email-error" : undefined}
              {...register("email")}
            />
            <ValidationMessage
              id="request-reset-email-error"
              message={errors.email?.message}
              type="error"
            />
          </div>
          <Button
            type="submit"
            className="mt-4 w-full bg-primary hover:bg-primary/90 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={isSubmitting || rateLimited}
          >
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </>
      )}
    </form>
  );
}
