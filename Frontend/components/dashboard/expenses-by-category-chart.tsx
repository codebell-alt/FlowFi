'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ExpensesByCategoryChartProps {
  data: {
    name: string
    total: number
  }[]
}

const COLORS = [
  'oklch(0.527 0.115 173.5)',
  'oklch(0.627 0.194 145)',
  'oklch(0.875 0.15 85)',
  'oklch(0.577 0.245 27.325)',
  'oklch(0.6 0.15 260)',
  'oklch(0.65 0.18 40)',
  'oklch(0.55 0.12 200)',
  'oklch(0.7 0.15 120)',
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function ExpensesByCategoryChart({ data }: ExpensesByCategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoría</CardTitle>
        <CardDescription>Distribución de gastos del mes</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No hay gastos registrados
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="total"
                nameKey="name"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0]
                    const percentage = ((data.value as number) / total * 100).toFixed(1)
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(data.value as number)} ({percentage}%)
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
                iconSize={8}
                formatter={(value, entry) => {
                  const item = data.find((d) => d.name === value)
                  if (item) {
                    const percentage = ((item.total / total) * 100).toFixed(0)
                    return (
                      <span className="text-sm">
                        {value} <span className="text-muted-foreground">({percentage}%)</span>
                      </span>
                    )
                  }
                  return value
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
