/**
 * Step 3: Set new password with strength meter and confirm match.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationMessage } from "@/components/auth/validation-message";
import { StrengthMeter, type StrengthLevel } from "./strength-meter";
import { InlineError } from "./inline-error";
import { cn } from "@/lib/utils";

const MIN_LENGTH = 8;
const schema = z
  .object({
    password: z
      .string()
      .min(MIN_LENGTH, `Password must be at least ${MIN_LENGTH} characters`)
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/\d/, "Include a number"),
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export type SetNewPasswordFormData = z.infer<typeof schema>;
export type SetNewPasswordFormValues = { newPassword: string };

export interface SetNewPasswordFormProps {
  onSubmit: (values: SetNewPasswordFormValues) => Promise<void>;
  token: string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  /** Minimum strength level (0–4) to allow submit */
  minStrength?: StrengthLevel;
  className?: string;
}

export function SetNewPasswordForm({
  onSubmit,
  token,
  isLoading = false,
  isSubmitting = false,
  error = null,
  minStrength = 2,
  className,
}: SetNewPasswordFormProps) {
  const loading = isLoading || isSubmitting;
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetNewPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const password = watch("password") ?? "";

  const handleFormSubmit = async (data: SetNewPasswordFormData) => {
    await onSubmit({ newPassword: data.password });
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn("space-y-4", className)}
      noValidate
      data-reset-token-present={!!token}
    >
      {error && (
        <InlineError
          message={error}
          action={
            <Link to="/auth/forgot" className="text-primary hover:underline font-medium">
              Request a new reset link
            </Link>
          }
        />
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            className="bg-input border-white/[0.03]"
            aria-invalid={Boolean(errors.password)}
            aria-describedby="password-strength"
            {...register("password")}
          />
          <StrengthMeter
            password={password}
            minLevel={minStrength}
            id="password-strength"
          />
          <ValidationMessage message={errors.password?.message} type="error" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            className="bg-input border-white/[0.03]"
            aria-invalid={Boolean(errors.confirm)}
            {...register("confirm")}
          />
          <ValidationMessage message={errors.confirm?.message} type="error" />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="show-password"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="h-4 w-4 rounded border-input"
            aria-label="Show passwords"
          />
          <Label htmlFor="show-password" className="text-sm font-normal cursor-pointer">
            Show passwords
          </Label>
        </div>
      </div>
      <Button
        type="submit"
        className="mt-6 w-full bg-primary hover:bg-primary/90 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        disabled={loading}
      >
        {loading ? "Setting password…" : "Set new password"}
      </Button>
    </form>
  );
}
