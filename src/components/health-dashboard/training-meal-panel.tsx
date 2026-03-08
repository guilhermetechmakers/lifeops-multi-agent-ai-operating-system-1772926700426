/**
 * TrainingMealPanel — Upcoming training sessions, meal plans, nutrition summary, grocery list.
 * Sync calendar, generate grocery list, adjust plan.
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, UtensilsCrossed, Calendar, ShoppingCart, ArrowRight } from "lucide-react";
import type { TrainingPlan, MealPlan } from "@/types/health";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface TrainingMealPanelProps {
  trainingPlans: TrainingPlan[];
  mealPlans: MealPlan[];
  onSyncCalendar?: () => void;
  onGenerateGroceryList?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function TrainingMealPanel({
  trainingPlans = [],
  mealPlans = [],
  onSyncCalendar,
  onGenerateGroceryList,
  isLoading,
  className,
}: TrainingMealPanelProps) {
  const training = Array.isArray(trainingPlans) ? trainingPlans : [];
  const meals = Array.isArray(mealPlans) ? mealPlans : [];

  const sessions = training.flatMap((p) => (p?.sessions ?? []).slice(0, 3));
  const nutrition = meals[0]?.nutritionSummary;
  const nextMeals = meals.flatMap((p) => (p?.meals ?? []).slice(0, 2));

  if (isLoading) {
    return (
      <Card className={cn("card-health border-white/[0.03]", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-40 animate-pulse rounded bg-secondary/50" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-secondary/30" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-health border-white/[0.03]", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Training & Meal Plans
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upcoming sessions, meals, nutrition
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard/health/training-meals">
            View plan
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Upcoming training</p>
            <ul className="space-y-1">
              {sessions.map((s, i) => (
                <li
                  key={`${s?.date ?? ""}-${s?.type ?? ""}-${i}`}
                  className="flex items-center gap-2 text-sm"
                >
                  <Dumbbell className="h-3 w-3 text-teal" />
                  {s?.type ?? ""} — {s?.durationMin ?? 0} min
                  {s?.date && (
                    <span className="text-muted-foreground">
                      ({format(new Date(s.date), "MMM d")})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {nextMeals.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Planned meals</p>
            <ul className="space-y-1">
              {nextMeals.map((m, i) => (
                <li key={`${m?.date ?? ""}-${i}`} className="flex items-center gap-2 text-sm">
                  <UtensilsCrossed className="h-3 w-3 text-amber" />
                  {(m?.items ?? []).slice(0, 2).join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        {nutrition && (
          <div className="rounded-md border border-white/[0.03] bg-secondary/20 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Nutrition summary</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span>{nutrition.calories ?? 0} cal</span>
              <span className="text-teal">P: {nutrition.protein ?? 0}g</span>
              <span className="text-amber">C: {nutrition.carbs ?? 0}g</span>
              <span className="text-purple">F: {nutrition.fats ?? 0}g</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {onSyncCalendar && (
            <Button variant="outline" size="sm" onClick={onSyncCalendar}>
              <Calendar className="mr-1 h-3 w-3" />
              Sync calendar
            </Button>
          )}
          {onGenerateGroceryList && (
            <Button variant="outline" size="sm" onClick={onGenerateGroceryList}>
              <ShoppingCart className="mr-1 h-3 w-3" />
              Grocery list
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/health/training-meals">
              Adjust plan
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
