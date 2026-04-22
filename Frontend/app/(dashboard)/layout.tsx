import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Obtener display_name del user metadata
  const displayName = (user?.user_metadata?.full_name as string) || (user?.user_metadata?.display_name as string) || profile?.full_name || 'Usuario'
  const businessName = (user?.user_metadata?.business_name as string) || profile?.business_name

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar user={user} profile={profile} displayName={displayName} businessName={businessName} />
      <div className="flex flex-1 flex-col lg:pl-72">
        <DashboardHeader user={user} profile={profile} displayName={displayName} businessName={businessName} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
