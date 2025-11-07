import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { FileText } from 'lucide-react'

export default async function MyBidsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get contractor data
  const { data: contractor } = await supabase
    .from('contractors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Get all bids with project details
  const { data: bids } = await supabase
    .from('bids')
    .select('*, projects(*)')
    .eq('contractor_id', contractor?.id)
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default'
      case 'rejected':
        return 'destructive'
      case 'pending':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
        <p className="text-gray-600 mt-1">Track all your submitted bids</p>
      </div>

      {/* Bids List */}
      {!bids || bids.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bids yet</h3>
              <p className="text-gray-500 mb-6">
                Start bidding on projects to grow your business
              </p>
              <Link href="/contractor/projects">
                <Button size="lg">Browse Projects</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bids.map((bid: any) => (
            <Card key={bid.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{bid.projects.title}</h3>
                      <Badge variant={getStatusColor(bid.status)}>
                        {bid.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Your Bid:</span>
                        <p className="font-semibold text-lg">{formatCurrency(bid.quoted_price)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Duration:</span>
                        <p className="font-medium">{bid.estimated_duration} days</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Location:</span>
                        <p className="font-medium">{bid.projects.city}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Submitted:</span>
                        <p className="font-medium">{formatDate(bid.created_at)}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Your Proposal:</p>
                      <p className="text-gray-700 line-clamp-2">{bid.proposal}</p>
                    </div>

                    {bid.status === 'accepted' && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">
                        Congratulations! Your bid was accepted. The builder will contact you soon.
                      </div>
                    )}
                  </div>

                  <Link href={`/contractor/projects/${bid.projects.id}`}>
                    <Button variant="outline" className="ml-6">View Project</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
