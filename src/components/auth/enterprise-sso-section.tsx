import * as React from "react";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { initiateSSO } from "@/api/auth";
import { cn } from "@/lib/utils";

export interface EnterpriseSSOSectionProps {
  onInitiate?: (domain?: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function EnterpriseSSOSection({
  onInitiate,
  onError,
  className,
}: EnterpriseSSOSectionProps) {
  const [open, setOpen] = React.useState(false);
  const [domain, setDomain] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const { url } = await initiateSSO(domain.trim() || undefined);
        onInitiate?.(domain.trim() || undefined);
        if (url) {
          window.location.href = url;
          setOpen(false);
          return;
        }
        onError?.(new Error("SSO redirect unavailable"));
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [domain, onInitiate, onError]
  );

  return (
    <div className={cn("space-y-2", className)}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full border-white/[0.03] bg-secondary/50 hover:bg-secondary justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            aria-label="Sign in with Enterprise SSO"
          >
            <Building2 className="h-4 w-4" />
            Enterprise SSO
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-white/[0.03] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enterprise SSO</DialogTitle>
            <DialogDescription>
              Enter your work email domain to sign in with your organization’s identity provider.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="sso-domain">Email domain (optional)</Label>
              <Input
                id="sso-domain"
                type="text"
                placeholder="company.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-input border-white/[0.03]"
                autoComplete="organization"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Continue with SSO"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
