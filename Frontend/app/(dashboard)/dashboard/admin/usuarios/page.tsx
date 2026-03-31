import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield } from 'lucide-react'
import { UsersTable } from '@/components/admin/users-table'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch all users
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra los usuarios del sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Usuarios
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Usuarios registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Administradores
            </CardTitle>
            <Shield className="h-5 w-5 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter((u) => u.role === 'admin').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Usuarios con rol admin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>Lista de todos los usuarios registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable users={users || []} currentUserId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
