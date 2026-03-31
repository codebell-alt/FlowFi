'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Income, IncomeType, PaymentMethod } from '@/lib/types'
import { PAYMENT_METHODS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'

interface IncomeFormProps {
  income?: Income
  incomeTypes: IncomeType[]
  userId: string
}

export function IncomeForm({ income, incomeTypes, userId }: IncomeFormProps) {
  const router = useRouter()
  const isEditing = !!income

  const [amount, setAmount] = useState(income?.amount?.toString() || '')
  const [incomeTypeId, setIncomeTypeId] = useState(income?.income_type_id || '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(income?.payment_method || 'efectivo')
  const [description, setDescription] = useState(income?.description || '')
  const [date, setDate] = useState(income?.date || new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const data = {
      user_id: userId,
      amount: numAmount,
      income_type_id: incomeTypeId || null,
      payment_method: paymentMethod,
      description: description || null,
      date,
    }

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('incomes')
        .update(data)
        .eq('id', income.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('incomes')
        .insert(data)

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard/ingresos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Monto *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-7"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Fecha *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="incomeType">Tipo de Ingreso</Label>
          <Select value={incomeTypeId} onValueChange={setIncomeTypeId} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              {incomeTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Método de Pago *</Label>
          <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un método" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          placeholder="Descripción del ingreso..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Guardando...' : 'Registrando...'}
            </>
          ) : (
            isEditing ? 'Guardar Cambios' : 'Registrar Ingreso'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
