'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ExportButton } from './export-button'
import { Search, Filter, Loader } from 'lucide-react'
import { useTransactions } from '@/hooks/use-reports'

interface DetailedReportProps {
  startDate: string
  endDate: string
}

interface Transaction {
  id: string
  fecha: string
  tipo: 'ingreso' | 'gasto'
  categoría?: string
  descripción: string
  monto: number
  saldo?: number
}

export function DetailedReport({ startDate, endDate }: DetailedReportProps) {
  const { transactions, loading, error } = useTransactions(startDate, endDate)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'ingreso' | 'gasto'>('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categoryList, setCategoryList] = useState<string[]>([])
  const [dailyData, setDailyData] = useState<any[]>([])

  useEffect(() => {
    const uniqueCategories = [...new Set(transactions.map((t) => t.categoría))].filter(Boolean) as string[]
    setCategoryList(uniqueCategories)
  }, [transactions])

  useEffect(() => {
    const daily: { [key: string]: { ingresos: number; gastos: number } } = {}
    transactions.forEach((t) => {
      if (!daily[t.fecha]) daily[t.fecha] = { ingresos: 0, gastos: 0 }
      if (t.tipo === 'ingreso') daily[t.fecha].ingresos += t.monto
      else daily[t.fecha].gastos += Math.abs(t.monto)
    })
    const chartData = Object.entries(daily).sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, { ingresos, gastos }]) => ({
        fecha: format(new Date(fecha), 'd MMM', { locale: es }),
        ingresos,
        gastos,
      }))
    setDailyData(chartData)
  }, [transactions])

  useEffect(() => {
    let filtered = transactions
    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.descripción.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.categoría?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedType !== 'all') filtered = filtered.filter((t) => t.tipo === selectedType)
    if (selectedCategory !== 'all') filtered = filtered.filter((t) => t.categoría === selectedCategory)
    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, selectedType, selectedCategory])

  const totalIncome = filteredTransactions.filter((t) => t.tipo === 'ingreso').reduce((sum, t) => sum + t.monto, 0)
  const totalExpenses = Math.abs(filteredTransactions.filter((t) => t.tipo === 'gasto').reduce((sum, t) => sum + t.monto, 0))
  const netFlow = totalIncome - totalExpenses

  if (error) return <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800 font-medium">Error: {error}</p></div>

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Reporte Detallado</h2></div>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Filter className="h-4 w-4" />Filtros</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div><Label className="text-xs mb-2 block">Buscar</Label><Input placeholder="..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={loading} /></div>
            <div><Label className="text-xs mb-2 block">Tipo</Label><Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)} disabled={loading}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="ingreso">Ingresos</SelectItem><SelectItem value="gasto">Gastos</SelectItem></SelectContent></Select></div>
            <div><Label className="text-xs mb-2 block">Categoría</Label><Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loading}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{categoryList.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-end"><ExportButton data={filteredTransactions.map((t) => ({ fecha: t.fecha, tipo: t.tipo, categoría: t.categoría || 'N/A', descripción: t.descripción, monto: t.monto }))} fileName={`Reporte_${startDate}`} columns={[{ key: 'fecha', label: 'Fecha' }, { key: 'tipo', label: 'Tipo' }, { key: 'categoría', label: 'Categoría' }, { key: 'descripción', label: 'Descripción' }, { key: 'monto', label: 'Monto', format: (v) => `$${Math.abs(v).toLocaleString()}` }]} startDate={startDate} endDate={endDate} /></div>
          </div>
        </CardContent>
      </Card>
      {loading ? <Card><CardContent className="py-8 flex items-center justify-center gap-2"><Loader className="h-5 w-5 animate-spin" /><span>Cargando...</span></CardContent></Card> : <>
        <div className="grid gap-4 grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Ingresos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Gastos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Neto</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>${netFlow.toLocaleString()}</div></CardContent></Card>
        </div>
        {dailyData.length > 0 && <Card><CardHeader><CardTitle className="text-base">Evolución</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><LineChart data={dailyData}><CartesianGrid /><XAxis dataKey="fecha" className="text-xs" /><YAxis /><Tooltip /><Line type="monotone" dataKey="ingresos" stroke="#10b981" /><Line type="monotone" dataKey="gastos" stroke="#ef4444" /></LineChart></ResponsiveContainer></CardContent></Card>}
        <Card><CardHeader><CardTitle className="text-base">Transacciones ({filteredTransactions.length})</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-3">Fecha</th><th className="text-left p-3">Descripción</th><th className="text-left p-3">Categoría</th><th className="text-left p-3">Tipo</th><th className="text-right p-3">Monto</th><th className="text-right p-3">Saldo</th></tr></thead><tbody>{filteredTransactions.length > 0 ? filteredTransactions.map((t) => <tr key={t.id} className="border-b"><td className="p-3">{t.fecha}</td><td className="p-3">{t.descripción}</td><td className="p-3">{t.categoría || 'N/A'}</td><td className="p-3"><span className={`text-xs px-2 py-1 rounded ${t.tipo === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.tipo}</span></td><td className={`text-right p-3 font-medium ${t.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>{t.tipo === 'ingreso' ? '+' : '-'}${Math.abs(t.monto).toLocaleString()}</td><td className="text-right p-3">${t.saldo?.toLocaleString()}</td></tr>) : <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Sin resultados</td></tr>}</tbody></table></div></CardContent></Card>
      </>}
    </div>
  )
}
