/**
 * ToSPage — Master container for Terms of Service.
 * Header, version badge, TOC, content sections, legal contact block.
 * LifeOps design system: dark UI, 8px grid, card surfaces.
 */

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AnimatedPage } from "@/components/animated-page";
import { VersionBadge } from "./version-badge";
import { TOC } from "./toc";
import { ToSContent } from "./terms-content";
import { LegalContactBlock } from "./legal-contact-block";
import { TOS_SECTIONS, TOS_VERSION_INFO } from "@/data/terms-of-service-content";
import { cn } from "@/lib/utils";
import type { ToSSection } from "@/types/terms-of-service";

export interface ToSPageProps {
  sections?: ToSSection[] | null;
  className?: string;
}

export function ToSPage({ sections, className }: ToSPageProps) {
  const safeSections = Array.isArray(sections) ? sections : TOS_SECTIONS;

  return (
    <AnimatedPage className={cn("min-h-screen", className)}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to content
      </a>
      <main
        id="main-content"
        className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
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
          <h1 className="text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-foreground mb-2">
            Terms of Service
          </h1>
          <VersionBadge versionInfo={TOS_VERSION_INFO} className="mb-4" />
          <p className="text-sm text-muted-foreground max-w-2xl">
            Please read these Terms of Service carefully before using the LifeOps
            platform. By accessing or using our Service, you agree to be bound by
            these Terms.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <aside
            className="lg:w-56 shrink-0"
            aria-label="Table of contents"
          >
            <div className="lg:sticky lg:top-8">
              <TOC sections={safeSections} />
            </div>
          </aside>

          <article className="flex-1 min-w-0 space-y-8">
            <div
              className="rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#0B0B0C] to-[#151718] p-5 sm:p-6 transition-all duration-200"
              style={{
                boxShadow:
                  "0 1px 0 0 rgba(255, 255, 255, 0.03), 0 2px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              {(safeSections ?? []).map((section, idx) => (
                <ToSContent
                  key={section?.id ?? idx}
                  section={section}
                  className={idx > 0 ? "pt-8 border-t border-white/[0.03]" : ""}
                />
              ))}
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
