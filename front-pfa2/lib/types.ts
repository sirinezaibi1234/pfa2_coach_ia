export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  
  // Personal Information
  age: number
  gender: 'male' | 'female' | 'other'
  height: number // in cm
  weight: number // in kg
  
  // Fitness & Health
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  objectives: Objective[]
  dietaryRestrictions: string[]
  medicalConditions: string[]
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  user_id: string
  weight: number
  height: number
  age: number
  gender: 'male' | 'female' | 'other'
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  health_conditions: string[]
  allergies: string[]
  created_at: string
  updated_at: string
}

export interface Objective {
  type: 'weight-loss' | 'muscle-gain' | 'endurance' | 'maintenance'
  target?: number
  startDate?: string
  deadline?: string
}

export interface WorkoutSession {
  id: string
  userId: string
  type: 'cardio' | 'strength' | 'flexibility' | 'sports'
  name: string
  duration: number // minutes
  caloriesBurned: number
  notes?: string
  date: string
}

export interface NutritionEntry {
  id: string
  userId: string
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foodItems: FoodItem[]
  totalCalories: number
  macros: {
    protein: number
    carbs: number
    fat: number
  }
  date: string
}

export interface FoodItem {
  name: string
  quantity: number
  unit: string
  calories: number
}

export interface ChatMessage {
  id: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
