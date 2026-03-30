'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Zap,
  Apple,
  TrendingUp,
  MessageSquare,
  User,
  LogOut,
  Dumbbell,
  Utensils,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface DashboardSidebarProps {
  isOpen: boolean
}

export default function DashboardSidebar({ isOpen }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Zap, label: 'Training', href: '/dashboard/training' },
    { icon: Apple, label: 'Nutrition', href: '/dashboard/nutrition' },
    { icon: Dumbbell, label: 'Training Program', href: '/dashboard/programme-sport' },
    { icon: Utensils, label: 'Nutrition Program', href: '/dashboard/programme-nutrition' },
    { icon: TrendingUp, label: 'Progress', href: '/dashboard/progress' },
    { icon: MessageSquare, label: 'AI Coach', href: '/dashboard/coach' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  return (
    <aside
      className={`bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-full overflow-y-auto transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 text-xl font-bold">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            💪
          </div>
          {isOpen && <span>FitCoach</span>}
        </Link>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                }`}
                title={!isOpen ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/20 transition ${
            !isOpen && 'justify-center'
          }`}
          title={!isOpen ? 'Logout' : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
