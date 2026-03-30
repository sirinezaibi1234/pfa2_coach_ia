'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, Download, RefreshCw, Calendar, Flame } from 'lucide-react'

interface Meal {
  name: string
  time: string
  calories: number
  protein: number
  carbs: number
  fat: number
  items: string[]
  notes?: string
}

interface DailyPlan {
  day: string
  meals: Meal[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

interface NutritionProgram {
  id: string
  name: string
  duration: string
  goal: string
  dailyCalories: number
  generatedAt: string
  plan: DailyPlan[]
}

export default function NutritionProgramPage() {
  const { user } = useAuth()
  const [program, setProgram] = useState<NutritionProgram | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Mock AI-generated nutrition program
  const mockPrograms: NutritionProgram[] = [
    {
      id: '1',
      name: 'Muscle Building Nutrition Plan',
      duration: '12 weeks',
      goal: 'Build lean muscle with adequate protein intake',
      dailyCalories: 2800,
      generatedAt: new Date().toLocaleDateString(),
      plan: [
        {
          day: 'Monday',
          meals: [
            {
              name: 'Breakfast',
              time: '7:00 AM',
              calories: 450,
              protein: 35,
              carbs: 50,
              fat: 12,
              items: [
                'Oatmeal with berries (1 cup)',
                '2 whole eggs + 3 egg whites',
                'Banana',
                'Almond butter (1 tbsp)',
              ],
              notes: 'High protein breakfast to start the day',
            },
            {
              name: 'Mid-Morning Snack',
              time: '10:00 AM',
              calories: 250,
              protein: 25,
              carbs: 30,
              fat: 5,
              items: ['Greek yogurt (200g)', 'Granola (50g)', 'Honey (1 tbsp)'],
              notes: 'Pre-workout snack',
            },
            {
              name: 'Lunch',
              time: '1:00 PM',
              calories: 650,
              protein: 50,
              carbs: 70,
              fat: 15,
              items: [
                'Grilled chicken breast (200g)',
                'Brown rice (1 cup cooked)',
                'Mixed vegetables',
                'Olive oil (1 tbsp)',
              ],
              notes: 'Post-workout recovery meal',
            },
            {
              name: 'Afternoon Snack',
              time: '4:00 PM',
              calories: 200,
              protein: 20,
              carbs: 20,
              fat: 6,
              items: ['Protein shake with banana', 'Almonds (30g)'],
              notes: 'Energy boost before evening activities',
            },
            {
              name: 'Dinner',
              time: '7:00 PM',
              calories: 600,
              protein: 45,
              carbs: 55,
              fat: 18,
              items: [
                'Salmon fillet (200g)',
                'Sweet potato (1 large)',
                'Broccoli',
                'Lemon & olive oil dressing',
              ],
              notes: 'Rich in omega-3s for recovery',
            },
            {
              name: 'Evening Snack',
              time: '9:30 PM',
              calories: 150,
              protein: 20,
              carbs: 10,
              fat: 4,
              items: ['Casein protein (1 scoop)', 'Cottage cheese (100g)'],
              notes: 'Slow-digesting protein before sleep',
            },
          ],
          totalCalories: 2800,
          totalProtein: 195,
          totalCarbs: 235,
          totalFat: 60,
        },
      ],
    },
  ]

  const generateProgram = async () => {
    setLoading(true)
    // Simulate API call to AI
    await new Promise(resolve => setTimeout(resolve, 1500))
    setProgram(mockPrograms[0])
    setLoading(false)
  }

  const downloadProgram = () => {
    if (!program) return
    const csv = convertToCSV(program)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${program.name}.csv`
    a.click()
  }

  const convertToCSV = (prog: NutritionProgram) => {
    let csv = `Nutrition Program: ${prog.name}\n`
    csv += `Duration: ${prog.duration}\nGoal: ${prog.goal}\nDaily Calories: ${prog.dailyCalories}\n\n`

    prog.plan.forEach(day => {
      csv += `${day.day}\n`
      csv += 'Meal,Time,Calories,Protein(g),Carbs(g),Fat(g),Items\n'
      day.meals.forEach(meal => {
        csv += `${meal.name},${meal.time},${meal.calories},${meal.protein},${meal.carbs},${meal.fat},"${meal.items.join('; ')}"\n`
      })
      csv += `Daily Totals,,,${day.totalProtein},${day.totalCarbs},${day.totalFat}\n\n`
    })

    return csv
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Nutrition Program</h1>
          <p className="text-muted-foreground">
            Personalized meal plans generated by our AI based on your fitness goals and dietary
            preferences
          </p>
        </div>

        {!program ? (
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-primary" size={48} />
            <h2 className="text-xl font-semibold mb-2">No Program Generated Yet</h2>
            <p className="text-muted-foreground mb-6">
              Click the button below to generate a personalized nutrition program based on your
              fitness goals, dietary restrictions, and health profile.
            </p>
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
                  Generate Program
                </>
              )}
            </Button>
          </Card>
        ) : (
          <div>
            {/* Program Header */}
            <Card className="p-6 mb-6 bg-gradient-to-r from-secondary/10 to-primary/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{program.name}</h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Calendar size={16} />
                    {program.duration} | Generated: {program.generatedAt}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={generateProgram} variant="outline">
                    <RefreshCw className="mr-2" size={18} />
                    Regenerate
                  </Button>
                  <Button onClick={downloadProgram} className="bg-secondary hover:bg-secondary/90">
                    <Download className="mr-2" size={18} />
                    Download
                  </Button>
                </div>
              </div>
              <p className="text-foreground font-medium mt-4">
                Goal: {program.goal} | Daily Target: {program.dailyCalories} kcal
              </p>
            </Card>

            {/* Macro Summary */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={18} className="text-destructive" />
                  <span className="text-sm font-medium text-muted-foreground">Calories</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{program.dailyCalories}</p>
                <p className="text-xs text-muted-foreground">kcal/day</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🍗</span>
                  <span className="text-sm font-medium text-muted-foreground">Protein</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {program.plan[0]?.totalProtein || 0}g
                </p>
                <p className="text-xs text-muted-foreground">per day</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🌾</span>
                  <span className="text-sm font-medium text-muted-foreground">Carbs</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {program.plan[0]?.totalCarbs || 0}g
                </p>
                <p className="text-xs text-muted-foreground">per day</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🥑</span>
                  <span className="text-sm font-medium text-muted-foreground">Fat</span>
                </div>
                <p className="text-2xl font-bold text-secondary">
                  {program.plan[0]?.totalFat || 0}g
                </p>
                <p className="text-xs text-muted-foreground">per day</p>
              </Card>
            </div>

            {/* Daily Plans */}
            <div className="grid gap-4">
              {program.plan.map(day => (
                <Card key={day.day} className="overflow-hidden">
                  <button
                    onClick={() => setExpanded(expanded === day.day ? null : day.day)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition"
                  >
                    <h3 className="font-semibold text-foreground text-lg">{day.day}</h3>
                    <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {day.totalCalories} kcal | {day.meals.length} meals
                    </span>
                  </button>

                  {expanded === day.day && (
                    <div className="border-t border-border">
                      {day.meals.map((meal, idx) => (
                        <div
                          key={idx}
                          className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-foreground">{meal.name}</h4>
                              <p className="text-sm text-muted-foreground">{meal.time}</p>
                            </div>
                            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded">
                              {meal.calories} kcal
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-border">
                            <div className="text-sm">
                              <p className="text-muted-foreground text-xs">Protein</p>
                              <p className="font-semibold text-foreground">{meal.protein}g</p>
                            </div>
                            <div className="text-sm">
                              <p className="text-muted-foreground text-xs">Carbs</p>
                              <p className="font-semibold text-foreground">{meal.carbs}g</p>
                            </div>
                            <div className="text-sm">
                              <p className="text-muted-foreground text-xs">Fat</p>
                              <p className="font-semibold text-foreground">{meal.fat}g</p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm font-medium text-foreground mb-2">Ingredients:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {meal.items.map((item, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="text-primary">•</span> {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {meal.notes && (
                            <p className="text-sm text-muted-foreground italic bg-muted/50 p-2 rounded">
                              💡 {meal.notes}
                            </p>
                          )}
                        </div>
                      ))}

                      <div className="p-4 bg-muted/30 border-t border-border">
                        <p className="text-sm font-semibold text-foreground mb-2">Daily Totals</p>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Calories</p>
                            <p className="font-bold text-foreground">{day.totalCalories} kcal</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Protein</p>
                            <p className="font-bold text-primary">{day.totalProtein}g</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Carbs</p>
                            <p className="font-bold text-primary">{day.totalCarbs}g</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Fat</p>
                            <p className="font-bold text-secondary">{day.totalFat}g</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Regenerate Button */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">
                Want a different meal plan? Generate a new nutrition program.
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
