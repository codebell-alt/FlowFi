import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ArrowDownCircle } from 'lucide-react'
import { ExpensesTable } from '@/components/expenses/expenses-table'

export default async function ExpensesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, category:expense_categories(*)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const { data: categories } = await supabase
    .from('expense_categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order('name')

  // Calculate totals
  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
  const thisMonthExpenses = expenses?.filter((exp) => {
    const expDate = new Date(exp.date)
    const now = new Date()
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
  }) || []
  const monthlyTotal = thisMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gastos</h1>
          <p className="text-muted-foreground">
            Gestiona los gastos de tu negocio
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/gastos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Gasto
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Histórico
            </CardTitle>
            <ArrowDownCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses?.length || 0} transacciones registradas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Este Mes
            </CardTitle>
            <ArrowDownCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monthlyTotal)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {thisMonthExpenses.length} transacciones este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Gastos</CardTitle>
          <CardDescription>Lista completa de todos tus gastos</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpensesTable expenses={expenses || []} categories={categories || []} />
        </CardContent>
      </Card>
    </div>
  )
}
