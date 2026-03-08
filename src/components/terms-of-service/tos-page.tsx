/**
 * ToSPage — Master container for Terms of Service with header, TOC, content, and contact.
 * LifeOps design system: dark UI, 8px grid, card surfaces, high-contrast typography.
 */

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AnimatedPage } from "@/components/animated-page";
import { VersionBadge } from "./version-badge";
import { TOC } from "./toc";
import { ToSContent } from "./tos-content";
import { LegalContactBlock } from "./legal-contact-block";
import {
  TOS_SECTIONS,
  TOS_VERSION,
  TOS_EFFECTIVE_DATE,
} from "@/data/terms-of-service-content";
import { cn } from "@/lib/utils";
import type { ToSSection, TOCItem } from "@/types/terms-of-service";

function buildTOCItems(sections: ToSSection[]): TOCItem[] {
  const safe = Array.isArray(sections) ? sections : [];
  return safe.map((s) => ({
    id: s?.id ?? "",
    title: s?.title ?? "",
    href: `#${s?.id ?? ""}`,
  }));
}

export interface ToSPageProps {
  sections?: ToSSection[];
  version?: string;
  effectiveDate?: string;
  className?: string;
}

export function ToSPage({
  sections,
  version = TOS_VERSION,
  effectiveDate = TOS_EFFECTIVE_DATE,
  className,
}: ToSPageProps) {
  const safeSections = Array.isArray(sections) ? sections : TOS_SECTIONS;
  const tocItems = buildTOCItems(safeSections);

  return (
    <AnimatedPage className={cn("min-h-screen", className)}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:bg-background"
      >
        Skip to content
      </a>
      <main
        id="main-content"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
        role="main"
        aria-label="Terms of Service"
      >
        <header className="mb-8 sm:mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
          <h1 className="text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-foreground mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mb-4">
            Please read these terms carefully before using the LifeOps platform.
            By accessing or using our service, you agree to be bound by these
            terms.
          </p>
          <VersionBadge version={version} effectiveDate={effectiveDate} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-12">
          <aside
            className="lg:sticky lg:top-8 lg:self-start order-2 lg:order-1"
            aria-label="Table of contents"
          >
            <div className="rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#0B0B0C] to-[#151718] p-5 transition-all duration-200">
              <TOC items={tocItems} />
            </div>
          </aside>

          <article className="space-y-8 order-1 lg:order-2">
            <div
              className="rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#0B0B0C] to-[#151718] p-5 sm:p-6 transition-all duration-200 hover:shadow-card-hover"
              style={{
                boxShadow:
                  "0 1px 0 0 rgba(255, 255, 255, 0.03), 0 2px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <div className="space-y-10">
                {safeSections.map((section, idx) => (
                  <ToSContent
                    key={section?.id ?? idx}
                    section={section}
                    className={idx > 0 ? "pt-8 border-t border-white/[0.03]" : ""}
                  />
                ))}
              </div>
            </div>

            <LegalContactBlock showForm={true} />
          </article>
        </div>

        <footer className="mt-12 pt-8 border-t border-white/[0.03]">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LifeOps. All rights reserved.
          </p>
        </footer>
      </main>
    </AnimatedPage>
  );
}
