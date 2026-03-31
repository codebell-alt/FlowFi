import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'
import { ProfileForm } from '@/components/settings/profile-form'
import { CategoriesManager } from '@/components/settings/categories-manager'

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: expenseCategories } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_default', false)
    .order('name')

  const { data: incomeTypes } = await supabase
    .from('income_types')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_default', false)
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Personaliza tu cuenta y categorías
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Actualiza tu información personal y de negocio</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      {/* Categories Manager */}
      <CategoriesManager
        expenseCategories={expenseCategories || []}
        incomeTypes={incomeTypes || []}
        userId={user.id}
      />
    </div>
  )
}
