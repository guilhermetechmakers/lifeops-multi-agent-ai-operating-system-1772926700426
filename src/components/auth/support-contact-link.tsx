import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SUPPORT_URL = "mailto:support@lifeops.example.com";

export interface SupportContactLinkProps {
  className?: string;
  showIcon?: boolean;
}

export function SupportContactLink({
  className,
  showIcon = true,
}: SupportContactLinkProps) {
  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
        className
      )}
    >
      {showIcon && <HelpCircle className="h-4 w-4" />}
      Need help? Contact support
    </a>
  );
}
