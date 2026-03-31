import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IncomeForm } from '@/components/incomes/income-form'
import { ArrowUpCircle } from 'lucide-react'

interface EditIncomePageProps {
  params: Promise<{ id: string }>
}

export default async function EditIncomePage({ params }: EditIncomePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: income } = await supabase
    .from('incomes')
    .select('*, income_type:income_types(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!income) {
    notFound()
  }

  const { data: incomeTypes } = await supabase
    .from('income_types')
    .select('*')
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar Ingreso</h1>
        <p className="text-muted-foreground">
          Modifica los detalles del ingreso
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <ArrowUpCircle className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <CardTitle>Detalles del Ingreso</CardTitle>
              <CardDescription>Actualiza la información del ingreso</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <IncomeForm income={income} incomeTypes={incomeTypes || []} userId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
