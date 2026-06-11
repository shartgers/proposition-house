'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import type { OfferingInput } from '@/lib/offering-mutations'

type Practice = { id: string; name: string }

type Props = {
  initial?: Partial<OfferingInput>
  practices: Practice[]
  propositions: { id: string; number: string; name: string }[]
  onSubmit: (input: OfferingInput) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function OfferingForm({
  initial = {},
  practices,
  propositions,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: Props) {
  const [name, setName] = useState(initial.name ?? '')
  const [description, setDescription] = useState(initial.description ?? '')
  const [keyOutcomes, setKeyOutcomes] = useState(initial.keyOutcomes ?? '')
  const [practiceId, setPracticeId] = useState(initial.practiceId ?? '')
  const [propositionId, setPropositionId] = useState(initial.propositionId ?? propositions[0]?.id ?? '')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await onSubmit({
        name,
        description: description || null,
        keyOutcomes: keyOutcomes || null,
        practiceId: practiceId || null,
        propositionId,
      })
    })
  }

  const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40'
  const labelCls = 'block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Name *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
          placeholder="Offering name"
        />
      </div>

      <div>
        <label className={labelCls}>Proposition</label>
        <select
          value={propositionId}
          onChange={(e) => setPropositionId(e.target.value)}
          className={inputCls}
        >
          {propositions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.number} · {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Practice</label>
        <select
          value={practiceId}
          onChange={(e) => setPracticeId(e.target.value)}
          className={inputCls}
        >
          <option value="">— none —</option>
          {practices.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputCls} resize-none`}
          placeholder="What this offering delivers…"
        />
      </div>

      <div>
        <label className={labelCls}>Key outcomes</label>
        <textarea
          rows={3}
          value={keyOutcomes}
          onChange={(e) => setKeyOutcomes(e.target.value)}
          className={`${inputCls} resize-none`}
          placeholder="Measurable outcomes clients can expect…"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
