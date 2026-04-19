interface SignupStep2Props {
  formData: any
  updateFormData: (data: any) => void
}

export default function SignupStep2({ formData, updateFormData }: SignupStep2Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Personal Information</h2>
      <p className="text-muted-foreground mb-6">Tell us about yourself</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Age
            </label>
            <input
              type="number"
              min="18"
              max="120"
              placeholder="25"
              value={formData.age || ''}
              onChange={e => updateFormData({ age: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={e => updateFormData({ gender: e.target.value })}
              className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              min="100"
              max="250"
              placeholder="180"
              value={formData.height || ''}
              onChange={e => updateFormData({ height: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              min="30"
              max="300"
              placeholder="75"
              value={formData.weight || ''}
              onChange={e => updateFormData({ weight: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            This information helps us personalize your fitness recommendations and track your progress accurately.
          </p>
        </div>
      </div>
    </div>
  )
}
