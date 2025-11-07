'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { CITIES, SPECIALIZATIONS } from '@/types'

export default function PostNewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    title: '',
    projectType: '',
    description: '',
    city: '',
    location: '',
    requiredSpecializations: [] as string[],
    budgetMin: '',
    budgetMax: '',
    startDate: '',
    durationDays: '',
    biddingDeadline: '',
    documentUrl: '',
  })

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSpecializations: prev.requiredSpecializations.includes(spec)
        ? prev.requiredSpecializations.filter(s => s !== spec)
        : [...prev.requiredSpecializations, spec]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    // Validation
    const newErrors: Record<string, string> = {}
    if (formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters'
    if (!formData.projectType) newErrors.projectType = 'Project type is required'
    if (formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters'
    if (!formData.city) newErrors.city = 'City is required'
    if (formData.location.length < 10) newErrors.location = 'Detailed location is required'
    if (formData.requiredSpecializations.length === 0) newErrors.requiredSpecializations = 'Select at least one specialization'
    if (!formData.biddingDeadline) newErrors.biddingDeadline = 'Bidding deadline is required'

    if (formData.budgetMin && formData.budgetMax) {
      const min = parseInt(formData.budgetMin)
      const max = parseInt(formData.budgetMax)
      if (max <= min) newErrors.budgetMax = 'Max budget must be greater than min budget'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const projectData = {
        builder_id: user.id,
        title: formData.title,
        project_type: formData.projectType,
        description: formData.description,
        city: formData.city,
        location: formData.location,
        required_specializations: formData.requiredSpecializations,
        budget_min: formData.budgetMin ? parseInt(formData.budgetMin) : null,
        budget_max: formData.budgetMax ? parseInt(formData.budgetMax) : null,
        start_date: formData.startDate || null,
        duration_days: formData.durationDays ? parseInt(formData.durationDays) : null,
        bidding_deadline: formData.biddingDeadline,
        document_url: formData.documentUrl || null,
        status: 'open',
      }

      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single()

      if (error) throw error

      router.push(`/builder/projects/${data.id}`)
    } catch (error: any) {
      console.error('Error creating project:', error)
      setErrors({ submit: error.message || 'Failed to create project' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post New Project</h1>
        <p className="text-gray-600 mt-1">Fill in the details to post your construction project</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., 3 BHK Residential Building Construction"
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type *</Label>
                <Select value={formData.projectType} onValueChange={(value) => setFormData({ ...formData, projectType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="renovation">Renovation</SelectItem>
                  </SelectContent>
                </Select>
                {errors.projectType && <p className="text-sm text-red-500">{errors.projectType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed description of your project requirements..."
                  rows={5}
                />
                <p className="text-sm text-gray-500">{formData.description.length} / 50 minimum characters</p>
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Detailed Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Boring Road, Near Patna Railway Station"
                />
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Required Contractors *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIALIZATIONS.map((spec) => (
                    <Button
                      key={spec}
                      type="button"
                      variant={formData.requiredSpecializations.includes(spec) ? 'default' : 'outline'}
                      onClick={() => toggleSpecialization(spec)}
                      className="justify-start"
                    >
                      {spec}
                    </Button>
                  ))}
                </div>
                {errors.requiredSpecializations && <p className="text-sm text-red-500">{errors.requiredSpecializations}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">Min Budget (₹)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                    placeholder="1000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">Max Budget (₹)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                    placeholder="2000000"
                  />
                  {errors.budgetMax && <p className="text-sm text-red-500">{errors.budgetMax}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Expected Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duration (Days)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    placeholder="60"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="biddingDeadline">Bidding Deadline *</Label>
                <Input
                  id="biddingDeadline"
                  type="datetime-local"
                  value={formData.biddingDeadline}
                  onChange={(e) => setFormData({ ...formData, biddingDeadline: e.target.value })}
                />
                {errors.biddingDeadline && <p className="text-sm text-red-500">{errors.biddingDeadline}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentUrl">Tender Document URL (Optional)</Label>
                <Input
                  id="documentUrl"
                  type="url"
                  value={formData.documentUrl}
                  onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                />
                <p className="text-sm text-gray-500">You can upload the document to a file hosting service and paste the URL here</p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Creating Project...' : 'Post Project'}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
