import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTAPanelProps {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  onBookDemoClick?: () => void;
  className?: string;
}

export function CTAPanel({
  title = "Ready to automate?",
  subtitle = "Connect your workflows, agents, and integrations in minutes.",
  primaryLabel = "Create account",
  primaryHref = "/signup",
  secondaryLabel = "Book demo",
  secondaryHref = "#book-demo",
  onBookDemoClick,
  className,
}: CTAPanelProps) {
  const isBookDemo = secondaryHref === "#book-demo";

  return (
    <section
      className={cn(
        "py-16 sm:py-20",
        "relative overflow-hidden",
        "rounded-2xl border border-white/[0.03]",
        "bg-gradient-to-br from-primary/5 via-background to-purple/5",
        className
      )}
      aria-labelledby="cta-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(255,59,48,0.06),transparent)]" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2
          id="cta-heading"
          className="text-2xl font-bold text-foreground sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {subtitle}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to={primaryHref} data-tracking-id="cta-primary">
            <Button
              size="lg"
              className="min-w-[160px] bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              {primaryLabel}
            </Button>
          </Link>
          {isBookDemo && onBookDemoClick ? (
            <Button
              size="lg"
              variant="outline"
              onClick={onBookDemoClick}
              className="min-w-[140px] transition-all duration-200 hover:scale-[1.02]"
              data-tracking-id="cta-book-demo"
            >
              {secondaryLabel}
            </Button>
          ) : (
            <Link to={secondaryHref} data-tracking-id="cta-secondary">
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
      </div>
    </section>
  );
}
