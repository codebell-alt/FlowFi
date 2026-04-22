// Ejemplo de Integración con API - Sistema de Reportes FlowFi
// Este archivo muestra cómo conectar los componentes de reportes con los endpoints de la API

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth' // Hook de autenticación
import { format, startOfMonth, endOfMonth } from 'date-fns'

// ============================================================================
// EJEMPLO 1: Hook para obtener datos de transacciones
// ============================================================================

export function useTransactions(startDate: string, endDate: string) {
  const { token } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!startDate || !endDate || !token) return

    const fetchTransactions = async () => {
      setLoading(true)
      setError(null)

      try {
        // Obtener gastos
        const expensesResponse = await fetch(
          `/api/v1/expenses?desde=${startDate}&hasta=${endDate}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!expensesResponse.ok) throw new Error('Error al obtener gastos')
        const expenses = await expensesResponse.json()

        // Obtener ingresos
        const incomesResponse = await fetch(
          `/api/v1/incomes?desde=${startDate}&hasta=${endDate}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!incomesResponse.ok) throw new Error('Error al obtener ingresos')
        const incomes = await incomesResponse.json()

        // Procesar datos
        const allTransactions = [
          ...((expenses || []).map((e: any) => ({
            id: e.id,
            fecha: e.fecha,
            tipo: 'gasto' as const,
            categoría: e.categoria_nombre || 'Sin categoría',
            descripción: e.descripcion,
            monto: -e.monto,
            saldo: 0,
          }))),
          ...((incomes || []).map((i: any) => ({
            id: i.id,
            fecha: i.fecha,
            tipo: 'ingreso' as const,
            categoría: i.tipo_ingreso || 'Sin categoría',
            descripción: i.descripcion,
            monto: i.monto,
            saldo: 0,
          }))),
        ]

        // Ordenar por fecha
        allTransactions.sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        )

        // Calcular saldos acumulativos
        let balance = 0
        allTransactions.forEach((t) => {
          balance += t.monto
          t.saldo = balance
        })

        setData(allTransactions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [startDate, endDate, token])

  return { data, loading, error }
}

// ============================================================================
// EJEMPLO 2: Hook para obtener datos mensuales
// ============================================================================

export function useMonthlyReport(date: Date = new Date()) {
  const { token } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    const startDate = startOfMonth(date).toISOString().split('T')[0]
    const endDate = endOfMonth(date).toISOString().split('T')[0]

    const fetchMonthlyData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Usar endpoint específico para comparación mensual
        const response = await fetch(
          `/api/v1/dashboard/monthly-comparison?start_date=${startDate}&end_date=${endDate}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) throw new Error('Error al obtener datos mensuales')
        const monthlyData = await response.json()

        // Procesar para formato compatible con gráficos
        const processed = {
          totalIncome: monthlyData.total_income || 0,
          totalExpenses: monthlyData.total_expenses || 0,
          netFlow: (monthlyData.total_income || 0) - (monthlyData.total_expenses || 0),
          weeklyData: monthlyData.weekly_breakdown || [],
          categoryBreakdown: monthlyData.by_category || [],
        }

        setData(processed)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyData()
  }, [date, token])

  return { data, loading, error }
}

// ============================================================================
// EJEMPLO 3: Hook para obtener estadísticas del dashboard
// ============================================================================

export function useDashboardStats(startDate: string, endDate: string) {
  const { token } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!startDate || !endDate || !token) return

    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/v1/dashboard/stats?desde=${startDate}&hasta=${endDate}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) throw new Error('Error al obtener estadísticas')
        const stats = await response.json()

        setData(stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [startDate, endDate, token])

  return { data, loading, error }
}

// ============================================================================
// EJEMPLO 4: Componente mejorado - DetailedReport con datos de API
// ============================================================================

import { DetailedReport } from '@/components/reports/detailed-report'

export function DetailedReportWithAPI(props: {
  startDate: string
  endDate: string
  onDateChange?: (start: string, end: string) => void
}) {
  const { data: transactions, loading, error } = useTransactions(
    props.startDate,
    props.endDate
  )

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error al cargar datos: {error}</p>
      </div>
    )
  }

  return (
    <DetailedReport
      startDate={props.startDate}
      endDate={props.endDate}
      onDateChange={props.onDateChange}
    />
  )
}

// ============================================================================
// EJEMPLO 5: Componente mejorado - MonthlyReport con datos de API
// ============================================================================

import { MonthlyReport } from '@/components/reports/monthly-report'

export function MonthlyReportWithAPI(props: { date?: Date }) {
  const { data, loading, error } = useMonthlyReport(props.date)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error al cargar datos: {error}</p>
      </div>
    )
  }

  return <MonthlyReport data={data} loading={loading} />
}

// ============================================================================
// EJEMPLO 6: Uso en la página de reportes
// ============================================================================

/*
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedDateFilter } from '@/components/reports/enhanced-date-filter'
import { MonthlyReportWithAPI } from '@/components/reports/examples'
import { DetailedReportWithAPI } from '@/components/reports/examples'

export default function ReportesPage() {
  const searchParams = useSearchParams()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')

    if (desde && hasta) {
      setStartDate(desde)
      setEndDate(hasta)
    } else {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)

      setStartDate(start.toISOString().split('T')[0])
      setEndDate(end.toISOString().split('T')[0])
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground mt-1">Análisis detallado de tus finanzas</p>
        </div>
        <EnhancedDateFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={(s, e) => {
            setStartDate(s)
            setEndDate(e)
          }}
        />
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly">Reporte Mensual</TabsTrigger>
          <TabsTrigger value="detailed">Reporte Detallado</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <MonthlyReportWithAPI />
        </TabsContent>

        <TabsContent value="detailed">
          {startDate && endDate && <DetailedReportWithAPI startDate={startDate} endDate={endDate} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
*/

// ============================================================================
// EJEMPLO 7: Hook personalizado para búsqueda con filtros
// ============================================================================

export function useFilteredTransactions(
  startDate: string,
  endDate: string,
  filters: {
    searchTerm?: string
    type?: 'all' | 'ingreso' | 'gasto'
    category?: string
  }
) {
  const { data: allTransactions, loading, error } = useTransactions(startDate, endDate)
  const [filtered, setFiltered] = useState<any[]>([])

  useEffect(() => {
    if (!allTransactions) return

    let result = allTransactions

    // Filtrar por búsqueda
    if (filters.searchTerm) {
      result = result.filter(
        (t) =>
          t.descripción.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          t.categoría.toLowerCase().includes(filters.searchTerm!.toLowerCase())
      )
    }

    // Filtrar por tipo
    if (filters.type && filters.type !== 'all') {
      result = result.filter((t) => t.tipo === filters.type)
    }

    // Filtrar por categoría
    if (filters.category && filters.category !== 'all') {
      result = result.filter((t) => t.categoría === filters.category)
    }

    setFiltered(result)
  }, [allTransactions, filters])

  return { data: filtered, loading, error }
}

// ============================================================================
// ENDPOINTS DISPONIBLES (Backend)
// ============================================================================

/*
GET /api/v1/incomes?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
GET /api/v1/expenses?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
GET /api/v1/dashboard/stats?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
GET /api/v1/dashboard/monthly-comparison

Todos requieren header de autenticación:
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
*/
