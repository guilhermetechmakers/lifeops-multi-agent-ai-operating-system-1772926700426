import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Testimonial as TestimonialType } from "@/types/landing";

interface TestimonialsCarouselProps {
  testimonials?: TestimonialType[];
  autoRotateMs?: number;
  className?: string;
}

export function TestimonialsCarousel({
  testimonials = [],
  autoRotateMs = 5000,
  className,
}: TestimonialsCarouselProps) {
  const items = Array.isArray(testimonials) ? testimonials : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, autoRotateMs);
    return () => clearInterval(id);
  }, [items.length, autoRotateMs]);

  if (items.length === 0) return null;

  const current = items[index ?? 0] ?? items[0];
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

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
        <div className="mt-12 relative">
          <div
            className="rounded-xl border border-white/[0.03] bg-card p-8 md:p-12 transition-all duration-300 animate-fade-in"
            role="region"
            aria-roledescription="Testimonial carousel"
            aria-live="polite"
            aria-atomic="true"
          >
            <blockquote className="text-lg text-muted-foreground leading-relaxed">
              &ldquo;{current?.quote ?? ""}&rdquo;
            </blockquote>
            <footer className="mt-6">
              <cite className="not-italic">
                <span className="font-medium text-foreground">{current?.author ?? ""}</span>
                {current?.role && (
                  <span className="block text-sm text-muted-foreground mt-0.5">
                    {current.role}
                  </span>
                )}
              </cite>
            </footer>
          </div>
          {items.length > 1 && (
            <>
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prev}
                  aria-label="Previous testimonial"
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1" role="tablist" aria-label="Testimonial navigation">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      aria-label={`Testimonial ${i + 1}`}
                      onClick={() => setIndex(i)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-200",
                        i === index ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={next}
                  aria-label="Next testimonial"
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
