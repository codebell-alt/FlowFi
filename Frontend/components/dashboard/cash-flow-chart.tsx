'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface CashFlowChartProps {
  data: {
    date: string
    income: number
    expenses: number
  }[]
}

function formatDate(dateString: string) {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flujo de Caja</CardTitle>
        <CardDescription>Ingresos vs Gastos diarios del mes</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No hay datos para mostrar
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="date"
                stroke="oklch(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="oklch(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <p className="font-medium mb-2">{label}</p>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {entry.name}:
                            </span>
                            <span className="text-sm font-medium">
                              {formatCurrency(entry.value as number)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="income"
                name="Ingresos"
                fill="oklch(0.627 0.194 145)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="Gastos"
                fill="oklch(0.577 0.245 27.325)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
