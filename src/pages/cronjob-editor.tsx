import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedPage } from "@/components/animated-page";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  schedule: z.string().min(1, "Schedule is required"),
  timezone: z.string().default("UTC"),
});

type FormData = z.infer<typeof schema>;

export default function CronjobEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      schedule: "0 9 * * 1-5",
      timezone: "UTC",
    },
  });

  const onSubmit = async (_data: FormData) => {
    try {
      await new Promise((r) => setTimeout(r, 500));
      toast.success(isNew ? "Cronjob created" : "Cronjob updated");
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={isNew ? "/dashboard/cronjobs" : `/dashboard/cronjobs/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">
          {isNew ? "New cronjob" : "Edit cronjob"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader>
            <CardTitle>General</CardTitle>
            <p className="text-sm text-muted-foreground">Name and schedule</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. PR triage"
                {...register("name")}
                className="bg-input border-white/[0.03]"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule">Cron expression</Label>
              <Input
                id="schedule"
                placeholder="0 9 * * 1-5"
                {...register("schedule")}
                className="bg-input border-white/[0.03] font-mono"
              />
              {errors.schedule && (
                <p className="text-xs text-destructive">{errors.schedule.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                {...register("timezone")}
                className="bg-input border-white/[0.03]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to={isNew ? "/dashboard/cronjobs" : `/dashboard/cronjobs/${id}`}>
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isNew ? "Create" : "Save"}
          </Button>
        </div>
      </form>
    </AnimatedPage>
  );
}
