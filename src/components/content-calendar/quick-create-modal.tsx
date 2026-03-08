/**
 * QuickCreateModal — rapid create flow for content items.
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
import type { ContentItemType } from "@/types/content-calendar";
import type { Channel } from "@/types/content-calendar";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum([
    "ideation",
    "research",
    "draft",
    "edit",
    "schedule",
    "publish",
  ] as const),
  channelId: z.string().min(1, "Channel is required"),
  tentativePublishAt: z.string().min(1, "Publish date is required"),
  durationMinutes: z.coerce.number().min(1, "Duration must be at least 1"),
});

type FormValues = z.infer<typeof schema>;

export interface QuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels: Channel[];
  defaultPublishAt?: string;
  onCreate: (payload: {
    title: string;
    type: ContentItemType;
    channelId: string;
    publishAt: string;
    durationMinutes: number;
  }) => void;
}

export function QuickCreateModal({
  open,
  onOpenChange,
  channels,
  defaultPublishAt,
  onCreate,
}: QuickCreateModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      type: "draft",
      channelId: "",
      tentativePublishAt:
        defaultPublishAt ??
        new Date().toISOString().slice(0, 16),
      durationMinutes: 60,
    },
  });

  useEffect(() => {
    if (open) {
      const iso = defaultPublishAt ?? new Date().toISOString();
      const local = iso.length >= 16 ? iso.slice(0, 16) : iso.slice(0, 10) + "T10:00";
      const firstChannelId = (channels ?? [])[0]?.id ?? "";
      reset({
        title: "",
        type: "draft",
        channelId: firstChannelId,
        tentativePublishAt: local,
        durationMinutes: 60,
      });
    }
  }, [open, defaultPublishAt, channels, reset]);

  const channelId = watch("channelId");

  const onSubmit = (data: FormValues) => {
    const publishAt =
      data.tentativePublishAt.length === 16
        ? `${data.tentativePublishAt}:00Z`
        : data.tentativePublishAt;
    onCreate({
      title: data.title,
      type: data.type as ContentItemType,
      channelId: data.channelId,
      publishAt,
      durationMinutes: data.durationMinutes,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="quick-create-description"
      >
        <DialogHeader>
          <DialogTitle>Quick Create</DialogTitle>
          <DialogDescription id="quick-create-description">
            Add a content item with minimal metadata. It will appear in the
            calendar at the chosen slot.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Content title"
              {...register("title")}
              className={cn(errors.title && "border-destructive")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={watch("type")}
              onValueChange={(v) => setValue("type", v as FormValues["type"])}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {(["ideation", "research", "draft", "edit", "schedule", "publish"] as const).map(
                  (t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="channelId">Channel</Label>
            <Select
              onValueChange={(v) => setValue("channelId", v)}
              value={channelId}
            >
              <SelectTrigger id="channelId">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                {(channels ?? []).map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    {ch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.channelId && (
              <p className="text-xs text-destructive">{errors.channelId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tentativePublishAt">Publish at</Label>
            <Input
              id="tentativePublishAt"
              type="datetime-local"
              {...register("tentativePublishAt")}
              className={cn(errors.tentativePublishAt && "border-destructive")}
            />
            {errors.tentativePublishAt && (
              <p className="text-xs text-destructive">
                {errors.tentativePublishAt.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              id="durationMinutes"
              type="number"
              min={1}
              {...register("durationMinutes")}
              className={cn(errors.durationMinutes && "border-destructive")}
            />
            {errors.durationMinutes && (
              <p className="text-xs text-destructive">
                {errors.durationMinutes.message}
              </p>
            )}
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
              {isSubmitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
