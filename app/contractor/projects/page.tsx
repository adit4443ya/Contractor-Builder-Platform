import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatCurrency, getTimeRemaining } from '@/lib/utils'
import { Search } from 'lucide-react'

export default async function BrowseProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get contractor data
  const { data: contractor } = await supabase
    .from('contractors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Get all open projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*, bids!inner(id, contractor_id)')
    .eq('status', 'open')
    .gte('bidding_deadline', new Date().toISOString())
    .order('created_at', { ascending: false })

  // Get contractor's existing bids
  const { data: contractorBids } = await supabase
    .from('bids')
    .select('project_id')
    .eq('contractor_id', contractor?.id)

  const bidProjectIds = new Set(contractorBids?.map(b => b.project_id) || [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Projects</h1>
        <p className="text-gray-600 mt-1">Find and bid on construction projects</p>
      </div>

      {/* Projects List */}
      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No projects available</h3>
              <p className="text-gray-500">
                Check back later for new construction projects in your area
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project: any) => {
            const alreadyBid = bidProjectIds.has(project.id)

            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{project.title}</h3>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {getTimeRemaining(project.bidding_deadline)}
                        </Badge>
                        {alreadyBid && (
                          <Badge variant="default" className="bg-green-600">
                            Already Bid
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <p className="font-medium">{project.city}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <p className="font-medium capitalize">{project.project_type}</p>
                        </div>
                        {project.budget_min && project.budget_max && (
                          <div>
                            <span className="text-gray-500">Budget:</span>
                            <p className="font-medium">
                              {formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Posted:</span>
                          <p className="font-medium">{formatDate(project.created_at)}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.required_specializations.map((spec: string) => (
                          <Badge key={spec} variant="outline">{spec}</Badge>
                        ))}
                      </div>
                    </div>

                    <Link href={`/contractor/projects/${project.id}`}>
                      <Button className="ml-6">
                        {alreadyBid ? 'View Bid' : 'View & Bid'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
