import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpCircle, ArrowDownCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Income, Expense } from '@/lib/types'

interface RecentTransactionsProps {
  incomes: Income[]
  expenses: Expense[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

function formatDate(dateString: string) {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export function RecentTransactions({ incomes, expenses }: RecentTransactionsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Incomes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Ingresos Recientes</CardTitle>
            <CardDescription>Últimas transacciones de ingreso</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/ingresos">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {incomes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ArrowUpCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No hay ingresos registrados</p>
              <Button variant="link" size="sm" asChild className="mt-2">
                <Link href="/dashboard/ingresos/nuevo">Registrar ingreso</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {incomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-chart-2/10">
                      <ArrowUpCircle className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {income.income_type?.name || 'Ingreso'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(income.date)} · {income.payment_method}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-chart-2">
                    +{formatCurrency(income.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Gastos Recientes</CardTitle>
            <CardDescription>Últimas transacciones de gasto</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/gastos">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ArrowDownCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No hay gastos registrados</p>
              <Button variant="link" size="sm" asChild className="mt-2">
                <Link href="/dashboard/gastos/nuevo">Registrar gasto</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
                      <ArrowDownCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {expense.category?.name || 'Gasto'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(expense.date)}
                        {expense.description && ` · ${expense.description}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-destructive">
                    -{formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
