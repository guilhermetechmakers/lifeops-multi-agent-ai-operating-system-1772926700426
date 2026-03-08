import * as React from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ValidationMessage } from "./validation-message";
import { LegalConsentChecklist } from "./legal-consent-checklist";
import { ForgotPasswordLink } from "./forgot-password-link";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const signupSchema = loginSchema
  .extend({
    displayName: z.string().optional(),
    company: z.string().optional(),
    inviteCode: z.string().optional(),
    confirmPassword: z.string().min(1, "Confirm password"),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: "You must accept the Terms and Privacy Policy to sign up",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => (data.password?.length ?? 0) >= 8,
    { message: "Password must be at least 8 characters", path: ["password"] }
  );

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;

export interface EmailAuthFormProps {
  mode: "login" | "signup";
  onSubmit: (values: LoginFormValues | SignupFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export function EmailAuthForm({
  mode,
  onSubmit,
  isLoading = false,
  error,
  className,
}: EmailAuthFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const schema = mode === "login" ? loginSchema : signupSchema;

  const form = useForm<LoginFormValues | SignupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
      ...(mode === "signup"
        ? { displayName: "", company: "", inviteCode: "", confirmPassword: "", acceptTerms: false }
        : {}),
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values as LoginFormValues | SignupFormValues);
  });

  const isSignup = mode === "signup";

  return (
    <FormProvider {...form}>
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)} noValidate>
      {error && (
        <div role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="auth-email">Email</Label>
        <Input
          id="auth-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="bg-input border-white/[0.03]"
          aria-invalid={Boolean(form.formState.errors.email)}
          aria-describedby={form.formState.errors.email ? "auth-email-error" : undefined}
          {...form.register("email")}
        />
        <ValidationMessage
          id="auth-email-error"
          message={form.formState.errors.email?.message}
        />
      </div>

      {isSignup && (
        <div className="space-y-2">
          <Label htmlFor="auth-displayName">Display name (optional)</Label>
          <Input
            id="auth-displayName"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className="bg-input border-white/[0.03]"
            {...form.register("displayName")}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="auth-password">Password</Label>
        <div className="relative">
          <Input
            id="auth-password"
            type={showPassword ? "text" : "password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="••••••••"
            className="bg-input border-white/[0.03] pr-10"
            aria-invalid={Boolean(form.formState.errors.password)}
            aria-describedby={form.formState.errors.password ? "auth-password-error" : undefined}
            {...form.register("password")}
          />
          <button
            type="button"
            tabIndex={0}
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <ValidationMessage
          id="auth-password-error"
          message={form.formState.errors.password?.message}
        />
      </div>

      {isSignup && (
        <div className="space-y-2">
          <Label htmlFor="auth-confirmPassword">Confirm password</Label>
          <Input
            id="auth-confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            className="bg-input border-white/[0.03]"
            aria-invalid={Boolean("confirmPassword" in form.formState.errors && form.formState.errors.confirmPassword)}
            {...form.register("confirmPassword")}
          />
          <ValidationMessage
            message={"confirmPassword" in form.formState.errors ? form.formState.errors.confirmPassword?.message : undefined}
          />
        </div>
      )}

      {isSignup && (
        <LegalConsentChecklist name="acceptTerms" />
      )}

      {mode === "login" && (
        <>
          <div className="flex justify-end text-sm">
            <ForgotPasswordLink />
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="rememberMe"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="auth-rememberMe"
                  aria-describedby="auth-rememberMe-desc"
                  checked={field.value ?? false}
                  onCheckedChange={(v) => field.onChange(v === "indeterminate" ? false : v)}
                />
              )}
            />
            <Label
              htmlFor="auth-rememberMe"
              id="auth-rememberMe-desc"
              className="text-sm font-normal cursor-pointer"
            >
              Remember me
            </Label>
          </div>
        </>
      )}

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        disabled={isLoading || form.formState.isSubmitting}
      >
        {form.formState.isSubmitting || isLoading
          ? mode === "login"
            ? "Signing in..."
            : "Creating account..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </Button>
    </form>
    </FormProvider>
  );
}
