import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPractices } from '@/lib/practice-mutations'
import { PracticesAdmin } from '@/components/practices-admin'
import { createClient } from '@/lib/supabase/server'

export default async function PracticesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const practices = await getPractices(supabase)

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
          <h1 className="font-heading text-base font-semibold leading-tight">Practices</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 bg-background">
        <div className="max-w-6xl">
          <div className="mb-7">
            <h2 className="font-heading text-2xl font-semibold">Practices</h2>
            <p className="text-muted-foreground text-sm mt-1.5">{practices.length} practice{practices.length !== 1 ? 's' : ''}</p>
          </div>
          <PracticesAdmin initial={practices} />
        </div>
      </main>
    </div>
  )
}
