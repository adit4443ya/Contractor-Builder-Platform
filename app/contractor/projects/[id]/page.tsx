import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency, getTimeRemaining } from '@/lib/utils'
import { ArrowLeft, MapPin, FileText } from 'lucide-react'
import Link from 'next/link'
import BidForm from './BidForm'

export default async function ContractorProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get contractor data
  const { data: contractor } = await supabase
    .from('contractors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get project details
  const { data: project, error } = await supabase
    .from('projects')
    .select('*, profiles(full_name, company_name)')
    .eq('id', params.id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Check if contractor already bid
  const { data: existingBid } = await supabase
    .from('bids')
    .select('*')
    .eq('project_id', params.id)
    .eq('contractor_id', contractor?.id)
    .single()

  const canBid = project.status === 'open' && !existingBid && new Date(project.bidding_deadline) > new Date()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/contractor/projects">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-gray-600">Posted by {project.profiles.company_name} on {formatDate(project.created_at)}</p>
          </div>

          {project.status === 'open' && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Bidding deadline</p>
              <p className="text-lg font-semibold text-orange-600">
                {getTimeRemaining(project.bidding_deadline)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Project Type</p>
                  <p className="font-medium capitalize">{project.project_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Required Specializations</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {project.required_specializations.map((spec: string) => (
                      <Badge key={spec} variant="outline">{spec}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {project.start_date && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Expected Start Date</p>
                    <p className="font-medium">{formatDate(project.start_date)}</p>
                  </div>
                  {project.duration_days && (
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium">{project.duration_days} days</p>
                    </div>
                  )}
                </div>
              )}

              {project.document_url && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tender Document</p>
                  <a
                    href={project.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Document
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bid Form or Existing Bid */}
          <Card>
            <CardHeader>
              <CardTitle>
                {existingBid ? 'Your Bid' : canBid ? 'Submit Your Bid' : 'Bidding Closed'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {existingBid ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Your Quoted Price</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(existingBid.quoted_price)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estimated Duration</p>
                        <p className="text-2xl font-bold">{existingBid.estimated_duration} days</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Your Proposal</p>
                      <p className="text-gray-600 whitespace-pre-line">{existingBid.proposal}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Badge variant={
                      existingBid.status === 'accepted' ? 'default' :
                      existingBid.status === 'rejected' ? 'destructive' : 'outline'
                    }>
                      {existingBid.status}
                    </Badge>
                    <p className="text-sm text-gray-500">Submitted {formatDate(existingBid.created_at)}</p>
                  </div>
                </div>
              ) : canBid ? (
                <BidForm projectId={params.id} contractorId={contractor?.id} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {project.status !== 'open'
                      ? 'This project is no longer accepting bids'
                      : 'The bidding deadline has passed'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">{project.city}</p>
                  <p className="text-sm text-gray-600">{project.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Card */}
          {(project.budget_min || project.budget_max) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Range</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {project.budget_min && project.budget_max
                    ? `${formatCurrency(project.budget_min)} - ${formatCurrency(project.budget_max)}`
                    : project.budget_min
                    ? `From ${formatCurrency(project.budget_min)}`
                    : `Up to ${formatCurrency(project.budget_max)}`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
