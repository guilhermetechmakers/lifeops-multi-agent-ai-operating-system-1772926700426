import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Testimonial as TestimonialType } from "@/types/landing";

interface TestimonialsProps {
  testimonials?: TestimonialType[];
  className?: string;
}

export function Testimonials({ testimonials = [], className }: TestimonialsProps) {
  const items = Array.isArray(testimonials) ? testimonials : [];

  return (
    <section
      className={cn("py-16 sm:py-20", className)}
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="testimonials-heading"
          className="text-center text-2xl font-semibold text-foreground sm:text-3xl"
        >
          What people say
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Trusted by makers, teams, and enterprises.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((testimonial, index) => (
            <Card
              key={testimonial?.id ?? index}
              className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <CardContent className="pt-6">
                <blockquote className="text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{testimonial?.quote ?? ""}&rdquo;
                </blockquote>
                <footer className="mt-4">
                  <cite className="not-italic">
                    <span className="font-medium text-foreground">
                      {testimonial?.author ?? ""}
                    </span>
                    {testimonial?.role && (
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {testimonial.role}
                      </span>
                    )}
                  </cite>
                </footer>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
