import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency, getTimeRemaining } from '@/lib/utils'
import { ArrowLeft, MapPin, Calendar, Clock, FileText } from 'lucide-react'
import Link from 'next/link'
import BidsSection from './BidsSection'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get project details
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('builder_id', user.id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Get bids for this project
  const { data: bidsData } = await supabase
    .from('bids')
    .select(`
      *,
      contractors (
        *,
        profiles (full_name, company_name)
      )
    `)
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  const bids = bidsData || []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/builder/projects">
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
            <p className="text-gray-600">Posted on {formatDate(project.created_at)}</p>
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

          {/* Bids Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bids Received ({bids.length})</CardTitle>
                {bids.length > 0 && project.status === 'open' && (
                  <p className="text-sm text-gray-600">Review and accept the best bid</p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <BidsSection bids={bids} projectId={params.id} projectStatus={project.status} />
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

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bids</span>
                <span className="font-semibold">{bids.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Bids</span>
                <span className="font-semibold">
                  {bids.filter(b => b.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
