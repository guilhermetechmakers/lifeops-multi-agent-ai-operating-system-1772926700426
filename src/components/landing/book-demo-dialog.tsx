import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BookDemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookDemoDialog({ open, onOpenChange }: BookDemoDialogProps) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email?.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Demo request received. We'll be in touch within 24 hours.");
      setEmail("");
      setCompany("");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book a demo</DialogTitle>
          <DialogDescription>
            Schedule a personalized walkthrough of LifeOps. Our team will show
            you how to automate projects, content, finance, and health with
            safe, auditable AI agents.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="demo-email">Email</Label>
            <Input
              id="demo-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-company">Company (optional)</Label>
            <Input
              id="demo-company"
              type="text"
              placeholder="Your company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Request demo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
