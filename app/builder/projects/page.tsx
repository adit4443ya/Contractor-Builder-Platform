import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, getTimeRemaining } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'

export default async function BuilderProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get all projects with bid counts
  const { data: projects } = await supabase
    .from('projects')
    .select('*, bids(count)')
    .eq('builder_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'default'
      case 'awarded':
        return 'secondary'
      case 'completed':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">Manage all your construction projects</p>
        </div>
        <Link href="/builder/projects/new">
          <Button size="lg">
            <PlusCircle className="w-5 h-5 mr-2" />
            Post New Project
          </Button>
        </Link>
      </div>

      {/* Projects List */}
      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">
                Start by posting your first construction project and receive bids from verified contractors
              </p>
              <Link href="/builder/projects/new">
                <Button size="lg">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Post Your First Project
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project: any) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{project.title}</h3>
                      <Badge variant={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      {project.status === 'open' && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {getTimeRemaining(project.bidding_deadline)}
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
                      <div>
                        <span className="text-gray-500">Bids Received:</span>
                        <p className="font-medium">{project.bids[0]?.count || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Posted:</span>
                        <p className="font-medium">{formatDate(project.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col gap-2">
                    <Link href={`/builder/projects/${project.id}`}>
                      <Button>View Details</Button>
                    </Link>
                    {project.bids[0]?.count > 0 && (
                      <Link href={`/builder/projects/${project.id}#bids`}>
                        <Button variant="outline">
                          View {project.bids[0].count} Bid{project.bids[0].count !== 1 ? 's' : ''}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
