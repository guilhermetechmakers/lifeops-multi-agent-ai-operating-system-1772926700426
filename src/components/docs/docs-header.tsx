import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DocsHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchFocus?: () => void;
  className?: string;
}

export function DocsHeader({
  searchValue = "",
  onSearchChange,
  onSearchFocus,
  className,
}: DocsHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-white/[0.03] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4",
        className
      )}
      role="banner"
    >
      <Link
        to="/docs"
        className="text-lg font-semibold text-foreground hover:text-foreground/90 transition-colors shrink-0"
      >
        LifeOps
      </Link>
      <div className="flex-1 flex items-center justify-center max-w-md mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            placeholder="Search docs..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onFocus={onSearchFocus}
            className="pl-9 bg-muted/50 border-white/[0.03]"
            aria-label="Search documentation"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link to="/auth">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Button>
        </Link>
        <Link to="/auth">
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Create account
          </Button>
        </Link>
      </div>
    </header>
  );
}
