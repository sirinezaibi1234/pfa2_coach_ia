'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, Download, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react'
import { programmeService, Programme, DietPreference } from '@/services/programme.service'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const goalLabel: Record<string, string> = {
  lose_weight: 'Weight Loss',
  gain_muscle: 'Muscle Gain',
  improve_endurance: 'Endurance',
  maintain_weight: 'Maintenance',
}

const dietOptions: DietPreference[] = ['Balanced', 'Vegan', 'Vegetarian', 'Paleo', 'Keto', 'Low-Carb']

const formatExercise = (exercise: unknown): string => {
  if (typeof exercise === 'string') return exercise
  if (!exercise || typeof exercise !== 'object') return 'Exercise'

  const obj = exercise as Record<string, unknown>
  const name =
    (typeof obj['Name of Exercise'] === 'string' && obj['Name of Exercise']) ||
    (typeof obj['name'] === 'string' && obj['name']) ||
    (typeof obj['exercise'] === 'string' && obj['exercise']) ||
    'Exercise'

  const sets = typeof obj['sets'] === 'number' ? `${obj['sets']} sets` : null
  const reps = typeof obj['reps'] === 'number' ? `${obj['reps']} reps` : null
  const muscle = typeof obj['muscle'] === 'string' ? String(obj['muscle']) : null

  const details = [sets, reps, muscle].filter(Boolean).join(' - ')
  return details ? `${name} (${details})` : name
}

export default function TrainingProgramPage() {
  const { user } = useAuth()
  const [program, setProgram] = useState<Programme | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dietPreference, setDietPreference] = useState<DietPreference>('Balanced')
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<number>(4)
  const [confirming, setConfirming] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const loadProgramme = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await programmeService.getMyProgramme()
      setProgram(res.programme)
      setDietPreference(res.programme.diet_preference)
      if (res.programme.programme_data?.training_days_per_week) {
        setTrainingDaysPerWeek(res.programme.programme_data.training_days_per_week)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load programme'
      if (message.toLowerCase().includes('no active programme found')) {
        setProgram(null)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProgramme()
  }, [])

  const generateProgram = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const res = await programmeService.generateProgramme(dietPreference, trainingDaysPerWeek)
      setProgram(res.programme)
      setExpanded(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate programme')
    } finally {
      setLoading(false)
    }
  }

  const confirmProgram = async () => {
    setConfirming(true)
    setError(null)
    try {
      const res = await programmeService.confirmProgramme()
      setProgram(res.programme)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to confirm programme')
    } finally {
      setConfirming(false)
    }
  }

  const downloadProgram = () => {
    if (!program) return
    const csv = convertToCSV(program)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(goalLabel[program.goal] || program.goal).replace(/\s+/g, '_').toLowerCase()}_program.csv`
    a.click()
  }

  const convertToCSV = (prog: Programme) => {
    let csv = 'AI Training Program\n'
    csv += `Goal,${prog.goal}\n`
    csv += `Difficulty,${prog.difficulty}\n`
    csv += `Status,${prog.status}\n`
    csv += `TDEE,${prog.tdee}\n`
    csv += `Calorie Target,${prog.calorie_target}\n`
    csv += `Diet Preference,${prog.diet_preference}\n\n`
    csv += 'Day,Type,Workout,Exercises\n'
    dayOrder.forEach((day) => {
      const dayPlan = prog.programme_data.weekly_schedule[day]
      if (!dayPlan) return
      csv += `${day},${dayPlan.type},${dayPlan.workout || ''},"${(dayPlan.exercises || []).map(formatExercise).join(' | ')}"\n`
    })
    return csv
  }

  const orderedDays = useMemo(() => {
    if (!program) return [] as string[]
    return Object.keys(program.programme_data.weekly_schedule).sort(
      (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
    )
  }, [program])

  if (!user) return null

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Training Program</h1>
          <p className="text-muted-foreground">
            Programme generated by the backend AI using your personal profile (goal, age, gender, weight, activity level)
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 text-destructive p-4">
            {error}
          </div>
        )}

        <div className="max-w-2xl mb-6 grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Diet Preference for generation</Label>
            <Select value={dietPreference} onValueChange={(value) => setDietPreference(value as DietPreference)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dietOptions.map((diet) => (
                  <SelectItem key={diet} value={diet}>
                    {diet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Training Days Per Week</Label>
            <Select
              value={String(trainingDaysPerWeek)}
              onValueChange={(value) => setTrainingDaysPerWeek(parseInt(value, 10))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="4">4 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="6">6 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading && !program ? (
          <Card className="p-8 text-center">
            <RefreshCw className="mx-auto mb-4 animate-spin text-primary" size={40} />
            <p className="text-muted-foreground">Loading programme...</p>
          </Card>
        ) : !program ? (
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-primary" size={48} />
            <h2 className="text-xl font-semibold mb-2">No Program Generated Yet</h2>
            <p className="text-muted-foreground mb-6">
              Generate your personalized program from backend using your profile and active objective.
            </p>
            <div className="max-w-xl mx-auto mb-6 text-left bg-muted/50 rounded-lg border border-border p-4">
              <p className="text-sm font-medium text-foreground mb-2">Profile used for generation:</p>
              <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <p>Fitness Level: <span className="text-foreground capitalize">{user.fitnessLevel}</span></p>
                <p>Age: <span className="text-foreground">{user.age}</span></p>
                <p>Height / Weight: <span className="text-foreground">{user.height} cm / {user.weight} kg</span></p>
                <p>
                  Primary Objective:{' '}
                  <span className="text-foreground">
                    {user.objectives.length > 0
                      ? goalLabel[
                          user.objectives[0].type === 'weight-loss'
                            ? 'lose_weight'
                            : user.objectives[0].type === 'muscle-gain'
                              ? 'gain_muscle'
                              : user.objectives[0].type === 'endurance'
                                ? 'improve_endurance'
                                : 'maintain_weight'
                        ]
                      : 'Maintenance'}
                  </span>
                </p>
              </div>
              {user.medicalConditions.length > 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  Medical conditions detected. Program intensity is automatically adjusted.
                </p>
              )}
            </div>
            <Button
              onClick={generateProgram}
              disabled={loading}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2" size={20} />
                  Generate Program from AI Backend
                </>
              )}
            </Button>
          </Card>
        ) : (
          <div>
            {/* Program Header */}
            <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {goalLabel[program.goal] || program.goal} Program
                  </h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Calendar size={16} />
                    Generated: {new Date(program.created_at).toLocaleDateString()} | Status: {program.status}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Difficulty: <span className="text-foreground font-medium">{program.difficulty}</span> | TDEE:{' '}
                    <span className="text-foreground font-medium">{program.tdee} kcal</span> | Target:{' '}
                    <span className="text-foreground font-medium">{program.calorie_target} kcal</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Training days/week:{' '}
                    <span className="text-foreground font-medium">
                      {program.programme_data.training_days_per_week || program.programme_data.summary?.days_per_week}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={generateProgram} variant="outline">
                    <RefreshCw className="mr-2" size={18} />
                    Regenerate
                  </Button>
                  {program.status === 'pending_confirmation' && (
                    <Button onClick={confirmProgram} disabled={confirming}>
                      {confirming ? (
                        <>
                          <RefreshCw className="mr-2 animate-spin" size={18} />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2" size={18} />
                          Confirm Program
                        </>
                      )}
                    </Button>
                  )}
                  <Button onClick={downloadProgram} className="bg-primary hover:bg-primary/90">
                    <Download className="mr-2" size={18} />
                    Download
                  </Button>
                </div>
              </div>
              <p className="text-foreground font-medium mt-4">
                Goal: {goalLabel[program.goal] || program.goal} | Days/week:{' '}
                {program.programme_data.summary?.days_per_week ?? '-'}
              </p>
            </Card>

            {/* Weekly Schedule */}
            <div className="grid gap-4">
              {orderedDays.map((day) => {
                const dayPlan = program.programme_data.weekly_schedule[day]
                const exercises = dayPlan.exercises || []
                const isRest = dayPlan.type === 'rest'

                return (
                  <Card key={day} className="overflow-hidden">
                    <button
                      onClick={() => setExpanded(expanded === day ? null : day)}
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition"
                    >
                      <h3 className="font-semibold text-foreground text-lg">{day}</h3>
                      <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {isRest ? 'Rest day' : `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''}`}
                      </span>
                    </button>

                    {expanded === day && (
                      <div className="border-t border-border">
                        {isRest ? (
                          <div className="p-4 text-sm text-muted-foreground">Recovery and mobility day.</div>
                        ) : (
                          <>
                            <div className="p-4 border-b border-border bg-muted/30">
                              <p className="text-sm text-muted-foreground">
                                Workout Type:{' '}
                                <span className="text-foreground font-medium">{dayPlan.workout || 'Workout'}</span>
                              </p>
                            </div>
                            {exercises.map((exercise, idx) => (
                              <div
                                key={`${day}-${idx}`}
                                className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition"
                              >
                                <h4 className="font-medium text-foreground">{formatExercise(exercise)}</h4>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>

            {/* Regenerate Button */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">
                Generate a new version any time. The backend will use your latest profile and objective.
              </p>
              <Button
                onClick={generateProgram}
                disabled={loading}
                size="lg"
                variant="outline"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2" size={20} />
                    Generate New Program
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
