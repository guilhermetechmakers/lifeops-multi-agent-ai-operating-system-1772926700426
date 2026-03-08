/**
 * HabitEditor — Form for creating/editing habits.
 * Fields: name, category, color/icon, schedule (daily/weekly/custom), reminders, timezone.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Habit, HabitSchedule, HabitReminder } from "@/types/health";
import type { CreateHabitPayload } from "@/api/health";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().optional(),
  scheduleType: z.enum(["daily", "weekly", "custom"]),
  reminderTime: z.string().optional(),
  timezone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CATEGORIES = ["Wellness", "Productivity", "Fitness", "Mindfulness", "Other"];

export interface HabitEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  onSubmit: (payload: CreateHabitPayload) => void;
  isSubmitting?: boolean;
}

export function HabitEditor({
  open,
  onOpenChange,
  habit,
  onSubmit,
  isSubmitting = false,
}: HabitEditorProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      category: "",
      scheduleType: "daily",
      reminderTime: "09:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  useEffect(() => {
    if (open) {
      if (habit) {
        const schedule = habit?.schedule ?? { type: "daily" };
        const reminders = (habit?.reminders ?? []) as HabitReminder[];
        const firstReminder = reminders[0];
        reset({
          name: habit?.name ?? "",
          category: habit?.category ?? "",
          scheduleType: (schedule?.type as "daily" | "weekly" | "custom") ?? "daily",
          reminderTime: firstReminder?.time ?? "09:00",
          timezone: habit?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      } else {
        reset({
          name: "",
          category: "",
          scheduleType: "daily",
          reminderTime: "09:00",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      }
    }
  }, [open, habit, reset]);

  const onFormSubmit = (data: FormValues) => {
    const schedule: HabitSchedule = {
      type: data.scheduleType as "daily" | "weekly" | "custom",
    };
    const reminders: HabitReminder[] = data.reminderTime
      ? [{ time: data.reminderTime }]
      : [];
    const payload: CreateHabitPayload = {
      name: data.name,
      category: data.category || undefined,
      schedule,
      reminders,
      timezone: data.timezone || undefined,
    };
    onSubmit(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showClose>
        <DialogHeader>
          <DialogTitle>{habit ? "Edit habit" : "New habit"}</DialogTitle>
          <DialogDescription>
            Create or edit a habit with schedule and reminders. Agent coaching will surface based on your progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g. Morning meditation"
              className={cn(errors.name && "border-destructive")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watch("category") || "Wellness"}
              onValueChange={(v) => setValue("category", v)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {(CATEGORIES ?? []).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduleType">Schedule</Label>
            <Select
              value={watch("scheduleType")}
              onValueChange={(v) => setValue("scheduleType", v as "daily" | "weekly" | "custom")}
            >
              <SelectTrigger id="scheduleType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminderTime">Reminder time</Label>
            <Input
              id="reminderTime"
              type="time"
              {...register("reminderTime")}
              aria-label="Reminder time"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              {...register("timezone")}
              placeholder="Auto-detected"
              aria-label="Timezone"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : habit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
