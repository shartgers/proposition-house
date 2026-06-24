'use client'

import { useState, useRef, useTransition } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react'
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

// ── Container key helpers ─────────────────────────────────────────────────────

function containerKey(p: Practice): string {
  if (!p.unit || !(PRACTICE_UNITS as readonly string[]).includes(p.unit)) return 'unassigned'
  return `${p.isSector ? 'sectors' : 'practices'}:${p.unit}`
}

function parseContainerKey(
  key: string,
  fallback: { isSector: boolean }
): { isSector: boolean; unit: PracticeUnit | null } {
  if (key === 'unassigned') return { isSector: fallback.isSector, unit: null }
  const colon = key.indexOf(':')
  return {
    isSector: key.slice(0, colon) === 'sectors',
    unit: key.slice(colon + 1) as PracticeUnit,
  }
}

// ── Form ──────────────────────────────────────────────────────────────────────

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
  const [isSector, setIsSector] = useState(initial?.isSector ?? false)

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
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isSector}
            onChange={(e) => setIsSector(e.target.checked)}
            className="w-4 h-4 rounded border-border accent-amber-500"
          />
          <span className="text-sm text-foreground">Sector (not a practice)</span>
        </label>
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
            onSubmit({ name: name.trim(), practiceOwner: owner.trim(), unit: unit || null, isSector })
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

// ── Sortable card ─────────────────────────────────────────────────────────────

function SortableCard({
  practice,
  onEdit,
  onDelete,
}: {
  practice: Practice
  onEdit: (p: Practice) => void
  onDelete: (p: Practice) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: practice.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
      }}
      className={`group flex items-center gap-1.5 px-2.5 py-2 rounded-lg border shadow-soft transition-colors ${
        practice.isSector ? 'border-amber-300 bg-amber-50' : 'border-border bg-card'
      } ${isDragging ? 'opacity-40' : 'hover:border-border/80'}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/60 touch-none"
        tabIndex={-1}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{practice.name}</p>
      </div>
      <div className="hidden group-hover:flex gap-0.5 flex-shrink-0">
        <button
          onClick={() => onEdit(practice)}
          className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDelete(practice)}
          className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ── Droppable column ──────────────────────────────────────────────────────────

function DroppableColumn({
  id,
  items,
  onEdit,
  onDelete,
}: {
  id: string
  items: Practice[]
  onEdit: (p: Practice) => void
  onDelete: (p: Practice) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`min-h-[48px] space-y-1.5 rounded-lg p-1.5 transition-colors ${
          isOver ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
        }`}
      >
        {items.length === 0 && !isOver && (
          <p className="text-xs text-muted-foreground/40 italic py-1">—</p>
        )}
        {items.map((p) => (
          <SortableCard key={p.id} practice={p} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </SortableContext>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function PracticesAdmin({ initial }: { initial: Practice[] }) {
  const [practices, setPractices] = useState<Practice[]>(
    [...initial].sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const prevRef = useRef<Practice[]>(practices)

  const [showAdd, setShowAdd] = useState(false)
  const [addDefaultIsSector, setAddDefaultIsSector] = useState(false)
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null)
  const [deletingPractice, setDeletingPractice] = useState<Practice | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [activePractice, setActivePractice] = useState<Practice | null>(null)
  const [dragError, setDragError] = useState<string | null>(null)

  const [addPending, startAddTransition] = useTransition()
  const [editPending, startEditTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()
  const [, startDragTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // ── Derived views ─────────────────────────────────────────────────────────

  const practicesByUnit = new Map<PracticeUnit, Practice[]>()
  const sectorsByUnit = new Map<PracticeUnit, Practice[]>()
  const unassigned: Practice[] = []

  for (const u of PRACTICE_UNITS) {
    practicesByUnit.set(u, [])
    sectorsByUnit.set(u, [])
  }

  for (const p of practices) {
    const validUnit = p.unit && (PRACTICE_UNITS as readonly string[]).includes(p.unit)
    if (!validUnit) {
      unassigned.push(p)
    } else if (p.isSector) {
      sectorsByUnit.get(p.unit as PracticeUnit)!.push(p)
    } else {
      practicesByUnit.get(p.unit as PracticeUnit)!.push(p)
    }
  }

  // ── CRUD handlers ─────────────────────────────────────────────────────────

  function openAddForm(isSector: boolean) {
    setAddDefaultIsSector(isSector)
    setShowAdd(true)
    setEditingPractice(null)
  }

  function handleAdd(input: PracticeInput) {
    startAddTransition(async () => {
      const result = await createPracticeAction(input)
      setPractices((prev) =>
        [
          ...prev,
          {
            id: result.id,
            name: input.name,
            practiceOwner: input.practiceOwner,
            unit: input.unit ?? null,
            sortOrder: result.sortOrder,
            isSector: input.isSector ?? false,
          },
        ].sort((a, b) => a.sortOrder - b.sortOrder)
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
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                name: input.name,
                practiceOwner: input.practiceOwner,
                unit: input.unit ?? null,
                isSector: input.isSector ?? false,
              }
            : p
        )
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

  // ── Drag handlers ─────────────────────────────────────────────────────────

  function handleDragStart({ active }: DragStartEvent) {
    prevRef.current = practices
    setActivePractice(practices.find((p) => p.id === active.id) ?? null)
    setDragError(null)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string

    const dragged = practices.find((p) => p.id === activeId)
    if (!dragged) return

    const currentKey = containerKey(dragged)
    const targetKey =
      overId === 'unassigned' || overId.includes(':')
        ? overId
        : containerKey(practices.find((p) => p.id === overId) ?? dragged)

    if (currentKey === targetKey) return // within-column handled by SortableContext

    const { isSector, unit } = parseContainerKey(targetKey, dragged)

    setPractices((prev) => {
      const without = prev.filter((p) => p.id !== activeId)
      const overIdx = without.findIndex((p) => p.id === overId)
      const result = [...without]
      result.splice(overIdx === -1 ? result.length : overIdx, 0, {
        ...dragged,
        isSector,
        unit,
      })
      return result
    })
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActivePractice(null)

    if (!over) {
      setPractices(prevRef.current)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    const dragged = practices.find((p) => p.id === activeId)
    if (!dragged) return

    const currentKey = containerKey(dragged)
    const targetKey =
      overId === 'unassigned' || overId.includes(':')
        ? overId
        : containerKey(practices.find((p) => p.id === overId) ?? dragged)

    let finalPractices = practices

    if (currentKey === targetKey && overId !== targetKey) {
      // Same column, dropped on a sibling → precise reorder via arrayMove
      const col = practices.filter((p) => containerKey(p) === currentKey)
      const oldIdx = col.findIndex((p) => p.id === activeId)
      const newIdx = col.findIndex((p) => p.id === overId)
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const reordered = arrayMove(col, oldIdx, newIdx)
        finalPractices = [
          ...practices.filter((p) => containerKey(p) !== currentKey),
          ...reordered,
        ]
      }
    } else if (currentKey !== targetKey) {
      // Cross-column drop without prior onDragOver (fast drag) — handle insertion
      const { isSector, unit } = parseContainerKey(targetKey, dragged)
      const without = practices.filter((p) => p.id !== activeId)
      const overIdx = without.findIndex((p) => p.id === overId)
      const result = [...without]
      result.splice(overIdx === -1 ? result.length : overIdx, 0, { ...dragged, isSector, unit })
      finalPractices = result
    }

    // Assign sequential sort orders to the target column
    const finalDragged = finalPractices.find((p) => p.id === activeId)!
    const finalKey = containerKey(finalDragged)
    const colItems = finalPractices.filter((p) => containerKey(p) === finalKey)
    const numbered = colItems.map((p, i) => ({ ...p, sortOrder: (i + 1) * 10 }))
    const others = finalPractices.filter((p) => containerKey(p) !== finalKey)

    const nextPractices = [...others, ...numbered].sort((a, b) => a.sortOrder - b.sortOrder)
    setPractices(nextPractices)

    // Only persist items that actually changed
    const changed = numbered.filter((p) => {
      const orig = prevRef.current.find((o) => o.id === p.id)
      return (
        !orig ||
        orig.sortOrder !== p.sortOrder ||
        orig.isSector !== p.isSector ||
        orig.unit !== p.unit
      )
    })

    if (changed.length === 0) return

    startDragTransition(async () => {
      try {
        await Promise.all(
          changed.map((p) =>
            updatePracticeAction(p.id, {
              sortOrder: p.sortOrder,
              isSector: p.isSector,
              unit: p.unit,
            })
          )
        )
      } catch {
        setPractices(prevRef.current)
        setDragError('Failed to save order. Please try again.')
      }
    })
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  const onEdit = (p: Practice) => { setEditingPractice(p); setShowAdd(false) }
  const onDelete = (p: Practice) => { setDeletingPractice(p); setDeleteError(null) }

  const addBtnCls =
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-5">
        {dragError && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5">
            <p className="text-sm text-rose-700">{dragError}</p>
          </div>
        )}

        {showAdd && (
          <div className="rounded-xl border border-border bg-card shadow-soft p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              {addDefaultIsSector ? 'New sector' : 'New practice'}
            </p>
            <PracticeForm
              initial={{ isSector: addDefaultIsSector }}
              onSubmit={handleAdd}
              onCancel={() => setShowAdd(false)}
              submitLabel={addDefaultIsSector ? 'Add sector' : 'Add practice'}
              loading={addPending}
            />
          </div>
        )}

        {/* Matrix */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">

            {/* Header row */}
            <div className="flex gap-3 mb-1">
              <div className="w-44 shrink-0" />
              {PRACTICE_UNITS.map((u) => (
                <div
                  key={u}
                  className="flex-1 min-w-0 text-xs font-semibold text-muted-foreground uppercase tracking-widest pb-2 border-b border-border"
                >
                  {u}
                </div>
              ))}
            </div>

            {/* Practices row */}
            <div className="flex gap-3 py-4 border-b border-border/60">
              <div className="w-44 shrink-0 flex flex-col gap-3 pr-3 border-r border-border">
                <div>
                  <h2 className="font-heading text-base font-semibold">Practices</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {practices.filter((p) => !p.isSector).length} practices
                  </p>
                </div>
                <button onClick={() => openAddForm(false)} className={addBtnCls}>
                  <Plus className="w-3 h-3" />
                  Add practice
                </button>
              </div>
              {PRACTICE_UNITS.map((unit) => (
                <div key={unit} className="flex-1 min-w-0">
                  <DroppableColumn
                    id={`practices:${unit}`}
                    items={practicesByUnit.get(unit) ?? []}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              ))}
            </div>

            {/* Sectors row */}
            <div className="flex gap-3 py-4 border-b border-border/60">
              <div className="w-44 shrink-0 flex flex-col gap-3 pr-3 border-r border-border">
                <div>
                  <h2 className="font-heading text-base font-semibold">Sectors</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {practices.filter((p) => p.isSector).length} sectors
                  </p>
                </div>
                <button onClick={() => openAddForm(true)} className={addBtnCls}>
                  <Plus className="w-3 h-3" />
                  Add sector
                </button>
              </div>
              {PRACTICE_UNITS.map((unit) => (
                <div key={unit} className="flex-1 min-w-0">
                  <DroppableColumn
                    id={`sectors:${unit}`}
                    items={sectorsByUnit.get(unit) ?? []}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              ))}
            </div>

            {/* Unassigned row */}
            {unassigned.length > 0 && (
              <div className="flex gap-3 py-4">
                <div className="w-44 shrink-0 pr-3 border-r border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground">Unassigned</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{unassigned.length} items</p>
                </div>
                <div className="flex-1 min-w-0">
                  <DroppableColumn
                    id="unassigned"
                    items={unassigned}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay dropAnimation={null}>
        {activePractice ? (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border shadow-xl opacity-95 rotate-1 cursor-grabbing ${
              activePractice.isSector
                ? 'border-amber-300 bg-amber-50'
                : 'border-primary/30 bg-card'
            }`}
          >
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
            <p className="text-sm font-semibold truncate">{activePractice.name}</p>
          </div>
        ) : null}
      </DragOverlay>

      {/* Edit dialog */}
      {editingPractice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border shadow-soft-xl p-6 w-96 space-y-4">
            <h3 className="font-heading text-base font-semibold">
              Edit {editingPractice.isSector ? 'sector' : 'practice'}
            </h3>
            <PracticeForm
              initial={{
                name: editingPractice.name,
                practiceOwner: editingPractice.practiceOwner,
                unit: editingPractice.unit,
                isSector: editingPractice.isSector,
              }}
              onSubmit={handleEdit}
              onCancel={() => setEditingPractice(null)}
              submitLabel="Save changes"
              loading={editPending}
            />
          </div>
        </div>
      )}

      {/* Delete dialog */}
      {deletingPractice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border shadow-soft-xl p-6 w-96 space-y-4">
            <h3 className="font-heading text-base font-semibold">
              Delete {deletingPractice.isSector ? 'sector' : 'practice'}?
            </h3>
            <p className="text-sm text-muted-foreground">
              Delete{' '}
              <span className="font-semibold text-foreground">{deletingPractice.name}</span>?
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
    </DndContext>
  )
}
