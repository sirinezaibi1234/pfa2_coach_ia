'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SignupStep1 from '@/components/auth/signup-step1'
import SignupStep2 from '@/components/auth/signup-step2'
import SignupStep3 from '@/components/auth/signup-step3'
import SignupReview from '@/components/auth/signup-review'
import Link from 'next/link'

// ── Base URL: set NEXT_PUBLIC_API_URL in your .env.local ──────────────────────
const API_BASE = 'http://localhost:5000/api'

// ── Map frontend goal IDs → backend VALID_GOALS ───────────────────────────────
const GOAL_MAP: Record<string, string> = {
  'weight-loss': 'lose_weight',
  'muscle-gain': 'gain_muscle',
  'endurance':   'improve_endurance',
  'maintenance': 'maintain_weight',
}

// ── Map frontend fitnessLevel → backend activity_level ────────────────────────
const ACTIVITY_MAP: Record<string, string> = {
  beginner:     'sedentary',
  intermediate: 'moderately_active',
  advanced:     'very_active',
}

interface SignupFormData {
  // Step 1
  username: string
  email: string
  password: string
  confirmPassword: string
  // Step 2
  age: number
  gender: 'male' | 'female' | 'other'
  height: number
  weight: number
  // Step 3
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  objectives: string[]
  dietaryRestrictions: string[]
  medicalConditions: string
}

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: 0,
    gender: 'other',
    height: 0,
    weight: 0,
    fitnessLevel: 'beginner',
    objectives: [],
    dietaryRestrictions: [],
    medicalConditions: '',
  })

  const updateFormData = (data: Partial<SignupFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setError(null)
  }

  // ── Step validators ───────────────────────────────────────────────────────────
  const handleStep1Submit = () => {
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setError(null)
    setStep(2)
  }

  const handleStep2Submit = () => {
    if (!formData.age || !formData.height || !formData.weight) {
      setError('Please fill in all fields')
      return
    }
    setError(null)
    setStep(3)
  }

  const handleStep3Submit = () => {
    if (formData.objectives.length === 0) {
      setError('Please select at least one objective')
      return
    }
    setError(null)
    setStep(4)
  }

  // ── Final submission ──────────────────────────────────────────────────────────
  const handleCreateAccount = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // ── 1. Register user ──────────────────────────────────────────────────────
      const registerRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email:    formData.email,
          password: formData.password,
        }),
      })

      const registerData = await registerRes.json()
      if (!registerRes.ok) {
        setError(registerData.error ?? 'Registration failed. Please try again.')
        return
      }

      const { access_token, user } = registerData

      // ── 2. Save physical profile ──────────────────────────────────────────────
      // Build health_conditions from medicalConditions text
      const healthConditions = formData.medicalConditions
        ? formData.medicalConditions.split(',').map(s => s.trim()).filter(Boolean)
        : []

      // dietaryRestrictions → allergies field on backend
      const profileRes = await fetch(`${API_BASE}/profile/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          age:              formData.age,
          gender:           formData.gender,
          height:           formData.height,
          weight:           formData.weight,
          activity_level:   ACTIVITY_MAP[formData.fitnessLevel] ?? 'sedentary',
          allergies:        formData.dietaryRestrictions,
          health_conditions: healthConditions,
        }),
      })

      const profileData = await profileRes.json()
      if (!profileRes.ok) {
        setError(profileData.error ?? 'Failed to save profile. Please try again.')
        return
      }

      // ── 3. Save objectives ────────────────────────────────────────────────────
      const backendGoals = formData.objectives.map(id => GOAL_MAP[id]).filter(Boolean)

      const objectiveRes = await fetch(`${API_BASE}/profile/objective`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          goal: backendGoals,   // array — backend now accepts list or string
        }),
      })

      const objectiveData = await objectiveRes.json()
      if (!objectiveRes.ok) {
        setError(objectiveData.error ?? 'Failed to save objectives. Please try again.')
        return
      }

      // ── 4. Persist token + user locally ──────────────────────────────────────
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify({
        ...user,
        profile:   profileData.profile,
        objective: objectiveData.objective,
      }))

      // ── 5. Navigate to dashboard ──────────────────────────────────────────────
      router.push('/dashboard')

    } catch (err) {
      console.error('Signup error:', err)
      setError(
        'Could not reach the server. Make sure your backend is running on ' + API_BASE
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">FitCoach AI</h1>
          <p className="text-muted-foreground">Your personal health & fitness companion</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-border">
          {/* Step Indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map(num => (
              <div
                key={num}
                className={`flex-1 h-1 mx-1 rounded transition-colors ${
                  num <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step Content */}
          <div className="mb-6">
            {step === 1 && <SignupStep1 formData={formData} updateFormData={updateFormData} />}
            {step === 2 && <SignupStep2 formData={formData} updateFormData={updateFormData} />}
            {step === 3 && <SignupStep3 formData={formData} updateFormData={updateFormData} />}
            {step === 4 && <SignupReview formData={formData} />}
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            {step > 1 && (
              <button
                onClick={() => { setError(null); setStep(step - 1) }}
                className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-blue-50 transition"
                disabled={isLoading}
              >
                Back
              </button>
            )}
            {step < 4 && (
              <button
                onClick={() => {
                  if (step === 1) handleStep1Submit()
                  else if (step === 2) handleStep2Submit()
                  else if (step === 3) handleStep3Submit()
                }}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
                disabled={isLoading}
              >
                Continue
              </button>
            )}
            {step === 4 && (
              <button
                onClick={handleCreateAccount}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-60"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating Account…
                  </span>
                ) : 'Create Account'}
              </button>
            )}
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}