import { apiFetch } from "@/lib/api";

export type ProfilePayload = {
  weight?: number;
  height?: number;
  age?: number;
  gender?: "male" | "female" | "other";
  activity_level?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active";
  health_conditions?: string[] | string;
  allergies?: string[] | string;
};

export type ObjectivePayload = {
  goal: "lose_weight" | "gain_muscle" | "maintain_weight" | "improve_endurance";
  target_weight?: number;
  duration_months?: number;
};

export const profileService = {
  getProfile: () => apiFetch<{ profile: any; message?: string }>("/api/profile/"),

  saveProfile: (payload: ProfilePayload) =>
    apiFetch<{ message: string; profile: any }>("/api/profile/", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  getObjective: () =>
    apiFetch<{ objective: any; message?: string }>("/api/profile/objective"),

  createObjective: (payload: ObjectivePayload) =>
    apiFetch<{ message: string; objective: any }>("/api/profile/objective", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateObjective: (payload: Partial<ObjectivePayload>) =>
    apiFetch<{ message: string; objective: any }>("/api/profile/objective", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  getObjectiveHistory: () =>
    apiFetch<{ objectives: any[] }>("/api/profile/objective/history"),
};
