interface SignupReviewProps {
  formData: any
}

export default function SignupReview({ formData }: SignupReviewProps) {
  const objectiveLabels: Record<string, string> = {
    'weight-loss': 'Weight Loss',
    'muscle-gain': 'Muscle Gain',
    'endurance': 'Endurance',
    'maintenance': 'Maintenance',
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Review Your Details</h2>
      <p className="text-muted-foreground mb-6">Please verify everything is correct</p>

      <div className="space-y-4">
        {/* Account Information */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h3 className="font-semibold text-foreground mb-3">Account Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username:</span>
              <span className="font-medium text-foreground">{formData.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium text-foreground">{formData.email}</span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h3 className="font-semibold text-foreground mb-3">Personal Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age:</span>
              <span className="font-medium text-foreground">{formData.age} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gender:</span>
              <span className="font-medium text-foreground capitalize">{formData.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Height:</span>
              <span className="font-medium text-foreground">{formData.height} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium text-foreground">{formData.weight} kg</span>
            </div>
          </div>
        </div>

        {/* Health & Fitness */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h3 className="font-semibold text-foreground mb-3">Health & Fitness</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Fitness Level:</p>
              <p className="font-medium text-foreground capitalize">{formData.fitnessLevel}</p>
            </div>
            {formData.objectives.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1">Objectives:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.objectives.map((obj: string) => (
                    <span
                      key={obj}
                      className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium"
                    >
                      {objectiveLabels[obj] || obj}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {formData.dietaryRestrictions.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1">Dietary Preferences:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.dietaryRestrictions.map((diet: string) => (
                    <span
                      key={diet}
                      className="inline-block bg-secondary/10 text-secondary px-2 py-1 rounded text-xs font-medium"
                    >
                      {diet}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {formData.medicalConditions && (
              <div>
                <p className="text-muted-foreground mb-1">Medical Notes:</p>
                <p className="font-medium text-foreground text-xs">{formData.medicalConditions}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            ✓ You&apos;re all set! Click &apos;Create Account&apos; to complete your registration.
          </p>
        </div>
      </div>
    </div>
  )
}
