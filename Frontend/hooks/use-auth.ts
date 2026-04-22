'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthState {
  token: string | null
  user: any | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const getSession = async () => {
      try {
        const supabase = createClient()
        
        // Obtener la sesión actual
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          setAuthState({
            token: null,
            user: null,
            loading: false,
            error: sessionError.message,
          })
          return
        }

        if (session) {
          setAuthState({
            token: session.access_token,
            user: session.user,
            loading: false,
            error: null,
          })
        } else {
          setAuthState({
            token: null,
            user: null,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        setAuthState({
          token: null,
          user: null,
          loading: false,
          error: errorMessage,
        })
      }
    }

    getSession()

    // Escuchar cambios en la autenticación
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setAuthState({
          token: session.access_token,
          user: session.user,
          loading: false,
          error: null,
        })
      } else {
        setAuthState({
          token: null,
          user: null,
          loading: false,
          error: null,
        })
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return {
    token: authState.token,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
  }
}
