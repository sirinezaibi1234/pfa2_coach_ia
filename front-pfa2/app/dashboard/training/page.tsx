'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarDays, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Calendar as AppCalendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trainingService, type TrainingIntensity, type TrainingSession, type TrainingWorkoutType } from '@/services/training.service'

const workoutTypeLabels: Record<TrainingWorkoutType, string> = {
  cardio: 'Cardio',
  strength: 'Strength',
  flexibility: 'Yoga',
  sports: 'HITT',
}

const intensityLabels: Record<TrainingIntensity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const emptyForm = {
  workoutType: 'cardio' as TrainingWorkoutType,
  intensity: 'medium' as TrainingIntensity,
  durationMinutes: '',
  distanceKm: '',
  notes: '',
}

export default function TrainingPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadLogs = async () => {
      try {
        setIsLoading(true)
        const response = await trainingService.getLogs()

        if (!mounted) return

        const sortedSessions = [...response.logs].sort((left, right) => {
          const dateDiff = new Date(right.session_date).getTime() - new Date(left.session_date).getTime()
          if (dateDiff !== 0) return dateDiff
          return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
        })

        setSessions(sortedSessions)

        if (sortedSessions.length > 0) {
          setSelectedDate(parseISO(sortedSessions[0].session_date))
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load training logs')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadLogs()

    return () => {
      mounted = false
    }
  }, [])

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')
  const selectedSessions = useMemo(
    () => sessions.filter(session => session.session_date === selectedDateKey),
    [sessions, selectedDateKey]
  )
  const logDates = useMemo(
    () => sessions.map(session => parseISO(session.session_date)),
    [sessions]
  )
  const uniqueTrainingDays = useMemo(
    () => new Set(sessions.map(session => session.session_date)).size,
    [sessions]
  )
  const totalMinutes = useMemo(
    () => sessions.reduce((sum, session) => sum + session.duration_minutes, 0),
    [sessions]
  )

  const resetForm = () => setFormData(emptyForm)

  const addWorkout = async () => {
    const durationMinutes = Number(formData.durationMinutes)

    if (!durationMinutes || durationMinutes <= 0) {
      setError('Please provide a valid duration')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await trainingService.createLog({
        workout_type: formData.workoutType,
        intensity: formData.intensity,
        duration_minutes: durationMinutes,
        session_date: selectedDateKey,
        ...(formData.distanceKm.trim() ? { distance_km: Number(formData.distanceKm) } : {}),
        ...(formData.notes.trim() ? { notes: formData.notes.trim() } : {}),
      })

      setSessions(prev => [response.log, ...prev].sort((left, right) => {
        const dateDiff = new Date(right.session_date).getTime() - new Date(left.session_date).getTime()
        if (dateDiff !== 0) return dateDiff
        return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
      }))
      setSelectedDate(parseISO(response.log.session_date))
      resetForm()
      setShowForm(false)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save workout')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteWorkout = async (id: number) => {
    setError(null)

    try {
      await trainingService.deleteLog(id)
      setSessions(prev => prev.filter(session => session.id !== id))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete workout')
    }
  }

  if (!user) return null

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Training Log</h1>
          <p className="text-muted-foreground mt-1">Choose a day on the calendar to review the workouts for that date.</p>
        </div>
        <Button onClick={() => setShowForm(value => !value)} className="flex items-center gap-2 self-start">
          <Plus size={20} /> New Workout
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Total Sessions</p>
          <p className="text-3xl font-bold text-foreground">{sessions.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Training Minutes</p>
          <p className="text-3xl font-bold text-foreground">{totalMinutes}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Training Days</p>
          <p className="text-3xl font-bold text-foreground">{uniqueTrainingDays}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Calendar</h2>
              <p className="text-sm text-muted-foreground">Days with logged sessions are highlighted.</p>
            </div>
          </div>
          <AppCalendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            modifiers={{
              hasLog: logDates,
            }}
            modifiersClassNames={{
              hasLog: 'bg-secondary/20 text-secondary-foreground font-semibold',
            }}
            className="rounded-md border"
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{format(selectedDate, 'EEEE, MMMM d')}</h2>
                <p className="text-sm text-muted-foreground">Training log for {selectedDateKey}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {selectedSessions.length} session{selectedSessions.length > 1 ? 's' : ''}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading training logs...</p>
              ) : selectedSessions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  No training session was logged for this day.
                </div>
              ) : (
                selectedSessions.map(session => (
                  <div key={session.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-foreground">{workoutTypeLabels[session.workout_type]}</h3>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full border border-border px-2 py-1">{workoutTypeLabels[session.workout_type]}</span>
                          <span className="rounded-full border border-border px-2 py-1">{intensityLabels[session.intensity]} intensity</span>
                          <span className="rounded-full border border-border px-2 py-1">{session.duration_minutes} min</span>
                          {typeof session.distance_km === 'number' && (
                            <span className="rounded-full border border-border px-2 py-1">{session.distance_km} km</span>
                          )}
                        </div>
                        {session.notes && <p className="text-sm text-muted-foreground italic">{session.notes}</p>}
                      </div>
                      <button
                        onClick={() => deleteWorkout(session.id)}
                        className="p-2 text-destructive hover:bg-red-50 rounded-lg transition"
                        aria-label={`Delete ${workoutTypeLabels[session.workout_type]}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {showForm && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Log a Workout</h3>
              <p className="text-sm text-muted-foreground mb-6">
                The entry will be saved on the selected day.
              </p>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block mb-2">Workout Type</Label>
                    <Select
                      value={formData.workoutType}
                      onValueChange={value => setFormData({ ...formData, workoutType: value as TrainingWorkoutType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yoga">Yoga</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="sports">HITT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="block mb-2">Intensity</Label>
                    <Select
                      value={formData.intensity}
                      onValueChange={value => setFormData({ ...formData, intensity: value as TrainingIntensity })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block mb-2">Duration (minutes)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.durationMinutes}
                      onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="block mb-2">Distance (km) {formData.workoutType !== 'cardio' ? '(cardio only)' : ''}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      disabled={formData.workoutType !== 'cardio'}
                      value={formData.distanceKm}
                      placeholder={formData.workoutType === 'cardio' ? 'Example: 5' : 'Not required'}
                      onChange={e => setFormData({ ...formData, distanceKm: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="block mb-2">Notes (optional)</Label>
                  <Input
                    type="text"
                    placeholder="Example: Felt strong, steady pace, good mobility work"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-4">
                  <Button onClick={addWorkout} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Add Workout'}
                  </Button>
                  <Button
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}