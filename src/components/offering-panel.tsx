'use client'

import { useDroppable } from '@dnd-kit/core'
import { X, Briefcase, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { OfferingDetail, CaseDetail, ProofLevel } from '@/lib/offering-data'

const PROOF_COLOURS: Record<ProofLevel, string> = {
  High: 'bg-emerald-100 text-emerald-700',
  'Medium-High': 'bg-blue-100 text-blue-700',
  Medium: 'bg-amber-100 text-amber-700',
  'Low-Medium': 'bg-orange-100 text-orange-700',
  Ongoing: 'bg-slate-100 text-slate-600',
}

function CaseRow({ c, onUnallocate }: { c: CaseDetail; onUnallocate: (c: CaseDetail) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="group/case relative rounded-xl border border-border bg-background overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading text-sm font-semibold">{c.clientName}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PROOF_COLOURS[c.proofLevel]}`}>
              {c.proofLevel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{c.sector} · {c.dateRange}</p>
        </div>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
          : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
        }
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onUnallocate(c) }}
        title="Unallocate case"
        className="absolute top-2 right-9 hidden group-hover/case:flex w-6 h-6 items-center justify-center rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          <p className="text-sm leading-relaxed">{c.description}</p>
          {c.result && (
            <div className="bg-accent rounded-lg px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Result</p>
              <p className="text-sm leading-relaxed">{c.result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function OfferingPanel({
  offering,
  loading,
  onClose,
  onUnallocateCase,
}: {
  offering: OfferingDetail | null
  loading: boolean
  onClose: () => void
  onUnallocateCase: (c: CaseDetail) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'detail-pane',
    data: { type: 'detail-pane', offeringId: offering?.id },
  })

  return (
    <div className="h-full flex flex-col">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border flex-shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          {loading ? 'Loading…' : (offering?.name ?? '')}
        </p>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && offering && (
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Title + meta */}
          <div>
            <h2 className="font-heading text-lg font-semibold leading-snug mb-3">{offering.name}</h2>
            <div className="flex flex-wrap gap-3">
              {offering.practice && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{offering.practice}</span>
                </div>
              )}
              {offering.practiceOwner && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{offering.practiceOwner}</span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">
                {offering.caseCount} {offering.caseCount === 1 ? 'case' : 'cases'}
              </span>
            </div>
          </div>

          {offering.description && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Description
              </h3>
              <p className="text-sm leading-relaxed">{offering.description}</p>
            </section>
          )}

          {offering.keyOutcomes && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Key outcomes
              </h3>
              <p className="text-sm leading-relaxed">{offering.keyOutcomes}</p>
            </section>
          )}

          <section
            ref={setNodeRef}
            className={`rounded-xl transition-colors ${isOver ? 'bg-accent/60 ring-2 ring-primary/40 -m-2 p-2' : ''}`}
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Cases {offering.caseCount > 0 && `· ${offering.caseCount}`}
            </h3>
            {offering.cases.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {isOver ? 'Drop to allocate this case' : 'No cases linked to this offering yet. Drag a case here to allocate it.'}
              </p>
            ) : (
              <div className="space-y-2">
                {offering.cases.map((c) => <CaseRow key={c.id} c={c} onUnallocate={onUnallocateCase} />)}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
