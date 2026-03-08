import { useState } from "react";
import { AnimatedPage } from "@/components/animated-page";
import {
  LandingNavbar,
  LandingHero,
  FeaturesGrid,
  HowItWorks,
  PricingTeaser,
  IntegrationsStrip,
  TestimonialsCarousel,
  CTAPanel,
  FooterLinks,
  BookDemoDialog,
} from "@/components/landing";
import { useLandingContent } from "@/hooks/useLandingContent";

export default function Landing() {
  const [bookDemoOpen, setBookDemoOpen] = useState(false);
  const { data: content, isError: contentFetchFailed } = useLandingContent();

  const hero = content?.hero ?? { title: "", subtitle: "", ctas: [] };
  const features = Array.isArray(content?.features) ? content.features : [];
  const howItWorks = Array.isArray(content?.howItWorks) ? content.howItWorks : [];
  const pricing = Array.isArray(content?.pricing) ? content.pricing : [];
  const testimonials = Array.isArray(content?.testimonials)
    ? content.testimonials
    : [];
  const integrations = Array.isArray(content?.integrations)
    ? content.integrations
    : [];

  const heroCtas = Array.isArray(hero?.ctas) ? hero.ctas : [];

  return (
    <AnimatedPage className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgb(17,18,19)] to-[rgb(26,26,27)]" />
        <div className="relative">
          <LandingNavbar />
          {contentFetchFailed && (
            <div
              role="status"
              aria-live="polite"
              className="mx-auto max-w-6xl px-4 py-2 text-center text-xs text-muted-foreground"
            >
              Content may be outdated. Showing cached version.
            </div>
          )}
          <main>
            <LandingHero
              title={hero?.title ?? ""}
              subtitle={hero?.subtitle ?? ""}
              ctas={heroCtas}
              onBookDemoClick={() => setBookDemoOpen(true)}
            />
            <section id="features" aria-label="Features">
              <FeaturesGrid features={features} />
            </section>
            <HowItWorks steps={howItWorks} />
            <section id="pricing" aria-label="Pricing">
              <PricingTeaser tiers={pricing} />
            </section>
            <IntegrationsStrip logos={integrations} />
            <TestimonialsCarousel testimonials={testimonials} />
            <section id="cta" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <CTAPanel onBookDemoClick={() => setBookDemoOpen(true)} />
            </section>
            <FooterLinks />
          </main>
        </div>
      </div>
      <BookDemoDialog open={bookDemoOpen} onOpenChange={setBookDemoOpen} />
    </AnimatedPage>
  );
}
