'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { CaseDetail } from '@/lib/offering-data'

export function CaseList({
  cases,
  proofColours,
}: {
  cases: CaseDetail[]
  proofColours: Record<string, string>
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {cases.map((c) => {
        const isOpen = expandedId === c.id
        return (
          <div key={c.id} className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
            <button
              onClick={() => setExpandedId(isOpen ? null : c.id)}
              className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading text-sm font-semibold">{c.clientName}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${proofColours[c.proofLevel] ?? 'bg-slate-100 text-slate-600'}`}
                  >
                    {c.proofLevel}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {c.sector} · {c.dateRange}
                </p>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
              )}
            </button>

            {isOpen && (
              <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                <p className="text-sm leading-relaxed">{c.description}</p>
                {c.result && (
                  <div className="bg-accent rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      Result
                    </p>
                    <p className="text-sm leading-relaxed">{c.result}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
