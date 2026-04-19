'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { User, Objective } from './types'
import { apiFetch } from './api'
import { profileService } from '@/services/profile.service'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, username: string) => Promise<void>
  completeProfile: (profileData: Partial<User>) => Promise<void>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type BackendUser = {
  id: number
  username: string
  email: string
  created_at: string
}

type AuthResponse = {
  user: BackendUser
  access_token: string
}

const goalToObjectiveType: Record<string, Objective['type']> = {
  lose_weight: 'weight-loss',
  gain_muscle: 'muscle-gain',
  improve_endurance: 'endurance',
  maintain_weight: 'maintenance',
}

const objectiveTypeToGoal: Record<Objective['type'], string> = {
  'weight-loss': 'lose_weight',
  'muscle-gain': 'gain_muscle',
  endurance: 'improve_endurance',
  maintenance: 'maintain_weight',
}

function mapActivityToFitnessLevel(activityLevel?: string): User['fitnessLevel'] {
  if (activityLevel === 'very_active' || activityLevel === 'extra_active') return 'advanced'
  if (activityLevel === 'moderately_active') return 'intermediate'
  return 'beginner'
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadCurrentUser = useCallback(async () => {
    const [{ user: authUser }, profileRes, objectiveRes] = await Promise.all([
      apiFetch<{ user: BackendUser }>('/api/auth/me'),
      profileService.getProfile().catch(() => ({ profile: null })),
      profileService.getObjective().catch(() => ({ objective: null })),
    ])

    const profile = profileRes?.profile
    const objective = objectiveRes?.objective

    const mappedUser: User = {
      id: String(authUser.id),
      username: authUser.username,
      email: authUser.email,
      avatar: undefined,
      age: profile?.age ?? 0,
      gender: profile?.gender ?? 'other',
      height: profile?.height ?? 0,
      weight: profile?.weight ?? 0,
      fitnessLevel: mapActivityToFitnessLevel(profile?.activity_level),
      objectives: objective
        ? [
            {
              type: goalToObjectiveType[objective.goal] ?? 'maintenance',
              target: objective.target_weight ?? undefined,
              startDate: objective.start_date ?? undefined,
              deadline: objective.end_date ?? undefined,
            },
          ]
        : [],
      dietaryRestrictions: normalizeStringArray(profile?.allergies),
      medicalConditions: normalizeStringArray(profile?.health_conditions),
      createdAt: authUser.created_at,
      updatedAt: profile?.updated_at ?? authUser.created_at,
    }

    setUser(mappedUser)
    localStorage.setItem('user', JSON.stringify(mappedUser))
  }, [])

  // Initialize authenticated user from token
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          if (isMounted) {
            setUser(null)
            localStorage.removeItem('user')
          }
          return
        }

        await loadCurrentUser()
      } catch (error) {
        console.error('Failed to restore session:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (isMounted) setUser(null)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [loadCurrentUser])

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    localStorage.setItem('token', data.access_token)
    await loadCurrentUser()
  }, [loadCurrentUser])

  const signup = useCallback(async (email: string, password: string, username: string): Promise<void> => {
    const data = await apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    })

    localStorage.setItem('token', data.access_token)
    await loadCurrentUser()
  }, [loadCurrentUser])

  const completeProfile = useCallback(async (profileData: Partial<User>) => {
    await profileService.saveProfile({
      age: profileData.age,
      gender: profileData.gender,
      height: profileData.height,
      weight: profileData.weight,
      activity_level:
        profileData.fitnessLevel === 'advanced'
          ? 'very_active'
          : profileData.fitnessLevel === 'intermediate'
            ? 'moderately_active'
            : 'lightly_active',
      health_conditions: profileData.medicalConditions,
      allergies: profileData.dietaryRestrictions,
    })

    if (profileData.objectives && profileData.objectives.length > 0) {
      const firstObjective = profileData.objectives[0]
      const goal = objectiveTypeToGoal[firstObjective.type] ?? 'maintain_weight'

      try {
        await profileService.updateObjective({
          goal: goal as 'lose_weight' | 'gain_muscle' | 'maintain_weight' | 'improve_endurance',
          target_weight: firstObjective.target,
        })
      } catch {
        await profileService.createObjective({
          goal: goal as 'lose_weight' | 'gain_muscle' | 'maintain_weight' | 'improve_endurance',
          target_weight: firstObjective.target,
        })
      }
    }

    await loadCurrentUser()
  }, [loadCurrentUser])

  const logout = useCallback(async () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  const updateUser = useCallback(async (data: Partial<User>) => {
    await completeProfile(data)
  }, [completeProfile])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        signup,
        completeProfile,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
