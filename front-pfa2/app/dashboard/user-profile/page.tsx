'use client'

import { useEffect, useState } from 'react'
import { profileService, ObjectivePayload } from '@/services/profile.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Pencil, Save, User, X, AlertCircle } from 'lucide-react'

type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
type Goal = 'lose_weight' | 'gain_muscle' | 'maintain_weight' | 'improve_endurance'

interface EditableProfile {
  age: number | null
  gender: 'male' | 'female' | 'other' | null
  height: number | null
  weight: number | null
  activity_level: ActivityLevel
  goal: Goal | null
  target_weight: number | null
  duration_months: number | null
  health_conditions: string[]
  allergies: string[]
}

const goalLabels: Record<Goal, string> = {
  'lose_weight': 'Weight Loss',
  'gain_muscle': 'Muscle Gain',
  'improve_endurance': 'Endurance',
  'maintain_weight': 'Maintenance',
}

const activityLevelDescriptions: Record<ActivityLevel, string> = {
  'sedentary': 'Little or no exercise',
  'lightly_active': 'Getting started with regular training',
  'moderately_active': 'Some experience and consistent routine',
  'very_active': 'Experienced athlete with high intensity training',
  'extra_active': 'Very intense exercise most days',
}

function buildFormData(profile: any, objective: any): EditableProfile {
  return {
    age: profile?.age ?? null,
    gender: profile?.gender ?? null,
    height: profile?.height ?? null,
    weight: profile?.weight ?? null,
    activity_level: profile?.activity_level ?? 'lightly_active',
    goal: objective?.goal ?? null,
    target_weight: objective?.target_weight ?? null,
    duration_months: objective?.duration_months ?? null,
    health_conditions: profile?.health_conditions ? (Array.isArray(profile.health_conditions) ? profile.health_conditions : profile.health_conditions.split(',').map((c: string) => c.trim())) : [],
    allergies: profile?.allergies ? (Array.isArray(profile.allergies) ? profile.allergies : profile.allergies.split(',').map((a: string) => a.trim())) : [],
  }
}

export default function UserProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<EditableProfile | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [newHealthCondition, setNewHealthCondition] = useState('')
  const [newAllergy, setNewAllergy] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [profileRes, objectiveRes] = await Promise.all([
        profileService.getProfile().catch(() => ({ profile: null })),
        profileService.getObjective().catch(() => ({ objective: null })),
      ])

      setProfile(profileRes?.profile)
      const built = buildFormData(profileRes?.profile, objectiveRes?.objective)
      setFormData(built)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData) return
    setIsSaving(true)
    setError(null)

    try {
      if (formData.target_weight !== null && !formData.goal) {
        setError('Please select a fitness goal before saving Goal Target.')
        return
      }

      // Save profile
      await profileService.saveProfile({
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        activity_level: formData.activity_level,
        health_conditions: formData.health_conditions,
        allergies: formData.allergies,
      })

      // Create or update objective
      if (formData.goal) {
        const objectivePayload: ObjectivePayload = {
          goal: formData.goal,
          target_weight: formData.target_weight,
          duration_months: formData.duration_months,
        }

        try {
          await profileService.updateObjective(objectivePayload)
        } catch {
          await profileService.createObjective(objectivePayload)
        }
      }

      setIsEditing(false)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = async () => {
    await loadData()
    setIsEditing(false)
    setNewHealthCondition('')
    setNewAllergy('')
  }

  const addHealthCondition = () => {
    if (!formData) return
    const value = newHealthCondition.trim()
    if (!value || formData.health_conditions.includes(value)) return
    setFormData({
      ...formData,
      health_conditions: [...formData.health_conditions, value],
    })
    setNewHealthCondition('')
  }

  const removeHealthCondition = (value: string) => {
    if (!formData) return
    setFormData({
      ...formData,
      health_conditions: formData.health_conditions.filter(item => item !== value),
    })
  }

  const addAllergy = () => {
    if (!formData) return
    const value = newAllergy.trim()
    if (!value || formData.allergies.includes(value)) return
    setFormData({
      ...formData,
      allergies: [...formData.allergies, value],
    })
    setNewAllergy('')
  }

  const removeAllergy = (value: string) => {
    if (!formData) return
    setFormData({
      ...formData,
      allergies: formData.allergies.filter(item => item !== value),
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      ) : !formData ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No profile data found. Please complete your profile.</p>
          <Button onClick={loadData} className="mt-4">
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your fitness profile and objectives</p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>Age, gender, height and weight</CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
          <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="text-2xl font-bold text-foreground">{formData.age || 'N/A'} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="text-2xl font-bold text-foreground capitalize">{formData.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="text-2xl font-bold text-foreground">{formData.height || 'N/A'} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="text-2xl font-bold text-foreground">{formData.weight || 'N/A'} kg</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={e => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: (value || null) as 'male' | 'female' | 'other' | null })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height || ''}
                    onChange={e => setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight || ''}
                    onChange={e => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Level</CardTitle>
            <CardDescription>Your typical exercise frequency</CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div>
                <Badge variant="secondary" className="text-base px-4 py-2 mb-2 capitalize">
                  {formData.activity_level.replace('_', ' ')}
                </Badge>
                <p className="text-muted-foreground text-sm">
                  {activityLevelDescriptions[formData.activity_level]}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select
                  value={formData.activity_level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, activity_level: value as ActivityLevel })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (Little or no exercise)</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                    <SelectItem value="extra_active">Extra Active (Very intense / twice daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fitness Goal</CardTitle>
            <CardDescription>Your primary objective</CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div>
                {formData.goal ? (
                  <>
                    <Badge variant="outline" className="mb-3">{goalLabels[formData.goal]}</Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Goal target: {formData.target_weight ?? 'Not set'}{formData.target_weight !== null ? ' kg' : ''}
                    </p>
                    {formData.duration_months && (
                      <p className="text-sm text-muted-foreground">Duration: {formData.duration_months} months</p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No goal set</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Select Goal</Label>
                  <Select
                    value={formData.goal || ''}
                    onValueChange={(value) => setFormData({ ...formData, goal: (value || null) as Goal | null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(goalLabels) as Goal[]).map(goal => (
                        <SelectItem key={goal} value={goal}>{goalLabels[goal]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Goal Target (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    value={formData.target_weight || ''}
                    onChange={e => setFormData({ ...formData, target_weight: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Used by Progress dashboard"
                  />
                  <p className="text-xs text-muted-foreground">
                    This value feeds the Goal Target card in Progress & Analytics.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_months || ''}
                    onChange={e => setFormData({ ...formData, duration_months: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Conditions</CardTitle>
            <CardDescription>Medical conditions that may affect your fitness plan</CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="flex flex-wrap gap-2">
                {formData.health_conditions && formData.health_conditions.length > 0 ? (
                  formData.health_conditions.map(item => (
                    <Badge key={item} variant="secondary">{item}</Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No health conditions recorded</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.health_conditions && formData.health_conditions.map(item => (
                    <Badge key={item} variant="secondary" className="gap-1 pr-1">
                      {item}
                      <button onClick={() => removeHealthCondition(item)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newHealthCondition}
                    onChange={e => setNewHealthCondition(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addHealthCondition()}
                    placeholder="Add health condition"
                  />
                  <Button variant="outline" onClick={addHealthCondition}>Add</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Allergies</CardTitle>
            <CardDescription>Food or other allergies to avoid</CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="flex flex-wrap gap-2">
                {formData.allergies && formData.allergies.length > 0 ? (
                  formData.allergies.map(item => (
                    <Badge key={item} variant="destructive">{item}</Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No allergies recorded</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.allergies && formData.allergies.map(item => (
                    <Badge key={item} variant="destructive" className="gap-1 pr-1">
                      {item}
                      <button onClick={() => removeAllergy(item)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newAllergy}
                    onChange={e => setNewAllergy(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addAllergy()}
                    placeholder="Add allergy"
                  />
                  <Button variant="outline" onClick={addAllergy}>Add</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Last updated on {formatDate(profile?.updated_at)} | Profile created on {formatDate(profile?.created_at)}
        </p>
      </div>
        </>
      )}
    </div>
  )
}
