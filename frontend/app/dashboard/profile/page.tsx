'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    age: user?.age || 0,
    height: user?.height || 0,
    weight: user?.weight || 0,
    gender: user?.gender || 'other',
    fitnessLevel: user?.fitnessLevel || 'beginner',
    dietaryRestrictions: user?.dietaryRestrictions || [],
    medicalConditions: user?.medicalConditions || [],
  })

  if (!user) return null

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateUser({
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        gender: formData.gender as any,
        fitnessLevel: formData.fitnessLevel as any,
        dietaryRestrictions: formData.dietaryRestrictions,
        medicalConditions: formData.medicalConditions,
      })
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => {
              setIsEditing(true)
              setFormData({
                age: user.age,
                height: user.height,
                weight: user.weight,
                gender: user.gender,
                fitnessLevel: user.fitnessLevel,
                dietaryRestrictions: user.dietaryRestrictions,
                medicalConditions: user.medicalConditions,
              })
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Picture */}
        <div className="md:col-span-3 flex items-center gap-6 bg-card rounded-lg border border-border p-6 mb-6">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{user.username}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="md:col-span-3 bg-card rounded-lg border border-border p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Personal Information</h3>

          {!isEditing ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Age</p>
                <p className="text-lg font-semibold text-foreground">{user.age} years old</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gender</p>
                <p className="text-lg font-semibold text-foreground capitalize">{user.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Height</p>
                <p className="text-lg font-semibold text-foreground">{user.height} cm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Weight</p>
                <p className="text-lg font-semibold text-foreground">{user.weight} kg</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Health & Fitness */}
        <div className="md:col-span-3 bg-card rounded-lg border border-border p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Health & Fitness</h3>

          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Fitness Level</p>
                <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium capitalize">
                  {user.fitnessLevel}
                </div>
              </div>

              {user.objectives.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Objectives</p>
                  <div className="flex flex-wrap gap-2">
                    {user.objectives.map((obj, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg font-medium capitalize"
                      >
                        {obj.type.replace('-', ' ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user.dietaryRestrictions.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Dietary Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {user.dietaryRestrictions.map((diet, idx) => (
                      <div key={idx} className="px-4 py-2 bg-accent/10 text-accent rounded-lg font-medium">
                        {diet}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user.medicalConditions.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Medical Notes</p>
                  <p className="text-foreground">{user.medicalConditions.join(', ')}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fitness Level</label>
                <select
                  value={formData.fitnessLevel}
                  onChange={e => setFormData({ ...formData, fitnessLevel: e.target.value as any })}
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Medical Conditions</label>
                <textarea
                  value={formData.medicalConditions.join(', ')}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      medicalConditions: e.target.value.split(',').map(m => m.trim()),
                    })
                  }
                  rows={3}
                  placeholder="Enter any medical conditions separated by commas..."
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
