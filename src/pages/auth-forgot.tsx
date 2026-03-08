import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatedPage } from "@/components/animated-page";
import { toast } from "sonner";
import { requestPasswordReset } from "@/api/auth";
import { ValidationMessage } from "@/components/auth/validation-message";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function AuthForgotPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await requestPasswordReset(data.email);
      toast.success("Password reset email sent. Check your inbox.");
    } catch {
      toast.error("Failed to send reset email. Please try again.");
    }
  };

  return (
    <AnimatedPage className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-white/[0.03] bg-card shadow-card animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          <Link
            to="/"
            className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
          >
            LifeOps
          </Link>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            Enter your email and we’ll send a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="bg-input border-white/[0.03]"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              <ValidationMessage message={errors.email?.message} />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending…" : "Send reset link"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/auth" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
