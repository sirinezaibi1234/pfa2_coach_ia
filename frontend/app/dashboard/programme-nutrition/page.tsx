'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  RefreshCw,
  Download,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Flame,
  Utensils,
  AlertCircle,
  Clock,
} from 'lucide-react'

// ── Backend response types ────────────────────────────────────────────────────

interface BackendMeal {
  Food_Items?:  string | string[]
  Calories:    number
  Protein:     number
  Carbs:       number
  Fat:         number
  Meal_Type?:  string
  Diet_Type?:  string
}

interface DailyMeals {
  breakfast?: BackendMeal
  lunch?:     BackendMeal
  dinner?:    BackendMeal
  snack?:     BackendMeal
}

interface ProgrammeData {
  goal:              string
  difficulty:        string
  calorie_target:    number
  tdee:              number
  diet_preference:   string
  daily_meals:       DailyMeals
  bmi:               number
  summary: {
    days_per_week:           number
    calorie_target:          number
    difficulty_level:        string
    expected_monthly_change: number
    metric:                  string
  }
}

interface Programme {
  id:              number
  status:          'pending_confirmation' | 'active' | 'confirmed' | 'archived'
  goal:            string
  difficulty:      string
  diet_preference: string
  calorie_target:  number
  tdee:            number
  programme_data:  ProgrammeData
  created_at:      string
  confirmed_at:    string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MEAL_TIMES: Record<string, string> = {
  breakfast: '7:00 AM',
  lunch:     '12:30 PM',
  dinner:    '7:00 PM',
  snack:     '3:30 PM',
}

const MEAL_EMOJIS: Record<string, string> = {
  breakfast: '🌅',
  lunch:     '☀️',
  dinner:    '🌙',
  snack:     '🍎',
}

const GOAL_LABELS: Record<string, string> = {
  lose_weight:       'Weight Loss',
  gain_muscle:       'Muscle Gain',
  maintain_weight:   'Maintenance',
  improve_endurance: 'Endurance',
}

function parseFoodItems(raw: string | string[] | undefined | null): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  return raw
    .split(/[,;|]+/)
    .map(s => s.trim())
    .filter(Boolean)
}

function formatGoal(goal: string): string {
  return GOAL_LABELS[goal] ?? goal.replace(/_/g, ' ')
}

function totalMacros(meals: DailyMeals) {
  const all = Object.values(meals).filter(Boolean) as BackendMeal[]
  return {
    calories: all.reduce((s, m) => s + (m.Calories ?? 0), 0),
    protein:  all.reduce((s, m) => s + (m.Protein  ?? 0), 0),
    carbs:    all.reduce((s, m) => s + (m.Carbs    ?? 0), 0),
    fat:      all.reduce((s, m) => s + (m.Fat      ?? 0), 0),
  }
}

function convertToCSV(prog: Programme): string {
  const { programme_data: pd } = prog
  const meals = pd.daily_meals

  let csv = `Nutrition Programme\n`
  csv += `Goal,${formatGoal(prog.goal)}\n`
  csv += `Diet,${prog.diet_preference}\n`
  csv += `Calorie Target,${prog.calorie_target} kcal\n`
  csv += `TDEE,${prog.tdee} kcal\n`
  csv += `Difficulty,${prog.difficulty}\n\n`
  csv += `Meal,Time,Calories,Protein(g),Carbs(g),Fat(g),Foods\n`

  for (const [type, meal] of Object.entries(meals)) {
    if (!meal) continue
    const items = parseFoodItems(meal.Food_Items).join(' | ')
    csv += `${type},${MEAL_TIMES[type] ?? ''},${meal.Calories},${meal.Protein},${meal.Carbs},${meal.Fat},"${items}"\n`
  }

  const t = totalMacros(meals)
  csv += `\nDAILY TOTALS,,${t.calories},${t.protein},${t.carbs},${t.fat}\n`
  return csv
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MacroBar({ label, value, unit, color }: {
  label: string; value: number; unit: string; color: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}<span className="text-sm font-normal ml-1">{unit}</span></span>
    </div>
  )
}

function MealCard({ mealType, meal }: { mealType: string; meal: BackendMeal }) {
  const [open, setOpen] = useState(false)
  const foods = parseFoodItems(meal.Food_Items)

  return (
    <div className="border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors">
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{MEAL_EMOJIS[mealType] ?? '🍽️'}</span>
          <div>
            <p className="font-semibold capitalize text-foreground">{mealType}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={11} /> {MEAL_TIMES[mealType] ?? ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Macro pills */}
          <div className="hidden sm:flex gap-2 text-xs">
            <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-medium">P {meal.Protein}g</span>
            <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-medium">C {meal.Carbs}g</span>
            <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-medium">F {meal.Fat}g</span>
          </div>
          <span className="text-sm font-bold text-primary">{meal.Calories} kcal</span>
          {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-4 pb-4 border-t border-border bg-muted/20">
          {/* Mobile macros */}
          <div className="flex sm:hidden gap-3 py-3 text-xs border-b border-border mb-3">
            <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded font-medium">Protein {meal.Protein}g</span>
            <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded font-medium">Carbs {meal.Carbs}g</span>
            <span className="bg-rose-500/10 text-rose-500 px-2 py-1 rounded font-medium">Fat {meal.Fat}g</span>
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-2">
            <Utensils size={11} className="inline mr-1" />Foods
          </p>
          <ul className="space-y-1.5">
            {foods.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NutritionProgramPage() {
  const [programme, setProgramme] = useState<Programme | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [fetching,  setFetching]  = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  // Load existing programme on mount
  useEffect(() => {
    loadExisting()
  }, [])

  async function loadExisting() {
    setFetching(true)
    setError(null)
    try {
      const res = await api.get<{ programme: Programme }>('/programme/me')
      // Only show if it has nutrition data
      if (res.programme.programme_data?.daily_meals) {
        setProgramme(res.programme)
      }
    } catch {
      // 404 = no programme yet — that's fine
    } finally {
      setFetching(false)
    }
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<{ programme: Programme }>('/programme/generate')
      setProgramme(res.programme)
    } catch (e: any) {
      setError(e.message ?? 'Failed to generate programme')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    if (!programme) return
    setConfirming(true)
    setError(null)
    try {
      const res = await api.post<{ programme: Programme }>('/programme/confirm')
      setProgramme(res.programme)
    } catch (e: any) {
      setError(e.message ?? 'Failed to confirm programme')
    } finally {
      setConfirming(false)
    }
  }

  function handleDownload() {
    if (!programme) return
    const csv  = convertToCSV(programme)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `nutrition-plan-${programme.goal}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Derived display values ────────────────────────────────────────────────
  const pd     = programme?.programme_data
  const meals  = pd?.daily_meals ?? {}
  const totals = totalMacros(meals)
  const mealEntries = Object.entries(meals).filter(([, v]) => Boolean(v)) as [string, BackendMeal][]

  const isPending = programme?.status === 'pending_confirmation'
  const isActive  = programme?.status === 'active' || programme?.status === 'confirmed'

  // ── Render ────────────────────────────────────────────────────────────────

  if (fetching) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">AI Nutrition Programme</h1>
          <p className="text-muted-foreground">
            Personalised daily meal plan generated from your profile and fitness goal.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 mb-6 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* ── Empty state ── */}
        {!programme && (
          <Card className="p-10 text-center">
            <Utensils className="mx-auto mb-4 text-primary" size={48} />
            <h2 className="text-xl font-semibold mb-2">No Nutrition Plan Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Generate a personalised daily meal plan based on your profile, goal, and dietary
              preference. Make sure your profile and an active objective are set first.
            </p>
            <Button onClick={handleGenerate} disabled={loading} size="lg">
              {loading
                ? <><RefreshCw className="mr-2 animate-spin" size={18} />Generating…</>
                : <><RefreshCw className="mr-2" size={18} />Generate Nutrition Plan</>}
            </Button>
          </Card>
        )}

        {/* ── Programme loaded ── */}
        {programme && pd && (
          <div className="space-y-6">

            {/* Status / action banner */}
            {isPending && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div>
                  <p className="font-semibold text-amber-600 dark:text-amber-400">Review your plan</p>
                  <p className="text-sm text-muted-foreground">
                    This plan is pending confirmation. Check your meals below, then activate it.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" onClick={handleGenerate} disabled={loading || confirming} size="sm">
                    {loading ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                    <span className="ml-1.5">Regenerate</span>
                  </Button>
                  <Button onClick={handleConfirm} disabled={confirming || loading} size="sm">
                    {confirming
                      ? <RefreshCw className="animate-spin mr-1.5" size={14} />
                      : <CheckCircle className="mr-1.5" size={14} />}
                    Confirm Plan
                  </Button>
                </div>
              </div>
            )}

            {isActive && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <div>
                    <p className="font-semibold text-green-600 dark:text-green-400">Active plan</p>
                    <p className="text-sm text-muted-foreground">
                      Confirmed {programme.confirmed_at
                        ? new Date(programme.confirmed_at).toLocaleDateString()
                        : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleGenerate} disabled={loading} size="sm">
                    {loading ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                    <span className="ml-1.5">New Plan</span>
                  </Button>
                  <Button variant="outline" onClick={handleDownload} size="sm">
                    <Download size={14} className="mr-1.5" />Export CSV
                  </Button>
                </div>
              </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={15} className="text-orange-500" />
                  <span className="text-xs text-muted-foreground">Calories</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{pd.calorie_target}</p>
                <p className="text-xs text-muted-foreground">target kcal/day</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🎯</span>
                  <span className="text-xs text-muted-foreground">Goal</span>
                </div>
                <p className="text-lg font-bold text-foreground leading-tight">
                  {formatGoal(programme.goal)}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{pd.difficulty}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🥗</span>
                  <span className="text-xs text-muted-foreground">Diet</span>
                </div>
                <p className="text-lg font-bold text-foreground">{pd.diet_preference}</p>
                <p className="text-xs text-muted-foreground">preference</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">⚡</span>
                  <span className="text-xs text-muted-foreground">TDEE</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{pd.tdee}</p>
                <p className="text-xs text-muted-foreground">kcal maintenance</p>
              </Card>
            </div>

            {/* Daily macro totals */}
            <Card className="p-5">
              <p className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                Daily Macro Breakdown
              </p>
              <div className="grid grid-cols-4 gap-6">
                <MacroBar label="Calories" value={totals.calories} unit="kcal" color="text-orange-500" />
                <MacroBar label="Protein"  value={totals.protein}  unit="g"    color="text-blue-500"   />
                <MacroBar label="Carbs"    value={totals.carbs}    unit="g"    color="text-amber-500"  />
                <MacroBar label="Fat"      value={totals.fat}      unit="g"    color="text-rose-500"   />
              </div>
              {/* Visual macro bar */}
              <div className="mt-4 flex rounded-full overflow-hidden h-2 bg-muted">
                {totals.calories > 0 && (() => {
                  const pCal = totals.protein * 4
                  const cCal = totals.carbs   * 4
                  const fCal = totals.fat     * 9
                  const tot  = pCal + cCal + fCal || 1
                  return (
                    <>
                      <div style={{ width: `${(pCal/tot)*100}%` }} className="bg-blue-500"  />
                      <div style={{ width: `${(cCal/tot)*100}%` }} className="bg-amber-500" />
                      <div style={{ width: `${(fCal/tot)*100}%` }} className="bg-rose-500"  />
                    </>
                  )
                })()}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span><span className="text-blue-500 font-bold">■</span> Protein</span>
                <span><span className="text-amber-500 font-bold">■</span> Carbs</span>
                <span><span className="text-rose-500 font-bold">■</span> Fat</span>
              </div>
            </Card>

            {/* Meals */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Daily Meals <span className="text-sm text-muted-foreground font-normal">({mealEntries.length} meals)</span>
              </h2>
              <div className="space-y-3">
                {mealEntries.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No meal data available in this plan.</p>
                ) : (
                  mealEntries.map(([type, meal]) => (
                    <MealCard key={type} mealType={type} meal={meal} />
                  ))
                )}
              </div>
            </div>

            {/* Bottom actions */}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Generated {new Date(programme.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                {isPending && (
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download size={14} className="mr-1.5" />Export CSV
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}