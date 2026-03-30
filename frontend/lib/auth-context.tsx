'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { User, Objective } from './types'

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    // Mock login - in a real app, this would call an API
    const mockUser: User = {
      id: '1',
      username: email.split('@')[0],
      email,
      avatar: undefined,
      age: 25,
      gender: 'male',
      height: 180,
      weight: 75,
      fitnessLevel: 'intermediate',
      objectives: [],
      dietaryRestrictions: [],
      medicalConditions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    setUser(mockUser)
    localStorage.setItem('user', JSON.stringify(mockUser))
  }, [])

  const signup = useCallback(async (email: string, password: string, username: string): Promise<User> => {
    // Mock signup - in a real app, this would call an API
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      avatar: undefined,
      age: 0,
      gender: 'other',
      height: 0,
      weight: 0,
      fitnessLevel: 'beginner',
      objectives: [],
      dietaryRestrictions: [],
      medicalConditions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    return newUser
  }, [])

  const completeProfile = useCallback(async (profileData: Partial<User>) => {
    // Use the current user from state or create from profileData
    const currentUser = user || (profileData as User)
    if (!currentUser) throw new Error('No user data to complete profile')
    
    const updatedUser = {
      ...currentUser,
      ...profileData,
      updatedAt: new Date().toISOString(),
    }
    
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [user])

  const logout = useCallback(async () => {
    setUser(null)
    localStorage.removeItem('user')
  }, [])

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in')
    
    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [user])

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
