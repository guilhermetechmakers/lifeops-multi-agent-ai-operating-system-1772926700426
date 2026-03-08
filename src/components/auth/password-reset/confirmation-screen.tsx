/**
 * Step 4: Reset complete. CTA to log in, optional links to dashboard/support.
 */

import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ConfirmationScreenProps {
  /** If true, user is already logged in (session created after reset) */
  isLoggedIn?: boolean;
  /** Callback when user clicks sign in (e.g. navigate) */
  onLogin?: () => void;
  className?: string;
}

export function ConfirmationScreen({
  isLoggedIn = false,
  onLogin,
  className,
}: ConfirmationScreenProps) {
  return (
    <div className={className}>
      <div
        role="status"
        className="flex flex-col items-center text-center animate-fade-in-up"
      >
        <CheckCircle2
          className="h-12 w-12 text-teal mb-4"
          aria-hidden
        />
        <h2 className="text-lg font-semibold text-foreground">
          Password reset complete
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLoggedIn
            ? "You are now signed in with your new password."
            : "Your password has been updated. Sign in with your new password."}
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {isLoggedIn ? (
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        ) : (
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link to="/auth" onClick={onLogin}>Sign in</Link>
          </Button>
        )}
        <p className="text-center text-micro text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
