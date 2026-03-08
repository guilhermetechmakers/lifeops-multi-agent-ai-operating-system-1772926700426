/**
 * ContactSupportPanel — Support form and ticket status list.
 * Data: tickets array; guarded. Form uses react-hook-form + Zod.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "./section-title";
import { MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/types/about-help";
import { submitTicket } from "@/api/about-help";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Name too long"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().min(1, "Message is required").max(2000, "Message too long"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactSupportPanelProps {
  tickets?: Ticket[] | null;
  onTicketSubmitted?: () => void;
  className?: string;
}

function statusVariant(
  status: string
): "default" | "secondary" | "outline" | "success" | "warning" {
  const s = (status ?? "").toLowerCase();
  if (s === "resolved") return "success";
  if (s === "open" || s === "pending") return "warning";
  return "secondary";
}

export function ContactSupportPanel({
  tickets,
  onTicketSubmitted,
  className,
}: ContactSupportPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const list = Array.isArray(tickets) ? tickets : (tickets ?? []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      await submitTicket(values);
      toast.success("Support request submitted. We'll respond within 24 hours.");
      reset();
      onTicketSubmitted?.();
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      className={cn(
        "rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#111213] to-[#1A1A1B] shadow-card transition-all duration-200",
        className
      )}
    >
      <CardHeader className="pb-3">
        <SectionTitle>Contact support</SectionTitle>
        <p className="text-sm text-muted-foreground">
          Submit a ticket or check the status of existing requests.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-0 pt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="support-name">Name</Label>
              <Input
                id="support-name"
                placeholder="Your name"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
                aria-invalid={!!errors.name}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Email</Label>
              <Input
                id="support-email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
                aria-invalid={!!errors.email}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-subject">Subject</Label>
            <Input
              id="support-subject"
              placeholder="Brief subject"
              {...register("subject")}
              className={errors.subject ? "border-destructive" : ""}
              aria-invalid={!!errors.subject}
            />
            {errors.subject ? (
              <p className="text-xs text-destructive">{errors.subject.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-message">Message</Label>
            <Textarea
              id="support-message"
              placeholder="Describe your issue or question…"
              rows={4}
              {...register("message")}
              className={errors.message ? "border-destructive" : ""}
              aria-invalid={!!errors.message}
            />
            {errors.message ? (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
            {isSubmitting ? "Sending…" : "Submit ticket"}
          </Button>
        </form>

        {list.length > 0 ? (
          <div>
            <h3 className="mb-2 text-sm font-medium text-foreground">
              Recent tickets
            </h3>
            <ul className="space-y-2" role="list">
              {list.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.03] bg-card/50 px-3 py-2"
                >
                  <span className="text-sm text-foreground">
                    {t.subject ?? "No subject"}
                  </span>
                  <Badge variant={statusVariant(t.status ?? "")}>
                    {t.status ?? "—"}
                  </Badge>
                  {t.updatedAt ? (
                    <span className="w-full text-xs text-muted-foreground sm:w-auto">
                      Updated {new Date(t.updatedAt).toLocaleDateString()}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
