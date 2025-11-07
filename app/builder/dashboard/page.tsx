import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatCurrency, getTimeRemaining } from '@/lib/utils'
import { PlusCircle, FolderOpen, MessageSquare, CheckCircle } from 'lucide-react'

export default async function BuilderDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get projects stats
  const { data: projects } = await supabase
    .from('projects')
    .select('*, bids(count)')
    .eq('builder_id', user.id)
    .order('created_at', { ascending: false })

  const activeProjects = projects?.filter(p => p.status === 'open') || []
  const completedProjects = projects?.filter(p => p.status === 'completed') || []

  // Get total bids count
  const totalBids = projects?.reduce((sum, p: any) => sum + (p.bids[0]?.count || 0), 0) || 0

  // Get recent projects (last 5)
  const recentProjects = projects?.slice(0, 5) || []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.full_name}!</h1>
        <p className="text-gray-600 mt-1">Here&apos;s an overview of your projects</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
            <FolderOpen className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeProjects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bids</CardTitle>
            <MessageSquare className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBids}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedProjects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">All Projects</CardTitle>
            <FolderOpen className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projects?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link href="/builder/projects/new">
            <Button size="lg">
              <PlusCircle className="w-5 h-5 mr-2" />
              Post New Project
            </Button>
          </Link>
          <Link href="/builder/projects">
            <Button size="lg" variant="outline">
              <FolderOpen className="w-5 h-5 mr-2" />
              View All Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Link href="/builder/projects">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">You haven&apos;t posted any projects yet</p>
              <Link href="/builder/projects/new">
                <Button>Post Your First Project</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentProjects.map((project: any) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>{project.city}</span>
                        <span>•</span>
                        <span>{project.bids[0]?.count || 0} bids</span>
                        <span>•</span>
                        <span>Posted {formatDate(project.created_at)}</span>
                        {project.status === 'open' && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600 font-medium">
                              {getTimeRemaining(project.bidding_deadline)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Link href={`/builder/projects/${project.id}`}>
                      <Button>View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
