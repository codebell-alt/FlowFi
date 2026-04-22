'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileText, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ExportButtonProps {
  data: any[]
  fileName: string
  columns: {
    key: string
    label: string
    format?: (value: any) => string
  }[]
  title?: string
  htmlElementId?: string
  startDate?: string
  endDate?: string
}

export function ExportButton({
  data,
  fileName,
  columns,
  title,
  htmlElementId,
  startDate,
  endDate,
}: ExportButtonProps) {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => {
        const row: any = {}
        columns.forEach((col) => {
          row[col.label] = col.format
            ? col.format(item[col.key])
            : item[col.key]
        })
        return row
      })
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')

    // Ajustar ancho de columnas
    const maxWidth = columns.reduce((max, col) => Math.max(max, col.label.length), 0)
    worksheet['!cols'] = columns.map(() => ({ wch: Math.min(maxWidth + 2, 30) }))

    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToPDF = async () => {
    try {
      // Obtener token de Supabase
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) {
        alert('No autorizado. Por favor, inicia sesión de nuevo.')
        return
      }

      const params = new URLSearchParams()
      if (startDate) params.append('desde', startDate)
      if (endDate) params.append('hasta', endDate)

      const response = await fetch(
        `http://localhost:8000/api/v1/export/report-pdf?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exportando PDF:', error)
      alert('Error al generar el PDF. Intenta de nuevo.')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar</span>
          <span className="inline sm:hidden">
            <FileText className="h-4 w-4" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
          <span>Excel (.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
          <span>PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
