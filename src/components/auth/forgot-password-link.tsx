import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface ForgotPasswordLinkProps {
  className?: string;
}

export function ForgotPasswordLink({ className }: ForgotPasswordLinkProps) {
  return (
    <Link
      to="/auth/forgot"
      className={cn(
        "text-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
        className
      )}
    >
      Forgot password?
    </Link>
  );
}
