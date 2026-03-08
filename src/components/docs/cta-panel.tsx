import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CTAPanelProps {
  title: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  className?: string;
}

export function CTAPanel({
  title,
  description,
  primaryLabel = "Get started",
  primaryHref = "/signup",
  secondaryLabel = "Book demo",
  secondaryHref = "#book-demo",
  onPrimaryClick,
  onSecondaryClick,
  className,
}: CTAPanelProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-white/[0.03] bg-card p-6 sm:p-8 text-center transition-all duration-200 hover:shadow-card-hover",
        className
      )}
      aria-labelledby="cta-panel-title"
    >
      <h2 id="cta-panel-title" className="text-xl font-semibold text-foreground sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
          {description}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {onPrimaryClick ? (
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px] transition-all duration-200 hover:scale-[1.02]"
            onClick={onPrimaryClick}
          >
            {primaryLabel}
          </Button>
        ) : (
          <Link to={primaryHref}>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px] transition-all duration-200 hover:scale-[1.02]"
            >
              {primaryLabel}
            </Button>
          </Link>
        )}
        {onSecondaryClick ? (
          <Button
            size="lg"
            variant="outline"
            className="min-w-[140px] transition-all duration-200 hover:scale-[1.02]"
            onClick={onSecondaryClick}
          >
            {secondaryLabel}
          </Button>
        ) : (
          <Link to={secondaryHref}>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[140px] transition-all duration-200 hover:scale-[1.02]"
            >
              {secondaryLabel}
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
}
