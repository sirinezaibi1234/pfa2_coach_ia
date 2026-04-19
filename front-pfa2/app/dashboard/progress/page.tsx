'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Flame,
  Scale,
  Target,
  TrendingUp,
} from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useAuth } from '@/lib/auth-context'
import { profileService } from '@/services/profile.service'
import { programmeService, type ProgressLog } from '@/services/programme.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

type BackendProfile = {
  weight?: number
  height?: number
  age?: number
  gender?: string
  activity_level?: string
  health_conditions?: string[]
  allergies?: string[]
}

type BackendObjective = {
  goal: string
  target_weight?: number | null
  duration_months?: number | null
  start_date?: string | null
  end_date?: string | null
}

const goalLabel: Record<string, string> = {
  lose_weight: 'Weight Loss',
  gain_muscle: 'Muscle Gain',
  maintain_weight: 'Maintenance',
  improve_endurance: 'Endurance',
}

const activityLabel: Record<string, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly active',
  moderately_active: 'Moderately active',
  very_active: 'Very active',
  extra_active: 'Extremely active',
}

const formatMetric = (value: number | null | undefined, unit: string) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Non renseigné'
  return `${value}${unit}`
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const toNumber = (value: string) => {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const normalizeGoal = (goal?: string | null) => {
  if (!goal) return 'maintenance'
  return goalLabel[goal] ? goal : 'maintenance'
}

export default function ProgressPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<BackendProfile | null>(null)
  const [objective, setObjective] = useState<BackendObjective | null>(null)
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    weight_kg: '',
    body_fat_pct: '',
    session_duration_hours: '',
    notes: '',
  })

  const loadDashboard = async () => {
    setLoading(true)
    setError(null)

    try {
      const [profileRes, objectiveRes, progressRes] = await Promise.all([
        profileService.getProfile(),
        profileService.getObjective(),
        programmeService.getProgress(),
      ])

      setProfile((profileRes.profile ?? null) as BackendProfile | null)
      setObjective((objectiveRes.objective ?? null) as BackendObjective | null)
      setProgressLogs(progressRes.progress ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load progress data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }

    void loadDashboard()
  }, [authLoading, user])

  const sortedLogs = useMemo(
    () => [...progressLogs].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()),
    [progressLogs],
  )

  const weightSeries = useMemo(
    () =>
      sortedLogs
        .filter((log) => log.weight_kg !== null && log.weight_kg !== undefined)
        .map((log) => ({
          label: format(parseISO(log.date), 'dd MMM'),
          date: log.date,
          weight: log.weight_kg,
        })),
    [sortedLogs],
  )

  const bodyFatSeries = useMemo(
    () =>
      sortedLogs
        .filter((log) => log.body_fat_pct !== null && log.body_fat_pct !== undefined)
        .map((log) => ({
          label: format(parseISO(log.date), 'dd MMM'),
          date: log.date,
          bodyFat: log.body_fat_pct,
        })),
    [sortedLogs],
  )

  const sessionSeries = useMemo(
    () =>
      sortedLogs
        .filter((log) => log.session_duration_hours !== null && log.session_duration_hours !== undefined)
        .map((log) => ({
          label: format(parseISO(log.date), 'dd MMM'),
          duration: log.session_duration_hours,
        })),
    [sortedLogs],
  )

  const latestLog = sortedLogs.at(-1) ?? null
  const firstWeight = weightSeries[0]?.weight ?? profile?.weight ?? null
  const currentWeight = weightSeries.at(-1)?.weight ?? profile?.weight ?? null
  const targetWeight = objective?.target_weight ?? null
  const totalEntries = progressLogs.length
  const totalHours = progressLogs.reduce((sum, log) => sum + (log.session_duration_hours ?? 0), 0)
  const averageHours = totalEntries > 0 ? totalHours / totalEntries : 0
  const weightDelta = firstWeight !== null && currentWeight !== null ? currentWeight - firstWeight : null
  const goalType = normalizeGoal(objective?.goal)
  const goalText = goalLabel[objective?.goal ?? 'maintain_weight'] ?? 'Maintenance'

  const goalProgress = useMemo(() => {
    if (targetWeight === null || firstWeight === null || currentWeight === null) return null

    if (goalType === 'lose_weight') {
      const denominator = firstWeight - targetWeight
      if (denominator <= 0) return 0
      return clamp(((firstWeight - currentWeight) / denominator) * 100, 0, 100)
    }

    if (goalType === 'gain_muscle') {
      const denominator = targetWeight - firstWeight
      if (denominator <= 0) return 0
      return clamp(((currentWeight - firstWeight) / denominator) * 100, 0, 100)
    }

    const deviation = Math.abs(currentWeight - firstWeight)
    return clamp(100 - (deviation / Math.max(firstWeight, 1)) * 100, 0, 100)
  }, [currentWeight, firstWeight, goalType, targetWeight])

  const submitProgress = async () => {
    setError(null)

    const payload = {
      weight_kg: toNumber(form.weight_kg),
      body_fat_pct: toNumber(form.body_fat_pct),
      session_duration_hours: toNumber(form.session_duration_hours),
      notes: form.notes.trim() || undefined,
    }

    if (
      payload.weight_kg === undefined &&
      payload.body_fat_pct === undefined &&
      payload.session_duration_hours === undefined &&
      !payload.notes
    ) {
      setError('Enter at least one metric or note before saving.')
      return
    }

    setSaving(true)
    try {
      await programmeService.logProgress(payload)
      setForm({ weight_kg: '', body_fat_pct: '', session_duration_hours: '', notes: '' })
      await loadDashboard()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save progress entry')
    } finally {
      setSaving(false)
    }
  }

  const activityLevel = profile?.activity_level ? activityLabel[profile.activity_level] ?? profile.activity_level : 'Non renseigné'

  if (authLoading || loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <Card className="border-border/60 bg-background/80 backdrop-blur">
          <CardContent className="p-8 text-center text-muted-foreground">Loading progress dashboard...</CardContent>
        </Card>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(to_bottom,_var(--background),_var(--muted)/30)] p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="outline" className="mb-3">
              Live data from profile + progress logs
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Progress & Analytics</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              This dashboard uses your saved profile, active objective, and manually entered progress logs.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{user.username}</p>
            <p>Updated from backend data</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/60 bg-background/85 shadow-sm backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Weight</p>
                  <p className="mt-2 text-3xl font-bold">{formatMetric(currentWeight, ' kg')}</p>
                </div>
                <Scale className="text-primary" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Source: {latestLog?.weight_kg !== null && latestLog?.weight_kg !== undefined ? 'progress log' : 'profile'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/85 shadow-sm backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Goal Target</p>
                  <p className="mt-2 text-3xl font-bold">{formatMetric(targetWeight, ' kg')}</p>
                </div>
                <Target className="text-primary" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{goalText}</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/85 shadow-sm backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progress Entries</p>
                  <p className="mt-2 text-3xl font-bold">{totalEntries}</p>
                </div>
                <Activity className="text-primary" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{activityLevel} activity profile</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/85 shadow-sm backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tracked Hours</p>
                  <p className="mt-2 text-3xl font-bold">{totalHours.toFixed(1)}</p>
                </div>
                <Flame className="text-primary" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Average {averageHours.toFixed(1)} h per log</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <Card className="border-border/60 bg-background/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Weight Trend</CardTitle>
                <CardDescription>Latest measurements saved on your account.</CardDescription>
              </CardHeader>
              <CardContent>
                {weightSeries.length === 0 ? (
                  <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
                    No weight logs yet. Add your first measurement on the right.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weightSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="label" stroke="var(--color-muted-foreground)" />
                      <YAxis stroke="var(--color-muted-foreground)" domain={["dataMin - 1", "dataMax + 1"]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '12px',
                        }}
                        labelStyle={{ color: 'var(--color-foreground)' }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="var(--color-primary)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--color-primary)', r: 4 }}
                        name="Weight (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/60 bg-background/85 shadow-sm backdrop-blur">
                <CardHeader>
                  <CardTitle>Body Fat Trend</CardTitle>
                  <CardDescription>Values from progress entries.</CardDescription>
                </CardHeader>
                <CardContent>
                  {bodyFatSeries.length === 0 ? (
                    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
                      No body fat measurements yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={bodyFatSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="label" stroke="var(--color-muted-foreground)" />
                        <YAxis stroke="var(--color-muted-foreground)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                          }}
                          labelStyle={{ color: 'var(--color-foreground)' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="bodyFat"
                          stroke="var(--color-secondary)"
                          strokeWidth={3}
                          dot={{ fill: 'var(--color-secondary)', r: 4 }}
                          name="Body fat %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-background/85 shadow-sm backdrop-blur">
                <CardHeader>
                  <CardTitle>Session Duration</CardTitle>
                  <CardDescription>Hours recorded for each log.</CardDescription>
                </CardHeader>
                <CardContent>
                  {sessionSeries.length === 0 ? (
                    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
                      No session duration data yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={sessionSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="label" stroke="var(--color-muted-foreground)" />
                        <YAxis stroke="var(--color-muted-foreground)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                          }}
                          labelStyle={{ color: 'var(--color-foreground)' }}
                        />
                        <Bar dataKey="duration" fill="var(--color-accent)" name="Hours" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/60 bg-background/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Recent Logs</CardTitle>
                <CardDescription>Most recent data stored in the backend.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sortedLogs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
                    No logs yet. Use the form to save your first progress entry.
                  </div>
                ) : (
                  [...sortedLogs].reverse().map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground">{format(parseISO(log.date), 'dd MMM yyyy, HH:mm')}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{log.notes || 'No note provided.'}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Weight {formatMetric(log.weight_kg, ' kg')}</Badge>
                        <Badge variant="secondary">Body fat {formatMetric(log.body_fat_pct, ' %')}</Badge>
                        <Badge variant="secondary">Duration {formatMetric(log.session_duration_hours, ' h')}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/60 bg-background/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Log Progress</CardTitle>
                <CardDescription>Store real measurements or notes here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.weight_kg}
                      onChange={(event) => setForm((current) => ({ ...current, weight_kg: event.target.value }))}
                      placeholder="e.g. 74.8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body_fat_pct">Body fat %</Label>
                    <Input
                      id="body_fat_pct"
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.body_fat_pct}
                      onChange={(event) => setForm((current) => ({ ...current, body_fat_pct: event.target.value }))}
                      placeholder="e.g. 21.5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session_duration_hours">Session duration (hours)</Label>
                  <Input
                    id="session_duration_hours"
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.session_duration_hours}
                    onChange={(event) => setForm((current) => ({ ...current, session_duration_hours: event.target.value }))}
                    placeholder="e.g. 1.25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="How did the session feel? What changed?"
                  />
                </div>

                <Button className="w-full" onClick={submitProgress} disabled={saving}>
                  {saving ? 'Saving...' : 'Save progress entry'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Profile Snapshot</CardTitle>
                <CardDescription>Live values used to contextualize your progress.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium text-foreground">{profile?.age ?? 'Non renseigné'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Height</span>
                  <span className="font-medium text-foreground">{formatMetric(profile?.height, ' cm')}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium text-foreground capitalize">{profile?.gender ?? 'Non renseigné'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Activity level</span>
                  <span className="font-medium text-foreground">{activityLevel}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Current objective</span>
                  <span className="font-medium text-foreground">{goalText}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Weight delta</span>
                  <span className="font-medium text-foreground">
                    {weightDelta === null ? 'Non calculable' : `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} kg`}
                  </span>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Goal progress</span>
                    {goalProgress !== null ? (
                      <span className="text-sm text-muted-foreground">{goalProgress.toFixed(0)}%</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No target weight</span>
                    )}
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary via-primary/80 to-secondary transition-all"
                      style={{ width: `${goalProgress ?? 0}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {goalProgress !== null
                      ? 'Computed from your first and latest weight entries.'
                      : 'Add a target weight in your objective to track this bar.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Body Signal Summary</CardTitle>
                <CardDescription>Quick read on the latest available measurement.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Latest log</span>
                  <span className="font-medium text-foreground">
                    {latestLog ? format(parseISO(latestLog.date), 'dd MMM yyyy') : 'Aucune date'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Latest body fat</span>
                  <span className="font-medium text-foreground">{formatMetric(latestLog?.body_fat_pct, ' %')}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Latest session duration</span>
                  <span className="font-medium text-foreground">{formatMetric(latestLog?.session_duration_hours, ' h')}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Entries with weight</span>
                  <span className="font-medium text-foreground">{weightSeries.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}