/**
 * Health Dashboard data models.
 * All types align with the Health Dashboard prompt schema.
 */

export interface Habit {
  id: string;
  userId: string;
  name: string;
  frequency: string;
  streak: number;
  nextReminder: string;
  coachInterventions?: string[];
}

export interface TrainingSession {
  date: string;
  type: string;
  durationMin: number;
}

export interface TrainingPlan {
  id: string;
  userId: string;
  goal: string;
  sessions: TrainingSession[];
  calendarSync: boolean;
}

export interface MealItem {
  date: string;
  items: string[];
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  goal: string;
  meals: MealItem[];
  nutritionSummary: NutritionSummary;
}

export interface RecoveryMetric {
  id: string;
  userId: string;
  score: number;
  timestamp: string;
}

export interface WorkloadRecommendationItem {
  id: string;
  changeDescription: string;
  impact: string;
  confidence: number;
}

export interface WorkloadRecommendation {
  id: string;
  userId: string;
  recommendations: WorkloadRecommendationItem[];
  createdAt: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  checked?: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  artifactRef?: string;
}

export interface HealthSnapshot {
  sleepHours?: number;
  recoveryScore?: number;
  weeklyTrainingLoad?: number;
  next7Days?: Array<{
    date: string;
    label?: string;
    value?: number;
    sleep?: number;
    recovery?: number;
    load?: number;
  }>;
}

export interface HealthIntervention {
  id: string;
  type: "coaching" | "alert" | "reminder";
  title: string;
  message?: string;
  habitId?: string;
  createdAt: string;
}

/** Alias for NotificationsTray compatibility */
export interface Intervention {
  id: string;
  type: "coaching" | "alert" | "reminder";
  message: string;
  habitId?: string;
  timestamp?: string;
  acknowledged?: boolean;
}
