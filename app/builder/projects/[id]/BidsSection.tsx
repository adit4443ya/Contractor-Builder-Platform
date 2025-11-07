'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Star, CheckCircle, XCircle } from 'lucide-react'

interface Bid {
  id: string
  quoted_price: number
  estimated_duration: number
  proposal: string
  status: string
  created_at: string
  contractors: {
    id: string
    rating: number
    total_projects: number
    experience_years: number
    profiles: {
      full_name: string
      company_name: string
    }
  }
}

interface BidsSectionProps {
  bids: Bid[]
  projectId: string
  projectStatus: string
}

export default function BidsSection({ bids, projectId, projectStatus }: BidsSectionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAcceptBid = async (bidId: string) => {
    if (!confirm('Are you sure you want to accept this bid? This will close bidding and award the project to this contractor.')) {
      return
    }

    setLoading(bidId)
    setError(null)

    try {
      const supabase = createClient()

      // Update bid status to accepted
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId)

      if (bidError) throw bidError

      // Reject all other bids
      const { error: rejectError } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('project_id', projectId)
        .neq('id', bidId)
        .eq('status', 'pending')

      if (rejectError) throw rejectError

      // Update project status to awarded
      const { error: projectError } = await supabase
        .from('projects')
        .update({ status: 'awarded' })
        .eq('id', projectId)

      if (projectError) throw projectError

      router.refresh()
    } catch (error: any) {
      console.error('Error accepting bid:', error)
      setError(error.message || 'Failed to accept bid')
    } finally {
      setLoading(null)
    }
  }

  const handleRejectBid = async (bidId: string) => {
    if (!confirm('Are you sure you want to reject this bid?')) {
      return
    }

    setLoading(bidId)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('id', bidId)

      if (error) throw error

      router.refresh()
    } catch (error: any) {
      console.error('Error rejecting bid:', error)
      setError(error.message || 'Failed to reject bid')
    } finally {
      setLoading(null)
    }
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No bids received yet</p>
        <p className="text-sm text-gray-400 mt-2">Contractors will be able to submit bids until the deadline</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {bids.map((bid) => (
        <Card key={bid.id} className="border-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{bid.contractors.profiles.company_name}</h3>
                <p className="text-sm text-gray-600">{bid.contractors.profiles.full_name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{bid.contractors.rating.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <span>{bid.contractors.experience_years || 0} years experience</span>
                  <span>•</span>
                  <span>{bid.contractors.total_projects} projects</span>
                </div>
              </div>

              <Badge
                variant={
                  bid.status === 'accepted'
                    ? 'default'
                    : bid.status === 'rejected'
                    ? 'destructive'
                    : 'outline'
                }
              >
                {bid.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Quoted Price</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(bid.quoted_price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Duration</p>
                <p className="text-2xl font-bold">{bid.estimated_duration} days</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Proposal</p>
              <p className="text-gray-600 whitespace-pre-line">{bid.proposal}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-500">Submitted {formatDate(bid.created_at)}</p>

              {projectStatus === 'open' && bid.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAcceptBid(bid.id)}
                    disabled={loading === bid.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {loading === bid.id ? 'Accepting...' : 'Accept Bid'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectBid(bid.id)}
                    disabled={loading === bid.id}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
