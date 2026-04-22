'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedDateFilter } from '@/components/reports/enhanced-date-filter'
import { MonthlyReport } from '@/components/reports/monthly-report'
import { BarChart3, Calendar } from 'lucide-react'

// Importar DetailedReport dinámicamente sin SSR para evitar conflictos con jsPDF
const DetailedReport = dynamic(
  () => import('@/components/reports/detailed-report').then(mod => ({ default: mod.DetailedReport })),
  { ssr: false, loading: () => <div className="p-8 text-center text-muted-foreground">Cargando reporte...</div> }
)

export default function ReportesPage() {
  const searchParams = useSearchParams()
  
  // Memoizar cálculo de fechas por defecto
  const defaults = useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  }, [])

  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)

  useEffect(() => {
    // Obtener fechas de los parámetros de URL o usar valores por defecto
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')

    if (desde && hasta) {
      setStartDate(desde)
      setEndDate(hasta)
    }
  }, [searchParams])

  const handleDateChange = useCallback((start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }, [])

  return (
    <div className="space-y-6">
      {/* Encabezado con filtro de fechas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Reportes
          </h1>
          <p className="text-muted-foreground mt-1">Análisis detallado de tus finanzas</p>
        </div>
        
        {/* Filtro de fechas en la parte superior derecha */}
        <EnhancedDateFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Tabs con diferentes tipos de reportes */}
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Reporte Mensual</span>
            <span className="inline sm:hidden">Mensual</span>
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Reporte Detallado</span>
            <span className="inline sm:hidden">Detallado</span>
          </TabsTrigger>
        </TabsList>

        {/* Reporte Mensual */}
        <TabsContent value="monthly" className="space-y-6">
          {startDate && endDate && <MonthlyReport startDate={startDate} endDate={endDate} />}
        </TabsContent>

        {/* Reporte Detallado */}
        <TabsContent value="detailed" className="space-y-6">
          {startDate && endDate && (
            <DetailedReport
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
