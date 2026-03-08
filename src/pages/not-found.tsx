/**
 * 404 Not Found route. Renders recovery-oriented page with search,
 * Home CTA, module quick links, and suggested actions.
 */

import { AnimatedPage } from "@/components/animated-page";
import {
  HeroHeader,
  SearchBox,
  ActionPanel,
  SuggestedActions,
} from "@/components/not-found";

export default function NotFound() {
  return (
    <main
      className="min-h-screen bg-background"
      role="main"
      aria-label="Page not found"
    >
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-24"
        style={{
          background:
            "linear-gradient(180deg, rgb(var(--background)) 0%, rgb(21 23 24) 50%, rgb(var(--background)) 100%)",
        }}
      >
        <AnimatedPage className="w-full max-w-2xl flex flex-col items-center gap-8 sm:gap-10 animate-fade-in-up">
          <HeroHeader />

          <section
            className="w-full flex flex-col items-center gap-2"
            aria-label="Search"
          >
            <SearchBox />
          </section>

          <section
            className="w-full flex flex-col gap-6"
            aria-label="Recovery actions"
          >
            <ActionPanel />
            <SuggestedActions />
          </section>
        </AnimatedPage>
      </div>
    </main>
  );
}
