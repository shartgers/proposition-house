'use client'

import { Loader2 } from 'lucide-react'
import { useTransition } from 'react'
import type { OfferingView } from '@/lib/views'
import { OfferingForm } from '@/components/offering-form'
import type { createOfferingAction, updateOfferingAction } from '@/app/actions/offerings'

type Practice = { id: string; name: string }
type Proposition = { id: string; number: string; name: string }

export type OfferingCRUDDialogsProps = {
  // Add form
  showAddForm: boolean
  onAddCancel: () => void
  onAddSubmit: (input: Parameters<typeof createOfferingAction>[0]) => Promise<void>

  // Edit form
  editingId: string | null
  editingOffering: OfferingView | null
  selectedPropositionId: string
  onEditCancel: () => void
  onEditSubmit: (id: string, input: Parameters<typeof updateOfferingAction>[1]) => Promise<void>

  // Delete dialog
  deletingId: string | null
  onDeleteCancel: () => void
  onDeleteConfirm: () => void
  deleteTransition: boolean

  // Shared data
  practices: Practice[]
  propositions: Proposition[]
}

export function OfferingCRUDDialogs({
  showAddForm,
  onAddCancel,
  onAddSubmit,
  editingId,
  editingOffering,
  selectedPropositionId,
  onEditCancel,
  onEditSubmit,
  deletingId,
  onDeleteCancel,
  onDeleteConfirm,
  deleteTransition,
  practices,
  propositions,
}: OfferingCRUDDialogsProps) {
  return (
    <>
      {/* Edit offering dialog */}
      {editingId && editingOffering && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border shadow-soft-xl p-6 w-[520px] max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="font-heading text-base font-semibold">Edit offering</h3>
            <OfferingForm
              initial={{
                name: editingOffering.name,
                propositionId: selectedPropositionId,
                practiceId: editingOffering.practiceId ?? '',
                description: editingOffering.description ?? '',
                keyOutcomes: editingOffering.keyOutcomes ?? '',
              }}
              practices={practices}
              propositions={propositions}
              onSubmit={(input) => onEditSubmit(editingId, input)}
              onCancel={onEditCancel}
              submitLabel="Save changes"
            />
          </div>
        </div>
      )}

      {/* Add offering dialog */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border shadow-soft-xl p-6 w-[520px] max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="font-heading text-base font-semibold">New offering</h3>
            <OfferingForm
              initial={{ propositionId: selectedPropositionId }}
              practices={practices}
              propositions={propositions}
              onSubmit={onAddSubmit}
              onCancel={onAddCancel}
              submitLabel="Add offering"
            />
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border shadow-soft-xl p-6 w-80 space-y-4">
            <h3 className="font-heading text-base font-semibold">Delete offering?</h3>
            <p className="text-sm text-muted-foreground">This will remove the offering and unlink its cases. This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={onDeleteCancel}
                className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteConfirm}
                disabled={deleteTransition}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-60"
              >
                {deleteTransition && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
