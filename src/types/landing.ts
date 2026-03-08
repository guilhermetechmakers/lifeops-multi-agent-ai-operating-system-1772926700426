export interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  cta?: { label: string; href: string };
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  features: string[];
  ctaLabel?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
}

export interface HowItWorksStep {
  title: string;
  description: string;
  icon: string;
}

export interface HeroCta {
  label: string;
  href: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  ctas: HeroCta[];
}

export interface SectionContent {
  hero: HeroContent;
  features: FeatureCard[];
  howItWorks: HowItWorksStep[];
  pricing: PricingTier[];
  testimonials: Testimonial[];
  integrations: string[];
}
