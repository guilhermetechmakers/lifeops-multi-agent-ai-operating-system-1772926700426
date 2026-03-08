/**
 * Habits Tracker — Create, track, and receive reminders; display streaks and coaching interventions.
 * Connected to Health Dashboard.
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HabitsPanel } from "@/components/health-dashboard";
import { useHealthDashboard } from "@/hooks/use-health-dashboard";
import { AnimatedPage } from "@/components/animated-page";
import { ArrowLeft } from "lucide-react";

export default function HealthHabitsPage() {
  const { habits, isLoading } = useHealthDashboard();
  const safeHabits = Array.isArray(habits) ? habits : [];

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/health">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Habits Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Create, track, and receive reminders; view streaks and coaching interventions
          </p>
        </div>
      </div>

      <HabitsPanel habits={safeHabits} isLoading={isLoading} />

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle>Add habit</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create a new habit with frequency and reminders. Agent coaching will surface based on your progress.
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm">
            Add habit
          </Button>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
