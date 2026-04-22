'use client'

import { useEffect, useState } from 'react'
import reportsAPI from '@/lib/api/reports-client'

export interface Transaction {
  id: string
  fecha: string
  tipo: 'ingreso' | 'gasto'
  categoría?: string
  descripción: string
  monto: number
  saldo?: number
  payment_method?: string
}

export interface DashboardStats {
  period: {
    start: string
    end: string
  }
  summary: {
    total_income: number
    total_expenses: number
    balance: number
    income_count: number
    expense_count: number
  }
  expenses_by_category: Array<{
    category: string
    total: number
  }>
  income_by_method: Array<{
    method: string
    total: number
  }>
  daily_flow: Array<{
    date: string
    income: number
    expenses: number
  }>
}

/**
 * Hook para obtener transacciones (gastos e ingresos) desde la API
 */
export function useTransactions(
  startDate?: string,
  endDate?: string
) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      setError(null)

      try {
        // Obtener gastos
        const expensesResponse = await reportsAPI.getExpenses({
          desde: startDate,
          hasta: endDate,
        })

        const expenses = (expensesResponse.data || []).map((expense: any) => ({
          id: expense.id,
          fecha: expense.date,
          tipo: 'gasto' as const,
          categoría: expense.category?.name || expense.category_id || 'Sin categoría',
          descripción: expense.description || 'Sin descripción',
          monto: -Math.abs(expense.amount),
          payment_method: 'N/A',
        }))

        // Obtener ingresos
        const incomesResponse = await reportsAPI.getIncomes({
          desde: startDate,
          hasta: endDate,
        })

        const incomes = (incomesResponse.data || []).map((income: any) => ({
          id: income.id,
          fecha: income.date,
          tipo: 'ingreso' as const,
          categoría: income.income_type?.name || income.income_type_id || 'Sin tipo',
          descripción: income.description || 'Sin descripción',
          monto: income.amount,
          payment_method: income.payment_method,
        }))

        // Combinar y ordenar
        const allTransactions = [...expenses, ...incomes].sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        )

        // Calcular saldos acumulativos
        let balance = 0
        allTransactions.forEach((t) => {
          balance += t.monto
          t.saldo = balance
        })

        setTransactions(allTransactions)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        console.error('Error fetching transactions:', err)
      } finally {
        setLoading(false)
      }
    }

    if (startDate && endDate) {
      fetchTransactions()
    }
  }, [startDate, endDate])

  return { transactions, loading, error }
}

/**
 * Hook para obtener estadísticas del dashboard
 */
export function useDashboardStats(
  startDate?: string,
  endDate?: string
) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await reportsAPI.getDashboardStats({
          desde: startDate,
          hasta: endDate,
        })

        setStats(response)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        console.error('Error fetching dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }

    if (startDate && endDate) {
      fetchStats()
    }
  }, [startDate, endDate])

  return { stats, loading, error }
}

/**
 * Hook para obtener comparación mensual
 */
export function useMonthlyComparison() {
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComparison = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await reportsAPI.getMonthlyComparison()
        setComparison(response)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        console.error('Error fetching monthly comparison:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchComparison()
  }, [])

  return { comparison, loading, error }
}

/**
 * Hook para obtener categorías de gastos
 */
export function useExpenseCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await reportsAPI.getExpenseCategories()
        setCategories(response.data || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        console.error('Error fetching expense categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

/**
 * Hook para obtener tipos de ingresos
 */
export function useIncomeTypes() {
  const [types, setTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await reportsAPI.getIncomeTypes()
        setTypes(response.data || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        console.error('Error fetching income types:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTypes()
  }, [])

  return { types, loading, error }
}
