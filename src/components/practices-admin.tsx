'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import type { Practice, PracticeInput } from '@/lib/practice-mutations'
import { PRACTICE_UNITS } from '@/lib/db/types'
import type { PracticeUnit } from '@/lib/db/types'
import {
  createPracticeAction,
  updatePracticeAction,
  deletePracticeAction,
} from '@/app/actions/practices'

const inputCls =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
const labelCls =
  'block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5'

function PracticeForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  loading,
}: {
  initial?: Partial<PracticeInput>
  onSubmit: (input: PracticeInput) => void
  onCancel: () => void
  submitLabel: string
  loading: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [owner, setOwner] = useState(initial?.practiceOwner ?? '')
  const [unit, setUnit] = useState<PracticeUnit | ''>(initial?.unit ?? '')

  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Data Engineering"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Practice Owner</label>
        <input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="e.g. Jan de Vries"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Unit</label>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as PracticeUnit | '')}
          className={inputCls}
        >
          <option value="">— unassigned —</option>
          {PRACTICE_UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            onSubmit({ name: name.trim(), practiceOwner: owner.trim(), unit: unit || null })
          }
          disabled={loading || !name.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </div>
  )
}

function PracticeCard({
  practice,
  onEdit,
  onDelete,
}: {
  practice: Practice
  onEdit: (p: Practice) => void
  onDelete: (p: Practice) => void
}) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card shadow-soft hover:border-border/80 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-heading text-sm font-semibold truncate">{practice.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {practice.practiceOwner || '—'}
        </p>
      </div>
      <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(practice)}
          title="Edit"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(practice)}
          title="Delete"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export function PracticesAdmin({ initial }: { initial: Practice[] }) {
  const [practices, setPractices] = useState<Practice[]>(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null)
  const [deletingPractice, setDeletingPractice] = useState<Practice | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [addPending, startAddTransition] = useTransition()
  const [editPending, startEditTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()

  function handleAdd(input: PracticeInput) {
    startAddTransition(async () => {
      const result = await createPracticeAction(input)
      setPractices((prev) =>
        [...prev, { id: result.id, name: input.name, practiceOwner: input.practiceOwner, unit: input.unit ?? null }].sort(
          (a, b) => a.name.localeCompare(b.name)
        )
      )
      setShowAdd(false)
    })
  }

  function handleEdit(input: PracticeInput) {
    if (!editingPractice) return
    const id = editingPractice.id
    startEditTransition(async () => {
      await updatePracticeAction(id, input)
      setPractices((prev) =>
        prev
          .map((p) =>
            p.id === id
              ? { ...p, name: input.name, practiceOwner: input.practiceOwner, unit: input.unit ?? null }
              : p
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      setEditingPractice(null)
    })
  }

  function handleDeleteConfirm() {
    if (!deletingPractice) return
    setDeleteError(null)
    startDeleteTransition(async () => {
      const result = await deletePracticeAction(deletingPractice.id)
      if (result.error) {
        setDeleteError(result.error)
      } else {
        setPractices((prev) => prev.filter((p) => p.id !== deletingPractice.id))
        setDeletingPractice(null)
      }
    })
  }

  // Group practices by unit
  const byUnit = new Map<PracticeUnit | null, Practice[]>()
  for (const u of PRACTICE_UNITS) byUnit.set(u, [])
  byUnit.set(null, [])
  for (const p of practices) {
    const key = (PRACTICE_UNITS as readonly string[]).includes(p.unit ?? '')
      ? (p.unit as PracticeUnit)
      : null
    byUnit.get(key)!.push(p)
  }
  const unassigned = byUnit.get(null) ?? []

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex justify-end">
        <button
          onClick={() => { setShowAdd(true); setEditingPractice(null) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add practice
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl border border-border bg-card shadow-soft p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            New practice
          </p>
          <PracticeForm
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
            submitLabel="Add practice"
            loading={addPending}
          />
        </div>
      )}

      {/* 4-column unit grid */}
      {practices.length === 0 && !showAdd ? (
        <p className="text-sm text-muted-foreground py-4">No practices yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {PRACTICE_UNITS.map((unit) => (
              <div key={unit} className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pb-2 border-b border-border">
                  {unit}
                </h3>
                {(byUnit.get(unit) ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-1">No practices</p>
                ) : (
                  (byUnit.get(unit) ?? []).map((p) => (
                    <PracticeCard
                      key={p.id}
                      practice={p}
                      onEdit={(practice) => { setEditingPractice(practice); setShowAdd(false) }}
                      onDelete={(practice) => { setDeletingPractice(practice); setDeleteError(null) }}
                    />
                  ))
                )}
              </div>
            ))}
          </div>

          {/* Unassigned practices */}
          {unassigned.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pb-2">
                Unassigned
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                {unassigned.map((p) => (
                  <PracticeCard
                    key={p.id}
                    practice={p}
                    onEdit={(practice) => { setEditingPractice(practice); setShowAdd(false) }}
                    onDelete={(practice) => { setDeletingPractice(practice); setDeleteError(null) }}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit dialog */}
      {editingPractice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border shadow-soft-xl p-6 w-96 space-y-4">
            <h3 className="font-heading text-base font-semibold">Edit practice</h3>
            <PracticeForm
              initial={{
                name: editingPractice.name,
                practiceOwner: editingPractice.practiceOwner,
                unit: editingPractice.unit,
              }}
              onSubmit={handleEdit}
              onCancel={() => setEditingPractice(null)}
              submitLabel="Save changes"
              loading={editPending}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deletingPractice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border shadow-soft-xl p-6 w-96 space-y-4">
            <h3 className="font-heading text-base font-semibold">Delete practice?</h3>
            <p className="text-sm text-muted-foreground">
              Delete <span className="font-semibold text-foreground">{deletingPractice.name}</span>?
              This cannot be undone.
            </p>
            {deleteError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5">
                <p className="text-sm text-rose-700">{deleteError}</p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setDeletingPractice(null); setDeleteError(null) }}
                className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletePending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-60"
              >
                {deletePending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
