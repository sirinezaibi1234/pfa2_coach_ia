'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import SignupStep1 from '@/components/auth/signup-step1'
import SignupStep2 from '@/components/auth/signup-step2'
import SignupStep3 from '@/components/auth/signup-step3'
import SignupReview from '@/components/auth/signup-review'
import Link from 'next/link'

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
  const { signup, completeProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
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
  }

  const handleStep1Submit = () => {
    setError('')
    // Basic validation
    if (!formData.username || !formData.email || !formData.password) {
      alert('Please fill in all fields')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    setStep(2)
  }

  const handleStep2Submit = () => {
    setError('')
    if (!formData.age || !formData.height || !formData.weight) {
      alert('Please fill in all fields')
      return
    }
    setStep(3)
  }

  const handleStep3Submit = () => {
    setError('')
    if (formData.objectives.length === 0) {
      alert('Please select at least one objective')
      return
    }
    setStep(4)
  }

  const handleCreateAccount = async () => {
    setError('')
    try {
      setIsLoading(true)
      let profileSyncFailed = false

      // Step 1: Create account
      await signup(formData.email, formData.password, formData.username)

      // Step 2: Complete profile, but do not block account creation if this step fails
      try {
        await completeProfile({
          age: formData.age,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          fitnessLevel: formData.fitnessLevel,
          objectives: formData.objectives.map(obj => ({
            type: obj as any,
            startDate: new Date().toISOString(),
          })),
          dietaryRestrictions: formData.dietaryRestrictions,
          medicalConditions: formData.medicalConditions ? [formData.medicalConditions] : [],
        })
      } catch (profileError) {
        console.error('Profile completion error:', profileError)
        profileSyncFailed = true
      }

      // Redirect to dashboard
      router.push(profileSyncFailed ? '/dashboard?signup=success&profile=partial' : '/dashboard?signup=success')
    } catch (error) {
      console.error('Signup error:', error)
      const message = error instanceof Error ? error.message : 'Failed to create account. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo/Header */}
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
                className={`flex-1 h-1 mx-1 rounded ${
                  num <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {step === 1 && (
              <SignupStep1 formData={formData} updateFormData={updateFormData} />
            )}
            {step === 2 && (
              <SignupStep2 formData={formData} updateFormData={updateFormData} />
            )}
            {step === 3 && (
              <SignupStep3 formData={formData} updateFormData={updateFormData} />
            )}
            {step === 4 && (
              <SignupReview formData={formData} />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
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
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

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
