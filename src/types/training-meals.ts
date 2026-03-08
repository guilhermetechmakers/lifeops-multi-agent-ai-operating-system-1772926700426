/**
 * Training & Meal Planner data models.
 * Aligns with Health Dashboard and plan generation schema.
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

export interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface MealPlanItem {
  id: string;
  name: string;
  calories: number;
  macros: { protein: number; carbs: number; fat: number };
  ingredients: MealIngredient[];
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
  date?: string;
  dayOfWeek?: number;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface PlanNutritionTotals {
  daily: NutritionTotals[];
  weekly: NutritionTotals[];
}

export interface PlanGroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  checked?: boolean;
}

export interface Plan {
  id: string;
  userId: string;
  goals: string[];
  durationWeeks: number;
  constraints: PlanConstraints;
  meals: MealPlanItem[];
  workouts: WorkoutPlanItem[];
  nutritionTotals: PlanNutritionTotals;
  schedule: ScheduleItem[];
  groceryList: PlanGroceryItem[];
}

export interface Adjustment {
  id: string;
  type: "swap_meal" | "swap_workout" | "adjust_portions" | "modify_rest";
  description: string;
  referenceId?: string;
  payload?: Record<string, unknown>;
}

export interface AgentSuggestion {
  id: string;
  adjustment: Adjustment;
  rationale: string;
  confidence: number;
}

export interface GeneratePlanPayload {
  userId: string;
  goals: string[];
  durationWeeks: number;
  constraints: PlanConstraints;
  activityLevel?: string;
}

export interface AdjustPlanPayload {
  planId: string;
  adjustments: Adjustment[];
}

export interface AgentSuggestPayload {
  planId: string;
  context?: Record<string, unknown>;
}
