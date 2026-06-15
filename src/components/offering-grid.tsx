'use client'

import { useDroppable } from '@dnd-kit/core'
import { Plus, ChevronUp, ChevronDown, Pencil, Trash2, Loader2 } from 'lucide-react'
import type { OfferingView } from '@/lib/views'

const STYLES = {
  '01': { num: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', cardAccent: 'hover:border-blue-200', cardActive: 'border-blue-300 bg-blue-50/50', dropOver: 'ring-2 ring-blue-400 border-blue-400', groupHeader: 'text-blue-600' },
  '02': { num: 'text-violet-700', badge: 'bg-violet-100 text-violet-700', cardAccent: 'hover:border-violet-200', cardActive: 'border-violet-300 bg-violet-50/50', dropOver: 'ring-2 ring-violet-400 border-violet-400', groupHeader: 'text-violet-600' },
  '03': { num: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', cardAccent: 'hover:border-emerald-200', cardActive: 'border-emerald-300 bg-emerald-50/50', dropOver: 'ring-2 ring-emerald-400 border-emerald-400', groupHeader: 'text-emerald-600' },
  '04': { num: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', cardAccent: 'hover:border-amber-200', cardActive: 'border-amber-300 bg-amber-50/50', dropOver: 'ring-2 ring-amber-400 border-amber-400', groupHeader: 'text-amber-600' },
  '05': { num: 'text-rose-700', badge: 'bg-rose-100 text-rose-700', cardAccent: 'hover:border-rose-200', cardActive: 'border-rose-300 bg-rose-50/50', dropOver: 'ring-2 ring-rose-400 border-rose-400', groupHeader: 'text-rose-600' },
}

type OfferingStyle = (typeof STYLES)[keyof typeof STYLES]

export type OfferingGridProps = {
  propositionNumber: string
  propositionName: string
  offerings: OfferingView[]
  activeOfferingId: string | null
  movePending: boolean
  moveError: string | null
  onOpenOffering: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onAddOffering: () => void
}

type PracticeGroup = {
  practiceId: string | null
  practiceName: string
  offerings: OfferingView[]
}

function groupByPractice(offerings: OfferingView[]): PracticeGroup[] {
  const groups: PracticeGroup[] = []
  for (const o of offerings) {
    const last = groups[groups.length - 1]
    if (last && last.practiceId === o.practiceId) {
      last.offerings.push(o)
    } else {
      groups.push({ practiceId: o.practiceId, practiceName: o.practice, offerings: [o] })
    }
  }
  return groups
}

export function OfferingGrid({
  propositionNumber,
  propositionName,
  offerings,
  activeOfferingId,
  movePending,
  moveError,
  onOpenOffering,
  onMove,
  onEdit,
  onDelete,
  onAddOffering,
}: OfferingGridProps) {
  const s = STYLES[propositionNumber as keyof typeof STYLES]
  const totalCases = offerings.reduce((n, o) => n + o.caseCount, 0)
  const groups = groupByPractice(offerings)

  let flatIdx = 0

  return (
    <main className="flex-1 overflow-y-auto p-8 bg-background" style={{ minWidth: 260 }}>
      <div className="max-w-xl">
        <div className="flex items-start justify-between mb-7">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${s.num}`}>{propositionNumber}</p>
            <h2 className="font-heading text-2xl font-semibold">{propositionName}</h2>
            <p className="text-muted-foreground text-sm mt-1.5">{offerings.length} offerings · {totalCases} cases</p>
          </div>
          <button
            onClick={onAddOffering}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add offering
          </button>
        </div>

        {moveError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5">
            <p className="text-sm text-rose-700">{moveError}</p>
          </div>
        )}

        <div className="space-y-5">
          {groups.map((group) => {
            const groupStart = flatIdx
            flatIdx += group.offerings.length

            return (
              <div key={group.practiceId ?? '__none'}>
                {group.practiceName && (
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-2 px-1 ${s.groupHeader}`}>
                    {group.practiceName}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-2">
                  {group.offerings.map((offering, idxInGroup) => {
                    const globalIdx = groupStart + idxInGroup
                    return (
                      <OfferingCard
                        key={offering.id}
                        offering={offering}
                        s={s}
                        isActive={activeOfferingId === offering.id}
                        isFirst={globalIdx === 0}
                        isLast={globalIdx === offerings.length - 1}
                        movePending={movePending}
                        onOpenOffering={onOpenOffering}
                        onMove={onMove}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

type OfferingCardProps = {
  offering: OfferingView
  s: OfferingStyle
  isActive: boolean
  isFirst: boolean
  isLast: boolean
  movePending: boolean
  onOpenOffering: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

function OfferingCard({ offering, s, isActive, isFirst, isLast, movePending, onOpenOffering, onMove, onEdit, onDelete }: OfferingCardProps) {
  const { setNodeRef, isOver } = useDroppable({ id: offering.id, data: { type: 'offering', offeringId: offering.id } })

  return (
    <div
      ref={setNodeRef}
      className={`group relative rounded-xl border bg-card shadow-soft transition-all duration-200 ${isOver ? s.dropOver : isActive ? s.cardActive : `border-border ${s.cardAccent}`}`}
    >
      <button
        onClick={() => onOpenOffering(offering.id)}
        className="w-full text-left px-4 py-3 hover:-translate-y-0.5 transition-transform duration-200"
      >
        <div className="flex items-center gap-2">
          <p className="font-heading text-sm font-semibold leading-none truncate flex-1">{offering.name}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>{offering.caseCount}</span>
        </div>
      </button>

      {/* Action toolbar — appears on hover */}
      <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-0.5 bg-card/90 backdrop-blur-sm rounded-lg border border-border px-1 py-0.5 shadow-soft">
        <button
          onClick={() => onMove(offering.id, 'up')}
          disabled={isFirst || movePending}
          title="Move up"
          className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30"
        >
          {movePending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => onMove(offering.id, 'down')}
          disabled={isLast || movePending}
          title="Move down"
          className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30"
        >
          {movePending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <div className="w-px h-4 bg-border mx-0.5" />
        <button
          onClick={() => onEdit(offering.id)}
          title="Edit"
          className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDelete(offering.id)}
          title="Delete"
          className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
