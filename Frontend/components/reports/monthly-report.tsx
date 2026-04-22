'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, eachWeekOfInterval, startOfWeek, endOfWeek, parse } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, Loader } from 'lucide-react'
import { useTransactions } from '@/hooks/use-reports'

interface MonthlyReportProps {
  startDate: string
  endDate: string
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export function MonthlyReport({ startDate, endDate }: MonthlyReportProps) {
  const { transactions, loading, error } = useTransactions(startDate, endDate)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netFlow: 0,
  })

  useEffect(() => {
    if (!transactions.length) {
      setWeeklyData([])
      setCategoryData([])
      setStats({ totalIncome: 0, totalExpenses: 0, netFlow: 0 })
      return
    }

    // Agrupar transacciones por semana
    const startDateObj = parse(startDate, 'yyyy-MM-dd', new Date())
    const endDateObj = parse(endDate, 'yyyy-MM-dd', new Date())
    const weeksInRange = eachWeekOfInterval({ start: startDateObj, end: endDateObj })

    const weeklyBreakdown: { [key: string]: { ingresos: number; gastos: number } } = {}

    weeksInRange.forEach((weekStart) => {
      const weekEnd = endOfWeek(weekStart)
      const weekLabel = `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM', { locale: es })}`
      weeklyBreakdown[weekLabel] = { ingresos: 0, gastos: 0 }
    })

    transactions.forEach((t) => {
      const tDate = parse(t.fecha, 'yyyy-MM-dd', new Date())
      const weekStart = startOfWeek(tDate)
      const weekEnd = endOfWeek(weekStart)
      const weekLabel = `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM', { locale: es })}`

      if (weeklyBreakdown[weekLabel]) {
        if (t.tipo === 'ingreso') {
          weeklyBreakdown[weekLabel].ingresos += t.monto
        } else {
          weeklyBreakdown[weekLabel].gastos += Math.abs(t.monto)
        }
      }
    })

    const chartData = Object.entries(weeklyBreakdown).map(([semana, data]) => ({
      semana,
      ingresos: data.ingresos,
      gastos: data.gastos,
    }))
    setWeeklyData(chartData)

    // Agrupar por categoría (solo gastos)
    const categoryBreakdown: { [key: string]: number } = {}
    transactions
      .filter((t) => t.tipo === 'gasto')
      .forEach((t) => {
        const cat = t.categoría || 'Sin categoría'
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + Math.abs(t.monto)
      })

    const catData = Object.entries(categoryBreakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    setCategoryData(catData)

    // Calcular estadísticas
    const totalIncome = transactions
      .filter((t) => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0)
    const totalExpenses = transactions
      .filter((t) => t.tipo === 'gasto')
      .reduce((sum, t) => sum + Math.abs(t.monto), 0)

    setStats({
      totalIncome,
      totalExpenses,
      netFlow: totalIncome - totalExpenses,
    })
  }, [transactions, startDate, endDate])

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error: {error}</p>
      </div>
    )
  }

  const startDateObj = parse(startDate, 'yyyy-MM-dd', new Date())
  const endDateObj = parse(endDate, 'yyyy-MM-dd', new Date())
  const totalExpensesByCategory = categoryData.reduce((sum, cat) => sum + cat.value, 0)
  const transactionCountByCategory = (categoryName: string) => {
    return transactions.filter((t) => t.categoría === categoryName && t.tipo === 'gasto').length
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold">Reporte Mensual</h2>
        <p className="text-muted-foreground mt-1">
          Período: {format(startDateObj, 'd MMM', { locale: es })} - {format(endDateObj, 'd MMM yyyy', { locale: es })}
        </p>
      </div>

      {/* Tarjetas de resumen */}
      {loading ? (
        <Card>
          <CardContent className="py-8 flex items-center justify-center gap-2">
            <Loader className="h-5 w-5 animate-spin" />
            <span>Cargando...</span>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${stats.totalIncome.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{transactions.filter((t) => t.tipo === 'ingreso').length} transacciones</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${stats.totalExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{transactions.filter((t) => t.tipo === 'gasto').length} transacciones</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flujo Neto</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.netFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${stats.netFlow.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stats.netFlow >= 0 ? 'Superávit' : 'Déficit'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Gráfico de barras - Ingresos vs Gastos por semana */}
            {weeklyData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ingresos vs Gastos (Semanal)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="semana" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => `$${Number(value).toLocaleString()}`}
                      />
                      <Legend />
                      <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="gastos" fill="#ef4444" name="Gastos" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Gráfico de pastel limpio - Gastos por categoría */}
            {categoryData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gastos por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 flex justify-center">
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={false}
                            outerRadius={100}
                            innerRadius={0}
                            fill="#8884d8"
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `$${Number(value).toLocaleString()}`}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              padding: '8px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Leyenda personalizada al lado */}
                    <div className="flex-1 flex flex-col justify-center gap-4">
                      {categoryData.map((item, index) => {
                        const percentage = totalExpensesByCategory > 0 
                          ? ((item.value / totalExpensesByCategory) * 100).toFixed(1) 
                          : '0'
                        return (
                          <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition">
                            <div 
                              className="w-5 h-5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div className="flex-grow">
                              <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                              <p className="text-xs text-gray-600">
                                ${item.value.toLocaleString()} ({percentage}%)
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabla de gastos por categoría */}
          {categoryData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalle de Gastos por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-semibold">Categoría</th>
                        <th className="text-right py-2 px-4 font-semibold">Monto</th>
                        <th className="text-right py-2 px-4 font-semibold">% del Total</th>
                        <th className="text-right py-2 px-4 font-semibold">Transacciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryData.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{item.name}</td>
                          <td className="text-right py-3 px-4 font-medium">${item.value.toLocaleString()}</td>
                          <td className="text-right py-3 px-4">
                            {totalExpensesByCategory > 0
                              ? ((item.value / totalExpensesByCategory) * 100).toFixed(1)
                              : '0'}
                            %
                          </td>
                          <td className="text-right py-3 px-4">{transactionCountByCategory(item.name)}</td>
                        </tr>
                      ))}
                      <tr className="bg-muted/50 font-semibold">
                        <td className="py-3 px-4">Total</td>
                        <td className="text-right py-3 px-4">${totalExpensesByCategory.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">100%</td>
                        <td className="text-right py-3 px-4">{transactions.filter((t) => t.tipo === 'gasto').length}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {categoryData.length === 0 && weeklyData.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">Sin datos para el período seleccionado</CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
