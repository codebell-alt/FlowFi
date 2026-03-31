'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ExpenseCategory, IncomeType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Trash2, ArrowDownCircle, ArrowUpCircle, Loader2 } from 'lucide-react'

interface CategoriesManagerProps {
  expenseCategories: ExpenseCategory[]
  incomeTypes: IncomeType[]
  userId: string
}

export function CategoriesManager({ expenseCategories, incomeTypes, userId }: CategoriesManagerProps) {
  const router = useRouter()
  const [newExpenseCategory, setNewExpenseCategory] = useState('')
  const [newIncomeType, setNewIncomeType] = useState('')
  const [addingExpense, setAddingExpense] = useState(false)
  const [addingIncome, setAddingIncome] = useState(false)
  const [deleteItem, setDeleteItem] = useState<{ type: 'expense' | 'income'; id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleAddExpenseCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExpenseCategory.trim()) return

    setAddingExpense(true)
    const supabase = createClient()

    await supabase.from('expense_categories').insert({
      name: newExpenseCategory.trim(),
      user_id: userId,
      is_default: false,
    })

    setNewExpenseCategory('')
    setAddingExpense(false)
    router.refresh()
  }

  const handleAddIncomeType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newIncomeType.trim()) return

    setAddingIncome(true)
    const supabase = createClient()

    await supabase.from('income_types').insert({
      name: newIncomeType.trim(),
      user_id: userId,
      is_default: false,
    })

    setNewIncomeType('')
    setAddingIncome(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteItem) return

    setDeleting(true)
    const supabase = createClient()

    if (deleteItem.type === 'expense') {
      await supabase.from('expense_categories').delete().eq('id', deleteItem.id)
    } else {
      await supabase.from('income_types').delete().eq('id', deleteItem.id)
    }

    setDeleteItem(null)
    setDeleting(false)
    router.refresh()
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <ArrowDownCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle>Categorías de Gastos</CardTitle>
                <CardDescription>Categorías personalizadas para tus gastos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddExpenseCategory} className="flex gap-2">
              <Input
                placeholder="Nueva categoría..."
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
                disabled={addingExpense}
              />
              <Button type="submit" size="icon" disabled={addingExpense || !newExpenseCategory.trim()}>
                {addingExpense ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </form>

            {expenseCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tienes categorías personalizadas
              </p>
            ) : (
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <Badge variant="secondary">{category.name}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteItem({ type: 'expense', id: category.id, name: category.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Types */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                <ArrowUpCircle className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <CardTitle>Tipos de Ingreso</CardTitle>
                <CardDescription>Tipos personalizados para tus ingresos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddIncomeType} className="flex gap-2">
              <Input
                placeholder="Nuevo tipo..."
                value={newIncomeType}
                onChange={(e) => setNewIncomeType(e.target.value)}
                disabled={addingIncome}
              />
              <Button type="submit" size="icon" disabled={addingIncome || !newIncomeType.trim()}>
                {addingIncome ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </form>

            {incomeTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tienes tipos de ingreso personalizados
              </p>
            ) : (
              <div className="space-y-2">
                {incomeTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <Badge variant="secondary">{type.name}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteItem({ type: 'income', id: type.id, name: type.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {deleteItem?.type === 'expense' ? 'categoría' : 'tipo'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{deleteItem?.name}&quot;. Las transacciones asociadas mantendrán su registro pero sin categoría asignada.
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
