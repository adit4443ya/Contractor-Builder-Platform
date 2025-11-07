'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface BidFormProps {
  projectId: string
  contractorId: string
}

export default function BidForm({ projectId, contractorId }: BidFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    quotedPrice: '',
    estimatedDuration: '',
    proposal: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.quotedPrice || parseInt(formData.quotedPrice) <= 0) {
      newErrors.quotedPrice = 'Price must be positive'
    }
    if (!formData.estimatedDuration || parseInt(formData.estimatedDuration) <= 0) {
      newErrors.estimatedDuration = 'Duration must be positive'
    }
    if (formData.proposal.length < 100) {
      newErrors.proposal = 'Proposal must be at least 100 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const bidData = {
        project_id: projectId,
        contractor_id: contractorId,
        quoted_price: parseInt(formData.quotedPrice),
        estimated_duration: parseInt(formData.estimatedDuration),
        proposal: formData.proposal,
        status: 'pending',
      }

      const { error } = await supabase
        .from('bids')
        .insert(bidData)

      if (error) throw error

      router.refresh()
      alert('Bid submitted successfully!')
    } catch (error: any) {
      console.error('Error submitting bid:', error)
      setErrors({ submit: error.message || 'Failed to submit bid' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quotedPrice">Your Quoted Price (₹) *</Label>
          <Input
            id="quotedPrice"
            type="number"
            value={formData.quotedPrice}
            onChange={(e) => setFormData({ ...formData, quotedPrice: e.target.value })}
            placeholder="1500000"
          />
          {errors.quotedPrice && <p className="text-sm text-red-500">{errors.quotedPrice}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedDuration">Estimated Duration (Days) *</Label>
          <Input
            id="estimatedDuration"
            type="number"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
            placeholder="60"
          />
          {errors.estimatedDuration && <p className="text-sm text-red-500">{errors.estimatedDuration}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proposal">Your Proposal *</Label>
        <Textarea
          id="proposal"
          value={formData.proposal}
          onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
          placeholder="Explain your approach, experience, and why you're the best fit for this project..."
          rows={6}
        />
        <p className="text-sm text-gray-500">{formData.proposal.length} / 100 minimum characters</p>
        {errors.proposal && <p className="text-sm text-red-500">{errors.proposal}</p>}
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? 'Submitting Bid...' : 'Submit Bid'}
      </Button>
    </form>
  )
}
