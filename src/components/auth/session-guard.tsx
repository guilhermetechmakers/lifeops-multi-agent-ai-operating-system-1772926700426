import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

interface SessionGuardProps {
  children: ReactNode;
}

/**
 * Full-page loading skeleton matching dashboard layout (sidebar + content).
 */
function SessionGuardSkeleton() {
  return (
    <div className="min-h-screen flex bg-background" role="status" aria-live="polite">
      <aside className="hidden md:flex w-56 flex-col gap-4 border-r border-white/[0.03] p-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          {(Array.from({ length: 6 }) ?? []).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </aside>
      <main className="flex-1 p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(Array.from({ length: 6 }) ?? []).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </main>
    </div>
  );
}

/**
 * Protects routes that require authentication. Redirects to /auth when not signed in.
 */
export function SessionGuard({ children }: SessionGuardProps) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return <SessionGuardSkeleton />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
