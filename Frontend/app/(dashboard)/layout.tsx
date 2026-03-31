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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar user={user} profile={profile} />
      <div className="flex flex-1 flex-col lg:pl-72">
        <DashboardHeader user={user} profile={profile} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
