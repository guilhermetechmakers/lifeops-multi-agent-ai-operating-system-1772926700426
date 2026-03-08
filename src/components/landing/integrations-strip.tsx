import {
  Github,
  CreditCard,
  BarChart3,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const integrationIcons: Record<string, LucideIcon> = {
  GitHub: Github,
  Stripe: CreditCard,
  Plaid: BarChart3,
  Google: Globe,
  QuickBooks: BarChart3,
  "Health APIs": BarChart3,
};

interface IntegrationsStripProps {
  logos?: string[];
  className?: string;
}

export function IntegrationsStrip({ logos = [], className }: IntegrationsStripProps) {
  const items = Array.isArray(logos) ? logos : [];

  return (
    <section
      className={cn("py-16 sm:py-20 bg-secondary/30", className)}
      aria-labelledby="integrations-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="integrations-heading"
          className="text-center text-2xl font-semibold text-foreground sm:text-3xl"
        >
          Integrations
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Connect with the tools you already use.
        </p>
        <div className="mt-10 overflow-x-auto">
          <div className="flex flex-wrap justify-center gap-6 min-w-0 sm:flex-nowrap sm:justify-center">
            {items.map((name, index) => {
              const Icon = integrationIcons[name] ?? BarChart3;
              return (
                <div
                  key={name ?? index}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.03] bg-card px-4 py-3 shrink-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                  <span className="text-sm font-medium text-foreground">
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
