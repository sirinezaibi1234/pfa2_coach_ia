'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      router.push('/')
    }
  }, [isLoggedIn, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">FitCoach AI</h1>
        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="px-6 py-2 text-primary hover:text-blue-700 font-medium transition"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-foreground mb-6 leading-tight">
            Your Personal AI Health & Fitness Coach
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get personalized workout plans, nutrition guidance, and real-time coaching from advanced AI technology. Achieve your fitness goals faster.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-semibold text-lg"
          >
            Start Your Journey Today
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Smart Goals</h3>
            <p className="text-muted-foreground">
              Set personalized fitness objectives and get AI-powered tracking to keep you on track.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Progress Analytics</h3>
            <p className="text-muted-foreground">
              Visualize your progress with detailed charts and insights. Understand what works best.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-foreground mb-2">AI Coaching</h3>
            <p className="text-muted-foreground">
              Chat with your AI coach for instant advice, motivation, and personalized recommendations.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">💪</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Workout Plans</h3>
            <p className="text-muted-foreground">
              Get custom workout routines tailored to your fitness level and available equipment.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">🍎</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nutrition Tracking</h3>
            <p className="text-muted-foreground">
              Log meals, track macros, and get personalized nutritional guidance aligned with your goals.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Always Available</h3>
            <p className="text-muted-foreground">
              Access your coach and data anytime, anywhere. Stay motivated on-the-go.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-4">Ready to Transform Your Health?</h3>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of users who have achieved their fitness goals with FitCoach AI.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition font-semibold text-lg"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border text-center text-muted-foreground text-sm">
        <p>© 2024 FitCoach AI. Your health journey starts here.</p>
      </footer>
    </div>
  )
}
