'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertCircle, Download, RefreshCw,
  Calendar, CheckCircle, Dumbbell,
  TrendingUp, Sliders, X,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Exercise {
  name?: string
  sets?: number
  reps?: number
  duration?: string
  [key: string]: unknown
}

interface DaySchedule {
  type: 'workout' | 'rest'
  workout?: string
  exercises?: Exercise[]
}

interface Summary {
  days_per_week: number
  rest_days: number
  expected_monthly_change: number
  metric: string
  difficulty_level: string
}

interface ProgrammeData {
  goal: string
  difficulty: string
  workout_types: string[]
  excluded_workout_types: string[]
  available_days: string[]
  weekly_schedule: Record<string, DaySchedule>
  summary: Summary
}

interface Programme {
  id: number
  status: 'pending_confirmation' | 'active' | 'confirmed' | 'archived'
  goal: string
  difficulty: string
  programme_data: ProgrammeData
  created_at: string
  confirmed_at: string | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DAY_ORDER      = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT      = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ALL_WORKOUT_TYPES = ['Cardio', 'HIIT', 'Strength', 'Yoga']
const DIFFICULTIES   = ['Beginner', 'Intermediate', 'Advanced']

function intensityColor(difficulty: string) {
  if (difficulty === 'Advanced')     return 'bg-destructive/20 text-destructive'
  if (difficulty === 'Intermediate') return 'bg-primary/20 text-primary'
  return 'bg-secondary/20 text-secondary-foreground'
}

function goalLabel(goal: string) {
  return goal.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TrainingProgramPage() {
  const { user } = useAuth()

  const [programme, setProgramme]   = useState<Programme | null>(null)
  const [loading, setLoading]       = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [adjusting, setAdjusting]   = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [showAdjust, setShowAdjust] = useState(false)

  // ── Adjust state ───────────────────────────────────────────────────────────
  const [adjDifficulty, setAdjDifficulty]           = useState('Beginner')
  const [adjAvailableDays, setAdjAvailableDays]     = useState<string[]>([])
  const [adjExcludedTypes, setAdjExcludedTypes]     = useState<string[]>([])

  // ── Fetch existing programme on mount ─────────────────────────────────────
  const fetchProgramme = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<{ programme: Programme }>('/programme/me')
      setProgramme(data.programme)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (!msg.includes('404') && !msg.includes('No active programme')) {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProgramme() }, [fetchProgramme])

  // Sync adjust panel state when programme loads
  useEffect(() => {
    if (!programme) return
    const pd = programme.programme_data
    setAdjDifficulty(programme.difficulty)
    setAdjAvailableDays(pd.available_days ?? DAY_ORDER.slice(0, 4))
    setAdjExcludedTypes(pd.excluded_workout_types ?? [])
  }, [programme])

  // ── Generate ──────────────────────────────────────────────────────────────
  const generateProgramme = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post<{ programme: Programme }>('/programme/generate')
      setProgramme(data.programme)
      setShowAdjust(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate programme')
    } finally {
      setLoading(false)
    }
  }

  // ── Confirm ───────────────────────────────────────────────────────────────
  const confirmProgramme = async () => {
    setConfirming(true)
    setError(null)
    try {
      const data = await api.post<{ programme: Programme }>('/programme/confirm')
      setProgramme(data.programme)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to confirm programme')
    } finally {
      setConfirming(false)
    }
  }

  // ── Adjust ────────────────────────────────────────────────────────────────
  const adjustProgramme = async () => {
    if (adjAvailableDays.length === 0) {
      setError('Please select at least one training day.')
      return
    }
    setAdjusting(true)
    setError(null)
    try {
      const data = await api.patch<{ programme: Programme }>('/programme/adjust', {
        difficulty_override:    adjDifficulty,
        available_days:         adjAvailableDays,
        excluded_workout_types: adjExcludedTypes,
      })
      setProgramme(data.programme)
      setShowAdjust(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to adjust programme')
    } finally {
      setAdjusting(false)
    }
  }

  // ── Toggle helpers ─────────────────────────────────────────────────────────
  const toggleDay = (day: string) => {
    setAdjAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const toggleWorkoutType = (type: string) => {
    setAdjExcludedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  // ── CSV download ──────────────────────────────────────────────────────────
  const downloadCSV = () => {
    if (!programme) return
    const sched = programme.programme_data.weekly_schedule
    let csv = `Programme: ${goalLabel(programme.goal)}\nDifficulty: ${programme.difficulty}\n\n`
    csv += 'Day,Type,Exercise,Sets,Reps\n'
    DAY_ORDER.forEach(day => {
      const d = sched[day]
      if (!d) return
      if (d.type === 'rest') {
        csv += `${day},Rest,,,\n`
      } else {
        d.exercises?.forEach(ex => {
          csv += `${day},${d.workout},${ex.name ?? ''},${ex.sets ?? ''},${ex.reps ?? ''}\n`
        })
      }
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = 'training-programme.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const pd        = programme?.programme_data
  const isPending = programme?.status === 'pending_confirmation'
  const isActive  = programme?.status === 'active' || programme?.status === 'confirmed'

  if (!user) return null

  return (
    <div className="flex-1 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Training Program</h1>
          <p className="text-muted-foreground">
            Personalized workout plans generated by our AI based on your fitness profile
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button className="ml-auto" onClick={() => setError(null)}><X size={16} /></button>
          </div>
        )}

        {/* No programme yet */}
        {!programme && !loading && (
          <Card className="p-10 text-center">
            <Dumbbell className="mx-auto mb-4 text-primary" size={52} />
            <h2 className="text-xl font-semibold mb-2">No Program Generated Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Click below to generate a personalized training program based on your
              fitness level and objectives.
            </p>
            <Button onClick={generateProgramme} disabled={loading} size="lg" className="bg-primary hover:bg-primary/90">
              {loading
                ? <><RefreshCw className="mr-2 animate-spin" size={20} />Generating…</>
                : <><RefreshCw className="mr-2" size={20} />Generate Program</>}
            </Button>
          </Card>
        )}

        {/* Loading skeleton */}
        {loading && !programme && (
          <div className="space-y-4 mt-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
          </div>
        )}

        {/* Programme */}
        {programme && pd && (
          <div className="space-y-6">

            {/* Summary card */}
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-foreground">{goalLabel(programme.goal)}</h2>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${intensityColor(programme.difficulty)}`}>
                      {programme.difficulty}
                    </span>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-medium border ${
                      isPending
                        ? 'border-yellow-400 text-yellow-600 bg-yellow-50'
                        : 'border-green-400 text-green-600 bg-green-50'
                    }`}>
                      {isPending ? 'Pending confirmation' : 'Active'}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <Calendar size={14} />
                    Generated {new Date(programme.created_at).toLocaleDateString()}
                    {programme.confirmed_at && <> · Confirmed {new Date(programme.confirmed_at).toLocaleDateString()}</>}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {isPending && (
                    <>
                      <Button onClick={confirmProgramme} disabled={confirming}>
                        <CheckCircle className="mr-2" size={16} />
                        {confirming ? 'Confirming…' : 'Confirm'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAdjust(v => !v)}>
                        <Sliders className="mr-2" size={16} />
                        {showAdjust ? 'Close' : 'Adjust'}
                      </Button>
                    </>
                  )}
                  {isActive && (
                    <Button variant="outline" onClick={generateProgramme} disabled={loading}>
                      <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
                      Regenerate
                    </Button>
                  )}
                  <Button variant="outline" onClick={downloadCSV}>
                    <Download className="mr-2" size={16} />
                    Download CSV
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 max-w-xs">
                {[
                  { label: 'Workout days', value: pd.summary.days_per_week },
                  { label: 'Rest days',    value: pd.summary.rest_days },
                ].map(s => (
                  <div key={s.label} className="bg-background rounded-lg p-3 text-center border border-border">
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Adjust Panel ────────────────────────────────────────────── */}
            {showAdjust && isPending && (
              <Card className="p-6 border-primary/30 space-y-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sliders size={18} /> Customize Your Program
                </h3>

                {/* 1. Difficulty */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Difficulty level</p>
                  <div className="flex gap-2 flex-wrap">
                    {DIFFICULTIES.map(d => (
                      <button
                        key={d}
                        onClick={() => setAdjDifficulty(d)}
                        className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                          adjDifficulty === d
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Available days */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Training days
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      ({adjAvailableDays.length} selected)
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Choose the days you&apos;re available to train. Rest days are set automatically.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {DAY_ORDER.map((day, i) => {
                      const selected = adjAvailableDays.includes(day)
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`w-12 h-12 rounded-xl text-xs font-medium border transition-all flex flex-col items-center justify-center gap-0.5 ${
                            selected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border text-muted-foreground hover:border-primary hover:text-foreground bg-background'
                          }`}
                        >
                          <span>{DAY_SHORT[i]}</span>
                          {selected && (
                            <span className="text-[9px] opacity-80">✓</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {adjAvailableDays.length === 0 && (
                    <p className="text-xs text-destructive mt-2">Select at least one day.</p>
                  )}
                </div>

                {/* 3. Exclude workout types */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Workout preferences
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Deselect any workout type you want to avoid. We&apos;ll replace it with an alternative.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {ALL_WORKOUT_TYPES.map(type => {
                      const excluded = adjExcludedTypes.includes(type)
                      return (
                        <button
                          key={type}
                          onClick={() => toggleWorkoutType(type)}
                          className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                            excluded
                              ? 'bg-destructive/10 text-destructive border-destructive/40 line-through'
                              : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                          }`}
                        >
                          {type}
                        </button>
                      )
                    })}
                  </div>
                  {adjExcludedTypes.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Excluded: {adjExcludedTypes.join(', ')}. We&apos;ll swap these with alternatives.
                    </p>
                  )}
                </div>

                {/* Apply button */}
                <div className="flex gap-3 pt-2 border-t border-border">
                  <Button
                    onClick={adjustProgramme}
                    disabled={adjusting || adjAvailableDays.length === 0}
                  >
                    {adjusting ? (
                      <><RefreshCw className="mr-2 animate-spin" size={16} />Applying…</>
                    ) : (
                      <><CheckCircle className="mr-2" size={16} />Apply changes</>
                    )}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAdjust(false)}>
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Weekly schedule */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar size={18} /> Weekly Schedule
              </h3>
              <div className="space-y-3">
                {DAY_ORDER.map(day => {
                  const d = pd.weekly_schedule[day]
                  if (!d) return null
                  const isRest = d.type === 'rest'
                  return (
                    <Card key={day} className="overflow-hidden">
                      <button
                        onClick={() => !isRest && setExpanded(expanded === day ? null : day)}
                        className={`w-full p-4 flex items-center justify-between transition ${
                          isRest ? 'cursor-default opacity-60' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground w-24 text-left">{day}</span>
                          <span className="text-sm text-muted-foreground">
                            {isRest ? 'Rest day' : d.workout}
                          </span>
                        </div>
                        {!isRest && (
                          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {d.exercises?.length ?? 0} exercises
                          </span>
                        )}
                      </button>

                      {!isRest && expanded === day && d.exercises && (
                        <div className="border-t border-border divide-y divide-border">
                          {d.exercises.map((ex, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition">
                              <div>
                                <p className="font-medium text-foreground">{ex.name ?? `Exercise ${i + 1}`}</p>
                                <p className="text-sm text-muted-foreground">
                                  {ex.sets} sets × {ex.reps} reps
                                  {ex.duration ? ` (${ex.duration})` : ''}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${intensityColor(programme.difficulty)}`}>
                                {programme.difficulty}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Expected progress */}
            <Card className="p-6 bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <TrendingUp size={18} /> Expected Progress
              </h3>
              <p className="text-muted-foreground text-sm">
                Based on your profile, you should see a change of{' '}
                <span className="font-semibold text-foreground">
                  {pd.summary.expected_monthly_change > 0 ? '+' : ''}
                  {pd.summary.expected_monthly_change}{' '}
                  {pd.summary.metric === 'session_duration_hours' ? 'hours' : 'kg'}
                </span>{' '}
                per month in{' '}
                <span className="font-semibold text-foreground">
                  {pd.summary.metric.replace(/_/g, ' ')}
                </span>.
              </p>
            </Card>

            {/* Regenerate */}
            <div className="text-center pt-2">
              <p className="text-muted-foreground mb-4">
                Not satisfied? Generate a new program based on your current profile.
              </p>
              <Button onClick={generateProgramme} disabled={loading} size="lg" variant="outline">
                {loading
                  ? <><RefreshCw className="mr-2 animate-spin" size={20} />Generating…</>
                  : <><RefreshCw className="mr-2" size={20} />Generate New Program</>}
              </Button>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}