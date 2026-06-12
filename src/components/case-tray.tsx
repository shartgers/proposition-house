'use client'

import { useDraggable } from '@dnd-kit/core'
import { ChevronUp, ChevronDown, Layers, GripVertical } from 'lucide-react'
import type { CaseDetail, ProofLevel } from '@/lib/offering-data'

const PROOF_COLOURS: Record<ProofLevel, string> = {
  High: 'bg-emerald-100 text-emerald-700',
  'Medium-High': 'bg-blue-100 text-blue-700',
  Medium: 'bg-amber-100 text-amber-700',
  'Low-Medium': 'bg-orange-100 text-orange-700',
  Ongoing: 'bg-slate-100 text-slate-600',
}

export type TrayProposition = { id: string; number: string; name: string }

export type CaseTrayProps = {
  open: boolean
  onToggle: () => void
  /** null = not yet fetched */
  cases: CaseDetail[] | null
  loading: boolean
  propositions: TrayProposition[]
  filter: string | 'all'
  onFilterChange: (filter: string | 'all') => void
}

export function CaseTray({ open, onToggle, cases, loading, propositions, filter, onFilterChange }: CaseTrayProps) {
  const all = cases ?? []
  const visible = filter === 'all' ? all : all.filter((c) => c.propositionId === filter)
  const count = all.length

  return (
    <div className="flex-shrink-0 border-t border-border bg-card">
      {/* Toggle handle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-2.5 text-left hover:bg-accent/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Layers className="w-3.5 h-3.5" />
          Unallocated Cases{cases !== null && ` · ${count}`}
        </span>
        {open
          ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
          : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-6 pb-4 h-64 flex flex-col">
          {/* Proposition filter chips */}
          <div className="flex flex-wrap gap-1.5 pb-3 flex-shrink-0">
            <FilterChip label="All" active={filter === 'all'} onClick={() => onFilterChange('all')} />
            {propositions.map((p) => (
              <FilterChip
                key={p.id}
                label={`${p.number}`}
                title={p.name}
                active={filter === p.id}
                onClick={() => onFilterChange(p.id)}
              />
            ))}
          </div>

          {/* Case list */}
          <div className="flex-1 overflow-y-auto">
            {loading && <p className="text-sm text-muted-foreground py-4">Loading cases…</p>}
            {!loading && visible.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No unallocated cases for this filter.</p>
            )}
            {!loading && visible.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {visible.map((c) => <CaseTrayItem key={c.id} c={c} />)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, title, active, onClick }: { label: string; title?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )
}

export function CaseTrayItem({ c }: { c: CaseDetail }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: c.id,
    data: { type: 'case', source: 'tray' },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`rounded-lg border border-border bg-background px-3 py-2 select-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-center gap-2 justify-between">
        <span className="flex items-center gap-1 min-w-0">
          <GripVertical className="w-3 h-3 flex-shrink-0 text-muted-foreground/50" />
          <span className="font-heading text-xs font-semibold truncate">{c.clientName}</span>
        </span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${PROOF_COLOURS[c.proofLevel]}`}>
          {c.proofLevel}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{c.sector} · {c.dateRange}</p>
    </div>
  )
}
