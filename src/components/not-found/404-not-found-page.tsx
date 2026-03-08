import { Link } from "react-router-dom";
import {
  FolderKanban,
  Clock,
  FileText,
  Wallet,
  Heart,
  Home,
} from "lucide-react";
import { AnimatedPage } from "@/components/animated-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchBox } from "@/components/not-found/search-box";
import { QuickLinkCard } from "@/components/not-found/quick-link-card";
import { SuggestedActions } from "@/components/not-found/suggested-actions";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { label: "Projects", icon: FolderKanban, destinationPath: "/dashboard/projects" },
  { label: "Cronjobs", icon: Clock, destinationPath: "/dashboard/cronjobs" },
  { label: "Content", icon: FileText, destinationPath: "/dashboard/content" },
  { label: "Finance", icon: Wallet, destinationPath: "/dashboard/finance" },
  { label: "Health", icon: Heart, destinationPath: "/dashboard/health" },
];

export interface NotFoundPageProps {
  className?: string;
}

/**
 * 404 Not Found page: empathetic message, search, Home CTA, module quick links,
 * and suggested actions. Accessible and recovery-oriented.
 */
export function NotFoundPage({ className }: NotFoundPageProps) {
  const quickLinksList = Array.isArray(QUICK_LINKS) ? QUICK_LINKS : [];

  return (
    <AnimatedPage
      className={cn(
        "min-h-[60vh] w-full px-4 py-8 sm:py-12",
        "flex flex-col items-center gap-8 md:gap-10",
        "animate-fade-in-up",
        className
      )}
    >
      <main className="w-full max-w-2xl flex flex-col items-center gap-6 text-center">
        {/* HeroHeader */}
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            That page can&apos;t be found
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed max-w-lg mx-auto">
            We couldn&apos;t locate the page you&apos;re looking for. Try searching or
            returning to the Home dashboard.
          </p>
        </header>

        {/* SearchBox */}
        <SearchBox className="w-full justify-center" />

        {/* ActionPanel: Home CTA + module quick links */}
        <Card className="w-full border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/dashboard" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md">
                <Button
                  variant="default"
                  className="gap-2 min-w-[120px]"
                  aria-label="Go to Home dashboard"
                >
                  <Home className="h-4 w-4" aria-hidden />
                  Home
                </Button>
              </Link>
            </div>
            <div
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
              role="navigation"
              aria-label="Module quick links"
            >
              {(quickLinksList ?? []).map((item) => (
                <QuickLinkCard
                  key={item.destinationPath}
                  label={item.label}
                  icon={item.icon}
                  destinationPath={item.destinationPath ?? ""}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SuggestedActions */}
        <SuggestedActions className="w-full max-w-2xl" />
      </main>
    </AnimatedPage>
  );
}
