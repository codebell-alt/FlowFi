import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ArrowUpCircle } from 'lucide-react'
import { IncomesTable } from '@/components/incomes/incomes-table'

export default async function IncomesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: incomes } = await supabase
    .from('incomes')
    .select('*, income_type:income_types(*)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const { data: incomeTypes } = await supabase
    .from('income_types')
    .select('*')
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order('name')

  // Calculate totals
  const totalIncome = incomes?.reduce((sum, inc) => sum + Number(inc.amount), 0) || 0
  const thisMonthIncomes = incomes?.filter((inc) => {
    const incDate = new Date(inc.date)
    const now = new Date()
    return incDate.getMonth() === now.getMonth() && incDate.getFullYear() === now.getFullYear()
  }) || []
  const monthlyTotal = thisMonthIncomes.reduce((sum, inc) => sum + Number(inc.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ingresos</h1>
          <p className="text-muted-foreground">
            Gestiona los ingresos de tu negocio
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/ingresos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ingreso
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
            <ArrowUpCircle className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {incomes?.length || 0} transacciones registradas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Este Mes
            </CardTitle>
            <ArrowUpCircle className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monthlyTotal)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {thisMonthIncomes.length} transacciones este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ingresos</CardTitle>
          <CardDescription>Lista completa de todos tus ingresos</CardDescription>
        </CardHeader>
        <CardContent>
          <IncomesTable incomes={incomes || []} incomeTypes={incomeTypes || []} />
        </CardContent>
      </Card>
    </div>
  )
}
