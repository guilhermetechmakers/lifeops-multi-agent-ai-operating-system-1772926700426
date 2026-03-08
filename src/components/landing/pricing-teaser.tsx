import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PricingTier } from "@/types/landing";

interface PricingTeaserProps {
  tiers?: PricingTier[];
  comparePlansHref?: string;
  className?: string;
}

export function PricingTeaser({
  tiers = [],
  comparePlansHref = "/docs#pricing",
  className,
}: PricingTeaserProps) {
  const items = Array.isArray(tiers) ? tiers : [];

  return (
    <section
      className={cn("py-16 sm:py-20", className)}
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="pricing-heading"
          className="text-center text-2xl font-semibold text-foreground sm:text-3xl"
        >
          Pricing
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Choose the plan that fits your team. Start free, scale as you grow.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {items.map((tier, index) => (
            <Card
              key={tier?.id ?? index}
              className={cn(
                "flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
                index === 1 && "ring-2 ring-primary/50"
              )}
            >
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground">
                  {tier?.name ?? ""}
                </h3>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {tier?.price ?? ""}
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-0">
                <ul className="space-y-3 flex-1">
                  {(tier?.features ?? []).map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 shrink-0 text-teal mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className="mt-6 block"
                  data-tracking-id={`pricing-cta-${tier?.id ?? index}`}
                >
                  <Button
                    className="w-full"
                    variant={index === 1 ? "default" : "outline"}
                  >
                    {tier?.ctaLabel ?? "Get started"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to={comparePlansHref}
            className="text-sm font-medium text-primary hover:text-primary/90 underline-offset-4 hover:underline"
            data-tracking-id="pricing-compare-plans"
          >
            Compare plans
          </Link>
        </div>
      </div>
    </section>
  );
}
