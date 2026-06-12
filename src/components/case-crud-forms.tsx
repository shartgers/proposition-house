'use client'

import { useState, useTransition } from 'react'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import type { CaseLibraryRow } from '@/lib/case-library'
import type { CaseInput } from '@/lib/case-mutations'
import { createCaseAction, updateCaseAction, deleteCaseAction } from '@/app/actions/cases'

type ProofLevel = 'High' | 'Medium-High' | 'Medium' | 'Low-Medium' | 'Ongoing'
type PropositionOption = { id: string; number: string; name: string }

const PROOF_LEVELS: ProofLevel[] = ['High', 'Medium-High', 'Medium', 'Low-Medium', 'Ongoing']

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

function CaseFormFields({
  values,
  onChange,
  propositions,
  showProposition,
}: {
  values: Partial<CaseInput>
  onChange: (patch: Partial<CaseInput>) => void
  propositions: PropositionOption[]
  showProposition: boolean
}) {
  return (
    <div className="grid gap-3">
      <Field label="Client name">
        <input
          className={inputCls}
          value={values.clientName ?? ''}
          onChange={(e) => onChange({ clientName: e.target.value })}
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Sector">
          <input
            className={inputCls}
            value={values.sector ?? ''}
            onChange={(e) => onChange({ sector: e.target.value })}
            required
          />
        </Field>
        <Field label="Date range">
          <input
            className={inputCls}
            value={values.dateRange ?? ''}
            onChange={(e) => onChange({ dateRange: e.target.value })}
            required
            placeholder="e.g. 2023–2024"
          />
        </Field>
      </div>
      <Field label="Proof level">
        <select
          className={inputCls}
          value={values.proofLevel ?? ''}
          onChange={(e) => onChange({ proofLevel: e.target.value as ProofLevel })}
          required
        >
          <option value="">Select…</option>
          {PROOF_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </Field>
      {showProposition && (
        <Field label="Proposition">
          <select
            className={inputCls}
            value={values.propositionId ?? ''}
            onChange={(e) => onChange({ propositionId: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {propositions.map((p) => (
              <option key={p.id} value={p.id}>{p.number} · {p.name}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Description">
        <textarea
          className={`${inputCls} min-h-[80px] resize-y`}
          value={values.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          required
        />
      </Field>
      <Field label="Result">
        <textarea
          className={`${inputCls} min-h-[60px] resize-y`}
          value={values.result ?? ''}
          onChange={(e) => onChange({ result: e.target.value })}
        />
      </Field>
    </div>
  )
}

function Dialog({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function AddCaseButton({
  propositions,
  onAdded,
}: {
  propositions: PropositionOption[]
  onAdded: (row: CaseLibraryRow) => void
}) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Partial<CaseInput>>({})
  const [pending, startTransition] = useTransition()

  function handleChange(patch: Partial<CaseInput>) {
    setValues((v) => ({ ...v, ...patch }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const input = values as CaseInput
    startTransition(async () => {
      const { id } = await createCaseAction(input)
      const prop = propositions.find((p) => p.id === input.propositionId)
      onAdded({
        id,
        clientName: input.clientName,
        sector: input.sector,
        dateRange: input.dateRange,
        proofLevel: input.proofLevel,
        description: input.description,
        result: input.result ?? '',
        propositionName: prop?.name ?? '',
        offeringName: null,
        practiceName: null,
      })
      setOpen(false)
      setValues({})
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        <Plus className="w-3.5 h-3.5" />
        Add case
      </button>

      {open && (
        <Dialog title="Add case" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <CaseFormFields
              values={values}
              onChange={handleChange}
              propositions={propositions}
              showProposition
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {pending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  )
}

export function EditCaseButton({
  row,
  onUpdated,
}: {
  row: CaseLibraryRow
  onUpdated: (patch: Partial<CaseLibraryRow>) => void
}) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Partial<Omit<CaseInput, 'propositionId'>>>({})
  const [pending, startTransition] = useTransition()

  function handleOpen() {
    setValues({
      clientName: row.clientName,
      sector: row.sector,
      dateRange: row.dateRange,
      proofLevel: row.proofLevel,
      description: row.description,
      result: row.result,
    })
    setOpen(true)
  }

  function handleChange(patch: Partial<CaseInput>) {
    setValues((v) => ({ ...v, ...patch }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await updateCaseAction(row.id, values)
      onUpdated({
        clientName: values.clientName,
        sector: values.sector,
        dateRange: values.dateRange,
        proofLevel: values.proofLevel,
        description: values.description,
        result: values.result ?? '',
      })
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); handleOpen() }}
        className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Pencil className="w-3 h-3" />
        Edit
      </button>

      {open && (
        <Dialog title="Edit case" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <CaseFormFields
              values={values}
              onChange={handleChange}
              propositions={[]}
              showProposition={false}
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {pending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  )
}

export function DeleteCaseButton({
  caseId,
  clientName,
  onDeleted,
}: {
  caseId: string
  clientName: string
  onDeleted: () => void
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteCaseAction(caseId)
      onDeleted()
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="w-3 h-3" />
        Delete
      </button>

      {open && (
        <Dialog title="Delete case" onClose={() => setOpen(false)}>
          <div className="space-y-4">
            <p className="text-sm">
              Permanently delete <span className="font-semibold">{clientName}</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={pending}
                className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {pending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}
