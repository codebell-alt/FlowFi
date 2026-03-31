"""
Cliente de API para consumir el backend de FlowFi desde Next.js
Guarda este archivo en: Frontend/lib/services/api-client.ts
"""

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RequestOptions extends RequestInit {
  token?: string
}

/**
 * Realiza una solicitud HTTP al backend con autenticación
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'API Error')
  }

  const data = await response.json()
  return data
}

// ============================================================================
// INCOMES (Ingresos)
// ============================================================================

export const incomeService = {
  /**
   * Obtiene lista de ingresos del usuario
   */
  list: async (token: string, filters?: {
    skip?: number
    limit?: number
    start_date?: string
    end_date?: string
    income_type_id?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.skip) params.append('skip', String(filters.skip))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.start_date) params.append('start_date', filters.start_date)
    if (filters?.end_date) params.append('end_date', filters.end_date)
    if (filters?.income_type_id) params.append('income_type_id', filters.income_type_id)

    return apiRequest(`/api/v1/incomes?${params}`, {
      method: 'GET',
      token,
    })
  },

  /**
   * Obtiene un ingreso específico
   */
  get: async (token: string, incomeId: string) => {
    return apiRequest(`/api/v1/incomes/${incomeId}`, {
      method: 'GET',
      token,
    })
  },

  /**
   * Crea un nuevo ingreso
   */
  create: async (token: string, data: {
    amount: number
    payment_method: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro'
    date: string
    description?: string
    income_type_id?: string
  }) => {
    return apiRequest('/api/v1/incomes', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    })
  },

  /**
   * Actualiza un ingreso
   */
  update: async (token: string, incomeId: string, data: Partial<{
    amount: number
    payment_method: string
    date: string
    description: string
    income_type_id: string
  }>) => {
    return apiRequest(`/api/v1/incomes/${incomeId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    })
  },

  /**
   * Elimina un ingreso
   */
  delete: async (token: string, incomeId: string) => {
    return apiRequest(`/api/v1/incomes/${incomeId}`, {
      method: 'DELETE',
      token,
    })
  },
}

// ============================================================================
// EXPENSES (Gastos)
// ============================================================================

export const expenseService = {
  /**
   * Obtiene lista de gastos del usuario
   */
  list: async (token: string, filters?: {
    skip?: number
    limit?: number
    start_date?: string
    end_date?: string
    category_id?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.skip) params.append('skip', String(filters.skip))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.start_date) params.append('start_date', filters.start_date)
    if (filters?.end_date) params.append('end_date', filters.end_date)
    if (filters?.category_id) params.append('category_id', filters.category_id)

    return apiRequest(`/api/v1/expenses?${params}`, {
      method: 'GET',
      token,
    })
  },

  /**
   * Obtiene un gasto específico
   */
  get: async (token: string, expenseId: string) => {
    return apiRequest(`/api/v1/expenses/${expenseId}`, {
      method: 'GET',
      token,
    })
  },

  /**
   * Crea un nuevo gasto
   */
  create: async (token: string, data: {
    amount: number
    date: string
    description?: string
    category_id?: string
  }) => {
    return apiRequest('/api/v1/expenses', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    })
  },

  /**
   * Actualiza un gasto
   */
  update: async (token: string, expenseId: string, data: Partial<{
    amount: number
    date: string
    description: string
    category_id: string
  }>) => {
    return apiRequest(`/api/v1/expenses/${expenseId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    })
  },

  /**
   * Elimina un gasto
   */
  delete: async (token: string, expenseId: string) => {
    return apiRequest(`/api/v1/expenses/${expenseId}`, {
      method: 'DELETE',
      token,
    })
  },
}

// ============================================================================
// CATEGORIES (Categorías)
// ============================================================================

export const categoryService = {
  /**
   * Obtiene categorías de gasto
   */
  listExpenseCategories: async (token: string) => {
    return apiRequest('/api/v1/categories/expenses', {
      method: 'GET',
      token,
    })
  },

  /**
   * Crea categoría de gasto
   */
  createExpenseCategory: async (token: string, data: {
    name: string
    description?: string
    icon?: string
  }) => {
    return apiRequest('/api/v1/categories/expenses', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    })
  },

  /**
   * Obtiene tipos de ingreso
   */
  listIncomeTypes: async (token: string) => {
    return apiRequest('/api/v1/categories/income-types', {
      method: 'GET',
      token,
    })
  },

  /**
   * Crea tipo de ingreso
   */
  createIncomeType: async (token: string, data: {
    name: string
    description?: string
  }) => {
    return apiRequest('/api/v1/categories/income-types', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    })
  },
}

// ============================================================================
// DASHBOARD (Estadísticas)
// ============================================================================

export const dashboardService = {
  /**
   * Obtiene estadísticas del dashboard
   */
  getStats: async (token: string, params?: {
    start_date?: string
    end_date?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    return apiRequest(`/api/v1/dashboard/stats?${queryParams}`, {
      method: 'GET',
      token,
    })
  },

  /**
   * Obtiene comparación mensual
   */
  getMonthlyComparison: async (token: string, params?: {
    month?: number
    year?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.month) queryParams.append('month', String(params.month))
    if (params?.year) queryParams.append('year', String(params.year))

    return apiRequest(`/api/v1/dashboard/monthly-comparison?${queryParams}`, {
      method: 'GET',
      token,
    })
  },
}

// ============================================================================
// PROFILE (Perfil)
// ============================================================================

export const profileService = {
  /**
   * Obtiene perfil del usuario actual
   */
  getMe: async (token: string) => {
    return apiRequest('/api/v1/profile/me', {
      method: 'GET',
      token,
    })
  },

  /**
   * Actualiza perfil del usuario
   */
  update: async (token: string, data: {
    full_name?: string
    business_name?: string
  }) => {
    return apiRequest('/api/v1/profile/me', {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    })
  },
}

// ============================================================================
// AUTH (Autenticación)
// ============================================================================

export const authService = {
  /**
   * Obtiene información del usuario autenticado
   */
  getMe: async (token: string) => {
    return apiRequest('/api/v1/auth/me', {
      method: 'GET',
      token,
    })
  },

  /**
   * Logout (solo informativo)
   */
  logout: async (token: string) => {
    return apiRequest('/api/v1/auth/logout', {
      method: 'POST',
      token,
    })
  },
}

// ============================================================================
// ADMIN (Administración)
// ============================================================================

export const adminService = {
  /**
   * Obtiene lista de todos los usuarios
   */
  listUsers: async (token: string, params?: {
    skip?: number
    limit?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.skip) queryParams.append('skip', String(params.skip))
    if (params?.limit) queryParams.append('limit', String(params.limit))

    return apiRequest(`/api/v1/admin/users?${queryParams}`, {
      method: 'GET',
      token,
    })
  },

  /**
   * Obtiene detalles de un usuario
   */
  getUserDetails: async (token: string, userId: string) => {
    return apiRequest(`/api/v1/admin/users/${userId}`, {
      method: 'GET',
      token,
    })
  },

  /**
   * Obtiene estadísticas de un usuario
   */
  getUserStats: async (token: string, userId: string) => {
    return apiRequest(`/api/v1/admin/users/${userId}/stats`, {
      method: 'GET',
      token,
    })
  },
}

// ============================================================================
// HOOKS RECOMENDADOS PARA REACT
// ============================================================================

/*
// Ejemplo de hook para usar en un componente

import { useState, useEffect } from 'react'
import { useSession } from '@supabase/auth-helpers-nextjs'
import { incomeService } from '@/lib/services/api-client'

export function useIncomes(filters?: Parameters<typeof incomeService.list>[1]) {
  const { data: session } = useSession()
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!session?.access_token) return

    const fetchIncomes = async () => {
      try {
        setLoading(true)
        const data = await incomeService.list(session.access_token, filters)
        setIncomes(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchIncomes()
  }, [session?.access_token, filters])

  return { incomes, loading, error }
}

// Usar en componente:
export default function IncomesPage() {
  const { incomes, loading } = useIncomes()
  
  if (loading) return <div>Cargando...</div>
  
  return (
    <div>
      {incomes.map(income => (
        <div key={income.id}>{income.amount}</div>
      ))}
    </div>
  )
}
*/
