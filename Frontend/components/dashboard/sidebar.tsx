'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import {
  TrendingUp,
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface DashboardSidebarProps {
  user: User
  profile: Profile | null
  displayName?: string
  businessName?: string
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Ingresos', href: '/dashboard/ingresos', icon: ArrowUpCircle },
  { name: 'Gastos', href: '/dashboard/gastos', icon: ArrowDownCircle },
  { name: 'Control de Caja', href: '/dashboard/caja', icon: Wallet },
  { name: 'Reportes', href: '/dashboard/reportes', icon: BarChart3 },
]

const adminNavigation = [
  { name: 'Usuarios', href: '/dashboard/admin/usuarios', icon: Users },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

export function DashboardSidebar({ user, profile, displayName, businessName }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = profile?.role === 'admin'
  
  const userEmail = profile?.email || user?.email

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <TrendingUp className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FlowFi</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setMobileOpen(false)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Business name */}
        {profile?.business_name && (
          <div className="border-b border-sidebar-border px-6 py-4">
            <p className="text-sm text-sidebar-foreground/70">Negocio</p>
            <p className="font-medium truncate">{profile.business_name}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Admin section */}
          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-sidebar-border">
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Administración
              </p>
              <div className="space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User info */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground flex-shrink-0">
              {displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 truncate min-w-0">
              <p className="text-sm font-semibold truncate text-sidebar-foreground">
                {displayName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {userEmail}
              </p>
            </div>
          </div>
          {businessName && (
            <div className="bg-sidebar-accent/40 rounded px-3 py-2">
              <p className="text-xs font-medium text-sidebar-foreground/70 mb-1">Negocio</p>
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {businessName}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
