/**
 * EmptyState — helpful guidance with links to Billing & Payments when no data.
 */

import { Link } from "react-router-dom";
import { FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
  label: string;
  to?: string;
  onClick?: () => void;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actions = [],
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-secondary/30 p-8 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {icon ?? <FileText className="h-12 w-12 text-muted-foreground mb-3" aria-hidden />}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {(actions ?? []).length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {(actions ?? []).map((action, i) => (
            <span key={i}>
              {action.to ? (
                <Button variant="outline" size="sm" asChild>
                  <Link to={action.to}>{action.label}</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              )}
            </span>
          ))}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/profile/billing" className="gap-1">
              <HelpCircle className="h-4 w-4" />
              Billing & Payments
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
