/**
 * ContactForm — Legal inquiries form with validation.
 * Name, Email, Topic, Message; client-side validation only (no API).
 */

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_TOPIC = 100;
const MAX_MESSAGE = 2000;

const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(MAX_NAME, `Name must be at most ${MAX_NAME} characters`),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(MAX_EMAIL, `Email must be at most ${MAX_EMAIL} characters`),
  topic: z
    .string()
    .min(1, "Please select a topic")
    .max(MAX_TOPIC, `Topic must be at most ${MAX_TOPIC} characters`),
  message: z
    .string()
    .min(1, "Message is required")
    .max(MAX_MESSAGE, `Message must be at most ${MAX_MESSAGE} characters`),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export interface ContactFormProps {
  className?: string;
  onSuccess?: () => void;
}

const TOPIC_OPTIONS = [
  { value: "terms-inquiry", label: "Terms of Service inquiry" },
  { value: "legal-request", label: "Legal request" },
  { value: "data-request", label: "Data or privacy request" },
  { value: "other", label: "Other" },
];

export function ContactForm({ className, onSuccess }: ContactFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      topic: "",
      message: "",
    },
  });

  const onSubmit = useCallback(
    async (data: ContactFormValues) => {
      try {
        // No API - simulate success for demo
        await new Promise((r) => setTimeout(r, 500));
        setIsSubmitted(true);
        reset();
        toast.success("Your message has been sent. We will respond within 5 business days.");
        onSuccess?.();
      } catch {
        toast.error("Something went wrong. Please try again or email us directly.");
      }
    },
    [reset, onSuccess]
  );

  if (isSubmitted) {
    return (
      <div
        className={cn(
          "rounded-lg border border-white/[0.03] bg-secondary/30 p-4 text-sm text-foreground",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <p className="font-medium">Thank you for your inquiry.</p>
        <p className="mt-1 text-muted-foreground">
          We have received your message and will respond within 5 business days.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-4", className)}
      noValidate
      aria-label="Legal inquiries contact form"
    >
      <div className="space-y-2">
        <Label htmlFor="tos-contact-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="tos-contact-name"
          {...register("name")}
          placeholder="Your name"
          maxLength={MAX_NAME}
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "tos-name-error" : undefined}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p
            id="tos-name-error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tos-contact-email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="tos-contact-email"
          type="email"
          {...register("email")}
          placeholder="your@email.com"
          maxLength={MAX_EMAIL}
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "tos-email-error" : undefined}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p
            id="tos-email-error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tos-contact-topic">
          Topic <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="topic"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                id="tos-contact-topic"
                aria-invalid={!!errors.topic}
                aria-describedby={errors.topic ? "tos-topic-error" : undefined}
                className={errors.topic ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {(TOPIC_OPTIONS ?? []).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.topic && (
          <p
            id="tos-topic-error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.topic.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tos-contact-message">
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="tos-contact-message"
          {...register("message")}
          placeholder="Describe your inquiry..."
          maxLength={MAX_MESSAGE}
          rows={4}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "tos-message-error" : undefined}
          className={cn("resize-y", errors.message ? "border-destructive" : "")}
        />
        {errors.message && (
          <p
            id="tos-message-error"
            className="text-xs text-destructive"
            role="alert"
          >
            {errors.message.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send inquiry"}
      </Button>
    </form>
  );
}
