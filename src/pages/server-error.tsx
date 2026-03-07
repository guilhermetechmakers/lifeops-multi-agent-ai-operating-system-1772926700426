/**
 * page_500_039 — Generic server error / catastrophic failure page.
 * User-friendly remediation steps and option to return home or retry.
 * Accepts correlationId via location state for traceability.
 */

import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/animated-page";
import { AlertTriangle, Home, RefreshCw, Search } from "lucide-react";

export default function ServerErrorPage() {
  const location = useLocation();
  const correlationId = (location.state as { correlationId?: string } | null)?.correlationId;

  return (
    <AnimatedPage className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-6 animate-fade-in-up">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/20 p-4" aria-hidden>
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          We encountered an unexpected error. Our team has been notified. Please try
          again in a few moments, or return home and try your action later.
        </p>
        <ul className="text-left text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>Check your internet connection</li>
          <li>Wait a moment and try again</li>
          <li>If the problem persists, contact support with the time and action you were taking</li>
        </ul>
        {correlationId && (
          <div className="rounded-md bg-secondary/50 px-3 py-2 text-left">
            <p className="text-micro text-muted-foreground">
              Reference ID: <span className="font-mono text-foreground/80">{correlationId}</span>
            </p>
            <p className="text-micro text-muted-foreground mt-1">
              Include this when contacting support for faster resolution.
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            aria-label="Retry"
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
          <Link to="/">
            <Button
              variant="default"
              className="bg-primary hover:bg-primary/90 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Return to home"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button
              variant="secondary"
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Go to dashboard"
            >
              <Search className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </AnimatedPage>
  );
}
