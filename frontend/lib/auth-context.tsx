'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { User } from './types'

const API_BASE = 'http://localhost:5000/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function saveSession(token: string, user: User) {
  localStorage.setItem('access_token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
}

/**
 * Map the backend user.to_dict() shape → frontend User type.
 * The backend user object doesn't carry profile/objectives directly,
 * so we accept them as optional extras (set after signup).
 */
function mapBackendUser(backendUser: Record<string, unknown>, extras?: Record<string, unknown>): User {
  return {
    id:                  String(backendUser.id ?? ''),
    username:            String(backendUser.username ?? ''),
    email:               String(backendUser.email ?? ''),
    avatar:              undefined,
    // Profile fields — present after signup via extras, otherwise 0/defaults
    age:                 Number((extras?.profile as Record<string,unknown>)?.age   ?? backendUser.age    ?? 0),
    gender:              ((extras?.profile as Record<string,unknown>)?.gender ?? backendUser.gender ?? 'other') as User['gender'],
    height:              Number((extras?.profile as Record<string,unknown>)?.height ?? backendUser.height ?? 0),
    weight:              Number((extras?.profile as Record<string,unknown>)?.weight ?? backendUser.weight ?? 0),
    fitnessLevel:        'beginner', // derived from activity_level if needed
    objectives:          [],         // populated below
    dietaryRestrictions: (extras?.profile as Record<string,unknown>)?.allergies as string[] ?? [],
    medicalConditions:   (extras?.profile as Record<string,unknown>)?.health_conditions as string[] ?? [],
    createdAt:           String(backendUser.created_at ?? new Date().toISOString()),
    updatedAt:           String(backendUser.updated_at ?? new Date().toISOString()),
  }
}

// ── Context type ──────────────────────────────────────────────────────────────

interface AuthContextType {
  user:       User | null
  isLoading:  boolean
  isLoggedIn: boolean
  login:      (email: string, password: string) => Promise<void>
  logout:     () => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
    } catch {
      clearSession()
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.error ?? 'Login failed')

    const { access_token, user: backendUser } = data
    const mapped = mapBackendUser(backendUser)

    saveSession(access_token, mapped)
    setUser(mapped)
  }, [])

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  // ── Update local user (e.g. after profile edits) ──────────────────────────
  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...data, updatedAt: new Date().toISOString() }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isLoggedIn: !!user,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}