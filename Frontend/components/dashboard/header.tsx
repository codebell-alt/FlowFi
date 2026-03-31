'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User as UserIcon, Settings } from 'lucide-react'

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <div className="flex items-center gap-4 lg:hidden">
        {/* Space for mobile menu button */}
        <div className="w-10" />
      </div>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:inline-block max-w-32 truncate">
              {profile?.full_name || 'Usuario'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/dashboard/perfil" className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              Mi Perfil
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/dashboard/configuracion" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
