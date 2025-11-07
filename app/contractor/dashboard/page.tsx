import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatCurrency, getTimeRemaining } from '@/lib/utils'
import { Search, FileText, Star, TrendingUp } from 'lucide-react'

export default async function ContractorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get contractor data
  const { data: contractor } = await supabase
    .from('contractors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get bids stats
  const { data: bids } = await supabase
    .from('bids')
    .select('*, projects(*)')
    .eq('contractor_id', contractor?.id)

  const pendingBids = bids?.filter(b => b.status === 'pending') || []
  const acceptedBids = bids?.filter(b => b.status === 'accepted') || []

  // Get recommended projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'open')
    .gte('bidding_deadline', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.full_name}!</h1>
        <p className="text-gray-600 mt-1">Find new projects and manage your bids</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bids</CardTitle>
            <FileText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bids?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <TrendingUp className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingBids.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Won Projects</CardTitle>
            <Star className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{acceptedBids.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rating</CardTitle>
            <Star className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contractor?.rating.toFixed(1) || '0.0'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link href="/contractor/projects">
            <Button size="lg">
              <Search className="w-5 h-5 mr-2" />
              Browse Projects
            </Button>
          </Link>
          <Link href="/contractor/bids">
            <Button size="lg" variant="outline">
              <FileText className="w-5 h-5 mr-2" />
              View My Bids
            </Button>
          </Link>
        </div>
      </div>

      {/* New Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">New Projects For You</h2>
          <Link href="/contractor/projects">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>

        {!projects || projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No new projects available at the moment</p>
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
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {getTimeRemaining(project.bidding_deadline)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>{project.city}</span>
                        {project.budget_min && project.budget_max && (
                          <>
                            <span>•</span>
                            <span>{formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>Posted {formatDate(project.created_at)}</span>
                      </div>
                    </div>
                    <Link href={`/contractor/projects/${project.id}`}>
                      <Button>View & Bid</Button>
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
