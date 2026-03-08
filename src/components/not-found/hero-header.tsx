/**
 * HeroHeader — Title and subtitle for 404 page.
 */

import { cn } from "@/lib/utils";

export interface HeroHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const DEFAULT_TITLE = "That page can't be found";
const DEFAULT_SUBTITLE =
  "We couldn't locate the page you're looking for. Try searching or returning to the Home dashboard.";

export function HeroHeader({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  className,
}: HeroHeaderProps) {
  return (
    <header className={cn("text-center space-y-4", className)}>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
        {title}
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>
    </header>
  );
}
