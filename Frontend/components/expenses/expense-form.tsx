'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Expense, ExpenseCategory } from '@/lib/types'
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

interface ExpenseFormProps {
  expense?: Expense
  categories: ExpenseCategory[]
  userId: string
}

export function ExpenseForm({ expense, categories, userId }: ExpenseFormProps) {
  const router = useRouter()
  const isEditing = !!expense

  const [amount, setAmount] = useState(expense?.amount?.toString() || '')
  const [categoryId, setCategoryId] = useState(expense?.category_id || '')
  const [description, setDescription] = useState(expense?.description || '')
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0])
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
      category_id: categoryId || null,
      description: description || null,
      date,
    }

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('expenses')
        .update(data)
        .eq('id', expense.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('expenses')
        .insert(data)

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard/gastos')
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

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="category">Categoría</Label>
          <Select value={categoryId} onValueChange={setCategoryId} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
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
          placeholder="Descripción del gasto..."
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
            isEditing ? 'Guardar Cambios' : 'Registrar Gasto'
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
