'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Trash2, Plus } from 'lucide-react'

interface MealEntry {
  id: string
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foodItems: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
  date: string
}

export default function NutritionPage() {
  const { user } = useAuth()
  const [meals, setMeals] = useState<MealEntry[]>([
    {
      id: '1',
      meal: 'breakfast',
      foodItems: ['Oatmeal', 'Banana', 'Almond Milk'],
      calories: 350,
      protein: 10,
      carbs: 50,
      fat: 8,
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: '2',
      meal: 'lunch',
      foodItems: ['Grilled Chicken', 'Brown Rice', 'Vegetables'],
      calories: 520,
      protein: 40,
      carbs: 45,
      fat: 12,
      date: new Date().toISOString().split('T')[0],
    },
  ])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    meal: 'breakfast' as const,
    foodItems: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })

  const addMeal = () => {
    if (!formData.foodItems || formData.calories === 0) {
      alert('Please fill in all fields')
      return
    }

    const newMeal: MealEntry = {
      id: Math.random().toString(36).substr(2, 9),
      meal: formData.meal,
      foodItems: formData.foodItems.split(',').map(item => item.trim()),
      calories: formData.calories,
      protein: formData.protein,
      carbs: formData.carbs,
      fat: formData.fat,
      date: new Date().toISOString().split('T')[0],
    }

    setMeals([newMeal, ...meals])
    setFormData({
      meal: 'breakfast',
      foodItems: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    })
    setShowForm(false)
  }

  const deleteMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id))
  }

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0)
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0)
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0)
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0)

  if (!user) return null

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Nutrition Tracker</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} /> Log Meal
        </button>
      </div>

      {/* Macros Summary */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Total Calories</p>
          <p className="text-3xl font-bold text-foreground">{totalCalories}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Protein</p>
          <p className="text-3xl font-bold text-foreground">{totalProtein}g</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Carbs</p>
          <p className="text-3xl font-bold text-foreground">{totalCarbs}g</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-muted-foreground text-sm mb-2">Fat</p>
          <p className="text-3xl font-bold text-foreground">{totalFat}g</p>
        </div>
      </div>

      {/* Add Meal Form */}
      {showForm && (
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">Log a Meal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Meal Type</label>
              <select
                value={formData.meal}
                onChange={e => setFormData({ ...formData, meal: e.target.value as any })}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Food Items (comma separated)</label>
              <input
                type="text"
                placeholder="e.g., Chicken, Rice, Broccoli"
                value={formData.foodItems}
                onChange={e => setFormData({ ...formData, foodItems: e.target.value })}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Calories</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={e => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Protein (g)</label>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={e => setFormData({ ...formData, protein: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Carbs (g)</label>
                <input
                  type="number"
                  value={formData.carbs}
                  onChange={e => setFormData({ ...formData, carbs: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fat (g)</label>
                <input
                  type="number"
                  value={formData.fat}
                  onChange={e => setFormData({ ...formData, fat: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={addMeal}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
              >
                Add Meal
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

      {/* Meals List */}
      <div className="space-y-4">
        {meals.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground text-lg">No meals logged yet</p>
            <p className="text-muted-foreground text-sm">Start tracking your nutrition today!</p>
          </div>
        ) : (
          meals.map(meal => (
            <div key={meal.id} className="bg-card rounded-lg border border-border p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground capitalize mb-1">{meal.meal}</h3>
                  <p className="text-sm text-muted-foreground">{meal.foodItems.join(', ')}</p>
                </div>
                <button
                  onClick={() => deleteMeal(meal.id)}
                  className="p-2 text-destructive hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Calories</p>
                  <p className="font-bold text-foreground">{meal.calories}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Protein</p>
                  <p className="font-bold text-foreground">{meal.protein}g</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Carbs</p>
                  <p className="font-bold text-foreground">{meal.carbs}g</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Fat</p>
                  <p className="font-bold text-foreground">{meal.fat}g</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
