/**
 * Training & Meal Planner — Configure schedules, generate nutrition plans, grocery lists.
 * Connected to Health Dashboard. Full workflow: Plan Builder → Calendar → Nutrition → Grocery → Adjustments.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { startOfWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AnimatedPage } from "@/components/animated-page";
import { useTrainingMealPlanner } from "@/hooks/use-training-meal-planner";
import {
  PlanBuilder,
  WeeklyCalendar,
  NutritionSummary,
  GroceryListExport,
  AdjustmentsSuggestionsPanel,
} from "@/components/training-meals";

export default function HealthTrainingMealsPage() {
  const {
    plan,
    schedule,
    meals,
    workouts,
    groceryList,
    dailyTotals,
    weeklyTotals,
    suggestions,
    generatePlanAction,
    syncCalendar,
    requestGroceryAggregate,
    applyAdjustments,
    fetchSuggestions,
    updateSchedule,
    setGroceryChecked,
    rejectSuggestion,
    isGenerating,
    isSuggesting,
  } = useTrainingMealPlanner({ userId: "u1" });

  const weekStartDate = useMemo(
    () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    []
  );

  const targets = useMemo(() => {
    const c = plan?.constraints?.macroTargets;
    if (!c) return null;
    return {
      calories: c.calories ?? 2000,
      protein: c.protein ?? 120,
      carbs: c.carbs ?? 200,
      fat: c.fat ?? 65,
    };
  }, [plan?.constraints?.macroTargets]);

  const handleGenerate = useMemo(
    () => (goals: string[], durationWeeks: number, constraints: Parameters<typeof generatePlanAction>[2]) => {
      generatePlanAction(goals, durationWeeks, constraints);
    },
    [generatePlanAction]
  );

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/health" aria-label="Back to Health Dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Training & Meal Planner</h1>
          <p className="text-sm text-muted-foreground">
            Configure schedules, generate nutrition plans, and grocery lists
          </p>
        </div>
      </div>

      <section aria-labelledby="plan-builder-heading">
        <PlanBuilder
          onGenerate={handleGenerate}
          onAgentSuggest={fetchSuggestions}
          isGenerating={isGenerating}
          isSuggesting={isSuggesting}
        />
      </section>

      {plan && (
        <>
          <section aria-labelledby="weekly-calendar-heading">
            <h2 id="weekly-calendar-heading" className="sr-only">
              Weekly calendar
            </h2>
            <WeeklyCalendar
              schedule={schedule}
              meals={meals}
              workouts={workouts}
              weekStartDate={weekStartDate}
              onScheduleChange={updateSchedule}
              onSyncCalendar={syncCalendar}
            />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section aria-labelledby="nutrition-summary-heading">
              <h2 id="nutrition-summary-heading" className="sr-only">
                Nutrition summary
              </h2>
              <NutritionSummary
                dailyTotals={dailyTotals}
                weeklyTotals={weeklyTotals}
                targets={targets}
              />
            </section>
            <section aria-labelledby="grocery-list-heading">
              <h2 id="grocery-list-heading" className="sr-only">
                Grocery list
              </h2>
              <GroceryListExport
                items={groceryList}
                onToggleCheck={setGroceryChecked}
                onGenerate={requestGroceryAggregate}
              />
            </section>
          </div>

          <section aria-labelledby="adjustments-heading">
            <h2 id="adjustments-heading" className="sr-only">
              Adjustments and suggestions
            </h2>
            <AdjustmentsSuggestionsPanel
              suggestions={suggestions}
              onAccept={applyAdjustments}
              onReject={rejectSuggestion}
              onRequestSuggestions={fetchSuggestions}
              isSuggesting={isSuggesting}
            />
          </section>
        </>
      )}

      {!plan && (
        <Card className="card-health border-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Get started</CardTitle>
            <p className="text-sm text-muted-foreground">
              Use the Plan builder above to set your goals and constraints, then click
              “Auto-generate plan” to create your training and meal plan. After that you can
              view the weekly calendar, nutrition summary, grocery list, and agent suggestions.
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Calendar, nutrition, grocery list, and adjustments will appear here once a plan
              is generated.
            </p>
          </CardContent>
        </Card>
      )}
    </AnimatedPage>
  );
}
