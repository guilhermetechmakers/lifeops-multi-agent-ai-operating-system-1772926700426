/**
 * Training & Meal Planner data models.
 * Aligns with the Training & Meal Planner prompt schema.
 */

export interface PlanConstraints {
  dietary: string | null;
  allergies: string[];
  equipment: string[];
  macroTargets: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  } | null;
}

export interface MealPlanItem {
  id: string;
  name: string;
  calories: number;
  macros: { protein: number; carbs: number; fat: number };
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
}

export interface WorkoutPlanItem {
  id: string;
  name: string;
  durationMin: number;
  intensity: string;
  targetCalories?: number;
}

export interface ScheduleItem {
  id: string;
  type: "meal" | "workout";
  startTime: string;
  endTime?: string;
  referenceId: string;
  date: string;
  /** @deprecated use date instead */
  dayOfWeek?: number;
}

export interface PlanGroceryItem {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Plan {
  id: string;
  userId: string;
  goals: string[];
  durationWeeks: number;
  constraints: PlanConstraints;
  meals: MealPlanItem[];
  workouts: WorkoutPlanItem[];
  nutritionTotals: {
    daily: NutritionTotals[];
    weekly: NutritionTotals[];
  };
  schedule: ScheduleItem[];
  groceryList: PlanGroceryItem[];
}

export interface Adjustment {
  id: string;
  type: "swap_meal" | "swap_workout" | "adjust_portion" | "modify_rest";
  description: string;
  rationale?: string;
  targetId?: string;
  replacementId?: string;
  payload?: Record<string, unknown>;
}
