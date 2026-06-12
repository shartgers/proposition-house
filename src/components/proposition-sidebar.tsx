'use client'

import { ChevronRight } from 'lucide-react'
import type { PropositionView } from '@/lib/views'

const STYLES = {
  '01': { dot: 'bg-blue-500', activeBar: 'border-l-blue-500', num: 'text-blue-700' },
  '02': { dot: 'bg-violet-500', activeBar: 'border-l-violet-500', num: 'text-violet-700' },
  '03': { dot: 'bg-emerald-500', activeBar: 'border-l-emerald-500', num: 'text-emerald-700' },
  '04': { dot: 'bg-amber-500', activeBar: 'border-l-amber-500', num: 'text-amber-700' },
  '05': { dot: 'bg-rose-500', activeBar: 'border-l-rose-500', num: 'text-rose-700' },
}

export type PropositionSidebarProps = {
  propositions: PropositionView[]
  selectedId: string
  onSelect: (id: string) => void
}

export function PropositionSidebar({ propositions, selectedId, onSelect }: PropositionSidebarProps) {
  return (
    <nav className="w-64 border-r border-border bg-accent flex-shrink-0 overflow-y-auto py-3">
      <p className="px-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Propositions</p>
      {propositions.map((prop) => {
        const ps = STYLES[prop.number as keyof typeof STYLES]
        const isActive = prop.id === selectedId
        const cases = prop.offerings.reduce((n, o) => n + o.caseCount, 0)
        return (
          <button
            key={prop.id}
            onClick={() => onSelect(prop.id)}
            className={`w-full text-left px-4 py-3 border-l-2 transition-all ${isActive ? `${ps.activeBar} bg-background shadow-soft` : 'border-l-transparent hover:bg-background/60'}`}
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
  )
}
