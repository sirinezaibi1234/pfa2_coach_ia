'use client'

import { useAuth } from '@/lib/auth-context'
import { Menu, X } from 'lucide-react'

interface DashboardHeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function DashboardHeader({ sidebarOpen, setSidebarOpen }: DashboardHeaderProps) {
  const { user } = useAuth()

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-muted rounded-lg transition text-foreground"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      </div>

      {/* User Info */}
      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-foreground">{user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </header>
  )
}
