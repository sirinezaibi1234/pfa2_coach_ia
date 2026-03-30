'use client'

import { useAuth } from '@/lib/auth-context'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function ProgressPage() {
  const { user } = useAuth()

  // Mock progress data
  const weightProgress = [
    { date: '1 week ago', weight: 78 },
    { date: '6 days ago', weight: 77.8 },
    { date: '5 days ago', weight: 77.5 },
    { date: '4 days ago', weight: 77.3 },
    { date: '3 days ago', weight: 77.1 },
    { date: '2 days ago', weight: 76.9 },
    { date: 'Today', weight: 75 },
  ]

  const workoutStats = [
    { day: 'Mon', workouts: 1, calories: 350 },
    { day: 'Tue', workouts: 1, calories: 420 },
    { day: 'Wed', workouts: 0, calories: 0 },
    { day: 'Thu', workouts: 2, calories: 650 },
    { day: 'Fri', workouts: 1, calories: 380 },
    { day: 'Sat', workouts: 1, calories: 500 },
    { day: 'Sun', workouts: 0, calories: 0 },
  ]

  const macroBreakdown = [
    { name: 'Protein', value: 35, fill: '#3b82f6' },
    { name: 'Carbs', value: 45, fill: '#10b981' },
    { name: 'Fat', value: 20, fill: '#f59e0b' },
  ]

  if (!user) return null

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Progress & Analytics</h1>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Starting Weight</p>
          <p className="text-3xl font-bold text-foreground">78 kg</p>
          <p className="text-xs text-muted-foreground mt-2">from 1 week ago</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Current Weight</p>
          <p className="text-3xl font-bold text-foreground">75 kg</p>
          <p className="text-xs text-green-600 mt-2">↓ 3 kg (-3.8%)</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Total Workouts</p>
          <p className="text-3xl font-bold text-foreground">6</p>
          <p className="text-xs text-muted-foreground mt-2">this week</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Calories Burned</p>
          <p className="text-3xl font-bold text-foreground">2,700</p>
          <p className="text-xs text-muted-foreground mt-2">this week</p>
        </div>
      </div>

      {/* Weight Progress Chart */}
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Weight Progress</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weightProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" domain={[74, 79]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: `1px solid var(--color-border)`,
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'var(--color-foreground)' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-primary)', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Workout Stats */}
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Weekly Workout Stats</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workoutStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: `1px solid var(--color-border)`,
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'var(--color-foreground)' }}
            />
            <Legend />
            <Bar dataKey="workouts" fill="var(--color-secondary)" name="Workouts" radius={[8, 8, 0, 0]} />
            <Bar dataKey="calories" fill="var(--color-accent)" name="Calories" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Goals Progress */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Your Goals Progress</h2>
        {user.objectives.length === 0 ? (
          <p className="text-muted-foreground">
            No active goals. Set some goals to track your progress!
          </p>
        ) : (
          <div className="space-y-4">
            {user.objectives.map((obj, idx) => (
              <div key={idx} className="border-b border-border pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground capitalize">{obj.type.replace('-', ' ')}</h3>
                  <span className="text-sm text-muted-foreground">
                    Started: {obj.startDate ? new Date(obj.startDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                    style={{ width: `${60 + idx * 10}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{60 + idx * 10}% progress</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
