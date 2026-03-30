interface SignupStep3Props {
  formData: any
  updateFormData: (data: any) => void
}

const objectiveOptions = [
  { id: 'weight-loss', label: 'Weight Loss', icon: '📉' },
  { id: 'muscle-gain', label: 'Muscle Gain', icon: '💪' },
  { id: 'endurance', label: 'Endurance', icon: '🏃' },
  { id: 'maintenance', label: 'Maintenance', icon: '⚖️' },
]

const dietaryOptions = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'None',
]

export default function SignupStep3({ formData, updateFormData }: SignupStep3Props) {
  const toggleObjective = (objectiveId: string) => {
    const newObjectives = formData.objectives.includes(objectiveId)
      ? formData.objectives.filter((id: string) => id !== objectiveId)
      : [...formData.objectives, objectiveId]
    updateFormData({ objectives: newObjectives })
  }

  const toggleDietaryRestriction = (restriction: string) => {
    const newRestrictions = formData.dietaryRestrictions.includes(restriction)
      ? formData.dietaryRestrictions.filter((r: string) => r !== restriction)
      : [...formData.dietaryRestrictions, restriction]
    updateFormData({ dietaryRestrictions: newRestrictions })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Health & Fitness</h2>
      <p className="text-muted-foreground mb-6">Help us customize your experience</p>

      <div className="space-y-6">
        {/* Fitness Level */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Current Fitness Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['beginner', 'intermediate', 'advanced'].map(level => (
              <button
                key={level}
                onClick={() => updateFormData({ fitnessLevel: level })}
                className={`px-4 py-3 rounded-lg border transition capitalize font-medium ${
                  formData.fitnessLevel === level
                    ? 'bg-primary text-white border-primary'
                    : 'border-input bg-background text-foreground hover:border-primary'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Objectives */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Your Objectives
          </label>
          <div className="grid grid-cols-2 gap-3">
            {objectiveOptions.map(option => (
              <button
                key={option.id}
                onClick={() => toggleObjective(option.id)}
                className={`p-4 rounded-lg border transition text-left ${
                  formData.objectives.includes(option.id)
                    ? 'bg-primary/10 border-primary text-foreground'
                    : 'border-input bg-background text-foreground hover:border-primary'
                }`}
              >
                <div className="text-lg mb-1">{option.icon}</div>
                <div className="font-medium text-sm">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Dietary Preferences
          </label>
          <div className="grid grid-cols-2 gap-2">
            {dietaryOptions.map(option => (
              <button
                key={option}
                onClick={() => toggleDietaryRestriction(option)}
                className={`px-3 py-2 rounded-lg border transition text-sm ${
                  formData.dietaryRestrictions.includes(option)
                    ? 'bg-primary text-white border-primary'
                    : 'border-input bg-background text-foreground hover:border-primary'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Medical Conditions */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Medical Conditions (Optional)
          </label>
          <textarea
            placeholder="List any medical conditions, injuries, or medications that may affect your training..."
            value={formData.medicalConditions}
            onChange={e => updateFormData({ medicalConditions: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This helps us provide safer, more personalized recommendations
          </p>
        </div>
      </div>
    </div>
  )
}
