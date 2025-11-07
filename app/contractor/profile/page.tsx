import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Star } from 'lucide-react'

export default async function ContractorProfilePage() {
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View and manage your contractor profile</p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">{profile?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="font-medium">{profile?.company_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{profile?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium">{formatDate(profile?.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold">{contractor?.rating.toFixed(1) || '0.0'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold">{contractor?.total_projects || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="font-medium">{contractor?.experience_years || 'Not provided'} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Team Size</p>
                <p className="font-medium">{contractor?.team_size || 'Not provided'} workers</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Specializations</p>
              {contractor?.specializations && contractor.specializations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {contractor.specializations.map((spec: string) => (
                    <Badge key={spec} variant="outline">{spec}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No specializations added yet</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Service Locations</p>
              {contractor?.service_locations && contractor.service_locations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {contractor.service_locations.map((loc: string) => (
                    <Badge key={loc} variant="outline">{loc}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No service locations added yet</p>
              )}
            </div>

            {contractor?.bio && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Bio</p>
                <p className="text-gray-700">{contractor.bio}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-2">Verification Status</p>
              <Badge variant={contractor?.verification_status === 'verified' ? 'default' : 'outline'}>
                {contractor?.verification_status || 'pending'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
