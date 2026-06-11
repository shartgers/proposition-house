'use client'

import { useState } from 'react'
import { ChevronRight, Briefcase, Users } from 'lucide-react'
import type { Proposition } from '@/lib/mock-data'

const STYLES = {
  '01': {
    dot: 'bg-blue-500',
    activeBar: 'border-l-blue-500',
    num: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    cardAccent: 'hover:border-blue-200',
  },
  '02': {
    dot: 'bg-violet-500',
    activeBar: 'border-l-violet-500',
    num: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
    cardAccent: 'hover:border-violet-200',
  },
  '03': {
    dot: 'bg-emerald-500',
    activeBar: 'border-l-emerald-500',
    num: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    cardAccent: 'hover:border-emerald-200',
  },
  '04': {
    dot: 'bg-amber-500',
    activeBar: 'border-l-amber-500',
    num: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    cardAccent: 'hover:border-amber-200',
  },
  '05': {
    dot: 'bg-rose-500',
    activeBar: 'border-l-rose-500',
    num: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    cardAccent: 'hover:border-rose-200',
  },
}

export function Dashboard({ propositions }: { propositions: Proposition[] }) {
  const [selectedId, setSelectedId] = useState(propositions[0].id)
  const selected = propositions.find((p) => p.id === selectedId)!
  const s = STYLES[selected.id as keyof typeof STYLES]
  const totalCases = selected.offerings.reduce((n, o) => n + o.caseCount, 0)

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-card flex-shrink-0 shadow-soft">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Xomnia
          </p>
          <h1 className="font-heading text-base font-semibold leading-tight">
            Proposition House
          </h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
          SH
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 border-r border-border bg-accent flex-shrink-0 overflow-y-auto py-3">
          <p className="px-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Propositions
          </p>
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
                    ? `${ps.activeBar} bg-background shadow-soft`
                    : 'border-l-transparent hover:bg-background/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ps.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold ${isActive ? ps.num : 'text-muted-foreground'}`}
                    >
                      {prop.number}
                    </p>
                    <p className="text-sm font-medium leading-snug truncate">{prop.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {prop.offerings.length} offerings · {cases} cases
                    </p>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                  )}
                </div>
              </button>
            )
          })}
        </nav>

        {/* Content panel */}
        <main className="flex-1 overflow-y-auto p-8 bg-background">
          <div className="max-w-3xl">
            <div className="mb-7">
              <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${s.num}`}>
                {selected.number}
              </p>
              <h2 className="font-heading text-2xl font-semibold">{selected.name}</h2>
              <p className="text-muted-foreground text-sm mt-1.5">
                {selected.offerings.length} offerings · {totalCases} cases
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selected.offerings.map((offering) => (
                <button
                  key={offering.id}
                  className={`text-left p-5 rounded-xl border border-border bg-card shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg ${s.cardAccent}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <p className="font-heading text-sm font-semibold leading-snug">
                      {offering.name}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}
                    >
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
