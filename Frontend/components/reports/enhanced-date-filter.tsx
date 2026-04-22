'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface EnhancedDateFilterProps {
  startDate?: string
  endDate?: string
  onDateChange?: (start: string, end: string) => void
}

export function EnhancedDateFilter({
  startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
  endDate = new Date().toISOString().split('T')[0],
  onDateChange,
}: EnhancedDateFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [desde, setDesde] = useState(startDate)
  const [hasta, setHasta] = useState(endDate)
  const [open, setOpen] = useState(false)

  const quickRanges = [
    { label: 'Hoy', days: 0 },
    { label: 'Últimos 7 días', days: 7 },
    { label: 'Últimos 30 días', days: 30 },
    { label: 'Últimos 90 días', days: 90 },
    { label: 'Este mes', type: 'month' },
    { label: 'Mes anterior', type: 'lastMonth' },
  ]

  const handleQuickRange = (range: any) => {
    let start = new Date()
    let end = new Date()

    if (range.type === 'month') {
      start.setDate(1)
    } else if (range.type === 'lastMonth') {
      end.setDate(0) // Último día del mes anterior
      start = new Date(end.getFullYear(), end.getMonth(), 1)
    } else {
      start.setDate(start.getDate() - range.days)
    }

    const newDesde = start.toISOString().split('T')[0]
    const newHasta = end.toISOString().split('T')[0]

    setDesde(newDesde)
    setHasta(newHasta)
    updateParams(newDesde, newHasta)
  }

  const updateParams = (start: string, end: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('desde', start)
    params.set('hasta', end)
    router.push(`?${params.toString()}`)
    if (onDateChange) {
      onDateChange(start, end)
    }
    setOpen(false)
  }

  const handleApply = () => {
    updateParams(desde, hasta)
  }

  const getDisplayLabel = () => {
    // Validar que desde y hasta tengan valores válidos
    if (!desde || !hasta) {
      return 'Seleccionar fechas'
    }

    const startDate = new Date(desde)
    const endDate = new Date(hasta)

    // Validar que las fechas sean válidas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Seleccionar fechas'
    }

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (desde === hasta) {
      return format(startDate, 'd MMM yyyy', { locale: es })
    }

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 7 && desde === new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]) {
      return 'Últimos 7 días'
    }
    if (diffDays === 30 && desde === new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]) {
      return 'Últimos 30 días'
    }

    return `${format(startDate, 'd MMM', { locale: es })} - ${format(endDate, 'd MMM yyyy', { locale: es })}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Filtrar: {getDisplayLabel()}</span>
          <span className="inline sm:hidden">Filtrar</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Quick ranges */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
              RANGOS RÁPIDOS
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {quickRanges.map((range) => (
                <Button
                  key={range.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickRange(range)}
                  className="justify-start text-xs"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-xs font-semibold text-muted-foreground mb-3 block">
              RANGO PERSONALIZADO
            </Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="desde" className="text-xs mb-1">Desde</Label>
                <Input
                  id="desde"
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="hasta" className="text-xs mb-1">Hasta</Label>
                <Input
                  id="hasta"
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="flex-1"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
