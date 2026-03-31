'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Income, IncomeType } from '@/lib/types'
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
import { MoreHorizontal, Pencil, Trash2, ArrowUpCircle } from 'lucide-react'

interface IncomesTableProps {
  incomes: Income[]
  incomeTypes: IncomeType[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

function formatDate(dateString: string) {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const paymentMethodLabels: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  otro: 'Otro',
}

export function IncomesTable({ incomes }: IncomesTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    const supabase = createClient()

    await supabase.from('incomes').delete().eq('id', deleteId)

    setDeleteId(null)
    setDeleting(false)
    router.refresh()
  }

  if (incomes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ArrowUpCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-1">No hay ingresos registrados</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comienza registrando tu primer ingreso
        </p>
        <Button asChild>
          <Link href="/dashboard/ingresos/nuevo">Registrar Ingreso</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map((income) => (
              <TableRow key={income.id}>
                <TableCell className="font-medium">{formatDate(income.date)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {income.income_type?.name || 'Sin tipo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {paymentMethodLabels[income.payment_method] || income.payment_method}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {income.description || '-'}
                </TableCell>
                <TableCell className="text-right font-semibold text-chart-2">
                  +{formatCurrency(income.amount)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/ingresos/${income.id}/editar`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(income.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ingreso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El ingreso será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
