'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface ProfileFormProps {
  profile: Profile | null
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [businessName, setBusinessName] = useState(profile?.business_name || '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
        business_name: businessName || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile?.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-chart-2 text-chart-2">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Perfil actualizado correctamente</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={profile?.email || ''}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            El correo electrónico no se puede cambiar
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Tu nombre"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="businessName">Nombre del negocio</Label>
          <Input
            id="businessName"
            type="text"
            placeholder="Mi Tienda"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          'Guardar Cambios'
        )}
      </Button>
    </form>
  )
}
