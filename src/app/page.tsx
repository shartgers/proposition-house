import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Dashboard } from '@/components/dashboard'
import { fetchDashboardData } from '@/lib/dashboard-data'

export default async function Home() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const propositions = await fetchDashboardData(supabase)

  const initials = user.email
    ? user.email.slice(0, 2).toUpperCase()
    : '?'

  return <Dashboard propositions={propositions} userEmail={user.email ?? ''} userInitials={initials} />
}
