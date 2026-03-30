'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Trash2, Plus } from 'lucide-react'

interface WorkoutSession {
  id: string
  type: 'cardio' | 'strength' | 'flexibility' | 'sports'
  name: string
  duration: number
  caloriesBurned: number
  date: string
}

export default function TrainingPage() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([
    {
      id: '1',
      type: 'cardio',
      name: '5K Run',
      duration: 30,
      caloriesBurned: 350,
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: '2',
      type: 'strength',
      name: 'Upper Body Workout',
      duration: 45,
      caloriesBurned: 280,
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    },
  ])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'cardio' as const,
    name: '',
    duration: 0,
    caloriesBurned: 0,
  })

  const addWorkout = () => {
    if (!formData.name || formData.duration === 0) {
      alert('Please fill in all fields')
      return
    }

    const newWorkout: WorkoutSession = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      date: new Date().toISOString().split('T')[0],
    }

    setWorkouts([newWorkout, ...workouts])
    setFormData({
      type: 'cardio',
      name: '',
      duration: 0,
      caloriesBurned: 0,
    })
    setShowForm(false)
  }

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(w => w.id !== id))
  }

  const totalCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0)
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0)

  if (!user) return null

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Training Log</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} /> New Workout
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Total Workouts</p>
          <p className="text-3xl font-bold text-foreground">{workouts.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Total Minutes</p>
          <p className="text-3xl font-bold text-foreground">{totalMinutes}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Total Calories Burned</p>
          <p className="text-3xl font-bold text-foreground">{totalCalories}</p>
        </div>
      </div>

      {/* Add Workout Form */}
      {showForm && (
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">Log a Workout</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="cardio">Cardio</option>
                  <option value="strength">Strength</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Workout Name</label>
                <input
                  type="text"
                  placeholder="e.g., 5K Run"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Calories Burned</label>
                <input
                  type="number"
                  value={formData.caloriesBurned}
                  onChange={e => setFormData({ ...formData, caloriesBurned: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={addWorkout}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
              >
                Add Workout
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout List */}
      <div className="space-y-4">
        {workouts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground text-lg">No workouts logged yet</p>
            <p className="text-muted-foreground text-sm">Start by logging your first workout!</p>
          </div>
        ) : (
          workouts.map(workout => (
            <div key={workout.id} className="bg-card rounded-lg border border-border p-6 flex justify-between items-center">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">{workout.name}</h3>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <span>Type: <strong className="text-foreground capitalize">{workout.type}</strong></span>
                  <span>Duration: <strong className="text-foreground">{workout.duration} min</strong></span>
                  <span>Calories: <strong className="text-foreground">{workout.caloriesBurned}</strong></span>
                  <span>Date: <strong className="text-foreground">{workout.date}</strong></span>
                </div>
              </div>
              <button
                onClick={() => deleteWorkout(workout.id)}
                className="p-2 text-destructive hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
