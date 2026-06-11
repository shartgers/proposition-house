'use client'

import { useState } from 'react'
import { ChevronRight, Briefcase, Users } from 'lucide-react'
import type { Proposition } from '@/lib/mock-data'

const STYLES = {
  '01': { dot: 'bg-blue-500', activeBar: 'border-l-blue-500', num: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', cardHover: 'hover:border-blue-300 hover:bg-blue-50/40' },
  '02': { dot: 'bg-violet-500', activeBar: 'border-l-violet-500', num: 'text-violet-600', badge: 'bg-violet-100 text-violet-700', cardHover: 'hover:border-violet-300 hover:bg-violet-50/40' },
  '03': { dot: 'bg-emerald-500', activeBar: 'border-l-emerald-500', num: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', cardHover: 'hover:border-emerald-300 hover:bg-emerald-50/40' },
  '04': { dot: 'bg-amber-500', activeBar: 'border-l-amber-500', num: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', cardHover: 'hover:border-amber-300 hover:bg-amber-50/40' },
  '05': { dot: 'bg-rose-500', activeBar: 'border-l-rose-500', num: 'text-rose-600', badge: 'bg-rose-100 text-rose-700', cardHover: 'hover:border-rose-300 hover:bg-rose-50/40' },
}

export function Dashboard({ propositions }: { propositions: Proposition[] }) {
  const [selectedId, setSelectedId] = useState(propositions[0].id)
  const selected = propositions.find((p) => p.id === selectedId)!
  const s = STYLES[selected.id as keyof typeof STYLES]
  const totalCases = selected.offerings.reduce((n, o) => n + o.caseCount, 0)

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-white flex-shrink-0">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Xomnia</p>
          <h1 className="text-lg font-semibold">Proposition House</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">SH</div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 border-r border-border bg-muted/20 flex-shrink-0 overflow-y-auto py-2">
          <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Propositions</p>
          {propositions.map((prop) => {
            const ps = STYLES[prop.id as keyof typeof STYLES]
            const isActive = prop.id === selectedId
            const cases = prop.offerings.reduce((n, o) => n + o.caseCount, 0)
            return (
              <button
                key={prop.id}
                onClick={() => setSelectedId(prop.id)}
                className={`w-full text-left px-4 py-3 border-l-2 transition-all ${
                  isActive
                    ? `${ps.activeBar} bg-white`
                    : 'border-l-transparent hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ps.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${isActive ? ps.num : 'text-muted-foreground'}`}>{prop.number}</p>
                    <p className="text-sm font-medium leading-snug truncate">{prop.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{prop.offerings.length} offerings · {cases} cases</p>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />}
                </div>
              </button>
            )
          })}
        </nav>

        {/* Content panel */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl">
            <div className="mb-7">
              <p className={`text-sm font-semibold mb-1 ${s.num}`}>{selected.number}</p>
              <h2 className="text-2xl font-semibold">{selected.name}</h2>
              <p className="text-muted-foreground text-sm mt-1">{selected.offerings.length} offerings · {totalCases} cases</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {selected.offerings.map((offering) => (
                <button
                  key={offering.id}
                  className={`text-left p-4 rounded-xl border border-border bg-card transition-all ${s.cardHover}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-sm font-semibold leading-snug">{offering.name}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>
                      {offering.caseCount}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="w-3 h-3 flex-shrink-0" />
                      <span>{offering.practice}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3 h-3 flex-shrink-0" />
                      <span>{offering.practiceOwner}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
