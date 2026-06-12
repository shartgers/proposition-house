'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react'
import type { Practice } from '@/lib/practice-mutations'
import {
  createPracticeAction,
  updatePracticeAction,
  deletePracticeAction,
} from '@/app/actions/practices'

function PracticeRow({
  practice,
  onEdit,
  onDelete,
}: {
  practice: Practice
  onEdit: (p: Practice) => void
  onDelete: (p: Practice) => void
}) {
  return (
    <div className="group flex items-center gap-4 px-5 py-4 rounded-xl border border-border bg-card shadow-soft hover:border-border/80 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-heading text-sm font-semibold">{practice.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{practice.practiceOwner || '—'}</p>
      </div>
      <div className="hidden group-hover:flex items-center gap-1">
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

function PracticeForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  loading,
}: {
  initial?: { name: string; practiceOwner: string }
  onSubmit: (name: string, practiceOwner: string) => void
  onCancel: () => void
  submitLabel: string
  loading: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [owner, setOwner] = useState(initial?.practiceOwner ?? '')

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Data Engineering"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
          Practice Owner
        </label>
        <input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="e.g. Jan de Vries"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(name.trim(), owner.trim())}
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

export function PracticesAdmin({ initial }: { initial: Practice[] }) {
  const [practices, setPractices] = useState<Practice[]>(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingPractice, setDeletingPractice] = useState<Practice | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [addPending, startAddTransition] = useTransition()
  const [editPending, startEditTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()

  function handleAdd(name: string, practiceOwner: string) {
    startAddTransition(async () => {
      const result = await createPracticeAction({ name, practiceOwner })
      setPractices((prev) =>
        [...prev, { id: result.id, name, practiceOwner }].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      )
      setShowAdd(false)
    })
  }

  function handleEdit(id: string, name: string, practiceOwner: string) {
    startEditTransition(async () => {
      await updatePracticeAction(id, { name, practiceOwner })
      setPractices((prev) =>
        prev
          .map((p) => (p.id === id ? { ...p, name, practiceOwner } : p))
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      setEditingId(null)
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

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => { setShowAdd(true); setEditingId(null) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add practice
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl border border-border bg-card shadow-soft p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">New practice</p>
          <PracticeForm
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
            submitLabel="Add practice"
            loading={addPending}
          />
        </div>
      )}

      {/* Practice list */}
      {practices.length === 0 && !showAdd ? (
        <p className="text-sm text-muted-foreground py-4">No practices yet.</p>
      ) : (
        <div className="space-y-2">
          {practices.map((p) =>
            editingId === p.id ? (
              <div key={p.id} className="rounded-xl border border-border bg-card shadow-soft p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Edit practice</p>
                <PracticeForm
                  initial={{ name: p.name, practiceOwner: p.practiceOwner }}
                  onSubmit={(name, owner) => handleEdit(p.id, name, owner)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save changes"
                  loading={editPending}
                />
              </div>
            ) : (
              <PracticeRow
                key={p.id}
                practice={p}
                onEdit={(practice) => { setEditingId(practice.id); setShowAdd(false) }}
                onDelete={(practice) => { setDeletingPractice(practice); setDeleteError(null) }}
              />
            )
          )}
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
