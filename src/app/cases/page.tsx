import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { fetchCaseLibrary, countUnallocatedCases } from '@/lib/case-library'
import { CaseLibraryView } from '@/components/case-library-view'
import { createClient } from '@/lib/supabase/server'

export default async function CasesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [cases, unallocatedCount, { data: propositionsRaw }, { data: practicesRaw }] =
    await Promise.all([
      fetchCaseLibrary(supabase),
      countUnallocatedCases(supabase),
      supabase
        .from('propositions')
        .select('id, number, name, offerings ( id, name, practice_id )')
        .order('number')
        .order('sort_order', { referencedTable: 'offerings' }),
      supabase.from('practices').select('id, name, is_sector').order('name'),
    ])

  const propositions = (propositionsRaw ?? []).map((p) => ({
    id: p.id,
    number: p.number,
    name: p.name,
    offerings: (p.offerings as { id: string; name: string; practice_id: string | null }[] ?? []).map((o) => ({
      id: o.id,
      name: o.name,
      practiceId: o.practice_id,
    })),
  }))

  const practices = (practicesRaw ?? []) as { id: string; name: string; is_sector: boolean }[]

  const sectors = [...new Set(cases.map((c) => c.sector))].sort()

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 px-6 py-3.5 border-b border-border bg-card flex-shrink-0 shadow-soft">
        <Link
          href="/"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Xomnia</p>
          <h1 className="font-heading text-base font-semibold leading-tight">Case Library</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 bg-background">
        <div className="max-w-3xl">
          <div className="mb-7">
            <h2 className="font-heading text-2xl font-semibold">Case Library</h2>
            <p className="text-muted-foreground text-sm mt-1.5">All client cases across the five propositions</p>
          </div>
          <CaseLibraryView
            cases={cases}
            propositions={propositions}
            practices={practices}
            sectors={sectors}
            unallocatedCount={unallocatedCount}
          />
        </div>
      </main>
    </div>
  )
}
