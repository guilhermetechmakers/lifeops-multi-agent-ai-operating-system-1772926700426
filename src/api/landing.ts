/**
 * Landing page content API. Optional CMS-backed endpoint with client-side validation.
 * GET /landing/content → { data: SectionContent | null }
 */

import { api } from "@/lib/api";
import { safeArray } from "@/lib/api/guards";
import type {
  SectionContent,
  HeroContent,
  FeatureCard,
  HowItWorksStep,
  PricingTier,
  Testimonial,
} from "@/types/landing";
import { defaultLandingContent } from "@/data/landing-content";

function isHeroContent(v: unknown): v is HeroContent {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.title === "string" &&
    typeof o.subtitle === "string" &&
    Array.isArray(o.ctas)
  );
}

function isFeatureCard(v: unknown): v is FeatureCard {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.icon === "string" &&
    typeof o.title === "string" &&
    typeof o.description === "string"
  );
}

function isHowItWorksStep(v: unknown): v is HowItWorksStep {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.title === "string" &&
    typeof o.description === "string" &&
    typeof o.icon === "string"
  );
}

function isPricingTier(v: unknown): v is PricingTier {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "string" &&
    Array.isArray(o.features)
  );
}

function isTestimonial(v: unknown): v is Testimonial {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.quote === "string" &&
    typeof o.author === "string"
  );
}

function parseHero(raw: unknown): HeroContent {
  const def = defaultLandingContent.hero;
  if (!isHeroContent(raw)) return def;
  const ctas = Array.isArray((raw as HeroContent).ctas)
    ? ((raw as HeroContent).ctas ?? []).filter(
        (c): c is { label: string; href: string } =>
          c != null &&
          typeof (c as { label?: string; href?: string }).label === "string" &&
          typeof (c as { label?: string; href?: string }).href === "string"
      )
    : def.ctas;
  return {
    title: (raw as HeroContent).title ?? def.title,
    subtitle: (raw as HeroContent).subtitle ?? def.subtitle,
    ctas: ctas.length > 0 ? ctas : def.ctas,
  };
}

export function parseLandingContent(raw: unknown): SectionContent {
  const data = raw != null && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const heroRaw = data.hero;
  const featuresRaw = data.features;
  const howItWorksRaw = data.howItWorks;
  const pricingRaw = data.pricing;
  const testimonialsRaw = data.testimonials;
  const integrationsRaw = data.integrations;

  const features: FeatureCard[] = safeArray<unknown>(featuresRaw).filter(
    isFeatureCard
  );
  const howItWorks: HowItWorksStep[] = safeArray<unknown>(howItWorksRaw).filter(
    isHowItWorksStep
  );
  const pricing: PricingTier[] = safeArray<unknown>(pricingRaw).filter(
    isPricingTier
  );
  const testimonials: Testimonial[] = safeArray<unknown>(testimonialsRaw).filter(
    isTestimonial
  );
  const integrations: string[] = safeArray<unknown>(integrationsRaw).filter(
    (x): x is string => typeof x === "string"
  );

  return {
    hero: parseHero(heroRaw),
    features: features.length > 0 ? features : defaultLandingContent.features,
    howItWorks:
      howItWorks.length > 0 ? howItWorks : defaultLandingContent.howItWorks,
    pricing: pricing.length > 0 ? pricing : defaultLandingContent.pricing,
    testimonials:
      testimonials.length > 0 ? testimonials : defaultLandingContent.testimonials,
    integrations:
      integrations.length > 0 ? integrations : defaultLandingContent.integrations,
  };
}

/**
 * Fetch landing content from optional CMS endpoint. Returns validated SectionContent.
 * On failure or missing endpoint, returns defaultLandingContent.
 * Expects GET /landing/content → { data: SectionContent | null } or SectionContent.
 */
export async function fetchLandingContent(): Promise<SectionContent> {
  try {
    const base = import.meta.env.VITE_API_URL ?? "";
    if (!base) return defaultLandingContent;
    const response = await api.get<unknown>("/landing/content");
    const data =
      response != null && typeof response === "object" && "data" in response
        ? (response as { data?: unknown }).data
        : response;
    if (data == null) return defaultLandingContent;
    return parseLandingContent(data);
  } catch {
    return defaultLandingContent;
  }
}
