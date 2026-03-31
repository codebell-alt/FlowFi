import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  totalIncome: number
  totalExpenses: number
  balance: number
  incomeCount: number
  expenseCount: number
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

export function StatsCards({
  totalIncome,
  totalExpenses,
  balance,
  incomeCount,
  expenseCount,
}: StatsCardsProps) {
  const isPositiveBalance = balance >= 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Ingresos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ingresos del Mes
          </CardTitle>
          <ArrowUpCircle className="h-5 w-5 text-chart-2" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-2">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {incomeCount} {incomeCount === 1 ? 'transacción' : 'transacciones'}
          </p>
        </CardContent>
      </Card>

      {/* Total Gastos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Gastos del Mes
          </CardTitle>
          <ArrowDownCircle className="h-5 w-5 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {expenseCount} {expenseCount === 1 ? 'transacción' : 'transacciones'}
          </p>
        </CardContent>
      </Card>

      {/* Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Balance del Mes
          </CardTitle>
          <Wallet className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            'text-2xl font-bold',
            isPositiveBalance ? 'text-chart-2' : 'text-destructive'
          )}>
            {formatCurrency(balance)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {isPositiveBalance ? (
              <TrendingUp className="h-3 w-3 text-chart-2" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span className={cn(
              'text-xs',
              isPositiveBalance ? 'text-chart-2' : 'text-destructive'
            )}>
              {isPositiveBalance ? 'Superávit' : 'Déficit'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Margen */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Margen
          </CardTitle>
          {isPositiveBalance ? (
            <TrendingUp className="h-5 w-5 text-chart-2" />
          ) : (
            <TrendingDown className="h-5 w-5 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className={cn(
            'text-2xl font-bold',
            isPositiveBalance ? 'text-chart-2' : 'text-destructive'
          )}>
            {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalIncome > 0 
              ? (isPositiveBalance 
                  ? 'Del ingreso total' 
                  : 'Pérdida sobre ingresos')
              : 'Sin ingresos registrados'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
