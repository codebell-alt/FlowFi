import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { CashFlowChart } from '@/components/dashboard/cash-flow-chart'
import { ExpensesByCategoryChart } from '@/components/dashboard/expenses-by-category-chart'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get current month date range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  // Fetch incomes for current month
  const { data: incomes } = await supabase
    .from('incomes')
    .select('*, income_type:income_types(*)')
    .eq('user_id', user.id)
    .gte('date', startOfMonth)
    .lte('date', endOfMonth)
    .order('date', { ascending: false })

  // Fetch expenses for current month
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, category:expense_categories(*)')
    .eq('user_id', user.id)
    .gte('date', startOfMonth)
    .lte('date', endOfMonth)
    .order('date', { ascending: false })

  // Calculate totals
  const totalIncome = incomes?.reduce((sum, inc) => sum + Number(inc.amount), 0) || 0
  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
  const balance = totalIncome - totalExpenses

  // Group expenses by category
  const expensesByCategory = expenses?.reduce((acc, exp) => {
    const categoryName = exp.category?.name || 'Sin categoría'
    acc[categoryName] = (acc[categoryName] || 0) + Number(exp.amount)
    return acc
  }, {} as Record<string, number>) || {}

  const categoryData = Object.entries(expensesByCategory).map(([name, total]) => ({
    name,
    total,
  }))

  // Generate daily flow data for chart
  const dailyFlow: Record<string, { income: number; expenses: number }> = {}
  
  incomes?.forEach((inc) => {
    if (!dailyFlow[inc.date]) {
      dailyFlow[inc.date] = { income: 0, expenses: 0 }
    }
    dailyFlow[inc.date].income += Number(inc.amount)
  })
  
  expenses?.forEach((exp) => {
    if (!dailyFlow[exp.date]) {
      dailyFlow[exp.date] = { income: 0, expenses: 0 }
    }
    dailyFlow[exp.date].expenses += Number(exp.amount)
  })

  const cashFlowData = Object.entries(dailyFlow)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      income: values.income,
      expenses: values.expenses,
    }))

  // Recent transactions (last 5)
  const recentIncomes = incomes?.slice(0, 5) || []
  const recentExpenses = expenses?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen financiero del mes actual
        </p>
      </div>

      <StatsCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
        incomeCount={incomes?.length || 0}
        expenseCount={expenses?.length || 0}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CashFlowChart data={cashFlowData} />
        <ExpensesByCategoryChart data={categoryData} />
      </div>

      <RecentTransactions
        incomes={recentIncomes}
        expenses={recentExpenses}
      />
    </div>
  )
}
