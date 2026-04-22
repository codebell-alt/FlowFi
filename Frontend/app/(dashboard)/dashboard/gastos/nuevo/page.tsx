import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { ArrowDownCircle } from 'lucide-react'

export default async function NewExpensePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: allCategories } = await supabase
    .from('expense_categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order('name')

  // Eliminar duplicados por nombre
  const categories = Array.from(
    new Map(allCategories?.map((item) => [item.name, item]) || []).values()
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Gasto</h1>
        <p className="text-muted-foreground">
          Registra un nuevo gasto de tu negocio
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <ArrowDownCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle>Detalles del Gasto</CardTitle>
              <CardDescription>Completa la información del gasto</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ExpenseForm categories={categories || []} userId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
