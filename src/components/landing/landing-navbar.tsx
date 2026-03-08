import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LandingNavbarProps {
  className?: string;
}

export function LandingNavbar({ className }: LandingNavbarProps) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <Link
        to="/"
        className="text-xl font-semibold text-foreground hover:text-foreground/90 transition-colors"
      >
        LifeOps
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/docs" data-tracking-id="nav-docs">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Docs
          </Button>
        </Link>
        <Link to="/auth" data-tracking-id="nav-signin">
          <Button variant="ghost" className="text-foreground">
            Sign in
          </Button>
        </Link>
        <Link to="/auth" data-tracking-id="nav-signup">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Create account
          </Button>
        </Link>
      </div>
    </nav>
  );
}
