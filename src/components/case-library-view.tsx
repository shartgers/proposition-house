'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import type { CaseLibraryRow } from '@/lib/case-library'

type PropositionOption = { id: string; number: string; name: string; offerings: { id: string; name: string }[] }
type PracticeOption = { id: string; name: string }

const PROOF_COLOURS: Record<string, string> = {
  High: 'bg-emerald-100 text-emerald-700',
  'Medium-High': 'bg-blue-100 text-blue-700',
  Medium: 'bg-amber-100 text-amber-700',
  'Low-Medium': 'bg-orange-100 text-orange-700',
  Ongoing: 'bg-slate-100 text-slate-600',
}

const PROOF_LEVELS = ['High', 'Medium-High', 'Medium', 'Low-Medium', 'Ongoing']

function FilterSelect({
  label,
  value,
  onChange,
  children,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {children}
      </select>
    </div>
  )
}

function CaseRow({ row }: { row: CaseLibraryRow }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading text-sm font-semibold">{row.clientName}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PROOF_COLOURS[row.proofLevel] ?? 'bg-slate-100 text-slate-600'}`}>
              {row.proofLevel}
            </span>
            {row.offeringName === null ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Unallocated
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">{row.offeringName}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {row.sector} · {row.dateRange} · {row.propositionName}
          </p>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-muted-foreground mt-0.5" />
          : <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground mt-0.5" />
        }
      </button>

      {open && (
        <div className="px-5 pb-5 pt-4 space-y-3 border-t border-border">
          <p className="text-sm leading-relaxed">{row.description}</p>
          {row.result && (
            <div className="bg-accent rounded-lg px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Result</p>
              <p className="text-sm leading-relaxed">{row.result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function CaseLibraryView({
  cases,
  propositions,
  practices,
  sectors,
  unallocatedCount,
}: {
  cases: CaseLibraryRow[]
  propositions: PropositionOption[]
  practices: PracticeOption[]
  sectors: string[]
  unallocatedCount: number
}) {
  const [propositionId, setPropositionId] = useState('')
  const [offeringId, setOfferingId] = useState('')
  const [proofLevel, setProofLevel] = useState('')
  const [sector, setSector] = useState('')
  const [practiceId, setPracticeId] = useState('')

  const selectedProp = propositions.find((p) => p.id === propositionId)
  const offeringOptions = selectedProp?.offerings ?? []

  function handlePropositionChange(id: string) {
    setPropositionId(id)
    setOfferingId('') // reset dependent filter
  }

  function clearFilters() {
    setPropositionId('')
    setOfferingId('')
    setProofLevel('')
    setSector('')
    setPracticeId('')
  }

  const hasFilters = propositionId || offeringId || proofLevel || sector || practiceId

  // Client-side filter
  const filtered = cases.filter((c) => {
    if (propositionId && c.propositionName !== selectedProp?.name) return false
    if (offeringId === '__unallocated') { if (c.offeringName !== null) return false }
    else if (offeringId) { if (c.offeringName !== offeringOptions.find((o) => o.id === offeringId)?.name) return false }
    if (proofLevel && c.proofLevel !== proofLevel) return false
    if (sector && c.sector !== sector) return false
    if (practiceId) {
      const practiceName = practices.find((p) => p.id === practiceId)?.name
      if (c.practiceName !== practiceName) return false
    }
    return true
  })

  const filteredUnallocated = filtered.filter((c) => c.offeringName === null).length

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{cases.length} cases total</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            {unallocatedCount} unallocated
          </span>
        </div>
        {hasFilters && (
          <span className="text-sm text-muted-foreground">
            Showing {filtered.length}{filtered.length !== cases.length ? ` · ${filteredUnallocated} unallocated` : ''}
          </span>
        )}
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border border-border bg-card shadow-soft p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <FilterSelect label="Proposition" value={propositionId} onChange={handlePropositionChange}>
            <option value="">All propositions</option>
            {propositions.map((p) => (
              <option key={p.id} value={p.id}>{p.number} · {p.name}</option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Offering"
            value={offeringId}
            onChange={setOfferingId}
            disabled={!propositionId}
          >
            <option value="">All offerings</option>
            <option value="__unallocated">Unallocated</option>
            {offeringOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </FilterSelect>

          <FilterSelect label="Proof level" value={proofLevel} onChange={setProofLevel}>
            <option value="">All levels</option>
            {PROOF_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </FilterSelect>

          <FilterSelect label="Sector" value={sector} onChange={setSector}>
            <option value="">All sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FilterSelect>

          <FilterSelect label="Practice" value={practiceId} onChange={setPracticeId}>
            <option value="">All practices</option>
            {practices.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </FilterSelect>
        </div>

        {hasFilters && (
          <div className="mt-3 pt-3 border-t border-border">
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Case list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No cases match the current filters.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => <CaseRow key={c.id} row={c} />)}
        </div>
      )}
    </div>
  )
}
