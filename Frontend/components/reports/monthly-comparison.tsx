'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

interface MonthlyComparisonProps {
  incomeByMethod: Record<string, number>
  expensesByCategory: Record<string, number>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const methodLabels: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  otro: 'Otro',
}

export function MonthlyComparison({ incomeByMethod, expensesByCategory }: MonthlyComparisonProps) {
  const incomeTotal = Object.values(incomeByMethod).reduce((sum, val) => sum + val, 0)
  const expenseTotal = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0)

  const incomeData = Object.entries(incomeByMethod)
    .sort(([, a], [, b]) => b - a)
    .map(([method, amount]) => ({
      name: methodLabels[method] || method,
      amount,
      percentage: incomeTotal > 0 ? (amount / incomeTotal) * 100 : 0,
    }))

  const expenseData = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      name: category,
      amount,
      percentage: expenseTotal > 0 ? (amount / expenseTotal) * 100 : 0,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desglose</CardTitle>
        <CardDescription>Distribución de ingresos y gastos</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="income" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="income">Ingresos</TabsTrigger>
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            {incomeData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay ingresos en este periodo
              </p>
            ) : (
              incomeData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(item.amount)} ({item.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))
            )}
            {incomeTotal > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-chart-2">{formatCurrency(incomeTotal)}</span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            {expenseData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay gastos en este periodo
              </p>
            ) : (
              expenseData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(item.amount)} ({item.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))
            )}
            {expenseTotal > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-destructive">{formatCurrency(expenseTotal)}</span>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
