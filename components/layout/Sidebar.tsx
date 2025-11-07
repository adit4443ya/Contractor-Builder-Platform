'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FolderOpen, PlusCircle, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  userType: 'builder' | 'contractor'
}

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const builderLinks = [
    { href: '/builder/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/builder/projects', label: 'My Projects', icon: FolderOpen },
    { href: '/builder/projects/new', label: 'Post Project', icon: PlusCircle },
    { href: '/builder/profile', label: 'Profile', icon: User },
  ]

  const contractorLinks = [
    { href: '/contractor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/contractor/projects', label: 'Browse Projects', icon: FolderOpen },
    { href: '/contractor/bids', label: 'My Bids', icon: FolderOpen },
    { href: '/contractor/profile', label: 'Profile', icon: User },
  ]

  const links = userType === 'builder' ? builderLinks : contractorLinks

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary">BuildConnect</h1>
        </Link>
        <p className="text-sm text-gray-500 capitalize">{userType} Portal</p>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')

          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <Button
        variant="ghost"
        className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5 mr-3" />
        Logout
      </Button>
    </div>
  )
}
