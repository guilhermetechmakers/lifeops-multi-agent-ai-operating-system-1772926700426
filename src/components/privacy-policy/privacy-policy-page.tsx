/**
 * PrivacyPolicyPage — Main container with header, content sections, and footer actions.
 * LifeOps design system: dark UI, 8px grid, card surfaces, high-contrast typography.
 */

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AnimatedPage } from "@/components/animated-page";
import { TypographyBlock } from "./typography-block";
import { DataSectionList } from "./data-section-list";
import { ContactBlock } from "./contact-block";
import { ConsentControlsLink } from "./consent-controls-link";
import { PRIVACY_POLICY_SECTIONS } from "@/data/privacy-policy-content";
import { cn } from "@/lib/utils";

interface PrivacyPolicyPageProps {
  sections?: typeof PRIVACY_POLICY_SECTIONS;
  className?: string;
}

export function PrivacyPolicyPage({
  sections,
  className,
}: PrivacyPolicyPageProps) {
  const safeSections = Array.isArray(sections) ? sections : PRIVACY_POLICY_SECTIONS;

  return (
    <AnimatedPage className={cn("min-h-screen", className)}>
      <main
        className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
        role="main"
        aria-label="Privacy Policy"
      >
        <header className="mb-8 sm:mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
          <TypographyBlock variant="h1" as="h1" className="mb-2">
            Privacy Policy
          </TypographyBlock>
          <TypographyBlock variant="meta" className="max-w-2xl">
            Last updated: March 2025. This policy describes how LifeOps collects, uses, and protects
            your personal data.
          </TypographyBlock>
        </header>

        <article className="space-y-8">
          <div
            className="rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#0B0B0C] to-[#151718] p-5 sm:p-6 transition-all duration-200 hover:shadow-card-hover"
            style={{
              boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.03), 0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <DataSectionList sections={safeSections} />
          </div>

          <ContactBlock />

          <section
            className="rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#0B0B0C] to-[#151718] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            aria-labelledby="consent-heading"
          >
            <div>
              <TypographyBlock variant="h2" as="h2" id="consent-heading">
                Manage your preferences
              </TypographyBlock>
              <TypographyBlock variant="meta" className="mt-1">
                Control data retention, export, and deletion from your account settings.
              </TypographyBlock>
            </div>
            <ConsentControlsLink variant="button" className="shrink-0" />
          </section>
        </article>

        <footer className="mt-12 pt-8 border-t border-white/[0.03]">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LifeOps. All rights reserved.
          </p>
        </footer>
      </main>
    </AnimatedPage>
  );
}
