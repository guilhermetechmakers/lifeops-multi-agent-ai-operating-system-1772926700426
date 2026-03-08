import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export interface HeroCta {
  label: string;
  href: string;
}

interface LandingHeroProps {
  title: string;
  subtitle: string;
  ctas?: HeroCta[];
  illustrationSrc?: string;
  onBookDemoClick?: () => void;
}

export function LandingHero({
  title,
  subtitle,
  ctas = [],
  illustrationSrc,
  onBookDemoClick,
}: LandingHeroProps) {
  const heroCtas = Array.isArray(ctas) ? ctas : [];

  return (
    <section
      className="relative py-20 sm:py-24 lg:py-32 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[rgb(17,18,19)] to-[rgb(26,26,27)] opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,59,48,0.08),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <h1
              id="hero-heading"
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              {title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground lg:mx-0">
              {subtitle}
            </p>
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
              {heroCtas.map((cta, index) => {
                const isBookDemo = cta?.href === "#book-demo";
                if (isBookDemo && onBookDemoClick) {
                  return (
                    <Button
                      key={cta?.label ?? index}
                      size="lg"
                      variant="outline"
                      onClick={onBookDemoClick}
                      className="min-w-[140px] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                      data-tracking-id="hero-book-demo"
                    >
                      {cta?.label ?? "Book demo"}
                    </Button>
                  );
                }
                return (
                  <Link
                    key={cta?.label ?? index}
                    to={cta?.href ?? "/signup"}
                    data-tracking-id={isBookDemo ? "hero-book-demo" : "hero-signup"}
                  >
                    <Button
                      size="lg"
                      className={
                        index === 0
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 min-w-[160px] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                          : "min-w-[140px] transition-all duration-200 hover:scale-[1.02]"
                      }
                      variant={index === 0 ? "default" : "outline"}
                    >
                      {cta?.label ?? "Get started"}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
          {illustrationSrc ? (
            <div className="relative flex justify-center lg:justify-end">
              <img
                src={illustrationSrc}
                alt="Multi-agent orchestration"
                className="max-h-[400px] w-auto object-contain"
                loading="eager"
              />
            </div>
          ) : (
            <div className="relative flex justify-center lg:justify-end">
              <div className="grid grid-cols-3 gap-4 p-8 rounded-xl border border-white/[0.03] bg-card/50 backdrop-blur-sm">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-gradient-to-br from-secondary to-muted border border-white/[0.03] animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
