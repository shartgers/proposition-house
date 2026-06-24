'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import type { CaseLibraryRow } from '@/lib/case-library'
import { filterCases } from '@/lib/case-filters'
import { allocateCaseAction, removeCaseFromOfferingAction } from '@/app/actions/cases'
import { AddCaseButton, EditCaseButton, DeleteCaseButton } from '@/components/case-crud-forms'

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

function OfferingChip({
  name,
  offeringId,
  caseId,
  onRemoved,
}: {
  name: string
  offeringId: string
  caseId: string
  onRemoved: (offeringId: string, offeringName: string) => void
}) {
  const [pending, startTransition] = useTransition()

  function handleRemove() {
    startTransition(async () => {
      await removeCaseFromOfferingAction(caseId, offeringId)
      onRemoved(offeringId, name)
    })
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
      {name}
      <button
        onClick={handleRemove}
        disabled={pending}
        title={`Remove from ${name}`}
        className="hover:text-rose-600 transition-colors disabled:opacity-40"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

function CaseRow({
  row,
  propositions,
  onAllocated,
  onDeallocated,
  onUpdated,
  onDeleted,
}: {
  row: CaseLibraryRow
  propositions: PropositionOption[]
  onAllocated: (caseId: string, offeringId: string, offeringName: string, practiceName: string | null) => void
  onDeallocated: (caseId: string, offeringId: string, offeringName: string) => void
  onUpdated: (caseId: string, patch: Partial<CaseLibraryRow>) => void
  onDeleted: (caseId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [selectedOfferingId, setSelectedOfferingId] = useState('')
  const [pending, startTransition] = useTransition()

  // Build a lookup of offeringId → offering for the chips remove handler
  const offeringIdByName: Record<string, string> = {}
  propositions.forEach((p) =>
    p.offerings.forEach((o) => { offeringIdByName[o.name] = o.id })
  )

  function handleAssign() {
    if (!selectedOfferingId) return
    startTransition(async () => {
      const result = await allocateCaseAction(row.id, selectedOfferingId)
      onAllocated(row.id, selectedOfferingId, result.offeringName, result.practiceName)
      setSelectedOfferingId('')
    })
  }

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
            {row.offeringNames.length === 0 ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Unallocated
              </span>
            ) : (
              row.offeringNames.map((n) => (
                <span key={n} className="text-xs text-muted-foreground">{n}</span>
              ))
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
        <div className="px-5 pb-5 pt-4 space-y-4 border-t border-border">
          <p className="text-sm leading-relaxed">{row.description}</p>
          {row.result && (
            <div className="bg-accent rounded-lg px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Result</p>
              <p className="text-sm leading-relaxed">{row.result}</p>
            </div>
          )}

          {/* Current allocations */}
          {row.offeringNames.length > 0 && (
            <div className="pt-1 border-t border-border space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Allocated to</p>
              <div className="flex flex-wrap gap-1.5">
                {row.offeringNames.map((name) => {
                  const offeringId = offeringIdByName[name]
                  return offeringId ? (
                    <OfferingChip
                      key={name}
                      name={name}
                      offeringId={offeringId}
                      caseId={row.id}
                      onRemoved={(oid, oname) => onDeallocated(row.id, oid, oname)}
                    />
                  ) : (
                    <span key={name} className="text-xs text-muted-foreground">{name}</span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add to offering */}
          <div className="pt-1 border-t border-border space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Add to offering
            </p>
            <div className="flex gap-2">
              <select
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">Select offering…</option>
                {propositions.map((p) => (
                  <optgroup key={p.id} label={`${p.number} · ${p.name}`}>
                    {p.offerings.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={!selectedOfferingId || pending}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {pending ? '…' : 'Add'}
              </button>
            </div>
          </div>

          {/* Edit / Delete */}
          <div className="pt-1 border-t border-border flex gap-1">
            <EditCaseButton row={row} onUpdated={(patch) => onUpdated(row.id, patch)} />
            <DeleteCaseButton caseId={row.id} clientName={row.clientName} onDeleted={() => onDeleted(row.id)} />
          </div>
        </div>
      )}
    </div>
  )
}

export function CaseLibraryView({
  cases: initialCases,
  propositions,
  practices,
  sectors,
  unallocatedCount: initialUnallocatedCount,
}: {
  cases: CaseLibraryRow[]
  propositions: PropositionOption[]
  practices: PracticeOption[]
  sectors: string[]
  unallocatedCount: number
}) {
  const router = useRouter()
  const [cases, setCases] = useState(initialCases)
  const [unallocatedCount, setUnallocatedCount] = useState(initialUnallocatedCount)

  const [propositionId, setPropositionId] = useState('')
  const [offeringId, setOfferingId] = useState('')
  const [proofLevel, setProofLevel] = useState('')
  const [sector, setSector] = useState('')
  const [practiceId, setPracticeId] = useState('')

  const selectedProp = propositions.find((p) => p.id === propositionId)
  const offeringOptions = selectedProp?.offerings ?? []

  function handlePropositionChange(id: string) {
    setPropositionId(id)
    setOfferingId('')
  }

  function clearFilters() {
    setPropositionId('')
    setOfferingId('')
    setProofLevel('')
    setSector('')
    setPracticeId('')
  }

  function handleAllocated(
    caseId: string,
    _offeringId: string,
    offeringName: string,
    practiceName: string | null
  ) {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c
        const offeringNames = c.offeringNames.includes(offeringName)
          ? c.offeringNames
          : [...c.offeringNames, offeringName]
        const practiceNames =
          practiceName && !c.practiceNames.includes(practiceName)
            ? [...c.practiceNames, practiceName]
            : c.practiceNames
        return { ...c, offeringNames, practiceNames }
      })
    )
    const wasUnallocated = cases.find((c) => c.id === caseId)?.offeringNames.length === 0
    if (wasUnallocated) setUnallocatedCount((n) => n - 1)
    router.refresh()
  }

  function handleDeallocated(caseId: string, _offeringId: string, offeringName: string) {
    const wasAllocated = cases.find((c) => c.id === caseId)?.offeringNames.length === 1
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? { ...c, offeringNames: c.offeringNames.filter((n) => n !== offeringName) }
          : c
      )
    )
    if (wasAllocated) setUnallocatedCount((n) => n + 1)
    router.refresh()
  }

  function handleUpdated(caseId: string, patch: Partial<CaseLibraryRow>) {
    setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, ...patch } : c)))
    router.refresh()
  }

  function handleDeleted(caseId: string) {
    const deleted = cases.find((c) => c.id === caseId)
    if (deleted?.offeringNames.length === 0) setUnallocatedCount((n) => n - 1)
    setCases((prev) => prev.filter((c) => c.id !== caseId))
    router.refresh()
  }

  function handleAdded(row: CaseLibraryRow) {
    setCases((prev) => [...prev, row])
    setUnallocatedCount((n) => n + 1)
    router.refresh()
  }

  const hasFilters = propositionId || offeringId || proofLevel || sector || practiceId

  const resolvedOfferingName =
    offeringId === '__unallocated' ? null
    : offeringId ? (offeringOptions.find((o) => o.id === offeringId)?.name ?? '')
    : undefined

  const filtered = filterCases(cases, {
    propositionName: selectedProp?.name,
    offeringName: resolvedOfferingName,
    proofLevel: proofLevel || undefined,
    sector: sector || undefined,
    practiceName: practiceId ? practices.find((p) => p.id === practiceId)?.name : undefined,
  })

  const filteredUnallocated = filtered.filter((c) => c.offeringNames.length === 0).length

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
        <div className="ml-auto">
          <AddCaseButton propositions={propositions} onAdded={handleAdded} />
        </div>
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
          {filtered.map((c) => (
            <CaseRow
              key={c.id}
              row={c}
              propositions={propositions}
              onAllocated={handleAllocated}
              onDeallocated={handleDeallocated}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}
