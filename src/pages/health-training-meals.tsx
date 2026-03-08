/**
 * Training & Meal Planner — Configure schedules, generate nutrition plans, grocery lists.
 * Connected to Health Dashboard.
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrainingMealPanel } from "@/components/health-dashboard";
import { GroceryListPanel } from "@/components/health-dashboard";
import { useHealthDashboard } from "@/hooks/use-health-dashboard";
import { AnimatedPage } from "@/components/animated-page";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function HealthTrainingMealsPage() {
  const { trainingPlans, mealPlans, groceries } = useHealthDashboard();
  const safeTraining = Array.isArray(trainingPlans) ? trainingPlans : [];
  const safeMeals = Array.isArray(mealPlans) ? mealPlans : [];
  const safeGroceries = Array.isArray(groceries) ? groceries : [];

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/health">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <TrainingMealPanel
          trainingPlans={safeTraining}
          mealPlans={safeMeals}
          onSyncCalendar={() => toast.success("Calendar sync requested")}
          onGenerateGroceryList={() => toast.success("Grocery list generated")}
        />
        <GroceryListPanel
          groceries={safeGroceries}
          onExport={() => toast.success("Exported")}
        />
      </div>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle>Adjust plan</CardTitle>
          <p className="text-sm text-muted-foreground">
            Regenerate training or meal plans based on your goals. Agent will propose adjustments.
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm">
            Regenerate plan
          </Button>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
