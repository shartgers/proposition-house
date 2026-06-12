import { redirect } from 'next/navigation'
import { Dashboard } from '@/components/dashboard'
import { fetchDashboardData } from '@/lib/dashboard-data'
import { createClient } from '@/lib/supabase/server'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [propositions, { data: practicesData }] = await Promise.all([
    fetchDashboardData(supabase),
    supabase.from('practices').select('id, name').order('name'),
  ])
  const practices = (practicesData ?? []) as { id: string; name: string }[]

  const { p } = await searchParams
  const initialPropositionNumber = p ?? propositions[0]?.number

  const initials = user.email
    ? user.email.slice(0, 2).toUpperCase()
    : '?'

  return (
    <Dashboard
      propositions={propositions}
      practices={practices}
      initialPropositionNumber={initialPropositionNumber}
      userEmail={user.email ?? ''}
      userInitials={initials}
    />
  )
}
