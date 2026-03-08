/**
 * CreateCategorizationRuleModal — Create/Edit categorization rule.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  pattern: z.string().min(1, "Pattern is required"),
  categoryId: z.string().min(1, "Category is required"),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = [
  { id: "cat-saas", name: "SaaS" },
  { id: "cat-income", name: "Income" },
  { id: "cat-other", name: "Other" },
];

interface CreateCategorizationRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  className?: string;
}

export function CreateCategorizationRuleModal({
  open,
  onOpenChange,
  onSuccess,
  className,
}: CreateCategorizationRuleModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", pattern: "", categoryId: "" },
  });

  const categoryId = watch("categoryId");

  const onSubmit = async (_formData: FormData) => {
    try {
      // TODO: call API when backend is ready
      await new Promise((r) => setTimeout(r, 300));
      toast.success("Categorization rule created");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to create rule");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle>Create Categorization Rule</DialogTitle>
          <DialogDescription>
            Rules automatically categorize transactions matching the pattern.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule name</Label>
            <Input
              id="name"
              placeholder="e.g. Netflix subscription"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pattern">Pattern (merchant name contains)</Label>
            <Input
              id="pattern"
              placeholder="e.g. Netflix"
              {...register("pattern")}
              className={errors.pattern ? "border-destructive" : ""}
            />
            {errors.pattern && (
              <p className="text-xs text-destructive">{errors.pattern.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => setValue("categoryId", v)}
            >
              <SelectTrigger className={errors.categoryId ? "border-destructive" : ""}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId.message}</p>
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
              {isSubmitting ? "Creating…" : "Create rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
