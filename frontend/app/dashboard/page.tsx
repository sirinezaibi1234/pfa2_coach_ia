'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { TrendingUp, Zap, Apple, MessageSquare } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Welcome back, {user.username}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Here&apos;s your fitness overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">Weight</p>
          <p className="text-3xl font-bold text-foreground">{user.weight} kg</p>
          <p className="text-xs text-muted-foreground mt-2">Current weight</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">Height</p>
          <p className="text-3xl font-bold text-foreground">{user.height} cm</p>
          <p className="text-xs text-muted-foreground mt-2">Recorded height</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">Fitness Level</p>
          <p className="text-3xl font-bold text-foreground capitalize">{user.fitnessLevel[0]}</p>
          <p className="text-xs text-muted-foreground mt-2 capitalize">{user.fitnessLevel}</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">Active Goals</p>
          <p className="text-3xl font-bold text-foreground">{user.objectives.length}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {user.objectives.length === 1 ? 'goal' : 'goals'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Link
          href="/dashboard/training"
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 border border-blue-200 hover:shadow-lg transition group"
        >
          <div className="text-4xl mb-4">🏋️</div>
          <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary">
            Start a Workout
          </h3>
          <p className="text-muted-foreground">
            Begin your training session and track your progress
          </p>
        </Link>

        <Link
          href="/dashboard/nutrition"
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 border border-green-200 hover:shadow-lg transition group"
        >
          <div className="text-4xl mb-4">🥗</div>
          <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary">
            Log Your Meals
          </h3>
          <p className="text-muted-foreground">
            Track your nutrition and monitor your macros
          </p>
        </Link>

        <Link
          href="/dashboard/progress"
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-8 border border-purple-200 hover:shadow-lg transition group"
        >
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary">
            View Progress
          </h3>
          <p className="text-muted-foreground">
            Check your progress charts and analytics
          </p>
        </Link>

        <Link
          href="/dashboard/coach"
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-8 border border-orange-200 hover:shadow-lg transition group"
        >
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary">
            Chat with Coach
          </h3>
          <p className="text-muted-foreground">
            Get personalized advice from your AI coach
          </p>
        </Link>
      </div>

      {/* Your Goals */}
      {user.objectives.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Fitness Goals</h2>
          <div className="space-y-2">
            {user.objectives.map((objective, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg capitalize"
              >
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-foreground">{objective.type.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
