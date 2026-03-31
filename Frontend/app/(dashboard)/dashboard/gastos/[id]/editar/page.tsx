import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { ArrowDownCircle } from 'lucide-react'

interface EditExpensePageProps {
  params: Promise<{ id: string }>
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: expense } = await supabase
    .from('expenses')
    .select('*, category:expense_categories(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!expense) {
    notFound()
  }

  const { data: categories } = await supabase
    .from('expense_categories')
    .select('*')
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar Gasto</h1>
        <p className="text-muted-foreground">
          Modifica los detalles del gasto
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
              <CardDescription>Actualiza la información del gasto</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ExpenseForm expense={expense} categories={categories || []} userId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
