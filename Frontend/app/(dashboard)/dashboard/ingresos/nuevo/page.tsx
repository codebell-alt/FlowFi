import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IncomeForm } from '@/components/incomes/income-form'
import { ArrowUpCircle } from 'lucide-react'

export default async function NewIncomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: incomeTypes } = await supabase
    .from('income_types')
    .select('*')
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Ingreso</h1>
        <p className="text-muted-foreground">
          Registra un nuevo ingreso en tu negocio
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
              <CardDescription>Completa la información del ingreso</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <IncomeForm incomeTypes={incomeTypes || []} userId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
