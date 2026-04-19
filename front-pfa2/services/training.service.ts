import { apiFetch } from "@/lib/api";

export type TrainingWorkoutType = "cardio" | "strength" | "flexibility" | "sports";
export type TrainingIntensity = "low" | "medium" | "high";

export type TrainingSession = {
  id: number;
  user_id: number;
  session_date: string;
  date: string;
  workout_type: TrainingWorkoutType;
  intensity: TrainingIntensity;
  duration_minutes: number;
  distance_km: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TrainingSessionPayload = {
  workout_type: TrainingWorkoutType;
  intensity: TrainingIntensity;
  duration_minutes: number;
  session_date: string;
  distance_km?: number;
  notes?: string;
};

export const trainingService = {
  getLogs: (date?: string) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    return apiFetch<{ logs: TrainingSession[] }>(`/api/training/logs${query}`);
  },

  createLog: (payload: TrainingSessionPayload) =>
    apiFetch<{ message: string; log: TrainingSession }>("/api/training/logs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteLog: (id: number) =>
    apiFetch<{ message: string }>(`/api/training/logs/${id}`, {
      method: "DELETE",
    }),
};