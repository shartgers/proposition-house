import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Briefcase, Users } from 'lucide-react'
import { fetchOfferingDetail } from '@/lib/offering-data'
import { CaseList } from '@/components/case-list'

const PROOF_COLOURS: Record<string, string> = {
  High: 'bg-emerald-100 text-emerald-700',
  'Medium-High': 'bg-blue-100 text-blue-700',
  Medium: 'bg-amber-100 text-amber-700',
  'Low-Medium': 'bg-orange-100 text-orange-700',
  Ongoing: 'bg-slate-100 text-slate-600',
}

export default async function OfferingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ back?: string }>
}) {
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

  const { id } = await params
  const { back } = await searchParams

  const offering = await fetchOfferingDetail(supabase, id)
  if (!offering) notFound()

  const backHref = back ? `/?p=${back}` : '/'

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-3.5 border-b border-border bg-card flex-shrink-0 shadow-soft">
        <Link
          href={backHref}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Xomnia · Offering
          </p>
          <h1 className="font-heading text-base font-semibold leading-tight">{offering.name}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 bg-background">
        <div className="max-w-3xl space-y-8">
          {/* Metadata */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4 flex-shrink-0" />
              <span>{offering.practice || '—'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{offering.practiceOwner || '—'}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {offering.caseCount} {offering.caseCount === 1 ? 'case' : 'cases'}
            </span>
          </div>

          {/* Description */}
          {offering.description && (
            <section>
              <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Description
              </h2>
              <p className="text-sm leading-relaxed">{offering.description}</p>
            </section>
          )}

          {/* Key outcomes */}
          {offering.keyOutcomes && (
            <section>
              <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Key outcomes
              </h2>
              <p className="text-sm leading-relaxed">{offering.keyOutcomes}</p>
            </section>
          )}

          {/* Cases */}
          <section>
            <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Cases {offering.caseCount > 0 && `· ${offering.caseCount}`}
            </h2>
            {offering.cases.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cases linked to this offering yet.</p>
            ) : (
              <CaseList cases={offering.cases} proofColours={PROOF_COLOURS} />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
