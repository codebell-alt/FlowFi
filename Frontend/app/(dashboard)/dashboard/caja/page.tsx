import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, TrendingDown, Calendar, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { CashFlowReport } from '@/components/reports/cash-flow-report'
import { MonthlyComparison } from '@/components/reports/monthly-comparison'
import { DateRangeFilter } from '@/components/reports/date-range-filter'

interface CajaPageProps {
  searchParams: Promise<{ desde?: string; hasta?: string }>
}

export default async function CajaPage({ searchParams }: CajaPageProps) {
  const { desde, hasta } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Default date range: current month
  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  
  const startDate = desde || defaultStart
  const endDate = hasta || defaultEnd

  // Fetch incomes for date range
  const { data: incomes } = await supabase
    .from('incomes')
    .select('*, income_type:income_types(*)')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  // Fetch expenses for date range
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, category:expense_categories(*)')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  // Calculate totals
  const totalIncome = incomes?.reduce((sum, inc) => sum + Number(inc.amount), 0) || 0
  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
  const netCashFlow = totalIncome - totalExpenses

  // Group by payment method
  const incomeByMethod = incomes?.reduce((acc, inc) => {
    acc[inc.payment_method] = (acc[inc.payment_method] || 0) + Number(inc.amount)
    return acc
  }, {} as Record<string, number>) || {}

  // Group expenses by category
  const expensesByCategory = expenses?.reduce((acc, exp) => {
    const name = exp.category?.name || 'Sin categoría'
    acc[name] = (acc[name] || 0) + Number(exp.amount)
    return acc
  }, {} as Record<string, number>) || {}

  // Build daily cash flow
  const dailyFlow: Record<string, { income: number; expenses: number; balance: number }> = {}
  let runningBalance = 0

  // Create a sorted list of all dates
  const allDates = new Set<string>()
  incomes?.forEach((inc) => allDates.add(inc.date))
  expenses?.forEach((exp) => allDates.add(exp.date))
  const sortedDates = Array.from(allDates).sort()

  sortedDates.forEach((date) => {
    const dayIncome = incomes?.filter((inc) => inc.date === date).reduce((sum, inc) => sum + Number(inc.amount), 0) || 0
    const dayExpenses = expenses?.filter((exp) => exp.date === date).reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
    runningBalance += dayIncome - dayExpenses
    dailyFlow[date] = { income: dayIncome, expenses: dayExpenses, balance: runningBalance }
  })

  const cashFlowData = Object.entries(dailyFlow).map(([date, values]) => ({
    date,
    ...values,
  }))

  // Fetch previous period for comparison
  const periodDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
  const prevStart = new Date(new Date(startDate).getTime() - periodDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const prevEnd = new Date(new Date(startDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: prevIncomes } = await supabase
    .from('incomes')
    .select('amount')
    .eq('user_id', user.id)
    .gte('date', prevStart)
    .lte('date', prevEnd)

  const { data: prevExpenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', user.id)
    .gte('date', prevStart)
    .lte('date', prevEnd)

  const prevTotalIncome = prevIncomes?.reduce((sum, inc) => sum + Number(inc.amount), 0) || 0
  const prevTotalExpenses = prevExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0

  const incomeChange = prevTotalIncome > 0 ? ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100 : 0
  const expenseChange = prevTotalExpenses > 0 ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Control de Caja</h1>
          <p className="text-muted-foreground">
            Análisis detallado del flujo de efectivo
          </p>
        </div>
        <DateRangeFilter startDate={startDate} endDate={endDate} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ingresos
            </CardTitle>
            <ArrowUpCircle className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalIncome)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {incomeChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-chart-2" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={`text-xs ${incomeChange >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% vs periodo anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gastos
            </CardTitle>
            <ArrowDownCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalExpenses)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {expenseChange <= 0 ? (
                <TrendingDown className="h-3 w-3 text-chart-2" />
              ) : (
                <TrendingUp className="h-3 w-3 text-destructive" />
              )}
              <span className={`text-xs ${expenseChange <= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}% vs periodo anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Flujo Neto
            </CardTitle>
            <Wallet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(netCashFlow)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netCashFlow >= 0 ? 'Superávit' : 'Déficit'} en el periodo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transacciones
            </CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(incomes?.length || 0) + (expenses?.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {incomes?.length || 0} ingresos · {expenses?.length || 0} gastos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CashFlowReport data={cashFlowData} />
        <MonthlyComparison 
          incomeByMethod={incomeByMethod}
          expensesByCategory={expensesByCategory}
        />
      </div>
    </div>
  )
}
