/**
 * Habits Tracker — Create, track, and receive reminders; display streaks and coaching interventions.
 * Connected to Health Dashboard. Full HabitBoard with create/edit/check-in, history, and agent coaching.
 */

import { Link } from "react-router-dom";
import { AnimatedPage } from "@/components/animated-page";
import { HabitBoard } from "@/components/habits-tracker";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function HealthHabitsPage() {
  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/health" aria-label="Back to Health Dashboard">
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

      <HabitBoard />
    </AnimatedPage>
  );
}
