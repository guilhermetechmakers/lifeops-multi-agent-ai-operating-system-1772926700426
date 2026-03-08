/**
 * CookiePolicyPage — Master container for cookie consent management.
 * Header, category grid, consent controls, audit trail.
 * LifeOps design: dark UI, 8px grid, card surfaces, high-contrast typography.
 * Data flow: ConsentProvider (app or page) → useConsent → persist via cookie-consent-storage.
 */

import { useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AnimatedPage } from "@/components/animated-page";
import { CookieCategoryCard } from "./cookie-category-card";
import { ConsentControls } from "./consent-controls";
import { AuditTrailPreview } from "./audit-trail-preview";
import { useConsent } from "@/contexts/consent-context";
import { cn } from "@/lib/utils";

function CookiePolicyContent({ className }: { className?: string }) {
  const {
    categories,
    setCategoryEnabled,
    acceptAll,
    rejectAll,
    savePreferences,
    isDirty,
    lastSavedAt,
    lastChanges,
  } = useConsent();

  const safeCategories = Array.isArray(categories) ? categories : [];

  const handleToggle = useCallback(
    (id: string, enabled: boolean) => {
      setCategoryEnabled(id, enabled);
    },
    [setCategoryEnabled]
  );

  const handleSave = useCallback(() => {
    savePreferences();
    toast.success("Cookie preferences saved", {
      description: "Your preferences have been updated.",
    });
  }, [savePreferences]);

  return (
    <AnimatedPage className={cn("min-h-screen", className)}>
      <main
        className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
        role="main"
        aria-label="Cookie Policy"
      >
        <header className="mb-8 sm:mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
          <h1 className="text-heading-lg font-semibold text-foreground mb-2">
            Cookie Policy
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Manage your cookie preferences. We use cookies to improve your
            experience and analyze site usage. You can enable or disable
            optional categories below.
          </p>
        </header>

        <section
          className="space-y-6"
          aria-labelledby="categories-heading"
        >
          <h2 id="categories-heading" className="sr-only">
            Cookie categories
          </h2>
          {(safeCategories ?? []).map((cat) => (
            <CookieCategoryCard
              key={cat.id}
              category={cat}
              onToggle={handleToggle}
              disabled={cat.required === true}
            />
          ))}
        </section>

        <section
          className="mt-8 rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#0B0B0C] to-[#151718] p-5 sm:p-6"
          style={{
            boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.03), 0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
          aria-labelledby="controls-heading"
        >
          <h2 id="controls-heading" className="text-lg font-semibold text-foreground mb-4">
            Consent controls
          </h2>
          <ConsentControls
            onAcceptAll={acceptAll}
            onRejectAll={rejectAll}
            onSavePreferences={handleSave}
            isDirty={isDirty}
          />
        </section>

        <section className="mt-6" aria-label="Audit trail">
          <AuditTrailPreview
            lastUpdated={lastSavedAt}
            lastEntry={
              lastSavedAt
                ? { timestamp: lastSavedAt, changes: lastChanges ?? [] }
                : undefined
            }
          />
        </section>

        <footer className="mt-12 pt-8 border-t border-white/[0.03]">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LifeOps. All rights reserved.
          </p>
        </footer>
      </main>
    </AnimatedPage>
  );
}

/** Renders the cookie policy content; must be used inside ConsentProvider (e.g. app-level). */
export function CookiePolicyPage({ className }: { className?: string }) {
  return <CookiePolicyContent className={className} />;
}
