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
import { Calendar, Filter } from 'lucide-react'

interface DateRangeFilterProps {
  startDate: string
  endDate: string
}

export function DateRangeFilter({ startDate, endDate }: DateRangeFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [desde, setDesde] = useState(startDate)
  const [hasta, setHasta] = useState(endDate)
  const [open, setOpen] = useState(false)

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('desde', desde)
    params.set('hasta', hasta)
    router.push(`?${params.toString()}`)
    setOpen(false)
  }

  const handleQuickRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    
    const newDesde = start.toISOString().split('T')[0]
    const newHasta = end.toISOString().split('T')[0]
    
    setDesde(newDesde)
    setHasta(newHasta)
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('desde', newDesde)
    params.set('hasta', newHasta)
    router.push(`?${params.toString()}`)
    setOpen(false)
  }

  const handleThisMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const newDesde = start.toISOString().split('T')[0]
    const newHasta = end.toISOString().split('T')[0]
    
    setDesde(newDesde)
    setHasta(newHasta)
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('desde', newDesde)
    params.set('hasta', newHasta)
    router.push(`?${params.toString()}`)
    setOpen(false)
  }

  const formatDisplayDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">
            {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
          </span>
          <span className="sm:hidden">Filtrar</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Filtrar por Fecha</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleThisMonth}>
              Este mes
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleQuickRange(7)}>
              Últimos 7 días
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleQuickRange(30)}>
              Últimos 30 días
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleQuickRange(90)}>
              Últimos 90 días
            </Button>
          </div>

          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="desde">Desde</Label>
              <Input
                id="desde"
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hasta">Hasta</Label>
              <Input
                id="hasta"
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
          </div>

          <Button className="w-full" onClick={handleApply}>
            Aplicar Filtro
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
