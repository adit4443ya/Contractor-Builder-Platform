import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function ContractorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is a contractor
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'contractor') {
    redirect('/builder/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userType="contractor" />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  )
}
