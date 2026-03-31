'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface CashFlowReportProps {
  data: {
    date: string
    income: number
    expenses: number
    balance: number
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

export function CashFlowReport({ data }: CashFlowReportProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Acumulado</CardTitle>
        <CardDescription>Evolución del balance durante el periodo</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No hay datos para mostrar
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.527 0.115 173.5)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.527 0.115 173.5)" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="oklch(0.527 0.115 173.5)"
                fill="url(#balanceGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
