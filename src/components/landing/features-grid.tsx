import { FeatureCard } from "./feature-card";
import { cn } from "@/lib/utils";
import type { FeatureCard as FeatureCardType } from "@/types/landing";

interface FeaturesGridProps {
  features?: FeatureCardType[];
  className?: string;
}

export function FeaturesGrid({ features = [], className }: FeaturesGridProps) {
  const items = Array.isArray(features) ? features : [];

  return (
    <section
      className={cn("py-16 sm:py-20", className)}
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="features-heading"
          className="text-center text-2xl font-semibold text-foreground sm:text-3xl"
        >
          Features
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Modular architecture across Projects, Content, Finance, Health, and
          Cronjobs & Orchestration.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((feature, index) => (
            <div
              key={feature?.id ?? index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <FeatureCard
                icon={feature?.icon ?? "zap"}
                title={feature?.title ?? ""}
                description={feature?.description ?? ""}
                ctaLabel={feature?.cta?.label}
                ctaHref={feature?.cta?.href}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
