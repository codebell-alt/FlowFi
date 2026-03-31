'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Shield, User, Users } from 'lucide-react'

interface UsersTableProps {
  users: Profile[]
  currentUserId: string
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const router = useRouter()
  const [changingRole, setChangingRole] = useState<{ id: string; newRole: 'admin' | 'user' } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChangeRole = async () => {
    if (!changingRole) return

    setLoading(true)
    const supabase = createClient()

    await supabase
      .from('profiles')
      .update({ role: changingRole.newRole })
      .eq('id', changingRole.id)

    setChangingRole(null)
    setLoading(false)
    router.refresh()
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-1">No hay usuarios</h3>
        <p className="text-sm text-muted-foreground">
          Los usuarios aparecerán aquí cuando se registren
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Negocio</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.business_name || '-'}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? (
                      <>
                        <Shield className="mr-1 h-3 w-3" />
                        Admin
                      </>
                    ) : (
                      <>
                        <User className="mr-1 h-3 w-3" />
                        Usuario
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  {user.id !== currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.role === 'user' ? (
                          <DropdownMenuItem
                            onClick={() => setChangingRole({ id: user.id, newRole: 'admin' })}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Hacer Administrador
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => setChangingRole({ id: user.id, newRole: 'user' })}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Quitar Admin
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!changingRole} onOpenChange={() => setChangingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {changingRole?.newRole === 'admin' ? '¿Hacer administrador?' : '¿Quitar rol de administrador?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {changingRole?.newRole === 'admin'
                ? 'Este usuario tendrá acceso a la gestión de usuarios y configuración del sistema.'
                : 'Este usuario perderá acceso a la gestión de usuarios y configuración del sistema.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangeRole} disabled={loading}>
              {loading ? 'Cambiando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
