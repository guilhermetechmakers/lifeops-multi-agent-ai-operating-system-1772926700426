import { getIcon } from "./icon-map";
import { cn } from "@/lib/utils";
import type { HowItWorksStep } from "@/types/landing";

interface HowItWorksProps {
  steps?: HowItWorksStep[];
  className?: string;
}

export function HowItWorks({ steps = [], className }: HowItWorksProps) {
  const items = Array.isArray(steps) ? steps : [];

  return (
    <section
      className={cn("py-16 sm:py-20 bg-secondary/30", className)}
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="how-it-works-heading"
          className="text-center text-2xl font-semibold text-foreground sm:text-3xl"
        >
          How it works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Three steps to safe, auditable automation.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {items.map((step, index) => {
            const IconComponent = getIcon(step?.icon ?? "zap");
            return (
              <div
                key={index}
                className="relative flex flex-col items-center text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconComponent className="h-6 w-6" aria-hidden />
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-foreground">
                    {step?.title ?? ""}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step?.description ?? ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
