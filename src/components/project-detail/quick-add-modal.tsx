/**
 * QuickAddModal — backlog and ticket quick-add with validation.
 */

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectsApi } from "@/api/projects";
import * as mock from "@/api/projects-mock";

const USE_MOCK = !import.meta.env.VITE_API_URL || import.meta.env.VITE_USE_MOCK_PROJECTS === "true";

const backlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
});

const ticketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

type BacklogForm = z.infer<typeof backlogSchema>;
type TicketForm = z.infer<typeof ticketSchema>;

export interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  type: "backlog" | "ticket";
}

export function QuickAddModal({ open, onOpenChange, projectId, type }: QuickAddModalProps) {
  const isBacklog = type === "backlog";
  const schema = isBacklog ? backlogSchema : ticketSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      priority: isBacklog ? "Medium" : "medium",
    },
  });

  const qc = useQueryClient();

  const onSubmit = useCallback(
    async (data: BacklogForm | TicketForm) => {
      try {
        if (isBacklog) {
          const payload = data as BacklogForm;
          if (USE_MOCK) {
            await mock.mockCreateBacklogItem(projectId, {
              title: payload.title,
              description: payload.description,
              priority: payload.priority,
            });
          } else {
            await projectsApi.createBacklogItem(projectId, {
              title: payload.title,
              description: payload.description,
              priority: payload.priority,
            });
          }
          qc.invalidateQueries({ queryKey: ["projects", "backlog", projectId] });
          toast.success("Backlog item added");
        } else {
          const payload = data as TicketForm;
          if (USE_MOCK) {
            await mock.mockCreateTicket(projectId, {
              title: payload.title,
              description: payload.description,
              priority: payload.priority,
            });
          } else {
            await projectsApi.createTicket(projectId, {
              title: payload.title,
              description: payload.description,
              priority: payload.priority,
            });
          }
          qc.invalidateQueries({ queryKey: ["projects", "tickets", projectId] });
          toast.success("Ticket added");
        }
        form.reset();
        onOpenChange(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add");
      }
    },
    [projectId, isBacklog, form, onOpenChange, qc]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/[0.03] bg-[#151718]">
        <DialogHeader>
          <DialogTitle>{isBacklog ? "Add backlog item" : "Add ticket"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit as (d: unknown) => void)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter title"
              className="mt-1 border-white/[0.03]"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              {...form.register("description")}
              placeholder="Brief description"
              className="mt-1 border-white/[0.03]"
            />
          </div>
          <div>
            <Label>Priority</Label>
            <Select
              value={String(form.watch("priority") ?? (isBacklog ? "Medium" : "medium"))}
              onValueChange={(v) => {
                const val: string = v ?? (isBacklog ? "Medium" : "medium");
                form.setValue("priority", val);
              }}
            >
              <SelectTrigger className="mt-1 border-white/[0.03]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {isBacklog ? (
                  <>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
